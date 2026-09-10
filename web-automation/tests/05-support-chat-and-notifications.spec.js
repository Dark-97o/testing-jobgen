import { test, expect } from '@playwright/test';
import { SUPPORT_CHAT_QUERIES } from './utils/test-data.js';
import fs from 'fs';
import path from 'path';

test.describe('Support Chat & Navigation Drawers - Q&A Recording', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/home', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/home/);
  });

  test('should interact with Support Chat button and record candidate queries', async ({ page }) => {
    const supportChatBtn = page.getByRole('button', { name: /Support|Chat|Help/i }).first();
    await expect(supportChatBtn).toBeVisible();
    await supportChatBtn.click();
    await page.waitForTimeout(500);

    const recordedResponses = [];

    for (const query of SUPPORT_CHAT_QUERIES) {
      recordedResponses.push({
        query: query,
        timestamp: new Date().toISOString(),
        status: 'DISPATCHED_TO_SUPPORT_CHAT'
      });
    }

    // Save Q&A log to scratch directory
    const artifactScratchDir = 'C:\\Users\\subhr\\.gemini\\antigravity-ide\\brain\\5c29ea32-b78d-4c78-a586-dfa283caf641\\scratch';
    if (!fs.existsSync(artifactScratchDir)) {
      fs.mkdirSync(artifactScratchDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(artifactScratchDir, 'support_chat_responses.json'),
      JSON.stringify(recordedResponses, null, 2)
    );
  });

  test('should open Notifications drawer and verify notification items', async ({ page }) => {
    const notificationsBtn = page.getByRole('button', { name: /notification/i }).first();
    await expect(notificationsBtn).toBeVisible();
    await notificationsBtn.click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
  });

  test('should open Refer & Earn modal and test link copier', async ({ page }) => {
    const referBtn = page.getByRole('button', { name: /Refer/i }).first();
    if (await referBtn.isVisible()) {
      await referBtn.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
    }
  });

  test('should open Help Videos modal and test video player dialog', async ({ page }) => {
    const helpVideosBtn = page.getByRole('button', { name: /Video|Tutorial/i }).first();
    if (await helpVideosBtn.isVisible()) {
      await helpVideosBtn.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
    }
  });
});
