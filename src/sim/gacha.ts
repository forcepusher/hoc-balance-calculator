import { parseUnitRank } from './ranks.js';
import type { GachaRates, SimParams, TierUpRow } from './types.js';

/**
 * Expected pulls until the pity-tracked drop.
 * Client: if `progress >= MaxPityValue` at the start of a pull, force HeroATier.
 * Progress increments on non-HeroATier, so the guarantee is pull `pity + 1` after `pity` misses.
 */
export function expectedPullsWithHardPity(rate: number, pity: number): number {
    const p = Math.min(1, Math.max(0, rate));
    const n = Math.max(0, Math.floor(pity));
    if (p <= 0) {
        return n + 1;
    }
    if (p >= 1) {
        return 1;
    }
    const q = 1 - p;
    const qn = q ** n;
    return (1 - q * qn) / p;
}

export function expectedPullsGeometric(rate: number): number {
    const p = Math.min(1, Math.max(0, rate));
    if (p <= 0) {
        return Number.POSITIVE_INFINITY;
    }
    return 1 / p;
}

export interface GachaEv {
    pullsToS: number;
    pullsToA: number;
    pullsToNamedSCopy: number;
    pullsToNamedACopy: number;
    pullsToFactionEmblem: number;
    dustPerNamedShard: number;
    dustPerNamedAShard: number;
    dustPerFactionEmblem: number;
    dustPerHeroFullAscension: number;
    dustPerSquadFullAscension: number;
    shardsPerHero: number;
    armsPerHero: number;
}

export function relevantTierUps(tierUps: TierUpRow[], startingHeroTier: string): TierUpRow[] {
    const minRank = parseUnitRank(startingHeroTier);
    if (minRank <= 0) {
        return tierUps;
    }
    return tierUps.filter((row) => {
        const current = parseUnitRank(row.currentTier);
        return current === 0 || current >= minRank;
    });
}

export function computeGachaEv(
    gacha: GachaRates,
    tierUps: TierUpRow[],
    params: SimParams,
): GachaEv {
    const pullsToS = expectedPullsWithHardPity(gacha.sRankHero, params.gachaPity);
    const pullsToA = expectedPullsGeometric(gacha.aRankHero);
    const pullsToNamedSCopy = pullsToS * Math.max(1, params.sHeroCount);
    const pullsToNamedACopy = pullsToA * Math.max(1, params.aHeroCount);
    const emblemRate = gacha.arms / Math.max(1, params.factionCount);
    const pullsToFactionEmblem = emblemRate > 0 ? 1 / emblemRate : Number.POSITIVE_INFINITY;

    const dustPerNamedShard = pullsToNamedSCopy * params.dustPerPull;
    const dustPerNamedAShard = pullsToNamedACopy * params.dustPerPull;
    const dustPerFactionEmblem = pullsToFactionEmblem * params.dustPerPull;

    const usedTiers = relevantTierUps(tierUps, params.startingHeroTier);
    const shardsPerHero = usedTiers.reduce((sum, row) => sum + row.shards, 0);
    const armsPerHero = usedTiers.reduce((sum, row) => sum + row.arms, 0);
    const dustPerHeroFullAscension = usedTiers.reduce(
        (sum, row) => sum + row.shards * shardDust(row, dustPerNamedShard, dustPerNamedAShard) + row.arms * dustPerFactionEmblem,
        0,
    );

    return {
        pullsToS,
        pullsToA,
        pullsToNamedSCopy,
        pullsToNamedACopy,
        pullsToFactionEmblem,
        dustPerNamedShard,
        dustPerNamedAShard,
        dustPerFactionEmblem,
        dustPerHeroFullAscension,
        dustPerSquadFullAscension: dustPerHeroFullAscension * params.heroCount,
        shardsPerHero,
        armsPerHero,
    };
}

export function dustCostForTierUp(
    row: TierUpRow,
    ev: GachaEv,
    heroCount: number,
): number {
    return heroCount * (row.shards * shardDust(row, ev.dustPerNamedShard, ev.dustPerNamedAShard) + row.arms * ev.dustPerFactionEmblem);
}

function shardDust(row: TierUpRow, sDust: number, aDust: number): number {
    const rank = parseUnitRank(row.currentTier);
    if (rank > 0 && rank < parseUnitRank('S')) {
        return aDust;
    }
    return sDust;
}
