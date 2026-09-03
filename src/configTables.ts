export const CONFIG_TABLE_IDS = [
    'LevelProgression',
    'HeroTierUp',
    'SlotMachineBaseDrops',
    'GachaBaseDrops',
    'PvpLeaguesConfig',
    'PvpRewardPool',
    'PvpAdRewardPool',
    'PvpChestRewardPool',
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
        description: 'Логика перемещения по лигам; лиги увеличивают доход золота со слот-машины (GoldIncomeMultiplier)',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/16HpoC-9E1NKvXT2zDwAIzBe4M4NK_J-JkJX61ISlUV4',
    },
    {
        id: 'PvpRewardPool',
        description: 'Награды за PvP бой',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1tJjt0mAHSMMbMah-0Iwpq2RunfiYQuGRoTvZVazsBPE',
    },
    {
        id: 'PvpAdRewardPool',
        description: 'Награды за рекламу',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1iQePyPVaX1XKYNIJ-0VGvygkVEeSX9gDaBXBPEsN5hs',
    },
    {
        id: 'PvpChestRewardPool',
        description: 'Награды из PvP сундука',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/14gHasZa7vKzxm7UKKJEKvqJU3VZGE-q_1RZnbu0iG-A',
    },
];
