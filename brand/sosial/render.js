// Membuat ulang PNG siap unggah dari template HTML.
// Pakai: node brand/sosial/render.js         (semua template)
//        node brand/sosial/render.js 02      (template yang namanya diawali 02)
// Butuh Node.js dan Playwright (Chromium). Font dimuat dari brand/font/web, jadi tidak perlu internet.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'template');
const out = path.join(__dirname, 'ekspor');
const filter = process.argv[2] || '';

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f.startsWith(filter)).sort();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 2000 } });
  for (const f of files) {
    await page.goto('file://' + path.join(dir, f), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const items = await page.$$('.kanvas');
    for (const el of items) {
      const name = (await el.getAttribute('data-nama')) || f.replace('.html', '');
      await el.screenshot({ path: path.join(out, name + '.png') });
      console.log('✓', name + '.png');
    }
  }
  await browser.close();
})();
