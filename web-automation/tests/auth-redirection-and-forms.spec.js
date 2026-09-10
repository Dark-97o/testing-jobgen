import { test, expect } from '@playwright/test';

test.describe('Authentication Access Control & Sign Up Form Inputs', () => {
  // Override storageState to test unauthenticated users
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should redirect unauthenticated users visiting /home to /sign-up', async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/home', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/sign-up**');
    await expect(page).toHaveURL(/sign-up/);
  });

  test('should render Sign Up page headings, input fields, and buttons', async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/sign-up', { waitUntil: 'domcontentloaded' });

    // Main headline & subheadline
    const h1Heading = page.getByRole('heading', { level: 1 });
    await expect(h1Heading).toBeVisible();
    await expect(h1Heading).toContainText('Stop Job Hunting the Old Way');

    const h2Heading = page.getByRole('heading', { name: 'Create your account', level: 2 });
    await expect(h2Heading).toBeVisible();

    // Social login buttons
    const googleBtn = page.getByRole('button', { name: 'Continue with Google' });
    const linkedinBtn = page.getByRole('button', { name: 'Continue with LinkedIn' });
    const emailBtn = page.getByRole('button', { name: 'Continue with Email' });

    await expect(googleBtn).toBeVisible();
    await expect(linkedinBtn).toBeVisible();
    await expect(emailBtn).toBeVisible();

    // Email input field
    const emailInput = page.getByPlaceholder('work@example.com');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('testcandidate@example.com');
    await expect(emailInput).toHaveValue('testcandidate@example.com');
  });

  test('should contain legal links in footer', async ({ page }) => {
    await page.goto('https://candidates.jobgen.ai/sign-up', { waitUntil: 'domcontentloaded' });

    const termsLink = page.getByRole('link', { name: 'Terms of Use' });
    const privacyLink = page.getByRole('link', { name: 'Privacy Policy' });

    await expect(termsLink).toBeVisible();
    await expect(privacyLink).toBeVisible();

    await expect(termsLink).toHaveAttribute('href', /termsofservice/);
    await expect(privacyLink).toHaveAttribute('href', /privacy/);
  });
});
