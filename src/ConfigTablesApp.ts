import { CONFIG_TABLES, type ConfigTableId } from './configTables.js';
import {
    fetchGoogleSheetCsv,
    normalizeGoogleSheetUrl,
    parseCsvTable,
    shouldRewritePastedSheetUrl,
    type ParsedCsvTable,
} from './googleSheets.js';

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
    private readonly root: HTMLElement;
    private readonly loadButton: HTMLButtonElement;
    private readonly summaryEl: HTMLElement;
    private loadGeneration = 0;

    constructor(parentElement: HTMLElement) {
        this.root = this.createRoot();
        this.loadButton = this.root.querySelector('[data-load-all]') as HTMLButtonElement;
        this.summaryEl = this.root.querySelector('[data-summary]') as HTMLElement;
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
        };
    }

    private bind(): void {
        this.loadButton.addEventListener('click', () => {
            void this.loadAll();
        });
    }

    private createRoot(): HTMLElement {
        const root = document.createElement('div');
        root.style.cssText = [
            'width: min(960px, 96vw)',
            'color: #e8e8e8',
            'font-family: Segoe UI, Tahoma, sans-serif',
            'background: #141414',
            'border: 1px solid #333',
            'border-radius: 8px',
            'padding: 16px',
            'box-sizing: border-box',
        ].join(';');

        const title = document.createElement('h2');
        title.textContent = 'HoC Balance';
        title.style.cssText = 'margin: 0 0 8px; font-size: 20px; font-weight: 600;';
        root.appendChild(title);

        const intro = document.createElement('p');
        intro.textContent = 'Входные данные. Утилита автоматически парсит текущие конфигурационные таблицы проекта:';
        intro.style.cssText = 'margin: 0 0 14px; font-size: 14px; line-height: 1.45; color: #cfcfcf;';
        root.appendChild(intro);

        const controls = document.createElement('div');
        controls.style.cssText = 'display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 14px;';

        const loadButton = document.createElement('button');
        loadButton.type = 'button';
        loadButton.textContent = 'Загрузить таблицы';
        loadButton.setAttribute('data-load-all', '');
        loadButton.style.cssText = [
            'padding: 8px 12px',
            'border: 1px solid #555',
            'border-radius: 4px',
            'background: #1f1f1f',
            'color: #f0f0f0',
            'font: inherit',
            'cursor: pointer',
        ].join(';');
        controls.appendChild(loadButton);

        const summary = document.createElement('span');
        summary.setAttribute('data-summary', '');
        summary.style.cssText = 'font-size: 13px; color: #9e9e9e;';
        controls.appendChild(summary);

        root.appendChild(controls);

        const list = document.createElement('div');
        list.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';

        for (const table of CONFIG_TABLES) {
            list.appendChild(this.createTableRow(table.id, table.description, table.defaultUrl));
        }

        root.appendChild(list);
        return root;
    }

    private createTableRow(id: ConfigTableId, description: string, defaultUrl: string): HTMLElement {
        const row = document.createElement('div');
        row.style.cssText = [
            'display: flex',
            'flex-direction: column',
            'gap: 6px',
            'padding: 10px 10px 12px',
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
        input.placeholder = 'https://docs.google.com/spreadsheets/d/…';
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
            const headerPreview = parsed.headers.filter((header) => header !== '').join(', ');
            this.setStatus(
                id,
                `${parsed.rows.length} строк · ${headerPreview}`,
                '#7dcea0',
            );
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
}
