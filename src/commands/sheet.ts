// Sheet management commands
import { ServiceAccountAuth } from '../auth/service-account.js';
import { DriveClient } from '../api/drive-client.js';
import { SheetsClient } from '../api/sheets-client.js';
import { configManager } from '../utils/config.js';
import { SheetFreakError } from '../utils/errors.js';
import chalk from 'chalk';
import Table from 'cli-table3';

function getAuthenticatedClients(): { drive: DriveClient; sheets: SheetsClient } {
  const credentialsPath = configManager.getCredentialsPath();
  if (!credentialsPath) {
    throw new SheetFreakError(
      'NOT_CONFIGURED',
      'Authentication not configured. Run: sheetfreak auth init <credentials.json>'
    );
  }

  const auth = new ServiceAccountAuth(credentialsPath);
  return {
    drive: new DriveClient(auth),
    sheets: new SheetsClient(auth)
  };
}

export async function createSheet(name: string, format: string = 'table'): Promise<void> {
  try {
    const { drive } = getAuthenticatedClients();
    const result = await drive.createSpreadsheet(name);

    if (format === 'json') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(chalk.green('✓ Spreadsheet created successfully!'));
      console.log(chalk.gray(`  ID: ${result.spreadsheetId}`));
      console.log(chalk.gray(`  URL: ${result.spreadsheetUrl}`));
    }
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to create spreadsheet:'), error.message);
    throw error;
  }
}

export async function listSheets(format: string = 'table', limit: number = 100): Promise<void> {
  try {
    const { drive } = getAuthenticatedClients();
    const sheets = await drive.listSpreadsheets(limit);

    if (format === 'json') {
      console.log(JSON.stringify(sheets, null, 2));
    } else {
      if (sheets.length === 0) {
        console.log(chalk.yellow('No spreadsheets found'));
        return;
      }

      const table = new Table({
        head: ['Title', 'Spreadsheet ID', 'URL'],
        colWidths: [30, 50, 50]
      });

      sheets.forEach(sheet => {
        table.push([
          sheet.title,
          sheet.spreadsheetId,
          sheet.spreadsheetUrl
        ]);
      });

      console.log(table.toString());
      console.log(chalk.gray(`\nShowing ${sheets.length} spreadsheet(s)`));
    }
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to list spreadsheets:'), error.message);
    throw error;
  }
}

export async function getSheetInfo(spreadsheetId: string, format: string = 'table'): Promise<void> {
  try {
    const { drive, sheets } = getAuthenticatedClients();
    const info = await drive.getSpreadsheetInfo(spreadsheetId);
    const sheetList = await sheets.listSheets(spreadsheetId);

    if (format === 'json') {
      console.log(JSON.stringify({ ...info, sheets: sheetList }, null, 2));
    } else {
      console.log(chalk.bold(`\n${info.title}`));
      console.log(chalk.gray(`ID: ${info.spreadsheetId}`));
      console.log(chalk.gray(`URL: ${info.spreadsheetUrl}`));
      console.log(chalk.bold(`\nSheets (${sheetList.length}):`));

      const table = new Table({
        head: ['Title', 'Sheet ID', 'Rows', 'Columns'],
        colWidths: [30, 15, 10, 10]
      });

      sheetList.forEach(sheet => {
        table.push([
          sheet.title,
          sheet.sheetId.toString(),
          sheet.gridProperties?.rowCount?.toString() || 'N/A',
          sheet.gridProperties?.columnCount?.toString() || 'N/A'
        ]);
      });

      console.log(table.toString());
    }
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to get spreadsheet info:'), error.message);
    throw error;
  }
}

export async function copySheet(
  spreadsheetId: string,
  newName: string,
  format: string = 'table'
): Promise<void> {
  try {
    const { drive } = getAuthenticatedClients();
    const result = await drive.copySpreadsheet(spreadsheetId, newName);

    if (format === 'json') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(chalk.green('✓ Spreadsheet copied successfully!'));
      console.log(chalk.gray(`  New ID: ${result.spreadsheetId}`));
      console.log(chalk.gray(`  URL: ${result.spreadsheetUrl}`));
    }
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to copy spreadsheet:'), error.message);
    throw error;
  }
}

export async function shareSheet(
  spreadsheetId: string,
  email: string,
  role: 'reader' | 'writer' | 'owner' = 'writer'
): Promise<void> {
  try {
    const { drive } = getAuthenticatedClients();
    await drive.shareSpreadsheet(spreadsheetId, email, role);

    console.log(chalk.green(`✓ Spreadsheet shared with ${email} as ${role}`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to share spreadsheet:'), error.message);
    throw error;
  }
}

export async function setContext(spreadsheetId: string): Promise<void> {
  try {
    const { drive } = getAuthenticatedClients();
    // Verify spreadsheet exists
    const info = await drive.getSpreadsheetInfo(spreadsheetId);

    configManager.setContext(spreadsheetId);
    console.log(chalk.green('✓ Context set successfully'));
    console.log(chalk.gray(`  Current spreadsheet: ${info.title}`));
    console.log(chalk.gray(`  ID: ${spreadsheetId}`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to set context:'), error.message);
    throw error;
  }
}

export async function getContext(): Promise<void> {
  const context = configManager.getContext();

  if (!context.currentSpreadsheet) {
    console.log(chalk.yellow('No context set'));
    console.log(chalk.gray('  Run: sheetfreak context set <spreadsheet-id>'));
    return;
  }

  try {
    const { drive } = getAuthenticatedClients();
    const info = await drive.getSpreadsheetInfo(context.currentSpreadsheet);

    console.log(chalk.bold('Current Context:'));
    console.log(chalk.gray(`  Spreadsheet: ${info.title}`));
    console.log(chalk.gray(`  ID: ${context.currentSpreadsheet}`));
    console.log(chalk.gray(`  Last updated: ${context.lastUpdated}`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to get context:'), error.message);
    throw error;
  }
}
