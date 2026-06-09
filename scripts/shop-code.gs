/**
 * InstaHelp Shop — Google Sheet backend
 *
 * Run once after attaching to your spreadsheet:
 *   1. setupShopSheets()
 *   2. createTriggers()
 *
 * Sheet ID: 1oFNlCO_z2rek3FweEGBKqk_2lLi7fWD0QKUg-_l67TE
 */
const CONFIG = {
  SHEET_ID: "1oFNlCO_z2rek3FweEGBKqk_2lLi7fWD0QKUg-_l67TE",
  TEAM_EMAIL: "yourteam@email.com",
  AMAZON_AFFILIATE_ID: "youraffid-21",
  FLIPKART_AFFILIATE_ID: "youraffid",
  MYNTRA_AFFILIATE_ID: "youraffid",
  MEESHO_AFFILIATE_ID: "youraffid",
  PRICE_MIN: 1,
  PRICE_MAX: 500000,
};

const PRODUCTS_SHEET = "PRODUCTS";
const DASHBOARD_SHEET = "DASHBOARD";
const CATEGORIES_SHEET = "CATEGORIES";
const BRANDS_SHEET = "BRANDS";
const CHANGE_LOG_SHEET = "Change Log";
const AFFILIATE_CONFIG_SHEET = "AFFILIATE_CONFIG";

const SYNC_CELL = "A2";

/** Column order — app reads by header name, not position. */
const PRODUCTS_HEADERS = [
  "product_id",
  "product_name",
  "category",
  "sub_category",
  "brand",
  "image_url_1",
  "image_url_2",
  "image_url_3",
  "image_url_4",
  "description",
  "highlights",
  "badge",
  "amazon_price",
  "flipkart_price",
  "myntra_price",
  "meesho_price",
  "best_platform",
  "discount_pct",
  "amazon_aff_link",
  "flipkart_aff_link",
  "myntra_aff_link",
  "meesho_aff_link",
  "rating",
  "review_count",
  "stock",
  "sort_priority",
  "on_discount",
  "in_stock",
  "is_active",
];

const SHOP_CATEGORIES = [
  "electronics",
  "fashion",
  "home-kitchen",
  "beauty",
  "sports",
  "books",
  "toys-games",
  "grocery",
  "automotive",
  "office-supplies",
];

const CATEGORY_ALIASES = {
  electronic: "electronics",
  gadgets: "electronics",
  apparel: "fashion",
  clothing: "fashion",
  home: "home-kitchen",
  kitchen: "home-kitchen",
  decor: "home-kitchen",
  "home & kitchen": "home-kitchen",
  skincare: "beauty",
  sport: "sports",
  fitness: "sports",
  book: "books",
  toys: "toys-games",
  games: "toys-games",
  gaming: "toys-games",
  groceries: "grocery",
  food: "grocery",
  auto: "automotive",
  car: "automotive",
  office: "office-supplies",
  stationery: "office-supplies",
};

const PRICE_HEADERS = [
  "amazon_price",
  "flipkart_price",
  "myntra_price",
  "meesho_price",
];

const AFFILIATE_HEADERS = [
  "amazon_aff_link",
  "flipkart_aff_link",
  "myntra_aff_link",
  "meesho_aff_link",
];

const WATCH_HEADERS = [
  "product_name",
  "category",
  "sub_category",
  "brand",
  "image_url_1",
  "image_url_2",
  "image_url_3",
  "image_url_4",
  "description",
  "highlights",
  "badge",
  "amazon_price",
  "flipkart_price",
  "myntra_price",
  "meesho_price",
  "amazon_aff_link",
  "flipkart_aff_link",
  "myntra_aff_link",
  "meesho_aff_link",
  "rating",
  "review_count",
  "stock",
  "sort_priority",
  "is_active",
];

// ─── One-time setup ───────────────────────────────────────────────────────────

/**
 * Creates / repairs PRODUCTS, CATEGORIES, BRANDS, DASHBOARD tabs.
 * Safe to re-run — adds missing columns without deleting rows.
 */
function setupShopSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

  setupCategoriesSheet_(ss);
  setupBrandsSheet_(ss);
  setupProductsSheet_(ss);
  ensureDashboard_();
  recomputeAllProducts_();

  writeDashboardNote_(
    "Setup complete at " +
      nowIstIso_() +
      ". Fill brand, images (url_1–4), sort_priority. Publish sheet to web.",
  );
  ss.toast("InstaHelp Shop sheets ready", "Setup", 6);
}

function setupCategoriesSheet_(ss) {
  let sheet = ss.getSheetByName(CATEGORIES_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CATEGORIES_SHEET);
  }
  sheet.clear();
  sheet.getRange(1, 1, 1, 3).setValues([
    ["category_id", "label", "app_filter"],
  ]);
  const rows = SHOP_CATEGORIES.map(function (id) {
    return [id, categoryLabel_(id), "yes"];
  });
  sheet.getRange(2, 1, rows.length, 3).setValues(rows);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 3);
}

function setupBrandsSheet_(ss) {
  let sheet = ss.getSheetByName(BRANDS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(BRANDS_SHEET);
  }
  if (sheet.getLastRow() < 2) {
    sheet.clear();
    sheet.getRange(1, 1, 1, 2).setValues([["brand", "active"]]);
    sheet.getRange(2, 1, 6, 2).setValues([
      ["Samsung", "yes"],
      ["Apple", "yes"],
      ["Nike", "yes"],
      ["Puma", "yes"],
      ["Lakme", "yes"],
      ["Generic", "yes"],
    ]);
  }
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 2);
}

function setupProductsSheet_(ss) {
  let sheet = ss.getSheetByName(PRODUCTS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(PRODUCTS_SHEET);
  }

  ensureHeaders_(sheet, PRODUCTS_HEADERS);
  applyProductsFormatting_(sheet);
  applyProductsValidations_(ss, sheet);
}

function ensureHeaders_(sheet, requiredHeaders) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const existing = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (h) {
      return normalizeHeader_(h);
    });

  const missing = [];
  requiredHeaders.forEach(function (header) {
    if (existing.indexOf(normalizeHeader_(header)) < 0) {
      missing.push(header);
    }
  });

  if (missing.length) {
    const startCol = existing.length + 1;
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
  }

  // Normalize row 1 to canonical order when sheet is new / empty body
  if (sheet.getLastRow() <= 1) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    sheet.getRange(2, 1, 1, requiredHeaders.length).setValues([
      [
        "PRD0001",
        "Sample Product",
        "electronics",
        "Earbuds",
        "Samsung",
        "https://images.unsplash.com/photo-1585386959984-a4155223168f?w=800",
        "",
        "",
        "",
        "Short description for the app product page.",
        "Noise cancelling|28h battery|Dual mic",
        "Bestseller",
        1999,
        1899,
        "",
        "",
        "",
        "",
        "https://amazon.in/dp/EXAMPLE?tag=" + CONFIG.AMAZON_AFFILIATE_ID,
        "https://flipkart.com/p/EXAMPLE",
        "",
        "",
        4.4,
        1200,
        "In stock",
        10,
        "",
        "",
        "yes",
      ],
    ]);
  }
}

function applyProductsFormatting_(sheet) {
  const map = getHeaderMap_(sheet);
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRow.setFontWeight("bold").setBackground("#edf7ea");

  const computed = ["best_platform", "discount_pct", "on_discount", "in_stock"];
  computed.forEach(function (name) {
    const col = map[name];
    if (col) {
      sheet.getRange(2, col, Math.max(sheet.getLastRow() - 1, 1), 1)
        .setBackground("#f3f4f6")
        .setFontColor("#6b7280");
    }
  });

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, sheet.getLastColumn());
}

function applyProductsValidations_(ss, sheet) {
  const map = getHeaderMap_(sheet);
  const lastRow = Math.max(sheet.getLastRow(), 200);

  if (map.category) {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(SHOP_CATEGORIES, true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, map.category, lastRow - 1, 1).setDataValidation(rule);
  }

  if (map.brand) {
    const brands = getActiveBrands_(ss);
    if (brands.length) {
      const rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(brands, true)
        .setAllowInvalid(true)
        .build();
      sheet.getRange(2, map.brand, lastRow - 1, 1).setDataValidation(rule);
    }
  }

  if (map.is_active) {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["yes", "no"], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, map.is_active, lastRow - 1, 1).setDataValidation(rule);
  }

  if (map.sort_priority) {
    sheet.getRange(2, map.sort_priority, lastRow - 1, 1).setNumberFormat("0");
  }

  PRICE_HEADERS.forEach(function (name) {
    const col = map[name];
    if (col) {
      sheet.getRange(2, col, lastRow - 1, 1).setNumberFormat("₹#,##0");
    }
  });
}

// ─── Triggers ─────────────────────────────────────────────────────────────────

function createTriggers() {
  clearTriggers();

  ScriptApp.newTrigger("onEditHandler_")
    .forSpreadsheet(CONFIG.SHEET_ID)
    .onEdit()
    .create();

  ScriptApp.newTrigger("onChangeHandler_")
    .forSpreadsheet(CONFIG.SHEET_ID)
    .onChange()
    .create();

  ScriptApp.newTrigger("scheduledPriceFetch_")
    .timeBased()
    .everyHours(6)
    .create();

  ScriptApp.newTrigger("autoPublish_")
    .timeBased()
    .everyMinutes(30)
    .create();

  ScriptApp.newTrigger("weeklyEmailAlert_")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .inTimezone("Asia/Kolkata")
    .create();

  ensureDashboard_();
  writeDashboardNote_("Triggers created at " + nowIstIso_());
}

function clearTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
}

// ─── Edit handlers ────────────────────────────────────────────────────────────

function onEditHandler_(e) {
  if (!e || !e.range) return;
  onEdit_(e);
}

function onChangeHandler_(e) {
  if (!e) return;
  onChange_(e);
}

function onEdit_(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== PRODUCTS_SHEET) return;

  const row = e.range.getRow();
  if (row < 2) return;

  const map = getHeaderMap_(sheet);
  const col = e.range.getColumn();
  const header = getHeaderByCol_(map, col);

  if (header && PRICE_HEADERS.indexOf(header) >= 0) {
    const numeric = parsePrice_(e.range.getValue());
    if (
      numeric !== null &&
      (numeric < CONFIG.PRICE_MIN || numeric > CONFIG.PRICE_MAX)
    ) {
      if (e.oldValue !== undefined) {
        e.range.setValue(e.oldValue);
      }
      e.range.setBackground("#ffc7ce");
      SpreadsheetApp.openById(CONFIG.SHEET_ID).toast(
        "Price must be between ₹" + CONFIG.PRICE_MIN + " and ₹" + CONFIG.PRICE_MAX,
        "Invalid price",
        5,
      );
      return;
    }
    e.range.setBackground(null);
  }

  if (header === "category") {
    const normalized = normalizeCategory_(e.range.getValue());
    if (normalized !== String(e.range.getValue() || "").trim()) {
      e.range.setValue(normalized);
    }
  }

  recomputeProductRow_(sheet, row, map);

  if (!header || WATCH_HEADERS.indexOf(header) < 0) return;

  touchSyncTimestamp_();
  appendChangeLog_(e);
}

function onChange_(e) {
  if (!e || !e.changeType) return;

  if (e.changeType === "INSERT_ROW" || e.changeType === "INSERT_GRID") {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(
      PRODUCTS_SHEET,
    );
    if (!sheet) return;

    const activeRange = sheet.getActiveRange();
    if (!activeRange || activeRange.getSheet().getName() !== PRODUCTS_SHEET) {
      touchSyncTimestamp_();
      return;
    }

    const row = activeRange.getRow();
    if (row < 2) return;

    const map = getHeaderMap_(sheet);
    const idCol = map.product_id || 1;
    const productIdCell = sheet.getRange(row, idCol);
    if (!String(productIdCell.getValue() || "").trim()) {
      const id = generateProductId_();
      productIdCell.setValue(id);
      fillAffiliatePlaceholders_(sheet, row, map, id);
    }

    recomputeProductRow_(sheet, row, map);
    touchSyncTimestamp_();
    appendChangeLogFromRow_(row, "ROW_ADDED");
  }
}

// ─── Row compute (filter / sort helpers for the app) ──────────────────────────

function recomputeAllProducts_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(PRODUCTS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return;

  const map = getHeaderMap_(sheet);
  for (let row = 2; row <= sheet.getLastRow(); row++) {
    recomputeProductRow_(sheet, row, map);
  }
  touchSyncTimestamp_();
}

function recomputeProductRow_(sheet, row, map) {
  map = map || getHeaderMap_(sheet);
  const values = sheet
    .getRange(row, 1, row, sheet.getLastColumn())
    .getValues()[0];

  const prices = [];
  const platforms = [
    { key: "amazon_price", label: "Amazon" },
    { key: "flipkart_price", label: "Flipkart" },
    { key: "myntra_price", label: "Myntra" },
    { key: "meesho_price", label: "Meesho" },
  ];

  platforms.forEach(function (p) {
    const col = map[p.key];
    if (!col) return;
    const price = parsePrice_(values[col - 1]);
    if (price != null) {
      prices.push({ label: p.label, price: price });
    }
  });

  let bestPlatform = "";
  let bestPrice = null;
  let maxPrice = null;

  prices.forEach(function (p) {
    if (bestPrice === null || p.price < bestPrice) {
      bestPrice = p.price;
      bestPlatform = p.label;
    }
    if (maxPrice === null || p.price > maxPrice) {
      maxPrice = p.price;
    }
  });

  let discountPct = "";
  if (bestPrice != null && maxPrice != null && maxPrice > bestPrice) {
    discountPct = Math.round(((maxPrice - bestPrice) / maxPrice) * 100);
  }

  const stockCol = map.stock;
  const stockVal = stockCol ? String(values[stockCol - 1] || "") : "";
  const inStock = isInStock_(stockVal) ? "yes" : "no";
  const onDiscount = discountPct !== "" && Number(discountPct) > 0 ? "yes" : "no";

  if (map.best_platform) {
    sheet.getRange(row, map.best_platform).setValue(bestPlatform);
  }
  if (map.discount_pct) {
    sheet.getRange(row, map.discount_pct).setValue(discountPct);
  }
  if (map.on_discount) {
    sheet.getRange(row, map.on_discount).setValue(onDiscount);
  }
  if (map.in_stock) {
    sheet.getRange(row, map.in_stock).setValue(inStock);
  }
}

// ─── Scheduled jobs ───────────────────────────────────────────────────────────

function scheduledPriceFetch_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const productsSheet = ss.getSheetByName(PRODUCTS_SHEET);
  const configSheet = ss.getSheetByName(AFFILIATE_CONFIG_SHEET);
  if (!productsSheet) return;

  const credentials = readAffiliateConfig_(configSheet);
  if (!credentials.configured) {
    logDashboardEvent_("Price fetch skipped — AFFILIATE_CONFIG not configured");
    return;
  }

  const map = getHeaderMap_(productsSheet);
  const data = productsSheet.getDataRange().getValues();
  if (data.length < 2) return;

  let updated = 0;
  const failures = [];

  for (let r = 1; r < data.length; r++) {
    const idCol = (map.product_id || 1) - 1;
    const activeCol = map.is_active ? map.is_active - 1 : -1;
    const productId = String(data[r][idCol] || "").trim();
    if (!productId) continue;
    if (activeCol >= 0 && String(data[r][activeCol] || "").trim().toLowerCase() !== "yes") {
      continue;
    }

    try {
      const prices = fetchAffiliatePrices_(productId, credentials);
      if (prices.amazon != null && map.amazon_price) {
        productsSheet.getRange(r + 1, map.amazon_price).setValue(prices.amazon);
        updated++;
      }
      if (prices.flipkart != null && map.flipkart_price) {
        productsSheet.getRange(r + 1, map.flipkart_price).setValue(prices.flipkart);
      }
      recomputeProductRow_(productsSheet, r + 1, map);
    } catch (err) {
      failures.push(productId + ": " + (err.message || String(err)));
    }
  }

  touchSyncTimestamp_();
  logDashboardEvent_(
    "Price fetch: updated " +
      updated +
      " products" +
      (failures.length ? "; failures: " + failures.join("; ") : ""),
  );
}

function autoPublish_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const file = DriveApp.getFileById(CONFIG.SHEET_ID);
  file.setDescription(
    "InstaHelp Shop republish " + nowIstIso_() + " — forces published CSV refresh",
  );
  recomputeAllProducts_();
  ss.getSheetByName(DASHBOARD_SHEET) &&
    ss
      .getSheetByName(DASHBOARD_SHEET)
      .getRange("B2")
      .setValue("Last republish: " + nowIstIso_());
  logDashboardEvent_("Auto-publish + recompute at " + nowIstIso_());
}

function weeklyEmailAlert_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(PRODUCTS_SHEET);
  if (!sheet) return;

  const map = getHeaderMap_(sheet);
  const rows = sheet.getDataRange().getValues();
  let active = 0;
  let outOfStock = 0;
  let onDiscount = 0;

  for (let i = 1; i < rows.length; i++) {
    const activeCol = map.is_active ? map.is_active - 1 : -1;
    if (activeCol >= 0 && String(rows[i][activeCol] || "").trim().toLowerCase() !== "yes") {
      continue;
    }
    active++;

    const inStockCol = map.in_stock ? map.in_stock - 1 : -1;
    if (inStockCol >= 0 && String(rows[i][inStockCol] || "").trim().toLowerCase() === "no") {
      outOfStock++;
    }

    const discountCol = map.on_discount ? map.on_discount - 1 : -1;
    if (discountCol >= 0 && String(rows[i][discountCol] || "").trim().toLowerCase() === "yes") {
      onDiscount++;
    }
  }

  const sheetUrl =
    "https://docs.google.com/spreadsheets/d/" + CONFIG.SHEET_ID + "/edit";
  const body =
    "InstaHelp Shop weekly summary\n\n" +
    "Active products: " + active + "\n" +
    "Out of stock: " + outOfStock + "\n" +
    "On discount: " + onDiscount + "\n\n" +
    "Open sheet: " + sheetUrl;

  MailApp.sendEmail(CONFIG.TEAM_EMAIL, "InstaHelp Shop — weekly summary", body);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHeaderMap_(sheet) {
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};
  headers.forEach(function (h, i) {
    const key = normalizeHeader_(h);
    if (key) map[key] = i + 1;
  });
  // Legacy alias
  if (!map.image_url_1 && map.image_url) {
    map.image_url_1 = map.image_url;
  }
  return map;
}

function getHeaderByCol_(map, col) {
  for (var key in map) {
    if (map[key] === col) return key;
  }
  return "";
}

function normalizeHeader_(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizeCategory_(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "electronics";
  if (SHOP_CATEGORIES.indexOf(raw) >= 0) return raw;
  if (CATEGORY_ALIASES[raw]) return CATEGORY_ALIASES[raw];
  return "electronics";
}

function categoryLabel_(id) {
  return id
    .split("-")
    .map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function getActiveBrands_(ss) {
  const sheet = ss.getSheetByName(BRANDS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  const brands = [];
  rows.forEach(function (row) {
    const name = String(row[0] || "").trim();
    const active = String(row[1] || "yes").trim().toLowerCase();
    if (name && active === "yes") brands.push(name);
  });
  return brands;
}

function isInStock_(stock) {
  const s = String(stock || "").trim().toLowerCase();
  if (!s) return true;
  return (
    s !== "no" &&
    s !== "out" &&
    s !== "out of stock" &&
    s.indexOf("unavailable") < 0
  );
}

function ensureDashboard_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let dash = ss.getSheetByName(DASHBOARD_SHEET);
  if (!dash) {
    dash = ss.insertSheet(DASHBOARD_SHEET);
    dash.getRange("A1").setValue("last_updated");
    dash.getRange("B1").setValue("notes");
    dash.getRange("C1").setValue("active_products");
    dash.getRange("D1").setValue("brands_count");
  }
  if (!String(dash.getRange(SYNC_CELL).getValue() || "").trim()) {
    dash.getRange(SYNC_CELL).setValue(nowIstIso_());
  }

  let log = ss.getSheetByName(CHANGE_LOG_SHEET);
  if (!log) {
    log = ss.insertSheet(CHANGE_LOG_SHEET);
    log.hideSheet();
    log.appendRow(["timestamp", "editor", "cell", "action"]);
  }
}

function touchSyncTimestamp_() {
  ensureDashboard_();
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const dash = ss.getSheetByName(DASHBOARD_SHEET);
  dash.getRange(SYNC_CELL).setValue(nowIstIso_());

  const products = ss.getSheetByName(PRODUCTS_SHEET);
  if (products && products.getLastRow() > 1) {
    const map = getHeaderMap_(products);
    let active = 0;
    const data = products.getRange(2, 1, products.getLastRow() - 1, products.getLastColumn()).getValues();
    const activeCol = map.is_active ? map.is_active - 1 : -1;
    data.forEach(function (row) {
      if (activeCol < 0 || String(row[activeCol] || "").trim().toLowerCase() === "yes") {
        active++;
      }
    });
    dash.getRange("C2").setValue(active);
    dash.getRange("D2").setValue(getActiveBrands_(ss).length);
  }
}

function logDashboardEvent_(message) {
  ensureDashboard_();
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  ss.getSheetByName(DASHBOARD_SHEET).getRange("B2").setValue(String(message || ""));
}

function writeDashboardNote_(message) {
  logDashboardEvent_(message);
}

function nowIstIso_() {
  const tz = "Asia/Kolkata";
  const formatted = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd'T'HH:mm:ss");
  return formatted + "+05:30";
}

function parsePrice_(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(String(value).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
}

function generateProductId_() {
  return "PRD" + String(Date.now()).slice(-6);
}

function fillAffiliatePlaceholders_(sheet, row, map, productId) {
  const templates = {
    amazon_aff_link:
      "https://amazon.in/dp/PLACEHOLDER?tag=" + CONFIG.AMAZON_AFFILIATE_ID,
    flipkart_aff_link:
      "https://flipkart.com/p/" + productId + "?affid=" + CONFIG.FLIPKART_AFFILIATE_ID,
    myntra_aff_link: "https://myntra.com/buy/" + productId,
    meesho_aff_link: "https://meesho.com/p/" + productId,
  };
  AFFILIATE_HEADERS.forEach(function (name) {
    const col = map[name];
    if (!col) return;
    const cell = sheet.getRange(row, col);
    if (!String(cell.getValue() || "").trim()) {
      cell.setValue(templates[name] || "");
    }
  });
}

function appendChangeLog_(e) {
  ensureDashboard_();
  const log = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CHANGE_LOG_SHEET);
  const editor =
    Session.getActiveUser().getEmail() ||
    Session.getEffectiveUser().getEmail() ||
    "unknown";
  log.appendRow([nowIstIso_(), editor, e.range.getA1Notation(), "EDIT"]);
}

function appendChangeLogFromRow_(row, action) {
  ensureDashboard_();
  const log = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CHANGE_LOG_SHEET);
  const editor =
    Session.getActiveUser().getEmail() ||
    Session.getEffectiveUser().getEmail() ||
    "unknown";
  log.appendRow([nowIstIso_(), editor, "PRODUCTS!A" + row, action]);
}

function readAffiliateConfig_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) {
    return { configured: false };
  }
  const values = sheet.getDataRange().getValues();
  const config = { configured: false };
  for (let i = 1; i < values.length; i++) {
    const key = String(values[i][0] || "").trim().toLowerCase();
    const val = String(values[i][1] || "").trim();
    if (key && val) {
      config[key] = val;
      config.configured = true;
    }
  }
  return config;
}

function fetchAffiliatePrices_(productId, credentials) {
  void productId;
  void credentials;
  return { amazon: null, flipkart: null };
}
