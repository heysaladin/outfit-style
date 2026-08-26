'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { FamilySchedule, FamilyMemberName } from '@/lib/types'
import { FAMILY_MEMBERS } from '@/lib/types'
import { createFamilySchedule, updateFamilySchedule, deleteFamilySchedule } from '@/app/actions'

const C = {
  bg: 'var(--background)', card: 'var(--card)',
  ink: 'var(--foreground)', muted: 'var(--muted-foreground)',
  border: 'var(--border)',
}
const DP = 'var(--font-sans), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

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
    <div style={{ background: C.bg, minHeight: '100dvh', fontFamily: UI, color: C.ink }}>

      {/* ── Header ── */}
      <div style={{
        padding: 'calc(14px + env(safe-area-inset-top,0px)) 14px 10px',
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(var(--background-rgb,250,250,250),0.95)',
        backdropFilter: 'blur(12px)',
      }}>
        <IconBtn onClick={() => router.push('/social')}>
          <ChevronLeft />
        </IconBtn>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>
            Family
          </h1>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.muted }}>Embun · Langit · Senja</span>
        </div>
      </div>

      {/* ── Member tabs ── */}
      <div style={{ display: 'flex', gap: 8, padding: '0 14px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {FAMILY_MEMBERS.map(m => (
          <button
            key={m.name}
            onClick={() => setActiveMember(m.name)}
            style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 99, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: UI,
              transition: 'all 0.15s',
              background: activeMember === m.name ? m.color : C.card,
              color: activeMember === m.name ? '#fff' : C.ink,
              boxShadow: activeMember === m.name
                ? `0 4px 12px ${m.color}55`
                : '0 2px 6px rgba(0,0,0,.06)',
            }}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 14px' }}>

        {/* ── Info bar ── */}
        <div style={{
          background: C.card, borderRadius: 14, padding: '12px 14px',
          marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,.05)',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: currentMember.color + '20',
            display: 'grid', placeItems: 'center', fontSize: 22, flexShrink: 0,
          }}>
            {currentMember.emoji}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, fontFamily: DP }}>{currentMember.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{currentMember.school}</div>
          </div>
        </div>

        {/* ── Schedule section or coming soon ── */}
        {currentMember.hasSchedule ? (
          <>
            {/* Day tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {DAYS.map(d => (
                <button
                  key={d.num}
                  onClick={() => setActiveDay(d.num)}
                  style={{
                    flexShrink: 0, padding: '6px 14px', borderRadius: 99, border: 'none',
                    cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: UI,
                    transition: 'all 0.15s',
                    background: activeDay === d.num ? currentMember.color : C.card,
                    color: activeDay === d.num ? '#fff' : C.muted,
                    boxShadow: activeDay === d.num
                      ? `0 3px 10px ${currentMember.color}44`
                      : '0 1px 4px rgba(0,0,0,.05)',
                  }}
                >
                  {d.short}
                </button>
              ))}
            </div>

            {/* Schedule list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 100 }}>
              {daySchedules.length === 0 && (
                <div style={{
                  padding: '28px 16px', textAlign: 'center', color: C.muted,
                  background: C.card, borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>📭</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    Kosong hari {DAYS.find(d => d.num === activeDay)?.long}
                  </div>
                </div>
              )}
              {daySchedules.map(s => (
                <ScheduleCard
                  key={s.id}
                  schedule={s}
                  color={currentMember.color}
                  onEdit={() => setEditItem(s)}
                />
              ))}
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 14,
                  border: `2px dashed ${C.border}`, background: 'transparent',
                  cursor: 'pointer', color: C.muted, fontSize: 13, fontWeight: 600,
                  fontFamily: UI, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6,
                }}
              >
                <Plus size={14} /> Tambah pelajaran
              </button>
            </div>
          </>
        ) : (
          <div style={{
            padding: '40px 16px', textAlign: 'center', color: C.muted,
            background: C.card, borderRadius: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,.04)',
            paddingBottom: 100,
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{currentMember.emoji}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              Belum ada jadwal sekolah
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
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

// ── Schedule Card ──────────────────────────────────────────────────────────

function ScheduleCard({ schedule, color, onEdit }: {
  schedule: FamilySchedule
  color: string
  onEdit: () => void
}) {
  return (
    <div
      onClick={onEdit}
      style={{
        background: C.card, borderRadius: 14, padding: '12px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,.05)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ flexShrink: 0, minWidth: 48 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1.2 }}>{schedule.start_time}</div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{schedule.end_time}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, fontFamily: DP }}>{schedule.subject}</div>
        {schedule.note && (
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{schedule.note}</div>
        )}
      </div>
      <ChevronRight size={16} />
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
  const [day, setDay]         = useState(existing?.day_of_week ?? defaultDay)
  const [subject, setSubject] = useState(existing?.subject ?? '')
  const [start, setStart]     = useState(existing?.start_time ?? '07:00')
  const [end, setEnd]         = useState(existing?.end_time ?? '08:00')
  const [note, setNote]       = useState(existing?.note ?? '')
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr]         = useState<string | null>(null)

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
      <div style={{ fontFamily: DP, fontSize: 17, fontWeight: 800, marginBottom: 18 }}>
        {existing ? 'Edit Pelajaran' : 'Tambah Pelajaran'}
      </div>

      <Label>Hari</Label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {DAYS.map(d => (
          <button
            key={d.num}
            onClick={() => setDay(d.num)}
            style={{
              padding: '6px 12px', borderRadius: 99, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: UI,
              background: day === d.num ? member.color : C.card,
              color: day === d.num ? '#fff' : C.muted,
            }}
          >
            {d.short}
          </button>
        ))}
      </div>

      <Label>Nama Pelajaran</Label>
      <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="cth. Matematika" autoFocus={!existing} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <Label>Mulai</Label>
          <Input type="time" value={start} onChange={e => setStart(e.target.value)} />
        </div>
        <div>
          <Label>Selesai</Label>
          <Input type="time" value={end} onChange={e => setEnd(e.target.value)} />
        </div>
      </div>

      <Label>Catatan (opsional)</Label>
      <Input value={note} onChange={e => setNote(e.target.value)} placeholder="cth. Ruang 5, Bu Sari" />

      {err && <p style={{ color: '#EF4444', fontSize: 12, margin: '0 0 12px' }}>{err}</p>}

      <Btn onClick={handleSave} loading={saving} color={member.color} style={{ marginBottom: existing ? 10 : 0 }}>
        Simpan
      </Btn>
      {existing && onDeleted && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            width: '100%', padding: '12px', borderRadius: 12, border: 'none',
            background: '#FEE2E2', color: '#EF4444', fontWeight: 700,
            fontSize: 14, fontFamily: UI, cursor: 'pointer',
          }}
        >
          {deleting ? 'Menghapus...' : 'Hapus'}
        </button>
      )}
    </Sheet>
  )
}

// ── Primitives ─────────────────────────────────────────────────────────────

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)' }}
      />
      <div style={{
        position: 'relative', width: '100%',
        background: C.bg, borderRadius: '20px 20px 0 0',
        padding: '20px 16px calc(24px + env(safe-area-inset-bottom,0px))',
        maxHeight: '90dvh', overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,.12)',
      }}>
        {children}
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </div>
  )
}

function Input({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '11px 13px', borderRadius: 10,
        border: `1.5px solid ${C.border}`, background: C.card,
        fontSize: 14, fontFamily: UI, color: C.ink,
        marginBottom: 14, boxSizing: 'border-box', outline: 'none',
        ...style,
      }}
    />
  )
}

function Btn({ children, onClick, loading, color, style }: {
  children: React.ReactNode
  onClick: () => void
  loading: boolean
  color: string
  style?: React.CSSProperties
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%', padding: '13px', borderRadius: 12, border: 'none',
        background: color, color: '#fff', fontWeight: 700,
        fontSize: 15, fontFamily: UI, cursor: 'pointer',
        opacity: loading ? 0.6 : 1,
        ...style,
      }}
    >
      {loading ? 'Menyimpan...' : children}
    </button>
  )
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36, height: 36, borderRadius: 10, border: 'none',
        background: C.card, cursor: 'pointer',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,.06)', flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

function ChevronLeft() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRight({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function Plus({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
