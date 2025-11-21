/**
 * Triggers Template
 * Event-driven automation for spreadsheet changes
 *
 * These functions run automatically when specific events occur
 */

/**
 * Runs when the spreadsheet is edited
 * Use this for real-time data validation, auto-formatting, etc.
 *
 * @param {Object} e Event object containing edit information
 */
function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();
  const row = range.getRow();
  const col = range.getColumn();
  const value = range.getValue();

  // Example 1: Auto-format status column with colors
  if (sheet.getName() === 'Tasks' && col === 3) {
    formatStatusCell(range, value);
  }

  // Example 2: Auto-timestamp when row is edited
  if (col > 1) { // Don't trigger on timestamp column itself
    autoTimestamp(sheet, row);
  }

  // Example 3: Validate email addresses in specific column
  if (sheet.getName() === 'Contacts' && col === 3) {
    validateEmail(range, value);
  }

  // Example 4: Auto-calculate totals
  if (sheet.getName() === 'Sales' && col >= 3 && col <= 5) {
    calculateRowTotal(sheet, row);
  }
}

/**
 * Format status cells with colors
 */
function formatStatusCell(range, value) {
  let bgColor, textColor;

  switch(value) {
    case 'Complete':
    case 'Done':
    case 'Approved':
      bgColor = '#34A853'; // Green
      textColor = '#FFFFFF';
      break;
    case 'In Progress':
    case 'Pending':
    case 'Review':
      bgColor = '#FBBC04'; // Yellow
      textColor = '#000000';
      break;
    case 'Blocked':
    case 'Failed':
    case 'Rejected':
      bgColor = '#EA4335'; // Red
      textColor = '#FFFFFF';
      break;
    case 'Not Started':
    case 'New':
      bgColor = '#E8EAED'; // Gray
      textColor = '#000000';
      break;
    default:
      bgColor = '#FFFFFF';
      textColor = '#000000';
  }

  range.setBackground(bgColor).setFontColor(textColor);
}

/**
 * Add timestamp to first column when row is edited
 */
function autoTimestamp(sheet, row) {
  const timestampCol = 1; // Column A
  sheet.getRange(row, timestampCol).setValue(new Date());
}

/**
 * Validate email address format
 */
function validateEmail(range, value) {
  if (!value) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    range.setBackground('#FEE'); // Light red
    SpreadsheetApp.getActiveSpreadsheet().toast('Invalid email format', 'Validation Error', 3);
  } else {
    range.setBackground('#FFFFFF'); // White
  }
}

/**
 * Calculate row total automatically
 */
function calculateRowTotal(sheet, row) {
  const startCol = 3; // Column C
  const endCol = 5;   // Column E
  const totalCol = 6; // Column F

  const values = sheet.getRange(row, startCol, 1, endCol - startCol + 1).getValues()[0];
  const total = values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

  sheet.getRange(row, totalCol).setValue(total);
}

/**
 * Runs when spreadsheet structure changes (sheets added/deleted, etc.)
 *
 * @param {Object} e Event object
 */
function onChange(e) {
  const changeType = e.changeType;

  // Log changes for audit trail
  logChange(changeType, e);

  // Example: Maintain a table of contents when sheets are added/removed
  if (changeType === 'INSERT_GRID' || changeType === 'REMOVE_GRID') {
    updateTableOfContents();
  }
}

/**
 * Log changes to a hidden audit sheet
 */
function logChange(changeType, e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let auditSheet = ss.getSheetByName('Audit_Log');

  // Create audit sheet if it doesn't exist
  if (!auditSheet) {
    auditSheet = ss.insertSheet('Audit_Log');
    auditSheet.hideSheet();
    auditSheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Change Type', 'User', 'Details']]);
  }

  // Add new log entry
  const user = Session.getActiveUser().getEmail();
  const timestamp = new Date();
  const details = JSON.stringify(e);

  auditSheet.appendRow([timestamp, changeType, user, details]);
}

/**
 * Update table of contents sheet with current sheets
 */
function updateTableOfContents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let tocSheet = ss.getSheetByName('Table_of_Contents');

  if (!tocSheet) {
    return; // Only update if TOC sheet exists
  }

  // Get all sheets except hidden/system sheets
  const sheets = ss.getSheets().filter(s => {
    const name = s.getName();
    return !s.isSheetHidden() &&
           !name.startsWith('_') &&
           name !== 'Table_of_Contents' &&
           name !== 'Audit_Log';
  });

  // Clear existing content (keep headers)
  const lastRow = tocSheet.getLastRow();
  if (lastRow > 1) {
    tocSheet.getRange(2, 1, lastRow - 1, 3).clearContent();
  }

  // Add sheet list
  const data = sheets.map((s, index) => [
    index + 1,
    s.getName(),
    s.getLastRow() + ' rows'
  ]);

  if (data.length > 0) {
    tocSheet.getRange(2, 1, data.length, 3).setValues(data);
  }
}

/**
 * Runs when a form is submitted (if spreadsheet is linked to a Form)
 *
 * @param {Object} e Event object with form submission data
 */
function onFormSubmit(e) {
  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  const values = e.values;

  // Example 1: Send email notification
  sendSubmissionNotification(values);

  // Example 2: Auto-format the new row
  formatNewSubmission(sheet, row);

  // Example 3: Trigger downstream processing
  processFormData(values);
}

/**
 * Send email notification when form is submitted
 */
function sendSubmissionNotification(values) {
  const notificationEmail = PropertiesService.getScriptProperties().getProperty('NOTIFICATION_EMAIL');

  if (!notificationEmail) {
    return;
  }

  const subject = 'New Form Submission - ' + new Date().toLocaleDateString();
  const body = 'A new form response has been submitted:\n\n' +
    values.map((val, i) => 'Field ' + (i + 1) + ': ' + val).join('\n');

  MailApp.sendEmail({
    to: notificationEmail,
    subject: subject,
    body: body
  });
}

/**
 * Format newly submitted form row
 */
function formatNewSubmission(sheet, row) {
  const range = sheet.getRange(row, 1, 1, sheet.getLastColumn());

  // Light blue background for new submissions
  range.setBackground('#E8F0FE');

  // Add timestamp in first column if not already there
  const timestampCell = sheet.getRange(row, 1);
  if (!timestampCell.getValue()) {
    timestampCell.setValue(new Date());
  }
}

/**
 * Process form data (custom logic)
 */
function processFormData(values) {
  // Add your custom processing logic here
  Logger.log('Processing form submission: ' + JSON.stringify(values));

  // Example: Update a summary dashboard
  // Example: Trigger external webhook
  // Example: Create calendar event
}

/**
 * Time-based trigger examples
 * Set these up using ScriptApp.newTrigger() or the SheetFreak CLI
 */

/**
 * Daily cleanup - runs every day at midnight
 */
function dailyCleanup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Archive old data
  archiveOldRows();

  // Clean up empty rows
  removeEmptyRows();

  // Update summary statistics
  updateDashboard();

  Logger.log('Daily cleanup completed');
}

/**
 * Archive rows older than 30 days
 */
function archiveOldRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName('Data');
  let archiveSheet = ss.getSheetByName('Archive');

  if (!dataSheet) return;

  if (!archiveSheet) {
    archiveSheet = ss.insertSheet('Archive');
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  const data = dataSheet.getDataRange().getValues();
  const toArchive = [];
  const toKeep = [data[0]]; // Keep headers

  for (let i = 1; i < data.length; i++) {
    const rowDate = new Date(data[i][0]);
    if (rowDate < cutoffDate) {
      toArchive.push(data[i]);
    } else {
      toKeep.push(data[i]);
    }
  }

  // Move old rows to archive
  if (toArchive.length > 0) {
    archiveSheet.getRange(archiveSheet.getLastRow() + 1, 1, toArchive.length, toArchive[0].length)
      .setValues(toArchive);
  }

  // Update data sheet
  dataSheet.clear();
  if (toKeep.length > 0) {
    dataSheet.getRange(1, 1, toKeep.length, toKeep[0].length).setValues(toKeep);
  }
}

/**
 * Remove completely empty rows
 */
function removeEmptyRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  sheets.forEach(sheet => {
    if (sheet.getName().startsWith('_') || sheet.isSheetHidden()) {
      return;
    }

    const data = sheet.getDataRange().getValues();
    let rowsToDelete = [];

    for (let i = data.length - 1; i >= 1; i--) { // Skip header
      const isEmpty = data[i].every(cell => cell === '' || cell === null);
      if (isEmpty) {
        rowsToDelete.push(i + 1); // Row numbers are 1-indexed
      }
    }

    // Delete rows (in reverse order to maintain row numbers)
    rowsToDelete.forEach(rowNum => {
      sheet.deleteRow(rowNum);
    });
  });
}

/**
 * Update dashboard with latest statistics
 */
function updateDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName('Dashboard');

  if (!dashSheet) return;

  // Example: Count total rows across all data sheets
  const sheets = ss.getSheets();
  let totalRows = 0;

  sheets.forEach(sheet => {
    if (!sheet.isSheetHidden() && !sheet.getName().startsWith('_')) {
      totalRows += sheet.getLastRow();
    }
  });

  dashSheet.getRange('B1').setValue('Last Updated: ' + new Date().toLocaleString());
  dashSheet.getRange('B2').setValue('Total Rows: ' + totalRows);
}
