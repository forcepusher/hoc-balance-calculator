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
    defaultUrl: "https://docs.google.com/spreadsheets/d/1j1Pc686613peoJ9eY7Dj-8gRsm1I4AUBQtJIyKD1NnU"
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
function extractSpreadsheetId(raw) {
  const match = raw.trim().match(SPREADSHEET_ID_PATTERN);
  return match ? match[1] : null;
}
function normalizeGoogleSheetUrl(raw) {
  const trimmed = raw.trim();
  const id = extractSpreadsheetId(trimmed);
  if (!id) {
    return trimmed;
  }
  return canonicalGoogleSheetUrl(id);
}
function canonicalGoogleSheetUrl(spreadsheetId) {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}
function toGoogleSheetCsvExportUrl(raw) {
  const id = extractSpreadsheetId(raw);
  if (!id) {
    throw new Error("Not a Google Sheets URL");
  }
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
}
function shouldRewritePastedSheetUrl(raw) {
  const trimmed = raw.trim();
  if (!extractSpreadsheetId(trimmed)) {
    return false;
  }
  return /\/edit\b/i.test(trimmed) || /\/export\b/i.test(trimmed) || /\/pubhtml\b/i.test(trimmed) || /[?#]/.test(trimmed) || /\/$/.test(trimmed);
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
  const matrix = parseCsv(text);
  const nonempty = matrix.filter((row) => row.some((cell) => cell !== ""));
  if (nonempty.length === 0) {
    throw new Error("CSV is empty");
  }
  const headers = nonempty[0];
  const rows = nonempty.slice(1).map((row) => {
    const padded = row.slice();
    while (padded.length < headers.length) {
      padded.push("");
    }
    return padded.slice(0, headers.length);
  });
  return { headers, rows };
}
function looksLikeHtml(text) {
  const sample = text.slice(0, 256).trim().toLowerCase();
  return sample.startsWith("<!doctype") || sample.startsWith("<html");
}
function parseCsv(text) {
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

// src/ConfigTablesApp.ts
var ConfigTablesApp = class {
  parsedTables = /* @__PURE__ */ new Map();
  rowUi = /* @__PURE__ */ new Map();
  rowGeneration = /* @__PURE__ */ new Map();
  dirtyIds = /* @__PURE__ */ new Set();
  root;
  loadButton;
  summaryEl;
  loadGeneration = 0;
  constructor(parentElement) {
    this.root = this.createRoot();
    this.loadButton = this.root.querySelector("[data-load-all]");
    this.summaryEl = this.root.querySelector("[data-summary]");
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
      rows: table.rows.map((row) => [...row])
    };
  }
  bind() {
    this.loadButton.addEventListener("click", () => {
      void this.loadAll();
    });
  }
  createRoot() {
    const root = document.createElement("div");
    root.style.cssText = [
      "width: min(960px, 96vw)",
      "color: #e8e8e8",
      "font-family: Segoe UI, Tahoma, sans-serif",
      "background: #141414",
      "border: 1px solid #333",
      "border-radius: 8px",
      "padding: 16px",
      "box-sizing: border-box"
    ].join(";");
    const title = document.createElement("h2");
    title.textContent = "HoC Balance";
    title.style.cssText = "margin: 0 0 8px; font-size: 20px; font-weight: 600;";
    root.appendChild(title);
    const intro = document.createElement("p");
    intro.textContent = "\u0412\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435. \u0423\u0442\u0438\u043B\u0438\u0442\u0430 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043F\u0430\u0440\u0441\u0438\u0442 \u0442\u0435\u043A\u0443\u0449\u0438\u0435 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u043F\u0440\u043E\u0435\u043A\u0442\u0430:";
    intro.style.cssText = "margin: 0 0 14px; font-size: 14px; line-height: 1.45; color: #cfcfcf;";
    root.appendChild(intro);
    const controls = document.createElement("div");
    controls.style.cssText = "display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 14px;";
    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.textContent = "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0442\u0430\u0431\u043B\u0438\u0446\u044B";
    loadButton.setAttribute("data-load-all", "");
    loadButton.style.cssText = [
      "padding: 8px 12px",
      "border: 1px solid #555",
      "border-radius: 4px",
      "background: #1f1f1f",
      "color: #f0f0f0",
      "font: inherit",
      "cursor: pointer"
    ].join(";");
    controls.appendChild(loadButton);
    const summary = document.createElement("span");
    summary.setAttribute("data-summary", "");
    summary.style.cssText = "font-size: 13px; color: #9e9e9e;";
    controls.appendChild(summary);
    root.appendChild(controls);
    const list = document.createElement("div");
    list.style.cssText = "display: flex; flex-direction: column; gap: 12px;";
    for (const table of CONFIG_TABLES) {
      list.appendChild(this.createTableRow(table.id, table.description, table.defaultUrl));
    }
    root.appendChild(list);
    return root;
  }
  createTableRow(id, description, defaultUrl) {
    const row = document.createElement("div");
    row.style.cssText = [
      "display: flex",
      "flex-direction: column",
      "gap: 6px",
      "padding: 10px 10px 12px",
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
    input.placeholder = "https://docs.google.com/spreadsheets/d/\u2026";
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
      this.setStatus(
        id,
        `${parsed.rows.length} \u0441\u0442\u0440\u043E\u043A \xB7 ${headerPreview}`,
        "#7dcea0"
      );
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
};

// src/index.ts
var applicationViewportDiv = document.createElement("div");
applicationViewportDiv.style = "width: 100vw; min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding: 24px 0; box-sizing: border-box; position: relative;";
document.body.appendChild(applicationViewportDiv);
new ConfigTablesApp(applicationViewportDiv);
