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

export interface Wardrobe {
  id: string
  user_id: string
  code: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface WardrobeItem {
  id: string
  user_id: string
  wardrobe_id: string | null
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
  purchase_date: string | null
  wear_count: number
  last_worn: string | null
  image_url: string
  original_image_url: string | null
  declutter_status: DeclutterStatus | null
  declutter_note: string | null
  status: 'draft' | 'verified'
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

// ─── Gear / Hobbies ───────────────────────────────────────────────────────

export const HOBBIES = [
  { value: 'motorcycle',   label: 'Motorcycle',   icon: '🏍️',  category: 'hands_on'  },
  { value: 'automotive',   label: 'Automotive',   icon: '🚗',  category: 'hands_on'  },
  { value: 'workout',      label: 'Workout',      icon: '🏋️',  category: 'wellness'  },
  { value: 'plant_care',   label: 'Plant Care',   icon: '🪴',  category: 'wellness'  },
  { value: 'electronics',  label: 'Electronics',  icon: '📱',  category: 'technical' },
  { value: 'watches',      label: 'Watches',      icon: '⌚',  category: 'lifestyle' },
  { value: 'photography',  label: 'Photography',  icon: '📷',  category: 'creative'  },
  { value: 'videography',  label: 'Videography',  icon: '🎥',  category: 'creative'  },
  { value: 'workspace',    label: 'Workspace',    icon: '🖥️',  category: 'lifestyle' },
  { value: 'outdoor',      label: 'Outdoor',      icon: '🏕️',  category: 'wellness'  },
  { value: 'cooking',      label: 'Cooking',      icon: '🍳',  category: 'hands_on'  },
  { value: 'fish_keeping', label: 'Fish Keeping', icon: '🐠',  category: 'hands_on'  },
  { value: 'drawing',      label: 'Drawing',      icon: '✏️',  category: 'creative'  },
  { value: '3d_modelling', label: '3D Modelling', icon: '🧊',  category: 'creative'  },
  { value: 'reading',      label: 'Reading',      icon: '📚',  category: 'wellness'  },
  { value: 'grooming',     label: 'Grooming',     icon: '💈',  category: 'lifestyle' },
  { value: 'coding',       label: 'Coding',       icon: '💻',  category: 'technical' },
  { value: 'car',          label: 'Car',          icon: '🚗',  category: 'hands_on'  },
  { value: 'plant',        label: 'Plant',        icon: '🪴',  category: 'wellness'  },
] as const

export type HobbyValue = typeof HOBBIES[number]['value']

export const GEAR_CONDITIONS = [
  { value: 'new',       label: 'New'       },
  { value: 'like_new',  label: 'Like New'  },
  { value: 'good',      label: 'Good'      },
  { value: 'fair',      label: 'Fair'      },
  { value: 'poor',      label: 'Poor'      },
] as const

// Per-hobby metadata field definitions
export interface GearMetaField {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'select'
  options?: string[]
  placeholder?: string
}

export const HOBBY_META_FIELDS: Record<string, GearMetaField[]> = {
  motorcycle: [
    { key: 'model',            label: 'Model',           type: 'text',   placeholder: 'e.g. Honda CB500F' },
    { key: 'year',             label: 'Year',            type: 'number', placeholder: 'e.g. 2022' },
    { key: 'cc',               label: 'Engine (cc)',     type: 'number', placeholder: 'e.g. 500' },
    { key: 'plate',            label: 'Plate Number',    type: 'text'   },
    { key: 'last_service',     label: 'Last Service',    type: 'date'   },
    { key: 'mileage_km',       label: 'Mileage (km)',    type: 'number' },
  ],
  electronics: [
    { key: 'model_number',     label: 'Model Number',    type: 'text'   },
    { key: 'serial',           label: 'Serial Number',   type: 'text'   },
    { key: 'specs',            label: 'Specs',           type: 'text',   placeholder: 'e.g. 16GB RAM, M3 chip' },
    { key: 'warranty_until',   label: 'Warranty Until',  type: 'date'   },
  ],
  watches: [
    { key: 'reference',        label: 'Reference No.',   type: 'text'   },
    { key: 'movement',         label: 'Movement',        type: 'select', options: ['Automatic', 'Manual', 'Quartz', 'Solar', 'Smartwatch'] },
    { key: 'case_size_mm',     label: 'Case Size (mm)',  type: 'number' },
    { key: 'dial_color',       label: 'Dial Color',      type: 'text'   },
    { key: 'strap_material',   label: 'Strap Material',  type: 'select', options: ['Leather', 'Rubber', 'Metal', 'Nato', 'Canvas'] },
  ],
  photography: [
    { key: 'model_number',     label: 'Model',           type: 'text',   placeholder: 'e.g. Sony A7IV' },
    { key: 'mount',            label: 'Mount',           type: 'text',   placeholder: 'e.g. Sony E-mount' },
    { key: 'focal_length',     label: 'Focal Length',    type: 'text',   placeholder: 'e.g. 24-70mm' },
    { key: 'sensor',           label: 'Sensor',          type: 'select', options: ['Full Frame', 'APS-C', 'Micro 4/3', 'Medium Format', 'Phone'] },
  ],
  videography: [
    { key: 'model_number',     label: 'Model',           type: 'text'   },
    { key: 'resolution',       label: 'Max Resolution',  type: 'select', options: ['4K', '6K', '8K', '1080p', '720p'] },
    { key: 'stabilization',    label: 'Stabilization',   type: 'select', options: ['IBIS', 'OIS', 'Gimbal', 'None'] },
  ],
  workspace: [
    { key: 'model_number',     label: 'Model/Spec',      type: 'text'   },
    { key: 'specs',            label: 'Specs',           type: 'text'   },
    { key: 'color',            label: 'Color',           type: 'text'   },
  ],
  outdoor: [
    { key: 'type',             label: 'Type',            type: 'text',   placeholder: 'e.g. Tent, Backpack, Bike' },
    { key: 'weight_kg',        label: 'Weight (kg)',     type: 'number' },
    { key: 'size',             label: 'Size/Capacity',   type: 'text'   },
  ],
  cooking: [
    { key: 'material',         label: 'Material',        type: 'select', options: ['Stainless Steel', 'Cast Iron', 'Non-stick', 'Ceramic', 'Copper', 'Carbon Steel'] },
    { key: 'size',             label: 'Size',            type: 'text',   placeholder: 'e.g. 26cm, 5L' },
    { key: 'type',             label: 'Type',            type: 'text',   placeholder: 'e.g. Pan, Knife, Blender' },
  ],
  fish_keeping: [
    { key: 'species',          label: 'Species',         type: 'text',   placeholder: 'e.g. Guppy, Betta' },
    { key: 'tank_size_liters', label: 'Tank Size (L)',   type: 'number' },
    { key: 'tank_type',        label: 'Type',            type: 'select', options: ['Freshwater', 'Saltwater', 'Planted', 'Brackish'] },
    { key: 'quantity',         label: 'Quantity',        type: 'number' },
  ],
  drawing: [
    { key: 'medium',           label: 'Medium',          type: 'select', options: ['Pencil', 'Ink', 'Charcoal', 'Watercolor', 'Digital', 'Oil', 'Acrylic'] },
    { key: 'size',             label: 'Size',            type: 'text',   placeholder: 'e.g. A4, A3' },
    { key: 'brand_model',      label: 'Brand/Model',     type: 'text'   },
  ],
  '3d_modelling': [
    { key: 'software',         label: 'Software',        type: 'text',   placeholder: 'e.g. Blender, ZBrush' },
    { key: 'hardware',         label: 'Hardware',        type: 'text'   },
    { key: 'type',             label: 'Type',            type: 'select', options: ['Software', 'Hardware', 'Peripheral', 'Accessory'] },
  ],
  reading: [
    { key: 'author',           label: 'Author',          type: 'text'   },
    { key: 'isbn',             label: 'ISBN',            type: 'text'   },
    { key: 'genre',            label: 'Genre',           type: 'text',   placeholder: 'e.g. Fiction, Self-help' },
    { key: 'read_status',      label: 'Read Status',     type: 'select', options: ['Unread', 'Reading', 'Finished', 'On Hold'] },
    { key: 'rating',           label: 'Rating (1-5)',    type: 'number' },
  ],
  grooming: [
    { key: 'type',             label: 'Type',            type: 'text',   placeholder: 'e.g. Perfume, Skincare, Razor' },
    { key: 'volume_ml',        label: 'Volume (ml)',     type: 'number' },
    { key: 'scent_family',     label: 'Scent Family',    type: 'select', options: ['Woody', 'Fresh', 'Floral', 'Oriental', 'Citrus', 'Aquatic', 'Spicy'] },
  ],
  coding: [
    { key: 'type',             label: 'Type',            type: 'select', options: ['Hardware', 'Software', 'License', 'Peripheral', 'Subscription'] },
    { key: 'specs',            label: 'Specs/Version',   type: 'text'   },
    { key: 'license_key',      label: 'License Key',     type: 'text'   },
  ],
  car: [
    { key: 'model',            label: 'Model',           type: 'text',   placeholder: 'e.g. Toyota GR86' },
    { key: 'year',             label: 'Year',            type: 'number', placeholder: 'e.g. 2023' },
    { key: 'plate',            label: 'Plate Number',    type: 'text'   },
    { key: 'last_service',     label: 'Last Service',    type: 'date'   },
    { key: 'mileage_km',       label: 'Mileage (km)',    type: 'number' },
  ],
  plant: [
    { key: 'species',          label: 'Species',         type: 'text',   placeholder: 'e.g. Monstera deliciosa' },
    { key: 'pot_size_cm',      label: 'Pot Size (cm)',   type: 'number' },
    { key: 'light',            label: 'Light Needs',     type: 'select', options: ['Full Sun', 'Partial Sun', 'Indirect Light', 'Low Light'] },
    { key: 'watering',         label: 'Watering',        type: 'select', options: ['Daily', 'Every 2-3 days', 'Weekly', 'Bi-weekly', 'Monthly'] },
  ],
}

export interface GearItem {
  id: string
  user_id: string
  hobby: string
  name: string
  brand: string | null
  image_url: string | null
  original_image_url: string | null
  purchase_price: number | null
  purchase_date: string | null
  condition: string | null
  status: 'draft' | 'verified'
  declutter_status: DeclutterStatus | null
  declutter_note: string | null
  metadata: Record<string, string | number | null>
  tags: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface HobbyItem {
  id: string
  name: string
  description: string | null
  category: string
  image_url: string | null
  purchase_price: number | null
  purchase_date: string | null
  status: 'draft' | 'verified'
  created_at: string
}

export interface HobbyActivity {
  id: string
  user_id: string
  hobby: string
  note: string | null
  location: string | null
  activity_at: string
  created_at: string
}

export interface HobbyPhoto {
  id: string
  user_id: string
  hobby: string
  image_url: string
  note: string | null
  created_at: string
}
