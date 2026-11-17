import type { ParsedCsvTable } from '../googleSheets.js';
import type { ConfigTableId } from '../configTables.js';
import type {
    AccountXpConfig,
    CastleRow,
    ChestRewardEntry,
    ChestTable,
    DailyRewardsConfig,
    EquipmentConfig,
    GachaRates,
    GameConfig,
    Income,
    LeagueRow,
    LevelRow,
    ManualDailyIncome,
    MiniEventDef,
    OverflowCapRow,
    PvpRewardRow,
    RemoteDefaults,
    RewardItem,
    SlotDrop,
    SlotSpinChances,
    TaskRow,
    TierUpRow,
} from './types.js';
import { emptyIncome, RARITY_COLUMNS } from './types.js';

type TableMap = Map<ConfigTableId, ParsedCsvTable>;

export const MINI_EVENT_TABLES: ReadonlyArray<{ table: ConfigTableId; id: string; label: string; defaultDays: number }> = [
    { table: 'MiniEventSpinMarathonRewardConfig', id: 'SpinMarathon', label: 'Марафон спинов', defaultDays: 7 },
    { table: 'MiniEventChestFrenzyRewardConfig', id: 'ChestFrenzy', label: 'Сундучное безумие', defaultDays: 7 },
    { table: 'MiniEventThreeDayChallengeRewardConfig', id: 'ThreeDayChallenge', label: 'Трёхдневный вызов', defaultDays: 3 },
    { table: 'MiniEventBattleChampionsRewardConfig', id: 'BattleChampions', label: 'Чемпионы битв', defaultDays: 7 },
    { table: 'MiniEventArenaTriumphRewardConfig', id: 'ArenaTriumph', label: 'Триумф арены', defaultDays: 7 },
];

export function parseGameConfig(tables: TableMap): GameConfig {
    const notes: string[] = [];

    const slotTable = requireTable(tables, 'SlotMachineBaseDrops');
    const chestSlotTable = requireTable(tables, 'ChestSlot');
    const chestPvpRaw = tables.get('ChestPvp');
    const slotChests = parseChestSlotTable(chestSlotTable);
    const pvpFallbackToSlot = chestPvpRaw === undefined;
    const pvpChests = chestPvpRaw ? parseChestSlotTable(chestPvpRaw) : slotChests;
    if (pvpFallbackToSlot) {
        notes.push('ChestPvp не задан (в проде такой таблицы пока нет): сундук за победу в PvP считается по ChestSlot.');
    }

    const dailyTable = tables.get('DailyRewardV3');
    const weeklyTable = tables.get('DailyRewardWeeklyBonus');
    const equipmentForge = tables.get('EquipmentForgeConfig');
    const equipmentUpgrade = tables.get('EquipmentUpgradeConfig');

    const miniEvents: MiniEventDef[] = [];
    for (const def of MINI_EVENT_TABLES) {
        const table = tables.get(def.table);
        if (table) {
            miniEvents.push({
                id: def.id,
                label: def.label,
                defaultDays: def.defaultDays,
                milestones: parseMiniEvent(table),
            });
        }
    }

    const manual = tables.get('DailyIncome');
    return {
        levels: parseLevelProgression(requireTable(tables, 'LevelProgression')),
        tierUps: parseHeroTierUp(requireTable(tables, 'HeroTierUp')),
        slotDrops: parseSlotDrops(slotTable),
        slotSpin: parseSlotSpin(slotTable),
        gacha: parseGacha(
            requireTable(tables, 'GachaBaseDrops'),
            tables.get('GachaArmsDistribution'),
            tables.get('GachaHeroExpDistribution'),
            tables.get('HeroOverflowCap'),
        ),
        leagues: parseLeagues(requireTable(tables, 'PvpLeaguesConfig')),
        pvpRewards: parsePvpRewards(requireTable(tables, 'PvpRewardPool')),
        chests: {
            slot: slotChests,
            pvp: pvpChests,
            pvpFallbackToSlot,
            rarityRoll: parseRarityRoll(requireTable(tables, 'ChestRarityRoll')),
        },
        dailyRewards: parseDailyRewards(dailyTable, weeklyTable),
        tasks: parseTasks(tables.get('TasksAndAchievementsV2')),
        castle: parseCastle(tables.get('CastlePassiveRewardConfig')),
        levelRewards: parseLevelRewards(tables.get('PlayerNewLevelRewards')),
        accountXp: parseAccountXp(tables.get('AccountLevelConfig')),
        miniEvents,
        equipment: equipmentForge || equipmentUpgrade ? parseEquipment(equipmentForge, equipmentUpgrade) : null,
        manualDailyIncome: manual ? parseManualDailyIncome(manual) : null,
        remote: parseRemoteDefaults(tables.get('CommonRemoteConfigs')),
        notes,
    };
}

function requireTable(tables: TableMap, id: ConfigTableId): ParsedCsvTable {
    const table = tables.get(id);
    if (!table) {
        throw new Error(`Таблица ${id} не загружена`);
    }
    return table;
}

function parseLevelProgression(table: ParsedCsvTable): LevelRow[] {
    const col = columnIndex(table.headers);
    const levelI = col(['level']);
    const expI = col(['expcost', 'exp']);
    const goldI = col(['goldcost', 'gold']);
    const btI = col(['isbreakthrough']);
    const essI = col(['breakthroughessencecost', 'essencecost', 'essence']);
    const statI = col(['statmultiplier']);

    const levels = table.rows.map((row) => {
        const level = parseNumber(row[levelI]);
        const isBreakthrough = parseBool(row[btI]);
        return {
            level,
            expCost: parseNumber(row[expI]),
            goldCost: parseNumber(row[goldI]),
            isBreakthrough,
            essenceCost: parseNumber(row[essI]),
            statMultiplier: parseNumber(row[statI], isBreakthrough ? NaN : 1),
        };
    }).filter((row) => row.level > 0);

    if (levels.length === 0) {
        throw new Error('LevelProgression: нет строк');
    }
    return levels.sort((a, b) => a.level - b.level);
}

function parseHeroTierUp(table: ParsedCsvTable): TierUpRow[] {
    const col = columnIndex(table.headers);
    const currentI = col(['currenttier']);
    const nextI = col(['nexttier']);
    const shardsI = col(['shards']);
    const armsI = col(['arms', 'emblems']);

    const rows = table.rows.map((row) => ({
        currentTier: row[currentI] ?? '',
        nextTier: row[nextI] ?? '',
        shards: parseNumber(row[shardsI]),
        arms: parseNumber(row[armsI]),
    })).filter((row) => row.currentTier !== '' && row.nextTier !== '');

    if (rows.length === 0) {
        throw new Error('HeroTierUp: нет строк');
    }
    return rows;
}

function slotKeyIsInitialChance(key: string): boolean {
    return normalizeHeader(key) === 'initialchance';
}

function parseSlotDrops(table: ParsedCsvTable): SlotDrop[] {
    const headers = table.headers.map(normalizeHeader);
    if (!headers.some((h) => h === 'itemtype') || !headers.some((h) => h === 'value' || h === 'chance')) {
        throw new Error('SlotMachineBaseDrops: нужна вкладка дропа (колонки ItemType, Value). Укажите gid вкладки слот-машины.');
    }
    const col = columnIndex(table.headers);
    const keyI = col(['key']);
    const pI = col(['probability', 'chance', 'вероятность', 'шанс']);
    const typeI = col(['itemtype']);
    const valueI = col(['value']);

    const drops = table.rows
        .filter((row) => !slotKeyIsInitialChance(row[keyI] ?? ''))
        .map((row) => ({
            key: row[keyI] ?? '',
            probability: parseNumber(row[pI]),
            itemType: row[typeI] ?? '',
            value: parseNumber(row[valueI]),
        }))
        .filter((row) => row.key !== '' && row.probability > 0);

    if (drops.length === 0) {
        throw new Error('SlotMachineBaseDrops: нет дропов');
    }
    return drops;
}

/** Строка InitialChance: ProbabilityX1 / ProbabilityX3. Как в клиенте: нет данных → всегда X3. */
function parseSlotSpin(table: ParsedCsvTable): SlotSpinChances {
    const col = columnIndex(table.headers);
    const keyI = col(['key']);
    const x1I = optionalColumn(table.headers, ['probabilityx1']);
    const x3I = optionalColumn(table.headers, ['probabilityx3']);
    const row = table.rows.find((r) => slotKeyIsInitialChance(r[keyI] ?? ''));
    if (!row || (x1I < 0 && x3I < 0)) {
        return { x1: 0, x3: 1 };
    }
    const x1 = Math.max(0, x1I >= 0 ? parseNumber(row[x1I]) : 0);
    const x3 = Math.max(0, x3I >= 0 ? parseNumber(row[x3I]) : 0);
    const sum = x1 + x3;
    if (sum <= 0) {
        return { x1: 0, x3: 1 };
    }
    return { x1: x1 / sum, x3: x3 / sum };
}

function parseGacha(
    drops: ParsedCsvTable,
    arms: ParsedCsvTable | undefined,
    heroExp: ParsedCsvTable | undefined,
    overflow: ParsedCsvTable | undefined,
): GachaRates {
    const col = columnIndex(drops.headers);
    const keyI = col(['key']);
    const pI = col(['probability', 'chance']);
    const byKey = new Map<string, number>();
    for (const row of drops.rows) {
        const key = (row[keyI] ?? '').trim();
        if (!key) {
            continue;
        }
        byKey.set(key.toLowerCase(), parseNumber(row[pI]));
    }

    let armsFactionShare = 1 / 8;
    let armsOmniShare = 0;
    let armsFactionCount = 8;
    let armsAvgAmount = 1;
    if (arms) {
        const c = columnIndex(arms.headers);
        const k = c(['key']);
        const p = c(['probability']);
        const mn = optionalColumn(arms.headers, ['minamount']);
        const mx = optionalColumn(arms.headers, ['maxamount']);
        let total = 0;
        let omni = 0;
        let factions = 0;
        let amountWeighted = 0;
        for (const row of arms.rows) {
            const key = (row[k] ?? '').trim();
            const prob = parseNumber(row[p]);
            if (!key || prob <= 0) {
                continue;
            }
            const lo = mn >= 0 ? parseNumber(row[mn], 1) : 1;
            const hi = mx >= 0 ? parseNumber(row[mx], lo) : lo;
            total += prob;
            amountWeighted += prob * (lo + hi) / 2;
            if (key.toLowerCase() === 'omni') {
                omni += prob;
            } else {
                factions += 1;
            }
        }
        if (total > 0 && factions > 0) {
            armsOmniShare = omni / total;
            armsFactionCount = factions;
            armsFactionShare = (1 - armsOmniShare) / factions;
            armsAvgAmount = amountWeighted / total;
        }
    }

    let heroExpAvgAmount = 0;
    if (heroExp) {
        const c = columnIndex(heroExp.headers);
        const p = c(['probability']);
        const a = c(['amount']);
        let total = 0;
        let weighted = 0;
        for (const row of heroExp.rows) {
            const prob = parseNumber(row[p]);
            if (prob > 0) {
                total += prob;
                weighted += prob * parseNumber(row[a]);
            }
        }
        heroExpAvgAmount = total > 0 ? weighted / total : 0;
    }

    const overflowRows: OverflowCapRow[] = [];
    if (overflow) {
        const c = columnIndex(overflow.headers);
        const t = c(['basetier']);
        const m = c(['maxshardslimit']);
        const cur = c(['overflowcurrency']);
        const am = c(['overflowamount']);
        for (const row of overflow.rows) {
            if ((row[t] ?? '').trim()) {
                overflowRows.push({
                    baseTier: row[t].trim(),
                    maxShards: parseNumber(row[m]),
                    currency: (row[cur] ?? '').trim(),
                    amount: parseNumber(row[am]),
                });
            }
        }
    }

    return {
        sHero: byKey.get('herostier') ?? byKey.get('s') ?? 0.03,
        aHero: byKey.get('heroatier') ?? byKey.get('a') ?? 0.22,
        arms: byKey.get('arms') ?? 0.6,
        heroExp: byKey.get('herosexp') ?? byKey.get('heroexp') ?? 0,
        armsFactionShare,
        armsOmniShare,
        armsFactionCount,
        armsAvgAmount,
        heroExpAvgAmount,
        overflow: overflowRows,
    };
}

function parseLeagues(table: ParsedCsvTable): LeagueRow[] {
    const col = columnIndex(table.headers);
    const nameI = col(['leaguename', 'name']);
    const idI = col(['leagueid', 'id']);
    const minI = optionalColumn(table.headers, ['minrating']);
    const maxI = optionalColumn(table.headers, ['maxrating']);
    const winI = optionalColumn(table.headers, ['winrating']);
    const lossI = optionalColumn(table.headers, ['lossrating']);
    const goldI = optionalColumn(table.headers, ['goldincomemultiplier']);
    const expI = optionalColumn(table.headers, ['expincomemultiplier']);
    const rarityI = optionalColumn(table.headers, ['slotmachinerarity', 'slotmachinetier']);
    const resetLeagueI = optionalColumn(table.headers, ['resetleagueid']);
    const resetRatingI = optionalColumn(table.headers, ['resetrating']);
    const resetRewardI = optionalColumn(table.headers, ['resetrewardamethysts']);

    const rows = table.rows.map((row) => ({
        name: row[nameI] ?? '',
        id: row[idI] ?? '',
        minRating: minI >= 0 ? parseNumber(row[minI]) : 0,
        maxRating: maxI >= 0 ? parseNumber(row[maxI]) : 0,
        winRating: winI >= 0 ? parseNumber(row[winI]) : 0,
        lossRating: lossI >= 0 ? parseNumber(row[lossI]) : 0,
        goldIncomeMultiplier: goldI >= 0 ? parseNumber(row[goldI], 1) : 1,
        expIncomeMultiplier: expI >= 0 ? parseNumber(row[expI], 1) : 1,
        slotMachineRarity: rarityI >= 0 ? (row[rarityI] ?? 'Common') : 'Common',
        resetLeagueId: resetLeagueI >= 0 ? (row[resetLeagueI] ?? '') : '',
        resetRating: resetRatingI >= 0 ? parseNumber(row[resetRatingI]) : 0,
        resetRewardAmethysts: resetRewardI >= 0 ? parseNumber(row[resetRewardI]) : 0,
    })).filter((row) => row.id !== '');

    if (rows.length === 0) {
        throw new Error('PvpLeaguesConfig: нет лиг');
    }
    return rows.sort((a, b) => a.minRating - b.minRating);
}

function parsePvpRewards(table: ParsedCsvTable): PvpRewardRow[] {
    const col = columnIndex(table.headers);
    const idI = col(['leagueid', 'leaguieid']);
    const resultI = col(['result']);
    const goldI = col(['gold']);
    const expI = col(['heroexp', 'exp']);
    const dustI = col(['astraldust', 'dust']);
    const essenceI = optionalColumn(table.headers, ['breakthroughessence', 'essence']);
    const chestI = optionalColumn(table.headers, ['pvpchest', 'chest']);

    const rows = table.rows.map((row) => {
        const resultRaw = (row[resultI] ?? '').toLowerCase();
        const result: 'Win' | 'Loss' = resultRaw.startsWith('w') || resultRaw === 'победа' ? 'Win' : 'Loss';
        return {
            leagueId: row[idI] ?? '',
            result,
            gold: parseNumber(row[goldI]),
            exp: parseNumber(row[expI]),
            dust: parseNumber(row[dustI]),
            essence: essenceI >= 0 ? parseNumber(row[essenceI]) : 0,
            opensChest: chestI >= 0 ? parseBool(row[chestI]) : result === 'Win',
        };
    }).filter((row) => row.leagueId !== '');

    if (rows.length === 0) {
        throw new Error('PvpRewardPool: нет строк');
    }
    return rows;
}

/** Key = источник (PVP, Slot, …), колонки Common..Divine. Вероятности нормируются. */
function parseRarityRoll(table: ParsedCsvTable): Record<string, Record<string, number>> {
    const keyI = columnIndex(table.headers)(['key']);
    const out: Record<string, Record<string, number>> = {};
    for (const row of table.rows) {
        const source = (row[keyI] ?? '').trim();
        if (!source) {
            continue;
        }
        const weights: Record<string, number> = {};
        let sum = 0;
        for (const rarity of RARITY_COLUMNS) {
            const index = optionalColumn(table.headers, [rarity.toLowerCase()]);
            const value = index >= 0 ? Math.max(0, parseNumber(row[index])) : 0;
            weights[rarity] = value;
            sum += value;
        }
        if (sum > 0) {
            for (const rarity of RARITY_COLUMNS) {
                weights[rarity] /= sum;
            }
            out[source.toLowerCase()] = weights;
        }
    }
    if (Object.keys(out).length === 0) {
        throw new Error('ChestRarityRoll: нет строк');
    }
    return out;
}

/** ChestSlot / ChestPvp: ключ `Редкость_Слот_Вариант`, колонки Item, Value, Probability. */
export function parseChestSlotTable(table: ParsedCsvTable): ChestTable {
    const col = columnIndex(table.headers);
    const keyI = col(['slot', 'key']);
    const itemI = col(['item']);
    const valueI = col(['value']);
    const pI = col(['probability']);

    const bySlot = new Map<string, Map<number, ChestRewardEntry[]>>();
    for (const row of table.rows) {
        const parts = (row[keyI] ?? '').trim().split('_');
        if (parts.length !== 3) {
            continue;
        }
        const rarity = parts[0];
        const slot = Number(parts[1]);
        if (!Number.isFinite(slot)) {
            continue;
        }
        const probability = Math.max(0, parseNumber(row[pI]));
        let slots = bySlot.get(rarity);
        if (!slots) {
            slots = new Map();
            bySlot.set(rarity, slots);
        }
        const entries = slots.get(slot) ?? [];
        entries.push({ item: (row[itemI] ?? '').trim(), value: parseNumber(row[valueI]), probability });
        slots.set(slot, entries);
    }

    const out: ChestTable = {};
    for (const [rarity, slots] of bySlot) {
        out[rarity] = [...slots.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([, entries]) => {
                const sum = entries.reduce((acc, e) => acc + e.probability, 0);
                return entries.map((e) => ({ ...e, probability: sum > 0 ? e.probability / sum : 0 }));
            });
    }
    if (Object.keys(out).length === 0) {
        throw new Error('Сундук: не найдено строк вида Редкость_Слот_Вариант');
    }
    return out;
}

/** `[Gold|Decor]` → ['Gold','Decor']; `Gold` → ['Gold']. */
export function parseList(raw: string | undefined): string[] {
    const text = (raw ?? '').trim().replace(/^\[/, '').replace(/\]$/, '');
    if (text === '') {
        return [];
    }
    return text.split(/[|;]/).map((part) => part.trim()).filter((part) => part !== '');
}

function zipItems(items: string[], amounts: string[]): RewardItem[] {
    const out: RewardItem[] = [];
    for (let i = 0; i < items.length; i++) {
        const amount = parseNumber(amounts[i] ?? amounts[0]);
        if (items[i] && amount !== 0) {
            out.push({ item: items[i], amount });
        }
    }
    return out;
}

function parseDailyRewards(daily: ParsedCsvTable | undefined, weekly: ParsedCsvTable | undefined): DailyRewardsConfig {
    const days: DailyRewardsConfig['days'] = [];
    if (daily) {
        const col = columnIndex(daily.headers);
        const dayI = col(['day']);
        const fi = col(['freeitem']);
        const fa = col(['freeamount']);
        const pi = optionalColumn(daily.headers, ['premiumitem']);
        const pa = optionalColumn(daily.headers, ['premiumamount']);
        for (const row of daily.rows) {
            const day = parseNumber(row[dayI]);
            if (day <= 0) {
                continue;
            }
            days.push({
                day,
                free: zipItems(parseList(row[fi]), parseList(row[fa])),
                premium: pi >= 0 && pa >= 0 ? zipItems(parseList(row[pi]), parseList(row[pa])) : [],
            });
        }
    }
    const weeklyRows: DailyRewardsConfig['weekly'] = [];
    if (weekly) {
        const col = columnIndex(weekly.headers);
        const dayI = col(['day']);
        const itemI = col(['item']);
        const amI = col(['amount']);
        for (const row of weekly.rows) {
            const day = parseNumber(row[dayI]);
            if (day > 0) {
                weeklyRows.push({ day, items: zipItems(parseList(row[itemI]), parseList(row[amI])) });
            }
        }
    }
    const cycleDays = days.reduce((max, d) => Math.max(max, d.day), 0);
    return { cycleDays: Math.max(1, cycleDays), days, weekly: weeklyRows };
}

function parseTasks(table: ParsedCsvTable | undefined): TaskRow[] {
    if (!table) {
        return [];
    }
    const col = columnIndex(table.headers);
    const typeI = col(['type']);
    const rtI = col(['rewardtype']);
    const raI = col(['rewardamount']);
    return table.rows
        .map((row) => ({
            type: (row[typeI] ?? '').trim(),
            reward: { item: (row[rtI] ?? '').trim(), amount: parseNumber(row[raI]) },
        }))
        .filter((row) => row.type !== '' && row.reward.item !== '' && row.reward.amount !== 0);
}

function parseCastle(table: ParsedCsvTable | undefined): CastleRow[] {
    if (!table) {
        return [];
    }
    const col = columnIndex(table.headers);
    const idI = col(['castleid']);
    const levelI = col(['level']);
    const itemsI = col(['items']);
    const valuesI = col(['values']);
    return table.rows
        .map((row) => ({
            castleId: (row[idI] ?? '').trim(),
            level: parseNumber(row[levelI]),
            items: zipItems(parseList(row[itemsI]), parseList(row[valuesI])),
        }))
        .filter((row) => row.castleId !== '');
}

function parseLevelRewards(table: ParsedCsvTable | undefined): RewardItem[] {
    if (!table) {
        return [];
    }
    const col = columnIndex(table.headers);
    const rewardI = col(['reward']);
    const valueI = col(['value']);
    return table.rows
        .map((row) => ({ item: (row[rewardI] ?? '').trim(), amount: parseNumber(row[valueI]) }))
        .filter((row) => row.item !== '' && row.amount !== 0);
}

function parseAccountXp(table: ParsedCsvTable | undefined): AccountXpConfig {
    const out: AccountXpConfig = { base: 10, growth: 1.3, xpSpin: 0, xpBattleWin: 0, xpUpgrade: 0, xpDailyAll: 0 };
    if (!table) {
        return out;
    }
    const col = columnIndex(table.headers);
    const keyI = col(['key']);
    const valueI = col(['value']);
    for (const row of table.rows) {
        const key = normalizeHeader(row[keyI] ?? '');
        const value = parseNumber(row[valueI]);
        if (key === 'levelbase') {
            out.base = value;
        } else if (key === 'levelgrowth') {
            out.growth = value;
        } else if (key === 'xpspin') {
            out.xpSpin = value;
        } else if (key === 'xpbattlewin') {
            out.xpBattleWin = value;
        } else if (key === 'xpupgrade') {
            out.xpUpgrade = value;
        } else if (key === 'xpdailyall') {
            out.xpDailyAll = value;
        }
    }
    return out;
}

function parseMiniEvent(table: ParsedCsvTable): MiniEventDef['milestones'] {
    const col = columnIndex(table.headers);
    const condI = col(['condition']);
    const scoreI = optionalColumn(table.headers, ['minscore']);
    const rankFromI = optionalColumn(table.headers, ['rankfrom']);
    const rankToI = optionalColumn(table.headers, ['rankto']);
    const itemsI = col(['items']);
    const valuesI = col(['values']);
    return table.rows
        .map((row) => ({
            condition: (row[condI] ?? '').trim(),
            minScore: scoreI >= 0 ? parseNumber(row[scoreI]) : 0,
            rankFrom: rankFromI >= 0 ? parseNumber(row[rankFromI]) : undefined,
            rankTo: rankToI >= 0 ? parseNumber(row[rankToI]) : undefined,
            items: zipItems(parseList(row[itemsI]), parseList(row[valuesI])),
        }))
        .filter((row) => row.condition !== '');
}

function parseEquipment(forge: ParsedCsvTable | undefined, upgrade: ParsedCsvTable | undefined): EquipmentConfig {
    const out: EquipmentConfig = { forge: [], upgrades: [] };
    if (forge) {
        const col = columnIndex(forge.headers);
        const keyI = col(['key']);
        const shardI = optionalColumn(forge.headers, ['forgeshardcost']);
        const goldI = optionalColumn(forge.headers, ['forgegoldcost']);
        for (const row of forge.rows) {
            if ((row[keyI] ?? '').trim()) {
                const key = row[keyI].trim();
                out.forge.push({
                    key,
                    // Ключ вида Класс_Тип_Редкость (Melee_Weapon_Common).
                    rarity: key.split('_').slice(2).join('_'),
                    shardCost: shardI >= 0 ? parseNumber(row[shardI]) : 0,
                    goldCost: goldI >= 0 ? parseNumber(row[goldI]) : 0,
                });
            }
        }
    }
    if (upgrade) {
        const col = columnIndex(upgrade.headers);
        const tierI = col(['tier']);
        const levelI = col(['upgradelevel']);
        const shardI = optionalColumn(upgrade.headers, ['upgradeshardcost']);
        const goldI = optionalColumn(upgrade.headers, ['upgradegoldcost']);
        const succI = optionalColumn(upgrade.headers, ['successprobability']);
        for (const row of upgrade.rows) {
            if ((row[tierI] ?? '').trim()) {
                out.upgrades.push({
                    rarity: row[tierI].trim(),
                    level: parseNumber(row[levelI]),
                    shardCost: shardI >= 0 ? parseNumber(row[shardI]) : 0,
                    goldCost: goldI >= 0 ? parseNumber(row[goldI]) : 0,
                    successProbability: succI >= 0 ? parseNumber(row[succI], 1) : 1,
                });
            }
        }
    }
    return out;
}

export function parseRemoteDefaults(table: ParsedCsvTable | undefined): RemoteDefaults {
    if (!table) {
        return {};
    }
    const map = new Map<string, number>();
    for (const row of table.rows) {
        const key = (row[0] ?? '').trim().toLowerCase();
        if (key) {
            map.set(key, parseNumber(row[1], NaN));
        }
    }
    const out: RemoteDefaults = {};
    const interval = map.get('recovery-energy-cfg-interval');
    const rate = map.get('recovery-energy-cfg-rate') ?? 1;
    if (interval !== undefined && Number.isFinite(interval) && interval > 0) {
        out.energyPerDay = (86400 / interval) * (Number.isFinite(rate) ? rate : 1);
    }
    const max = map.get('recovery-energy-cfg-max');
    if (max !== undefined && Number.isFinite(max)) {
        out.energyMax = max;
    }
    const price = map.get('gacha-summon-price-1');
    if (price !== undefined && Number.isFinite(price)) {
        out.summonPrice = price;
    }
    const pity = map.get('gacha-summon-pity-value');
    if (pity !== undefined && Number.isFinite(pity)) {
        out.pity = pity;
    }
    return out;
}

/** Старая ручная таблица DailyIncome (по умолчанию выключена). */
export function parseManualDailyIncome(table: ParsedCsvTable): ManualDailyIncome {
    const unscaled: Income = emptyIncome();
    const scaled: Income = emptyIncome();

    const header = table.matrix[0] ?? [];
    const looksLikeSplit = normalizeHeader(header[0] ?? '').includes('notaffected')
        || normalizeHeader(header[0] ?? '').includes('независ');

    if (looksLikeSplit) {
        for (const row of table.matrix.slice(1)) {
            addNamedAmount(row[0], row[1], unscaled);
            addNamedAmount(row[2], row[3], scaled);
        }
    } else {
        const keyI = optionalColumn(header, ['key', 'item', 'resource']);
        const valueI = optionalColumn(header, ['value', 'amount']);
        const affectedI = optionalColumn(header, ['isaffectedbyleague', 'affectedbyleague']);
        for (const row of table.matrix.slice(1)) {
            const name = keyI >= 0 ? row[keyI] : row[0];
            const value = valueI >= 0 ? row[valueI] : row[1];
            const affected = affectedI >= 0 && parseBool(row[affectedI]);
            addNamedAmount(name, value, affected ? scaled : unscaled);
        }
    }
    return { unscaled, scaled };
}

function addNamedAmount(name: string | undefined, raw: string | undefined, into: Income): void {
    const key = (name ?? '').trim();
    if (!key) {
        return;
    }
    const amount = parseNumber(raw);
    if (amount === 0) {
        return;
    }
    const kind = normalizeItemType(key);
    if (kind === 'gold' || kind === 'exp' || kind === 'dust' || kind === 'essence' || kind === 'amethyst' || kind === 'decor' || kind === 'energy') {
        into[kind] += amount;
    }
}

export function describeManualDailyIncome(income: ManualDailyIncome): string {
    return `без лиги: золото ${income.unscaled.gold}, опыт ${income.unscaled.exp} · с лигой: золото ${income.scaled.gold}, опыт ${income.scaled.exp}`;
}

/** Приводит название награды/ресурса к короткому виду. */
export function normalizeItemType(itemType: string): string {
    const raw = itemType.trim().toLowerCase();
    if (raw === 'experience') {
        return 'accountxp';
    }
    if (raw.includes('gold')) {
        return 'gold';
    }
    if (raw.includes('essence')) {
        return 'essence';
    }
    if (raw.includes('dust')) {
        return 'dust';
    }
    if (raw === 'heroexp' || raw === 'unitexperience' || raw === 'exp' || raw.includes('exp')) {
        return 'exp';
    }
    if (raw === 'amethyst') {
        return 'amethyst';
    }
    if (raw === 'decor') {
        return 'decor';
    }
    if (raw === 'equipment') {
        return 'equipment';
    }
    if (raw === 'energy') {
        return 'energy';
    }
    if (raw.startsWith('arms')) {
        return raw === 'armsomni' || raw === 'arms' ? 'arms' : 'armsfaction';
    }
    if (raw === 'pvp' || raw === 'attack') {
        return 'pvp';
    }
    if (raw.startsWith('chest')) {
        return 'chest';
    }
    if (raw === 'pve' || raw === 'raid' || raw === 'dungeon') {
        return 'pve';
    }
    return raw;
}

function columnIndex(headers: string[]): (aliases: string[]) => number {
    const normalized = headers.map(normalizeHeader);
    return (aliases: string[]): number => {
        for (const alias of aliases) {
            const index = normalized.findIndex((header) => header === alias || header.startsWith(alias));
            if (index >= 0) {
                return index;
            }
        }
        throw new Error(`Нет колонки ${aliases[0]} (есть: ${headers.join(', ')})`);
    };
}

function optionalColumn(headers: string[], aliases: string[]): number {
    const normalized = headers.map(normalizeHeader);
    for (const alias of aliases) {
        const index = normalized.findIndex((header) => header === alias || header.startsWith(alias));
        if (index >= 0) {
            return index;
        }
    }
    return -1;
}

function normalizeHeader(value: string): string {
    return value
        .toLowerCase()
        .replace(/\(.*?\)/g, '')
        .replace(/[^a-z0-9а-яё]+/gi, '')
        .trim();
}

export function parseNumber(raw: string | undefined, fallback = 0): number {
    if (raw === undefined || raw === '') {
        return fallback;
    }
    const cleaned = raw.replace(/\\-/g, '-').replace(/\s/g, '').replace(',', '.');
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : fallback;
}

export function parseBool(raw: string | undefined): boolean {
    const v = (raw ?? '').trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'да' || v === 'yes';
}
