import { CONFIG_TABLES, type ConfigTableId } from './configTables.js';
import {
    fetchGoogleSheetCsv,
    normalizeGoogleSheetUrl,
    parseCsvTable,
    shouldRewritePastedSheetUrl,
    type ParsedCsvTable,
} from './googleSheets.js';
import { describeChestParse, parseChest, parseGameConfig } from './sim/parseGameConfig.js';
import { runSimulation, simulationReportCsv, type SimResult } from './sim/simulate.js';
import { DEFAULT_SIM_PARAMS, RESOURCE_LABELS, type ResourceId, type SimParams } from './sim/types.js';

interface TableRowUi {
    input: HTMLInputElement;
    status: HTMLElement;
    openLink: HTMLAnchorElement;
}

export class ConfigTablesApp {
    private readonly parsedTables = new Map<ConfigTableId, ParsedCsvTable>();
    private readonly rowUi = new Map<ConfigTableId, TableRowUi>();
    private readonly rowGeneration = new Map<ConfigTableId, number>();
    private readonly dirtyIds = new Set<ConfigTableId>();
    private readonly paramInputs = new Map<string, HTMLInputElement>();
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
        title.textContent = 'HoC Balance — симуляция (альфа)';
        title.style.cssText = 'margin: 0 0 8px; font-size: 20px; font-weight: 600;';
        root.appendChild(title);

        const intro = document.createElement('p');
        intro.textContent = 'EV-симулятор активного дня по формулам клиента/сервера: слоты + арена + реклама. Энергия с рекламы и сундуков крутится снова. 5 героев качаются синхронно. Почта, квесты и ивенты не учитываются.';
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
        for (const table of CONFIG_TABLES) {
            list.appendChild(this.createTableRow(table.id, table.description, table.defaultUrl));
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
            this.paramField('energyRegenIntervalSeconds', 'Реген энергии, сек', p.energyRegenIntervalSeconds, 1),
            this.paramField('energyPerTick', 'Энергии за тик', p.energyPerTick, 1),
            this.paramField('spinEnergyCost', 'Энергии за спин', p.spinEnergyCost, 1),
            this.paramField('adsPerDay', 'Реклама / сутки', p.adsPerDay, 1),
            this.paramField('winRatePct', 'Винрейт PvP %', p.winRate * 100, 1),
            this.paramField('dustPerPull', 'Пыль за 1 крутку', p.dustPerPull, 1),
            this.paramField('sHeroCount', 'Герои S в пуле', p.sHeroCount, 1),
            this.paramField('aHeroCount', 'Герои A в пуле', p.aHeroCount, 1),
            this.paramField('factionCount', 'Фракций (гербы)', p.factionCount, 1),
            this.paramField('gachaPity', 'Pity (промахов до гаранта)', p.gachaPity, 1),
            this.paramField('startingHeroTier', 'Стартовый ранг героев', p.startingHeroTier, 0, false, true),
            this.paramField('maxDays', 'Макс. дней', p.maxDays, 1),
        );
        wrap.appendChild(grid);

        const flags = document.createElement('div');
        flags.style.cssText = 'display: flex; flex-wrap: wrap; gap: 16px; margin-top: 10px;';
        flags.append(
            this.checkboxField('leagueByRating', 'Лиги по рейтингу (как в игре)', p.leagueProgression === 'rating'),
            this.checkboxField('applyPvpLossRewards', 'Награды за поражение PvP', p.applyPvpLossRewards),
        );
        wrap.appendChild(flags);

        const extra = document.createElement('div');
        extra.style.cssText = 'display: grid; gap: 10px; margin-top: 10px;';
        extra.append(
            this.paramField('checkpoints', 'Чекпоинты уровней', p.checkpoints.join(', '), 0, true),
            this.paramField('leagueUnlockLevels', 'Уровни открытия лиг (если рейтинг выключен)', p.leagueUnlockLevels.join(', '), 0, true),
        );
        wrap.appendChild(extra);

        const hint = document.createElement('div');
        hint.textContent = 'Клиент: +1 энергия / 300 с ≈ 288/сутки, спин стоит 1, крутка гачи 100 пыли, pity на HeroATier (S). Возвышение списывается после брейкпоинтов. Стартовый ранг S — герои не платят ступени A→S.';
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

    private checkboxField(key: string, label: string, checked: boolean): HTMLElement {
        const wrap = document.createElement('label');
        wrap.style.cssText = 'display: flex; align-items: center; gap: 8px; font-size: 13px; color: #cfcfcf; cursor: pointer;';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = checked;
        this.paramInputs.set(key, input);
        wrap.append(input, label);
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

    private createTableRow(id: ConfigTableId, description: string, defaultUrl: string): HTMLElement {
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
        this.loadButton.disabled = false;
        this.summaryEl.textContent = `Загружено ${loaded} / ${CONFIG_TABLES.length}`;
        this.summaryEl.style.color = loaded === CONFIG_TABLES.length ? '#7dcea0' : '#e74c3c';

        if (loaded === CONFIG_TABLES.length) {
            this.runSim();
        }
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

        this.setStatus(id, 'Загрузка…', '#9e9e9e');
        this.parsedTables.delete(id);

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
        if (id === 'PvpChestRewardPool') {
            return describeChestParse(parseChest(parsed));
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
        const checked = (key: string, fallback: boolean): boolean => this.paramInputs.get(key)?.checked ?? fallback;
        const text = (key: string, fallback: string): string => {
            const raw = this.paramInputs.get(key)?.value?.trim();
            return raw ? raw : fallback;
        };
        return {
            heroCount: Math.max(1, Math.round(num('heroCount', d.heroCount))),
            energyRegenIntervalSeconds: Math.max(1, num('energyRegenIntervalSeconds', d.energyRegenIntervalSeconds)),
            energyPerTick: Math.max(0, num('energyPerTick', d.energyPerTick)),
            spinEnergyCost: Math.max(0.0001, num('spinEnergyCost', d.spinEnergyCost)),
            adsPerDay: Math.max(0, num('adsPerDay', d.adsPerDay)),
            winRate: Math.min(1, Math.max(0, num('winRatePct', d.winRate * 100) / 100)),
            dustPerPull: Math.max(0, num('dustPerPull', d.dustPerPull)),
            sHeroCount: Math.max(1, Math.round(num('sHeroCount', d.sHeroCount))),
            aHeroCount: Math.max(1, Math.round(num('aHeroCount', d.aHeroCount))),
            factionCount: Math.max(1, Math.round(num('factionCount', d.factionCount))),
            gachaPity: Math.max(1, Math.round(num('gachaPity', d.gachaPity))),
            startingHeroTier: text('startingHeroTier', d.startingHeroTier),
            maxDays: Math.max(1, Math.round(num('maxDays', d.maxDays))),
            checkpoints: list('checkpoints', d.checkpoints),
            leagueProgression: checked('leagueByRating', d.leagueProgression === 'rating') ? 'rating' : 'squadLevel',
            leagueUnlockLevels: list('leagueUnlockLevels', d.leagueUnlockLevels),
            applyPvpLossRewards: checked('applyPvpLossRewards', d.applyPvpLossRewards),
        };
    }

    private runSim(): void {
        this.runButton.disabled = true;
        try {
            if (this.parsedTables.size < CONFIG_TABLES.length) {
                throw new Error('Сначала загрузите все таблицы');
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
                ['Круток до S-героя (HeroATier + pity)', this.fmt(g.pullsToS)],
                ['Круток до A-героя (HeroSTier, без pity)', this.fmt(g.pullsToA)],
                ['Пыли на 1 копию именного S', this.fmt(g.dustPerNamedShard)],
                ['Пыли на 1 копию именного A', this.fmt(g.dustPerNamedAShard)],
                ['Пыли на 1 фракционный герб', this.fmt(g.dustPerFactionEmblem)],
                [`Возвышение 1 героя с выбранного ранга (${g.shardsPerHero} копий + ${g.armsPerHero} герб.)`, this.fmt(g.dustPerHeroFullAscension)],
                ['Возвышение отряда', this.fmt(g.dustPerSquadFullAscension)],
            ],
        ));

        this.resultsEl.appendChild(this.sectionTitle('Дневной доход по лигам'));
        this.resultsEl.appendChild(this.simpleTable(
            ['Лига', 'Спины', 'Реген эн.', 'Рекл. эн.', 'PvP боёв', 'Сундуки', 'Золото', 'Опыт', 'Эссенция', 'Пыль'],
            result.incomeByLeague.map((row) => [
                row.leagueName,
                this.fmt(row.income.spins),
                this.fmt(row.income.regenEnergy),
                this.fmt(row.income.adEnergy),
                this.fmt(row.income.pvpFights),
                this.fmt(row.income.chestsOpened),
                this.fmt(row.income.total.gold),
                this.fmt(row.income.total.exp),
                this.fmt(row.income.total.essence),
                this.fmt(row.income.total.dust),
            ]),
        ));

        this.resultsEl.appendChild(this.sectionTitle('Остаток инвентаря'));
        this.resultsEl.appendChild(this.kvLine(
            `Золото ${this.fmt(result.inventory.gold)} · Опыт ${this.fmt(result.inventory.exp)} · Эссенция ${this.fmt(result.inventory.essence)} · Пыль ${this.fmt(result.inventory.dust)}`,
        ));

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
