'use client'

import { useTransition } from 'react'
import { X, Trash2 } from 'lucide-react'
import { deleteItem } from '@/app/actions'
import { CATEGORIES, COLORS, type WardrobeItem } from '@/lib/types'

interface ItemDetailModalProps {
  item: WardrobeItem | null
  onClose: () => void
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const [isPending, startTransition] = useTransition()

  if (!item) return null

  const categoryLabel = CATEGORIES.find(c => c.value === item.category)?.label ?? item.category
  const colorInfo = COLORS.find(c => c.value === item.color)

  function handleDelete() {
    startTransition(async () => {
      await deleteItem(item!.id)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 bg-[#0F0F0F] rounded-t-3xl max-h-[88vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-3" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#555555] hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Image */}
        <div className="mx-4 mt-4 aspect-square rounded-2xl overflow-hidden bg-[#1A1A1A]">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          <h2 className="text-white font-bold text-xl">{item.name}</h2>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#888888] text-xs px-3 py-1 rounded-full">
              {categoryLabel}
            </span>
            {colorInfo && (
              <div className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1 rounded-full">
                <div
                  className="w-3 h-3 rounded-full border border-[#3A3A3A]"
                  style={{ backgroundColor: colorInfo.hex }}
                />
                <span className="text-[#888888] text-xs">{colorInfo.label}</span>
              </div>
            )}
          </div>

          <p className="text-[#444444] text-xs">
            Added{' '}
            {new Date(item.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <button
            onClick={handleDelete}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 font-medium py-3.5 rounded-xl text-sm disabled:opacity-40 transition-opacity hover:bg-red-500/15"
          >
            <Trash2 size={16} />
            {isPending ? 'Deleting...' : 'Delete Item'}
          </button>
        </div>
      </div>
    </div>
  )
}
