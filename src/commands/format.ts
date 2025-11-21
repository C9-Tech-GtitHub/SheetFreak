// Format operation commands
import { ServiceAccountAuth } from '../auth/service-account.js';
import { SheetsClient } from '../api/sheets-client.js';
import { configManager } from '../utils/config.js';
import { SheetFreakError } from '../utils/errors.js';
import { CellFormat, Borders, Color } from '../types/index.js';
import chalk from 'chalk';
import fs from 'fs';

function getAuthenticatedSheets(): SheetsClient {
  const credentialsPath = configManager.getCredentialsPath();
  if (!credentialsPath) {
    throw new SheetFreakError(
      'NOT_CONFIGURED',
      'Authentication not configured. Run: sheetfreak auth init <credentials.json>'
    );
  }

  const auth = new ServiceAccountAuth(credentialsPath);
  return new SheetsClient(auth);
}

// Helper: Parse color from various formats
function parseColorInput(colorInput: string): Color {
  // Hex format: #RRGGBB or RRGGBB
  if (colorInput.startsWith('#') || /^[0-9A-Fa-f]{6}$/.test(colorInput)) {
    const hex = colorInput.replace('#', '');
    return {
      red: parseInt(hex.substring(0, 2), 16) / 255,
      green: parseInt(hex.substring(2, 4), 16) / 255,
      blue: parseInt(hex.substring(4, 6), 16) / 255,
      alpha: 1,
    };
  }

  // Named colors
  const namedColors: Record<string, Color> = {
    red: { red: 1, green: 0, blue: 0, alpha: 1 },
    green: { red: 0, green: 1, blue: 0, alpha: 1 },
    blue: { red: 0, green: 0, blue: 1, alpha: 1 },
    yellow: { red: 1, green: 1, blue: 0, alpha: 1 },
    orange: { red: 1, green: 0.65, blue: 0, alpha: 1 },
    purple: { red: 0.5, green: 0, blue: 0.5, alpha: 1 },
    pink: { red: 1, green: 0.75, blue: 0.8, alpha: 1 },
    white: { red: 1, green: 1, blue: 1, alpha: 1 },
    black: { red: 0, green: 0, blue: 0, alpha: 1 },
    gray: { red: 0.5, green: 0.5, blue: 0.5, alpha: 1 },
    lightgray: { red: 0.83, green: 0.83, blue: 0.83, alpha: 1 },
    darkgray: { red: 0.66, green: 0.66, blue: 0.66, alpha: 1 },
  };

  const color = namedColors[colorInput.toLowerCase()];
  if (color) {
    return color;
  }

  throw new SheetFreakError(
    'INVALID_INPUT',
    `Invalid color format: ${colorInput}. Use hex (#RRGGBB) or named color (red, green, blue, etc.)`
  );
}

// Apply cell formatting to a range
export async function formatCells(
  spreadsheetId: string,
  range: string,
  options: {
    bgColor?: string;
    textColor?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    fontSize?: number;
    fontFamily?: string;
    align?: 'LEFT' | 'CENTER' | 'RIGHT';
    valign?: 'TOP' | 'MIDDLE' | 'BOTTOM';
    wrap?: 'OVERFLOW_CELL' | 'WRAP' | 'CLIP';
    json?: string;
  }
): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    let format: CellFormat;

    if (options.json) {
      // Load format from JSON file
      const fileContent = fs.readFileSync(options.json, 'utf-8');
      format = JSON.parse(fileContent);
    } else {
      // Build format from command-line options
      format = {};

      if (options.bgColor) {
        format.backgroundColor = parseColorInput(options.bgColor);
      }

      if (options.textColor || options.bold !== undefined || options.italic !== undefined ||
          options.underline !== undefined || options.strikethrough !== undefined ||
          options.fontSize || options.fontFamily) {
        format.textFormat = {};

        if (options.textColor) {
          format.textFormat.foregroundColor = parseColorInput(options.textColor);
        }
        if (options.bold !== undefined) {
          format.textFormat.bold = options.bold;
        }
        if (options.italic !== undefined) {
          format.textFormat.italic = options.italic;
        }
        if (options.underline !== undefined) {
          format.textFormat.underline = options.underline;
        }
        if (options.strikethrough !== undefined) {
          format.textFormat.strikethrough = options.strikethrough;
        }
        if (options.fontSize) {
          format.textFormat.fontSize = options.fontSize;
        }
        if (options.fontFamily) {
          format.textFormat.fontFamily = options.fontFamily;
        }
      }

      if (options.align) {
        format.horizontalAlignment = options.align;
      }

      if (options.valign) {
        format.verticalAlignment = options.valign;
      }

      if (options.wrap) {
        format.wrapStrategy = options.wrap;
      }
    }

    await sheets.formatCells(spreadsheetId, range, format);
    console.log(chalk.green(`✓ Formatting applied to range: ${range}`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to apply formatting:'), error.message);
    throw error;
  }
}

// Apply borders to a range
export async function applyBorders(
  spreadsheetId: string,
  range: string,
  options: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    all?: boolean;
    style?: 'DOTTED' | 'DASHED' | 'SOLID' | 'SOLID_MEDIUM' | 'SOLID_THICK' | 'DOUBLE';
    color?: string;
    json?: string;
  }
): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    let borders: Borders;

    if (options.json) {
      // Load borders from JSON file
      const fileContent = fs.readFileSync(options.json, 'utf-8');
      borders = JSON.parse(fileContent);
    } else {
      // Build borders from command-line options
      borders = {};
      const borderStyle = {
        style: options.style || 'SOLID',
        color: options.color ? parseColorInput(options.color) : undefined,
      };

      if (options.all || options.top) {
        borders.top = borderStyle;
      }
      if (options.all || options.bottom) {
        borders.bottom = borderStyle;
      }
      if (options.all || options.left) {
        borders.left = borderStyle;
      }
      if (options.all || options.right) {
        borders.right = borderStyle;
      }
    }

    await sheets.applyBorders(spreadsheetId, range, borders);
    console.log(chalk.green(`✓ Borders applied to range: ${range}`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to apply borders:'), error.message);
    throw error;
  }
}

// Resize columns
export async function resizeColumns(
  spreadsheetId: string,
  sheetTitle: string,
  startColumn: number,
  endColumn: number,
  pixelSize: number
): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    await sheets.resizeColumns(spreadsheetId, sheetTitle, startColumn, endColumn, pixelSize);
    console.log(chalk.green(`✓ Resized columns ${startColumn}-${endColumn} to ${pixelSize}px`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to resize columns:'), error.message);
    throw error;
  }
}

// Resize rows
export async function resizeRows(
  spreadsheetId: string,
  sheetTitle: string,
  startRow: number,
  endRow: number,
  pixelSize: number
): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    await sheets.resizeRows(spreadsheetId, sheetTitle, startRow, endRow, pixelSize);
    console.log(chalk.green(`✓ Resized rows ${startRow}-${endRow} to ${pixelSize}px`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to resize rows:'), error.message);
    throw error;
  }
}

// Auto-resize columns to fit content
export async function autoResizeColumns(
  spreadsheetId: string,
  sheetTitle: string,
  startColumn: number,
  endColumn: number
): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    await sheets.autoResizeColumns(spreadsheetId, sheetTitle, startColumn, endColumn);
    console.log(chalk.green(`✓ Auto-resized columns ${startColumn}-${endColumn}`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to auto-resize columns:'), error.message);
    throw error;
  }
}
