/** Pembaca teks antarmuka, dipakai server dan peramban. */
type Messages = Record<string, unknown>;

export function cariPesan(messages: Messages, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) return (acc as Record<string, unknown>)[part];
    return undefined;
  }, messages);
}

export function buatT(messages: Messages) {
  return (key: string, vars?: Record<string, string | number>) => {
    const found = cariPesan(messages, key);
    // Kunci yang hilang tampil apa adanya supaya cepat ketahuan.
    if (typeof found !== "string") return key;
    return vars ? found.replace(/\{(\w+)\}/g, (m, n) => (n in vars ? String(vars[n]) : m)) : found;
  };
}
