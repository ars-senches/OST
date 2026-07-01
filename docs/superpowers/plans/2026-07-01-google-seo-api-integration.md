# Google SEO API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a service-account based Google Search Console and GA4 reporting script that produces repeatable SEO insight reports for `onlineslottop.com`.

**Architecture:** Add one focused Node.js CLI script, `tools/google_seo_insights.mjs`, that loads local `.env` values, authenticates through `GOOGLE_APPLICATION_CREDENTIALS`, fetches Search Console and GA4 data, enriches it with the existing technical audit JSON, and writes JSON/Markdown reports. Keep credentials local and ignored, while committing `.env.example`, docs, scripts, and report generator code.

**Tech Stack:** Node.js ESM, `googleapis`, existing `pnpm` package scripts, Markdown/JSON reports.

---

## File Structure

- Create `tools/google_seo_insights.mjs`: Google SEO insights CLI and report generator.
- Create `.env.example`: safe local configuration template.
- Modify `.gitignore`: ignore Google credential JSONs and local credential caches.
- Modify `package.json`: add `google:seo` script and `googleapis` dependency.
- Modify `README.md`: add Google SEO report command.
- Modify `PROJECT_GUIDE.md`: add Google API setup and report workflow notes.
- Generated later, not committed unless intentionally captured:
  - `reports/onlineslottop-google-seo-insights.json`
  - `reports/onlineslottop-google-seo-insights.md`

### Task 1: Local Configuration and Dependency Setup

**Files:**
- Create: `.env.example`
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Create `.env.example`**

Create `.env.example` with:

```dotenv
# Absolute path to the Google service account JSON key.
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/onlineslottop-service-account.json

# Numeric GA4 property ID, without the "properties/" prefix.
GA4_PROPERTY_ID=123456789

# Search Console property URL.
GSC_SITE_URL=https://onlineslottop.com/

# Optional reporting dates.
GOOGLE_SEO_START_DATE=28daysAgo
GOOGLE_SEO_END_DATE=yesterday
```

- [ ] **Step 2: Update `.gitignore`**

Ensure `.gitignore` contains:

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

# Google API credentials and local auth caches.
*service-account*.json
*service_account*.json
*google-credentials*.json
*credentials*.json
.google/
google-credentials/
```

- [ ] **Step 3: Add `googleapis` dependency**

Run:

```bash
pnpm add googleapis
```

Expected: `package.json` gains a `dependencies.googleapis` entry and `pnpm-lock.yaml` updates.

If `pnpm` is not in `PATH`, run:

```bash
/Users/arseniy/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm add googleapis
```

- [ ] **Step 4: Add package script**

Set `package.json` scripts to include:

```json
{
  "scripts": {
    "audit": "node tools/seo_audit_onlineslottop.mjs",
    "audit:sample": "MAX_URLS=25 CONCURRENCY=4 node tools/seo_audit_onlineslottop.mjs",
    "google:seo": "node tools/google_seo_insights.mjs"
  }
}
```

- [ ] **Step 5: Verify config files**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; `.env.example`, `.gitignore`, `package.json`, and `pnpm-lock.yaml` are changed.

### Task 2: Implement Google SEO Insights CLI

**Files:**
- Create: `tools/google_seo_insights.mjs`

- [ ] **Step 1: Create full script**

Create `tools/google_seo_insights.mjs` with:

```js
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { google } from "googleapis";

const SITE = "https://onlineslottop.com/";
const REPORT_DIR = path.resolve("reports");
const TECHNICAL_AUDIT_JSON = path.join(REPORT_DIR, "onlineslottop-technical-seo-audit.json");
const JSON_OUT = path.join(REPORT_DIR, "onlineslottop-google-seo-insights.json");
const MD_OUT = path.join(REPORT_DIR, "onlineslottop-google-seo-insights.md");
const MAX_ROWS = Number(process.env.GOOGLE_SEO_MAX_ROWS || "250");

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const index = trimmed.indexOf("=");
  if (index === -1) return null;
  const key = trimmed.slice(0, index).trim();
  let value = trimmed.slice(index + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

async function loadDotEnv(file = ".env") {
  try {
    const text = await fs.readFile(file, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (parsed && !process.env[parsed.key]) process.env[parsed.key] = parsed.value;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function readConfig() {
  const config = {
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
    ga4PropertyId: process.env.GA4_PROPERTY_ID || "",
    gscSiteUrl: process.env.GSC_SITE_URL || SITE,
    startDate: process.env.GOOGLE_SEO_START_DATE || "28daysAgo",
    endDate: process.env.GOOGLE_SEO_END_DATE || "yesterday",
  };

  const missing = [];
  if (!config.credentialsPath) missing.push("GOOGLE_APPLICATION_CREDENTIALS");
  if (!config.ga4PropertyId) missing.push("GA4_PROPERTY_ID");

  if (missing.length) {
    const message = [
      `Missing required environment variable(s): ${missing.join(", ")}`,
      "Create .env from .env.example and make sure the service account has GA4 and Search Console read access.",
    ].join("\n");
    const error = new Error(message);
    error.code = "CONFIG_ERROR";
    throw error;
  }

  return config;
}

function normalizeUrl(raw) {
  if (!raw) return "";
  try {
    const url = new URL(raw, SITE);
    url.hash = "";
    url.search = "";
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname !== "/" && url.pathname.endsWith("/")) url.pathname = url.pathname.slice(0, -1);
    return url.toString();
  } catch {
    return String(raw).trim();
  }
}

function numberValue(value) {
  const parsed = Number(value || "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function percent(value) {
  if (!Number.isFinite(value)) return "0.00%";
  return `${(value * 100).toFixed(2)}%`;
}

function fixed(value, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.00";
}

function markdownTable(headers, rows) {
  if (!rows.length) return "_No data._\n";
  const escape = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  return [
    `| ${headers.map(escape).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escape).join(" | ")} |`),
    "",
  ].join("\n");
}

async function createGoogleClients() {
  const auth = new google.auth.GoogleAuth({
    scopes: [
      "https://www.googleapis.com/auth/webmasters.readonly",
      "https://www.googleapis.com/auth/analytics.readonly",
    ],
  });
  const authClient = await auth.getClient();
  return {
    searchConsole: google.searchconsole({ version: "v1", auth: authClient }),
    analyticsData: google.analyticsdata({ version: "v1beta", auth: authClient }),
  };
}

async function querySearchConsole(searchConsole, config, dimensions) {
  const response = await searchConsole.searchanalytics.query({
    siteUrl: config.gscSiteUrl,
    requestBody: {
      startDate: config.startDate,
      endDate: config.endDate,
      dimensions,
      rowLimit: MAX_ROWS,
    },
  });
  return response.data.rows || [];
}

function mapSearchConsoleRows(rows, dimensions) {
  return rows.map((row) => {
    const keys = row.keys || [];
    const item = {
      clicks: numberValue(row.clicks),
      impressions: numberValue(row.impressions),
      ctr: numberValue(row.ctr),
      position: numberValue(row.position),
    };
    dimensions.forEach((dimension, index) => {
      item[dimension] = keys[index] || "";
    });
    if (item.page) item.normalizedPage = normalizeUrl(item.page);
    return item;
  });
}

async function fetchSearchConsole(searchConsole, config) {
  const [pageRows, queryRows, pageQueryRows] = await Promise.all([
    querySearchConsole(searchConsole, config, ["page"]),
    querySearchConsole(searchConsole, config, ["query"]),
    querySearchConsole(searchConsole, config, ["page", "query"]),
  ]);
  return {
    pages: mapSearchConsoleRows(pageRows, ["page"]),
    queries: mapSearchConsoleRows(queryRows, ["query"]),
    pageQueries: mapSearchConsoleRows(pageQueryRows, ["page", "query"]),
  };
}

async function runGa4Report(analyticsData, config, { dimensions, metrics, dimensionFilter }) {
  const [response] = await analyticsData.properties.runReport({
    property: `properties/${config.ga4PropertyId}`,
    requestBody: {
      dateRanges: [{ startDate: config.startDate, endDate: config.endDate }],
      dimensions: dimensions.map((name) => ({ name })),
      metrics: metrics.map((name) => ({ name })),
      dimensionFilter,
      limit: MAX_ROWS,
    },
  });
  return response;
}

function mapGa4Rows(response, dimensions, metrics) {
  return (response.rows || []).map((row) => {
    const item = {};
    dimensions.forEach((name, index) => {
      item[name] = row.dimensionValues?.[index]?.value || "";
    });
    metrics.forEach((name, index) => {
      item[name] = numberValue(row.metricValues?.[index]?.value);
    });
    if (item.landingPagePlusQueryString) {
      item.page = new URL(item.landingPagePlusQueryString, SITE).toString();
      item.normalizedPage = normalizeUrl(item.page);
    }
    if (item.pagePathPlusQueryString) {
      item.page = new URL(item.pagePathPlusQueryString, SITE).toString();
      item.normalizedPage = normalizeUrl(item.page);
    }
    return item;
  });
}

async function fetchAnalytics(analyticsData, config) {
  const organicLanding = await runGa4Report(analyticsData, config, {
    dimensions: ["landingPagePlusQueryString", "sessionDefaultChannelGroup"],
    metrics: ["sessions", "activeUsers", "screenPageViews", "engagementRate", "averageSessionDuration"],
    dimensionFilter: {
      filter: {
        fieldName: "sessionDefaultChannelGroup",
        stringFilter: { matchType: "EXACT", value: "Organic Search" },
      },
    },
  });

  const topPages = await runGa4Report(analyticsData, config, {
    dimensions: ["pagePathPlusQueryString"],
    metrics: ["screenPageViews", "activeUsers", "engagementRate"],
  });

  return {
    organicLandingPages: mapGa4Rows(
      organicLanding,
      ["landingPagePlusQueryString", "sessionDefaultChannelGroup"],
      ["sessions", "activeUsers", "screenPageViews", "engagementRate", "averageSessionDuration"]
    ),
    topPages: mapGa4Rows(topPages, ["pagePathPlusQueryString"], [
      "screenPageViews",
      "activeUsers",
      "engagementRate",
    ]),
  };
}

async function readTechnicalAudit() {
  try {
    const data = JSON.parse(await fs.readFile(TECHNICAL_AUDIT_JSON, "utf8"));
    const pages = Array.isArray(data.pages) ? data.pages : [];
    const byUrl = new Map();
    for (const page of pages) {
      const key = normalizeUrl(page.finalUrl || page.url || page.requestedUrl);
      if (key) byUrl.set(key, page);
    }
    return {
      loaded: true,
      pageCount: pages.length,
      byUrl,
    };
  } catch (error) {
    return {
      loaded: false,
      pageCount: 0,
      byUrl: new Map(),
      warning: `Technical audit JSON unavailable: ${error.message}`,
    };
  }
}

function buildOpportunities(searchConsole, analytics, technicalAudit) {
  const gaByPage = new Map();
  for (const row of analytics.organicLandingPages || []) {
    if (row.normalizedPage) gaByPage.set(row.normalizedPage, row);
  }

  const lowCtrPages = (searchConsole.pages || [])
    .filter((row) => row.impressions >= 100 && row.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);

  const strikingDistance = (searchConsole.pageQueries || [])
    .filter((row) => row.position >= 4 && row.position <= 15 && row.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);

  const technicalDemand = (searchConsole.pages || [])
    .map((row) => {
      const technical = technicalAudit.byUrl.get(row.normalizedPage);
      const analyticsRow = gaByPage.get(row.normalizedPage);
      const issues = technical?.issues || [];
      return {
        ...row,
        sessions: analyticsRow?.sessions || 0,
        activeUsers: analyticsRow?.activeUsers || 0,
        issueCount: issues.length,
        highIssues: issues.filter((issue) => ["critical", "high"].includes(issue.severity)).length,
        issueCodes: issues.map((issue) => issue.code).slice(0, 8),
      };
    })
    .filter((row) => row.issueCount > 0 && (row.impressions >= 25 || row.sessions >= 10))
    .sort((a, b) => b.highIssues - a.highIssues || b.impressions - a.impressions)
    .slice(0, 30);

  return {
    lowCtrPages,
    strikingDistance,
    technicalDemand,
  };
}

function summarize(report) {
  const gscPages = report.searchConsole.pages || [];
  const gaLanding = report.analytics.organicLandingPages || [];
  const clicks = gscPages.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = gscPages.reduce((sum, row) => sum + row.impressions, 0);
  const sessions = gaLanding.reduce((sum, row) => sum + row.sessions, 0);
  return {
    gscPageRows: gscPages.length,
    gscClicks: clicks,
    gscImpressions: impressions,
    gscCtr: impressions ? clicks / impressions : 0,
    organicLandingRows: gaLanding.length,
    organicSessions: sessions,
    technicalAuditLoaded: report.technicalAudit.loaded,
    technicalAuditPages: report.technicalAudit.pageCount,
  };
}

function renderMarkdown(report) {
  const summary = summarize(report);
  const warnings = report.warnings.length
    ? report.warnings.map((warning) => `- ${warning}`).join("\n")
    : "- None";

  const topPages = (report.searchConsole.pages || []).slice(0, 20).map((row) => [
    row.page,
    row.clicks,
    row.impressions,
    percent(row.ctr),
    fixed(row.position, 1),
  ]);

  const lowCtr = report.opportunities.lowCtrPages.map((row) => [
    row.page,
    row.clicks,
    row.impressions,
    percent(row.ctr),
    fixed(row.position, 1),
  ]);

  const striking = report.opportunities.strikingDistance.map((row) => [
    row.query,
    row.page,
    row.clicks,
    row.impressions,
    percent(row.ctr),
    fixed(row.position, 1),
  ]);

  const gaLanding = (report.analytics.organicLandingPages || []).slice(0, 20).map((row) => [
    row.page,
    row.sessions,
    row.activeUsers,
    row.screenPageViews,
    percent(row.engagementRate),
    fixed(row.averageSessionDuration, 1),
  ]);

  const technicalDemand = report.opportunities.technicalDemand.map((row) => [
    row.page,
    row.clicks,
    row.impressions,
    row.sessions,
    row.issueCount,
    row.highIssues,
    row.issueCodes.join(", "),
  ]);

  return `# Google SEO Insights: onlineslottop.com

Generated: ${report.generatedAt}

Date range: ${report.config.startDate} to ${report.config.endDate}

## Executive Summary

- Search Console page rows: ${summary.gscPageRows}
- Search Console clicks: ${summary.gscClicks}
- Search Console impressions: ${summary.gscImpressions}
- Search Console CTR: ${percent(summary.gscCtr)}
- GA4 organic landing rows: ${summary.organicLandingRows}
- GA4 organic sessions: ${summary.organicSessions}
- Technical audit loaded: ${summary.technicalAuditLoaded ? "yes" : "no"}
- Technical audit pages: ${summary.technicalAuditPages}

## Data Quality Notes

${warnings}

## Search Console Top Pages

${markdownTable(["Page", "Clicks", "Impressions", "CTR", "Avg Position"], topPages)}
## Low CTR Opportunities

${markdownTable(["Page", "Clicks", "Impressions", "CTR", "Avg Position"], lowCtr)}
## Striking Distance Queries

${markdownTable(["Query", "Page", "Clicks", "Impressions", "CTR", "Avg Position"], striking)}
## GA4 Organic Landing Pages

${markdownTable(["Page", "Sessions", "Active Users", "Views", "Engagement Rate", "Avg Session Duration"], gaLanding)}
## Technical Issues With Google Demand

${markdownTable(["Page", "Clicks", "Impressions", "Sessions", "Issues", "High/Critical", "Issue Codes"], technicalDemand)}
## Next Steps

- Prioritize pages that appear in both Low CTR Opportunities and Technical Issues With Google Demand.
- Review striking-distance query/page pairs for title, description, internal linking, and content alignment.
- Compare this report with \`reports/onlineslottop-technical-seo-audit.md\` before changing WordPress snippets or templates.
`;
}

async function writeReports(report) {
  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(MD_OUT, renderMarkdown(report));
}

async function main() {
  await loadDotEnv();
  const config = readConfig();
  const warnings = [];
  const clients = await createGoogleClients();

  let searchConsole = { pages: [], queries: [], pageQueries: [] };
  let analytics = { organicLandingPages: [], topPages: [] };
  let gscOk = false;
  let gaOk = false;

  try {
    searchConsole = await fetchSearchConsole(clients.searchConsole, config);
    gscOk = true;
  } catch (error) {
    warnings.push(`Search Console unavailable: ${error.message}`);
  }

  try {
    analytics = await fetchAnalytics(clients.analyticsData, config);
    gaOk = true;
  } catch (error) {
    warnings.push(`GA4 unavailable: ${error.message}`);
  }

  if (!gscOk && !gaOk) {
    throw new Error(`Both Google APIs failed:\n${warnings.join("\n")}`);
  }

  const technicalAudit = await readTechnicalAudit();
  if (technicalAudit.warning) warnings.push(technicalAudit.warning);

  const report = {
    generatedAt: new Date().toISOString(),
    config: {
      ga4PropertyId: config.ga4PropertyId,
      gscSiteUrl: config.gscSiteUrl,
      startDate: config.startDate,
      endDate: config.endDate,
      maxRows: MAX_ROWS,
    },
    searchConsole,
    analytics,
    technicalAudit: {
      loaded: technicalAudit.loaded,
      pageCount: technicalAudit.pageCount,
    },
    opportunities: buildOpportunities(searchConsole, analytics, technicalAudit),
    warnings,
  };

  await writeReports(report);
  console.log(`Wrote ${JSON_OUT}`);
  console.log(`Wrote ${MD_OUT}`);
  if (warnings.length) {
    console.warn("Warnings:");
    for (const warning of warnings) console.warn(`- ${warning}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = error.code === "CONFIG_ERROR" ? 2 : 1;
});
```

- [ ] **Step 2: Run missing-config validation**

Run:

```bash
node tools/google_seo_insights.mjs
```

Expected without `.env`: exit code 2 and message containing:

```text
Missing required environment variable(s): GOOGLE_APPLICATION_CREDENTIALS, GA4_PROPERTY_ID
```

If `node` is not in `PATH`, run:

```bash
/Users/arseniy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tools/google_seo_insights.mjs
```

### Task 3: Documentation Updates

**Files:**
- Modify: `README.md`
- Modify: `PROJECT_GUIDE.md`
- Modify: `CONTRIBUTING.md`

- [ ] **Step 1: Update `README.md` commands**

Add after the existing audit commands:

````markdown
Google SEO insights report:

```bash
pnpm run google:seo
```

This requires local Google service account configuration. See `PROJECT_GUIDE.md`.
````

- [ ] **Step 2: Update `PROJECT_GUIDE.md` with Google setup**

Add a `Google SEO API Reports` section:

````markdown
## Google SEO API Reports

The Google SEO integration combines Search Console, GA4, and the latest technical audit snapshot.

Local setup requires:

- A Google service account JSON key stored outside git.
- `GOOGLE_APPLICATION_CREDENTIALS` pointing to that JSON file.
- `GA4_PROPERTY_ID` for the GA4 property.
- `GSC_SITE_URL`, normally `https://onlineslottop.com/`.
- Service account read access in GA4 property access management.
- Service account access in Search Console property users and permissions.

Run:

```bash
pnpm run google:seo
```

The command writes:

- `reports/onlineslottop-google-seo-insights.json`
- `reports/onlineslottop-google-seo-insights.md`

Do not commit service account JSON files, `.env`, OAuth tokens, or local Google credential caches.
````

- [ ] **Step 3: Update `CONTRIBUTING.md` generated reports section**

Add:

```markdown
The Google SEO insights script writes:

- `reports/onlineslottop-google-seo-insights.json`
- `reports/onlineslottop-google-seo-insights.md`

Commit these reports only when they are intentional SEO evidence snapshots. Confirm they do not contain credentials or private account metadata before committing.
```

- [ ] **Step 4: Review docs**

Run:

```bash
sed -n '1,220p' README.md
sed -n '1,260p' PROJECT_GUIDE.md
sed -n '1,260p' CONTRIBUTING.md
```

Expected: all docs mention `pnpm run google:seo`, service account setup, and credential safety.

### Task 4: Verification Without Credentials

**Files:**
- Verify all changed files.

- [ ] **Step 1: Check formatting and status**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; intended files are modified.

- [ ] **Step 2: Verify ignored credential patterns**

Run:

```bash
git check-ignore .env
git check-ignore local-service-account.json
git check-ignore google-credentials/key.json
```

Expected: each command prints the ignored path.

- [ ] **Step 3: Verify missing-config behavior**

Run:

```bash
/Users/arseniy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tools/google_seo_insights.mjs
```

Expected: exit code 2 and a clear missing environment variable error.

- [ ] **Step 4: Commit implementation**

Run:

```bash
git add .env.example .gitignore package.json pnpm-lock.yaml tools/google_seo_insights.mjs README.md PROJECT_GUIDE.md CONTRIBUTING.md
git commit -m "feat: add google seo api insights report"
```

Expected: commit succeeds.

### Task 5: Verification With Real Credentials

**Files:**
- Create locally only: `.env`
- Read locally only: service account JSON outside git or in an ignored local path.
- Generate: `reports/onlineslottop-google-seo-insights.json`
- Generate: `reports/onlineslottop-google-seo-insights.md`

- [ ] **Step 1: Create local `.env`**

Create `.env` from `.env.example` with real values:

```dotenv
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/onlineslottop-service-account.json
GA4_PROPERTY_ID=123456789
GSC_SITE_URL=https://onlineslottop.com/
GOOGLE_SEO_START_DATE=28daysAgo
GOOGLE_SEO_END_DATE=yesterday
```

- [ ] **Step 2: Confirm service account access**

In Google UI, confirm the service account email has:

- GA4 property read access.
- Search Console property access for `https://onlineslottop.com/`.

- [ ] **Step 3: Run live report**

Run:

```bash
pnpm run google:seo
```

Expected:

```text
Wrote reports/onlineslottop-google-seo-insights.json
Wrote reports/onlineslottop-google-seo-insights.md
```

- [ ] **Step 4: Review report for secrets**

Run:

```bash
rg -n "private_key|client_email|token|GOOGLE_APPLICATION_CREDENTIALS|BEGIN PRIVATE KEY" reports/onlineslottop-google-seo-insights.*
```

Expected: no matches.

- [ ] **Step 5: Commit report snapshot only if intentional**

Run:

```bash
git add reports/onlineslottop-google-seo-insights.json reports/onlineslottop-google-seo-insights.md
git commit -m "audit: add google seo insights snapshot"
```

Expected: commit succeeds if the report snapshot is intended for repository history.
