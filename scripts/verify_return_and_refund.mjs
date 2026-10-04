import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputDir = 'C:\\Users\\shiva\\.gemini\\antigravity-ide\\brain\\c34b6008-d430-47b0-a473-626a94824806';
const JWT_SECRET = process.env.JWT_SECRET || 'rajkanwari-super-secret-jwt-key-change-in-prod';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function makeToken(sub, email, role) {
  return jwt.sign({ sub, email, role }, JWT_SECRET, { expiresIn: '1d' });
}

async function run() {
  console.log('=== Starting Customer Return & Admin Payment/Refund Visual Verification ===');

  const customerToken = makeToken('usr_cust_01', 'priya@example.com', 'customer');
  const ownerToken = makeToken('usr_owner_01', 'owner@shikkis.com', 'owner');

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Helper to set theme
  const setTheme = async (theme) => {
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('shikkis-theme', t);
      localStorage.setItem('rajkanwari-theme', t);
    }, theme);
    await new Promise((r) => setTimeout(r, 400));
  };

  // ── 1. Customer Return Request Workflow ────────────────────────────────────
  console.log('\n--- 1. Testing Customer Return Flow ---');
  await page.setCookie({
    name: 'accessToken',
    value: customerToken,
    domain: 'localhost',
    path: '/',
  });

  await page.goto('http://localhost:5173/catalog', { waitUntil: 'domcontentloaded' });
  await page.evaluate((tok) => {
    localStorage.setItem('shikkis_access_token', tok);
    localStorage.setItem('rajkanwari_access_token', tok);
  }, customerToken);

  // Navigate to delivered order ord_001
  await page.goto('http://localhost:5173/orders/ord_001', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  // Take customer order view screenshots
  for (const theme of ['light', 'dark']) {
    await setTheme(theme);
    for (const vp of [
      { name: '1440', width: 1440, height: 900 },
      { name: '768', width: 768, height: 1024 },
      { name: '375', width: 375, height: 812 },
    ]) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise((r) => setTimeout(r, 300));
      const file = path.join(outputDir, `customer_order_detail_${vp.name}_${theme}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`Saved: ${file}`);
    }
  }

  // Open Customer Return Request Modal
  console.log('Opening Return Request Modal...');
  await page.setViewport({ width: 1440, height: 900 });
  await setTheme('light');

  const clickedReturn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find((el) => el.textContent.includes('Request Return'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Request Return button:', clickedReturn);
  await new Promise((r) => setTimeout(r, 1000));

  // Capture Customer Return Modal screenshots
  for (const theme of ['light', 'dark']) {
    await setTheme(theme);
    for (const vp of [
      { name: '1440', width: 1440, height: 900 },
      { name: '768', width: 768, height: 1024 },
      { name: '375', width: 375, height: 812 },
    ]) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise((r) => setTimeout(r, 300));
      const file = path.join(outputDir, `customer_return_modal_${vp.name}_${theme}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`Saved: ${file}`);
    }
  }

  // Close modal by clicking Cancel
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cancel = btns.find((el) => el.textContent.trim() === 'Cancel');
    if (cancel) cancel.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // ── 2. Admin Order Details: Payment Confirmation & Refund ───────────────────
  console.log('\n--- 2. Testing Admin Order Flow (Payment Confirmation & Refund) ---');
  await page.setCookie({
    name: 'accessToken',
    value: ownerToken,
    domain: 'localhost',
    path: '/',
  });

  await page.goto('http://localhost:5173/catalog', { waitUntil: 'domcontentloaded' });
  await page.evaluate((tok) => {
    localStorage.setItem('shikkis_access_token', tok);
    localStorage.setItem('rajkanwari_access_token', tok);
  }, ownerToken);

  // Navigate to admin order page for ord_004 (pending COD order)
  await page.goto('http://localhost:5173/admin/orders/ord_004', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  // Capture Admin Order Detail page
  for (const theme of ['light', 'dark']) {
    await setTheme(theme);
    for (const vp of [
      { name: '1440', width: 1440, height: 900 },
      { name: '768', width: 768, height: 1024 },
      { name: '375', width: 375, height: 812 },
    ]) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise((r) => setTimeout(r, 300));
      const file = path.join(outputDir, `admin_order_detail_${vp.name}_${theme}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`Saved: ${file}`);
    }
  }

  // Open "Confirm Payment" Modal
  console.log('Opening Confirm Payment Modal...');
  await page.setViewport({ width: 1440, height: 900 });
  await setTheme('light');
  const clickedConfirm = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find((el) => el.textContent.includes('Confirm Payment'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Confirm Payment button:', clickedConfirm);
  await new Promise((r) => setTimeout(r, 1000));

  // Capture Confirm Payment Modal screenshots
  for (const theme of ['light', 'dark']) {
    await setTheme(theme);
    for (const vp of [
      { name: '1440', width: 1440, height: 900 },
      { name: '768', width: 768, height: 1024 },
      { name: '375', width: 375, height: 812 },
    ]) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise((r) => setTimeout(r, 300));
      const file = path.join(outputDir, `admin_confirm_payment_modal_${vp.name}_${theme}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`Saved: ${file}`);
    }
  }

  // Close Confirm Payment Modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cancel = btns.find((el) => el.textContent.trim() === 'Cancel');
    if (cancel) cancel.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // Open "Refund Order" Modal
  console.log('Opening Refund Order Modal...');
  await page.setViewport({ width: 1440, height: 900 });
  await setTheme('light');
  const clickedRefund = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find((el) => el.textContent.includes('Refund Order'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Refund Order button:', clickedRefund);
  await new Promise((r) => setTimeout(r, 1000));

  // Capture Refund Modal screenshots
  for (const theme of ['light', 'dark']) {
    await setTheme(theme);
    for (const vp of [
      { name: '1440', width: 1440, height: 900 },
      { name: '768', width: 768, height: 1024 },
      { name: '375', width: 375, height: 812 },
    ]) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise((r) => setTimeout(r, 300));
      const file = path.join(outputDir, `admin_refund_modal_${vp.name}_${theme}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`Saved: ${file}`);
    }
  }

  // Close Refund Modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cancel = btns.find((el) => el.textContent.trim() === 'Cancel');
    if (cancel) cancel.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  console.log('\n=== Visual Verification Successfully Completed! ===');
  await browser.close();
}

run().catch((err) => {
  console.error('Verification script failed:', err);
  process.exit(1);
});
