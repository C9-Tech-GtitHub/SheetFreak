/**
 * Custom Functions Template
 * Custom spreadsheet functions for use in formulas
 *
 * Usage: Type =FUNCTION_NAME() in any cell
 * Example: =WEIGHTED_AVERAGE(A1:A10, B1:B10)
 */

/**
 * Calculate weighted average
 *
 * @param {number[][]} values The values to average
 * @param {number[][]} weights The weights for each value
 * @return {number} The weighted average
 * @customfunction
 */
function WEIGHTED_AVERAGE(values, weights) {
  if (!values || !weights) {
    throw new Error('Both values and weights are required');
  }

  if (values.length !== weights.length) {
    throw new Error('Values and weights must have same length');
  }

  let sum = 0;
  let weightSum = 0;

  for (let i = 0; i < values.length; i++) {
    const value = parseFloat(values[i][0]);
    const weight = parseFloat(weights[i][0]);

    if (isNaN(value) || isNaN(weight)) {
      continue;
    }

    sum += value * weight;
    weightSum += weight;
  }

  if (weightSum === 0) {
    return 0;
  }

  return sum / weightSum;
}

/**
 * Fetch data from external API
 *
 * @param {string} url The API endpoint URL
 * @param {string} path Optional JSON path (e.g., "data.items[0].name")
 * @return {string} The API response or specific field value
 * @customfunction
 */
function FETCH_API(url, path) {
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      return '#ERROR: Status ' + response.getResponseCode();
    }

    const text = response.getContentText();

    if (!path) {
      return text;
    }

    // Parse JSON and navigate path
    const data = JSON.parse(text);
    const keys = path.split('.');
    let result = data;

    for (const key of keys) {
      // Handle array indexing like "items[0]"
      const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        result = result[arrayMatch[1]][parseInt(arrayMatch[2])];
      } else {
        result = result[key];
      }

      if (result === undefined) {
        return '#ERROR: Path not found';
      }
    }

    return typeof result === 'object' ? JSON.stringify(result) : result;
  } catch (error) {
    return '#ERROR: ' + error.message;
  }
}

/**
 * Fetch JSON data from API and return as array
 *
 * @param {string} url The API endpoint URL
 * @param {string} arrayPath Path to array in JSON (e.g., "data.items")
 * @param {string} fields Comma-separated field names to extract
 * @return {Array} Array of values
 * @customfunction
 */
function FETCH_JSON_ARRAY(url, arrayPath, fields) {
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      return [['#ERROR: Status ' + response.getResponseCode()]];
    }

    const data = JSON.parse(response.getContentText());

    // Navigate to array
    let array = data;
    if (arrayPath) {
      const keys = arrayPath.split('.');
      for (const key of keys) {
        array = array[key];
      }
    }

    if (!Array.isArray(array)) {
      return [['#ERROR: Not an array']];
    }

    // Extract fields
    const fieldNames = fields.split(',').map(f => f.trim());
    const results = array.map(item => {
      return fieldNames.map(field => {
        const value = item[field];
        return value !== undefined ? value : '';
      });
    });

    return results;
  } catch (error) {
    return [['#ERROR: ' + error.message]];
  }
}

/**
 * Calculate compound annual growth rate (CAGR)
 *
 * @param {number} startValue Beginning value
 * @param {number} endValue Ending value
 * @param {number} years Number of years
 * @return {number} CAGR as decimal (e.g., 0.05 = 5%)
 * @customfunction
 */
function CAGR(startValue, endValue, years) {
  if (startValue <= 0 || endValue <= 0 || years <= 0) {
    return '#ERROR: All values must be positive';
  }

  return Math.pow(endValue / startValue, 1 / years) - 1;
}

/**
 * Convert text to title case
 *
 * @param {string} text Text to convert
 * @return {string} Title case text
 * @customfunction
 */
function TITLE_CASE(text) {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract domain from URL
 *
 * @param {string} url URL to parse
 * @return {string} Domain name
 * @customfunction
 */
function EXTRACT_DOMAIN(url) {
  if (!url) return '';

  try {
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    return match ? match[1] : '';
  } catch (error) {
    return '#ERROR: Invalid URL';
  }
}

/**
 * Calculate percentage change
 *
 * @param {number} oldValue Original value
 * @param {number} newValue New value
 * @return {number} Percentage change as decimal
 * @customfunction
 */
function PERCENT_CHANGE(oldValue, newValue) {
  if (oldValue === 0) {
    return '#ERROR: Division by zero';
  }

  return (newValue - oldValue) / oldValue;
}

/**
 * Clean text by removing extra whitespace and special characters
 *
 * @param {string} text Text to clean
 * @return {string} Cleaned text
 * @customfunction
 */
function CLEAN_TEXT(text) {
  if (!text) return '';

  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '');
}

/**
 * Get timestamp in ISO format
 *
 * @return {string} Current timestamp
 * @customfunction
 */
function TIMESTAMP() {
  return new Date().toISOString();
}

/**
 * Convert Unix timestamp to date
 *
 * @param {number} timestamp Unix timestamp (seconds)
 * @return {Date} JavaScript Date object
 * @customfunction
 */
function UNIX_TO_DATE(timestamp) {
  return new Date(timestamp * 1000);
}
