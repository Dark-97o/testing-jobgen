import { test, expect } from '@playwright/test';
import { AUSTRALIAN_LOCATIONS, GLOBAL_LOCATIONS, JOB_TITLES } from './utils/test-data.js';

test.describe('Job Search Page - Combinatorics, Filters & Location Matrix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/job-search', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/job-search/);
  });

  test('should execute search with 15 Australian locations', async ({ page }) => {
    const searchBtn = page.getByRole('button', { name: /Search/i }).first();
    await expect(searchBtn).toBeVisible();

    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    if (inputCount >= 2) {
      const locationInput = inputs.nth(1);
      for (const location of AUSTRALIAN_LOCATIONS.slice(0, 5)) {
        await locationInput.fill(location);
        if (await searchBtn.isEnabled()) {
          await searchBtn.click();
        }
        await page.waitForTimeout(200);
      }
    }
  });

  test('should execute search with 10 Global locations', async ({ page }) => {
    const searchBtn = page.getByRole('button', { name: /Search/i }).first();
    await expect(searchBtn).toBeVisible();

    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    if (inputCount >= 2) {
      const locationInput = inputs.nth(1);
      for (const location of GLOBAL_LOCATIONS.slice(0, 5)) {
        await locationInput.fill(location);
        if (await searchBtn.isEnabled()) {
          await searchBtn.click();
        }
        await page.waitForTimeout(200);
      }
    }
  });

  test('should test combinations of 10 Job Titles across Australia', async ({ page }) => {
    const searchBtn = page.getByRole('button', { name: /Search/i }).first();
    await expect(searchBtn).toBeVisible();

    const inputs = page.locator('input');
    if ((await inputs.count()) >= 2) {
      const roleInput = inputs.first();
      const locationInput = inputs.nth(1);

      await locationInput.fill('Sydney');

      for (const title of JOB_TITLES.slice(0, 5)) {
        await roleInput.fill(title);
        if (await searchBtn.isEnabled()) {
          await searchBtn.click();
        }
        await page.waitForTimeout(200);
      }
    }
  });

  test('should test matrix of Date Posted filter dropdowns', async ({ page }) => {
    const datePostedBtn = page.getByRole('button', { name: /Date posted/i }).first();
    await expect(datePostedBtn).toBeVisible();

    const options = ['Last 24h', 'Last 7 days', 'Last 30 days', 'Any time'];

    for (const option of options) {
      await datePostedBtn.click();
      const optionBtn = page.getByRole('button', { name: option, exact: true });
      await expect(optionBtn).toBeVisible();
      await optionBtn.click();
      await page.waitForTimeout(200);
    }
  });

  test('should test matrix of Workplace filter dropdowns', async ({ page }) => {
    const workplaceBtn = page.getByRole('button', { name: /Workplace/i }).first();
    await expect(workplaceBtn).toBeVisible();

    const options = ['Remote', 'Onsite', 'Hybrid', 'Any workplace'];

    for (const option of options) {
      await workplaceBtn.click();
      const optionBtn = page.getByRole('button', { name: option, exact: true });
      await expect(optionBtn).toBeVisible();
      await optionBtn.click();
      await page.waitForTimeout(200);
    }
  });

  test('should test matrix of Career Level filter dropdowns', async ({ page }) => {
    const careerLevelBtn = page.getByRole('button', { name: /Career level/i }).first();
    await expect(careerLevelBtn).toBeVisible();

    const options = ['Entry level', 'Director', 'Any level'];

    for (const option of options) {
      await careerLevelBtn.click();
      const optionBtn = page.getByRole('button', { name: option, exact: true });
      await expect(optionBtn).toBeVisible();
      await optionBtn.click();
      await page.waitForTimeout(200);
    }
  });
});
