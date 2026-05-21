'use client'

import { useRef, useTransition } from 'react'
import { X } from 'lucide-react'
import { createWardrobe, updateWardrobe } from '@/app/actions'
import type { Wardrobe } from '@/lib/types'

interface WardrobeFormModalProps {
  wardrobe?: Wardrobe | null
  onClose: () => void
}

const inputCls = 'w-full bg-muted border border-border text-foreground rounded-xl px-4 py-3 text-base outline-none focus:border-primary transition-colors placeholder:text-muted-foreground'

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
    <div className="fixed inset-0 z-50 bg-black/70" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto border-t border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3" />
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </button>

        <div className="p-5 pt-6">
          <h2 className="text-foreground font-bold text-lg mb-5">
            {wardrobe ? 'Edit Wardrobe' : 'New Wardrobe'}
          </h2>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-muted-foreground text-xs mb-1.5">Code *</label>
              <input
                name="code"
                defaultValue={wardrobe?.code ?? ''}
                placeholder="e.g. WRD-01"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-muted-foreground text-xs mb-1.5">Name *</label>
              <input
                name="name"
                defaultValue={wardrobe?.name ?? ''}
                placeholder="e.g. Main Closet"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-muted-foreground text-xs mb-1.5">Description</label>
              <textarea
                name="description"
                defaultValue={wardrobe?.description ?? ''}
                placeholder="Optional notes about this storage location"
                rows={3}
                className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-3 text-base outline-none focus:border-primary transition-colors placeholder:text-muted-foreground resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {isPending ? 'Saving...' : wardrobe ? 'Save Changes' : 'Create Wardrobe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
