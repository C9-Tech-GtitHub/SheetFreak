// Google Apps Script API client wrapper
import { script_v1 } from "googleapis";
import { ServiceAccountAuth } from "../auth/service-account.js";
import { handleGoogleAPIError, SheetFreakError } from "../utils/errors.js";
import {
  ScriptProjectInfo,
  ScriptFile,
  ScriptDeployment,
  ScriptExecutionResult,
  TriggerInfo,
} from "../types/index.js";

export class ScriptClient {
  private script: script_v1.Script;

  constructor(private auth: ServiceAccountAuth) {
    this.script = auth.getScriptAPI();
  }

  // Create a new Apps Script project
  async createProject(
    title: string,
    parentId?: string,
  ): Promise<ScriptProjectInfo> {
    try {
      const response = await this.script.projects.create({
        requestBody: {
          title,
          parentId,
        },
      });

      return {
        scriptId: response.data.scriptId || "",
        title: response.data.title || title,
        createTime: response.data.createTime || undefined,
        updateTime: response.data.updateTime || undefined,
        parentId: response.data.parentId || undefined,
      };
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Get project metadata
  async getProject(scriptId: string): Promise<ScriptProjectInfo> {
    try {
      const response = await this.script.projects.get({
        scriptId,
      });

      return {
        scriptId: response.data.scriptId || scriptId,
        title: response.data.title || "",
        createTime: response.data.createTime || undefined,
        updateTime: response.data.updateTime || undefined,
        parentId: response.data.parentId || undefined,
      };
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Get project content (all files)
  async getContent(scriptId: string): Promise<ScriptFile[]> {
    try {
      const response = await this.script.projects.getContent({
        scriptId,
      });

      return (response.data.files || []).map((file) => ({
        name: file.name || "",
        type: (file.type as "SERVER_JS" | "HTML" | "JSON") || "SERVER_JS",
        source: file.source || "",
        functionSet: file.functionSet
          ? {
              values: file.functionSet.values?.map((f) => ({
                name: f.name || "",
              })),
            }
          : undefined,
      }));
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Update project content
  async updateContent(scriptId: string, files: ScriptFile[]): Promise<void> {
    try {
      await this.script.projects.updateContent({
        scriptId,
        requestBody: {
          files: files.map((file) => ({
            name: file.name,
            type: file.type,
            source: file.source,
          })),
        },
      });
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Get a specific file from project
  async getFile(scriptId: string, fileName: string): Promise<ScriptFile> {
    try {
      const files = await this.getContent(scriptId);
      const file = files.find((f) => f.name === fileName);

      if (!file) {
        throw SheetFreakError.notFound("Script file", fileName);
      }

      return file;
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Write/update a single file in project
  async writeFile(
    scriptId: string,
    fileName: string,
    source: string,
    type: "SERVER_JS" | "HTML" | "JSON" = "SERVER_JS",
  ): Promise<void> {
    try {
      // Get current content
      const files = await this.getContent(scriptId);

      // Find and update existing file or add new one
      const existingFileIndex = files.findIndex((f) => f.name === fileName);

      if (existingFileIndex >= 0) {
        files[existingFileIndex].source = source;
        files[existingFileIndex].type = type;
      } else {
        files.push({ name: fileName, type, source });
      }

      // Update project content
      await this.updateContent(scriptId, files);
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Execute a function in the script
  async runFunction(
    scriptId: string,
    functionName: string,
    parameters: any[] = [],
    devMode: boolean = false,
  ): Promise<ScriptExecutionResult> {
    try {
      const response = await this.script.scripts.run({
        scriptId,
        requestBody: {
          function: functionName,
          parameters,
          devMode,
        },
      });

      return {
        response: response.data.response?.result,
        done: response.data.done || false,
      };
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Create a deployment
  async createDeployment(
    scriptId: string,
    versionNumber: number,
    description: string,
  ): Promise<ScriptDeployment> {
    try {
      const response = await this.script.projects.deployments.create({
        scriptId,
        requestBody: {
          versionNumber,
          manifestFileName: "appsscript",
          description,
        },
      });

      return {
        deploymentId: response.data.deploymentId || "",
        deploymentConfig: response.data.deploymentConfig,
        updateTime: response.data.updateTime || undefined,
      };
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // List all deployments
  async listDeployments(scriptId: string): Promise<ScriptDeployment[]> {
    try {
      const response = await this.script.projects.deployments.list({
        scriptId,
      });

      return (response.data.deployments || []).map((deployment) => ({
        deploymentId: deployment.deploymentId || "",
        deploymentConfig: deployment.deploymentConfig,
        updateTime: deployment.updateTime || undefined,
      }));
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Create a new version
  async createVersion(scriptId: string, description: string): Promise<number> {
    try {
      const response = await this.script.projects.versions.create({
        scriptId,
        requestBody: {
          description,
        },
      });

      return response.data.versionNumber || 1;
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // List all versions
  async listVersions(scriptId: string): Promise<any[]> {
    try {
      const response = await this.script.projects.versions.list({
        scriptId,
      });

      return response.data.versions || [];
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Get script metadata for a spreadsheet
  async getScriptForSpreadsheet(
    spreadsheetId: string,
  ): Promise<ScriptProjectInfo | null> {
    try {
      // Get spreadsheet bound script using Drive API
      const authClient = await this.auth.getAuthClient();
      const drive = this.auth.getDriveAPI();

      const response = await drive.files.list({
        q: `'${spreadsheetId}' in parents and mimeType='application/vnd.google-apps.script'`,
        fields: "files(id, name, createdTime, modifiedTime)",
        auth: authClient,
      });

      const scriptFile = response.data.files?.[0];
      if (!scriptFile) {
        return null;
      }

      return {
        scriptId: scriptFile.id || "",
        title: scriptFile.name || "",
        createTime: scriptFile.createdTime || undefined,
        updateTime: scriptFile.modifiedTime || undefined,
        parentId: spreadsheetId,
      };
    } catch (error: any) {
      // If no script found, return null instead of throwing
      if (error.code === 404) {
        return null;
      }
      handleGoogleAPIError(error);
    }
  }

  // List all functions in a script
  async listFunctions(scriptId: string): Promise<string[]> {
    try {
      const files = await this.getContent(scriptId);
      const functions: string[] = [];

      files.forEach((file) => {
        if (file.functionSet?.values) {
          file.functionSet.values.forEach((func) => {
            if (func.name) {
              functions.push(func.name);
            }
          });
        }
      });

      return functions;
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }
}
