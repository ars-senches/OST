import fs from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const SITE = "https://onlineslottop.com";
const REPORT_DIR = path.resolve("reports");
const JSON_OUT = path.join(REPORT_DIR, "onlineslottop-technical-seo-audit.json");
const MD_OUT = path.join(REPORT_DIR, "onlineslottop-technical-seo-audit.md");
const MAX_URLS = Number(process.env.MAX_URLS || "0");
const CONCURRENCY = Number(process.env.CONCURRENCY || "8");
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || "20000");
const USER_AGENT =
  "Mozilla/5.0 (compatible; CodexTechnicalSEOAudit/1.0; +https://openai.com/)";

const XML_LOC_RE = /<loc>\s*([^<]+?)\s*<\/loc>/gi;

function decodeEntities(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)));
}

function stripTags(value = "") {
  return decodeEntities(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function attr(tag, name) {
  const re = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(re);
  return decodeEntities(match?.[1] || match?.[2] || match?.[3] || "");
}

function normalizeComparableUrl(raw) {
  if (!raw) return "";
  try {
    const url = new URL(raw, SITE);
    url.hash = "";
    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString();
  } catch {
    return raw.trim();
  }
}

function headerObject(headers) {
  const obj = {};
  for (const [key, value] of headers.entries()) obj[key.toLowerCase()] = value;
  return obj;
}

async function fetchWithRedirects(url, { method = "GET", bodyLimit = 3_000_000 } = {}) {
  const redirects = [];
  let current = url;
  let response;
  let text = "";
  const started = Date.now();

  for (let i = 0; i < 8; i += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      response = await fetch(current, {
        method,
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": USER_AGENT,
          accept:
            method === "HEAD"
              ? "*/*"
              : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "en-US,en;q=0.9",
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    const location = response.headers.get("location");
    if ([301, 302, 303, 307, 308].includes(response.status) && location) {
      const next = new URL(location, current).toString();
      redirects.push({ from: current, to: next, status: response.status });
      current = next;
      continue;
    }
    break;
  }

  if (response && method !== "HEAD") {
    const raw = await response.text();
    text = raw.length > bodyLimit ? raw.slice(0, bodyLimit) : raw;
  }

  return {
    requestedUrl: url,
    finalUrl: current,
    status: response?.status || 0,
    ok: Boolean(response?.ok),
    headers: response ? headerObject(response.headers) : {},
    body: text,
    redirects,
    ms: Date.now() - started,
  };
}

function parseXmlLocs(xml) {
  const locs = [];
  XML_LOC_RE.lastIndex = 0;
  for (const match of xml.matchAll(XML_LOC_RE)) locs.push(decodeEntities(match[1].trim()));
  return locs;
}

function parseSitemapType(xml) {
  if (/<sitemapindex[\s>]/i.test(xml)) return "index";
  if (/<urlset[\s>]/i.test(xml)) return "urlset";
  return "unknown";
}

function parseMeta(html, name) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  const needle = name.toLowerCase();
  for (const tag of metaTags) {
    const metaName = attr(tag, "name").toLowerCase();
    const property = attr(tag, "property").toLowerCase();
    if (metaName === needle || property === needle) return attr(tag, "content");
  }
  return "";
}

function parseLink(html, relName) {
  const linkTags = html.match(/<link\b[^>]*>/gi) || [];
  const needle = relName.toLowerCase();
  for (const tag of linkTags) {
    const rel = attr(tag, "rel")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (rel.includes(needle)) return attr(tag, "href");
  }
  return "";
}

function parseHrefs(html) {
  return (html.match(/<a\b[^>]*>/gi) || [])
    .map((tag) => attr(tag, "href"))
    .filter(Boolean);
}

function parseHtml(url, html, headers = {}) {
  const title = stripTags(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const description = parseMeta(html, "description");
  const robots = parseMeta(html, "robots");
  const canonicalRaw = parseLink(html, "canonical");
  const canonical = canonicalRaw ? new URL(canonicalRaw, url).toString() : "";
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Texts = h1Matches.map((m) => stripTags(m[1])).filter(Boolean);
  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const missingAltImages = imgTags.filter((tag) => !/\salt\s*=/i.test(tag) || attr(tag, "alt").trim() === "");
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] || "";
  const lang = attr(htmlTag, "lang");
  const ldJsonBlocks = html.match(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/gi) || [];
  const hreflangs = (html.match(/<link\b[^>]*rel\s*=\s*["'][^"']*alternate[^"']*["'][^>]*hreflang\s*=/gi) || []).length;
  const bodyText = stripTags(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
  );
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;
  const links = parseHrefs(html);
  const internalLinks = links.filter((href) => {
    try {
      const target = new URL(href, url);
      return target.hostname === "onlineslottop.com";
    } catch {
      return false;
    }
  }).length;
  const externalLinks = links.filter((href) => {
    try {
      const target = new URL(href, url);
      return target.hostname && target.hostname !== "onlineslottop.com";
    } catch {
      return false;
    }
  }).length;

  return {
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    robots,
    xRobotsTag: headers["x-robots-tag"] || "",
    canonical,
    h1Count: h1Matches.length,
    h1Texts,
    lang,
    viewport: parseMeta(html, "viewport"),
    ogTitle: parseMeta(html, "og:title"),
    ogDescription: parseMeta(html, "og:description"),
    ldJsonCount: ldJsonBlocks.length,
    hreflangCount: hreflangs,
    imgCount: imgTags.length,
    missingAltImageCount: missingAltImages.length,
    wordCount,
    internalLinks,
    externalLinks,
  };
}

function issue(page, severity, code, message) {
  page.issues.push({ severity, code, message });
}

function classifyPage(page) {
  const html = page.html || {};
  const lowerRobots = `${html.robots} ${html.xRobotsTag}`.toLowerCase();
  const contentType = page.headers["content-type"] || "";

  if (page.error) issue(page, "critical", "fetch_error", page.error);
  if (page.status !== 200) issue(page, "critical", "non_200", `Sitemap URL returns ${page.status}`);
  if (page.redirects?.length) issue(page, "high", "redirect_in_sitemap", "URL from sitemap redirects");
  if (!/html/i.test(contentType)) issue(page, "medium", "non_html", `Unexpected content-type: ${contentType}`);
  if (lowerRobots.includes("noindex")) issue(page, "critical", "noindex_in_sitemap", "Sitemap URL is marked noindex");

  if (page.status === 200 && /html/i.test(contentType)) {
    if (!html.title) issue(page, "high", "missing_title", "Missing <title>");
    if (html.titleLength > 65) issue(page, "medium", "long_title", `Title is ${html.titleLength} chars`);
    if (html.titleLength > 0 && html.titleLength < 25) issue(page, "low", "short_title", `Title is ${html.titleLength} chars`);
    if (!html.description) issue(page, "high", "missing_description", "Missing meta description");
    if (html.descriptionLength > 160) {
      issue(page, "medium", "long_description", `Description is ${html.descriptionLength} chars`);
    }
    if (html.descriptionLength > 0 && html.descriptionLength < 70) {
      issue(page, "low", "short_description", `Description is ${html.descriptionLength} chars`);
    }
    if (!html.canonical) issue(page, "high", "missing_canonical", "Missing canonical link");
    if (
      html.canonical &&
      normalizeComparableUrl(html.canonical) !== normalizeComparableUrl(page.finalUrl)
    ) {
      issue(page, "medium", "canonical_mismatch", `Canonical points to ${html.canonical}`);
    }
    if (html.h1Count === 0) issue(page, "high", "missing_h1", "Missing H1");
    if (html.h1Count > 1) issue(page, "medium", "multiple_h1", `${html.h1Count} H1 tags`);
    if (!html.lang) issue(page, "medium", "missing_lang", "Missing html lang");
    if (!html.viewport) issue(page, "medium", "missing_viewport", "Missing viewport meta");
    if (html.wordCount < 150) issue(page, "medium", "thin_content", `${html.wordCount} visible words`);
    if (html.imgCount > 0 && html.missingAltImageCount / html.imgCount > 0.25) {
      issue(
        page,
        "low",
        "image_alt",
        `${html.missingAltImageCount}/${html.imgCount} images have missing/empty alt`
      );
    }
  }
}

function addDuplicateIssues(pages, field, code, label, severity = "medium") {
  const byValue = new Map();
  for (const page of pages) {
    const value = page.html?.[field]?.trim();
    if (!value) continue;
    if (!byValue.has(value)) byValue.set(value, []);
    byValue.get(value).push(page);
  }
  for (const [value, group] of byValue.entries()) {
    if (group.length < 2) continue;
    for (const page of group) {
      issue(page, severity, code, `${label} duplicated on ${group.length} URLs: ${value.slice(0, 120)}`);
    }
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    for (;;) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function loadSitemaps() {
  const sitemapIndexUrl = `${SITE}/sitemap_index.xml`;
  const index = await fetchWithRedirects(sitemapIndexUrl);
  const indexLocs = parseXmlLocs(index.body);
  const sitemapUrls = [];
  const urlEntries = [];

  async function visitSitemap(url) {
    const res = await fetchWithRedirects(url);
    const type = parseSitemapType(res.body);
    const locs = parseXmlLocs(res.body);
    sitemapUrls.push({ url, status: res.status, type, locCount: locs.length, ms: res.ms });
    if (type === "index") {
      for (const loc of locs) await visitSitemap(loc);
    } else {
      for (const loc of locs) urlEntries.push({ url: loc, sitemap: url });
    }
  }

  if (parseSitemapType(index.body) === "index") {
    for (const loc of indexLocs) await visitSitemap(loc);
  }

  const uniqueUrls = [...new Map(urlEntries.map((entry) => [entry.url, entry])).values()];
  return { index, sitemapUrls, urlEntries, uniqueUrls };
}

async function crawlPage(entry, index) {
  if (index > 0 && index % 100 === 0) {
    process.stderr.write(`Crawled ${index} URLs...\n`);
  }
  try {
    const res = await fetchWithRedirects(entry.url);
    const page = {
      url: entry.url,
      sitemap: entry.sitemap,
      finalUrl: res.finalUrl,
      status: res.status,
      ms: res.ms,
      headers: res.headers,
      redirects: res.redirects,
      issues: [],
      html: {},
    };
    if (/html/i.test(res.headers["content-type"] || "")) {
      page.html = parseHtml(res.finalUrl, res.body, res.headers);
    }
    classifyPage(page);
    await delay(25);
    return page;
  } catch (error) {
    const page = {
      url: entry.url,
      sitemap: entry.sitemap,
      finalUrl: entry.url,
      status: 0,
      ms: 0,
      headers: {},
      redirects: [],
      issues: [],
      html: {},
      error: error?.message || String(error),
    };
    classifyPage(page);
    return page;
  }
}

function countBy(items, getKey) {
  const counts = {};
  for (const item of items) {
    const key = getKey(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function topIssues(pages) {
  const counts = new Map();
  for (const page of pages) {
    for (const pageIssue of page.issues) {
      const key = `${pageIssue.severity}:${pageIssue.code}`;
      if (!counts.has(key)) {
        counts.set(key, {
          severity: pageIssue.severity,
          code: pageIssue.code,
          count: 0,
          examples: [],
        });
      }
      const row = counts.get(key);
      row.count += 1;
      if (row.examples.length < 5) row.examples.push(page.url);
    }
  }
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...counts.values()].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity] || b.count - a.count
  );
}

async function testSiteSignals() {
  const urls = [
    "http://onlineslottop.com/",
    "https://onlineslottop.com/",
    "https://www.onlineslottop.com/",
    "http://www.onlineslottop.com/",
    "https://onlineslottop.com/index.php",
    "https://onlineslottop.com/wp-json/",
    "https://onlineslottop.com/feed/",
  ];
  return mapLimit(urls, 4, async (url) => {
    try {
      const res = await fetchWithRedirects(url, { method: "HEAD" });
      return {
        url,
        status: res.status,
        finalUrl: res.finalUrl,
        redirects: res.redirects,
        ms: res.ms,
        headers: res.headers,
      };
    } catch (error) {
      return { url, error: error?.message || String(error) };
    }
  });
}

function mdEscape(value = "") {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function buildMarkdown(report) {
  const lines = [];
  lines.push("# Technical SEO Audit: onlineslottop.com");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Scope");
  lines.push("");
  lines.push(`- Sitemap URLs discovered: ${report.summary.sitemapUrlCount}`);
  lines.push(`- URLs crawled: ${report.summary.crawledUrlCount}`);
  lines.push(`- Unique sitemaps: ${report.sitemaps.length}`);
  lines.push("");
  lines.push("## HTTP and Indexing Signals");
  lines.push("");
  lines.push("| URL | Status | Final URL | Redirects | Cache-Control | X-Robots |");
  lines.push("| --- | ---: | --- | ---: | --- | --- |");
  for (const row of report.siteSignals) {
    lines.push(
      `| ${mdEscape(row.url)} | ${row.status || row.error || ""} | ${mdEscape(row.finalUrl || "")} | ${
        row.redirects?.length || 0
      } | ${mdEscape(row.headers?.["cache-control"] || "")} | ${mdEscape(row.headers?.["x-robots-tag"] || "")} |`
    );
  }
  lines.push("");
  lines.push("## Issue Summary");
  lines.push("");
  lines.push("| Severity | Code | Count | Examples |");
  lines.push("| --- | --- | ---: | --- |");
  for (const row of report.issueSummary) {
    lines.push(
      `| ${row.severity} | ${row.code} | ${row.count} | ${row.examples
        .map((example) => mdEscape(example))
        .join("<br>")} |`
    );
  }
  lines.push("");
  lines.push("## Sitemap Breakdown");
  lines.push("");
  lines.push("| Sitemap | Status | Type | URLs | ms |");
  lines.push("| --- | ---: | --- | ---: | ---: |");
  for (const sitemap of report.sitemaps) {
    lines.push(
      `| ${mdEscape(sitemap.url)} | ${sitemap.status} | ${sitemap.type} | ${sitemap.locCount} | ${sitemap.ms} |`
    );
  }
  lines.push("");
  lines.push("## Pages With Critical or High Issues");
  lines.push("");
  lines.push("| URL | Status | Title | Issues |");
  lines.push("| --- | ---: | --- | --- |");
  for (const page of report.pages
    .filter((page) => page.issues.some((item) => ["critical", "high"].includes(item.severity)))
    .slice(0, 100)) {
    lines.push(
      `| ${mdEscape(page.url)} | ${page.status} | ${mdEscape(page.html?.title || "")} | ${page.issues
        .filter((item) => ["critical", "high"].includes(item.severity))
        .map((item) => `${item.code}: ${item.message}`)
        .map(mdEscape)
        .join("<br>")} |`
    );
  }
  lines.push("");
  lines.push("## Notes for Draft Fixes");
  lines.push("");
  lines.push("- Fix noindex/non-200/redirecting sitemap URLs first; sitemap should contain only final 200 indexable canonical URLs.");
  lines.push("- Fix global cache headers at hosting/cache-plugin level; page HTML currently reports no-cache/no-store on the homepage.");
  lines.push("- Bulk-generate unique templates for titles/descriptions for games, providers, casinos, themes, functions, tags, and bonuses.");
  lines.push("- Check taxonomy archives before allowing them in sitemap: thin/duplicated archives usually need noindex or richer copy.");
  lines.push("- After draft changes, re-run this script and compare the JSON report.");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function main() {
  await fs.mkdir(REPORT_DIR, { recursive: true });

  const [robots, sitemapData, siteSignals] = await Promise.all([
    fetchWithRedirects(`${SITE}/robots.txt`),
    loadSitemaps(),
    testSiteSignals(),
  ]);

  const entries =
    MAX_URLS > 0 ? sitemapData.uniqueUrls.slice(0, MAX_URLS) : sitemapData.uniqueUrls;
  const pages = await mapLimit(entries, CONCURRENCY, crawlPage);

  addDuplicateIssues(pages, "title", "duplicate_title", "Title");
  addDuplicateIssues(pages, "description", "duplicate_description", "Description");

  const report = {
    generatedAt: new Date().toISOString(),
    site: SITE,
    robots: {
      status: robots.status,
      finalUrl: robots.finalUrl,
      body: robots.body,
    },
    sitemaps: sitemapData.sitemapUrls,
    siteSignals,
    summary: {
      sitemapUrlCount: sitemapData.uniqueUrls.length,
      crawledUrlCount: pages.length,
      statusCounts: countBy(pages, (page) => String(page.status)),
      contentTypeCounts: countBy(pages, (page) => page.headers["content-type"] || "unknown"),
      averageResponseMs: Math.round(
        pages.reduce((sum, page) => sum + (page.ms || 0), 0) / Math.max(1, pages.length)
      ),
    },
    issueSummary: topIssues(pages),
    pages,
  };

  await fs.writeFile(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await fs.writeFile(MD_OUT, buildMarkdown(report), "utf8");

  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`\nWrote ${JSON_OUT}`);
  console.log(`Wrote ${MD_OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
