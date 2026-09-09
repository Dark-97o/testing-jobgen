import { test, expect } from '@playwright/test';

test('JobGen candidate navigation and search flow', async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/home', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/home/);

    // Navigate to Job Search from navigation bar
    await page.getByRole('link', { name: 'Job Search' }).click();
    await expect(page).toHaveURL(/job-search/);

    // Filter by Date Posted: Last 24h
    await page.getByRole('button', { name: /Date posted/i }).first().click();
    await page.getByRole('button', { name: 'Last 24h', exact: true }).click();

    // Filter by Workplace: Remote
    await page.getByRole('button', { name: /Workplace/i }).first().click();
    await page.getByRole('button', { name: 'Remote', exact: true }).click();

    // Reset filters back to default
    await page.getByRole('button', { name: /Workplace/i }).first().click();
    await page.getByRole('button', { name: 'Any workplace', exact: true }).click();

    await page.getByRole('button', { name: /Date posted/i }).first().click();
    await page.getByRole('button', { name: 'Any time', exact: true }).click();

    // Click Search
    await page.getByRole('button', { name: /Search/i }).first().click();
});