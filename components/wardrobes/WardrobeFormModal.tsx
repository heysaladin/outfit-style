'use client'

import { useRef, useTransition } from 'react'
import { X } from 'lucide-react'
import { createWardrobe, updateWardrobe } from '@/app/actions'
import type { Wardrobe } from '@/lib/types'

interface WardrobeFormModalProps {
  wardrobe?: Wardrobe | null
  onClose: () => void
}

export function WardrobeFormModal({ wardrobe, onClose }: WardrobeFormModalProps) {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = wardrobe
        ? await updateWardrobe(wardrobe.id, formData)
        : await createWardrobe(formData)
      if (!result.error) onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 bg-[#0F0F0F] rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mt-3" />
        <button onClick={onClose} className="absolute top-4 right-4 text-[#555555] hover:text-white">
          <X size={20} />
        </button>

        <div className="p-5 pt-6">
          <h2 className="text-white font-bold text-lg mb-5">
            {wardrobe ? 'Edit Wardrobe' : 'New Wardrobe'}
          </h2>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#888888] text-xs mb-1.5">Code *</label>
              <input
                name="code"
                defaultValue={wardrobe?.code ?? ''}
                placeholder="e.g. WRD-01"
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#3A3A3A] placeholder:text-[#444444]"
              />
            </div>

            <div>
              <label className="block text-[#888888] text-xs mb-1.5">Name *</label>
              <input
                name="name"
                defaultValue={wardrobe?.name ?? ''}
                placeholder="e.g. Main Closet"
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#3A3A3A] placeholder:text-[#444444]"
              />
            </div>

            <div>
              <label className="block text-[#888888] text-xs mb-1.5">Description</label>
              <textarea
                name="description"
                defaultValue={wardrobe?.description ?? ''}
                placeholder="Optional notes about this storage location"
                rows={3}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#3A3A3A] placeholder:text-[#444444] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40"
            >
              {isPending ? 'Saving...' : wardrobe ? 'Save Changes' : 'Create Wardrobe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
