'use client'

import { useState, useTransition, useEffect } from 'react'
import { Plus, Pencil, Trash2, Package2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
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
  const [expanded, setExpanded]     = useState<string | null>(null)
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
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-foreground font-bold text-lg">Closet</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="h-8 px-3 rounded-full bg-foreground flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Plus size={13} className="text-background" strokeWidth={2.5} />
            <span className="text-background text-[11px] font-bold">New</span>
          </button>
          <UserAvatarMenu />
        </div>
      </header>

      <div className="px-4 pt-4 space-y-3">
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
                  expanded={expanded === w.id}
                  onToggleExpand={() => setExpanded(prev => prev === w.id ? null : w.id)}
                  onEdit={() => openEdit(w)}
                  onDelete={() => handleDelete(w.id)}
                  deleting={isPending && deletingId === w.id}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {unassigned.length > 0 && wardrobes.length > 0 && (
          <div className="bg-card border border-dashed border-border rounded-2xl p-4">
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

function SortableWardrobe({ wardrobe: w, items, expanded, onToggleExpand, onEdit, onDelete, deleting }: {
  wardrobe: Wardrobe
  items: SlimItem[]
  expanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: w.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            {...attributes} {...listeners}
            className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none p-0.5 -ml-1"
          >
            <GripVertical size={16} />
          </button>
          <span className="bg-muted border border-border text-muted-foreground text-xs font-mono px-2 py-0.5 rounded-lg mt-0.5">
            {w.code}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-semibold text-sm">{w.name}</p>
            {w.description && (
              <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{w.description}</p>
            )}
            <p className="text-muted-foreground/50 text-xs mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onEdit} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Pencil size={14} />
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
              <button onClick={() => setConfirmDelete(true)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={onToggleExpand}
            className="mt-3 flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? 'Hide items' : 'Show items'}
          </button>
        )}
      </div>

      {expanded && items.length > 0 && (
        <div className="border-t border-border px-4 py-3 grid grid-cols-3 gap-2">
          {[...items].sort((a, b) => a.wear_count - b.wear_count).map(item => (
            <div key={item.id} className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
