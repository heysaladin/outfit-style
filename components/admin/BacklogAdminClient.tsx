'use client'

import { useState } from 'react'
import { ExternalLink, ListTodo } from 'lucide-react'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { AdminNav } from '@/components/admin/AdminNav'
import type { ZopavoNote } from '@/app/admin/backlog/page'

const DOT_COLOR: Record<string, string> = {
  yellow: '#facc15', blue: '#3b82f6', purple: '#a855f7',
  green:  '#22c55e', orange: '#f97316', pink: '#ec4899', red: '#ef4444',
}

interface Props { notes: ZopavoNote[] }

export function BacklogAdminClient({ notes }: Props) {
  const [board, setBoard] = useState<string>('all')

  const boards  = ['all', ...Array.from(new Set(notes.map(n => n.boardId)))]
  const filtered = board === 'all' ? notes : notes.filter(n => n.boardId === board)
  const todo     = filtered.filter(n => !n.done)
  const done     = filtered.filter(n => n.done)

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

      <div className="px-4 py-4 space-y-6 max-w-2xl mx-auto">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ListTodo size={32} className="text-muted-foreground mb-3" />
            <p className="text-foreground font-medium text-sm">Kosong</p>
          </div>
        )}

        {todo.length > 0 && (
          <section>
            <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mb-2">
              Todo · {todo.length}
            </p>
            <ul className="space-y-2">
              {todo.map(n => <NoteRow key={n.id} note={n} />)}
            </ul>
          </section>
        )}

        {done.length > 0 && (
          <section>
            <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mb-2">
              Done · {done.length}
            </p>
            <ul className="space-y-2 opacity-50">
              {done.map(n => <NoteRow key={n.id} note={n} />)}
            </ul>
          </section>
        )}
      </div>

      <AdminNav />
    </div>
  )
}

function NoteRow({ note }: { note: ZopavoNote }) {
  return (
    <li className="flex items-start gap-3 bg-card border border-border rounded-2xl px-3 py-3">
      <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: DOT_COLOR[note.color] ?? '#888' }} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium whitespace-pre-line ${note.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {note.content}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground">{note.boardId}</span>
          {note.workingOnBy && (
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">
              {note.workingOnBy}
            </span>
          )}
        </div>
      </div>
    </li>
  )
}
