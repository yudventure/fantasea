/**
 * Entry server untuk hosting yang meminta sebuah file, bukan perintah:
 *   Hostinger, hPanel, Node.js app, "Application startup file" server.js
 *
 * Setara `npm start`. Jalankan `npm run build` lebih dulu. Tanpa folder .next
 * proses ini berhenti dengan pesan yang jelas.
 */
process.env.NODE_ENV = process.env.NODE_ENV || "production";

const { createServer } = require("http");
const { existsSync } = require("fs");
const path = require("path");
const next = require("next");

const port = Number.parseInt(process.env.PORT || "3000", 10);
// Sengaja tidak memakai process.env.HOSTNAME: di banyak shell Linux isinya nama mesin.
const hostname = process.env.HOST || "0.0.0.0";

if (!existsSync(path.join(__dirname, ".next"))) {
  console.error("[fantasea] Folder .next tidak ditemukan. Jalankan `npm run build` dulu.");
  process.exit(1);
}

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      Promise.resolve(handle(req, res)).catch((err) => {
        console.error(`[fantasea] gagal menangani ${req.method} ${req.url}`, err);
        if (!res.headersSent) res.statusCode = 500;
        res.end("Internal Server Error");
      });
    });
    server.listen(port, hostname, () => console.log(`[fantasea] siap di http://${hostname}:${port}`));
    for (const signal of ["SIGTERM", "SIGINT"]) {
      process.on(signal, () => {
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(0), 10_000).unref();
      });
    }
  })
  .catch((err) => {
    console.error("[fantasea] gagal menyiapkan Next.js", err);
    process.exit(1);
  });
