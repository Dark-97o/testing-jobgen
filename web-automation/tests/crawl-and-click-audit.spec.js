import { test } from '@playwright/test';
import {
  ensureReportDirs,
  addPageResult,
  saveScreenshot,
  generateHtmlReport,
} from './utils/crawler-report.js';

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_ORIGIN = 'https://candidates.jobgen.ai';

/**
 * Known seed routes — the crawler will start here and discover more via links.
 * Listed explicitly to guarantee all sections are covered even if some nav links
 * are missed due to JS-driven rendering timing.
 */
const SEED_URLS = [
  `${BASE_ORIGIN}/home`,
  `${BASE_ORIGIN}/job-search`,
  `${BASE_ORIGIN}/tracker`,
  `${BASE_ORIGIN}/resume-builder/resume`,
  `${BASE_ORIGIN}/cover-letter-builder`,
  `${BASE_ORIGIN}/workspace`,
  `${BASE_ORIGIN}/interview-prep`,
  `${BASE_ORIGIN}/career-events`,
  `${BASE_ORIGIN}/career-plan`,
  `${BASE_ORIGIN}/profile`,
];

/** Patterns in button/link text that indicate destructive actions — these are skipped */
const DESTRUCTIVE_PATTERNS = [
  /\bdelete\b/i,
  /\bremove\b/i,
  /\blogout\b/i,
  /\bsign[\s-]*out\b/i,
  /\bcancel\s*(subscription|plan|account)\b/i,
  /\bdisable\b/i,
  /\bdeactivate\b/i,
  /\bpermanently\b/i,
  /\bunsubscribe\b/i,
  /\bprint\b/i,
  /\bdownload\b/i,
  /\bupload\b/i,
  /\bexport\b/i,
  /\bimport\b/i,
  // Exceptions: Never click or follow Chrome Web Store / Extension install
  /\bchromewebstore\b/i,
  /chrome\.google\.com/i,
  /chromewebstore\.google\.com/i,
  /\bwebstore\b/i,
  /\badd\s*to\s*chrome\b/i,
  /\binstall\s*(the\s*)?extension\b/i,
  /\bget\s*the\s*extension\b/i,
];

/** Selector for all interactive elements we click (excluding <a> — handled separately) */
const BUTTON_SELECTOR = [
  'button:not([disabled])',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="option"]',
  'summary',
].join(', ');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise a URL for deduplication (strip query + hash, trailing slash) */
function normaliseUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    return (u.origin + u.pathname).replace(/\/$/, '');
  } catch {
    return rawUrl.split('?')[0].replace(/\/$/, '');
  }
}

/** Human-readable label for an element */
async function elementLabel(el) {
  try {
    const tag  = await el.evaluate(e => e.tagName.toLowerCase());
    const text = (await el.innerText().catch(() => '')).trim().slice(0, 80);
    const aria = (await el.getAttribute('aria-label').catch(() => '')) || '';
    const role = (await el.getAttribute('role').catch(() => '')) || '';
    return [tag, role, aria || text].filter(Boolean).join(' › ');
  } catch {
    return '(unknown element)';
  }
}

/** True if an element looks like a destructive action */
async function isDestructive(el) {
  try {
    const text = (await el.innerText().catch(() => '')).trim();
    const aria = (await el.getAttribute('aria-label').catch(() => '')) || '';
    return DESTRUCTIVE_PATTERNS.some(p => p.test(`${text} ${aria}`));
  } catch {
    return false;
  }
}

/** Dismiss any open modal / drawer by pressing Escape */
async function dismiss(page) {
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  } catch { /* page may have closed — ignore */ }
}

/**
 * Collect all internal same-origin links + external links from the current page.
 * Returns normalised internal URLs so they're ready for dedup-checking.
 */
async function collectLinks(page) {
  const rawHrefs = await page.$$eval('a[href]', els => els.map(e => e.href));
  const internal = new Set();
  const external = new Set();
  for (const href of rawHrefs) {
    // Ignore Chrome Web Store entirely
    if (/chromewebstore|chrome\.google\.com|webstore/i.test(href)) {
      continue;
    }
    try {
      const u = new URL(href);
      if (u.origin === BASE_ORIGIN) {
        internal.add(normaliseUrl(href));
      } else if (u.protocol.startsWith('http')) {
        external.add(href);
      }
    } catch { /* ignore */ }
  }
  return { internal, external: [...external] };
}

// ─── Main test ────────────────────────────────────────────────────────────────

test.describe('Full-Site Auto-Crawler & Click Audit', () => {
  // No timeout — the crawler can take as long as it needs
  test.setTimeout(0);

  test('crawl all pages and click every interactive element', async ({ page, context }) => {
    ensureReportDirs();
    page.setDefaultTimeout(60000);

    // Auto-close any newly opened popups or external tabs immediately
    context.on('page', async popup => {
      try {
        await popup.close();
      } catch {}
    });

    // Accumulate console errors per-page
    let consoleErrorBuffer = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrorBuffer.push(msg.text().slice(0, 200));
    });

    // Automatically dismiss any browser alert/confirm/prompt to prevent hangs
    page.on('dialog', async dialog => {
      await dialog.dismiss().catch(() => {});
    });

    const visited  = new Set();
    const queue    = [...SEED_URLS.map(normaliseUrl)];

    // Pre-mark seeds as queued so we don't double-queue from link discovery
    // (the actual "visited" mark happens after navigation)

    while (queue.length > 0) {
      const normUrl = queue.shift();
      if (visited.has(normUrl)) continue;
      visited.add(normUrl);

      const targetUrl = normUrl; // already normalised
      console.log(`\n📄 Crawling [${visited.size}/${visited.size + queue.length}]: ${targetUrl}`);

      // ── Navigate ────────────────────────────────────────────────────────────
      consoleErrorBuffer = [];
      let navFailed = false;
      try {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
        // Wait for the SPA to finish rendering its components
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(500);
      } catch (err) {
        addPageResult({
          url: targetUrl,
          externalLinks: [],
          clicks: [{ status: 'fail', element: 'PAGE NAVIGATION', error: String(err) }],
          consoleErrors: [],
        });
        navFailed = true;
      }
      if (navFailed) continue;

      // ── Discover links BEFORE clicking (DOM is cleanest here) ───────────────
      const { internal, external } = await collectLinks(page);
      for (const link of internal) {
        if (!visited.has(link) && !queue.includes(link)) {
          queue.push(link);
        }
      }

      // ── Click all buttons / interactive elements ─────────────────────────────
      const clickResults = [];
      const seenLabels = new Set();

      let buttons = await page.$$(BUTTON_SELECTOR);
      let attempts = 0;
      const MAX_CLICKS_PER_PAGE = 60; // safety cap per page

      for (let i = 0; i < buttons.length && attempts < MAX_CLICKS_PER_PAGE; i++) {
        attempts++;
        const el = buttons[i];
        const label = await elementLabel(el);

        // Deduplicate within the page
        if (seenLabels.has(label)) {
          continue;
        }
        seenLabels.add(label);

        // Skip destructive or hang-prone actions (delete, print, upload, logout, chromewebstore)
        if (await isDestructive(el)) {
          clickResults.push({ status: 'warn', element: label, error: 'Skipped — destructive, dialog, or Chrome Web Store action' });
          continue;
        }

        // Explicit check: never click into Chrome Web Store
        const hrefAttr = (await el.getAttribute('href').catch(() => '')) || '';
        if (/chromewebstore|chrome\.google\.com|webstore/i.test(hrefAttr)) {
          clickResults.push({ status: 'warn', element: label, error: 'Skipped — Chrome Web Store link' });
          continue;
        }

        // Check visibility
        let visible = false;
        try { visible = await el.isVisible({ timeout: 1500 }); } catch { }
        if (!visible) {
          clickResults.push({ status: 'warn', element: label, error: 'Not visible — skipped' });
          continue;
        }

        // Attempt click
        const urlBefore = page.url();
        try {
          await el.scrollIntoViewIfNeeded().catch(() => {});
          await el.click({ force: false, timeout: 4000 });
          await page.waitForTimeout(500);

          const urlAfter = page.url();
          const leftSite = !urlAfter.startsWith(BASE_ORIGIN);
          const navigatedAway = normaliseUrl(urlAfter) !== normaliseUrl(urlBefore);

          if (leftSite || navigatedAway) {
            // Record discovered internal link if within site
            if (!leftSite) {
              const navNorm = normaliseUrl(urlAfter);
              if (!visited.has(navNorm) && !queue.includes(navNorm)) {
                queue.push(navNorm);
              }
            }
            // Return to the current target page
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {});
            await page.waitForTimeout(600);
            // Re-fetch buttons so subsequent elements don't have stale handles
            buttons = await page.$$(BUTTON_SELECTOR);
          } else {
            // Dismiss any modal/drawer that opened
            await dismiss(page);
          }

          clickResults.push({ status: 'pass', element: label });
        } catch (err) {
          const screenshot = await saveScreenshot(page, label).catch(() => undefined);
          clickResults.push({ status: 'fail', element: label, error: String(err).slice(0, 300), screenshot });
          await dismiss(page);
          if (!page.url().startsWith(BASE_ORIGIN) || normaliseUrl(page.url()) !== targetUrl) {
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {});
            await page.waitForTimeout(600);
            buttons = await page.$$(BUTTON_SELECTOR);
          }
        }
      }

      // ── Collect console errors that fired during this page ──────────────────
      addPageResult({
        url: targetUrl,
        externalLinks: external,
        clicks: clickResults,
        consoleErrors: [...consoleErrorBuffer],
      });

      console.log(`   ✅ Clicked ${clickResults.filter(r => r.status === 'pass').length} | ⚠️ ${clickResults.filter(r => r.status === 'warn').length} | ❌ ${clickResults.filter(r => r.status === 'fail').length} | 🔗 +${[...internal].filter(l => !visited.has(l)).length} new links`);
    }

    // ── Generate HTML report ─────────────────────────────────────────────────
    const reportPath = generateHtmlReport();
    console.log(`\n✅ Crawl complete!`);
    console.log(`   Pages visited : ${visited.size}`);
    console.log(`   Report        : ${reportPath}`);
  });
});
