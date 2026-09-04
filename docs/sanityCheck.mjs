// src/sim/gacha.ts
function expectedPullsWithHardPity(rate, pity) {
  const p2 = Math.min(1, Math.max(0, rate));
  const n2 = Math.max(0, Math.floor(pity));
  if (p2 <= 0) {
    return n2 + 1;
  }
  if (p2 >= 1) {
    return 1;
  }
  const q2 = 1 - p2;
  const qn = q2 ** n2;
  return (1 - q2 * qn) / p2;
}
function expectedPullsGeometric(rate) {
  const p2 = Math.min(1, Math.max(0, rate));
  if (p2 <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  return 1 / p2;
}

// src/sim/types.ts
var DEFAULT_SIM_PARAMS = {
  heroCount: 5,
  energyRegenIntervalSeconds: 300,
  energyPerTick: 1,
  spinEnergyCost: 1,
  adsPerDay: 5,
  winRate: 0.9,
  dustPerPull: 100,
  sHeroCount: 8,
  aHeroCount: 8,
  factionCount: 4,
  gachaPity: 80,
  startingHeroTier: "S",
  maxDays: 1e4,
  checkpoints: checkpointsEvery(20, 240),
  leagueProgression: "rating",
  leagueUnlockLevels: [1, 40, 60, 80, 100, 120, 140],
  applyPvpLossRewards: false
};
function regenEnergyPerDay(params) {
  const interval = Math.max(1, params.energyRegenIntervalSeconds);
  return 86400 / interval * Math.max(0, params.energyPerTick);
}
function checkpointsEvery(step, maxLevel) {
  const levels = [];
  for (let level = step; level <= maxLevel; level += step) {
    levels.push(level);
  }
  return levels;
}

// src/sim/sanityCheck.ts
function approx(actual, expected, label, eps = 1e-6) {
  if (Math.abs(actual - expected) > eps) {
    throw new Error(`${label}: ${actual} !== ${expected}`);
  }
}
approx(expectedPullsGeometric(0.22), 1 / 0.22, "geometric A");
approx(expectedPullsWithHardPity(1, 80), 1, "pity p=1");
approx(expectedPullsWithHardPity(0, 80), 81, "pity p=0");
approx(regenEnergyPerDay({ energyRegenIntervalSeconds: 300, energyPerTick: 1 }), 288, "regen 300s");
approx(regenEnergyPerDay({ energyRegenIntervalSeconds: 150, energyPerTick: 1 }), 576, "regen 150s");
var p = 0.22;
var n = 80;
var q = 1 - p;
approx(expectedPullsWithHardPity(p, n), (1 - q ** (n + 1)) / p, "pity closed form");
console.log("formula checks ok");
