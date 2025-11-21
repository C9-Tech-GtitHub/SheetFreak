# SheetFreak Setup Guide

Complete guide to set up SheetFreak with your Google Cloud service account.

## Prerequisites

- Node.js installed (v18 or higher recommended)
- A Google Cloud account
- Basic familiarity with command line

## Step 1: Create Google Cloud Project & Service Account

### 1.1 Create a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "my-sheets-automation")
4. Click "Create"

### 1.2 Enable Required APIs

Enable these APIs for your project:

**Via Console:**
1. Navigate to "APIs & Services" → "Library"
2. Search and enable:
   - Google Sheets API
   - Google Drive API

**Via gcloud CLI:**
```bash
gcloud services enable sheets.googleapis.com
gcloud services enable drive.googleapis.com
```

### 1.3 Create Service Account

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Enter a name (e.g., "sheets-bot")
4. Click "Create and Continue"
5. Skip role assignment (optional) → Click "Continue"
6. Click "Done"

### 1.4 Create and Download Credentials

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" format
5. Click "Create"
6. Save the downloaded JSON file to a secure location
   - Example: `~/credentials/my-sheets-bot.json`
   - **IMPORTANT**: Never commit this file to version control!

## Step 2: Install SheetFreak

```bash
# Clone or download SheetFreak
cd /path/to/SheetFreak

# Install dependencies
npm install

# Build the project
npm run build
```

## Step 3: Initialize Authentication

```bash
# Initialize with your credentials file
node dist/cli.js auth init /path/to/your/credentials.json
```

Expected output:
```
✓ Authentication configured successfully!
  Service Account: your-bot@your-project.iam.gserviceaccount.com
  Credentials saved to: ~/.sheetfreak/config.json
```

## Step 4: Verify Authentication

```bash
node dist/cli.js auth status
```

Expected output:
```
✓ Authentication active
  Service Account: your-bot@your-project.iam.gserviceaccount.com
  Credentials: /path/to/your/credentials.json
  Scopes:
    - https://www.googleapis.com/auth/spreadsheets
    - https://www.googleapis.com/auth/drive
```

## Step 5: Create Your First Spreadsheet

```bash
# Create a new spreadsheet
node dist/cli.js sheet create "My First SheetFreak Sheet"
```

Output:
```
✓ Spreadsheet created successfully!
  ID: 1abc123xyz...
  URL: https://docs.google.com/spreadsheets/d/1abc123xyz...
```

## Step 6: Test Basic Operations

```bash
# Save the spreadsheet ID from previous step
SHEET_ID="<your-spreadsheet-id>"

# Write some data
node dist/cli.js data write $SHEET_ID A1 "Hello SheetFreak!"

# Read it back
node dist/cli.js data read $SHEET_ID A1

# Add a new tab
node dist/cli.js tab add $SHEET_ID "Data"

# Write structured data
cat > test-data.json << 'EOF'
{
  "values": [
    ["Name", "Email", "Status"],
    ["Alice", "alice@example.com", "Active"],
    ["Bob", "bob@example.com", "Active"]
  ]
}
EOF

node dist/cli.js data write $SHEET_ID Data!A1:C3 --json test-data.json

# Read it back as JSON
node dist/cli.js data read $SHEET_ID Data!A1:C3 --format json
```

## Optional: Set Up Convenience Alias

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# SheetFreak alias
alias sheetfreak="node /path/to/SheetFreak/dist/cli.js"
```

Then reload your shell:
```bash
source ~/.zshrc  # or ~/.bashrc
```

Now you can use:
```bash
sheetfreak sheet list
sheetfreak auth status
```

## Optional: Link for Global Usage

```bash
# From the SheetFreak directory
npm link

# Now you can use 'sheetfreak' from anywhere
sheetfreak --help
```

## Working with Existing Spreadsheets

To work with spreadsheets you didn't create with SheetFreak:

1. **Open the spreadsheet** in Google Sheets
2. **Click "Share"**
3. **Add your service account email** (found in your credentials JSON file as `client_email`)
4. **Grant Editor permissions** (or appropriate level)
5. **Copy the spreadsheet ID** from the URL:
   - URL: `https://docs.google.com/spreadsheets/d/1abc123xyz.../edit`
   - ID: `1abc123xyz...`

Now you can use SheetFreak with it:
```bash
node dist/cli.js sheet info 1abc123xyz...
```

## Environment Variables (Alternative Authentication)

Instead of using `auth init`, you can set environment variables:

```bash
# Add to ~/.bashrc or ~/.zshrc
export SHEETFREAK_CREDENTIALS="/path/to/your/credentials.json"
export SHEETFREAK_OUTPUT_FORMAT="json"  # Optional: default output format
export SHEETFREAK_VERBOSE_ERRORS="true"  # Optional: show detailed errors
```

## Security Best Practices

1. **Never commit credentials**
   - The `.gitignore` is already configured
   - Store credentials outside the repository

2. **Use environment variables in production**
   ```bash
   export SHEETFREAK_CREDENTIALS=/secure/path/credentials.json
   ```

3. **Restrict service account permissions**
   - Only grant necessary scopes
   - Review access regularly

4. **Rotate keys periodically**
   - Create new keys every 90 days
   - Delete old keys from Google Cloud Console

## Troubleshooting

### "Authentication failed" error

Check that:
1. Credentials file exists and is valid JSON
2. Service account is enabled in Google Cloud Console
3. Required APIs are enabled (Sheets, Drive)

```bash
# Verify credentials file
cat /path/to/credentials.json | jq .

# Re-initialize if needed
node dist/cli.js auth init /path/to/credentials.json
```

### "Permission denied" error

The service account needs access to the spreadsheet:
1. Share the spreadsheet with your service account email
2. Grant at least "Editor" permissions

### "API not enabled" error

Enable the required APIs:

**Via Console:**
- Visit: https://console.cloud.google.com/apis/library/sheets.googleapis.com
- Visit: https://console.cloud.google.com/apis/library/drive.googleapis.com
- Click "Enable" for each

**Via gcloud CLI:**
```bash
gcloud services enable sheets.googleapis.com
gcloud services enable drive.googleapis.com
```

### "Command not found" error

Make sure you've built the project:
```bash
npm run build
```

## Configuration Files

SheetFreak stores configuration in `~/.sheetfreak/`:
- `config.json` - Credentials path and user preferences
- `context.json` - Current working spreadsheet (optional)

## Next Steps

1. **Read the [README.md](README.md)** for complete command reference
2. **Try the example workflows** for common use cases
3. **Build automation scripts** with SheetFreak commands
4. **Integrate with AI agents** using JSON I/O

## Getting Help

If you encounter issues:
1. Run `node dist/cli.js auth status` to verify setup
2. Use `--help` flag on any command for documentation
3. Check the Google Cloud Console for service account status
4. Review error messages carefully - they're designed to be helpful!

Happy automating! 🚀
