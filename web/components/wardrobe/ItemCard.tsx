import type { WardrobeItem } from '@/lib/types'

interface ItemCardProps {
  item: WardrobeItem
  onClick: () => void
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] group active:scale-95 transition-transform"
    >
      <img
        src={item.image_url}
        alt={item.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-6">
        <p className="text-white text-xs font-semibold truncate">{item.name}</p>
        <p className="text-[#888888] text-xs capitalize">{item.category}</p>
      </div>
    </button>
  )
}
