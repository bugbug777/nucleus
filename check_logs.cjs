const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', err => console.log('ERROR:', err.message));

    // Go to the app
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(5000);

    await browser.close();
  } catch (e) {
    console.error("Playwright failed:", e);
  }
})();
