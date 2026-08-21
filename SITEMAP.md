# Interestory — Site Map

> PWA wardrobe & interest tracker
> Base URL: `https://interestory.app` *(ganti sesuai domain kamu)*

---

## 🔐 Auth

| Route | Page | Auth Required |
|-------|------|:---:|
| [`/login`](/login) | Login — Google Sign In | ✗ |
| `/auth/callback` | OAuth callback handler | ✗ |

---

## 🏠 Home

| Route | Page | Auth Required |
|-------|------|:---:|
| [`/`](/) | Home — Interest dashboard (tabs: Home, Stats, Gallery, Search, Hobby) | ✗ |

---

## 👗 Wardrobe (Closet)

| Route | Page | Auth Required |
|-------|------|:---:|
| [`/ofit`](/ofit) | Closet — Browse & manage wardrobe items | ✓ |
| [`/outfits`](/outfits) | Outfits — Create & manage outfit collections | ✓ |
| [`/wardrobes`](/wardrobes) | Storage — Manage wardrobe locations/cabinets | ✓ |
| [`/declutter`](/declutter) | Declutter — Suggestions for unused items | ✓ |
| [`/stats`](/stats) | Style Stats — Wear count, cost-per-wear, category breakdown | ✓ |
| [`/plan`](/plan) | Weekly Plan — Plan outfits for each day of the week | ✓ |
| [`/calendar`](/calendar) | Calendar — Log & track worn outfits by date | ✓ |
| [`/fashion`](/fashion) | Fashion Feed — Browse public wardrobe items | ✗ |
| [`/fashion/[id]`](/fashion/[id]) | Fashion Item Detail — View single item detail | ✗ |

---

## 🎒 Gear & Hobbies

| Route | Page | Auth Required |
|-------|------|:---:|
| [`/gear`](/gear) | Gear Overview — All hobby gear across categories | ✓ |
| [`/gear/[hobby]`](/gear/[hobby]) | Gear by Hobby — Filtered gear per hobby | ✗ |
| [`/[hobby]`](/[hobby]) | Hobby Detail — Items, activities & moments per hobby | ✗ |
| [`/[hobby]/[itemId]`](/[hobby]/[itemId]) | Hobby Item Detail — Single gear/item detail | ✗ |

### Available Hobby Routes (`/[hobby]`)

| Route | Hobby |
|-------|-------|
| [`/motorcycle`](/motorcycle) | 🏍️ Motorcycle |
| [`/automotive`](/automotive) | 🚗 Automotive |
| [`/workout`](/workout) | 🏋️ Workout |
| [`/plant_care`](/plant_care) | 🪴 Plant Care |
| [`/electronics`](/electronics) | 📱 Electronics |
| [`/watches`](/watches) | ⌚ Watches |
| [`/photography`](/photography) | 📷 Photography |
| [`/videography`](/videography) | 🎥 Videography |
| [`/workspace`](/workspace) | 🖥️ Workspace |
| [`/outdoor`](/outdoor) | 🏕️ Outdoor |
| [`/cooking`](/cooking) | 🍳 Cooking |
| [`/fish_keeping`](/fish_keeping) | 🐠 Fish Keeping |
| [`/drawing`](/drawing) | ✏️ Drawing |
| [`/3d_modelling`](/3d_modelling) | 🧊 3D Modelling |
| [`/reading`](/reading) | 📚 Reading → redirects to `/literacy` |
| [`/grooming`](/grooming) | 💈 Grooming |
| [`/coding`](/coding) | 💻 Coding |
| [`/designing`](/designing) | 🎨 Designing |
| [`/architecture`](/architecture) | 🏛️ Architecture |
| [`/music`](/music) | 🎵 Music |
| [`/social`](/social) | 👥 Life |

---

## 📚 Literacy

| Route | Page | Auth Required |
|-------|------|:---:|
| [`/literacy`](/literacy) | Library — Reading tracker & book progress | ✗ |

---

## 👤 Profile

| Route | Page | Auth Required |
|-------|------|:---:|
| [`/profile`](/profile) | Profile — User info, wardrobe count, gear count | ✓ |

---

## 🔌 API

| Route | Description |
|-------|-------------|
| `/api/hobby-items` | GET/POST hobby items |
| `/auth/callback` | Supabase OAuth callback |

---

## 🧭 Navigation Structure

### Bottom Nav (5 tabs — always visible)
```
Closet (/ofit) · Outfits (/outfits) · Gear (/gear) · Calendar (/calendar) · Stats (/stats)
```

### Avatar Dropdown (accessible from all pages)
```
Declutter · Storage · Plan · Fashion · Literacy · Profile · Sign Out
```

### Home Page Tabs
```
Home · Stats · Gallery · Search · Hobby
```

---

## 🗂️ Page Count Summary

| Category | Pages |
|----------|------:|
| Auth | 1 |
| Home | 1 |
| Wardrobe | 7 |
| Gear & Hobbies | 3 + 21 hobby routes |
| Literacy | 1 |
| Profile | 1 |
| **Total** | **35** |
