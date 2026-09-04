import { computeGachaEv, dustCostForTierUp, relevantTierUps, type GachaEv } from './gacha.js';
import { computeDailyIncome, type DailyIncomeBreakdown } from './income.js';
import type { GameConfig, LeagueRow, LevelRow, ResourceId, Resources, SimParams, TierUpRow } from './types.js';
import {
    addResources,
    canAfford,
    emptyResources,
    regenEnergyPerDay,
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
    finalRating: number;
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
    const notes = alignmentNotes(config, params, gacha);
    const maxLevel = config.levels.reduce((max, row) => Math.max(max, row.level), 1);
    const byLevel = new Map(config.levels.map((row) => [row.level, row]));
    const pendingTiers = assignTierUps(config, params);
    const incomeByLeague = config.leagues.map((league) => ({
        leagueName: league.name || league.id,
        income: computeDailyIncome(config, league, params),
    }));

    const useRating = params.leagueProgression === 'rating' && hasRatingProgression(config.leagues);

    let day = 0;
    let squadLevel = 1;
    let leagueIndex = 0;
    let pendingLeagueIndex: number | null = null;
    let rating = startingRating(config.leagues);
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
        if (!useRating && pendingLeagueIndex !== null) {
            leagueIndex = pendingLeagueIndex;
            pendingLeagueIndex = null;
        }

        if (useRating) {
            leagueIndex = leagueIndexForRating(config.leagues, rating);
        }

        const league = config.leagues[Math.min(leagueIndex, config.leagues.length - 1)];
        const income = incomeByLeague[Math.min(leagueIndex, incomeByLeague.length - 1)]?.income
            ?? computeDailyIncome(config, league, params);
        inventory = addResources(inventory, income.total);

        if (useRating && league) {
            rating = Math.max(0, rating + income.pvpWins * league.winRating + income.pvpLosses * league.lossRating);
        }

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
                if (!useRating) {
                    const unlocked = leagueIndexForLevel(params.leagueUnlockLevels, squadLevel);
                    if (unlocked > leagueIndex && unlocked !== pendingLeagueIndex) {
                        pendingLeagueIndex = unlocked;
                    }
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

    const unreachable = params.checkpoints.filter((level) => level > maxLevel);
    if (unreachable.length > 0) {
        notes.push(`LevelProgression заканчивается на ${maxLevel}, недостижимы: ${unreachable.join(', ')}.`);
    }

    const stalls = [...stallAcc.values()].sort((a, b) => b.days - a.days);
    const league = config.leagues[Math.min(leagueIndex, config.leagues.length - 1)];

    return {
        daysRun: day,
        finalLevel: squadLevel,
        maxLevel,
        finalLeagueName: league?.name || league?.id || '—',
        finalRating: rating,
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

function alignmentNotes(config: GameConfig, params: SimParams, gacha: GachaEv): string[] {
    const notes: string[] = [];
    const regen = regenEnergyPerDay(params);
    notes.push(
        `Гача как в клиенте: pity на HeroATier (S-ранг, ${(config.gacha.sRankHero * 100).toFixed(1)}%), HeroSTier → A-ранг без pity. Цена крутки ${params.dustPerPull} пыли, гарант после ${params.gachaPity} промахов (крутка ${params.gachaPity + 1}).`,
    );
    notes.push(
        `Реген энергии: +${params.energyPerTick} / ${params.energyRegenIntervalSeconds} с ≈ ${regen.toFixed(0)}/сутки при постоянной трате (клиент 300 с, серверный fallback 150 с). Энергия с рекламы и сундуков уходит в дополнительные спины.`,
    );
    notes.push(
        'PvP-сундук в таблицах ТЗ: EV = DropCount × взвешенные дропы × ChestMultiplier. В клиенте сундук выдаёт все Fixed-награды и ровно один Variable, без DropCount.',
    );
    notes.push(
        'Слот-машина в калькуляторе берётся из плоской таблицы SlotMachineBaseDrops (ТЗ). В клиенте это 3 барабана и выплата только за X3 (SlotsInitialChance / Bonus / BonusX3 / AllSymbols + SlotsGoldAndEnergyProgression).',
    );
    if (params.leagueProgression === 'rating') {
        if (hasRatingProgression(config.leagues)) {
            notes.push('Лиги считаются по боевому рейтингу (Min/Max/Win/Loss Rating), как на сервере. GoldIncomeMultiplier из таблицы всё ещё применяется к слот-дропам с IsAffectedByLeague.');
        } else {
            notes.push('В PvpLeaguesConfig нет Win/Loss Rating — лиги переключаются по уровню отряда, как в ТЗ симулятора.');
        }
    } else {
        notes.push('Лиги переключаются по уровню отряда (режим ТЗ). В живой игре лига зависит только от battle rating.');
    }
    if (!params.applyPvpLossRewards) {
        notes.push('Награды за поражение PvP не начисляются — клиент кладёт ресурсы только в BattleResultType.Win.');
    }
    const skipped = config.tierUps.length - relevantTierUps(config.tierUps, params.startingHeroTier).length;
    if (skipped > 0) {
        notes.push(`HeroTierUp: пропущены ${skipped} ступеней ниже ${params.startingHeroTier} (S-герои не платят A→S).`);
    }
    if (!Number.isFinite(gacha.dustPerNamedShard)) {
        notes.push('Не удалось посчитать EV именной копии: проверьте GachaBaseDrops.');
    }
    return notes;
}

function hasRatingProgression(leagues: LeagueRow[]): boolean {
    return leagues.some((league) => league.winRating !== 0 || league.lossRating !== 0);
}

function startingRating(leagues: LeagueRow[]): number {
    if (leagues.length === 0) {
        return 0;
    }
    return Math.max(0, leagues[0].minRating);
}

function leagueIndexForRating(leagues: LeagueRow[], rating: number): number {
    let best = 0;
    for (let i = 0; i < leagues.length; i++) {
        const league = leagues[i];
        if (rating + 1e-9 >= league.minRating) {
            best = i;
            if (league.maxRating > 0 && rating <= league.maxRating) {
                break;
            }
        }
    }
    return best;
}

function levelCost(row: LevelRow): Resources {
    return {
        gold: row.goldCost,
        exp: row.isBreakthrough ? 0 : row.expCost,
        essence: row.isBreakthrough ? row.essenceCost : 0,
        dust: 0,
    };
}

function assignTierUps(config: GameConfig, params: SimParams): PendingTier[] {
    const breakthroughs = config.levels
        .filter((row) => row.isBreakthrough)
        .map((row) => row.level)
        .sort((a, b) => a - b);
    const ups = relevantTierUps(config.tierUps, params.startingHeroTier);
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
    lines.push(`meta,finalRating,${result.finalRating}`);
    for (const cp of result.checkpoints) {
        lines.push(`checkpoint,${cp.level},${cp.day ?? ''}`);
    }
    lines.push(`bottleneck,text,${csvCell(result.bottleneck)}`);
    for (const stall of result.stalls) {
        lines.push(`stall,${stall.squadLevel}:${stall.limiting},${stall.days}`);
    }
    lines.push(`gacha,pullsToS,${result.gacha.pullsToS}`);
    lines.push(`gacha,pullsToA,${result.gacha.pullsToA}`);
    lines.push(`gacha,dustPerNamedSCopy,${result.gacha.dustPerNamedShard}`);
    lines.push(`gacha,dustPerNamedACopy,${result.gacha.dustPerNamedAShard}`);
    lines.push(`gacha,dustPerFactionEmblem,${result.gacha.dustPerFactionEmblem}`);
    lines.push(`gacha,dustPerSquadFullAscension,${result.gacha.dustPerSquadFullAscension}`);
    for (const row of result.incomeByLeague) {
        const t = row.income.total;
        lines.push(`income,${csvCell(row.leagueName)} spins,${row.income.spins}`);
        lines.push(`income,${csvCell(row.leagueName)} gold,${t.gold}`);
        lines.push(`income,${csvCell(row.leagueName)} exp,${t.exp}`);
        lines.push(`income,${csvCell(row.leagueName)} essence,${t.essence}`);
        lines.push(`income,${csvCell(row.leagueName)} dust,${t.dust}`);
    }
    for (const note of result.notes) {
        lines.push(`note,text,${csvCell(note)}`);
    }
    return `${lines.join('\n')}\n`;
}

function csvCell(value: string): string {
    if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
