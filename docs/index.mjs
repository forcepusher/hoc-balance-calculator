// src/BalanceCalculator.ts
var DEFAULT_OUTCOMES = [
  {
    id: "energy",
    symbol: "\u042D\u043D\u0435\u0440\u0433\u0438\u044F \u0434\u043B\u044F \u0440\u0443\u043B\u0435\u0442\u043A\u0438",
    chancePercent: 22,
    rewardAmount: 1,
    rewardUnit: "\u042D\u043D\u0435\u0440\u0433\u0438\u044F"
  },
  {
    id: "gacha_small",
    symbol: "\u0420\u0435\u0441\u0443\u0440\u0441 \u0434\u043B\u044F \u0433\u0430\u0447\u0438 (\u041C\u0430\u043B\u043E)",
    chancePercent: 20,
    rewardAmount: 5,
    rewardUnit: "\u0410\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u041F\u044B\u043B\u044C"
  },
  {
    id: "pve",
    symbol: "\u0421\u0438\u043C\u0432\u043E\u043B PvE",
    chancePercent: 15,
    rewardAmount: 1,
    rewardUnit: "PvE \u0432\u0445\u043E\u0434"
  },
  {
    id: "gold_small",
    symbol: "\u0417\u043E\u043B\u043E\u0442\u043E (\u041C\u0430\u043B\u043E\u0435)",
    chancePercent: 15,
    rewardAmount: 50,
    rewardUnit: "\u0417\u043E\u043B\u043E\u0442\u043E"
  },
  {
    id: "gacha_large",
    symbol: "\u0420\u0435\u0441\u0443\u0440\u0441 \u0434\u043B\u044F \u0433\u0430\u0447\u0438 (\u041C\u043D\u043E\u0433\u043E)",
    chancePercent: 8,
    rewardAmount: 20,
    rewardUnit: "\u0410\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u041F\u044B\u043B\u044C"
  },
  {
    id: "pvp",
    symbol: "PvP \u0441\u0438\u043C\u0432\u043E\u043B",
    chancePercent: 8,
    rewardAmount: 1,
    rewardUnit: "PvP \u0430\u0442\u0430\u043A\u0430"
  },
  {
    id: "gold_large",
    symbol: "\u0417\u043E\u043B\u043E\u0442\u043E (\u0411\u043E\u043B\u044C\u0448\u043E\u0435)",
    chancePercent: 7,
    rewardAmount: 200,
    rewardUnit: "\u0417\u043E\u043B\u043E\u0442\u043E"
  },
  {
    id: "empty",
    symbol: "\u041D\u0438\u0447\u0435\u0433\u043E (\u041F\u0443\u0441\u0442\u043E\u0439 \u0441\u043F\u0438\u043D)",
    chancePercent: 5,
    rewardAmount: 0,
    rewardUnit: "\u2014"
  }
];
var BalanceCalculator = class {
  outcomes;
  root;
  totalEl;
  rollsInput;
  resultCells = /* @__PURE__ */ new Map();
  chanceInputs = /* @__PURE__ */ new Map();
  rewardInputs = /* @__PURE__ */ new Map();
  constructor(parentElement) {
    this.outcomes = DEFAULT_OUTCOMES.map((outcome) => ({ ...outcome }));
    this.root = this.createRoot();
    this.totalEl = this.root.querySelector("[data-total]");
    this.rollsInput = this.root.querySelector("[data-rolls]");
    this.rollsInput.addEventListener("input", () => this.applyResults());
    parentElement.appendChild(this.root);
    this.renderTable();
    this.refresh();
  }
  getOutcomes() {
    return this.outcomes.map((outcome) => ({ ...outcome }));
  }
  getChancePercent(id) {
    const outcome = this.outcomes.find((item) => item.id === id);
    if (!outcome) {
      throw new Error(`Unknown slot symbol: ${id}`);
    }
    return outcome.chancePercent;
  }
  setChancePercent(id, chancePercent) {
    const outcome = this.outcomes.find((item) => item.id === id);
    if (!outcome) {
      throw new Error(`Unknown slot symbol: ${id}`);
    }
    const clamped = this.clampChance(chancePercent);
    outcome.chancePercent = clamped;
    const input = this.chanceInputs.get(id);
    if (input && Number(input.value) !== clamped) {
      input.value = String(clamped);
    }
    this.refresh();
  }
  getRewardAmount(id) {
    const outcome = this.outcomes.find((item) => item.id === id);
    if (!outcome) {
      throw new Error(`Unknown slot symbol: ${id}`);
    }
    return outcome.rewardAmount;
  }
  setRewardAmount(id, rewardAmount) {
    const outcome = this.outcomes.find((item) => item.id === id);
    if (!outcome) {
      throw new Error(`Unknown slot symbol: ${id}`);
    }
    const clamped = this.clampReward(rewardAmount);
    outcome.rewardAmount = clamped;
    const input = this.rewardInputs.get(id);
    if (input && Number(input.value) !== clamped) {
      input.value = String(clamped);
    }
    this.applyResults();
  }
  getTotalChancePercent() {
    return this.outcomes.reduce((sum, outcome) => sum + outcome.chancePercent, 0);
  }
  getRollCount() {
    const parsed = Number(this.rollsInput.value);
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    return Math.max(0, Math.floor(parsed));
  }
  /** Expected hits and reward totals for N rolls, weighted by chance %. */
  calculate(rolls = this.getRollCount()) {
    const safeRolls = Math.max(0, Math.floor(rolls));
    const totalChance = this.getTotalChancePercent();
    return this.outcomes.map((outcome) => {
      const probability = totalChance > 0 ? outcome.chancePercent / totalChance : 0;
      const hits = safeRolls * probability;
      const totalReward = hits * outcome.rewardAmount;
      return {
        id: outcome.id,
        hits,
        totalReward,
        rewardUnit: outcome.rewardUnit
      };
    });
  }
  createRoot() {
    const root = document.createElement("div");
    root.style.cssText = [
      "width: min(960px, 96vw)",
      "max-height: 92vh",
      "overflow: auto",
      "color: #e8e8e8",
      "font-family: Segoe UI, Tahoma, sans-serif",
      "background: #141414",
      "border: 1px solid #333",
      "border-radius: 8px",
      "padding: 16px",
      "box-sizing: border-box"
    ].join(";");
    const title = document.createElement("h2");
    title.textContent = "\u0411\u0430\u043B\u0430\u043D\u0441 \u043A\u0440\u0443\u0442\u043E\u043A \u0441\u043B\u043E\u0442-\u043C\u0430\u0448\u0438\u043D\u044B";
    title.style.cssText = "margin: 0 0 12px; font-size: 20px; font-weight: 600;";
    root.appendChild(title);
    const controls = document.createElement("div");
    controls.style.cssText = "display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 14px;";
    const rollsLabel = document.createElement("label");
    rollsLabel.style.cssText = "display: inline-flex; align-items: center; gap: 8px; font-size: 14px;";
    rollsLabel.append("\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0441\u043F\u0438\u043D\u043E\u0432:");
    const rollsInput = document.createElement("input");
    rollsInput.type = "number";
    rollsInput.min = "0";
    rollsInput.step = "1";
    rollsInput.value = "20";
    rollsInput.setAttribute("data-rolls", "");
    rollsInput.setAttribute("aria-label", "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0441\u043F\u0438\u043D\u043E\u0432");
    rollsInput.style.cssText = [
      "width: 100px",
      "padding: 6px 8px",
      "border: 1px solid #444",
      "border-radius: 4px",
      "background: #0f0f0f",
      "color: #f0f0f0",
      "font: inherit"
    ].join(";");
    rollsLabel.appendChild(rollsInput);
    controls.appendChild(rollsLabel);
    root.appendChild(controls);
    const tableHost = document.createElement("div");
    tableHost.setAttribute("data-table-host", "");
    root.appendChild(tableHost);
    const footer = document.createElement("div");
    footer.style.cssText = "margin-top: 12px; display: flex; align-items: center; gap: 8px; font-size: 14px;";
    footer.innerHTML = "<span>\u0421\u0443\u043C\u043C\u0430 \u0448\u0430\u043D\u0441\u043E\u0432:</span><strong data-total>0%</strong>";
    root.appendChild(footer);
    return root;
  }
  renderTable() {
    const host = this.root.querySelector("[data-table-host]");
    host.replaceChildren();
    this.chanceInputs.clear();
    this.rewardInputs.clear();
    this.resultCells.clear();
    const table = document.createElement("table");
    table.style.cssText = [
      "width: 100%",
      "border-collapse: collapse",
      "font-size: 13px",
      "table-layout: fixed"
    ].join(";");
    const colgroup = document.createElement("colgroup");
    for (const width of ["28%", "14%", "26%", "32%"]) {
      const col = document.createElement("col");
      col.style.width = width;
      colgroup.appendChild(col);
    }
    table.appendChild(colgroup);
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    for (const label of ["\u0421\u0438\u043C\u0432\u043E\u043B \u043D\u0430 \u0441\u043B\u043E\u0442\u0435", "\u0428\u0430\u043D\u0441 \u0432\u044B\u043F\u0430\u0434\u0435\u043D\u0438\u044F", "\u041D\u0430\u0433\u0440\u0430\u0434\u0430 \u0438\u0433\u0440\u043E\u043A\u0430", "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442"]) {
      const th = document.createElement("th");
      th.textContent = label;
      th.style.cssText = [
        "text-align: left",
        "padding: 10px 8px",
        "border-bottom: 1px solid #3a3a3a",
        "color: #bdbdbd",
        "font-weight: 600",
        "background: #1c1c1c"
      ].join(";");
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    for (const outcome of this.outcomes) {
      tbody.appendChild(this.createRow(outcome));
    }
    table.appendChild(tbody);
    host.appendChild(table);
  }
  createRow(outcome) {
    const row = document.createElement("tr");
    const symbolCell = document.createElement("td");
    symbolCell.textContent = outcome.symbol;
    this.styleCell(symbolCell);
    const chanceCell = document.createElement("td");
    this.styleCell(chanceCell);
    chanceCell.appendChild(this.createChanceInput(outcome));
    const rewardCell = document.createElement("td");
    this.styleCell(rewardCell);
    rewardCell.appendChild(this.createRewardInput(outcome));
    const resultCell = document.createElement("td");
    this.styleCell(resultCell);
    resultCell.textContent = "\u2014";
    resultCell.style.color = "#9e9e9e";
    this.resultCells.set(outcome.id, resultCell);
    row.append(symbolCell, chanceCell, rewardCell, resultCell);
    return row;
  }
  createChanceInput(outcome) {
    const wrap = document.createElement("label");
    wrap.style.cssText = "display: inline-flex; align-items: center; gap: 4px;";
    const input = this.createNumberInput(outcome.chancePercent, `\u0428\u0430\u043D\u0441 \u0432\u044B\u043F\u0430\u0434\u0435\u043D\u0438\u044F: ${outcome.symbol}`);
    input.max = "100";
    input.addEventListener("input", () => {
      const parsed = Number(input.value);
      outcome.chancePercent = Number.isFinite(parsed) ? this.clampChance(parsed) : 0;
      this.refresh();
    });
    input.addEventListener("blur", () => {
      input.value = String(outcome.chancePercent);
    });
    this.chanceInputs.set(outcome.id, input);
    const suffix = document.createElement("span");
    suffix.textContent = "%";
    suffix.style.color = "#9e9e9e";
    wrap.append(input, suffix);
    return wrap;
  }
  createRewardInput(outcome) {
    const wrap = document.createElement("label");
    wrap.style.cssText = "display: inline-flex; align-items: center; gap: 6px;";
    const input = this.createNumberInput(outcome.rewardAmount, `\u041D\u0430\u0433\u0440\u0430\u0434\u0430: ${outcome.symbol}`);
    input.addEventListener("input", () => {
      const parsed = Number(input.value);
      outcome.rewardAmount = Number.isFinite(parsed) ? this.clampReward(parsed) : 0;
      this.applyResults();
    });
    input.addEventListener("blur", () => {
      input.value = String(outcome.rewardAmount);
    });
    this.rewardInputs.set(outcome.id, input);
    const unit = document.createElement("span");
    unit.textContent = outcome.rewardUnit;
    unit.style.color = "#9e9e9e";
    wrap.append(input, unit);
    return wrap;
  }
  createNumberInput(value, ariaLabel) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "1";
    input.value = String(value);
    input.setAttribute("aria-label", ariaLabel);
    input.style.cssText = [
      "width: 72px",
      "padding: 6px 8px",
      "border: 1px solid #444",
      "border-radius: 4px",
      "background: #0f0f0f",
      "color: #f0f0f0",
      "font: inherit"
    ].join(";");
    return input;
  }
  applyResults() {
    const results = this.calculate();
    for (const result of results) {
      const cell = this.resultCells.get(result.id);
      if (!cell) {
        continue;
      }
      const outcome = this.outcomes.find((item) => item.id === result.id);
      if (!outcome || outcome.rewardAmount === 0) {
        cell.textContent = `${this.formatNumber(result.hits)} \u0432\u044B\u043F\u0430\u0434\u0435\u043D\u0438\u0439`;
        cell.style.color = "#e8e8e8";
        continue;
      }
      cell.textContent = `${this.formatNumber(result.totalReward)} ${result.rewardUnit}`;
      cell.style.color = "#e8e8e8";
    }
  }
  styleCell(cell) {
    cell.style.cssText = [
      "padding: 10px 8px",
      "border-bottom: 1px solid #2a2a2a",
      "vertical-align: middle",
      "line-height: 1.35",
      "word-wrap: break-word"
    ].join(";");
  }
  refresh() {
    this.updateTotal();
    this.applyResults();
  }
  updateTotal() {
    const total = this.getTotalChancePercent();
    this.totalEl.textContent = `${total}%`;
    this.totalEl.style.color = total === 100 ? "#7dcea0" : "#e74c3c";
  }
  clampChance(value) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.min(100, Math.max(0, Math.round(value)));
  }
  clampReward(value) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.round(value));
  }
  formatNumber(value) {
    return Number.isInteger(value) ? String(value) : value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
  }
};

// src/index.ts
var applicationViewportDiv = document.createElement("div");
applicationViewportDiv.style = "width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center; position: relative; overflow: hidden;";
document.body.appendChild(applicationViewportDiv);
var balanceCalculator = new BalanceCalculator(applicationViewportDiv);
