'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Package2, Archive, ChevronLeft, GripVertical } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { deleteWardrobe } from '@/app/actions'
import { WardrobeFormModal } from './WardrobeFormModal'
import { BottomNav } from '@/components/BottomNav'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { getCategoryDef } from '@/lib/types'
import type { Wardrobe, WardrobeItem } from '@/lib/types'

type SlimItem = Pick<WardrobeItem, 'id' | 'name' | 'image_url' | 'category' | 'color' | 'wardrobe_id' | 'wear_count'>

const LS_KEY = 'wardrobes-order'

function getSavedOrder(ids: string[]): string[] {
  try {
    const saved: string[] = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
    const savedFiltered = saved.filter(id => ids.includes(id))
    const missing = ids.filter(id => !savedFiltered.includes(id))
    return [...savedFiltered, ...missing]
  } catch { return ids }
}

interface WardrobesClientProps {
  wardrobes: Wardrobe[]
  items: SlimItem[]
}

export function WardrobesClient({ wardrobes, items }: WardrobesClientProps) {
  const [order, setOrder]           = useState<string[]>(wardrobes.map(w => w.id))
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState<Wardrobe | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setOrder(getSavedOrder(wardrobes.map(w => w.id)))
  }, [wardrobes])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setOrder(prev => {
      const next = arrayMove(prev, prev.indexOf(String(active.id)), prev.indexOf(String(over.id)))
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }

  const sorted = order.map(id => wardrobes.find(w => w.id === id)).filter(Boolean) as Wardrobe[]
  const unassigned = items.filter(i => !i.wardrobe_id)

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(w: Wardrobe) { setEditing(w); setModalOpen(true) }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      await deleteWardrobe(id)
      setDeletingId(null)
    })
  }

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-24">
      <div
        className="bg-neutral-950 rounded-b-[28px] px-3 pb-[58px] flex flex-col"
        style={{ paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="h-9 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <Link
              href="/fashion"
              aria-label="Back to Interestory"
              className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-200 shrink-0"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </Link>
            <span className="text-xl font-semibold tracking-tight text-[#EEF040]">ofit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={openCreate}
              title="Add"
              aria-label="New wardrobe"
              className="w-9 h-9 rounded-full bg-[#EEF040] text-neutral-950 flex items-center justify-center shrink-0"
            >
              <Plus size={16} strokeWidth={2} />
            </button>
            <UserAvatarMenu buttonClassName="relative w-9 h-9 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0" />
          </div>
        </div>

        <div className="pt-7 px-2 flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[1.5px] text-neutral-400">{wardrobes.length} closet{wardrobes.length !== 1 ? 's' : ''}</p>
          <h1 className="text-[30px] leading-[30px] tracking-[-1px] font-semibold text-neutral-50">Wardrobes</h1>
        </div>
      </div>

      <div className="-mt-[34px] mx-3 relative bg-neutral-800 rounded-xl px-4 py-3.5 grid grid-cols-3 gap-3 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
        {[
          { label: 'Items', value: items.length },
          { label: 'Wardrobes', value: wardrobes.length },
          { label: 'Unassigned', value: unassigned.length },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col gap-0.5 min-w-0">
            <span className="text-2xl font-semibold tracking-[-0.5px] font-mono text-neutral-50">{stat.value}</span>
            <span className="text-xs text-neutral-400 truncate">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="px-5 pt-7 pb-3 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-foreground">All wardrobes</h2>
      </div>

      <div className="px-5 pb-4 flex flex-col gap-3">
        {wardrobes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <Package2 size={40} className="text-border mb-3" />
            <p className="text-foreground font-semibold">No closets yet</p>
            <p className="text-muted-foreground text-sm mt-1">Tap + to add your first closet</p>
          </div>
        ) : (
          <DndContext id="wardrobes-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              {sorted.map(w => (
                <SortableWardrobe
                  key={w.id}
                  wardrobe={w}
                  items={items.filter(i => i.wardrobe_id === w.id)}
                  onEdit={() => openEdit(w)}
                  onDelete={() => handleDelete(w.id)}
                  deleting={isPending && deletingId === w.id}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {unassigned.length > 0 && wardrobes.length > 0 && (
          <div className="border border-dashed border-border rounded-xl p-4">
            <p className="text-muted-foreground text-xs font-medium">Unassigned — {unassigned.length} item{unassigned.length !== 1 ? 's' : ''}</p>
            <p className="text-muted-foreground/50 text-xs mt-0.5">Assign these from each item's detail view</p>
          </div>
        )}
      </div>

      <BottomNav />

      {modalOpen && (
        <WardrobeFormModal wardrobe={editing} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}

function SortableWardrobe({ wardrobe: w, items, onEdit, onDelete, deleting }: {
  wardrobe: Wardrobe
  items: SlimItem[]
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: w.id })

  const preview = [...items].sort((a, b) => a.wear_count - b.wear_count).slice(0, 4)
  const overflow = items.length - preview.length

  const categoryTags = (() => {
    const counts = new Map<string, number>()
    for (const i of items) counts.set(i.category, (counts.get(i.category) ?? 0) + 1)
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, count]) => ({ label: getCategoryDef(cat)?.label ?? cat, count }))
  })()

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="border border-border rounded-xl p-4 flex flex-col gap-3.5"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes} {...listeners}
          className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
        >
          <GripVertical size={14} />
        </button>
        <div className="w-10 h-10 rounded-lg bg-neutral-950 text-[#EEF040] flex items-center justify-center shrink-0">
          <Archive size={18} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <p className="text-base font-semibold text-foreground truncate leading-tight">{w.name}</p>
          {w.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{w.description}</p>}
        </div>
        <span className="text-sm font-mono text-foreground shrink-0">{items.length}</span>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={onEdit} aria-label="Edit wardrobe" className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <Pencil size={13} />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button onClick={() => { onDelete(); setConfirmDelete(false) }} disabled={deleting} className="text-[11px] font-bold text-destructive px-2 py-1 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors disabled:opacity-40">
                Delete
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-[11px] font-bold text-muted-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} aria-label="Delete wardrobe" className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {preview.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {preview.map(item => (
            <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-muted border border-border relative">
              <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 25vw, 12vw" />
            </div>
          ))}
          {overflow > 0 && (
            <div className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center text-xs font-mono text-muted-foreground">
              +{overflow}
            </div>
          )}
        </div>
      )}

      {categoryTags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {categoryTags.map(t => (
            <span key={t.label} className="h-6 px-2.5 rounded-full border border-border text-xs text-neutral-600 flex items-center">
              {t.label} {t.count}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
