/** Ikon garis Fantasea: grid 24, garis 1,8, ujung membulat (brand/grafis/ikon). */
type P = { size?: number; className?: string };
const svg = (d: React.ReactNode) =>
  function Ikon({ size = 20, className = "" }: P) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
        {d}
      </svg>
    );
  };

export const IkonPanahKiri = svg(<path d="M15 5l-7 7 7 7" />);
export const IkonPanahKanan = svg(<path d="M9 5l7 7-7 7" />);
export const IkonPanahAtas = svg(<path d="M5 15l7-7 7 7" />);
export const IkonPanahBawah = svg(<path d="M5 9l7 7 7-7" />);
export const IkonPutar = svg(<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none" />);
export const IkonTitikTiga = svg(<><circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none" /></>);
export const IkonMenu = svg(<path d="M4 7h16M4 12h16M4 17h16" />);
export const IkonTutup = svg(<path d="M6 6l12 12M18 6L6 18" />);
export const IkonCentang = svg(<path d="M5 12.5l4.5 4.5L19 7.5" />);
export const IkonSilang = svg(<path d="M7 7l10 10M17 7L7 17" />);
export const IkonKalender = svg(<><rect x="3.5" y="5.5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v5M16 3v5" /></>);
export const IkonOrang = svg(<><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></>);
export const IkonKapal = svg(<><path d="M2.5 14.5h19l-2.6 4.3H5.1z" /><path d="M7 14.5V10h6.6l3 4.5" /><path d="M10.3 10V6.5" /></>);
export const IkonMasker = svg(<><path d="M3 9.5C3 8.1 4.1 7 5.5 7h11c1.4 0 2.5 1.1 2.5 2.5v3c0 1.7-1.3 3-3 3h-1.8c-.8 0-1.6-.5-2-1.2l-.4-.8c-.4-.8-1.6-.8-2 0l-.4.8c-.4.7-1.2 1.2-2 1.2H6c-1.7 0-3-1.3-3-3z" /><path d="M21.5 4v10.5a5 5 0 0 1-5 5H14" /></>);
export const IkonJam = svg(<><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></>);
export const IkonGelombang = svg(<path d="M2 12c1.7 0 1.7-1.5 3.3-1.5S7 12 8.7 12s1.6-1.5 3.3-1.5 1.7 1.5 3.3 1.5 1.7-1.5 3.4-1.5S20.3 12 22 12M2 17c1.7 0 1.7-1.5 3.3-1.5S7 17 8.7 17s1.6-1.5 3.3-1.5 1.7 1.5 3.3 1.5 1.7-1.5 3.4-1.5S20.3 17 22 17M2 7c1.7 0 1.7-1.5 3.3-1.5S7 7 8.7 7s1.6-1.5 3.3-1.5S13.7 7 15.3 7s1.7-1.5 3.4-1.5S20.3 7 22 7" />);
export const IkonLevel = svg(<><path d="M4 20V14M10 20V10M16 20V6M22 20H2" /></>);
export const IkonWhatsapp = svg(<><path d="M4 20l1.2-3.6A8 8 0 1 1 8 19z" /><path d="M9.2 8.6c.2-.5.6-.5.9-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.1-.1.3 0 .5.5.9 1.3 1.7 2.3 2.2.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3-.1.7-.5.9-.6.3-1.6.5-3-.1-1.8-.7-3.6-2.5-4.3-4.3-.5-1.3-.4-2.3-.2-2.9z" /></>);
export const IkonSurel = svg(<><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></>);
export const IkonPin = svg(<><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></>);
export const IkonInstagram = svg(<><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></>);
export const IkonFacebook = svg(<path d="M14 21v-7.5h2.6l.4-3H14V8.7c0-.9.3-1.5 1.5-1.5H17V4.5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.7 1.4-3.7 3.9v2.2H8.5v3H11V21" />);
export const IkonTiktok = svg(<path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.4 2.6 2.2 4.4 5 4.6" />);
export const IkonYoutube = svg(<><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.3v5.4l4.6-2.7z" fill="currentColor" stroke="none" /></>);
export const IkonBintang = svg(<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9z" fill="currentColor" stroke="none" />);
export const IkonTambah = svg(<path d="M12 5v14M5 12h14" />);
export const IkonKurang = svg(<path d="M5 12h14" />);
export const IkonUnggah = svg(<><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3" /></>);
export const IkonSampah = svg(<><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" /></>);
export const IkonKeluar = svg(<><path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14" /><path d="M10 8l-4 4 4 4M6 12h10" /></>);
