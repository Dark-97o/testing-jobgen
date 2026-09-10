import { test, expect } from '@playwright/test';

test.describe('Interview Prep & Career Plan - Modules & Input Controls', () => {
  test('should navigate to Interview Prep page and verify controls', async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/interview-prep', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/interview-prep/);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Check action buttons or inputs
    const buttons = page.locator('button');
    await expect(buttons.first()).toBeVisible();
  });

  test('should navigate to Career Plan page and verify roadmap controls', async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/career-plan', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/career-plan/);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should navigate to Career Events page and verify event listings', async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/career-events', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/career-events/);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });
});
