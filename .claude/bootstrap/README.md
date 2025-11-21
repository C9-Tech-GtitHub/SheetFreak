# Claude Code Bootstrap System

## 🚀 Quick Start

1. **Invoke the bootstrap agent:**
   ```
   > Use the project-bootstrap agent to set up this project
   ```

2. **Answer questions about your tech stack**

3. **Get your custom CLAUDE.md + subagents instantly!**

4. **Commit to git:**
   ```bash
   git add CLAUDE.md .claude/
   git commit -m "feat: Add Claude Code configuration"
   ```

## 🎯 What Gets Generated

**Always:**
- CLAUDE.md (main configuration)
- general-assistant (day-to-day development)

**Conditional (based on your answers):**
- database-specialist (if using database)
- playwright-tester (if E2E testing)
- deployment-specialist (if deployment automation)
- ai-integration-specialist (if AI features)
- project-planner (if complex project)

## 📚 Examples

**Simple React App:**
- general-assistant
- deployment-specialist (Netlify)

**Full-Stack SaaS:**
- general-assistant
- database-specialist (Supabase)
- playwright-tester
- deployment-specialist (Vercel)
- ai-integration-specialist (OpenAI)
- project-planner

**Python API:**
- general-assistant
- database-specialist (PostgreSQL)
- deployment-specialist (Docker)

## 💡 Tips

- Start minimal - add specialists later if needed
- Customize generated files for your team
- Keep .claude/ in git for team consistency
- Re-run bootstrap if your stack changes

## 🔄 Re-running Bootstrap

```bash
# Backup current config
mv CLAUDE.md CLAUDE.md.backup
mv .claude/agents .claude/agents.backup

# Re-run bootstrap agent
> Use the project-bootstrap agent to set up this project

# Compare and merge
diff CLAUDE.md CLAUDE.md.backup
```

## 📖 Learn More

- [Subagents Docs](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Docs](https://code.claude.com/docs)

---

**Installed with claude-bootstrap-installer.sh v1.0.0**
