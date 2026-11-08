"use client";
import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";
import { buatT } from "./t";

type Messages = Record<string, unknown>;

interface Ctx {
  locale: Locale;
  /** Teks lewat jalur bertitik, mis. t("trip.lihat"). Variabel ditulis {nama}. */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: React.ReactNode }) {
  const value = useMemo<Ctx>(() => ({ locale, t: buatT(messages) }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n dipakai di luar I18nProvider");
  return ctx;
}
