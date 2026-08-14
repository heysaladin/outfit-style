'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { HOBBIES } from '@/lib/types'
import type { HobbyActivity, HobbyPhoto } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { ReorderHobbiesModal, getOrderedHobbies } from '@/components/gear/ReorderHobbiesModal'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/ThemeProvider'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from '@/components/ui/drawer'

type Tab = 'home' | 'stats' | 'gallery' | 'search' | 'hobby'
type MonthlyGoal = { id: string; name: string; narrative: string; deadline: string }
type GoalTask = { id: string; goal_id: string; task: string; week: 1|2|3|4; done: boolean }

const TINTS = ['#FFE9DB','#DDF4EA','#FFF3D1','#EDE6FD','#DCE8F5','#FBE0DC']

function NavTab({ label, active, onClick, children }: {
  label: string; active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center w-14 h-full bg-transparent border-0 cursor-pointer',
        active ? 'text-[var(--app-orange)]' : 'text-[rgba(255,255,255,0.45)]'
      )}
    >
      <span className={cn(
        'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200',
        active ? 'bg-[rgba(241,242,82,0.15)]' : ''
      )}>
        {children}
      </span>
    </button>
  )
}

function CField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-2 mb-4', className)}>
      <Label className="text-caption font-bold tracking-caption uppercase text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function EmptyState({ icon, title, desc, children }: { icon: string; title: string; desc: string; children?: React.ReactNode }) {
  return (
    <div className="py-7 text-center">
      <div className="w-13 h-13 rounded-[18px] bg-card border shadow-sm flex items-center justify-center mx-auto mb-2.5 text-[22px] w-[52px] h-[52px]">{icon}</div>
      <b className="block text-para-sm font-bold mb-1 font-heading">{title}</b>
      <p className="text-para-xs text-muted-foreground m-0">{desc}</p>
      {children}
    </div>
  )
}

export default function Home() {
  const [tab, setTab]               = useState<Tab>('home')
  const { theme, toggle: toggleTheme } = useTheme()
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
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())

  // Activity detail / edit
  const [viewActivity, setViewActivity] = useState<HobbyActivity | null>(null)
  const [actEditMode, setActEditMode] = useState(false)
  const [actEditForm, setActEditForm] = useState({ hobby: '', note: '', location: '', at: '' })
  const [actDeleteConfirm, setActDeleteConfirm] = useState(false)
  const [actSavePending, setActSavePending] = useState(false)
  const [actPhoto, setActPhoto] = useState<HobbyPhoto | null>(null)
  const [actNewPhotoPreview, setActNewPhotoPreview] = useState<string | null>(null)
  const [actNewPhotoFile, setActNewPhotoFile] = useState<File | null>(null)
  const [actDeletePhoto, setActDeletePhoto] = useState(false)
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
        supabase.from('wardrobe_items').select('*', { count: 'exact', head: true }).eq('user_id', u.id).eq('status', 'verified'),
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

  const firstName = 'Saladin'
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
    const linked = photo ?? photos.find(p => p.hobby === act.hobby && p.note === act.note) ?? null
    setActPhoto(linked)
  }

  async function saveActivityEdit() {
    if (!viewActivity) return
    setActSavePending(true)
    const supabase = createClient()
    const { data: { user: u } } = await supabase.auth.getUser()

    // Delete photo if requested
    if (actDeletePhoto && actPhoto) {
      const oldPath = actPhoto.image_url.match(/\/wardrobe\/(.+)$/)?.[1]
      if (oldPath) await supabase.storage.from('wardrobe').remove([oldPath])
      await supabase.from('hobby_photos').delete().eq('id', actPhoto.id)
      setPhotos(prev => prev.filter(p => p.id !== actPhoto.id))
      setActPhoto(null)
      setActDeletePhoto(false)
    }

    // Upload new photo if selected
    if (!actDeletePhoto && actNewPhotoFile && u) {
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
    setActDeletePhoto(false)
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
      const storagePath = photo.image_url.match(/\/wardrobe\/(.+)$/)?.[1]
      if (storagePath) await supabase.storage.from('wardrobe').remove([storagePath])
      await supabase.from('hobby_photos').delete().eq('id', photo.id)
    } else if (act.note) {
      const { data: matchedPhotos } = await supabase.from('hobby_photos').select('id, image_url').eq('hobby', act.hobby).eq('note', act.note)
      if (matchedPhotos?.length) {
        const paths = matchedPhotos.map(p => p.image_url.match(/\/wardrobe\/(.+)$/)?.[1]).filter(Boolean) as string[]
        if (paths.length) await supabase.storage.from('wardrobe').remove(paths)
      }
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
    <div className="h-dvh w-full overflow-hidden" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-[430px] h-dvh bg-background mx-auto relative flex flex-col overflow-hidden">

        {/* ── Sticky Header ── */}
        <header className="flex-shrink-0 px-5 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] pb-3.5 flex items-center justify-between" style={{ background: '#1C1917' }}>
          <span className="font-heading font-extrabold text-h3 tracking-tight" style={{ color: 'var(--app-orange)' }}>
            interestory
          </span>
          <Avatar
            className="w-10 h-10 flex-shrink-0 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setPopOpen(v => !v) }}
          >
            <AvatarImage src="https://heysaladindesign.web.app/pictures/avatar.png" alt="avatar" />
            <AvatarFallback>{avatarLetter}</AvatarFallback>
          </Avatar>
        </header>

        {/* ── Popup menu ── */}
        {popOpen && (
          <div className="fixed inset-0 z-[55]" onClick={() => setPopOpen(false)}>
            <div
              className="absolute bg-card rounded-[20px] min-w-[240px] max-w-[calc(100vw-32px)] shadow-lg border overflow-hidden"
              style={{ top: 'calc(70px + env(safe-area-inset-top,0px))', right: 16 }}
              onClick={e => e.stopPropagation()}
            >
              {user ? (
                <>
                  <div className="px-4 py-3.5 text-para-xs font-semibold text-muted-foreground border-b overflow-hidden text-ellipsis whitespace-nowrap">
                    {user.email}
                  </div>
                  <button
                    className="flex w-full items-center gap-2.5 bg-transparent border-0 text-foreground text-para-sm font-semibold px-4 py-3.5 cursor-pointer text-left hover:bg-foreground/[0.08] transition-colors"
                    onClick={() => { toggleTheme(); setPopOpen(false) }}
                  >
                    {theme === 'dark' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                    )}
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </button>
                  <button
                    className="flex w-full items-center gap-2.5 bg-transparent border-0 text-foreground text-para-sm font-semibold px-4 py-3.5 cursor-pointer text-left hover:bg-foreground/[0.08] transition-colors"
                    onClick={() => { setPopOpen(false); setReorderOpen(true) }}
                  >
                    ⇅ &nbsp;Reorder interests
                  </button>
                  <form action="/auth/signout" method="post" className="m-0">
                    <button className="flex w-full items-center bg-transparent border-0 text-destructive text-para-sm font-semibold px-4 py-3.5 cursor-pointer text-left hover:bg-accent transition-colors">
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="block px-4 py-3.5 text-foreground font-semibold text-para-sm no-underline hover:bg-accent transition-colors" onClick={() => setPopOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Scrollable content ── */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-[18px]"
          style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom,0px))' }}
        >

          {/* ════ HOME TAB ════ */}
          {tab === 'home' && (
            <>
              {/* ── Dark hero section — connects with header ── */}
              <div style={{ background: '#1C1917', margin: '0 -18px 48px', padding: '12px 18px 32px', borderRadius: '0 0 20px 20px', height: '41%' }}>
                {/* Date + greeting */}
                <div className="pt-2 pb-1 mx-1">
                  <p className="text-caption font-semibold tracking-caption uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>{dateStr}</p>
                  <h1 className="leading-[1.06] m-0 mt-1 font-heading" style={{ color: '#fff', fontWeight: 400, fontSize: 32 }}>
                    Hey {firstName},<br />let&apos;s add to your{' '}
                    <em className="not-italic" style={{ color: 'var(--app-orange)' }}>story</em>
                  </h1>
                </div>

                {/* Momo card — inside dark section */}
                <div className="mt-3 rounded-[20px] flex items-center gap-4 p-4" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/momo.png" alt="Momo" className="w-16 h-16 flex-shrink-0 object-contain" />
                  <div>
                    <p className="font-bold text-para-md leading-snug m-0" style={{ color: '#fff', fontFamily: 'var(--font-sans)' }}>
                      {streak > 1
                        ? `"${streak}-day streak! You're on fire 🔥"`
                        : streak === 1
                        ? '"Great start! Keep logging today 🎯"'
                        : '"Start logging to build your story 🎯"'}
                    </p>
                    <span className="text-para-xs mt-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Momo · your interest friend</span>
                  </div>
                </div>

                {/* Week streak dots */}
                <div className="mt-3 rounded-[20px] flex items-center justify-between p-4" style={{ background: 'rgb(48,45,44)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-h3 font-extrabold" style={{ color: '#fff', fontFamily: 'var(--font-sans)' }}>🔥 {streak}</span>
                    <span className="text-para-xs font-semibold leading-[1.3]" style={{ color: 'rgba(255,255,255,0.45)' }}>day<br />streak</span>
                  </div>
                  <div className="flex gap-[9px]">
                    {weekDots.map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-[5px]">
                        <span className="text-para-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>{d.label}</span>
                        <div className="w-2.5 h-2.5 rounded-full" style={{
                          background: d.active ? 'var(--app-orange)' : 'rgba(255,255,255,0.15)',
                          outline: d.isToday ? '2px solid var(--app-orange)' : 'none',
                          outlineOffset: '2px',
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Week streak dots */}
              {/* Recent Activities */}
              {activities.length > 0 && (
                <>
                  <div className="flex items-baseline justify-between mt-[22px] mb-2.5 mx-1">
                    <h2 className="text-para-lg font-bold tracking-h2 m-0 font-heading">Recent</h2>
                  </div>
                  <div className="flex flex-col gap-2">
                    {activities.slice(0, 3).map(act => {
                      const h = HOBBIES.find(x => x.value === act.hobby)
                      const diff = Math.floor((now.getTime() - new Date(act.activity_at).getTime()) / 86400000)
                      const timeAgo = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : `${diff}d ago`
                      return (
                        <Card key={act.id} className="cursor-pointer" onClick={() => openActivity(act)}>
                          <CardContent className="flex items-center gap-3 p-3">
                            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center text-[19px] flex-shrink-0" style={{ background: 'var(--app-orange-soft)' }}>
                              {h?.icon ?? '✨'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-para-sm font-heading">{h?.label ?? act.hobby}</span>
                                <span className="text-para-xs font-semibold text-muted-foreground/60">{timeAgo}</span>
                              </div>
                              <p className="text-para-xs text-muted-foreground m-0 overflow-hidden text-ellipsis whitespace-nowrap">{act.note}</p>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-muted-foreground/40"><path d="M9 18l6-6-6-6"/></svg>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Monthly Goals */}
              <div className="flex items-baseline justify-between mt-[22px] mb-3 mx-1">
                <h2 className="text-para-lg font-bold tracking-h2 m-0 font-heading">
                  Monthly Goals
                </h2>
                <button
                  onClick={() => setGoalSheetOpen(true)}
                  className="bg-transparent border-0 cursor-pointer text-para-sm font-bold px-1 py-1"
                  style={{ color: 'var(--app-ink)' }}
                >
                  + Add
                </button>
              </div>

              {goals.length === 0 ? (
                <EmptyState icon="🎯" title="No goals yet" desc="Set monthly goals to stay on track" />
              ) : (
                <div className="flex flex-col gap-[11px]">
                  {goals.map(goal => {
                    const tasks = goalTasks.filter(t => t.goal_id === goal.id)
                    const doneCount = tasks.filter(t => t.done).length
                    const pct = tasks.length > 0 ? doneCount / tasks.length : 0
                    const deadlineDate = goal.deadline ? new Date(goal.deadline) : null
                    const isOverdue = deadlineDate && deadlineDate < new Date() && pct < 1
                    return (
                      <Card key={goal.id}>
                        <CardContent className="p-4 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-para-sm leading-snug flex-1 m-0 font-heading">{goal.name}</h3>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {deadlineDate && (
                                <span
                                  className="text-para-xs font-bold px-[9px] py-1 rounded-full"
                                  style={{
                                    color: isOverdue ? 'var(--destructive)' : 'var(--muted-foreground)',
                                    background: isOverdue ? '#FDE8E4' : 'var(--secondary)',
                                  }}
                                >
                                  {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                              <button
                                onClick={() => { setEditGoalId(goal.id); setGoalForm({ name: goal.name, narrative: goal.narrative ?? '', deadline: goal.deadline ?? '' }); setGoalSheetOpen(true) }}
                                className="bg-transparent border-0 cursor-pointer text-muted-foreground/50 p-0.5 flex items-center justify-center"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button
                                onClick={() => deleteGoal(goal.id)}
                                className="bg-transparent border-0 cursor-pointer text-muted-foreground/50 p-0.5 flex items-center justify-center"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                              </button>
                            </div>
                          </div>

                          {goal.narrative && (
                            <p className="text-para-xs text-muted-foreground m-0 leading-relaxed">{goal.narrative}</p>
                          )}

                          {tasks.length > 0 && (
                            <div>
                              <div className="flex justify-between text-para-xs font-bold text-muted-foreground/60 mb-1.5 uppercase tracking-wider">
                                <span>Progress</span>
                                <span>{doneCount}/{tasks.length} tasks</span>
                              </div>
                              <Progress value={pct * 100} className="h-[5px]" />
                            </div>
                          )}

                          {([1,2,3,4] as const).map(week => {
                            const weekTasks = tasks.filter(t => t.week === week)
                            if (weekTasks.length === 0) return null
                            return (
                              <div key={week} className="mb-1">
                                <span className="text-para-xs font-extrabold tracking-[0.06em] uppercase text-muted-foreground/60 block mb-0.5">Week {week}</span>
                                {weekTasks.map(t => (
                                  <div key={t.id} className="flex items-center gap-2 py-[5px]">
                                    <div
                                      onClick={() => toggleTask(t.id)}
                                      className="w-5 h-5 rounded-[7px] flex-shrink-0 cursor-pointer flex items-center justify-center"
                                      style={{
                                        border: `2px solid ${t.done ? 'var(--app-mint)' : 'var(--border)'}`,
                                        background: t.done ? 'var(--app-mint)' : 'transparent',
                                      }}
                                    >
                                      {t.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>}
                                    </div>
                                    <span className={cn('flex-1 text-para-sm font-medium', t.done ? 'text-muted-foreground/60 line-through' : 'text-foreground')}>{t.task}</span>
                                    <button onClick={() => deleteTask(t.id)} className="bg-transparent border-0 cursor-pointer text-muted-foreground/50 p-0.5 flex items-center justify-center opacity-60">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )
                          })}

                          <button
                            onClick={() => { setTaskSheetGoalId(goal.id); setTaskForm({ task: '', week: 1 }) }}
                            className="mt-2 bg-transparent border-dashed border rounded-xl px-3 py-[7px] cursor-pointer text-muted-foreground text-para-xs font-bold w-full"
                          >
                            + Add task
                          </button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Calendar */}
              <div className="mt-[22px] mb-2">
                <h2 className="text-para-lg font-bold tracking-h2 mx-1 mb-3 mt-0 font-heading">Calendar</h2>
                <div className="rounded-[22px] overflow-hidden">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?src=79c86e5c0191c5c80b01061a0a7a82c71a621d0d74fab55e7d3091d1a7a5c351%40group.calendar.google.com&ctz=Asia%2FJakarta"
                    style={{ border: 0, display: 'block', filter: 'sepia(0.55) saturate(0.85) contrast(0.9) brightness(1.04)' }}
                    width="100%"
                    height="500"
                    frameBorder={0}
                    scrolling="no"
                  />
                </div>
              </div>
            </>
          )}

          {/* ════ HOBBY TAB ════ */}
          {tab === 'hobby' && (
            <>
              <div className="flex items-baseline justify-between mt-[22px] mb-3 mx-1">
                <h2 className="text-para-lg font-bold tracking-h2 m-0 font-heading">
                  Interests <small className="text-para-xs text-muted-foreground/60 font-semibold ml-1">{hobbyLinks.length}</small>
                </h2>
                <button
                  className="bg-transparent border-0 text-para-sm font-bold cursor-pointer px-1 py-1"
                  style={{ color: 'var(--app-orange)' }}
                  onClick={() => setReorderOpen(true)}
                >
                  Reorder
                </button>
              </div>

              <div className="grid grid-cols-2 gap-[11px]">
                {hobbyLinks.map(({ label, icon, href, value }, i) => {
                  const count = gearCounts[value] ?? 0
                  const last = lastActive[value]
                  const dots = weekDays.map(d =>
                    activities.some(a => a.hobby === value && new Date(a.activity_at).toDateString() === d.toDateString())
                  )
                  return (
                    <Link key={label} href={href} prefetch={false} className="block no-underline">
                      <Card className="hover:shadow-md transition-shadow h-full">
                        <CardContent className="p-[15px_14px_13px] flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <span className="w-10 h-10 rounded-[14px] flex items-center justify-center text-[21px]" style={{ background: TINTS[i % TINTS.length] }}>
                              {icon}
                            </span>
                            <Badge variant="secondary" className="text-para-xs font-bold">{count} items</Badge>
                          </div>
                          <div className="font-bold text-para-sm tracking-tight font-heading">
                            {value === 'social' ? 'Life (Cleaning)' : label}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-para-xs font-semibold text-muted-foreground/60">{last ?? 'not started'}</span>
                            <span className="flex gap-[3.5px]">
                              {dots.map((on, j) => (
                                <i key={j} className="block w-[5px] h-[5px] rounded-full not-italic" style={{ background: on ? 'var(--app-mint)' : 'var(--border)' }} />
                              ))}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </>
          )}

          {/* ════ STATS TAB ════ */}
          {tab === 'stats' && (
            <div className="pt-4">
              {!user ? (
                <EmptyState icon="📊" title="Sign in to see stats" desc="Track your hobby activity over time">
                  <Link href="/login" className="font-bold text-para-sm mt-3 inline-block" style={{ color: 'var(--app-orange)' }}>Login</Link>
                </EmptyState>
              ) : activities.length === 0 ? (
                <EmptyState icon="📈" title="No activities yet" desc="Start logging activities in your hobbies" />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-[11px] mt-3.5">
                    {[
                      { v: streak, unit: 'days', l: 'Current streak' },
                      { v: activities.length, unit: '', l: 'Total activities' },
                      { v: Object.keys(lastActive).length, unit: '', l: 'Active hobbies' },
                      { v: Object.values(gearCounts).reduce((a, b) => a + b, 0), unit: '', l: 'Items catalogued' },
                    ].map((s, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="text-h2 font-extrabold leading-none font-heading">
                            {s.v}{s.unit ? <small className="text-para-sm text-muted-foreground font-semibold"> {s.unit}</small> : null}
                          </div>
                          <div className="text-caption font-bold tracking-caption uppercase text-muted-foreground/60 mt-2">{s.l}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {hobbiesByActivity.length > 0 && (
                    <Card className="mt-3">
                      <CardContent className="p-[17px_15px]">
                        <h3 className="font-bold text-para-md m-0 mb-1 font-heading">Top hobbies</h3>
                        {hobbiesByActivity.slice(0, 5).map((h, i) => {
                          const maxC = hobbiesByActivity[0].count
                          const pct = maxC > 0 ? (h.count / maxC) * 100 : 0
                          const colors = ['var(--app-orange)', 'var(--app-mint)', 'var(--app-sun)', 'var(--app-berry)', '#0ea5e9']
                          const bgs = ['var(--app-orange-soft)', 'var(--app-mint-soft)', 'var(--app-sun-soft)', '#EDE6FD', '#E0F2FE']
                          return (
                            <div key={h.value} className={cn('flex items-center gap-3 py-3 px-0.5', i > 0 ? 'border-t' : '')}>
                              <span className="font-extrabold text-para-sm text-muted-foreground/60 w-[18px] font-heading">{i + 1}</span>
                              <span className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center text-[19px] flex-shrink-0" style={{ background: bgs[i] }}>{h.icon}</span>
                              <div className="flex-1 min-w-0">
                                <b className="text-para-sm font-bold block">{h.label}</b>
                                <span className="text-para-xs font-medium text-muted-foreground">{h.count} activities</span>
                                <div className="h-[5px] rounded-full mt-1.5" style={{ background: colors[i], width: `${pct}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════ SEARCH TAB ════ */}
          {tab === 'search' && (
            <div className="pt-4">
              <div className="relative mb-[18px]">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
                </svg>
                <Input
                  ref={searchRef}
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search hobbies or activities…"
                  className="pl-[42px] pr-10 h-[50px] rounded-full text-para-md font-medium bg-secondary border-0"
                />
                {searchQ && (
                  <button onClick={() => setSearchQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer text-muted-foreground/60 p-1">
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
                  <p className="text-caption font-bold tracking-caption uppercase text-muted-foreground/60 mb-2.5 ml-0.5">Interests</p>
                  <div className="grid grid-cols-2 gap-[11px] mb-[22px]">
                    {filteredHobbies.map(({ label, icon, href, value }, i) => {
                      const count = gearCounts[value] ?? 0
                      const last = lastActive[value]
                      return (
                        <Link key={value} href={href} prefetch={false} className="block no-underline">
                          <Card className="hover:shadow-md transition-shadow h-full">
                            <CardContent className="p-[15px_14px_13px] flex flex-col gap-2.5">
                              <div className="flex items-center justify-between">
                                <span className="w-10 h-10 rounded-[14px] flex items-center justify-center text-[21px]" style={{ background: TINTS[i % TINTS.length] }}>{icon}</span>
                                <Badge variant="secondary" className="text-para-xs font-bold">{count} items</Badge>
                              </div>
                              <div className="font-bold text-para-sm font-heading">{label}</div>
                              <span className="text-para-xs font-semibold text-muted-foreground/60">{last ?? 'not started'}</span>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}

              {filteredActivities.length > 0 && (
                <>
                  <p className="text-caption font-bold tracking-caption uppercase text-muted-foreground/60 mb-2.5 ml-0.5">Activities</p>
                  <div className="flex flex-col gap-[9px]">
                    {filteredActivities.map(act => {
                      const h = HOBBIES.find(x => x.value === act.hobby)
                      return (
                        <Card key={act.id}>
                          <CardContent className="flex gap-3 p-3.5 items-center">
                            <Link href={`/${act.hobby}`} className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center text-[19px] flex-shrink-0 no-underline" style={{ background: 'var(--app-orange-soft)' }}>
                              {h?.icon ?? '✨'}
                            </Link>
                            <div className="flex-1 min-w-0">
                              <b className="text-para-sm font-bold block overflow-hidden text-ellipsis whitespace-nowrap">{act.note ?? 'Session logged'}</b>
                              <span className="text-para-xs text-muted-foreground">{h?.label ?? act.hobby}{act.location ? ` · ${act.location}` : ''}</span>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ════ GALLERY TAB ════ */}
          {tab === 'gallery' && (
            <div className="pt-4">
              {!user ? (
                <EmptyState icon="🖼️" title="Sign in to see gallery" desc="Your captured moments will appear here">
                  <Link href="/login" className="font-bold text-para-sm mt-3 inline-block" style={{ color: 'var(--app-orange)' }}>Login</Link>
                </EmptyState>
              ) : (() => {
                const noPhotoActs = activities.filter(act =>
                  !photos.some(p => p.hobby === act.hobby && p.note === act.note)
                )
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
                  <div className="flex flex-col gap-3 mt-1">
                    {feed.map(item => {
                      if (item.type === 'photo') {
                        const p = item.photo
                        const h = HOBBIES.find(x => x.value === p.hobby)
                        const linkedActivity = activities.find(a => a.hobby === p.hobby && a.note === p.note)
                          ?? activities.find(a => a.hobby === p.hobby)
                        return (
                          <Card key={`p-${p.id}`} className="overflow-hidden">
                            <div onClick={() => setFullscreenPhoto(p)} className="cursor-pointer rounded-t-lg overflow-hidden">
                              <img src={p.image_url} alt={p.hobby} className="w-full block object-cover max-h-[420px]" />
                            </div>
                            <CardContent className="p-[12px_14px_14px]">
                              {p.note && <p className="text-para-md font-semibold m-0 mb-2.5 leading-[1.4]">{p.note}</p>}
                              <div className="flex items-center justify-between gap-2.5">
                                <div className="flex gap-2.5 items-center flex-1 min-w-0">
                                  <span className="text-[22px] flex-shrink-0">{h?.icon ?? '📷'}</span>
                                  <b className="font-bold text-para-sm block font-heading">{h?.label ?? p.hobby}</b>
                                </div>
                                {(() => {
                                  const ts = linkedActivity?.activity_at ?? p.created_at
                                  const d = new Date(ts)
                                  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
                                  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                  const label = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                  return (
                                    <span className="flex-shrink-0 text-para-xs font-semibold text-muted-foreground/60">
                                      {label} · {timeStr}
                                    </span>
                                  )
                                })()}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      } else {
                        const act = item.act
                        const h = HOBBIES.find(x => x.value === act.hobby)
                        const actD = new Date(act.activity_at)
                        const diff = Math.floor((now.getTime() - actD.getTime()) / 86400000)
                        const actTimeStr = actD.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        const actLabel = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : actD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        const timeAgo = `${actLabel} · ${actTimeStr}`
                        const text = act.note ?? 'Session logged'
                        const SHORT = 120
                        const LONG  = 400
                        const isShort = text.length <= SHORT
                        const isVeryLong = text.length > LONG
                        const isExpanded = expandedPosts.has(act.id)
                        const toggleExpand = (e: React.MouseEvent) => {
                          e.stopPropagation()
                          setExpandedPosts(prev => {
                            const next = new Set(prev)
                            isExpanded ? next.delete(act.id) : next.add(act.id)
                            return next
                          })
                        }
                        if (isVeryLong) return (
                          <Card key={`a-${act.id}`}>
                            <CardContent className="p-4 pb-3.5">
                              <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[18px]">{h?.icon ?? '✨'}</span>
                                <span className="text-para-sm font-semibold text-muted-foreground">{h?.label ?? act.hobby}</span>
                                <span className="ml-auto text-para-xs font-semibold text-muted-foreground/60">{timeAgo}</span>
                              </div>
                              <p
                                onClick={() => openActivity(act)}
                                className="m-0 text-para-sm font-medium leading-relaxed text-left break-words cursor-pointer overflow-hidden"
                                style={{
                                  display: '-webkit-box',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: isExpanded ? 'unset' : 5,
                                  overflow: 'hidden',
                                } as React.CSSProperties}
                              >
                                {text}
                              </p>
                              <button
                                onClick={toggleExpand}
                                className="bg-transparent border-0 pt-1.5 pb-0 px-0 text-para-sm font-bold cursor-pointer"
                                style={{ color: 'var(--app-orange)' }}
                              >
                                {isExpanded ? 'Show less' : 'Read more'}
                              </button>
                            </CardContent>
                          </Card>
                        )
                        if (!isShort) return (
                          <Card key={`a-${act.id}`}>
                            <CardContent className="p-4 pb-3.5">
                              <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[18px]">{h?.icon ?? '✨'}</span>
                                <span className="text-para-sm font-semibold text-muted-foreground">{h?.label ?? act.hobby}</span>
                                <span className="ml-auto text-para-xs font-semibold text-muted-foreground/60">{timeAgo}</span>
                              </div>
                              <p
                                onClick={() => openActivity(act)}
                                className="m-0 text-para-sm font-medium leading-relaxed text-left break-words cursor-pointer"
                              >
                                {text}
                              </p>
                            </CardContent>
                          </Card>
                        )
                        return (
                          <div
                            key={`a-${act.id}`}
                            onClick={() => openActivity(act)}
                            className="rounded-[20px] overflow-hidden relative shadow-lg min-h-[140px] flex flex-col justify-between cursor-pointer"
                            style={{ background: '#1C130A' }}
                          >
                            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,122,47,.12) 0%, rgba(63,191,143,.08) 100%)' }} />
                            <div className="relative p-[20px_18px_12px] flex-1 flex flex-col justify-center items-center text-center">
                              <p className="m-0 text-h3 font-extrabold leading-[1.25] text-white break-words font-heading">
                                {text}
                              </p>
                            </div>
                            <div className="relative p-[0_18px_16px] flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[18px]">{h?.icon ?? '✨'}</span>
                                <span className="text-para-xs font-semibold" style={{ color: 'rgba(255,255,255,.5)' }}>{h?.label ?? act.hobby}</span>
                              </div>
                              <span className="text-para-xs font-semibold" style={{ color: 'rgba(255,255,255,.5)' }}>{timeAgo}</span>
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
          width: 'min(calc(100% - 24px), 406px)',
          height: 66,
          borderRadius: 9999,
          background: '#1C1917',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
          padding: '0 8px',
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
                background: 'var(--app-orange)', display: 'grid', placeItems: 'center',
                boxShadow: '0 10px 24px rgba(241,242,82,0.35)',
              }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1C1917" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
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
            <div className="fixed inset-0 bg-black z-[60] flex flex-col" onClick={() => setFullscreenPhoto(null)}>
              <div className="flex-1 flex items-center justify-center">
                <img src={fullscreenPhoto.image_url} alt="" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="absolute" style={{ top: 'calc(16px + env(safe-area-inset-top,0px))', right: 16 }}>
                <button onClick={() => setFullscreenPhoto(null)} className="w-9 h-9 rounded-full border-0 flex items-center justify-center cursor-pointer" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </button>
              </div>
              <div className="p-[16px_20px] pb-[calc(24px+env(safe-area-inset-bottom,0px))]" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,.85))' }} onClick={e => e.stopPropagation()}>
                {fullscreenPhoto.note && (
                  <p className="text-para-md font-semibold m-0 mb-3 leading-[1.4]" style={{ color: 'rgba(255,255,255,.9)' }}>{fullscreenPhoto.note}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">{h?.icon ?? '📷'}</span>
                    <b className="text-white font-bold text-para-md font-heading">{h?.label ?? fullscreenPhoto.hobby}</b>
                  </div>
                  {linkedActivity && (
                    <button
                      onClick={() => { openActivity(linkedActivity); setFullscreenPhoto(null) }}
                      className="border-0 rounded-[20px] px-3.5 py-[7px] text-white text-para-xs font-bold cursor-pointer"
                      style={{ background: 'rgba(255,255,255,.2)' }}
                    >
                      View activity →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── Activity Detail / Edit Sheet ── */}
        <Drawer
          open={!!viewActivity}
          onOpenChange={(open: boolean) => { if (!open) { setViewActivity(null); setActDeleteConfirm(false) } }}
        >
          <DrawerContent className="max-h-[88dvh]">
            {viewActivity && (() => {
              const h = HOBBIES.find(x => x.value === (actEditMode ? actEditForm.hobby : viewActivity.hobby))
              const hobbyList = [{ label: 'Fashion', icon: '👔', value: 'fashion' }, ...HOBBIES.map(hb => ({ label: hb.label, icon: hb.icon as string, value: hb.value }))]
              return (
                <>
                  <DrawerHeader className="flex-row items-center justify-between p-[10px_18px_12px] gap-2.5 text-left">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[26px]">{h?.icon ?? '✨'}</span>
                      <div>
                        <DrawerTitle className="text-para-lg font-extrabold block font-heading">{h?.label ?? viewActivity.hobby}</DrawerTitle>
                        <span className="text-para-xs text-muted-foreground font-semibold">
                          {new Date(viewActivity.activity_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!actEditMode && (
                        <Button variant="outline" size="sm" onClick={() => setActEditMode(true)} className="rounded-[13px] font-bold">
                          Edit
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => { setViewActivity(null); setActDeleteConfirm(false) }} className="rounded-[13px] w-[38px] h-[38px]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                      </Button>
                    </div>
                  </DrawerHeader>

                  <div className="overflow-y-auto px-[18px] pb-[18px]">
                    {actEditMode ? (
                      <>
                        <input ref={actPhotoInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                          const file = e.target.files?.[0]; if (!file) return
                          setActNewPhotoFile(file)
                          const reader = new FileReader()
                          reader.onload = ev => setActNewPhotoPreview(ev.target?.result as string)
                          reader.readAsDataURL(file)
                        }} />
                        <CField label="Photo">
                          {actDeletePhoto ? (
                            <div className="rounded-[14px] border-2 border-dashed p-3.5 flex items-center justify-between bg-card">
                              <span className="text-para-sm font-semibold text-destructive">Photo will be deleted</span>
                              <button onClick={() => setActDeletePhoto(false)} className="border-0 bg-transparent cursor-pointer text-para-xs font-bold text-muted-foreground">Undo</button>
                            </div>
                          ) : (
                            <div className="relative rounded-[14px] overflow-hidden mb-1 cursor-pointer" onClick={() => actPhotoInputRef.current?.click()}>
                              {actNewPhotoPreview || actPhoto ? (
                                <>
                                  <img src={actNewPhotoPreview ?? actPhoto!.image_url} alt="" className="w-full block object-cover max-h-[200px]" />
                                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                    <span className="text-white text-para-sm font-bold bg-black/40 px-3.5 py-1.5 rounded-[20px]">Change photo</span>
                                  </div>
                                  <button onClick={e => { e.stopPropagation(); setActDeletePhoto(true); setActNewPhotoPreview(null); setActNewPhotoFile(null) }} className="absolute top-2 right-2 z-[1] w-8 h-8 rounded-full border-0 cursor-pointer flex items-center justify-center" style={{ background: 'rgba(34,25,15,.7)', color: '#F87171' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14"/></svg>
                                  </button>
                                </>
                              ) : (
                                <div className="w-full border-2 border-dashed rounded-[14px] p-5 flex items-center justify-center gap-2 text-muted-foreground text-para-sm font-bold bg-card">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                  Add photo
                                </div>
                              )}
                            </div>
                          )}
                        </CField>
                        <CField label="Interest">
                          <div className="flex flex-wrap gap-[7px]">
                            {hobbyList.map(hb => (
                              <button
                                key={hb.value}
                                onClick={() => setActEditForm(f => ({ ...f, hobby: hb.value }))}
                                className="px-[13px] py-[7px] rounded-full text-para-sm font-bold cursor-pointer border-2 transition-colors"
                                style={{
                                  borderColor: actEditForm.hobby === hb.value ? 'var(--app-orange)' : 'var(--border)',
                                  background: actEditForm.hobby === hb.value ? 'var(--app-orange-soft)' : 'var(--card)',
                                  color: actEditForm.hobby === hb.value ? 'var(--app-orange)' : 'var(--foreground)',
                                }}
                              >
                                {hb.icon} {hb.label}
                              </button>
                            ))}
                          </div>
                        </CField>
                        <CField label="Note">
                          <textarea
                            value={actEditForm.note}
                            onChange={e => setActEditForm(f => ({ ...f, note: e.target.value }))}
                            rows={3}
                            className="w-full bg-card border rounded-2xl text-foreground text-para-md font-medium p-[13px_15px] outline-none resize-none box-border focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </CField>
                        <div className="flex gap-2.5">
                          <CField label="Location" className="flex-1">
                            <Input
                              value={actEditForm.location}
                              onChange={e => setActEditForm(f => ({ ...f, location: e.target.value }))}
                              placeholder="e.g. Home"
                              className="rounded-2xl h-[50px] text-para-md"
                            />
                          </CField>
                          <CField label="Date & time" className="flex-1">
                            <Input
                              type="datetime-local"
                              value={actEditForm.at}
                              onChange={e => setActEditForm(f => ({ ...f, at: e.target.value }))}
                              className="rounded-2xl h-[50px] text-para-md"
                            />
                          </CField>
                        </div>
                        <div className="flex gap-2.5 mt-1">
                          <Button variant="outline" onClick={() => setActEditMode(false)} className="flex-1 h-[50px] rounded-2xl text-para-sm font-bold">
                            Cancel
                          </Button>
                          <Button onClick={saveActivityEdit} disabled={actSavePending} className="flex-[2] h-[50px] rounded-2xl text-para-md font-extrabold">
                            {actSavePending ? 'Saving…' : 'Save changes'}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {actPhoto && (
                          <div className="rounded-2xl overflow-hidden mb-3 cursor-pointer" onClick={() => setFullscreenPhoto(actPhoto)}>
                            <img src={actPhoto.image_url} alt="" className="w-full block object-cover max-h-[260px]" />
                          </div>
                        )}
                        <Card className="mb-2.5">
                          <CardContent className="p-[14px_16px]">
                            <p className="m-0 text-para-md leading-relaxed">{viewActivity.note}</p>
                          </CardContent>
                        </Card>
                        {viewActivity.location && (
                          <div className="flex items-center gap-2 py-2.5 px-0.5 text-muted-foreground">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span className="text-para-sm font-semibold">{viewActivity.location}</span>
                          </div>
                        )}
                      </>
                    )}

                    {!actEditMode && (
                      <div className="mt-7 pt-4 border-t text-center">
                        {actDeleteConfirm ? (
                          <Button variant="destructive" onClick={deleteActivity} className="rounded-[14px] px-5 py-2.5 font-extrabold">
                            ⚠️ Confirm delete
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setActDeleteConfirm(true)} className="text-muted-foreground/60 text-para-xs font-semibold">
                            Delete activity
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </DrawerContent>
        </Drawer>

        {/* ── Add Goal Sheet ── */}
        <Drawer
          open={goalSheetOpen}
          onOpenChange={(open: boolean) => { if (!open) { setGoalSheetOpen(false); setEditGoalId(null); setGoalForm({ name: '', narrative: '', deadline: '' }) } }}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="font-heading">{editGoalId ? 'Edit Goal' : 'New Goal'}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2 space-y-0 overflow-y-auto">
              <CField label="Goal name *">
                <Input
                  value={goalForm.name}
                  onChange={e => setGoalForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Planning for Q3"
                  className="rounded-2xl h-[50px] text-para-md"
                />
              </CField>
              <CField label="Narrative">
                <textarea
                  value={goalForm.narrative}
                  onChange={e => setGoalForm(f => ({ ...f, narrative: e.target.value }))}
                  placeholder="What's the purpose of this goal?"
                  rows={3}
                  className="w-full bg-card border rounded-2xl text-foreground text-para-md font-medium p-[13px_15px] outline-none resize-none box-border focus-visible:ring-2 focus-visible:ring-ring"
                />
              </CField>
              <CField label="Deadline">
                <Input
                  type="date"
                  value={goalForm.deadline}
                  onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))}
                  className="rounded-2xl h-[50px] text-para-md"
                />
              </CField>
            </div>
            <DrawerFooter>
              <Button onClick={saveGoal} className="w-full h-[50px] text-para-md font-extrabold rounded-2xl">
                Save Goal
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* ── Add Task Sheet ── */}
        <Drawer
          open={!!taskSheetGoalId}
          onOpenChange={(open: boolean) => { if (!open) setTaskSheetGoalId(null) }}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="font-heading">Add Task</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2 space-y-0 overflow-y-auto">
              <CField label="Task *">
                <Input
                  value={taskForm.task}
                  onChange={e => setTaskForm(f => ({ ...f, task: e.target.value }))}
                  placeholder="e.g. Conduct team workshop"
                  className="rounded-2xl h-[50px] text-para-md"
                />
              </CField>
              <CField label="Week">
                <div className="flex gap-2">
                  {([1,2,3,4] as const).map(w => (
                    <button
                      key={w}
                      onClick={() => setTaskForm(f => ({ ...f, week: w }))}
                      className="flex-1 py-[11px] rounded-[13px] border-2 text-para-sm font-bold cursor-pointer transition-colors"
                      style={{
                        borderColor: taskForm.week === w ? 'var(--app-orange)' : 'var(--border)',
                        background: taskForm.week === w ? 'var(--app-orange-soft)' : 'var(--card)',
                        color: taskForm.week === w ? 'var(--app-orange)' : 'var(--foreground)',
                      }}
                    >
                      W{w}
                    </button>
                  ))}
                </div>
              </CField>
            </div>
            <DrawerFooter>
              <Button onClick={saveTask} className="w-full h-[50px] text-para-md font-extrabold rounded-2xl">
                Save Task
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* ── Create Activity Sheet ── */}
        <Drawer
          open={createOpen}
          onOpenChange={(open: boolean) => { if (!open) { setCreateOpen(false); resetCreate() } }}
        >
          <DrawerContent className="max-h-[92dvh]">
            <DrawerHeader>
              <DrawerTitle className="font-heading">Log activity</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2 space-y-0 overflow-y-auto">
              <CField label="Interest *">
                <div className="flex flex-wrap gap-[7px]">
                  {[{ label: 'Fashion', icon: '👔', value: 'fashion' }, ...HOBBIES.map(h => ({ label: h.label, icon: h.icon as string, value: h.value }))].map(h => (
                    <button
                      key={h.value}
                      onClick={() => setCreateHobby(h.value)}
                      className="px-[13px] py-[7px] rounded-full border-2 text-para-sm font-bold cursor-pointer transition-colors"
                      style={{
                        borderColor: createHobby === h.value ? 'var(--app-orange)' : 'var(--border)',
                        background: createHobby === h.value ? 'var(--app-orange-soft)' : 'var(--card)',
                        color: createHobby === h.value ? 'var(--app-orange)' : 'var(--foreground)',
                      }}
                    >
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
                  className="w-full bg-card border rounded-2xl text-foreground text-para-md font-medium p-[13px_15px] outline-none resize-none box-border focus-visible:ring-2 focus-visible:ring-ring"
                />
              </CField>

              <div className="flex gap-2.5">
                <CField label="Location" className="flex-1">
                  <Input
                    value={createLocation}
                    onChange={e => setCreateLocation(e.target.value)}
                    placeholder="e.g. Home, Garage"
                    className="rounded-2xl h-[50px] text-para-md"
                  />
                </CField>
                <CField label="Date & time" className="flex-1">
                  <Input
                    type="datetime-local"
                    value={createAt}
                    onChange={e => setCreateAt(e.target.value)}
                    className="rounded-2xl h-[50px] text-para-md"
                  />
                </CField>
              </div>

              <CField label="Photo (optional)">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {createPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={createPhoto} alt="captured" className="w-full block object-cover max-h-[160px]" />
                    <button onClick={() => { setCreatePhoto(null); setCreatePhotoFile(null) }} className="absolute top-2 right-2 w-8 h-8 rounded-full border-0 cursor-pointer flex items-center justify-center" style={{ background: 'rgba(34,25,15,.7)', color: '#fff' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => photoInputRef.current?.click()} className="w-full border-2 border-dashed rounded-2xl p-5 cursor-pointer bg-card flex items-center justify-center gap-2.5 text-muted-foreground text-para-sm font-bold">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Take photo
                  </button>
                )}
              </CField>

              {createError && <p className="text-destructive text-para-xs font-semibold mb-2">{createError}</p>}
            </div>
            <DrawerFooter>
              <Button onClick={handleCreateSave} disabled={createPending} className="w-full h-[50px] text-para-md font-extrabold rounded-2xl">
                {createPending ? 'Saving…' : 'Save activity'}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

      </div>
    </div>
  )
}
