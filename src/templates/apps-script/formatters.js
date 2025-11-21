/**
 * Formatters Template
 * Reusable formatting functions for consistent styling
 */

/**
 * Apply alternating row colors for better readability
 *
 * @param {string} sheetName Name of the sheet to format
 * @param {number} startRow Starting row (usually 2 to skip headers)
 * @param {number} endRow Ending row (use sheet.getLastRow())
 */
function applyAlternatingRows(sheetName, startRow, endRow) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const lastCol = sheet.getLastColumn();

  for (let i = startRow; i <= endRow; i++) {
    const color = i % 2 === 0 ? '#FFFFFF' : '#F8F9FA';
    sheet.getRange(i, 1, 1, lastCol).setBackground(color);
  }
}

/**
 * Apply professional header styling
 *
 * @param {string} sheetName Name of the sheet
 * @param {number} headerRow Header row number (usually 1)
 * @param {string} color Background color (hex or named)
 */
function applyHeaderStyle(sheetName, headerRow, color) {
  color = color || '#4285F4'; // Default Google blue
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const range = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn());

  range.setBackground(color)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Freeze header row
  sheet.setFrozenRows(headerRow);
}

/**
 * Apply currency formatting to a range
 *
 * @param {string} sheetName Sheet name
 * @param {string} range A1 notation range (e.g., "B2:B100")
 * @param {string} currencySymbol Currency symbol (default: $)
 */
function applyCurrencyFormat(sheetName, range, currencySymbol) {
  currencySymbol = currencySymbol || '$';
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  sheet.getRange(range).setNumberFormat(currencySymbol + '#,##0.00');
}

/**
 * Apply percentage formatting to a range
 *
 * @param {string} sheetName Sheet name
 * @param {string} range A1 notation range
 * @param {number} decimals Number of decimal places (default: 2)
 */
function applyPercentFormat(sheetName, range, decimals) {
  decimals = decimals || 2;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const format = '0.' + '0'.repeat(decimals) + '%';
  sheet.getRange(range).setNumberFormat(format);
}

/**
 * Apply date formatting to a range
 *
 * @param {string} sheetName Sheet name
 * @param {string} range A1 notation range
 * @param {string} format Date format (default: "yyyy-MM-dd")
 */
function applyDateFormat(sheetName, range, format) {
  format = format || 'yyyy-MM-dd';
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  sheet.getRange(range).setNumberFormat(format);
}

/**
 * Add borders around a range
 *
 * @param {string} sheetName Sheet name
 * @param {string} range A1 notation range
 * @param {boolean} thick Use thick borders (default: false)
 */
function addBorders(sheetName, range, thick) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const rangeObj = sheet.getRange(range);
  const color = '#000000';
  const style = thick ? SpreadsheetApp.BorderStyle.SOLID_THICK : SpreadsheetApp.BorderStyle.SOLID;

  rangeObj.setBorder(true, true, true, true, true, true, color, style);
}

/**
 * Auto-resize all columns to fit content
 *
 * @param {string} sheetName Sheet name
 */
function autoResizeColumns(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const lastCol = sheet.getLastColumn();

  for (let i = 1; i <= lastCol; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Set column widths to specific pixel values
 *
 * @param {string} sheetName Sheet name
 * @param {Object} widths Object mapping column letters to pixel widths
 *                         Example: {A: 150, B: 200, C: 100}
 */
function setColumnWidths(sheetName, widths) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  for (const col in widths) {
    const colIndex = col.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    sheet.setColumnWidth(colIndex, widths[col]);
  }
}

/**
 * Apply conditional formatting based on cell values
 *
 * @param {string} sheetName Sheet name
 * @param {string} range A1 notation range
 * @param {Object} rules Object with value-to-color mappings
 */
function applyConditionalColors(sheetName, range, rules) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const rangeObj = sheet.getRange(range);
  const values = rangeObj.getValues();

  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      const value = values[i][j];
      const color = rules[value];

      if (color) {
        rangeObj.getCell(i + 1, j + 1).setBackground(color);
      }
    }
  }
}

/**
 * Apply data bars (progress bar visualization) to numeric column
 *
 * @param {string} sheetName Sheet name
 * @param {string} range A1 notation range (should be numeric values)
 * @param {string} color Bar color (hex)
 */
function applyDataBars(sheetName, range, color) {
  color = color || '#4285F4';
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const rangeObj = sheet.getRange(range);
  const values = rangeObj.getValues().flat();
  const max = Math.max(...values.filter(v => typeof v === 'number'));

  if (max === 0) return;

  const rule = SpreadsheetApp.newConditionalFormatRule()
    .setGradientMaxpointWithValue(color, SpreadsheetApp.InterpolationType.NUMBER, max.toString())
    .setGradientMidpointWithValue('#FFFFFF', SpreadsheetApp.InterpolationType.NUMBER, (max / 2).toString())
    .setGradientMinpointWithValue('#FFFFFF', SpreadsheetApp.InterpolationType.NUMBER, '0')
    .setRanges([rangeObj])
    .build();

  const rules = sheet.getConditionalFormatRules();
  rules.push(rule);
  sheet.setConditionalFormatRules(rules);
}

/**
 * Clear all formatting from a range
 *
 * @param {string} sheetName Sheet name
 * @param {string} range A1 notation range
 */
function clearFormatting(sheetName, range) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const rangeObj = sheet.getRange(range);

  rangeObj.setBackground(null)
    .setFontColor(null)
    .setFontWeight(null)
    .setFontSize(null)
    .setHorizontalAlignment(null)
    .setVerticalAlignment(null)
    .setBorder(false, false, false, false, false, false);
}

/**
 * Apply a complete table style (headers + data rows)
 *
 * @param {string} sheetName Sheet name
 * @param {string} style Style name: "blue", "green", "gray", "minimal"
 */
function applyTableStyle(sheetName, style) {
  style = style || 'blue';
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const styles = {
    blue: { header: '#4285F4', alt: '#F8F9FA' },
    green: { header: '#34A853', alt: '#F1F8F4' },
    gray: { header: '#5F6368', alt: '#F8F9FA' },
    minimal: { header: '#FFFFFF', alt: '#FAFAFA' }
  };

  const colors = styles[style] || styles.blue;

  // Apply header
  applyHeaderStyle(sheetName, 1, colors.header);

  // Apply alternating rows
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    for (let i = 2; i <= lastRow; i++) {
      const color = i % 2 === 0 ? '#FFFFFF' : colors.alt;
      sheet.getRange(i, 1, 1, sheet.getLastColumn()).setBackground(color);
    }
  }

  // Auto-resize columns
  autoResizeColumns(sheetName);

  // Add borders
  addBorders(sheetName, 'A1:' + sheet.getLastColumn() + lastRow, false);
}

/**
 * Highlight cells that meet a condition
 *
 * @param {string} sheetName Sheet name
 * @param {string} range A1 notation range
 * @param {function} condition Function that returns true for cells to highlight
 * @param {string} color Highlight color
 */
function highlightCells(sheetName, range, condition, color) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const rangeObj = sheet.getRange(range);
  const values = rangeObj.getValues();

  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      if (condition(values[i][j])) {
        rangeObj.getCell(i + 1, j + 1).setBackground(color);
      }
    }
  }
}

/**
 * Example usage function
 */
function exampleFormatting() {
  const sheetName = 'Data';

  // Apply table style
  applyTableStyle(sheetName, 'blue');

  // Format currency column
  applyCurrencyFormat(sheetName, 'C2:C100', '$');

  // Format percentage column
  applyPercentFormat(sheetName, 'D2:D100', 2);

  // Highlight negative values in red
  highlightCells(sheetName, 'E2:E100', function(value) {
    return typeof value === 'number' && value < 0;
  }, '#FEE');
}
