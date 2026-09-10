# JobGen Candidate Portal — Automation & Audit Suite

Comprehensive end-to-end automated testing, input fuzzing, and autonomous full-site crawling suite for `candidates.jobgen.ai` built with [Playwright](https://playwright.dev/).

---

## 🚀 Features & Test Modules

1. **Job Search Combinatorics (`01-job-search-combinatorics.spec.js`)**: Matrix testing of Australian and global locations with multi-filter combos (Date Posted, Workplace, Career Level).
2. **Tracker & Modals Input Fuzzing (`02-tracker-fuzzing-and-inputs.spec.js`)**: Profanity filters, XSS/fuzz vectors, and URL input field validation.
3. **Resume & Cover Letter Builder (`03-resume-cover-letter-builder.spec.js`)**: Real-time generation prompt submissions and validation.
4. **Interview Prep & Career Plan (`04-interview-prep-and-career-plan.spec.js`)**: Career roadmap and mock preparation verification.
5. **Support Chat & Notifications (`05-support-chat-and-notifications.spec.js`)**: AI support assistant queries and notification drawer audits.
6. **Profile & Account Audit (`06-profile-account-anomaly-audit.spec.js`)**: Salary threshold inputs, work mode preferences, and goal persistence.
7. **Consolidated Master Suite (`single-window-e2e-crawl.spec.js`)**: Single-session serialized regression crawl.
8. **Autonomous Site Crawler (`crawl-and-click-audit.spec.js`)**: Breadth-first autonomous crawler that indexes all internal pages, tests interactive elements, catches layout shifts, and compiles an HTML audit report with screenshots.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
cd web-automation
npm install
```

### 2. Save Session Authentication
```bash
node save-auth.js
```

### 3. Run Test Suites

* **Run all functional tests in headed mode:**
  ```bash
  npx playwright test --project=chromium --headed
  ```

* **Run the Autonomous Crawler & Audit:**
  ```bash
  npx playwright test --project=crawler --headed
  ```

* **View Crawler HTML Audit Report:**
  ```bash
  start ./test-results/crawler/crawler-report.html
  ```
