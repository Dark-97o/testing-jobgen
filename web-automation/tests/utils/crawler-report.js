import fs from 'fs';
import path from 'path';

const REPORT_DIR = path.resolve('test-results', 'crawler');
const SCREENSHOTS_DIR = path.join(REPORT_DIR, 'screenshots');

export function ensureReportDirs() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * @typedef {Object} ClickResult
 * @property {'pass'|'fail'|'warn'} status
 * @property {string} element   - human-readable description of the element
 * @property {string} [error]   - error message on failure
 * @property {string} [screenshot] - relative path to screenshot file
 */

/**
 * @typedef {Object} PageResult
 * @property {string} url
 * @property {string[]} externalLinks
 * @property {ClickResult[]} clicks
 * @property {string[]} consoleErrors
 */

/** @type {PageResult[]} */
const results = [];

/** @param {PageResult} pageResult */
export function addPageResult(pageResult) {
  results.push(pageResult);
}

export function getResults() {
  return results;
}

/** @param {import('@playwright/test').Page} page @param {string} label */
export async function saveScreenshot(page, label) {
  const safeName = label.replace(/[^a-z0-9]/gi, '_').slice(0, 60);
  const filename = `${Date.now()}_${safeName}.png`;
  const fullPath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: fullPath, fullPage: false });
  return path.join('screenshots', filename);
}

export function generateHtmlReport() {
  const totalPages = results.length;
  const allClicks = results.flatMap(r => r.clicks);
  const totalClicks = allClicks.length;
  const passed = allClicks.filter(c => c.status === 'pass').length;
  const failed = allClicks.filter(c => c.status === 'fail').length;
  const warned = allClicks.filter(c => c.status === 'warn').length;
  const totalExternal = results.reduce((s, r) => s + r.externalLinks.length, 0);
  const totalConsoleErrors = results.reduce((s, r) => s + r.consoleErrors.length, 0);
  const now = new Date().toLocaleString();

  const pageRows = results.map((pr, idx) => {
    const pagePassed = pr.clicks.filter(c => c.status === 'pass').length;
    const pageFailed = pr.clicks.filter(c => c.status === 'fail').length;
    const pageWarned = pr.clicks.filter(c => c.status === 'warn').length;

    const clickRows = pr.clicks.map(c => {
      const statusIcon = c.status === 'pass' ? '✅' : c.status === 'fail' ? '❌' : '⚠️';
      const statusClass = c.status === 'pass' ? 'pass' : c.status === 'fail' ? 'fail' : 'warn';
      const screenshotHtml = c.screenshot
        ? `<a href="${c.screenshot}" target="_blank"><img src="${c.screenshot}" class="thumb" alt="screenshot"/></a>`
        : '';
      const errorHtml = c.error
        ? `<div class="error-msg">${escHtml(c.error)}</div>`
        : '';
      return `<tr class="${statusClass}">
        <td>${statusIcon}</td>
        <td>${escHtml(c.element)}</td>
        <td>${errorHtml}${screenshotHtml}</td>
      </tr>`;
    }).join('');

    const consoleErrorHtml = pr.consoleErrors.length
      ? `<div class="console-errors"><strong>Console errors (${pr.consoleErrors.length}):</strong><ul>${pr.consoleErrors.map(e => `<li>${escHtml(e)}</li>`).join('')}</ul></div>`
      : '';

    const externalHtml = pr.externalLinks.length
      ? `<div class="external-links"><strong>External links found (${pr.externalLinks.length}):</strong><ul>${pr.externalLinks.map(l => `<li><a href="${escHtml(l)}" target="_blank">${escHtml(l)}</a></li>`).join('')}</ul></div>`
      : '';

    return `
    <details class="page-block" id="page-${idx}">
      <summary>
        <span class="page-url">${escHtml(pr.url)}</span>
        <span class="badge pass">${pagePassed} ✅</span>
        <span class="badge fail">${pageFailed} ❌</span>
        <span class="badge warn">${pageWarned} ⚠️</span>
      </summary>
      ${consoleErrorHtml}
      ${externalHtml}
      ${pr.clicks.length > 0 ? `
      <table class="click-table">
        <thead><tr><th>Status</th><th>Element</th><th>Details</th></tr></thead>
        <tbody>${clickRows}</tbody>
      </table>` : '<p class="no-clicks">No clickable elements found on this page.</p>'}
    </details>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Crawler Audit Report — JobGen</title>
<style>
  :root {
    --bg: #0f1117;
    --surface: #1a1d27;
    --surface2: #22263a;
    --border: #2e3350;
    --text: #e2e8f0;
    --muted: #8892b0;
    --green: #4ade80;
    --red: #f87171;
    --yellow: #fbbf24;
    --blue: #60a5fa;
    --purple: #a78bfa;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; padding: 2rem; }
  h1 { font-size: 2rem; font-weight: 700; background: linear-gradient(135deg, var(--blue), var(--purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.25rem; }
  .subtitle { color: var(--muted); margin-bottom: 2rem; font-size: 0.9rem; }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.2rem 1rem; text-align: center; }
  .stat-card .value { font-size: 2.2rem; font-weight: 800; line-height: 1; }
  .stat-card .label { font-size: 0.75rem; color: var(--muted); margin-top: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .green { color: var(--green); } .red { color: var(--red); } .yellow { color: var(--yellow); } .blue { color: var(--blue); } .purple { color: var(--purple); }
  .page-block { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 0.75rem; overflow: hidden; }
  .page-block summary { padding: 0.85rem 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; font-size: 0.9rem; list-style: none; }
  .page-block summary::-webkit-details-marker { display: none; }
  .page-block summary:hover { background: var(--surface2); }
  .page-url { flex: 1; font-family: monospace; font-size: 0.82rem; color: var(--blue); word-break: break-all; }
  .badge { font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 999px; font-weight: 600; }
  .badge.pass { background: rgba(74,222,128,0.15); color: var(--green); }
  .badge.fail { background: rgba(248,113,113,0.15); color: var(--red); }
  .badge.warn { background: rgba(251,191,36,0.15); color: var(--yellow); }
  .click-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; margin-top: 0; }
  .click-table thead { background: var(--surface2); }
  .click-table th { padding: 0.5rem 0.75rem; text-align: left; color: var(--muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }
  .click-table td { padding: 0.45rem 0.75rem; border-top: 1px solid var(--border); vertical-align: top; }
  .click-table tr.fail td { background: rgba(248,113,113,0.05); }
  .click-table tr.warn td { background: rgba(251,191,36,0.04); }
  .error-msg { color: var(--red); font-size: 0.78rem; font-family: monospace; margin-bottom: 0.3rem; white-space: pre-wrap; }
  .thumb { width: 120px; border-radius: 6px; border: 1px solid var(--border); margin-top: 0.3rem; }
  .console-errors, .external-links { padding: 0.75rem 1rem; background: var(--surface2); border-bottom: 1px solid var(--border); font-size: 0.82rem; }
  .console-errors { color: var(--red); }
  .external-links { color: var(--muted); }
  .console-errors ul, .external-links ul { margin-top: 0.4rem; padding-left: 1.25rem; }
  .console-errors li, .external-links li { margin-bottom: 0.2rem; }
  .external-links a { color: var(--blue); }
  .no-clicks { padding: 1rem; color: var(--muted); font-size: 0.85rem; }
  .section-title { font-size: 1rem; font-weight: 600; color: var(--muted); margin: 1.5rem 0 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
</style>
</head>
<body>
<h1>🕷️ Crawler Audit Report</h1>
<p class="subtitle">Generated: ${now} &nbsp;|&nbsp; Target: <a href="https://candidates.jobgen.ai" style="color:var(--blue)">candidates.jobgen.ai</a></p>

<div class="summary-grid">
  <div class="stat-card"><div class="value blue">${totalPages}</div><div class="label">Pages Crawled</div></div>
  <div class="stat-card"><div class="value purple">${totalClicks}</div><div class="label">Elements Clicked</div></div>
  <div class="stat-card"><div class="value green">${passed}</div><div class="label">Passed</div></div>
  <div class="stat-card"><div class="value red">${failed}</div><div class="label">Failed</div></div>
  <div class="stat-card"><div class="value yellow">${warned}</div><div class="label">Warnings</div></div>
  <div class="stat-card"><div class="value blue">${totalExternal}</div><div class="label">External Links</div></div>
  <div class="stat-card"><div class="value red">${totalConsoleErrors}</div><div class="label">Console Errors</div></div>
</div>

<p class="section-title">📄 Page-by-Page Results</p>
${pageRows}
</body>
</html>`;

  const reportPath = path.join(REPORT_DIR, 'crawler-report.html');
  fs.writeFileSync(reportPath, html, 'utf8');
  return reportPath;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
