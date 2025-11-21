---
name: auto-git-push
description: Automatically commit and push code changes to GitHub after completing major code modifications, refactoring, or feature implementation. Use when you've made significant changes to source code, configuration files, or documentation.
---

# Auto Git Push Skill

Automatically commit and push changes to GitHub after major code work is completed.

## When to Use This Skill

This skill should be triggered **automatically** after:
- ✅ Completing a major feature or refactoring
- ✅ Making significant changes to source code files
- ✅ Updating configuration files (package.json, tsconfig.json, etc.)
- ✅ Modifying documentation (README.md, CLAUDE.md)
- ✅ Adding or updating agents/skills
- ✅ Fixing bugs or resolving issues

**Do NOT use** for:
- ❌ Minor typo fixes (unless user explicitly requests commit)
- ❌ Experimental/incomplete changes
- ❌ Work in progress that shouldn't be pushed yet
- ❌ When user says "don't commit yet" or similar

## How It Works

This skill provides a simple, reliable workflow to commit and push changes:

1. **Check status**: Verify what files have changed
2. **Generate commit message**: Create descriptive message based on changes
3. **Stage changes**: Add modified files to git staging
4. **Commit**: Create commit with descriptive message
5. **Push**: Push to remote repository (main branch)

## Instructions

### Step 1: Check Git Status

Before committing, always check what has changed:

```bash
git status
```

This shows:
- Modified files
- Untracked files
- Current branch
- Sync status with remote

### Step 2: Review Changes

Quickly review what was modified:

```bash
# See summary of changes
git diff --stat

# See detailed changes (if needed)
git diff
```

### Step 3: Stage Changes

Stage all changes:

```bash
git add -A
```

Or stage specific files:

```bash
git add src/commands/data.ts
git add README.md
```

### Step 4: Create Commit Message

**Format:**
```
<short summary>

<detailed description>
- Change 1
- Change 2
- Change 3
```

**Examples:**

```
Add CSV import functionality to data commands

- Implement CSV parsing in data.ts
- Add --csv flag to write command
- Update tests for CSV import
- Document CSV import in README.md
```

```
Refactor authentication to use service accounts

- Replace OAuth with JWT service account auth
- Update auth.ts with new credential loading
- Add service account setup docs
- Remove deprecated OAuth dependencies
```

```
Fix border formatting bug in format commands

- Correct border API payload structure
- Add validation for border styles
- Update format.ts error handling
```

### Step 5: Commit

Create the commit:

```bash
git commit -m "Short summary

Detailed description
- Change 1
- Change 2
- Change 3"
```

### Step 6: Push to Remote

Push to GitHub:

```bash
git push origin main
```

Or if on a different branch:

```bash
git push origin <branch-name>
```

## Complete Workflow Script

Here's the complete workflow in one script:

```bash
#!/bin/bash
# Auto commit and push workflow

# 1. Check status
echo "Checking git status..."
git status

# 2. Stage all changes
echo "Staging changes..."
git add -A

# 3. Commit with message
echo "Creating commit..."
git commit -m "Your commit message here

Detailed description:
- Change 1
- Change 2
- Change 3"

# 4. Push to remote
echo "Pushing to GitHub..."
git push origin main

echo "✅ Changes committed and pushed successfully!"
```

## Commit Message Best Practices

### Good Commit Messages

✅ **Clear and descriptive:**
```
Add batch operation support to data commands

- Implement batch-write functionality
- Support multiple range updates in single API call
- Add batch operation examples to docs
```

✅ **Explains WHY, not just WHAT:**
```
Refactor API client to use axios instead of fetch

- axios provides better error handling
- Supports request/response interceptors
- Simplifies retry logic for rate limiting
```

✅ **Groups related changes:**
```
Implement visual screenshot tools

- Add Playwright integration
- Create screenshot command
- Add visual comparison utilities
- Update dependencies with playwright
```

### Bad Commit Messages

❌ **Too vague:**
```
Update files
```

❌ **No detail:**
```
Fix bug
```

❌ **Not descriptive:**
```
Changes
```

## Determining What Changed

To write a good commit message, identify what was modified:

```bash
# See which files changed
git status

# See summary of changes by file
git diff --stat

# See what changed in specific file
git diff src/commands/data.ts
```

Use this information to craft a descriptive commit message.

## Error Handling

### "Nothing to commit"

If git says "nothing to commit, working tree clean":
- ✅ This is fine - no changes were made
- ✅ Skip the commit/push step
- ✅ Inform user that no commit was needed

### "Push rejected"

If push is rejected due to remote changes:

```bash
# Pull remote changes first
git pull origin main

# Then push again
git push origin main
```

### "Merge conflicts"

If there are merge conflicts after pulling:
1. ⚠️ **Stop and inform the user**
2. Don't attempt automatic resolution
3. Let user handle conflicts manually

## When to Invoke This Skill

**Automatic triggers:**
- After completing a feature implementation
- After significant refactoring
- After updating multiple files
- After fixing a bug
- After user says "commit this" or "push to github"

**Example scenarios:**

**Scenario 1: Feature completion**
```
User: "Add CSV import to the data commands"
You: [Implement feature]
You: [Invoke auto-git-push skill]
You: "✅ Feature complete and pushed to GitHub"
```

**Scenario 2: Bug fix**
```
User: "Fix the border formatting bug"
You: [Fix the bug]
You: [Run tests]
You: [Invoke auto-git-push skill]
You: "✅ Bug fixed and pushed to GitHub"
```

**Scenario 3: Documentation update**
```
User: "Update the README with the new commands"
You: [Update README.md]
You: [Invoke auto-git-push skill]
You: "✅ Documentation updated and pushed to GitHub"
```

## Workflow Summary

```
1. Complete code work
2. Check git status
3. Review changes
4. Stage changes (git add -A)
5. Commit with descriptive message
6. Push to GitHub (git push origin main)
7. Confirm success to user
```

## Tips

- **Commit often**: Better to have many small, focused commits than one giant commit
- **Descriptive messages**: Future you (and teammates) will thank you
- **One logical change per commit**: Don't mix unrelated changes
- **Test before committing**: Ensure code works before pushing
- **Check status first**: Always know what you're committing

## Example Usage

### Example 1: After Adding New Feature

```bash
# Check what changed
git status
# Shows: src/commands/visual.ts, README.md

# Generate commit message based on changes
# "Add visual screenshot commands"

# Commit and push
git add -A
git commit -m "Add visual screenshot commands

- Implement screenshot functionality with Playwright
- Add visual.ts command file
- Support full page and range screenshots
- Document screenshot commands in README.md"
git push origin main
```

### Example 2: After Bug Fix

```bash
# Check what changed
git status
# Shows: src/utils/errors.ts, src/commands/format.ts

# Commit and push
git add -A
git commit -m "Fix error handling in format commands

- Add proper error codes for format operations
- Improve error messages for invalid ranges
- Add validation before API calls"
git push origin main
```

### Example 3: After Refactoring

```bash
# Check what changed
git status
# Shows: Multiple files in src/

# Commit and push
git add -A
git commit -m "Refactor API client architecture

- Split sheets-client.ts into smaller modules
- Extract authentication logic to auth/
- Improve error handling consistency
- Add retry logic for rate limits"
git push origin main
```

## Success Criteria

After running this skill:
- ✅ Changes are committed with descriptive message
- ✅ Code is pushed to GitHub remote
- ✅ User is informed of successful push
- ✅ Working tree is clean (no uncommitted changes)

## Remember

This skill helps maintain a clean git history and ensures work is backed up to GitHub. Always write clear commit messages that explain both WHAT changed and WHY it changed.
