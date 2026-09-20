# Interestory — CLAUDE.md

## Project Overview
Personal lifestyle app: wardrobe, outfits, hobbies, family schedule, gear, and literacy tracking.
Stack: Next.js 15 (App Router), TypeScript, Prisma + Supabase (Postgres), shadcn/ui, Cubicle DS.

## Routes
| Path | Purpose |
|------|---------|
| `/` | Homepage / dashboard |
| `/fashion` | Wardrobe catalog |
| `/ofit` | Outfit builder |
| `/outfits` | Outfit collections |
| `/[hobby]` | Hobby pages (gear, literacy, calendar, plan) |
| `/family` | Family schedule (Embun, Langit, Senja) |
| `/declutter` | Items to sell/donate |
| `/stats` | Usage stats |
| `/admin` | Admin panel |

## Primary Users
Owner (Saladin) — personal tool, not a SaaS. Mobile-first: mostly used on iPhone during daily routines.

## Design System
- **Tokens**: Cubicle DS — neutral palette, Geist font. No warm palette (removed in Milestone 02).
- **Components**: shadcn/ui in `components/ui/`. Cubicle overrides in `components/`.
- **Key patterns**: card-based lists, bottom-sheet modals on mobile, drag-and-drop reorder.

## Dev Commands
```bash
npm run dev       # start dev server (port 3000)
npx prisma studio # DB GUI
```
