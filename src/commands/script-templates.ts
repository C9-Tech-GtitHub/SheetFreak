// Template management commands for Apps Script
import { ScriptClient } from '../api/script-client.js';
import { ServiceAccountAuth } from '../auth/service-account.js';
import { configManager } from '../utils/config.js';
import { SheetFreakError } from '../utils/errors.js';
import chalk from 'chalk';
import fs from 'fs';
import {
  listTemplates,
  getTemplate,
  getTemplateSource,
  getConfiguredTemplate,
} from '../templates/template-registry.js';

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
 * List all available templates
 */
export async function listTemplateLibrary(format: string = 'table'): Promise<void> {
  try {
    const templates = listTemplates();

    if (format === 'json') {
      console.log(JSON.stringify({ templates }, null, 2));
    } else {
      console.log(chalk.blue('\nAvailable Apps Script Templates:\n'));

      templates.forEach(template => {
        console.log(chalk.bold(`  ${template.name}`));
        console.log(`    ${template.description}`);

        if (template.variables.length > 0) {
          console.log(chalk.gray(`    Variables: ${template.variables.map(v => v.name).join(', ')}`));
        }

        if (template.triggers && template.triggers.length > 0) {
          console.log(chalk.gray(`    Triggers: ${template.triggers.map(t => t.functionName).join(', ')}`));
        }

        console.log('');
      });
    }
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to list templates:'), error.message);
    throw error;
  }
}

/**
 * Show template details and source code
 */
export async function showTemplate(templateName: string): Promise<void> {
  try {
    const template = getTemplate(templateName);
    const source = getTemplateSource(templateName);

    console.log(chalk.blue(`\nTemplate: ${template.title}\n`));
    console.log(`Description: ${template.description}\n`);

    if (template.variables.length > 0) {
      console.log(chalk.bold('Configuration Variables:'));
      template.variables.forEach(v => {
        const required = v.required ? chalk.red('*') : '';
        const defaultVal = v.default ? chalk.gray(` (default: ${v.default})`) : '';
        console.log(`  ${required}${v.name}${defaultVal}`);
        console.log(chalk.gray(`    ${v.description}`));
      });
      console.log('');
    }

    if (template.triggers && template.triggers.length > 0) {
      console.log(chalk.bold('Recommended Triggers:'));
      template.triggers.forEach(t => {
        const triggerType = t.eventType || t.timeBased;
        console.log(`  ${t.functionName} - ${triggerType}`);
      });
      console.log('');
    }

    console.log(chalk.bold('Source Code:'));
    console.log(chalk.gray('─'.repeat(80)));
    console.log(source);
    console.log(chalk.gray('─'.repeat(80)));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to show template:'), error.message);
    throw error;
  }
}

/**
 * Apply a template to a spreadsheet
 */
export async function applyTemplate(
  spreadsheetId: string,
  templateName: string,
  options: {
    config?: string;
    autoTrigger?: boolean;
  } = {}
): Promise<void> {
  try {
    const script = getAuthenticatedScript();
    const template = getTemplate(templateName);

    console.log(chalk.blue(`Applying template: ${template.title}`));

    // Load configuration
    let config: Record<string, string> = {};
    if (options.config) {
      if (!fs.existsSync(options.config)) {
        throw new SheetFreakError('INVALID_INPUT', `Config file not found: ${options.config}`);
      }
      config = JSON.parse(fs.readFileSync(options.config, 'utf-8'));
    }

    // Get configured template source
    const source = getConfiguredTemplate(templateName, config);

    // Get or create script project
    let scriptInfo = await script.getScriptForSpreadsheet(spreadsheetId);

    if (!scriptInfo) {
      console.log(chalk.blue('Creating new script project...'));
      scriptInfo = await script.createProject(template.title, spreadsheetId);
    }

    // Deploy the template
    console.log(chalk.blue(`Deploying template to script: ${scriptInfo.scriptId}`));
    await script.writeFile(scriptInfo.scriptId, 'Code.gs', source, 'SERVER_JS');

    console.log(chalk.green('✓ Template applied successfully'));
    console.log(`Script ID: ${scriptInfo.scriptId}`);
    console.log(`URL: https://script.google.com/d/${scriptInfo.scriptId}/edit`);

    // Show trigger setup instructions
    if (template.triggers && template.triggers.length > 0 && !options.autoTrigger) {
      console.log(chalk.yellow('\nRecommended triggers (run these commands to set up):'));
      template.triggers.forEach(t => {
        if (t.eventType) {
          console.log(
            chalk.gray(
              `  sheetfreak script trigger create ${scriptInfo.scriptId} ${t.functionName} --event ${t.eventType}`
            )
          );
        } else if (t.timeBased) {
          console.log(
            chalk.gray(
              `  sheetfreak script trigger create ${scriptInfo.scriptId} ${t.functionName} --time-based ${t.timeBased}`
            )
          );
        }
      });
    }
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to apply template:'), error.message);
    throw error;
  }
}
