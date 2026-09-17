import type { ParsedCsvTable } from '../googleSheets.js';
import type { ConfigTableId } from '../configTables.js';
import type {
    ChestRewardRow,
    ChestTables,
    GameConfig,
    GachaRates,
    LeagueRow,
    LevelRow,
    PvpRewardRow,
    SheetDailyIncome,
    SlotDrop,
    TierUpRow,
} from './types.js';
import { emptyResources, RARITY_COLUMNS } from './types.js';

type TableMap = Map<ConfigTableId, ParsedCsvTable>;

export function parseGameConfig(tables: TableMap): GameConfig {
    return {
        levels: parseLevelProgression(requireTable(tables, 'LevelProgression')),
        tierUps: parseHeroTierUp(requireTable(tables, 'HeroTierUp')),
        slotDrops: parseSlotDrops(requireTable(tables, 'SlotMachineBaseDrops')),
        gacha: parseGacha(requireTable(tables, 'GachaBaseDrops')),
        leagues: parseLeagues(requireTable(tables, 'PvpLeaguesConfig')),
        pvpRewards: parsePvpRewards(requireTable(tables, 'PvpRewardPool')),
        chests: parseChests(requireTable(tables, 'ChestT3Rewards'), requireTable(tables, 'ChestT3RND')),
        dailyIncome: parseDailyIncome(requireTable(tables, 'DailyIncome')),
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

    const sHero = byKey.get('herostier') ?? byKey.get('s') ?? 0.03;
    const aHero = byKey.get('heroatier') ?? byKey.get('a') ?? 0.22;
    const arms = byKey.get('arms') ?? 0.75;
    return { sHero, aHero, arms };
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
            opensChest: chestI >= 0 ? parseBool(row[chestI]) : result === 'Win',
        };
    }).filter((row) => row.leagueId !== '');

    if (rows.length === 0) {
        throw new Error('PvpRewardPool: нет строк');
    }
    return rows;
}

export function parseChests(fixedTable: ParsedCsvTable, randomTable: ParsedCsvTable): ChestTables {
    const fixed = parseChestRewardTable(fixedTable, true);
    const random = parseChestRewardTable(randomTable, false);
    if (fixed.length === 0 && random.length === 0) {
        throw new Error('ChestT3: нет наград');
    }
    return { fixed, random };
}

function parseChestRewardTable(table: ParsedCsvTable, guaranteed: boolean): ChestRewardRow[] {
    const header = table.matrix[0] ?? table.headers;
    const col = columnIndex(header);
    const keyI = optionalColumn(header, ['key']);
    if (keyI < 0) {
        throw new Error('ChestT3: нет колонки Key');
    }
    const pI = optionalColumn(header, ['probability', 'chance']);
    const rarityIndex: Record<string, number> = {};
    for (const rarity of RARITY_COLUMNS) {
        const index = optionalColumn(header, [rarity.toLowerCase()]);
        if (index >= 0) {
            rarityIndex[rarity] = index;
        }
    }

    const rows: ChestRewardRow[] = [];
    for (const row of table.matrix.slice(1)) {
        const key = (row[keyI] ?? '').trim();
        if (!key || /^key$/i.test(key)) {
            continue;
        }
        const probability = guaranteed ? 1 : (pI >= 0 ? parseNumber(row[pI]) : 0);
        if (!guaranteed && probability <= 0) {
            continue;
        }
        const amountsByRarity: Record<string, number> = {};
        for (const [rarity, index] of Object.entries(rarityIndex)) {
            amountsByRarity[rarity] = parseNumber(row[index]);
        }
        rows.push({
            key,
            itemType: key,
            probability,
            amountsByRarity,
        });
    }
    return rows;
}

export function parseDailyIncome(table: ParsedCsvTable): SheetDailyIncome {
    const unscaled = emptyResources();
    const scaled = emptyResources();
    let unscaledEnergy = 0;
    let scaledEnergy = 0;

    const header = table.matrix[0] ?? [];
    const looksLikeSplit = normalizeHeader(header[0] ?? '').includes('notaffected')
        || normalizeHeader(header[0] ?? '').includes('независ');

    if (looksLikeSplit) {
        for (const row of table.matrix.slice(1)) {
            addNamedAmount(row[0], row[1], unscaled, (energy) => {
                unscaledEnergy += energy;
            });
            addNamedAmount(row[2], row[3], scaled, (energy) => {
                scaledEnergy += energy;
            });
        }
    } else {
        const col = columnIndex(header.length > 0 ? header : table.headers);
        const keyI = optionalColumn(header, ['key', 'item', 'resource']);
        const valueI = optionalColumn(header, ['value', 'amount']);
        const affectedI = optionalColumn(header, ['isaffectedbyleague', 'affectedbyleague']);
        for (const row of table.matrix.slice(1)) {
            const name = keyI >= 0 ? row[keyI] : row[0];
            const value = valueI >= 0 ? row[valueI] : row[1];
            const affected = affectedI >= 0 && parseBool(row[affectedI]);
            addNamedAmount(name, value, affected ? scaled : unscaled, (energy) => {
                if (affected) {
                    scaledEnergy += energy;
                } else {
                    unscaledEnergy += energy;
                }
            });
        }
    }

    return { unscaled, scaled, unscaledEnergy, scaledEnergy };
}

function addNamedAmount(
    name: string | undefined,
    raw: string | undefined,
    into: SheetDailyIncome['unscaled'],
    onEnergy: (energy: number) => void,
): void {
    const key = (name ?? '').trim();
    if (!key) {
        return;
    }
    const amount = parseNumber(raw);
    if (amount === 0) {
        return;
    }
    const kind = normalizeItemType(key);
    if (kind === 'gold') {
        into.gold += amount;
    } else if (kind === 'exp') {
        into.exp += amount;
    } else if (kind === 'dust') {
        into.dust += amount;
    } else if (kind === 'essence') {
        into.essence += amount;
    } else if (kind === 'energy') {
        onEnergy(amount);
    }
}

export function describeChestParse(chests: ChestTables): string {
    const energy = chests.random.find((row) => normalizeItemType(row.itemType) === 'energy');
    const energyP = energy?.probability;
    return [
        `${chests.fixed.length} фикс.`,
        `${chests.random.length} RND`,
        energyP !== undefined ? `энергия p=${energyP}` : 'без энергии',
    ].join(' · ');
}

export function describeDailyIncome(income: SheetDailyIncome): string {
    return `без лиги: золото ${income.unscaled.gold}, опыт ${income.unscaled.exp} · с лигой: золото ${income.scaled.gold}, опыт ${income.scaled.exp}`;
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
