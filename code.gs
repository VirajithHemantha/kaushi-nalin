/**
 * Google Apps Script for Wedding Invitation - Nalin & Kaushi
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1s3Vq0tR2awSaKqUmcNbacK0izhY6XXz7keRcu8f23ps
 * 
 * SETUP:
 * 1. Open the spreadsheet above
 * 2. Go to Extensions > Apps Script
 * 3. Delete any code and paste this entire file
 * 4. Save, then run 'setupSheets' function once (from the toolbar: Run > setupSheets)
 * 5. Authorize when prompted
 * 6. Click Deploy > New Deployment
 * 7. Type: Web App | Execute as: Me | Access: Anyone
 * 8. Deploy and copy the Web App URL
 * 9. Paste that URL into SCRIPT_URL in App.tsx
 */

var SHEET_ID = "1s3Vq0tR2awSaKqUmcNbacK0izhY6XXz7keRcu8f23ps";

// ─── Run this ONCE to create sheets with headers ───
function setupSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // ── RSVP Sheet ──
  var rsvpSheet = ss.getSheetByName("RSVP");
  if (!rsvpSheet) {
    rsvpSheet = ss.insertSheet("RSVP");
  }
  if (rsvpSheet.getLastRow() === 0) {
    var rsvpHeaders = ["Timestamp", "Full Name", "Number of Guests", "Dietary Notes"];
    rsvpSheet.appendRow(rsvpHeaders);
    // Style headers
    var headerRange = rsvpSheet.getRange(1, 1, 1, rsvpHeaders.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#D4AF37");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setHorizontalAlignment("center");
    // Set column widths
    rsvpSheet.setColumnWidth(1, 180); // Timestamp
    rsvpSheet.setColumnWidth(2, 250); // Full Name
    rsvpSheet.setColumnWidth(3, 160); // Guests
    rsvpSheet.setColumnWidth(4, 250); // Dietary
    rsvpSheet.setFrozenRows(1);
  }

  // ── Wishes Sheet ──
  var wishSheet = ss.getSheetByName("Wishes");
  if (!wishSheet) {
    wishSheet = ss.insertSheet("Wishes");
  }
  if (wishSheet.getLastRow() === 0) {
    var wishHeaders = ["Timestamp", "Name", "Message"];
    wishSheet.appendRow(wishHeaders);
    // Style headers
    var headerRange2 = wishSheet.getRange(1, 1, 1, wishHeaders.length);
    headerRange2.setFontWeight("bold");
    headerRange2.setBackground("#4E342E");
    headerRange2.setFontColor("#FFFFFF");
    headerRange2.setHorizontalAlignment("center");
    // Set column widths
    wishSheet.setColumnWidth(1, 180); // Timestamp
    wishSheet.setColumnWidth(2, 250); // Name
    wishSheet.setColumnWidth(3, 400); // Message
    wishSheet.setFrozenRows(1);
  }

  // Remove default Sheet1 if it exists and is empty
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && defaultSheet.getLastRow() <= 1 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e) { /* ignore */ }
  }

  SpreadsheetApp.flush();
  Logger.log("✅ Setup complete! RSVP and Wishes sheets created with headers.");
}

// ─── Handle incoming form submissions ───
function doPost(e) {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": "Invalid JSON" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var formType = data.formType;
  var sheetName = formType === "rsvp" ? "RSVP" : "Wishes";
  var sheet = ss.getSheetByName(sheetName);

  // Auto-create sheet with headers if it doesn't exist yet
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (formType === "rsvp") {
      sheet.appendRow(["Timestamp", "Full Name", "Number of Guests", "Dietary Notes"]);
    } else {
      sheet.appendRow(["Timestamp", "Name", "Message"]);
    }
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  // Append the form data
  if (formType === "rsvp") {
    sheet.appendRow([
      new Date(),
      data.name || "",
      data.guests === "0" ? "Regretfully Decline" : (data.guests || "1"),
      data.dietary || ""
    ]);
  } else {
    sheet.appendRow([
      new Date(),
      data.name || "",
      data.message || ""
    ]);
  }

  return ContentService.createTextOutput(JSON.stringify({ "result": "success", "type": formType }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Handle CORS preflight ───
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ "status": "ok", "message": "Wedding API is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}
