'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { HobbyItem, BookProgress, BookStatus } from '@/lib/types'
import { updateBookNote, upsertBookProgress } from '@/app/actions'

const C = {
  bg: 'var(--background)', card: 'var(--card)',
  ink: 'var(--foreground)', muted: 'var(--muted-foreground)',
  border: 'var(--border)',
}
const DP = 'var(--font-bricolage), system-ui, sans-serif'
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
  const [pMap, setPMap]           = useState(initialMap)
  const [expandedId, setExpanded] = useState<string | null>(null)
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

  function openBook(book: HobbyItem) {
    if (expandedId === book.id) { setExpanded(null); return }
    setExpanded(book.id)
    setDraftNote(book.description ?? '')
    setDraftProgress(getProgress(book))
    setDraftStatus(getStatus(book))
  }

  async function handleSave(book: HobbyItem) {
    setSaving(true)
    setSaveError(null)

    const [r1, r2] = await Promise.all([
      updateBookNote(book.id, draftNote),
      upsertBookProgress(book.id, draftProgress, draftStatus),
    ])

    setSaving(false)

    const err = r1.error ?? r2.error ?? null
    if (err) {
      setSaveError(err)
      return
    }

    setPMap(prev => ({
      ...prev,
      [book.id]: {
        ...(prev[book.id] ?? { id: '', user_id: '', hobby_item_id: book.id, created_at: '', updated_at: '' }),
        progress: draftProgress,
        status: draftStatus,
      },
    }))
    setExpanded(null)
    router.refresh()
  }

  const reading = books.filter(b => getStatus(b) === 'reading')
  const unread  = books.filter(b => getStatus(b) === 'unread')
  const done    = books.filter(b => getStatus(b) === 'done')

  return (
    <div style={{ background: C.bg, height: '100dvh', overflowY: 'auto', fontFamily: UI, color: C.ink }}>

      {/* ── Header ── */}
      <div style={{
        padding: 'calc(14px + env(safe-area-inset-top,0px)) 14px 10px',
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'sticky', top: 0, zIndex: 10,
        background: '#FDF7EEf5', backdropFilter: 'blur(12px)',
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
            {books.length} books · {reading.length} reading
          </span>
        </div>
      </div>

      {/* ── Book list ── */}
      <div style={{ padding: '10px 14px 60px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {books.length === 0 && (
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
        )}

        {([
          { label: 'Currently Reading', items: reading },
          { label: 'Want to Read',      items: unread  },
          { label: 'Finished',          items: done    },
        ] as const).map(({ label, items }) => items.length > 0 && (
          <div key={label}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: C.muted,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '4px 4px 8px',
            }}>
              {label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  progress={getProgress(book)}
                  status={getStatus(book)}
                  expanded={expandedId === book.id}
                  draftNote={expandedId === book.id ? draftNote : (book.description ?? '')}
                  draftProgress={expandedId === book.id ? draftProgress : getProgress(book)}
                  draftStatus={expandedId === book.id ? draftStatus : getStatus(book)}
                  saving={saving}
                  saveError={expandedId === book.id ? saveError : null}
                  user={user}
                  onToggle={() => { setSaveError(null); openBook(book) }}
                  onNoteChange={setDraftNote}
                  onProgressChange={(v) => {
                    setDraftProgress(v)
                    if (v === 100) setDraftStatus('done')
                    else if (v > 0 && draftStatus === 'unread') setDraftStatus('reading')
                  }}
                  onStatusChange={setDraftStatus}
                  onSave={() => handleSave(book)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Book Card ──────────────────────────────────────────────────────────────

interface CardProps {
  book: HobbyItem
  progress: number
  status: BookStatus
  expanded: boolean
  draftNote: string
  draftProgress: number
  draftStatus: BookStatus
  saving: boolean
  saveError: string | null
  user: User | null
  onToggle: () => void
  onNoteChange: (v: string) => void
  onProgressChange: (v: number) => void
  onStatusChange: (v: BookStatus) => void
  onSave: () => void
}

function BookCard({
  book, progress, status, expanded,
  draftNote, draftProgress, draftStatus, saving, saveError, user,
  onToggle, onNoteChange, onProgressChange, onStatusChange, onSave,
}: CardProps) {
  const statusDef = STATUS_OPTS.find(s => s.value === status)!

  return (
    <div style={{
      background: C.card, borderRadius: 20,
      boxShadow: '0 4px 14px rgba(84,62,32,.07)',
      overflow: 'hidden',
    }}>
      {/* Main row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', border: 'none', background: 'transparent',
          cursor: 'pointer', padding: '14px 16px', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 12,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* Cover / emoji */}
        <div style={{
          width: 48, height: 64, borderRadius: 8, flexShrink: 0,
          background: book.image_url ? undefined : 'linear-gradient(150deg,#FFF0DC,#FFDFC2)',
          overflow: 'hidden', display: 'grid', placeItems: 'center', fontSize: 22,
        }}>
          {book.image_url
            ? <img src={book.image_url} alt={book.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '📖'
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <b style={{
              fontFamily: DP, fontSize: 14, fontWeight: 700,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
              color: C.ink,
            }}>
              {book.name}
            </b>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, flexShrink: 0,
              background: statusDef.color + '22', color: statusDef.color,
            }}>
              {statusDef.label}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, borderRadius: 99, background: '#E2E8F0', overflow: 'hidden', marginBottom: 4 }}>
            <div style={{
              height: '100%', borderRadius: 99, width: `${progress}%`,
              background: status === 'done' ? '#22C55E' : '#F97316',
              transition: 'width 0.3s',
            }} />
          </div>

          <span style={{ fontSize: 10.5, fontWeight: 600, color: C.muted }}>
            {progress}%
            {book.description && (
              <> · <span style={{ opacity: 0.8 }}>{book.description.slice(0, 50)}{book.description.length > 50 ? '…' : ''}</span></>
            )}
          </span>
        </div>

        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Expanded editor */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Status selector */}
            <div>
              <Label>Status</Label>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {STATUS_OPTS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => onStatusChange(s.value)}
                    style={{
                      flex: 1, border: 'none', cursor: 'pointer',
                      padding: '8px 0', borderRadius: 10, fontFamily: UI,
                      fontSize: 12, fontWeight: 700,
                      background: draftStatus === s.value ? s.color : C.bg,
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
              <Label>Progress — <b style={{ color: C.ink }}>{draftProgress}%</b></Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <input
                  type="range" min={0} max={100} value={draftProgress}
                  onChange={e => onProgressChange(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#F97316' }}
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
                rows={3}
                style={{
                  width: '100%', marginTop: 6, padding: '10px 12px',
                  borderRadius: 12, border: `1px solid ${C.border}`,
                  background: C.bg, color: C.ink, fontFamily: UI,
                  fontSize: 13, resize: 'vertical', lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {saveError && (
              <p style={{ margin: 0, fontSize: 12.5, color: '#DC2626', background: '#FEE2E2', padding: '8px 12px', borderRadius: 10 }}>
                {saveError}
              </p>
            )}

            {/* Save */}
            <button
              onClick={onSave}
              disabled={saving}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 12, border: 'none',
                background: C.ink, color: '#FFF7EC',
                fontFamily: UI, fontSize: 13, fontWeight: 800,
                cursor: 'pointer', opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 11.5, fontWeight: 700, color: C.muted,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {children}
    </span>
  )
}

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 42, height: 42, borderRadius: 16, border: 'none',
        background: C.card, color: C.ink, cursor: 'pointer',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 6px 18px rgba(84,62,32,.08)', flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}
