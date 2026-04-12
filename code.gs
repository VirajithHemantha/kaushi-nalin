/**
 * Google Apps Script for Wedding Invitation Form Submissions
 * 
 * Instructions:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1CWi7whscDQnuSt_niH5MBq12OM8hR5sPPF5-H1oGzgU
 * 2. Go to Extensions > Apps Script
 * 3. Delete any code there and paste this code.
 * 4. Click 'Deploy' > 'New Deployment'
 * 5. Select 'Web App'
 * 6. Set 'Execute as' to 'Me'
 * 7. Set 'Who has access' to 'Anyone'
 * 8. Click 'Deploy' and copy the 'Web App URL'
 * 9. Update the SCRIPT_URL in App.tsx with this URL.
 */

function doPost(e) {
  // Updated Spreadsheet ID from user
  var sheetId = "1CWi7whscDQnuSt_niH5MBq12OM8hR5sPPF5-H1oGzgU";
  var ss = SpreadsheetApp.openById(sheetId);
  
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": "Invalid JSON" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var formType = data.formType;
  // Map 'wish' to 'Wishes' and 'rsvp' to 'RSVP' sheets
  var sheetName = formType === 'rsvp' ? 'RSVP' : 'Wishes';
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

  // Add headers if the sheet is new
  if (sheet.getLastRow() === 0) {
    if (formType === 'rsvp') {
      sheet.appendRow(['Timestamp', 'Full Name', 'Number of Guests', 'Dietary Notes']);
    } else {
      sheet.appendRow(['Timestamp', 'Name', 'Message']);
    }
  }

  // Append the data
  if (formType === 'rsvp') {
    sheet.appendRow([
      new Date(),
      data.name,
      data.guests === '0' ? 'Regretfully Decline' : data.guests,
      data.dietary
    ]);
  } else {
    sheet.appendRow([
      new Date(),
      data.name,
      data.message
    ]);
  }

  return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Add CORS support for browser preflight
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
