# UX Audit — /ofit (Wardrobe / Outfit Builder) — 2026-09-20

**Scope:** `/ofit` — full page including FilterBar, ItemCard, ItemDetailModal, Header, BottomNav  
**Primary task:** Browse wardrobe, filter/sort items, tap item for detail, select items to create outfit  
**Viewports:** 375 / 768 / 1440  
**Method:** Code-based review (Playwright could not authenticate — Google OAuth required). Confidence: medium. Live screenshots were captured for the login screen only.

---

## Summary

`/ofit` adalah halaman wardrobe yang kaya fitur dengan filter multidimensi, sorting, bulk-select, dan modal detail — semuanya dibangun dengan mobile-first yang solid. Struktur komponen bersih dan loading skeleton-nya baik. Risiko terbesar ada di **aksesibilitas** (banyak komponen interaktif tanpa ARIA state), **touch targets** yang terlalu kecil di action buttons dan color swatches, dan beberapa **inkonsistensi UX** yang bisa membingungkan (draft items tersembunyi by default, "Clear filters" yang tidak membersihkan semua filter, bahasa campur Indonesia-Inggris). Secara keseluruhan aplikasi fungsional dan well-structured, tapi polish aksesibilitas dan beberapa edge case perlu perhatian.

---

## Findings

| # | Issue | Where | Evidence | Severity | Lens | Recommended fix |
|---|-------|--------|----------|----------|------|-----------------|
| 1 | `MobileSearchBar` tidak punya `aria-label` atau `<label>` — hanya `placeholder` | `mobile-shims.tsx:61-67` | WCAG 2.2 AA SC 1.3.1 — label wajib untuk input | **P1** | A11y | Tambah `aria-label="Search wardrobe items"` pada `<input>` |
| 2 | `MobileChip` (filter toggle buttons) tidak punya `aria-pressed` — screen reader tidak tahu state on/off | `mobile-shims.tsx:101-114` | Pattern: `<button>` dipakai sebagai toggle tanpa state attribute | **P1** | A11y | Tambah `aria-pressed={selected}` pada `<button>` di `MobileChip` |
| 3 | Modal tabs di `ItemDetailModal` tidak punya `role="tablist"` / `role="tab"` / `aria-selected` | `ItemDetailModal.tsx:111-119` | `<div>` + `<button>` tanpa semantik tab | **P1** | A11y | Tambah `role="tablist"` pada wrapper, `role="tab"` + `aria-selected={tab === t}` pada setiap tab button |
| 4 | Sort dropdown button tidak punya `aria-expanded` / `aria-haspopup` | `FilterBar.tsx:134-141` | Button toggle dropdown tanpa ARIA state | **P1** | A11y | Tambah `aria-expanded={sortOpen}` dan `aria-haspopup="listbox"` |
| 5 | `ItemDetailModal` tidak punya `role="dialog"` / `aria-modal` / `aria-label` | `ItemDetailModal.tsx:52-54` | Modal backdrop div tanpa semantik dialog | **P1** | A11y | Tambah `role="dialog"` `aria-modal="true"` `aria-label={item.name}` pada container |
| 6 | **Draft items tersembunyi by default** (`showDraft` init = `false`) — user baru mungkin panik karena item tidak terlihat | `WardrobeClient.tsx:44` | Default state `showDraft = false` | **P1** | UX / Visibility of system status | Pertimbangkan default `showDraft = true` atau beri hint visual ketika item tersembunyi karena filter status |
| 7 | Action buttons di ItemCard hanya **32×32px** (`h-8`, `w-8`) — di bawah minimum 44×44px | `ItemCard.tsx:123,129` | `h-8` = 32px; Apple HIG & WCAG 2.5.5 butuh ≥44px | **P1** | Mobile ergonomics | Naikkan ke `h-11 min-w-[44px]` atau perbesar tap area dengan padding |
| 8 | Color swatches di FilterBar hanya **20×20px** (`w-5 h-5`) — jauh di bawah minimum | `FilterBar.tsx:223,228` | `w-5 h-5` = 20px; terlalu kecil untuk sentuhan akurat | **P1** | Mobile ergonomics | Naikkan ke `w-8 h-8` minimum, atau gunakan padding wrapper untuk memperbesar tap area |
| 9 | **BottomNav menggunakan hardcoded hex colors** — tidak akan berespons ke dark mode | `BottomNav.tsx:25,26,40` | `#FFFFFF`, `#E5E5E5`, `#171717`, `#A3A3A3` di inline style | **P2** | Design-system consistency | Ganti dengan CSS vars: `var(--background)`, `var(--border)`, `var(--foreground)`, `var(--muted-foreground)` |
| 10 | **Worth It badge** menggunakan `#DDF4EA` hardcoded — tidak adaptif ke dark mode | `ItemCard.tsx:75` | `style={{ background: '#DDF4EA' }}` | **P2** | Design-system consistency | Gunakan token Cubicle DS atau Tailwind class seperti `bg-emerald-100 dark:bg-emerald-900/30` |
| 11 | **"Clear filters" tidak membersihkan category & status filters** — hanya color/season/occasion/price | `FilterBar.tsx:308-311` | Kondisi tampil: `activeColor \|\| activeSeason \|\| activeOccasion \|\| activePriceFilter` — category tidak termasuk | **P2** | UX consistency | Tampilkan "Clear filters" juga ketika `activeCategory` atau status override aktif; masukkan semua ke dalam `clearAll()` |
| 12 | **Bahasa campur** di ItemDetailModal — "Pembelian", "Harga Beli", "Tanggal Beli" (ID) vs "Last worn", "Added", "Never worn" (EN) | `ItemDetailModal.tsx:178,181,188,211,224` | Inconsistency dalam satu layar | **P2** | Content / microcopy | Pilih satu bahasa konsisten. Karena app personal pakai bahasa Indonesia atau Inggris penuh — jangan campur |
| 13 | **Label sort tidak konsisten**: dropdown bilang "Closest to worth it" tapi chip bilang "Worth it ↑" untuk key yang sama | `FilterBar.tsx:14` vs `FilterBar.tsx:21` | Dua label berbeda untuk `worth_it_desc` | **P2** | Consistency | Seragamkan: gunakan "Closest to worth it" di keduanya |
| 14 | **`#tag` search syntax tidak terdokumentasi** — placeholder hanya bilang "tag…" tanpa hint `#` prefix | `WardrobeClient.tsx:62-63`, `mobile-shims.tsx:65` | Feature tersembunyi | **P2** | Discoverability | Ubah placeholder menjadi "Search name, brand, #tag…" |
| 15 | **Header back button menuju `/fashion`** (hardcoded), bukan back in history — mengejutkan jika user masuk dari BottomNav | `Header.tsx:21-23` | `Link href="/fashion"` — bukan `router.back()` | **P2** | UX / User control | Pertimbangkan `router.back()` atau tunjukkan breadcrumb yang jelas bahwa ini kembali ke Fashion |
| 16 | **InputAccessoryView (bulk select) dan BottomNav keduanya `fixed bottom-0`** — mungkin overlap di z-space | `WardrobeClient.tsx:224` (z-30) vs `BottomNav.tsx:20` (z-20) | z-index beda, tapi belum dikonfirmasi visual karena tidak bisa login | **P2** | Mobile layout | Pastikan bulk select bar muncul di atas BottomNav dengan `bottom: 80px` atau sembunyikan BottomNav saat `selectMode` aktif |
| 17 | **USD rate auto-fetch tidak ada visual feedback** — user tidak tahu apakah "Auto" berhasil atau tidak | `WardrobeClient.tsx:52-57` | Silent state update tanpa toast/konfirmasi | **P3** | Feedback | Tampilkan rate yang diperbarui sebentar dengan animasi atau brief toast |
| 18 | **"Achieved" chip label ambigu** — sebenarnya filter "Worth It achieved" tapi tidak jelas | `FilterBar.tsx:190-194` | Icon Trophy + label "Achieved" — tidak self-explanatory | **P3** | Content clarity | Ganti label menjadi "Worth It" supaya konsisten dengan terminologi di seluruh app |
| 19 | **Login: tidak ada "Forgot password" link** — personal app tapi email+password login tersedia | `login-375.png` (captured) | Tidak ada recovery path di login form | **P3** | User control | Tambah "Forgot password?" link kecil di bawah form |
| 20 | **`MobileFormField` menggunakan `<p>` bukan `<label>`** — form labels tidak terikat ke input secara semantik | `mobile-shims.tsx:134` | `<p>` as visual label instead of `<label htmlFor>` | **P2** | A11y | Ganti `<p>` dengan `<label htmlFor={id}>`, tambah `id` pada input |

---

## Top 5 quick wins

1. **Tambah `aria-pressed={selected}` ke MobileChip** (`mobile-shims.tsx:103`) — satu baris, fix semua filter chips di seluruh app.
2. **Ganti hardcoded hex di BottomNav** (`BottomNav.tsx:25,26,40`) — 4 value, langsung fix dark mode BottomNav.
3. **Tambah `aria-label="Search wardrobe items"` ke MobileSearchBar input** (`mobile-shims.tsx:65`) — satu atribut.
4. **Ubah placeholder search** dari `"Search by name, brand, tag…"` menjadi `"Search name, brand, #tag…"` — expose hidden feature.
5. **Perbesar action buttons ItemCard dari `h-8` ke `h-11`** (`ItemCard.tsx:123,129`) — satu class change, langsung layak sentuh.

---

## What's working

- **Loading skeleton** bagus — fixed header + grid placeholders match layout aktual dengan baik (`app/ofit/loading.tsx`)
- **Bulk select flow** — `InputAccessoryView` + naming input + `Enter` to submit adalah pattern yang intuitif
- **Filter badge counter** di SliderHorizontal button (`FilterBar.tsx:210`) — jelas berapa filter aktif
- **Two-step delete confirmation** di ItemCard — mencegah accidental delete tanpa modal berat
- **ItemDetailModal drag handle + close on backdrop click** — standar bottom sheet yang baik
- **Empty state messages** adaptif — beda pesan untuk "kosong" vs "tidak ada yang match filter" vs "belum login"
- **`mix-blend-multiply`** untuk item images di light mode — item baju terlihat natural tanpa background putih kotak
- **Safe-area-inset handling** sudah ada di header dan bottom nav — siap untuk iPhone notch

---

## Open questions

- **Default `showDraft = false`**: apakah ini disengaja karena Verified adalah "clean view" yang diinginkan? Jika ya, perlu ada indicator yang jelas bahwa ada item tersembunyi.
- **Back button ke `/fashion`**: apakah `/ofit` selalu diakses dari `/fashion`? Atau juga dari BottomNav langsung? Jika dari BottomNav, back button ke `/fashion` terasa aneh.
- **Bahasa**: apakah app ini mau full Bahasa Indonesia atau full English? Sekarang campur — perlu keputusan produk.
- **Price filter ranges** (`<$1`, `<$10`, dst.) — apakah range ini representatif untuk data yang ada? Range `<$1` dan `>$115` mungkin jarang terpakai.
