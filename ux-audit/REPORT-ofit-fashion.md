# UX Audit — /fashion & /ofit — 2026-09-24

**Scope:** `/fashion` (wardrobe catalog) · `/ofit` (wardrobe/outfit builder)  
**Primary task:** Browse item catalog, filter/sort, build outfit dari selection  
**Viewports tested:** 375 / 768 / 1440 (konten max 430px by design)

---

## Summary

Kedua halaman berfungsi baik di mobile 375px. Temuan terbesar adalah **500 error intermittent** yang terjadi beberapa kali saat audit — user bisa tiba-tiba dihadapkan blank page. Di luar itu, ada DS violation (hardcoded colors) yang lolos dari Milestone 02 cleanup, missing `<title>` metadata, dan beberapa a11y gaps kecil. Yang bekerja dengan baik: filter chip system, sort dropdown, select mode + create outfit flow, dan worth-it progress bar.

---

## Findings

| # | Issue | Lokasi | Evidence | Severity | Lens | Fix |
|---|-------|--------|----------|----------|------|-----|
| 1 | **Intermittent 500 error** — `SyntaxError: Unexpected end of JSON input` di server | `/fashion` & `/ofit` (server component) | Observed 4× selama audit; dev server log: `GET /fashion 500 in 391ms` | **P0** | Reliability | Trace JSON.parse di server component / middleware, tambah try-catch dengan fallback data |
| 2 | **Tidak ada `<title>` metadata** di /fashion | `app/fashion/page.tsx` — tidak ada `export const metadata` | Browser tab "Interestory" (bukan "Fashion") | **P1** | A11y / SEO | Tambah `export const metadata = { title: 'Fashion' }` |
| 3 | **Tidak ada `<title>` metadata** di /ofit | `app/ofit/page.tsx` — tidak ada `export const metadata` | Browser tab "Interestory" (bukan "Wardrobe") | **P1** | A11y / SEO | Tambah `export const metadata = { title: 'Wardrobe' }` |
| 4 | **Category filter chips: tidak ada scroll affordance** — scrollbar disembunyikan, tidak ada fade/arrow hint | `FilterBar.tsx:87` `scrollbarWidth: 'none'` | Di 375px "Footwear" terpotong, user tidak tahu ada chip lagi | **P1** | Mobile ergonomics | Tambah `mask-image` gradient fade di sisi kanan chips row |
| 5 | **Select mode button (CheckSquare) tidak ada `aria-label`** | `Header.tsx:29` — MobileButton tanpa aria-label | Icon-only button tidak terbaca screen reader | **P1** | A11y (WCAG 2.2) | Tambah `aria-label="Select items"` |
| 6 | **/fashion grid: selalu 2 kolom** — tidak responsive di 768px+ | `FashionClient.tsx:254` — `grid-cols-2` tanpa breakpoint | Screenshot 768px: 2 kolom saja padahal ada ruang (beda dengan /ofit yang pakai `md:grid-cols-3`) | **P2** | Layout | Ubah ke `grid-cols-2 md:grid-cols-3` |
| 7 | **Hardcoded Tailwind colors di worth-it bar & badge** (DS violation Milestone 02) | `FashionClient.tsx:288-290`: `bg-emerald-600`, `bg-amber-500`, `bg-slate-400` · `ItemCard.tsx:74,111`: `bg-emerald-100`, `text-green-600` | Visual inconsistency jika tokens berubah; melanggar Milestone 02 | **P2** | DS consistency | Ganti ke success/warning/muted tokens dari Cubicle DS |
| 8 | **Image treatment inconsistency** — /fashion: `aspect-square + object-cover` (crop) vs /ofit: `object-contain` (full) | `FashionClient.tsx:261-267` vs `ItemCard.tsx:55` | Item yang sama terlihat berbeda di dua halaman | **P2** | DS consistency | Seragamkan ke `object-contain` (product photography tidak seharusnya di-crop) |
| 9 | **Emoji icon chip tidak `aria-hidden`** — screen reader akan membaca "👕 Top" | `FilterBar.tsx:99`: `<span>{cat.icon}</span>` | — | **P2** | A11y | Ganti ke `<span aria-hidden="true">{cat.icon}</span>` |
| 10 | **"Raw"/"Edit" toggle label membingungkan** — "Edit" menyiratkan edit item, bukan toggle ke original image | `ItemCard.tsx:82-84` | — | **P2** | Microcopy | Ganti ke "Ori"/"No BG" atau icon dua-state |
| 11 | **"Never worn" vs "0×" microcopy** — item sama, copy beda di dua halaman | `ItemCard.tsx:108` vs `FashionClient.tsx:295` | — | **P3** | Microcopy | Seragamkan (rekomendasi: "Never worn" lebih human) |
| 12 | **Sort label "Closest to worth it" terpotong** di chip | `FilterBar.tsx:22` `SORT_LABEL` | Di 375px sort button terlalu sempit | **P3** | Mobile ergonomics | Perkecil: "Worth It ↑" |

---

## Top 5 Quick Wins

1. **Tambah `<title>` metadata** di `/fashion` dan `/ofit` — 2 baris kode, langsung hilangkan "Interestory" di tab
2. **`aria-hidden="true"` di emoji chips** — 1 kata di `FilterBar.tsx:99`, semua MobileChip icon
3. **`aria-label` di CheckSquare button** — 1 prop di `Header.tsx:29`
4. **`grid-cols-2 md:grid-cols-3`** di FashionClient grid — 1 class, langsung memanfaatkan ruang di 768px
5. **Scroll fade di category chips** — 1 CSS mask, langsung jelaskan ada lebih banyak kategori

---

## What's Working

- Filter + sort system: komprehensif, state management rapi
- Select mode → create outfit flow: smooth, bottom bar responsive
- Worth-it progress bar: informative dan motivating
- Dark mode toggle di header: konsisten
- Empty state copy sudah baik
- Confirm-before-delete di ItemCard: sudah ada dua langkah
- Search dengan `#tag` support: powerful dan underpromoted tapi ada

---

## Open Questions

- **500 intermittent**: apakah error ini datang dari proxy middleware atau Supabase client? Perlu trace lebih dalam — mungkin butuh error boundary di server component.
- **"Raw"/"Edit" toggle**: apakah fitur ini masih dipakai? Jika jarang, pertimbangkan hapus untuk simplify ItemCard.
- **/ofit naming**: apakah URL `/ofit` + header title "Wardrobe" sudah sesuai mental model? Bisa dipertimbangkan konsistensi: `/wardrobe` atau ganti header ke "Ofit".
