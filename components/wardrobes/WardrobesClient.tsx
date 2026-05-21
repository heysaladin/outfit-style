'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Package2, ChevronDown, ChevronUp } from 'lucide-react'
import { deleteWardrobe } from '@/app/actions'
import { WardrobeFormModal } from './WardrobeFormModal'
import { BottomNav } from '@/components/BottomNav'
import type { Wardrobe, WardrobeItem } from '@/lib/types'

type SlimItem = Pick<WardrobeItem, 'id' | 'name' | 'image_url' | 'category' | 'color' | 'wardrobe_id'>

interface WardrobesClientProps {
  wardrobes: Wardrobe[]
  items: SlimItem[]
}

export function WardrobesClient({ wardrobes, items }: WardrobesClientProps) {
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState<Wardrobe | null>(null)
  const [expanded, setExpanded]       = useState<string | null>(null)
  const [isPending, startTransition]  = useTransition()
  const [deletingId, setDeletingId]   = useState<string | null>(null)

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(w: Wardrobe) { setEditing(w); setModalOpen(true) }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      await deleteWardrobe(id)
      setDeletingId(null)
    })
  }

  function toggleExpand(id: string) {
    setExpanded(prev => prev === id ? null : id)
  }

  const unassigned = items.filter(i => !i.wardrobe_id)

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <h1 className="text-foreground font-bold text-lg">Wardrobes</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Physical storage locations for your clothes</p>
      </header>

      <div className="px-4 pt-4 space-y-3">
        {wardrobes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <Package2 size={40} className="text-border mb-3" />
            <p className="text-foreground font-semibold">No wardrobes yet</p>
            <p className="text-muted-foreground text-sm mt-1">Tap + to add your first storage location</p>
          </div>
        ) : (
          wardrobes.map(w => {
            const wItems = items.filter(i => i.wardrobe_id === w.id)
            const isExpanded = expanded === w.id
            return (
              <div key={w.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-muted border border-border text-muted-foreground text-xs font-mono px-2 py-0.5 rounded-lg mt-0.5">
                      {w.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-semibold text-sm">{w.name}</p>
                      {w.description && (
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{w.description}</p>
                      )}
                      <p className="text-muted-foreground/50 text-xs mt-1">{wItems.length} item{wItems.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(w)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        disabled={isPending && deletingId === w.id}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {wItems.length > 0 && (
                    <button
                      onClick={() => toggleExpand(w.id)}
                      className="mt-3 flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {isExpanded ? 'Hide items' : 'Show items'}
                    </button>
                  )}
                </div>

                {isExpanded && wItems.length > 0 && (
                  <div className="border-t border-border px-4 py-3 grid grid-cols-3 gap-2">
                    {wItems.map(item => (
                      <div key={item.id} className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}

        {unassigned.length > 0 && wardrobes.length > 0 && (
          <div className="bg-card border border-dashed border-border rounded-2xl p-4">
            <p className="text-muted-foreground text-xs font-medium">Unassigned — {unassigned.length} item{unassigned.length !== 1 ? 's' : ''}</p>
            <p className="text-muted-foreground/50 text-xs mt-0.5">Assign these from each item's detail view</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg z-20 hover:opacity-90 transition-opacity"
      >
        <Plus size={22} className="text-primary-foreground" />
      </button>

      <BottomNav />

      {modalOpen && (
        <WardrobeFormModal wardrobe={editing} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}
