# Project GitHub Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a mature project documentation and GitHub workflow baseline for the OST SEO workspace.

**Architecture:** Keep `README.md` as the concise entry point, `PROJECT_GUIDE.md` as the operating guide, and `CONTRIBUTING.md` as the GitHub workflow contract. Add a lightweight pull request checklist under `.github/` and keep generated SEO reports as intentional evidence snapshots.

**Tech Stack:** Markdown documentation, git, Node.js package scripts already defined in `package.json`.

---

## File Structure

- Modify `README.md`: short project overview, quick commands, and links to deeper docs.
- Modify `PROJECT_GUIDE.md`: operational project guide with status, safety, access, and next-work instructions.
- Create `CONTRIBUTING.md`: branch, commit, pull request, generated report, and first-time setup rules.
- Create `.github/pull_request_template.md`: concise PR checklist for scope, verification, report snapshots, and production safety.
- Modify `.gitignore`: keep local, secret, dependency, and temporary files out of git.
- Verify git repository state: confirm intended staged/unstaged files, local identity, and remote status.

### Task 1: README Entry Point

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README with a concise entry point**

Write `README.md` with:

```markdown
# OST SEO Workspace

Technical SEO workspace for `onlineslottop.com`.

This repository keeps the audit repeatable, the WordPress/Rank Math draft fixes reviewable, and the next SEO pass easy to continue.

## Start Here

- Project operating guide: [`PROJECT_GUIDE.md`](PROJECT_GUIDE.md)
- GitHub workflow: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Main human report: [`reports/onlineslottop-seo-audit-ru.md`](reports/onlineslottop-seo-audit-ru.md)

## Quick Commands

Sample crawl:

```bash
pnpm run audit:sample
```

Full crawl:

```bash
pnpm run audit
```

Codex desktop fallback when `node` is not in `PATH`:

```bash
MAX_URLS=25 CONCURRENCY=4 /Users/arseniy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tools/seo_audit_onlineslottop.mjs
```

Both audit commands overwrite:

- `reports/onlineslottop-technical-seo-audit.json`
- `reports/onlineslottop-technical-seo-audit.md`

Commit generated reports only when they are intentional audit snapshots.
```

- [ ] **Step 2: Review README**

Run: `sed -n '1,220p' README.md`
Expected: README includes links to `PROJECT_GUIDE.md`, `CONTRIBUTING.md`, and the main report.

### Task 2: Project Operating Guide

**Files:**
- Modify: `PROJECT_GUIDE.md`

- [ ] **Step 1: Rewrite guide with operational sections**

Keep the existing facts and expand the guide with these sections:

```markdown
# Project Guide: OST / onlineslottop.com SEO

Last workspace refresh: 2026-06-30 11:15 EEST.

## Purpose

This project stores technical SEO audit assets and WordPress/Rank Math draft fixes for `https://onlineslottop.com`.

Primary goal: keep the audit repeatable, keep production-sensitive changes reviewable in git, and make the next SEO pass easy to continue without relying on loose files in Downloads.

## Canonical Workspace

- Canonical local path: `/Users/arseniy/Documents/OST`.
- Original source copied from `/Users/arseniy/Downloads/OST`; the Downloads folder was left untouched.
- A working assembly copy also exists at `/Users/arseniy/Documents/Codex/2026-06-30/new-chat/OST`.
- File permissions were normalized for the working copy.
- macOS quarantine attributes were removed from the working copy.
- Codex config marks `/Users/arseniy/Documents/OST` as a trusted project.

## Project Map

| Path | Role |
| --- | --- |
| `README.md` | Short entry point and quick commands. |
| `CONTRIBUTING.md` | GitHub workflow and collaboration rules. |
| `.github/pull_request_template.md` | Pull request checklist. |
| `tools/seo_audit_onlineslottop.mjs` | Repeatable Node.js crawler/audit script. |
| `drafts/ost-seo-technical-fixes.php` | WordPress Code Snippets draft for Rank Math metadata cleanup, sitemap exclusions, and H1 output-buffer fallback. |
| `reports/onlineslottop-seo-audit-ru.md` | Human-readable Russian project report with history, findings, and post-activation status. Start here when resuming SEO work. |
| `reports/onlineslottop-technical-seo-audit.md` | Generated markdown report from the latest machine crawl. |
| `reports/onlineslottop-technical-seo-audit.json` | Full generated crawl data. Useful for diffing issue counts and drilling into individual URLs. |
| `package.json` | Convenience scripts for full and sampled audits. |

## Resume Checklist

1. Read `reports/onlineslottop-seo-audit-ru.md`.
2. Check current git status with `git status --short`.
3. Run `pnpm run audit:sample` for a smoke crawl when live checks are needed.
4. Run `pnpm run audit` only when a full fresh snapshot is needed.
5. Compare generated report deltas before changing snippets, theme files, plugin settings, or hosting/cache settings.
6. Commit generated report changes only when they are intentional audit evidence.

## Known Status From The Existing Report

Already improved after the 2026-06-15 test activation:

- `redirect_in_sitemap`: 11 -> 0.
- `missing_description`: 249 -> 0.
- `duplicate_description`: 15 -> 0.
- `missing_h1`: 419 -> 20.
- `%sitename%` disappeared from NoLimit City title, OpenGraph title, and JSON-LD `CollectionPage.name`.

Still open:

- Public HTML still sends `cache-control: no-cache, no-store, must-revalidate`.
- 20 pages still lack H1.
- 2 long descriptions remain on blog posts.
- 4 duplicate titles remain across `genres/themes` and `themes/bonuses` pairs.
- Image alt coverage remains noisy and should be triaged separately.

## Production Safety

- Treat `drafts/ost-seo-technical-fixes.php` as production-sensitive.
- Test snippet changes on staging or keep Code Snippets safe mode and rollback access available.
- Do not solve cache-control from PHP until hosting, CDN, cache plugin, geo, currency, and personalization behavior are understood.
- Prefer moving durable H1 fixes into templates or theme/plugin code instead of relying indefinitely on output buffering.
- Never commit secrets, private exports, WordPress credentials, database dumps, or local environment files.

## Access Checklist

Needed to continue safely:

- WordPress admin for `onlineslottop.com`.
- Code Snippets access, especially snippet `OST Technical SEO Fixes - Draft` / ID `6` if it still exists.
- Rank Math admin settings for sitemap exclusions, SEO templates, title/description variables, and cache flushing.
- Hosting/CDN/cache plugin access for HTML cache headers.
- SFTP/SSH or theme repository access if H1 fixes move from output buffering into templates.
- GitHub repository access for versioning this workspace and coordinating future changes.

## GitHub Status

- Local repository exists on branch `main`.
- A design/spec commit exists for the documentation baseline.
- No GitHub remote was configured at the time of this guide update.
- Git author identity should be set explicitly before official baseline commits and pushes.

Recommended local identity commands:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

Recommended remote setup after creating the GitHub repository:

```bash
git remote add origin git@github.com:<owner>/<repo>.git
git push -u origin main
```

See `CONTRIBUTING.md` for daily GitHub workflow.
```

- [ ] **Step 2: Review guide**

Run: `sed -n '1,260p' PROJECT_GUIDE.md`
Expected: guide includes Purpose, Canonical Workspace, Project Map, Resume Checklist, Production Safety, Access Checklist, and GitHub Status.

### Task 3: GitHub Workflow Document

**Files:**
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Create CONTRIBUTING.md**

Write `CONTRIBUTING.md` with:

```markdown
# Contributing and GitHub Workflow

This repository is a technical SEO workspace for `onlineslottop.com`. Treat it as an audit trail and a review surface for production-sensitive SEO changes.

## Branches

- `main` is the stable baseline.
- Use focused branches for work:
  - `docs/<topic>` for documentation.
  - `audit/<topic>` for crawler/report work.
  - `snippet/<topic>` for WordPress snippet drafts.
  - `fix/<topic>` for small corrections.

## Commits

Use short conventional-style commit messages:

- `docs: update project guide`
- `audit: refresh technical seo report`
- `snippet: adjust rank math metadata fallback`
- `fix: ignore local temp files`

Keep commits focused. Do not mix generated report snapshots with unrelated snippet or documentation edits unless the report is the verification evidence for that exact change.

## Pull Requests

Every pull request should explain:

- What changed.
- Why it changed.
- How it was verified.
- Whether generated reports changed intentionally.
- Whether the change can affect production WordPress behavior.

For `drafts/ost-seo-technical-fixes.php`, include the rollout and rollback plan before activation.

## Generated Reports

The audit script overwrites:

- `reports/onlineslottop-technical-seo-audit.json`
- `reports/onlineslottop-technical-seo-audit.md`

Commit these files when they are intentional audit snapshots. Revert or leave them unstaged when they changed only because of an exploratory run.

Before claiming an SEO fix worked, compare the new report against the previous snapshot and call out the changed issue counts.

## Local Setup

Install dependencies if needed:

```bash
pnpm install
```

Run a sample audit:

```bash
pnpm run audit:sample
```

Run a full audit:

```bash
pnpm run audit
```

## First-Time Git Setup

Set a real local author identity before official commits:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

Add the GitHub remote after the repository exists:

```bash
git remote add origin git@github.com:<owner>/<repo>.git
git push -u origin main
```

Use HTTPS instead of SSH only if that is the intended access pattern:

```bash
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

## Do Not Commit

- `.env` files.
- WordPress credentials.
- Database dumps.
- Hosting, SFTP, SSH, or API secrets.
- Private exports with user or financial data.
- Local scratch folders such as `tmp/` and `work/`.
- `node_modules/`.

## Production Safety

Do not activate WordPress snippet changes directly from a pull request without checking access, rollback, and cache behavior.

Do not patch cache-control behavior from PHP until hosting/CDN/cache plugin behavior is understood.
```

- [ ] **Step 2: Review workflow document**

Run: `sed -n '1,260p' CONTRIBUTING.md`
Expected: document includes branches, commits, PRs, generated reports, local setup, first-time git setup, and production safety.

### Task 4: Pull Request Template and Gitignore

**Files:**
- Create: `.github/pull_request_template.md`
- Modify: `.gitignore`

- [ ] **Step 1: Create pull request template**

Write `.github/pull_request_template.md` with:

```markdown
## Summary

- 

## Verification

- [ ] Documentation reviewed
- [ ] `git diff --check` passes
- [ ] `pnpm run audit:sample` run, or not needed for this change
- [ ] Full audit run, or not needed for this change

## Generated Reports

- [ ] No generated reports changed
- [ ] Generated report changes are intentional audit snapshots

## Production Safety

- [ ] No production-sensitive WordPress behavior changed
- [ ] WordPress snippet changes include rollout and rollback notes
- [ ] Cache-control behavior was not changed blindly from PHP
```

- [ ] **Step 2: Expand .gitignore**

Set `.gitignore` to:

```gitignore
.DS_Store
node_modules/

.env
.env.*
!.env.example

*.log
npm-debug.log*
pnpm-debug.log*

tmp/
work/
.cache/

*.sql
*.sql.gz
*.dump
*.zip
*.tar
*.tar.gz
```

- [ ] **Step 3: Review files**

Run: `sed -n '1,220p' .github/pull_request_template.md`
Expected: template includes Summary, Verification, Generated Reports, and Production Safety.

Run: `sed -n '1,120p' .gitignore`
Expected: gitignore covers local OS files, dependencies, env files, logs, scratch folders, and dumps.

### Task 5: Verification and Git Baseline

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run markdown and whitespace checks**

Run: `git diff --check`
Expected: no output and exit code 0.

- [ ] **Step 2: Check git status**

Run: `git status --short`
Expected: only intended project files are staged or modified.

- [ ] **Step 3: Check git identity and remote**

Run:

```bash
git config --get user.name
git config --get user.email
git remote -v
```

Expected: real user identity and a GitHub remote if baseline push is requested. If identity or remote is missing, document the blocker instead of guessing.

- [ ] **Step 4: Commit documentation baseline when identity is acceptable**

Run:

```bash
git add README.md PROJECT_GUIDE.md CONTRIBUTING.md .github/pull_request_template.md .gitignore
git commit -m "docs: add project and github guides"
```

Expected: commit succeeds.

- [ ] **Step 5: Commit initial project files when requested**

Run:

```bash
git add drafts package.json pnpm-lock.yaml reports tools
git commit -m "chore: add initial seo workspace"
```

Expected: commit succeeds.

- [ ] **Step 6: Push only when remote exists and user wants it**

Run:

```bash
git push -u origin main
```

Expected: branch `main` is pushed to GitHub. If remote is missing, report the exact `git remote add origin ...` command shape instead.

