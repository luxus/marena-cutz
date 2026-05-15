const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function takeScreenshot(url, outputPath = null) {
  const browser = await chromium.connectOverCDP('ws://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages()[0] || await context.newPage();

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });

  // Give the page time to hydrate and render
  await page.waitForTimeout(2000);

  // Wait for the theme switcher (good signal that the app is ready)
  try {
    await page.waitForSelector('#theme-dropdown-button', { timeout: 8000 });
  } catch (e) {
    console.log('Theme switcher not found, page might still be loading...');
  }

  const screenshotPath = outputPath || path.join(__dirname, '..', 'screenshots', `screenshot-${Date.now()}.png`);
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });

  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved to: ${screenshotPath}`);

  await browser.close();
  return screenshotPath;
}

// Allow running from command line: node scripts/screenshot.js http://localhost:4321
if (require.main === module) {
  const url = process.argv[2] || 'http://localhost:4321';
  takeScreenshot(url).catch(console.error);
}

module.exports = { takeScreenshot };