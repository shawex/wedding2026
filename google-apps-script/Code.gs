const SHEET_ID = "1x4Z03y2oPxDPmjdAAZT4PLOV8IaDIg3ctMWHg3BFXDA";
const SHEET_NAME = "RSVP";
const TELEGRAM_BOT_TOKEN = "";
const TELEGRAM_CHAT_ID = "";

const HEADERS = [
  "Created At",
  "Full Name",
  "Attendance",
  "Drink",
  "Comment",
  "Page",
  "Submitted At (Client)"
];

function doPost(e) {
  try {
    const payload = parsePayload(e);
    const sheet = getSheet();
    ensureHeaderRow(sheet);

    sheet.appendRow([
      new Date(),
      payload.fullName || "",
      payload.attendance || "",
      payload.drink || "",
      payload.comment || "",
      payload.page || "",
      payload.submittedAt || ""
    ]);

    maybeSendToTelegram(payload);
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, status: "running" });
}

function parsePayload(e) {
  const body = e && e.postData ? e.postData.contents : "{}";
  return JSON.parse(body || "{}");
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (sheet) {
    return sheet;
  }
  return spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function maybeSendToTelegram(payload) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return;
  }

  const lines = [
    "New RSVP",
    "Name: " + (payload.fullName || "-"),
    "Attendance: " + (payload.attendance || "-"),
    "Drinks: " + (payload.drink || "-"),
    "Comment: " + (payload.comment || "-"),
    "Submitted at: " + (payload.submittedAt || "-")
  ];

  const url = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage";
  UrlFetchApp.fetch(url, {
    method: "post",
    payload: {
      chat_id: TELEGRAM_CHAT_ID,
      text: lines.join("\n")
    },
    muteHttpExceptions: true
  });
}
