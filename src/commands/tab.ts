// Tab/sheet management commands
import { ServiceAccountAuth } from '../auth/service-account.js';
import { SheetsClient } from '../api/sheets-client.js';
import { configManager } from '../utils/config.js';
import { SheetFreakError } from '../utils/errors.js';
import chalk from 'chalk';
import Table from 'cli-table3';

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

export async function listTabs(spreadsheetId: string, format: string = 'table'): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    const tabs = await sheets.listSheets(spreadsheetId);

    if (format === 'json') {
      console.log(JSON.stringify(tabs, null, 2));
    } else {
      const table = new Table({
        head: ['Title', 'Sheet ID', 'Index', 'Rows', 'Columns'],
        colWidths: [30, 15, 10, 10, 10]
      });

      tabs.forEach(tab => {
        table.push([
          tab.title,
          tab.sheetId.toString(),
          tab.index.toString(),
          tab.gridProperties?.rowCount?.toString() || 'N/A',
          tab.gridProperties?.columnCount?.toString() || 'N/A'
        ]);
      });

      console.log(table.toString());
      console.log(chalk.gray(`\nTotal: ${tabs.length} sheet(s)`));
    }
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to list sheets:'), error.message);
    throw error;
  }
}

export async function addTab(spreadsheetId: string, title: string): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    const sheetId = await sheets.addSheet(spreadsheetId, title);

    console.log(chalk.green('✓ Sheet added successfully'));
    console.log(chalk.gray(`  Title: ${title}`));
    console.log(chalk.gray(`  Sheet ID: ${sheetId}`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to add sheet:'), error.message);
    throw error;
  }
}

export async function deleteTab(spreadsheetId: string, title: string): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    await sheets.deleteSheet(spreadsheetId, title);

    console.log(chalk.green(`✓ Sheet "${title}" deleted successfully`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to delete sheet:'), error.message);
    throw error;
  }
}

export async function renameTab(
  spreadsheetId: string,
  oldTitle: string,
  newTitle: string
): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    await sheets.renameSheet(spreadsheetId, oldTitle, newTitle);

    console.log(chalk.green('✓ Sheet renamed successfully'));
    console.log(chalk.gray(`  ${oldTitle} → ${newTitle}`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to rename sheet:'), error.message);
    throw error;
  }
}
