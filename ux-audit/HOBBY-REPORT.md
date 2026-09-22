# UX Audit — Hobby Pages (/gear /literacy /calendar /plan) — 2026-09-22

**Scope:** /gear, /literacy, /calendar, /plan
**Primary task:** kelola gear hobi, track buku/literacy, lihat kalender outfit, buat plan outfit mingguan
**Viewports:** 375 / 1440
**Evidence:** screenshot di `ux-audit/screenshots/`, source code `components/`

---

## Ringkasan

Keempat halaman berfungsi baik secara fundamental dan konsisten menggunakan token Cubicle DS (Geist, border-radius xl, neutral palette). Halaman `/gear` adalah yang paling matang — filter pills, empty state, dan worth-it bar bekerja dengan baik. Masalah terbesar lintas halaman adalah **touch target terlalu kecil** pada tombol navigasi dan delete, **hardcoded color** yang bypass design token (terutama pada worth-it bar dan status badge literacy), dan **tombol tanpa accessible name** di header /calendar dan /plan. Halaman `/plan` memiliki kelemahan UX tersendiri: tombol hapus item (16×16px) jauh di bawah standar 44×44px dan tidak ada feedback visual saat remove berhasil. Secara keseluruhan, halaman-halaman ini solid untuk pemakaian personal harian tapi butuh beberapa perbaikan aksesibilitas sebelum dianggap WCAG 2.2 AA.

---

## Temuan

| # | Isu | Halaman · file:line | Bukti | Severity | Heuristik / Lens | Rekomendasi |
|---|-----|---------------------|-------|----------|------------------|-------------|
| 1 | **Tombol navigasi header tanpa accessible name** — tombol prev/next bulan di /calendar dan prev/next minggu di /plan hanya berisi ikon `<ChevronLeft>/<ChevronRight>` tanpa `aria-label`. Screen reader akan membaca "button" saja | /calendar · `CalendarClient.tsx:73-79`; /plan · `WeeklyPlanClient.tsx:46-55` | Snapshot: `button [ref=f135e5]`, `button [ref=f135e10]`, `button [ref=f142e7]`, `button [ref=f142e11]` — tidak ada accessible name | **P0** | Aksesibilitas (WCAG 4.1.2 Name/Role/Value) | Tambah `aria-label="Bulan sebelumnya"`, `"Bulan berikutnya"`, `"Minggu sebelumnya"`, `"Minggu berikutnya"` |
| 2 | **Tombol delete item di /plan terlalu kecil (16×16px)** — tombol X untuk menghapus item pakaian dari day row hanya 16×16px (class `w-4 h-4`), jauh di bawah minimum touch target 44×44px | /plan · `DayRow.tsx:52-58` | Screenshot `plan-375.png` — tombol X kecil di pojok gambar item | **P0** | Mobile ergonomics (touch target ≥ 44×44px) | Perbesar ke `w-8 h-8` minimum, atau gunakan long-press / swipe-to-delete pattern |
| 3 | **Tombol + di GearClient tidak punya aria-label** — tombol "+" di header /gear (bukan HobbyDetailClient) hanya berisi ikon `<Plus>` tanpa label teks atau `aria-label` | /gear · `GearClient.tsx:46-52` | Snapshot: `button [ref=f119e10]` — tidak ada nama yang terbaca | **P0** | Aksesibilitas (WCAG 4.1.2) | Tambah `aria-label="Tambah item"` |
| 4 | **Hardcoded hex color pada worth-it progress bar** — warna progress bar (`#059669`, `#d97706`, `#94a3b8`) hardcoded di dua tempat terpisah alih-alih menggunakan token CSS | /gear · `GearItemCard.tsx:65`; `HobbyDetailClient.tsx:148` | Kode: `background: isWorthIt ? '#059669' : worthItProgress >= 75 ? '#d97706' : '#94a3b8'` | **P1** | Design-system consistency | Buat token CSS `--color-worth-it`, `--color-close`, `--color-far` di globals.css, atau gunakan Tailwind class `bg-emerald-600 / bg-amber-600 / bg-slate-400` |
| 5 | **Hardcoded hex color pada status badge /literacy** — warna badge Unread/Reading/Done (`#94A3B8`, `#F97316`, `#22C55E`) hardcoded di array konstanta, bukan token Cubicle DS | /literacy · `LiteracyClient.tsx:17-21` | Kode: `{ value: 'reading', color: '#F97316' }` | **P1** | Design-system consistency | Map ke Tailwind semantic class: `text-slate-400` (unread), `text-orange-500` (reading), `text-green-500` (done), atau gunakan Cubicle `badge` variant |
| 6 | **Hardcoded warm gradient pada BookCard dan DetailsSheet** — background fallback cover buku menggunakan `from-[#FFF0DC] to-[#FFDFC2]` (warna warm/kuning) yang sudah dihapus di Milestone 02 | /literacy · `LiteracyClient.tsx:164,220` | Kode: `bg-gradient-to-br from-[#FFF0DC] to-[#FFDFC2]` | **P1** | Design-system consistency (Milestone 02: no warm palette) | Ganti dengan `bg-muted` atau gradient neutral misal `from-neutral-100 to-neutral-200` |
| 7 | **Halaman /calendar tidak ada context untuk future dates** — tanggal masa depan di-disable (`disabled={isFuture}`) dengan `opacity-30` tapi tidak ada tooltip/teks penjelasan mengapa tidak bisa diklik | /calendar · `CalendarClient.tsx:104-108` | Screenshot `calendar-375.png` — tanggal 23-30 terlihat pudar tanpa penjelasan | **P2** | Heuristik #1 (Visibility of System Status) | Tambah `title="Belum bisa di-log"` atau keterangan "Future dates cannot be logged" di bawah kalender |
| 8 | **Tombol UserAvatarMenu tidak ada di halaman /calendar (desktop)** — header /calendar pada 1440px hanya menampilkan `UserAvatarMenu` di area kanan bersama tombol ChevronRight, tanpa jarak visual yang jelas | /calendar · `CalendarClient.tsx:77-82` | Screenshot `calendar-1440.png` — tombol avatar "berdempetan" dengan chevron next | **P2** | Visual hierarchy & layout | Pisahkan dengan `gap-3` atau `ml-4` agar click area tidak terlalu berdekatan |
| 9 | **Layout /gear dan /calendar tidak dibatasi max-width di 1440px** — `/gear` (`GearClient`) menggunakan `h-dvh overflow-y-auto bg-background` tanpa `max-w-*` sehingga grid 2-kolom melar penuh di 1440px. `/calendar` juga tanpa max-width | /gear · `GearClient.tsx:35`; /calendar · `CalendarClient.tsx:71` | Screenshot `gear-1440.png` dan `calendar-1440.png` — konten melebar di seluruh layar 1440px | **P2** | Responsive / layout | Tambah `max-w-3xl mx-auto` pada container utama, seperti yang sudah dilakukan di `HobbyDetailClient.tsx:60` (`max-w-[430px] mx-auto`) |
| 10 | **/literacy tidak ada tombol tambah buku** — halaman Library hanya menampilkan daftar buku, tidak ada cara menambah buku baru dari halaman ini. Microcopy empty state mengarahkan ke "Reading page" tapi link tidak tersedia | /literacy · `LiteracyClient.tsx:103-105` | Snapshot: tidak ada `button[name*="Add"]` atau `button[name*="Tambah"]`. Empty state: `"Add books via the Reading page"` — tanpa link | **P2** | Heuristik #3 (User Control & Freedom) | Tambah link `/reading` atau CTA "Add from Reading page" yang bisa diklik |
| 11 | **Remove item di /plan gagal secara senyap** — `handleRemove` di `DayRow` di-wrap `try { } catch { /* silently fail */ }` — error tidak ditampilkan ke user | /plan · `DayRow.tsx:22-24` | Kode: `try { await removeFromPlan(planId) } catch { /* silently fail */ }` | **P2** | Heuristik #9 (Help users recognize & recover from errors) | Tampilkan toast error minimal (`sonner`) jika remove gagal |
| 12 | **Tombol close di modal /calendar tidak punya aria-label** — tombol X di `CalendarClient.tsx` modal hanya icon `<X>` tanpa `aria-label` | /calendar · `CalendarClient.tsx:145` | Kode: `<button onClick={() => setSelectedDate(null)} className="..."><X size={20} /></button>` | **P2** | Aksesibilitas (WCAG 4.1.2) | Tambah `aria-label="Tutup"` |
| 13 | **Dua tombol untuk satu item di /gear (GearItemCard)** — setiap card gear memiliki dua tombol terpisah: satu untuk gambar (`absolute inset-0`) dan satu di bawahnya untuk teks. Keduanya melakukan aksi yang sama. Screen reader menemukan dua element interaktif berturut-turut untuk item yang sama | /gear · `GearItemCard.tsx:20-47` | Kode: dua `<button onClick={onClick}>` dengan area berbeda | **P2** | Aksesibilitas (duplicate interactive target) | Wrap seluruh card dalam satu `<button>` atau gunakan `role="group"` dengan satu tombol utama |
| 14 | **Font size terlalu kecil pada beberapa elemen** — teks `9px`, `9.5px`, `10px` digunakan pada use-count, worth-it label, dan status badge. Di bawah WCAG 2.2 minimum kontras untuk teks kecil | /gear · `HobbyDetailClient.tsx:152` (`text-[9.5px]`); /literacy · `LiteracyClient.tsx:169` (`text-[9.5px]`) | Screenshot `gear-375.png` — teks "X× · Worth It!" sangat kecil pada mobile | **P2** | Aksesibilitas (WCAG 1.4.4 Resize Text), Visual hierarchy | Naikkan ke minimum `text-[11px]` atau `text-xs` (12px) |
| 15 | **/plan tidak highlight "hari ini" di header** — header menampilkan range minggu (`Sep 21 – Sep 27`) tapi tidak membedakan hari ini secara visual di label. Di dalam list, `isToday` menambah `bg-primary/5` tapi tanda titik kecil (`w-1.5 h-1.5`) mudah terlewat | /plan · `DayRow.tsx:37` | Screenshot `plan-375.png` — indikator "today" berupa dot kecil di bawah tanggal | **P3** | Heuristik #1 (Visibility of System Status) | Ganti dot dengan badge `Today` atau bold + underline pada label hari |
| 16 | **Back button di /literacy mengarah ke /reading bukan ke homepage atau history** — `MobileButton` di LiteracyClient men-push ke `/reading`, bukan `router.back()`. Jika user datang dari halaman lain, ini melanggar ekspektasi navigasi | /literacy · `LiteracyClient.tsx:91` | Kode: `onClick={() => router.push('/reading')}` | **P3** | Heuristik #3 (User Control & Freedom) | Gunakan `router.back()` atau navigasi kontekstual |
| 17 | **ItemPickerModal di /plan tidak ada search/filter teks** — dengan semua wardrobe items dimuat (`allItems`), user harus scroll panjang melalui grid 3-kolom untuk menemukan item spesifik. Hanya ada filter kategori | /plan · `ItemPickerModal.tsx:90-119` | Screenshot `plan-picker-375.png` — banyak item, tidak ada search box | **P3** | Heuristik #7 (Flexibility and efficiency of use) | Tambah search input di atas filter kategori |

---

## 5 Quick Wins

1. **Tambah `aria-label` ke semua tombol ikon** — di `/calendar` (prev/next bulan, close modal) dan `/plan` (prev/next minggu): 4 baris kode, dampak aksesibilitas langsung. File: `CalendarClient.tsx:73,79,145`; `WeeklyPlanClient.tsx:46,54`.

2. **Perbesar tombol delete di DayRow /plan** — ubah `w-4 h-4` → `w-8 h-8` (atau gunakan negative margin agar tidak mengganggu layout visual). File: `DayRow.tsx:55`.

3. **Ganti warm gradient /literacy dengan `bg-muted`** — `from-[#FFF0DC] to-[#FFDFC2]` → `bg-muted` pada `LiteracyClient.tsx:164,220`. Satu baris per occurrence, langsung fix pelanggaran Milestone 02.

4. **Tambah `max-w-3xl mx-auto` ke container /gear dan /calendar** — saat ini keduanya melar penuh di 1440px. `HobbyDetailClient` sudah menjadi contoh yang benar dengan `max-w-[430px] mx-auto`. File: `GearClient.tsx:35`; `CalendarClient.tsx:71`.

5. **Tambah link ke "/reading" di empty state /literacy** — teks `"Add books via the Reading page"` tidak bisa diklik. Wrap dengan `<Link href="/reading">` atau tambah `<MobileButton onClick={() => router.push('/reading')}>`. File: `LiteracyClient.tsx:104-105`.

---

## Yang Sudah Bagus

- **Worth-it bar di /gear** — progress bar tiga-state (worth it / close / far) memberikan informasi berguna tentang nilai item secara visual tanpa memerlukan angka eksplisit.
- **SegmentedControl konsisten** — digunakan dengan benar di /literacy (status) dan HobbyDetailClient (tabs Items/Activities/Moments), komponen yang sama di seluruh app.
- **safe-area-inset-top di header** — `paddingTop: 'calc(14px + env(safe-area-inset-top,0px))'` sudah diterapkan di HobbyDetailClient dan LiteracyClient, memastikan konten tidak tertutup notch iPhone.
- **Bottom sheet pattern konsisten** — LiteracyClient, AddGearModal, dan CalendarClient semuanya menggunakan pola bottom sheet yang sama (drag handle, max-h-88dvh, backdrop click to close).
- **Optimistic UI di ItemPickerModal /plan** — toggle plan item langsung diupdate di state lokal sebelum server response, memberikan feedback instan yang baik.
- **Empty states informatif** — semua halaman memiliki empty state dengan ikon, judul, dan deskripsi. /gear bahkan menampilkan CTA "Add Gear" langsung di empty state.
- **Filter pills /gear** — horizontal scroll pills dengan count dan active state yang jelas, tidak mengambil ruang vertikal tambahan.

---

## Pertanyaan Terbuka

1. **Apakah /gear dan /literacy seharusnya linked dari BottomNav?** Saat ini BottomNav hanya menampilkan Closet / Wardrobes / Outfits / Calendar / Stats — tidak ada akses langsung ke Gear atau Library dari navigasi utama. User harus tahu URL-nya.

2. **Worth-it bar: apakah threshold 75% untuk "amber" sudah divalidasi?** Nilai ini hardcoded di dua komponen terpisah (GearItemCard dan HobbyDetailClient). Sebaiknya dijadikan konstanta di `lib/worth.ts`.

3. **/calendar hanya load data bulan ini** — query di `app/calendar/page.tsx` di-filter `gte(firstDay)` dan `lte(lastDay)`. Navigasi ke bulan sebelumnya di CalendarClient tidak akan menampilkan data karena data tidak di-fetch ulang. Apakah ini disengaja (performance tradeoff)?

4. **Apakah /literacy seharusnya bisa menambah buku langsung?** Saat ini add buku hanya via `/reading` (HobbyDetailClient → AddGearModal). LiteracyClient tidak punya tombol tambah sama sekali.

5. **Bahasa campur (Inggris/Indonesia) di microcopy** — `lastUsedLabel()` di HobbyDetailClient menghasilkan "Belum pernah digunakan" / "Digunakan hari ini" (Indonesia), sementara halaman lain menggunakan "No items yet" / "Add your first item" (Inggris). Perlu keputusan: app ini mono-language Indonesia atau Inggris?
