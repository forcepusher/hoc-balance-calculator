import type {
    AdConfig,
    ChestConfig,
    GameConfig,
    LeagueRow,
    Resources,
    SlotDrop,
} from './types.js';
import { emptyResources } from './types.js';

export interface DailyIncomeBreakdown {
    spins: number;
    energyReturnChance: number;
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

export function energyReturnChance(slotDrops: SlotDrop[]): number {
    let chance = 0;
    for (const drop of slotDrops) {
        if (normalizeItemType(drop.itemType) === 'energy') {
            chance += drop.probability * drop.value;
        }
    }
    return chance;
}

export function dailySpins(energyPerDay: number, slotDrops: SlotDrop[]): number {
    const returned = energyReturnChance(slotDrops);
    const denom = 1 - returned;
    if (denom <= 1e-9) {
        return energyPerDay;
    }
    return energyPerDay / denom;
}

export function computeDailyIncome(
    config: GameConfig,
    league: LeagueRow,
    params: { energyPerDay: number; adsPerDay: number; winRate: number },
): DailyIncomeBreakdown {
    const spins = dailySpins(params.energyPerDay, config.slotDrops);
    const fromSlots = slotIncome(config.slotDrops, spins, league);
    const pvpChance = pvpHitChance(config.slotDrops);
    const pvpFights = spins * pvpChance;
    const pvpWins = pvpFights * params.winRate;
    const pvpLosses = pvpFights * (1 - params.winRate);
    const fromPvp = addScaled(
        pvpMatchReward(config, league, 'Win'),
        pvpWins,
        pvpMatchReward(config, league, 'Loss'),
        pvpLosses,
    );

    const slotChests = spins * chestHitChance(config.slotDrops);
    const pvpChests = pvpWins * (pvpOpensChest(config, league) ? 1 : 0);
    const chestsOpened = slotChests + pvpChests;
    const fromChests = scaleRes(expectedChestResources(config.chest, league), chestsOpened);
    const fromAds = scaleRes(expectedAdResources(config.ads, league), params.adsPerDay);

    const total = sumRes(fromSlots, fromPvp, fromChests, fromAds);
    return {
        spins,
        energyReturnChance: energyReturnChance(config.slotDrops),
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

function expectedChestResources(chest: ChestConfig, league: LeagueRow): Resources {
    const expectedCount = chest.dropCounts.reduce((sum, row) => sum + row.count * row.probability, 0);
    const leagueMult = chest.leagueMultiplier.get(league.id) ?? 1;
    const perDrop = emptyResources();
    const weightSum = chest.drops.reduce((sum, drop) => sum + drop.probability, 0);
    for (const drop of chest.drops) {
        const p = weightSum > 0 ? drop.probability / weightSum : 0;
        const avg = (drop.minAmount + drop.maxAmount) / 2;
        const amount = p * avg;
        addItem(perDrop, drop.itemType, amount, drop.affectedByLeague, league, 'chest', leagueMult);
    }
    return scaleRes(perDrop, expectedCount);
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
    let goldMult = 1;
    let expMult = 1;
    if (affectedByLeague) {
        if (source === 'ad') {
            goldMult = extraLeagueMult;
            expMult = extraLeagueMult;
        } else if (source === 'chest') {
            goldMult = extraLeagueMult;
            expMult = extraLeagueMult;
        } else {
            goldMult = league.goldIncomeMultiplier;
            expMult = league.expIncomeMultiplier;
        }
    }

    if (kind === 'gold') {
        out.gold += amount * goldMult;
    } else if (kind === 'exp') {
        out.exp += amount * expMult;
    } else if (kind === 'dust') {
        out.dust += amount;
    } else if (kind === 'essence') {
        out.essence += amount;
    }
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
