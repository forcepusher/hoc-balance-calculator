export interface Resources {
    gold: number;
    exp: number;
    essence: number;
    dust: number;
    /** Полезные гербы фракций отряда (штуки). */
    arms: number;
    amethyst: number;
    decor: number;
    /** Кусков экипировки (штуки, только учёт). */
    equipment: number;
}

export type ResourceId = keyof Resources;

/** Ресурсы, которыми оплачивается прокачка (из них выбирается «узкое место»). */
export const RESOURCE_IDS: readonly ResourceId[] = ['gold', 'exp', 'essence', 'dust'];

export const ALL_RESOURCE_IDS: readonly ResourceId[] = [
    'gold', 'exp', 'essence', 'dust', 'arms', 'amethyst', 'decor', 'equipment',
];

export const RESOURCE_LABELS: Record<ResourceId, string> = {
    gold: 'Золото',
    exp: 'Опыт',
    essence: 'Эссенция',
    dust: 'Астральная пыль',
    arms: 'Гербы',
    amethyst: 'Аметисты',
    decor: 'Декор',
    equipment: 'Экипировка',
};

export function emptyResources(): Resources {
    return { gold: 0, exp: 0, essence: 0, dust: 0, arms: 0, amethyst: 0, decor: 0, equipment: 0 };
}

export function addResources(a: Resources, b: Resources): Resources {
    const out = emptyResources();
    for (const id of ALL_RESOURCE_IDS) {
        out[id] = a[id] + b[id];
    }
    return out;
}

export function scaleResources(a: Resources, factor: number): Resources {
    const out = emptyResources();
    for (const id of ALL_RESOURCE_IDS) {
        out[id] = a[id] * factor;
    }
    return out;
}

export function canAfford(have: Resources, need: Resources): boolean {
    return ALL_RESOURCE_IDS.every((id) => have[id] + 1e-9 >= need[id]);
}

export function subtractResources(have: Resources, need: Resources): Resources {
    const out = emptyResources();
    for (const id of ALL_RESOURCE_IDS) {
        out[id] = have[id] - need[id];
    }
    return out;
}

/** Поступления за день: ресурсы + энергия + опыт аккаунта (не тратятся на героев). */
export interface Income extends Resources {
    energy: number;
    accountXp: number;
}

/** Старая ручная таблица DailyIncome: «без лиги» и «с множителем лиги». */
export interface ManualDailyIncome {
    unscaled: Income;
    scaled: Income;
}

export function emptyIncome(): Income {
    return { ...emptyResources(), energy: 0, accountXp: 0 };
}

export function addIncome(a: Income, b: Income): Income {
    return { ...addResources(a, b), energy: a.energy + b.energy, accountXp: a.accountXp + b.accountXp };
}

export function scaleIncome(a: Income, factor: number): Income {
    return { ...scaleResources(a, factor), energy: a.energy * factor, accountXp: a.accountXp * factor };
}

export const RARITY_COLUMNS = [
    'Common',
    'Uncommon',
    'Rare',
    'Epic',
    'Legendary',
    'Mythical',
    'Divine',
] as const;

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
}

/** Шанс спина X1 (три разных символа, наград нет) и X3 (три одинаковых, награда). Сумма = 1. */
export interface SlotSpinChances {
    x1: number;
    x3: number;
}

export interface OverflowCapRow {
    baseTier: string;
    maxShards: number;
    currency: string;
    amount: number;
}

export interface GachaRates {
    sHero: number;
    aHero: number;
    arms: number;
    heroExp: number;
    /** Средняя вероятность герба одной (не Omni) фракции среди выпавших гербов. */
    armsFactionShare: number;
    armsOmniShare: number;
    armsFactionCount: number;
    armsAvgAmount: number;
    /** Среднее опыта за выпадение «HerosExp». */
    heroExpAvgAmount: number;
    overflow: OverflowCapRow[];
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
    slotMachineRarity: string;
    resetLeagueId: string;
    resetRating: number;
    resetRewardAmethysts: number;
}

export interface PvpRewardRow {
    leagueId: string;
    result: 'Win' | 'Loss';
    gold: number;
    exp: number;
    dust: number;
    essence: number;
    opensChest: boolean;
}

export interface ChestRewardEntry {
    item: string;
    value: number;
    /** Нормированная вероятность варианта внутри своего слота. */
    probability: number;
}

/** Редкость → слоты → варианты. */
export type ChestTable = Record<string, ChestRewardEntry[][]>;

export interface ChestTables {
    slot: ChestTable;
    pvp: ChestTable;
    /** true, если ChestPvp не задан и для PvP взят ChestSlot. */
    pvpFallbackToSlot: boolean;
    /** Источник (PVP/Slot/…) → редкость → нормированная вероятность. */
    rarityRoll: Record<string, Record<string, number>>;
}

export interface RewardItem {
    item: string;
    amount: number;
}

export interface DailyRewardDay {
    day: number;
    free: RewardItem[];
    premium: RewardItem[];
}

export interface WeeklyBonus {
    day: number;
    items: RewardItem[];
}

export interface DailyRewardsConfig {
    cycleDays: number;
    days: DailyRewardDay[];
    weekly: WeeklyBonus[];
}

export interface TaskRow {
    type: string;
    reward: RewardItem;
}

export interface CastleRow {
    castleId: string;
    level: number;
    items: RewardItem[];
}

export interface AccountXpConfig {
    base: number;
    growth: number;
    xpSpin: number;
    xpBattleWin: number;
    xpUpgrade: number;
    xpDailyAll: number;
}

export interface MiniEventMilestone {
    condition: string;
    minScore: number;
    /** Награда за место в рейтинге ивента (вместо порога очков). */
    rankFrom?: number;
    rankTo?: number;
    items: RewardItem[];
}

export interface MiniEventDef {
    id: string;
    label: string;
    defaultDays: number;
    milestones: MiniEventMilestone[];
}

export interface EquipmentForgeRow {
    key: string;
    rarity: string;
    shardCost: number;
    goldCost: number;
}

export interface EquipmentUpgradeRow {
    rarity: string;
    level: number;
    shardCost: number;
    goldCost: number;
    successProbability: number;
}

export interface EquipmentConfig {
    forge: EquipmentForgeRow[];
    upgrades: EquipmentUpgradeRow[];
}

/** Значения из CommonRemoteConfigs (если таблица загружена). */
export interface RemoteDefaults {
    energyPerDay?: number;
    energyMax?: number;
    summonPrice?: number;
    pity?: number;
}

export interface GameConfig {
    levels: LevelRow[];
    tierUps: TierUpRow[];
    slotDrops: SlotDrop[];
    slotSpin: SlotSpinChances;
    gacha: GachaRates;
    leagues: LeagueRow[];
    pvpRewards: PvpRewardRow[];
    chests: ChestTables;
    dailyRewards: DailyRewardsConfig;
    tasks: TaskRow[];
    castle: CastleRow[];
    levelRewards: RewardItem[];
    accountXp: AccountXpConfig;
    miniEvents: MiniEventDef[];
    equipment: EquipmentConfig | null;
    manualDailyIncome: ManualDailyIncome | null;
    remote: RemoteDefaults;
    notes: string[];
}

export interface SimParams {
    heroCount: number;
    energyPerDay: number;
    spinEnergyCost: number;
    winRate: number;
    dustPerPull: number;
    sHeroCount: number;
    /** Сколько разных фракций среди героев отряда (для гербов). */
    factionCount: number;
    gachaPity: number;
    /** 1 = игрок выбирает целевого S-героя (гарант после 3 промахов). */
    targetHeroPity: number;
    maxDays: number;
    checkpoints: number[];
    startLeagueIndex: number;
    startRating: number;
    weeklyResetEveryDays: number;
    /** 1 = забирать платную ветку ежедневных наград. */
    premiumDaily: number;
    /** Доля выполняемых дейликов/недельных заданий, %. */
    taskCompletionPct: number;
    /** 1 = прибавить таблицу DailyIncome (ручную) поверх автоматических источников. */
    useManualDailyIncome: number;
    castlesActive: number;
    castleLevel: number;
    castleCollectsPerDay: number;
    /** 1 = учитывать мини-ивенты. */
    miniEventsOn: number;
    miniEventDays: number;
    /** Место в рейтинге ивентов с наградой за место (0 = без наград за место). */
    miniEventRank: number;
    equipmentPiecesPerHero: number;
    /** 0 = экипировка не качается. */
    equipmentTargetLevel: number;
    equipmentRarity: string;
    otherDaily: Income;
}

export const DEFAULT_SIM_PARAMS: SimParams = {
    heroCount: 5,
    energyPerDay: 288,
    spinEnergyCost: 1,
    winRate: 0.55,
    dustPerPull: 100,
    sHeroCount: 8,
    factionCount: 4,
    gachaPity: 80,
    targetHeroPity: 1,
    maxDays: 10000,
    checkpoints: [20, 60, 80, 120, 240],
    startLeagueIndex: 0,
    startRating: 0,
    weeklyResetEveryDays: 7,
    premiumDaily: 0,
    taskCompletionPct: 100,
    useManualDailyIncome: 0,
    castlesActive: 4,
    castleLevel: 0,
    castleCollectsPerDay: 3,
    miniEventsOn: 1,
    miniEventDays: 7,
    miniEventRank: 0,
    equipmentPiecesPerHero: 6,
    equipmentTargetLevel: 0,
    equipmentRarity: 'Common',
    otherDaily: emptyIncome(),
};
