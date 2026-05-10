/**
 * Deploy as a Google Apps Script "Web app"
 * Execute as: Me
 * Who has access: Anyone (or your test users)
 *
 * Bind to a Spreadsheet via SpreadsheetApp.getActiveSpreadsheet() if you prefer sheet context.
 * Expected JSON body: { action, ...payload }
 */

const SHEET_NAME = "Bookings";

function ensureSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
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

function jsonResponse(obj, status) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.action === "createBooking") {
      const sh = ensureSheet_();
      const id = body.id || Utilities.getUuid();
      const now = new Date().toISOString();
      const row = [
        id,
        body.phone,
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
          id,
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
      const sh = ensureSheet_();
      const values = sh.getDataRange().getValues();
      const headers = values[0];
      const rows = values.slice(1).map((r) => {
        const o = {};
        headers.forEach((h, i) => (o[h] = r[i]));
        return o;
      });
      const filtered = rows
        .filter((o) => o.phone === body.phone)
        .map((o) => ({
          id: o.id,
          serviceId: o.serviceId,
          serviceLabel: o.serviceLabel,
          description: o.description,
          preferredTime: o.preferredTime,
          notes: o.notes,
          status: o.status,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        }));
      return jsonResponse({ ok: true, data: filtered });
    }

    if (body.action === "getUserProfile") {
      return jsonResponse({
        ok: true,
        data: {
          phone: body.phone,
          addresses: [],
          favorites: [],
        },
      });
    }

    if (body.action === "updateProfile") {
      return jsonResponse({
        ok: true,
        data: {
          phone: body.phone,
          name: body.name || "",
          addresses: body.addresses || [],
          favorites: body.favorites || [],
        },
      });
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
