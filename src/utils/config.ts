// Configuration management
import fs from 'fs';
import path from 'path';
import os from 'os';
import { SheetFreakConfig } from '../types/index.js';

const CONFIG_DIR = path.join(os.homedir(), '.sheetfreak');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const CONTEXT_FILE = path.join(CONFIG_DIR, 'context.json');

export class ConfigManager {
  private config: SheetFreakConfig;

  constructor() {
    this.ensureConfigDir();
    this.config = this.loadConfig();
  }

  private ensureConfigDir(): void {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  private loadConfig(): SheetFreakConfig {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return {};
  }

  saveConfig(config: Partial<SheetFreakConfig>): void {
    this.config = { ...this.config, ...config };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }

  getConfig(): SheetFreakConfig {
    return this.config;
  }

  get(key: keyof SheetFreakConfig): any {
    // Check environment variables first
    const envKey = `SHEETFREAK_${key.toUpperCase().replace(/([A-Z])/g, '_$1')}`;
    const envValue = process.env[envKey];
    if (envValue) {
      return envValue;
    }
    return this.config[key];
  }

  set(key: keyof SheetFreakConfig, value: any): void {
    this.saveConfig({ [key]: value });
  }

  getCredentialsPath(): string | undefined {
    return this.get('credentialsPath') || process.env.SHEETFREAK_CREDENTIALS;
  }

  setCredentialsPath(path: string): void {
    this.set('credentialsPath', path);
  }

  // Context management (current working spreadsheet)
  setContext(spreadsheetId: string): void {
    const context = {
      currentSpreadsheet: spreadsheetId,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));
  }

  getContext(): { currentSpreadsheet?: string; lastUpdated?: string } {
    if (fs.existsSync(CONTEXT_FILE)) {
      const data = fs.readFileSync(CONTEXT_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return {};
  }

  getCurrentSpreadsheet(): string | undefined {
    const context = this.getContext();
    return context.currentSpreadsheet || this.get('defaultSpreadsheet');
  }
}

export const configManager = new ConfigManager();
