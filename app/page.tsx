'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { HOBBIES } from '@/lib/types'
import type { HobbyActivity, HobbyPhoto } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { ReorderHobbiesModal, getOrderedHobbies } from '@/components/gear/ReorderHobbiesModal'

type Tab = 'home' | 'stats' | 'gallery' | 'search' | 'hobby'
type MonthlyGoal = { id: string; name: string; narrative: string; deadline: string }
type GoalTask = { id: string; goal_id: string; task: string; week: 1|2|3|4; done: boolean }

const TINTS = ['#FFE9DB','#DDF4EA','#FFF3D1','#EDE6FD','#DCE8F5','#FBE0DC']

const C = {
  bg: '#FDF7EE', card: '#FFFFFF', card2: '#F7F0E4', line: '#EFE6D6',
  ink: '#22190F', muted: '#8D8271', faint: '#B8AD9A',
  orange: '#FF7A2F', orangeSoft: '#FFE9DB',
  mint: '#3FBF8F', mintSoft: '#DDF4EA',
  berry: '#8B5CF6', sun: '#FFC531', sunSoft: '#FFF3D1',
  danger: '#E9573F',
  shadow: '0 6px 18px rgba(84,62,32,.08)',
  shadowLg: '0 14px 34px rgba(84,62,32,.14)',
}

const DP = 'var(--font-bricolage), system-ui, sans-serif'
const UI = "'Inter', -apple-system, system-ui, sans-serif"

function NavTab({ label, active, onClick, children }: {
  label: string; active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none',
      color: active ? C.orange : C.faint,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      fontFamily: UI, fontSize: 10, fontWeight: 700, cursor: 'pointer', width: 56, padding: '6px 0',
    }}>
      {children}
      {label}
    </button>
  )
}

export default function Home() {
  const [tab, setTab]               = useState<Tab>('home')
  const [popOpen, setPopOpen]       = useState(false)
  const [reorderOpen, setReorderOpen] = useState(false)
  const [user, setUser]             = useState<User | null>(null)
  const [hobbyOrder, setHobbyOrder] = useState(() => [...HOBBIES])
  const [activities, setActivities] = useState<HobbyActivity[]>([])
  const [photos, setPhotos]         = useState<HobbyPhoto[]>([])
  const [gearCounts, setGearCounts] = useState<Record<string, number>>({})

  // Search
  const [searchQ, setSearchQ] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Create activity sheet
  const [createOpen, setCreateOpen] = useState(false)
  const [createHobby, setCreateHobby] = useState('')
  const [createNote, setCreateNote] = useState('')
  const [createLocation, setCreateLocation] = useState('')
  const [createAt, setCreateAt] = useState(() => { const n = new Date(); n.setSeconds(0, 0); return n.toISOString().slice(0, 16) })
  const [createPhoto, setCreatePhoto] = useState<string | null>(null)
  const [createPhotoFile, setCreatePhotoFile] = useState<File | null>(null)
  const [createError, setCreateError] = useState('')
  const [createPending, setCreatePending] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [goals, setGoals] = useState<MonthlyGoal[]>([])
  const [goalTasks, setGoalTasks] = useState<GoalTask[]>([])
  const [goalSheetOpen, setGoalSheetOpen] = useState(false)
  const [editGoalId, setEditGoalId] = useState<string | null>(null)
  const [taskSheetGoalId, setTaskSheetGoalId] = useState<string | null>(null)
  const [goalForm, setGoalForm] = useState({ name: '', narrative: '', deadline: '' })
  const [taskForm, setTaskForm] = useState({ task: '', week: 1 as 1|2|3|4 })

  // Gallery fullscreen
  const [fullscreenPhoto, setFullscreenPhoto] = useState<HobbyPhoto | null>(null)

  // Activity detail / edit
  const [viewActivity, setViewActivity] = useState<HobbyActivity | null>(null)
  const [actEditMode, setActEditMode] = useState(false)
  const [actEditForm, setActEditForm] = useState({ hobby: '', note: '', location: '', at: '' })
  const [actDeleteConfirm, setActDeleteConfirm] = useState(false)
  const [actSavePending, setActSavePending] = useState(false)
  const [actPhoto, setActPhoto] = useState<HobbyPhoto | null>(null)
  const [actNewPhotoPreview, setActNewPhotoPreview] = useState<string | null>(null)
  const [actNewPhotoFile, setActNewPhotoFile] = useState<File | null>(null)
  const actPhotoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHobbyOrder(getOrderedHobbies())
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user
      setUser(u)
      if (!u) return
      const [{ data: acts }, { data: pics }, { data: gear }, { count: wardrobeCount }] = await Promise.all([
        supabase.from('hobby_activities').select('id,hobby,activity_at,note,location,user_id,created_at').eq('user_id', u.id).order('activity_at', { ascending: false }),
        supabase.from('hobby_photos').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
        supabase.from('hobby_items').select('category'),
        supabase.from('wardrobe_items').select('*', { count: 'exact', head: true }).eq('user_id', u.id),
      ])
      setActivities(acts ?? [])
      setPhotos(pics ?? [])
      const counts: Record<string, number> = { fashion: wardrobeCount ?? 0 }
      for (const item of (gear ?? [])) {
        counts[item.category] = (counts[item.category] ?? 0) + 1
      }
      setGearCounts(counts)

      try {
        const [{ data: goalsData }, { data: tasksData }] = await Promise.all([
          supabase.from('monthly_goals').select('*').eq('user_id', u.id).order('created_at'),
          supabase.from('goal_tasks').select('*').eq('user_id', u.id).order('created_at'),
        ])
        setGoals(goalsData ?? [])
        setGoalTasks(tasksData ?? [])
      } catch { /* tables may not exist yet */ }
    })
  }, [])

  function resetCreate() {
    setCreateHobby(''); setCreateNote(''); setCreateLocation(''); setCreateError('')
    setCreatePhoto(null); setCreatePhotoFile(null)
    const n = new Date(); n.setSeconds(0, 0); setCreateAt(n.toISOString().slice(0, 16))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCreatePhotoFile(file)
    const reader = new FileReader()
    reader.onload = ev => { setCreatePhoto(ev.target?.result as string) }
    reader.readAsDataURL(file)
  }

  async function handleCreateSave() {
    if (!createHobby) return setCreateError('Pick a hobby')
    if (!createNote.trim()) return setCreateError('Add a note')
    setCreateError(''); setCreatePending(true)
    try {
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { setCreateError('Not signed in'); setCreatePending(false); return }

      let imageUrl: string | null = null
      if (createPhotoFile) {
        const ext = createPhotoFile.name.split('.').pop() ?? 'jpg'
        const path = `${u.id}/hobby/${createHobby}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('wardrobe').upload(path, createPhotoFile, { upsert: false })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('wardrobe').getPublicUrl(path)
          imageUrl = urlData.publicUrl
        }
      }

      const { data: act, error: actErr } = await supabase.from('hobby_activities').insert({
        user_id: u.id, hobby: createHobby,
        note: createNote.trim(),
        location: createLocation.trim() || null,
        activity_at: new Date(createAt).toISOString(),
      }).select().single()
      if (actErr) { setCreateError(actErr.message); setCreatePending(false); return }

      if (imageUrl) {
        await supabase.from('hobby_photos').insert({
          user_id: u.id, hobby: createHobby,
          image_url: imageUrl, note: createNote.trim() || null,
        })
        setPhotos(prev => [{ id: Date.now().toString(), user_id: u.id, hobby: createHobby, image_url: imageUrl!, note: createNote.trim() || null, created_at: new Date().toISOString() }, ...prev])
      }

      setActivities(prev => [act, ...prev])
      resetCreate(); setCreateOpen(false)
    } finally { setCreatePending(false) }
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'there'
  const avatarLetter = (firstName[0] ?? 'H').toUpperCase()

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  // Last 7 days (Sun=0..Sat=6 order relative to today)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i)); return d
  })
  const DAY_LABELS = ['S','M','T','W','T','F','S']
  const activeDaySet = new Set(activities.map(a => new Date(a.activity_at).toDateString()))
  const weekDots = weekDays.map((d, i) => ({
    label: DAY_LABELS[d.getDay()], active: activeDaySet.has(d.toDateString()), isToday: i === 6,
  }))

  // Streak: consecutive days back from today
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    if (activeDaySet.has(d.toDateString())) streak++
    else break
  }

  // Last active label per hobby
  const lastActive: Record<string, string> = {}
  for (const a of activities) {
    if (!lastActive[a.hobby]) {
      const diff = Math.floor((now.getTime() - new Date(a.activity_at).getTime()) / 86400000)
      if (diff === 0) lastActive[a.hobby] = 'today'
      else if (diff === 1) lastActive[a.hobby] = 'yesterday'
      else if (diff < 7) lastActive[a.hobby] = `${diff}d ago`
      else lastActive[a.hobby] = `${Math.floor(diff / 7)}w ago`
    }
  }

  // Sorted hobby list for stats
  const hobbiesByActivity = [...HOBBIES].map(h => ({
    ...h, count: activities.filter(a => a.hobby === h.value).length,
  })).sort((a, b) => b.count - a.count).filter(h => h.count > 0)

  function openActivity(act: HobbyActivity, photo?: HobbyPhoto) {
    setViewActivity(act)
    setActEditMode(false)
    setActDeleteConfirm(false)
    setActNewPhotoPreview(null)
    setActNewPhotoFile(null)
    setActEditForm({
      hobby: act.hobby,
      note: act.note ?? '',
      location: act.location ?? '',
      at: new Date(act.activity_at).toISOString().slice(0, 16),
    })
    const linked = photo ?? photos.find(p => p.hobby === act.hobby && p.note === act.note) ?? photos.find(p => p.hobby === act.hobby) ?? null
    setActPhoto(linked)
  }

  async function saveActivityEdit() {
    if (!viewActivity) return
    setActSavePending(true)
    const supabase = createClient()
    const { data: { user: u } } = await supabase.auth.getUser()

    // Upload new photo if selected
    if (actNewPhotoFile && u) {
      const ext = actNewPhotoFile.name.split('.').pop() ?? 'jpg'
      const path = `${u.id}/hobby/${actEditForm.hobby}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('wardrobe').upload(path, actNewPhotoFile, { upsert: false })
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('wardrobe').getPublicUrl(path)
        const newUrl = urlData.publicUrl
        if (actPhoto) {
          const { data: updatedPhoto } = await supabase.from('hobby_photos').update({ image_url: newUrl, note: actEditForm.note.trim() || null }).eq('id', actPhoto.id).select().single()
          if (updatedPhoto) {
            setPhotos(prev => prev.map(p => p.id === actPhoto.id ? updatedPhoto : p))
            setActPhoto(updatedPhoto)
          }
        } else {
          const { data: newPhoto } = await supabase.from('hobby_photos').insert({ user_id: u!.id, hobby: actEditForm.hobby, image_url: newUrl, note: actEditForm.note.trim() || null }).select().single()
          if (newPhoto) { setPhotos(prev => [newPhoto, ...prev]); setActPhoto(newPhoto) }
        }
      }
    } else if (actPhoto && actEditForm.note !== (actPhoto.note ?? '')) {
      const { data: updatedPhoto } = await supabase.from('hobby_photos').update({ note: actEditForm.note.trim() || null }).eq('id', actPhoto.id).select().single()
      if (updatedPhoto) { setPhotos(prev => prev.map(p => p.id === actPhoto.id ? updatedPhoto : p)); setActPhoto(updatedPhoto) }
    }

    const { data } = await supabase.from('hobby_activities').update({
      hobby: actEditForm.hobby,
      note: actEditForm.note.trim(),
      location: actEditForm.location.trim() || null,
      activity_at: new Date(actEditForm.at).toISOString(),
    }).eq('id', viewActivity.id).select().single()
    if (data) {
      setActivities(prev => prev.map(a => a.id === viewActivity.id ? data : a))
      setViewActivity(data)
    }
    setActNewPhotoPreview(null)
    setActNewPhotoFile(null)
    setActEditMode(false)
    setActSavePending(false)
  }

  async function deleteActivity() {
    if (!viewActivity) return
    const act = viewActivity
    const photo = actPhoto ?? photos.find(p => p.hobby === act.hobby && p.note === act.note) ?? null
    setViewActivity(null)
    setActDeleteConfirm(false)
    setActPhoto(null)
    setActivities(prev => prev.filter(a => a.id !== act.id))
    setPhotos(prev => photo
      ? prev.filter(p => p.id !== photo.id)
      : prev.filter(p => !(p.hobby === act.hobby && p.note === act.note))
    )
    const supabase = createClient()
    const { data: { user: u } } = await supabase.auth.getUser()
    await supabase.from('hobby_activities').delete().eq('id', act.id)
    if (photo) {
      await supabase.from('hobby_photos').delete().eq('id', photo.id)
    } else if (act.note) {
      await supabase.from('hobby_photos').delete().eq('hobby', act.hobby).eq('note', act.note)
    }
    if (u) {
      const { data: freshPhotos } = await supabase.from('hobby_photos').select('*').eq('user_id', u.id).order('created_at', { ascending: false })
      if (freshPhotos) setPhotos(freshPhotos)
    }
  }

  async function saveGoal() {
    if (!goalForm.name.trim()) return
    const supabase = createClient()
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return
    if (editGoalId) {
      const { data } = await supabase.from('monthly_goals').update({
        name: goalForm.name.trim(),
        narrative: goalForm.narrative.trim() || null,
        deadline: goalForm.deadline || null,
      }).eq('id', editGoalId).select().single()
      if (data) setGoals(prev => prev.map(g => g.id === editGoalId ? data : g))
    } else {
      const { data } = await supabase.from('monthly_goals').insert({
        user_id: u.id,
        name: goalForm.name.trim(),
        narrative: goalForm.narrative.trim() || null,
        deadline: goalForm.deadline || null,
      }).select().single()
      if (data) setGoals(prev => [...prev, data])
    }
    setGoalSheetOpen(false)
    setEditGoalId(null)
    setGoalForm({ name: '', narrative: '', deadline: '' })
  }

  async function saveTask() {
    if (!taskForm.task.trim() || !taskSheetGoalId) return
    const supabase = createClient()
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return
    const { data } = await supabase.from('goal_tasks').insert({
      user_id: u.id,
      goal_id: taskSheetGoalId,
      task: taskForm.task.trim(),
      week: taskForm.week,
      done: false,
    }).select().single()
    if (data) setGoalTasks(prev => [...prev, data])
    setTaskSheetGoalId(null)
    setTaskForm({ task: '', week: 1 })
  }

  async function toggleTask(id: string) {
    const current = goalTasks.find(t => t.id === id)
    if (!current) return
    setGoalTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
    const supabase = createClient()
    await supabase.from('goal_tasks').update({ done: !current.done }).eq('id', id)
  }

  async function deleteGoal(id: string) {
    setGoals(prev => prev.filter(g => g.id !== id))
    setGoalTasks(prev => prev.filter(t => t.goal_id !== id))
    const supabase = createClient()
    await supabase.from('monthly_goals').delete().eq('id', id)
  }

  async function deleteTask(id: string) {
    setGoalTasks(prev => prev.filter(t => t.id !== id))
    const supabase = createClient()
    await supabase.from('goal_tasks').delete().eq('id', id)
  }

  const hobbyLinks = [
    { label: 'Fashion', icon: '👔', href: '/fashion', value: 'fashion' },
    ...hobbyOrder.map(h => ({ label: h.label, icon: h.icon as string, href: `/${h.value}`, value: h.value })),
  ]

  const q = searchQ.toLowerCase().trim()
  const filteredHobbies = q ? hobbyLinks.filter(h => h.label.toLowerCase().includes(q)) : []
  const filteredActivities = q ? activities.filter(a =>
    (a.note ?? '').toLowerCase().includes(q) || (a.location ?? '').toLowerCase().includes(q)
  ).slice(0, 20) : []

  return (
    <div style={{ background: '#EFE7D9', height: '100dvh', fontFamily: UI, color: C.ink }}>
      <div style={{
        width: '100%', maxWidth: 430, height: '100dvh', background: C.bg,
        margin: '0 auto', position: 'relative', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <header style={{ padding: 'calc(18px + env(safe-area-inset-top,0px)) 18px 6px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint }}>
            {dateStr}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
            <h1 style={{ fontFamily: DP, fontWeight: 800, fontSize: 28, lineHeight: 1.06, letterSpacing: '-0.02em', margin: 0 }}>
              Hi {firstName},<br />let&apos;s add to your{' '}
              <em style={{ fontStyle: 'normal', color: C.orange }}>story</em>
            </h1>
            <button
              onClick={(e) => { e.stopPropagation(); setPopOpen(v => !v) }}
              style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
                background: 'linear-gradient(135deg,#FFC531,#FF7A2F)',
                display: 'grid', placeItems: 'center', boxShadow: C.shadow, padding: 0, overflow: 'hidden',
              }}
            >
              <img src="https://heysaladindesign.web.app/pictures/avatar.png" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          </div>
        </header>

        {/* ── Popup menu ── */}
        {popOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} onClick={() => setPopOpen(false)}>
            <div
              style={{
                position: 'absolute', top: 'calc(78px + env(safe-area-inset-top,0px))', right: 16,
                background: C.card, borderRadius: 20, minWidth: 240, maxWidth: 'calc(100vw - 32px)',
                boxShadow: C.shadowLg, overflow: 'hidden',
              }}
              onClick={e => e.stopPropagation()}
            >
              {user ? (
                <>
                  <div style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: C.muted, borderBottom: `1px solid ${C.line}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                  <button
                    style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, background: 'none', border: 'none', color: C.ink, fontFamily: UI, fontSize: 14, fontWeight: 600, padding: '13px 16px', cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => { setPopOpen(false); setReorderOpen(true) }}
                  >
                    ⇅ &nbsp;Reorder interests
                  </button>
                  <form action="/auth/signout" method="post" style={{ margin: 0 }}>
                    <button style={{ display: 'flex', width: '100%', alignItems: 'center', background: 'none', border: 'none', color: C.danger, fontFamily: UI, fontSize: 14, fontWeight: 600, padding: '13px 16px', cursor: 'pointer', textAlign: 'left' }}>
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" style={{ display: 'block', padding: '13px 16px', color: C.ink, fontWeight: 600, fontSize: 14, textDecoration: 'none' }} onClick={() => setPopOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Scrollable content ── */}
        <div style={{
          flex: 1, overflowY: 'auto', overscrollBehavior: 'contain',
          padding: '0 18px calc(100px + env(safe-area-inset-bottom,0px))',
        }}>

          {/* ════ HOME TAB ════ */}
          {tab === 'home' && (
            <>
              {/* Momo mascot card */}
              <div style={{
                margin: '16px 0 4px', padding: 16, borderRadius: 28,
                background: C.card, boxShadow: C.shadow,
                display: 'flex', alignItems: 'center', gap: 14,
                position: 'relative', overflow: 'hidden',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/momo.png" alt="Momo" style={{ width: 86, height: 86, flexShrink: 0, objectFit: 'cover', background: '#fff', position: 'relative', zIndex: 1, borderRadius: 16 }} />
                <div style={{ flex: 1, zIndex: 1, position: 'relative' }}>
                  <b style={{ fontFamily: DP, fontWeight: 700, fontSize: 15.5, display: 'block', lineHeight: 1.25 }}>
                    {streak > 1
                      ? `"${streak}-day streak! You're on fire \uD83D\uDD25"`
                      : streak === 1
                      ? '"Great start! Keep logging today \uD83C\uDFAF"'
                      : '"Start logging to build your story \uD83C\uDFAF"'}
                  </b>
                  <span style={{ fontSize: 12, color: C.muted, display: 'block', marginTop: 3 }}>Momo · your interest pal</span>
                </div>
              </div>

              {/* Week streak dots */}
              <div style={{
                margin: '12px 0 4px', padding: '13px 16px', borderRadius: 22,
                background: C.card, boxShadow: C.shadow,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <b style={{ fontFamily: DP, fontSize: 22, fontWeight: 800 }}>🔥 {streak}</b>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, lineHeight: 1.3 }}>day<br />streak</span>
                </div>
                <div style={{ display: 'flex', gap: 9 }}>
                  {weekDots.map((d, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: C.faint }}>{d.label}</span>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: d.active ? C.orange : C.line,
                        outline: d.isToday ? `2px solid ${C.orange}` : 'none',
                        outlineOffset: 2,
                      }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              {activities.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '22px 4px 10px' }}>
                    <h2 style={{ fontFamily: DP, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>Recent</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activities.slice(0, 3).map(act => {
                      const h = HOBBIES.find(x => x.value === act.hobby)
                      const diff = Math.floor((now.getTime() - new Date(act.activity_at).getTime()) / 86400000)
                      const timeAgo = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : `${diff}d ago`
                      return (
                        <div key={act.id} onClick={() => openActivity(act)} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: C.card, borderRadius: 18, padding: '12px 14px',
                          boxShadow: C.shadow, cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                        }}>
                          <div style={{ width: 40, height: 40, borderRadius: 14, background: C.orangeSoft, display: 'grid', placeItems: 'center', fontSize: 19, flexShrink: 0 }}>
                            {h?.icon ?? '✨'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <b style={{ fontFamily: DP, fontSize: 13, fontWeight: 700 }}>{h?.label ?? act.hobby}</b>
                              <span style={{ fontSize: 11, fontWeight: 600, color: C.faint }}>{timeAgo}</span>
                            </div>
                            <p style={{ fontSize: 12, color: C.muted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.note}</p>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Monthly Goals */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '22px 4px 12px' }}>
                <h2 style={{ fontFamily: DP, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
                  Monthly Goals
                </h2>
                <button
                  onClick={() => setGoalSheetOpen(true)}
                  style={{ background: 'none', border: 'none', color: C.orange, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 4 }}
                >
                  + Add
                </button>
              </div>

              {goals.length === 0 ? (
                <div style={{ padding: '28px 0 8px', textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 18, background: C.card, boxShadow: C.shadow, display: 'grid', placeItems: 'center', margin: '0 auto 10px', fontSize: 22 }}>🎯</div>
                  <b style={{ display: 'block', color: C.ink, fontFamily: DP, fontSize: 14, fontWeight: 700, marginBottom: 3 }}>No goals yet</b>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Set monthly goals to stay on track</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {goals.map(goal => {
                    const tasks = goalTasks.filter(t => t.goal_id === goal.id)
                    const doneCount = tasks.filter(t => t.done).length
                    const pct = tasks.length > 0 ? doneCount / tasks.length : 0
                    const deadlineDate = goal.deadline ? new Date(goal.deadline) : null
                    const isOverdue = deadlineDate && deadlineDate < new Date() && pct < 1
                    return (
                      <div key={goal.id} style={{ background: C.card, borderRadius: 22, boxShadow: C.shadow, padding: '15px 15px 13px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                          <b style={{ fontFamily: DP, fontSize: 15, fontWeight: 700, lineHeight: 1.3, flex: 1 }}>{goal.name}</b>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            {deadlineDate && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: isOverdue ? C.danger : C.muted, background: isOverdue ? '#FDE8E4' : C.card2, padding: '4px 9px', borderRadius: 99 }}>
                                {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                            <button onClick={() => { setEditGoalId(goal.id); setGoalForm({ name: goal.name, narrative: goal.narrative ?? '', deadline: goal.deadline ?? '' }); setGoalSheetOpen(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.faint, padding: 2, display: 'grid', placeItems: 'center' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => deleteGoal(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.faint, padding: 2, display: 'grid', placeItems: 'center' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            </button>
                          </div>
                        </div>

                        {goal.narrative && (
                          <p style={{ fontSize: 12, color: C.muted, margin: '0 0 10px', lineHeight: 1.5 }}>{goal.narrative}</p>
                        )}

                        {tasks.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: C.faint, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              <span>Progress</span>
                              <span>{doneCount}/{tasks.length} tasks</span>
                            </div>
                            <div style={{ height: 5, borderRadius: 99, background: C.line }}>
                              <div style={{ height: 5, borderRadius: 99, background: pct === 1 ? C.mint : C.orange, width: `${pct * 100}%`, transition: 'width .3s ease' }} />
                            </div>
                          </div>
                        )}

                        {([1,2,3,4] as const).map(week => {
                          const weekTasks = tasks.filter(t => t.week === week)
                          if (weekTasks.length === 0) return null
                          return (
                            <div key={week} style={{ marginBottom: 4 }}>
                              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.faint, display: 'block', marginBottom: 2 }}>Week {week}</span>
                              {weekTasks.map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                                  <div
                                    onClick={() => toggleTask(t.id)}
                                    style={{ width: 20, height: 20, borderRadius: 7, border: `2px solid ${t.done ? C.mint : C.line}`, background: t.done ? C.mint : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0, cursor: 'pointer' }}
                                  >
                                    {t.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>}
                                  </div>
                                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: t.done ? C.faint : C.ink, textDecoration: t.done ? 'line-through' : 'none' }}>{t.task}</span>
                                  <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.faint, padding: 2, display: 'grid', placeItems: 'center', opacity: 0.6 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )
                        })}

                        <button
                          onClick={() => { setTaskSheetGoalId(goal.id); setTaskForm({ task: '', week: 1 }) }}
                          style={{ marginTop: 8, background: 'none', border: `1.5px dashed ${C.line}`, borderRadius: 12, padding: '7px 13px', cursor: 'pointer', color: C.muted, fontFamily: UI, fontSize: 12, fontWeight: 700, width: '100%' }}
                        >
                          + Add task
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* ════ HOBBY TAB ════ */}
          {tab === 'hobby' && (
            <>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '22px 4px 12px' }}>
                <h2 style={{ fontFamily: DP, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
                  Interests <small style={{ fontSize: 12, color: C.faint, fontWeight: 600, marginLeft: 5 }}>{hobbyLinks.length}</small>
                </h2>
                <button
                  style={{ background: 'none', border: 'none', color: C.orange, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 4 }}
                  onClick={() => setReorderOpen(true)}
                >
                  Reorder
                </button>
              </div>

              {/* Hobby grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
                {hobbyLinks.map(({ label, icon, href, value }, i) => {
                  const count = gearCounts[value] ?? 0
                  const last = lastActive[value]
                  const dots = weekDays.map(d =>
                    activities.some(a => a.hobby === value && new Date(a.activity_at).toDateString() === d.toDateString())
                  )
                  return (
                    <Link key={label} href={href} prefetch={false} style={{
                      background: C.card, borderRadius: 22, boxShadow: C.shadow,
                      padding: '15px 14px 13px', textDecoration: 'none', color: C.ink,
                      display: 'flex', flexDirection: 'column', gap: 10,
                      WebkitTapHighlightColor: 'transparent',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ width: 40, height: 40, borderRadius: 14, background: TINTS[i % TINTS.length], display: 'grid', placeItems: 'center', fontSize: 21 }}>
                          {icon}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: C.card2, padding: '4px 9px', borderRadius: 99 }}>
                          {count} items
                        </span>
                      </div>
                      <div style={{ fontFamily: DP, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {label}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.faint }}>{last ?? 'not started'}</span>
                        <span style={{ display: 'flex', gap: 3.5 }}>
                          {dots.map((on, j) => (
                            <i key={j} style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: on ? C.mint : C.line }} />
                          ))}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}

          {/* ════ STATS TAB ════ */}
          {tab === 'stats' && (
            <div style={{ paddingTop: 16 }}>
              {!user ? (
                <EmptyState icon="📊" title="Sign in to see stats" desc="Track your hobby activity over time">
                  <Link href="/login" style={{ color: C.orange, fontWeight: 700, fontSize: 14, marginTop: 12, display: 'inline-block' }}>Login</Link>
                </EmptyState>
              ) : activities.length === 0 ? (
                <EmptyState icon="📈" title="No activities yet" desc="Start logging activities in your hobbies" />
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 14 }}>
                    {[
                      { v: streak, unit: 'days', l: 'Current streak' },
                      { v: activities.length, unit: '', l: 'Total activities' },
                      { v: Object.keys(lastActive).length, unit: '', l: 'Active hobbies' },
                      { v: Object.values(gearCounts).reduce((a, b) => a + b, 0), unit: '', l: 'Items catalogued' },
                    ].map((s, i) => (
                      <div key={i} style={{ background: C.card, boxShadow: C.shadow, borderRadius: 22, padding: '16px 15px' }}>
                        <div style={{ fontFamily: DP, fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
                          {s.v}{s.unit ? <small style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}> {s.unit}</small> : null}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.faint, marginTop: 8 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {hobbiesByActivity.length > 0 && (
                    <div style={{ background: C.card, boxShadow: C.shadow, borderRadius: 28, padding: '17px 15px', marginTop: 12 }}>
                      <h3 style={{ fontFamily: DP, fontSize: 15.5, fontWeight: 700, margin: '0 0 4px' }}>Top hobbies</h3>
                      {hobbiesByActivity.slice(0, 5).map((h, i) => {
                        const maxC = hobbiesByActivity[0].count
                        const pct = maxC > 0 ? (h.count / maxC) * 100 : 0
                        const colors = [C.orange, C.mint, C.sun, C.berry, '#0ea5e9']
                        const bgs = [C.orangeSoft, C.mintSoft, C.sunSoft, '#EDE6FD', '#E0F2FE']
                        return (
                          <div key={h.value} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 2px', borderTop: i > 0 ? `1px solid ${C.line}` : 'none' }}>
                            <span style={{ fontFamily: DP, fontWeight: 800, fontSize: 13, color: C.faint, width: 18 }}>{i + 1}</span>
                            <span style={{ width: 38, height: 38, borderRadius: 13, background: bgs[i], display: 'grid', placeItems: 'center', fontSize: 19, flexShrink: 0 }}>{h.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <b style={{ fontSize: 14, fontWeight: 700, display: 'block' }}>{h.label}</b>
                              <span style={{ fontSize: 11.5, fontWeight: 500, color: C.muted }}>{h.count} activities</span>
                              <div style={{ height: 5, borderRadius: 99, marginTop: 6, background: colors[i], width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════ SEARCH TAB ════ */}
          {tab === 'search' && (
            <div style={{ paddingTop: 16 }}>
              <div style={{ position: 'relative', marginBottom: 18 }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.faint }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
                </svg>
                <input
                  ref={searchRef}
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search hobbies or activities…"
                  style={{ width: '100%', boxSizing: 'border-box', background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 18, padding: '13px 15px 13px 42px', fontFamily: UI, fontSize: 15, fontWeight: 500, color: C.ink, outline: 'none' }}
                />
                {searchQ && (
                  <button onClick={() => setSearchQ('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.faint, padding: 4 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                  </button>
                )}
              </div>

              {!q && (
                <EmptyState icon="🔍" title="Search anything" desc="Type to find hobbies, activities, or sessions" />
              )}

              {q && filteredHobbies.length === 0 && filteredActivities.length === 0 && (
                <EmptyState icon="😶" title="No results" desc={`Nothing matches "${searchQ}"`} />
              )}

              {filteredHobbies.length > 0 && (
                <>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.faint, margin: '0 0 10px 2px' }}>Interests</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 22 }}>
                    {filteredHobbies.map(({ label, icon, href, value }, i) => {
                      const count = gearCounts[value] ?? 0
                      const last = lastActive[value]
                      return (
                        <Link key={value} href={href} prefetch={false} style={{ background: C.card, borderRadius: 22, boxShadow: C.shadow, padding: '15px 14px 13px', textDecoration: 'none', color: C.ink, display: 'flex', flexDirection: 'column', gap: 10, WebkitTapHighlightColor: 'transparent' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ width: 40, height: 40, borderRadius: 14, background: TINTS[i % TINTS.length], display: 'grid', placeItems: 'center', fontSize: 21 }}>{icon}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: '#F7F0E4', padding: '4px 9px', borderRadius: 99 }}>{count} items</span>
                          </div>
                          <div style={{ fontFamily: DP, fontSize: 15, fontWeight: 700 }}>{label}</div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.faint }}>{last ?? 'not started'}</span>
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}

              {filteredActivities.length > 0 && (
                <>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.faint, margin: '0 0 10px 2px' }}>Activities</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {filteredActivities.map(act => {
                      const h = HOBBIES.find(x => x.value === act.hobby)
                      return (
                        <div key={act.id} style={{ display: 'flex', gap: 12, padding: 14, background: C.card, boxShadow: C.shadow, borderRadius: 16, alignItems: 'center' }}>
                          <Link href={`/${act.hobby}`} style={{ width: 42, height: 42, borderRadius: 14, background: C.orangeSoft, display: 'grid', placeItems: 'center', fontSize: 19, flexShrink: 0, textDecoration: 'none' }}>
                            {h?.icon ?? '✨'}
                          </Link>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <b style={{ fontSize: 14, fontWeight: 700, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.note ?? 'Session logged'}</b>
                            <span style={{ fontSize: 12, color: C.muted }}>{h?.label ?? act.hobby}{act.location ? ` · ${act.location}` : ''}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ════ GALLERY TAB ════ */}
          {tab === 'gallery' && (
            <div style={{ paddingTop: 16 }}>
              {!user ? (
                <EmptyState icon="🖼️" title="Sign in to see gallery" desc="Your captured moments will appear here">
                  <Link href="/login" style={{ color: C.orange, fontWeight: 700, fontSize: 14, marginTop: 12, display: 'inline-block' }}>Login</Link>
                </EmptyState>
              ) : (() => {
                // Activities that have no linked photo
                const noPhotoActs = activities.filter(act =>
                  !photos.some(p => p.hobby === act.hobby && p.note === act.note)
                )
                // Combined feed: photos + no-photo activities, sorted newest first
                const feed: Array<
                  | { type: 'photo'; date: string; photo: HobbyPhoto }
                  | { type: 'activity'; date: string; act: HobbyActivity }
                > = [
                  ...photos.map(p => ({ type: 'photo' as const, date: p.created_at, photo: p })),
                  ...noPhotoActs.map(a => ({ type: 'activity' as const, date: a.activity_at, act: a })),
                ].sort((a, b) => b.date.localeCompare(a.date))

                if (feed.length === 0) {
                  return <EmptyState icon="📸" title="No activity yet" desc="Capture moments or log activities from your hobbies" />
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                    {feed.map(item => {
                      if (item.type === 'photo') {
                        const p = item.photo
                        const h = HOBBIES.find(x => x.value === p.hobby)
                        const linkedActivity = activities.find(a => a.hobby === p.hobby && a.note === p.note)
                          ?? activities.find(a => a.hobby === p.hobby)
                        return (
                          <div key={`p-${p.id}`} style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', boxShadow: C.shadow, background: C.card }}>
                            <div onClick={() => setFullscreenPhoto(p)} style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                              <img src={p.image_url} alt={p.hobby} style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 420 }} />
                            </div>
                            <div style={{ padding: '12px 14px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: 22, flexShrink: 0 }}>{h?.icon ?? '📷'}</span>
                                <div style={{ minWidth: 0 }}>
                                  <b style={{ fontFamily: DP, fontSize: 14, fontWeight: 700, display: 'block' }}>{h?.label ?? p.hobby}</b>
                                  {p.note && <p style={{ fontSize: 13, color: C.muted, margin: '2px 0 0', lineHeight: 1.4 }}>{p.note}</p>}
                                </div>
                              </div>
                              {linkedActivity && (
                                <button
                                  onClick={() => openActivity(linkedActivity)}
                                  style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.card, cursor: 'pointer', display: 'grid', placeItems: 'center', color: C.ink }}
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      } else {
                        // No-photo activity — dark card with big white text
                        const act = item.act
                        const h = HOBBIES.find(x => x.value === act.hobby)
                        const diff = Math.floor((now.getTime() - new Date(act.activity_at).getTime()) / 86400000)
                        const timeAgo = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : `${diff}d ago`
                        return (
                          <div
                            key={`a-${act.id}`}
                            onClick={() => openActivity(act)}
                            style={{
                              borderRadius: 20, overflow: 'hidden', position: 'relative',
                              boxShadow: C.shadowLg, background: '#1C130A',
                              minHeight: 140, display: 'flex', flexDirection: 'column',
                              justifyContent: 'space-between', cursor: 'pointer',
                              WebkitTapHighlightColor: 'transparent',
                            }}
                          >
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,122,47,.12) 0%, rgba(63,191,143,.08) 100%)', pointerEvents: 'none' }} />
                            <div style={{ position: 'relative', padding: '20px 18px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1.25, color: '#FFFFFF', fontFamily: DP, wordBreak: 'break-word' }}>
                                {act.note ?? 'Session logged'}
                              </p>
                            </div>
                            <div style={{ position: 'relative', padding: '0 18px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', align: 'center', gap: 8 }}>
                                <span style={{ fontSize: 18 }}>{h?.icon ?? '✨'}</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)' }}>
                                  {h?.label ?? act.hobby} · {timeAgo}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                    })}
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        {/* ── Bottom nav — floating pill ── */}
        <nav style={{
          position: 'fixed',
          bottom: 'calc(10px + env(safe-area-inset-bottom,0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(calc(100vw - 24px), 406px)',
          height: 66,
          borderRadius: 26,
          background: C.card,
          boxShadow: C.shadowLg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
          padding: '0 18px',
        }}>
          <NavTab label="Home" active={tab === 'home'} onClick={() => setTab('home')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5L12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/>
            </svg>
          </NavTab>

          <NavTab label="Activity" active={tab === 'gallery'} onClick={() => setTab('gallery')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3"/>
              <circle cx="9" cy="10" r="1.6" fill="currentColor" stroke="none"/>
              <path d="M21 15l-5-4-9 8"/>
            </svg>
          </NavTab>

          {/* FAB */}
          <div style={{ position: 'relative', width: 58, height: 58, marginTop: -28, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
            <button
              onClick={() => { setCreateOpen(true); setCreateAt(() => { const n = new Date(); n.setSeconds(0,0); return n.toISOString().slice(0,16) }) }}
              style={{
                width: 58, height: 58, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: C.orange, color: '#fff', display: 'grid', placeItems: 'center',
                boxShadow: '0 10px 24px rgba(255,122,47,.45)',
              }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>

          <NavTab label="Stats" active={tab === 'stats'} onClick={() => setTab('stats')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20V10M12 20V4M20 20v-7"/>
            </svg>
          </NavTab>

          <NavTab label="Hobby" active={tab === 'hobby'} onClick={() => setTab('hobby')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none"/>
            </svg>
          </NavTab>
        </nav>

        {/* Reorder modal */}
        {reorderOpen && (
          <ReorderHobbiesModal
            initialOrder={hobbyOrder}
            onClose={() => setReorderOpen(false)}
            onSave={(newOrder) => setHobbyOrder(newOrder)}
          />
        )}

        {/* ── Fullscreen Photo ── */}
        {fullscreenPhoto && (() => {
          const h = HOBBIES.find(x => x.value === fullscreenPhoto.hobby)
          const linkedActivity = activities.find(a => a.hobby === fullscreenPhoto.hobby && a.note === fullscreenPhoto.note)
          return (
            <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 60, display: 'flex', flexDirection: 'column' }} onClick={() => setFullscreenPhoto(null)}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={fullscreenPhoto.image_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ position: 'absolute', top: 'calc(16px + env(safe-area-inset-top,0px))', right: 16 }}>
                <button onClick={() => setFullscreenPhoto(null)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </button>
              </div>
              <div style={{ padding: '16px 20px calc(24px + env(safe-area-inset-bottom,0px))', background: 'linear-gradient(transparent, rgba(0,0,0,.85))' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{h?.icon ?? '📷'}</span>
                    <b style={{ color: '#fff', fontFamily: DP, fontSize: 15, fontWeight: 700 }}>{h?.label ?? fullscreenPhoto.hobby}</b>
                  </div>
                  {linkedActivity && (
                    <button
                      onClick={() => { openActivity(linkedActivity); setFullscreenPhoto(null) }}
                      style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 20, padding: '7px 14px', color: '#fff', fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      View activity →
                    </button>
                  )}
                </div>
                {fullscreenPhoto.note && (
                  <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 13, margin: '6px 0 0', lineHeight: 1.4 }}>{fullscreenPhoto.note}</p>
                )}
              </div>
            </div>
          )
        })()}

        {/* ── Activity Detail / Edit Sheet ── */}
        {viewActivity && (() => {
          const h = HOBBIES.find(x => x.value === (actEditMode ? actEditForm.hobby : viewActivity.hobby))
          const hobbyList = [{ label: 'Fashion', icon: '👔', value: 'fashion' }, ...HOBBIES.map(hb => ({ label: hb.label, icon: hb.icon as string, value: hb.value }))]
          return (
            <>
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.4)', zIndex: 40 }} onClick={() => { setViewActivity(null); setActDeleteConfirm(false) }} />
              <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 0, width: '100%', maxWidth: 430, zIndex: 50, background: C.bg, borderRadius: '30px 30px 0 0', boxShadow: '0 -10px 40px rgba(60,40,15,.18)', maxHeight: '88dvh', display: 'flex', flexDirection: 'column', paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>
                <div style={{ width: 40, height: 5, borderRadius: 99, background: C.line, margin: '10px auto 2px', flexShrink: 0 }} />

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 12px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 26 }}>{h?.icon ?? '✨'}</span>
                    <div>
                      <b style={{ fontFamily: DP, fontSize: 17, fontWeight: 800, display: 'block' }}>{h?.label ?? viewActivity.hobby}</b>
                      <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>
                        {new Date(viewActivity.activity_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!actEditMode && (
                      <button onClick={() => setActEditMode(true)} style={{ padding: '8px 14px', borderRadius: 13, border: `1.5px solid ${C.line}`, background: C.card, fontFamily: UI, fontSize: 13, fontWeight: 700, color: C.ink, cursor: 'pointer' }}>
                        Edit
                      </button>
                    )}
                    <button onClick={() => { setViewActivity(null); setActDeleteConfirm(false) }} style={{ width: 38, height: 38, borderRadius: 13, border: 'none', background: C.card, cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: C.shadow }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                    </button>
                  </div>
                </div>

                <div style={{ overflowY: 'auto', padding: '0 18px 18px' }}>
                  {actEditMode ? (
                    <>
                      {/* Photo edit */}
                      <input ref={actPhotoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                        const file = e.target.files?.[0]; if (!file) return
                        setActNewPhotoFile(file)
                        const reader = new FileReader()
                        reader.onload = ev => setActNewPhotoPreview(ev.target?.result as string)
                        reader.readAsDataURL(file)
                      }} />
                      <CField label="Photo">
                        <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', marginBottom: 4, cursor: 'pointer' }} onClick={() => actPhotoInputRef.current?.click()}>
                          {actNewPhotoPreview || actPhoto ? (
                            <>
                              <img src={actNewPhotoPreview ?? actPhoto!.image_url} alt="" style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 200 }} />
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: '#fff', fontFamily: UI, fontSize: 13, fontWeight: 700, background: 'rgba(0,0,0,.4)', padding: '6px 14px', borderRadius: 20 }}>Change photo</span>
                              </div>
                            </>
                          ) : (
                            <div style={{ width: '100%', border: `2px dashed ${C.line}`, borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: C.muted, fontFamily: UI, fontSize: 13, fontWeight: 700, background: C.card }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                              Add photo
                            </div>
                          )}
                        </div>
                      </CField>
                      <CField label="Interest">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                          {hobbyList.map(hb => (
                            <button key={hb.value} onClick={() => setActEditForm(f => ({ ...f, hobby: hb.value }))} style={{ padding: '7px 13px', borderRadius: 99, border: `2px solid ${actEditForm.hobby === hb.value ? C.orange : C.line}`, background: actEditForm.hobby === hb.value ? C.orangeSoft : C.card, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: actEditForm.hobby === hb.value ? C.orange : C.ink }}>
                              {hb.icon} {hb.label}
                            </button>
                          ))}
                        </div>
                      </CField>
                      <CField label="Note">
                        <textarea value={actEditForm.note} onChange={e => setActEditForm(f => ({ ...f, note: e.target.value }))} rows={3} style={cInputStyle} />
                      </CField>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <CField label="Location" style={{ flex: 1 }}>
                          <input value={actEditForm.location} onChange={e => setActEditForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Home" style={cInputStyle} />
                        </CField>
                        <CField label="Date & time" style={{ flex: 1 }}>
                          <input type="datetime-local" value={actEditForm.at} onChange={e => setActEditForm(f => ({ ...f, at: e.target.value }))} style={cInputStyle} />
                        </CField>
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button onClick={() => setActEditMode(false)} style={{ flex: 1, border: `1.5px solid ${C.line}`, borderRadius: 16, padding: 14, cursor: 'pointer', background: C.card, fontFamily: UI, fontSize: 14, fontWeight: 700, color: C.ink }}>
                          Cancel
                        </button>
                        <button onClick={saveActivityEdit} disabled={actSavePending} style={{ flex: 2, border: 'none', borderRadius: 16, padding: 14, cursor: 'pointer', background: C.orange, color: '#fff', fontFamily: UI, fontSize: 14, fontWeight: 800, opacity: actSavePending ? 0.6 : 1 }}>
                          {actSavePending ? 'Saving…' : 'Save changes'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {actPhoto && (
                        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 12, cursor: 'pointer' }} onClick={() => setFullscreenPhoto(actPhoto)}>
                          <img src={actPhoto.image_url} alt="" style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 260 }} />
                        </div>
                      )}
                      <div style={{ background: C.card, borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
                        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: C.ink }}>{viewActivity.note}</p>
                      </div>
                      {viewActivity.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 2px', color: C.muted }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{viewActivity.location}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Delete — hidden at bottom */}
                  {!actEditMode && (
                    <div style={{ marginTop: 28, paddingTop: 16, borderTop: `1px solid ${C.line}`, textAlign: 'center' }}>
                      {actDeleteConfirm ? (
                        <button
                          onClick={deleteActivity}
                          style={{ background: C.danger, border: 'none', borderRadius: 14, padding: '10px 20px', color: '#fff', fontFamily: UI, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                        >
                          ⚠️ Confirm delete
                        </button>
                      ) : (
                        <button
                          onClick={() => setActDeleteConfirm(true)}
                          style={{ background: 'none', border: 'none', color: C.faint, fontFamily: UI, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '4px 8px' }}
                        >
                          Delete activity
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )
        })()}

        {/* ── Add Goal Sheet ── */}
        {goalSheetOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.4)', zIndex: 40 }} onClick={() => { setGoalSheetOpen(false); setEditGoalId(null); setGoalForm({ name: '', narrative: '', deadline: '' }) }} />
            <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 0, width: '100%', maxWidth: 430, zIndex: 50, background: C.bg, borderRadius: '30px 30px 0 0', boxShadow: '0 -10px 40px rgba(60,40,15,.18)', paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>
              <div style={{ width: 40, height: 5, borderRadius: 99, background: C.line, margin: '10px auto 2px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 12px' }}>
                <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, margin: 0 }}>{editGoalId ? 'Edit Goal' : 'New Goal'}</h2>
                <button onClick={() => { setGoalSheetOpen(false); setEditGoalId(null); setGoalForm({ name: '', narrative: '', deadline: '' }) }} style={{ width: 42, height: 42, borderRadius: 16, border: 'none', background: C.card, cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: C.shadow }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </button>
              </div>
              <div style={{ padding: '0 18px 18px' }}>
                <CField label="Goal name *">
                  <input value={goalForm.name} onChange={e => setGoalForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Planning for Q3" style={cInputStyle} />
                </CField>
                <CField label="Narrative">
                  <textarea value={goalForm.narrative} onChange={e => setGoalForm(f => ({ ...f, narrative: e.target.value }))} placeholder="What's the purpose of this goal?" rows={3} style={cInputStyle} />
                </CField>
                <CField label="Deadline">
                  <input type="date" value={goalForm.deadline} onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))} style={cInputStyle} />
                </CField>
                <button onClick={saveGoal} style={{ width: '100%', border: 'none', borderRadius: 18, padding: 17, cursor: 'pointer', marginTop: 8, background: C.orange, color: '#fff', fontFamily: UI, fontSize: 15, fontWeight: 800, boxShadow: '0 10px 22px rgba(255,122,47,.35)' }}>
                  Save Goal
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Add Task Sheet ── */}
        {taskSheetGoalId && (
          <>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.4)', zIndex: 40 }} onClick={() => setTaskSheetGoalId(null)} />
            <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 0, width: '100%', maxWidth: 430, zIndex: 50, background: C.bg, borderRadius: '30px 30px 0 0', boxShadow: '0 -10px 40px rgba(60,40,15,.18)', paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>
              <div style={{ width: 40, height: 5, borderRadius: 99, background: C.line, margin: '10px auto 2px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 12px' }}>
                <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, margin: 0 }}>Add Task</h2>
                <button onClick={() => setTaskSheetGoalId(null)} style={{ width: 42, height: 42, borderRadius: 16, border: 'none', background: C.card, cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: C.shadow }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </button>
              </div>
              <div style={{ padding: '0 18px 18px' }}>
                <CField label="Task *">
                  <input value={taskForm.task} onChange={e => setTaskForm(f => ({ ...f, task: e.target.value }))} placeholder="e.g. Conduct team workshop" style={cInputStyle} />
                </CField>
                <CField label="Week">
                  <div style={{ display: 'flex', gap: 8 }}>
                    {([1,2,3,4] as const).map(w => (
                      <button key={w} onClick={() => setTaskForm(f => ({ ...f, week: w }))} style={{ flex: 1, padding: '11px 0', borderRadius: 13, border: `2px solid ${taskForm.week === w ? C.orange : C.line}`, background: taskForm.week === w ? C.orangeSoft : C.card, color: taskForm.week === w ? C.orange : C.ink, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        W{w}
                      </button>
                    ))}
                  </div>
                </CField>
                <button onClick={saveTask} style={{ width: '100%', border: 'none', borderRadius: 18, padding: 17, cursor: 'pointer', marginTop: 8, background: C.orange, color: '#fff', fontFamily: UI, fontSize: 15, fontWeight: 800, boxShadow: '0 10px 22px rgba(255,122,47,.35)' }}>
                  Save Task
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Create Activity Sheet ── */}
        {createOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(50,35,15,.4)', zIndex: 40 }} onClick={() => { setCreateOpen(false); resetCreate() }} />
            <div style={{
              position: 'fixed', left: '50%', transform: 'translateX(-50%)',
              bottom: 0, width: '100%', maxWidth: 430, zIndex: 50,
              background: C.bg, borderRadius: '30px 30px 0 0',
              boxShadow: '0 -10px 40px rgba(60,40,15,.18)',
              maxHeight: '92dvh', display: 'flex', flexDirection: 'column',
              paddingBottom: 'env(safe-area-inset-bottom,0px)',
            }}>
              <div style={{ width: 40, height: 5, borderRadius: 99, background: C.line, margin: '10px auto 2px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 12px' }}>
                <h2 style={{ fontFamily: DP, fontSize: 20, fontWeight: 800, margin: 0 }}>
                  Log activity
                </h2>
                <button onClick={() => { setCreateOpen(false); resetCreate() }}
                  style={{ width: 42, height: 42, borderRadius: 16, border: 'none', background: C.card, cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: C.shadow }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </button>
              </div>

              {/* Main form */}
              <div style={{ overflowY: 'auto', padding: '0 18px 18px' }}>
                {/* Hobby picker */}
                <CField label="Interest *">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {[{ label: 'Fashion', icon: '👔', value: 'fashion' }, ...HOBBIES.map(h => ({ label: h.label, icon: h.icon as string, value: h.value }))].map(h => (
                      <button key={h.value} onClick={() => setCreateHobby(h.value)} style={{
                        padding: '7px 13px', borderRadius: 99, border: `2px solid ${createHobby === h.value ? C.orange : C.line}`,
                        background: createHobby === h.value ? C.orangeSoft : C.card,
                        fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        color: createHobby === h.value ? C.orange : C.ink,
                      }}>
                        {h.icon} {h.label}
                      </button>
                    ))}
                  </div>
                </CField>

                <CField label="What did you do? *">
                  <textarea
                    value={createNote}
                    onChange={e => setCreateNote(e.target.value)}
                    placeholder="e.g. Went for a ride, cleaned my gear…"
                    rows={3}
                    style={cInputStyle}
                  />
                </CField>

                <div style={{ display: 'flex', gap: 10 }}>
                  <CField label="Location" style={{ flex: 1 }}>
                    <input value={createLocation} onChange={e => setCreateLocation(e.target.value)} placeholder="e.g. Home, Garage" style={cInputStyle} />
                  </CField>
                  <CField label="Date & time" style={{ flex: 1 }}>
                    <input type="datetime-local" value={createAt} onChange={e => setCreateAt(e.target.value)} style={cInputStyle} />
                  </CField>
                </div>

                {/* Photo capture */}
                <CField label="Photo (optional)">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                  {createPhoto ? (
                    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={createPhoto} alt="captured" style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 160 }} />
                      <button onClick={() => { setCreatePhoto(null); setCreatePhotoFile(null) }} style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(34,25,15,.7)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => photoInputRef.current?.click()} style={{ width: '100%', border: `2px dashed ${C.line}`, borderRadius: 16, padding: 20, cursor: 'pointer', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: C.muted, fontFamily: UI, fontSize: 14, fontWeight: 700 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      Take photo
                    </button>
                  )}
                </CField>

                {createError && <p style={{ color: C.danger, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{createError}</p>}

                <button
                  onClick={handleCreateSave}
                  disabled={createPending}
                  style={{ width: '100%', border: 'none', borderRadius: 18, padding: 17, cursor: 'pointer', marginTop: 8, background: C.orange, color: '#fff', fontFamily: UI, fontSize: 15, fontWeight: 800, boxShadow: '0 10px 22px rgba(255,122,47,.35)', opacity: createPending ? 0.6 : 1 }}
                >
                  {createPending ? 'Saving…' : 'Save activity'}
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

function CField({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#8D8271', marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  )
}

const cInputStyle: React.CSSProperties = {
  width: '100%', background: '#FFFFFF', border: '1.5px solid #EFE6D6',
  borderRadius: 16, color: '#22190F',
  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
  fontSize: 15, fontWeight: 500, padding: '13px 15px', outline: 'none',
  boxSizing: 'border-box', resize: 'none' as const,
}

function EmptyState({ icon, title, desc, children }: { icon: string; title: string; desc: string; children?: React.ReactNode }) {
  return (
    <div style={{ padding: '50px 24px', textAlign: 'center', color: C.muted }}>
      <div style={{ width: 60, height: 60, borderRadius: 22, background: C.card, boxShadow: C.shadow, display: 'grid', placeItems: 'center', margin: '0 auto 14px', fontSize: 26 }}>{icon}</div>
      <b style={{ display: 'block', color: C.ink, fontFamily: DP, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</b>
      <p style={{ fontSize: 13, lineHeight: 1.5 }}>{desc}</p>
      {children}
    </div>
  )
}
