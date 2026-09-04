import type {
    AdConfig,
    ChestConfig,
    GameConfig,
    LeagueRow,
    Resources,
    SimParams,
    SlotDrop,
    WeightedDrop,
} from './types.js';
import { emptyResources, regenEnergyPerDay } from './types.js';

export interface DailyIncomeBreakdown {
    spins: number;
    regenEnergy: number;
    adEnergy: number;
    chestEnergy: number;
    slotEnergy: number;
    energyReturnPerSpin: number;
    pvpFights: number;
    pvpWins: number;
    pvpLosses: number;
    chestsOpened: number;
    fromSlots: Resources;
    fromPvp: Resources;
    fromChests: Resources;
    fromAds: Resources;
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
    const regenEnergy = regenEnergyPerDay(params);
    const cost = Math.max(1e-9, params.spinEnergyCost);
    const adEnergyEach = expectedWeightedEnergy(config.ads.drops, league, 'ad', config.ads.leagueMultiplier.get(league.id) ?? 1, true);
    const adChestsEach = expectedWeightedKind(config.ads.drops, 'chest');
    const chestEnergyEach = expectedChestEnergy(config.chest, league);
    const chestResEach = expectedChestResources(config.chest, league);

    const adEnergy = params.adsPerDay * adEnergyEach;
    const adChests = params.adsPerDay * adChestsEach;
    const slotEnergyPerSpin = energyPerSpinFromSlots(config.slotDrops);
    const pvpChance = pvpHitChance(config.slotDrops);
    const slotChestChance = chestHitChance(config.slotDrops);
    const pvpChestPerSpin = pvpChance * params.winRate * (pvpOpensChest(config, league) ? 1 : 0);
    const chestsPerSpin = slotChestChance + pvpChestPerSpin;

    const energyPerSpinReturned = slotEnergyPerSpin + chestsPerSpin * chestEnergyEach;
    const denom = cost - energyPerSpinReturned;
    const constantEnergy = regenEnergy + adEnergy + adChests * chestEnergyEach;
    const spins = denom > 1e-9 ? constantEnergy / denom : constantEnergy / cost;

    const fromSlots = slotIncome(config.slotDrops, spins, league);
    const pvpFights = spins * pvpChance;
    const pvpWins = pvpFights * params.winRate;
    const pvpLosses = pvpFights * (1 - params.winRate);
    const fromPvp = addScaled(
        pvpMatchReward(config, league, 'Win'),
        pvpWins,
        params.applyPvpLossRewards ? pvpMatchReward(config, league, 'Loss') : emptyResources(),
        pvpLosses,
    );

    const slotAndPvpChests = spins * chestsPerSpin;
    const chestsOpened = slotAndPvpChests + adChests;
    const fromChests = scaleRes(chestResEach, chestsOpened);
    const fromAds = scaleRes(expectedAdResources(config.ads, league), params.adsPerDay);

    const total = sumRes(fromSlots, fromPvp, fromChests, fromAds);
    return {
        spins,
        regenEnergy,
        adEnergy,
        chestEnergy: chestsOpened * chestEnergyEach,
        slotEnergy: spins * slotEnergyPerSpin,
        energyReturnPerSpin: energyPerSpinReturned,
        pvpFights,
        pvpWins,
        pvpLosses,
        chestsOpened,
        fromSlots,
        fromPvp,
        fromChests,
        fromAds,
        total,
    };
}

function slotIncome(drops: SlotDrop[], spins: number, league: LeagueRow): Resources {
    const out = emptyResources();
    for (const drop of drops) {
        const amount = spins * drop.probability * drop.value;
        addItem(out, drop.itemType, amount, drop.affectedByLeague, league, 'goldExp');
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

function chestHitChance(drops: SlotDrop[]): number {
    let chance = 0;
    for (const drop of drops) {
        if (normalizeItemType(drop.itemType) === 'chest') {
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
        essence: 0,
        dust: row.dust,
    };
}

function pvpOpensChest(config: GameConfig, league: LeagueRow): boolean {
    const exact = config.pvpRewards.find((row) => row.leagueId === league.id && row.result === 'Win');
    const fallback = config.pvpRewards.find((row) => row.result === 'Win');
    return (exact ?? fallback)?.opensChest ?? true;
}

function expectedDropCount(chest: ChestConfig): number {
    return chest.dropCounts.reduce((sum, row) => sum + row.count * row.probability, 0);
}

function expectedChestResources(chest: ChestConfig, league: LeagueRow): Resources {
    const leagueMult = chest.leagueMultiplier.get(league.id) ?? 1;
    const perDrop = emptyResources();
    const weightSum = chest.drops.reduce((sum, drop) => sum + drop.probability, 0);
    for (const drop of chest.drops) {
        const p = weightSum > 0 ? drop.probability / weightSum : 0;
        const avg = (drop.minAmount + drop.maxAmount) / 2;
        addItem(perDrop, drop.itemType, p * avg, drop.affectedByLeague, league, 'chest', leagueMult);
    }
    return scaleRes(perDrop, expectedDropCount(chest));
}

function expectedChestEnergy(chest: ChestConfig, league: LeagueRow): number {
    const leagueMult = chest.leagueMultiplier.get(league.id) ?? 1;
    return expectedDropCount(chest) * expectedWeightedEnergy(chest.drops, league, 'chest', leagueMult, true);
}

function expectedAdResources(ads: AdConfig, league: LeagueRow): Resources {
    const leagueMult = ads.leagueMultiplier.get(league.id) ?? 1;
    const out = emptyResources();
    const weightSum = ads.drops.reduce((sum, drop) => sum + drop.probability, 0);
    for (const drop of ads.drops) {
        const p = weightSum > 0 ? drop.probability / weightSum : drop.probability;
        const avg = (drop.minAmount + drop.maxAmount) / 2;
        addItem(out, drop.itemType, p * avg, drop.affectedByLeague, league, 'ad', leagueMult);
    }
    return out;
}

function expectedWeightedEnergy(
    drops: WeightedDrop[],
    league: LeagueRow,
    source: 'chest' | 'ad',
    extraLeagueMult: number,
    normalizeWeights = false,
): number {
    const weightSum = drops.reduce((sum, drop) => sum + drop.probability, 0);
    let energy = 0;
    for (const drop of drops) {
        if (normalizeItemType(drop.itemType) !== 'energy') {
            continue;
        }
        const p = normalizeWeights && weightSum > 0 ? drop.probability / weightSum : drop.probability;
        const avg = (drop.minAmount + drop.maxAmount) / 2;
        energy += scaledAmount(p * avg, drop.affectedByLeague, league, source, extraLeagueMult, 'energy');
    }
    return energy;
}

function expectedWeightedKind(drops: WeightedDrop[], kind: string): number {
    const weightSum = drops.reduce((sum, drop) => sum + drop.probability, 0);
    let amount = 0;
    for (const drop of drops) {
        if (normalizeItemType(drop.itemType) !== kind) {
            continue;
        }
        const p = weightSum > 0 ? drop.probability / weightSum : drop.probability;
        const avg = (drop.minAmount + drop.maxAmount) / 2;
        amount += p * (avg > 0 ? avg : 1);
    }
    return amount;
}

function addItem(
    out: Resources,
    itemType: string,
    amount: number,
    affectedByLeague: boolean,
    league: LeagueRow,
    source: 'goldExp' | 'chest' | 'ad',
    extraLeagueMult = 1,
): void {
    const kind = normalizeItemType(itemType);
    const gold = scaledAmount(amount, affectedByLeague, league, source, extraLeagueMult, 'gold');
    const exp = scaledAmount(amount, affectedByLeague, league, source, extraLeagueMult, 'exp');

    if (kind === 'gold') {
        out.gold += gold;
    } else if (kind === 'exp') {
        out.exp += exp;
    } else if (kind === 'dust') {
        out.dust += amount;
    } else if (kind === 'essence') {
        out.essence += amount;
    }
}

function scaledAmount(
    amount: number,
    affectedByLeague: boolean,
    league: LeagueRow,
    source: 'goldExp' | 'chest' | 'ad',
    extraLeagueMult: number,
    kind: 'gold' | 'exp' | 'energy',
): number {
    if (!affectedByLeague) {
        return amount;
    }
    if (source === 'ad' || source === 'chest') {
        return amount * extraLeagueMult;
    }
    if (kind === 'exp') {
        return amount * league.expIncomeMultiplier;
    }
    return amount * league.goldIncomeMultiplier;
}

export function normalizeItemType(itemType: string): string {
    const raw = itemType.trim().toLowerCase();
    if (raw === 'gold' || raw.includes('gold')) {
        return 'gold';
    }
    if (raw === 'heroexp' || raw === 'exp' || raw.includes('exp')) {
        return 'exp';
    }
    if (raw === 'astraldust' || raw === 'dust' || raw.includes('dust')) {
        return 'dust';
    }
    if (raw.includes('essence')) {
        return 'essence';
    }
    if (raw === 'energy') {
        return 'energy';
    }
    if (raw === 'pvp' || raw === 'attack') {
        return 'pvp';
    }
    if (raw === 'chest') {
        return 'chest';
    }
    if (raw === 'pve' || raw === 'raid') {
        return 'pve';
    }
    return raw;
}

function scaleRes(res: Resources, factor: number): Resources {
    return {
        gold: res.gold * factor,
        exp: res.exp * factor,
        essence: res.essence * factor,
        dust: res.dust * factor,
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
