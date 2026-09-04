import type { ParsedCsvTable } from '../googleSheets.js';
import type { ConfigTableId } from '../configTables.js';
import type {
    AdConfig,
    ChestConfig,
    GameConfig,
    GachaRates,
    LeagueRow,
    LevelRow,
    PvpRewardRow,
    SlotDrop,
    TierUpRow,
    WeightedDrop,
} from './types.js';

type TableMap = Map<ConfigTableId, ParsedCsvTable>;

export function parseGameConfig(tables: TableMap): GameConfig {
    return {
        levels: parseLevelProgression(requireTable(tables, 'LevelProgression')),
        tierUps: parseHeroTierUp(requireTable(tables, 'HeroTierUp')),
        slotDrops: parseSlotDrops(requireTable(tables, 'SlotMachineBaseDrops')),
        gacha: parseGacha(requireTable(tables, 'GachaBaseDrops')),
        leagues: parseLeagues(requireTable(tables, 'PvpLeaguesConfig')),
        pvpRewards: parsePvpRewards(requireTable(tables, 'PvpRewardPool')),
        ads: parseAds(requireTable(tables, 'PvpAdRewardPool')),
        chest: parseChest(requireTable(tables, 'PvpChestRewardPool')),
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
        const expCost = parseNumber(row[expI]);
        const essenceCost = parseNumber(row[essI]);
        return {
            level,
            expCost: isBreakthrough ? 0 : expCost,
            goldCost: parseNumber(row[goldI]),
            isBreakthrough,
            essenceCost: isBreakthrough ? essenceCost : 0,
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
    const jackpotI = optionalColumn(table.headers, ['isjackpot']);
    const affectedI = optionalColumn(table.headers, ['isaffectedbyleague']);

    const drops = table.rows.map((row) => ({
        key: row[keyI] ?? '',
        probability: parseNumber(row[pI]),
        itemType: row[typeI] ?? '',
        value: parseNumber(row[valueI]),
        isJackpot: jackpotI >= 0 ? parseBool(row[jackpotI]) : false,
        affectedByLeague: affectedI >= 0 ? parseBool(row[affectedI]) : false,
    })).filter((row) => row.key !== '' && row.probability > 0);

    if (drops.length === 0) {
        throw new Error('SlotMachineBaseDrops: нет дропов');
    }
    return drops;
}

function parseGacha(table: ParsedCsvTable): GachaRates {
    const col = columnIndex(table.headers);
    const keyI = col(['key']);
    const pI = col(['probability', 'chance']);
    const byKey = new Map<string, number>();
    for (const row of table.rows) {
        const key = (row[keyI] ?? '').trim();
        if (!key) {
            continue;
        }
        byKey.set(key.toLowerCase(), parseNumber(row[pI]));
    }

    const aRankHero = byKey.get('herostier') ?? byKey.get('s') ?? 0.03;
    const sRankHero = byKey.get('heroatier') ?? byKey.get('a') ?? 0.22;
    const arms = byKey.get('arms') ?? 0.75;
    return { aRankHero, sRankHero, arms };
}

function parseLeagues(table: ParsedCsvTable): LeagueRow[] {
    const col = columnIndex(table.headers);
    const nameI = col(['leaguename', 'name']);
    const idI = col(['leagueid', 'id']);
    const minI = optionalColumn(table.headers, ['minrating']);
    const maxI = optionalColumn(table.headers, ['maxrating']);
    const winI = optionalColumn(table.headers, ['winrating']);
    const lossI = optionalColumn(table.headers, ['lossrating']);
    const resetI = optionalColumn(table.headers, ['resetrating']);
    const goldI = optionalColumn(table.headers, ['goldincomemultiplier']);
    const expI = optionalColumn(table.headers, ['expincomemultiplier']);
    const tierI = optionalColumn(table.headers, ['slotmachinetier']);

    const rows = table.rows.map((row) => ({
        name: row[nameI] ?? '',
        id: row[idI] ?? '',
        minRating: minI >= 0 ? parseNumber(row[minI]) : 0,
        maxRating: maxI >= 0 ? parseNumber(row[maxI]) : 0,
        winRating: winI >= 0 ? parseNumber(row[winI]) : 0,
        lossRating: lossI >= 0 ? parseNumber(row[lossI]) : 0,
        resetRating: resetI >= 0 ? parseNumber(row[resetI]) : 0,
        goldIncomeMultiplier: goldI >= 0 ? parseNumber(row[goldI], 1) : 1,
        expIncomeMultiplier: expI >= 0 ? parseNumber(row[expI], 1) : 1,
        slotMachineTier: tierI >= 0 ? (row[tierI] ?? '') : '',
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
    const chestI = col(['pvpchest', 'chest']);

    const rows = table.rows.map((row) => {
        const resultRaw = (row[resultI] ?? '').toLowerCase();
        const result: 'Win' | 'Loss' = resultRaw.startsWith('w') || resultRaw === 'победа' ? 'Win' : 'Loss';
        return {
            leagueId: row[idI] ?? '',
            result,
            gold: parseNumber(row[goldI]),
            exp: parseNumber(row[expI]),
            dust: parseNumber(row[dustI]),
            opensChest: parseBool(row[chestI]),
        };
    }).filter((row) => row.leagueId !== '');

    if (rows.length === 0) {
        throw new Error('PvpRewardPool: нет строк');
    }
    return rows;
}

function parseAds(table: ParsedCsvTable): AdConfig {
    const drops: WeightedDrop[] = [];
    const leagueMultiplier = new Map<string, number>();

    const header = table.matrix[0] ?? [];
    const col = columnIndex(header);
    const keyI = optionalColumn(header, ['key']);
    const pI = optionalColumn(header, ['probability', 'chance']);
    const typeI = optionalColumn(header, ['itemtype']);
    const minI = optionalColumn(header, ['baseminamount', 'minamount']);
    const maxI = optionalColumn(header, ['basemaxamount', 'maxamount']);
    const affectedI = optionalColumn(header, ['isaffectedbyleague']);
    const leagueI = optionalColumn(header, ['leagueid']);
    const multI = optionalColumn(header, ['admultiplier']);

    for (const row of table.matrix.slice(1)) {
        const key = keyI >= 0 ? (row[keyI] ?? '').trim() : '';
        const itemType = typeI >= 0 ? (row[typeI] ?? '').trim() : '';
        if (key !== '' && itemType !== '' && pI >= 0) {
            drops.push({
                key,
                probability: parseNumber(row[pI]),
                itemType,
                minAmount: minI >= 0 ? parseNumber(row[minI]) : 0,
                maxAmount: maxI >= 0 ? parseNumber(row[maxI]) : 0,
                affectedByLeague: affectedI >= 0 ? parseBool(row[affectedI]) : false,
            });
        }

        const leagueId = leagueI >= 0 ? (row[leagueI] ?? '').trim() : '';
        if (leagueId.toLowerCase().startsWith('league') && multI >= 0) {
            leagueMultiplier.set(leagueId, parseNumber(row[multI], 1));
        }
    }

    if (drops.length === 0) {
        throw new Error('PvpAdRewardPool: нет дропов');
    }
    return { drops, leagueMultiplier };
}

export function parseChest(table: ParsedCsvTable): ChestConfig {
    const drops: WeightedDrop[] = [];
    const dropCounts: Array<{ count: number; probability: number }> = [];
    const leagueMultiplier = new Map<string, number>();
    let mode: 'drops' | 'dropCount' | 'league' = 'drops';

    for (const row of table.matrix) {
        const first = (row[0] ?? '').trim();
        const second = (row[1] ?? '').trim();
        if (first === '' && second === '') {
            continue;
        }

        if (/^key$/i.test(first)) {
            mode = 'drops';
            continue;
        }
        if (/^dropcount$/i.test(first)) {
            mode = 'dropCount';
            continue;
        }
        if (/^leagueid$/i.test(first)) {
            mode = 'league';
            continue;
        }

        if (mode === 'drops') {
            drops.push({
                key: first,
                probability: parseNumber(row[1]),
                itemType: first,
                minAmount: parseNumber(row[2]),
                maxAmount: parseNumber(row[3]),
                affectedByLeague: parseBool(row[4]),
            });
            continue;
        }
        if (mode === 'dropCount') {
            dropCounts.push({
                count: parseNumber(first),
                probability: parseNumber(row[1]),
            });
            continue;
        }
        leagueMultiplier.set(first, parseNumber(row[1], 1));
    }

    if (drops.length === 0) {
        throw new Error('PvpChestRewardPool: нет дропов');
    }
    if (dropCounts.length === 0) {
        dropCounts.push({ count: 1, probability: 1 });
    }
    return { drops, dropCounts, leagueMultiplier };
}

export function describeChestParse(chest: ChestConfig): string {
    const expectedItems = chest.dropCounts.reduce((sum, row) => sum + row.count * row.probability, 0);
    return [
        `${chest.drops.length} дропов`,
        `${chest.dropCounts.length} DropCount`,
        `${chest.leagueMultiplier.size} лиг`,
        `EV предметов ${expectedItems.toFixed(2)}`,
    ].join(' · ');
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
    if (!raw) {
        return false;
    }
    const value = raw.trim().toLowerCase();
    return value === 'true' || value === '1' || value === 'yes';
}
