// Merender elemen grafis dan ikon SVG menjadi PNG transparan (untuk Canva, Word, dan WhatsApp).
// Pakai: node brand/scripts/buat_png_grafis.js   (butuh Playwright + Chromium)
// Hasil: brand/grafis/png/*.png dan brand/grafis/ikon/png/*.png
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const brand = path.resolve(__dirname, '..');
const grafis = path.join(brand, 'grafis');
const ikon = path.join(grafis, 'ikon');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fantasea-png-'));

// [berkas SVG, lebar PNG, nama keluaran, warna pengganti (opsional)]
const tugas = [
  ['tanda-arah.svg', 600, 'tanda-arah.png'],
  ['tanda-arah-belah.svg', 600, 'tanda-arah-belah.png'],
  ['pulau-segi.svg', 1200, 'pulau-segi.png'],
  ['pulau-segi-kecil.svg', 600, 'pulau-segi-kecil.png'],
  ['garis-ekor.svg', 400, 'garis-ekor.png'],
  ['garis-ekor-mendatar.svg', 1600, 'garis-ekor-mendatar.png'],
  ['ukir-sayap.svg', 2000, 'ukir-sayap.png'],
  ['ukir-sayap-putih.svg', 2000, 'ukir-sayap-putih.png'],
  ['pola-jalur.svg', 1200, 'pola-jalur-ubin.png'],
  ['pola-jalur-gelap.svg', 1200, 'pola-jalur-gelap-ubin.png'],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2200, height: 2200 } });

  async function render(svgPath, width, out, ganti) {
    let src = 'file://' + svgPath;
    if (ganti) {
      const svg = fs.readFileSync(svgPath, 'utf8').replace(/#203149/g, ganti);
      const f = path.join(tmpDir, path.basename(out, '.png') + '.svg');
      fs.writeFileSync(f, svg);
      src = 'file://' + f;
    }
    const html = path.join(tmpDir, 'r.html');
    fs.writeFileSync(html, `<!doctype html><html><body style="margin:0;background:transparent">
      <img id="g" src="${src}" style="display:block;width:${width}px;height:auto"></body></html>`);
    await page.goto('file://' + html, { waitUntil: 'load' });
    const el = await page.$('#g');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await el.screenshot({ path: out, omitBackground: true });
    console.log('✓', path.relative(brand, out));
  }

  for (const [svg, w, out] of tugas) {
    await render(path.join(grafis, svg), w, path.join(grafis, 'png', out));
  }
  for (const f of fs.readdirSync(ikon).filter(f => f.endsWith('.svg')).sort()) {
    const nama = f.replace('.svg', '');
    await render(path.join(ikon, f), 512, path.join(ikon, 'png', `${nama}-navy.png`));
    await render(path.join(ikon, f), 512, path.join(ikon, 'png', `${nama}-putih.png`), '#FFFFFF');
  }
  await browser.close();
})();
