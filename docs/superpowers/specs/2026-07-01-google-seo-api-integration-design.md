# Google SEO API Integration Design

Date: 2026-07-01
Project: OST / onlineslottop.com SEO workspace

## Goal

Add a repeatable Google SEO data integration that combines Google Search Console and Google Analytics 4 data with the existing technical SEO workflow.

The integration should help prioritize SEO work by showing which URLs have search demand, organic traffic, poor CTR, weak engagement, or technical issues.

## Scope

In scope:

- Use a Google service account for non-interactive local scripts.
- Fetch Google Search Console search analytics data for `https://onlineslottop.com/`.
- Fetch Google Analytics 4 Data API reports for the configured GA4 property.
- Generate JSON and Markdown reports under `reports/`.
- Add package scripts for running the Google SEO report.
- Add documentation for required Google Cloud, Search Console, GA4, and local environment setup.
- Keep credentials and local environment files out of git.

Out of scope:

- Changing the existing technical crawler behavior.
- Creating or managing Google Cloud resources through code.
- Committing service account JSON credentials or OAuth token files.
- Building a dashboard UI.
- Automatically mutating WordPress, Rank Math, Search Console, or GA4 settings.

## Authentication

The integration will use a Google service account.

Required local environment variables:

- `GOOGLE_APPLICATION_CREDENTIALS`: absolute path to the service account JSON key file.
- `GA4_PROPERTY_ID`: numeric GA4 property ID, without the `properties/` prefix.
- `GSC_SITE_URL`: Search Console property URL, defaulting to `https://onlineslottop.com/`.
- `GOOGLE_SEO_START_DATE`: optional report start date, defaulting to `28daysAgo`.
- `GOOGLE_SEO_END_DATE`: optional report end date, defaulting to `yesterday`.

The service account email must be granted read access in:

- Google Analytics 4 property access management.
- Google Search Console property users and permissions.

## Architecture

Create `tools/google_seo_insights.mjs` as a focused report generator.

The script will:

1. Load local environment variables from `.env` if present.
2. Validate required configuration.
3. Create authenticated Google API clients from Application Default Credentials.
4. Query Search Console search analytics.
5. Query GA4 Data API.
6. Normalize page URLs for comparison.
7. Read the latest technical audit JSON when available.
8. Produce a combined report object.
9. Write:
   - `reports/onlineslottop-google-seo-insights.json`
   - `reports/onlineslottop-google-seo-insights.md`

## Data Sources

Search Console queries:

- Query by `page` and `query` for top organic search opportunities.
- Query by `page` for page-level clicks, impressions, CTR, and average position.
- Query by `query` for keyword-level search demand.

GA4 reports:

- Organic landing pages with sessions, active users, screen/page views, engagement rate, and average session duration when available.
- Top pages by views and active users.

Technical audit enrichment:

- Load `reports/onlineslottop-technical-seo-audit.json`.
- Join by normalized URL where possible.
- Surface URLs that have both technical issues and meaningful search/traffic signals.

## Report Output

Markdown sections:

- Configuration and date range.
- Executive summary.
- Search Console top pages.
- Search Console low CTR opportunities.
- Search Console striking distance keywords and pages.
- GA4 organic landing pages.
- URLs with technical issues and Google demand.
- Data quality notes and next steps.

JSON structure:

- `generatedAt`
- `config`
- `searchConsole`
- `analytics`
- `technicalAudit`
- `opportunities`
- `warnings`

## Error Handling

The script should fail fast for missing required credentials or `GA4_PROPERTY_ID`.

The script should continue with warnings when:

- Search Console access is unavailable.
- GA4 access is unavailable.
- Technical audit JSON is missing or malformed.
- A metric or dimension is unavailable for the GA4 property.

If both Google APIs fail, the script should exit non-zero.

## Security

Do not commit:

- Service account JSON files.
- `.env`.
- OAuth tokens.
- Any local Google credential cache.

Add `.env.example` with safe placeholder values.

Update `.gitignore` to cover common Google credential file names and local credential folders.

## Package Scripts

Add:

- `google:seo`: run the Google SEO insights report.

Keep existing:

- `audit`
- `audit:sample`

## Verification

Before credentials are available:

- Run a configuration validation mode or run the script with missing env and confirm it exits with a clear error.
- Run `git diff --check`.
- Confirm credential files are ignored.

After credentials are available:

- Run `pnpm run google:seo`.
- Confirm both JSON and Markdown reports are written.
- Confirm reports do not contain secrets.
- Compare high-priority URLs against the existing technical audit report.

## Open Inputs

The implementation requires the user to provide:

- Service account JSON file path.
- GA4 property ID.
- Confirmation that the service account has access to GA4.
- Confirmation that the service account has access to the Search Console property.

