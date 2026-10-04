import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputDir = 'C:\\Users\\shiva\\.gemini\\antigravity-ide\\brain\\c34b6008-d430-47b0-a473-626a94824806';

async function run() {
  console.log('🚀 Starting Site Theme Verification...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Visit homepage
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));

  // Verify computed theme colors
  const computedTokens = await page.evaluate(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const headerStyle = header ? getComputedStyle(header) : null;
    const footerStyle = footer ? getComputedStyle(footer) : null;

    return {
      bg: rootStyle.getPropertyValue('--bg').trim(),
      surface: rootStyle.getPropertyValue('--surface').trim(),
      brandPrimary: rootStyle.getPropertyValue('--brand-primary').trim(),
      brandGold: rootStyle.getPropertyValue('--brand-gold').trim(),
      text: rootStyle.getPropertyValue('--text').trim(),
      textMuted: rootStyle.getPropertyValue('--text-muted').trim(),
      brandSale: rootStyle.getPropertyValue('--brand-sale').trim(),
      border: rootStyle.getPropertyValue('--border').trim(),
      headerBg: headerStyle ? headerStyle.backgroundColor : null,
      headerBackgroundImage: headerStyle ? headerStyle.backgroundImage : null,
      headerBorderBottom: headerStyle ? headerStyle.borderBottomColor : null,
      footerBg: footerStyle ? footerStyle.backgroundColor : null,
      footerBackgroundImage: footerStyle ? footerStyle.backgroundImage : null,
      footerBorderTop: footerStyle ? footerStyle.borderTopColor : null,
    };
  });

  console.log('Computed CSS Tokens:', JSON.stringify(computedTokens, null, 2));

  // 2. Desktop 1440px Header & Hero
  await page.setViewport({ width: 1440, height: 900 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, 'site_header_1440px.png') });
  console.log('✅ Captured site_header_1440px.png');

  // 3. Desktop 1440px Footer & Newsletter
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, 'site_footer_1440px.png') });
  console.log('✅ Captured site_footer_1440px.png');

  // 4. Tablet 768px
  await page.setViewport({ width: 768, height: 1024 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, 'site_header_768px.png') });
  console.log('✅ Captured site_header_768px.png');

  // 5. Mobile 375px Header
  await page.setViewport({ width: 375, height: 667 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, 'site_header_375px.png') });
  console.log('✅ Captured site_header_375px.png');

  // 6. Mobile 375px Menu Drawer
  const mobileToggle = await page.$('#mobile-menu-toggle');
  if (mobileToggle) {
    await mobileToggle.click();
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outputDir, 'site_mobile_menu_375px.png') });
    console.log('✅ Captured site_mobile_menu_375px.png');
  }

  // 7. Catalog page 1440px
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/catalog', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outputDir, 'site_catalog_1440px.png') });
  console.log('✅ Captured site_catalog_1440px.png');

  await browser.close();
  console.log('🎉 Verification complete!');
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
