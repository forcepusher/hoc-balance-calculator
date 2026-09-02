import { computeGachaEv, dustCostForTierUp, type GachaEv } from './gacha.js';
import { computeDailyIncome, type DailyIncomeBreakdown } from './income.js';
import type { GameConfig, LevelRow, ResourceId, Resources, SimParams, TierUpRow } from './types.js';
import {
    addResources,
    canAfford,
    emptyResources,
    RESOURCE_IDS,
    RESOURCE_LABELS,
    scaleResources,
    subtractResources,
} from './types.js';

export interface CheckpointResult {
    level: number;
    day: number | null;
}

export interface LevelStall {
    squadLevel: number;
    days: number;
    limiting: ResourceId;
    surplus: Partial<Record<ResourceId, number>>;
}

export interface SimResult {
    daysRun: number;
    finalLevel: number;
    maxLevel: number;
    finalLeagueName: string;
    inventory: Resources;
    checkpoints: CheckpointResult[];
    stalls: LevelStall[];
    bottleneck: string;
    gacha: GachaEv;
    incomeByLeague: Array<{ leagueName: string; income: DailyIncomeBreakdown }>;
    notes: string[];
}

interface PendingTier {
    afterLevel: number;
    row: TierUpRow;
    paid: boolean;
}

export function runSimulation(config: GameConfig, params: SimParams): SimResult {
    const gacha = computeGachaEv(config.gacha, config.tierUps, params);
    const notes: string[] = [];
    const maxLevel = config.levels.reduce((max, row) => Math.max(max, row.level), 1);
    const byLevel = new Map(config.levels.map((row) => [row.level, row]));
    const pendingTiers = assignTierUps(config);
    const incomeByLeague = config.leagues.map((league) => ({
        leagueName: league.name || league.id,
        income: computeDailyIncome(config, league, params),
    }));

    let day = 0;
    let squadLevel = 1;
    let leagueIndex = 0;
    let pendingLeagueIndex: number | null = null;
    let inventory = emptyResources();
    const checkpointDays = new Map<number, number>();
    const stallAcc = new Map<string, LevelStall>();

    for (const cp of params.checkpoints) {
        if (squadLevel >= cp) {
            checkpointDays.set(cp, 0);
        }
    }

    while (day < params.maxDays && squadLevel < maxLevel) {
        day += 1;
        if (pendingLeagueIndex !== null) {
            leagueIndex = pendingLeagueIndex;
            pendingLeagueIndex = null;
        }

        const league = config.leagues[Math.min(leagueIndex, config.leagues.length - 1)];
        const income = computeDailyIncome(config, league, params);
        inventory = addResources(inventory, income.total);

        let progressed = true;
        while (progressed) {
            progressed = false;

            const unpaid = pendingTiers.find((tier) => !tier.paid && squadLevel >= tier.afterLevel);
            if (unpaid) {
                const dustNeed = dustCostForTierUp(unpaid.row, gacha, params.heroCount);
                const need = { ...emptyResources(), dust: dustNeed };
                if (canAfford(inventory, need)) {
                    inventory = subtractResources(inventory, need);
                    unpaid.paid = true;
                    progressed = true;
                    continue;
                }
                const nextRow = byLevel.get(squadLevel + 1);
                const surplusNeed = nextRow
                    ? addResources(need, scaleResources(levelCost(nextRow), params.heroCount))
                    : need;
                recordStall(stallAcc, squadLevel, 'dust', inventory, surplusNeed, income.total);
                break;
            }

            const nextLevel = squadLevel + 1;
            const row = byLevel.get(nextLevel);
            if (!row) {
                if (squadLevel < maxLevel) {
                    throw new Error(`LevelProgression: нет уровня ${nextLevel}`);
                }
                break;
            }
            const need = scaleResources(levelCost(row), params.heroCount);
            if (canAfford(inventory, need)) {
                inventory = subtractResources(inventory, need);
                squadLevel = nextLevel;
                progressed = true;
                for (const cp of params.checkpoints) {
                    if (squadLevel >= cp && !checkpointDays.has(cp)) {
                        checkpointDays.set(cp, day);
                    }
                }
                const unlocked = leagueIndexForLevel(params.leagueUnlockLevels, squadLevel);
                if (unlocked > leagueIndex && unlocked !== pendingLeagueIndex) {
                    pendingLeagueIndex = unlocked;
                }
                continue;
            }

            const limiting = limitingResource(inventory, need, income.total);
            recordStall(stallAcc, squadLevel, limiting, inventory, need, income.total);
            break;
        }
    }

    if (squadLevel >= maxLevel) {
        for (const cp of params.checkpoints) {
            if (cp <= maxLevel && !checkpointDays.has(cp)) {
                checkpointDays.set(cp, day);
            }
        }
    }

    if (maxLevel < Math.max(...params.checkpoints)) {
        notes.push(`LevelProgression заканчивается на ${maxLevel}, чекпоинт 240 в текущей таблице недостижим.`);
    }

    const stalls = [...stallAcc.values()].sort((a, b) => b.days - a.days);
    const league = config.leagues[Math.min(leagueIndex, config.leagues.length - 1)];

    return {
        daysRun: day,
        finalLevel: squadLevel,
        maxLevel,
        finalLeagueName: league?.name || league?.id || '—',
        inventory,
        checkpoints: params.checkpoints.map((level) => ({
            level,
            day: checkpointDays.get(level) ?? null,
        })),
        stalls,
        bottleneck: describeBottleneck(stalls, maxLevel),
        gacha,
        incomeByLeague,
        notes,
    };
}

function levelCost(row: LevelRow): Resources {
    return {
        gold: row.goldCost,
        exp: row.expCost,
        essence: row.essenceCost,
        dust: 0,
    };
}

function assignTierUps(config: GameConfig): PendingTier[] {
    const breakthroughs = config.levels
        .filter((row) => row.isBreakthrough)
        .map((row) => row.level)
        .sort((a, b) => a - b);
    const ups = config.tierUps;
    if (ups.length === 0 || breakthroughs.length === 0) {
        return [];
    }

    const pending: PendingTier[] = [];
    let i = 0;
    for (let b = 0; b < breakthroughs.length; b++) {
        const remainingBreaks = breakthroughs.length - b;
        const remainingUps = ups.length - i;
        const share = Math.ceil(remainingUps / remainingBreaks);
        const slice = ups.slice(i, i + share);
        i += share;
        for (const row of slice) {
            pending.push({ afterLevel: breakthroughs[b], row, paid: false });
        }
    }
    return pending;
}

function leagueIndexForLevel(unlocks: number[], squadLevel: number): number {
    let index = 0;
    for (let i = 0; i < unlocks.length; i++) {
        if (squadLevel >= unlocks[i]) {
            index = i;
        }
    }
    return index;
}

function limitingResource(have: Resources, need: Resources, daily: Resources): ResourceId {
    let worst: ResourceId = 'gold';
    let worstDays = -1;
    for (const id of RESOURCE_IDS) {
        const deficit = need[id] - have[id];
        if (deficit <= 1e-9) {
            continue;
        }
        const rate = daily[id];
        const days = rate > 1e-9 ? deficit / rate : Number.POSITIVE_INFINITY;
        if (days > worstDays) {
            worstDays = days;
            worst = id;
        }
    }
    return worst;
}

function recordStall(
    acc: Map<string, LevelStall>,
    squadLevel: number,
    limiting: ResourceId,
    have: Resources,
    need: Resources,
    _daily: Resources,
): void {
    const key = `${squadLevel}:${limiting}`;
    const surplus: Partial<Record<ResourceId, number>> = {};
    for (const id of RESOURCE_IDS) {
        if (id === limiting) {
            continue;
        }
        if (need[id] > 1e-9) {
            surplus[id] = have[id] / need[id] - 1;
        }
    }
    const existing = acc.get(key);
    if (existing) {
        existing.days += 1;
        return;
    }
    acc.set(key, { squadLevel, days: 1, limiting, surplus });
}

function describeBottleneck(stalls: LevelStall[], maxLevel: number): string {
    if (stalls.length === 0) {
        return `Узких мест нет — отряд дошёл до уровня ${maxLevel} без ожидания.`;
    }
    const top = stalls[0];
    const label = RESOURCE_LABELS[top.limiting];
    const surplusParts: string[] = [];
    for (const id of RESOURCE_IDS) {
        const value = top.surplus[id];
        if (value === undefined) {
            continue;
        }
        const pct = Math.round(value * 100);
        if (pct > 0) {
            surplusParts.push(`${RESOURCE_LABELS[id]} в профиците (+${pct}%)`);
        }
    }
    const extra = surplusParts.length > 0 ? ` ${surplusParts.join(', ')}.` : '';
    return `На уровне ${top.squadLevel} прогресс остановился на ${formatDays(top.days)} из-за нехватки: ${label}.${extra}`;
}

function formatDays(days: number): string {
    const n = Math.round(days);
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) {
        return `${n} день`;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return `${n} дня`;
    }
    return `${n} дней`;
}

export function simulationReportCsv(result: SimResult): string {
    const lines = ['section,key,value'];
    lines.push(`meta,daysRun,${result.daysRun}`);
    lines.push(`meta,finalLevel,${result.finalLevel}`);
    lines.push(`meta,maxLevel,${result.maxLevel}`);
    lines.push(`meta,finalLeague,${csvCell(result.finalLeagueName)}`);
    for (const cp of result.checkpoints) {
        lines.push(`checkpoint,${cp.level},${cp.day ?? ''}`);
    }
    lines.push(`bottleneck,text,${csvCell(result.bottleneck)}`);
    for (const stall of result.stalls) {
        lines.push(`stall,${stall.squadLevel}:${stall.limiting},${stall.days}`);
    }
    lines.push(`gacha,dustPerNamedShard,${result.gacha.dustPerNamedShard}`);
    lines.push(`gacha,dustPerFactionEmblem,${result.gacha.dustPerFactionEmblem}`);
    lines.push(`gacha,dustPerSquadFullAscension,${result.gacha.dustPerSquadFullAscension}`);
    for (const row of result.incomeByLeague) {
        const t = row.income.total;
        lines.push(`income,${csvCell(row.leagueName)} gold,${t.gold}`);
        lines.push(`income,${csvCell(row.leagueName)} exp,${t.exp}`);
        lines.push(`income,${csvCell(row.leagueName)} essence,${t.essence}`);
        lines.push(`income,${csvCell(row.leagueName)} dust,${t.dust}`);
    }
    return `${lines.join('\n')}\n`;
}

function csvCell(value: string): string {
    if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
