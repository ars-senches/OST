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
- Git author identity is configured locally as `Arsen Po <ars@biggame.solutions>`.
- GitHub repository: `https://github.com/ars-senches/OST`.
- Baseline commits include the design/spec, project/GitHub guides, and initial SEO workspace files.

Expected remote setup:

```bash
git remote add origin https://github.com/ars-senches/OST.git
git push -u origin main
```

See `CONTRIBUTING.md` for daily GitHub workflow.
