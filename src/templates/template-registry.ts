// Apps Script template registry and management
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SheetFreakError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Template {
  name: string;
  title: string;
  description: string;
  file: string;
  variables: TemplateVariable[];
  triggers?: TriggerConfig[];
}

export interface TemplateVariable {
  name: string;
  description: string;
  default?: string;
  required?: boolean;
}

export interface TriggerConfig {
  functionName: string;
  eventType?: 'ON_OPEN' | 'ON_EDIT' | 'ON_CHANGE' | 'ON_FORM_SUBMIT';
  timeBased?: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

// Template registry
const TEMPLATES: Template[] = [
  {
    name: 'auto-refresh',
    title: 'Auto-Refresh Data',
    description: 'Automatically refresh data from an external API on a schedule',
    file: 'auto-refresh.gs',
    variables: [
      {
        name: 'API_URL',
        description: 'The URL of your API endpoint',
        required: true,
      },
      {
        name: 'TARGET_RANGE',
        description: 'The range where data should be written (e.g., Data!A1)',
        default: 'Data!A1',
        required: true,
      },
      {
        name: 'API_KEY',
        description: 'Optional API key for authentication',
        required: false,
      },
    ],
    triggers: [
      {
        functionName: 'refreshData',
        timeBased: 'HOURLY',
      },
    ],
  },
  {
    name: 'custom-menu',
    title: 'Custom Menu',
    description: 'Add a custom menu with actions to your spreadsheet',
    file: 'custom-menu.gs',
    variables: [],
    triggers: [
      {
        functionName: 'onOpen',
        eventType: 'ON_OPEN',
      },
    ],
  },
  {
    name: 'on-edit-validator',
    title: 'Data Validator',
    description: 'Validate and format data automatically when cells are edited',
    file: 'on-edit-validator.gs',
    variables: [],
    triggers: [
      {
        functionName: 'onEdit',
        eventType: 'ON_EDIT',
      },
    ],
  },
];

/**
 * Get all available templates
 */
export function listTemplates(): Template[] {
  return TEMPLATES;
}

/**
 * Get a specific template by name
 */
export function getTemplate(name: string): Template {
  const template = TEMPLATES.find(t => t.name === name);

  if (!template) {
    throw new SheetFreakError(
      'TEMPLATE_NOT_FOUND',
      `Template '${name}' not found. Available templates: ${TEMPLATES.map(t => t.name).join(', ')}`
    );
  }

  return template;
}

/**
 * Get template source code
 */
export function getTemplateSource(name: string): string {
  const template = getTemplate(name);
  const templatePath = path.join(__dirname, template.file);

  if (!fs.existsSync(templatePath)) {
    throw new SheetFreakError(
      'TEMPLATE_NOT_FOUND',
      `Template file not found: ${template.file}`
    );
  }

  return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Apply variable substitution to template source
 */
export function applyTemplateVariables(
  source: string,
  variables: Record<string, string>
): string {
  let result = source;

  // Replace variable placeholders
  Object.entries(variables).forEach(([key, value]) => {
    // Replace in CONFIG object
    const configRegex = new RegExp(`(${key}:\\s*['"])([^'"]*)(["'])`, 'g');
    result = result.replace(configRegex, `$1${value}$3`);

    // Replace standalone references
    const standaloneRegex = new RegExp(`\\b${key}\\b(?=\\s*=)`, 'g');
    result = result.replace(standaloneRegex, key);
  });

  return result;
}

/**
 * Validate template configuration
 */
export function validateTemplateConfig(
  template: Template,
  config: Record<string, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required variables
  template.variables.forEach(variable => {
    if (variable.required && !config[variable.name]) {
      errors.push(`Required variable '${variable.name}' is missing`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get template with applied configuration
 */
export function getConfiguredTemplate(
  name: string,
  config: Record<string, string>
): string {
  const template = getTemplate(name);
  let source = getTemplateSource(name);

  // Validate configuration
  const validation = validateTemplateConfig(template, config);
  if (!validation.valid) {
    throw new SheetFreakError(
      'INVALID_TEMPLATE_CONFIG',
      `Template configuration errors:\n${validation.errors.join('\n')}`
    );
  }

  // Apply defaults for missing optional variables
  const fullConfig = { ...config };
  template.variables.forEach(variable => {
    if (!fullConfig[variable.name] && variable.default) {
      fullConfig[variable.name] = variable.default;
    }
  });

  // Apply variables
  source = applyTemplateVariables(source, fullConfig);

  return source;
}
