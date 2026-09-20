# UX Audit — /fashion — 2026-09-20

**Scope:** `/fashion` (list + item detail `/fashion/[id]`)  
**Primary task:** Browse wardrobe catalog, filter by category, tap item for detail, log a wear, post outfit activity  
**Viewports:** 375 / 768 / 1440  
**Method:** Live Playwright capture (page loaded, screenshots taken at 3 viewports, interactions attempted) + full code review. High confidence.

---

## Summary

`/fashion` adalah halaman katalog yang bersih dan functional dengan tab Items/Activities/Moments yang logis. Struktur header mobile-nya bagus dan item card-nya minimal tapi informatif. Risiko terbesar ada di tiga area: (1) **items tidak di-SSR** — halaman muncul dengan "0 items" selama client fetch berlangsung, bukan loading skeleton yang proper; (2) **`AlignLeft` icon dipakai untuk toggle "show/hide names"** — icon yang sepenuhnya salah secara semantik dan membingungkan semua pengguna; (3) beberapa **input & button tanpa accessible label** yang merupakan WCAG violation. Secara keseluruhan page ini lebih lightweight dari `/ofit` tapi punya beberapa inkonsistensi arsitektur dan akses.

---

## Findings

| # | Issue | Where | Evidence | Severity | Lens | Recommended fix |
|---|-------|--------|----------|----------|------|-----------------|
| 1 | **"0 items" ditampilkan saat client-side fetch** — `items` dimulai dari `null`, count menampilkan `0` bukan "Loading" | `FashionClient.tsx:202` — `{items?.length ?? 0} items` | Dikonfirmasi live: count tetap "0 items" bahkan setelah 8+ detik; screenshot `fashion-after-wait-375.png` | **P1** | Visibility of system status | Ganti `items?.length ?? 0` dengan `items === null ? '—' : items.length` atau tampilkan skeleton count |
| 2 | **Items tidak di-SSR** — `app/fashion/page.tsx` tidak meneruskan items sebagai prop; items di-fetch client-side via `useEffect` | `app/fashion/page.tsx:26-31`, `FashionClient.tsx:71-80` | Halaman pertama kali load menunjukkan skeleton squares; items hanya muncul setelah client fetch selesai | **P1** | Performance / First Contentful Paint | Pindahkan fetch items ke server component dan pass sebagai prop, seperti pola `/ofit/page.tsx` |
| 3 | **`AlignLeft` icon dipakai sebagai tombol "show/hide names"** — icon text-justify tidak ada hubungannya dengan toggle nama item | `FashionClient.tsx:181` — `<AlignLeft className="h-4 w-4" />` | Screenshot `fashion-375.png`: icon ini terlihat seperti hamburger menu di header | **P1** | Consistency / Recognition | Ganti dengan icon yang relevan: `EyeOff` / `Eye` untuk hide/show, atau `Tag` / `TagOff` |
| 4 | **"Show names" button tidak punya `aria-label`** — hanya `title` attribute yang tidak accessible di touchscreen | `FashionClient.tsx:173-181` | WCAG 2.2 SC 4.1.2 | **P1** | A11y | Tambah `aria-label={showNames ? 'Hide names' : 'Show names'}` dan `aria-pressed={showNames}` |
| 5 | **Main search input tidak punya `aria-label` atau `<label>`** — hanya `placeholder` | `FashionClient.tsx:245-251` | WCAG 2.2 SC 1.3.1 | **P1** | A11y | Tambah `aria-label="Search fashion items"` pada `<input>` |
| 6 | **FilterBar sliders icon button tidak punya `aria-label`** — icon-only, tidak ada text | `FilterBar.tsx:200-214` — `<SlidersHorizontal size={13} />` | Dikonfirmasi dari a11y snapshot: `button [ref=f42e44]` tanpa name | **P1** | A11y | Tambah `aria-label={expanded ? 'Close filters' : 'Open filters'}` dan `aria-expanded={expanded}` |
| 7 | **Search bar hilang ketika semua items terfilter** — hanya muncul saat `items && items.length > 0` | `FashionClient.tsx:241` — `{items && items.length > 0 && (<div>...search...</div>)}` | Jika user apply kategori filter → 0 match → search bar hilang, user tidak bisa search untuk memperbaiki | **P1** | Error recovery | Tampilkan search bar selalu saat tab items aktif (pindahkan ke luar conditional) |
| 8 | **Quick Post item select buttons tidak punya accessible name** — 469 image-only buttons tanpa text/aria-label | `FashionClient.tsx:366-389` | WCAG 2.2 SC 4.1.2 — critical a11y | **P1** | A11y | Tambah `aria-label={item.name}` dan `aria-pressed={sel}` pada setiap button |
| 9 | **Items grid menggunakan `<img>` bukan Next.js `<Image>`** — kehilangan WebP conversion, optimasi lazy-load, dan responsive srcset | `FashionClient.tsx:283` — `<img src={item.image_url} .../>` | 469 items × full-size images tanpa optimasi = halaman berat di slow network | **P2** | Performance | Ganti dengan `<Image src={} alt={} fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" />` |
| 10 | **Worth bar menggunakan hardcoded hex colors** — tidak adaptif ke dark mode | `FashionClient.tsx:308` — `#059669`, `#d97706`, `#94a3b8` | Inkonsistensi dengan design system | **P2** | DS consistency | Gunakan Tailwind classes: `bg-emerald-600`, `bg-amber-500`, `bg-slate-400` atau CSS vars |
| 11 | **Judul item duplikat di detail page** — item name muncul di sticky header DAN sebagai `<h1>` di bawah gambar | `FashionItemDetailClient.tsx:93,112` | Screenshot `fashion-detail-375.png`: "Sarung Batik Biru" terlihat dua kali | **P2** | Visual hierarchy | Hapus salah satu. Sticky header sudah cukup — `<h1>` di bawah image bisa diturunkan ke `<p>` atau dihapus |
| 12 | **Back button hardcoded ke routes** — `/fashion` → `router.push('/')`, detail → `router.push('/fashion')` | `FashionClient.tsx:165`, `FashionItemDetailClient.tsx:89` | Jika user masuk dari URL langsung atau breadcrumb lain, back button tidak membawa ke lokasi yang diharapkan | **P2** | User control | Gunakan `router.back()` dengan fallback: `const canGoBack = window.history.length > 1` |
| 13 | **Tidak ada BottomNav di /fashion** — berbeda dengan /ofit yang punya BottomNav | Seluruh `FashionClient.tsx` | Screenshot `fashion-375.png`: tidak ada navigasi bawah. /ofit punya `<BottomNav />` | **P2** | Consistency | Tambahkan `<BottomNav />` untuk konsistensi, atau dokumentasikan pattern intentional ini |
| 14 | **Tidak ada `loading.tsx` untuk route /fashion** — tidak seperti /ofit | `app/fashion/` directory — tidak ada `loading.tsx` | Tidak ada route-level skeleton saat navigasi | **P2** | Feedback | Buat `app/fashion/loading.tsx` dengan skeleton yang mirip `/ofit/loading.tsx` |
| 15 | **Desktop (1440px): layout satu kolom sempit** — konten tidak pernah melebihi ~480px | `FashionClient.tsx:155` — tidak ada responsive grid perubahan | Screenshot `fashion-1440.png`: konten kiri atas, ruang kosong besar di kanan | **P2** | Responsive layout | Tambah `max-w-screen-sm mx-auto` pada container, atau grid 3-kolom di `md:` breakpoint |
| 16 | **Sheet modal di detail page tidak punya `role="dialog"` / `aria-modal`** | `FashionItemDetailClient.tsx:249-264` | Custom Sheet component tanpa semantik dialog | **P2** | A11y | Tambah `role="dialog"` `aria-modal="true"` `aria-label={title}` pada container inner |
| 17 | **Sheet close button icon-only tanpa `aria-label`** | `FashionItemDetailClient.tsx:255` | `<button onClick={onClose}>` dengan `<X size={18} />` — tidak ada text | **P2** | A11y | Tambah `aria-label="Close"` |
| 18 | **Pencil edit buttons di detail page di bawah 44px** | `FashionItemDetailClient.tsx:140` (`w-9 h-9` = 36px), `:195` (`w-7 h-7` = 28px) | WCAG 2.5.5 / Apple HIG: minimum 44×44px | **P2** | Mobile ergonomics | Naikkan ke `w-11 h-11` (44px) atau tambah padding wrapper |
| 19 | **Category chip di detail page tidak terformat** — raw lowercase value `{item.category}` | `FashionItemDetailClient.tsx:117` — `👔 {item.category}` | Screenshot: "bottom" lowercase, tidak ada capitalize | **P2** | Content / microcopy | Tambah `capitalize` class atau format dengan `getCategoryLabel()` yang sudah ada |
| 20 | **Quick Post caption textarea tidak punya `<label>`** | `FashionClient.tsx:394-400` | Hanya placeholder | **P2** | A11y | Tambah `<label htmlFor="qp-caption">Caption (optional)</label>` dan `id="qp-caption"` |
| 21 | **Quick Post error message dalam Bahasa Indonesia** — `'Pilih minimal 1 item'` sementara UI lain English | `FashionClient.tsx:408` | Inkonsistensi bahasa | **P3** | Content | Pilih satu bahasa, atau ganti ke: `'Select at least 1 item'` |
| 22 | **Tidak ada feedback sukses setelah Quick Post** — drawer langsung tutup tanpa konfirmasi | `FashionClient.tsx:416-419` | Tidak ada toast/snackbar | **P3** | Feedback | Tambah toast singkat: "Outfit posted! 🎉" setelah berhasil |
| 23 | **Sort label "Wear ↑" kriptik** — dua panah dan satu kata tidak cukup menjelaskan urutan | `FilterBar.tsx:17-21` | Dikonfirmasi screenshot — perlu tooltip atau label lebih deskriptif | **P3** | Content clarity | Pertimbangkan label lebih panjang di button atau tooltip saat hover/long press |
| 24 | **Tab badge menggunakan `\|\|` bukan `??`** — `items?.length \|\| undefined` menyembunyikan badge saat 0 items | `FashionClient.tsx:91` | Edge case: jika wardrobe benar-benar kosong, badge tidak muncul | **P3** | Feedback | Ganti ke `badge: items?.length ?? undefined` |

---

## Top 5 quick wins

1. **Fix `AlignLeft` → `Eye` / `EyeOff` icon** (`FashionClient.tsx:181`) + tambah `aria-label` + `aria-pressed` — satu fungsi, hapus confusion untuk semua user.
2. **Tambah `aria-label` ke FilterBar icon button** (`FilterBar.tsx:200`) dan `aria-expanded={expanded}` — satu atribut, fix a11y di semua halaman yang pakai FilterBar.
3. **Pindahkan search bar ke luar conditional** (`FashionClient.tsx:241`) — satu baris perubahan, fix hilangnya search saat filter aktif.
4. **Ganti `<img>` dengan `<Image>` di item grid** (`FashionClient.tsx:283`) — performance fix langsung untuk 469 items.
5. **Fix item count label saat loading** (`FashionClient.tsx:202`) — ganti `?? 0` dengan `=== null ? '…' : items.length` — satu ekspresi.

---

## What's working

- **Tab bar Items / Activities / Moments** jelas dan badges (64, 469) memberi context yang baik
- **Detail page layout** bersih dan scannable — hero image besar, KV table, WorthCard tersusun dengan baik
- **Quick Post Drawer** pattern bagus — preview strip item terpilih, search dalam drawer, caption field — flow intuitif
- **SSR activities & moments** — tab Activities dan Moments langsung ada kontennya (server-side), tidak perlu wait
- **FilterBar shared dengan /ofit** — filter UX yang sama di kedua halaman (konsisten)
- **Worth progress bar** pada setiap card — ringkas dan visual, memberikan motivasi untuk pakai baju
- **Skeleton grid (6 squares)** saat items null — ada placeholder, tidak blank
- **`force-dynamic`** — data selalu fresh, tidak stale
- **Detail: pencil icon edit langsung di halaman** — tidak perlu modal terpisah untuk edit wear count dan target, in-context editing bagus
- **Safe-area-inset handling** sudah benar di header detail page (`FashionItemDetailClient.tsx:84`)

---

## Open questions

- **Items tidak di-SSR**: apakah ini keputusan disengaja (karena data besar, 469 items)? Jika ya, setidaknya fix count "0 items" selama loading.
- **Tidak ada BottomNav**: intentional agar /fashion terasa "berbeda" dari /ofit? Atau belum sempat ditambahkan?
- **AlignLeft icon**: sudah berapa lama dipakai? Apakah ada user lain (misal pasangan/keluarga) yang pernah bingung dengan icon ini?
- **Desktop view**: app ini mobile-only secara intent? Kalau ya, pertimbangkan redirect atau warning saat akses dari desktop.
- **`<img>` vs `<Image>`**: apakah ada alasan teknis (domain restriction, CORS) kenapa raw `<img>` dipakai di grid tapi `<Image>` di detail page?
