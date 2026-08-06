/**
 * InstaHelp Shop — catalog admin script
 *
 * Attach this script to your Shop spreadsheet, then run once:
 *   bootstrapShopCatalog()
 *
 * That creates PRODUCTS / CATEGORIES / BRANDS / DASHBOARD tabs,
 * seeds sample rows, recomputes prices, and installs sync triggers.
 *
 * After setup: File → Share → Anyone with the link (Viewer)
 * so the mobile app can load the live catalog.
 */
var CONFIG = {
  SHEET_ID: "1XfPC6fcV_Ct97vDwaRJDVbZ2hJNQRvj2FWj0nddqwR4",
  TEAM_EMAIL: "yourteam@email.com",
  AMAZON_AFFILIATE_ID: "youraffid-21",
  FLIPKART_AFFILIATE_ID: "youraffid",
  MYNTRA_AFFILIATE_ID: "youraffid",
  MEESHO_AFFILIATE_ID: "youraffid",
  PRICE_MIN: 1,
  PRICE_MAX: 500000,
};

var PRODUCTS_SHEET = "PRODUCTS";
var DASHBOARD_SHEET = "DASHBOARD";
var CATEGORIES_SHEET = "CATEGORIES";
var BRANDS_SHEET = "BRANDS";
var CHANGE_LOG_SHEET = "Change Log";
var AFFILIATE_CONFIG_SHEET = "AFFILIATE_CONFIG";

var SYNC_CELL = "A2";

/** Column order — app reads by header name, not position. */
var PRODUCTS_HEADERS = [
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

var SHOP_CATEGORIES = [
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

var CATEGORY_ALIASES = {
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

var PRICE_HEADERS = [
  "amazon_price",
  "flipkart_price",
  "myntra_price",
  "meesho_price",
];

var AFFILIATE_HEADERS = [
  "amazon_aff_link",
  "flipkart_aff_link",
  "myntra_aff_link",
  "meesho_aff_link",
];

var WATCH_HEADERS = [
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

// ─── One-time bootstrap ───────────────────────────────────────────────────────

/**
 * Run this once from the Apps Script editor.
 * Creates every tab, headers, sample products, dashboard sync cell, and triggers.
 */
function bootstrapShopCatalog() {
  setupShopSheets();
  createTriggers();
  var ss = getSpreadsheet_();
  var products = ss.getSheetByName(PRODUCTS_SHEET);
  var gid = products ? String(products.getSheetId()) : "0";
  writeDashboardNote_(
    "Bootstrap complete. PRODUCTS sheet gid=" +
      gid +
      ". Share the file as Anyone with the link (Viewer). App env: EXPO_PUBLIC_SHOP_PRODUCTS_GID=" +
      gid,
  );
  ss.toast("Shop catalog ready — PRODUCTS gid " + gid, "InstaHelp Shop", 8);
}

/**
 * Creates / repairs PRODUCTS, CATEGORIES, BRANDS, DASHBOARD tabs.
 * Safe to re-run — adds missing columns without deleting rows.
 */
function setupShopSheets() {
  var ss = getSpreadsheet_();

  setupCategoriesSheet_(ss);
  setupBrandsSheet_(ss);
  setupAffiliateConfigSheet_(ss);
  setupProductsSheet_(ss);
  ensureDashboard_();
  recomputeAllProducts_();

  var products = ss.getSheetByName(PRODUCTS_SHEET);
  var gid = products ? String(products.getSheetId()) : "0";
  writeDashboardNote_(
    "Setup complete at " +
      nowIstIso_() +
      ". PRODUCTS gid=" +
      gid +
      ". Share as Anyone with the link (Viewer).",
  );
  ss.toast("InstaHelp Shop sheets ready (gid " + gid + ")", "Setup", 6);
}

function getSpreadsheet_() {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {
    // Fall through to openById
  }
  return SpreadsheetApp.openById(CONFIG.SHEET_ID);
}

function setupCategoriesSheet_(ss) {
  var sheet = ss.getSheetByName(CATEGORIES_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CATEGORIES_SHEET);
  }
  sheet.clear();
  sheet.getRange(1, 1, 1, 3).setValues([["category_id", "label", "app_filter"]]);
  var rows = SHOP_CATEGORIES.map(function (id) {
    return [id, categoryLabel_(id), "yes"];
  });
  sheet.getRange(2, 1, rows.length, 3).setValues(rows);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 3);
}

function setupBrandsSheet_(ss) {
  var sheet = ss.getSheetByName(BRANDS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(BRANDS_SHEET);
  }
  if (sheet.getLastRow() < 2) {
    sheet.clear();
    sheet.getRange(1, 1, 1, 2).setValues([["brand", "active"]]);
    sheet.getRange(2, 1, 8, 2).setValues([
      ["Samsung", "yes"],
      ["Apple", "yes"],
      ["Nike", "yes"],
      ["Puma", "yes"],
      ["Lakme", "yes"],
      ["Boat", "yes"],
      ["Prestige", "yes"],
      ["Generic", "yes"],
    ]);
  }
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 2);
}

function setupAffiliateConfigSheet_(ss) {
  var sheet = ss.getSheetByName(AFFILIATE_CONFIG_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(AFFILIATE_CONFIG_SHEET);
  }
  if (sheet.getLastRow() < 2) {
    sheet.clear();
    sheet.getRange(1, 1, 1, 2).setValues([["key", "value"]]);
    sheet.getRange(2, 1, 4, 2).setValues([
      ["amazon_affiliate_id", CONFIG.AMAZON_AFFILIATE_ID],
      ["flipkart_affiliate_id", CONFIG.FLIPKART_AFFILIATE_ID],
      ["myntra_affiliate_id", CONFIG.MYNTRA_AFFILIATE_ID],
      ["meesho_affiliate_id", CONFIG.MEESHO_AFFILIATE_ID],
    ]);
  }
  sheet.setFrozenRows(1);
}

function setupProductsSheet_(ss) {
  var sheet = ss.getSheetByName(PRODUCTS_SHEET);
  if (!sheet) {
    var first = ss.getSheets()[0];
    var firstName = first ? first.getName() : "";
    var firstEmpty = first && first.getLastRow() <= 1;
    var reserved =
      firstName === CATEGORIES_SHEET ||
      firstName === BRANDS_SHEET ||
      firstName === DASHBOARD_SHEET ||
      firstName === AFFILIATE_CONFIG_SHEET ||
      firstName === CHANGE_LOG_SHEET;

    if (first && firstEmpty && !reserved) {
      first.setName(PRODUCTS_SHEET);
      sheet = first;
    } else {
      sheet = ss.insertSheet(PRODUCTS_SHEET, 0);
    }
  }

  try {
    if (sheet.getIndex() !== 1) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(1);
    }
  } catch (e) {
    // Non-fatal — gid is what the app uses
  }

  ensureHeaders_(sheet, PRODUCTS_HEADERS);
  applyProductsFormatting_(sheet);
  applyProductsValidations_(ss, sheet);
}

function ensureHeaders_(sheet, requiredHeaders) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var existing = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (h) {
      return normalizeHeader_(h);
    });

  var missing = [];
  requiredHeaders.forEach(function (header) {
    if (existing.indexOf(normalizeHeader_(header)) < 0) {
      missing.push(header);
    }
  });

  if (missing.length) {
    var startCol = existing[0] ? existing.length + 1 : 1;
    if (!existing[0] && existing.length === 1) startCol = 1;
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
  }

  if (sheet.getLastRow() <= 1) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    seedSampleProducts_(sheet);
  }
}

function seedSampleProducts_(sheet) {
  var aff = CONFIG.AMAZON_AFFILIATE_ID;
  var rows = [
    [
      "PRD1001",
      "Noise Cancelling Earbuds",
      "electronics",
      "Earbuds",
      "Boat",
      "https://images.unsplash.com/photo-1585386959984-a4155223168f?w=800",
      "",
      "",
      "",
      "Comfort-fit earbuds with deep bass and clear calls.",
      "Noise cancelling|28h battery|Dual mic",
      "Bestseller",
      1999,
      1899,
      "",
      "",
      "",
      "",
      "https://www.amazon.in/dp/EXAMPLE1?tag=" + aff,
      "https://www.flipkart.com/p/itm?pid=EXAMPLE1",
      "",
      "",
      4.4,
      1242,
      "In stock",
      10,
      "",
      "",
      "yes",
    ],
    [
      "PRD1002",
      "Sport Smartwatch 44mm",
      "electronics",
      "Wearables",
      "Samsung",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      "",
      "",
      "",
      "Track workouts, steps and sleep with a bright display.",
      "Fitness tracking|Water resistant|Always-on display",
      "Top rated",
      3499,
      3299,
      "",
      "",
      "",
      "",
      "https://www.amazon.in/dp/EXAMPLE2?tag=" + aff,
      "https://www.flipkart.com/p/itm?pid=EXAMPLE2",
      "",
      "",
      4.6,
      832,
      "In stock",
      20,
      "",
      "",
      "yes",
    ],
    [
      "PRD1003",
      "Vitamin C Brightening Serum",
      "beauty",
      "Skincare",
      "Lakme",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
      "",
      "",
      "",
      "Gentle vitamin C blend for everyday glow.",
      "Lightweight|Daily use|Non-greasy",
      "Glow",
      899,
      849,
      799,
      "",
      "",
      "",
      "https://www.amazon.in/dp/EXAMPLE3?tag=" + aff,
      "https://www.flipkart.com/p/itm?pid=EXAMPLE3",
      "https://www.myntra.com/buy/EXAMPLE3",
      "",
      4.3,
      541,
      "In stock",
      30,
      "",
      "",
      "yes",
    ],
    [
      "PRD1004",
      "Running Shoes — Men",
      "fashion",
      "Footwear",
      "Nike",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      "",
      "",
      "",
      "Cushioned daily trainers for road runs and gym days.",
      "Breathable mesh|Cushion midsole|Durable outsole",
      "New",
      4999,
      4699,
      4599,
      "",
      "",
      "",
      "https://www.amazon.in/dp/EXAMPLE4?tag=" + aff,
      "https://www.flipkart.com/p/itm?pid=EXAMPLE4",
      "https://www.myntra.com/buy/EXAMPLE4",
      "",
      4.5,
      2104,
      "In stock",
      15,
      "",
      "",
      "yes",
    ],
    [
      "PRD1005",
      "Non-Stick Cookware Set (3pc)",
      "home-kitchen",
      "Cookware",
      "Prestige",
      "https://images.unsplash.com/photo-1556911220-bff31c28b763?w=800",
      "",
      "",
      "",
      "Everyday non-stick pans for quick Indian cooking.",
      "PFOA-free|Induction ready|Easy clean",
      "Value pick",
      2499,
      2299,
      "",
      "",
      "",
      "",
      "https://www.amazon.in/dp/EXAMPLE5?tag=" + aff,
      "https://www.flipkart.com/p/itm?pid=EXAMPLE5",
      "",
      "",
      4.2,
      980,
      "In stock",
      40,
      "",
      "",
      "yes",
    ],
  ];
  sheet.getRange(2, 1, rows.length, PRODUCTS_HEADERS.length).setValues(rows);
}

function applyProductsFormatting_(sheet) {
  var map = getHeaderMap_(sheet);
  var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRow.setFontWeight("bold").setBackground("#edf7ea");

  var computed = ["best_platform", "discount_pct", "on_discount", "in_stock"];
  computed.forEach(function (name) {
    var col = map[name];
    if (col) {
      sheet
        .getRange(2, col, Math.max(sheet.getLastRow() - 1, 1), 1)
        .setBackground("#f3f4f6")
        .setFontColor("#6b7280");
    }
  });

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, sheet.getLastColumn());
}

function applyProductsValidations_(ss, sheet) {
  var map = getHeaderMap_(sheet);
  var lastRow = Math.max(sheet.getLastRow(), 200);

  if (map.category) {
    var catRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(SHOP_CATEGORIES, true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, map.category, lastRow - 1, 1).setDataValidation(catRule);
  }

  if (map.brand) {
    var brands = getActiveBrands_(ss);
    if (brands.length) {
      var brandRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(brands, true)
        .setAllowInvalid(true)
        .build();
      sheet.getRange(2, map.brand, lastRow - 1, 1).setDataValidation(brandRule);
    }
  }

  if (map.is_active) {
    var activeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["yes", "no"], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, map.is_active, lastRow - 1, 1).setDataValidation(activeRule);
  }

  if (map.sort_priority) {
    sheet.getRange(2, map.sort_priority, lastRow - 1, 1).setNumberFormat("0");
  }

  PRICE_HEADERS.forEach(function (name) {
    var col = map[name];
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
  var sheet = e.range.getSheet();
  if (sheet.getName() !== PRODUCTS_SHEET) return;

  var row = e.range.getRow();
  if (row < 2) return;

  var map = getHeaderMap_(sheet);
  var col = e.range.getColumn();
  var header = getHeaderByCol_(map, col);

  if (header && PRICE_HEADERS.indexOf(header) >= 0) {
    var numeric = parsePrice_(e.range.getValue());
    if (
      numeric !== null &&
      (numeric < CONFIG.PRICE_MIN || numeric > CONFIG.PRICE_MAX)
    ) {
      if (e.oldValue !== undefined) {
        e.range.setValue(e.oldValue);
      }
      e.range.setBackground("#ffc7ce");
      getSpreadsheet_().toast(
        "Price must be between ₹" + CONFIG.PRICE_MIN + " and ₹" + CONFIG.PRICE_MAX,
        "Invalid price",
        5,
      );
      return;
    }
    e.range.setBackground(null);
  }

  if (header === "category") {
    var normalized = normalizeCategory_(e.range.getValue());
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
    var sheet = getSpreadsheet_().getSheetByName(PRODUCTS_SHEET);
    if (!sheet) return;

    var activeRange = sheet.getActiveRange();
    if (!activeRange || activeRange.getSheet().getName() !== PRODUCTS_SHEET) {
      touchSyncTimestamp_();
      return;
    }

    var row = activeRange.getRow();
    if (row < 2) return;

    var map = getHeaderMap_(sheet);
    var idCol = map.product_id || 1;
    var productIdCell = sheet.getRange(row, idCol);
    if (!String(productIdCell.getValue() || "").trim()) {
      var id = generateProductId_();
      productIdCell.setValue(id);
      fillAffiliatePlaceholders_(sheet, row, map, id);
    }

    recomputeProductRow_(sheet, row, map);
    touchSyncTimestamp_();
    appendChangeLogFromRow_(row, "ROW_ADDED");
  }
}

// ─── Row compute ──────────────────────────────────────────────────────────────

function recomputeAllProducts_() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(PRODUCTS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return;

  var map = getHeaderMap_(sheet);
  for (var row = 2; row <= sheet.getLastRow(); row++) {
    recomputeProductRow_(sheet, row, map);
  }
  touchSyncTimestamp_();
}

function recomputeProductRow_(sheet, row, map) {
  map = map || getHeaderMap_(sheet);
  var values = sheet.getRange(row, 1, row, sheet.getLastColumn()).getValues()[0];

  var prices = [];
  var platforms = [
    { key: "amazon_price", label: "Amazon" },
    { key: "flipkart_price", label: "Flipkart" },
    { key: "myntra_price", label: "Myntra" },
    { key: "meesho_price", label: "Meesho" },
  ];

  platforms.forEach(function (p) {
    var col = map[p.key];
    if (!col) return;
    var price = parsePrice_(values[col - 1]);
    if (price != null) {
      prices.push({ label: p.label, price: price });
    }
  });

  var bestPlatform = "";
  var bestPrice = null;
  var maxPrice = null;

  prices.forEach(function (p) {
    if (bestPrice === null || p.price < bestPrice) {
      bestPrice = p.price;
      bestPlatform = p.label;
    }
    if (maxPrice === null || p.price > maxPrice) {
      maxPrice = p.price;
    }
  });

  var discountPct = "";
  if (bestPrice != null && maxPrice != null && maxPrice > bestPrice) {
    discountPct = Math.round(((maxPrice - bestPrice) / maxPrice) * 100);
  }

  var stockCol = map.stock;
  var stockVal = stockCol ? String(values[stockCol - 1] || "") : "";
  var inStock = isInStock_(stockVal) ? "yes" : "no";
  var onDiscount =
    discountPct !== "" && Number(discountPct) > 0 ? "yes" : "no";

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
  var ss = getSpreadsheet_();
  var productsSheet = ss.getSheetByName(PRODUCTS_SHEET);
  var configSheet = ss.getSheetByName(AFFILIATE_CONFIG_SHEET);
  if (!productsSheet) return;

  var credentials = readAffiliateConfig_(configSheet);
  if (!credentials.configured) {
    logDashboardEvent_("Price fetch skipped — AFFILIATE_CONFIG not configured");
    return;
  }

  var map = getHeaderMap_(productsSheet);
  var data = productsSheet.getDataRange().getValues();
  if (data.length < 2) return;

  var updated = 0;
  var failures = [];

  for (var r = 1; r < data.length; r++) {
    var idCol = (map.product_id || 1) - 1;
    var activeCol = map.is_active ? map.is_active - 1 : -1;
    var productId = String(data[r][idCol] || "").trim();
    if (!productId) continue;
    if (
      activeCol >= 0 &&
      String(data[r][activeCol] || "").trim().toLowerCase() !== "yes"
    ) {
      continue;
    }

    try {
      var prices = fetchAffiliatePrices_(productId, credentials);
      if (prices.amazon != null && map.amazon_price) {
        productsSheet.getRange(r + 1, map.amazon_price).setValue(prices.amazon);
        updated++;
      }
      if (prices.flipkart != null && map.flipkart_price) {
        productsSheet
          .getRange(r + 1, map.flipkart_price)
          .setValue(prices.flipkart);
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
  var ss = getSpreadsheet_();
  var file = DriveApp.getFileById(ss.getId());
  file.setDescription("InstaHelp Shop catalog refresh " + nowIstIso_());
  recomputeAllProducts_();
  var dash = ss.getSheetByName(DASHBOARD_SHEET);
  if (dash) {
    dash.getRange("B2").setValue("Last refresh: " + nowIstIso_());
  }
  logDashboardEvent_("Auto-refresh + recompute at " + nowIstIso_());
}

function weeklyEmailAlert_() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(PRODUCTS_SHEET);
  if (!sheet) return;

  var map = getHeaderMap_(sheet);
  var rows = sheet.getDataRange().getValues();
  var active = 0;
  var outOfStock = 0;
  var onDiscount = 0;

  for (var i = 1; i < rows.length; i++) {
    var activeCol = map.is_active ? map.is_active - 1 : -1;
    if (
      activeCol >= 0 &&
      String(rows[i][activeCol] || "").trim().toLowerCase() !== "yes"
    ) {
      continue;
    }
    active++;

    var inStockCol = map.in_stock ? map.in_stock - 1 : -1;
    if (
      inStockCol >= 0 &&
      String(rows[i][inStockCol] || "").trim().toLowerCase() === "no"
    ) {
      outOfStock++;
    }

    var discountCol = map.on_discount ? map.on_discount - 1 : -1;
    if (
      discountCol >= 0 &&
      String(rows[i][discountCol] || "").trim().toLowerCase() === "yes"
    ) {
      onDiscount++;
    }
  }

  var body =
    "InstaHelp Shop weekly summary\n\n" +
    "Active products: " +
    active +
    "\n" +
    "Out of stock: " +
    outOfStock +
    "\n" +
    "On discount: " +
    onDiscount +
    "\n";

  MailApp.sendEmail(CONFIG.TEAM_EMAIL, "InstaHelp Shop — weekly summary", body);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHeaderMap_(sheet) {
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  headers.forEach(function (h, i) {
    var key = normalizeHeader_(h);
    if (key) map[key] = i + 1;
  });
  if (!map.image_url_1 && map.image_url) {
    map.image_url_1 = map.image_url;
  }
  if (!map.product_name && map.name) {
    map.product_name = map.name;
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
  var raw = String(value || "").trim().toLowerCase();
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
  var sheet = ss.getSheetByName(BRANDS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  var brands = [];
  rows.forEach(function (row) {
    var name = String(row[0] || "").trim();
    var active = String(row[1] || "yes").trim().toLowerCase();
    if (name && active === "yes") brands.push(name);
  });
  return brands;
}

function isInStock_(stock) {
  var s = String(stock || "").trim().toLowerCase();
  if (!s) return true;
  return (
    s !== "no" &&
    s !== "out" &&
    s !== "out of stock" &&
    s.indexOf("unavailable") < 0
  );
}

function ensureDashboard_() {
  var ss = getSpreadsheet_();
  var dash = ss.getSheetByName(DASHBOARD_SHEET);
  if (!dash) {
    dash = ss.insertSheet(DASHBOARD_SHEET);
    dash.getRange("A1").setValue("last_updated");
    dash.getRange("B1").setValue("notes");
    dash.getRange("C1").setValue("active_products");
    dash.getRange("D1").setValue("brands_count");
    dash.getRange("E1").setValue("products_gid");
  }
  if (!String(dash.getRange(SYNC_CELL).getValue() || "").trim()) {
    dash.getRange(SYNC_CELL).setValue(nowIstIso_());
  }

  var products = ss.getSheetByName(PRODUCTS_SHEET);
  if (products) {
    dash.getRange("E2").setValue(String(products.getSheetId()));
  }

  var log = ss.getSheetByName(CHANGE_LOG_SHEET);
  if (!log) {
    log = ss.insertSheet(CHANGE_LOG_SHEET);
    log.hideSheet();
    log.appendRow(["timestamp", "editor", "cell", "action"]);
  }
}

function touchSyncTimestamp_() {
  ensureDashboard_();
  var ss = getSpreadsheet_();
  var dash = ss.getSheetByName(DASHBOARD_SHEET);
  dash.getRange(SYNC_CELL).setValue(nowIstIso_());

  var products = ss.getSheetByName(PRODUCTS_SHEET);
  if (products && products.getLastRow() > 1) {
    var map = getHeaderMap_(products);
    var active = 0;
    var data = products
      .getRange(2, 1, products.getLastRow() - 1, products.getLastColumn())
      .getValues();
    var activeCol = map.is_active ? map.is_active - 1 : -1;
    data.forEach(function (row) {
      if (
        activeCol < 0 ||
        String(row[activeCol] || "").trim().toLowerCase() === "yes"
      ) {
        active++;
      }
    });
    dash.getRange("C2").setValue(active);
    dash.getRange("D2").setValue(getActiveBrands_(ss).length);
    dash.getRange("E2").setValue(String(products.getSheetId()));
  }
}

function logDashboardEvent_(message) {
  ensureDashboard_();
  getSpreadsheet_()
    .getSheetByName(DASHBOARD_SHEET)
    .getRange("B2")
    .setValue(String(message || ""));
}

function writeDashboardNote_(message) {
  logDashboardEvent_(message);
}

function nowIstIso_() {
  var tz = "Asia/Kolkata";
  var formatted = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd'T'HH:mm:ss");
  return formatted + "+05:30";
}

function parsePrice_(value) {
  if (value === "" || value === null || value === undefined) return null;
  var n = Number(String(value).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
}

function generateProductId_() {
  return "PRD" + String(Date.now()).slice(-6);
}

function fillAffiliatePlaceholders_(sheet, row, map, productId) {
  var templates = {
    amazon_aff_link:
      "https://www.amazon.in/dp/PLACEHOLDER?tag=" + CONFIG.AMAZON_AFFILIATE_ID,
    flipkart_aff_link:
      "https://www.flipkart.com/p/" +
      productId +
      "?affid=" +
      CONFIG.FLIPKART_AFFILIATE_ID,
    myntra_aff_link: "https://www.myntra.com/buy/" + productId,
    meesho_aff_link: "https://www.meesho.com/p/" + productId,
  };
  AFFILIATE_HEADERS.forEach(function (name) {
    var col = map[name];
    if (!col) return;
    var cell = sheet.getRange(row, col);
    if (!String(cell.getValue() || "").trim()) {
      cell.setValue(templates[name] || "");
    }
  });
}

function appendChangeLog_(e) {
  ensureDashboard_();
  var log = getSpreadsheet_().getSheetByName(CHANGE_LOG_SHEET);
  var editor =
    Session.getActiveUser().getEmail() ||
    Session.getEffectiveUser().getEmail() ||
    "unknown";
  log.appendRow([nowIstIso_(), editor, e.range.getA1Notation(), "EDIT"]);
}

function appendChangeLogFromRow_(row, action) {
  ensureDashboard_();
  var log = getSpreadsheet_().getSheetByName(CHANGE_LOG_SHEET);
  var editor =
    Session.getActiveUser().getEmail() ||
    Session.getEffectiveUser().getEmail() ||
    "unknown";
  log.appendRow([nowIstIso_(), editor, "PRODUCTS!A" + row, action]);
}

function readAffiliateConfig_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) {
    return { configured: false };
  }
  var values = sheet.getDataRange().getValues();
  var config = { configured: false };
  for (var i = 1; i < values.length; i++) {
    var key = String(values[i][0] || "").trim().toLowerCase();
    var val = String(values[i][1] || "").trim();
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
