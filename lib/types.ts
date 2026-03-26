export const CATEGORIES = [
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'dress', label: 'Dress' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
] as const

export const COLORS = [
  { value: 'black', label: 'Black', hex: '#111111' },
  { value: 'white', label: 'White', hex: '#F5F5F5' },
  { value: 'gray', label: 'Gray', hex: '#808080' },
  { value: 'red', label: 'Red', hex: '#EF4444' },
  { value: 'blue', label: 'Blue', hex: '#3B82F6' },
  { value: 'green', label: 'Green', hex: '#22C55E' },
  { value: 'yellow', label: 'Yellow', hex: '#EAB308' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'purple', label: 'Purple', hex: '#A855F7' },
  { value: 'brown', label: 'Brown', hex: '#92400E' },
  { value: 'beige', label: 'Beige', hex: '#D2B48C' },
  { value: 'orange', label: 'Orange', hex: '#F97316' },
] as const

export type Category = typeof CATEGORIES[number]['value']
export type Color = typeof COLORS[number]['value']

export interface WardrobeItem {
  id: string
  user_id: string
  name: string
  category: Category
  color: Color
  image_url: string
  original_image_url: string | null
  created_at: string
  updated_at: string
}

export interface PlanEntry {
  id: string
  user_id: string
  item_id: string
  planned_date: string
  wardrobe_items: WardrobeItem
}
