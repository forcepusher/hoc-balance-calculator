// src/configTables.ts
var CONFIG_GROUP_LABELS = {
  core: "\u041F\u0440\u043E\u043A\u0430\u0447\u043A\u0430 \u0433\u0435\u0440\u043E\u0435\u0432 \u0438 \u043E\u0431\u0449\u0438\u0435 \u043A\u043E\u043D\u0444\u0438\u0433\u0438",
  slots: "\u0421\u043B\u043E\u0442-\u043C\u0430\u0448\u0438\u043D\u0430",
  gacha: "\u0413\u0430\u0447\u0430",
  pvp: "PvP \u0438 \u043B\u0438\u0433\u0438",
  chests: "\u0421\u0443\u043D\u0434\u0443\u043A\u0438",
  income: "\u0414\u043E\u043F. \u0434\u043E\u0445\u043E\u0434: \u0437\u0430\u043C\u043A\u0438, \u043D\u0430\u0433\u0440\u0430\u0434\u044B, \u0437\u0430\u0434\u0430\u043D\u0438\u044F",
  events: "\u041C\u0438\u043D\u0438-\u0438\u0432\u0435\u043D\u0442\u044B",
  equipment: "\u042D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0430 (\u0441\u0442\u043E\u043A \u0437\u043E\u043B\u043E\u0442\u0430)",
  manual: "\u0420\u0443\u0447\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435"
};
var CONFIG_TABLES = [
  {
    id: "CommonRemoteConfigs",
    description: "\u041E\u0431\u0449\u0438\u0435 \u0440\u0435\u043C\u043E\u0443\u0442-\u043A\u043E\u043D\u0444\u0438\u0433\u0438: \u0440\u0435\u0433\u0435\u043D \u044D\u043D\u0435\u0440\u0433\u0438\u0438, \u0446\u0435\u043D\u0430 \u0438 \u0433\u0430\u0440\u0430\u043D\u0442 \u0433\u0430\u0447\u0438",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1x3YLum_iiAW2QeWONCE0-fBcZWvoMWpo5nbZWnrHuig",
    required: false,
    group: "core"
  },
  {
    id: "LevelProgression",
    description: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u043E\u043F\u044B\u0442\u0430, \u0437\u043E\u043B\u043E\u0442\u0430, \u044D\u0441\u0441\u0435\u043D\u0446\u0438\u0438 \u043F\u0440\u043E\u043A\u0430\u0447\u043A\u0438 \u0433\u0435\u0440\u043E\u044F",
    defaultUrl: "https://docs.google.com/spreadsheets/d/18ZPp1PTeuFilToA1JXj9yMxGxFybfrvtH6VUUWL3fFU",
    required: true,
    group: "core"
  },
  {
    id: "HeroTierUp",
    description: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0438\u044F \u0442\u0438\u0440\u0430: \u043E\u0441\u043A\u043E\u043B\u043A\u0438 \u0438 \u0433\u0435\u0440\u0431\u044B",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1jispJWz8k8XLiPeb8VWpNaMfCcjoyIbyd5geP_lG6c8",
    required: true,
    group: "core"
  },
  {
    id: "SlotMachineBaseDrops",
    description: "\u0414\u0440\u043E\u043F \u0441\u043B\u043E\u0442-\u043C\u0430\u0448\u0438\u043D\u044B + InitialChance (X1/X3)",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1AMbwRIeet9SjweOGSi3BelqvB_5Ijv8AXw3ZXMu8t2U",
    required: true,
    group: "slots"
  },
  {
    id: "GachaBaseDrops",
    description: "\u0428\u0430\u043D\u0441\u044B \u0433\u0430\u0447\u0438: S/A \u0433\u0435\u0440\u043E\u0439, \u0433\u0435\u0440\u0431\u044B, \u043E\u043F\u044B\u0442 \u0433\u0435\u0440\u043E\u0435\u0432",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1cAR4qxQMwd7ClY6vjc-PFnctqJ3AFiDFjitblGuSGbs",
    required: true,
    group: "gacha"
  },
  {
    id: "GachaArmsDistribution",
    description: "\u0420\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0433\u0435\u0440\u0431\u043E\u0432 \u0433\u0430\u0447\u0438 \u043F\u043E \u0444\u0440\u0430\u043A\u0446\u0438\u044F\u043C (\u043A\u043E\u043B-\u0432\u043E)",
    defaultUrl: "https://docs.google.com/spreadsheets/d/124o0g7ykCREjS94IOOlhLGaR6qfSFovmi2QkpKLshSo",
    required: true,
    group: "gacha"
  },
  {
    id: "GachaHeroExpDistribution",
    description: "\u0420\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043E\u043F\u044B\u0442\u0430 \u0433\u0435\u0440\u043E\u0435\u0432 \u0438\u0437 \u0433\u0430\u0447\u0438",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1WXUzYCkX06YJxj_m1fTGM6d6bmfPkiOvlu_rNGXzLmM",
    required: true,
    group: "gacha"
  },
  {
    id: "HeroOverflowCap",
    description: "\u041B\u0438\u043C\u0438\u0442 \u043E\u0441\u043A\u043E\u043B\u043A\u043E\u0432 \u0438 \u043A\u043E\u043D\u0432\u0435\u0440\u0442\u0430\u0446\u0438\u044F \u0438\u0437\u0431\u044B\u0442\u043A\u0430 \u0432 \u0430\u043C\u0435\u0442\u0438\u0441\u0442\u044B",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1LaoqEfKtYRBDT43y6irst4AcZwTCbrFf-Zs-iuPdrVo",
    required: false,
    group: "gacha"
  },
  {
    id: "PvpLeaguesConfig",
    description: "\u041B\u0438\u0433\u0438: \u0440\u0435\u0439\u0442\u0438\u043D\u0433, \u043C\u043D\u043E\u0436\u0438\u0442\u0435\u043B\u0438, \u0441\u0431\u0440\u043E\u0441 \u0441\u0435\u0437\u043E\u043D\u0430 \u0438 \u043D\u0430\u0433\u0440\u0430\u0434\u0430",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1a_cJusjDXXjn9LamuZj-mc87XRvvJeH0yomeKKKldBg",
    required: true,
    group: "pvp"
  },
  {
    id: "PvpRewardPool",
    description: "\u041D\u0430\u0433\u0440\u0430\u0434\u044B \u0437\u0430 \u043F\u043E\u0431\u0435\u0434\u0443 \u0438 \u043F\u043E\u0440\u0430\u0436\u0435\u043D\u0438\u0435 PvP",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1nJCa5U6BFdoxx8QY3KNNMVgxS4M7dhcrxUxZYrjBeRA",
    required: true,
    group: "pvp"
  },
  {
    id: "ChestRarityRoll",
    description: "\u0428\u0430\u043D\u0441\u044B \u0440\u0435\u0434\u043A\u043E\u0441\u0442\u0438 \u0441\u0443\u043D\u0434\u0443\u043A\u0430 \u043F\u043E \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0443 (PVP, Slot\u2026)",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1GLpvp1GKEOLUYL9bYTAKmNdoHlZS8ASAlndW1mLlx6M",
    required: true,
    group: "chests"
  },
  {
    id: "ChestSlot",
    description: "\u0421\u0443\u043D\u0434\u0443\u043A \u0441\u043B\u043E\u0442-\u043C\u0430\u0448\u0438\u043D\u044B: \u0441\u043B\u043E\u0442\u044B \u0420\u0435\u0434\u043A\u043E\u0441\u0442\u044C_\u0421\u043B\u043E\u0442_\u0412\u0430\u0440\u0438\u0430\u043D\u0442",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1QjX76Dxi5rkEk6MxG5wGVu9PIVXEFx3BKwA-W_-pLAA",
    required: true,
    group: "chests"
  },
  {
    id: "ChestPvp",
    description: "\u0421\u0443\u043D\u0434\u0443\u043A \u0437\u0430 \u043F\u043E\u0431\u0435\u0434\u0443 \u0432 PvP (\u0435\u0441\u043B\u0438 \u0441\u0441\u044B\u043B\u043A\u0443 \u0443\u0431\u0440\u0430\u0442\u044C \u2014 \u0431\u0435\u0440\u0451\u0442\u0441\u044F ChestSlot)",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1hshpsa0ajtxSJ1BPnyQOLbFQ7tPi9fCRX97u6IXx6oA?gid=2119983835",
    required: false,
    group: "chests"
  },
  {
    id: "CastlePassiveRewardConfig",
    description: "\u041F\u0430\u0441\u0441\u0438\u0432\u043D\u0430\u044F \u0434\u043E\u0431\u044B\u0447\u0430 \u0437\u0430\u043C\u043A\u043E\u0432 (\u0446\u0438\u043A\u043B 8 \u0447)",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1ScP5h0I7Kb3AwVAnZ_dYYCKNfuTCMdL8Z-Lon8sGuM4",
    required: false,
    group: "income"
  },
  {
    id: "PlayerNewLevelRewards",
    description: "\u041D\u0430\u0433\u0440\u0430\u0434\u0430 \u0437\u0430 \u043D\u043E\u0432\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1SqgoBysZ-ZtH0aCdCVoA8eNau3WX67A4geS9zGoQCuA",
    required: false,
    group: "income"
  },
  {
    id: "AccountLevelConfig",
    description: "\u041E\u043F\u044B\u0442 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430: \u0444\u043E\u0440\u043C\u0443\u043B\u0430 \u0443\u0440\u043E\u0432\u043D\u044F \u0438 XP \u0437\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1huJgGZi3sbe956jjgXy0zMPd_6iEMkiRszopzdxTvqg",
    required: false,
    group: "income"
  },
  {
    id: "DailyRewardV3",
    description: "\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0435 \u043D\u0430\u0433\u0440\u0430\u0434\u044B (\u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u0430\u044F \u0438 \u043F\u043B\u0430\u0442\u043D\u0430\u044F \u0432\u0435\u0442\u043A\u0430)",
    defaultUrl: "https://docs.google.com/spreadsheets/d/13DhiAVlTTKvHw0vtEINshkLSSwf72O-9HtknW9RGOoA",
    required: false,
    group: "income"
  },
  {
    id: "DailyRewardWeeklyBonus",
    description: "\u041D\u0435\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u0431\u043E\u043D\u0443\u0441 \u0435\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0445 \u043D\u0430\u0433\u0440\u0430\u0434",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1bnWfcKaQiD-5JXfGGlEyfuEiZPy-wkGwomXF6dPimHc",
    required: false,
    group: "income"
  },
  {
    id: "TasksAndAchievementsV2",
    description: "\u0417\u0430\u0434\u0430\u043D\u0438\u044F: \u0434\u0435\u0439\u043B\u0438\u043A\u0438 \u0438 \u043D\u0435\u0434\u0435\u043B\u044C\u043D\u044B\u0435",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1Qq8RZl3S972kFGGMgFGs-e1ypwxwoVzRug_9zE-DLW0",
    required: false,
    group: "income"
  },
  {
    id: "MiniEventSpinMarathonRewardConfig",
    description: "\u041C\u0438\u043D\u0438-\u0438\u0432\u0435\u043D\u0442 \xAB\u041C\u0430\u0440\u0430\u0444\u043E\u043D \u0441\u043F\u0438\u043D\u043E\u0432\xBB",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1yn8smNbSKhhlqQ-LfFjjBTY3O-9BVV1l8SR-kZ4LvRk",
    required: false,
    group: "events"
  },
  {
    id: "MiniEventChestFrenzyRewardConfig",
    description: "\u041C\u0438\u043D\u0438-\u0438\u0432\u0435\u043D\u0442 \xAB\u0421\u0443\u043D\u0434\u0443\u0447\u043D\u043E\u0435 \u0431\u0435\u0437\u0443\u043C\u0438\u0435\xBB",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1IRN7ut7h_7FBKTpgb5tdJOy0sslMCMPJu5WfWPDz9jE",
    required: false,
    group: "events"
  },
  {
    id: "MiniEventThreeDayChallengeRewardConfig",
    description: "\u041C\u0438\u043D\u0438-\u0438\u0432\u0435\u043D\u0442 \xAB\u0422\u0440\u0451\u0445\u0434\u043D\u0435\u0432\u043D\u044B\u0439 \u0432\u044B\u0437\u043E\u0432\xBB",
    defaultUrl: "https://docs.google.com/spreadsheets/d/17HdtnVZhyhwtJZCoMPg4y2hIo3KKKOTdQ_HLcC1UynQ",
    required: false,
    group: "events"
  },
  {
    id: "MiniEventBattleChampionsRewardConfig",
    description: "\u041C\u0438\u043D\u0438-\u0438\u0432\u0435\u043D\u0442 \xAB\u0427\u0435\u043C\u043F\u0438\u043E\u043D\u044B \u0431\u0438\u0442\u0432\xBB",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1k5GPM3V24AlhJuGgU9TT_jYax9baKMqJuEX5FEPhl1M",
    required: false,
    group: "events"
  },
  {
    id: "MiniEventArenaTriumphRewardConfig",
    description: "\u041C\u0438\u043D\u0438-\u0438\u0432\u0435\u043D\u0442 \xAB\u0422\u0440\u0438\u0443\u043C\u0444 \u0430\u0440\u0435\u043D\u044B\xBB",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1FRH--oJ5O8KcS_F5VF6xcucle7gFeSq1zjhVMQ2aO5w",
    required: false,
    group: "events"
  },
  {
    id: "EquipmentForgeConfig",
    description: "\u042D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0430: \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u043A\u043E\u0432\u043A\u0438 (\u041A\u043B\u0430\u0441\u0441_\u0422\u0438\u043F_\u0420\u0435\u0434\u043A\u043E\u0441\u0442\u044C)",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1OmmNQth0JpqMb0Qyx8N2sLK4bGtBrP3CvWzDbiAFaOk?gid=0",
    required: false,
    group: "equipment"
  },
  {
    id: "EquipmentUpgradeConfig",
    description: "\u042D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0430: \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0438 \u0448\u0430\u043D\u0441 \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044F \u043F\u043E \u0440\u0435\u0434\u043A\u043E\u0441\u0442\u0438 \u0438 \u0443\u0440\u043E\u0432\u043D\u044E",
    defaultUrl: "https://docs.google.com/spreadsheets/d/199xVwg3fwVR97MtjwJVDNCzrGB1cau8wQf2cRILeRCc?gid=0",
    required: false,
    group: "equipment"
  },
  {
    id: "DailyIncome",
    description: "\u0420\u0443\u0447\u043D\u043E\u0439 \u0434\u043E\u043F. \u0434\u043E\u0445\u043E\u0434 (\u0441\u0442\u0430\u0440\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442, \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D \u2014 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438 \u0441\u0447\u0438\u0442\u0430\u044E\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438)",
    defaultUrl: "https://docs.google.com/spreadsheets/d/15I_LuwR7KChUK_mBmpJJ2ji2VlRh-vO7xJOoT_mbJTU",
    required: false,
    group: "manual"
  }
];

// src/googleSheets.ts
var SPREADSHEET_ID_PATTERN = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i;
var GID_PATTERN = /(?:[?&#]gid=)([0-9]+)/i;
function extractSpreadsheetId(raw) {
  const match = raw.trim().match(SPREADSHEET_ID_PATTERN);
  return match ? match[1] : null;
}
function extractGid(raw) {
  const match = raw.trim().match(GID_PATTERN);
  return match ? match[1] : null;
}
function normalizeGoogleSheetUrl(raw) {
  const trimmed = raw.trim();
  const id = extractSpreadsheetId(trimmed);
  if (!id) {
    return trimmed;
  }
  return canonicalGoogleSheetUrl(id, extractGid(trimmed));
}
function canonicalGoogleSheetUrl(spreadsheetId, gid) {
  const base = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  return gid ? `${base}?gid=${gid}` : base;
}
function toGoogleSheetCsvExportUrl(raw) {
  const id = extractSpreadsheetId(raw);
  if (!id) {
    throw new Error("Not a Google Sheets URL");
  }
  const gid = extractGid(raw);
  const base = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
  return gid ? `${base}&gid=${gid}` : base;
}
function shouldRewritePastedSheetUrl(raw) {
  const trimmed = raw.trim();
  if (!extractSpreadsheetId(trimmed)) {
    return false;
  }
  const normalized = normalizeGoogleSheetUrl(trimmed);
  return normalized !== trimmed;
}
async function fetchGoogleSheetCsv(sheetUrl) {
  const exportUrl = toGoogleSheetCsvExportUrl(sheetUrl);
  const response = await fetch(exportUrl, {
    method: "GET",
    redirect: "follow",
    credentials: "omit"
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const text = await response.text();
  if (looksLikeHtml(text)) {
    throw new Error("Sheet is not publicly accessible (got an HTML page instead of CSV)");
  }
  return text;
}
function parseCsvTable(text) {
  const matrix = parseCsvMatrix(text).filter((row) => row.some((cell) => cell !== ""));
  if (matrix.length === 0) {
    throw new Error("CSV is empty");
  }
  const headers = matrix[0];
  const rows = matrix.slice(1).map((row) => {
    const padded = row.slice();
    while (padded.length < headers.length) {
      padded.push("");
    }
    return padded;
  });
  return { headers, rows, matrix };
}
function parseCsvMatrix(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "");
  const pushCell = () => {
    row.push(cell.trim());
    cell = "";
  };
  const pushRow = () => {
    pushCell();
    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
    row = [];
  };
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      pushCell();
      continue;
    }
    if (ch === "\n") {
      pushRow();
      continue;
    }
    if (ch === "\r") {
      continue;
    }
    cell += ch;
  }
  if (inQuotes || cell !== "" || row.length > 0) {
    pushRow();
  }
  return rows;
}
function looksLikeHtml(text) {
  const sample = text.slice(0, 256).trim().toLowerCase();
  return sample.startsWith("<!doctype") || sample.startsWith("<html");
}

// src/sim/types.ts
var RESOURCE_IDS = ["gold", "exp", "essence", "dust"];
var ALL_RESOURCE_IDS = [
  "gold",
  "exp",
  "essence",
  "dust",
  "arms",
  "amethyst",
  "decor",
  "equipment"
];
var RESOURCE_LABELS = {
  gold: "\u0417\u043E\u043B\u043E\u0442\u043E",
  exp: "\u041E\u043F\u044B\u0442",
  essence: "\u042D\u0441\u0441\u0435\u043D\u0446\u0438\u044F",
  dust: "\u0410\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u044B\u043B\u044C",
  arms: "\u0413\u0435\u0440\u0431\u044B",
  amethyst: "\u0410\u043C\u0435\u0442\u0438\u0441\u0442\u044B",
  decor: "\u0414\u0435\u043A\u043E\u0440",
  equipment: "\u042D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0430"
};
function emptyResources() {
  return { gold: 0, exp: 0, essence: 0, dust: 0, arms: 0, amethyst: 0, decor: 0, equipment: 0 };
}
function addResources(a, b) {
  const out = emptyResources();
  for (const id of ALL_RESOURCE_IDS) {
    out[id] = a[id] + b[id];
  }
  return out;
}
function scaleResources(a, factor) {
  const out = emptyResources();
  for (const id of ALL_RESOURCE_IDS) {
    out[id] = a[id] * factor;
  }
  return out;
}
function canAfford(have, need) {
  return ALL_RESOURCE_IDS.every((id) => have[id] + 1e-9 >= need[id]);
}
function subtractResources(have, need) {
  const out = emptyResources();
  for (const id of ALL_RESOURCE_IDS) {
    out[id] = have[id] - need[id];
  }
  return out;
}
function emptyIncome() {
  return { ...emptyResources(), energy: 0, accountXp: 0 };
}
function addIncome(a, b) {
  return { ...addResources(a, b), energy: a.energy + b.energy, accountXp: a.accountXp + b.accountXp };
}
function scaleIncome(a, factor) {
  return { ...scaleResources(a, factor), energy: a.energy * factor, accountXp: a.accountXp * factor };
}
var RARITY_COLUMNS = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
  "Mythical",
  "Divine"
];
var DEFAULT_SIM_PARAMS = {
  heroCount: 5,
  energyPerDay: 288,
  spinEnergyCost: 1,
  winRate: 0.55,
  dustPerPull: 100,
  sHeroCount: 8,
  factionCount: 4,
  gachaPity: 80,
  targetHeroPity: 1,
  maxDays: 1e4,
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
  equipmentRarity: "Common",
  otherDaily: emptyIncome()
};

// src/sim/parseGameConfig.ts
var MINI_EVENT_TABLES = [
  { table: "MiniEventSpinMarathonRewardConfig", id: "SpinMarathon", label: "\u041C\u0430\u0440\u0430\u0444\u043E\u043D \u0441\u043F\u0438\u043D\u043E\u0432", defaultDays: 7 },
  { table: "MiniEventChestFrenzyRewardConfig", id: "ChestFrenzy", label: "\u0421\u0443\u043D\u0434\u0443\u0447\u043D\u043E\u0435 \u0431\u0435\u0437\u0443\u043C\u0438\u0435", defaultDays: 7 },
  { table: "MiniEventThreeDayChallengeRewardConfig", id: "ThreeDayChallenge", label: "\u0422\u0440\u0451\u0445\u0434\u043D\u0435\u0432\u043D\u044B\u0439 \u0432\u044B\u0437\u043E\u0432", defaultDays: 3 },
  { table: "MiniEventBattleChampionsRewardConfig", id: "BattleChampions", label: "\u0427\u0435\u043C\u043F\u0438\u043E\u043D\u044B \u0431\u0438\u0442\u0432", defaultDays: 7 },
  { table: "MiniEventArenaTriumphRewardConfig", id: "ArenaTriumph", label: "\u0422\u0440\u0438\u0443\u043C\u0444 \u0430\u0440\u0435\u043D\u044B", defaultDays: 7 }
];
function parseGameConfig(tables) {
  const notes = [];
  const slotTable = requireTable(tables, "SlotMachineBaseDrops");
  const chestSlotTable = requireTable(tables, "ChestSlot");
  const chestPvpRaw = tables.get("ChestPvp");
  const slotChests = parseChestSlotTable(chestSlotTable);
  const pvpFallbackToSlot = chestPvpRaw === void 0;
  const pvpChests = chestPvpRaw ? parseChestSlotTable(chestPvpRaw) : slotChests;
  if (pvpFallbackToSlot) {
    notes.push("ChestPvp \u043D\u0435 \u0437\u0430\u0434\u0430\u043D (\u0432 \u043F\u0440\u043E\u0434\u0435 \u0442\u0430\u043A\u043E\u0439 \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u043F\u043E\u043A\u0430 \u043D\u0435\u0442): \u0441\u0443\u043D\u0434\u0443\u043A \u0437\u0430 \u043F\u043E\u0431\u0435\u0434\u0443 \u0432 PvP \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u043F\u043E ChestSlot.");
  }
  const dailyTable = tables.get("DailyRewardV3");
  const weeklyTable = tables.get("DailyRewardWeeklyBonus");
  const equipmentForge = tables.get("EquipmentForgeConfig");
  const equipmentUpgrade = tables.get("EquipmentUpgradeConfig");
  const miniEvents = [];
  for (const def of MINI_EVENT_TABLES) {
    const table = tables.get(def.table);
    if (table) {
      miniEvents.push({
        id: def.id,
        label: def.label,
        defaultDays: def.defaultDays,
        milestones: parseMiniEvent(table)
      });
    }
  }
  const manual = tables.get("DailyIncome");
  return {
    levels: parseLevelProgression(requireTable(tables, "LevelProgression")),
    tierUps: parseHeroTierUp(requireTable(tables, "HeroTierUp")),
    slotDrops: parseSlotDrops(slotTable),
    slotSpin: parseSlotSpin(slotTable),
    gacha: parseGacha(
      requireTable(tables, "GachaBaseDrops"),
      tables.get("GachaArmsDistribution"),
      tables.get("GachaHeroExpDistribution"),
      tables.get("HeroOverflowCap")
    ),
    leagues: parseLeagues(requireTable(tables, "PvpLeaguesConfig")),
    pvpRewards: parsePvpRewards(requireTable(tables, "PvpRewardPool")),
    chests: {
      slot: slotChests,
      pvp: pvpChests,
      pvpFallbackToSlot,
      rarityRoll: parseRarityRoll(requireTable(tables, "ChestRarityRoll"))
    },
    dailyRewards: parseDailyRewards(dailyTable, weeklyTable),
    tasks: parseTasks(tables.get("TasksAndAchievementsV2")),
    castle: parseCastle(tables.get("CastlePassiveRewardConfig")),
    levelRewards: parseLevelRewards(tables.get("PlayerNewLevelRewards")),
    accountXp: parseAccountXp(tables.get("AccountLevelConfig")),
    miniEvents,
    equipment: equipmentForge || equipmentUpgrade ? parseEquipment(equipmentForge, equipmentUpgrade) : null,
    manualDailyIncome: manual ? parseManualDailyIncome(manual) : null,
    remote: parseRemoteDefaults(tables.get("CommonRemoteConfigs")),
    notes
  };
}
function requireTable(tables, id) {
  const table = tables.get(id);
  if (!table) {
    throw new Error(`\u0422\u0430\u0431\u043B\u0438\u0446\u0430 ${id} \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u0430`);
  }
  return table;
}
function parseLevelProgression(table) {
  const col = columnIndex(table.headers);
  const levelI = col(["level"]);
  const expI = col(["expcost", "exp"]);
  const goldI = col(["goldcost", "gold"]);
  const btI = col(["isbreakthrough"]);
  const essI = col(["breakthroughessencecost", "essencecost", "essence"]);
  const statI = col(["statmultiplier"]);
  const levels = table.rows.map((row) => {
    const level = parseNumber(row[levelI]);
    const isBreakthrough = parseBool(row[btI]);
    return {
      level,
      expCost: parseNumber(row[expI]),
      goldCost: parseNumber(row[goldI]),
      isBreakthrough,
      essenceCost: parseNumber(row[essI]),
      statMultiplier: parseNumber(row[statI], isBreakthrough ? NaN : 1)
    };
  }).filter((row) => row.level > 0);
  if (levels.length === 0) {
    throw new Error("LevelProgression: \u043D\u0435\u0442 \u0441\u0442\u0440\u043E\u043A");
  }
  return levels.sort((a, b) => a.level - b.level);
}
function parseHeroTierUp(table) {
  const col = columnIndex(table.headers);
  const currentI = col(["currenttier"]);
  const nextI = col(["nexttier"]);
  const shardsI = col(["shards"]);
  const armsI = col(["arms", "emblems"]);
  const rows = table.rows.map((row) => ({
    currentTier: row[currentI] ?? "",
    nextTier: row[nextI] ?? "",
    shards: parseNumber(row[shardsI]),
    arms: parseNumber(row[armsI])
  })).filter((row) => row.currentTier !== "" && row.nextTier !== "");
  if (rows.length === 0) {
    throw new Error("HeroTierUp: \u043D\u0435\u0442 \u0441\u0442\u0440\u043E\u043A");
  }
  return rows;
}
function slotKeyIsInitialChance(key) {
  return normalizeHeader(key) === "initialchance";
}
function parseSlotDrops(table) {
  const headers = table.headers.map(normalizeHeader);
  if (!headers.some((h) => h === "itemtype") || !headers.some((h) => h === "value" || h === "chance")) {
    throw new Error("SlotMachineBaseDrops: \u043D\u0443\u0436\u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0430 \u0434\u0440\u043E\u043F\u0430 (\u043A\u043E\u043B\u043E\u043D\u043A\u0438 ItemType, Value). \u0423\u043A\u0430\u0436\u0438\u0442\u0435 gid \u0432\u043A\u043B\u0430\u0434\u043A\u0438 \u0441\u043B\u043E\u0442-\u043C\u0430\u0448\u0438\u043D\u044B.");
  }
  const col = columnIndex(table.headers);
  const keyI = col(["key"]);
  const pI = col(["probability", "chance", "\u0432\u0435\u0440\u043E\u044F\u0442\u043D\u043E\u0441\u0442\u044C", "\u0448\u0430\u043D\u0441"]);
  const typeI = col(["itemtype"]);
  const valueI = col(["value"]);
  const drops = table.rows.filter((row) => !slotKeyIsInitialChance(row[keyI] ?? "")).map((row) => ({
    key: row[keyI] ?? "",
    probability: parseNumber(row[pI]),
    itemType: row[typeI] ?? "",
    value: parseNumber(row[valueI])
  })).filter((row) => row.key !== "" && row.probability > 0);
  if (drops.length === 0) {
    throw new Error("SlotMachineBaseDrops: \u043D\u0435\u0442 \u0434\u0440\u043E\u043F\u043E\u0432");
  }
  return drops;
}
function parseSlotSpin(table) {
  const col = columnIndex(table.headers);
  const keyI = col(["key"]);
  const x1I = optionalColumn(table.headers, ["probabilityx1"]);
  const x3I = optionalColumn(table.headers, ["probabilityx3"]);
  const row = table.rows.find((r) => slotKeyIsInitialChance(r[keyI] ?? ""));
  if (!row || x1I < 0 && x3I < 0) {
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
function parseGacha(drops, arms, heroExp, overflow) {
  const col = columnIndex(drops.headers);
  const keyI = col(["key"]);
  const pI = col(["probability", "chance"]);
  const byKey = /* @__PURE__ */ new Map();
  for (const row of drops.rows) {
    const key = (row[keyI] ?? "").trim();
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
    const k = c(["key"]);
    const p = c(["probability"]);
    const mn = optionalColumn(arms.headers, ["minamount"]);
    const mx = optionalColumn(arms.headers, ["maxamount"]);
    let total = 0;
    let omni = 0;
    let factions = 0;
    let amountWeighted = 0;
    for (const row of arms.rows) {
      const key = (row[k] ?? "").trim();
      const prob = parseNumber(row[p]);
      if (!key || prob <= 0) {
        continue;
      }
      const lo = mn >= 0 ? parseNumber(row[mn], 1) : 1;
      const hi = mx >= 0 ? parseNumber(row[mx], lo) : lo;
      total += prob;
      amountWeighted += prob * (lo + hi) / 2;
      if (key.toLowerCase() === "omni") {
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
    const p = c(["probability"]);
    const a = c(["amount"]);
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
  const overflowRows = [];
  if (overflow) {
    const c = columnIndex(overflow.headers);
    const t = c(["basetier"]);
    const m = c(["maxshardslimit"]);
    const cur = c(["overflowcurrency"]);
    const am = c(["overflowamount"]);
    for (const row of overflow.rows) {
      if ((row[t] ?? "").trim()) {
        overflowRows.push({
          baseTier: row[t].trim(),
          maxShards: parseNumber(row[m]),
          currency: (row[cur] ?? "").trim(),
          amount: parseNumber(row[am])
        });
      }
    }
  }
  return {
    sHero: byKey.get("herostier") ?? byKey.get("s") ?? 0.03,
    aHero: byKey.get("heroatier") ?? byKey.get("a") ?? 0.22,
    arms: byKey.get("arms") ?? 0.6,
    heroExp: byKey.get("herosexp") ?? byKey.get("heroexp") ?? 0,
    armsFactionShare,
    armsOmniShare,
    armsFactionCount,
    armsAvgAmount,
    heroExpAvgAmount,
    overflow: overflowRows
  };
}
function parseLeagues(table) {
  const col = columnIndex(table.headers);
  const nameI = col(["leaguename", "name"]);
  const idI = col(["leagueid", "id"]);
  const minI = optionalColumn(table.headers, ["minrating"]);
  const maxI = optionalColumn(table.headers, ["maxrating"]);
  const winI = optionalColumn(table.headers, ["winrating"]);
  const lossI = optionalColumn(table.headers, ["lossrating"]);
  const goldI = optionalColumn(table.headers, ["goldincomemultiplier"]);
  const expI = optionalColumn(table.headers, ["expincomemultiplier"]);
  const rarityI = optionalColumn(table.headers, ["slotmachinerarity", "slotmachinetier"]);
  const resetLeagueI = optionalColumn(table.headers, ["resetleagueid"]);
  const resetRatingI = optionalColumn(table.headers, ["resetrating"]);
  const resetRewardI = optionalColumn(table.headers, ["resetrewardamethysts"]);
  const rows = table.rows.map((row) => ({
    name: row[nameI] ?? "",
    id: row[idI] ?? "",
    minRating: minI >= 0 ? parseNumber(row[minI]) : 0,
    maxRating: maxI >= 0 ? parseNumber(row[maxI]) : 0,
    winRating: winI >= 0 ? parseNumber(row[winI]) : 0,
    lossRating: lossI >= 0 ? parseNumber(row[lossI]) : 0,
    goldIncomeMultiplier: goldI >= 0 ? parseNumber(row[goldI], 1) : 1,
    expIncomeMultiplier: expI >= 0 ? parseNumber(row[expI], 1) : 1,
    slotMachineRarity: rarityI >= 0 ? row[rarityI] ?? "Common" : "Common",
    resetLeagueId: resetLeagueI >= 0 ? row[resetLeagueI] ?? "" : "",
    resetRating: resetRatingI >= 0 ? parseNumber(row[resetRatingI]) : 0,
    resetRewardAmethysts: resetRewardI >= 0 ? parseNumber(row[resetRewardI]) : 0
  })).filter((row) => row.id !== "");
  if (rows.length === 0) {
    throw new Error("PvpLeaguesConfig: \u043D\u0435\u0442 \u043B\u0438\u0433");
  }
  return rows.sort((a, b) => a.minRating - b.minRating);
}
function parsePvpRewards(table) {
  const col = columnIndex(table.headers);
  const idI = col(["leagueid", "leaguieid"]);
  const resultI = col(["result"]);
  const goldI = col(["gold"]);
  const expI = col(["heroexp", "exp"]);
  const dustI = col(["astraldust", "dust"]);
  const essenceI = optionalColumn(table.headers, ["breakthroughessence", "essence"]);
  const chestI = optionalColumn(table.headers, ["pvpchest", "chest"]);
  const rows = table.rows.map((row) => {
    const resultRaw = (row[resultI] ?? "").toLowerCase();
    const result = resultRaw.startsWith("w") || resultRaw === "\u043F\u043E\u0431\u0435\u0434\u0430" ? "Win" : "Loss";
    return {
      leagueId: row[idI] ?? "",
      result,
      gold: parseNumber(row[goldI]),
      exp: parseNumber(row[expI]),
      dust: parseNumber(row[dustI]),
      essence: essenceI >= 0 ? parseNumber(row[essenceI]) : 0,
      opensChest: chestI >= 0 ? parseBool(row[chestI]) : result === "Win"
    };
  }).filter((row) => row.leagueId !== "");
  if (rows.length === 0) {
    throw new Error("PvpRewardPool: \u043D\u0435\u0442 \u0441\u0442\u0440\u043E\u043A");
  }
  return rows;
}
function parseRarityRoll(table) {
  const keyI = columnIndex(table.headers)(["key"]);
  const out = {};
  for (const row of table.rows) {
    const source = (row[keyI] ?? "").trim();
    if (!source) {
      continue;
    }
    const weights = {};
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
    throw new Error("ChestRarityRoll: \u043D\u0435\u0442 \u0441\u0442\u0440\u043E\u043A");
  }
  return out;
}
function parseChestSlotTable(table) {
  const col = columnIndex(table.headers);
  const keyI = col(["slot", "key"]);
  const itemI = col(["item"]);
  const valueI = col(["value"]);
  const pI = col(["probability"]);
  const bySlot = /* @__PURE__ */ new Map();
  for (const row of table.rows) {
    const parts = (row[keyI] ?? "").trim().split("_");
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
      slots = /* @__PURE__ */ new Map();
      bySlot.set(rarity, slots);
    }
    const entries = slots.get(slot) ?? [];
    entries.push({ item: (row[itemI] ?? "").trim(), value: parseNumber(row[valueI]), probability });
    slots.set(slot, entries);
  }
  const out = {};
  for (const [rarity, slots] of bySlot) {
    out[rarity] = [...slots.entries()].sort((a, b) => a[0] - b[0]).map(([, entries]) => {
      const sum = entries.reduce((acc, e) => acc + e.probability, 0);
      return entries.map((e) => ({ ...e, probability: sum > 0 ? e.probability / sum : 0 }));
    });
  }
  if (Object.keys(out).length === 0) {
    throw new Error("\u0421\u0443\u043D\u0434\u0443\u043A: \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E \u0441\u0442\u0440\u043E\u043A \u0432\u0438\u0434\u0430 \u0420\u0435\u0434\u043A\u043E\u0441\u0442\u044C_\u0421\u043B\u043E\u0442_\u0412\u0430\u0440\u0438\u0430\u043D\u0442");
  }
  return out;
}
function parseList(raw) {
  const text = (raw ?? "").trim().replace(/^\[/, "").replace(/\]$/, "");
  if (text === "") {
    return [];
  }
  return text.split(/[|;]/).map((part) => part.trim()).filter((part) => part !== "");
}
function zipItems(items, amounts) {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const amount = parseNumber(amounts[i] ?? amounts[0]);
    if (items[i] && amount !== 0) {
      out.push({ item: items[i], amount });
    }
  }
  return out;
}
function parseDailyRewards(daily, weekly) {
  const days = [];
  if (daily) {
    const col = columnIndex(daily.headers);
    const dayI = col(["day"]);
    const fi = col(["freeitem"]);
    const fa = col(["freeamount"]);
    const pi = optionalColumn(daily.headers, ["premiumitem"]);
    const pa = optionalColumn(daily.headers, ["premiumamount"]);
    for (const row of daily.rows) {
      const day = parseNumber(row[dayI]);
      if (day <= 0) {
        continue;
      }
      days.push({
        day,
        free: zipItems(parseList(row[fi]), parseList(row[fa])),
        premium: pi >= 0 && pa >= 0 ? zipItems(parseList(row[pi]), parseList(row[pa])) : []
      });
    }
  }
  const weeklyRows = [];
  if (weekly) {
    const col = columnIndex(weekly.headers);
    const dayI = col(["day"]);
    const itemI = col(["item"]);
    const amI = col(["amount"]);
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
function parseTasks(table) {
  if (!table) {
    return [];
  }
  const col = columnIndex(table.headers);
  const typeI = col(["type"]);
  const rtI = col(["rewardtype"]);
  const raI = col(["rewardamount"]);
  return table.rows.map((row) => ({
    type: (row[typeI] ?? "").trim(),
    reward: { item: (row[rtI] ?? "").trim(), amount: parseNumber(row[raI]) }
  })).filter((row) => row.type !== "" && row.reward.item !== "" && row.reward.amount !== 0);
}
function parseCastle(table) {
  if (!table) {
    return [];
  }
  const col = columnIndex(table.headers);
  const idI = col(["castleid"]);
  const levelI = col(["level"]);
  const itemsI = col(["items"]);
  const valuesI = col(["values"]);
  return table.rows.map((row) => ({
    castleId: (row[idI] ?? "").trim(),
    level: parseNumber(row[levelI]),
    items: zipItems(parseList(row[itemsI]), parseList(row[valuesI]))
  })).filter((row) => row.castleId !== "");
}
function parseLevelRewards(table) {
  if (!table) {
    return [];
  }
  const col = columnIndex(table.headers);
  const rewardI = col(["reward"]);
  const valueI = col(["value"]);
  return table.rows.map((row) => ({ item: (row[rewardI] ?? "").trim(), amount: parseNumber(row[valueI]) })).filter((row) => row.item !== "" && row.amount !== 0);
}
function parseAccountXp(table) {
  const out = { base: 10, growth: 1.3, xpSpin: 0, xpBattleWin: 0, xpUpgrade: 0, xpDailyAll: 0 };
  if (!table) {
    return out;
  }
  const col = columnIndex(table.headers);
  const keyI = col(["key"]);
  const valueI = col(["value"]);
  for (const row of table.rows) {
    const key = normalizeHeader(row[keyI] ?? "");
    const value = parseNumber(row[valueI]);
    if (key === "levelbase") {
      out.base = value;
    } else if (key === "levelgrowth") {
      out.growth = value;
    } else if (key === "xpspin") {
      out.xpSpin = value;
    } else if (key === "xpbattlewin") {
      out.xpBattleWin = value;
    } else if (key === "xpupgrade") {
      out.xpUpgrade = value;
    } else if (key === "xpdailyall") {
      out.xpDailyAll = value;
    }
  }
  return out;
}
function parseMiniEvent(table) {
  const col = columnIndex(table.headers);
  const condI = col(["condition"]);
  const scoreI = optionalColumn(table.headers, ["minscore"]);
  const rankFromI = optionalColumn(table.headers, ["rankfrom"]);
  const rankToI = optionalColumn(table.headers, ["rankto"]);
  const itemsI = col(["items"]);
  const valuesI = col(["values"]);
  return table.rows.map((row) => ({
    condition: (row[condI] ?? "").trim(),
    minScore: scoreI >= 0 ? parseNumber(row[scoreI]) : 0,
    rankFrom: rankFromI >= 0 ? parseNumber(row[rankFromI]) : void 0,
    rankTo: rankToI >= 0 ? parseNumber(row[rankToI]) : void 0,
    items: zipItems(parseList(row[itemsI]), parseList(row[valuesI]))
  })).filter((row) => row.condition !== "");
}
function parseEquipment(forge, upgrade) {
  const out = { forge: [], upgrades: [] };
  if (forge) {
    const col = columnIndex(forge.headers);
    const keyI = col(["key"]);
    const shardI = optionalColumn(forge.headers, ["forgeshardcost"]);
    const goldI = optionalColumn(forge.headers, ["forgegoldcost"]);
    for (const row of forge.rows) {
      if ((row[keyI] ?? "").trim()) {
        const key = row[keyI].trim();
        out.forge.push({
          key,
          // Ключ вида Класс_Тип_Редкость (Melee_Weapon_Common).
          rarity: key.split("_").slice(2).join("_"),
          shardCost: shardI >= 0 ? parseNumber(row[shardI]) : 0,
          goldCost: goldI >= 0 ? parseNumber(row[goldI]) : 0
        });
      }
    }
  }
  if (upgrade) {
    const col = columnIndex(upgrade.headers);
    const tierI = col(["tier"]);
    const levelI = col(["upgradelevel"]);
    const shardI = optionalColumn(upgrade.headers, ["upgradeshardcost"]);
    const goldI = optionalColumn(upgrade.headers, ["upgradegoldcost"]);
    const succI = optionalColumn(upgrade.headers, ["successprobability"]);
    for (const row of upgrade.rows) {
      if ((row[tierI] ?? "").trim()) {
        out.upgrades.push({
          rarity: row[tierI].trim(),
          level: parseNumber(row[levelI]),
          shardCost: shardI >= 0 ? parseNumber(row[shardI]) : 0,
          goldCost: goldI >= 0 ? parseNumber(row[goldI]) : 0,
          successProbability: succI >= 0 ? parseNumber(row[succI], 1) : 1
        });
      }
    }
  }
  return out;
}
function parseRemoteDefaults(table) {
  if (!table) {
    return {};
  }
  const map = /* @__PURE__ */ new Map();
  for (const row of table.rows) {
    const key = (row[0] ?? "").trim().toLowerCase();
    if (key) {
      map.set(key, parseNumber(row[1], NaN));
    }
  }
  const out = {};
  const interval = map.get("recovery-energy-cfg-interval");
  const rate = map.get("recovery-energy-cfg-rate") ?? 1;
  if (interval !== void 0 && Number.isFinite(interval) && interval > 0) {
    out.energyPerDay = 86400 / interval * (Number.isFinite(rate) ? rate : 1);
  }
  const max = map.get("recovery-energy-cfg-max");
  if (max !== void 0 && Number.isFinite(max)) {
    out.energyMax = max;
  }
  const price = map.get("gacha-summon-price-1");
  if (price !== void 0 && Number.isFinite(price)) {
    out.summonPrice = price;
  }
  const pity = map.get("gacha-summon-pity-value");
  if (pity !== void 0 && Number.isFinite(pity)) {
    out.pity = pity;
  }
  return out;
}
function parseManualDailyIncome(table) {
  const unscaled = emptyIncome();
  const scaled = emptyIncome();
  const header = table.matrix[0] ?? [];
  const looksLikeSplit = normalizeHeader(header[0] ?? "").includes("notaffected") || normalizeHeader(header[0] ?? "").includes("\u043D\u0435\u0437\u0430\u0432\u0438\u0441");
  if (looksLikeSplit) {
    for (const row of table.matrix.slice(1)) {
      addNamedAmount(row[0], row[1], unscaled);
      addNamedAmount(row[2], row[3], scaled);
    }
  } else {
    const keyI = optionalColumn(header, ["key", "item", "resource"]);
    const valueI = optionalColumn(header, ["value", "amount"]);
    const affectedI = optionalColumn(header, ["isaffectedbyleague", "affectedbyleague"]);
    for (const row of table.matrix.slice(1)) {
      const name = keyI >= 0 ? row[keyI] : row[0];
      const value = valueI >= 0 ? row[valueI] : row[1];
      const affected = affectedI >= 0 && parseBool(row[affectedI]);
      addNamedAmount(name, value, affected ? scaled : unscaled);
    }
  }
  return { unscaled, scaled };
}
function addNamedAmount(name, raw, into) {
  const key = (name ?? "").trim();
  if (!key) {
    return;
  }
  const amount = parseNumber(raw);
  if (amount === 0) {
    return;
  }
  const kind = normalizeItemType(key);
  if (kind === "gold" || kind === "exp" || kind === "dust" || kind === "essence" || kind === "amethyst" || kind === "decor" || kind === "energy") {
    into[kind] += amount;
  }
}
function describeManualDailyIncome(income) {
  return `\u0431\u0435\u0437 \u043B\u0438\u0433\u0438: \u0437\u043E\u043B\u043E\u0442\u043E ${income.unscaled.gold}, \u043E\u043F\u044B\u0442 ${income.unscaled.exp} \xB7 \u0441 \u043B\u0438\u0433\u043E\u0439: \u0437\u043E\u043B\u043E\u0442\u043E ${income.scaled.gold}, \u043E\u043F\u044B\u0442 ${income.scaled.exp}`;
}
function normalizeItemType(itemType) {
  const raw = itemType.trim().toLowerCase();
  if (raw === "experience") {
    return "accountxp";
  }
  if (raw.includes("gold")) {
    return "gold";
  }
  if (raw.includes("essence")) {
    return "essence";
  }
  if (raw.includes("dust")) {
    return "dust";
  }
  if (raw === "heroexp" || raw === "unitexperience" || raw === "exp" || raw.includes("exp")) {
    return "exp";
  }
  if (raw === "amethyst") {
    return "amethyst";
  }
  if (raw === "decor") {
    return "decor";
  }
  if (raw === "equipment") {
    return "equipment";
  }
  if (raw === "energy") {
    return "energy";
  }
  if (raw.startsWith("arms")) {
    return raw === "armsomni" || raw === "arms" ? "arms" : "armsfaction";
  }
  if (raw === "pvp" || raw === "attack") {
    return "pvp";
  }
  if (raw.startsWith("chest")) {
    return "chest";
  }
  if (raw === "pve" || raw === "raid" || raw === "dungeon") {
    return "pve";
  }
  return raw;
}
function columnIndex(headers) {
  const normalized = headers.map(normalizeHeader);
  return (aliases) => {
    for (const alias of aliases) {
      const index = normalized.findIndex((header) => header === alias || header.startsWith(alias));
      if (index >= 0) {
        return index;
      }
    }
    throw new Error(`\u041D\u0435\u0442 \u043A\u043E\u043B\u043E\u043D\u043A\u0438 ${aliases[0]} (\u0435\u0441\u0442\u044C: ${headers.join(", ")})`);
  };
}
function optionalColumn(headers, aliases) {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const index = normalized.findIndex((header) => header === alias || header.startsWith(alias));
    if (index >= 0) {
      return index;
    }
  }
  return -1;
}
function normalizeHeader(value) {
  return value.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9а-яё]+/gi, "").trim();
}
function parseNumber(raw, fallback = 0) {
  if (raw === void 0 || raw === "") {
    return fallback;
  }
  const cleaned = raw.replace(/\\-/g, "-").replace(/\s/g, "").replace(",", ".");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : fallback;
}
function parseBool(raw) {
  const v = (raw ?? "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "\u0434\u0430" || v === "yes";
}

// src/sim/gacha.ts
var MAX_TARGET_PITY = 3;
function expectedPullsToSHero(sRate, pity) {
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
function expectedSDropsPerTarget(sHeroCount, targetPity) {
  const n = Math.max(1, sHeroCount);
  const p = 1 / n;
  if (!targetPity || n <= 1) {
    return n;
  }
  const q = 1 - p;
  return (1 - q ** (MAX_TARGET_PITY + 1)) / p;
}
function computeGachaEv(gacha, tierUps, params) {
  const pullsToS = expectedPullsToSHero(gacha.sHero, params.gachaPity);
  const sDropsPerTarget = expectedSDropsPerTarget(params.sHeroCount, params.targetHeroPity > 0);
  const pullsToNamedShard = pullsToS * sDropsPerTarget;
  const emblemsPerArmsDrop = Math.max(1e-4, gacha.armsAvgAmount);
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
    expPerPull: gacha.heroExp * gacha.heroExpAvgAmount
  };
}
function pullsForTierUp(row, ev, heroCount, stockShards, haveArms) {
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

// src/sim/income.ts
function armsShareFor(config, params) {
  const total = Math.max(1, config.gacha.armsFactionCount);
  return Math.min(1, Math.max(1, params.factionCount) / total);
}
function addItem(bag, item, amount, ctx) {
  if (amount === 0) {
    return;
  }
  const kind = normalizeItemType(item);
  switch (kind) {
    case "gold":
      bag.gold += ctx.goldMult ? amount * ctx.league.goldIncomeMultiplier : amount;
      break;
    case "exp":
    case "essence":
    case "dust":
    case "amethyst":
    case "decor":
    case "equipment":
    case "energy":
      bag[kind] += amount;
      break;
    case "accountxp":
      bag.accountXp += amount;
      break;
    case "arms":
      bag.arms += amount;
      break;
    case "armsfaction":
      bag.arms += amount * ctx.armsShare;
      break;
    case "chest":
      if (ctx.slotChest) {
        const add = scaleIncome(ctx.slotChest, amount);
        const target = bag;
        Object.assign(target, addIncome(target, add));
      }
      break;
    default:
      break;
  }
}
function addItems(bag, items, factor, ctx) {
  for (const reward of items) {
    addItem(bag, reward.item, reward.amount * factor, ctx);
  }
}
function chestEv(table, roll, ctx) {
  const bag = emptyIncome();
  const rarities = RARITY_COLUMNS.filter((r) => table[r] !== void 0);
  if (rarities.length === 0) {
    return bag;
  }
  const weights = /* @__PURE__ */ new Map();
  let sum = 0;
  for (const rarity of rarities) {
    const w = roll ? roll[rarity] ?? 0 : 1;
    weights.set(rarity, w);
    sum += w;
  }
  if (sum <= 0) {
    for (const rarity of rarities) {
      weights.set(rarity, 1);
    }
    sum = rarities.length;
  }
  for (const rarity of rarities) {
    const w = (weights.get(rarity) ?? 0) / sum;
    if (w <= 0) {
      continue;
    }
    for (const slot of table[rarity]) {
      for (const entry of slot) {
        if (entry.item.toLowerCase() === "empty") {
          continue;
        }
        addItem(bag, entry.item, w * entry.probability * entry.value, ctx);
      }
    }
  }
  return bag;
}
function slotProbabilityOf(drops, kind) {
  const total = drops.reduce((acc, d) => acc + d.probability, 0) || 1;
  let chance = 0;
  for (const drop of drops) {
    if (normalizeItemType(drop.itemType) === kind) {
      chance += drop.probability / total * Math.max(drop.value, 1);
    }
  }
  return chance;
}
function computeDailyIncome(config, league, params) {
  const armsShare = armsShareFor(config, params);
  const baseCtx = { league, goldMult: true, armsShare };
  const slotChestEv = chestEv(config.chests.slot, config.chests.rarityRoll.slot, baseCtx);
  const pvpChestEv = chestEv(config.chests.pvp, config.chests.rarityRoll.pvp, baseCtx);
  const ctx = { ...baseCtx, slotChest: slotChestEv };
  const noMultCtx = { ...ctx, goldMult: false };
  const pX3 = config.slotSpin.x3;
  const dropTotal = config.slotDrops.reduce((acc, d) => acc + d.probability, 0) || 1;
  const perSpinSlots = emptyIncome();
  let slotChestsPerSpin = 0;
  for (const drop of config.slotDrops) {
    const kind = normalizeItemType(drop.itemType);
    const weight = drop.probability / dropTotal * pX3;
    if (kind === "chest") {
      slotChestsPerSpin += weight * Math.max(drop.value, 1);
    } else {
      addItem(perSpinSlots, drop.itemType, weight * drop.value, ctx);
    }
  }
  const pvpFightsPerSpin = slotProbabilityOf(config.slotDrops, "pvp") * pX3;
  const opensChest = pvpOpensChest(config, league);
  const pvpChestPerWin = opensChest ? 1 : 0;
  const fromDaily = dailyRewardsIncome(config, params, ctx);
  const fromTasks = tasksIncome(config, params, ctx);
  const fromCastle = castleIncome(config, params, noMultCtx);
  const fromManual = manualIncome(config, params, league);
  const fromOther = { ...params.otherDaily };
  const constantIncome = [fromDaily, fromTasks, fromCastle, fromManual, fromOther].reduce(addIncome, emptyIncome());
  const cost = Math.max(1e-9, params.spinEnergyCost);
  const slotEnergyPerSpin = perSpinSlots.energy;
  const energyReturnPerSpin = slotEnergyPerSpin + slotChestsPerSpin * slotChestEv.energy + pvpFightsPerSpin * params.winRate * pvpChestPerWin * pvpChestEv.energy;
  const denom = cost - energyReturnPerSpin;
  const constantEnergy = params.energyPerDay + constantIncome.energy;
  const spins = denom > 1e-9 ? constantEnergy / denom : constantEnergy / cost;
  const fromSlots = scaleIncome(perSpinSlots, spins);
  const slotChests = spins * slotChestsPerSpin;
  const fromSlotChests = scaleIncome(slotChestEv, slotChests);
  const pvpFights = spins * pvpFightsPerSpin;
  const pvpWins = pvpFights * params.winRate;
  const pvpLosses = pvpFights * (1 - params.winRate);
  const fromPvp = emptyIncome();
  const winReward = pvpMatchReward(config, league, "Win");
  const lossReward = pvpMatchReward(config, league, "Loss");
  Object.assign(fromPvp, addIncome(scaleIncome(winReward, pvpWins), scaleIncome(lossReward, pvpLosses)));
  const pvpChests = pvpWins * pvpChestPerWin;
  const fromPvpChests = scaleIncome(pvpChestEv, pvpChests);
  const chestsOpened = slotChests + pvpChests;
  const fromEvents = eventsIncome(config, params, noMultCtx, {
    SlotMachineSpins: spins,
    ChestOpenings: chestsOpened,
    AttackingPvpWins: pvpWins
  });
  const xp = config.accountXp;
  const actionXp = emptyIncome();
  actionXp.accountXp = spins * xp.xpSpin + pvpWins * xp.xpBattleWin + xp.xpDailyAll;
  const total = [
    fromSlots,
    fromPvp,
    fromSlotChests,
    fromPvpChests,
    fromEvents,
    actionXp,
    constantIncome
  ].reduce(addIncome, emptyIncome());
  total.energy = 0;
  return {
    spins,
    regenEnergy: params.energyPerDay,
    chestEnergy: slotChests * slotChestEv.energy + pvpChests * pvpChestEv.energy,
    slotEnergy: spins * slotEnergyPerSpin,
    dailyEnergy: constantIncome.energy,
    energyReturnPerSpin,
    pvpFights,
    pvpWins,
    pvpLosses,
    chestsOpened,
    slotChests,
    pvpChests,
    fromSlots,
    fromPvp,
    fromSlotChests,
    fromPvpChests,
    fromDaily,
    fromTasks,
    fromCastle,
    fromEvents,
    fromOther: addIncome(fromManual, fromOther),
    total
  };
}
function pvpMatchReward(config, league, result) {
  const exact = config.pvpRewards.find((row2) => row2.leagueId === league.id && row2.result === result);
  const fallback = config.pvpRewards.find((row2) => row2.result === result);
  const row = exact ?? fallback;
  const out = emptyIncome();
  if (!row) {
    return out;
  }
  out.gold = row.gold * league.goldIncomeMultiplier;
  out.exp = row.exp * league.expIncomeMultiplier;
  out.essence = row.essence;
  out.dust = row.dust;
  return out;
}
function pvpOpensChest(config, league) {
  const exact = config.pvpRewards.find((row) => row.leagueId === league.id && row.result === "Win");
  const fallback = config.pvpRewards.find((row) => row.result === "Win");
  return (exact ?? fallback)?.opensChest ?? true;
}
function dailyRewardsIncome(config, params, ctx) {
  const out = emptyIncome();
  const daily = config.dailyRewards;
  if (daily.days.length === 0) {
    return out;
  }
  const perDay = 1 / daily.cycleDays;
  for (const day of daily.days) {
    addItems(out, day.free, perDay, ctx);
    if (params.premiumDaily > 0) {
      addItems(out, day.premium, perDay, ctx);
    }
  }
  for (const bonus of daily.weekly) {
    addItems(out, bonus.items, perDay, ctx);
  }
  return out;
}
function tasksIncome(config, params, ctx) {
  const out = emptyIncome();
  const pct = Math.max(0, params.taskCompletionPct) / 100;
  for (const task of config.tasks) {
    const type = task.type.toLowerCase();
    if (type === "daily") {
      addItem(out, task.reward.item, task.reward.amount * pct, ctx);
    } else if (type === "weekly") {
      addItem(out, task.reward.item, task.reward.amount * pct / 7, ctx);
    }
  }
  return out;
}
function castleIncome(config, params, ctx) {
  const out = emptyIncome();
  if (config.castle.length === 0 || params.castlesActive <= 0) {
    return out;
  }
  const castles = [];
  for (const row of config.castle) {
    if (!castles.includes(row.castleId)) {
      castles.push(row.castleId);
    }
  }
  const active = castles.slice(0, Math.max(0, Math.round(params.castlesActive)));
  for (const castle of active) {
    const rows = config.castle.filter((row2) => row2.castleId === castle && row2.level <= params.castleLevel).sort((a, b) => b.level - a.level);
    const row = rows[0] ?? config.castle.find((r) => r.castleId === castle);
    if (row) {
      addItems(out, row.items, Math.max(0, params.castleCollectsPerDay), ctx);
    }
  }
  return out;
}
function manualIncome(config, params, league) {
  const out = emptyIncome();
  if (params.useManualDailyIncome <= 0 || !config.manualDailyIncome) {
    return out;
  }
  const { unscaled, scaled } = config.manualDailyIncome;
  Object.assign(out, addIncome(unscaled, {
    ...scaled,
    gold: scaled.gold * league.goldIncomeMultiplier,
    exp: scaled.exp * league.expIncomeMultiplier
  }));
  return out;
}
function eventsIncome(config, params, ctx, activityPerDay) {
  const out = emptyIncome();
  if (params.miniEventsOn <= 0 || config.miniEvents.length === 0) {
    return out;
  }
  const durations = config.miniEvents.map((event) => event.defaultDays === 3 ? 3 : Math.max(1, params.miniEventDays));
  const cycle = durations.reduce((a, b) => a + b, 0);
  config.miniEvents.forEach((event, index) => {
    for (const milestone of event.milestones) {
      if (milestone.rankFrom !== void 0 && milestone.rankTo !== void 0) {
        const rank = params.miniEventRank;
        if (rank > 0 && rank >= milestone.rankFrom && rank <= milestone.rankTo) {
          addItems(out, milestone.items, 1 / cycle, ctx);
        }
        continue;
      }
      const perDay = activityPerDay[milestone.condition];
      if (perDay !== void 0 && perDay * durations[index] + 1e-9 >= milestone.minScore) {
        addItems(out, milestone.items, 1 / cycle, ctx);
      }
    }
  });
  return out;
}

// src/sim/simulate.ts
function runSimulation(config, params) {
  const gacha = computeGachaEv(config.gacha, config.tierUps, params);
  const notes = [...config.notes];
  const maxLevel = config.levels.reduce((max, row) => Math.max(max, row.level), 1);
  const byLevel = new Map(config.levels.map((row) => [row.level, row]));
  const pendingTiers = assignTierUps(config);
  const incomeByLeague = config.leagues.map((league) => ({
    leagueName: league.name || league.id,
    income: computeDailyIncome(config, league, params)
  }));
  const equipment = equipmentPlan(config, params, notes);
  const equipmentGoldPerStep = equipment ? equipment.goldTotal / Math.max(1, maxLevel - 1) : 0;
  let day = 0;
  let leagueIndex = clampLeagueIndex(params.startLeagueIndex, config.leagues.length);
  let pendingLeagueIndex = null;
  let rating = Math.max(0, params.startRating);
  const xpCfg = config.accountXp;
  const state = {
    inventory: emptyResources(),
    shardStock: 0,
    squadLevel: 1,
    accountXp: 0,
    accountLevel: 1,
    accountThreshold: accountTarget(xpCfg.base, xpCfg.growth, 1)
  };
  const checkpointDays = /* @__PURE__ */ new Map();
  const stallAcc = /* @__PURE__ */ new Map();
  const daysInLeague = config.leagues.map(() => 0);
  for (const cp of params.checkpoints) {
    if (state.squadLevel >= cp) {
      checkpointDays.set(cp, 0);
    }
  }
  while (day < params.maxDays && state.squadLevel < maxLevel) {
    day += 1;
    if (pendingLeagueIndex !== null) {
      leagueIndex = pendingLeagueIndex;
      pendingLeagueIndex = null;
    }
    daysInLeague[leagueIndex] = (daysInLeague[leagueIndex] ?? 0) + 1;
    const income = incomeByLeague[Math.min(leagueIndex, incomeByLeague.length - 1)]?.income ?? computeDailyIncome(config, config.leagues[leagueIndex], params);
    state.inventory = addResources(state.inventory, income.total);
    addAccountXp(state, config, income.total.accountXp, config.leagues[leagueIndex], params);
    const league = config.leagues[leagueIndex];
    rating = Math.max(0, rating + income.pvpWins * (league?.winRating ?? 0) + income.pvpLosses * (league?.lossRating ?? 0));
    spendDay({
      pendingTiers,
      byLevel,
      state,
      daily: income.total,
      params,
      config,
      gacha,
      equipmentGoldPerStep,
      stallAcc,
      onLevel: (next) => {
        for (const cp of params.checkpoints) {
          if (next >= cp && !checkpointDays.has(cp)) {
            checkpointDays.set(cp, day);
          }
        }
      },
      league
    });
    let nextLeagueIndex = leagueIndexForRating(config.leagues, rating);
    if (params.weeklyResetEveryDays > 0 && day % params.weeklyResetEveryDays === 0) {
      const ended = config.leagues[leagueIndexForRating(config.leagues, rating)];
      state.inventory.amethyst += ended?.resetRewardAmethysts ?? 0;
      rating = Math.max(0, Math.min(rating, ended?.resetRating ?? rating));
      nextLeagueIndex = leagueIndexForRating(config.leagues, rating);
    }
    if (nextLeagueIndex !== leagueIndex) {
      pendingLeagueIndex = nextLeagueIndex;
    }
  }
  if (state.squadLevel >= maxLevel) {
    for (const cp of params.checkpoints) {
      if (cp <= maxLevel && !checkpointDays.has(cp)) {
        checkpointDays.set(cp, day);
      }
    }
  }
  const unreachable = params.checkpoints.filter((level) => level > maxLevel);
  if (unreachable.length > 0) {
    notes.push(`LevelProgression \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043D\u0430 ${maxLevel}, \u043D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B: ${unreachable.join(", ")}.`);
  }
  if (config.gacha.overflow.length > 0) {
    notes.push("HeroOverflowCap \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D, \u043D\u043E \u0438\u0437\u0431\u044B\u0442\u043E\u043A \u043E\u0441\u043A\u043E\u043B\u043A\u043E\u0432 \u2192 \u0430\u043C\u0435\u0442\u0438\u0441\u0442\u044B \u0432 \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u0438 \u043D\u0435 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F (\u043D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u043E \u0441\u043E\u0441\u0442\u0430\u0432\u0435 \u043F\u0443\u043B\u0430 \u0433\u0435\u0440\u043E\u0435\u0432).");
  }
  const stalls = [...stallAcc.values()].sort((a, b) => b.days - a.days);
  const finalLeague = config.leagues[Math.min(leagueIndex, config.leagues.length - 1)];
  return {
    daysRun: day,
    finalLevel: state.squadLevel,
    maxLevel,
    finalLeagueName: finalLeague?.name || finalLeague?.id || "\u2014",
    finalRating: rating,
    accountLevel: state.accountLevel,
    inventory: state.inventory,
    checkpoints: params.checkpoints.map((level) => ({
      level,
      day: checkpointDays.get(level) ?? null
    })),
    stalls,
    bottleneck: describeBottleneck(stalls, maxLevel),
    gacha,
    incomeByLeague,
    daysInLeagues: config.leagues.map((row, index) => ({
      leagueName: row.name || row.id,
      days: daysInLeague[index] ?? 0
    })),
    equipment,
    notes
  };
}
function accountTarget(base, growth, level) {
  return Math.max(1, Math.floor(base * level ** growth));
}
function addAccountXp(state, config, xp, league, params) {
  if (xp <= 0) {
    return;
  }
  state.accountXp += xp;
  const cfg = config.accountXp;
  const ctx = { league, goldMult: false, armsShare: armsShareFor(config, params) };
  let guard = 0;
  while (state.accountXp >= state.accountThreshold && guard < 1e4) {
    guard += 1;
    state.accountLevel += 1;
    state.accountThreshold += accountTarget(cfg.base, cfg.growth, state.accountLevel);
    const bag = emptyIncome();
    for (const reward of config.levelRewards) {
      addItem(bag, reward.item, reward.amount, ctx);
    }
    state.inventory = addResources(state.inventory, bag);
  }
}
function spendDay(input) {
  const { pendingTiers, byLevel, state, daily, params, config, gacha, equipmentGoldPerStep, stallAcc, onLevel, league } = input;
  const maxLevel = [...byLevel.keys()].reduce((max, level) => Math.max(max, level), 1);
  const xpUpgrade = config.accountXp.xpUpgrade;
  let progressed = true;
  while (progressed) {
    progressed = false;
    const unpaid = pendingTiers.find((tier) => !tier.paid && state.squadLevel >= tier.afterLevel);
    if (unpaid) {
      const pulls = pullsForTierUp(unpaid.row, gacha, params.heroCount, state.shardStock, state.inventory.arms);
      const dustNeed = Number.isFinite(pulls) ? pulls * params.dustPerPull : Number.POSITIVE_INFINITY;
      if (state.inventory.dust + 1e-9 >= dustNeed) {
        state.inventory.dust -= dustNeed;
        state.inventory.exp += pulls * gacha.expPerPull;
        state.shardStock += pulls * gacha.shardsPerPull - params.heroCount * unpaid.row.shards;
        state.inventory.arms += pulls * gacha.armsPerPull - params.heroCount * unpaid.row.arms;
        unpaid.paid = true;
        progressed = true;
        continue;
      }
      const nextRow = byLevel.get(state.squadLevel + 1);
      const need2 = { ...emptyResources(), dust: Number.isFinite(dustNeed) ? dustNeed : 1e15 };
      const surplusNeed = nextRow ? addResources(need2, levelNeed(nextRow, params, equipmentGoldPerStep)) : need2;
      recordStall(stallAcc, state.squadLevel, "dust", state.inventory, surplusNeed);
      break;
    }
    const nextLevel = state.squadLevel + 1;
    const row = byLevel.get(nextLevel);
    if (!row) {
      if (state.squadLevel < maxLevel) {
        throw new Error(`LevelProgression: \u043D\u0435\u0442 \u0443\u0440\u043E\u0432\u043D\u044F ${nextLevel}`);
      }
      break;
    }
    const need = levelNeed(row, params, equipmentGoldPerStep);
    if (canAfford(state.inventory, need)) {
      state.inventory = subtractResources(state.inventory, need);
      state.squadLevel = nextLevel;
      if (xpUpgrade > 0) {
        addAccountXp(state, config, xpUpgrade * params.heroCount, league, params);
      }
      onLevel(state.squadLevel);
      progressed = true;
      continue;
    }
    const limiting = limitingResource(state.inventory, need, daily);
    recordStall(stallAcc, state.squadLevel, limiting, state.inventory, need);
    break;
  }
}
function levelNeed(row, params, equipmentGoldPerStep) {
  const need = scaleResources(levelCost(row), params.heroCount);
  need.gold += equipmentGoldPerStep;
  return need;
}
function leagueIndexForRating(leagues, rating) {
  let best = 0;
  for (let i = 0; i < leagues.length; i++) {
    const league = leagues[i];
    if (rating + 1e-9 >= league.minRating) {
      best = i;
      if (league.maxRating > 0 && rating <= league.maxRating) {
        break;
      }
    }
  }
  return best;
}
function clampLeagueIndex(index, count) {
  if (count <= 0) {
    return 0;
  }
  return Math.min(count - 1, Math.max(0, Math.floor(index)));
}
function levelCost(row) {
  return {
    ...emptyResources(),
    gold: row.goldCost,
    exp: row.isBreakthrough ? 0 : row.expCost,
    essence: row.isBreakthrough ? row.essenceCost : 0
  };
}
function equipmentPlan(config, params, notes) {
  if (params.equipmentTargetLevel <= 0) {
    if (config.equipment) {
      notes.push("\u0422\u0430\u0431\u043B\u0438\u0446\u044B \u044D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0438 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B, \u043D\u043E \xAB\u0426\u0435\u043B\u0435\u0432\u043E\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u044D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0438\xBB = 0 \u2014 \u0441\u0442\u043E\u043A \u0437\u043E\u043B\u043E\u0442\u0430 \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D.");
    }
    return null;
  }
  if (!config.equipment) {
    notes.push("\u0417\u0430\u0434\u0430\u043D \u0446\u0435\u043B\u0435\u0432\u043E\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u044D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0438, \u043D\u043E \u0442\u0430\u0431\u043B\u0438\u0446\u044B EquipmentForgeConfig/EquipmentUpgradeConfig \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B (\u0432 \u043F\u0440\u043E\u0434\u0435 \u0438\u0445 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442) \u2014 \u0441\u0442\u043E\u043A \u043D\u0435 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F.");
    return null;
  }
  const pieces = params.heroCount * Math.max(0, params.equipmentPiecesPerHero);
  const forgeAll = config.equipment.forge;
  const rarityForge = forgeAll.filter((r) => r.rarity.toLowerCase() === params.equipmentRarity.toLowerCase());
  const forge = rarityForge.length > 0 ? rarityForge : forgeAll;
  const forgeGold = forge.length > 0 ? forge.reduce((a, r) => a + r.goldCost, 0) / forge.length : 0;
  const forgeShards = forge.length > 0 ? forge.reduce((a, r) => a + r.shardCost, 0) / forge.length : 0;
  let upGold = 0;
  let upShards = 0;
  for (const row of config.equipment.upgrades) {
    if (row.rarity.toLowerCase() === params.equipmentRarity.toLowerCase() && row.level >= 1 && row.level <= params.equipmentTargetLevel) {
      const success = row.successProbability > 0 ? Math.min(1, row.successProbability) : 1;
      upGold += row.goldCost / success;
      upShards += row.shardCost / success;
    }
  }
  const goldTotal = pieces * (forgeGold + upGold);
  const shardsTotal = pieces * (forgeShards + upShards);
  if (shardsTotal > 0) {
    notes.push(`\u042D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0430 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u0435\u0449\u0451 ${Math.round(shardsTotal).toLocaleString("ru-RU")} \u043E\u0441\u043A\u043E\u043B\u043A\u043E\u0432 \u043A\u0443\u0437\u043D\u0438 \u2014 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A \u043E\u0441\u043A\u043E\u043B\u043A\u043E\u0432 \u0432 \u0442\u0430\u0431\u043B\u0438\u0446\u0430\u0445 \u043D\u0435 \u043E\u043F\u0438\u0441\u0430\u043D, \u0432 \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u0438 \u043E\u043D\u0438 \u0441\u0447\u0438\u0442\u0430\u044E\u0442\u0441\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u043C\u0438.`);
  }
  return { pieces, goldTotal, shardsTotal };
}
function assignTierUps(config) {
  const breakthroughs = config.levels.filter((row) => row.isBreakthrough).map((row) => row.level).sort((a, b) => a - b);
  const ups = config.tierUps;
  if (ups.length === 0 || breakthroughs.length === 0) {
    return [];
  }
  const pending = [];
  let i = 0;
  for (let b = 0; b < breakthroughs.length; b++) {
    const remainingBreaks = breakthroughs.length - b;
    const remainingUps = ups.length - i;
    const share = Math.ceil(remainingUps / remainingBreaks);
    const slice = ups.slice(i, i + share);
    i += share;
    for (const row of slice) {
      pending.push({ afterLevel: breakthroughs[b], row, paid: false });
    }
  }
  return pending;
}
function limitingResource(have, need, daily) {
  let worst = "gold";
  let worstDays = -1;
  for (const id of RESOURCE_IDS) {
    const deficit = need[id] - have[id];
    if (deficit <= 1e-9) {
      continue;
    }
    const rate = daily[id];
    const days = rate > 1e-9 ? deficit / rate : Number.POSITIVE_INFINITY;
    if (days > worstDays) {
      worstDays = days;
      worst = id;
    }
  }
  return worst;
}
function recordStall(acc, squadLevel, limiting, have, need) {
  const key = `${squadLevel}:${limiting}`;
  const surplus = {};
  for (const id of RESOURCE_IDS) {
    if (id === limiting) {
      continue;
    }
    if (need[id] > 1e-9) {
      surplus[id] = have[id] / need[id] - 1;
    }
  }
  const existing = acc.get(key);
  if (existing) {
    existing.days += 1;
    return;
  }
  acc.set(key, { squadLevel, days: 1, limiting, surplus });
}
function describeBottleneck(stalls, maxLevel) {
  if (stalls.length === 0) {
    return `\u0423\u0437\u043A\u0438\u0445 \u043C\u0435\u0441\u0442 \u043D\u0435\u0442 \u2014 \u043E\u0442\u0440\u044F\u0434 \u0434\u043E\u0448\u0451\u043B \u0434\u043E \u0443\u0440\u043E\u0432\u043D\u044F ${maxLevel} \u0431\u0435\u0437 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F.`;
  }
  const top = stalls[0];
  const label = RESOURCE_LABELS[top.limiting];
  const surplusParts = [];
  for (const id of RESOURCE_IDS) {
    const value = top.surplus[id];
    if (value === void 0) {
      continue;
    }
    const pct = Math.round(value * 100);
    if (pct > 0) {
      surplusParts.push(`${RESOURCE_LABELS[id]} \u0432 \u043F\u0440\u043E\u0444\u0438\u0446\u0438\u0442\u0435 (+${pct}%)`);
    }
  }
  const extra = surplusParts.length > 0 ? ` ${surplusParts.join(", ")}.` : "";
  return `\u041D\u0430 \u0443\u0440\u043E\u0432\u043D\u0435 ${top.squadLevel} \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u043B\u0441\u044F \u043D\u0430 ${formatDays(top.days)} \u0438\u0437-\u0437\u0430 \u043D\u0435\u0445\u0432\u0430\u0442\u043A\u0438: ${label}.${extra}`;
}
function formatDays(days) {
  const n = Math.round(days);
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${n} \u0434\u0435\u043D\u044C`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${n} \u0434\u043D\u044F`;
  }
  return `${n} \u0434\u043D\u0435\u0439`;
}
function simulationReportCsv(result) {
  const lines = ["section,key,value"];
  lines.push(`meta,daysRun,${result.daysRun}`);
  lines.push(`meta,finalLevel,${result.finalLevel}`);
  lines.push(`meta,maxLevel,${result.maxLevel}`);
  lines.push(`meta,finalLeague,${csvCell(result.finalLeagueName)}`);
  lines.push(`meta,finalRating,${result.finalRating}`);
  lines.push(`meta,accountLevel,${result.accountLevel}`);
  for (const cp of result.checkpoints) {
    lines.push(`checkpoint,${cp.level},${cp.day ?? ""}`);
  }
  lines.push(`bottleneck,text,${csvCell(result.bottleneck)}`);
  for (const stall of result.stalls) {
    lines.push(`stall,${stall.squadLevel}:${stall.limiting},${stall.days}`);
  }
  for (const row of result.daysInLeagues) {
    lines.push(`leagueDays,${csvCell(row.leagueName)},${row.days}`);
  }
  lines.push(`gacha,dustPerNamedShard,${result.gacha.dustPerNamedShard}`);
  lines.push(`gacha,dustPerFactionEmblem,${result.gacha.dustPerFactionEmblem}`);
  lines.push(`gacha,dustPerSquadFullAscension,${result.gacha.dustPerSquadFullAscension}`);
  for (const row of result.incomeByLeague) {
    const t = row.income.total;
    lines.push(`income,${csvCell(row.leagueName)} spins,${row.income.spins}`);
    for (const id of ALL_RESOURCE_IDS) {
      lines.push(`income,${csvCell(row.leagueName)} ${id},${t[id]}`);
    }
  }
  for (const id of ALL_RESOURCE_IDS) {
    lines.push(`inventory,${id},${result.inventory[id]}`);
  }
  return `${lines.join("\n")}
`;
}
function csvCell(value) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// src/ConfigTablesApp.ts
var REQUIRED_TABLES = CONFIG_TABLES.filter((table) => table.required);
var ConfigTablesApp = class {
  parsedTables = /* @__PURE__ */ new Map();
  rowUi = /* @__PURE__ */ new Map();
  rowGeneration = /* @__PURE__ */ new Map();
  dirtyIds = /* @__PURE__ */ new Set();
  paramInputs = /* @__PURE__ */ new Map();
  /** Параметры, которые пользователь поменял руками — значения из CommonRemoteConfigs их не затирают. */
  touchedParams = /* @__PURE__ */ new Set();
  root;
  loadButton;
  runButton;
  summaryEl;
  resultsEl;
  loadGeneration = 0;
  lastResult = null;
  constructor(parentElement) {
    this.root = this.createRoot();
    this.loadButton = this.root.querySelector("[data-load-all]");
    this.runButton = this.root.querySelector("[data-run-sim]");
    this.summaryEl = this.root.querySelector("[data-summary]");
    this.resultsEl = this.root.querySelector("[data-results]");
    parentElement.appendChild(this.root);
    this.bind();
    void this.loadAll();
  }
  getTable(id) {
    const table = this.parsedTables.get(id);
    if (!table) {
      return void 0;
    }
    return {
      headers: [...table.headers],
      rows: table.rows.map((row) => [...row]),
      matrix: table.matrix.map((row) => [...row])
    };
  }
  bind() {
    this.loadButton.addEventListener("click", () => {
      void this.loadAll();
    });
    this.runButton.addEventListener("click", () => {
      this.runSim();
    });
  }
  createRoot() {
    const root = document.createElement("div");
    root.style.cssText = [
      "width: min(1100px, 96vw)",
      "color: #e8e8e8",
      "font-family: Segoe UI, Tahoma, sans-serif",
      "background: #141414",
      "border: 1px solid #333",
      "border-radius: 8px",
      "padding: 16px",
      "box-sizing: border-box"
    ].join(";");
    const title = document.createElement("h2");
    title.textContent = "HoC Balance \u2014 \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u044F (\u0430\u043B\u044C\u0444\u0430) V3";
    title.style.cssText = "margin: 0 0 8px; font-size: 20px; font-weight: 600;";
    root.appendChild(title);
    const intro = document.createElement("p");
    intro.textContent = "EV-\u0441\u0438\u043C\u0443\u043B\u044F\u0442\u043E\u0440 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0433\u043E \u0434\u043D\u044F: \u0441\u043B\u043E\u0442\u044B (X1/X3) + \u0441\u0443\u043D\u0434\u0443\u043A\u0438 + \u0430\u0440\u0435\u043D\u0430 + \u0433\u0430\u0447\u0430 + \u0437\u0430\u043C\u043A\u0438, \u043D\u0430\u0433\u0440\u0430\u0434\u044B, \u0437\u0430\u0434\u0430\u043D\u0438\u044F, \u043C\u0438\u043D\u0438-\u0438\u0432\u0435\u043D\u0442\u044B. \u041B\u0438\u0433\u0438 \u043F\u043E \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0443 \u0441 \u0435\u0436\u0435\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u044B\u043C \u0441\u0431\u0440\u043E\u0441\u043E\u043C \u0441\u0435\u0437\u043E\u043D\u0430. 5 \u0433\u0435\u0440\u043E\u0435\u0432 \u043A\u0430\u0447\u0430\u044E\u0442\u0441\u044F \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u043D\u043E. \u0422\u0430\u0431\u043B\u0438\u0446\u044B \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u2014 \u043F\u0440\u043E\u0434 (RemoteSheetsList).";
    intro.style.cssText = "margin: 0 0 14px; font-size: 14px; line-height: 1.45; color: #cfcfcf;";
    root.appendChild(intro);
    root.appendChild(this.createTablesSection());
    root.appendChild(this.createParamsSection());
    const controls = document.createElement("div");
    controls.style.cssText = "display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 0 0 14px;";
    controls.append(
      this.makeButton("\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0442\u0430\u0431\u043B\u0438\u0446\u044B", "data-load-all"),
      this.makeButton("\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u044E", "data-run-sim")
    );
    const summary = document.createElement("span");
    summary.setAttribute("data-summary", "");
    summary.style.cssText = "font-size: 13px; color: #9e9e9e;";
    controls.appendChild(summary);
    root.appendChild(controls);
    const results = document.createElement("div");
    results.setAttribute("data-results", "");
    root.appendChild(results);
    return root;
  }
  createTablesSection() {
    const details = document.createElement("details");
    details.open = true;
    details.style.cssText = "margin-bottom: 14px;";
    const summary = document.createElement("summary");
    summary.textContent = "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u0442\u0430\u0431\u043B\u0438\u0446\u044B";
    summary.style.cssText = "cursor: pointer; font-weight: 600; font-size: 14px; margin-bottom: 10px;";
    details.appendChild(summary);
    const list = document.createElement("div");
    list.style.cssText = "display: flex; flex-direction: column; gap: 10px;";
    const groups = [];
    for (const table of CONFIG_TABLES) {
      if (!groups.includes(table.group)) {
        groups.push(table.group);
      }
    }
    for (const group of groups) {
      const heading = document.createElement("div");
      heading.textContent = CONFIG_GROUP_LABELS[group];
      heading.style.cssText = "margin-top: 6px; font-size: 12px; font-weight: 600; color: #8fb4e8; text-transform: uppercase; letter-spacing: 0.04em;";
      list.appendChild(heading);
      for (const table of CONFIG_TABLES.filter((t) => t.group === group)) {
        list.appendChild(this.createTableRow(table));
      }
    }
    details.appendChild(list);
    return details;
  }
  createParamsSection() {
    const wrap = document.createElement("div");
    wrap.style.cssText = "margin-bottom: 14px; padding: 12px; border: 1px solid #2a2a2a; border-radius: 6px; background: #181818;";
    const heading = document.createElement("div");
    heading.textContent = "\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u0438";
    heading.style.cssText = "font-weight: 600; font-size: 14px; margin-bottom: 10px;";
    wrap.appendChild(heading);
    const grid = document.createElement("div");
    grid.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;";
    const p = DEFAULT_SIM_PARAMS;
    grid.append(
      this.paramField("heroCount", "\u0413\u0435\u0440\u043E\u0438 \u0432 \u043E\u0442\u0440\u044F\u0434\u0435", p.heroCount, 1),
      this.paramField("energyPerDay", "\u0420\u0435\u0433\u0435\u043D \u044D\u043D\u0435\u0440\u0433\u0438\u0438 / \u0441\u0443\u0442\u043A\u0438", p.energyPerDay, 1),
      this.paramField("spinEnergyCost", "\u042D\u043D\u0435\u0440\u0433\u0438\u0438 \u0437\u0430 \u0441\u043F\u0438\u043D", p.spinEnergyCost, 1),
      this.paramField("winRatePct", "\u0412\u0438\u043D\u0440\u0435\u0439\u0442 PvP %", Number((p.winRate * 100).toFixed(2)), 1),
      this.paramField("dustPerPull", "\u041F\u044B\u043B\u044C \u0437\u0430 1 \u043A\u0440\u0443\u0442\u043A\u0443 (gacha-summon-price-1)", p.dustPerPull, 1),
      this.paramField("sHeroCount", "\u0413\u0435\u0440\u043E\u0438 S \u0432 \u043F\u0443\u043B\u0435", p.sHeroCount, 1),
      this.paramField("factionCount", "\u0424\u0440\u0430\u043A\u0446\u0438\u0439 \u0441\u0440\u0435\u0434\u0438 \u0433\u0435\u0440\u043E\u0435\u0432 \u043E\u0442\u0440\u044F\u0434\u0430 (\u0433\u0435\u0440\u0431\u044B)", p.factionCount, 1),
      this.paramField("gachaPity", "\u0413\u0430\u0440\u0430\u043D\u0442 S (gacha-summon-pity-value)", p.gachaPity, 1),
      this.paramField("targetHeroPity", "\u0426\u0435\u043B\u0435\u0432\u043E\u0439 S-\u0433\u0435\u0440\u043E\u0439: \u0433\u0430\u0440\u0430\u043D\u0442 \u043F\u043E\u0441\u043B\u0435 3 \u043F\u0440\u043E\u043C\u0430\u0445\u043E\u0432 (1/0)", p.targetHeroPity, 1),
      this.paramField("startLeagueIndex", "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u043B\u0438\u0433\u0430 (1 = \u0411\u0440\u043E\u043D\u0437\u0430)", p.startLeagueIndex + 1, 1),
      this.paramField("startRating", "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u0439 \u0440\u0435\u0439\u0442\u0438\u043D\u0433", p.startRating, 1),
      this.paramField("weeklyResetEveryDays", "\u0421\u0431\u0440\u043E\u0441 \u0441\u0435\u0437\u043E\u043D\u0430 \u043A\u0430\u0436\u0434\u044B\u0435 N \u0434\u043D\u0435\u0439 (\u0441\u0435\u0440\u0432\u0435\u0440: 7)", p.weeklyResetEveryDays, 1),
      this.paramField("maxDays", "\u041C\u0430\u043A\u0441. \u0434\u043D\u0435\u0439", p.maxDays, 1)
    );
    wrap.appendChild(grid);
    const incomeHeading = document.createElement("div");
    incomeHeading.textContent = "\u0414\u043E\u043F. \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438 \u0434\u043E\u0445\u043E\u0434\u0430 \u0438 \u0441\u0442\u043E\u043A\u0438";
    incomeHeading.style.cssText = "font-weight: 600; font-size: 13px; margin: 12px 0 8px; color: #d0d0d0;";
    wrap.appendChild(incomeHeading);
    const incomeGrid = document.createElement("div");
    incomeGrid.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;";
    incomeGrid.append(
      this.paramField("premiumDaily", "\u041F\u043B\u0430\u0442\u043D\u0430\u044F \u0432\u0435\u0442\u043A\u0430 \u0435\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0445 \u043D\u0430\u0433\u0440\u0430\u0434 (1/0)", p.premiumDaily, 1),
      this.paramField("taskCompletionPct", "\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0434\u0435\u0439\u043B\u0438\u043A\u043E\u0432/\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u044B\u0445, %", p.taskCompletionPct, 1),
      this.paramField("castlesActive", "\u0417\u0430\u043C\u043A\u043E\u0432 \u0441 \u0434\u043E\u0431\u044B\u0447\u0435\u0439 (CastlePassiveRewardConfig)", p.castlesActive, 1),
      this.paramField("castleLevel", "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0434\u043E\u0431\u044B\u0447\u0438 \u0437\u0430\u043C\u043A\u043E\u0432", p.castleLevel, 1),
      this.paramField("castleCollectsPerDay", "\u0421\u0431\u043E\u0440\u043E\u0432 \u0434\u043E\u0431\u044B\u0447\u0438 \u0432 \u0434\u0435\u043D\u044C (\u0446\u0438\u043A\u043B 8 \u0447 \u2192 \u0434\u043E 3)", p.castleCollectsPerDay, 1),
      this.paramField("miniEventsOn", "\u041C\u0438\u043D\u0438-\u0438\u0432\u0435\u043D\u0442\u044B (1/0)", p.miniEventsOn, 1),
      this.paramField("miniEventDays", "\u0414\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043C\u0438\u043D\u0438-\u0438\u0432\u0435\u043D\u0442\u0430, \u0434\u043D\u0435\u0439", p.miniEventDays, 1),
      this.paramField("miniEventRank", "\u041C\u0435\u0441\u0442\u043E \u0432 \xAB\u0427\u0435\u043C\u043F\u0438\u043E\u043D\u0430\u0445 \u0431\u0438\u0442\u0432\xBB (0 = \u0431\u0435\u0437 \u043D\u0430\u0433\u0440\u0430\u0434\u044B)", p.miniEventRank, 1),
      this.paramField("useManualDailyIncome", "\u041F\u0440\u0438\u0431\u0430\u0432\u0438\u0442\u044C \u0440\u0443\u0447\u043D\u0443\u044E \u0442\u0430\u0431\u043B\u0438\u0446\u0443 DailyIncome (1/0)", p.useManualDailyIncome, 1),
      this.paramField("equipmentPiecesPerHero", "\u042D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0438 \u043D\u0430 \u0433\u0435\u0440\u043E\u044F, \u0448\u0442.", p.equipmentPiecesPerHero, 1),
      this.paramField("equipmentTargetLevel", "\u0426\u0435\u043B\u0435\u0432\u043E\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u044D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0438 (0 = \u0432\u044B\u043A\u043B.)", p.equipmentTargetLevel, 1),
      this.paramField("equipmentRarity", "\u0420\u0435\u0434\u043A\u043E\u0441\u0442\u044C \u044D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0438", p.equipmentRarity, 1, false, true)
    );
    wrap.appendChild(incomeGrid);
    const extra = document.createElement("div");
    extra.style.cssText = "display: grid; gap: 10px; margin-top: 10px;";
    extra.append(
      this.paramField("checkpoints", "\u0427\u0435\u043A\u043F\u043E\u0438\u043D\u0442\u044B \u0443\u0440\u043E\u0432\u043D\u0435\u0439", p.checkpoints.join(", "), 0, true)
    );
    wrap.appendChild(extra);
    const otherHeading = document.createElement("div");
    otherHeading.textContent = "\u0420\u0443\u0447\u043D\u043E\u0439 Other Daily Income (\u043F\u043E\u0432\u0435\u0440\u0445 \u0442\u0430\u0431\u043B\u0438\u0446\u044B DailyIncome)";
    otherHeading.style.cssText = "font-weight: 600; font-size: 13px; margin: 12px 0 8px; color: #d0d0d0;";
    wrap.appendChild(otherHeading);
    const other = document.createElement("div");
    other.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px;";
    other.append(
      this.paramField("otherGold", "\u0417\u043E\u043B\u043E\u0442\u043E / \u0434\u0435\u043D\u044C", p.otherDaily.gold, 1),
      this.paramField("otherExp", "\u041E\u043F\u044B\u0442 / \u0434\u0435\u043D\u044C", p.otherDaily.exp, 1),
      this.paramField("otherEssence", "\u042D\u0441\u0441\u0435\u043D\u0446\u0438\u044F / \u0434\u0435\u043D\u044C", p.otherDaily.essence, 1),
      this.paramField("otherDust", "\u041F\u044B\u043B\u044C / \u0434\u0435\u043D\u044C", p.otherDaily.dust, 1),
      this.paramField("otherEnergy", "\u042D\u043D\u0435\u0440\u0433\u0438\u044F / \u0434\u0435\u043D\u044C", p.otherDaily.energy, 1)
    );
    wrap.appendChild(other);
    const hint = document.createElement("div");
    hint.textContent = "\u0420\u0435\u0433\u0435\u043D \u044D\u043D\u0435\u0440\u0433\u0438\u0438 \u0438 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0433\u0430\u0447\u0438 \u043F\u043E\u0434\u0442\u044F\u0433\u0438\u0432\u0430\u044E\u0442\u0441\u044F \u0438\u0437 CommonRemoteConfigs (\u0435\u0441\u043B\u0438 \u043F\u043E\u043B\u0435 \u043D\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0438 \u0440\u0443\u043A\u0430\u043C\u0438). WR 55%. \u041B\u0438\u0433\u0430 \u043F\u043E \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0443; \u043C\u043D\u043E\u0436\u0438\u0442\u0435\u043B\u0438 \u043D\u043E\u0432\u043E\u0439 \u043B\u0438\u0433\u0438 \u0441\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0434\u043D\u044F. \u0421\u0431\u0440\u043E\u0441 \u0441\u0435\u0437\u043E\u043D\u0430: \u0440\u0435\u0439\u0442\u0438\u043D\u0433 = min(\u0442\u0435\u043A\u0443\u0449\u0438\u0439, ResetRating \u043B\u0438\u0433\u0438) + \u043D\u0430\u0433\u0440\u0430\u0434\u0430 ResetRewardAmethysts. \u0417\u043E\u043B\u043E\u0442\u043E \u0438\u0437 \u0441\u043B\u043E\u0442\u043E\u0432, \u0441\u0443\u043D\u0434\u0443\u043A\u043E\u0432, PvP \u0438 \u0435\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0445 \u043D\u0430\u0433\u0440\u0430\u0434 \u0443\u043C\u043D\u043E\u0436\u0430\u0435\u0442\u0441\u044F \u043D\u0430 GoldIncomeMultiplier \u043B\u0438\u0433\u0438, \u043E\u043F\u044B\u0442 PvP \u2014 \u043D\u0430 ExpIncomeMultiplier (\u043A\u0430\u043A \u0432 \u043A\u043B\u0438\u0435\u043D\u0442\u0435); \u0434\u043E\u0431\u044B\u0447\u0430 \u0437\u0430\u043C\u043A\u043E\u0432 \u0438 \u043C\u0438\u043D\u0438-\u0438\u0432\u0435\u043D\u0442\u044B \u2014 \u0431\u0435\u0437 \u043C\u043D\u043E\u0436\u0438\u0442\u0435\u043B\u0435\u0439.";
    hint.style.cssText = "margin-top: 10px; font-size: 12px; color: #9e9e9e; line-height: 1.4;";
    wrap.appendChild(hint);
    return wrap;
  }
  paramField(key, label, value, step, wide = false, text = false) {
    const wrap = document.createElement("label");
    wrap.style.cssText = `display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #bdbdbd;${wide ? " grid-column: 1 / -1;" : ""}`;
    wrap.append(label);
    const input = document.createElement("input");
    input.value = String(value);
    if (!wide && !text) {
      input.type = "number";
      input.min = "0";
      input.step = String(step || 1);
    }
    input.addEventListener("input", () => this.touchedParams.add(key));
    input.style.cssText = [
      "padding: 7px 9px",
      "border: 1px solid #444",
      "border-radius: 4px",
      "background: #0f0f0f",
      "color: #f0f0f0",
      "font: inherit",
      "font-size: 13px"
    ].join(";");
    this.paramInputs.set(key, input);
    wrap.appendChild(input);
    return wrap;
  }
  makeButton(text, dataAttr) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.setAttribute(dataAttr, "");
    button.style.cssText = [
      "padding: 8px 12px",
      "border: 1px solid #555",
      "border-radius: 4px",
      "background: #1f1f1f",
      "color: #f0f0f0",
      "font: inherit",
      "cursor: pointer"
    ].join(";");
    return button;
  }
  createTableRow(table) {
    const { id, defaultUrl } = table;
    const description = `${table.description}${table.required ? "" : " \xB7 \u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F"}`;
    const row = document.createElement("div");
    row.style.cssText = [
      "display: flex",
      "flex-direction: column",
      "gap: 6px",
      "padding: 10px",
      "border: 1px solid #2a2a2a",
      "border-radius: 6px",
      "background: #181818"
    ].join(";");
    const header = document.createElement("div");
    header.style.cssText = "display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px;";
    const nameLink = document.createElement("a");
    nameLink.textContent = id;
    nameLink.href = defaultUrl;
    nameLink.target = "_blank";
    nameLink.rel = "noopener noreferrer";
    nameLink.style.cssText = "color: #7eb8ff; font-weight: 600; font-size: 14px; text-decoration: none;";
    header.appendChild(nameLink);
    const desc = document.createElement("span");
    desc.textContent = description;
    desc.style.cssText = "font-size: 13px; color: #9e9e9e;";
    header.appendChild(desc);
    row.appendChild(header);
    const input = document.createElement("input");
    input.type = "url";
    input.value = defaultUrl;
    input.placeholder = "\u0421\u0441\u044B\u043B\u043A\u0430 Google Sheets (\u0432 \u043F\u0440\u043E\u0434\u0435 \u044D\u0442\u043E\u0439 \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u2014 \u043C\u043E\u0436\u043D\u043E \u0432\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0441\u0432\u043E\u044E)";
    input.spellcheck = false;
    input.setAttribute("aria-label", `${id} Google Sheets URL`);
    input.style.cssText = [
      "width: 100%",
      "box-sizing: border-box",
      "padding: 8px 10px",
      "border: 1px solid #444",
      "border-radius: 4px",
      "background: #0f0f0f",
      "color: #f0f0f0",
      "font: inherit",
      "font-size: 13px"
    ].join(";");
    input.addEventListener("input", () => {
      this.rewriteUrlIfNeeded(input, false);
      nameLink.href = normalizeGoogleSheetUrl(input.value) || "#";
      this.parsedTables.delete(id);
      this.dirtyIds.add(id);
      this.setStatus(id, "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u043E \u2014 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0441\u044F \u043F\u0440\u0438 \u043F\u043E\u0442\u0435\u0440\u0435 \u0444\u043E\u043A\u0443\u0441\u0430", "#bdbdbd");
    });
    input.addEventListener("blur", () => {
      this.rewriteUrlIfNeeded(input, true);
      nameLink.href = normalizeGoogleSheetUrl(input.value) || "#";
      if (this.dirtyIds.has(id)) {
        this.dirtyIds.delete(id);
        void this.loadOne(id);
      }
    });
    row.appendChild(input);
    const status = document.createElement("div");
    status.style.cssText = "font-size: 12px; color: #9e9e9e; min-height: 1.2em;";
    row.appendChild(status);
    this.rowUi.set(id, { input, status, openLink: nameLink });
    return row;
  }
  rewriteUrlIfNeeded(input, force) {
    const raw = input.value;
    if (!force && !shouldRewritePastedSheetUrl(raw)) {
      return;
    }
    const normalized = normalizeGoogleSheetUrl(raw);
    if (normalized !== raw) {
      input.value = normalized;
    }
  }
  async loadAll() {
    const generation = ++this.loadGeneration;
    this.loadButton.disabled = true;
    this.summaryEl.textContent = "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026";
    this.summaryEl.style.color = "#9e9e9e";
    const results = await Promise.all(
      CONFIG_TABLES.map((table) => this.loadOne(table.id, generation))
    );
    if (generation !== this.loadGeneration) {
      return;
    }
    const loaded = results.filter(Boolean).length;
    const requiredLoaded = REQUIRED_TABLES.filter((table) => this.parsedTables.has(table.id)).length;
    this.loadButton.disabled = false;
    this.summaryEl.textContent = `\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E ${loaded} / ${CONFIG_TABLES.length} (\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 ${requiredLoaded} / ${REQUIRED_TABLES.length})`;
    this.summaryEl.style.color = requiredLoaded === REQUIRED_TABLES.length ? "#7dcea0" : "#e74c3c";
    this.applyRemoteDefaults();
    if (requiredLoaded === REQUIRED_TABLES.length) {
      this.runSim();
    }
  }
  /** Реген энергии, цена и гарант гачи из CommonRemoteConfigs — если поле не правили руками. */
  applyRemoteDefaults() {
    const table = this.parsedTables.get("CommonRemoteConfigs");
    if (!table) {
      return;
    }
    const remote = parseRemoteDefaults(table);
    const set = (key, value) => {
      const input = this.paramInputs.get(key);
      if (input && value !== void 0 && Number.isFinite(value) && !this.touchedParams.has(key)) {
        input.value = String(Math.round(value * 100) / 100);
      }
    };
    set("energyPerDay", remote.energyPerDay);
    set("dustPerPull", remote.summonPrice);
    set("gachaPity", remote.pity);
  }
  async loadOne(id, batchGeneration) {
    const ui = this.rowUi.get(id);
    if (!ui) {
      return false;
    }
    const rowGeneration = (this.rowGeneration.get(id) ?? 0) + 1;
    this.rowGeneration.set(id, rowGeneration);
    this.dirtyIds.delete(id);
    this.rewriteUrlIfNeeded(ui.input, true);
    const url = normalizeGoogleSheetUrl(ui.input.value);
    ui.input.value = url;
    ui.openLink.href = url || "#";
    this.parsedTables.delete(id);
    if (url === "") {
      this.setStatus(id, "\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u0430 \u2014 \u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u0430", "#9e9e9e");
      return false;
    }
    this.setStatus(id, "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026", "#9e9e9e");
    try {
      const csv = await fetchGoogleSheetCsv(url);
      if (!this.isLoadCurrent(id, rowGeneration, batchGeneration)) {
        return false;
      }
      const parsed = parseCsvTable(csv);
      this.parsedTables.set(id, parsed);
      this.setStatus(id, this.describeParsedTable(id, parsed), "#7dcea0");
      return true;
    } catch (error) {
      if (!this.isLoadCurrent(id, rowGeneration, batchGeneration)) {
        return false;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.setStatus(id, `\u041E\u0448\u0438\u0431\u043A\u0430: ${message}`, "#e74c3c");
      return false;
    }
  }
  describeParsedTable(id, parsed) {
    if (id === "ChestSlot" || id === "ChestPvp") {
      const table = parseChestSlotTable(parsed);
      const slots = Math.max(...Object.values(table).map((rarity) => rarity.length));
      return `${Object.keys(table).length} \u0440\u0435\u0434\u043A\u043E\u0441\u0442\u0435\u0439 \xB7 \u0434\u043E ${slots} \u0441\u043B\u043E\u0442\u043E\u0432`;
    }
    if (id === "DailyIncome") {
      return describeManualDailyIncome(parseManualDailyIncome(parsed));
    }
    const headerPreview = parsed.headers.filter((header) => header !== "").join(", ");
    return `${parsed.rows.length} \u0441\u0442\u0440\u043E\u043A \xB7 ${headerPreview}`;
  }
  isLoadCurrent(id, rowGeneration, batchGeneration) {
    if (this.rowGeneration.get(id) !== rowGeneration) {
      return false;
    }
    if (batchGeneration !== void 0 && batchGeneration !== this.loadGeneration) {
      return false;
    }
    return true;
  }
  setStatus(id, text, color) {
    const ui = this.rowUi.get(id);
    if (!ui) {
      return;
    }
    ui.status.textContent = text;
    ui.status.style.color = color;
  }
  readParams() {
    const num = (key, fallback) => {
      const parsed = Number(this.paramInputs.get(key)?.value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const list = (key, fallback) => {
      const raw = this.paramInputs.get(key)?.value ?? "";
      const parsed = raw.split(/[,\s]+/).map((part) => Number(part)).filter((value) => Number.isFinite(value) && value > 0);
      return parsed.length > 0 ? parsed : fallback;
    };
    const d = DEFAULT_SIM_PARAMS;
    return {
      heroCount: Math.max(1, Math.round(num("heroCount", d.heroCount))),
      energyPerDay: Math.max(0, num("energyPerDay", d.energyPerDay)),
      spinEnergyCost: Math.max(1e-4, num("spinEnergyCost", d.spinEnergyCost)),
      winRate: Math.min(1, Math.max(0, num("winRatePct", d.winRate * 100) / 100)),
      dustPerPull: Math.max(0, num("dustPerPull", d.dustPerPull)),
      sHeroCount: Math.max(1, Math.round(num("sHeroCount", d.sHeroCount))),
      factionCount: Math.max(1, Math.round(num("factionCount", d.factionCount))),
      gachaPity: Math.max(1, Math.round(num("gachaPity", d.gachaPity))),
      targetHeroPity: num("targetHeroPity", d.targetHeroPity) > 0 ? 1 : 0,
      maxDays: Math.max(1, Math.round(num("maxDays", d.maxDays))),
      checkpoints: list("checkpoints", d.checkpoints),
      startLeagueIndex: Math.max(0, Math.round(num("startLeagueIndex", d.startLeagueIndex + 1)) - 1),
      startRating: Math.max(0, num("startRating", d.startRating)),
      weeklyResetEveryDays: Math.max(0, Math.round(num("weeklyResetEveryDays", d.weeklyResetEveryDays))),
      premiumDaily: num("premiumDaily", d.premiumDaily) > 0 ? 1 : 0,
      taskCompletionPct: Math.min(100, Math.max(0, num("taskCompletionPct", d.taskCompletionPct))),
      useManualDailyIncome: num("useManualDailyIncome", d.useManualDailyIncome) > 0 ? 1 : 0,
      castlesActive: Math.max(0, Math.round(num("castlesActive", d.castlesActive))),
      castleLevel: Math.max(0, Math.round(num("castleLevel", d.castleLevel))),
      castleCollectsPerDay: Math.max(0, num("castleCollectsPerDay", d.castleCollectsPerDay)),
      miniEventsOn: num("miniEventsOn", d.miniEventsOn) > 0 ? 1 : 0,
      miniEventDays: Math.max(1, Math.round(num("miniEventDays", d.miniEventDays))),
      miniEventRank: Math.max(0, Math.round(num("miniEventRank", d.miniEventRank))),
      equipmentPiecesPerHero: Math.max(0, Math.round(num("equipmentPiecesPerHero", d.equipmentPiecesPerHero))),
      equipmentTargetLevel: Math.max(0, Math.round(num("equipmentTargetLevel", d.equipmentTargetLevel))),
      equipmentRarity: (this.paramInputs.get("equipmentRarity")?.value ?? d.equipmentRarity).trim() || d.equipmentRarity,
      otherDaily: {
        ...d.otherDaily,
        gold: Math.max(0, num("otherGold", d.otherDaily.gold)),
        exp: Math.max(0, num("otherExp", d.otherDaily.exp)),
        essence: Math.max(0, num("otherEssence", d.otherDaily.essence)),
        dust: Math.max(0, num("otherDust", d.otherDaily.dust)),
        energy: Math.max(0, num("otherEnergy", d.otherDaily.energy))
      }
    };
  }
  runSim() {
    this.runButton.disabled = true;
    try {
      const missing = REQUIRED_TABLES.filter((table) => !this.parsedTables.has(table.id));
      if (missing.length > 0) {
        throw new Error(`\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0442\u0430\u0431\u043B\u0438\u0446\u044B: ${missing.map((table) => table.id).join(", ")}`);
      }
      const config = parseGameConfig(this.parsedTables);
      const result = runSimulation(config, this.readParams());
      this.lastResult = result;
      this.renderResults(result);
    } catch (error) {
      this.lastResult = null;
      this.resultsEl.replaceChildren();
      const err = document.createElement("div");
      err.textContent = error instanceof Error ? error.message : String(error);
      err.style.cssText = "color: #e74c3c; font-size: 14px;";
      this.resultsEl.appendChild(err);
    } finally {
      this.runButton.disabled = false;
    }
  }
  renderResults(result) {
    this.resultsEl.replaceChildren();
    const heading = document.createElement("h3");
    heading.textContent = "\u041E\u0442\u0447\u0451\u0442";
    heading.style.cssText = "margin: 0 0 10px; font-size: 16px;";
    this.resultsEl.appendChild(heading);
    this.resultsEl.appendChild(this.kvLine(
      `\u0414\u043D\u0435\u0439: ${result.daysRun} \xB7 \u0423\u0440\u043E\u0432\u0435\u043D\u044C \u043E\u0442\u0440\u044F\u0434\u0430: ${result.finalLevel} / ${result.maxLevel} \xB7 \u041B\u0438\u0433\u0430: ${result.finalLeagueName} \xB7 \u0420\u0435\u0439\u0442\u0438\u043D\u0433: ${this.fmt(result.finalRating)}`
    ));
    this.resultsEl.appendChild(this.sectionTitle("\u0427\u0435\u043A\u043F\u043E\u0438\u043D\u0442\u044B (\u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C)"));
    this.resultsEl.appendChild(this.simpleTable(
      ["\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u043E\u0442\u0440\u044F\u0434\u0430", "\u0414\u0435\u043D\u044C"],
      result.checkpoints.map((cp) => [
        String(cp.level),
        cp.day === null ? "\u043D\u0435 \u0434\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442" : String(cp.day)
      ])
    ));
    this.resultsEl.appendChild(this.sectionTitle("\u0423\u0437\u043A\u0438\u0435 \u043C\u0435\u0441\u0442\u0430"));
    this.resultsEl.appendChild(this.kvLine(result.bottleneck));
    if (result.stalls.length > 0) {
      this.resultsEl.appendChild(this.simpleTable(
        ["\u0423\u0440\u043E\u0432\u0435\u043D\u044C", "\u0420\u0435\u0441\u0443\u0440\u0441", "\u0414\u043D\u0435\u0439 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F", "\u041F\u0440\u043E\u0444\u0438\u0446\u0438\u0442"],
        result.stalls.slice(0, 8).map((stall) => [
          String(stall.squadLevel),
          RESOURCE_LABELS[stall.limiting],
          String(Math.round(stall.days)),
          this.formatSurplus(stall.surplus)
        ])
      ));
    }
    this.resultsEl.appendChild(this.sectionTitle("EV \u0433\u0430\u0447\u0438 \u2192 \u0430\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u044B\u043B\u044C"));
    const g = result.gacha;
    this.resultsEl.appendChild(this.simpleTable(
      ["\u041C\u0435\u0442\u0440\u0438\u043A\u0430", "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435"],
      [
        ["\u041A\u0440\u0443\u0442\u043E\u043A \u0434\u043E S (\u0441 \u0433\u0430\u0440\u0430\u043D\u0442\u043E\u043C)", this.fmt(g.pullsToS)],
        ["S-\u0432\u044B\u043F\u0430\u0434\u0435\u043D\u0438\u0439 \u0434\u043E \u0446\u0435\u043B\u0435\u0432\u043E\u0433\u043E \u0433\u0435\u0440\u043E\u044F", this.fmt(g.sDropsPerTarget)],
        ["\u041A\u0440\u0443\u0442\u043E\u043A \u043D\u0430 1 \u0438\u043C\u0435\u043D\u043D\u043E\u0439 \u043E\u0441\u043A\u043E\u043B\u043E\u043A", this.fmt(g.pullsToNamedShard)],
        ["\u041F\u044B\u043B\u0438 \u043D\u0430 1 \u0438\u043C\u0435\u043D\u043D\u043E\u0439 \u043E\u0441\u043A\u043E\u043B\u043E\u043A", this.fmt(g.dustPerNamedShard)],
        ["\u041F\u044B\u043B\u0438 \u043D\u0430 1 \u0444\u0440\u0430\u043A\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u0433\u0435\u0440\u0431 (\u043E\u0434\u0438\u043D\u043E\u0447\u043D\u043E)", this.fmt(g.dustPerFactionEmblem)],
        [`\u041F\u043E\u043B\u043D\u043E\u0435 \u0432\u043E\u0437\u0432\u044B\u0448\u0435\u043D\u0438\u0435 1 \u0433\u0435\u0440\u043E\u044F (${g.shardsPerHero} \u043E\u0441\u043A. + ${g.armsPerHero} \u0433\u0435\u0440\u0431.), \u0431\u0435\u0437 \u043F\u043E\u0431\u043E\u0447\u043D\u044B\u0445 \u043D\u0430\u0433\u0440\u0430\u0434`, this.fmt(g.dustPerHeroFullAscension)],
        ["\u041F\u043E\u043B\u043D\u043E\u0435 \u0432\u043E\u0437\u0432\u044B\u0448\u0435\u043D\u0438\u0435 \u043E\u0442\u0440\u044F\u0434\u0430, \u0431\u0435\u0437 \u043F\u043E\u0431\u043E\u0447\u043D\u044B\u0445 \u043D\u0430\u0433\u0440\u0430\u0434", this.fmt(g.dustPerSquadFullAscension)],
        ["\u041E\u043F\u044B\u0442\u0430 \u0433\u0435\u0440\u043E\u0435\u0432 \u0437\u0430 \u043A\u0440\u0443\u0442\u043A\u0443 (\u043F\u043E\u0431\u043E\u0447\u043D\u043E)", this.fmt(g.expPerPull)],
        ["\u041F\u043E\u043B\u0435\u0437\u043D\u044B\u0445 \u0433\u0435\u0440\u0431\u043E\u0432 \u043E\u0442\u0440\u044F\u0434\u0430 \u0437\u0430 \u043A\u0440\u0443\u0442\u043A\u0443", this.fmt(g.armsPerPull)]
      ]
    ));
    this.resultsEl.appendChild(this.sectionTitle("\u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u0434\u043E\u0445\u043E\u0434 \u043F\u043E \u043B\u0438\u0433\u0430\u043C"));
    this.resultsEl.appendChild(this.simpleTable(
      ["\u041B\u0438\u0433\u0430", "\u0421\u043F\u0438\u043D\u044B", "PvP \u0431\u043E\u0451\u0432", "\u0421\u0443\u043D\u0434\u0443\u043A\u0438", "\u0417\u043E\u043B\u043E\u0442\u043E", "\u041E\u043F\u044B\u0442", "\u042D\u0441\u0441\u0435\u043D\u0446\u0438\u044F", "\u041F\u044B\u043B\u044C", "\u0413\u0435\u0440\u0431\u044B", "\u0410\u043C\u0435\u0442\u0438\u0441\u0442\u044B", "\u0414\u0435\u043A\u043E\u0440"],
      result.incomeByLeague.map((row) => [
        row.leagueName,
        this.fmt(row.income.spins),
        this.fmt(row.income.pvpFights),
        this.fmt(row.income.chestsOpened),
        this.fmt(row.income.total.gold),
        this.fmt(row.income.total.exp),
        this.fmt(row.income.total.essence),
        this.fmt(row.income.total.dust),
        this.fmt(row.income.total.arms),
        this.fmt(row.income.total.amethyst),
        this.fmt(row.income.total.decor)
      ])
    ));
    this.resultsEl.appendChild(this.sectionTitle("\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438 \u0437\u043E\u043B\u043E\u0442\u0430 / \u043E\u043F\u044B\u0442\u0430 / \u043F\u044B\u043B\u0438 \u043F\u043E \u043B\u0438\u0433\u0430\u043C"));
    this.resultsEl.appendChild(this.simpleTable(
      ["\u041B\u0438\u0433\u0430", "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A", "\u0417\u043E\u043B\u043E\u0442\u043E", "\u041E\u043F\u044B\u0442", "\u041F\u044B\u043B\u044C", "\u042D\u0441\u0441\u0435\u043D\u0446\u0438\u044F"],
      result.incomeByLeague.flatMap((row) => {
        const i = row.income;
        const sources = [
          ["\u0421\u043B\u043E\u0442\u044B", i.fromSlots],
          ["PvP", i.fromPvp],
          ["\u0421\u0443\u043D\u0434\u0443\u043A\u0438 \u0441\u043B\u043E\u0442\u043E\u0432", i.fromSlotChests],
          ["\u0421\u0443\u043D\u0434\u0443\u043A\u0438 PvP", i.fromPvpChests],
          ["\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0435 \u043D\u0430\u0433\u0440\u0430\u0434\u044B", i.fromDaily],
          ["\u0417\u0430\u0434\u0430\u043D\u0438\u044F", i.fromTasks],
          ["\u0417\u0430\u043C\u043A\u0438", i.fromCastle],
          ["\u041C\u0438\u043D\u0438-\u0438\u0432\u0435\u043D\u0442\u044B", i.fromEvents],
          ["\u041F\u0440\u043E\u0447\u0435\u0435", i.fromOther]
        ];
        return sources.map(([label, res]) => [
          row.leagueName,
          label,
          this.fmt(res.gold),
          this.fmt(res.exp),
          this.fmt(res.dust),
          this.fmt(res.essence)
        ]);
      })
    ));
    this.resultsEl.appendChild(this.sectionTitle("\u0414\u043D\u0435\u0439 \u0432 \u043B\u0438\u0433\u0430\u0445"));
    this.resultsEl.appendChild(this.simpleTable(
      ["\u041B\u0438\u0433\u0430", "\u0414\u043D\u0435\u0439"],
      result.daysInLeagues.map((row) => [row.leagueName, String(row.days)])
    ));
    this.resultsEl.appendChild(this.sectionTitle("\u041E\u0441\u0442\u0430\u0442\u043E\u043A \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u044F"));
    this.resultsEl.appendChild(this.kvLine(
      ALL_RESOURCE_IDS.map((id) => `${RESOURCE_LABELS[id]} ${this.fmt(result.inventory[id])}`).join(" \xB7 ")
    ));
    this.resultsEl.appendChild(this.kvLine(`\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 \u043A \u043A\u043E\u043D\u0446\u0443 \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u0438: ${result.accountLevel}`));
    if (result.equipment) {
      this.resultsEl.appendChild(this.kvLine(
        `\u042D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0430: ${result.equipment.pieces} \u0448\u0442. \xB7 \u0437\u043E\u043B\u043E\u0442\u043E ${this.fmt(result.equipment.goldTotal)} \xB7 \u043E\u0441\u043A\u043E\u043B\u043A\u0438 \u043A\u0443\u0437\u043D\u0438 ${this.fmt(result.equipment.shardsTotal)}`
      ));
    }
    for (const note of result.notes) {
      this.resultsEl.appendChild(this.kvLine(note, "#c9a227"));
    }
    const download = this.makeButton("\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043E\u0442\u0447\u0451\u0442 CSV", "data-download");
    download.addEventListener("click", () => this.downloadReport());
    this.resultsEl.appendChild(download);
  }
  downloadReport() {
    if (!this.lastResult) {
      return;
    }
    const blob = new Blob([simulationReportCsv(this.lastResult)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hoc-balance-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  sectionTitle(text) {
    const el = document.createElement("h4");
    el.textContent = text;
    el.style.cssText = "margin: 16px 0 8px; font-size: 14px; font-weight: 600; color: #d0d0d0;";
    return el;
  }
  kvLine(text, color = "#cfcfcf") {
    const el = document.createElement("div");
    el.textContent = text;
    el.style.cssText = `font-size: 13px; line-height: 1.45; color: ${color}; margin-bottom: 8px;`;
    return el;
  }
  simpleTable(headers, rows) {
    const table = document.createElement("table");
    table.style.cssText = "width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 8px;";
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    for (const label of headers) {
      const th = document.createElement("th");
      th.textContent = label;
      th.style.cssText = "text-align: left; padding: 8px; border-bottom: 1px solid #3a3a3a; color: #bdbdbd; background: #1c1c1c;";
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    for (const row of rows) {
      const tr = document.createElement("tr");
      for (const cell of row) {
        const td = document.createElement("td");
        td.textContent = cell;
        td.style.cssText = "padding: 8px; border-bottom: 1px solid #2a2a2a; vertical-align: top;";
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    return table;
  }
  formatSurplus(surplus) {
    const parts = [];
    for (const [id, value] of Object.entries(surplus)) {
      if (value === void 0) {
        continue;
      }
      const pct = Math.round(value * 100);
      if (pct > 0) {
        parts.push(`${RESOURCE_LABELS[id]} +${pct}%`);
      }
    }
    return parts.length > 0 ? parts.join(", ") : "\u2014";
  }
  fmt(value) {
    if (!Number.isFinite(value)) {
      return "\u221E";
    }
    return value.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
  }
};

// src/index.ts
var applicationViewportDiv = document.createElement("div");
applicationViewportDiv.style = "width: 100vw; min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding: 24px 0; box-sizing: border-box; position: relative;";
document.body.appendChild(applicationViewportDiv);
new ConfigTablesApp(applicationViewportDiv);
