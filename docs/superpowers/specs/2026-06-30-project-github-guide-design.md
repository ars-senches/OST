# Project and GitHub Guide Design

Date: 2026-06-30
Project: OST / onlineslottop.com SEO workspace

## Goal

Turn the current local SEO workspace into a mature, repeatable project with clear project documentation and a practical GitHub workflow.

The result should let a future maintainer understand what the repository is for, how to run the audit, how to handle generated reports, what production-sensitive files require caution, and how changes should move through GitHub.

## Scope

In scope:

- Improve `README.md` as the short entry point.
- Expand `PROJECT_GUIDE.md` as the main operating guide.
- Add a dedicated GitHub workflow document for branches, commits, pull requests, generated reports, and release-style audit snapshots.
- Add a lightweight pull request template if it fits the repository state.
- Verify `.gitignore` covers local and sensitive files.
- Check local git identity, remote configuration, and repository status before any baseline commit or push.

Out of scope:

- Changing SEO audit logic.
- Changing the WordPress PHP snippet behavior.
- Running a fresh live crawl unless explicitly requested after documentation is in place.
- Creating a GitHub remote without repository owner/name and authentication context.

## Recommended Approach

Use a production-grade documentation baseline inside the repository:

- `README.md` stays concise and points to deeper guides.
- `PROJECT_GUIDE.md` becomes the operational source of truth.
- `GITHUB.md` or `CONTRIBUTING.md` documents the GitHub workflow.
- `.github/pull_request_template.md` is added only as a lightweight checklist, not as a heavy process layer.

This keeps daily use simple while making the repository safe to hand off or resume later.

## File Responsibilities

`README.md`:

- Explain the project in one screen.
- Show quick audit commands.
- Link to the project guide and GitHub workflow.

`PROJECT_GUIDE.md`:

- Explain the project purpose, current state, file map, and resume process.
- Document production-sensitive areas and access requirements.
- Capture known SEO status and safe next steps.
- Include GitHub setup status, but not detailed PR rules.

`GITHUB.md` or `CONTRIBUTING.md`:

- Define branch naming.
- Define commit style.
- Explain pull request expectations.
- Explain how to handle generated reports.
- Explain what should not be committed.
- Include first-time setup commands for git identity and remote.

`.github/pull_request_template.md`:

- Provide a short checklist for scope, verification, report changes, and production safety.

## Data and Workflow

Normal work should flow as:

1. Read `README.md` for orientation.
2. Read `PROJECT_GUIDE.md` before changing audit logic or WordPress snippets.
3. Create a branch for a focused change.
4. Run the relevant audit command or document why it was skipped.
5. Commit source changes and intentional report snapshots.
6. Open a pull request using the checklist.
7. Merge only after production-sensitive risks are understood.

Generated reports may be committed when they represent intentional audit snapshots. They should not be treated as invisible build artifacts because they are part of this SEO workspace's evidence trail.

## Safety Model

The WordPress snippet is production-sensitive. Documentation should make it clear that changes to `drafts/ost-seo-technical-fixes.php` require review and a rollback plan before activation.

Cache-control fixes should not be made blindly from PHP. Hosting, CDN, cache plugin, geo, currency, and personalization behavior must be understood first.

Secrets, local credentials, exports containing private data, and temporary work folders must stay out of git.

## Verification

For documentation-only changes:

- Review markdown structure and links manually.
- Run `git diff --check` to catch whitespace problems.
- Confirm `git status --short` shows only intended files.

For audit or snippet changes:

- Run `pnpm run audit:sample` first.
- Run `pnpm run audit` when a full snapshot is needed.
- Compare report deltas before deciding that a fix worked.

## Open Operational Inputs

Before a first push to GitHub, the repository still needs:

- Local git `user.name`.
- Local git `user.email`.
- GitHub remote URL.
- Confirmation of whether the first commit should include all currently staged project files.

