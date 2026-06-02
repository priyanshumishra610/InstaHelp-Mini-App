/**
 * Deploy as a Google Apps Script "Web app"
 * Execute as: Me
 * Who has access: Anyone (or your test users)
 *
 * Bind to a Spreadsheet via SpreadsheetApp.getActiveSpreadsheet().
 * Expected JSON body: { action, ...payload }
 */

const BOOKINGS_SHEET = "Bookings";
const USERS_SHEET = "Users";

function ensureBookingsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(BOOKINGS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(BOOKINGS_SHEET);
    sh.appendRow([
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
    ]);
  }
  return sh;
}

function ensureUsersSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(USERS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(USERS_SHEET);
    sh.appendRow([
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
    ]);
  }
  return sh;
}

function normalizePhone_(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10) return "+91" + digits;
  if (digits.length === 12 && digits.indexOf("91") === 0) return "+" + digits;
  return String(raw || "").trim();
}

function parseJson_(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (_e) {
    return fallback;
  }
}

function rowToProfile_(row) {
  const ageRaw = row.age;
  const ageNum =
    ageRaw === "" || ageRaw == null
      ? null
      : Number(ageRaw);
  return {
    phone: row.phone,
    name: row.name || "",
    age: isNaN(ageNum) ? null : ageNum,
    gender: row.gender || null,
    city: row.city || null,
    email: row.email || null,
    birthday: row.birthday || null,
    anniversary: row.anniversary || null,
    addresses: parseJson_(row.addressesJson, []),
    favorites: parseJson_(row.favoritesJson, []),
  };
}

function findUserRowIndex_(phone) {
  const sh = ensureUsersSheet_();
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return -1;
  const headers = values[0];
  const phoneCol = headers.indexOf("phone");
  if (phoneCol < 0) return -1;
  const target = normalizePhone_(phone);
  for (let i = 1; i < values.length; i++) {
    if (normalizePhone_(values[i][phoneCol]) === target) return i + 1;
  }
  return -1;
}

function getUserProfile_(phone) {
  const sh = ensureUsersSheet_();
  const rowIndex = findUserRowIndex_(phone);
  if (rowIndex < 0) {
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
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const row = values[rowIndex - 1];
  const o = {};
  headers.forEach(function (h, i) {
    o[h] = row[i];
  });
  return rowToProfile_(o);
}

function upsertUserProfile_(payload) {
  const sh = ensureUsersSheet_();
  const phone = normalizePhone_(payload.phone);
  const now = new Date().toISOString();
  const rowIndex = findUserRowIndex_(phone);
  const addressesJson = JSON.stringify(payload.addresses || []);
  const favoritesJson = JSON.stringify(payload.favorites || []);

  if (rowIndex < 0) {
    sh.appendRow([
      phone,
      payload.name || "",
      payload.age != null ? payload.age : "",
      payload.gender || "",
      payload.city || "",
      payload.email || "",
      payload.birthday || "",
      payload.anniversary || "",
      addressesJson,
      favoritesJson,
      now,
      now,
    ]);
  } else {
    const values = sh.getDataRange().getValues();
    const headers = values[0];
    const col = function (name) {
      return headers.indexOf(name);
    };
    const row = values[rowIndex - 1];
    if (col("name") >= 0) row[col("name")] = payload.name != null ? payload.name : row[col("name")];
    if (col("age") >= 0)
      row[col("age")] = payload.age != null ? payload.age : row[col("age")];
    if (col("gender") >= 0)
      row[col("gender")] = payload.gender != null ? payload.gender : row[col("gender")];
    if (col("city") >= 0) row[col("city")] = payload.city != null ? payload.city : row[col("city")];
    if (col("email") >= 0) row[col("email")] = payload.email != null ? payload.email : row[col("email")];
    if (col("birthday") >= 0)
      row[col("birthday")] = payload.birthday != null ? payload.birthday : row[col("birthday")];
    if (col("anniversary") >= 0)
      row[col("anniversary")] = payload.anniversary != null ? payload.anniversary : row[col("anniversary")];
    if (col("addressesJson") >= 0) row[col("addressesJson")] = addressesJson;
    if (col("favoritesJson") >= 0) row[col("favoritesJson")] = favoritesJson;
    if (col("updatedAt") >= 0) row[col("updatedAt")] = now;
    sh.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  }

  return getUserProfile_(phone);
}

function jsonResponse(obj) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.action === "registerPhone" || body.action === "register") {
      const profile = upsertUserProfile_({
        phone: body.phone,
        name: "",
        age: null,
        gender: null,
        city: null,
        email: null,
        birthday: null,
        anniversary: null,
        addresses: [],
        favorites: [],
      });
      return jsonResponse({ ok: true, data: profile });
    }

    if (body.action === "createBooking") {
      const sh = ensureBookingsSheet_();
      const id = body.id || Utilities.getUuid();
      const now = new Date().toISOString();
      const row = [
        id,
        normalizePhone_(body.phone),
        body.serviceId,
        body.serviceLabel,
        body.description,
        body.preferredTime,
        body.notes || "",
        "pending",
        now,
        now,
        body.imageBase64 ? "image attached" : "",
      ];
      sh.appendRow(row);

      return jsonResponse({
        ok: true,
        data: {
          id: id,
          serviceId: body.serviceId,
          serviceLabel: body.serviceLabel,
          description: body.description,
          preferredTime: body.preferredTime,
          notes: body.notes,
          status: "pending",
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    if (body.action === "getBookings") {
      const sh = ensureBookingsSheet_();
      const values = sh.getDataRange().getValues();
      const headers = values[0];
      const target = normalizePhone_(body.phone);
      const rows = values.slice(1).map(function (r) {
        const o = {};
        headers.forEach(function (h, i) {
          o[h] = r[i];
        });
        return o;
      });
      const filtered = rows
        .filter(function (o) {
          return normalizePhone_(o.phone) === target;
        })
        .map(function (o) {
          return {
            id: o.id,
            serviceId: o.serviceId,
            serviceLabel: o.serviceLabel,
            description: o.description,
            preferredTime: o.preferredTime,
            notes: o.notes,
            status: o.status,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt,
          };
        });
      return jsonResponse({ ok: true, data: filtered });
    }

    if (body.action === "getUserProfile") {
      return jsonResponse({ ok: true, data: getUserProfile_(body.phone) });
    }

    if (body.action === "updateProfile") {
      const existing = getUserProfile_(body.phone);
      const profile = upsertUserProfile_({
        phone: body.phone,
        name: body.name != null ? body.name : existing.name,
        email: body.email != null ? body.email : existing.email,
        birthday: body.birthday != null ? body.birthday : existing.birthday,
        anniversary: body.anniversary != null ? body.anniversary : existing.anniversary,
        addresses: body.addresses != null ? body.addresses : existing.addresses,
        favorites: body.favorites != null ? body.favorites : existing.favorites,
      });
      return jsonResponse({ ok: true, data: profile });
    }

    return jsonResponse({ ok: false, error: "unknown action" });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err && err.message ? err.message : String(err),
    });
  }
}

function doGet(_e) {
  return jsonResponse({ ok: true, data: "InstaHelp Apps Script alive" });
}
