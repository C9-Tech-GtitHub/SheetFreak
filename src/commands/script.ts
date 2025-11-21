// Apps Script command implementations
import { ServiceAccountAuth } from "../auth/service-account.js";
import { ScriptClient } from "../api/script-client.js";
import { SheetsClient } from "../api/sheets-client.js";
import { configManager } from "../utils/config.js";
import { SheetFreakError } from "../utils/errors.js";
import { ScriptFile } from "../types/index.js";
import chalk from "chalk";
import Table from "cli-table3";
import fs from "fs";
import path from "path";
import {
  listTemplates,
  getTemplate,
  getTemplateSource,
  getConfiguredTemplate,
} from "../templates/template-registry.js";

function getAuthenticatedClients(): {
  script: ScriptClient;
  sheets: SheetsClient;
} {
  const credentialsPath = configManager.getCredentialsPath();
  if (!credentialsPath) {
    throw new SheetFreakError(
      "NOT_CONFIGURED",
      "Authentication not configured. Run: sheetfreak auth init <credentials.json>",
    );
  }

  const auth = new ServiceAccountAuth(credentialsPath);
  return {
    script: new ScriptClient(auth),
    sheets: new SheetsClient(auth),
  };
}

// List all scripts attached to a spreadsheet
export async function listScripts(
  spreadsheetId: string,
  format: string = "table",
): Promise<void> {
  try {
    const { script } = getAuthenticatedClients();
    const scriptInfo = await script.getScriptForSpreadsheet(spreadsheetId);

    if (!scriptInfo) {
      console.log(chalk.yellow("No script attached to this spreadsheet"));
      return;
    }

    const scripts = [scriptInfo];

    if (format === "json") {
      console.log(JSON.stringify({ scripts }, null, 2));
    } else {
      const table = new Table({
        head: ["Script ID", "Title", "Last Modified"],
      });

      scripts.forEach((s) => {
        table.push([
          s.scriptId,
          s.title,
          s.updateTime ? new Date(s.updateTime).toLocaleString() : "N/A",
        ]);
      });

      console.log(table.toString());
    }
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to list scripts:"), error.message);
    throw error;
  }
}

// Create a new Apps Script project attached to a spreadsheet
export async function createScript(
  spreadsheetId: string,
  title: string,
  format: string = "table",
): Promise<void> {
  try {
    const { script } = getAuthenticatedClients();

    const projectInfo = await script.createProject(title, spreadsheetId);

    if (format === "json") {
      console.log(JSON.stringify(projectInfo, null, 2));
    } else {
      console.log(chalk.green("✓ Script project created successfully"));
      console.log(`Script ID: ${projectInfo.scriptId}`);
      console.log(`Title: ${projectInfo.title}`);
      console.log(
        `URL: https://script.google.com/d/${projectInfo.scriptId}/edit`,
      );
    }
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to create script:"), error.message);
    throw error;
  }
}

// Deploy Apps Script code to a spreadsheet
export async function deployScript(
  spreadsheetId: string,
  scriptFile: string,
  options: {
    title?: string;
    description?: string;
    createIfMissing?: boolean;
  } = {},
): Promise<void> {
  try {
    const { script } = getAuthenticatedClients();

    // Check if file exists
    if (!fs.existsSync(scriptFile)) {
      throw new SheetFreakError(
        "INVALID_INPUT",
        `File not found: ${scriptFile}`,
      );
    }

    // Read script source
    const source = fs.readFileSync(scriptFile, "utf-8");
    const fileName =
      path.basename(scriptFile, path.extname(scriptFile)) + ".gs";
    const title =
      options.title || path.basename(scriptFile, path.extname(scriptFile));

    // Get or create script project
    let scriptInfo = await script.getScriptForSpreadsheet(spreadsheetId);

    if (!scriptInfo) {
      if (!options.createIfMissing) {
        throw new SheetFreakError(
          "SCRIPT_NOT_FOUND",
          "No script attached to spreadsheet. Use --create-if-missing to create one",
        );
      }

      console.log(chalk.blue("Creating new script project..."));
      scriptInfo = await script.createProject(title, spreadsheetId);
    }

    // Deploy the code
    console.log(chalk.blue(`Deploying to script: ${scriptInfo.scriptId}`));
    await script.writeFile(scriptInfo.scriptId, fileName, source, "SERVER_JS");

    console.log(chalk.green("✓ Script deployed successfully"));
    console.log(`Script ID: ${scriptInfo.scriptId}`);
    console.log(`File: ${fileName}`);
    console.log(`URL: https://script.google.com/d/${scriptInfo.scriptId}/edit`);
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to deploy script:"), error.message);
    throw error;
  }
}

// Read Apps Script code from a project
export async function readScript(
  scriptId: string,
  fileName?: string,
  options: {
    all?: boolean;
    format?: string;
  } = {},
): Promise<void> {
  try {
    const { script } = getAuthenticatedClients();

    if (options.all) {
      // Read all files
      const files = await script.getContent(scriptId);

      if (options.format === "json") {
        console.log(JSON.stringify({ files }, null, 2));
      } else {
        files.forEach((file) => {
          console.log(chalk.blue(`\n// File: ${file.name} (${file.type})`));
          console.log(file.source);
        });
      }
    } else {
      // Read single file
      const targetFile = fileName || "Code.gs";
      const file = await script.getFile(scriptId, targetFile);

      if (options.format === "json") {
        console.log(JSON.stringify({ file }, null, 2));
      } else {
        console.log(file.source);
      }
    }
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to read script:"), error.message);
    throw error;
  }
}

// Write/update a file in an Apps Script project
export async function writeScriptFile(
  scriptId: string,
  fileName: string,
  sourceFile: string,
  fileType: "SERVER_JS" | "HTML" = "SERVER_JS",
): Promise<void> {
  try {
    const { script } = getAuthenticatedClients();

    // Check if source file exists
    if (!fs.existsSync(sourceFile)) {
      throw new SheetFreakError(
        "INVALID_INPUT",
        `File not found: ${sourceFile}`,
      );
    }

    // Read source
    const source = fs.readFileSync(sourceFile, "utf-8");

    // Write to script project
    await script.writeFile(scriptId, fileName, source, fileType);

    console.log(chalk.green(`✓ File written successfully: ${fileName}`));
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to write script file:"), error.message);
    throw error;
  }
}

// Execute an Apps Script function
export async function runScriptFunction(
  scriptId: string,
  functionName: string,
  args: string[] = [],
  options: {
    devMode?: boolean;
    format?: string;
  } = {},
): Promise<void> {
  try {
    const { script } = getAuthenticatedClients();

    // Parse arguments
    const parameters = args.map((arg) => {
      try {
        return JSON.parse(arg);
      } catch {
        return arg;
      }
    });

    console.log(chalk.blue(`Running function: ${functionName}...`));
    const startTime = Date.now();

    const result = await script.runFunction(
      scriptId,
      functionName,
      parameters,
      options.devMode || false,
    );

    const executionTime = ((Date.now() - startTime) / 1000).toFixed(1);

    if (options.format === "json") {
      console.log(
        JSON.stringify(
          {
            status: "success",
            result: result.response,
            executionTime: `${executionTime}s`,
          },
          null,
          2,
        ),
      );
    } else {
      console.log(
        chalk.green(`✓ Function executed successfully (${executionTime}s)`),
      );
      if (result.response !== undefined) {
        console.log("\nResult:");
        console.log(JSON.stringify(result.response, null, 2));
      }
    }
  } catch (error: any) {
    console.error(chalk.red("✗ Function execution failed:"), error.message);
    throw error;
  }
}

// List all functions in a script
export async function listFunctions(
  scriptId: string,
  format: string = "table",
): Promise<void> {
  try {
    const { script } = getAuthenticatedClients();
    const functions = await script.listFunctions(scriptId);

    if (format === "json") {
      console.log(JSON.stringify({ functions }, null, 2));
    } else {
      if (functions.length === 0) {
        console.log(chalk.yellow("No functions found in script"));
        return;
      }

      console.log(chalk.blue("Available functions:"));
      functions.forEach((func) => {
        console.log(`  - ${func}`);
      });
    }
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to list functions:"), error.message);
    throw error;
  }
}

// Create a new version of the script
export async function createScriptVersion(
  scriptId: string,
  description: string,
): Promise<void> {
  try {
    const { script } = getAuthenticatedClients();

    const versionNumber = await script.createVersion(scriptId, description);

    console.log(chalk.green(`✓ Version created: ${versionNumber}`));
    console.log(`Description: ${description}`);
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to create version:"), error.message);
    throw error;
  }
}

// List all versions of a script
export async function listVersions(
  scriptId: string,
  format: string = "table",
): Promise<void> {
  try {
    const { script } = getAuthenticatedClients();
    const versions = await script.listVersions(scriptId);

    if (format === "json") {
      console.log(JSON.stringify({ versions }, null, 2));
    } else {
      if (versions.length === 0) {
        console.log(chalk.yellow("No versions found"));
        return;
      }

      const table = new Table({
        head: ["Version", "Description", "Created"],
      });

      versions.forEach((v) => {
        table.push([
          v.versionNumber || "N/A",
          v.description || "",
          v.createTime ? new Date(v.createTime).toLocaleString() : "N/A",
        ]);
      });

      console.log(table.toString());
    }
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to list versions:"), error.message);
    throw error;
  }
}

// List all deployments
export async function listDeployments(
  scriptId: string,
  format: string = "table",
): Promise<void> {
  try {
    const { script } = getAuthenticatedClients();
    const deployments = await script.listDeployments(scriptId);

    if (format === "json") {
      console.log(JSON.stringify({ deployments }, null, 2));
    } else {
      if (deployments.length === 0) {
        console.log(chalk.yellow("No deployments found"));
        return;
      }

      const table = new Table({
        head: ["Deployment ID", "Updated"],
      });

      deployments.forEach((d) => {
        table.push([
          d.deploymentId,
          d.updateTime ? new Date(d.updateTime).toLocaleString() : "N/A",
        ]);
      });

      console.log(table.toString());
    }
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to list deployments:"), error.message);
    throw error;
  }
}

// Create a deployment
export async function createDeployment(
  scriptId: string,
  description: string,
  options: {
    version?: number;
  } = {},
): Promise<void> {
  try {
    const { script } = getAuthenticatedClients();

    // If no version specified, create a new version first
    let versionNumber = options.version;
    if (!versionNumber) {
      console.log(chalk.blue("Creating new version..."));
      versionNumber = await script.createVersion(scriptId, description);
    }

    console.log(
      chalk.blue(`Creating deployment for version ${versionNumber}...`),
    );
    const deployment = await script.createDeployment(
      scriptId,
      versionNumber,
      description,
    );

    console.log(chalk.green("✓ Deployment created successfully"));
    console.log(`Deployment ID: ${deployment.deploymentId}`);
    console.log(`Version: ${versionNumber}`);
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to create deployment:"), error.message);
    throw error;
  }
}
