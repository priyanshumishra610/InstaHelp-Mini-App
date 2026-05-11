/**
 * InstaHelp Google Apps Script backend.
 *
 * Deploy as a Web app:
 * - Execute as: Me
 * - Who has access: Anyone, or anyone with the link for testing
 *
 * Optional: paste your spreadsheet ID below if this script is not bound to the
 * Google Sheet. Leave it blank when using SpreadsheetApp.getActiveSpreadsheet().
 */
const SPREADSHEET_ID = "1GxiZMq0-34BdDk5kC7Hp5hhpPBUped1xtNjNcytC-yY";

const BOOKING_SHEET_NAME = "Bookings";
const PROFILE_SHEET_NAME = "Profiles";

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
  "addressesJson",
  "favoritesJson",
  "createdAt",
  "updatedAt",
];

function doGet() {
  return jsonResponse_({ ok: true, data: "InstaHelp Apps Script alive" });
}

function doPost(e) {
  try {
    const body = parseBody_(e);

    switch (body.action) {
      case "createBooking":
        return jsonResponse_({ ok: true, data: createBooking_(body) });
      case "getBookings":
        return jsonResponse_({ ok: true, data: getBookings_(body.phone) });
      case "getUserProfile":
        return jsonResponse_({ ok: true, data: getUserProfile_(body.phone) });
      case "updateProfile":
        return jsonResponse_({ ok: true, data: updateProfile_(body) });
      default:
        throw new Error("Unknown action: " + body.action);
    }
  } catch (err) {
    return jsonResponse_({
      ok: false,
      error: err && err.message ? err.message : String(err),
    });
  }
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

function getUserProfile_(phone) {
  requireString_(phone, "phone");

  const sheet = ensureSheet_(PROFILE_SHEET_NAME, PROFILE_HEADERS);
  const target = normalizePhone_(phone);
  const row = getObjects_(sheet).find(
    (profile) => normalizePhone_(profile.phone) === target,
  );

  if (!row) {
    return {
      phone: target,
      name: "",
      addresses: [],
      favorites: [],
    };
  }

  return profileFromRow_(row);
}

function updateProfile_(body) {
  requireString_(body.phone, "phone");

  const sheet = ensureSheet_(PROFILE_SHEET_NAME, PROFILE_HEADERS);
  const now = new Date().toISOString();
  const phone = normalizePhone_(body.phone);
  const addresses = Array.isArray(body.addresses) ? body.addresses : [];
  const favorites = Array.isArray(body.favorites) ? body.favorites : [];
  const values = sheet.getDataRange().getValues();
  const phoneCol = PROFILE_HEADERS.indexOf("phone");
  const existingIndex = values.findIndex((row, index) => {
    return index > 0 && normalizePhone_(row[phoneCol]) === phone;
  });

  const row = [
    phone,
    body.name || "",
    JSON.stringify(addresses),
    JSON.stringify(favorites),
    existingIndex > 0
      ? values[existingIndex][PROFILE_HEADERS.indexOf("createdAt")]
      : now,
    now,
  ];

  if (existingIndex > 0) {
    sheet
      .getRange(existingIndex + 1, 1, 1, PROFILE_HEADERS.length)
      .setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  forceTextColumn_(sheet, PROFILE_HEADERS.indexOf("phone") + 1);

  return {
    phone: phone,
    name: body.name || "",
    addresses: addresses,
    favorites: favorites,
  };
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
    addresses: parseJsonArray_(row.addressesJson),
    favorites: parseJsonArray_(row.favoritesJson),
  };
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
