const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env.CHROME_BIN
].filter(Boolean);

let executablePath = chromePaths.find(p => fs.existsSync(p));
const artifactDir = 'C:\\Users\\shiva\\.gemini\\antigravity-ide\\brain\\32e0d5db-22c7-4808-b704-6e85c0532761';

async function run() {
  console.log('Launching browser with executable:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 812 },
  ];

  const themes = ['light', 'dark'];

  // Navigate to catalog page
  await page.goto('http://localhost:5173/catalog', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Add 2 items via fetch inside browser context with credentials
  console.log('Adding 2 items to shopping cart...');
  await page.evaluate(async () => {
    await fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ variant_id: 'var_prd_01_1', quantity: 2 })
    });
    await fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ variant_id: 'var_prd_02_1', quantity: 1 })
    });
  });

  // Reload page
  await page.goto('http://localhost:5173/catalog', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Helper to open drawer and ensure visible
  async function ensureDrawerOpen() {
    await page.evaluate(() => {
      // Find bag button with badge count
      const bagButtons = Array.from(document.querySelectorAll('button')).filter(b => 
        b.getAttribute('aria-label')?.toLowerCase().includes('shopping bag') ||
        b.textContent.includes('Bag') ||
        b.querySelector('svg')
      );
      // Click the one in header
      const headerBagBtn = bagButtons.find(b => b.querySelector('span') && b.querySelector('span').textContent.trim().length > 0) || bagButtons[0];
      if (headerBagBtn) headerBagBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
  }

  // Capturing BEFORE deletion screenshots across themes and viewports
  console.log('Capturing BEFORE deletion screenshots (with 2 items)...');
  for (const theme of themes) {
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('shikkis-theme', t);
    }, theme);

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await ensureDrawerOpen();
      const shotPath = path.join(artifactDir, `cart_before_${theme}_${vp.width}px.png`);
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot: ${shotPath}`);
    }
  }

  // Click delete trash button on the first item in drawer
  console.log('Clicking trash icon to delete item...');
  const deleteClickResult = await page.evaluate(() => {
    const removeBtn = Array.from(document.querySelectorAll('button')).find(b => {
      const label = b.getAttribute('aria-label') || '';
      return label.startsWith('Remove ') || label.includes('Remove');
    });
    if (removeBtn) {
      removeBtn.click();
      return { success: true, label: removeBtn.getAttribute('aria-label') };
    }
    return { success: false };
  });
  console.log('Item deletion click result:', deleteClickResult);
  await new Promise(r => setTimeout(r, 1500));

  // Capturing AFTER deletion screenshots across themes and viewports
  console.log('Capturing AFTER deletion screenshots (1 item removed)...');
  for (const theme of themes) {
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('shikkis-theme', t);
    }, theme);

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await ensureDrawerOpen();
      const shotPath = path.join(artifactDir, `cart_after_${theme}_${vp.width}px.png`);
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot: ${shotPath}`);
    }
  }

  await browser.close();
  console.log('Verification script completed successfully!');
}

run().catch(err => {
  console.error('Error running verification script:', err);
  process.exit(1);
});
