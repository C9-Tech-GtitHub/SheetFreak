# SheetFreak

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/C9-Tech-GtitHub/SheetFreak)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A command-line tool for programmatic Google Sheets control, optimized for AI agents and automation workflows.

## Features

- **Google Sheets API & Drive API integration**: Full programmatic control
- **Service Account authentication**: Secure, token-free access
- **AI-friendly commands**: JSON input/output for easy integration
- **Batch operations**: Update multiple ranges efficiently
- **Cell formatting**: Colors, fonts, borders, alignment, and styling
- **Visual tools**: Screenshot capabilities for design verification
- **Apps Script automation**: Deploy scripts, create triggers, and automate workflows
- **Template library**: Ready-to-use templates for common automation tasks
- **Clasp integration**: Full local development support with Google's official CLI

## Quick Start

### 1. Install Dependencies

```bash
npm install
npm run build
```

### 2. Set Up Google Cloud Service Account

You'll need a service account JSON credentials file:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Drive API
4. Navigate to "IAM & Admin" > "Service Accounts"
5. Create a new service account (or select existing)
6. Click "Keys" > "Add Key" > "Create new key" > "JSON"
7. Download the JSON credentials file

### 3. Initialize Authentication

```bash
# Set up authentication with your credentials
node dist/cli.js auth init /path/to/credentials.json

# Or use environment variable
export SHEETFREAK_CREDENTIALS=/path/to/credentials.json
```

### 4. Verify Setup

```bash
node dist/cli.js auth status
```

## Usage Examples

### Create a New Spreadsheet

```bash
node dist/cli.js sheet create "My New Sheet"
```

Output:
```
✓ Spreadsheet created successfully!
  ID: 1abc123xyz...
  URL: https://docs.google.com/spreadsheets/d/1abc123xyz...
```

### List Your Spreadsheets

```bash
node dist/cli.js sheet list
```

### Get Spreadsheet Info

```bash
node dist/cli.js sheet info <spreadsheet-id>
```

### Write Data

```bash
# Single cell
node dist/cli.js data write <spreadsheet-id> A1 "Hello World"

# From JSON file
node dist/cli.js data write <spreadsheet-id> A1:B2 --json data.json
```

Example `data.json`:
```json
{
  "values": [
    ["Name", "Age"],
    ["Alice", 30],
    ["Bob", 25]
  ]
}
```

### Read Data

```bash
# Table format (default)
node dist/cli.js data read <spreadsheet-id> A1:B10

# JSON format
node dist/cli.js data read <spreadsheet-id> A1:B10 --format json

# CSV format
node dist/cli.js data read <spreadsheet-id> A1:B10 --format csv
```

### Manage Tabs/Sheets

```bash
# List all tabs
node dist/cli.js tab list <spreadsheet-id>

# Add a new tab
node dist/cli.js tab add <spreadsheet-id> "New Sheet"

# Delete a tab
node dist/cli.js tab delete <spreadsheet-id> "Old Sheet"

# Rename a tab
node dist/cli.js tab rename <spreadsheet-id> "Old Name" "New Name"
```

### Share Spreadsheet

```bash
# Share with a user as writer
node dist/cli.js sheet share <spreadsheet-id> user@example.com

# Share as reader
node dist/cli.js sheet share <spreadsheet-id> user@example.com --role reader
```

### Copy Spreadsheet (Template)

```bash
node dist/cli.js sheet copy <spreadsheet-id> "Copy of My Sheet"
```

### Set Working Context

```bash
# Set default spreadsheet
node dist/cli.js context set <spreadsheet-id>

# View current context
node dist/cli.js context get
```

### Format Cells

```bash
# Apply background and text colors
node dist/cli.js format cells <spreadsheet-id> "Sheet1!A1:B1" --bg-color "#4285f4" --text-color white

# Make text bold and increase font size
node dist/cli.js format cells <spreadsheet-id> "Sheet1!A1:B1" --bold --font-size 14

# Text alignment
node dist/cli.js format cells <spreadsheet-id> "Sheet1!A1:B1" --align CENTER --valign MIDDLE

# Multiple formatting options
node dist/cli.js format cells <spreadsheet-id> "Sheet1!A1:D1" \
  --bold --italic \
  --bg-color "#34a853" \
  --text-color white \
  --font-size 12 \
  --align CENTER

# Load complex formatting from JSON
node dist/cli.js format cells <spreadsheet-id> "Sheet1!A1:B10" --json format.json
```

Example `format.json`:
```json
{
  "backgroundColor": {"red": 0.26, "green": 0.52, "blue": 0.96, "alpha": 1},
  "textFormat": {
    "bold": true,
    "fontSize": 12,
    "foregroundColor": {"red": 1, "green": 1, "blue": 1, "alpha": 1}
  },
  "horizontalAlignment": "CENTER"
}
```

### Apply Borders

```bash
# Add borders to all sides
node dist/cli.js format borders <spreadsheet-id> "Sheet1!A1:D10" --all

# Add only top and bottom borders
node dist/cli.js format borders <spreadsheet-id> "Sheet1!A1:D1" --top --bottom

# Custom border style and color
node dist/cli.js format borders <spreadsheet-id> "Sheet1!A1:D10" \
  --all \
  --style SOLID_MEDIUM \
  --color "#000000"
```

Border styles: `DOTTED`, `DASHED`, `SOLID`, `SOLID_MEDIUM`, `SOLID_THICK`, `DOUBLE`

### Resize Columns and Rows

```bash
# Resize columns 0-2 (A-C) to 150 pixels
node dist/cli.js format resize-columns <spreadsheet-id> "Sheet1" 0 2 150

# Resize rows 1-5 to 30 pixels height
node dist/cli.js format resize-rows <spreadsheet-id> "Sheet1" 1 5 30

# Auto-resize columns to fit content
node dist/cli.js format auto-resize-columns <spreadsheet-id> "Sheet1" 0 5
```

### Color Reference

Named colors: `red`, `green`, `blue`, `yellow`, `orange`, `purple`, `pink`, `white`, `black`, `gray`, `lightgray`, `darkgray`

Or use hex colors: `#FF0000`, `#00FF00`, `#0000FF`, etc.

### Apps Script Automation

Deploy scripts and automate your spreadsheets with Google Apps Script:

```bash
# List available templates
node dist/cli.js script template-list

# View template details
node dist/cli.js script template-show auto-refresh

# Apply a template with configuration
echo '{"API_URL": "https://api.example.com/data", "TARGET_RANGE": "Data!A1"}' > config.json
node dist/cli.js script template-apply <spreadsheet-id> auto-refresh --config config.json

# Deploy custom script
node dist/cli.js script deploy <spreadsheet-id> my-script.js --create-if-missing

# List functions in a script
node dist/cli.js script functions <script-id>

# Run a function
node dist/cli.js script run <script-id> refreshData
```

**Available Templates:**
- `auto-refresh` - Automatically refresh data from external API
- `custom-menu` - Add custom menu with actions (refresh, format, export)
- `on-edit-validator` - Validate and format data when cells are edited

### Local Development with Clasp

For advanced users who want full IDE support:

```bash
# Initialize clasp for a spreadsheet
node dist/cli.js script clasp-init <spreadsheet-id>

# Pull latest code from Google
node dist/cli.js script clasp-pull

# Edit files locally in your favorite IDE
# ... edit Code.gs ...

# Push changes back to Google
node dist/cli.js script clasp-push

# Open script in browser
node dist/cli.js script clasp-open

# View execution logs
node dist/cli.js script clasp-logs
```

**Prerequisites for clasp:**
```bash
npm install -g @google/clasp
```

## Command Reference

### Authentication
- `auth init <credentials-path>` - Initialize authentication
- `auth status` - Check authentication status

### Sheet Management
- `sheet create <name>` - Create new spreadsheet
- `sheet list` - List all spreadsheets
- `sheet info <id>` - Get spreadsheet details
- `sheet copy <id> <new-name>` - Copy spreadsheet
- `sheet share <id> <email>` - Share spreadsheet

### Data Operations
- `data read <id> <range>` - Read data
- `data write <id> <range> [value]` - Write data
- `data clear <id> <range>` - Clear data
- `data append <id> <range> [value]` - Append data
- `data batch <id> --json <file>` - Batch write

### Tab Management
- `tab list <id>` - List sheets/tabs
- `tab add <id> <title>` - Add new sheet
- `tab delete <id> <title>` - Delete sheet
- `tab rename <id> <old> <new>` - Rename sheet

### Formatting
- `format cells <id> <range>` - Apply cell formatting (colors, fonts, alignment)
- `format borders <id> <range>` - Apply borders to cells
- `format resize-columns <id> <sheet> <start> <end> <pixels>` - Resize columns
- `format resize-rows <id> <sheet> <start> <end> <pixels>` - Resize rows
- `format auto-resize-columns <id> <sheet> <start> <end>` - Auto-resize columns

### Visual Tools
- `visual screenshot <id>` - Take screenshot of spreadsheet
- `visual batch <id> --json <file>` - Take multiple screenshots
- `visual compare <id> <baseline>` - Compare with baseline image
- `visual inspect <id>` - Open in browser for inspection
- `visual capture-range <id> <range> <output>` - Screenshot specific range

### Apps Script
- `script list <id>` - List scripts attached to spreadsheet
- `script create <id> <title>` - Create new Apps Script project
- `script deploy <id> <script-file>` - Deploy script code
- `script read <script-id> [file-name]` - Read script source
- `script write <script-id> <file-name> <source-file>` - Write script file
- `script run <script-id> <function-name> [args...]` - Execute function
- `script functions <script-id>` - List all functions
- `script template-list` - List available templates
- `script template-show <template-name>` - Show template details
- `script template-apply <id> <template-name>` - Apply template
- `script clasp-init <id>` - Initialize clasp for local development
- `script clasp-pull` - Pull code from Google
- `script clasp-push` - Push code to Google
- `script clasp-open` - Open script in browser
- `script clasp-logs` - View execution logs

### Context
- `context set <id>` - Set working spreadsheet
- `context get` - Show current context

## For AI Agents

SheetFreak is designed to be AI-friendly:

- **JSON I/O**: Use `--format json` on any read command
- **Batch operations**: Update multiple ranges in one call
- **Structured errors**: Machine-readable error codes
- **Discoverable**: All commands support `--help`

Example AI workflow:
```bash
# Create sheet
node dist/cli.js sheet create "AI Generated Report" --format json

# Write header
echo '{"values":[["Metric","Value","Status"]]}' > header.json
node dist/cli.js data write <id> A1:C1 --json header.json

# Write data
echo '{"values":[["Revenue",50000,"Up"],["Users",1200,"Up"]]}' > data.json
node dist/cli.js data write <id> A2:C3 --json data.json

# Read back
node dist/cli.js data read <id> A1:C3 --format json
```

## Important Notes

### Service Account Permissions

Your service account can only access:
- Spreadsheets it creates
- Spreadsheets explicitly shared with it

To work with existing sheets, share them with your service account email (found in your credentials JSON file under `client_email`).

### Security

- **Never commit** your credentials JSON file to git
- Store credentials securely outside the repository
- Use environment variables in production
- The `.gitignore` is configured to exclude credentials

### Configuration

SheetFreak stores configuration in `~/.sheetfreak/`:
- `config.json` - User preferences and settings
- `context.json` - Current working spreadsheet

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev -- auth status
```

## Roadmap

- [x] Core CRUD operations
- [x] Cell formatting and styling
- [x] Visual screenshot tools
- [x] Borders and column/row resizing
- [x] Google Apps Script integration
- [x] Apps Script template library
- [x] Clasp integration for local development
- [ ] Charts and visualizations
- [ ] Conditional formatting
- [ ] Trigger management API
- [ ] Additional Apps Script templates
- [ ] Import/export utilities (CSV, XLSX, PDF)
- [ ] Automated testing framework

## Troubleshooting

### Authentication Failed

```bash
# Check your credentials file exists
ls -la /path/to/credentials.json

# Verify it's valid JSON
cat /path/to/credentials.json | jq .

# Re-initialize
node dist/cli.js auth init /path/to/credentials.json
```

### Permission Denied

Make sure the spreadsheet is shared with your service account:
1. Open the spreadsheet
2. Click "Share"
3. Add your service account email (found in credentials JSON as `client_email`)
4. Grant appropriate permissions (Editor recommended)

### Command Not Found

Make sure you've built the project:
```bash
npm run build
```

## License

MIT
