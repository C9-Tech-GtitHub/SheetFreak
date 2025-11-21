import chalk from "chalk";
import { SheetFreakError } from "../utils/errors.js";

interface ScreenshotOptions {
  output?: string;
  fullPage?: boolean;
  width?: number;
  height?: number;
  range?: string;
  format?: "png" | "jpeg";
  quality?: number;
}

/**
 * Visual commands are now delegated to the visual-design-agent which uses Playwright MCP.
 * These CLI commands exist for documentation purposes but should not be used directly.
 * Instead, use the visual-design-agent with Playwright MCP tools.
 */

/**
 * Take a screenshot of a Google Sheet
 *
 * NOTE: This command is deprecated. Use visual-design-agent with Playwright MCP instead:
 *
 * Example:
 *   mcp__playwright__browser_navigate({ url: "https://docs.google.com/spreadsheets/d/ID/edit" });
 *   mcp__playwright__browser_take_screenshot({ filename: "output.png", fullPage: true });
 *   mcp__playwright__browser_close();
 */
export async function takeScreenshot(
  spreadsheetId: string,
  options: ScreenshotOptions,
): Promise<void> {
  const { output = `screenshot-${spreadsheetId}-${Date.now()}.png` } = options;

  console.log(chalk.yellow("⚠ This command is deprecated"));
  console.log(
    chalk.gray("\nUse visual-design-agent with Playwright MCP instead:"),
  );
  console.log(chalk.cyan(`\nmcp__playwright__browser_navigate({`));
  console.log(
    chalk.cyan(
      `  url: "https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit"`,
    ),
  );
  console.log(chalk.cyan(`});`));
  console.log(chalk.cyan(`mcp__playwright__browser_take_screenshot({`));
  console.log(chalk.cyan(`  filename: "${output}",`));
  console.log(chalk.cyan(`  fullPage: ${options.fullPage || false}`));
  console.log(chalk.cyan(`});`));
  console.log(chalk.cyan(`mcp__playwright__browser_close();`));

  throw new SheetFreakError(
    "DEPRECATED_COMMAND",
    "Use visual-design-agent with Playwright MCP tools instead",
  );
}

/**
 * Take multiple screenshots of different ranges or configurations
 *
 * NOTE: This command is deprecated. Use visual-design-agent with Playwright MCP instead.
 */
export async function batchScreenshot(
  spreadsheetId: string,
  configPath: string,
): Promise<void> {
  console.log(chalk.yellow("⚠ This command is deprecated"));
  console.log(
    chalk.gray("\nUse visual-design-agent with Playwright MCP instead."),
  );

  throw new SheetFreakError(
    "DEPRECATED_COMMAND",
    "Use visual-design-agent with Playwright MCP tools instead",
  );
}

/**
 * Take a screenshot and compare with a previous version
 *
 * NOTE: This command is deprecated. Use visual-design-agent with Playwright MCP instead.
 */
export async function compareScreenshot(
  spreadsheetId: string,
  baselineImage: string,
  options: ScreenshotOptions,
): Promise<void> {
  console.log(chalk.yellow("⚠ This command is deprecated"));
  console.log(
    chalk.gray("\nUse visual-design-agent with Playwright MCP instead."),
  );

  throw new SheetFreakError(
    "DEPRECATED_COMMAND",
    "Use visual-design-agent with Playwright MCP tools instead",
  );
}

/**
 * Interactive design mode - opens browser for manual inspection
 *
 * NOTE: This command is deprecated. Use visual-design-agent with Playwright MCP instead.
 */
export async function inspectSheet(spreadsheetId: string): Promise<void> {
  console.log(chalk.yellow("⚠ This command is deprecated"));
  console.log(
    chalk.gray("\nUse visual-design-agent with Playwright MCP instead."),
  );

  throw new SheetFreakError(
    "DEPRECATED_COMMAND",
    "Use visual-design-agent with Playwright MCP tools instead",
  );
}

/**
 * Capture a specific element or range as an image
 *
 * NOTE: This command is deprecated. Use visual-design-agent with Playwright MCP instead.
 */
export async function captureRange(
  spreadsheetId: string,
  range: string,
  output: string,
): Promise<void> {
  console.log(chalk.yellow("⚠ This command is deprecated"));
  console.log(
    chalk.gray("\nUse visual-design-agent with Playwright MCP instead."),
  );

  throw new SheetFreakError(
    "DEPRECATED_COMMAND",
    "Use visual-design-agent with Playwright MCP tools instead",
  );
}
