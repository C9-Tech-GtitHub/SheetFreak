// Google Drive API client wrapper
import { drive_v3 } from 'googleapis';
import { ServiceAccountAuth } from '../auth/service-account.js';
import { handleGoogleAPIError } from '../utils/errors.js';
import { SpreadsheetInfo } from '../types/index.js';

export class DriveClient {
  private drive: drive_v3.Drive;

  constructor(private auth: ServiceAccountAuth) {
    this.drive = auth.getDriveAPI();
  }

  // Create a new spreadsheet
  async createSpreadsheet(name: string): Promise<SpreadsheetInfo> {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.spreadsheet'
        },
        fields: 'id, name, webViewLink'
      });

      return {
        spreadsheetId: response.data.id!,
        spreadsheetUrl: response.data.webViewLink || '',
        title: response.data.name || name
      };
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // List all spreadsheets accessible to service account
  async listSpreadsheets(pageSize: number = 100): Promise<SpreadsheetInfo[]> {
    try {
      const response = await this.drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        pageSize,
        fields: 'files(id, name, webViewLink, modifiedTime)',
        orderBy: 'modifiedTime desc'
      });

      return (response.data.files || []).map(file => ({
        spreadsheetId: file.id!,
        spreadsheetUrl: file.webViewLink || '',
        title: file.name || 'Untitled'
      }));
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Get spreadsheet info
  async getSpreadsheetInfo(spreadsheetId: string): Promise<SpreadsheetInfo> {
    try {
      const response = await this.drive.files.get({
        fileId: spreadsheetId,
        fields: 'id, name, webViewLink'
      });

      return {
        spreadsheetId: response.data.id!,
        spreadsheetUrl: response.data.webViewLink || '',
        title: response.data.name || 'Untitled'
      };
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Copy a spreadsheet (for templates)
  async copySpreadsheet(spreadsheetId: string, newName: string): Promise<SpreadsheetInfo> {
    try {
      const response = await this.drive.files.copy({
        fileId: spreadsheetId,
        requestBody: {
          name: newName
        },
        fields: 'id, name, webViewLink'
      });

      return {
        spreadsheetId: response.data.id!,
        spreadsheetUrl: response.data.webViewLink || '',
        title: response.data.name || newName
      };
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Share spreadsheet with user/group
  async shareSpreadsheet(
    spreadsheetId: string,
    email: string,
    role: 'reader' | 'writer' | 'owner' = 'writer'
  ): Promise<void> {
    try {
      await this.drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          type: 'user',
          role,
          emailAddress: email
        },
        sendNotificationEmail: true
      });
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Delete a spreadsheet
  async deleteSpreadsheet(spreadsheetId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId: spreadsheetId
      });
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }

  // Export spreadsheet in different formats
  async exportSpreadsheet(
    spreadsheetId: string,
    mimeType: string
  ): Promise<Buffer> {
    try {
      const response = await this.drive.files.export(
        {
          fileId: spreadsheetId,
          mimeType
        },
        { responseType: 'arraybuffer' }
      );

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error: any) {
      handleGoogleAPIError(error);
    }
  }
}
