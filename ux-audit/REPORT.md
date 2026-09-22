# UX Audit — /family /declutter /stats /admin — 2026-09-22

**Scope:** /family, /declutter, /stats, /admin  
**Primary task:** lihat jadwal keluarga, kelola declutter, cek statistik, admin panel  
**Viewports:** 375 / 1440

---

## Ringkasan

Keempat halaman berhasil dirender dan secara umum sudah mobile-first dengan layout yang bersih. Namun ditemukan beberapa masalah serius: tombol back di `/family` mengarah ke route `/social` yang tidak ada dalam app, `/declutter` mengembalikan HTTP 500 saat server-side render (konten masih tampil via client-side hydration), dan halaman `/stats` menggunakan hardcoded warna `yellow-500/yellow-600` yang melanggar design system Cubicle DS neutral palette. Di desktop 1440px, semua halaman menampilkan konten dalam kolom sempit ~380px di tengah layar tanpa memanfaatkan ruang yang tersedia. Temuan kritis lain adalah tidak ada `aria-label` sama sekali di button-button interaktif pada semua halaman yang diaudit.

---

## Temuan

| # | Isu | Halaman · file:line | Bukti | Severity | Heuristik | Rekomendasi |
|---|-----|---------------------|-------|----------|-----------|-------------|
| 1 | **Tombol back mengarah ke `/social`** — route tidak ada dalam app, akan 404 | `/family` · `components/family/FamilyClient.tsx:66` | `router.push('/social')` di onClick | P0 | H5 Error Prevention | Ganti dengan `router.push('/')` atau `router.back()` |
| 2 | **HTTP 500 di `/declutter`** — server-side error tapi konten masih tampil via client hydration; tidak ada error boundary yang terlihat user | `/declutter` · server | Console: `HTTP status: 500 Internal Server Error` saat navigate | P0 | H1 Visibility of System Status | Investigasi route handler; tambah error boundary dengan pesan ramah pengguna |
| 3 | **`html-to-image` missing — tombol Export akan crash** — module tidak terinstall, menyebabkan 46+ console warnings dan fitur Export gagal saat diklik | `/stats` · `components/stats/StatsClient.tsx:21` | Console: `Module not found: Can't resolve 'html-to-image'` | P1 | H1 Visibility of System Status | Jalankan `npm install html-to-image` atau tampilkan pesan error ketika Export diklik |
| 4 | **Warna amber/kuning hardcoded melanggar Cubicle DS** — tombol Export, progress bar kategori, dan angka wear count menggunakan `yellow-500`, `yellow-600` | `/stats` · `components/stats/StatsClient.tsx:57,104,166,197` | Screenshot stats-375.png: warna kuning di antara neutral palette | P1 | H4 Consistency & Standards | Ganti ke token DS: `text-primary`, `bg-primary` |
| 5 | **Format harga tanpa separator ribuan** — harga tampil sebagai `$29900`, `$145000`, `$18000` (data IDR ditampilkan dengan simbol `$`) | `/declutter` · `components/declutter/DeclutterClient.tsx:121` | Screenshot declutter-375.png: `Never worn · $145000` | P1 | H2 Match between system and real world | Gunakan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })` |
| 6 | **Desktop 1440px: semua halaman berkolom sempit ~380px** — konten tidak memanfaatkan ruang layar lebar | `/family`, `/declutter`, `/stats`, `/admin` | Screenshot *-1440.png semua halaman | P1 | H8 Aesthetic and Minimalist Design | Tambah `max-w-2xl mx-auto` atau grid 2-kolom untuk desktop |
| 7 | **Tidak ada `aria-label` pada tombol-tombol ikon** — tombol back (ChevronLeft), tombol edit pensil di admin, tombol avatar, tidak punya label aksesibel | Semua halaman | A11y snapshot: `button [ref=...]` tanpa accessible name | P1 | A11y WCAG 2.2 AA 4.1.2 | Tambah `aria-label="Kembali"`, `aria-label="Edit"` dll. pada setiap button ikon |
| 8 | **Touch target terlalu kecil** — tombol back `w-9 h-9` = 36×36px; tombol tab member `py-1.5` ≈ 30px tinggi; tombol hari `py-1.5` ≈ 30px | `/family` · `FamilyClient.tsx:67,83,119` | Kode CSS; minimum Apple HIG = 44×44px | P1 | Mobile Ergonomics | Tingkatkan ke minimal `w-11 h-11` (44px) untuk tombol ikon; `py-3` pada tab member |
| 9 | **Nama item terpotong tanpa cara melihat nama lengkap** — item nama panjang terpotong dengan `truncate`, tidak ada tooltip atau cara ekspansi | `/declutter` · `DeclutterClient.tsx:117`; `/admin/blogs` | Screenshot: "Kemeja Garis FOR MEN Lengan ...", judul blog terpotong | P2 | H2 Match between system and real world | Tambah `title` attribute HTML; atau izinkan 2 baris teks |
| 10 | **Kategori item huruf kecil tidak konsisten** — di /declutter tampil `accessories`, `top`; di /stats tampil `Top`, `Accessories` | `/declutter` · `DeclutterClient.tsx:118` vs `/stats` | A11y snapshot: `accessories`, `top` (huruf kecil) | P2 | H4 Consistency & Standards | Konsistenkan dengan `capitalize` CSS atau title-case di data |
| 11 | **Tidak ada `<title>` tag per halaman** — semua halaman browser tab menampilkan "Interestory" | Semua `app/*/page.tsx` | Browser title di semua halaman identik | P2 | H1 Visibility of System Status | Tambah `export const metadata = { title: 'Family — Interestory' }` di tiap page.tsx |
| 12 | **Link admin card: accessible name menggabungkan semua teks** — screen reader membaca "Zopavo Backlog management Manage →" sebagai satu string | `/admin` · `app/admin/page.tsx` | A11y snapshot: `link "Zopavo Backlog management Manage →"` | P2 | A11y WCAG 2.2 AA 2.4.6 | Tambah `aria-label="Kelola Zopavo"` pada link Manage, pisahkan dari heading |
| 13 | **Status dot di /admin/blogs tanpa label teks** — titik hijau/abu menandakan published/draft tapi hanya berbasis warna | `/admin/blogs` · `components/admin/BlogsAdminClient.tsx` | Screenshot admin-blogs-375.png: titik warna tanpa label | P2 | A11y WCAG 1.4.1 Use of Color | Tambah `aria-label="Published"` atau label `.sr-only` |
| 14 | **Empty state teks berbahasa Inggris di /declutter** — "No candidates found", "Nothing flagged", "Trash is empty" tidak konsisten dengan UI berbahasa Indonesia | `/declutter` · `DeclutterClient.tsx:64-66` | Kode | P3 | H2 Match between system and real world | Ganti ke Bahasa Indonesia |
| 15 | **Search box /declutter tidak ada `<label>` asosiatif** — hanya placeholder | `/declutter` · `DeclutterClient.tsx:77-83` | A11y snapshot: accessible hanya via placeholder | P3 | A11y WCAG 2.2 AA 1.3.1 | Tambah `<label htmlFor="search" className="sr-only">Cari item</label>` |

---

## 5 Quick Wins

1. **Fix tombol back `/family`** — ganti `router.push('/social')` dengan `router.push('/')` di `FamilyClient.tsx:66`. Satu baris, mencegah navigasi ke 404.

2. **Format harga IDR** — ganti `` `$${item.price}` `` di `DeclutterClient.tsx:121` dengan `new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)`. Harga "Rp145.000" jauh lebih mudah dibaca daripada "$145000".

3. **Install `html-to-image`** — jalankan `npm install html-to-image`. Menghilangkan 46+ console warnings dan mengaktifkan fitur Export yang sudah dibangun di /stats.

4. **Ganti warna kuning di `/stats` ke token DS** — di `StatsClient.tsx`, ganti `bg-yellow-500` → `bg-primary`, `text-yellow-600` → `text-primary`. Dua substitusi string, langsung konsisten dengan Cubicle DS.

5. **Tambah `aria-label` pada tombol ikon** — tambah `aria-label="Kembali"` di tombol back FamilyClient, `aria-label="Edit"` di tombol pensil BacklogAdminClient. Quick win aksesibilitas dengan dampak langsung pada screen reader.

---

## Yang Sudah Bagus

- **Bottom sheet modal pattern** — Sheet di FamilyClient sudah solid: `fixed inset-0`, backdrop blur, drag handle visual, safe-area-inset padding — tepat untuk mobile iPhone.
- **Sticky header dengan safe-area-inset** — `paddingTop: 'calc(14px + env(safe-area-inset-top,0px))'` memastikan konten tidak tertutup notch iPhone.
- **Empty state informatif di /family** — ketika hari tidak ada jadwal, tampil `📭 Kosong hari Senin` yang jelas dan ramah.
- **Tab segmented control di /declutter** — tab Suggested/Flagged/Trash dengan hitungan item (271/25/0) sangat informatif dan fungsional.
- **Kartu statistik 3-kolom di /stats** — layout Items/Total Wears/Never Worn bersih dan scannable di mobile.
- **Kontekstual bottom nav di /admin** — navigation berganti dari global (Closet/Wardrobes/Outfits) ke kontekstual (Zopavo/Hyperfantasy) yang sangat sesuai konteks kerja admin.
- **Image aspect-ratio konsisten** — di /declutter, gambar item menggunakan `aspect-[3/4]` yang seragam untuk semua item.

---

## Pertanyaan Terbuka

1. **Currency mana yang dipakai?** — Data harga tampak IDR (18000, 29900, 145000) tapi ditampilkan dengan simbol `$`. Apakah perlu dual-display IDR/USD seperti di /ofit dan /fashion, atau cukup IDR saja?
2. **Route `/social`** — apakah ini halaman yang sedang direncanakan? Jika ya, apakah tombol back di /family memang dimaksudkan mengarah ke sana, atau ini sisa refactor lama?
3. **Langit `hasSchedule: false`** — dikodekan tidak punya jadwal di `lib/types.ts:463`. Apakah ini by design (Langit belum sekolah), atau akan berubah ketika Langit mulai sekolah?
4. **Desktop layout** — app ini mobile-first, tapi /stats dan /admin diakses via browser desktop juga. Apakah intentional dibiarkan narrow, atau perlu layout yang lebih lebar?
5. **HTTP 500 di `/declutter`** — perlu investigasi apakah error server-side ini terkait data tertentu atau bug di route handler. Apakah konsisten atau intermittent?
