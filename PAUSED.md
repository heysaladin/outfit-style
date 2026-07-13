# Interestory

> **STATUS: ⏸ PAUSED** — sejak 2026-07-14

## Apa ini
Interestory — smart wardrobe planner & outfit tracker (PWA, personal use). Katalog pakaian dengan AI remove background, outfit builder, weekly planner dengan weather, cost per wear, plus tracking hobbies/gear/plants.

## Kondisi terakhir
- Sampai mana: App fungsional dengan halaman lengkap — wardrobe, outfits, weekly plan, calendar, stats, declutter, fashion feed, gear, profile. Sudah PWA, ada sistem draft/verified status, wardrobe UI sudah di-redesign (warm editorial style), dan sudah migrasi ke Cubicle design system. Commit terakhir: favicon (2026-07-14).
- Stack/file penting:
  - Repo: https://github.com/heysaladin/outfit-style
  - Next.js 16 + React 19 + TypeScript, Tailwind v4, Supabase (auth/db/storage), Prisma, TanStack Query
  - Design tokens Cubicle: `app/globals.css` (source: `~/Development/cubicle/src/styles/tokens.css`)
  - Konteks & SQL setup: `CONTEXT.md`
- Keputusan yang sudah dibuat:
  - Pakai Cubicle design system (bukan default shadcn) — token hex, radius fixed px, font Geist via `next/font`
  - Pakai package `radix-ui` monorepo, bukan `@radix-ui/*` individual
  - Auth hanya Google OAuth via Supabase
  - Remove.bg untuk background removal, OpenWeather untuk forecast

## Kenapa dipause
Fokus ke project lain yang lebih prioritas.

## What next (kalau dilanjut)
- [ ] `npm run dev`, login, klik-klik semua halaman — refresh ingatan soal state app
- [ ] Baca `CONTEXT.md` — cek mana item Phase 2 yang belum kelar (laundry state management masih di list)
- [ ] Rapikan/lengkapi fitur laundry state (Clean → Worn → Laundry → Clean) kalau memang belum ada
- [ ] Cek Supabase project masih aktif (free tier bisa auto-pause kalau idle)

## Syarat dilanjut
Project prioritas saat ini sudah stabil / selesai, dan ada kebutuhan nyata pakai app ini lagi sehari-hari.
