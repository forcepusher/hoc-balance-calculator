export const CONFIG_TABLE_IDS = [
    'LevelProgression',
    'HeroTierUp',
    'SlotMachineBaseDrops',
    'GachaBaseDrops',
    'PvpLeaguesConfig',
    'PvpRewardPool',
    'ChestT3Rewards',
    'ChestT3RND',
    'DailyIncome',
] as const;

export type ConfigTableId = (typeof CONFIG_TABLE_IDS)[number];

export interface ConfigTableDef {
    id: ConfigTableId;
    description: string;
    defaultUrl: string;
}

export const CONFIG_TABLES: readonly ConfigTableDef[] = [
    {
        id: 'LevelProgression',
        description: 'Стоимость опыта, золота, эссенции',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/17-fGfxdNr-qoDdt2yuW_g3XAVsMHFdlN4mweEvxICNo',
    },
    {
        id: 'HeroTierUp',
        description: 'Стоимость в осколках и гербах',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1xk8lw6oW5nvu_9cZ5tPeAGgLmK4OuTu9HoiKwi02jDs',
    },
    {
        id: 'SlotMachineBaseDrops',
        description: 'Шансы дропа слот-машины',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1j1Pc686613peoJ9eY7Dj-8gRsm1I4AUBQtJIyKD1NnU?gid=1058081879',
    },
    {
        id: 'GachaBaseDrops',
        description: 'Шансы дропа',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/12ChBhfVgYk3JbBfrgOznM5VQI0em_x0w0shNzuQYWC8',
    },
    {
        id: 'PvpLeaguesConfig',
        description: 'Лиги: рейтинг, GoldIncomeMultiplier, ExpIncomeMultiplier, SlotMachineRarity',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/16HpoC-9E1NKvXT2zDwAIzBe4M4NK_J-JkJX61ISlUV4',
    },
    {
        id: 'PvpRewardPool',
        description: 'Награды за победу и поражение PvP',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1tJjt0mAHSMMbMah-0Iwpq2RunfiYQuGRoTvZVazsBPE',
    },
    {
        id: 'ChestT3Rewards',
        description: 'Гарантированные награды сундука за победу PvP',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1yM32jzi4ELnNvoww9oRK0uLUx2kGX2k-Fxu0hYd_R-c',
    },
    {
        id: 'ChestT3RND',
        description: 'Дополнительная награда сундука (один ролл по шансам)',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1nGPrUjsYUB63XCKMPy3nqmshcSrNwOlPTedi_zwqUKo',
    },
    {
        id: 'DailyIncome',
        description: 'Доп. ежедневный доход (дейлики, ивенты, БП)',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/15I_LuwR7KChUK_mBmpJJ2ji2VlRh-vO7xJOoT_mbJTU',
    },
];
