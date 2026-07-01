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
