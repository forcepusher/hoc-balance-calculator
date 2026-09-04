/** Matches `UnitRank` / `UnitRankTierParser` in the Unity client. */
export const UNIT_RANK_ORDER = [
    'A',
    'A+',
    'S',
    'S+',
    'SS',
    'SS+',
    'Mythic',
    'Mythic+',
    'Supreme',
    'Supreme+',
] as const;

export type UnitRankName = (typeof UNIT_RANK_ORDER)[number];

const ALIASES: Record<string, number> = {
    a: 1,
    aplus: 2,
    'a+': 2,
    s: 3,
    splus: 4,
    's+': 4,
    ss: 5,
    ssplus: 6,
    'ss+': 6,
    mythic: 7,
    mythical: 7,
    'mythic+': 8,
    'mythical+': 8,
    mythicalplus: 8,
    supreme: 9,
    'supreme+': 10,
    supremeplus: 10,
};

export function parseUnitRank(raw: string): number {
    const key = raw.trim().toLowerCase().replace(/_/g, '').replace(/\s+/g, '');
    if (key === '') {
        return 0;
    }
    return ALIASES[key] ?? 0;
}
