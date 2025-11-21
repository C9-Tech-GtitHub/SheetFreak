#!/usr/bin/env node

import { Command } from "commander";
import { initAuth, authStatus } from "./commands/auth.js";
import {
  createSheet,
  listSheets,
  getSheetInfo,
  copySheet,
  shareSheet,
  setContext,
  getContext,
} from "./commands/sheet.js";
import {
  readData,
  writeData,
  clearData,
  appendData,
  batchWriteData,
} from "./commands/data.js";
import { listTabs, addTab, deleteTab, renameTab } from "./commands/tab.js";

import {
  formatCells,
  applyBorders,
  resizeColumns,
  resizeRows,
  autoResizeColumns,
} from "./commands/format.js";
import {
  takeScreenshot,
  batchScreenshot,
  compareScreenshot,
  inspectSheet,
  captureRange,
} from "./commands/visual.js";
import {
  listScripts,
  createScript,
  deployScript,
  readScript,
  writeScriptFile,
  runScriptFunction,
  listFunctions,
  createScriptVersion,
  listVersions,
  listDeployments,
  createDeployment,
} from "./commands/script.js";
import {
  listTemplateLibrary,
  showTemplate,
  applyTemplate,
} from "./commands/script-templates.js";
import {
  claspInit,
  claspPassthrough,
  claspPull,
  claspPush,
  claspOpen,
  claspLogs,
  claspStatus,
} from "./commands/clasp-integration.js";
import chalk from "chalk";

const program = new Command();

program
  .name("sheetfreak")
  .description(
    "CLI tool for programmatic Google Sheets control, optimized for AI agents",
  )
  .version("0.1.0");

// Authentication commands
const auth = program.command("auth").description("Manage authentication");

auth
  .command("init <credentials-path>")
  .description("Initialize authentication with service account credentials")
  .action(async (credentialsPath: string) => {
    await initAuth(credentialsPath);
  });

auth
  .command("status")
  .description("Check authentication status")
  .action(async () => {
    await authStatus();
  });

// Sheet management commands
const sheet = program.command("sheet").description("Manage spreadsheets");

sheet
  .command("create <name>")
  .description("Create a new spreadsheet")
  .option("--format <format>", "Output format: table, json", "table")
  .action(async (name: string, options: any) => {
    await createSheet(name, options.format);
  });

sheet
  .command("list")
  .description("List all accessible spreadsheets")
  .option("--format <format>", "Output format: table, json", "table")
  .option("--limit <number>", "Maximum number of results", "100")
  .action(async (options: any) => {
    await listSheets(options.format, parseInt(options.limit));
  });

sheet
  .command("info <spreadsheet-id>")
  .description("Get spreadsheet information")
  .option("--format <format>", "Output format: table, json", "table")
  .action(async (spreadsheetId: string, options: any) => {
    await getSheetInfo(spreadsheetId, options.format);
  });

sheet
  .command("copy <spreadsheet-id> <new-name>")
  .description("Copy a spreadsheet (useful for templates)")
  .option("--format <format>", "Output format: table, json", "table")
  .action(async (spreadsheetId: string, newName: string, options: any) => {
    await copySheet(spreadsheetId, newName, options.format);
  });

sheet
  .command("share <spreadsheet-id> <email>")
  .description("Share spreadsheet with a user")
  .option("--role <role>", "Access role: reader, writer, owner", "writer")
  .action(async (spreadsheetId: string, email: string, options: any) => {
    await shareSheet(spreadsheetId, email, options.role);
  });

// Context commands
const context = program
  .command("context")
  .description("Manage current working context");

context
  .command("set <spreadsheet-id>")
  .description("Set current working spreadsheet")
  .action(async (spreadsheetId: string) => {
    await setContext(spreadsheetId);
  });

context
  .command("get")
  .description("Show current context")
  .action(async () => {
    await getContext();
  });

// Data commands
const data = program.command("data").description("Manage data in spreadsheets");

data
  .command("read <spreadsheet-id> <range>")
  .description("Read data from a range")
  .option("--format <format>", "Output format: table, json, csv", "table")
  .action(async (spreadsheetId: string, range: string, options: any) => {
    await readData(spreadsheetId, range, options.format);
  });

data
  .command("write <spreadsheet-id> <range> [value]")
  .description("Write data to a range")
  .option("--json <file>", "Path to JSON file with data")
  .action(
    async (
      spreadsheetId: string,
      range: string,
      value: string | undefined,
      options: any,
    ) => {
      await writeData(spreadsheetId, range, value, options.json);
    },
  );

data
  .command("clear <spreadsheet-id> <range>")
  .description("Clear data in a range")
  .action(async (spreadsheetId: string, range: string) => {
    await clearData(spreadsheetId, range);
  });

data
  .command("append <spreadsheet-id> <range> [value]")
  .description("Append data to a range")
  .option("--json <file>", "Path to JSON file with data")
  .action(
    async (
      spreadsheetId: string,
      range: string,
      value: string | undefined,
      options: any,
    ) => {
      await appendData(spreadsheetId, range, value, options.json);
    },
  );

data
  .command("batch <spreadsheet-id>")
  .description("Batch write multiple ranges from JSON file")
  .requiredOption("--json <file>", "Path to JSON file with batch updates")
  .action(async (spreadsheetId: string, options: any) => {
    await batchWriteData(spreadsheetId, options.json);
  });

// Tab commands
const tab = program
  .command("tab")
  .description("Manage sheets/tabs within a spreadsheet");

tab
  .command("list <spreadsheet-id>")
  .description("List all sheets in a spreadsheet")
  .option("--format <format>", "Output format: table, json", "table")
  .action(async (spreadsheetId: string, options: any) => {
    await listTabs(spreadsheetId, options.format);
  });

tab
  .command("add <spreadsheet-id> <title>")
  .description("Add a new sheet")
  .action(async (spreadsheetId: string, title: string) => {
    await addTab(spreadsheetId, title);
  });

tab
  .command("delete <spreadsheet-id> <title>")
  .description("Delete a sheet")
  .action(async (spreadsheetId: string, title: string) => {
    await deleteTab(spreadsheetId, title);
  });

tab
  .command("rename <spreadsheet-id> <old-title> <new-title>")
  .description("Rename a sheet")
  .action(async (spreadsheetId: string, oldTitle: string, newTitle: string) => {
    await renameTab(spreadsheetId, oldTitle, newTitle);
  });

// Format commands
const format = program
  .command("format")
  .description("Format cells, apply styling, and resize columns/rows");

format
  .command("cells <spreadsheet-id> <range>")
  .description("Apply formatting to cells in a range")
  .option("--bg-color <color>", "Background color (hex #RRGGBB or named color)")
  .option("--text-color <color>", "Text color (hex #RRGGBB or named color)")
  .option("--bold", "Make text bold")
  .option("--italic", "Make text italic")
  .option("--underline", "Underline text")
  .option("--strikethrough", "Strikethrough text")
  .option("--font-size <size>", "Font size in points", parseInt)
  .option(
    "--font-family <family>",
    "Font family (e.g., Arial, Times New Roman)",
  )
  .option("--align <alignment>", "Horizontal alignment: LEFT, CENTER, RIGHT")
  .option("--valign <alignment>", "Vertical alignment: TOP, MIDDLE, BOTTOM")
  .option("--wrap <strategy>", "Text wrapping: OVERFLOW_CELL, WRAP, CLIP")
  .option("--json <file>", "Load format from JSON file")
  .action(async (spreadsheetId: string, range: string, options: any) => {
    await formatCells(spreadsheetId, range, options);
  });

format
  .command("borders <spreadsheet-id> <range>")
  .description("Apply borders to a range")
  .option("--all", "Apply to all borders")
  .option("--top", "Apply to top border")
  .option("--bottom", "Apply to bottom border")
  .option("--left", "Apply to left border")
  .option("--right", "Apply to right border")
  .option(
    "--style <style>",
    "Border style: DOTTED, DASHED, SOLID, SOLID_MEDIUM, SOLID_THICK, DOUBLE",
    "SOLID",
  )
  .option(
    "--color <color>",
    "Border color (hex #RRGGBB or named color)",
    "black",
  )
  .option("--json <file>", "Load border config from JSON file")
  .action(async (spreadsheetId: string, range: string, options: any) => {
    await applyBorders(spreadsheetId, range, options);
  });

format
  .command(
    "resize-columns <spreadsheet-id> <sheet-title> <start-col> <end-col> <pixel-size>",
  )
  .description("Resize columns to a specific pixel width")
  .action(
    async (
      spreadsheetId: string,
      sheetTitle: string,
      startCol: string,
      endCol: string,
      pixelSize: string,
    ) => {
      await resizeColumns(
        spreadsheetId,
        sheetTitle,
        parseInt(startCol),
        parseInt(endCol),
        parseInt(pixelSize),
      );
    },
  );

format
  .command(
    "resize-rows <spreadsheet-id> <sheet-title> <start-row> <end-row> <pixel-size>",
  )
  .description("Resize rows to a specific pixel height")
  .action(
    async (
      spreadsheetId: string,
      sheetTitle: string,
      startRow: string,
      endRow: string,
      pixelSize: string,
    ) => {
      await resizeRows(
        spreadsheetId,
        sheetTitle,
        parseInt(startRow),
        parseInt(endRow),
        parseInt(pixelSize),
      );
    },
  );

format
  .command(
    "auto-resize-columns <spreadsheet-id> <sheet-title> <start-col> <end-col>",
  )
  .description("Auto-resize columns to fit content")
  .action(
    async (
      spreadsheetId: string,
      sheetTitle: string,
      startCol: string,
      endCol: string,
    ) => {
      await autoResizeColumns(
        spreadsheetId,
        sheetTitle,
        parseInt(startCol),
        parseInt(endCol),
      );
    },
  );

// Visual commands (screenshots and design inspection)
const visual = program
  .command("visual")
  .description("Visual design tools - screenshots and inspection");

visual
  .command("screenshot <spreadsheet-id>")
  .description("Take a screenshot of a Google Sheet")
  .option("--output <path>", "Output file path", `screenshot-${Date.now()}.png`)
  .option("--full-page", "Capture full page (scrolls)")
  .option("--width <pixels>", "Viewport width", "1920")
  .option("--height <pixels>", "Viewport height", "1080")
  .option("--range <range>", "Focus on specific range (e.g., A1:D10)")
  .option("--format <format>", "Image format: png, jpeg", "png")
  .option("--quality <number>", "JPEG quality (1-100)", "90")
  .option("--hide <selectors>", "CSS selectors to hide (comma-separated)")
  .action(async (spreadsheetId: string, options: any) => {
    await takeScreenshot(spreadsheetId, {
      output: options.output,
      fullPage: options.fullPage,
      width: parseInt(options.width),
      height: parseInt(options.height),
      range: options.range,
      format: options.format,
      quality: parseInt(options.quality),
    });
  });

visual
  .command("batch <spreadsheet-id>")
  .description("Take multiple screenshots from a JSON configuration")
  .requiredOption("--json <file>", "Path to JSON configuration file")
  .action(async (spreadsheetId: string, options: any) => {
    await batchScreenshot(spreadsheetId, options.json);
  });

visual
  .command("compare <spreadsheet-id> <baseline-image>")
  .description("Compare current sheet with a baseline screenshot")
  .option("--output <path>", "Output file for current screenshot")
  .option("--range <range>", "Focus on specific range")
  .action(
    async (spreadsheetId: string, baselineImage: string, options: any) => {
      await compareScreenshot(spreadsheetId, baselineImage, {
        output: options.output,
        range: options.range,
      });
    },
  );

visual
  .command("inspect <spreadsheet-id>")
  .description("Open sheet in browser for interactive design inspection")
  .action(async (spreadsheetId: string) => {
    await inspectSheet(spreadsheetId);
  });

visual
  .command("capture-range <spreadsheet-id> <range> <output>")
  .description("Capture a specific range as an image")
  .action(async (spreadsheetId: string, range: string, output: string) => {
    await captureRange(spreadsheetId, range, output);
  });

// Apps Script commands
const script = program
  .command("script")
  .description("Manage Google Apps Script projects and automation");

script
  .command("list <spreadsheet-id>")
  .description("List scripts attached to a spreadsheet")
  .option("--format <format>", "Output format: table, json", "table")
  .action(async (spreadsheetId: string, options: any) => {
    await listScripts(spreadsheetId, options.format);
  });

script
  .command("create <spreadsheet-id> <title>")
  .description("Create a new Apps Script project")
  .option("--format <format>", "Output format: table, json", "table")
  .action(async (spreadsheetId: string, title: string, options: any) => {
    await createScript(spreadsheetId, title, options.format);
  });

script
  .command("deploy <spreadsheet-id> <script-file>")
  .description("Deploy Apps Script code to a spreadsheet")
  .option("--title <name>", "Script project title")
  .option("--description <text>", "Script description")
  .option("--create-if-missing", "Create script project if none exists")
  .action(async (spreadsheetId: string, scriptFile: string, options: any) => {
    await deployScript(spreadsheetId, scriptFile, {
      title: options.title,
      description: options.description,
      createIfMissing: options.createIfMissing,
    });
  });

script
  .command("read <script-id> [file-name]")
  .description("Read Apps Script code from a project")
  .option("--all", "Read all files in the project")
  .option("--format <format>", "Output format: code, json", "code")
  .action(
    async (scriptId: string, fileName: string | undefined, options: any) => {
      await readScript(scriptId, fileName, {
        all: options.all,
        format: options.format,
      });
    },
  );

script
  .command("write <script-id> <file-name> <source-file>")
  .description("Write/update a file in an Apps Script project")
  .option("--type <type>", "File type: SERVER_JS, HTML", "SERVER_JS")
  .action(
    async (
      scriptId: string,
      fileName: string,
      sourceFile: string,
      options: any,
    ) => {
      await writeScriptFile(scriptId, fileName, sourceFile, options.type);
    },
  );

script
  .command("run <script-id> <function-name> [args...]")
  .description("Execute an Apps Script function")
  .option("--dev-mode", "Run in development mode")
  .option("--format <format>", "Output format: json, text", "json")
  .action(
    async (
      scriptId: string,
      functionName: string,
      args: string[],
      options: any,
    ) => {
      await runScriptFunction(scriptId, functionName, args, {
        devMode: options.devMode,
        format: options.format,
      });
    },
  );

script
  .command("functions <script-id>")
  .description("List all functions in a script")
  .option("--format <format>", "Output format: table, json", "table")
  .action(async (scriptId: string, options: any) => {
    await listFunctions(scriptId, options.format);
  });

script
  .command("version-create <script-id> <description>")
  .description("Create a new version of the script")
  .action(async (scriptId: string, description: string) => {
    await createScriptVersion(scriptId, description);
  });

script
  .command("versions <script-id>")
  .description("List all versions of a script")
  .option("--format <format>", "Output format: table, json", "table")
  .action(async (scriptId: string, options: any) => {
    await listVersions(scriptId, options.format);
  });

script
  .command("deployments <script-id>")
  .description("List all deployments")
  .option("--format <format>", "Output format: table, json", "table")
  .action(async (scriptId: string, options: any) => {
    await listDeployments(scriptId, options.format);
  });

script
  .command("deployment-create <script-id> <description>")
  .description("Create a new deployment")
  .option(
    "--version <number>",
    "Version number (creates new if not specified)",
    parseInt,
  )
  .action(async (scriptId: string, description: string, options: any) => {
    await createDeployment(scriptId, description, {
      version: options.version,
    });
  });

script
  .command("template-list")
  .description("List all available Apps Script templates")
  .option("--format <format>", "Output format: table, json", "table")
  .action(async (options: any) => {
    await listTemplateLibrary(options.format);
  });

script
  .command("template-show <template-name>")
  .description("Show template details and source code")
  .action(async (templateName: string) => {
    await showTemplate(templateName);
  });

script
  .command("template-apply <spreadsheet-id> <template-name>")
  .description("Apply a template to a spreadsheet")
  .option("--config <file>", "Path to JSON configuration file")
  .option("--auto-trigger", "Automatically create recommended triggers")
  .action(async (spreadsheetId: string, templateName: string, options: any) => {
    await applyTemplate(spreadsheetId, templateName, {
      config: options.config,
      autoTrigger: options.autoTrigger,
    });
  });

script
  .command("clasp-init <spreadsheet-id>")
  .description("Initialize clasp for local Apps Script development")
  .action(async (spreadsheetId: string) => {
    await claspInit(spreadsheetId);
  });

script
  .command("clasp-status")
  .description("Check clasp installation and configuration status")
  .action(async () => {
    await claspStatus();
  });

script
  .command("clasp-pull")
  .description("Pull script files from Google (shortcut for clasp pull)")
  .action(async () => {
    await claspPull();
  });

script
  .command("clasp-push")
  .description("Push local changes to Google (shortcut for clasp push)")
  .action(async () => {
    await claspPush();
  });

script
  .command("clasp-open")
  .description("Open script in browser (shortcut for clasp open)")
  .action(async () => {
    await claspOpen();
  });

script
  .command("clasp-logs")
  .description("View script execution logs (shortcut for clasp logs)")
  .action(async () => {
    await claspLogs();
  });

script
  .command("clasp <args...>")
  .description("Pass-through to clasp CLI for advanced operations")
  .allowUnknownOption()
  .action(async (args: string[]) => {
    await claspPassthrough(args);
  });

// Global error handler
program.hook("postAction", async (thisCommand, actionCommand) => {
  // This runs after each command
});

// Parse arguments and execute
program.parseAsync(process.argv).catch((error) => {
  console.error(chalk.red("Error:"), error.message);
  if (process.env.SHEETFREAK_VERBOSE_ERRORS === "true") {
    console.error(error);
  }
  process.exit(1);
});
