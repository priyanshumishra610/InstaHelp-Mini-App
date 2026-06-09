/**
 * InstaHelp Google Apps Script backend.
 *
 * Deploy as a Web app:
 * - Execute as: Me  (required — UrlFetchApp / Razorpay will fail otherwise)
 * - Who has access: Anyone, or anyone with the link for testing
 *
 * Razorpay / UrlFetchApp one-time setup (after pasting this file):
 * 1. Project settings → enable "Show appsscript.json manifest file in editor"
 * 2. Paste scripts/appsscript.json oauthScopes into the manifest (or use clasp push)
 * 3. Run authorizeExploreServices() once from the editor → approve permissions
 * 4. Deploy → Manage deployments → Edit → New version → Deploy
 *
 * Optional: paste your spreadsheet ID below if this script is not bound to the
 * Google Sheet. Leave it blank when using SpreadsheetApp.getActiveSpreadsheet().
 */
const SPREADSHEET_ID = "1GxiZMq0-34BdDk5kC7Hp5hhpPBUped1xtNjNcytC-yY";

const BOOKING_SHEET_NAME = "Bookings";
const PROFILE_SHEET_NAME = "Profiles";
const VENDOR_LEADS_SHEET_NAME = "VendorLeads";

/**
 * Headers for the Bookings sheet.
 *
 * Adding a new column here is safe: ensureSheet_ will append any missing
 * headers to existing sheets the next time they're touched, so older
 * deployments migrate in-place without manual edits.
 */
const BOOKING_HEADERS = [
  "id",
  "phone",
  "name",
  "email",
  "address",
  "serviceId",
  "serviceLabel",
  "description",
  "preferredTime",
  "source",
  "paidStatus",
  "consent",
  "notes",
  "status",
  "createdAt",
  "updatedAt",
  "imageNote",
];

const PROFILE_HEADERS = [
  "phone",
  "name",
  "age",
  "gender",
  "city",
  "email",
  "birthday",
  "anniversary",
  "addressesJson",
  "favoritesJson",
  "createdAt",
  "updatedAt",
];

const VENDOR_LEADS_HEADERS = [
  "id",
  "phone",
  "name",
  "email",
  "businessName",
  "businessType",
  "city",
  "expectationsJson",
  "status",
  "createdAt",
  "updatedAt",
];

const EXPLORE_SUBSCRIPTIONS_SHEET = "ExploreSubscriptions";
const EXPLORE_PAYMENTS_SHEET = "ExplorePayments";

const EXPLORE_SUBSCRIPTION_HEADERS = [
  "phone",
  "plan",
  "status",
  "periodStart",
  "periodEnd",
  "revealsUsedThisWeek",
  "weekStartKey",
  "razorpayOrderId",
  "razorpayPaymentId",
  "amountPaise",
  "createdAt",
  "updatedAt",
];

const EXPLORE_PAYMENT_HEADERS = [
  "id",
  "phone",
  "planId",
  "razorpayOrderId",
  "razorpayPaymentId",
  "amountPaise",
  "status",
  "createdAt",
  "updatedAt",
];

/** planId -> amount in paise (₹99 / ₹299 MVP — 30-day access) */
const EXPLORE_PLAN_AMOUNTS_PAISE = {
  pro: 9900,
  pro_plus: 29900,
};

const EXPLORE_PLAN_PERIOD_DAYS = 30;
const PRO_WEEKLY_REVEAL_LIMIT = 10;

function doGet() {
  return jsonResponse_({ ok: true, data: "InstaHelp Apps Script alive" });
}

function doPost(e) {
  try {
    const body = parseBody_(e);

    const action = String(body.action || "").trim();

    switch (action) {
      case "createBooking":
        return jsonResponse_({ ok: true, data: createBooking_(body) });
      case "getBookings":
        return jsonResponse_({ ok: true, data: getBookings_(body.phone) });
      case "register":
      case "registerPhone":
        return jsonResponse_({ ok: true, data: registerPhone_(body) });
      case "getUserProfile":
        return jsonResponse_({ ok: true, data: getUserProfile_(body.phone) });
      case "updateProfile":
        return jsonResponse_({ ok: true, data: updateProfile_(body) });
      case "registerVendor":
        return jsonResponse_({ ok: true, data: registerVendor_(body) });
      case "createExploreOrder":
        return jsonResponse_({ ok: true, data: createExploreOrder_(body) });
      case "verifyExplorePayment":
        return jsonResponse_({ ok: true, data: verifyExplorePayment_(body) });
      case "getExploreSubscription":
        return jsonResponse_({ ok: true, data: getExploreSubscription_(body.phone) });
      case "recordExploreReveal":
        return jsonResponse_({ ok: true, data: recordExploreReveal_(body) });
      case "getHubbleToken":
        return jsonResponse_({ ok: true, data: getHubbleToken_(body) });
      default:
        throw new Error("Unknown action: " + action);
    }
  } catch (err) {
    return jsonResponse_({
      ok: false,
      error: err && err.message ? err.message : String(err),
    });
  }
}

function registerVendor_(body) {
  requireString_(body.phone, "phone");
  requireString_(body.email, "email");
  requireString_(body.businessName, "businessName");
  requireString_(body.businessType, "businessType");
  requireString_(body.city, "city");

  const expectations = Array.isArray(body.expectations)
    ? body.expectations
        .filter((x) => typeof x === "string" && String(x).trim())
        .map((x) => String(x).trim())
    : [];

  if (!expectations.length) {
    throw new Error("Missing required field: expectations");
  }

  const sheet = ensureSheet_(VENDOR_LEADS_SHEET_NAME, VENDOR_LEADS_HEADERS);
  const now = new Date().toISOString();
  const phone = normalizePhone_(body.phone);
  const id = "vd_" + Utilities.getUuid();

  const row = {
    id: id,
    phone: phone,
    name: stringOr_(body.name, ""),
    email: stringOr_(body.email, ""),
    businessName: stringOr_(body.businessName, ""),
    businessType: stringOr_(body.businessType, ""),
    city: stringOr_(body.city, ""),
    expectationsJson: JSON.stringify(expectations),
    status: "new",
    createdAt: now,
    updatedAt: now,
  };

  appendRowByHeaders_(sheet, VENDOR_LEADS_HEADERS, row);
  forceTextColumn_(sheet, getHeaderColumn1Based_(sheet, "phone"));

  return { id: id, status: "new" };
}

function createBooking_(body) {
  requireString_(body.phone, "phone");
  requireString_(body.serviceId, "serviceId");
  requireString_(body.serviceLabel, "serviceLabel");
  requireString_(body.description, "description");
  requireString_(body.preferredTime, "preferredTime");

  const sheet = ensureSheet_(BOOKING_SHEET_NAME, BOOKING_HEADERS);
  const phone = normalizePhone_(body.phone);
  const now = new Date().toISOString();

  const row = {
    id: body.id || "bk_" + Utilities.getUuid(),
    phone: phone,
    name: stringOr_(body.name, ""),
    email: stringOr_(body.email, ""),
    address: stringOr_(body.address, ""),
    serviceId: body.serviceId,
    serviceLabel: body.serviceLabel,
    description: body.description,
    preferredTime: body.preferredTime,
    source: stringOr_(body.source, ""),
    paidStatus: stringOr_(body.paidStatus, ""),
    consent: consentLabel_(body.consent),
    notes: stringOr_(body.notes, ""),
    status: "pending",
    createdAt: now,
    updatedAt: now,
    imageNote: body.imageBase64 ? "image attached" : "",
  };

  appendRowByHeaders_(sheet, BOOKING_HEADERS, row);
  forceTextColumn_(sheet, BOOKING_HEADERS.indexOf("phone") + 1);

  return {
    id: row.id,
    phone: row.phone,
    name: row.name,
    email: row.email,
    address: row.address,
    serviceId: row.serviceId,
    serviceLabel: row.serviceLabel,
    description: row.description,
    preferredTime: row.preferredTime,
    source: row.source,
    paidStatus: row.paidStatus,
    consent: row.consent,
    notes: row.notes,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function getBookings_(phone) {
  requireString_(phone, "phone");

  const sheet = ensureSheet_(BOOKING_SHEET_NAME, BOOKING_HEADERS);
  const target = normalizePhone_(phone);
  return getObjects_(sheet)
    .filter((booking) => normalizePhone_(booking.phone) === target)
    .map((booking) => ({
      id: stringOr_(booking.id, ""),
      serviceId: stringOr_(booking.serviceId, ""),
      serviceLabel: stringOr_(booking.serviceLabel, ""),
      description: stringOr_(booking.description, ""),
      preferredTime: stringOr_(booking.preferredTime, ""),
      name: stringOr_(booking.name, ""),
      email: stringOr_(booking.email, ""),
      address: stringOr_(booking.address, ""),
      source: stringOr_(booking.source, ""),
      paidStatus: stringOr_(booking.paidStatus, ""),
      consent: stringOr_(booking.consent, ""),
      notes: stringOr_(booking.notes, ""),
      status: stringOr_(booking.status, "pending"),
      createdAt: toIsoString_(booking.createdAt),
      updatedAt: toIsoString_(booking.updatedAt),
    }));
}

function emptyProfile_(phone) {
  return {
    phone: normalizePhone_(phone),
    name: "",
    age: null,
    gender: null,
    city: null,
    email: null,
    birthday: null,
    anniversary: null,
    addresses: [],
    favorites: [],
  };
}

function registerPhone_(body) {
  requireString_(body.phone, "phone");
  return upsertProfile_(body);
}

function getUserProfile_(phone) {
  requireString_(phone, "phone");

  const sheet = ensureSheet_(PROFILE_SHEET_NAME, PROFILE_HEADERS);
  const target = normalizePhone_(phone);
  const row = getObjects_(sheet).find(
    (profile) => normalizePhone_(profile.phone) === target,
  );

  if (!row) {
    return emptyProfile_(phone);
  }

  return profileFromRow_(row);
}

function updateProfile_(body) {
  requireString_(body.phone, "phone");
  return upsertProfile_(body);
}

function upsertProfile_(body) {
  requireString_(body.phone, "phone");

  const sheet = ensureSheet_(PROFILE_SHEET_NAME, PROFILE_HEADERS);
  const phone = normalizePhone_(body.phone);
  const target = normalizePhone_(phone);
  const existing = getObjects_(sheet).find(
    (profile) => normalizePhone_(profile.phone) === target,
  );

  const rowData = buildProfileRowData_(body, existing);
  upsertRowByHeaders_(sheet, "phone", phone, rowData);
  forceTextColumn_(sheet, getHeaderColumn1Based_(sheet, "phone"));

  return profileFromRow_(rowData);
}

function buildProfileRowData_(body, existing) {
  const addresses = Array.isArray(body.addresses)
    ? body.addresses
    : existing
      ? parseJsonArray_(existing.addressesJson)
      : [];
  const favorites = Array.isArray(body.favorites)
    ? body.favorites
    : existing
      ? parseJsonArray_(existing.favoritesJson)
      : [];

  return {
    phone: normalizePhone_(body.phone),
    name:
      body.name != null
        ? stringOr_(body.name, "")
        : stringOr_(existing && existing.name, ""),
    age:
      body.age != null && body.age !== ""
        ? body.age
        : existing
          ? existing.age
          : "",
    gender:
      body.gender != null
        ? stringOr_(body.gender, "")
        : stringOr_(existing && existing.gender, ""),
    city:
      body.city != null
        ? stringOr_(body.city, "")
        : stringOr_(existing && existing.city, ""),
    email:
      body.email != null
        ? stringOr_(body.email, "")
        : stringOr_(existing && existing.email, ""),
    birthday:
      body.birthday != null
        ? stringOr_(body.birthday, "")
        : stringOr_(existing && existing.birthday, ""),
    anniversary:
      body.anniversary != null
        ? stringOr_(body.anniversary, "")
        : stringOr_(existing && existing.anniversary, ""),
    addressesJson: JSON.stringify(addresses),
    favoritesJson: JSON.stringify(favorites),
  };
}

function upsertRowByHeaders_(sheet, keyHeader, keyValue, dataByHeader) {
  const lastCol = Math.max(sheet.getLastColumn(), PROFILE_HEADERS.length);
  const headerRow = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map((value) => String(value || "").trim());

  const keyCol = headerRow.indexOf(keyHeader);
  if (keyCol < 0) {
    throw new Error("Missing column: " + keyHeader);
  }

  const values = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  const normalizedKey = normalizePhone_(keyValue);
  let existingIndex = -1;
  let existingRow = null;

  for (let i = 1; i < values.length; i++) {
    if (normalizePhone_(values[i][keyCol]) === normalizedKey) {
      existingIndex = i;
      existingRow = values[i];
      break;
    }
  }

  const createdAtCol = headerRow.indexOf("createdAt");
  const updatedAtCol = headerRow.indexOf("updatedAt");

  const row = headerRow.map((header, colIndex) => {
    if (header && Object.prototype.hasOwnProperty.call(dataByHeader, header)) {
      const value = dataByHeader[header];
      return value === undefined || value === null ? "" : value;
    }
    if (existingRow) {
      return existingRow[colIndex];
    }
    return "";
  });

  if (existingIndex < 0 && createdAtCol >= 0) {
    row[createdAtCol] = dataByHeader.createdAt || now;
  }
  if (updatedAtCol >= 0) {
    row[updatedAtCol] = now;
  }

  if (existingIndex >= 0) {
    sheet.getRange(existingIndex + 1, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function getHeaderColumn1Based_(sheet, headerName) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const headerRow = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map((value) => String(value || "").trim());
  const index = headerRow.indexOf(headerName);
  return index >= 0 ? index + 1 : 1;
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Returns the sheet, creating it if missing and migrating any older sheet
 * that's missing columns from `headers`. Missing headers are appended to the
 * end of the existing header row so historical data stays put.
 */
function ensureSheet_(name, headers) {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const existing = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map((value) => String(value || "").trim());

  const allBlank = existing.every((value) => value === "");
  if (allBlank) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  const missing = headers.filter((header) => existing.indexOf(header) === -1);
  if (missing.length) {
    const startCol = existing.length + 1;
    sheet
      .getRange(1, startCol, 1, missing.length)
      .setValues([missing]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Appends a row using the sheet's actual header order so we never write to
 * the wrong column when new fields are added between deployments.
 */
function appendRowByHeaders_(sheet, expectedHeaders, dataByHeader) {
  const lastCol = Math.max(sheet.getLastColumn(), expectedHeaders.length);
  const headerRow = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map((value) => String(value || "").trim());

  const row = headerRow.map((header) => {
    if (header && Object.prototype.hasOwnProperty.call(dataByHeader, header)) {
      const value = dataByHeader[header];
      return value === undefined || value === null ? "" : value;
    }
    return "";
  });

  sheet.appendRow(row);
}

function forceTextColumn_(sheet, column1Based) {
  const lastRow = Math.max(sheet.getLastRow(), 1);
  if (lastRow < 2) return;
  sheet
    .getRange(2, column1Based, lastRow - 1, 1)
    .setNumberFormat("@STRING@");
}

function normalizePhone_(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[^0-9]/g, "");
}

function getObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  return values.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function profileFromRow_(row) {
  return {
    phone: String(row.phone || ""),
    name: String(row.name || ""),
    age: parseAge_(row.age),
    gender: nullableString_(row.gender),
    city: nullableString_(row.city),
    email: nullableString_(row.email),
    birthday: nullableString_(row.birthday),
    anniversary: nullableString_(row.anniversary),
    addresses: parseJsonArray_(row.addressesJson),
    favorites: parseJsonArray_(row.favoritesJson),
  };
}

function parseAge_(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

function nullableString_(value) {
  const str = stringOr_(value, "");
  return str || null;
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing request body");
  }
  return JSON.parse(e.postData.contents);
}

function parseJsonArray_(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

function requireString_(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Missing required field: " + name);
  }
}

function stringOr_(value, fallback) {
  if (value === null || value === undefined) return fallback;
  const str = String(value).trim();
  return str || fallback;
}

function consentLabel_(value) {
  if (value === true || value === "true" || value === "Yes" || value === "yes")
    return "Yes";
  if (value === false || value === "false" || value === "No" || value === "no")
    return "No";
  return stringOr_(value, "");
}

function toIsoString_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return value.toISOString();
  }
  return String(value || "");
}

function jsonResponse_(obj) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ─── Explore plans + Razorpay (MVP) ─────────────────────────────────────────
//
// One-time setup in Apps Script → Project settings → Script properties:
//   RAZORPAY_KEY_ID     = rzp_live_...
//   RAZORPAY_KEY_SECRET = (never commit this to git)
//
// Or run setupExploreRazorpayKeys_() once from the editor, then delete the secret
// from that function and redeploy.

function setupExploreRazorpayKeys_() {
  var props = PropertiesService.getScriptProperties();
  props.setProperties({
    RAZORPAY_KEY_ID: "rzp_live_SxW7oDR9YnHxcV",
    RAZORPAY_KEY_SECRET: "PASTE_SECRET_HERE",
  });
}

/**
 * Run once from the Apps Script editor (▶ Run) to grant UrlFetchApp permission
 * for Razorpay. Then redeploy the web app (Execute as: Me).
 */
function authorizeExploreServices() {
  UrlFetchApp.fetch("https://httpbin.org/get", { muteHttpExceptions: true });
  Logger.log("External request permission granted. Redeploy the web app now.");
}

function getRazorpayKeyId_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("RAZORPAY_KEY_ID");
  if (!id) {
    throw new Error(
      "Missing RAZORPAY_KEY_ID in Script properties. Run setupExploreRazorpayKeys_() once.",
    );
  }
  return id;
}

function getRazorpayKeySecret_() {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty("RAZORPAY_KEY_SECRET");
  if (!secret || secret === "PASTE_SECRET_HERE") {
    throw new Error(
      "Missing RAZORPAY_KEY_SECRET in Script properties.",
    );
  }
  return secret;
}

function razorpayAuthHeader_() {
  var keyId = getRazorpayKeyId_();
  var secret = getRazorpayKeySecret_();
  var token = Utilities.base64Encode(keyId + ":" + secret);
  return "Basic " + token;
}

function razorpayFetch_(path, method, payload) {
  var options = {
    method: method,
    headers: {
      Authorization: razorpayAuthHeader_(),
      "Content-Type": "application/json",
    },
    muteHttpExceptions: true,
  };
  if (payload) {
    options.payload = JSON.stringify(payload);
  }
  var res;
  try {
    res = UrlFetchApp.fetch("https://api.razorpay.com/v1/" + path, options);
  } catch (fetchErr) {
    var fetchMsg =
      fetchErr && fetchErr.message ? fetchErr.message : String(fetchErr);
    if (fetchMsg.indexOf("UrlFetchApp") !== -1) {
      throw new Error(
        "Razorpay is not authorized in Apps Script. Run authorizeExploreServices() once in the editor, then redeploy the web app (Execute as: Me).",
      );
    }
    throw fetchErr;
  }
  var code = res.getResponseCode();
  var text = res.getContentText();
  var json = null;
  try {
    json = JSON.parse(text);
  } catch (_e) {
    json = null;
  }
  if (code < 200 || code >= 300) {
    var msg =
      json && json.error && json.error.description
        ? json.error.description
        : "Razorpay HTTP " + code;
    throw new Error(msg);
  }
  return json;
}

function verifyRazorpaySignature_(orderId, paymentId, signature) {
  var secret = getRazorpayKeySecret_();
  var payload = orderId + "|" + paymentId;
  var bytes = Utilities.computeHmacSha256Signature(payload, secret);
  var hex = bytes
    .map(function (b) {
      var v = (b < 0 ? b + 256 : b).toString(16);
      return v.length === 1 ? "0" + v : v;
    })
    .join("");
  return hex === String(signature || "").toLowerCase();
}

function weekStartKeyIst_() {
  var now = new Date();
  var tz = "Asia/Kolkata";
  var dayStr = Utilities.formatDate(now, tz, "u");
  var day = Number(dayStr);
  var diff = day === 0 ? -6 : 1 - day;
  var monday = new Date(now.getTime());
  monday.setDate(monday.getDate() + diff);
  return Utilities.formatDate(monday, tz, "yyyy-MM-dd");
}

function addDaysIso_(days) {
  var d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function parseIsoDate_(value) {
  if (!value) return null;
  var d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

function explorePlanAmountPaise_(planId) {
  var id = String(planId || "").trim();
  if (!Object.prototype.hasOwnProperty.call(EXPLORE_PLAN_AMOUNTS_PAISE, id)) {
    throw new Error("Unknown planId: " + id);
  }
  return EXPLORE_PLAN_AMOUNTS_PAISE[id];
}

function getExploreSubscriptionRow_(phone) {
  var sheet = ensureSheet_(EXPLORE_SUBSCRIPTIONS_SHEET, EXPLORE_SUBSCRIPTION_HEADERS);
  var target = normalizePhone_(phone);
  return getObjects_(sheet).find(function (row) {
    return normalizePhone_(row.phone) === target;
  });
}

function subscriptionFromRow_(row) {
  if (!row) {
    return emptyExploreSubscription_("");
  }

  var periodEnd = parseIsoDate_(row.periodEnd);
  var now = new Date();
  var active =
    String(row.status || "") === "active" &&
    periodEnd &&
    periodEnd.getTime() > now.getTime();

  var plan = String(row.plan || "free");
  if (!active) {
    return {
      phone: String(row.phone || ""),
      plan: "free",
      status: "expired",
      periodEnd: row.periodEnd ? String(row.periodEnd) : null,
      revealsUsedThisWeek: 0,
      revealsRemaining: null,
      weeklyLimit: null,
      unlimitedReveals: false,
    };
  }

  var weekKey = weekStartKeyIst_();
  var used = Number(row.revealsUsedThisWeek || 0);
  if (String(row.weekStartKey || "") !== weekKey) {
    used = 0;
  }

  var unlimited = plan === "pro_plus";
  var remaining = unlimited
    ? null
    : Math.max(0, PRO_WEEKLY_REVEAL_LIMIT - used);

  return {
    phone: String(row.phone || ""),
    plan: plan,
    status: "active",
    periodEnd: String(row.periodEnd || ""),
    revealsUsedThisWeek: used,
    revealsRemaining: remaining,
    weeklyLimit: unlimited ? null : PRO_WEEKLY_REVEAL_LIMIT,
    unlimitedReveals: unlimited,
  };
}

function emptyExploreSubscription_(phone) {
  return {
    phone: normalizePhone_(phone),
    plan: "free",
    status: "none",
    periodEnd: null,
    revealsUsedThisWeek: 0,
    revealsRemaining: null,
    weeklyLimit: null,
    unlimitedReveals: false,
  };
}

function getExploreSubscription_(phone) {
  requireString_(phone, "phone");
  var row = getExploreSubscriptionRow_(phone);
  return subscriptionFromRow_(row);
}

function createExploreOrder_(body) {
  requireString_(body.phone, "phone");
  requireString_(body.planId, "planId");

  var phone = normalizePhone_(body.phone);
  var planId = String(body.planId).trim();
  var amount = explorePlanAmountPaise_(planId);
  var receipt = "ex_" + planId + "_" + phone.slice(-6) + "_" + Date.now();

  var order = razorpayFetch_("orders", "post", {
    amount: amount,
    currency: "INR",
    receipt: receipt,
    notes: {
      phone: phone,
      planId: planId,
      product: "instahelp_explore",
    },
  });

  var now = new Date().toISOString();
  var paymentsSheet = ensureSheet_(EXPLORE_PAYMENTS_SHEET, EXPLORE_PAYMENT_HEADERS);
  appendRowByHeaders_(paymentsSheet, EXPLORE_PAYMENT_HEADERS, {
    id: "paylog_" + Utilities.getUuid(),
    phone: phone,
    planId: planId,
    razorpayOrderId: order.id,
    razorpayPaymentId: "",
    amountPaise: amount,
    status: "created",
    createdAt: now,
    updatedAt: now,
  });

  return {
    orderId: order.id,
    amount: amount,
    currency: "INR",
    keyId: getRazorpayKeyId_(),
    planId: planId,
  };
}

function verifyExplorePayment_(body) {
  requireString_(body.phone, "phone");
  requireString_(body.planId, "planId");
  requireString_(body.razorpayOrderId, "razorpayOrderId");
  requireString_(body.razorpayPaymentId, "razorpayPaymentId");
  requireString_(body.razorpaySignature, "razorpaySignature");

  var phone = normalizePhone_(body.phone);
  var planId = String(body.planId).trim();
  var orderId = String(body.razorpayOrderId).trim();
  var paymentId = String(body.razorpayPaymentId).trim();
  var signature = String(body.razorpaySignature).trim();

  if (!verifyRazorpaySignature_(orderId, paymentId, signature)) {
    throw new Error("Invalid payment signature");
  }

  var expected = explorePlanAmountPaise_(planId);

  var now = new Date().toISOString();
  var periodEnd = addDaysIso_(EXPLORE_PLAN_PERIOD_DAYS);
  var weekKey = weekStartKeyIst_();

  var subSheet = ensureSheet_(EXPLORE_SUBSCRIPTIONS_SHEET, EXPLORE_SUBSCRIPTION_HEADERS);
  var existing = getExploreSubscriptionRow_(phone);
  upsertRowByHeaders_(subSheet, "phone", phone, {
    phone: phone,
    plan: planId,
    status: "active",
    periodStart: now,
    periodEnd: periodEnd,
    revealsUsedThisWeek: 0,
    weekStartKey: weekKey,
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    amountPaise: expected,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
  });
  forceTextColumn_(subSheet, getHeaderColumn1Based_(subSheet, "phone"));

  var paymentsSheet = ensureSheet_(EXPLORE_PAYMENTS_SHEET, EXPLORE_PAYMENT_HEADERS);
  var paymentRows = getObjects_(paymentsSheet);
  var paymentLogged = false;
  for (var i = 0; i < paymentRows.length; i++) {
    if (String(paymentRows[i].razorpayOrderId) === orderId) {
      var sheetRow = i + 2;
      var headerRow = paymentsSheet
        .getRange(1, 1, 1, paymentsSheet.getLastColumn())
        .getValues()[0];
      var statusCol = headerRow.indexOf("status") + 1;
      var payIdCol = headerRow.indexOf("razorpayPaymentId") + 1;
      var updCol = headerRow.indexOf("updatedAt") + 1;
      if (statusCol > 0) paymentsSheet.getRange(sheetRow, statusCol).setValue("paid");
      if (payIdCol > 0) paymentsSheet.getRange(sheetRow, payIdCol).setValue(paymentId);
      if (updCol > 0) paymentsSheet.getRange(sheetRow, updCol).setValue(now);
      paymentLogged = true;
      break;
    }
  }
  if (!paymentLogged) {
    appendRowByHeaders_(paymentsSheet, EXPLORE_PAYMENT_HEADERS, {
      id: "paylog_" + Utilities.getUuid(),
      phone: phone,
      planId: planId,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      amountPaise: expected,
      status: "paid",
      createdAt: now,
      updatedAt: now,
    });
  }

  return getExploreSubscription_(phone);
}

function recordExploreReveal_(body) {
  requireString_(body.phone, "phone");
  requireString_(body.vendorId, "vendorId");

  var phone = normalizePhone_(body.phone);
  var vendorId = String(body.vendorId).trim();
  var sub = getExploreSubscription_(phone);

  if (sub.status !== "active") {
    return { ok: true, usedCredits: true, subscription: sub };
  }

  if (sub.unlimitedReveals) {
    return { ok: true, usedCredits: false, subscription: sub };
  }

  if (sub.plan === "pro") {
    if (sub.revealsRemaining !== null && sub.revealsRemaining <= 0) {
      return {
        ok: false,
        reason: "weekly_limit",
        subscription: sub,
      };
    }

    var sheet = ensureSheet_(EXPLORE_SUBSCRIPTIONS_SHEET, EXPLORE_SUBSCRIPTION_HEADERS);
    var row = getExploreSubscriptionRow_(phone);
    var weekKey = weekStartKeyIst_();
    var used = Number(row && row.revealsUsedThisWeek ? row.revealsUsedThisWeek : 0);
    if (row && String(row.weekStartKey || "") !== weekKey) {
      used = 0;
    }
    used += 1;

    upsertRowByHeaders_(sheet, "phone", phone, {
      phone: phone,
      plan: "pro",
      status: "active",
      periodStart: row ? row.periodStart : "",
      periodEnd: row ? row.periodEnd : "",
      revealsUsedThisWeek: used,
      weekStartKey: weekKey,
      razorpayOrderId: row ? row.razorpayOrderId : "",
      razorpayPaymentId: row ? row.razorpayPaymentId : "",
      amountPaise: row ? row.amountPaise : "",
      createdAt: row ? row.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    var updated = getExploreSubscription_(phone);
    return { ok: true, usedCredits: false, subscription: updated };
  }

  return { ok: true, usedCredits: true, subscription: sub };
}

/**
 * Mint a short-lived RS256 JWT for Hubble SDK SSO.
 *
 * Script properties (use ONE of these for the private key):
 *   HUBBLE_JWT_PRIVATE_KEY_B64 — recommended; run `npm run encode:hubble-private-key`
 *   HUBBLE_JWT_PRIVATE_KEY     — full PEM (multi-line; often breaks in Script properties UI)
 *   HUBBLE_CLIENT_ID           — optional iss (default instahelp-sdk-1z4JmIpo)
 *
 * @see https://docs.myhubble.money/sdk/authentication/sso-setup
 */
function getHubbleToken_(body) {
  requireString_(body.phone, "phone");

  var props = PropertiesService.getScriptProperties();
  var privateKey = loadHubblePrivateKeyPem_(props);
  if (!privateKey) {
    throw new Error(
      "Hubble JWT not configured. Add HUBBLE_JWT_PRIVATE_KEY_B64 (recommended) or HUBBLE_JWT_PRIVATE_KEY to Script properties.",
    );
  }
  if (privateKey.indexOf("BEGIN") < 0 || privateKey.indexOf("PRIVATE KEY") < 0) {
    throw new Error(
      "Hubble private key must be a PEM RSA private key, not the app secret or public key.",
    );
  }

  var clientId =
    props.getProperty("HUBBLE_CLIENT_ID") || "instahelp-sdk-1z4JmIpo";
  var phoneDigits = normalizePhone_(body.phone);
  if (phoneDigits.length < 10) {
    throw new Error("Invalid phone for Hubble SSO");
  }

  var now = Math.floor(Date.now() / 1000);
  var payload = {
    sub: phoneDigits,
    iss: clientId,
    iat: now,
    exp: now + 60,
    phoneNumber: hubblePhoneNumber_(phoneDigits),
  };

  var name = stringOr_(body.name, "");
  var email = stringOr_(body.email, "");
  if (name) payload.name = name;
  if (email) payload.email = email;

  return { token: signHubbleJwtRs256_(payload, privateKey) };
}

function loadHubblePrivateKeyPem_(props) {
  var b64 = props.getProperty("HUBBLE_JWT_PRIVATE_KEY_B64");
  if (b64) {
    try {
      var cleaned = String(b64).replace(/\s/g, "");
      var bytes = Utilities.base64Decode(cleaned);
      var decoded = Utilities.newBlob(bytes).getDataAsString("utf-8");
      return normalizePrivateKeyPem_(decoded);
    } catch (e) {
      throw new Error(
        "HUBBLE_JWT_PRIVATE_KEY_B64 is invalid base64. Run npm run encode:hubble-private-key and paste the output.",
      );
    }
  }
  var raw = props.getProperty("HUBBLE_JWT_PRIVATE_KEY");
  if (raw && String(raw).indexOf("BEGIN") >= 0) {
    return normalizePrivateKeyPem_(raw);
  }
  return "";
}

function normalizePrivateKeyPem_(value) {
  if (value === null || value === undefined) return "";
  var key = String(value).trim();
  key = key.replace(/^["']|["']$/g, "");
  key = key.replace(/\\n/g, "\n");
  key = key.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Script properties UI often collapses PEM to one line — restore standard wrapping.
  if (key.indexOf("\n") < 0 && key.indexOf("BEGIN") >= 0) {
    var beginMatch = key.match(/-----BEGIN [^-]+-----/);
    var endMatch = key.match(/-----END [^-]+-----/);
    if (beginMatch && endMatch) {
      var begin = beginMatch[0];
      var end = endMatch[0];
      var body = key
        .replace(begin, "")
        .replace(end, "")
        .replace(/\s+/g, "");
      var lines = [];
      for (var i = 0; i < body.length; i += 64) {
        lines.push(body.slice(i, i + 64));
      }
      key = begin + "\n" + lines.join("\n") + "\n" + end + "\n";
    }
  }

  return key;
}

function hubblePhoneNumber_(digits) {
  var d = normalizePhone_(digits);
  if (d.length > 10 && d.indexOf("91") === 0) {
    return d.slice(-10);
  }
  return d;
}

function jwtBase64UrlEncode_(value) {
  var bytes =
    typeof value === "string"
      ? Utilities.newBlob(value).getBytes()
      : value;
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, "");
}

function signHubbleJwtRs256_(payload, privateKeyPem) {
  var header = { alg: "RS256", typ: "JWT" };
  var encodedHeader = jwtBase64UrlEncode_(JSON.stringify(header));
  var encodedPayload = jwtBase64UrlEncode_(JSON.stringify(payload));
  var signingInput = encodedHeader + "." + encodedPayload;
  var signature;
  try {
    signature = Utilities.computeRsaSha256Signature(
      Utilities.newBlob(signingInput).getBytes(),
      privateKeyPem,
    );
  } catch (e) {
    var msg = e && e.message ? String(e.message) : String(e);
    throw new Error(
      "JWT signing failed (" +
        msg +
        "). Use HUBBLE_JWT_PRIVATE_KEY_B64 from npm run encode:hubble-private-key — not the Hubble app secret.",
    );
  }
  var encodedSignature = jwtBase64UrlEncode_(signature);
  return signingInput + "." + encodedSignature;
}

/** Run in Apps Script editor → View → Logs. Verifies key load + RSA sign. */
function testHubbleKeySetup() {
  var props = PropertiesService.getScriptProperties();
  var b64 = props.getProperty("HUBBLE_JWT_PRIVATE_KEY_B64");
  Logger.log("HUBBLE_JWT_PRIVATE_KEY_B64 set: " + Boolean(b64));
  if (b64) {
    Logger.log("B64 length: " + String(b64).replace(/\s/g, "").length);
  }
  var legacy = props.getProperty("HUBBLE_JWT_PRIVATE_KEY");
  if (legacy && String(legacy).indexOf("BEGIN") < 0) {
    Logger.log("WARN: HUBBLE_JWT_PRIVATE_KEY looks like app secret — delete it.");
  }
  var pem = loadHubblePrivateKeyPem_(props);
  Logger.log("PEM header: " + (pem ? pem.split("\n")[0] : "(empty)"));
  try {
    Utilities.computeRsaSha256Signature("instahelp-jwt-test", pem);
    Logger.log("RSA sign test: OK");
  } catch (e) {
    Logger.log("RSA sign test: FAIL — " + (e && e.message ? e.message : e));
    Logger.log("Re-run npm run encode:hubble-private-key and update HUBBLE_JWT_PRIVATE_KEY_B64.");
  }
}

/** Run once in the Apps Script editor to verify JWT minting (View → Logs). */
function testGetHubbleToken() {
  var result = getHubbleToken_({ phone: "917022702220", name: "InstaHelp Test" });
  Logger.log(result && result.token ? "OK: token minted" : "FAIL: no token");
}
