"use client";
import { useId, useMemo, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/context";
import Dropdown from "./Dropdown";

export interface ItemKatalogAktivitas {
  id: string;
  kategori: string;
  pencarian: string;
  kartu: ReactNode;
}
const normalkan = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();

export default function KatalogAktivitas({ item, kategori, labelPrefix = "activity" }: { item: ItemKatalogAktivitas[]; kategori: { nilai: string; label: string }[]; labelPrefix?: "activity" | "homestayCatalog" }) {
  const { t } = useI18n();
  const inputId = useId();
  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState("");
  const indeks = useMemo(() => item.map((x) => ({ ...x, teks: normalkan(x.pencarian) })), [item]);
  const kata = normalkan(cari).trim().split(/\s+/).filter(Boolean);
  const hasil = indeks.filter((x) => (!filter || x.kategori === filter) && kata.every((k) => x.teks.includes(k)));
  const aktif = cari.length > 0 || filter !== "";
  const reset = () => { setCari(""); setFilter(""); };

  return <>
    <div className="mt-6 grid items-end gap-4 rounded-card border border-line bg-white p-4 sm:p-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div>
        <label htmlFor={inputId} className="kolom-label">{t(`${labelPrefix}.search`)}</label>
        <input id={inputId} type="search" value={cari} onChange={(e) => setCari(e.target.value)} placeholder={t(`${labelPrefix}.searchHint`)} className="kolom" autoComplete="off" />
      </div>
      <Dropdown label={t(`${labelPrefix}.category`)} value={filter} onChange={setFilter} kosong={t(`${labelPrefix}.allCategories`)} pilihan={[{ nilai: "", label: t(`${labelPrefix}.allCategories`) }, ...kategori]} />
    </div>
    <div className="mb-6 mt-5 flex min-h-8 flex-wrap items-center justify-between gap-3">
      <p role="status" aria-live="polite" aria-atomic="true" className="text-sm font-semibold text-ink2">{t(`${labelPrefix}.${hasil.length === 1 ? "resultOne" : "results"}`, { n: hasil.length })}</p>
      {aktif && <button type="button" onClick={reset} className="rounded-pill px-3 py-1.5 text-sm font-bold text-tanda hover:bg-buih">{t(`${labelPrefix}.reset`)}</button>}
    </div>
    <div id={`${labelPrefix}-results`} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {hasil.map((x) => <div key={x.id} className="h-full">{x.kartu}</div>)}
    </div>
    {hasil.length === 0 && <div className="rounded-card border border-line bg-white px-6 py-12 text-center">
      <h2 className="text-[28px]">{t(`${labelPrefix}.noResults`)}</h2>
      <p className="mt-3 text-ink2">{t(`${labelPrefix}.trySearch`)}</p>
    </div>}
  </>;
}
