export interface Resources {
    gold: number;
    exp: number;
    essence: number;
    dust: number;
}

export function emptyResources(): Resources {
    return { gold: 0, exp: 0, essence: 0, dust: 0 };
}

export function addResources(a: Resources, b: Resources): Resources {
    return {
        gold: a.gold + b.gold,
        exp: a.exp + b.exp,
        essence: a.essence + b.essence,
        dust: a.dust + b.dust,
    };
}

export function scaleResources(a: Resources, factor: number): Resources {
    return {
        gold: a.gold * factor,
        exp: a.exp * factor,
        essence: a.essence * factor,
        dust: a.dust * factor,
    };
}

export function canAfford(have: Resources, need: Resources): boolean {
    return have.gold + 1e-9 >= need.gold
        && have.exp + 1e-9 >= need.exp
        && have.essence + 1e-9 >= need.essence
        && have.dust + 1e-9 >= need.dust;
}

export function subtractResources(have: Resources, need: Resources): Resources {
    return {
        gold: have.gold - need.gold,
        exp: have.exp - need.exp,
        essence: have.essence - need.essence,
        dust: have.dust - need.dust,
    };
}

export type ResourceId = keyof Resources;

export const RESOURCE_IDS: readonly ResourceId[] = ['gold', 'exp', 'essence', 'dust'];

export const RESOURCE_LABELS: Record<ResourceId, string> = {
    gold: 'Золото',
    exp: 'Опыт',
    essence: 'Эссенция',
    dust: 'Астральная пыль',
};

export interface LevelRow {
    level: number;
    expCost: number;
    goldCost: number;
    isBreakthrough: boolean;
    essenceCost: number;
    statMultiplier: number;
}

export interface TierUpRow {
    currentTier: string;
    nextTier: string;
    shards: number;
    arms: number;
}

export interface SlotDrop {
    key: string;
    probability: number;
    itemType: string;
    value: number;
    isJackpot: boolean;
    affectedByLeague: boolean;
}

export interface GachaRates {
    sHero: number;
    aHero: number;
    arms: number;
}

export interface LeagueRow {
    name: string;
    id: string;
    minRating: number;
    maxRating: number;
    winRating: number;
    lossRating: number;
    goldIncomeMultiplier: number;
    expIncomeMultiplier: number;
    slotMachineTier: string;
}

export interface PvpRewardRow {
    leagueId: string;
    result: 'Win' | 'Loss';
    gold: number;
    exp: number;
    dust: number;
    opensChest: boolean;
}

export interface WeightedDrop {
    key: string;
    probability: number;
    itemType: string;
    minAmount: number;
    maxAmount: number;
    affectedByLeague: boolean;
}

export interface ChestConfig {
    drops: WeightedDrop[];
    dropCounts: Array<{ count: number; probability: number }>;
    leagueMultiplier: Map<string, number>;
}

export interface AdConfig {
    drops: WeightedDrop[];
    leagueMultiplier: Map<string, number>;
}

export interface GameConfig {
    levels: LevelRow[];
    tierUps: TierUpRow[];
    slotDrops: SlotDrop[];
    gacha: GachaRates;
    leagues: LeagueRow[];
    pvpRewards: PvpRewardRow[];
    ads: AdConfig;
    chest: ChestConfig;
}

export interface SimParams {
    heroCount: number;
    energyPerDay: number;
    adsPerDay: number;
    winRate: number;
    dustPerPull: number;
    sHeroCount: number;
    factionCount: number;
    gachaPity: number;
    maxDays: number;
    checkpoints: number[];
    /** Squad level at which each league (by table order) starts applying next day. */
    leagueUnlockLevels: number[];
}

export const DEFAULT_SIM_PARAMS: SimParams = {
    heroCount: 5,
    energyPerDay: 432,
    adsPerDay: 5,
    winRate: 0.9,
    dustPerPull: 10,
    sHeroCount: 8,
    factionCount: 4,
    gachaPity: 80,
    maxDays: 10000,
    checkpoints: checkpointsEvery(20, 240),
    leagueUnlockLevels: [1, 40, 60, 80, 100, 120, 140],
};

function checkpointsEvery(step: number, maxLevel: number): number[] {
    const levels: number[] = [];
    for (let level = step; level <= maxLevel; level += step) {
        levels.push(level);
    }
    return levels;
}
