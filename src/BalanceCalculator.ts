export type SlotSymbolId =
    | 'energy'
    | 'gacha_small'
    | 'pve'
    | 'gold_small'
    | 'gacha_large'
    | 'pvp'
    | 'gold_large'
    | 'empty';

export interface SlotOutcome {
    id: SlotSymbolId;
    symbol: string;
    chancePercent: number;
    reward: string;
    flow: string;
}

const DEFAULT_OUTCOMES: SlotOutcome[] = [
    {
        id: 'energy',
        symbol: 'Энергия для рулетки',
        chancePercent: 22,
        reward: 'Энергия +1',
        flow: 'Мгновенно. Игрок просто делает еще один спин (ощущение "бесплатной игры").',
    },
    {
        id: 'gacha_small',
        symbol: 'Ресурс для гачи (Мало)',
        chancePercent: 20,
        reward: '5 Астральной Пыли',
        flow: 'Мгновенно. Копится на счету.',
    },
    {
        id: 'pve',
        symbol: 'Символ PvE',
        chancePercent: 15,
        reward: 'Вход в подземелье/бой',
        flow: 'Переход в экран выбора атаки -> Бой -> Награда (Сундук/Золото).',
    },
    {
        id: 'gold_small',
        symbol: 'Золото (Малое)',
        chancePercent: 15,
        reward: '50 золота',
        flow: 'Мгновенно. Летит в кошелек.',
    },
    {
        id: 'gacha_large',
        symbol: 'Ресурс для гачи (Много)',
        chancePercent: 8,
        reward: '20 Астральной Пыли',
        flow: 'Мгновенно. Копится на счету (эффект джекпота).',
    },
    {
        id: 'pvp',
        symbol: 'PvP символ',
        chancePercent: 8,
        reward: 'Нападение на игрока',
        flow: 'Переход в экран атаки/грабежа.',
    },
    {
        id: 'gold_large',
        symbol: 'Золото (Большое)',
        chancePercent: 7,
        reward: '200 золота',
        flow: 'Мгновенно. Летит в кошелек.',
    },
    {
        id: 'empty',
        symbol: 'Ничего (Пустой спин)',
        chancePercent: 5,
        reward: 'Нет награды',
        flow: '',
    },
];

export class BalanceCalculator {
    private readonly outcomes: SlotOutcome[];
    private readonly root: HTMLElement;
    private readonly totalEl: HTMLElement;
    private readonly inputs = new Map<SlotSymbolId, HTMLInputElement>();

    constructor(parentElement: HTMLElement) {
        this.outcomes = DEFAULT_OUTCOMES.map((outcome) => ({ ...outcome }));
        this.root = this.createRoot();
        this.totalEl = this.root.querySelector('[data-total]') as HTMLElement;
        parentElement.appendChild(this.root);
        this.renderTable();
        this.updateTotal();
    }

    getOutcomes(): ReadonlyArray<SlotOutcome> {
        return this.outcomes.map((outcome) => ({ ...outcome }));
    }

    getChancePercent(id: SlotSymbolId): number {
        const outcome = this.outcomes.find((item) => item.id === id);
        if (!outcome) {
            throw new Error(`Unknown slot symbol: ${id}`);
        }
        return outcome.chancePercent;
    }

    setChancePercent(id: SlotSymbolId, chancePercent: number): void {
        const outcome = this.outcomes.find((item) => item.id === id);
        if (!outcome) {
            throw new Error(`Unknown slot symbol: ${id}`);
        }

        const clamped = this.clampChance(chancePercent);
        outcome.chancePercent = clamped;

        const input = this.inputs.get(id);
        if (input && Number(input.value) !== clamped) {
            input.value = String(clamped);
        }

        this.updateTotal();
    }

    getTotalChancePercent(): number {
        return this.outcomes.reduce((sum, outcome) => sum + outcome.chancePercent, 0);
    }

    private createRoot(): HTMLElement {
        const root = document.createElement('div');
        root.style.cssText = [
            'width: min(1100px, 96vw)',
            'max-height: 92vh',
            'overflow: auto',
            'color: #e8e8e8',
            'font-family: Segoe UI, Tahoma, sans-serif',
            'background: #141414',
            'border: 1px solid #333',
            'border-radius: 8px',
            'padding: 16px',
            'box-sizing: border-box',
        ].join(';');

        const title = document.createElement('h2');
        title.textContent = 'Баланс слота';
        title.style.cssText = 'margin: 0 0 12px; font-size: 20px; font-weight: 600;';
        root.appendChild(title);

        const tableHost = document.createElement('div');
        tableHost.setAttribute('data-table-host', '');
        root.appendChild(tableHost);

        const footer = document.createElement('div');
        footer.style.cssText = 'margin-top: 12px; display: flex; align-items: center; gap: 8px; font-size: 14px;';
        footer.innerHTML = '<span>Сумма шансов:</span><strong data-total>0%</strong>';
        root.appendChild(footer);

        return root;
    }

    private renderTable(): void {
        const host = this.root.querySelector('[data-table-host]') as HTMLElement;
        host.replaceChildren();
        this.inputs.clear();

        const table = document.createElement('table');
        table.style.cssText = [
            'width: 100%',
            'border-collapse: collapse',
            'font-size: 13px',
            'table-layout: fixed',
        ].join(';');

        const colgroup = document.createElement('colgroup');
        for (const width of ['22%', '12%', '18%', '48%']) {
            const col = document.createElement('col');
            col.style.width = width;
            colgroup.appendChild(col);
        }
        table.appendChild(colgroup);

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        for (const label of ['Символ на слоте', 'Шанс выпадения', 'Награда игрока', 'Что происходит дальше (Flow)']) {
            const th = document.createElement('th');
            th.textContent = label;
            th.style.cssText = [
                'text-align: left',
                'padding: 10px 8px',
                'border-bottom: 1px solid #3a3a3a',
                'color: #bdbdbd',
                'font-weight: 600',
                'background: #1c1c1c',
            ].join(';');
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        for (const outcome of this.outcomes) {
            tbody.appendChild(this.createRow(outcome));
        }
        table.appendChild(tbody);

        host.appendChild(table);
    }

    private createRow(outcome: SlotOutcome): HTMLTableRowElement {
        const row = document.createElement('tr');

        const symbolCell = document.createElement('td');
        symbolCell.textContent = outcome.symbol;
        this.styleCell(symbolCell);

        const chanceCell = document.createElement('td');
        this.styleCell(chanceCell);
        chanceCell.appendChild(this.createChanceInput(outcome));

        const rewardCell = document.createElement('td');
        rewardCell.textContent = outcome.reward;
        this.styleCell(rewardCell);

        const flowCell = document.createElement('td');
        flowCell.textContent = outcome.flow || '—';
        this.styleCell(flowCell);

        row.append(symbolCell, chanceCell, rewardCell, flowCell);
        return row;
    }

    private createChanceInput(outcome: SlotOutcome): HTMLElement {
        const wrap = document.createElement('label');
        wrap.style.cssText = 'display: inline-flex; align-items: center; gap: 4px;';

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = '100';
        input.step = '1';
        input.value = String(outcome.chancePercent);
        input.setAttribute('aria-label', `Шанс выпадения: ${outcome.symbol}`);
        input.style.cssText = [
            'width: 64px',
            'padding: 6px 8px',
            'border: 1px solid #444',
            'border-radius: 4px',
            'background: #0f0f0f',
            'color: #f0f0f0',
            'font: inherit',
        ].join(';');

        input.addEventListener('input', () => {
            const parsed = Number(input.value);
            outcome.chancePercent = Number.isFinite(parsed) ? this.clampChance(parsed) : 0;
            this.updateTotal();
        });

        input.addEventListener('blur', () => {
            input.value = String(outcome.chancePercent);
        });

        this.inputs.set(outcome.id, input);

        const suffix = document.createElement('span');
        suffix.textContent = '%';
        suffix.style.color = '#9e9e9e';

        wrap.append(input, suffix);
        return wrap;
    }

    private styleCell(cell: HTMLElement): void {
        cell.style.cssText = [
            'padding: 10px 8px',
            'border-bottom: 1px solid #2a2a2a',
            'vertical-align: top',
            'line-height: 1.35',
            'word-wrap: break-word',
        ].join(';');
    }

    private updateTotal(): void {
        const total = this.getTotalChancePercent();
        this.totalEl.textContent = `${total}%`;
        this.totalEl.style.color = total === 100 ? '#7dcea0' : '#e74c3c';
    }

    private clampChance(value: number): number {
        if (!Number.isFinite(value)) {
            return 0;
        }
        return Math.min(100, Math.max(0, Math.round(value)));
    }
}
