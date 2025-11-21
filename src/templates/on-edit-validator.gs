/**
 * Template: on-edit-validator
 * Description: Validate and format data when cells are edited
 *
 * Setup Instructions:
 * 1. Customize validation rules in CONFIG object
 * 2. Deploy and create ON_EDIT trigger: sheetfreak script trigger create <script-id> onEdit --event ON_EDIT
 *
 * Features:
 * - Auto-format email addresses
 * - Validate numeric ranges
 * - Auto-capitalize names
 * - Custom validation rules per column
 */

// Configuration: Define validation rules by column
const CONFIG = {
  // Column A: Email validation
  1: {
    name: 'Email',
    type: 'email',
    required: true,
  },
  // Column B: Name (auto-capitalize)
  2: {
    name: 'Name',
    type: 'capitalize',
    required: true,
  },
  // Column C: Age (must be 18-100)
  3: {
    name: 'Age',
    type: 'number',
    min: 18,
    max: 100,
    required: true,
  },
  // Column D: Status (must be one of predefined values)
  4: {
    name: 'Status',
    type: 'enum',
    values: ['Active', 'Inactive', 'Pending'],
    required: false,
  },
};

/**
 * Runs when a cell is edited
 * This function is triggered automatically on any edit
 */
function onEdit(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    const row = range.getRow();
    const col = range.getColumn();
    const value = range.getValue();

    // Skip header row
    if (row === 1) return;

    // Get validation rule for this column
    const rule = CONFIG[col];
    if (!rule) return;

    // Check if required field is empty
    if (rule.required && !value) {
      range.setBackground('#FFE6E6');
      SpreadsheetApp.getActiveSpreadsheet().toast(
        `${rule.name} is required`,
        'Validation Error',
        3
      );
      return;
    }

    // Skip validation for empty optional fields
    if (!value) return;

    // Apply validation based on type
    let isValid = true;
    let formattedValue = value;

    switch (rule.type) {
      case 'email':
        isValid = validateEmail(value);
        formattedValue = String(value).toLowerCase().trim();
        break;

      case 'capitalize':
        formattedValue = capitalizeWords(String(value));
        break;

      case 'number':
        const num = Number(value);
        isValid = !isNaN(num) && num >= (rule.min || -Infinity) && num <= (rule.max || Infinity);
        if (!isValid) {
          SpreadsheetApp.getActiveSpreadsheet().toast(
            `${rule.name} must be between ${rule.min} and ${rule.max}`,
            'Validation Error',
            3
          );
        }
        break;

      case 'enum':
        isValid = rule.values.includes(value);
        if (!isValid) {
          SpreadsheetApp.getActiveSpreadsheet().toast(
            `${rule.name} must be one of: ${rule.values.join(', ')}`,
            'Validation Error',
            3
          );
        }
        break;
    }

    // Update cell with formatted value
    if (isValid && formattedValue !== value) {
      range.setValue(formattedValue);
    }

    // Set background color based on validation
    if (isValid) {
      range.setBackground('#FFFFFF'); // Valid: white
    } else {
      range.setBackground('#FFE6E6'); // Invalid: light red
    }

  } catch (error) {
    Logger.log(`Error in onEdit: ${error.message}`);
  }
}

/**
 * Validate email address format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email));
}

/**
 * Capitalize first letter of each word
 */
function capitalizeWords(str) {
  return String(str)
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Custom validation function example
 * Add your own validation logic here
 */
function customValidation(value, rule) {
  // Example: validate phone number
  if (rule.type === 'phone') {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(String(value));
  }

  return true;
}

/**
 * Batch validate entire sheet
 * Run this manually to validate all existing data
 */
function validateAllData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  let errorCount = 0;

  // Start from row 2 (skip header)
  for (let row = 2; row <= lastRow; row++) {
    for (let col = 1; col <= lastCol; col++) {
      const rule = CONFIG[col];
      if (!rule) continue;

      const range = sheet.getRange(row, col);
      const value = range.getValue();

      // Simulate edit event
      const e = {
        range: range,
        value: value,
      };

      try {
        onEdit(e);
      } catch (error) {
        errorCount++;
      }
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `Validation complete. ${errorCount} errors found.`,
    'Batch Validation',
    5
  );
}

/**
 * Clear all validation highlights
 */
function clearValidation() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange();
  range.setBackground('#FFFFFF');

  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Validation highlights cleared',
    'Status',
    2
  );
}
