'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { FamilySchedule, FamilyMemberName } from '@/lib/types'
import { FAMILY_MEMBERS } from '@/lib/types'
import { createFamilySchedule, updateFamilySchedule, deleteFamilySchedule } from '@/app/actions'

const DAYS = [
  { num: 1, short: 'Sen', long: 'Senin' },
  { num: 2, short: 'Sel', long: 'Selasa' },
  { num: 3, short: 'Rab', long: 'Rabu' },
  { num: 4, short: 'Kam', long: 'Kamis' },
  { num: 5, short: 'Jum', long: "Jum'at" },
]

interface Props {
  user: User
  schedules: FamilySchedule[]
}

export function FamilyClient({ user: _user, schedules: initSchedules }: Props) {
  const router = useRouter()
  const [schedules, setSchedules]       = useState(initSchedules)
  const [activeMember, setActiveMember] = useState<FamilyMemberName>('Embun')
  const [activeDay, setActiveDay]       = useState(1)
  const [showAdd, setShowAdd]           = useState(false)
  const [editItem, setEditItem]         = useState<FamilySchedule | null>(null)
  const [, startTransition]             = useTransition()

  const currentMember = FAMILY_MEMBERS.find(m => m.name === activeMember)!
  const daySchedules  = schedules
    .filter(s => s.member_name === activeMember && s.day_of_week === activeDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  function onScheduleAdded(s: FamilySchedule) {
    setSchedules(prev => [...prev, s])
    setShowAdd(false)
    startTransition(() => router.refresh())
  }

  function onScheduleUpdated(s: FamilySchedule) {
    setSchedules(prev => prev.map(x => x.id === s.id ? s : x))
    setEditItem(null)
    startTransition(() => router.refresh())
  }

  function onScheduleDeleted(id: string) {
    setSchedules(prev => prev.filter(s => s.id !== id))
    setEditItem(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="bg-background min-h-dvh text-foreground">

      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center gap-2.5 px-3.5 pb-2.5 bg-background/95 backdrop-blur-sm border-b border-border"
        style={{ paddingTop: 'calc(14px + env(safe-area-inset-top,0px))' }}
      >
        <button
          onClick={() => router.push('/social')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight leading-none">Family</h1>
          <span className="text-[11.5px] font-semibold text-muted-foreground">Embun · Langit · Senja</span>
        </div>
      </header>

      {/* Member tabs */}
      <div className="flex gap-2 px-3.5 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {FAMILY_MEMBERS.map(m => (
          <button
            key={m.name}
            onClick={() => setActiveMember(m.name)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all"
            style={{
              background: activeMember === m.name ? m.color : 'var(--card)',
              color: activeMember === m.name ? '#fff' : 'var(--foreground)',
              boxShadow: activeMember === m.name ? `0 4px 12px ${m.color}55` : '0 2px 6px rgba(0,0,0,.06)',
            }}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="px-3.5">

        {/* Info bar */}
        <div className="bg-card rounded-2xl p-3.5 mb-3.5 flex items-center gap-3 shadow-sm">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: currentMember.color + '20' }}
          >
            {currentMember.emoji}
          </div>
          <div>
            <div className="font-bold text-[15px]">{currentMember.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{currentMember.school}</div>
          </div>
        </div>

        {currentMember.hasSchedule ? (
          <>
            {/* Day selector */}
            <div className="flex rounded-xl bg-muted p-1 gap-1 mb-3.5">
              {DAYS.map(d => (
                <button
                  key={d.num}
                  onClick={() => setActiveDay(d.num)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={activeDay === d.num
                    ? { background: 'var(--background)', color: 'var(--foreground)', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }
                    : { color: 'var(--muted-foreground)' }}
                >
                  {d.short}
                </button>
              ))}
            </div>

            {/* Schedule list */}
            <div className="flex flex-col gap-2 pb-28">
              {daySchedules.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-2xl mb-2">📭</span>
                  <p className="text-sm font-semibold text-foreground">
                    Kosong hari {DAYS.find(d => d.num === activeDay)?.long}
                  </p>
                </div>
              )}
              {daySchedules.map(s => (
                <div
                  key={s.id}
                  className="bg-card rounded-2xl shadow-sm cursor-pointer overflow-hidden flex items-center gap-3 px-4 py-3"
                  style={{ borderLeft: `4px solid ${currentMember.color}` }}
                  onClick={() => setEditItem(s)}
                >
                  <div className="min-w-[48px]">
                    <div className="text-[11px] font-bold leading-tight" style={{ color: currentMember.color }}>
                      {s.start_time}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{s.end_time}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.subject}</p>
                    {s.note && <p className="text-xs text-muted-foreground truncate mt-0.5">{s.note}</p>}
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
                </div>
              ))}
              <button
                onClick={() => setShowAdd(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Tambah pelajaran
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">{currentMember.emoji}</span>
            <p className="text-sm font-semibold text-foreground">Belum ada jadwal sekolah</p>
          </div>
        )}
      </div>

      {showAdd && (
        <ScheduleModal
          memberName={activeMember}
          defaultDay={activeDay}
          onClose={() => setShowAdd(false)}
          onSaved={onScheduleAdded}
        />
      )}
      {editItem && (
        <ScheduleModal
          memberName={editItem.member_name}
          defaultDay={editItem.day_of_week}
          existing={editItem}
          onClose={() => setEditItem(null)}
          onSaved={onScheduleUpdated}
          onDeleted={onScheduleDeleted}
        />
      )}
    </div>
  )
}

// ── Schedule Modal ─────────────────────────────────────────────────────────

function ScheduleModal({ memberName, defaultDay, existing, onClose, onSaved, onDeleted }: {
  memberName: FamilyMemberName
  defaultDay: number
  existing?: FamilySchedule
  onClose: () => void
  onSaved: (s: FamilySchedule) => void
  onDeleted?: (id: string) => void
}) {
  const member = FAMILY_MEMBERS.find(m => m.name === memberName)!
  const [day, setDay]           = useState(existing?.day_of_week ?? defaultDay)
  const [subject, setSubject]   = useState(existing?.subject ?? '')
  const [start, setStart]       = useState(existing?.start_time ?? '07:00')
  const [end, setEnd]           = useState(existing?.end_time ?? '08:00')
  const [note, setNote]         = useState(existing?.note ?? '')
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr]           = useState<string | null>(null)

  async function handleSave() {
    if (!subject.trim()) { setErr('Nama pelajaran wajib diisi'); return }
    setSaving(true)
    if (existing) {
      const res = await updateFamilySchedule(existing.id, subject.trim(), start, end, note.trim())
      setSaving(false)
      if (res.error) { setErr(res.error); return }
      onSaved({ ...existing, day_of_week: day, subject: subject.trim(), start_time: start, end_time: end, note: note || null })
    } else {
      const res = await createFamilySchedule(memberName, day, subject.trim(), start, end, note.trim())
      setSaving(false)
      if (res.error) { setErr(res.error); return }
      onSaved({
        id: res.id ?? crypto.randomUUID(),
        user_id: '',
        member_name: memberName,
        day_of_week: day,
        subject: subject.trim(),
        start_time: start,
        end_time: end,
        note: note || null,
        created_at: new Date().toISOString(),
      })
    }
  }

  async function handleDelete() {
    if (!existing || !onDeleted) return
    setDeleting(true)
    await deleteFamilySchedule(existing.id)
    onDeleted(existing.id)
  }

  return (
    <Sheet onClose={onClose}>
      <h3 className="text-[17px] font-extrabold mb-4">
        {existing ? 'Edit Pelajaran' : 'Tambah Pelajaran'}
      </h3>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Hari</p>
          <div className="flex gap-1.5 flex-wrap">
            {DAYS.map(d => (
              <button
                key={d.num}
                onClick={() => setDay(d.num)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: day === d.num ? member.color : 'var(--card)',
                  color: day === d.num ? '#fff' : 'var(--muted-foreground)',
                }}
              >
                {d.short}
              </button>
            ))}
          </div>
        </div>

        <FormField label="Nama Pelajaran" required>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="cth. Matematika"
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary transition-colors"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Mulai">
            <input type="time" value={start} onChange={e => setStart(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-primary transition-colors" />
          </FormField>
          <FormField label="Selesai">
            <input type="time" value={end} onChange={e => setEnd(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-primary transition-colors" />
          </FormField>
        </div>

        <FormField label="Catatan (opsional)">
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="cth. Ruang 5, Bu Sari"
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary transition-colors"
          />
        </FormField>

        {err && <p className="text-xs text-destructive">{err}</p>}

        <button
          onClick={handleSave} disabled={saving}
          className="w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
          style={{ background: member.color, color: '#fff' }}
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>

        {existing && onDeleted && (
          <button
            onClick={handleDelete} disabled={deleting}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-destructive/10 text-destructive border border-destructive/20 disabled:opacity-40 transition-opacity"
          >
            {deleting ? 'Menghapus...' : 'Hapus'}
          </button>
        )}
      </div>
    </Sheet>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </p>
      {children}
    </div>
  )
}

// ── Sheet primitive ────────────────────────────────────────────────────────

function Sheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-background rounded-t-2xl max-h-[90dvh] overflow-y-auto shadow-2xl">
        <div className="mx-auto mt-2.5 mb-5 h-1 w-9 rounded-full bg-muted-foreground/30" />
        <div className="px-4" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom,0px))' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
