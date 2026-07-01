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
