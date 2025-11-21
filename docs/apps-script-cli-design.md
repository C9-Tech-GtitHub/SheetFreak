# Apps Script CLI Command Structure Design

## Overview

This document outlines the CLI command structure for Google Apps Script integration in SheetFreak. Apps Script enables automation, custom functions, triggers, and menu extensions for Google Sheets.

## Command Hierarchy

```
sheetfreak script <action> [args] [options]
```

## Commands

### 1. Script Management

#### `sheetfreak script list <spreadsheet-id>`
List all scripts attached to a spreadsheet.

**Options:**
- `--format <format>` - Output format: table, json (default: table)

**Output (JSON):**
```json
{
  "scripts": [
    {
      "scriptId": "abc123",
      "title": "My Automation Script",
      "functions": ["onOpen", "customFunction"],
      "lastModified": "2025-11-20T10:30:00Z"
    }
  ]
}
```

#### `sheetfreak script create <spreadsheet-id> <title>`
Create a new Apps Script project attached to a spreadsheet.

**Options:**
- `--template <name>` - Use a template (see template library section)
- `--format <format>` - Output format: table, json (default: table)

**Output:**
```json
{
  "scriptId": "abc123",
  "title": "My Script",
  "url": "https://script.google.com/d/abc123/edit"
}
```

#### `sheetfreak script delete <script-id>`
Delete an Apps Script project.

**Confirmation:** Prompts for confirmation unless `--yes` flag is provided.

---

### 2. Code Management

#### `sheetfreak script deploy <spreadsheet-id> <script-file>`
Deploy Apps Script code to a spreadsheet.

**Arguments:**
- `<spreadsheet-id>` - Target spreadsheet
- `<script-file>` - Path to `.gs` or `.js` file containing Apps Script code

**Options:**
- `--title <name>` - Script project title (default: filename)
- `--description <text>` - Script description
- `--create-if-missing` - Create script project if none exists

**Example:**
```bash
sheetfreak script deploy abc123 automation.js --title "Auto Refresh"
```

#### `sheetfreak script read <script-id> [file-name]`
Read Apps Script code from a project.

**Arguments:**
- `<script-id>` - Script project ID
- `[file-name]` - Optional: specific file to read (default: Code.gs)

**Options:**
- `--all` - Read all files in the project
- `--format <format>` - Output format: code, json (default: code)

**Output (code format):**
```javascript
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu')
    .addItem('Refresh Data', 'refreshData')
    .addToUi();
}
```

**Output (json format):**
```json
{
  "files": [
    {
      "name": "Code.gs",
      "type": "SERVER_JS",
      "source": "function onOpen() { ... }"
    }
  ]
}
```

#### `sheetfreak script write <script-id> <file-name> <source-file>`
Write/update a file in an Apps Script project.

**Arguments:**
- `<script-id>` - Script project ID
- `<file-name>` - Target file name in script project (e.g., Code.gs)
- `<source-file>` - Local file containing code to write

**Options:**
- `--type <type>` - File type: SERVER_JS, HTML (default: SERVER_JS)

**Example:**
```bash
sheetfreak script write abc123 Code.gs automation.js
sheetfreak script write abc123 Sidebar.html sidebar.html --type HTML
```

---

### 3. Function Execution

#### `sheetfreak script run <script-id> <function-name> [args...]`
Execute an Apps Script function.

**Arguments:**
- `<script-id>` - Script project ID
- `<function-name>` - Function to execute
- `[args...]` - Optional function arguments (JSON format)

**Options:**
- `--dev-mode` - Run in development mode (not deployed version)
- `--format <format>` - Output format: json, text (default: json)

**Example:**
```bash
# No arguments
sheetfreak script run abc123 refreshData

# With arguments
sheetfreak script run abc123 processData '{"range": "A1:D10", "format": "csv"}'
```

**Output:**
```json
{
  "status": "success",
  "result": {
    "processed": 100,
    "errors": 0
  },
  "executionTime": "2.3s"
}
```

---

### 4. Trigger Management

#### `sheetfreak script trigger list <script-id>`
List all triggers for an Apps Script project.

**Options:**
- `--format <format>` - Output format: table, json (default: table)

**Output:**
```json
{
  "triggers": [
    {
      "triggerId": "trigger123",
      "eventType": "ON_OPEN",
      "handlerFunction": "onOpen"
    },
    {
      "triggerId": "trigger456",
      "eventType": "CLOCK",
      "handlerFunction": "hourlyRefresh",
      "schedule": "HOURLY"
    }
  ]
}
```

#### `sheetfreak script trigger create <script-id> <function-name>`
Create a new trigger for an Apps Script function.

**Arguments:**
- `<script-id>` - Script project ID
- `<function-name>` - Function to trigger

**Options:**
- `--event <type>` - Event type: ON_OPEN, ON_EDIT, ON_CHANGE, ON_FORM_SUBMIT
- `--time-based <schedule>` - Time-based trigger: HOURLY, DAILY, WEEKLY, MONTHLY
- `--at <time>` - Specific time for daily triggers (HH:MM format, 24-hour)
- `--day <day>` - Day for weekly triggers: MONDAY, TUESDAY, etc.
- `--date <date>` - Date for monthly triggers (1-31)

**Examples:**
```bash
# Event-based trigger
sheetfreak script trigger create abc123 onOpen --event ON_OPEN

# Time-based trigger (hourly)
sheetfreak script trigger create abc123 hourlyRefresh --time-based HOURLY

# Time-based trigger (daily at specific time)
sheetfreak script trigger create abc123 dailyBackup --time-based DAILY --at 02:00

# Weekly trigger
sheetfreak script trigger create abc123 weeklyReport --time-based WEEKLY --day MONDAY --at 09:00
```

#### `sheetfreak script trigger delete <trigger-id>`
Delete a trigger.

**Confirmation:** Prompts for confirmation unless `--yes` flag is provided.

---

### 5. Template Library

#### `sheetfreak script template list`
List all available Apps Script templates.

**Output:**
```
Available Templates:
  - auto-refresh        Auto-refresh data from external API
  - custom-menu         Add custom menu with actions
  - on-edit-validator   Validate data on cell edit
  - email-notification  Send email notifications
  - data-importer       Import data from external source
  - status-tracker      Track status changes and log
  - backup-automation   Automated backup to Drive
```

#### `sheetfreak script template show <template-name>`
Show template code and documentation.

**Output:**
```javascript
/**
 * Template: auto-refresh
 * Description: Auto-refresh data from external API
 * 
 * Setup:
 * 1. Replace API_URL with your endpoint
 * 2. Configure refresh interval in trigger settings
 * 3. Set target range for data
 */

const API_URL = 'https://api.example.com/data';
const TARGET_RANGE = 'Data!A1';

function refreshData() {
  const response = UrlFetchApp.fetch(API_URL);
  const data = JSON.parse(response.getContentText());
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Data');
  
  sheet.getRange(TARGET_RANGE).setValue(data);
}
```

#### `sheetfreak script template apply <spreadsheet-id> <template-name>`
Apply a template to a spreadsheet.

**Options:**
- `--config <json-file>` - Configuration for template variables
- `--auto-trigger` - Automatically create recommended triggers

**Example:**
```bash
sheetfreak script template apply abc123 auto-refresh --config refresh-config.json --auto-trigger
```

**Config file example:**
```json
{
  "API_URL": "https://api.example.com/data",
  "TARGET_RANGE": "Data!A1:C100",
  "REFRESH_INTERVAL": "HOURLY"
}
```

---

### 6. Deployment and Publishing

#### `sheetfreak script deploy-version <script-id> <description>`
Create a new version/deployment of the script.

**Options:**
- `--version <number>` - Version number (default: auto-increment)
- `--make-active` - Set as active deployment

**Example:**
```bash
sheetfreak script deploy-version abc123 "Added error handling" --make-active
```

#### `sheetfreak script versions <script-id>`
List all versions of a script.

**Output:**
```json
{
  "versions": [
    {
      "versionNumber": 1,
      "description": "Initial version",
      "createTime": "2025-11-01T10:00:00Z"
    },
    {
      "versionNumber": 2,
      "description": "Added error handling",
      "createTime": "2025-11-20T15:30:00Z",
      "active": true
    }
  ]
}
```

---

### 7. Logs and Debugging

#### `sheetfreak script logs <script-id>`
View execution logs for a script.

**Options:**
- `--limit <number>` - Maximum number of log entries (default: 50)
- `--errors-only` - Show only error logs
- `--format <format>` - Output format: table, json (default: table)

**Output:**
```json
{
  "logs": [
    {
      "timestamp": "2025-11-21T10:30:00Z",
      "level": "INFO",
      "message": "Function refreshData started"
    },
    {
      "timestamp": "2025-11-21T10:30:02Z",
      "level": "ERROR",
      "message": "API request failed: timeout",
      "function": "refreshData"
    }
  ]
}
```

---

## Integration with clasp

For advanced users, SheetFreak will integrate with Google's official `clasp` CLI:

### `sheetfreak script clasp-init <spreadsheet-id>`
Initialize clasp for local development.

**Output:**
```
✓ Clasp initialized
✓ Script project linked: abc123
✓ Local files created:
  - .clasp.json
  - appsscript.json
  - Code.gs

Run 'clasp pull' to download script files
Run 'clasp push' to upload changes
```

### `sheetfreak script clasp <command> [...args]`
Pass-through to clasp CLI for advanced operations.

**Examples:**
```bash
sheetfreak script clasp pull
sheetfreak script clasp push
sheetfreak script clasp logs
sheetfreak script clasp open
```

---

## Error Handling

All commands return structured errors:

```json
{
  "error": {
    "code": "SCRIPT_NOT_FOUND",
    "message": "Script project abc123 not found",
    "hint": "Verify script ID or use 'sheetfreak script list' to see available scripts"
  }
}
```

**Error codes:**
- `SCRIPT_NOT_FOUND` - Script project doesn't exist
- `PERMISSION_DENIED` - Insufficient permissions
- `INVALID_FUNCTION` - Function not found in script
- `EXECUTION_FAILED` - Function execution failed
- `TRIGGER_CREATE_FAILED` - Trigger creation failed
- `TEMPLATE_NOT_FOUND` - Template doesn't exist
- `INVALID_SCHEDULE` - Invalid trigger schedule

---

## Implementation Notes

### API Requirements
- Google Apps Script API (for execution, deployment, triggers)
- Google Drive API v3 (for script file access)
- OAuth2 scopes needed:
  - `https://www.googleapis.com/auth/script.projects`
  - `https://www.googleapis.com/auth/script.scriptapp`
  - `https://www.googleapis.com/auth/spreadsheets`

### File Structure
```
src/
├── api/
│   └── script-client.ts      # Apps Script API client
├── commands/
│   └── script.ts              # Script commands implementation
├── templates/
│   ├── auto-refresh.gs
│   ├── custom-menu.gs
│   ├── on-edit-validator.gs
│   └── template-registry.ts
└── types/
    └── index.ts               # Add Apps Script types
```

### Dependencies
- `@google-cloud/local-auth` (for OAuth if needed)
- `clasp` (optional peer dependency for advanced users)
- Existing: `googleapis` package

---

## Example Workflows

### Workflow 1: Add Custom Menu on Open

```bash
# Create script from template
sheetfreak script template apply abc123 custom-menu --config menu-config.json

# Create ON_OPEN trigger
sheetfreak script trigger create <script-id> onOpen --event ON_OPEN

# Verify
sheetfreak script trigger list <script-id>
```

### Workflow 2: Hourly Data Refresh

```bash
# Deploy custom script
sheetfreak script deploy abc123 refresh-data.js --title "Hourly Refresh"

# Create hourly trigger
sheetfreak script trigger create <script-id> refreshData --time-based HOURLY

# Monitor logs
sheetfreak script logs <script-id> --errors-only
```

### Workflow 3: Custom Function Development

```bash
# Initialize clasp for local development
sheetfreak script clasp-init abc123

# Edit files locally
# ... make changes to Code.gs ...

# Push changes
sheetfreak script clasp push

# Test function
sheetfreak script run <script-id> myCustomFunction '{"input": "test"}'
```

---

## AI-Friendly Design

### JSON Input/Output
All commands support JSON I/O for programmatic use by AI agents.

### Batch Operations
```bash
# batch-triggers.json
{
  "triggers": [
    {
      "function": "onOpen",
      "event": "ON_OPEN"
    },
    {
      "function": "hourlyRefresh",
      "timeBased": "HOURLY"
    }
  ]
}

sheetfreak script trigger batch <script-id> --json batch-triggers.json
```

### Template Variables
Templates support variable substitution for AI-friendly customization.

```json
{
  "template": "auto-refresh",
  "variables": {
    "API_URL": "https://api.example.com/data",
    "TARGET_RANGE": "Data!A1:C100"
  }
}
```
