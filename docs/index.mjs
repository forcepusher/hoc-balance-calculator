// src/configTables.ts
var CONFIG_TABLES = [
  {
    id: "LevelProgression",
    description: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u043E\u043F\u044B\u0442\u0430, \u0437\u043E\u043B\u043E\u0442\u0430, \u044D\u0441\u0441\u0435\u043D\u0446\u0438\u0438",
    defaultUrl: "https://docs.google.com/spreadsheets/d/17-fGfxdNr-qoDdt2yuW_g3XAVsMHFdlN4mweEvxICNo"
  },
  {
    id: "HeroTierUp",
    description: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0432 \u043E\u0441\u043A\u043E\u043B\u043A\u0430\u0445 \u0438 \u0433\u0435\u0440\u0431\u0430\u0445",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1xk8lw6oW5nvu_9cZ5tPeAGgLmK4OuTu9HoiKwi02jDs"
  },
  {
    id: "SlotMachineBaseDrops",
    description: "\u0428\u0430\u043D\u0441\u044B \u0434\u0440\u043E\u043F\u0430 \u0441\u043B\u043E\u0442-\u043C\u0430\u0448\u0438\u043D\u044B",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1j1Pc686613peoJ9eY7Dj-8gRsm1I4AUBQtJIyKD1NnU?gid=1058081879"
  },
  {
    id: "GachaBaseDrops",
    description: "\u0428\u0430\u043D\u0441\u044B \u0434\u0440\u043E\u043F\u0430",
    defaultUrl: "https://docs.google.com/spreadsheets/d/12ChBhfVgYk3JbBfrgOznM5VQI0em_x0w0shNzuQYWC8"
  },
  {
    id: "PvpLeaguesConfig",
    description: "\u041B\u043E\u0433\u0438\u043A\u0430 \u043F\u0435\u0440\u0435\u043C\u0435\u0449\u0435\u043D\u0438\u044F \u043F\u043E \u043B\u0438\u0433\u0430\u043C; \u043B\u0438\u0433\u0438 \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0432\u0430\u044E\u0442 \u0434\u043E\u0445\u043E\u0434 \u0437\u043E\u043B\u043E\u0442\u0430 \u0441\u043E \u0441\u043B\u043E\u0442-\u043C\u0430\u0448\u0438\u043D\u044B (GoldIncomeMultiplier)",
    defaultUrl: "https://docs.google.com/spreadsheets/d/16HpoC-9E1NKvXT2zDwAIzBe4M4NK_J-JkJX61ISlUV4"
  },
  {
    id: "PvpRewardPool",
    description: "\u041D\u0430\u0433\u0440\u0430\u0434\u044B \u0437\u0430 PvP \u0431\u043E\u0439",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1tJjt0mAHSMMbMah-0Iwpq2RunfiYQuGRoTvZVazsBPE"
  },
  {
    id: "PvpAdRewardPool",
    description: "\u041D\u0430\u0433\u0440\u0430\u0434\u044B \u0437\u0430 \u0440\u0435\u043A\u043B\u0430\u043C\u0443",
    defaultUrl: "https://docs.google.com/spreadsheets/d/1iQePyPVaX1XKYNIJ-0VGvygkVEeSX9gDaBXBPEsN5hs"
  },
  {
    id: "PvpChestRewardPool",
    description: "\u041D\u0430\u0433\u0440\u0430\u0434\u044B \u0438\u0437 PvP \u0441\u0443\u043D\u0434\u0443\u043A\u0430",
    defaultUrl: "https://docs.google.com/spreadsheets/d/14gHasZa7vKzxm7UKKJEKvqJU3VZGE-q_1RZnbu0iG-A"
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

// src/sim/parseGameConfig.ts
function parseGameConfig(tables) {
  return {
    levels: parseLevelProgression(requireTable(tables, "LevelProgression")),
    tierUps: parseHeroTierUp(requireTable(tables, "HeroTierUp")),
    slotDrops: parseSlotDrops(requireTable(tables, "SlotMachineBaseDrops")),
    gacha: parseGacha(requireTable(tables, "GachaBaseDrops")),
    leagues: parseLeagues(requireTable(tables, "PvpLeaguesConfig")),
    pvpRewards: parsePvpRewards(requireTable(tables, "PvpRewardPool")),
    ads: parseAds(requireTable(tables, "PvpAdRewardPool")),
    chest: parseChest(requireTable(tables, "PvpChestRewardPool"))
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
  const jackpotI = optionalColumn(table.headers, ["isjackpot"]);
  const affectedI = optionalColumn(table.headers, ["isaffectedbyleague"]);
  const drops = table.rows.map((row) => ({
    key: row[keyI] ?? "",
    probability: parseNumber(row[pI]),
    itemType: row[typeI] ?? "",
    value: parseNumber(row[valueI]),
    isJackpot: jackpotI >= 0 ? parseBool(row[jackpotI]) : false,
    affectedByLeague: affectedI >= 0 ? parseBool(row[affectedI]) : false
  })).filter((row) => row.key !== "" && row.probability > 0);
  if (drops.length === 0) {
    throw new Error("SlotMachineBaseDrops: \u043D\u0435\u0442 \u0434\u0440\u043E\u043F\u043E\u0432");
  }
  return drops;
}
function parseGacha(table) {
  const col = columnIndex(table.headers);
  const keyI = col(["key"]);
  const pI = col(["probability", "chance"]);
  const byKey = /* @__PURE__ */ new Map();
  for (const row of table.rows) {
    const key = (row[keyI] ?? "").trim();
    if (!key) {
      continue;
    }
    byKey.set(key.toLowerCase(), parseNumber(row[pI]));
  }
  const sHero = byKey.get("herostier") ?? byKey.get("s") ?? 0.03;
  const aHero = byKey.get("heroatier") ?? byKey.get("a") ?? 0.22;
  const arms = byKey.get("arms") ?? 0.75;
  return { sHero, aHero, arms };
}
function parseLeagues(table) {
  const col = columnIndex(table.headers);
  const nameI = col(["leaguename", "name"]);
  const idI = col(["leagueid", "id"]);
  const minI = optionalColumn(table.headers, ["minrating"]);
  const maxI = optionalColumn(table.headers, ["maxrating"]);
  const winI = optionalColumn(table.headers, ["winrating"]);
  const lossI = optionalColumn(table.headers, ["lossrating"]);
  const goldI = col(["goldincomemultiplier"]);
  const expI = col(["expincomemultiplier"]);
  const tierI = optionalColumn(table.headers, ["slotmachinetier"]);
  const rows = table.rows.map((row) => ({
    name: row[nameI] ?? "",
    id: row[idI] ?? "",
    minRating: minI >= 0 ? parseNumber(row[minI]) : 0,
    maxRating: maxI >= 0 ? parseNumber(row[maxI]) : 0,
    winRating: winI >= 0 ? parseNumber(row[winI]) : 0,
    lossRating: lossI >= 0 ? parseNumber(row[lossI]) : 0,
    goldIncomeMultiplier: parseNumber(row[goldI], 1),
    expIncomeMultiplier: parseNumber(row[expI], 1),
    slotMachineTier: tierI >= 0 ? row[tierI] ?? "" : ""
  })).filter((row) => row.id !== "");
  if (rows.length === 0) {
    throw new Error("PvpLeaguesConfig: \u043D\u0435\u0442 \u043B\u0438\u0433");
  }
  return rows;
}
function parsePvpRewards(table) {
  const col = columnIndex(table.headers);
  const idI = col(["leagueid", "leaguieid"]);
  const resultI = col(["result"]);
  const goldI = col(["gold"]);
  const expI = col(["heroexp", "exp"]);
  const dustI = col(["astraldust", "dust"]);
  const chestI = col(["pvpchest", "chest"]);
  const rows = table.rows.map((row) => {
    const resultRaw = (row[resultI] ?? "").toLowerCase();
    const result = resultRaw.startsWith("w") || resultRaw === "\u043F\u043E\u0431\u0435\u0434\u0430" ? "Win" : "Loss";
    return {
      leagueId: row[idI] ?? "",
      result,
      gold: parseNumber(row[goldI]),
      exp: parseNumber(row[expI]),
      dust: parseNumber(row[dustI]),
      opensChest: parseBool(row[chestI])
    };
  }).filter((row) => row.leagueId !== "");
  if (rows.length === 0) {
    throw new Error("PvpRewardPool: \u043D\u0435\u0442 \u0441\u0442\u0440\u043E\u043A");
  }
  return rows;
}
function parseAds(table) {
  const drops = [];
  const leagueMultiplier = /* @__PURE__ */ new Map();
  const header = table.matrix[0] ?? [];
  const col = columnIndex(header);
  const keyI = optionalColumn(header, ["key"]);
  const pI = optionalColumn(header, ["probability", "chance"]);
  const typeI = optionalColumn(header, ["itemtype"]);
  const minI = optionalColumn(header, ["baseminamount", "minamount"]);
  const maxI = optionalColumn(header, ["basemaxamount", "maxamount"]);
  const affectedI = optionalColumn(header, ["isaffectedbyleague"]);
  const leagueI = optionalColumn(header, ["leagueid"]);
  const multI = optionalColumn(header, ["admultiplier"]);
  for (const row of table.matrix.slice(1)) {
    const key = keyI >= 0 ? (row[keyI] ?? "").trim() : "";
    const itemType = typeI >= 0 ? (row[typeI] ?? "").trim() : "";
    if (key !== "" && itemType !== "" && pI >= 0) {
      drops.push({
        key,
        probability: parseNumber(row[pI]),
        itemType,
        minAmount: minI >= 0 ? parseNumber(row[minI]) : 0,
        maxAmount: maxI >= 0 ? parseNumber(row[maxI]) : 0,
        affectedByLeague: affectedI >= 0 ? parseBool(row[affectedI]) : false
      });
    }
    const leagueId = leagueI >= 0 ? (row[leagueI] ?? "").trim() : "";
    if (leagueId.toLowerCase().startsWith("league") && multI >= 0) {
      leagueMultiplier.set(leagueId, parseNumber(row[multI], 1));
    }
  }
  if (drops.length === 0) {
    throw new Error("PvpAdRewardPool: \u043D\u0435\u0442 \u0434\u0440\u043E\u043F\u043E\u0432");
  }
  return { drops, leagueMultiplier };
}
function parseChest(table) {
  const drops = [];
  const dropCounts = [];
  const leagueMultiplier = /* @__PURE__ */ new Map();
  let mode = "drops";
  for (const row of table.matrix) {
    const first = (row[0] ?? "").trim();
    const second = (row[1] ?? "").trim();
    if (first === "" && second === "") {
      continue;
    }
    if (/^key$/i.test(first)) {
      mode = "drops";
      continue;
    }
    if (/^dropcount$/i.test(first)) {
      mode = "dropCount";
      continue;
    }
    if (/^leagueid$/i.test(first)) {
      mode = "league";
      continue;
    }
    if (mode === "drops") {
      drops.push({
        key: first,
        probability: parseNumber(row[1]),
        itemType: first,
        minAmount: parseNumber(row[2]),
        maxAmount: parseNumber(row[3]),
        affectedByLeague: parseBool(row[4])
      });
      continue;
    }
    if (mode === "dropCount") {
      dropCounts.push({
        count: parseNumber(first),
        probability: parseNumber(row[1])
      });
      continue;
    }
    leagueMultiplier.set(first, parseNumber(row[1], 1));
  }
  if (drops.length === 0) {
    throw new Error("PvpChestRewardPool: \u043D\u0435\u0442 \u0434\u0440\u043E\u043F\u043E\u0432");
  }
  if (dropCounts.length === 0) {
    dropCounts.push({ count: 1, probability: 1 });
  }
  return { drops, dropCounts, leagueMultiplier };
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
  if (!raw) {
    return false;
  }
  const value = raw.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

// src/sim/gacha.ts
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
function computeGachaEv(gacha, tierUps, params) {
  const pullsToS = expectedPullsToSHero(gacha.sHero, params.gachaPity);
  const namedGivenS = 1 / Math.max(1, params.sHeroCount);
  const pullsToNamedShard = pullsToS / namedGivenS;
  const emblemRate = gacha.arms / Math.max(1, params.factionCount);
  const pullsToFactionEmblem = emblemRate > 0 ? 1 / emblemRate : Number.POSITIVE_INFINITY;
  const dustPerNamedShard = pullsToNamedShard * params.dustPerPull;
  const dustPerFactionEmblem = pullsToFactionEmblem * params.dustPerPull;
  const shardsPerHero = tierUps.reduce((sum, row) => sum + row.shards, 0);
  const armsPerHero = tierUps.reduce((sum, row) => sum + row.arms, 0);
  const dustPerHeroFullAscension = shardsPerHero * dustPerNamedShard + armsPerHero * dustPerFactionEmblem;
  return {
    pullsToS,
    pullsToNamedShard,
    pullsToFactionEmblem,
    dustPerNamedShard,
    dustPerFactionEmblem,
    dustPerHeroFullAscension,
    dustPerSquadFullAscension: dustPerHeroFullAscension * params.heroCount,
    shardsPerHero,
    armsPerHero
  };
}
function dustCostForTierUp(row, ev, heroCount) {
  return heroCount * (row.shards * ev.dustPerNamedShard + row.arms * ev.dustPerFactionEmblem);
}

// src/sim/types.ts
function emptyResources() {
  return { gold: 0, exp: 0, essence: 0, dust: 0 };
}
function addResources(a, b) {
  return {
    gold: a.gold + b.gold,
    exp: a.exp + b.exp,
    essence: a.essence + b.essence,
    dust: a.dust + b.dust
  };
}
function scaleResources(a, factor) {
  return {
    gold: a.gold * factor,
    exp: a.exp * factor,
    essence: a.essence * factor,
    dust: a.dust * factor
  };
}
function canAfford(have, need) {
  return have.gold + 1e-9 >= need.gold && have.exp + 1e-9 >= need.exp && have.essence + 1e-9 >= need.essence && have.dust + 1e-9 >= need.dust;
}
function subtractResources(have, need) {
  return {
    gold: have.gold - need.gold,
    exp: have.exp - need.exp,
    essence: have.essence - need.essence,
    dust: have.dust - need.dust
  };
}
var RESOURCE_IDS = ["gold", "exp", "essence", "dust"];
var RESOURCE_LABELS = {
  gold: "\u0417\u043E\u043B\u043E\u0442\u043E",
  exp: "\u041E\u043F\u044B\u0442",
  essence: "\u042D\u0441\u0441\u0435\u043D\u0446\u0438\u044F",
  dust: "\u0410\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u044B\u043B\u044C"
};
var DEFAULT_SIM_PARAMS = {
  heroCount: 5,
  energyPerDay: 432,
  adsPerDay: 5,
  winRate: 0.9,
  dustPerPull: 10,
  sHeroCount: 8,
  factionCount: 4,
  gachaPity: 80,
  maxDays: 1e4,
  checkpoints: checkpointsEvery(20, 240),
  leagueUnlockLevels: [1, 40, 60, 80, 100, 120, 140]
};
function checkpointsEvery(step, maxLevel) {
  const levels = [];
  for (let level = step; level <= maxLevel; level += step) {
    levels.push(level);
  }
  return levels;
}

// src/sim/income.ts
function energyReturnChance(slotDrops) {
  let chance = 0;
  for (const drop of slotDrops) {
    if (normalizeItemType(drop.itemType) === "energy") {
      chance += drop.probability * drop.value;
    }
  }
  return chance;
}
function dailySpins(energyPerDay, slotDrops) {
  const returned = energyReturnChance(slotDrops);
  const denom = 1 - returned;
  if (denom <= 1e-9) {
    return energyPerDay;
  }
  return energyPerDay / denom;
}
function computeDailyIncome(config, league, params) {
  const spins = dailySpins(params.energyPerDay, config.slotDrops);
  const fromSlots = slotIncome(config.slotDrops, spins, league);
  const pvpChance = pvpHitChance(config.slotDrops);
  const pvpFights = spins * pvpChance;
  const pvpWins = pvpFights * params.winRate;
  const pvpLosses = pvpFights * (1 - params.winRate);
  const fromPvp = addScaled(
    pvpMatchReward(config, league, "Win"),
    pvpWins,
    pvpMatchReward(config, league, "Loss"),
    pvpLosses
  );
  const slotChests = spins * chestHitChance(config.slotDrops);
  const pvpChests = pvpWins * (pvpOpensChest(config, league) ? 1 : 0);
  const chestsOpened = slotChests + pvpChests;
  const fromChests = scaleRes(expectedChestResources(config.chest, league), chestsOpened);
  const fromAds = scaleRes(expectedAdResources(config.ads, league), params.adsPerDay);
  const total = sumRes(fromSlots, fromPvp, fromChests, fromAds);
  return {
    spins,
    energyReturnChance: energyReturnChance(config.slotDrops),
    pvpFights,
    pvpWins,
    pvpLosses,
    chestsOpened,
    fromSlots,
    fromPvp,
    fromChests,
    fromAds,
    total
  };
}
function slotIncome(drops, spins, league) {
  const out = emptyResources();
  for (const drop of drops) {
    const amount = spins * drop.probability * drop.value;
    addItem(out, drop.itemType, amount, drop.affectedByLeague, league, "goldExp");
  }
  return out;
}
function pvpHitChance(drops) {
  let chance = 0;
  for (const drop of drops) {
    if (normalizeItemType(drop.itemType) === "pvp") {
      chance += drop.probability * Math.max(drop.value, 1);
    }
  }
  return chance;
}
function chestHitChance(drops) {
  let chance = 0;
  for (const drop of drops) {
    if (normalizeItemType(drop.itemType) === "chest") {
      chance += drop.probability * Math.max(drop.value, 1);
    }
  }
  return chance;
}
function pvpMatchReward(config, league, result) {
  const exact = config.pvpRewards.find((row2) => row2.leagueId === league.id && row2.result === result);
  const fallback = config.pvpRewards.find((row2) => row2.result === result);
  const row = exact ?? fallback;
  if (!row) {
    return emptyResources();
  }
  return {
    gold: row.gold,
    exp: row.exp,
    essence: 0,
    dust: row.dust
  };
}
function pvpOpensChest(config, league) {
  const exact = config.pvpRewards.find((row) => row.leagueId === league.id && row.result === "Win");
  const fallback = config.pvpRewards.find((row) => row.result === "Win");
  return (exact ?? fallback)?.opensChest ?? true;
}
function expectedChestResources(chest, league) {
  const expectedCount = chest.dropCounts.reduce((sum, row) => sum + row.count * row.probability, 0);
  const leagueMult = chest.leagueMultiplier.get(league.id) ?? 1;
  const perDrop = emptyResources();
  const weightSum = chest.drops.reduce((sum, drop) => sum + drop.probability, 0);
  for (const drop of chest.drops) {
    const p = weightSum > 0 ? drop.probability / weightSum : 0;
    const avg = (drop.minAmount + drop.maxAmount) / 2;
    const amount = p * avg;
    addItem(perDrop, drop.itemType, amount, drop.affectedByLeague, league, "chest", leagueMult);
  }
  return scaleRes(perDrop, expectedCount);
}
function expectedAdResources(ads, league) {
  const leagueMult = ads.leagueMultiplier.get(league.id) ?? 1;
  const out = emptyResources();
  const weightSum = ads.drops.reduce((sum, drop) => sum + drop.probability, 0);
  for (const drop of ads.drops) {
    const p = weightSum > 0 ? drop.probability / weightSum : drop.probability;
    const avg = (drop.minAmount + drop.maxAmount) / 2;
    addItem(out, drop.itemType, p * avg, drop.affectedByLeague, league, "ad", leagueMult);
  }
  return out;
}
function addItem(out, itemType, amount, affectedByLeague, league, source, extraLeagueMult = 1) {
  const kind = normalizeItemType(itemType);
  let goldMult = 1;
  let expMult = 1;
  if (affectedByLeague) {
    if (source === "ad") {
      goldMult = extraLeagueMult;
      expMult = extraLeagueMult;
    } else if (source === "chest") {
      goldMult = extraLeagueMult;
      expMult = extraLeagueMult;
    } else {
      goldMult = league.goldIncomeMultiplier;
      expMult = league.expIncomeMultiplier;
    }
  }
  if (kind === "gold") {
    out.gold += amount * goldMult;
  } else if (kind === "exp") {
    out.exp += amount * expMult;
  } else if (kind === "dust") {
    out.dust += amount;
  } else if (kind === "essence") {
    out.essence += amount;
  }
}
function normalizeItemType(itemType) {
  const raw = itemType.trim().toLowerCase();
  if (raw === "gold" || raw.includes("gold")) {
    return "gold";
  }
  if (raw === "heroexp" || raw === "exp" || raw.includes("exp")) {
    return "exp";
  }
  if (raw === "astraldust" || raw === "dust" || raw.includes("dust")) {
    return "dust";
  }
  if (raw.includes("essence")) {
    return "essence";
  }
  if (raw === "energy") {
    return "energy";
  }
  if (raw === "pvp" || raw === "attack") {
    return "pvp";
  }
  if (raw === "chest") {
    return "chest";
  }
  if (raw === "pve" || raw === "raid") {
    return "pve";
  }
  return raw;
}
function scaleRes(res, factor) {
  return {
    gold: res.gold * factor,
    exp: res.exp * factor,
    essence: res.essence * factor,
    dust: res.dust * factor
  };
}
function sumRes(...parts) {
  const out = emptyResources();
  for (const part of parts) {
    out.gold += part.gold;
    out.exp += part.exp;
    out.essence += part.essence;
    out.dust += part.dust;
  }
  return out;
}
function addScaled(a, fa, b, fb) {
  return {
    gold: a.gold * fa + b.gold * fb,
    exp: a.exp * fa + b.exp * fb,
    essence: a.essence * fa + b.essence * fb,
    dust: a.dust * fa + b.dust * fb
  };
}

// src/sim/simulate.ts
function runSimulation(config, params) {
  const gacha = computeGachaEv(config.gacha, config.tierUps, params);
  const notes = [];
  const maxLevel = config.levels.reduce((max, row) => Math.max(max, row.level), 1);
  const byLevel = new Map(config.levels.map((row) => [row.level, row]));
  const pendingTiers = assignTierUps(config);
  const incomeByLeague = config.leagues.map((league2) => ({
    leagueName: league2.name || league2.id,
    income: computeDailyIncome(config, league2, params)
  }));
  let day = 0;
  let squadLevel = 1;
  let leagueIndex = 0;
  let pendingLeagueIndex = null;
  let inventory = emptyResources();
  const checkpointDays = /* @__PURE__ */ new Map();
  const stallAcc = /* @__PURE__ */ new Map();
  for (const cp of params.checkpoints) {
    if (squadLevel >= cp) {
      checkpointDays.set(cp, 0);
    }
  }
  while (day < params.maxDays && squadLevel < maxLevel) {
    day += 1;
    if (pendingLeagueIndex !== null) {
      leagueIndex = pendingLeagueIndex;
      pendingLeagueIndex = null;
    }
    const league2 = config.leagues[Math.min(leagueIndex, config.leagues.length - 1)];
    const income = computeDailyIncome(config, league2, params);
    inventory = addResources(inventory, income.total);
    let progressed = true;
    while (progressed) {
      progressed = false;
      const unpaid = pendingTiers.find((tier) => !tier.paid && squadLevel >= tier.afterLevel);
      if (unpaid) {
        const dustNeed = dustCostForTierUp(unpaid.row, gacha, params.heroCount);
        const need2 = { ...emptyResources(), dust: dustNeed };
        if (canAfford(inventory, need2)) {
          inventory = subtractResources(inventory, need2);
          unpaid.paid = true;
          progressed = true;
          continue;
        }
        const nextRow = byLevel.get(squadLevel + 1);
        const surplusNeed = nextRow ? addResources(need2, scaleResources(levelCost(nextRow), params.heroCount)) : need2;
        recordStall(stallAcc, squadLevel, "dust", inventory, surplusNeed, income.total);
        break;
      }
      const nextLevel = squadLevel + 1;
      const row = byLevel.get(nextLevel);
      if (!row) {
        if (squadLevel < maxLevel) {
          throw new Error(`LevelProgression: \u043D\u0435\u0442 \u0443\u0440\u043E\u0432\u043D\u044F ${nextLevel}`);
        }
        break;
      }
      const need = scaleResources(levelCost(row), params.heroCount);
      if (canAfford(inventory, need)) {
        inventory = subtractResources(inventory, need);
        squadLevel = nextLevel;
        progressed = true;
        for (const cp of params.checkpoints) {
          if (squadLevel >= cp && !checkpointDays.has(cp)) {
            checkpointDays.set(cp, day);
          }
        }
        const unlocked = leagueIndexForLevel(params.leagueUnlockLevels, squadLevel);
        if (unlocked > leagueIndex && unlocked !== pendingLeagueIndex) {
          pendingLeagueIndex = unlocked;
        }
        continue;
      }
      const limiting = limitingResource(inventory, need, income.total);
      recordStall(stallAcc, squadLevel, limiting, inventory, need, income.total);
      break;
    }
  }
  if (squadLevel >= maxLevel) {
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
  const stalls = [...stallAcc.values()].sort((a, b) => b.days - a.days);
  const league = config.leagues[Math.min(leagueIndex, config.leagues.length - 1)];
  return {
    daysRun: day,
    finalLevel: squadLevel,
    maxLevel,
    finalLeagueName: league?.name || league?.id || "\u2014",
    inventory,
    checkpoints: params.checkpoints.map((level) => ({
      level,
      day: checkpointDays.get(level) ?? null
    })),
    stalls,
    bottleneck: describeBottleneck(stalls, maxLevel),
    gacha,
    incomeByLeague,
    notes
  };
}
function levelCost(row) {
  return {
    gold: row.goldCost,
    exp: row.expCost,
    essence: row.essenceCost,
    dust: 0
  };
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
function leagueIndexForLevel(unlocks, squadLevel) {
  let index = 0;
  for (let i = 0; i < unlocks.length; i++) {
    if (squadLevel >= unlocks[i]) {
      index = i;
    }
  }
  return index;
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
function recordStall(acc, squadLevel, limiting, have, need, _daily) {
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
  for (const cp of result.checkpoints) {
    lines.push(`checkpoint,${cp.level},${cp.day ?? ""}`);
  }
  lines.push(`bottleneck,text,${csvCell(result.bottleneck)}`);
  for (const stall of result.stalls) {
    lines.push(`stall,${stall.squadLevel}:${stall.limiting},${stall.days}`);
  }
  lines.push(`gacha,dustPerNamedShard,${result.gacha.dustPerNamedShard}`);
  lines.push(`gacha,dustPerFactionEmblem,${result.gacha.dustPerFactionEmblem}`);
  lines.push(`gacha,dustPerSquadFullAscension,${result.gacha.dustPerSquadFullAscension}`);
  for (const row of result.incomeByLeague) {
    const t = row.income.total;
    lines.push(`income,${csvCell(row.leagueName)} gold,${t.gold}`);
    lines.push(`income,${csvCell(row.leagueName)} exp,${t.exp}`);
    lines.push(`income,${csvCell(row.leagueName)} essence,${t.essence}`);
    lines.push(`income,${csvCell(row.leagueName)} dust,${t.dust}`);
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
var ConfigTablesApp = class {
  parsedTables = /* @__PURE__ */ new Map();
  rowUi = /* @__PURE__ */ new Map();
  rowGeneration = /* @__PURE__ */ new Map();
  dirtyIds = /* @__PURE__ */ new Set();
  paramInputs = /* @__PURE__ */ new Map();
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
    title.textContent = "HoC Balance \u2014 \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u044F (\u0430\u043B\u044C\u0444\u0430)";
    title.style.cssText = "margin: 0 0 8px; font-size: 20px; font-weight: 600;";
    root.appendChild(title);
    const intro = document.createElement("p");
    intro.textContent = "EV-\u0441\u0438\u043C\u0443\u043B\u044F\u0442\u043E\u0440 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0433\u043E \u0434\u043D\u044F: \u0441\u043B\u043E\u0442\u044B + \u0430\u0440\u0435\u043D\u0430 + 5 \u0440\u0435\u043A\u043B\u0430\u043C. 5 \u0433\u0435\u0440\u043E\u0435\u0432 \u043A\u0430\u0447\u0430\u044E\u0442\u0441\u044F \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u043D\u043E. \u0412\u043D\u0435\u0448\u043D\u0438\u0435 \u0438\u0432\u0435\u043D\u0442\u044B \u043D\u0435 \u0443\u0447\u0438\u0442\u044B\u0432\u0430\u044E\u0442\u0441\u044F.";
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
    for (const table of CONFIG_TABLES) {
      list.appendChild(this.createTableRow(table.id, table.description, table.defaultUrl));
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
      this.paramField("energyPerDay", "\u042D\u043D\u0435\u0440\u0433\u0438\u044F / \u0441\u0443\u0442\u043A\u0438", p.energyPerDay, 1),
      this.paramField("adsPerDay", "\u0420\u0435\u043A\u043B\u0430\u043C\u0430 / \u0441\u0443\u0442\u043A\u0438", p.adsPerDay, 1),
      this.paramField("winRatePct", "\u0412\u0438\u043D\u0440\u0435\u0439\u0442 PvP %", p.winRate * 100, 1),
      this.paramField("dustPerPull", "\u041F\u044B\u043B\u044C \u0437\u0430 1 \u043A\u0440\u0443\u0442\u043A\u0443", p.dustPerPull, 1),
      this.paramField("sHeroCount", "\u0413\u0435\u0440\u043E\u0438 S \u0432 \u043F\u0443\u043B\u0435", p.sHeroCount, 1),
      this.paramField("factionCount", "\u0424\u0440\u0430\u043A\u0446\u0438\u0439 (\u0433\u0435\u0440\u0431\u044B)", p.factionCount, 1),
      this.paramField("gachaPity", "\u0413\u0430\u0440\u0430\u043D\u0442 S (\u043A\u0440\u0443\u0442\u043A\u0430)", p.gachaPity, 1),
      this.paramField("maxDays", "\u041C\u0430\u043A\u0441. \u0434\u043D\u0435\u0439", p.maxDays, 1)
    );
    wrap.appendChild(grid);
    const extra = document.createElement("div");
    extra.style.cssText = "display: grid; gap: 10px; margin-top: 10px;";
    extra.append(
      this.paramField("checkpoints", "\u0427\u0435\u043A\u043F\u043E\u0438\u043D\u0442\u044B \u0443\u0440\u043E\u0432\u043D\u0435\u0439", p.checkpoints.join(", "), 0, true),
      this.paramField("leagueUnlockLevels", "\u0423\u0440\u043E\u0432\u043D\u0438 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F \u043B\u0438\u0433", p.leagueUnlockLevels.join(", "), 0, true)
    );
    wrap.appendChild(extra);
    const hint = document.createElement("div");
    hint.textContent = "\u041B\u0438\u0433\u0430 2 (\u0421\u0435\u0440\u0435\u0431\u0440\u043E) \u0441 \u0443\u0440\u043E\u0432\u043D\u044F 40 \u2014 \u043A\u0430\u043A \u0432 \u0422\u0417; \u0434\u0430\u043B\u044C\u0448\u0435 60 / 80 / 100 / 120 / 140. \u0412\u043E\u0437\u0432\u044B\u0448\u0435\u043D\u0438\u0435 (\u043E\u0441\u043A\u043E\u043B\u043A\u0438/\u0433\u0435\u0440\u0431\u044B) \u0441\u043F\u0438\u0441\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u0431\u0440\u0435\u0439\u043A\u043F\u043E\u0438\u043D\u0442\u043E\u0432 20/40/60/80.";
    hint.style.cssText = "margin-top: 10px; font-size: 12px; color: #9e9e9e; line-height: 1.4;";
    wrap.appendChild(hint);
    return wrap;
  }
  paramField(key, label, value, step, wide = false) {
    const wrap = document.createElement("label");
    wrap.style.cssText = `display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #bdbdbd;${wide ? " grid-column: 1 / -1;" : ""}`;
    wrap.append(label);
    const input = document.createElement("input");
    input.value = String(value);
    if (!wide) {
      input.type = "number";
      input.min = "0";
      input.step = String(step || 1);
    }
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
  createTableRow(id, description, defaultUrl) {
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
    this.loadButton.disabled = false;
    this.summaryEl.textContent = `\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E ${loaded} / ${CONFIG_TABLES.length}`;
    this.summaryEl.style.color = loaded === CONFIG_TABLES.length ? "#7dcea0" : "#e74c3c";
    if (loaded === CONFIG_TABLES.length) {
      this.runSim();
    }
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
    this.setStatus(id, "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026", "#9e9e9e");
    this.parsedTables.delete(id);
    try {
      const csv = await fetchGoogleSheetCsv(url);
      if (!this.isLoadCurrent(id, rowGeneration, batchGeneration)) {
        return false;
      }
      const parsed = parseCsvTable(csv);
      this.parsedTables.set(id, parsed);
      const headerPreview = parsed.headers.filter((header) => header !== "").join(", ");
      this.setStatus(id, `${parsed.rows.length} \u0441\u0442\u0440\u043E\u043A \xB7 ${headerPreview}`, "#7dcea0");
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
      adsPerDay: Math.max(0, num("adsPerDay", d.adsPerDay)),
      winRate: Math.min(1, Math.max(0, num("winRatePct", d.winRate * 100) / 100)),
      dustPerPull: Math.max(0, num("dustPerPull", d.dustPerPull)),
      sHeroCount: Math.max(1, Math.round(num("sHeroCount", d.sHeroCount))),
      factionCount: Math.max(1, Math.round(num("factionCount", d.factionCount))),
      gachaPity: Math.max(1, Math.round(num("gachaPity", d.gachaPity))),
      maxDays: Math.max(1, Math.round(num("maxDays", d.maxDays))),
      checkpoints: list("checkpoints", d.checkpoints),
      leagueUnlockLevels: list("leagueUnlockLevels", d.leagueUnlockLevels)
    };
  }
  runSim() {
    this.runButton.disabled = true;
    try {
      if (this.parsedTables.size < CONFIG_TABLES.length) {
        throw new Error("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0432\u0441\u0435 \u0442\u0430\u0431\u043B\u0438\u0446\u044B");
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
      `\u0414\u043D\u0435\u0439: ${result.daysRun} \xB7 \u0423\u0440\u043E\u0432\u0435\u043D\u044C \u043E\u0442\u0440\u044F\u0434\u0430: ${result.finalLevel} / ${result.maxLevel} \xB7 \u041B\u0438\u0433\u0430: ${result.finalLeagueName}`
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
        ["\u041A\u0440\u0443\u0442\u043E\u043A \u0434\u043E S (\u0441 \u0433\u0430\u0440\u0430\u043D\u0442\u043E\u043C 80)", this.fmt(g.pullsToS)],
        ["\u041F\u044B\u043B\u0438 \u043D\u0430 1 \u0438\u043C\u0435\u043D\u043D\u043E\u0439 \u043E\u0441\u043A\u043E\u043B\u043E\u043A", this.fmt(g.dustPerNamedShard)],
        ["\u041F\u044B\u043B\u0438 \u043D\u0430 1 \u0444\u0440\u0430\u043A\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u0433\u0435\u0440\u0431", this.fmt(g.dustPerFactionEmblem)],
        [`\u041F\u043E\u043B\u043D\u043E\u0435 \u0432\u043E\u0437\u0432\u044B\u0448\u0435\u043D\u0438\u0435 1 \u0433\u0435\u0440\u043E\u044F (${g.shardsPerHero} \u043E\u0441\u043A. + ${g.armsPerHero} \u0433\u0435\u0440\u0431.)`, this.fmt(g.dustPerHeroFullAscension)],
        ["\u041F\u043E\u043B\u043D\u043E\u0435 \u0432\u043E\u0437\u0432\u044B\u0448\u0435\u043D\u0438\u0435 \u043E\u0442\u0440\u044F\u0434\u0430", this.fmt(g.dustPerSquadFullAscension)]
      ]
    ));
    this.resultsEl.appendChild(this.sectionTitle("\u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u0434\u043E\u0445\u043E\u0434 \u043F\u043E \u043B\u0438\u0433\u0430\u043C"));
    this.resultsEl.appendChild(this.simpleTable(
      ["\u041B\u0438\u0433\u0430", "\u0421\u043F\u0438\u043D\u044B", "PvP \u0431\u043E\u0451\u0432", "\u0417\u043E\u043B\u043E\u0442\u043E", "\u041E\u043F\u044B\u0442", "\u042D\u0441\u0441\u0435\u043D\u0446\u0438\u044F", "\u041F\u044B\u043B\u044C"],
      result.incomeByLeague.map((row) => [
        row.leagueName,
        this.fmt(row.income.spins),
        this.fmt(row.income.pvpFights),
        this.fmt(row.income.total.gold),
        this.fmt(row.income.total.exp),
        this.fmt(row.income.total.essence),
        this.fmt(row.income.total.dust)
      ])
    ));
    this.resultsEl.appendChild(this.sectionTitle("\u041E\u0441\u0442\u0430\u0442\u043E\u043A \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u044F"));
    this.resultsEl.appendChild(this.kvLine(
      `\u0417\u043E\u043B\u043E\u0442\u043E ${this.fmt(result.inventory.gold)} \xB7 \u041E\u043F\u044B\u0442 ${this.fmt(result.inventory.exp)} \xB7 \u042D\u0441\u0441\u0435\u043D\u0446\u0438\u044F ${this.fmt(result.inventory.essence)} \xB7 \u041F\u044B\u043B\u044C ${this.fmt(result.inventory.dust)}`
    ));
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
