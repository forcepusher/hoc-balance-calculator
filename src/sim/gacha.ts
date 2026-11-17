import type { GachaRates, SimParams, TierUpRow } from './types.js';

/** Сколько S-выпадений подряд без целевого героя клиент допускает до гаранта (GachaSummonsState.MaxTargetPityValue). */
export const MAX_TARGET_PITY = 3;

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

/**
 * Сколько S-выпадений нужно до осколка конкретного героя.
 * Без цели: каждый S — случайный из N героев (1/p). С целью: после 3 промахов следующий S гарантированно целевой.
 */
export function expectedSDropsPerTarget(sHeroCount: number, targetPity: boolean): number {
    const n = Math.max(1, sHeroCount);
    const p = 1 / n;
    if (!targetPity || n <= 1) {
        return n;
    }
    const q = 1 - p;
    return (1 - q ** (MAX_TARGET_PITY + 1)) / p;
}

export interface GachaEv {
    pullsToS: number;
    sDropsPerTarget: number;
    pullsToNamedShard: number;
    pullsToFactionEmblem: number;
    dustPerNamedShard: number;
    dustPerFactionEmblem: number;
    dustPerHeroFullAscension: number;
    dustPerSquadFullAscension: number;
    shardsPerHero: number;
    armsPerHero: number;
    /** Полезных осколков отряда за одну крутку (суммарно по героям). */
    shardsPerPull: number;
    /** Полезных гербов отряда за одну крутку (с учётом Omni). */
    armsPerPull: number;
    /** Опыта героев за одну крутку (побочный доход). */
    expPerPull: number;
}

export function computeGachaEv(
    gacha: GachaRates,
    tierUps: TierUpRow[],
    params: SimParams,
): GachaEv {
    const pullsToS = expectedPullsToSHero(gacha.sHero, params.gachaPity);
    const sDropsPerTarget = expectedSDropsPerTarget(params.sHeroCount, params.targetHeroPity > 0);
    const pullsToNamedShard = pullsToS * sDropsPerTarget;

    const emblemsPerArmsDrop = Math.max(0.0001, gacha.armsAvgAmount);
    const oneHeroRate = gacha.arms * emblemsPerArmsDrop * (gacha.armsFactionShare + gacha.armsOmniShare);
    const pullsToFactionEmblem = oneHeroRate > 0 ? 1 / oneHeroRate : Number.POSITIVE_INFINITY;

    const squadFactions = Math.min(Math.max(1, params.factionCount), Math.max(1, gacha.armsFactionCount));
    const armsPerPull = gacha.arms * emblemsPerArmsDrop * (squadFactions * gacha.armsFactionShare + gacha.armsOmniShare);
    const shardsPerPull = pullsToNamedShard > 0 ? params.heroCount / pullsToNamedShard : 0;

    const dustPerNamedShard = pullsToNamedShard * params.dustPerPull;
    const dustPerFactionEmblem = pullsToFactionEmblem * params.dustPerPull;

    const shardsPerHero = tierUps.reduce((sum, row) => sum + row.shards, 0);
    const armsPerHero = tierUps.reduce((sum, row) => sum + row.arms, 0);
    const dustPerHeroFullAscension = shardsPerHero * dustPerNamedShard + armsPerHero * dustPerFactionEmblem;

    return {
        pullsToS,
        sDropsPerTarget,
        pullsToNamedShard,
        pullsToFactionEmblem,
        dustPerNamedShard,
        dustPerFactionEmblem,
        dustPerHeroFullAscension,
        dustPerSquadFullAscension: dustPerHeroFullAscension * params.heroCount,
        shardsPerHero,
        armsPerHero,
        shardsPerPull,
        armsPerPull,
        expPerPull: gacha.heroExp * gacha.heroExpAvgAmount,
    };
}

/**
 * Сколько круток нужно, чтобы оплатить повышение тира всего отряда.
 * Побочные выпадения копятся: осколки в `stockShards`, гербы — в уже имеющихся `haveArms`.
 */
export function pullsForTierUp(
    row: TierUpRow,
    ev: GachaEv,
    heroCount: number,
    stockShards: number,
    haveArms: number,
): number {
    const needShards = heroCount * row.shards;
    const needArms = heroCount * row.arms;
    let pulls = 0;
    if (needShards > stockShards + 1e-9) {
        pulls = Math.max(pulls, ev.shardsPerPull > 0 ? (needShards - stockShards) / ev.shardsPerPull : Number.POSITIVE_INFINITY);
    }
    if (needArms > haveArms + 1e-9) {
        pulls = Math.max(pulls, ev.armsPerPull > 0 ? (needArms - haveArms) / ev.armsPerPull : Number.POSITIVE_INFINITY);
    }
    return pulls;
}
