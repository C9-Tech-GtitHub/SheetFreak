# SheetFreak - Claude Configuration

## What is SheetFreak?

**SheetFreak lets you control Google Sheets through natural language prompts to Claude.**

Instead of manually editing spreadsheets or writing complex scripts, you simply tell Claude what you want, and SheetFreak's CLI commands make it happen.

## Core Philosophy

**You say:** "Make the headers blue with white text and add 1000 rows from this CSV file"

**Claude does:** Runs the right SheetFreak commands to accomplish it

**SheetFreak is:**
- ✅ A Node.js CLI tool with commands for every Google Sheets operation
- ✅ Designed to be called by Claude (AI-friendly JSON I/O)
- ✅ A complete toolkit: data, formatting, visual tools, sheet management
- ✅ Built on Google Sheets API v4 + Google Drive API v3

**SheetFreak is NOT:**
- ❌ A GUI application
- ❌ A replacement for Google Sheets
- ❌ Limited to simple operations (it can do complex workflows)

---

## Specialized Subagents

SheetFreak uses **3 specialized subagents** to handle complex Google Sheets workflows. Each agent owns a specific domain:

### The Three Pillars of SheetFreak

| Agent | Domain | Capabilities | Key Tools |
|-------|--------|--------------|-----------|
| **visual-design-agent** | Visual aesthetics & formatting | Styling, colors, layouts, borders, design consistency | SheetFreak format commands + Playwright MCP |
| **apps-script-agent** | Automation & scripting | Google Apps Script, triggers, custom functions, menus | clasp + Apps Script API |
| **sheet-data-agent** | Data operations | Read, write, move, transform, bulk data operations | SheetFreak data commands |

### When to Use Each Agent

**visual-design-agent** - Use for visual/aesthetic work:
- "Make the headers blue with white text"
- "Design a professional table of contents"
- "Apply consistent styling across all tabs"
- "Create a color-coded dashboard"
- "Fix visual inconsistencies"

**apps-script-agent** - Use for automation:
- "Set up hourly auto-refresh from an API"
- "Create a custom function to calculate weighted averages"
- "Add a menu item to export as PDF"
- "Auto-format cells when status changes"
- "Send email notifications when data changes"

**sheet-data-agent** - Use for data operations:
- "Load 1000 rows from a CSV file"
- "Move data from Sheet1 to Sheet2"
- "Update all cells matching a pattern"
- "Merge data from multiple sheets"
- "Read dashboard metrics and export as JSON"

### How They Work Together

**Example: Creating a Status Dashboard**

1. **sheet-data-agent**: Writes the data (metrics, values, labels)
2. **visual-design-agent**: Applies beautiful formatting (colors, fonts, layout)
3. **apps-script-agent**: Sets up auto-refresh every hour

**Example: Building a Table of Contents**

1. **visual-design-agent**: Designs the TOC layout and styling
2. **sheet-data-agent**: Populates tab names and descriptions
3. **apps-script-agent**: Adds "Jump to Sheet" buttons that work on click

### Delegation Rules (REQUIRED)

**You MUST delegate to the appropriate subagent for the following tasks:**

#### ALWAYS use visual-design-agent for:
- ✅ Any `sheetfreak format` commands (cells, borders, resize, etc.)
- ✅ Design work (table of contents, dashboards, layouts)
- ✅ Visual consistency across sheets
- ✅ Taking screenshots for verification
- ✅ Any request containing: "style", "color", "format", "design", "beautiful", "professional"

#### ALWAYS use apps-script-agent for:
- ✅ Writing or deploying Google Apps Script code
- ✅ Setting up triggers (time-based or event-based)
- ✅ Creating custom spreadsheet functions
- ✅ Building custom menus or UI extensions
- ✅ Any request containing: "trigger", "script", "automatic", "automate", "schedule", "function"

#### ALWAYS use sheet-data-agent for:
- ✅ Any `sheetfreak data` commands (read, write, clear, append, batch)
- ✅ Data imports (CSV, JSON)
- ✅ Data transformations and cleaning
- ✅ Moving/copying data between sheets
- ✅ Any request containing: "import", "export", "load", "read", "write", "data", "rows", "values"

#### You CAN handle directly (without subagents):
- ✅ `sheetfreak auth` commands (authentication setup)
- ✅ `sheetfreak sheet` commands (create, list, share spreadsheets)
- ✅ `sheetfreak tab` commands (add, delete, rename tabs)
- ✅ `sheetfreak context` commands (set/get working context)
- ✅ Simple orchestration of multiple subagents
- ✅ Answering questions about SheetFreak

**Subagent files:** All subagents are defined in `.claude/agents/`:
- `.claude/agents/visual-design-agent.md`
- `.claude/agents/apps-script-agent.md`
- `.claude/agents/sheet-data-agent.md`

**How to delegate:** Use the Task tool with the appropriate `subagent_type` parameter.

---

## How to Work with Google Sheets

**Your Role:** You are the **orchestrator**. When users ask you to modify Google Sheets, you coordinate the work by delegating to specialized subagents.

**DELEGATION RULES:**
- 🎨 **Formatting/styling work** → Delegate to `visual-design-agent`
- 📊 **Data operations** → Delegate to `sheet-data-agent`
- 🤖 **Apps Script/automation** → Delegate to `apps-script-agent`
- ⚙️ **Simple management tasks** (auth, tabs, context) → Handle yourself

The sections below document the SheetFreak CLI commands available. These are the commands that **the subagents will execute**, not you directly.

### 1. Data Operations

**Commands available:**
```bash
# Read data from a range
sheetfreak data read <sheet-id> <range> [--format json|csv|table]

# Write data to cells
sheetfreak data write <sheet-id> <range> <value>
sheetfreak data write <sheet-id> <range> --json <file>

# Clear data
sheetfreak data clear <sheet-id> <range>

# Append rows
sheetfreak data append <sheet-id> <range> <value|--json file>

# Batch operations
sheetfreak data batch <sheet-id> --json <batch-config.json>
```

**When to use:**
- Import CSV/JSON data
- Read values for analysis
- Update cell values
- Clear ranges
- Bulk data operations

**Example workflow:**
```bash
# User: "Load this CSV into Sheet1"
sheetfreak data write abc123 "'Sheet1'!A1" --csv data.csv

# User: "Read the dashboard metrics"
sheetfreak data read abc123 "'Dashboard'!A1:C10" --format json
```

---

### 2. Cell Formatting

**Commands available:**
```bash
# Format cells (colors, fonts, alignment)
sheetfreak format cells <sheet-id> <range> \
  --bg-color <color> \
  --text-color <color> \
  --bold \
  --italic \
  --font-size <size> \
  --align <LEFT|CENTER|RIGHT> \
  --valign <TOP|MIDDLE|BOTTOM>

# Apply borders
sheetfreak format borders <sheet-id> <range> \
  --all|--top|--bottom|--left|--right \
  --style <SOLID|DASHED|DOTTED|etc> \
  --color <color>

# Resize columns
sheetfreak format resize-columns <sheet-id> <sheet-name> <start> <end> <pixels>

# Resize rows
sheetfreak format resize-rows <sheet-id> <sheet-name> <start> <end> <pixels>

# Auto-resize columns to fit content
sheetfreak format auto-resize-columns <sheet-id> <sheet-name> <start> <end>
```

**Color reference:**
- Named colors: `red`, `green`, `blue`, `yellow`, `orange`, `purple`, `pink`, `white`, `black`, `gray`
- Hex colors: `#FF0000`, `#4285F4`, etc.

**When to use:**
- Make headers stand out (bold, colored background)
- Apply styling to make sheets professional
- Add borders for visual clarity
- Resize columns/rows for readability

**Example workflow:**
```bash
# User: "Make the headers blue with white text and bold"
sheetfreak format cells abc123 "'Sheet1'!A1:D1" \
  --bg-color "#4285F4" \
  --text-color white \
  --bold \
  --font-size 12

# User: "Add borders around the data table"
sheetfreak format borders abc123 "'Sheet1'!A1:D10" --all
```

---

### 3. Sheet Management

**Commands available:**
```bash
# Create a new spreadsheet
sheetfreak sheet create <name>

# List all spreadsheets
sheetfreak sheet list

# Get spreadsheet info
sheetfreak sheet info <sheet-id>

# Copy a spreadsheet
sheetfreak sheet copy <sheet-id> <new-name>

# Share spreadsheet with someone
sheetfreak sheet share <sheet-id> <email> [--role reader|writer|owner]
```

**When to use:**
- Create new spreadsheets
- Copy templates
- Share with team members
- Get spreadsheet metadata

---

### 4. Tab Management

**Commands available:**
```bash
# List all tabs/sheets
sheetfreak tab list <sheet-id>

# Add a new tab
sheetfreak tab add <sheet-id> <tab-name>

# Delete a tab
sheetfreak tab delete <sheet-id> <tab-name>

# Rename a tab
sheetfreak tab rename <sheet-id> <old-name> <new-name>
```

**When to use:**
- Organize data into multiple sheets
- Create new tabs for different datasets
- Clean up unused tabs

---

### 5. Visual Tools (Playwright)

**Commands available:**
```bash
# Screenshot entire spreadsheet
sheetfreak visual screenshot <sheet-id> [--output file.png]

# Screenshot specific range
sheetfreak visual screenshot <sheet-id> --range A1:D10

# Capture range and save to file
sheetfreak visual capture-range <sheet-id> <range> <output-file>

# Compare with baseline image
sheetfreak visual compare <sheet-id> <baseline.png>

# Open in browser for manual inspection
sheetfreak visual inspect <sheet-id>

# Batch screenshots from config
sheetfreak visual batch <sheet-id> --json config.json
```

**When to use:**
- Verify formatting looks correct
- Generate previews for reports
- Compare before/after changes
- Debug visual issues

---

### 6. Context Management

**Commands available:**
```bash
# Set the current working spreadsheet
sheetfreak context set <sheet-id>

# Get current context
sheetfreak context get
```

**When to use:**
- Working with the same spreadsheet for multiple operations
- Avoid repeating sheet-id in every command

---

### 7. Authentication

**Commands available:**
```bash
# Initialize authentication with service account credentials
sheetfreak auth init <path-to-credentials.json>

# Check authentication status
sheetfreak auth status
```

**When to use:**
- First-time setup
- Verify credentials are valid
- Troubleshoot auth issues

---

## Working with A1 Notation

Google Sheets uses **A1 notation** to reference cells and ranges:

**Single cells:**
- `A1` - Cell in column A, row 1
- `B5` - Cell in column B, row 5
- `Z99` - Cell in column Z, row 99

**Ranges:**
- `A1:D10` - Rectangle from A1 to D10
- `A:A` - Entire column A
- `1:1` - Entire row 1
- `A:Z` - Columns A through Z

**Named sheets:**
- `'Sheet1'!A1:D10` - Range in specific sheet
- `'My Data (2024)'!A1:B5` - Sheet names with spaces/special chars need quotes

**Multiple ranges:**
- `A1:A10,C1:C10,E1:E10` - Three separate ranges

---

## Common Workflows

**IMPORTANT:** The workflows below show the SheetFreak commands that will be executed. As the main orchestrator, you should **delegate** these to the appropriate subagents rather than running them directly.

### Workflow 1: Import CSV and Format Headers

**User request:** "Load this CSV and make the headers blue with white text"

**Your approach:**
1. Delegate data import to **sheet-data-agent**
2. Delegate formatting to **visual-design-agent**

**Commands the subagents will run:**
```bash
# sheet-data-agent runs:
sheetfreak data write abc123 "'Sheet1'!A1" --csv data.csv

# visual-design-agent runs:
sheetfreak format cells abc123 "'Sheet1'!A1:E1" \
  --bg-color "#4285F4" \
  --text-color white \
  --bold \
  --font-size 12 \
  --align CENTER

sheetfreak format auto-resize-columns abc123 "Sheet1" 0 4
```

### Workflow 2: Create Dashboard with Styled Sections

**User request:** "Create a dashboard with KPI cards"

**Your approach:**
1. Create tab yourself (simple operation)
2. Delegate data writing to **sheet-data-agent**
3. Delegate formatting to **visual-design-agent**

**Commands executed:**
```bash
# You run:
sheetfreak tab add abc123 "Dashboard"

# sheet-data-agent runs:
sheetfreak data write abc123 "'Dashboard'!A1:C1" --json '[["Metric","Value","Status"]]'
sheetfreak data write abc123 "'Dashboard'!A2:C4" --json \
  '[["Revenue","$50,000","Up"],["Users","1,200","Up"],["Churn","2.5%","Down"]]'

# visual-design-agent runs:
sheetfreak format cells abc123 "'Dashboard'!A1:C1" \
  --bg-color "#34A853" \
  --text-color white \
  --bold

sheetfreak format borders abc123 "'Dashboard'!A1:C4" --all
sheetfreak visual screenshot abc123 --range "'Dashboard'!A1:C4"
```

### Workflow 3: Multi-Sheet Data Consolidation

**User request:** "Merge data from Sheet1, Sheet2, and Sheet3 into a Summary tab"

**Your approach:**
1. Delegate all data operations to **sheet-data-agent**
2. Create tab yourself
3. Delegate formatting to **visual-design-agent**

**Commands executed:**
```bash
# sheet-data-agent runs:
sheetfreak data read abc123 "'Sheet1'!A2:C100" --format json > sheet1.json
sheetfreak data read abc123 "'Sheet2'!A2:C100" --format json > sheet2.json
sheetfreak data read abc123 "'Sheet3'!A2:C100" --format json > sheet3.json
jq -s 'add' sheet1.json sheet2.json sheet3.json > merged.json
sheetfreak data write abc123 "'Summary'!A1:C1" --json '[["Date","Amount","Category"]]'
sheetfreak data write abc123 "'Summary'!A2" --json merged.json

# You run:
sheetfreak tab add abc123 "Summary"

# visual-design-agent runs:
sheetfreak format cells abc123 "'Summary'!A1:C1" --bg-color purple --text-color white --bold
sheetfreak format auto-resize-columns abc123 "Summary" 0 2
```

---

## AI-Friendly Design

SheetFreak is optimized for AI agents like Claude:

### JSON Input/Output

All commands support `--format json` for structured output:

```bash
# Read data as JSON for processing
sheetfreak data read abc123 A1:D10 --format json

# Output:
{
  "values": [
    ["Name", "Age", "City", "Score"],
    ["Alice", 30, "NYC", 95],
    ["Bob", 25, "LA", 88]
  ]
}
```

### Batch Operations

Minimize API calls with batch updates:

```bash
# Single API call for multiple updates
sheetfreak data batch abc123 --json batch-config.json

# batch-config.json:
{
  "updates": [
    {"range": "A1", "values": [["Header1"]]},
    {"range": "A2", "values": [["Data1"]]},
    {"range": "B1:B2", "values": [["Header2"], ["Data2"]]}
  ]
}
```

### Error Handling

Structured errors with error codes for reliable parsing:

```json
{
  "error": {
    "code": "AUTH_FAILED",
    "message": "Service account credentials not found",
    "hint": "Run: sheetfreak auth init /path/to/credentials.json"
  }
}
```

### Discoverable Commands

Every command has `--help` for Claude to reference:

```bash
sheetfreak data write --help
sheetfreak format cells --help
```

---

## Development Workflow

### Standard Workflow:
1. User asks Claude to do something with a Google Sheet
2. Claude determines which SheetFreak commands are needed
3. Claude runs the commands in the correct order
4. Claude verifies the results (read data back, take screenshot, etc.)
5. Claude reports success to the user

### Testing Commands Locally

```bash
# Run in development mode
npm run dev -- auth status

# Build project
npm run build

# Test built CLI
node dist/cli.js sheet create "Test Sheet"

# Run tests
npm test

# Type check
npm run lint
```

---

## Technical Architecture

### Tech Stack
- **Framework:** Node.js CLI (ES modules)
- **Language:** TypeScript 5.3+ (ES2022 target)
- **APIs:** Google Sheets API v4, Google Drive API v3
- **Browser Automation:** Playwright (for visual tools)
- **CLI Framework:** Commander.js
- **Auth:** Google Service Account (JWT)
- **Validation:** Zod
- **Testing:** Vitest

### Project Structure

```
sheetfreak/
├── src/
│   ├── auth/              # Service account authentication
│   │   └── service-account.ts
│   ├── api/               # Google API clients
│   │   ├── sheets-client.ts
│   │   └── drive-client.ts
│   ├── commands/          # CLI command implementations
│   │   ├── auth.ts        # Authentication commands
│   │   ├── sheet.ts       # Sheet management
│   │   ├── data.ts        # Data operations (read, write, clear, append)
│   │   ├── tab.ts         # Tab management (add, delete, rename)
│   │   ├── format.ts      # Cell formatting (colors, fonts, borders)
│   │   └── visual.ts      # Playwright-based screenshot tools
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Config, errors, helpers
│   │   ├── config.ts      # User config management (~/.sheetfreak/)
│   │   └── errors.ts      # SheetFreakError class
│   └── cli.ts             # CLI entry point
├── dist/                  # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

### Command Structure

All commands follow this pattern:

```
sheetfreak <resource> <action> <args> [options]

Resources: auth, sheet, data, tab, format, visual, context
```

**Examples:**
- `sheetfreak data read <id> <range>`
- `sheetfreak format cells <id> <range> --bold`
- `sheetfreak sheet create <name>`

---

## Configuration Files

### User Config Directory: `~/.sheetfreak/`

**config.json:**
```json
{
  "credentialsPath": "/path/to/service-account.json",
  "defaultOutputFormat": "table"
}
```

**context.json:**
```json
{
  "currentSpreadsheetId": "abc123xyz",
  "currentSpreadsheetName": "My Working Sheet"
}
```

### Service Account Authentication

SheetFreak uses Google Cloud Service Account credentials:

1. Create a service account in Google Cloud Console
2. Enable Google Sheets API + Google Drive API
3. Download JSON credentials file
4. Initialize: `sheetfreak auth init /path/to/credentials.json`

**Important:** Share spreadsheets with the service account email (found in credentials JSON as `client_email`) to grant access.

---

## Environment Variables

```bash
# Alternative to `auth init` - set credentials path
export SHEETFREAK_CREDENTIALS=/path/to/credentials.json

# Enable verbose error output for debugging
export SHEETFREAK_VERBOSE_ERRORS=true
```

---

## Best Practices

### ✅ DO

1. **Use batch operations** for multiple updates
   ```bash
   # Good: Single batch call
   sheetfreak data batch abc123 --json updates.json
   
   # Bad: Multiple individual calls
   sheetfreak data write abc123 A1 "Value1"
   sheetfreak data write abc123 A2 "Value2"
   sheetfreak data write abc123 A3 "Value3"
   ```

2. **Read data back to verify** after writes
   ```bash
   sheetfreak data write abc123 A1:C10 --json data.json
   sheetfreak data read abc123 A1:C10 --format json
   ```

3. **Use context for multi-step workflows**
   ```bash
   sheetfreak context set abc123
   sheetfreak data write A1 "Header"
   sheetfreak format cells A1 --bold
   ```

4. **Validate ranges** before using them
   - Use single quotes for sheet names with spaces: `'My Sheet'!A1`
   - Include sheet name for multi-sheet operations

5. **Take screenshots** to verify visual changes
   ```bash
   sheetfreak format cells abc123 A1:D10 --bg-color blue
   sheetfreak visual screenshot abc123 --range A1:D10
   ```

### ❌ DON'T

1. **Don't skip authentication setup** - Always verify with `sheetfreak auth status`
2. **Don't forget to share sheets** with service account email
3. **Don't use individual writes in loops** - Use batch operations
4. **Don't read entire sheets** if you only need specific ranges
5. **Don't ignore errors** - Check command exit codes and parse JSON errors

---

## Troubleshooting

### "Authentication failed"

```bash
# Check auth status
sheetfreak auth status

# Re-initialize if needed
sheetfreak auth init /path/to/credentials.json

# Verify credentials file is valid JSON
cat /path/to/credentials.json | jq .
```

### "Permission denied" or "Spreadsheet not found"

**Solution:** Share the spreadsheet with your service account email

1. Get service account email: `cat credentials.json | jq -r .client_email`
2. Open the spreadsheet in browser
3. Click "Share" button
4. Add the service account email
5. Grant "Editor" permissions

### "Invalid range"

**Check A1 notation syntax:**
- ✅ `A1:D10` - Valid range
- ✅ `'Sheet1'!A1:D10` - Valid with sheet name
- ❌ `Sheet1!A1:D10` - Missing quotes around sheet name
- ❌ `A1-D10` - Wrong delimiter (use `:` not `-`)

### "Command not found"

```bash
# Build the project first
npm run build

# Then run CLI
node dist/cli.js <command>

# Or install globally
npm install -g .
sheetfreak <command>
```

---

## Roadmap

**Current capabilities:**
- ✅ Full CRUD operations (create, read, update, delete data)
- ✅ Cell formatting (colors, fonts, borders, alignment)
- ✅ Visual tools (screenshots, browser inspection)
- ✅ Tab management (add, delete, rename sheets)
- ✅ Sheet management (create, copy, share, list)
- ✅ Service account authentication

**Future enhancements:**
- [ ] Charts and visualizations API
- [ ] Conditional formatting support
- [ ] Data validation rules
- [ ] Named ranges support
- [ ] Template system for common patterns
- [ ] Import/export utilities (XLSX, PDF)
- [ ] MCP (Model Context Protocol) server integration
- [ ] Google Apps Script integration (custom functions, triggers)

---

## Security Best Practices

1. **Never commit credentials** - Service account JSON files are gitignored
2. **Store credentials securely** - Outside repository, encrypted at rest
3. **Use environment variables** in CI/CD pipelines
4. **Limit service account permissions** - Only enable necessary APIs
5. **Share sheets explicitly** - Don't make sheets public unless needed
6. **Validate all inputs** - SheetFreak uses Zod schemas for validation
7. **Monitor API usage** - Stay within Google API quotas

---

## Quick Reference Card

```bash
# AUTHENTICATION
sheetfreak auth init <credentials.json>
sheetfreak auth status

# SHEET MANAGEMENT
sheetfreak sheet create <name>
sheetfreak sheet list
sheetfreak sheet info <id>
sheetfreak sheet copy <id> <new-name>
sheetfreak sheet share <id> <email>

# DATA OPERATIONS
sheetfreak data read <id> <range> [--format json|csv|table]
sheetfreak data write <id> <range> <value|--json file|--csv file>
sheetfreak data clear <id> <range>
sheetfreak data append <id> <range> <value|--json file>
sheetfreak data batch <id> --json <file>

# TAB MANAGEMENT
sheetfreak tab list <id>
sheetfreak tab add <id> <name>
sheetfreak tab delete <id> <name>
sheetfreak tab rename <id> <old> <new>

# FORMATTING
sheetfreak format cells <id> <range> [--bold] [--italic] [--bg-color X] [--text-color X]
sheetfreak format borders <id> <range> [--all|--top|--bottom|--left|--right]
sheetfreak format resize-columns <id> <sheet> <start> <end> <pixels>
sheetfreak format auto-resize-columns <id> <sheet> <start> <end>

# VISUAL TOOLS
sheetfreak visual screenshot <id> [--range X] [--output file.png]
sheetfreak visual capture-range <id> <range> <output>
sheetfreak visual inspect <id>
sheetfreak visual compare <id> <baseline.png>

# CONTEXT
sheetfreak context set <id>
sheetfreak context get
```

---

## Additional Resources

- **Google Sheets API:** https://developers.google.com/sheets/api
- **Google Drive API:** https://developers.google.com/drive/api
- **A1 Notation Guide:** https://developers.google.com/sheets/api/guides/concepts#cell
- **Playwright Docs:** https://playwright.dev
- **Commander.js:** https://github.com/tj/commander.js
- **Zod Validation:** https://zod.dev

---

**Maintained by:** merrickallen  
**License:** MIT  
**Last Updated:** 2025-11-21
