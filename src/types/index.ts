// Type definitions for SheetFreak

export interface SheetFreakConfig {
  credentialsPath?: string;
  defaultSpreadsheet?: string;
  outputFormat?: "table" | "json" | "csv";
  verboseErrors?: boolean;
}

export interface SpreadsheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export interface SheetInfo {
  sheetId: number;
  title: string;
  index: number;
  gridProperties?: {
    rowCount: number;
    columnCount: number;
  };
}

// Color can be specified as hex (#RRGGBB), rgb(r,g,b), or named color
export interface Color {
  red?: number; // 0-1
  green?: number; // 0-1
  blue?: number; // 0-1
  alpha?: number; // 0-1, default 1
}

export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  fontFamily?: string;
  foregroundColor?: Color;
}

export interface CellFormat {
  backgroundColor?: Color;
  textFormat?: TextFormat;
  horizontalAlignment?: "LEFT" | "CENTER" | "RIGHT";
  verticalAlignment?: "TOP" | "MIDDLE" | "BOTTOM";
  wrapStrategy?: "OVERFLOW_CELL" | "LEGACY_WRAP" | "CLIP" | "WRAP";
  numberFormat?: {
    type?:
      | "NUMBER"
      | "CURRENCY"
      | "PERCENT"
      | "DATE"
      | "TIME"
      | "DATE_TIME"
      | "SCIENTIFIC";
    pattern?: string;
  };
}

export interface BorderStyle {
  style?:
    | "DOTTED"
    | "DASHED"
    | "SOLID"
    | "SOLID_MEDIUM"
    | "SOLID_THICK"
    | "DOUBLE";
  color?: Color;
}

export interface Borders {
  top?: BorderStyle;
  bottom?: BorderStyle;
  left?: BorderStyle;
  right?: BorderStyle;
}

export interface FormatRequest {
  range: string;
  format?: CellFormat;
  borders?: Borders;
}

export interface BatchUpdate {
  range: string;
  values: any[][];
}

export interface SheetFreakError {
  code: string;
  message: string;
  details?: any;
}

export interface CommandResult {
  success: boolean;
  data?: any;
  error?: SheetFreakError;
}
