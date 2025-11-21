// Clasp integration for advanced Apps Script development
import { ScriptClient } from '../api/script-client.js';
import { ServiceAccountAuth } from '../auth/service-account.js';
import { configManager } from '../utils/config.js';
import { SheetFreakError } from '../utils/errors.js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function getAuthenticatedScript(): ScriptClient {
  const credentialsPath = configManager.getCredentialsPath();
  if (!credentialsPath) {
    throw new SheetFreakError(
      'NOT_CONFIGURED',
      'Authentication not configured. Run: sheetfreak auth init <credentials.json>'
    );
  }

  const auth = new ServiceAccountAuth(credentialsPath);
  return new ScriptClient(auth);
}

/**
 * Check if clasp is installed
 */
async function isClaspInstalled(): Promise<boolean> {
  try {
    await execAsync('clasp --version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize clasp for local development
 */
export async function claspInit(spreadsheetId: string): Promise<void> {
  try {
    // Check if clasp is installed
    const claspInstalled = await isClaspInstalled();
    if (!claspInstalled) {
      console.log(chalk.yellow('⚠ clasp is not installed'));
      console.log(chalk.blue('\nTo install clasp globally, run:'));
      console.log(chalk.gray('  npm install -g @google/clasp'));
      console.log(chalk.blue('\nOr add it as a dev dependency:'));
      console.log(chalk.gray('  npm install --save-dev @google/clasp'));
      throw new SheetFreakError(
        'DEPENDENCY_MISSING',
        'clasp is required for local development'
      );
    }

    const script = getAuthenticatedScript();

    // Get or create script project
    let scriptInfo = await script.getScriptForSpreadsheet(spreadsheetId);

    if (!scriptInfo) {
      console.log(chalk.blue('No script found. Creating new script project...'));
      scriptInfo = await script.createProject('SheetFreak Script', spreadsheetId);
    }

    console.log(chalk.blue(`Initializing clasp for script: ${scriptInfo.scriptId}`));

    // Create .clasp.json
    const claspConfig = {
      scriptId: scriptInfo.scriptId,
      rootDir: '.',
    };

    fs.writeFileSync('.clasp.json', JSON.stringify(claspConfig, null, 2));
    console.log(chalk.green('✓ Created .clasp.json'));

    // Create appsscript.json if it doesn't exist
    if (!fs.existsSync('appsscript.json')) {
      const appsscriptConfig = {
        timeZone: 'America/New_York',
        dependencies: {},
        exceptionLogging: 'STACKDRIVER',
        runtimeVersion: 'V8',
      };

      fs.writeFileSync('appsscript.json', JSON.stringify(appsscriptConfig, null, 2));
      console.log(chalk.green('✓ Created appsscript.json'));
    }

    // Create initial Code.gs if it doesn't exist
    if (!fs.existsSync('Code.gs')) {
      const initialCode = `/**
 * SheetFreak Apps Script Project
 *
 * This project is managed with clasp for local development.
 *
 * Available commands:
 * - clasp pull: Download latest code from Google
 * - clasp push: Upload local changes to Google
 * - clasp open: Open script in browser
 * - clasp logs: View execution logs
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('SheetFreak')
    .addItem('Hello World', 'helloWorld')
    .addToUi();
}

function helloWorld() {
  SpreadsheetApp.getActiveSpreadsheet().toast('Hello from SheetFreak!', 'Success', 3);
}
`;

      fs.writeFileSync('Code.gs', initialCode);
      console.log(chalk.green('✓ Created Code.gs'));
    }

    console.log(chalk.green('\n✓ Clasp initialized successfully!'));
    console.log(chalk.blue('\nScript Information:'));
    console.log(`  Script ID: ${scriptInfo.scriptId}`);
    console.log(`  Title: ${scriptInfo.title}`);
    console.log(`  URL: https://script.google.com/d/${scriptInfo.scriptId}/edit`);

    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray('  1. Run "clasp pull" to download existing code from Google'));
    console.log(chalk.gray('  2. Edit your .gs files locally'));
    console.log(chalk.gray('  3. Run "clasp push" to upload changes'));
    console.log(chalk.gray('  4. Run "clasp open" to view in browser'));
    console.log(chalk.gray('  5. Run "clasp logs" to view execution logs'));

  } catch (error: any) {
    console.error(chalk.red('✗ Failed to initialize clasp:'), error.message);
    throw error;
  }
}

/**
 * Pass-through to clasp CLI
 */
export async function claspPassthrough(args: string[]): Promise<void> {
  try {
    // Check if clasp is installed
    const claspInstalled = await isClaspInstalled();
    if (!claspInstalled) {
      console.log(chalk.yellow('⚠ clasp is not installed'));
      console.log(chalk.blue('\nTo install clasp globally, run:'));
      console.log(chalk.gray('  npm install -g @google/clasp'));
      throw new SheetFreakError(
        'DEPENDENCY_MISSING',
        'clasp is required for this command'
      );
    }

    // Check if .clasp.json exists
    if (!fs.existsSync('.clasp.json')) {
      throw new SheetFreakError(
        'NOT_CONFIGURED',
        'No .clasp.json found. Run: sheetfreak script clasp-init <spreadsheet-id>'
      );
    }

    // Execute clasp command
    const command = `clasp ${args.join(' ')}`;
    console.log(chalk.blue(`Executing: ${command}`));

    const { stdout, stderr } = await execAsync(command);

    if (stdout) {
      console.log(stdout);
    }

    if (stderr) {
      console.error(chalk.yellow(stderr));
    }

  } catch (error: any) {
    if (error.stdout) {
      console.log(error.stdout);
    }
    if (error.stderr) {
      console.error(chalk.red(error.stderr));
    }
    throw new SheetFreakError('CLASP_ERROR', error.message);
  }
}

/**
 * Quick commands for common clasp operations
 */

export async function claspPull(): Promise<void> {
  await claspPassthrough(['pull']);
}

export async function claspPush(): Promise<void> {
  await claspPassthrough(['push']);
}

export async function claspOpen(): Promise<void> {
  await claspPassthrough(['open']);
}

export async function claspLogs(): Promise<void> {
  await claspPassthrough(['logs']);
}

export async function claspStatus(): Promise<void> {
  try {
    // Check if clasp is installed
    const claspInstalled = await isClaspInstalled();

    if (!claspInstalled) {
      console.log(chalk.yellow('✗ clasp is not installed'));
      console.log(chalk.blue('\nTo install clasp:'));
      console.log(chalk.gray('  npm install -g @google/clasp'));
      return;
    }

    console.log(chalk.green('✓ clasp is installed'));

    // Check version
    const { stdout } = await execAsync('clasp --version');
    console.log(chalk.blue('Version:'), stdout.trim());

    // Check if initialized
    if (fs.existsSync('.clasp.json')) {
      console.log(chalk.green('✓ Project is initialized (.clasp.json found)'));

      const config = JSON.parse(fs.readFileSync('.clasp.json', 'utf-8'));
      console.log(chalk.blue('Script ID:'), config.scriptId);
      console.log(chalk.blue('Root Directory:'), config.rootDir || '.');
    } else {
      console.log(chalk.yellow('⚠ Project not initialized'));
      console.log(chalk.gray('  Run: sheetfreak script clasp-init <spreadsheet-id>'));
    }

  } catch (error: any) {
    console.error(chalk.red('✗ Error checking clasp status:'), error.message);
    throw error;
  }
}
