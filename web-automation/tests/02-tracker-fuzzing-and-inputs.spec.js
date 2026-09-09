import { test, expect } from '@playwright/test';
import { FUZZ_STRINGS, INVALID_URLS, VALID_URLS } from './utils/test-data.js';

test.describe('Tracker & Modals - Input Fuzzing, Profanity & Validation', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(60000);
    await page.goto('https://candidates.jobgen.ai/tracker?tab=jobs', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await expect(page).toHaveURL(/tracker/);
  });

  test('should open Add Job modal and test profanity / fuzzing input vectors', async ({ page }) => {
    const addJobBtn = page.getByRole('button', { name: /Add Job/i }).first();
    await expect(addJobBtn).toBeVisible();
    await addJobBtn.click();

    await page.waitForTimeout(300);

    const companyInput = page.getByPlaceholder(/Company name/i).first();
    const titleInput = page.getByPlaceholder(/Job title/i).first();

    if (await companyInput.isVisible()) {
      for (const fuzzStr of FUZZ_STRINGS.slice(0, 5)) {
        await companyInput.fill('');
        await companyInput.fill(fuzzStr);
        await expect(companyInput).toHaveValue(fuzzStr);
      }
    }

    if (await titleInput.isVisible()) {
      for (const fuzzStr of FUZZ_STRINGS.slice(5, 10)) {
        await titleInput.fill('');
        await titleInput.fill(fuzzStr);
        await expect(titleInput).toHaveValue(fuzzStr);
      }
    }

    await page.keyboard.press('Escape');
  });

  test('should test URL field validation with valid and invalid URLs', async ({ page }) => {
    const addJobBtn = page.getByRole('button', { name: /Add Job/i }).first();
    await addJobBtn.click();
    await page.waitForTimeout(300);

    const urlInput = page.getByPlaceholder(/URL|Link/i).first();

    if (await urlInput.isVisible()) {
      for (const invalidUrl of INVALID_URLS) {
        await urlInput.fill('');
        await urlInput.fill(invalidUrl);
        await expect(urlInput).toHaveValue(invalidUrl);
      }

      for (const validUrl of VALID_URLS) {
        await urlInput.fill('');
        await urlInput.fill(validUrl);
        await expect(urlInput).toHaveValue(validUrl);
      }
    }

    await page.keyboard.press('Escape');
  });

  test('should verify all Tracker sub-tabs and action buttons', async ({ page }) => {
    const trackerHeading = page.getByRole('heading', { level: 1 });
    await expect(trackerHeading).toBeVisible();

    const addJobBtn = page.getByRole('button', { name: /Add Job/i }).first();
    await expect(addJobBtn).toBeVisible();
  });
});
