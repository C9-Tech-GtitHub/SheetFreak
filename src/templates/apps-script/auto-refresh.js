/**
 * Auto-Refresh Template
 * Automatically refresh data from an external API on a schedule
 *
 * Setup Instructions:
 * 1. Set API_URL in script properties: File > Project properties > Script properties
 * 2. Run setupHourlyRefresh() once to create the trigger
 * 3. The autoRefresh() function will run every hour automatically
 */

/**
 * Main refresh function - fetches data from external API and updates sheet
 */
function autoRefresh() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
  const apiUrl = PropertiesService.getScriptProperties().getProperty('API_URL');

  if (!apiUrl) {
    SpreadsheetApp.getUi().alert('Error', 'API_URL not set in script properties', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  try {
    // Fetch data from API
    const response = UrlFetchApp.fetch(apiUrl, {
      muteHttpExceptions: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.getResponseCode() !== 200) {
      throw new Error('API returned status: ' + response.getResponseCode());
    }

    const data = JSON.parse(response.getContentText());

    // Clear existing data (preserve headers in row 1)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    }

    // Transform API data to rows
    const rows = data.map(item => [
      item.id || '',
      item.name || '',
      item.value || '',
      new Date(item.timestamp || Date.now())
    ]);

    // Write new data
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }

    // Update timestamp in top-right corner
    const lastCol = sheet.getLastColumn();
    sheet.getRange(1, lastCol + 1).setValue('Last Updated: ' + new Date().toLocaleString());

    Logger.log('Auto-refresh completed: ' + rows.length + ' rows updated');
  } catch (error) {
    Logger.log('Auto-refresh failed: ' + error.message);

    // Optionally send error notification
    const notificationEmail = PropertiesService.getScriptProperties().getProperty('NOTIFICATION_EMAIL');
    if (notificationEmail) {
      MailApp.sendEmail({
        to: notificationEmail,
        subject: 'SheetFreak Auto-Refresh Failed',
        body: 'Error: ' + error.message + '\n\nTime: ' + new Date().toLocaleString()
      });
    }
  }
}

/**
 * Setup hourly trigger for auto-refresh
 * Run this once to enable automatic updates
 */
function setupHourlyRefresh() {
  // Delete existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'autoRefresh') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new hourly trigger
  ScriptApp.newTrigger('autoRefresh')
    .timeBased()
    .everyHours(1)
    .create();

  SpreadsheetApp.getUi().alert('Success', 'Hourly auto-refresh enabled', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Setup daily refresh at specific time
 * @param {number} hour - Hour of day (0-23)
 */
function setupDailyRefresh(hour) {
  hour = hour || 9; // Default to 9 AM

  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'autoRefresh') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create daily trigger
  ScriptApp.newTrigger('autoRefresh')
    .timeBased()
    .atHour(hour)
    .everyDays(1)
    .create();

  SpreadsheetApp.getUi().alert('Success', 'Daily auto-refresh enabled at ' + hour + ':00', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Disable all auto-refresh triggers
 */
function disableAutoRefresh() {
  const triggers = ScriptApp.getProjectTriggers();
  let count = 0;

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'autoRefresh') {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });

  SpreadsheetApp.getUi().alert('Success', 'Disabled ' + count + ' auto-refresh trigger(s)', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Manual refresh - can be called from menu
 */
function manualRefresh() {
  autoRefresh();
  SpreadsheetApp.getUi().alert('Success', 'Data refreshed successfully', SpreadsheetApp.getUi().ButtonSet.OK);
}
