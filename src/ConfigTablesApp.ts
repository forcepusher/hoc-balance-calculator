import {
    CONFIG_GROUP_LABELS,
    CONFIG_TABLES,
    type ConfigTableDef,
    type ConfigTableGroup,
    type ConfigTableId,
} from './configTables.js';
import {
    fetchGoogleSheetCsv,
    normalizeGoogleSheetUrl,
    parseCsvTable,
    shouldRewritePastedSheetUrl,
    type ParsedCsvTable,
} from './googleSheets.js';
import {
    describeManualDailyIncome,
    parseChestSlotTable,
    parseGameConfig,
    parseManualDailyIncome,
    parseRemoteDefaults,
} from './sim/parseGameConfig.js';
import { runSimulation, simulationReportCsv, type SimResult } from './sim/simulate.js';
import {
    ALL_RESOURCE_IDS,
    DEFAULT_SIM_PARAMS,
    RESOURCE_LABELS,
    type ResourceId,
    type Resources,
    type SimParams,
} from './sim/types.js';

interface TableRowUi {
    input: HTMLInputElement;
    status: HTMLElement;
    openLink: HTMLAnchorElement;
}

const REQUIRED_TABLES = CONFIG_TABLES.filter((table) => table.required);

export class ConfigTablesApp {
    private readonly parsedTables = new Map<ConfigTableId, ParsedCsvTable>();
    private readonly rowUi = new Map<ConfigTableId, TableRowUi>();
    private readonly rowGeneration = new Map<ConfigTableId, number>();
    private readonly dirtyIds = new Set<ConfigTableId>();
    private readonly paramInputs = new Map<string, HTMLInputElement>();
    /** Параметры, которые пользователь поменял руками — значения из CommonRemoteConfigs их не затирают. */
    private readonly touchedParams = new Set<string>();
    private readonly root: HTMLElement;
    private readonly loadButton: HTMLButtonElement;
    private readonly runButton: HTMLButtonElement;
    private readonly summaryEl: HTMLElement;
    private readonly resultsEl: HTMLElement;
    private loadGeneration = 0;
    private lastResult: SimResult | null = null;

    constructor(parentElement: HTMLElement) {
        this.root = this.createRoot();
        this.loadButton = this.root.querySelector('[data-load-all]') as HTMLButtonElement;
        this.runButton = this.root.querySelector('[data-run-sim]') as HTMLButtonElement;
        this.summaryEl = this.root.querySelector('[data-summary]') as HTMLElement;
        this.resultsEl = this.root.querySelector('[data-results]') as HTMLElement;
        parentElement.appendChild(this.root);
        this.bind();
        void this.loadAll();
    }

    getTable(id: ConfigTableId): ParsedCsvTable | undefined {
        const table = this.parsedTables.get(id);
        if (!table) {
            return undefined;
        }
        return {
            headers: [...table.headers],
            rows: table.rows.map((row) => [...row]),
            matrix: table.matrix.map((row) => [...row]),
        };
    }

    private bind(): void {
        this.loadButton.addEventListener('click', () => {
            void this.loadAll();
        });
        this.runButton.addEventListener('click', () => {
            this.runSim();
        });
    }

    private createRoot(): HTMLElement {
        const root = document.createElement('div');
        root.style.cssText = [
            'width: min(1100px, 96vw)',
            'color: #e8e8e8',
            'font-family: Segoe UI, Tahoma, sans-serif',
            'background: #141414',
            'border: 1px solid #333',
            'border-radius: 8px',
            'padding: 16px',
            'box-sizing: border-box',
        ].join(';');

        const title = document.createElement('h2');
        title.textContent = 'HoC Balance — симуляция (альфа) V3';
        title.style.cssText = 'margin: 0 0 8px; font-size: 20px; font-weight: 600;';
        root.appendChild(title);

        const intro = document.createElement('p');
        intro.textContent = 'EV-симулятор активного дня: слоты (X1/X3) + сундуки + арена + гача + замки, награды, задания, мини-ивенты. Лиги по рейтингу с еженедельным сбросом сезона. 5 героев качаются синхронно. Таблицы по умолчанию — прод (RemoteSheetsList).';
        intro.style.cssText = 'margin: 0 0 14px; font-size: 14px; line-height: 1.45; color: #cfcfcf;';
        root.appendChild(intro);

        root.appendChild(this.createTablesSection());
        root.appendChild(this.createParamsSection());

        const controls = document.createElement('div');
        controls.style.cssText = 'display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 0 0 14px;';
        controls.append(
            this.makeButton('Загрузить таблицы', 'data-load-all'),
            this.makeButton('Запустить симуляцию', 'data-run-sim'),
        );
        const summary = document.createElement('span');
        summary.setAttribute('data-summary', '');
        summary.style.cssText = 'font-size: 13px; color: #9e9e9e;';
        controls.appendChild(summary);
        root.appendChild(controls);

        const results = document.createElement('div');
        results.setAttribute('data-results', '');
        root.appendChild(results);

        return root;
    }

    private createTablesSection(): HTMLElement {
        const details = document.createElement('details');
        details.open = true;
        details.style.cssText = 'margin-bottom: 14px;';

        const summary = document.createElement('summary');
        summary.textContent = 'Конфигурационные таблицы';
        summary.style.cssText = 'cursor: pointer; font-weight: 600; font-size: 14px; margin-bottom: 10px;';
        details.appendChild(summary);

        const list = document.createElement('div');
        list.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
        const groups: ConfigTableGroup[] = [];
        for (const table of CONFIG_TABLES) {
            if (!groups.includes(table.group)) {
                groups.push(table.group);
            }
        }
        for (const group of groups) {
            const heading = document.createElement('div');
            heading.textContent = CONFIG_GROUP_LABELS[group];
            heading.style.cssText = 'margin-top: 6px; font-size: 12px; font-weight: 600; color: #8fb4e8; text-transform: uppercase; letter-spacing: 0.04em;';
            list.appendChild(heading);
            for (const table of CONFIG_TABLES.filter((t) => t.group === group)) {
                list.appendChild(this.createTableRow(table));
            }
        }
        details.appendChild(list);
        return details;
    }

    private createParamsSection(): HTMLElement {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'margin-bottom: 14px; padding: 12px; border: 1px solid #2a2a2a; border-radius: 6px; background: #181818;';

        const heading = document.createElement('div');
        heading.textContent = 'Параметры симуляции';
        heading.style.cssText = 'font-weight: 600; font-size: 14px; margin-bottom: 10px;';
        wrap.appendChild(heading);

        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;';

        const p = DEFAULT_SIM_PARAMS;
        grid.append(
            this.paramField('heroCount', 'Герои в отряде', p.heroCount, 1),
            this.paramField('energyPerDay', 'Реген энергии / сутки', p.energyPerDay, 1),
            this.paramField('spinEnergyCost', 'Энергии за спин', p.spinEnergyCost, 1),
            this.paramField('winRatePct', 'Винрейт PvP %', Number((p.winRate * 100).toFixed(2)), 1),
            this.paramField('dustPerPull', 'Пыль за 1 крутку (gacha-summon-price-1)', p.dustPerPull, 1),
            this.paramField('sHeroCount', 'Герои S в пуле', p.sHeroCount, 1),
            this.paramField('factionCount', 'Фракций среди героев отряда (гербы)', p.factionCount, 1),
            this.paramField('gachaPity', 'Гарант S (gacha-summon-pity-value)', p.gachaPity, 1),
            this.paramField('targetHeroPity', 'Целевой S-герой: гарант после 3 промахов (1/0)', p.targetHeroPity, 1),
            this.paramField('startLeagueIndex', 'Стартовая лига (1 = Бронза)', p.startLeagueIndex + 1, 1),
            this.paramField('startRating', 'Стартовый рейтинг', p.startRating, 1),
            this.paramField('weeklyResetEveryDays', 'Сброс сезона каждые N дней (сервер: 7)', p.weeklyResetEveryDays, 1),
            this.paramField('maxDays', 'Макс. дней', p.maxDays, 1),
        );
        wrap.appendChild(grid);

        const incomeHeading = document.createElement('div');
        incomeHeading.textContent = 'Доп. источники дохода и стоки';
        incomeHeading.style.cssText = 'font-weight: 600; font-size: 13px; margin: 12px 0 8px; color: #d0d0d0;';
        wrap.appendChild(incomeHeading);

        const incomeGrid = document.createElement('div');
        incomeGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;';
        incomeGrid.append(
            this.paramField('premiumDaily', 'Платная ветка ежедневных наград (1/0)', p.premiumDaily, 1),
            this.paramField('taskCompletionPct', 'Выполнение дейликов/недельных, %', p.taskCompletionPct, 1),
            this.paramField('castlesActive', 'Замков с добычей (CastlePassiveRewardConfig)', p.castlesActive, 1),
            this.paramField('castleLevel', 'Уровень добычи замков', p.castleLevel, 1),
            this.paramField('castleCollectsPerDay', 'Сборов добычи в день (цикл 8 ч → до 3)', p.castleCollectsPerDay, 1),
            this.paramField('miniEventsOn', 'Мини-ивенты (1/0)', p.miniEventsOn, 1),
            this.paramField('miniEventDays', 'Длительность мини-ивента, дней', p.miniEventDays, 1),
            this.paramField('miniEventRank', 'Место в «Чемпионах битв» (0 = без награды)', p.miniEventRank, 1),
            this.paramField('useManualDailyIncome', 'Прибавить ручную таблицу DailyIncome (1/0)', p.useManualDailyIncome, 1),
            this.paramField('equipmentPiecesPerHero', 'Экипировки на героя, шт.', p.equipmentPiecesPerHero, 1),
            this.paramField('equipmentTargetLevel', 'Целевой уровень экипировки (0 = выкл.)', p.equipmentTargetLevel, 1),
            this.paramField('equipmentRarity', 'Редкость экипировки', p.equipmentRarity, 1, false, true),
        );
        wrap.appendChild(incomeGrid);

        const extra = document.createElement('div');
        extra.style.cssText = 'display: grid; gap: 10px; margin-top: 10px;';
        extra.append(
            this.paramField('checkpoints', 'Чекпоинты уровней', p.checkpoints.join(', '), 0, true),
        );
        wrap.appendChild(extra);

        const otherHeading = document.createElement('div');
        otherHeading.textContent = 'Ручной Other Daily Income (поверх таблицы DailyIncome)';
        otherHeading.style.cssText = 'font-weight: 600; font-size: 13px; margin: 12px 0 8px; color: #d0d0d0;';
        wrap.appendChild(otherHeading);

        const other = document.createElement('div');
        other.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px;';
        other.append(
            this.paramField('otherGold', 'Золото / день', p.otherDaily.gold, 1),
            this.paramField('otherExp', 'Опыт / день', p.otherDaily.exp, 1),
            this.paramField('otherEssence', 'Эссенция / день', p.otherDaily.essence, 1),
            this.paramField('otherDust', 'Пыль / день', p.otherDaily.dust, 1),
            this.paramField('otherEnergy', 'Энергия / день', p.otherDaily.energy, 1),
        );
        wrap.appendChild(other);

        const hint = document.createElement('div');
        hint.textContent = 'Реген энергии и параметры гачи подтягиваются из CommonRemoteConfigs (если поле не правили руками). WR 55%. Лига по рейтингу; множители новой лиги со следующего дня. Сброс сезона: рейтинг = min(текущий, ResetRating лиги) + награда ResetRewardAmethysts. Золото из слотов, сундуков, PvP и ежедневных наград умножается на GoldIncomeMultiplier лиги, опыт PvP — на ExpIncomeMultiplier (как в клиенте); добыча замков и мини-ивенты — без множителей.';
        hint.style.cssText = 'margin-top: 10px; font-size: 12px; color: #9e9e9e; line-height: 1.4;';
        wrap.appendChild(hint);
        return wrap;
    }

    private paramField(
        key: string,
        label: string,
        value: number | string,
        step: number,
        wide = false,
        text = false,
    ): HTMLElement {
        const wrap = document.createElement('label');
        wrap.style.cssText = `display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #bdbdbd;${wide ? ' grid-column: 1 / -1;' : ''}`;
        wrap.append(label);

        const input = document.createElement('input');
        input.value = String(value);
        if (!wide && !text) {
            input.type = 'number';
            input.min = '0';
            input.step = String(step || 1);
        }
        input.addEventListener('input', () => this.touchedParams.add(key));
        input.style.cssText = [
            'padding: 7px 9px',
            'border: 1px solid #444',
            'border-radius: 4px',
            'background: #0f0f0f',
            'color: #f0f0f0',
            'font: inherit',
            'font-size: 13px',
        ].join(';');
        this.paramInputs.set(key, input);
        wrap.appendChild(input);
        return wrap;
    }

    private makeButton(text: string, dataAttr: string): HTMLButtonElement {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = text;
        button.setAttribute(dataAttr, '');
        button.style.cssText = [
            'padding: 8px 12px',
            'border: 1px solid #555',
            'border-radius: 4px',
            'background: #1f1f1f',
            'color: #f0f0f0',
            'font: inherit',
            'cursor: pointer',
        ].join(';');
        return button;
    }

    private createTableRow(table: ConfigTableDef): HTMLElement {
        const { id, defaultUrl } = table;
        const description = `${table.description}${table.required ? '' : ' · необязательная'}`;
        const row = document.createElement('div');
        row.style.cssText = [
            'display: flex',
            'flex-direction: column',
            'gap: 6px',
            'padding: 10px',
            'border: 1px solid #2a2a2a',
            'border-radius: 6px',
            'background: #181818',
        ].join(';');

        const header = document.createElement('div');
        header.style.cssText = 'display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px;';

        const nameLink = document.createElement('a');
        nameLink.textContent = id;
        nameLink.href = defaultUrl;
        nameLink.target = '_blank';
        nameLink.rel = 'noopener noreferrer';
        nameLink.style.cssText = 'color: #7eb8ff; font-weight: 600; font-size: 14px; text-decoration: none;';
        header.appendChild(nameLink);

        const desc = document.createElement('span');
        desc.textContent = description;
        desc.style.cssText = 'font-size: 13px; color: #9e9e9e;';
        header.appendChild(desc);
        row.appendChild(header);

        const input = document.createElement('input');
        input.type = 'url';
        input.value = defaultUrl;
        input.placeholder = 'Ссылка Google Sheets (в проде этой таблицы пока нет — можно вставить свою)';
        input.spellcheck = false;
        input.setAttribute('aria-label', `${id} Google Sheets URL`);
        input.style.cssText = [
            'width: 100%',
            'box-sizing: border-box',
            'padding: 8px 10px',
            'border: 1px solid #444',
            'border-radius: 4px',
            'background: #0f0f0f',
            'color: #f0f0f0',
            'font: inherit',
            'font-size: 13px',
        ].join(';');

        input.addEventListener('input', () => {
            this.rewriteUrlIfNeeded(input, false);
            nameLink.href = normalizeGoogleSheetUrl(input.value) || '#';
            this.parsedTables.delete(id);
            this.dirtyIds.add(id);
            this.setStatus(id, 'Изменено — загрузится при потере фокуса', '#bdbdbd');
        });

        input.addEventListener('blur', () => {
            this.rewriteUrlIfNeeded(input, true);
            nameLink.href = normalizeGoogleSheetUrl(input.value) || '#';
            if (this.dirtyIds.has(id)) {
                this.dirtyIds.delete(id);
                void this.loadOne(id);
            }
        });

        row.appendChild(input);

        const status = document.createElement('div');
        status.style.cssText = 'font-size: 12px; color: #9e9e9e; min-height: 1.2em;';
        row.appendChild(status);

        this.rowUi.set(id, { input, status, openLink: nameLink });
        return row;
    }

    private rewriteUrlIfNeeded(input: HTMLInputElement, force: boolean): void {
        const raw = input.value;
        if (!force && !shouldRewritePastedSheetUrl(raw)) {
            return;
        }
        const normalized = normalizeGoogleSheetUrl(raw);
        if (normalized !== raw) {
            input.value = normalized;
        }
    }

    private async loadAll(): Promise<void> {
        const generation = ++this.loadGeneration;
        this.loadButton.disabled = true;
        this.summaryEl.textContent = 'Загрузка…';
        this.summaryEl.style.color = '#9e9e9e';

        const results = await Promise.all(
            CONFIG_TABLES.map((table) => this.loadOne(table.id, generation)),
        );

        if (generation !== this.loadGeneration) {
            return;
        }

        const loaded = results.filter(Boolean).length;
        const requiredLoaded = REQUIRED_TABLES.filter((table) => this.parsedTables.has(table.id)).length;
        this.loadButton.disabled = false;
        this.summaryEl.textContent = `Загружено ${loaded} / ${CONFIG_TABLES.length} (обязательных ${requiredLoaded} / ${REQUIRED_TABLES.length})`;
        this.summaryEl.style.color = requiredLoaded === REQUIRED_TABLES.length ? '#7dcea0' : '#e74c3c';

        this.applyRemoteDefaults();
        if (requiredLoaded === REQUIRED_TABLES.length) {
            this.runSim();
        }
    }

    /** Реген энергии, цена и гарант гачи из CommonRemoteConfigs — если поле не правили руками. */
    private applyRemoteDefaults(): void {
        const table = this.parsedTables.get('CommonRemoteConfigs');
        if (!table) {
            return;
        }
        const remote = parseRemoteDefaults(table);
        const set = (key: string, value: number | undefined): void => {
            const input = this.paramInputs.get(key);
            if (input && value !== undefined && Number.isFinite(value) && !this.touchedParams.has(key)) {
                input.value = String(Math.round(value * 100) / 100);
            }
        };
        set('energyPerDay', remote.energyPerDay);
        set('dustPerPull', remote.summonPrice);
        set('gachaPity', remote.pity);
    }

    private async loadOne(id: ConfigTableId, batchGeneration?: number): Promise<boolean> {
        const ui = this.rowUi.get(id);
        if (!ui) {
            return false;
        }

        const rowGeneration = (this.rowGeneration.get(id) ?? 0) + 1;
        this.rowGeneration.set(id, rowGeneration);
        this.dirtyIds.delete(id);

        this.rewriteUrlIfNeeded(ui.input, true);
        const url = normalizeGoogleSheetUrl(ui.input.value);
        ui.input.value = url;
        ui.openLink.href = url || '#';
        this.parsedTables.delete(id);

        if (url === '') {
            this.setStatus(id, 'Ссылка не задана — таблица пропущена', '#9e9e9e');
            return false;
        }

        this.setStatus(id, 'Загрузка…', '#9e9e9e');

        try {
            const csv = await fetchGoogleSheetCsv(url);
            if (!this.isLoadCurrent(id, rowGeneration, batchGeneration)) {
                return false;
            }
            const parsed = parseCsvTable(csv);
            this.parsedTables.set(id, parsed);
            this.setStatus(id, this.describeParsedTable(id, parsed), '#7dcea0');
            return true;
        } catch (error) {
            if (!this.isLoadCurrent(id, rowGeneration, batchGeneration)) {
                return false;
            }
            const message = error instanceof Error ? error.message : String(error);
            this.setStatus(id, `Ошибка: ${message}`, '#e74c3c');
            return false;
        }
    }

    private describeParsedTable(id: ConfigTableId, parsed: ParsedCsvTable): string {
        if (id === 'ChestSlot' || id === 'ChestPvp') {
            const table = parseChestSlotTable(parsed);
            const slots = Math.max(...Object.values(table).map((rarity) => rarity.length));
            return `${Object.keys(table).length} редкостей · до ${slots} слотов`;
        }
        if (id === 'DailyIncome') {
            return describeManualDailyIncome(parseManualDailyIncome(parsed));
        }
        const headerPreview = parsed.headers.filter((header) => header !== '').join(', ');
        return `${parsed.rows.length} строк · ${headerPreview}`;
    }

    private isLoadCurrent(id: ConfigTableId, rowGeneration: number, batchGeneration?: number): boolean {
        if (this.rowGeneration.get(id) !== rowGeneration) {
            return false;
        }
        if (batchGeneration !== undefined && batchGeneration !== this.loadGeneration) {
            return false;
        }
        return true;
    }

    private setStatus(id: ConfigTableId, text: string, color: string): void {
        const ui = this.rowUi.get(id);
        if (!ui) {
            return;
        }
        ui.status.textContent = text;
        ui.status.style.color = color;
    }

    private readParams(): SimParams {
        const num = (key: string, fallback: number): number => {
            const parsed = Number(this.paramInputs.get(key)?.value);
            return Number.isFinite(parsed) ? parsed : fallback;
        };
        const list = (key: string, fallback: number[]): number[] => {
            const raw = this.paramInputs.get(key)?.value ?? '';
            const parsed = raw.split(/[,\s]+/).map((part) => Number(part)).filter((value) => Number.isFinite(value) && value > 0);
            return parsed.length > 0 ? parsed : fallback;
        };
        const d = DEFAULT_SIM_PARAMS;
        return {
            heroCount: Math.max(1, Math.round(num('heroCount', d.heroCount))),
            energyPerDay: Math.max(0, num('energyPerDay', d.energyPerDay)),
            spinEnergyCost: Math.max(0.0001, num('spinEnergyCost', d.spinEnergyCost)),
            winRate: Math.min(1, Math.max(0, num('winRatePct', d.winRate * 100) / 100)),
            dustPerPull: Math.max(0, num('dustPerPull', d.dustPerPull)),
            sHeroCount: Math.max(1, Math.round(num('sHeroCount', d.sHeroCount))),
            factionCount: Math.max(1, Math.round(num('factionCount', d.factionCount))),
            gachaPity: Math.max(1, Math.round(num('gachaPity', d.gachaPity))),
            targetHeroPity: num('targetHeroPity', d.targetHeroPity) > 0 ? 1 : 0,
            maxDays: Math.max(1, Math.round(num('maxDays', d.maxDays))),
            checkpoints: list('checkpoints', d.checkpoints),
            startLeagueIndex: Math.max(0, Math.round(num('startLeagueIndex', d.startLeagueIndex + 1)) - 1),
            startRating: Math.max(0, num('startRating', d.startRating)),
            weeklyResetEveryDays: Math.max(0, Math.round(num('weeklyResetEveryDays', d.weeklyResetEveryDays))),
            premiumDaily: num('premiumDaily', d.premiumDaily) > 0 ? 1 : 0,
            taskCompletionPct: Math.min(100, Math.max(0, num('taskCompletionPct', d.taskCompletionPct))),
            useManualDailyIncome: num('useManualDailyIncome', d.useManualDailyIncome) > 0 ? 1 : 0,
            castlesActive: Math.max(0, Math.round(num('castlesActive', d.castlesActive))),
            castleLevel: Math.max(0, Math.round(num('castleLevel', d.castleLevel))),
            castleCollectsPerDay: Math.max(0, num('castleCollectsPerDay', d.castleCollectsPerDay)),
            miniEventsOn: num('miniEventsOn', d.miniEventsOn) > 0 ? 1 : 0,
            miniEventDays: Math.max(1, Math.round(num('miniEventDays', d.miniEventDays))),
            miniEventRank: Math.max(0, Math.round(num('miniEventRank', d.miniEventRank))),
            equipmentPiecesPerHero: Math.max(0, Math.round(num('equipmentPiecesPerHero', d.equipmentPiecesPerHero))),
            equipmentTargetLevel: Math.max(0, Math.round(num('equipmentTargetLevel', d.equipmentTargetLevel))),
            equipmentRarity: (this.paramInputs.get('equipmentRarity')?.value ?? d.equipmentRarity).trim() || d.equipmentRarity,
            otherDaily: {
                ...d.otherDaily,
                gold: Math.max(0, num('otherGold', d.otherDaily.gold)),
                exp: Math.max(0, num('otherExp', d.otherDaily.exp)),
                essence: Math.max(0, num('otherEssence', d.otherDaily.essence)),
                dust: Math.max(0, num('otherDust', d.otherDaily.dust)),
                energy: Math.max(0, num('otherEnergy', d.otherDaily.energy)),
            },
        };
    }

    private runSim(): void {
        this.runButton.disabled = true;
        try {
            const missing = REQUIRED_TABLES.filter((table) => !this.parsedTables.has(table.id));
            if (missing.length > 0) {
                throw new Error(`Сначала загрузите обязательные таблицы: ${missing.map((table) => table.id).join(', ')}`);
            }
            const config = parseGameConfig(this.parsedTables);
            const result = runSimulation(config, this.readParams());
            this.lastResult = result;
            this.renderResults(result);
        } catch (error) {
            this.lastResult = null;
            this.resultsEl.replaceChildren();
            const err = document.createElement('div');
            err.textContent = error instanceof Error ? error.message : String(error);
            err.style.cssText = 'color: #e74c3c; font-size: 14px;';
            this.resultsEl.appendChild(err);
        } finally {
            this.runButton.disabled = false;
        }
    }

    private renderResults(result: SimResult): void {
        this.resultsEl.replaceChildren();

        const heading = document.createElement('h3');
        heading.textContent = 'Отчёт';
        heading.style.cssText = 'margin: 0 0 10px; font-size: 16px;';
        this.resultsEl.appendChild(heading);

        this.resultsEl.appendChild(this.kvLine(
            `Дней: ${result.daysRun} · Уровень отряда: ${result.finalLevel} / ${result.maxLevel} · Лига: ${result.finalLeagueName} · Рейтинг: ${this.fmt(result.finalRating)}`,
        ));

        this.resultsEl.appendChild(this.sectionTitle('Чекпоинты (скорость)'));
        this.resultsEl.appendChild(this.simpleTable(
            ['Уровень отряда', 'День'],
            result.checkpoints.map((cp) => [
                String(cp.level),
                cp.day === null ? 'не достигнут' : String(cp.day),
            ]),
        ));

        this.resultsEl.appendChild(this.sectionTitle('Узкие места'));
        this.resultsEl.appendChild(this.kvLine(result.bottleneck));
        if (result.stalls.length > 0) {
            this.resultsEl.appendChild(this.simpleTable(
                ['Уровень', 'Ресурс', 'Дней ожидания', 'Профицит'],
                result.stalls.slice(0, 8).map((stall) => [
                    String(stall.squadLevel),
                    RESOURCE_LABELS[stall.limiting],
                    String(Math.round(stall.days)),
                    this.formatSurplus(stall.surplus),
                ]),
            ));
        }

        this.resultsEl.appendChild(this.sectionTitle('EV гачи → астральная пыль'));
        const g = result.gacha;
        this.resultsEl.appendChild(this.simpleTable(
            ['Метрика', 'Значение'],
            [
                ['Круток до S (с гарантом)', this.fmt(g.pullsToS)],
                ['S-выпадений до целевого героя', this.fmt(g.sDropsPerTarget)],
                ['Круток на 1 именной осколок', this.fmt(g.pullsToNamedShard)],
                ['Пыли на 1 именной осколок', this.fmt(g.dustPerNamedShard)],
                ['Пыли на 1 фракционный герб (одиночно)', this.fmt(g.dustPerFactionEmblem)],
                [`Полное возвышение 1 героя (${g.shardsPerHero} оск. + ${g.armsPerHero} герб.), без побочных наград`, this.fmt(g.dustPerHeroFullAscension)],
                ['Полное возвышение отряда, без побочных наград', this.fmt(g.dustPerSquadFullAscension)],
                ['Опыта героев за крутку (побочно)', this.fmt(g.expPerPull)],
                ['Полезных гербов отряда за крутку', this.fmt(g.armsPerPull)],
            ],
        ));

        this.resultsEl.appendChild(this.sectionTitle('Дневной доход по лигам'));
        this.resultsEl.appendChild(this.simpleTable(
            ['Лига', 'Спины', 'PvP боёв', 'Сундуки', 'Золото', 'Опыт', 'Эссенция', 'Пыль', 'Гербы', 'Аметисты', 'Декор'],
            result.incomeByLeague.map((row) => [
                row.leagueName,
                this.fmt(row.income.spins),
                this.fmt(row.income.pvpFights),
                this.fmt(row.income.chestsOpened),
                this.fmt(row.income.total.gold),
                this.fmt(row.income.total.exp),
                this.fmt(row.income.total.essence),
                this.fmt(row.income.total.dust),
                this.fmt(row.income.total.arms),
                this.fmt(row.income.total.amethyst),
                this.fmt(row.income.total.decor),
            ]),
        ));

        this.resultsEl.appendChild(this.sectionTitle('Источники золота / опыта / пыли по лигам'));
        this.resultsEl.appendChild(this.simpleTable(
            ['Лига', 'Источник', 'Золото', 'Опыт', 'Пыль', 'Эссенция'],
            result.incomeByLeague.flatMap((row) => {
                const i = row.income;
                const sources: Array<[string, Resources]> = [
                    ['Слоты', i.fromSlots],
                    ['PvP', i.fromPvp],
                    ['Сундуки слотов', i.fromSlotChests],
                    ['Сундуки PvP', i.fromPvpChests],
                    ['Ежедневные награды', i.fromDaily],
                    ['Задания', i.fromTasks],
                    ['Замки', i.fromCastle],
                    ['Мини-ивенты', i.fromEvents],
                    ['Прочее', i.fromOther],
                ];
                return sources.map(([label, res]) => [
                    row.leagueName,
                    label,
                    this.fmt(res.gold),
                    this.fmt(res.exp),
                    this.fmt(res.dust),
                    this.fmt(res.essence),
                ]);
            }),
        ));

        this.resultsEl.appendChild(this.sectionTitle('Дней в лигах'));
        this.resultsEl.appendChild(this.simpleTable(
            ['Лига', 'Дней'],
            result.daysInLeagues.map((row) => [row.leagueName, String(row.days)]),
        ));

        this.resultsEl.appendChild(this.sectionTitle('Остаток инвентаря'));
        this.resultsEl.appendChild(this.kvLine(
            ALL_RESOURCE_IDS.map((id) => `${RESOURCE_LABELS[id]} ${this.fmt(result.inventory[id])}`).join(' · '),
        ));
        this.resultsEl.appendChild(this.kvLine(`Уровень аккаунта к концу симуляции: ${result.accountLevel}`));
        if (result.equipment) {
            this.resultsEl.appendChild(this.kvLine(
                `Экипировка: ${result.equipment.pieces} шт. · золото ${this.fmt(result.equipment.goldTotal)} · осколки кузни ${this.fmt(result.equipment.shardsTotal)}`,
            ));
        }

        for (const note of result.notes) {
            this.resultsEl.appendChild(this.kvLine(note, '#c9a227'));
        }

        const download = this.makeButton('Скачать отчёт CSV', 'data-download');
        download.addEventListener('click', () => this.downloadReport());
        this.resultsEl.appendChild(download);
    }

    private downloadReport(): void {
        if (!this.lastResult) {
            return;
        }
        const blob = new Blob([simulationReportCsv(this.lastResult)], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hoc-balance-report.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    private sectionTitle(text: string): HTMLElement {
        const el = document.createElement('h4');
        el.textContent = text;
        el.style.cssText = 'margin: 16px 0 8px; font-size: 14px; font-weight: 600; color: #d0d0d0;';
        return el;
    }

    private kvLine(text: string, color = '#cfcfcf'): HTMLElement {
        const el = document.createElement('div');
        el.textContent = text;
        el.style.cssText = `font-size: 13px; line-height: 1.45; color: ${color}; margin-bottom: 8px;`;
        return el;
    }

    private simpleTable(headers: string[], rows: string[][]): HTMLElement {
        const table = document.createElement('table');
        table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 8px;';
        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        for (const label of headers) {
            const th = document.createElement('th');
            th.textContent = label;
            th.style.cssText = 'text-align: left; padding: 8px; border-bottom: 1px solid #3a3a3a; color: #bdbdbd; background: #1c1c1c;';
            headRow.appendChild(th);
        }
        thead.appendChild(headRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        for (const row of rows) {
            const tr = document.createElement('tr');
            for (const cell of row) {
                const td = document.createElement('td');
                td.textContent = cell;
                td.style.cssText = 'padding: 8px; border-bottom: 1px solid #2a2a2a; vertical-align: top;';
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        return table;
    }

    private formatSurplus(surplus: Partial<Record<ResourceId, number>>): string {
        const parts: string[] = [];
        for (const [id, value] of Object.entries(surplus) as Array<[ResourceId, number | undefined]>) {
            if (value === undefined) {
                continue;
            }
            const pct = Math.round(value * 100);
            if (pct > 0) {
                parts.push(`${RESOURCE_LABELS[id]} +${pct}%`);
            }
        }
        return parts.length > 0 ? parts.join(', ') : '—';
    }

    private fmt(value: number): string {
        if (!Number.isFinite(value)) {
            return '∞';
        }
        return value.toLocaleString('ru-RU', { maximumFractionDigits: 1 });
    }
}
