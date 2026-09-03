import type { GachaRates, SimParams, TierUpRow } from './types.js';

/** Expected pulls until an S drop, with hard pity at `pity` (counter resets on S). */
export function expectedPullsToSHero(sRate: number, pity: number): number {
    const p = Math.min(1, Math.max(0, sRate));
    const n = Math.max(1, Math.floor(pity));
    if (p <= 0) {
        return n;
    }
    if (p >= 1) {
        return 1;
    }
    const q = 1 - p;
    const qn1 = q ** (n - 1);
    const qn = qn1 * q;
    const sum = (1 - n * qn1 + (n - 1) * qn) / (p * p);
    return p * sum + n * qn1;
}

export interface GachaEv {
    pullsToS: number;
    pullsToNamedShard: number;
    pullsToFactionEmblem: number;
    dustPerNamedShard: number;
    dustPerFactionEmblem: number;
    dustPerHeroFullAscension: number;
    dustPerSquadFullAscension: number;
    shardsPerHero: number;
    armsPerHero: number;
}

export function computeGachaEv(
    gacha: GachaRates,
    tierUps: TierUpRow[],
    params: SimParams,
): GachaEv {
    const pullsToS = expectedPullsToSHero(gacha.sHero, params.gachaPity);
    const namedGivenS = 1 / Math.max(1, params.sHeroCount);
    const pullsToNamedShard = pullsToS / namedGivenS;
    const emblemRate = gacha.arms / Math.max(1, params.factionCount);
    const pullsToFactionEmblem = emblemRate > 0 ? 1 / emblemRate : Number.POSITIVE_INFINITY;

    const dustPerNamedShard = pullsToNamedShard * params.dustPerPull;
    const dustPerFactionEmblem = pullsToFactionEmblem * params.dustPerPull;

    const shardsPerHero = tierUps.reduce((sum, row) => sum + row.shards, 0);
    const armsPerHero = tierUps.reduce((sum, row) => sum + row.arms, 0);
    const dustPerHeroFullAscension = shardsPerHero * dustPerNamedShard + armsPerHero * dustPerFactionEmblem;

    return {
        pullsToS,
        pullsToNamedShard,
        pullsToFactionEmblem,
        dustPerNamedShard,
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
    return heroCount * (row.shards * ev.dustPerNamedShard + row.arms * ev.dustPerFactionEmblem);
}
