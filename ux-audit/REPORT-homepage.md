# UX Audit — / (Homepage) — 2026-09-24

**Scope:** `/` — dashboard, home tab, bottom nav  
**Primary task:** Lihat ringkasan aktivitas hari ini, log kegiatan baru, navigasi ke hobby pages  
**Viewports:** 375 / 768 / 1440 (konten max 430px by design)

---

## Summary

Homepage adalah center of gravity app ini — dark hero section terlihat polished dan intentional. Namun hampir **seluruh komponen menggunakan hardcoded hex colors** (`#f1f252`, `#FFFFFF`, `#0A0A0A`, dll) tanpa DS tokens, melanggar Milestone 02 dan menyebabkan dark mode tidak berfungsi di content section. Ada beberapa P1 a11y gaps serius: 5 bottom nav icon buttons tanpa `aria-label`, activity rows sebagai non-interactive `<div>`, dan task checkbox sebagai `<div>` tanpa role. Calendar iframe juga hilang `title` attribute.

---

## Findings

| # | Issue | Lokasi | Evidence | Severity | Lens | Fix |
|---|-------|--------|----------|----------|------|-----|
| 1 | **Bottom nav: semua 5 tombol icon-only tanpa `aria-label`** — Home, Gallery, FAB (+), Stats, Hobby | `page.tsx:665-694` | Icon SVG saja, tidak ada teks | **P1** | A11y (WCAG 2.2) | Tambah `aria-label="Home"`, `aria-label="Gallery"`, dll. di tiap tombol |
| 2 | **FAB (+) tanpa `aria-label`** | `page.tsx:676` | `<button>` berisi SVG `+` tanpa label | **P1** | A11y | Tambah `aria-label="Log activity"` |
| 3 | **Wardrobe link di header tanpa `aria-label`** | `page.tsx:534` — icon shopping bag | `<Link>` berisi inline SVG tanpa teks | **P1** | A11y | Tambah `aria-label="Wardrobe"` |
| 4 | **Activity rows menggunakan `<div onClick>`** bukan `<button>` — tidak bisa diakses keyboard | `HomeTab.tsx:139` | `<div className="...cursor-pointer" onClick>` tanpa `role="button"` atau `tabIndex` | **P1** | A11y (WCAG 2.2) | Ganti ke `<button>` atau tambah `role="button" tabIndex={0} onKeyDown` |
| 5 | **Task toggle checkbox adalah `<div>`** tanpa `role="checkbox"` atau `aria-checked` | `HomeTab.tsx:239` | `<div onClick>` untuk toggle task done/undone | **P1** | A11y (WCAG 2.2) | Ganti ke `<button role="checkbox" aria-checked={t.done}>` |
| 6 | **Dark mode broken** — content section hardcode `background: '#FFFFFF'` | `HomeTab.tsx:124`, `page.tsx:555` | Semua konten di bawah hero jadi putih di dark mode | **P1** | DS / Dark mode | Ganti ke `bg-background` (Tailwind) atau `var(--background)` |
| 7 | **Hardcoded warm palette** (`#f1f252`) di hero, streak dots, FAB, points badge — melanggar Milestone 02 | `HomeTab.tsx:76,90,93,114` · `page.tsx:528,679` | Screenshot 375px: "story", streak dot aktif, FAB semua kuning | **P2** | DS consistency | Tokenisasi ke custom CSS variable, mis. `--accent-story` di globals.css |
| 8 | **Semua hex colors di HomeTab tidak pakai DS tokens** — `#0A0A0A`, `#1e1e1e`, `#E5E5E5`, `#F5F5F5`, `rgba(255,255,255,0.4)`, `#FDE8E4`, dll. | `HomeTab.tsx:70-290` | ~25 inline `style={{ color/background: '#...' }}` | **P2** | DS consistency (Milestone 02) | Pindahkan ke Tailwind classes dengan token DS |
| 9 | **Calendar iframe tidak ada `title` attribute** | `HomeTab.tsx:278` | `<iframe src="...google calendar...">` tanpa `title` | **P2** | A11y (WCAG 2.2) | Tambah `title="Google Calendar"` |
| 10 | **Goal edit/delete icon buttons tanpa `aria-label`** | `HomeTab.tsx:201-211` | Tombol berisi raw inline SVG pencil dan X | **P2** | A11y | Tambah `aria-label="Edit goal"` dan `aria-label="Delete goal"` |
| 11 | **Task edit/delete icon buttons tanpa `aria-label`** | `HomeTab.tsx:249-252` | Sama dengan atas, di level task | **P2** | A11y | Tambah `aria-label="Edit task"` dan `aria-label="Delete task"` |
| 12 | **`<title>` tidak di-customize** — tab browser tetap "Interestory" | `app/page.tsx` — tidak ada `export const metadata` | — | **P2** | A11y / SEO | Tambah `export const metadata = { title: 'Home' }` (tapi ini 'use client' — perlu `generateMetadata` atau pindah ke server wrapper) |
| 13 | **"🔥 0 day streak"** — counter nol saat tidak ada aktivitas, demotivating | `HomeTab.tsx:100-121` | Screenshot 375px: streak 0 | **P3** | Microcopy | Saat streak = 0: "Start today! 🔥" atau sembunyikan counter, tampilkan hanya saat > 0 |
| 14 | **Recent activities dibatasi 3**, tidak ada link "See all" | `HomeTab.tsx:133` `.slice(0, 3)` | — | **P3** | UX / Discoverability | Tambah "View all →" link ke gallery/activities tab |

---

## Top 5 Quick Wins

1. **`aria-label` di semua 5 bottom nav buttons + FAB + Wardrobe link** — 8 props, langsung eliminasi P1 a11y failures paling kritis
2. **`title="Google Calendar"` di iframe** — 1 attribute
3. **`aria-label` di goal & task icon buttons** — 4 props (edit goal, delete goal, edit task, delete task)
4. **Activity rows: ganti `<div>` ke `<button>`** — `HomeTab.tsx:139`, 1 perubahan tag, tambah styling reset
5. **"🔥 0 day streak" → kondisional**: sembunyikan atau ganti copy saat streak = 0 — 1 ternary

---

## What's Working

- Dark hero + streak card: visual hierarchy kuat, terasa premium
- Momo mascot: personality yang konsisten, microcopy sudah motivating saat streak > 1
- Monthly Goals system: card + progress bar + tasks sudah cukup fungsional
- FAB (+ button) posisi: mudah dijangkau ibu jari di mobile
- Header adaptasi warna berdasarkan tab aktif (`home` vs lainnya): subtle tapi bagus

---

## Open Questions

- **Apakah homepage intentionally tidak menggunakan dark mode?** Hero dan bottom nav memang selalu gelap (by design), tapi content section yang putih — apakah ini intended juga di dark mode? Kalau iya, perlu didokumentasikan agar tidak di-"fix" oleh contributor lain.
- **Title metadata**: `app/page.tsx` adalah `'use client'` sehingga `export const metadata` tidak bisa langsung. Perlu server wrapper atau tetap biarkan "Interestory"?
- **Recent: 3 items** — cukup atau perlu "See all"? Bergantung seberapa sering user pakai gallery tab.
