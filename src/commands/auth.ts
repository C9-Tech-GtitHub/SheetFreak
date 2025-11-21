// Authentication commands
import { ServiceAccountAuth } from '../auth/service-account.js';
import { configManager } from '../utils/config.js';
import chalk from 'chalk';

export async function initAuth(credentialsPath: string): Promise<void> {
  try {
    // Test the credentials
    const auth = new ServiceAccountAuth(credentialsPath);
    await auth.authorize();

    // Get account info
    const info = await auth.getAccountInfo();

    // Save to config
    configManager.setCredentialsPath(credentialsPath);

    console.log(chalk.green('✓ Authentication configured successfully!'));
    console.log(chalk.gray(`  Service Account: ${info.email}`));
    console.log(chalk.gray(`  Credentials saved to: ~/.sheetfreak/config.json`));
  } catch (error: any) {
    console.error(chalk.red('✗ Authentication failed:'), error.message);
    throw error;
  }
}

export async function authStatus(): Promise<void> {
  try {
    const credentialsPath = configManager.getCredentialsPath();

    if (!credentialsPath) {
      console.log(chalk.yellow('⚠ No credentials configured'));
      console.log(chalk.gray('  Run: sheetfreak auth init <path-to-credentials.json>'));
      return;
    }

    const auth = new ServiceAccountAuth(credentialsPath);
    const isConnected = await auth.testConnection();
    const info = await auth.getAccountInfo();

    if (isConnected) {
      console.log(chalk.green('✓ Authentication active'));
      console.log(chalk.gray(`  Service Account: ${info.email}`));
      console.log(chalk.gray(`  Credentials: ${credentialsPath}`));
      console.log(chalk.gray(`  Scopes:`));
      info.scopes.forEach(scope => {
        console.log(chalk.gray(`    - ${scope}`));
      });
    } else {
      console.log(chalk.red('✗ Authentication failed'));
      console.log(chalk.gray('  Check your credentials and try running:'));
      console.log(chalk.gray('  sheetfreak auth init <path-to-credentials.json>'));
    }
  } catch (error: any) {
    console.error(chalk.red('✗ Error:'), error.message);
    throw error;
  }
}
