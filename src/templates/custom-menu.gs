/**
 * Template: custom-menu
 * Description: Add custom menu with actions to spreadsheet
 *
 * Setup Instructions:
 * 1. Customize menu items in onOpen() function
 * 2. Add your custom functions below
 * 3. Deploy and create ON_OPEN trigger: sheetfreak script trigger create <script-id> onOpen --event ON_OPEN
 *
 * Features:
 * - Custom menu appears when spreadsheet opens
 * - Can add multiple menu items and submenus
 * - Shows toast notifications for actions
 */

/**
 * Creates custom menu when spreadsheet opens
 * This function runs automatically when the spreadsheet is opened
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('SheetFreak')
    .addItem('Refresh Data', 'refreshData')
    .addItem('Format Headers', 'formatHeaders')
    .addSeparator()
    .addSubMenu(
      ui.createMenu('Export')
        .addItem('Export as CSV', 'exportAsCSV')
        .addItem('Export as JSON', 'exportAsJSON')
    )
    .addSeparator()
    .addItem('About', 'showAbout')
    .addToUi();
}

/**
 * Refresh data from source
 * Customize this function for your data source
 */
function refreshData() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Refreshing data...', 'Status', 2);

    // Add your data refresh logic here
    // Example: fetch from API, update cells, etc.

    SpreadsheetApp.getActiveSpreadsheet().toast('Data refreshed successfully!', 'Success', 3);
  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`Error: ${error.message}`, 'Failed', 5);
  }
}

/**
 * Format header row with professional styling
 */
function formatHeaders() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());

    // Apply formatting
    headerRange
      .setBackground('#4285F4')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setFontSize(11)
      .setHorizontalAlignment('center');

    // Freeze header row
    sheet.setFrozenRows(1);

    SpreadsheetApp.getActiveSpreadsheet().toast('Headers formatted!', 'Success', 3);
  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`Error: ${error.message}`, 'Failed', 5);
  }
}

/**
 * Export current sheet as CSV
 */
function exportAsCSV() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();

    // Convert to CSV format
    const csv = data.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Create a new temporary sheet with the CSV content
    const tempSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('CSV_Export');
    tempSheet.getRange(1, 1).setValue(csv);

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'CSV data prepared in "CSV_Export" sheet. Copy and save to file.',
      'Export Complete',
      5
    );
  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`Error: ${error.message}`, 'Export Failed', 5);
  }
}

/**
 * Export current sheet as JSON
 */
function exportAsJSON() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();

    // Convert to JSON (first row as keys)
    const headers = data[0];
    const rows = data.slice(1);

    const json = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    // Create a new temporary sheet with the JSON content
    const tempSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('JSON_Export');
    tempSheet.getRange(1, 1).setValue(JSON.stringify(json, null, 2));

    SpreadsheetApp.getActiveSpreadsheet().toast(
      'JSON data prepared in "JSON_Export" sheet. Copy and save to file.',
      'Export Complete',
      5
    );
  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`Error: ${error.message}`, 'Export Failed', 5);
  }
}

/**
 * Show about dialog
 */
function showAbout() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(
    '<h3>SheetFreak Custom Menu</h3>' +
    '<p>This spreadsheet has been enhanced with SheetFreak automation.</p>' +
    '<p><strong>Available features:</strong></p>' +
    '<ul>' +
    '<li>Data refresh automation</li>' +
    '<li>Header formatting</li>' +
    '<li>CSV/JSON export</li>' +
    '</ul>' +
    '<p><em>Powered by SheetFreak</em></p>'
  )
    .setWidth(400)
    .setHeight(300);

  ui.showModalDialog(html, 'About');
}

/**
 * Advanced: Create custom sidebar
 * Uncomment and customize to add a sidebar to your spreadsheet
 */
/*
function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('SheetFreak Controls')
    .setWidth(300);

  SpreadsheetApp.getUi().showSidebar(html);
}
*/
