'use client'

import { useState } from 'react'
import { ExternalLink, ListTodo, Pencil } from 'lucide-react'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { AdminNav } from '@/components/admin/AdminNav'
import type { ZopavoNote } from '@/app/admin/backlog/page'

const DOT_COLOR: Record<string, string> = {
  yellow: '#facc15', blue: '#3b82f6', purple: '#a855f7',
  green:  '#22c55e', orange: '#f97316', pink: '#ec4899', red: '#ef4444',
}

const COLOR_OPTIONS = ['yellow', 'blue', 'purple', 'green', 'orange', 'pink', 'red']

interface Props { notes: ZopavoNote[] }

export function BacklogAdminClient({ notes: initial }: Props) {
  const [notes, setNotes]       = useState<ZopavoNote[]>(initial)
  const [board, setBoard]       = useState<string>('all')
  const [editing, setEditing]   = useState<ZopavoNote | null>(null)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const boards   = ['all', ...Array.from(new Set(notes.map(n => n.boardId)))]
  const filtered = board === 'all' ? notes : notes.filter(n => n.boardId === board)
  const todo     = filtered.filter(n => !n.done)
  const done     = filtered.filter(n => n.done)

  async function handleSave() {
    if (!editing) return
    if (!editing.content.trim()) { setError('Content is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/backlog/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editing.content,
          color: editing.color,
          boardId: editing.boardId,
          workingOnBy: editing.workingOnBy,
          done: editing.done,
        }),
      })
      const text = await res.text()
      const json = text ? JSON.parse(text) : {}
      if (!res.ok) { setError(json.error ?? `Error ${res.status}`); return }
      setNotes(prev => prev.map(n => n.id === editing.id ? { ...n, ...editing } : n))
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-foreground font-bold text-lg">Zopavo Backlog</h1>
          <p className="text-muted-foreground text-xs">zopavo.vercel.app</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://zopavo.vercel.app" target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            <ExternalLink size={14} />
          </a>
          <UserAvatarMenu />
        </div>
      </header>

      <div className="flex gap-2 px-4 pt-4 overflow-x-auto pb-1 scrollbar-none">
        {boards.map(b => (
          <button key={b} onClick={() => setBoard(b)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              board === b
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
            }`}>
            {b === 'all' ? 'All' : b}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ListTodo size={32} className="text-muted-foreground mb-3" />
            <p className="text-foreground font-medium text-sm">Kosong</p>
          </div>
        ) : (
          <>
            {todo.length > 0 && (
              <section>
                <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider px-4 pt-4 pb-1">
                  Todo · {todo.length}
                </p>
                <ul className="divide-y divide-border">
                  {todo.map(n => (
                    <NoteRow key={n.id} note={n} onEdit={() => { setEditing({ ...n }); setError(null) }} />
                  ))}
                </ul>
              </section>
            )}
            {done.length > 0 && (
              <section className="opacity-50">
                <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider px-4 pt-4 pb-1">
                  Done · {done.length}
                </p>
                <ul className="divide-y divide-border">
                  {done.map(n => (
                    <NoteRow key={n.id} note={n} onEdit={() => { setEditing({ ...n }); setError(null) }} />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-background rounded-t-3xl sm:rounded-2xl border border-border shadow-xl overflow-hidden">
            <div className="px-4 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-foreground font-semibold text-sm">Edit Note</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground text-xs hover:text-foreground">
                Cancel
              </button>
            </div>

            <div className="px-4 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-muted-foreground text-[11px] font-medium">Content *</label>
                <textarea
                  rows={4}
                  className="w-full bg-muted text-foreground text-sm rounded-xl px-3 py-2 outline-none placeholder:text-muted-foreground resize-none"
                  value={editing.content}
                  onChange={e => setEditing(p => p && ({ ...p, content: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground text-[11px] font-medium">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={() => setEditing(p => p && ({ ...p, color: c }))}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${editing.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                      style={{ background: DOT_COLOR[c] }} />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground text-[11px] font-medium">Board</label>
                <input
                  className="w-full bg-muted text-foreground text-sm rounded-xl px-3 py-2 outline-none"
                  value={editing.boardId}
                  onChange={e => setEditing(p => p && ({ ...p, boardId: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground text-[11px] font-medium">Working on by</label>
                <input
                  className="w-full bg-muted text-foreground text-sm rounded-xl px-3 py-2 outline-none placeholder:text-muted-foreground"
                  placeholder="—"
                  value={editing.workingOnBy ?? ''}
                  onChange={e => setEditing(p => p && ({ ...p, workingOnBy: e.target.value || null }))}
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="done-check" checked={editing.done}
                  onChange={e => setEditing(p => p && ({ ...p, done: e.target.checked }))}
                  className="rounded" />
                <label htmlFor="done-check" className="text-foreground text-sm">Done</label>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>

            <div className="px-4 py-3 border-t border-border">
              <button onClick={handleSave} disabled={saving}
                className="w-full bg-foreground text-background text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminNav />
    </div>
  )
}

function NoteRow({ note, onEdit }: { note: ZopavoNote; onEdit: () => void }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group">
      <span className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: DOT_COLOR[note.color] ?? '#888' }} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm whitespace-pre-line ${note.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {note.content}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground">{note.boardId}</span>
          {note.workingOnBy && (
            <span className="text-[11px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">
              {note.workingOnBy}
            </span>
          )}
        </div>
      </div>
      <button onClick={onEdit}
        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground flex-shrink-0">
        <Pencil size={13} />
      </button>
    </li>
  )
}
