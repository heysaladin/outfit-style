'use client'

import { useState } from 'react'
import { Plus, MapPin, Clock, Trash2, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { HobbyActivity } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface ActivitiesTabProps {
  hobby: string
  activities: HobbyActivity[]
  user: User | null
}

function formatActivityDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatActivityTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function ActivitiesTab({ hobby, activities: initialActivities, user }: ActivitiesTabProps) {
  const [activities, setActivities] = useState(initialActivities)
  const [addOpen, setAddOpen]       = useState(false)
  const [note, setNote]             = useState('')
  const [location, setLocation]     = useState('')
  const [activityAt, setActivityAt] = useState(() => {
    const now = new Date()
    now.setSeconds(0, 0)
    return now.toISOString().slice(0, 16)
  })
  const [error, setError]   = useState('')
  const [isPending, setIsPending] = useState(false)

  function resetForm() {
    setNote('')
    setLocation('')
    const now = new Date(); now.setSeconds(0, 0)
    setActivityAt(now.toISOString().slice(0, 16))
    setError('')
  }

  async function handleAdd() {
    if (!note.trim()) return setError('Please add a note')
    setError('')
    setIsPending(true)
    try {
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { setError('Not authenticated'); return }
      const { data, error: err } = await supabase.from('hobby_activities').insert({
        user_id: u.id,
        hobby,
        note: note.trim() || null,
        location: location.trim() || null,
        activity_at: new Date(activityAt).toISOString(),
      }).select().single()
      if (err) { setError(err.message); return }
      setActivities(prev => [data, ...prev])
      resetForm()
      setAddOpen(false)
    } finally {
      setIsPending(false)
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('hobby_activities').delete().eq('id', id)
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="pb-8">
      {/* Add button bar */}
      {user && (
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => setAddOpen(true)}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-2xl py-3 text-muted-foreground text-sm hover:border-foreground/30 hover:text-foreground transition-colors"
          >
            <Plus size={15} />
            Log Activity
          </button>
        </div>
      )}

      {/* Activity list */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <Clock size={36} className="text-border mb-3" />
          <p className="text-foreground font-semibold text-sm">No activities yet</p>
          <p className="text-muted-foreground text-xs mt-1">
            {user ? 'Tap "Log Activity" to record a session' : 'Sign in to log activities'}
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-2 pt-2">
          {activities.map(act => (
            <div key={act.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {act.note && (
                    <p className="text-foreground text-sm leading-snug mb-2">{act.note}</p>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Clock size={11} />
                      {formatActivityDate(act.activity_at)} · {formatActivityTime(act.activity_at)}
                    </span>
                    {act.location && (
                      <span className="flex items-center gap-1 text-muted-foreground text-xs">
                        <MapPin size={11} />
                        {act.location}
                      </span>
                    )}
                  </div>
                </div>
                {user && (
                  <button
                    onClick={() => handleDelete(act.id)}
                    disabled={isPending}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add activity modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={() => { setAddOpen(false); resetForm() }}>
          <div
            className="w-full bg-background rounded-t-3xl border-t border-border"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-foreground font-bold text-base">Log Activity</h2>
              <button onClick={() => { setAddOpen(false); resetForm() }} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4 pb-10">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What did you do? (e.g. went for a 20km ride)"
                rows={3}
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary/50 resize-none"
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-muted-foreground text-xs font-medium mb-1.5 flex items-center gap-1.5">
                    <MapPin size={11} /> Location
                  </label>
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Downtown, Home garage"
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium mb-1.5 flex items-center gap-1.5">
                  <Clock size={11} /> Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={activityAt}
                  onChange={e => setActivityAt(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-foreground text-sm outline-none focus:border-primary/50"
                />
              </div>
              {error && <p className="text-destructive text-xs font-medium">{error}</p>}
              <button
                onClick={handleAdd}
                disabled={isPending}
                className="w-full bg-foreground text-background font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-80 transition-opacity"
              >
                {isPending ? 'Saving...' : 'Save Activity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
