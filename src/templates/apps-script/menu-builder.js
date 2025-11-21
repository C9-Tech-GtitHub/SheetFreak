/**
 * Menu Builder Template
 * Add custom menus to your spreadsheet
 *
 * The onOpen() function runs automatically when the spreadsheet is opened
 */

/**
 * Create custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('SheetFreak')
    .addItem('Refresh Data', 'refreshData')
    .addItem('Export as PDF', 'exportAsPDF')
    .addItem('Export as CSV', 'exportAsCSV')
    .addSeparator()
    .addSubMenu(
      ui.createMenu('Format')
        .addItem('Apply Standard Styling', 'applyStandardStyling')
        .addItem('Format Headers', 'formatHeaders')
        .addItem('Add Alternating Colors', 'addAlternatingColors')
        .addItem('Reset Formatting', 'resetFormatting')
    )
    .addSubMenu(
      ui.createMenu('Automation')
        .addItem('Enable Auto-Update', 'enableAutoUpdate')
        .addItem('Disable Auto-Update', 'disableAutoUpdate')
        .addItem('View Triggers', 'viewTriggers')
    )
    .addSeparator()
    .addItem('About', 'showAbout')
    .addToUi();
}

/**
 * Refresh data from external source
 */
function refreshData() {
  try {
    // Call your auto-refresh function if it exists
    if (typeof autoRefresh === 'function') {
      autoRefresh();
      SpreadsheetApp.getUi().alert('Success', 'Data refreshed successfully!', SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      SpreadsheetApp.getUi().alert('Info', 'No auto-refresh function configured', SpreadsheetApp.getUi().ButtonSet.OK);
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', 'Failed to refresh data: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Export current sheet as PDF
 */
function exportAsPDF() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetId = sheet.getSheetId();

  const url = 'https://docs.google.com/spreadsheets/d/' + ss.getId() +
    '/export?format=pdf&gid=' + sheetId +
    '&portrait=false&fitw=true';

  const html = '<html><body>' +
    '<h3>Export as PDF</h3>' +
    '<p>Click the link below to download the PDF:</p>' +
    '<a href="' + url + '" target="_blank">Download PDF</a>' +
    '</body></html>';

  SpreadsheetApp.getUi().showModelessDialog(
    HtmlService.createHtmlOutput(html).setWidth(400).setHeight(200),
    'Export PDF'
  );
}

/**
 * Export current sheet as CSV
 */
function exportAsCSV() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();

  const csv = data.map(row => {
    return row.map(cell => {
      const cellStr = cell.toString();
      // Escape quotes and wrap in quotes if contains comma
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return '"' + cellStr.replace(/"/g, '""') + '"';
      }
      return cellStr;
    }).join(',');
  }).join('\n');

  const fileName = sheet.getName() + '_export.csv';
  const blob = Utilities.newBlob(csv, 'text/csv', fileName);

  // Save to Drive
  const file = DriveApp.createFile(blob);

  const html = '<html><body>' +
    '<h3>CSV Export Complete</h3>' +
    '<p>File saved to Google Drive: <a href="' + file.getUrl() + '" target="_blank">' + fileName + '</a></p>' +
    '</body></html>';

  SpreadsheetApp.getUi().showModelessDialog(
    HtmlService.createHtmlOutput(html).setWidth(400).setHeight(200),
    'Export CSV'
  );
}

/**
 * Apply standard styling to active sheet
 */
function applyStandardStyling() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();

  // Reset to defaults
  range.setFontFamily('Arial')
       .setFontSize(10)
       .setBackground('white');

  // Format headers
  formatHeaders();

  // Add alternating colors
  addAlternatingColors();

  SpreadsheetApp.getUi().alert('Success', 'Standard styling applied', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Format header row with bold, colored background
 */
function formatHeaders() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());

  headerRange.setBackground('#4285F4')
             .setFontColor('white')
             .setFontWeight('bold')
             .setFontSize(11)
             .setHorizontalAlignment('center');

  SpreadsheetApp.getUi().alert('Success', 'Headers formatted', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Add alternating row colors for readability
 */
function addAlternatingColors() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('Info', 'No data rows to format', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  for (let i = 2; i <= lastRow; i++) {
    const color = i % 2 === 0 ? '#FFFFFF' : '#F8F9FA';
    sheet.getRange(i, 1, 1, lastCol).setBackground(color);
  }

  SpreadsheetApp.getUi().alert('Success', 'Alternating colors applied', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Reset all formatting to defaults
 */
function resetFormatting() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();

  range.setBackground('white')
       .setFontColor('black')
       .setFontWeight('normal')
       .setFontSize(10)
       .setFontFamily('Arial')
       .setHorizontalAlignment('left');

  SpreadsheetApp.getUi().alert('Success', 'Formatting reset', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Enable automatic updates
 */
function enableAutoUpdate() {
  try {
    if (typeof setupHourlyRefresh === 'function') {
      setupHourlyRefresh();
    } else {
      SpreadsheetApp.getUi().alert('Info', 'Auto-update function not configured', SpreadsheetApp.getUi().ButtonSet.OK);
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Disable automatic updates
 */
function disableAutoUpdate() {
  try {
    if (typeof disableAutoRefresh === 'function') {
      disableAutoRefresh();
    } else {
      SpreadsheetApp.getUi().alert('Info', 'Auto-update function not configured', SpreadsheetApp.getUi().ButtonSet.OK);
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * View all triggers for this project
 */
function viewTriggers() {
  const triggers = ScriptApp.getProjectTriggers();

  if (triggers.length === 0) {
    SpreadsheetApp.getUi().alert('Info', 'No triggers configured', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  let message = 'Active Triggers:\n\n';
  triggers.forEach((trigger, index) => {
    message += (index + 1) + '. ' + trigger.getHandlerFunction() + ' - ';

    if (trigger.getEventType() === ScriptApp.EventType.CLOCK) {
      message += 'Time-based trigger\n';
    } else {
      message += trigger.getEventType() + '\n';
    }
  });

  SpreadsheetApp.getUi().alert('Triggers', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Show about dialog
 */
function showAbout() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const message = 'SheetFreak Automation\n\n' +
    'Spreadsheet: ' + ss.getName() + '\n' +
    'ID: ' + ss.getId() + '\n\n' +
    'This spreadsheet is managed by SheetFreak CLI.\n' +
    'Visit the SheetFreak menu for automation options.';

  SpreadsheetApp.getUi().alert('About', message, SpreadsheetApp.getUi().ButtonSet.OK);
}
