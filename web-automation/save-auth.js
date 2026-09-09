const { chromium } = require('@playwright/test');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Navigating to login page...');
    // Replace with your actual target URL
    await page.goto('https://candidates.jobgen.ai/sign-up');

    console.log('----------------------------------------------------');
    console.log('Browser is open! Log in manually (enter email, password, and OTP).');
    console.log('Waiting for you to complete login...');
    console.log('----------------------------------------------------');

    // Option A: Wait for a specific URL after login (e.g., dashboard)
    // await page.waitForURL('**/dashboard**', { timeout: 120000 });

    // Option B: Wait for you to press Enter in the terminal once logged in
    console.log('Press ENTER in this terminal once you are logged into the dashboard:');
    await new Promise((resolve) => process.stdin.once('data', resolve));

    // Save session data
    await context.storageState({ path: 'auth.json' });
    console.log('Success! Authentication saved to auth.json');

    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
})();

