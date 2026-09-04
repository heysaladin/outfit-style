const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');

const PAGES = [
  { name: '01-home', path: '/' },
  { name: '02-gear', path: '/gear' },
  { name: '03-fashion', path: '/fashion' },
  { name: '04-outfits', path: '/outfits' },
  { name: '05-wardrobes', path: '/wardrobes' },
  { name: '06-literacy', path: '/literacy' },
  { name: '07-calendar', path: '/calendar' },
  { name: '08-plan', path: '/plan' },
  { name: '09-stats', path: '/stats' },
  { name: '10-declutter', path: '/declutter' },
  { name: '11-family', path: '/family' },
  { name: '12-profile', path: '/profile' },
  { name: '13-admin', path: '/admin' },
  { name: '14-login', path: '/login' },
];

async function takeScreenshots() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    deviceScaleFactor: 2,
  });

  for (const page of PAGES) {
    const p = await context.newPage();
    const url = BASE_URL + page.path;
    console.log(`→ ${url}`);
    try {
      await p.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await p.waitForTimeout(800);
      const file = path.join(OUT_DIR, `${page.name}.png`);
      await p.screenshot({ path: file, fullPage: false });
      console.log(`  ✓ saved ${page.name}.png`);
    } catch (err) {
      console.error(`  ✗ failed ${page.path}: ${err.message}`);
    }
    await p.close();
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to ./screenshots/');
}

takeScreenshots().catch(console.error);
