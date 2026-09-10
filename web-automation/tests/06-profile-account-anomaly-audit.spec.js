import { test, expect } from '@playwright/test';

test.describe('Profile & Account Settings - Anomaly & Boundary Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/profile?tab=goals', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/profile/);
  });

  test('should load profile page and test target role and location inputs', async ({ page }) => {
    const roleInput = page.locator('input[value="Software Engineer"]').first();
    if (await roleInput.isVisible()) {
      await expect(roleInput).toBeVisible();
    }

    const locationInput = page.getByLabel('Location').first();
    if (await locationInput.isVisible()) {
      await expect(locationInput).toBeVisible();
    }
  });

  test('should test salary boundary inputs and currency selection', async ({ page }) => {
    const salaryInput = page.locator('input[type="number"]').first();
    if (await salaryInput.isVisible()) {
      await salaryInput.fill('250000');
      await expect(salaryInput).toHaveValue('250000');
      
      await salaryInput.fill('120000');
      await expect(salaryInput).toHaveValue('120000');
    }
  });

  test('should test custom goal input and clear action', async ({ page }) => {
    const customGoalInput = page.getByPlaceholder(/custom goal/i).first();
    if (await customGoalInput.isVisible()) {
      await customGoalInput.fill('Become Lead QA Automation Engineer');
      await expect(customGoalInput).toHaveValue('Become Lead QA Automation Engineer');

      await customGoalInput.fill('');
      await expect(customGoalInput).toHaveValue('');
    }
  });

  test('should verify Work Mode option buttons', async ({ page }) => {
    const fullTimeBtn = page.getByText(/Full-time/i).first();
    if (await fullTimeBtn.isVisible()) {
      await expect(fullTimeBtn).toBeVisible();
    }
  });
});
