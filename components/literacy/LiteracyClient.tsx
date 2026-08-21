'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { HobbyItem, BookProgress, BookStatus } from '@/lib/types'
import { updateBookNote, upsertBookProgress } from '@/app/actions'

const C = {
  bg: 'var(--background)', card: 'var(--card)',
  ink: 'var(--foreground)', muted: 'var(--muted-foreground)',
  border: 'var(--border)',
}
const DP = 'var(--font-sans), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

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

export function LiteracyClient({ user, books, progressMap: initialMap }: Props) {
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
    <div style={{ background: C.bg, height: '100dvh', overflowY: 'auto', fontFamily: UI, color: C.ink }}>

      {/* ── Header ── */}
      <div style={{
        padding: 'calc(14px + env(safe-area-inset-top,0px)) 14px 10px',
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(250,250,250,0.95)', backdropFilter: 'blur(12px)',
      }}>
        <IconBtn onClick={() => router.push('/reading')}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </IconBtn>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>
            Library
          </h1>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.muted }}>
            {books.length} books
          </span>
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{ padding: '10px 14px 60px' }}>
        {books.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: C.muted }}>
            <div style={{
              width: 60, height: 60, borderRadius: 22, background: C.card,
              boxShadow: '0 6px 18px rgba(84,62,32,.08)',
              display: 'grid', placeItems: 'center', margin: '0 auto 14px', fontSize: 26,
            }}>📚</div>
            <b style={{ display: 'block', color: C.ink, fontFamily: DP, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              No books yet
            </b>
            <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
              Add books via the Reading page
            </p>
          </div>
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

      {/* ── Details sheet ── */}
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
    <div style={{
      background: C.card, borderRadius: 22,
      boxShadow: '0 4px 14px rgba(84,62,32,.07)',
      overflow: 'hidden', marginBottom: 11, breakInside: 'avoid',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Cover */}
      <div style={{
        aspectRatio: '3/4', background: book.image_url
          ? undefined
          : 'linear-gradient(150deg,#FFF0DC,#FFDFC2)',
        display: 'grid', placeItems: 'center', fontSize: 40,
        position: 'relative', overflow: 'hidden',
      }}>
        {book.image_url
          ? <img src={book.image_url} alt={book.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '📖'
        }

        {/* Status badge */}
        <span style={{
          position: 'absolute', top: 9, right: 9,
          fontSize: 9.5, fontWeight: 800, padding: '3px 8px', borderRadius: 99,
          background: statusDef.color + 'dd', color: '#fff',
          backdropFilter: 'blur(4px)',
        }}>
          {statusDef.label}
        </span>

      </div>

      {/* Info */}
      <div style={{ padding: '10px 11px 11px' }}>
        <b style={{
          display: 'block', fontFamily: DP, fontSize: 13, fontWeight: 700,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: C.ink, marginBottom: 2,
        }}>
          {book.name}
        </b>
        {book.description && (
          <span style={{
            display: 'block', fontSize: 10.5, color: C.muted, fontWeight: 500,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: 8,
          }}>
            {book.description}
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <CircularProgress value={progress} color={statusDef.color} size={36} />
          <button
            onClick={onDetails}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10, border: 'none',
              background: C.ink, color: '#FAFAFA',
              fontFamily: UI, fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
            }}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Circular Progress ──────────────────────────────────────────────────────

function CircularProgress({ value, color, size }: { value: number; color: string; size: number }) {
  const r = (size - 5) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)',
      display: 'grid', placeItems: 'center', position: 'relative',
    }}>
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={3.5} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={3.5}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s' }}
        />
      </svg>
      <span style={{ fontSize: 8.5, fontWeight: 800, color: C.ink, zIndex: 1 }}>{value}%</span>
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
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', background: C.bg,
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px calc(28px + env(safe-area-inset-bottom,0px))',
          maxHeight: '88dvh', overflowY: 'auto',
        }}
      >
        {/* Sheet header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 70, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
            background: 'linear-gradient(150deg,#FFF0DC,#FFDFC2)',
            display: 'grid', placeItems: 'center', fontSize: 24,
          }}>
            {book.image_url
              ? <img src={book.image_url} alt={book.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '📖'
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontFamily: DP, fontSize: 16, fontWeight: 800, display: 'block', marginBottom: 2 }}>{book.name}</b>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CircularProgress value={draftProgress} color={statusDef.color} size={32} />
              <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>{draftProgress}% complete</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 20, padding: 0 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status */}
          <div>
            <Label>Status</Label>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {STATUS_OPTS.map(s => (
                <button
                  key={s.value}
                  onClick={() => onStatusChange(s.value)}
                  style={{
                    flex: 1, border: 'none', cursor: 'pointer',
                    padding: '9px 0', borderRadius: 10, fontFamily: UI,
                    fontSize: 12, fontWeight: 700,
                    background: draftStatus === s.value ? s.color : C.card,
                    color: draftStatus === s.value ? '#fff' : C.muted,
                    transition: 'all 0.15s',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div>
            <Label>Progress</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <input
                type="range" min={0} max={100} value={draftProgress}
                onChange={e => onProgressChange(Number(e.target.value))}
                style={{ flex: 1, accentColor: statusDef.color }}
              />
              <input
                type="number" min={0} max={100} value={draftProgress}
                onChange={e => onProgressChange(Math.min(100, Math.max(0, Number(e.target.value))))}
                style={{
                  width: 52, padding: '6px 8px', borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  background: C.bg, color: C.ink, fontFamily: UI,
                  fontSize: 13, fontWeight: 700, textAlign: 'center',
                }}
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <Label>Note</Label>
            <textarea
              value={draftNote}
              onChange={e => onNoteChange(e.target.value)}
              placeholder="Thoughts, quotes, bookmarks…"
              rows={4}
              style={{
                width: '100%', marginTop: 6, padding: '10px 12px',
                borderRadius: 12, border: `1px solid ${C.border}`,
                background: C.card, color: C.ink, fontFamily: UI,
                fontSize: 13, resize: 'none', lineHeight: 1.5,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {saveError && (
            <p style={{ margin: 0, fontSize: 12.5, color: '#DC2626', background: '#FEE2E2', padding: '8px 12px', borderRadius: 10 }}>
              {saveError}
            </p>
          )}

          <button
            onClick={onSave}
            disabled={saving}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 14, border: 'none',
              background: C.ink, color: '#FAFAFA',
              fontFamily: UI, fontSize: 14, fontWeight: 800,
              cursor: 'pointer', opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </span>
  )
}

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      width: 42, height: 42, borderRadius: 16, border: 'none',
      background: C.card, color: C.ink, cursor: 'pointer',
      display: 'grid', placeItems: 'center',
      boxShadow: '0 6px 18px rgba(84,62,32,.08)', flexShrink: 0,
    }}>
      {children}
    </button>
  )
}
