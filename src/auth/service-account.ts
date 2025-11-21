// Service account authentication for Google APIs
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import fs from "fs";
import { SheetFreakError } from "../utils/errors.js";

export class ServiceAccountAuth {
  private client: JWT;
  private credentialsPath: string;

  constructor(credentialsPath: string) {
    this.credentialsPath = credentialsPath;

    if (!fs.existsSync(credentialsPath)) {
      throw SheetFreakError.authenticationError({
        message: "Credentials file not found",
        path: credentialsPath,
      });
    }

    try {
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));

      this.client = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets",
          "https://www.googleapis.com/auth/drive",
          "https://www.googleapis.com/auth/script.projects",
        ],
      });
    } catch (error: any) {
      throw SheetFreakError.authenticationError({
        message: "Failed to parse credentials file",
        error: error.message,
      });
    }
  }

  async authorize(): Promise<void> {
    try {
      await this.client.authorize();
    } catch (error: any) {
      throw SheetFreakError.authenticationError({
        message: "Failed to authorize with Google",
        error: error.message,
      });
    }
  }

  getAuthClient(): JWT {
    return this.client;
  }

  getSheetsAPI() {
    return google.sheets({ version: "v4", auth: this.client });
  }

  getDriveAPI() {
    return google.drive({ version: "v3", auth: this.client });
  }

  getScriptAPI() {
    return google.script({ version: "v1", auth: this.client });
  }

  async getAccountInfo(): Promise<{ email: string; scopes: string[] }> {
    const credentials = JSON.parse(
      fs.readFileSync(this.credentialsPath, "utf-8"),
    );

    const scopes = this.client.scopes;
    const scopesArray = Array.isArray(scopes) ? scopes : scopes ? [scopes] : [];

    return {
      email: credentials.client_email,
      scopes: scopesArray,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.authorize();
      // Try a simple API call to verify access
      const drive = this.getDriveAPI();
      await drive.files.list({ pageSize: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }
}
