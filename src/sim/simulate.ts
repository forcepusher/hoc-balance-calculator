import { computeGachaEv, pullsForTierUp, type GachaEv } from './gacha.js';
import { addItem, armsShareFor, computeDailyIncome, type DailyIncomeBreakdown } from './income.js';
import type { GameConfig, LeagueRow, LevelRow, ResourceId, Resources, SimParams, TierUpRow } from './types.js';
import {
    addResources,
    ALL_RESOURCE_IDS,
    canAfford,
    emptyIncome,
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

export interface LeagueTime {
    leagueName: string;
    days: number;
}

export interface EquipmentSummary {
    pieces: number;
    goldTotal: number;
    shardsTotal: number;
}

export interface SimResult {
    daysRun: number;
    finalLevel: number;
    maxLevel: number;
    finalLeagueName: string;
    finalRating: number;
    accountLevel: number;
    inventory: Resources;
    checkpoints: CheckpointResult[];
    stalls: LevelStall[];
    bottleneck: string;
    gacha: GachaEv;
    incomeByLeague: Array<{ leagueName: string; income: DailyIncomeBreakdown }>;
    daysInLeagues: LeagueTime[];
    equipment: EquipmentSummary | null;
    notes: string[];
}

interface PendingTier {
    afterLevel: number;
    row: TierUpRow;
    paid: boolean;
}

/** Всё изменяемое состояние одного прогона. */
interface SimState {
    inventory: Resources;
    /** Накопленные побочные именные осколки гачи (на каждого героя поровну). */
    shardStock: number;
    squadLevel: number;
    accountXp: number;
    accountLevel: number;
    accountThreshold: number;
}

export function runSimulation(config: GameConfig, params: SimParams): SimResult {
    const gacha = computeGachaEv(config.gacha, config.tierUps, params);
    const notes: string[] = [...config.notes];
    const maxLevel = config.levels.reduce((max, row) => Math.max(max, row.level), 1);
    const byLevel = new Map(config.levels.map((row) => [row.level, row]));
    const pendingTiers = assignTierUps(config);
    const incomeByLeague = config.leagues.map((league) => ({
        leagueName: league.name || league.id,
        income: computeDailyIncome(config, league, params),
    }));

    const equipment = equipmentPlan(config, params, notes);
    const equipmentGoldPerStep = equipment ? equipment.goldTotal / Math.max(1, maxLevel - 1) : 0;

    let day = 0;
    let leagueIndex = clampLeagueIndex(params.startLeagueIndex, config.leagues.length);
    let pendingLeagueIndex: number | null = null;
    let rating = Math.max(0, params.startRating);
    const xpCfg = config.accountXp;
    const state: SimState = {
        inventory: emptyResources(),
        shardStock: 0,
        squadLevel: 1,
        accountXp: 0,
        accountLevel: 1,
        accountThreshold: accountTarget(xpCfg.base, xpCfg.growth, 1),
    };
    const checkpointDays = new Map<number, number>();
    const stallAcc = new Map<string, LevelStall>();
    const daysInLeague = config.leagues.map(() => 0);

    for (const cp of params.checkpoints) {
        if (state.squadLevel >= cp) {
            checkpointDays.set(cp, 0);
        }
    }

    while (day < params.maxDays && state.squadLevel < maxLevel) {
        day += 1;
        if (pendingLeagueIndex !== null) {
            leagueIndex = pendingLeagueIndex;
            pendingLeagueIndex = null;
        }

        daysInLeague[leagueIndex] = (daysInLeague[leagueIndex] ?? 0) + 1;

        const income = incomeByLeague[Math.min(leagueIndex, incomeByLeague.length - 1)]?.income
            ?? computeDailyIncome(config, config.leagues[leagueIndex], params);
        state.inventory = addResources(state.inventory, income.total);
        addAccountXp(state, config, income.total.accountXp, config.leagues[leagueIndex], params);

        const league = config.leagues[leagueIndex];
        rating = Math.max(0, rating + income.pvpWins * (league?.winRating ?? 0) + income.pvpLosses * (league?.lossRating ?? 0));

        spendDay({
            pendingTiers,
            byLevel,
            state,
            daily: income.total,
            params,
            config,
            gacha,
            equipmentGoldPerStep,
            stallAcc,
            onLevel: (next) => {
                for (const cp of params.checkpoints) {
                    if (next >= cp && !checkpointDays.has(cp)) {
                        checkpointDays.set(cp, day);
                    }
                }
            },
            league,
        });

        let nextLeagueIndex = leagueIndexForRating(config.leagues, rating);
        if (params.weeklyResetEveryDays > 0 && day % params.weeklyResetEveryDays === 0) {
            // Сервер (SeasonsLeaderboardService): рейтинг = min(текущий, ResetRating лиги), лига — по рейтингу;
            // клиент выдаёт награду ResetRewardAmethysts за лигу, в которой закончился сезон.
            const ended = config.leagues[leagueIndexForRating(config.leagues, rating)];
            state.inventory.amethyst += ended?.resetRewardAmethysts ?? 0;
            rating = Math.max(0, Math.min(rating, ended?.resetRating ?? rating));
            nextLeagueIndex = leagueIndexForRating(config.leagues, rating);
        }
        if (nextLeagueIndex !== leagueIndex) {
            pendingLeagueIndex = nextLeagueIndex;
        }
    }

    if (state.squadLevel >= maxLevel) {
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
    if (config.gacha.overflow.length > 0) {
        notes.push('HeroOverflowCap загружен, но избыток осколков → аметисты в симуляции не считается (нет данных о составе пула героев).');
    }

    const stalls = [...stallAcc.values()].sort((a, b) => b.days - a.days);
    const finalLeague = config.leagues[Math.min(leagueIndex, config.leagues.length - 1)];

    return {
        daysRun: day,
        finalLevel: state.squadLevel,
        maxLevel,
        finalLeagueName: finalLeague?.name || finalLeague?.id || '—',
        finalRating: rating,
        accountLevel: state.accountLevel,
        inventory: state.inventory,
        checkpoints: params.checkpoints.map((level) => ({
            level,
            day: checkpointDays.get(level) ?? null,
        })),
        stalls,
        bottleneck: describeBottleneck(stalls, maxLevel),
        gacha,
        incomeByLeague,
        daysInLeagues: config.leagues.map((row, index) => ({
            leagueName: row.name || row.id,
            days: daysInLeague[index] ?? 0,
        })),
        equipment,
        notes,
    };
}

/** Опыт аккаунта для перехода с уровня `level` на следующий (UserRegularLevelProgress: base × level^growth). */
function accountTarget(base: number, growth: number, level: number): number {
    return Math.max(1, Math.floor(base * level ** growth));
}

function addAccountXp(state: SimState, config: GameConfig, xp: number, league: LeagueRow, params: SimParams): void {
    if (xp <= 0) {
        return;
    }
    state.accountXp += xp;
    const cfg = config.accountXp;
    const ctx = { league, goldMult: false, armsShare: armsShareFor(config, params) };
    let guard = 0;
    while (state.accountXp >= state.accountThreshold && guard < 10000) {
        guard += 1;
        state.accountLevel += 1;
        state.accountThreshold += accountTarget(cfg.base, cfg.growth, state.accountLevel);
        const bag = emptyIncome();
        for (const reward of config.levelRewards) {
            addItem(bag, reward.item, reward.amount, ctx);
        }
        state.inventory = addResources(state.inventory, bag);
    }
}

interface SpendInput {
    pendingTiers: PendingTier[];
    byLevel: Map<number, LevelRow>;
    state: SimState;
    daily: Resources;
    params: SimParams;
    config: GameConfig;
    gacha: GachaEv;
    equipmentGoldPerStep: number;
    stallAcc: Map<string, LevelStall>;
    onLevel: (level: number) => void;
    league: LeagueRow;
}

function spendDay(input: SpendInput): void {
    const { pendingTiers, byLevel, state, daily, params, config, gacha, equipmentGoldPerStep, stallAcc, onLevel, league } = input;
    const maxLevel = [...byLevel.keys()].reduce((max, level) => Math.max(max, level), 1);
    const xpUpgrade = config.accountXp.xpUpgrade;

    let progressed = true;
    while (progressed) {
        progressed = false;

        const unpaid = pendingTiers.find((tier) => !tier.paid && state.squadLevel >= tier.afterLevel);
        if (unpaid) {
            const pulls = pullsForTierUp(unpaid.row, gacha, params.heroCount, state.shardStock, state.inventory.arms);
            const dustNeed = Number.isFinite(pulls) ? pulls * params.dustPerPull : Number.POSITIVE_INFINITY;
            if (state.inventory.dust + 1e-9 >= dustNeed) {
                // Побочные выпадения круток (опыт, лишние осколки и гербы) остаются игроку.
                state.inventory.dust -= dustNeed;
                state.inventory.exp += pulls * gacha.expPerPull;
                state.shardStock += pulls * gacha.shardsPerPull - params.heroCount * unpaid.row.shards;
                state.inventory.arms += pulls * gacha.armsPerPull - params.heroCount * unpaid.row.arms;
                unpaid.paid = true;
                progressed = true;
                continue;
            }
            const nextRow = byLevel.get(state.squadLevel + 1);
            const need = { ...emptyResources(), dust: Number.isFinite(dustNeed) ? dustNeed : 1e15 };
            const surplusNeed = nextRow
                ? addResources(need, levelNeed(nextRow, params, equipmentGoldPerStep))
                : need;
            recordStall(stallAcc, state.squadLevel, 'dust', state.inventory, surplusNeed);
            break;
        }

        const nextLevel = state.squadLevel + 1;
        const row = byLevel.get(nextLevel);
        if (!row) {
            if (state.squadLevel < maxLevel) {
                throw new Error(`LevelProgression: нет уровня ${nextLevel}`);
            }
            break;
        }
        const need = levelNeed(row, params, equipmentGoldPerStep);
        if (canAfford(state.inventory, need)) {
            state.inventory = subtractResources(state.inventory, need);
            state.squadLevel = nextLevel;
            if (xpUpgrade > 0) {
                addAccountXp(state, config, xpUpgrade * params.heroCount, league, params);
            }
            onLevel(state.squadLevel);
            progressed = true;
            continue;
        }

        const limiting = limitingResource(state.inventory, need, daily);
        recordStall(stallAcc, state.squadLevel, limiting, state.inventory, need);
        break;
    }
}

function levelNeed(row: LevelRow, params: SimParams, equipmentGoldPerStep: number): Resources {
    const need = scaleResources(levelCost(row), params.heroCount);
    need.gold += equipmentGoldPerStep;
    return need;
}

export function leagueIndexForRating(leagues: LeagueRow[], rating: number): number {
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

function clampLeagueIndex(index: number, count: number): number {
    if (count <= 0) {
        return 0;
    }
    return Math.min(count - 1, Math.max(0, Math.floor(index)));
}

function levelCost(row: LevelRow): Resources {
    return {
        ...emptyResources(),
        gold: row.goldCost,
        exp: row.isBreakthrough ? 0 : row.expCost,
        essence: row.isBreakthrough ? row.essenceCost : 0,
    };
}

/** Экипировка: ковка + улучшения до целевого уровня (с учётом шанса успеха), золото размазано по уровням отряда. */
function equipmentPlan(config: GameConfig, params: SimParams, notes: string[]): EquipmentSummary | null {
    if (params.equipmentTargetLevel <= 0) {
        if (config.equipment) {
            notes.push('Таблицы экипировки загружены, но «Целевой уровень экипировки» = 0 — сток золота выключен.');
        }
        return null;
    }
    if (!config.equipment) {
        notes.push('Задан целевой уровень экипировки, но таблицы EquipmentForgeConfig/EquipmentUpgradeConfig не загружены (в проде их пока нет) — сток не считается.');
        return null;
    }
    const pieces = params.heroCount * Math.max(0, params.equipmentPiecesPerHero);
    const forgeAll = config.equipment.forge;
    const rarityForge = forgeAll.filter((r) => r.rarity.toLowerCase() === params.equipmentRarity.toLowerCase());
    const forge = rarityForge.length > 0 ? rarityForge : forgeAll;
    const forgeGold = forge.length > 0 ? forge.reduce((a, r) => a + r.goldCost, 0) / forge.length : 0;
    const forgeShards = forge.length > 0 ? forge.reduce((a, r) => a + r.shardCost, 0) / forge.length : 0;
    let upGold = 0;
    let upShards = 0;
    for (const row of config.equipment.upgrades) {
        if (row.rarity.toLowerCase() === params.equipmentRarity.toLowerCase()
            && row.level >= 1 && row.level <= params.equipmentTargetLevel) {
            const success = row.successProbability > 0 ? Math.min(1, row.successProbability) : 1;
            upGold += row.goldCost / success;
            upShards += row.shardCost / success;
        }
    }
    const goldTotal = pieces * (forgeGold + upGold);
    const shardsTotal = pieces * (forgeShards + upShards);
    if (shardsTotal > 0) {
        notes.push(`Экипировка требует ещё ${Math.round(shardsTotal).toLocaleString('ru-RU')} осколков кузни — источник осколков в таблицах не описан, в симуляции они считаются доступными.`);
    }
    return { pieces, goldTotal, shardsTotal };
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
    lines.push(`meta,accountLevel,${result.accountLevel}`);
    for (const cp of result.checkpoints) {
        lines.push(`checkpoint,${cp.level},${cp.day ?? ''}`);
    }
    lines.push(`bottleneck,text,${csvCell(result.bottleneck)}`);
    for (const stall of result.stalls) {
        lines.push(`stall,${stall.squadLevel}:${stall.limiting},${stall.days}`);
    }
    for (const row of result.daysInLeagues) {
        lines.push(`leagueDays,${csvCell(row.leagueName)},${row.days}`);
    }
    lines.push(`gacha,dustPerNamedShard,${result.gacha.dustPerNamedShard}`);
    lines.push(`gacha,dustPerFactionEmblem,${result.gacha.dustPerFactionEmblem}`);
    lines.push(`gacha,dustPerSquadFullAscension,${result.gacha.dustPerSquadFullAscension}`);
    for (const row of result.incomeByLeague) {
        const t = row.income.total;
        lines.push(`income,${csvCell(row.leagueName)} spins,${row.income.spins}`);
        for (const id of ALL_RESOURCE_IDS) {
            lines.push(`income,${csvCell(row.leagueName)} ${id},${t[id]}`);
        }
    }
    for (const id of ALL_RESOURCE_IDS) {
        lines.push(`inventory,${id},${result.inventory[id]}`);
    }
    return `${lines.join('\n')}\n`;
}

function csvCell(value: string): string {
    if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
