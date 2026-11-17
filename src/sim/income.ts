import { normalizeItemType } from './parseGameConfig.js';
import type {
    ChestTable,
    GameConfig,
    Income,
    LeagueRow,
    RewardItem,
    SimParams,
    SlotDrop,
} from './types.js';
import { addIncome, emptyIncome, RARITY_COLUMNS, scaleIncome } from './types.js';

export interface DailyIncomeBreakdown {
    spins: number;
    regenEnergy: number;
    chestEnergy: number;
    slotEnergy: number;
    dailyEnergy: number;
    energyReturnPerSpin: number;
    pvpFights: number;
    pvpWins: number;
    pvpLosses: number;
    /** Открытых за день сундуков (слот + PvP). */
    chestsOpened: number;
    slotChests: number;
    pvpChests: number;
    fromSlots: Income;
    fromPvp: Income;
    fromSlotChests: Income;
    fromPvpChests: Income;
    fromDaily: Income;
    fromTasks: Income;
    fromCastle: Income;
    fromEvents: Income;
    fromOther: Income;
    total: Income;
}

/** Контекст пересчёта наград в ресурсы. */
export interface ItemCtx {
    league: LeagueRow;
    /** Золото умножается на GoldIncomeMultiplier лиги (так делает ResourceRewardFactory клиента). */
    goldMult: boolean;
    /** Доля полезных гербов, если награда — гербы одной фракции. */
    armsShare: number;
    /** Матожидание одного слот-сундука (для наград-сундуков: ChestT3, ChestRaid…). */
    slotChest?: Income;
}

export function armsShareFor(config: GameConfig, params: SimParams): number {
    const total = Math.max(1, config.gacha.armsFactionCount);
    return Math.min(1, Math.max(1, params.factionCount) / total);
}

export function addItem(bag: Income, item: string, amount: number, ctx: ItemCtx): void {
    if (amount === 0) {
        return;
    }
    const kind = normalizeItemType(item);
    switch (kind) {
        case 'gold':
            bag.gold += ctx.goldMult ? amount * ctx.league.goldIncomeMultiplier : amount;
            break;
        case 'exp':
        case 'essence':
        case 'dust':
        case 'amethyst':
        case 'decor':
        case 'equipment':
        case 'energy':
            bag[kind] += amount;
            break;
        case 'accountxp':
            bag.accountXp += amount;
            break;
        case 'arms':
            bag.arms += amount;
            break;
        case 'armsfaction':
            bag.arms += amount * ctx.armsShare;
            break;
        case 'chest':
            if (ctx.slotChest) {
                const add = scaleIncome(ctx.slotChest, amount);
                const target = bag;
                Object.assign(target, addIncome(target, add));
            }
            break;
        default:
            break;
    }
}

function addItems(bag: Income, items: RewardItem[], factor: number, ctx: ItemCtx): void {
    for (const reward of items) {
        addItem(bag, reward.item, reward.amount * factor, ctx);
    }
}

/** Матожидание одного сундука: редкость по ChestRarityRoll источника, затем по слотам (в каждом слоте один вариант). */
export function chestEv(table: ChestTable, roll: Record<string, number> | undefined, ctx: ItemCtx): Income {
    const bag = emptyIncome();
    const rarities = RARITY_COLUMNS.filter((r) => table[r] !== undefined);
    if (rarities.length === 0) {
        return bag;
    }
    const weights = new Map<string, number>();
    let sum = 0;
    for (const rarity of rarities) {
        const w = roll ? (roll[rarity] ?? 0) : 1;
        weights.set(rarity, w);
        sum += w;
    }
    if (sum <= 0) {
        for (const rarity of rarities) {
            weights.set(rarity, 1);
        }
        sum = rarities.length;
    }
    for (const rarity of rarities) {
        const w = (weights.get(rarity) ?? 0) / sum;
        if (w <= 0) {
            continue;
        }
        for (const slot of table[rarity]) {
            for (const entry of slot) {
                if (entry.item.toLowerCase() === 'empty') {
                    continue;
                }
                addItem(bag, entry.item, w * entry.probability * entry.value, ctx);
            }
        }
    }
    return bag;
}

export function energyPerSpinFromSlots(slotDrops: SlotDrop[]): number {
    const total = slotDrops.reduce((acc, d) => acc + d.probability, 0) || 1;
    let energy = 0;
    for (const drop of slotDrops) {
        if (normalizeItemType(drop.itemType) === 'energy') {
            energy += (drop.probability / total) * drop.value;
        }
    }
    return energy;
}

function slotProbabilityOf(drops: SlotDrop[], kind: string): number {
    const total = drops.reduce((acc, d) => acc + d.probability, 0) || 1;
    let chance = 0;
    for (const drop of drops) {
        if (normalizeItemType(drop.itemType) === kind) {
            chance += (drop.probability / total) * Math.max(drop.value, 1);
        }
    }
    return chance;
}

export function computeDailyIncome(
    config: GameConfig,
    league: LeagueRow,
    params: SimParams,
): DailyIncomeBreakdown {
    const armsShare = armsShareFor(config, params);
    const baseCtx: ItemCtx = { league, goldMult: true, armsShare };
    const slotChestEv = chestEv(config.chests.slot, config.chests.rarityRoll.slot, baseCtx);
    const pvpChestEv = chestEv(config.chests.pvp, config.chests.rarityRoll.pvp, baseCtx);
    const ctx: ItemCtx = { ...baseCtx, slotChest: slotChestEv };
    const noMultCtx: ItemCtx = { ...ctx, goldMult: false };

    // --- слот-машина: платит только X3, символ выбирается по весам дропа
    const pX3 = config.slotSpin.x3;
    const dropTotal = config.slotDrops.reduce((acc, d) => acc + d.probability, 0) || 1;
    const perSpinSlots = emptyIncome();
    let slotChestsPerSpin = 0;
    for (const drop of config.slotDrops) {
        const kind = normalizeItemType(drop.itemType);
        const weight = (drop.probability / dropTotal) * pX3;
        if (kind === 'chest') {
            slotChestsPerSpin += weight * Math.max(drop.value, 1);
        } else {
            addItem(perSpinSlots, drop.itemType, weight * drop.value, ctx);
        }
    }
    const pvpFightsPerSpin = slotProbabilityOf(config.slotDrops, 'pvp') * pX3;

    const opensChest = pvpOpensChest(config, league);
    const pvpChestPerWin = opensChest ? 1 : 0;

    // --- доход, не зависящий от спинов
    const fromDaily = dailyRewardsIncome(config, params, ctx);
    const fromTasks = tasksIncome(config, params, ctx);
    const fromCastle = castleIncome(config, params, noMultCtx);
    const fromManual = manualIncome(config, params, league);
    const fromOther: Income = { ...params.otherDaily };
    const constantIncome = [fromDaily, fromTasks, fromCastle, fromManual, fromOther].reduce(addIncome, emptyIncome());

    const cost = Math.max(1e-9, params.spinEnergyCost);
    const slotEnergyPerSpin = perSpinSlots.energy;
    const energyReturnPerSpin = slotEnergyPerSpin
        + slotChestsPerSpin * slotChestEv.energy
        + pvpFightsPerSpin * params.winRate * pvpChestPerWin * pvpChestEv.energy;
    const denom = cost - energyReturnPerSpin;
    const constantEnergy = params.energyPerDay + constantIncome.energy;
    const spins = denom > 1e-9 ? constantEnergy / denom : constantEnergy / cost;

    const fromSlots = scaleIncome(perSpinSlots, spins);
    const slotChests = spins * slotChestsPerSpin;
    const fromSlotChests = scaleIncome(slotChestEv, slotChests);

    const pvpFights = spins * pvpFightsPerSpin;
    const pvpWins = pvpFights * params.winRate;
    const pvpLosses = pvpFights * (1 - params.winRate);
    const fromPvp = emptyIncome();
    const winReward = pvpMatchReward(config, league, 'Win');
    const lossReward = pvpMatchReward(config, league, 'Loss');
    Object.assign(fromPvp, addIncome(scaleIncome(winReward, pvpWins), scaleIncome(lossReward, pvpLosses)));
    const pvpChests = pvpWins * pvpChestPerWin;
    const fromPvpChests = scaleIncome(pvpChestEv, pvpChests);

    const chestsOpened = slotChests + pvpChests;
    const fromEvents = eventsIncome(config, params, noMultCtx, {
        SlotMachineSpins: spins,
        ChestOpenings: chestsOpened,
        AttackingPvpWins: pvpWins,
    });

    // XP аккаунта за действия
    const xp = config.accountXp;
    const actionXp = emptyIncome();
    actionXp.accountXp = spins * xp.xpSpin + pvpWins * xp.xpBattleWin + xp.xpDailyAll;

    const total = [
        fromSlots, fromPvp, fromSlotChests, fromPvpChests, fromEvents, actionXp, constantIncome,
    ].reduce(addIncome, emptyIncome());
    total.energy = 0;

    return {
        spins,
        regenEnergy: params.energyPerDay,
        chestEnergy: slotChests * slotChestEv.energy + pvpChests * pvpChestEv.energy,
        slotEnergy: spins * slotEnergyPerSpin,
        dailyEnergy: constantIncome.energy,
        energyReturnPerSpin,
        pvpFights,
        pvpWins,
        pvpLosses,
        chestsOpened,
        slotChests,
        pvpChests,
        fromSlots,
        fromPvp,
        fromSlotChests,
        fromPvpChests,
        fromDaily,
        fromTasks,
        fromCastle,
        fromEvents,
        fromOther: addIncome(fromManual, fromOther),
        total,
    };
}

function pvpMatchReward(config: GameConfig, league: LeagueRow, result: 'Win' | 'Loss'): Income {
    const exact = config.pvpRewards.find((row) => row.leagueId === league.id && row.result === result);
    const fallback = config.pvpRewards.find((row) => row.result === result);
    const row = exact ?? fallback;
    const out = emptyIncome();
    if (!row) {
        return out;
    }
    // Клиент: золото — через ResourceRewardFactory (× GoldIncomeMultiplier),
    // опыт героев — UnitsExperienceHandler (× ExpIncomeMultiplier). Пыль и эссенция — как в таблице.
    out.gold = row.gold * league.goldIncomeMultiplier;
    out.exp = row.exp * league.expIncomeMultiplier;
    out.essence = row.essence;
    out.dust = row.dust;
    return out;
}

function pvpOpensChest(config: GameConfig, league: LeagueRow): boolean {
    const exact = config.pvpRewards.find((row) => row.leagueId === league.id && row.result === 'Win');
    const fallback = config.pvpRewards.find((row) => row.result === 'Win');
    return (exact ?? fallback)?.opensChest ?? true;
}

function dailyRewardsIncome(config: GameConfig, params: SimParams, ctx: ItemCtx): Income {
    const out = emptyIncome();
    const daily = config.dailyRewards;
    if (daily.days.length === 0) {
        return out;
    }
    const perDay = 1 / daily.cycleDays;
    for (const day of daily.days) {
        addItems(out, day.free, perDay, ctx);
        if (params.premiumDaily > 0) {
            addItems(out, day.premium, perDay, ctx);
        }
    }
    for (const bonus of daily.weekly) {
        addItems(out, bonus.items, perDay, ctx);
    }
    return out;
}

function tasksIncome(config: GameConfig, params: SimParams, ctx: ItemCtx): Income {
    const out = emptyIncome();
    const pct = Math.max(0, params.taskCompletionPct) / 100;
    for (const task of config.tasks) {
        const type = task.type.toLowerCase();
        if (type === 'daily') {
            addItem(out, task.reward.item, task.reward.amount * pct, ctx);
        } else if (type === 'weekly') {
            addItem(out, task.reward.item, (task.reward.amount * pct) / 7, ctx);
        }
    }
    return out;
}

function castleIncome(config: GameConfig, params: SimParams, ctx: ItemCtx): Income {
    const out = emptyIncome();
    if (config.castle.length === 0 || params.castlesActive <= 0) {
        return out;
    }
    const castles: string[] = [];
    for (const row of config.castle) {
        if (!castles.includes(row.castleId)) {
            castles.push(row.castleId);
        }
    }
    const active = castles.slice(0, Math.max(0, Math.round(params.castlesActive)));
    for (const castle of active) {
        const rows = config.castle
            .filter((row) => row.castleId === castle && row.level <= params.castleLevel)
            .sort((a, b) => b.level - a.level);
        const row = rows[0] ?? config.castle.find((r) => r.castleId === castle);
        if (row) {
            addItems(out, row.items, Math.max(0, params.castleCollectsPerDay), ctx);
        }
    }
    return out;
}

function manualIncome(config: GameConfig, params: SimParams, league: LeagueRow): Income {
    const out = emptyIncome();
    if (params.useManualDailyIncome <= 0 || !config.manualDailyIncome) {
        return out;
    }
    const { unscaled, scaled } = config.manualDailyIncome;
    Object.assign(out, addIncome(unscaled, {
        ...scaled,
        gold: scaled.gold * league.goldIncomeMultiplier,
        exp: scaled.exp * league.expIncomeMultiplier,
    }));
    return out;
}

/**
 * Мини-ивенты идут друг за другом (цикл = сумма длительностей).
 * Этап награды берётся, если активность за ивент (в день × длительность) достигает MinScore.
 */
function eventsIncome(
    config: GameConfig,
    params: SimParams,
    ctx: ItemCtx,
    activityPerDay: Record<string, number>,
): Income {
    const out = emptyIncome();
    if (params.miniEventsOn <= 0 || config.miniEvents.length === 0) {
        return out;
    }
    const durations = config.miniEvents.map((event) => (event.defaultDays === 3 ? 3 : Math.max(1, params.miniEventDays)));
    const cycle = durations.reduce((a, b) => a + b, 0);
    config.miniEvents.forEach((event, index) => {
        for (const milestone of event.milestones) {
            if (milestone.rankFrom !== undefined && milestone.rankTo !== undefined) {
                const rank = params.miniEventRank;
                if (rank > 0 && rank >= milestone.rankFrom && rank <= milestone.rankTo) {
                    addItems(out, milestone.items, 1 / cycle, ctx);
                }
                continue;
            }
            const perDay = activityPerDay[milestone.condition];
            if (perDay !== undefined && perDay * durations[index] + 1e-9 >= milestone.minScore) {
                addItems(out, milestone.items, 1 / cycle, ctx);
            }
        }
    });
    return out;
}
