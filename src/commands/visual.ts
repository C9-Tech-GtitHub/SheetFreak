import { chromium, Browser, Page } from "playwright";
import chalk from "chalk";
import ora from "ora";
import path from "path";
import fs from "fs/promises";
import { SheetFreakError } from "../utils/errors.js";

interface ScreenshotOptions {
  output?: string;
  fullPage?: boolean;
  width?: number;
  height?: number;
  range?: string;
  hiddenElements?: string[];
  format?: "png" | "jpeg";
  quality?: number;
}

/**
 * Launch browser and navigate to Google Sheets with authentication
 */
async function launchBrowserWithAuth(
  spreadsheetId: string,
): Promise<{ browser: Browser; page: Page }> {
  const spinner = ora("Launching browser...").start();

  try {
    // Launch browser in headless mode
    const browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    spinner.text = "Navigating to Google Sheets...";

    // Navigate to the spreadsheet
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    await page.goto(url, { waitUntil: "networkidle" });

    spinner.succeed("Browser ready");

    return { browser, page };
  } catch (error) {
    spinner.fail("Failed to launch browser");
    throw new SheetFreakError(
      `Browser launch failed: ${error instanceof Error ? error.message : String(error)}`,
      "BROWSER_ERROR",
    );
  }
}

/**
 * Take a screenshot of a Google Sheet
 */
export async function takeScreenshot(
  spreadsheetId: string,
  options: ScreenshotOptions,
): Promise<void> {
  const {
    output = `screenshot-${spreadsheetId}-${Date.now()}.png`,
    fullPage = false,
    width = 1920,
    height = 1080,
    range,
    hiddenElements = [],
    format = "png",
    quality = 90,
  } = options;

  let browser: Browser | null = null;

  try {
    const spinner = ora("Preparing screenshot...").start();

    // Launch browser and navigate
    const { browser: br, page } = await launchBrowserWithAuth(spreadsheetId);
    browser = br;

    // Set viewport size if specified
    if (width || height) {
      await page.setViewportSize({ width, height });
    }

    // Wait for the sheet to fully load
    spinner.text = "Waiting for sheet to load...";
    try {
      await page.waitForSelector('[role="grid"]', { timeout: 30000 });
    } catch (timeoutError) {
      // Check if we're on a login page
      const url = page.url();
      if (url.includes("accounts.google.com")) {
        spinner.fail("Authentication required");
        console.log(chalk.yellow("\nThe sheet requires authentication."));
        console.log(chalk.gray("Options:"));
        console.log(
          chalk.gray(
            "  1. Make the sheet publicly viewable (Anyone with the link can view)",
          ),
        );
        console.log(
          chalk.gray(
            "  2. Use the 'inspect' command to log in interactively first",
          ),
        );
        console.log(
          chalk.gray("  3. Share the sheet with your service account"),
        );
        throw new SheetFreakError(
          "Sheet requires authentication",
          "AUTH_REQUIRED",
        );
      }
      throw timeoutError;
    }

    // Give extra time for rendering
    await page.waitForTimeout(2000);

    // Hide specified elements (e.g., menus, toolbars)
    if (hiddenElements.length > 0) {
      spinner.text = "Hiding UI elements...";
      for (const selector of hiddenElements) {
        await page.addStyleTag({
          content: `${selector} { display: none !important; }`,
        });
      }
    }

    // If range is specified, try to focus on that range
    if (range) {
      spinner.text = `Focusing on range ${range}...`;
      // This is a simplified approach - Google Sheets URL supports range parameter
      const urlWithRange = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0&range=${range}`;
      await page.goto(urlWithRange, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
    }

    // Ensure output directory exists
    const outputPath = path.resolve(output);
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Take screenshot
    spinner.text = "Capturing screenshot...";
    const screenshotOptions: any = {
      path: outputPath,
      fullPage,
      type: format,
    };

    if (format === "jpeg") {
      screenshotOptions.quality = quality;
    }

    await page.screenshot(screenshotOptions);

    spinner.succeed(`Screenshot saved to ${chalk.cyan(outputPath)}`);

    console.log(chalk.gray(`  Size: ${width}x${height}`));
    console.log(chalk.gray(`  Format: ${format}`));
    if (range) {
      console.log(chalk.gray(`  Range: ${range}`));
    }
  } catch (error) {
    throw new SheetFreakError(
      `Screenshot failed: ${error instanceof Error ? error.message : String(error)}`,
      "SCREENSHOT_ERROR",
    );
  } finally {
    // Always close browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Take multiple screenshots of different ranges or configurations
 */
export async function batchScreenshot(
  spreadsheetId: string,
  configPath: string,
): Promise<void> {
  const spinner = ora("Loading screenshot configuration...").start();

  try {
    // Read config file
    const configContent = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configContent);

    if (!Array.isArray(config.screenshots)) {
      throw new SheetFreakError(
        'Config must contain "screenshots" array',
        "INVALID_CONFIG",
      );
    }

    spinner.succeed(`Loaded ${config.screenshots.length} screenshot(s)`);

    // Process each screenshot
    for (let i = 0; i < config.screenshots.length; i++) {
      const screenshotConfig = config.screenshots[i];
      console.log(
        chalk.blue(
          `\n[${i + 1}/${config.screenshots.length}] ${screenshotConfig.name || `Screenshot ${i + 1}`}`,
        ),
      );

      await takeScreenshot(spreadsheetId, screenshotConfig);
    }

    console.log(
      chalk.green(`\n✓ Completed ${config.screenshots.length} screenshot(s)`),
    );
  } catch (error) {
    spinner.fail("Batch screenshot failed");
    throw error;
  }
}

/**
 * Take a screenshot and compare with a previous version
 */
export async function compareScreenshot(
  spreadsheetId: string,
  baselineImage: string,
  options: ScreenshotOptions,
): Promise<void> {
  const tempOutput = `temp-screenshot-${Date.now()}.png`;

  try {
    // Take current screenshot
    await takeScreenshot(spreadsheetId, {
      ...options,
      output: tempOutput,
    });

    const spinner = ora("Comparing screenshots...").start();

    // Read both images
    const baseline = await fs.readFile(baselineImage);
    const current = await fs.readFile(tempOutput);

    // Simple comparison (you could use pixelmatch or other libraries for pixel-diff)
    const isDifferent = !baseline.equals(current);

    if (isDifferent) {
      spinner.warn("Screenshots differ!");
      console.log(chalk.yellow(`  Baseline: ${baselineImage}`));
      console.log(chalk.yellow(`  Current: ${tempOutput}`));
      console.log(
        chalk.gray(
          "\n  Tip: Use an image diff tool to see the differences visually",
        ),
      );
    } else {
      spinner.succeed("Screenshots are identical");
      // Clean up temp file if identical
      await fs.unlink(tempOutput);
    }
  } catch (error) {
    // Clean up temp file on error
    try {
      await fs.unlink(tempOutput);
    } catch {}

    throw new SheetFreakError(
      `Screenshot comparison failed: ${error instanceof Error ? error.message : String(error)}`,
      "COMPARISON_ERROR",
    );
  }
}

/**
 * Interactive design mode - opens browser for manual inspection
 */
export async function inspectSheet(spreadsheetId: string): Promise<void> {
  console.log(chalk.blue("Opening sheet in interactive mode..."));
  console.log(chalk.gray("Press Ctrl+C to close the browser\n"));

  let browser: Browser | null = null;

  try {
    // Launch in non-headless mode for interaction
    browser = await chromium.launch({
      headless: false,
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    // Navigate to the spreadsheet
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    await page.goto(url, { waitUntil: "networkidle" });

    console.log(chalk.green("✓ Browser opened"));
    console.log(
      chalk.gray(
        "  You can now inspect the sheet visually and test design changes",
      ),
    );
    console.log(chalk.gray("  Press Ctrl+C in this terminal when done\n"));

    // Wait for user to close (or Ctrl+C)
    await new Promise<void>((resolve) => {
      process.on("SIGINT", () => {
        console.log(chalk.yellow("\n\nClosing browser..."));
        resolve();
      });

      // Also resolve if browser is closed manually
      browser!.on("disconnected", () => {
        resolve();
      });
    });
  } catch (error) {
    throw new SheetFreakError(
      `Sheet inspection failed: ${error instanceof Error ? error.message : String(error)}`,
      "INSPECT_ERROR",
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Capture a specific element or range as an image
 */
export async function captureRange(
  spreadsheetId: string,
  range: string,
  output: string,
): Promise<void> {
  let browser: Browser | null = null;

  try {
    const spinner = ora(`Capturing range ${range}...`).start();

    const { browser: br, page } = await launchBrowserWithAuth(spreadsheetId);
    browser = br;

    // Navigate to specific range
    const urlWithRange = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0&range=${range}`;
    await page.goto(urlWithRange, { waitUntil: "networkidle" });
    await page.waitForSelector('[role="grid"]', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Try to find and capture the specific range
    // Note: This is a simplified approach - Google Sheets has complex DOM structure
    const gridElement = await page.$('[role="grid"]');

    if (gridElement) {
      const outputPath = path.resolve(output);
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      await gridElement.screenshot({ path: outputPath });

      spinner.succeed(`Range ${range} captured to ${chalk.cyan(outputPath)}`);
    } else {
      spinner.fail("Could not locate range in sheet");
    }
  } catch (error) {
    throw new SheetFreakError(
      `Range capture failed: ${error instanceof Error ? error.message : String(error)}`,
      "CAPTURE_ERROR",
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
