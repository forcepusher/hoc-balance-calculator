import { normalizeItemType } from './parseGameConfig.js';
import type {
    ChestRewardRow,
    ChestTables,
    GameConfig,
    LeagueRow,
    Resources,
    SimParams,
    SlotDrop,
} from './types.js';
import { addResources, emptyResources, scaleResources } from './types.js';

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
    chestsOpened: number;
    fromSlots: Resources;
    fromPvp: Resources;
    fromChests: Resources;
    fromDaily: Resources;
    fromOther: Resources;
    total: Resources;
}

export function energyPerSpinFromSlots(slotDrops: SlotDrop[]): number {
    let energy = 0;
    for (const drop of slotDrops) {
        if (normalizeItemType(drop.itemType) === 'energy') {
            energy += drop.probability * drop.value;
        }
    }
    return energy;
}

export function computeDailyIncome(
    config: GameConfig,
    league: LeagueRow,
    params: SimParams,
): DailyIncomeBreakdown {
    const cost = Math.max(1e-9, params.spinEnergyCost);
    const slotEnergyPerSpin = energyPerSpinFromSlots(config.slotDrops);
    const pvpChance = pvpHitChance(config.slotDrops);
    const chestEnergyEach = expectedChestEnergy(config.chests, league);
    const dailyEnergy = config.dailyIncome.unscaledEnergy
        + config.dailyIncome.scaledEnergy * league.goldIncomeMultiplier
        + params.otherDaily.energy;
    const energyPerWinChest = chestEnergyEach;
    const energyReturnPerSpin = slotEnergyPerSpin + pvpChance * params.winRate * energyPerWinChest;
    const denom = cost - energyReturnPerSpin;
    const constantEnergy = params.energyPerDay + dailyEnergy;
    const spins = denom > 1e-9 ? constantEnergy / denom : constantEnergy / cost;

    const fromSlots = slotIncome(config.slotDrops, spins, league);
    const pvpFights = spins * pvpChance;
    const pvpWins = pvpFights * params.winRate;
    const pvpLosses = pvpFights * (1 - params.winRate);
    const fromPvp = addScaled(
        pvpMatchReward(config, league, 'Win'),
        pvpWins,
        pvpMatchReward(config, league, 'Loss'),
        pvpLosses,
    );

    const chestsOpened = pvpWins * (pvpOpensChest(config, league) ? 1 : 0);
    const fromChests = scaleResources(expectedChestResources(config.chests, league), chestsOpened);
    const fromDaily = addResources(
        config.dailyIncome.unscaled,
        scaleLeagueResources(config.dailyIncome.scaled, league),
    );
    const fromOther: Resources = {
        gold: params.otherDaily.gold,
        exp: params.otherDaily.exp,
        essence: params.otherDaily.essence,
        dust: params.otherDaily.dust,
    };

    const total = sumRes(fromSlots, fromPvp, fromChests, fromDaily, fromOther);
    return {
        spins,
        regenEnergy: params.energyPerDay,
        chestEnergy: chestsOpened * chestEnergyEach,
        slotEnergy: spins * slotEnergyPerSpin,
        dailyEnergy,
        energyReturnPerSpin,
        pvpFights,
        pvpWins,
        pvpLosses,
        chestsOpened,
        fromSlots,
        fromPvp,
        fromChests,
        fromDaily,
        fromOther,
        total,
    };
}

function slotIncome(drops: SlotDrop[], spins: number, league: LeagueRow): Resources {
    const out = emptyResources();
    for (const drop of drops) {
        const amount = spins * drop.probability * drop.value;
        addCoreItem(out, drop.itemType, amount, league, true);
    }
    return out;
}

function pvpHitChance(drops: SlotDrop[]): number {
    let chance = 0;
    for (const drop of drops) {
        if (normalizeItemType(drop.itemType) === 'pvp') {
            chance += drop.probability * Math.max(drop.value, 1);
        }
    }
    return chance;
}

function pvpMatchReward(config: GameConfig, league: LeagueRow, result: 'Win' | 'Loss'): Resources {
    const exact = config.pvpRewards.find((row) => row.leagueId === league.id && row.result === result);
    const fallback = config.pvpRewards.find((row) => row.result === result);
    const row = exact ?? fallback;
    if (!row) {
        return emptyResources();
    }
    return {
        gold: row.gold,
        exp: row.exp,
        essence: row.essence,
        dust: row.dust,
    };
}

function pvpOpensChest(config: GameConfig, league: LeagueRow): boolean {
    const exact = config.pvpRewards.find((row) => row.leagueId === league.id && row.result === 'Win');
    const fallback = config.pvpRewards.find((row) => row.result === 'Win');
    return (exact ?? fallback)?.opensChest ?? true;
}

export function amountAtRarity(row: ChestRewardRow, rarity: string): number {
    const exact = row.amountsByRarity[rarity];
    if (exact !== undefined) {
        return exact;
    }
    const common = row.amountsByRarity.Common;
    if (common !== undefined) {
        return common;
    }
    const values = Object.values(row.amountsByRarity);
    return values.length > 0 ? values[0] : 0;
}

function expectedChestResources(chests: ChestTables, league: LeagueRow): Resources {
    const rarity = league.slotMachineRarity || 'Common';
    const out = emptyResources();
    for (const row of chests.fixed) {
        addCoreItem(out, row.itemType, amountAtRarity(row, rarity), league, false);
    }
    const weightSum = chests.random.reduce((sum, row) => sum + row.probability, 0);
    for (const row of chests.random) {
        const p = weightSum > 0 ? row.probability / weightSum : row.probability;
        addCoreItem(out, row.itemType, p * amountAtRarity(row, rarity), league, false);
    }
    return out;
}

function expectedChestEnergy(chests: ChestTables, league: LeagueRow): number {
    const rarity = league.slotMachineRarity || 'Common';
    let energy = 0;
    for (const row of chests.fixed) {
        if (normalizeItemType(row.itemType) === 'energy') {
            energy += amountAtRarity(row, rarity);
        }
    }
    const weightSum = chests.random.reduce((sum, row) => sum + row.probability, 0);
    for (const row of chests.random) {
        if (normalizeItemType(row.itemType) !== 'energy') {
            continue;
        }
        const p = weightSum > 0 ? row.probability / weightSum : row.probability;
        energy += p * amountAtRarity(row, rarity);
    }
    return energy;
}

function addCoreItem(
    out: Resources,
    itemType: string,
    amount: number,
    league: LeagueRow,
    applySlotLeagueMult: boolean,
): void {
    const kind = normalizeItemType(itemType);
    if (kind === 'gold') {
        out.gold += applySlotLeagueMult ? amount * league.goldIncomeMultiplier : amount;
    } else if (kind === 'exp') {
        out.exp += applySlotLeagueMult ? amount * league.expIncomeMultiplier : amount;
    } else if (kind === 'dust') {
        out.dust += amount;
    } else if (kind === 'essence') {
        out.essence += amount;
    }
}

function scaleLeagueResources(res: Resources, league: LeagueRow): Resources {
    return {
        gold: res.gold * league.goldIncomeMultiplier,
        exp: res.exp * league.expIncomeMultiplier,
        essence: res.essence,
        dust: res.dust,
    };
}

function sumRes(...parts: Resources[]): Resources {
    const out = emptyResources();
    for (const part of parts) {
        out.gold += part.gold;
        out.exp += part.exp;
        out.essence += part.essence;
        out.dust += part.dust;
    }
    return out;
}

function addScaled(a: Resources, fa: number, b: Resources, fb: number): Resources {
    return {
        gold: a.gold * fa + b.gold * fb,
        exp: a.exp * fa + b.exp * fb,
        essence: a.essence * fa + b.essence * fb,
        dust: a.dust * fa + b.dust * fb,
    };
}
