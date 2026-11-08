/**
 * Kunci gulir halaman di belakang lapisan (menu ponsel, kalender). Safari
 * mengabaikan overflow hidden untuk sentuhan, jadi body dibekukan dengan
 * position fixed lalu posisinya dikembalikan (pola DAMPIER lib/scrollLock.ts).
 */
let kunci = 0;
let posisi = 0;

export function kunciGulir() {
  if (typeof document === "undefined") return;
  if (kunci++ > 0) return;
  posisi = window.scrollY;
  const b = document.body.style;
  b.position = "fixed";
  b.top = `-${posisi}px`;
  b.left = "0";
  b.right = "0";
  b.width = "100%";
}

export function lepasGulir() {
  if (typeof document === "undefined" || kunci === 0) return;
  if (--kunci > 0) return;
  const b = document.body.style;
  b.position = b.top = b.left = b.right = b.width = "";
  window.scrollTo(0, posisi);
}
