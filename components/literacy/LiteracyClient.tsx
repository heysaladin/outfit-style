'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { HobbyItem, BookProgress, BookStatus } from '@/lib/types'
import { updateBookNote, upsertBookProgress } from '@/app/actions'
import { MobileButton } from '@/components/ui/mobile-shims'
import { MobileFormField } from '@/components/ui/mobile-shims'
import { MobileEmptyState } from '@/components/ui/mobile-shims'
import { ProgressRing } from '@/components/ui/mobile-shims'
import { SegmentedControl } from '@/components/ui/mobile-shims'

const STATUS_OPTS: { value: BookStatus; label: string; color: string }[] = [
  { value: 'unread',  label: 'Unread',  color: '#94A3B8' },
  { value: 'reading', label: 'Reading', color: '#F97316' },
  { value: 'done',    label: 'Done',    color: '#22C55E' },
]

interface Props {
  user: User | null
  books: HobbyItem[]
  progressMap: Record<string, BookProgress>
}

export function LiteracyClient({ user: _user, books, progressMap: initialMap }: Props) {
  const router = useRouter()
  const [pMap, setPMap]         = useState(initialMap)
  const [selected, setSelected] = useState<HobbyItem | null>(null)
  const [draftNote, setDraftNote]         = useState('')
  const [draftProgress, setDraftProgress] = useState(0)
  const [draftStatus, setDraftStatus]     = useState<BookStatus>('unread')
  const [saving, setSaving]               = useState(false)
  const [saveError, setSaveError]         = useState<string | null>(null)

  function getStatus(book: HobbyItem): BookStatus {
    return (pMap[book.id]?.status as BookStatus) ?? 'unread'
  }
  function getProgress(book: HobbyItem): number {
    return pMap[book.id]?.progress ?? 0
  }

  function openDetails(book: HobbyItem) {
    setSelected(book)
    setDraftNote(book.description ?? '')
    setDraftProgress(getProgress(book))
    setDraftStatus(getStatus(book))
    setSaveError(null)
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    setSaveError(null)

    const [r1, r2] = await Promise.all([
      updateBookNote(selected.id, draftNote),
      upsertBookProgress(selected.id, draftProgress, draftStatus),
    ])

    setSaving(false)
    const err = r1.error ?? r2.error ?? null
    if (err) { setSaveError(err); return }

    setPMap(prev => ({
      ...prev,
      [selected.id]: {
        ...(prev[selected.id] ?? { id: '', user_id: '', hobby_item_id: selected.id, created_at: '', updated_at: '' }),
        progress: draftProgress,
        status: draftStatus,
      },
    }))
    setSelected(null)
    router.refresh()
  }

  return (
    <div className="bg-background h-dvh overflow-y-auto text-foreground">

      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-2.5 px-3.5 pb-2.5 bg-background/95 backdrop-blur-sm border-b border-border"
        style={{ paddingTop: 'calc(14px + env(safe-area-inset-top,0px))' }}
      >
        <MobileButton
          variant="ghost" size="sm"
          icon={<ChevronLeft size={18} />}
          onClick={() => router.push('/reading')}
          className="w-9 h-9 rounded-xl p-0 justify-center"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight leading-none">Library</h1>
          <span className="text-[11.5px] font-semibold text-muted-foreground">{books.length} books</span>
        </div>
      </header>

      {/* Grid */}
      <div className="px-3.5 pt-2.5 pb-16">
        {books.length === 0 ? (
          <MobileEmptyState
            icon={<span className="text-4xl">📚</span>}
            title="No books yet"
            description="Add books via the Reading page"
          />
        ) : (
          <div style={{ columns: 2, columnGap: 11 }}>
            {books.map(book => (
              <BookCard
                key={book.id}
                book={book}
                progress={getProgress(book)}
                status={getStatus(book)}
                onDetails={() => openDetails(book)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details sheet */}
      {selected && (
        <DetailsSheet
          book={selected}
          draftNote={draftNote}
          draftProgress={draftProgress}
          draftStatus={draftStatus}
          saving={saving}
          saveError={saveError}
          onNoteChange={setDraftNote}
          onProgressChange={(v) => {
            setDraftProgress(v)
            if (v === 100) setDraftStatus('done')
            else if (v > 0 && draftStatus === 'unread') setDraftStatus('reading')
          }}
          onStatusChange={setDraftStatus}
          onSave={handleSave}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

// ── Book Card ──────────────────────────────────────────────────────────────

function BookCard({ book, progress, status, onDetails }: {
  book: HobbyItem
  progress: number
  status: BookStatus
  onDetails: () => void
}) {
  const statusDef = STATUS_OPTS.find(s => s.value === status)!

  return (
    <div className="bg-card rounded-2xl shadow-md overflow-hidden mb-3 break-inside-avoid flex flex-col">
      {/* Cover */}
      <div className="relative">
        {book.image_url ? (
          <img src={book.image_url} alt={book.name} className="w-full h-auto block" />
        ) : (
          <div className="h-32 flex items-center justify-center text-4xl bg-gradient-to-br from-[#FFF0DC] to-[#FFDFC2]">
            📖
          </div>
        )}
        <span
          className="absolute top-2 right-2 text-[9.5px] font-extrabold px-2 py-0.5 rounded-full text-white backdrop-blur-sm"
          style={{ background: statusDef.color + 'dd' }}
        >
          {statusDef.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <b className="block text-[13px] font-bold truncate text-foreground mb-0.5">{book.name}</b>
        {book.description && (
          <span className="block text-[10.5px] text-muted-foreground font-medium truncate mb-2">
            {book.description}
          </span>
        )}
        <div className="flex items-center gap-2 mt-1">
          <ProgressRing value={progress} size={36} strokeWidth={3.5} />
          <MobileButton
            size="sm" onClick={onDetails}
            className="flex-1 rounded-xl h-8 text-[11.5px] font-extrabold"
          >
            Details
          </MobileButton>
        </div>
      </div>
    </div>
  )
}

// ── Details Sheet ──────────────────────────────────────────────────────────

function DetailsSheet({ book, draftNote, draftProgress, draftStatus, saving, saveError,
  onNoteChange, onProgressChange, onStatusChange, onSave, onClose }: {
  book: HobbyItem
  draftNote: string
  draftProgress: number
  draftStatus: BookStatus
  saving: boolean
  saveError: string | null
  onNoteChange: (v: string) => void
  onProgressChange: (v: number) => void
  onStatusChange: (v: BookStatus) => void
  onSave: () => void
  onClose: () => void
}) {
  const statusDef = STATUS_OPTS.find(s => s.value === draftStatus)!

  return (
    <Sheet onClose={onClose}>
      {/* Book header */}
      <div className="flex items-start gap-3.5 mb-5">
        <div className="w-[52px] h-[70px] rounded-lg flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#FFF0DC] to-[#FFDFC2] flex items-center justify-center text-2xl">
          {book.image_url
            ? <img src={book.image_url} alt={book.name} className="w-full h-full object-cover" />
            : '📖'
          }
        </div>
        <div className="flex-1 min-w-0">
          <b className="block text-base font-extrabold mb-2">{book.name}</b>
          <div className="flex items-center gap-2">
            <ProgressRing value={draftProgress} size={36} strokeWidth={3.5} />
            <span className="text-[11.5px] text-muted-foreground font-semibold">{draftProgress}% complete</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
          <SegmentedControl
            segments={STATUS_OPTS.map(s => s.label)}
            value={statusDef.label}
            onChange={v => onStatusChange(STATUS_OPTS.find(s => s.label === v)!.value)}
          />
        </div>

        {/* Progress */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Progress</p>
          <div className="flex items-center gap-2.5">
            <input
              type="range" min={0} max={100} value={draftProgress}
              onChange={e => onProgressChange(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <input
              type="number" min={0} max={100} value={draftProgress}
              onChange={e => onProgressChange(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-14 px-2 py-1.5 rounded-xl border border-border bg-background text-foreground text-[13px] font-bold text-center outline-none"
            />
          </div>
        </div>

        {/* Note */}
        <MobileFormField
          label="Note"
          value={draftNote}
          onChange={onNoteChange}
          placeholder="Thoughts, quotes, bookmarks…"
          multiline
          rows={4}
        />

        {saveError && (
          <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-xl">{saveError}</p>
        )}

        <MobileButton fullWidth loading={saving} onClick={onSave} className="rounded-xl">
          Save
        </MobileButton>
      </div>
    </Sheet>
  )
}

// ── Sheet primitive (fixed, Cubicle-styled) ────────────────────────────────

function Sheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-background rounded-t-2xl max-h-[88dvh] overflow-y-auto shadow-2xl">
        <div className="mx-auto mt-2.5 mb-5 h-1 w-9 rounded-full bg-muted-foreground/30" />
        <div className="px-5" style={{ paddingBottom: 'calc(28px + env(safe-area-inset-bottom,0px))' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
