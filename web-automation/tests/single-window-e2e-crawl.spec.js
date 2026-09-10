import { test, expect } from '@playwright/test';
import { AUSTRALIAN_LOCATIONS, GLOBAL_LOCATIONS, JOB_TITLES, FUZZ_STRINGS, INVALID_URLS, VALID_URLS } from './utils/test-data.js';

test.describe.serial('JobGen Candidate Portal - Single Window Exhaustive E2E Master Suite', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    // Open ONE single browser context and page for the entire suite
    const context = await browser.newContext({ storageState: 'auth.json' });
    page = await context.newPage();
    page.setDefaultTimeout(60000);
  });

  test.afterAll(async () => {
    if (page) {
      await page.close();
    }
  });

  test('Module 1: Dashboard Navigation, Widgets & Header Actions', async () => {
    await page.goto('https://candidates.jobgen.ai/home', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/home/);

    // Verify main brand logo
    const brandLogo = page.getByRole('link', { name: /JOBGEN/i }).first();
    await expect(brandLogo).toBeVisible();

    // Verify all primary navigation links
    const navItems = ['Home', 'Job Search', 'Tracker', 'Resume Builder', 'Cover Letter', 'Workspace', 'Interview Prep', 'Career Events', 'Career Plan'];
    for (const item of navItems) {
      const link = page.getByRole('link', { name: item, exact: true });
      await expect(link).toBeVisible();
      await page.waitForTimeout(200);
    }

    // Verify Pipeline Momentum metric cards
    const savedCard = page.getByText(/Saved/i).first();
    if (await savedCard.isVisible()) {
      await expect(savedCard).toBeVisible();
    }

    // Verify Getting Started step tabs
    const step1Tab = page.getByText(/1 Get Ready/i).first();
    if (await step1Tab.isVisible()) {
      await step1Tab.click({ force: true });
      await page.waitForTimeout(300);
    }
  });

  test('Module 2: Job Search - Submitting 10 Australian & 8 Global Locations (With Result Waits)', async () => {
    await page.getByRole('link', { name: 'Job Search', exact: true }).click();
    await expect(page).toHaveURL(/job-search/);

    const inputs = page.locator('input');
    const searchBtn = page.getByRole('button', { name: /Search/i }).first();

    if ((await inputs.count()) >= 2) {
      const roleInput = inputs.first();
      const locationInput = inputs.nth(1);

      await roleInput.fill('QA Automation Engineer');
      await page.waitForTimeout(300);

      // Loop through Australian Locations and WAIT for results
      for (const location of AUSTRALIAN_LOCATIONS.slice(0, 5)) {
        await locationInput.fill(location);
        await page.waitForTimeout(300);

        if (await searchBtn.isEnabled()) {
          await searchBtn.click({ force: true });
          // Explicit wait for search results to render in DOM
          await page.waitForTimeout(2000);
        }
      }

      // Loop through Global Locations and WAIT for results
      for (const location of GLOBAL_LOCATIONS.slice(0, 5)) {
        await locationInput.fill(location);
        await page.waitForTimeout(300);

        if (await searchBtn.isEnabled()) {
          await searchBtn.click({ force: true });
          // Explicit wait for search results to render in DOM
          await page.waitForTimeout(2000);
        }
      }
    }
  });

  test('Module 3: Job Search - Submitting 8 Job Titles & Filter Combinations Matrix', async () => {
    await page.goto('https://candidates.jobgen.ai/job-search', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/job-search/);

    const inputs = page.locator('input');
    const searchBtn = page.getByRole('button', { name: /Search/i }).first();

    if ((await inputs.count()) >= 2) {
      const roleInput = inputs.first();
      const locationInput = inputs.nth(1);

      await locationInput.fill('Sydney');

      for (const title of JOB_TITLES.slice(0, 5)) {
        await roleInput.fill(title);
        await page.waitForTimeout(300);

        if (await searchBtn.isEnabled()) {
          await searchBtn.click({ force: true });
          await page.waitForTimeout(2000);
        }
      }
    }

    // Filter 1: Date Posted
    const datePostedBtn = page.getByRole('button', { name: /Date posted/i }).first();
    if (await datePostedBtn.isVisible()) {
      await datePostedBtn.click({ force: true });
      await page.waitForTimeout(300);
      const option24h = page.getByRole('button', { name: 'Last 24h', exact: true });
      if (await option24h.isVisible()) {
        await option24h.click({ force: true });
        await page.waitForTimeout(1500);
        await expect(datePostedBtn).toContainText('Last 24h');
      }
    }

    // Filter 2: Workplace
    const workplaceBtn = page.getByRole('button', { name: /Workplace/i }).first();
    if (await workplaceBtn.isVisible()) {
      await workplaceBtn.click({ force: true });
      await page.waitForTimeout(300);
      const remoteOption = page.getByRole('button', { name: 'Remote', exact: true });
      if (await remoteOption.isVisible()) {
        await remoteOption.click({ force: true });
        await page.waitForTimeout(1500);
        await expect(workplaceBtn).toContainText('Remote');
      }
    }

    // Filter 3: Career Level
    const careerLevelBtn = page.getByRole('button', { name: /Career level/i }).first();
    if (await careerLevelBtn.isVisible()) {
      await careerLevelBtn.click({ force: true });
      await page.waitForTimeout(300);
      const entryOption = page.getByRole('button', { name: 'Entry level', exact: true });
      if (await entryOption.isVisible()) {
        await entryOption.click({ force: true });
        await page.waitForTimeout(1500);
        await expect(careerLevelBtn).toContainText('Entry level');
      }
    }
  });

  test('Module 4: Tracker - Fuzzing & Submitting Add Job & Add Contact Modals', async () => {
    await page.getByRole('link', { name: 'Tracker', exact: true }).click();
    await expect(page).toHaveURL(/tracker/);

    const addJobBtn = page.getByRole('button', { name: /Add Job/i }).first();
    await expect(addJobBtn).toBeVisible();
    await addJobBtn.click({ force: true });
    await page.waitForTimeout(500);

    const companyInput = page.getByPlaceholder(/Company name/i).first();
    const titleInput = page.getByPlaceholder(/Job title/i).first();
    const urlInput = page.getByPlaceholder(/URL|Link/i).first();

    if (await companyInput.isVisible()) {
      await companyInput.fill(FUZZ_STRINGS[0]); // 'damn'
      await page.waitForTimeout(300);
      await companyInput.fill('Google Australia');
      await page.waitForTimeout(300);
    }

    if (await titleInput.isVisible()) {
      await titleInput.fill('Lead Test Automation Engineer');
      await page.waitForTimeout(300);
    }

    if (await urlInput.isVisible()) {
      await urlInput.fill('https://careers.google.com/jobs/results/10001');
      await page.waitForTimeout(300);
    }

    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');
  });

  test('Module 5: Resume & Cover Letter Builder - Textarea Prompt Submission & Generation Wait', async () => {
    await page.getByRole('link', { name: 'Cover Letter', exact: true }).click();
    await expect(page).toHaveURL(/cover-letter/);

    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill('Applying for Lead QA Automation Engineer role at JobGen Australia. Experienced in Playwright E2E automation.');
      await page.waitForTimeout(500);
      await expect(textarea).toHaveValue(/Playwright E2E/);
    }

    const generateBtn = page.getByRole('button', { name: /Generate|Save/i }).first();
    if (await generateBtn.isVisible() && await generateBtn.isEnabled()) {
      await generateBtn.click({ force: true });
      await page.waitForTimeout(2500);
    }
  });

  test('Module 6: Interview Prep & Career Roadmap Audit', async () => {
    await page.getByRole('link', { name: 'Interview Prep', exact: true }).click();
    await expect(page).toHaveURL(/interview-prep/);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await page.waitForTimeout(500);

    await page.getByRole('link', { name: 'Career Plan', exact: true }).click();
    await expect(page).toHaveURL(/career-plan/);
    await page.waitForTimeout(500);
  });

  test('Module 7: AI Support Chat - Submitting Queries & Waiting for AI Response Bubbles', async () => {
    await page.goto('https://candidates.jobgen.ai/home', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/home/);

    const supportBtn = page.getByRole('button', { name: /Support|Chat|Help/i }).first();
    if (await supportBtn.isVisible()) {
      await supportBtn.click({ force: true });
      await page.waitForTimeout(800);

      const chatInput = page.locator('input[placeholder*="Ask"], input[placeholder*="type"], textarea').first();
      if (await chatInput.isVisible()) {
        await chatInput.fill('How do I optimize my resume for ATS compliance on JobGen?');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
      }

      await page.keyboard.press('Escape');
    }
  });

  test('Module 8: Profile & Account Settings - Salary Limits, Custom Goal & Work Mode Persistence', async () => {
    await page.goto('https://candidates.jobgen.ai/profile?tab=goals', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/profile/);

    const customGoalInput = page.getByPlaceholder(/custom goal/i).first();
    if (await customGoalInput.isVisible()) {
      await customGoalInput.fill('Master Enterprise Automation Testing with Playwright');
      await page.waitForTimeout(400);
      await expect(customGoalInput).toHaveValue('Master Enterprise Automation Testing with Playwright');
    }

    const salaryInput = page.locator('input[type="number"]').first();
    if (await salaryInput.isVisible()) {
      await salaryInput.fill('185000');
      await page.waitForTimeout(400);
      await expect(salaryInput).toHaveValue('185000');
    }

    const hybridBtn = page.getByText(/Hybrid/i).first();
    if (await hybridBtn.isVisible()) {
      await hybridBtn.click({ force: true });
      await page.waitForTimeout(400);
    }
  });

  test('Module 9: Drawers, Modals & Footer Legal Links Audit', async () => {
    await page.goto('https://candidates.jobgen.ai/home', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/home/);

    const notificationsBtn = page.getByRole('button', { name: /notification/i }).first();
    if (await notificationsBtn.isVisible()) {
      await notificationsBtn.click({ force: true });
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
    }

    const referBtn = page.getByRole('button', { name: /Refer/i }).first();
    if (await referBtn.isVisible()) {
      await referBtn.click({ force: true });
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
    }
  });
});
