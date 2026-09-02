# Interestory — Information Architecture

> Generated: 2026-09-02. Use this as reference when building the FigJam IA diagram.

---

## SITEMAP — All Pages & Routes

| URL | Page File | Auth | Description |
|-----|-----------|:----:|-------------|
| `/` | `app/page.tsx` | No | Home dashboard (5-tab SPA) |
| `/login` | `app/login/page.tsx` | No | Google OAuth sign-in |
| `/ofit` | `app/ofit/page.tsx` | Yes | Wardrobe browser — filter/sort/upload |
| `/outfits` | `app/outfits/page.tsx` | Yes | Named outfits — create & log |
| `/wardrobes` | `app/wardrobes/page.tsx` | Yes | Physical closet/cabinet manager |
| `/declutter` | `app/declutter/page.tsx` | Yes | Surfacing low-wear items |
| `/stats` | `app/stats/page.tsx` | Yes | Style stats & cost-per-wear |
| `/plan` | `app/plan/page.tsx` | Yes | Weekly outfit planner |
| `/calendar` | `app/calendar/page.tsx` | Yes | Outfit calendar log |
| `/fashion` | `app/fashion/page.tsx` | No | Fashion activity + photo feed |
| `/fashion/[id]` | `app/fashion/[id]/page.tsx` | No | Single wardrobe item detail |
| `/gear` | `app/gear/page.tsx` | Yes | All gear across all hobbies |
| `/gear/[hobby]` | `app/gear/[hobby]/page.tsx` | No | Gear filtered by hobby |
| `/[hobby]` | `app/[hobby]/page.tsx` | No | Hobby detail (Items / Activities / Moments) |
| `/[hobby]/[itemId]` | `app/[hobby]/[itemId]/page.tsx` | No | Single hobby item detail |
| `/literacy` | `app/literacy/page.tsx` | No | Book library & reading tracker |
| `/family` | `app/family/page.tsx` | Yes | Family weekly schedule |
| `/profile` | `app/profile/page.tsx` | Yes | User profile & item counts |
| `/admin` | `app/admin/page.tsx` | Yes | Admin hub |
| `/admin/backlog` | `app/admin/backlog/page.tsx` | Yes | Zopavo backlog (external API) |
| `/admin/blogs` | `app/admin/blogs/page.tsx` | Yes | Hyperfantasy blog manager (external API) |

---

## NAVIGATION

### Bottom Nav (fixed, 5 tabs)
```
Wardrobe (/ofit) · Closet (/wardrobes) · Outfits (/outfits) · Calendar (/calendar) · Stats (/stats)
```

### Home Page Internal Tabs (no routing)
```
Home (streak, goals, calendar) · Gallery (feed) · + FAB (log activity) · Stats · Hobby grid
```

### Avatar Dropdown (all pages)
```
Profile → /profile
Appearance (dark/light toggle)
Reorder interests
---
Zopavo → /admin/backlog
Hyperfantasy → /admin/blogs
---
Sign out
```

### Special Hobby Redirects
- `reading` hobby → shows `/literacy` link as "Library"
- `social` hobby → shows `/family` link as "Family"

---

## DATABASE TABLES

### `wardrobe_items`
```
id              uuid PK
user_id         uuid FK → auth.users
wardrobe_id     uuid FK → wardrobes (nullable)
name            text
category        text        top | bottom | headwear | footwear | accessories
subcategory     text?       inner | outer | eyewear | watches | wristwear
item_type       text?       shirt | jacket | sneakers | trousers | etc.
color           text        12 values (see COLORS)
seasons         text[]?     spring | summer | fall | winter
occasions       text[]?     casual | formal | sport | party | outdoor | work
tags            text[]?
brand           text?
price           number?
purchase_date   text?       YYYY-MM-DD
wear_count      number
last_worn       text?       YYYY-MM-DD
target          number      target wear count
image_url       text
original_image_url text?
declutter_status text?      donate | sell | giveaway | non-fashion
declutter_note  text?
status          text        draft | verified | trashed | donated | sell | give_away
created_at      timestamptz
updated_at      timestamptz
```

### `wardrobes`
```
id          uuid PK
user_id     uuid FK → auth.users
code        text
name        text
description text?
created_at  timestamptz
updated_at  timestamptz
```

### `outfits`
```
id          uuid PK
user_id     uuid FK → auth.users
name        text
occasion    text?
notes       text?
created_at  timestamptz
updated_at  timestamptz
outfit_items → [{ item_id, wardrobe_items }]  (joined)
```

### `outfit_items` (join table)
```
outfit_id   uuid FK → outfits
item_id     uuid FK → wardrobe_items
```

### `outfit_logs`
```
id          uuid PK
user_id     uuid FK → auth.users
outfit_id   uuid? FK → outfits
date        text        YYYY-MM-DD
notes       text?
created_at  timestamptz
```

### `weekly_plans`
```
id            uuid PK
user_id       uuid FK → auth.users
item_id       uuid FK → wardrobe_items
planned_date  text        YYYY-MM-DD
```

### `hobby_items`
```
id              uuid PK
name            text
description     text?
category        text        one of 21 HOBBIES values
image_url       text?
purchase_price  number?
purchase_date   text?       YYYY-MM-DD
use_count       number
last_used       text?
target          number
status          text        draft | verified
created_at      timestamptz
```

### `hobby_activities`
```
id              uuid PK
user_id         uuid FK → auth.users
hobby           text        one of 21 HOBBIES values
note            text?
location        text?
activity_at     timestamptz
created_at      timestamptz
outfit_id       uuid? FK → outfits
outfit_snapshot json?       [{ id, image_url, name }]
```

### `hobby_photos`
```
id          uuid PK
user_id     uuid FK → auth.users
hobby       text
image_url   text
note        text?
created_at  timestamptz
```

### `hobby_item_uses`
```
id          uuid PK
item_id     uuid FK → hobby_items
used_at     timestamptz
note        text?
created_at  timestamptz
```

### `book_progress`
```
id              uuid PK
user_id         uuid FK → auth.users
hobby_item_id   uuid FK → hobby_items (category=reading)
progress        number      0–100
status          text        unread | reading | done
created_at      timestamptz
updated_at      timestamptz
```

### `family_schedules`
```
id          uuid PK
user_id     uuid FK → auth.users
member_name text        Embun | Langit | Senja
day_of_week number      1=Mon … 6=Sat
subject     text
start_time  text        HH:MM
end_time    text        HH:MM
note        text?
created_at  timestamptz
```

### `monthly_goals`
```
id          uuid PK
user_id     uuid FK → auth.users
name        text
narrative   text
deadline    text
```

### `goal_tasks`
```
id          uuid PK
user_id     uuid FK → auth.users
goal_id     uuid FK → monthly_goals
task        text
week        1 | 2 | 3 | 4
done        boolean
```

### Storage Bucket: `wardrobe`
```
wardrobe items:   {user_id}/{timestamp}_original.{ext}
hobby photos:     {user_id}/hobby/{hobby}/{timestamp}.{ext}
gear photos:      {user_id}/gear/{timestamp}.{ext}
```

---

## DATA FLOWS — Page → Supabase Table

| Page | Reads | Writes |
|------|-------|--------|
| `/` | hobby_activities, hobby_photos, hobby_items, wardrobe_items, monthly_goals, goal_tasks | hobby_activities, hobby_photos, monthly_goals, goal_tasks |
| `/ofit` | wardrobe_items, wardrobes | wardrobe_items (status, delete), outfits |
| `/outfits` | outfits+outfit_items+wardrobe_items | outfits, outfit_logs |
| `/wardrobes` | wardrobes, wardrobe_items | wardrobes |
| `/declutter` | wardrobe_items | wardrobe_items (declutter_status) |
| `/stats` | wardrobe_items | — |
| `/plan` | weekly_plans+wardrobe_items | weekly_plans |
| `/calendar` | outfit_logs+outfits+wardrobe_items | outfit_logs |
| `/fashion` | hobby_activities (fashion), hobby_photos (fashion) | — |
| `/fashion/[id]` | wardrobe_items (single) | wardrobe_items (wear_count, status) |
| `/gear` | hobby_items | hobby_items |
| `/[hobby]` | hobby_items, hobby_activities, hobby_photos | hobby_items, hobby_activities, hobby_photos |
| `/[hobby]/[itemId]` | hobby_items (single) | hobby_items, hobby_item_uses |
| `/literacy` | hobby_items (reading), book_progress | book_progress |
| `/family` | family_schedules | family_schedules |
| `/profile` | wardrobe_items (count), gear_items (count) | — |
| `/admin/backlog` | External: zopavo.vercel.app/api/backlog | Zopavo API |
| `/admin/blogs` | External: hyperfantasy.co/api/blogs | Hyperfantasy API |

---

## HOBBIES (21 total)

| value | label | icon | category |
|-------|-------|------|----------|
| motorcycle | Motorcycle | 🏍️ | hands_on |
| automotive | Automotive | 🚗 | hands_on |
| workout | Workout | 🏋️ | wellness |
| plant_care | Plant Care | 🪴 | wellness |
| electronics | Electronics | 📱 | technical |
| watches | Watches | ⌚ | lifestyle |
| photography | Photography | 📷 | creative |
| videography | Videography | 🎥 | creative |
| workspace | Workspace | 🖥️ | lifestyle |
| outdoor | Outdoor | 🏕️ | wellness |
| cooking | Cooking | 🍳 | hands_on |
| fish_keeping | Fish Keeping | 🐠 | hands_on |
| drawing | Drawing | ✏️ | creative |
| 3d_modelling | 3D Modelling | 🧊 | creative |
| reading | Reading | 📚 | wellness |
| grooming | Grooming | 💈 | lifestyle |
| coding | Coding | 💻 | technical |
| designing | Designing | 🎨 | creative |
| architecture | Architecture | 🏛️ | creative |
| music | Music | 🎵 | creative |
| social | Life | 👥 | lifestyle |

---

## CATEGORY TREE (Wardrobe)

```
top (👕)
  └── inner: shirt, t-shirt, misc
  └── outer: jacket, formal-jacket, misc

bottom (👖)
  └── shorts, pants, jeans, trousers, misc

headwear (🧢)
  └── hat, cap, misc

footwear (👟)
  └── sneakers, shoes, boots, sandals, socks

accessories (💍)
  └── eyewear: glasses, sunglasses
  └── watches: mechanical, digital, strap
  └── wristwear: band, bracelet
  └── ring
  └── necklace
  └── misc
```

---

## COLORS (12)

`black` · `white` · `gray` · `red` · `blue` · `green` · `yellow` · `pink` · `purple` · `brown` · `beige` · `orange`

---

## STATUS ENUMS

| Entity | Values |
|--------|--------|
| wardrobe_items.status | draft · verified · trashed · donated · sell · give_away |
| wardrobe_items.declutter_status | donate · sell · giveaway · non-fashion |
| hobby_items.status | draft · verified |
| book_progress.status | unread · reading · done |

---

## FAMILY MEMBERS (hardcoded)

| name | school | emoji |
|------|--------|-------|
| Embun | PAUD | 🌿 |
| Langit | Belum sekolah | ☁️ |
| Senja | SD | 🌅 |

---

## WORTH-IT FORMULA (`lib/worth.ts`)

`targetUses = calcTargetUses(price)` — price-based scale:
```
< 5K   →  5 uses
< 50K  → 10 uses
< 100K → 15 uses
< 250K → 25 uses
< 500K → 30 uses
< 1M   → 35 uses
< 2M   → 40 uses
< 5M   → 45 uses
< 10M  → 50 uses
< 25M  → 75 uses
< 50M  → 100 uses
≥ 50M  → 150 uses
```
- Can be overridden by `targetOverride` (stored per-item as `target` column)
- High-value items (>100M) use time-based formula: `years × 52 × usesPerWeek`
- `costPerUse = price / wear_count`
- `cpd = price / daysOwned` (cost per day)

---

## COMPONENT DEPENDENCIES

### Shared Components (used across pages)
- `BottomNav` — `/ofit`, `/wardrobes`, `/outfits`, `/calendar`, `/stats`, `/plan`, `/gear`, `/admin`
- `UserAvatarMenu` — `/`, `/fashion`, `/gear`, `/ofit`, `/profile`
- `cubicle-ds` — `MobileButton`, `MobileEmptyState`, `SegmentedControl`, `MobileSearchBar`, `InputAccessoryView`

### Key Component → Table mapping
| Component | Table |
|-----------|-------|
| `ItemCard` | wardrobe_items |
| `ItemDetailModal` | wardrobe_items |
| `GearItemCard` | hobby_items |
| `GearItemDetailModal` | hobby_items |
| `HobbyDetailClient` | hobby_items, hobby_activities, hobby_photos |
| `ActivitiesTab` | hobby_activities |
| `MomentsTab` | hobby_photos |
| `DayRow` (plan) | weekly_plans + wardrobe_items |
| `ItemPickerModal` | wardrobe_items |
