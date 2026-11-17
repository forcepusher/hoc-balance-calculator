export const CONFIG_TABLE_IDS = [
    'CommonRemoteConfigs',
    'LevelProgression',
    'HeroTierUp',
    'SlotMachineBaseDrops',
    'GachaBaseDrops',
    'GachaArmsDistribution',
    'GachaHeroExpDistribution',
    'HeroOverflowCap',
    'PvpLeaguesConfig',
    'PvpRewardPool',
    'ChestRarityRoll',
    'ChestSlot',
    'ChestPvp',
    'CastlePassiveRewardConfig',
    'PlayerNewLevelRewards',
    'AccountLevelConfig',
    'DailyRewardV3',
    'DailyRewardWeeklyBonus',
    'TasksAndAchievementsV2',
    'MiniEventSpinMarathonRewardConfig',
    'MiniEventChestFrenzyRewardConfig',
    'MiniEventThreeDayChallengeRewardConfig',
    'MiniEventBattleChampionsRewardConfig',
    'MiniEventArenaTriumphRewardConfig',
    'EquipmentForgeConfig',
    'EquipmentUpgradeConfig',
    'DailyIncome',
] as const;

export type ConfigTableId = (typeof CONFIG_TABLE_IDS)[number];

export type ConfigTableGroup = 'core' | 'slots' | 'gacha' | 'pvp' | 'chests' | 'income' | 'events' | 'equipment' | 'manual';

export const CONFIG_GROUP_LABELS: Record<ConfigTableGroup, string> = {
    core: 'Прокачка героев и общие конфиги',
    slots: 'Слот-машина',
    gacha: 'Гача',
    pvp: 'PvP и лиги',
    chests: 'Сундуки',
    income: 'Доп. доход: замки, награды, задания',
    events: 'Мини-ивенты',
    equipment: 'Экипировка (сток золота)',
    manual: 'Ручные данные',
};

export interface ConfigTableDef {
    id: ConfigTableId;
    description: string;
    /** Ссылка на прод-таблицу (RemoteSheetsList/remote_configs_sheets.csv). Пусто — таблица не опубликована. */
    defaultUrl: string;
    /** Без обязательных таблиц симуляция не запускается. */
    required: boolean;
    group: ConfigTableGroup;
}

export const CONFIG_TABLES: readonly ConfigTableDef[] = [
    {
        id: 'CommonRemoteConfigs',
        description: 'Общие ремоут-конфиги: реген энергии, цена и гарант гачи',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1x3YLum_iiAW2QeWONCE0-fBcZWvoMWpo5nbZWnrHuig',
        required: false,
        group: 'core',
    },
    {
        id: 'LevelProgression',
        description: 'Стоимость опыта, золота, эссенции прокачки героя',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/18ZPp1PTeuFilToA1JXj9yMxGxFybfrvtH6VUUWL3fFU',
        required: true,
        group: 'core',
    },
    {
        id: 'HeroTierUp',
        description: 'Стоимость повышения тира: осколки и гербы',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1jispJWz8k8XLiPeb8VWpNaMfCcjoyIbyd5geP_lG6c8',
        required: true,
        group: 'core',
    },
    {
        id: 'SlotMachineBaseDrops',
        description: 'Дроп слот-машины + InitialChance (X1/X3)',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1AMbwRIeet9SjweOGSi3BelqvB_5Ijv8AXw3ZXMu8t2U',
        required: true,
        group: 'slots',
    },
    {
        id: 'GachaBaseDrops',
        description: 'Шансы гачи: S/A герой, гербы, опыт героев',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1cAR4qxQMwd7ClY6vjc-PFnctqJ3AFiDFjitblGuSGbs',
        required: true,
        group: 'gacha',
    },
    {
        id: 'GachaArmsDistribution',
        description: 'Распределение гербов гачи по фракциям (кол-во)',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/124o0g7ykCREjS94IOOlhLGaR6qfSFovmi2QkpKLshSo',
        required: true,
        group: 'gacha',
    },
    {
        id: 'GachaHeroExpDistribution',
        description: 'Распределение опыта героев из гачи',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1WXUzYCkX06YJxj_m1fTGM6d6bmfPkiOvlu_rNGXzLmM',
        required: true,
        group: 'gacha',
    },
    {
        id: 'HeroOverflowCap',
        description: 'Лимит осколков и конвертация избытка в аметисты',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1LaoqEfKtYRBDT43y6irst4AcZwTCbrFf-Zs-iuPdrVo',
        required: false,
        group: 'gacha',
    },
    {
        id: 'PvpLeaguesConfig',
        description: 'Лиги: рейтинг, множители, сброс сезона и награда',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1a_cJusjDXXjn9LamuZj-mc87XRvvJeH0yomeKKKldBg',
        required: true,
        group: 'pvp',
    },
    {
        id: 'PvpRewardPool',
        description: 'Награды за победу и поражение PvP',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1nJCa5U6BFdoxx8QY3KNNMVgxS4M7dhcrxUxZYrjBeRA',
        required: true,
        group: 'pvp',
    },
    {
        id: 'ChestRarityRoll',
        description: 'Шансы редкости сундука по источнику (PVP, Slot…)',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1GLpvp1GKEOLUYL9bYTAKmNdoHlZS8ASAlndW1mLlx6M',
        required: true,
        group: 'chests',
    },
    {
        id: 'ChestSlot',
        description: 'Сундук слот-машины: слоты Редкость_Слот_Вариант',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1QjX76Dxi5rkEk6MxG5wGVu9PIVXEFx3BKwA-W_-pLAA',
        required: true,
        group: 'chests',
    },
    {
        id: 'ChestPvp',
        description: 'Сундук за победу в PvP (если ссылку убрать — берётся ChestSlot)',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1hshpsa0ajtxSJ1BPnyQOLbFQ7tPi9fCRX97u6IXx6oA?gid=2119983835',
        required: false,
        group: 'chests',
    },
    {
        id: 'CastlePassiveRewardConfig',
        description: 'Пассивная добыча замков (цикл 8 ч)',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1ScP5h0I7Kb3AwVAnZ_dYYCKNfuTCMdL8Z-Lon8sGuM4',
        required: false,
        group: 'income',
    },
    {
        id: 'PlayerNewLevelRewards',
        description: 'Награда за новый уровень аккаунта',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1SqgoBysZ-ZtH0aCdCVoA8eNau3WX67A4geS9zGoQCuA',
        required: false,
        group: 'income',
    },
    {
        id: 'AccountLevelConfig',
        description: 'Опыт аккаунта: формула уровня и XP за действия',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1huJgGZi3sbe956jjgXy0zMPd_6iEMkiRszopzdxTvqg',
        required: false,
        group: 'income',
    },
    {
        id: 'DailyRewardV3',
        description: 'Ежедневные награды (бесплатная и платная ветка)',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/13DhiAVlTTKvHw0vtEINshkLSSwf72O-9HtknW9RGOoA',
        required: false,
        group: 'income',
    },
    {
        id: 'DailyRewardWeeklyBonus',
        description: 'Недельный бонус ежедневных наград',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1bnWfcKaQiD-5JXfGGlEyfuEiZPy-wkGwomXF6dPimHc',
        required: false,
        group: 'income',
    },
    {
        id: 'TasksAndAchievementsV2',
        description: 'Задания: дейлики и недельные',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1Qq8RZl3S972kFGGMgFGs-e1ypwxwoVzRug_9zE-DLW0',
        required: false,
        group: 'income',
    },
    {
        id: 'MiniEventSpinMarathonRewardConfig',
        description: 'Мини-ивент «Марафон спинов»',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1yn8smNbSKhhlqQ-LfFjjBTY3O-9BVV1l8SR-kZ4LvRk',
        required: false,
        group: 'events',
    },
    {
        id: 'MiniEventChestFrenzyRewardConfig',
        description: 'Мини-ивент «Сундучное безумие»',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1IRN7ut7h_7FBKTpgb5tdJOy0sslMCMPJu5WfWPDz9jE',
        required: false,
        group: 'events',
    },
    {
        id: 'MiniEventThreeDayChallengeRewardConfig',
        description: 'Мини-ивент «Трёхдневный вызов»',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/17HdtnVZhyhwtJZCoMPg4y2hIo3KKKOTdQ_HLcC1UynQ',
        required: false,
        group: 'events',
    },
    {
        id: 'MiniEventBattleChampionsRewardConfig',
        description: 'Мини-ивент «Чемпионы битв»',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1k5GPM3V24AlhJuGgU9TT_jYax9baKMqJuEX5FEPhl1M',
        required: false,
        group: 'events',
    },
    {
        id: 'MiniEventArenaTriumphRewardConfig',
        description: 'Мини-ивент «Триумф арены»',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1FRH--oJ5O8KcS_F5VF6xcucle7gFeSq1zjhVMQ2aO5w',
        required: false,
        group: 'events',
    },
    {
        id: 'EquipmentForgeConfig',
        description: 'Экипировка: стоимость ковки (Класс_Тип_Редкость)',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/1OmmNQth0JpqMb0Qyx8N2sLK4bGtBrP3CvWzDbiAFaOk?gid=0',
        required: false,
        group: 'equipment',
    },
    {
        id: 'EquipmentUpgradeConfig',
        description: 'Экипировка: стоимость и шанс улучшения по редкости и уровню',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/199xVwg3fwVR97MtjwJVDNCzrGB1cau8wQf2cRILeRCc?gid=0',
        required: false,
        group: 'equipment',
    },
    {
        id: 'DailyIncome',
        description: 'Ручной доп. доход (старый формат, по умолчанию выключен — источники считаются автоматически)',
        defaultUrl: 'https://docs.google.com/spreadsheets/d/15I_LuwR7KChUK_mBmpJJ2ji2VlRh-vO7xJOoT_mbJTU',
        required: false,
        group: 'manual',
    },
];

