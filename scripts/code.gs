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

const BOOKING_HEADERS = [
  "id",
  "phone",
  "serviceId",
  "serviceLabel",
  "description",
  "preferredTime",
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
  const booking = {
    id: body.id || "bk_" + Utilities.getUuid(),
    serviceId: body.serviceId,
    serviceLabel: body.serviceLabel,
    description: body.description,
    preferredTime: body.preferredTime,
    notes: body.notes || "",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  sheet.appendRow([
    booking.id,
    phone,
    booking.serviceId,
    booking.serviceLabel,
    booking.description,
    booking.preferredTime,
    booking.notes,
    booking.status,
    booking.createdAt,
    booking.updatedAt,
    body.imageBase64 ? "image attached" : "",
  ]);

  forceTextColumn_(sheet, BOOKING_HEADERS.indexOf("phone") + 1);

  return booking;
}

function getBookings_(phone) {
  requireString_(phone, "phone");

  const sheet = ensureSheet_(BOOKING_SHEET_NAME, BOOKING_HEADERS);
  const target = normalizePhone_(phone);
  return getObjects_(sheet)
    .filter((booking) => normalizePhone_(booking.phone) === target)
    .map((booking) => ({
      id: booking.id,
      serviceId: booking.serviceId,
      serviceLabel: booking.serviceLabel,
      description: booking.description,
      preferredTime: booking.preferredTime,
      notes: booking.notes || "",
      status: booking.status || "pending",
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

function ensureSheet_(name, headers) {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  const existingHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeaders = existingHeaders.every((value) => value === "");

  if (needsHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
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
