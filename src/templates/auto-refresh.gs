/**
 * Template: auto-refresh
 * Description: Auto-refresh data from external API
 *
 * Setup Instructions:
 * 1. Replace API_URL with your endpoint
 * 2. Configure TARGET_RANGE for where to write data
 * 3. Adjust parseData() function for your API response format
 * 4. Create a time-based trigger: sheetfreak script trigger create <script-id> refreshData --time-based HOURLY
 *
 * Variables:
 * - API_URL: The URL of your API endpoint
 * - TARGET_RANGE: The range where data should be written (e.g., 'Data!A1')
 * - API_KEY: Optional API key for authentication
 */

// Configuration
const CONFIG = {
  API_URL: 'https://api.example.com/data',
  TARGET_RANGE: 'Data!A1',
  API_KEY: '', // Leave empty if not needed
};

/**
 * Main function to refresh data from API
 * Call this function manually or set up a time-based trigger
 */
function refreshData() {
  try {
    Logger.log('Starting data refresh...');

    // Fetch data from API
    const options = {
      method: 'GET',
      headers: CONFIG.API_KEY ? { 'Authorization': `Bearer ${CONFIG.API_KEY}` } : {},
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(CONFIG.API_URL, options);
    const responseCode = response.getResponseCode();

    if (responseCode !== 200) {
      throw new Error(`API request failed with status ${responseCode}: ${response.getContentText()}`);
    }

    // Parse response
    const data = JSON.parse(response.getContentText());
    const values = parseData(data);

    // Write to spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const range = sheet.getRange(CONFIG.TARGET_RANGE);

    // Clear existing data first
    const lastRow = sheet.getActiveSheet().getLastRow();
    if (lastRow > 0) {
      sheet.getActiveSheet().getRange(1, 1, lastRow, values[0].length).clearContent();
    }

    // Write new data
    range.offset(0, 0, values.length, values[0].length).setValues(values);

    // Add timestamp
    const timestampCell = sheet.getActiveSheet().getRange('A:A').getLastRow() + 2;
    sheet.getActiveSheet().getRange(timestampCell, 1).setValue(`Last updated: ${new Date().toLocaleString()}`);

    Logger.log(`Data refresh completed. ${values.length} rows written.`);
    SpreadsheetApp.getActiveSpreadsheet().toast('Data refreshed successfully', 'Auto-Refresh', 3);

  } catch (error) {
    Logger.log(`Error refreshing data: ${error.message}`);
    SpreadsheetApp.getActiveSpreadsheet().toast(`Error: ${error.message}`, 'Auto-Refresh Failed', 5);
    throw error;
  }
}

/**
 * Parse API response into 2D array for spreadsheet
 * Customize this function based on your API response structure
 *
 * @param {Object} data - The parsed JSON response from the API
 * @returns {Array<Array>} 2D array of values for the spreadsheet
 */
function parseData(data) {
  // Example: API returns { items: [{name: "A", value: 1}, {name: "B", value: 2}] }
  if (data.items && Array.isArray(data.items)) {
    // Add header row
    const values = [['Name', 'Value']];

    // Add data rows
    data.items.forEach(item => {
      values.push([item.name, item.value]);
    });

    return values;
  }

  // Default: try to convert object to rows
  return Object.entries(data).map(([key, value]) => [key, value]);
}

/**
 * Test function to verify API connection
 * Run this manually to test your API configuration
 */
function testAPIConnection() {
  try {
    const options = {
      method: 'GET',
      headers: CONFIG.API_KEY ? { 'Authorization': `Bearer ${CONFIG.API_KEY}` } : {},
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(CONFIG.API_URL, options);
    const responseCode = response.getResponseCode();

    Logger.log(`API Response Code: ${responseCode}`);
    Logger.log(`API Response: ${response.getContentText()}`);

    if (responseCode === 200) {
      SpreadsheetApp.getActiveSpreadsheet().toast('API connection successful!', 'Test Result', 3);
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast(`API error: ${responseCode}`, 'Test Failed', 5);
    }
  } catch (error) {
    Logger.log(`Test failed: ${error.message}`);
    SpreadsheetApp.getActiveSpreadsheet().toast(`Error: ${error.message}`, 'Test Failed', 5);
  }
}
