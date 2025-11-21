// Data operation commands
import { ServiceAccountAuth } from '../auth/service-account.js';
import { SheetsClient } from '../api/sheets-client.js';
import { configManager } from '../utils/config.js';
import { SheetFreakError } from '../utils/errors.js';
import chalk from 'chalk';
import Table from 'cli-table3';
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

export async function readData(
  spreadsheetId: string,
  range: string,
  format: string = 'table'
): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    const data = await sheets.read(spreadsheetId, range);

    if (!data || data.length === 0) {
      console.log(chalk.yellow('No data found in range'));
      return;
    }

    if (format === 'json') {
      console.log(JSON.stringify({ range, values: data }, null, 2));
    } else if (format === 'csv') {
      data.forEach(row => {
        console.log(row.map(cell => `"${cell}"`).join(','));
      });
    } else {
      const table = new Table();
      data.forEach(row => {
        table.push(row);
      });
      console.log(table.toString());
    }
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to read data:'), error.message);
    throw error;
  }
}

export async function writeData(
  spreadsheetId: string,
  range: string,
  value?: string,
  jsonFile?: string
): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    let values: any[][];

    if (jsonFile) {
      // Read from JSON file
      const fileContent = fs.readFileSync(jsonFile, 'utf-8');
      const json = JSON.parse(fileContent);
      values = json.values || json;
    } else if (value) {
      // Single value
      values = [[value]];
    } else {
      throw new SheetFreakError(
        'INVALID_INPUT',
        'Either provide a value or use --json flag with a file'
      );
    }

    await sheets.write(spreadsheetId, range, values);
    console.log(chalk.green('✓ Data written successfully'));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to write data:'), error.message);
    throw error;
  }
}

export async function clearData(spreadsheetId: string, range: string): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    await sheets.clear(spreadsheetId, range);
    console.log(chalk.green(`✓ Cleared range: ${range}`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to clear data:'), error.message);
    throw error;
  }
}

export async function appendData(
  spreadsheetId: string,
  range: string,
  value?: string,
  jsonFile?: string
): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    let values: any[][];

    if (jsonFile) {
      const fileContent = fs.readFileSync(jsonFile, 'utf-8');
      const json = JSON.parse(fileContent);
      values = json.values || json;
    } else if (value) {
      values = [[value]];
    } else {
      throw new SheetFreakError(
        'INVALID_INPUT',
        'Either provide a value or use --json flag with a file'
      );
    }

    await sheets.append(spreadsheetId, range, values);
    console.log(chalk.green('✓ Data appended successfully'));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to append data:'), error.message);
    throw error;
  }
}

export async function batchWriteData(spreadsheetId: string, jsonFile: string): Promise<void> {
  try {
    const sheets = getAuthenticatedSheets();
    const fileContent = fs.readFileSync(jsonFile, 'utf-8');
    const updates = JSON.parse(fileContent);

    if (!Array.isArray(updates)) {
      throw new SheetFreakError(
        'INVALID_INPUT',
        'JSON file must contain an array of {range, values} objects'
      );
    }

    await sheets.batchWrite(spreadsheetId, updates);
    console.log(chalk.green(`✓ Batch write completed: ${updates.length} range(s) updated`));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to batch write:'), error.message);
    throw error;
  }
}
