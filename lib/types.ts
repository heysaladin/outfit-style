// ─── Category Hierarchy ────────────────────────────────────────────────────

export interface ItemType { value: string; label: string }
export interface Subcategory { value: string; label: string; types: ItemType[] }
export interface Category { value: string; label: string; icon: string; subcategories: Subcategory[]; types: ItemType[] }

export const CATEGORY_TREE: Category[] = [
  {
    value: 'top', label: 'Top', icon: '👕',
    subcategories: [
      { value: 'inner', label: 'Inner', types: [
        { value: 'shirt', label: 'Shirt' },
        { value: 'tshirt', label: 'T-Shirt' },
        { value: 'misc', label: 'Misc' },
      ]},
      { value: 'outer', label: 'Outer', types: [
        { value: 'jacket', label: 'Jacket' },
        { value: 'formal-jacket', label: 'Formal Jacket' },
        { value: 'misc', label: 'Misc' },
      ]},
    ],
    types: [],
  },
  {
    value: 'bottom', label: 'Bottom', icon: '👖',
    subcategories: [],
    types: [
      { value: 'shorts', label: 'Shorts' },
      { value: 'pants', label: 'Pants' },
      { value: 'jeans', label: 'Jeans' },
      { value: 'trousers', label: 'Trousers' },
      { value: 'misc', label: 'Misc' },
    ],
  },
  {
    value: 'headwear', label: 'Headwear', icon: '🧢',
    subcategories: [],
    types: [
      { value: 'hat', label: 'Hat' },
      { value: 'cap', label: 'Cap' },
      { value: 'misc', label: 'Misc' },
    ],
  },
  {
    value: 'footwear', label: 'Footwear', icon: '👟',
    subcategories: [],
    types: [
      { value: 'sneakers', label: 'Sneakers' },
      { value: 'shoes', label: 'Shoes' },
      { value: 'boots', label: 'Boots' },
      { value: 'sandals', label: 'Sandals' },
    ],
  },
  {
    value: 'accessories', label: 'Accessories', icon: '💍',
    subcategories: [
      { value: 'eyewear', label: 'Eyewear', types: [
        { value: 'glasses', label: 'Glasses' },
        { value: 'sunglasses', label: 'Sunglasses' },
      ]},
      { value: 'watches', label: 'Watches', types: [
        { value: 'mechanical', label: 'Mechanical' },
        { value: 'digital', label: 'Digital' },
        { value: 'strap', label: 'Watch Strap' },
      ]},
      { value: 'wristwear', label: 'Wristwear', types: [
        { value: 'band', label: 'Band' },
        { value: 'bracelet', label: 'Bracelet' },
      ]},
      { value: 'ring', label: 'Ring', types: [] },
      { value: 'necklace', label: 'Necklace', types: [] },
      { value: 'misc', label: 'Misc', types: [] },
    ],
    types: [],
  },
]

export function getCategoryDef(cat: string) {
  return CATEGORY_TREE.find(c => c.value === cat)
}
export function getSubcategoryDef(cat: string, sub: string) {
  return getCategoryDef(cat)?.subcategories.find(s => s.value === sub)
}
export function getCategoryLabel(cat: string, sub?: string | null, type?: string | null) {
  const parts = [
    getCategoryDef(cat)?.label ?? cat,
    sub ? getSubcategoryDef(cat, sub)?.label : null,
    type ? (sub ? getSubcategoryDef(cat, sub)?.types.find(t => t.value === type)?.label : getCategoryDef(cat)?.types.find(t => t.value === type)?.label) : null,
  ].filter(Boolean)
  return parts.join(' › ')
}

// ─── Colors ───────────────────────────────────────────────────────────────

export const COLORS = [
  { value: 'black',  label: 'Black',  hex: '#111111' },
  { value: 'white',  label: 'White',  hex: '#F5F5F5' },
  { value: 'gray',   label: 'Gray',   hex: '#808080' },
  { value: 'red',    label: 'Red',    hex: '#EF4444' },
  { value: 'blue',   label: 'Blue',   hex: '#3B82F6' },
  { value: 'green',  label: 'Green',  hex: '#22C55E' },
  { value: 'yellow', label: 'Yellow', hex: '#EAB308' },
  { value: 'pink',   label: 'Pink',   hex: '#EC4899' },
  { value: 'purple', label: 'Purple', hex: '#A855F7' },
  { value: 'brown',  label: 'Brown',  hex: '#92400E' },
  { value: 'beige',  label: 'Beige',  hex: '#D2B48C' },
  { value: 'orange', label: 'Orange', hex: '#F97316' },
] as const

export type Color = typeof COLORS[number]['value']

// ─── Seasons & Occasions ───────────────────────────────────────────────────

export const SEASONS = [
  { value: 'spring', label: 'Spring', icon: '🌸' },
  { value: 'summer', label: 'Summer', icon: '☀️' },
  { value: 'fall',   label: 'Fall',   icon: '🍂' },
  { value: 'winter', label: 'Winter', icon: '❄️' },
] as const

export const OCCASIONS = [
  { value: 'casual',  label: 'Casual'  },
  { value: 'formal',  label: 'Formal'  },
  { value: 'sport',   label: 'Sport'   },
  { value: 'party',   label: 'Party'   },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'work',    label: 'Work'    },
] as const

// ─── Declutter ────────────────────────────────────────────────────────────

export const DECLUTTER_STATUSES = [
  { value: 'donate',   label: 'Donate',    color: '#22C55E' },
  { value: 'sell',     label: 'Sell',      color: '#3B82F6' },
  { value: 'giveaway', label: 'Give Away', color: '#A855F7' },
] as const

export type DeclutterStatus = 'donate' | 'sell' | 'giveaway'

// ─── Interfaces ───────────────────────────────────────────────────────────

export interface WardrobeItem {
  id: string
  user_id: string
  name: string
  category: string
  subcategory: string | null
  item_type: string | null
  color: string
  seasons: string[] | null
  occasions: string[] | null
  tags: string[] | null
  brand: string | null
  price: number | null
  wear_count: number
  last_worn: string | null
  image_url: string
  original_image_url: string | null
  declutter_status: DeclutterStatus | null
  declutter_note: string | null
  created_at: string
  updated_at: string
}

export interface Outfit {
  id: string
  user_id: string
  name: string
  occasion: string | null
  notes: string | null
  created_at: string
  updated_at: string
  outfit_items?: { item_id: string; wardrobe_items: WardrobeItem }[]
}

export interface OutfitLog {
  id: string
  user_id: string
  outfit_id: string | null
  date: string
  notes: string | null
  created_at: string
  outfits?: Outfit | null
}

export interface PlanEntry {
  id: string
  user_id: string
  item_id: string
  planned_date: string
  wardrobe_items: WardrobeItem
}
