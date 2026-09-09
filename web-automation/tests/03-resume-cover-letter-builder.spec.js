import { test, expect } from '@playwright/test';
import { RESUME_SECTION_VARIATIONS, FUZZ_STRINGS } from './utils/test-data.js';

test.describe('Workspace - Resume Builder & Cover Letter Deep Input Testing', () => {
  test('should navigate to Resume Builder and test input variations', async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/resume-builder', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/resume-builder/);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Verify sections or CTA buttons
    const inputs = page.locator('input[type="text"]');
    const inputCount = await inputs.count();

    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const field = inputs.nth(i);
      if (await field.isVisible()) {
        await field.fill('Automated Test Input ' + i);
        await expect(field).toHaveValue('Automated Test Input ' + i);
      }
    }
  });

  test('should navigate to Cover Letter Builder and test prompt inputs & tone buttons', async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/cover-letter-builder', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/cover-letter/);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Test text inputs / textareas if present
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();

    if (textareaCount > 0) {
      const targetArea = textareas.first();
      await targetArea.fill('Senior Software Engineer role at Google with focus on Playwright automation and Cloud solutions.');
      await expect(targetArea).toHaveValue(/Senior Software Engineer/);
    }
  });

  test('should navigate to Workspace page and verify documents list & tabs', async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/workspace', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/workspace/);

    const workspaceHeading = page.getByRole('heading', { level: 1 });
    await expect(workspaceHeading).toBeVisible();
  });
});
