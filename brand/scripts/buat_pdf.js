// Mencetak brand/pedoman-merek.html menjadi brand/pedoman-merek.pdf (A4).
// Pakai: node brand/scripts/buat_pdf.js   (butuh Playwright + Chromium dan internet untuk Google Fonts)
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const brand = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(brand, 'pedoman-merek.html'), 'utf8');
// Halaman ditulis tanpa kerangka <html>; tambahkan kerangka dan <base> agar gambar relatif tetap ditemukan.
const head = src.slice(0, src.indexOf('<style>'));
const style = src.slice(src.indexOf('<style>'), src.indexOf('</style>') + 8);
const body = src.slice(src.indexOf('</style>') + 8);
const html = `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="file://${brand}/">${head}${style}</head><body>${body}</body></html>`;
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'fantasea-')), 'pedoman.html');
fs.writeFileSync(tmp, html);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 } });
  await page.goto('file://' + tmp, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  await page.pdf({
    path: path.join(brand, 'pedoman-merek.pdf'),
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="width:100%;font:8px Nunito, sans-serif;color:#55657A;padding:0 12mm;display:flex;justify-content:space-between"><span>Pedoman Merek Fantasea Dive Travel · Edisi 1</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  });
  await browser.close();
  console.log('✓ pedoman-merek.pdf');
})();
