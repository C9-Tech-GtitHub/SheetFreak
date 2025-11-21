// Google Sheets API client wrapper
import { sheets_v4 } from "googleapis";
import { ServiceAccountAuth } from "../auth/service-account.js";
import { handleGoogleAPIError, SheetFreakError } from "../utils/errors.js";
import {
  BatchUpdate,
  SheetInfo,
  CellFormat,
  Borders,
  Color,
  FormatRequest,
} from "../types/index.js";

export class SheetsClient {
  private sheets: sheets_v4.Sheets;
  private initialized: boolean = false;

  constructor(private auth: ServiceAccountAuth) {
    this.sheets = auth.getSheetsAPI();
  }

  private async ensureAuthorized(): Promise<void> {
    if (!this.initialized) {
      await this.auth.authorize();
      this.initialized = true;
    }
  }

  // Read data from a range
  async read(
    spreadsheetId: string,
    range: string,
  ): Promise<any[][] | undefined> {
    await this.ensureAuthorized();
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return response.data.values || undefined;
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Write data to a range
  async write(
    spreadsheetId: string,
    range: string,
    values: any[][],
  ): Promise<void> {
    await this.ensureAuthorized();
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Batch write multiple ranges
  async batchWrite(
    spreadsheetId: string,
    updates: BatchUpdate[],
  ): Promise<void> {
    await this.ensureAuthorized();
    try {
      const data = updates.map((u) => ({
        range: u.range,
        values: u.values,
      }));

      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data,
        },
      });
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Clear a range
  async clear(spreadsheetId: string, range: string): Promise<void> {
    await this.ensureAuthorized();
    try {
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
      });
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Append data to a range
  async append(
    spreadsheetId: string,
    range: string,
    values: any[][],
  ): Promise<void> {
    await this.ensureAuthorized();
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Get spreadsheet metadata
  async getSpreadsheet(
    spreadsheetId: string,
  ): Promise<sheets_v4.Schema$Spreadsheet> {
    await this.ensureAuthorized();
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });
      return response.data;
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // List all sheets in a spreadsheet
  async listSheets(spreadsheetId: string): Promise<SheetInfo[]> {
    await this.ensureAuthorized();
    try {
      const spreadsheet = await this.getSpreadsheet(spreadsheetId);

      return (spreadsheet.sheets || []).map((sheet) => ({
        sheetId: sheet.properties?.sheetId || 0,
        title: sheet.properties?.title || "",
        index: sheet.properties?.index || 0,
        gridProperties: {
          rowCount: sheet.properties?.gridProperties?.rowCount || 0,
          columnCount: sheet.properties?.gridProperties?.columnCount || 0,
        },
      }));
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Add a new sheet/tab
  async addSheet(spreadsheetId: string, title: string): Promise<number> {
    await this.ensureAuthorized();
    try {
      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title,
                },
              },
            },
          ],
        },
      });

      const sheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId;
      if (sheetId === undefined || sheetId === null) {
        throw new SheetFreakError("API_ERROR", "Failed to get new sheet ID");
      }

      return sheetId;
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Delete a sheet/tab by title
  async deleteSheet(spreadsheetId: string, title: string): Promise<void> {
    await this.ensureAuthorized();
    try {
      const sheets = await this.listSheets(spreadsheetId);
      const sheet = sheets.find((s) => s.title === title);

      if (!sheet) {
        throw SheetFreakError.notFound("Sheet", title);
      }

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteSheet: {
                sheetId: sheet.sheetId,
              },
            },
          ],
        },
      });
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Rename a sheet/tab
  async renameSheet(
    spreadsheetId: string,
    oldTitle: string,
    newTitle: string,
  ): Promise<void> {
    await this.ensureAuthorized();
    try {
      const sheets = await this.listSheets(spreadsheetId);
      const sheet = sheets.find((s) => s.title === oldTitle);

      if (!sheet) {
        throw SheetFreakError.notFound("Sheet", oldTitle);
      }

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              updateSheetProperties: {
                properties: {
                  sheetId: sheet.sheetId,
                  title: newTitle,
                },
                fields: "title",
              },
            },
          ],
        },
      });
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Execute batch update requests (for complex operations)
  async batchUpdate(spreadsheetId: string, requests: any[]): Promise<any> {
    await this.ensureAuthorized();
    try {
      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
      });
      return response.data;
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Helper: Parse color from hex string or Color object
  private parseColor(color: string | Color): Color {
    if (typeof color === "string") {
      // Parse hex color (#RRGGBB)
      const hex = color.replace("#", "");
      return {
        red: parseInt(hex.substring(0, 2), 16) / 255,
        green: parseInt(hex.substring(2, 4), 16) / 255,
        blue: parseInt(hex.substring(4, 6), 16) / 255,
        alpha: 1,
      };
    }
    return color;
  }

  // Helper: Convert A1 notation to GridRange
  private async rangeToGridRange(
    spreadsheetId: string,
    range: string,
  ): Promise<sheets_v4.Schema$GridRange> {
    // Parse range like "Sheet1!A1:B10" or "A1:B10"
    const parts = range.split("!");
    const sheetTitle = parts.length > 1 ? parts[0] : undefined;
    const a1Range = parts.length > 1 ? parts[1] : parts[0];

    // Get sheet ID
    let sheetId = 0;
    if (sheetTitle) {
      const sheets = await this.listSheets(spreadsheetId);
      const sheet = sheets.find((s) => s.title === sheetTitle);
      if (!sheet) {
        throw SheetFreakError.notFound("Sheet", sheetTitle);
      }
      sheetId = sheet.sheetId;
    }

    // Parse A1 notation to row/col indices
    const match = a1Range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (!match) {
      throw new SheetFreakError(
        "INVALID_INPUT",
        `Invalid range format: ${range}. Use A1:B10 notation`,
      );
    }

    const startCol = this.columnToIndex(match[1]);
    const startRow = parseInt(match[2]) - 1;
    const endCol = this.columnToIndex(match[3]) + 1;
    const endRow = parseInt(match[4]);

    return {
      sheetId,
      startRowIndex: startRow,
      endRowIndex: endRow,
      startColumnIndex: startCol,
      endColumnIndex: endCol,
    };
  }

  // Helper: Convert column letter to index (A=0, B=1, ...)
  private columnToIndex(col: string): number {
    let index = 0;
    for (let i = 0; i < col.length; i++) {
      index = index * 26 + (col.charCodeAt(i) - "A".charCodeAt(0) + 1);
    }
    return index - 1;
  }

  // Format cells in a range
  async formatCells(
    spreadsheetId: string,
    range: string,
    format: CellFormat,
  ): Promise<void> {
    await this.ensureAuthorized();
    try {
      const gridRange = await this.rangeToGridRange(spreadsheetId, range);

      // Build cell format request
      const cellFormatRequest: any = {};
      const fields: string[] = [];

      if (format.backgroundColor) {
        cellFormatRequest.backgroundColor = this.parseColor(
          format.backgroundColor,
        );
        fields.push("backgroundColor");
      }

      if (format.textFormat) {
        cellFormatRequest.textFormat = {};
        if (format.textFormat.bold !== undefined) {
          cellFormatRequest.textFormat.bold = format.textFormat.bold;
          fields.push("textFormat.bold");
        }
        if (format.textFormat.italic !== undefined) {
          cellFormatRequest.textFormat.italic = format.textFormat.italic;
          fields.push("textFormat.italic");
        }
        if (format.textFormat.underline !== undefined) {
          cellFormatRequest.textFormat.underline = format.textFormat.underline;
          fields.push("textFormat.underline");
        }
        if (format.textFormat.strikethrough !== undefined) {
          cellFormatRequest.textFormat.strikethrough =
            format.textFormat.strikethrough;
          fields.push("textFormat.strikethrough");
        }
        if (format.textFormat.fontSize) {
          cellFormatRequest.textFormat.fontSize = format.textFormat.fontSize;
          fields.push("textFormat.fontSize");
        }
        if (format.textFormat.fontFamily) {
          cellFormatRequest.textFormat.fontFamily =
            format.textFormat.fontFamily;
          fields.push("textFormat.fontFamily");
        }
        if (format.textFormat.foregroundColor) {
          cellFormatRequest.textFormat.foregroundColor = this.parseColor(
            format.textFormat.foregroundColor,
          );
          fields.push("textFormat.foregroundColor");
        }
      }

      if (format.horizontalAlignment) {
        cellFormatRequest.horizontalAlignment = format.horizontalAlignment;
        fields.push("horizontalAlignment");
      }

      if (format.verticalAlignment) {
        cellFormatRequest.verticalAlignment = format.verticalAlignment;
        fields.push("verticalAlignment");
      }

      if (format.wrapStrategy) {
        cellFormatRequest.wrapStrategy = format.wrapStrategy;
        fields.push("wrapStrategy");
      }

      if (format.numberFormat) {
        cellFormatRequest.numberFormat = format.numberFormat;
        fields.push("numberFormat");
      }

      await this.batchUpdate(spreadsheetId, [
        {
          repeatCell: {
            range: gridRange,
            cell: {
              userEnteredFormat: cellFormatRequest,
            },
            fields: `userEnteredFormat(${fields.join(",")})`,
          },
        },
      ]);
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Apply borders to a range
  async applyBorders(
    spreadsheetId: string,
    range: string,
    borders: Borders,
  ): Promise<void> {
    await this.ensureAuthorized();
    try {
      const gridRange = await this.rangeToGridRange(spreadsheetId, range);

      const requests: any[] = [];

      // Build border request
      const borderRequest: any = {
        updateBorders: {
          range: gridRange,
        },
      };

      if (borders.top) {
        borderRequest.updateBorders.top = {
          style: borders.top.style || "SOLID",
          color: borders.top.color
            ? this.parseColor(borders.top.color)
            : { red: 0, green: 0, blue: 0 },
        };
      }

      if (borders.bottom) {
        borderRequest.updateBorders.bottom = {
          style: borders.bottom.style || "SOLID",
          color: borders.bottom.color
            ? this.parseColor(borders.bottom.color)
            : { red: 0, green: 0, blue: 0 },
        };
      }

      if (borders.left) {
        borderRequest.updateBorders.left = {
          style: borders.left.style || "SOLID",
          color: borders.left.color
            ? this.parseColor(borders.left.color)
            : { red: 0, green: 0, blue: 0 },
        };
      }

      if (borders.right) {
        borderRequest.updateBorders.right = {
          style: borders.right.style || "SOLID",
          color: borders.right.color
            ? this.parseColor(borders.right.color)
            : { red: 0, green: 0, blue: 0 },
        };
      }

      requests.push(borderRequest);
      await this.batchUpdate(spreadsheetId, requests);
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Resize columns
  async resizeColumns(
    spreadsheetId: string,
    sheetTitle: string,
    startColumn: number,
    endColumn: number,
    pixelSize: number,
  ): Promise<void> {
    await this.ensureAuthorized();
    try {
      const sheets = await this.listSheets(spreadsheetId);
      const sheet = sheets.find((s) => s.title === sheetTitle);
      if (!sheet) {
        throw SheetFreakError.notFound("Sheet", sheetTitle);
      }

      await this.batchUpdate(spreadsheetId, [
        {
          updateDimensionProperties: {
            range: {
              sheetId: sheet.sheetId,
              dimension: "COLUMNS",
              startIndex: startColumn,
              endIndex: endColumn + 1,
            },
            properties: {
              pixelSize,
            },
            fields: "pixelSize",
          },
        },
      ]);
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Resize rows
  async resizeRows(
    spreadsheetId: string,
    sheetTitle: string,
    startRow: number,
    endRow: number,
    pixelSize: number,
  ): Promise<void> {
    await this.ensureAuthorized();
    try {
      const sheets = await this.listSheets(spreadsheetId);
      const sheet = sheets.find((s) => s.title === sheetTitle);
      if (!sheet) {
        throw SheetFreakError.notFound("Sheet", sheetTitle);
      }

      await this.batchUpdate(spreadsheetId, [
        {
          updateDimensionProperties: {
            range: {
              sheetId: sheet.sheetId,
              dimension: "ROWS",
              startIndex: startRow - 1,
              endIndex: endRow,
            },
            properties: {
              pixelSize,
            },
            fields: "pixelSize",
          },
        },
      ]);
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Auto-resize columns to fit content
  async autoResizeColumns(
    spreadsheetId: string,
    sheetTitle: string,
    startColumn: number,
    endColumn: number,
  ): Promise<void> {
    await this.ensureAuthorized();
    try {
      const sheets = await this.listSheets(spreadsheetId);
      const sheet = sheets.find((s) => s.title === sheetTitle);
      if (!sheet) {
        throw SheetFreakError.notFound("Sheet", sheetTitle);
      }

      await this.batchUpdate(spreadsheetId, [
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: sheet.sheetId,
              dimension: "COLUMNS",
              startIndex: startColumn,
              endIndex: endColumn + 1,
            },
          },
        },
      ]);
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }
}
