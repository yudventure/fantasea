#!/usr/bin/env node
/**
 * Pemeriksa tanda baca teks yang tampil (diadaptasi dari DAMPIER).
 * Aturan pemilik: teks yang dibaca orang, di situs maupun panel, tidak memakai
 *
 *   —  tanda pisah panjang, dan tanda pisah berspasi " – "
 *   ;  titik koma
 *   :  titik dua di dalam kalimat
 *
 * Boleh: jam dan rasio (07:00, 16:9), alamat (https://), rentang rapat (12–15).
 * Juga garis datar pemisah: <hr>, border-t, border-b, border-y, divide-x, divide-y.
 *
 * Yang diperiksa: nilai di messages/*.json dan teks JSX, atribut yang tampil,
 * serta string di app/, components/, lib/, data/. Komentar tidak ikut.
 *
 *   node scripts/cek-tanda-baca.mjs
 * Keluar 1 kalau ada temuan.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const AKAR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const FOLDER_KODE = ["app", "components", "lib", "data"];

const ATRIBUT_BUKAN_TEKS = new Set([
  "className", "href", "src", "id", "htmlFor", "type", "rel", "target", "style", "role", "inputMode", "autoComplete",
  "pattern", "accept", "sizes", "d", "viewBox", "points", "fill", "stroke", "name", "value", "dateTime", "lang", "dir",
  "key", "as", "media", "loading", "xmlns", "transform", "strokeLinecap", "strokeLinejoin", "aria-labelledby", "hrefLang",
  "rasio", "jenis", "awalan", "kelasAksen", "aksen",
]);

export function periksaTeks(teks) {
  if (!/\p{L}/u.test(teks)) return [];
  const bersih = teks
    .replace(/(https?|mailto|tel):\S*/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\b\d{1,2}[:.]\d{2}\b/g, " ")
    .replace(/\b\d+:\d+\b/g, " ");
  const hasil = [];
  if (/[—―]/.test(bersih)) hasil.push("tanda pisah panjang");
  if (/\s–\s/.test(bersih)) hasil.push("tanda pisah berspasi");
  if (/;(\s|$)/.test(bersih)) hasil.push("titik koma");
  if (/\S:(\s|$)/.test(bersih)) hasil.push("titik dua");
  return hasil;
}

function periksaJson(berkas) {
  const temuan = [];
  const jalan = (o, kunci) => {
    if (typeof o === "string") { for (const m of periksaTeks(o)) temuan.push({ berkas, letak: kunci, masalah: m, teks: o }); return; }
    if (Array.isArray(o)) o.forEach((v, i) => jalan(v, `${kunci}[${i}]`));
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) jalan(v, kunci ? `${kunci}.${k}` : k);
  };
  jalan(JSON.parse(fs.readFileSync(berkas, "utf8")), "");
  return temuan;
}

const GARIS = /<hr[\s/>]|(^|[\s"'`])(border-[tby](-\S+)?|divide-[xy](-\S+)?)(?=[\s"'`]|$)/;

function periksaKode(berkas) {
  const temuan = [];
  const sumber = ts.createSourceFile(berkas, fs.readFileSync(berkas, "utf8"), ts.ScriptTarget.Latest, true, berkas.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const baris = (node) => `baris ${sumber.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;
  const catat = (node, teks) => { for (const m of periksaTeks(teks)) temuan.push({ berkas, letak: baris(node), masalah: m, teks: teks.trim() }); };
  const dilewati = (node) => {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p)) return true;
      if (ts.isJsxAttribute(p) && ATRIBUT_BUKAN_TEKS.has(p.name.getText(sumber))) return true;
      if (ts.isCallExpression(p) && /^(console\.|fetch$|new URL|require$)/.test(p.expression.getText(sumber))) return true;
      if (ts.isPropertyAssignment(p) && p.name === node) return true;
      // Variabel SKRIP_* berisi kode JavaScript untuk peramban (mis. SKRIP_AWAL di lib/gulir-awal.ts), bukan teks yang tampil.
      if (ts.isVariableDeclaration(p) && /^SKRIP_/.test(p.name.getText(sumber))) return true;
      if (ts.isJsxAttribute(p) || ts.isJsxElement(p) || ts.isJsxSelfClosingElement(p)) break;
    }
    return false;
  };
  const garis = (node, teks) => { if (GARIS.test(teks)) temuan.push({ berkas, letak: baris(node), masalah: "garis pemisah", teks: teks.trim() }); };
  const kunjungi = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) garis(node, node.text);
    else if (ts.isTemplateExpression(node)) garis(node, [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(" "));
    else if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(sumber) === "hr") garis(node, "<hr>");
    if (ts.isJsxText(node)) catat(node, node.text);
    else if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !dilewati(node)) catat(node, node.text);
    else if (ts.isTemplateExpression(node) && !dilewati(node)) catat(node, [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join("x"));
    ts.forEachChild(node, kunjungi);
  };
  kunjungi(sumber);
  return temuan;
}

function semuaBerkas() {
  const hasil = [];
  const telusur = (dir) => {
    for (const nama of fs.readdirSync(dir)) {
      const p = path.join(dir, nama);
      if (fs.statSync(p).isDirectory()) telusur(p);
      else if (/\.(tsx?|json)$/.test(nama)) hasil.push(p);
    }
  };
  for (const d of FOLDER_KODE) if (fs.existsSync(path.join(AKAR, d))) telusur(path.join(AKAR, d));
  const pesan = path.join(AKAR, "messages");
  for (const n of fs.readdirSync(pesan)) if (n.endsWith(".json")) hasil.push(path.join(pesan, n));
  return hasil;
}

const temuan = semuaBerkas().flatMap((b) => (b.endsWith(".json") ? periksaJson(b) : periksaKode(b)));
for (const t of temuan) console.log(`${path.relative(AKAR, t.berkas)} ${t.letak}  [${t.masalah}]  ${t.teks.slice(0, 120)}`);
if (temuan.length) { console.log(`\n${temuan.length} temuan. Tulis ulang tanpa tanda itu (lihat CLAUDE.md, Gaya).`); process.exit(1); }
console.log("Tanda baca bersih.");
