'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { HOBBIES } from '@/lib/types'
import type { HobbyActivity, HobbyPhoto, WardrobeItem } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { ReorderHobbiesModal, getOrderedHobbies } from '@/components/gear/ReorderHobbiesModal'
import { ActivityExportCard, type ActivityExportData } from '@/components/ActivityExportCard'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { cn } from '@/lib/utils'
import { calcWorthIt } from '@/lib/worth'
import { dateStrWIB, daysDiff, formatTime, defaultDatetimeLocal } from '@/lib/date'
import { useTheme } from '@/components/ThemeProvider'
import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from '@/components/ui/drawer'
import type { MonthlyGoal, GoalTask } from './_components/types'
import HomeTab from './_components/HomeTab'
import HobbyTab from './_components/HobbyTab'
import StatsTab from './_components/StatsTab'
import SearchTab from './_components/SearchTab'
import GalleryTab from './_components/GalleryTab'

type Tab = 'home' | 'stats' | 'gallery' | 'search' | 'hobby'

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
      <b className="block text-para-sm font-bold mb-1 font-sans">{title}</b>
      <p className="text-para-xs text-muted-foreground m-0">{desc}</p>
      {children}
    </div>
  )
}

export default function Home() {
  const [tab, setTab]               = useState<Tab>('home')
  const { theme, toggle: toggleTheme } = useTheme()
  const [reorderOpen, setReorderOpen] = useState(false)
  const [user, setUser]             = useState<User | null>(null)
  const [hobbyOrder, setHobbyOrder] = useState(() => getOrderedHobbies())
  const [activities, setActivities] = useState<HobbyActivity[]>([])
  const [photos, setPhotos]         = useState<HobbyPhoto[]>([])
  const [worthItItems, setWorthItItems] = useState<WardrobeItem[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [gearCounts, setGearCounts] = useState<Record<string, number>>({})
  const [hobbyProgress, setHobbyProgress] = useState<Record<string, number>>({})

  // Search
  const [searchQ, setSearchQ] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Create activity sheet
  const [createOpen, setCreateOpen] = useState(false)
  const [createHobby, setCreateHobby] = useState('')
  const [createNote, setCreateNote] = useState('')
  const [createLocation, setCreateLocation] = useState('')
  const [createAt, setCreateAt] = useState(() => defaultDatetimeLocal())
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
  const [editTaskId, setEditTaskId] = useState<string | null>(null)
  const [goalForm, setGoalForm] = useState({ name: '', narrative: '', deadline: '' })
  const [taskForm, setTaskForm] = useState({ task: '', week: 1 as 1|2|3|4 })
  const [editTaskForm, setEditTaskForm] = useState({ task: '', week: 1 as 1|2|3|4 })

  // Gallery fullscreen
  const [fullscreenPhoto, setFullscreenPhoto] = useState<HobbyPhoto | null>(null)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())

  // Export preview
  const [exportPreviewUrl, setExportPreviewUrl] = useState<string | null>(null)
  const [exportData, setExportData] = useState<ActivityExportData | null>(null)
  const exportCardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

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
      const [{ data: acts }, { data: pics }, { data: gear }, { count: wardrobeCount }, { data: wardrobeData }] = await Promise.all([
        supabase.from('hobby_activities').select('id,hobby,activity_at,note,location,user_id,created_at,outfit_id,outfit_snapshot,outfits(id,name,outfit_items(item_id,wardrobe_items(*)))').eq('user_id', u.id).order('activity_at', { ascending: false }),
        supabase.from('hobby_photos').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
        supabase.from('hobby_items').select('category, use_count, purchase_price'),
        supabase.from('wardrobe_items').select('*', { count: 'exact', head: true }).eq('user_id', u.id).eq('status', 'verified'),
        supabase.from('wardrobe_items').select('id,name,category,price,purchase_date,wear_count,target,image_url,last_worn,status').eq('user_id', u.id).eq('status', 'verified').gt('wear_count', 0),
      ])
      setActivities((acts ?? []) as unknown as HobbyActivity[])
      setPhotos(pics ?? [])
      const worthIt = (wardrobeData ?? []).filter(item => {
        const { isWorthIt, targetUses } = calcWorthIt({ purchasePrice: item.price, actualUses: item.wear_count, targetOverride: item.target })
        return isWorthIt && item.last_worn && item.wear_count === targetUses
      }) as unknown as WardrobeItem[]
      setWorthItItems(worthIt)
      let points = 0
      for (const item of (wardrobeData ?? [])) {
        const { isWorthIt, targetUses } = calcWorthIt({ purchasePrice: item.price, actualUses: item.wear_count, targetOverride: item.target })
        if (isWorthIt) { points += targetUses }
      }
      setTotalPoints(points)
      const counts: Record<string, number> = { fashion: wardrobeCount ?? 0 }
      const progressBuckets: Record<string, number[]> = {}
      for (const item of (gear ?? [])) {
        counts[item.category] = (counts[item.category] ?? 0) + 1
        const { worthItProgress } = calcWorthIt({ purchasePrice: item.purchase_price, actualUses: item.use_count })
        if (!progressBuckets[item.category]) progressBuckets[item.category] = []
        progressBuckets[item.category].push(worthItProgress)
      }
      setGearCounts(counts)
      const avgProgress: Record<string, number> = {}
      for (const [cat, vals] of Object.entries(progressBuckets)) {
        avgProgress[cat] = vals.reduce((a, b) => a + b, 0) / vals.length
      }
      setHobbyProgress(avgProgress)

      try {
        const [{ data: goalsData }, { data: tasksData }] = await Promise.all([
          supabase.from('monthly_goals').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
          supabase.from('goal_tasks').select('*').eq('user_id', u.id).order('created_at'),
        ])
        setGoals(goalsData ?? [])
        setGoalTasks(tasksData ?? [])
      } catch { /* tables may not exist yet */ }
    })
  }, [])

  const resetCreate = useCallback(() => {
    setCreateHobby(''); setCreateNote(''); setCreateLocation(''); setCreateError('')
    setCreatePhoto(null); setCreatePhotoFile(null)
    setCreateAt(defaultDatetimeLocal())
  }, [])

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

      setActivities(prev => [act, ...prev].sort((a, b) => new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime()))
      resetCreate(); setCreateOpen(false)
    } finally { setCreatePending(false) }
  }

  const firstName = 'Saladin'

  const now = useMemo(() => new Date(), [])
  const dateStr = useMemo(() => dateStrWIB(now), [now])

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i)); return d
  }), [now])
  const DAY_LABELS = ['S','M','T','W','T','F','S']

  const activeDaySet = useMemo(() => new Set(activities.map(a =>
    new Date(a.activity_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  )), [activities])

  const weekDots = useMemo(() => weekDays.map((d, i) => ({
    label: DAY_LABELS[d.getDay()],
    active: activeDaySet.has(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })),
    isToday: i === 6,
  })), [weekDays, activeDaySet])

  const streak = useMemo(() => {
    let s = 0
    for (let i = 0; i < 60; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i)
      if (activeDaySet.has(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }))) s++
      else break
    }
    return s
  }, [activeDaySet, now])

  const lastActive = useMemo(() => {
    const result: Record<string, string> = {}
    for (const a of activities) {
      if (!result[a.hobby]) {
        const diff = daysDiff(a.activity_at, now)
        if (diff === 0) result[a.hobby] = 'today'
        else if (diff === 1) result[a.hobby] = 'yesterday'
        else if (diff < 7) result[a.hobby] = `${diff}d ago`
        else result[a.hobby] = `${Math.floor(diff / 7)}w ago`
      }
    }
    return result
  }, [activities, now])

  const fashionActivityCount = useMemo(() => activities.filter(a => a.hobby === 'fashion').length, [activities])
  const socialActivityCount = useMemo(() => activities.filter(a => a.hobby === 'social').length, [activities])
  const readingActivityCount = useMemo(() => activities.filter(a => a.hobby === 'reading').length, [activities])
  const workoutActivityCount = useMemo(() => activities.filter(a => a.hobby === 'workout').length, [activities])

  const hobbiesByActivity = useMemo(() =>
    HOBBIES.filter(h => !['social', 'reading', 'workout'].includes(h.value)).map(h => ({
      ...h, count: activities.filter(a => a.hobby === h.value).length,
    })).sort((a, b) => b.count - a.count).filter(h => h.count > 0),
  [activities])

  async function toBase64(url: string): Promise<string> {
    try {
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`
      const res = await fetch(proxyUrl)
      if (!res.ok) throw new Error('proxy failed')
      const blob = await res.blob()
      return await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch {
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    }
  }

  async function triggerExport(data: ActivityExportData) {
    // Show overlay immediately with loading state
    setExporting(true)
    setExportPreviewUrl(null)
    setExportData(data)
    try {
      // Pre-convert all images to base64 to bypass CORS
      const itemsWithBase64 = await Promise.all(
        data.items.map(async (item) => ({
          ...item,
          image_url: await toBase64(item.image_url),
        }))
      )
      setExportData({ ...data, items: itemsWithBase64 })
      await new Promise(r => setTimeout(r, 200))
      const el = exportCardRef.current
      if (!el) { console.error('Export card ref not found'); return }
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(el, { pixelRatio: 3, skipFonts: true })
      setExportPreviewUrl(dataUrl)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
      setExportData(null)
    }
  }

  const openActivity = useCallback((act: HobbyActivity, photo?: HobbyPhoto) => {
    setViewActivity(act)
    setActEditMode(false)
    setActDeleteConfirm(false)
    setActNewPhotoPreview(null)
    setActNewPhotoFile(null)
    setActEditForm({
      hobby: act.hobby,
      note: act.note ?? '',
      location: act.location ?? '',
      at: defaultDatetimeLocal(new Date(act.activity_at)),
    })
    const linked = photo ?? photos.find(p => p.hobby === act.hobby && p.note === act.note) ?? null
    setActPhoto(linked)
  }, [photos])

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
      setActivities(prev => prev.map(a => a.id === viewActivity.id ? { ...a, ...data } : a))
      setViewActivity(prev => prev ? { ...prev, ...data } : data)
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

  async function saveEditTask() {
    if (!editTaskId || !editTaskForm.task.trim()) return
    setGoalTasks(prev => prev.map(t => t.id === editTaskId ? { ...t, task: editTaskForm.task.trim(), week: editTaskForm.week } : t))
    setEditTaskId(null)
    const supabase = createClient()
    await supabase.from('goal_tasks').update({ task: editTaskForm.task.trim(), week: editTaskForm.week }).eq('id', editTaskId)
  }

  const hobbyLinks = useMemo(() => [
    { label: 'Fashion', icon: '👔', href: '/fashion', value: 'fashion' },
    ...hobbyOrder.map(h => ({ label: h.label, icon: h.icon as string, href: `/${h.value}`, value: h.value })),
  ], [hobbyOrder])

  const q = searchQ.toLowerCase().trim()
  const filteredHobbies = useMemo(() =>
    q ? hobbyLinks.filter(h => h.label.toLowerCase().includes(q)) : [],
  [q, hobbyLinks])
  const filteredActivities = useMemo(() =>
    q ? activities.filter(a =>
      (a.note ?? '').toLowerCase().includes(q) || (a.location ?? '').toLowerCase().includes(q)
    ).slice(0, 20) : [],
  [q, activities])

  return (
    <div className="h-dvh w-full overflow-hidden bg-background">
      <div className="w-full max-w-[430px] h-dvh mx-auto relative flex flex-col overflow-hidden bg-background">

        {/* ── Sticky Header ── */}
        <header
          className="flex-shrink-0 px-5 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 flex items-center justify-between"
          style={{ background: tab === 'home' ? '#0A0A0A' : 'var(--background)' }}
        >
          <span
            className="font-sans font-semibold"
            style={{ fontSize: 20, lineHeight: '24px', letterSpacing: 0, color: tab === 'home' ? 'rgb(238,240,64)' : 'var(--foreground)' }}
          >
            interestory
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/ofit"
              aria-label="Wardrobe"
              className="flex-shrink-0 flex items-center justify-center rounded-full"
              style={{ width: 36, height: 36, background: tab === 'home' ? 'rgb(31,31,31)' : 'var(--muted)', color: tab === 'home' ? 'rgb(229,229,229)' : 'var(--foreground)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 7h14l-1 13H6z"/>
                <path d="M9 10a3 3 0 0 0 6 0"/>
                <path d="M9 7V6a3 3 0 0 1 6 0v1"/>
              </svg>
            </Link>
            <UserAvatarMenu
              buttonClassName="relative flex-shrink-0 cursor-pointer overflow-hidden rounded-full"
              buttonStyle={{ width: 36, height: 36, background: tab === 'home' ? 'rgb(38,38,38)' : 'transparent', border: tab === 'home' ? '2px solid rgb(64,64,64)' : '1px solid #E5E5E5' }}
              onReorderInterests={() => setReorderOpen(true)}
            />
          </div>
        </header>

        {/* ── Scrollable content ── */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ paddingBottom: 0, background: '#FFFFFF' }}
        >

          {/* ════ HOME TAB ════ */}
          {tab === 'home' && (
            <HomeTab
              activities={activities}
              goals={goals}
              goalTasks={goalTasks}
              streak={streak}
              weekDots={weekDots}
              totalPoints={totalPoints}
              firstName={firstName}
              dateStr={dateStr}
              now={now}
              onOpenActivity={openActivity}
              onOpenGoalSheet={() => setGoalSheetOpen(true)}
              onEditGoal={goal => { setEditGoalId(goal.id); setGoalForm({ name: goal.name, narrative: goal.narrative ?? '', deadline: goal.deadline ?? '' }); setGoalSheetOpen(true) }}
              onAddTask={goalId => { setTaskSheetGoalId(goalId); setTaskForm({ task: '', week: 1 }) }}
              onEditTask={task => { setEditTaskId(task.id); setEditTaskForm({ task: task.task, week: task.week }) }}
              onToggleTask={toggleTask}
              onDeleteGoal={deleteGoal}
              onDeleteTask={deleteTask}
              onTriggerExport={triggerExport}
              exporting={exporting}
            />
          )}


          {/* ════ HOBBY TAB ════ */}
          {tab === 'hobby' && (
            <HobbyTab
              hobbyLinks={hobbyLinks}
              gearCounts={gearCounts}
              hobbyProgress={hobbyProgress}
              lastActive={lastActive}
              weekDays={weekDays}
              activities={activities}
              onReorder={() => setReorderOpen(true)}
            />
          )}

          {/* ════ STATS TAB ════ */}
          {tab === 'stats' && (
            <StatsTab
              user={user}
              activities={activities}
              streak={streak}
              lastActive={lastActive}
              gearCounts={gearCounts}
              fashionActivityCount={fashionActivityCount}
              socialActivityCount={socialActivityCount}
              readingActivityCount={readingActivityCount}
              workoutActivityCount={workoutActivityCount}
              hobbiesByActivity={hobbiesByActivity}
            />
          )}

          {/* ════ SEARCH TAB ════ */}
          {tab === 'search' && (
            <SearchTab
              searchQ={searchQ}
              searchRef={searchRef}
              filteredHobbies={filteredHobbies}
              filteredActivities={filteredActivities}
              gearCounts={gearCounts}
              lastActive={lastActive}
              now={now}
              onSearchChange={setSearchQ}
              onOpenActivity={openActivity}
            />
          )}

          {/* ════ GALLERY TAB ════ */}
          {tab === 'gallery' && (
            <GalleryTab
              user={user}
              activities={activities}
              photos={photos}
              worthItItems={worthItItems}
              expandedPosts={expandedPosts}
              now={now}
              exporting={exporting}
              onToggleExpanded={id => setExpandedPosts(prev => {
                const next = new Set(prev)
                prev.has(id) ? next.delete(id) : next.add(id)
                return next
              })}
              onOpenActivity={openActivity}
              onFullscreenPhoto={setFullscreenPhoto}
              onTriggerExport={triggerExport}
            />
          )}
        </div>

        {/* ── Bottom tab bar ── */}
        <nav
          className="fixed left-1/2 -translate-x-1/2 z-30"
          style={{
            bottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
            width: 'calc(100% - 32px)',
            maxWidth: 398,
            height: 64,
            padding: '0 6px',
            background: 'rgb(21,21,21)',
            borderRadius: 9999,
            boxShadow: 'rgba(0,0,0,0.1) 0px 10px 15px -3px, rgba(0,0,0,0.1) 0px 4px 6px -4px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            alignItems: 'center',
          }}
        >
          {/* Home */}
          <button aria-label="Home" onClick={() => setTab('home')} className="flex items-center justify-center border-0 bg-transparent cursor-pointer h-12" style={{ color: tab === 'home' ? 'rgb(250,250,250)' : 'rgb(138,138,138)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/></svg>
          </button>

          {/* Gallery */}
          <button aria-label="Gallery" onClick={() => setTab('gallery')} className="flex items-center justify-center border-0 bg-transparent cursor-pointer h-12" style={{ color: tab === 'gallery' ? 'rgb(250,250,250)' : 'rgb(138,138,138)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
          </button>

          {/* FAB */}
          <div className="flex items-center justify-center">
            <button
              aria-label="Log activity"
              onClick={() => { setCreateOpen(true); setCreateAt(defaultDatetimeLocal()) }}
              className="rounded-full border-0 cursor-pointer flex items-center justify-center"
              style={{ width: 46, height: 46, background: 'rgb(238,240,64)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(10,10,10)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>

          {/* Stats */}
          <button aria-label="Stats" onClick={() => setTab('stats')} className="flex items-center justify-center border-0 bg-transparent cursor-pointer h-12" style={{ color: tab === 'stats' ? 'rgb(250,250,250)' : 'rgb(138,138,138)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 20v-6M12 20V6M18 20v-9"/></svg>
          </button>

          {/* Explore/Hobby */}
          <button aria-label="Explore hobbies" onClick={() => setTab('hobby')} className="flex items-center justify-center border-0 bg-transparent cursor-pointer h-12" style={{ color: tab === 'hobby' ? 'rgb(250,250,250)' : 'rgb(138,138,138)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>
          </button>
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
                <Image src={fullscreenPhoto.image_url} alt="" width={800} height={800} className="max-w-full max-h-full object-contain" style={{ height: 'auto' }} sizes="100vw" />
              </div>
              <div className="absolute" style={{ top: 'calc(16px + env(safe-area-inset-top,0px))', right: 16 }}>
                <button onClick={() => setFullscreenPhoto(null)} className="w-9 h-9 rounded-full border-0 flex items-center justify-center cursor-pointer" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </button>
              </div>
              <div className="p-[16px_20px] pb-6" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,.85))' }} onClick={e => e.stopPropagation()}>
                {fullscreenPhoto.note && (
                  <p className="text-para-md font-semibold m-0 mb-3 leading-[1.4]" style={{ color: 'rgba(255,255,255,.9)' }}>{fullscreenPhoto.note}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">{h?.icon ?? '📷'}</span>
                    <b className="text-white font-bold text-para-md font-sans">{h?.label ?? fullscreenPhoto.hobby}</b>
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
                        <DrawerTitle className="text-para-lg font-extrabold block font-sans">{h?.label ?? viewActivity.hobby}</DrawerTitle>
                        <span className="text-para-xs text-muted-foreground font-semibold">
                          {new Date(viewActivity.activity_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Jakarta' })} · {formatTime(viewActivity.activity_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!actEditMode && (
                        <Button variant="outline" size="sm" onClick={() => setActEditMode(true)} className="rounded-[13px] font-bold">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
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
                                  borderColor: actEditForm.hobby === hb.value ? '#171717' : 'var(--border)',
                                  background: actEditForm.hobby === hb.value ? '#171717' : 'var(--card)',
                                  color: actEditForm.hobby === hb.value ? '#FAFAFA' : 'var(--foreground)',
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
              <DrawerTitle className="font-sans">{editGoalId ? 'Edit Goal' : 'New Goal'}</DrawerTitle>
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
              <DrawerTitle className="font-sans">Add Task</DrawerTitle>
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
                        borderColor: taskForm.week === w ? '#171717' : 'var(--border)',
                        background: taskForm.week === w ? '#171717' : 'var(--card)',
                        color: taskForm.week === w ? '#FAFAFA' : 'var(--foreground)',
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

        {/* ── Edit Task Sheet ── */}
        <Drawer
          open={!!editTaskId}
          onOpenChange={(open: boolean) => { if (!open) setEditTaskId(null) }}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="font-sans">Edit Task</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2 space-y-0 overflow-y-auto">
              <CField label="Task *">
                <Input
                  value={editTaskForm.task}
                  onChange={e => setEditTaskForm(f => ({ ...f, task: e.target.value }))}
                  placeholder="e.g. Conduct team workshop"
                  className="rounded-2xl h-[50px] text-para-md"
                />
              </CField>
              <CField label="Week">
                <div className="flex gap-2">
                  {([1,2,3,4] as const).map(w => (
                    <button
                      key={w}
                      onClick={() => setEditTaskForm(f => ({ ...f, week: w }))}
                      className="flex-1 py-[11px] rounded-[13px] border-2 text-para-sm font-bold cursor-pointer transition-colors"
                      style={{
                        borderColor: editTaskForm.week === w ? '#171717' : 'var(--border)',
                        background: editTaskForm.week === w ? '#171717' : 'var(--card)',
                        color: editTaskForm.week === w ? '#FAFAFA' : 'var(--foreground)',
                      }}
                    >
                      W{w}
                    </button>
                  ))}
                </div>
              </CField>
            </div>
            <DrawerFooter>
              <Button onClick={saveEditTask} className="w-full h-[50px] text-para-md font-extrabold rounded-2xl">
                Save Changes
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
              <DrawerTitle className="font-sans">Log activity</DrawerTitle>
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
                        borderColor: createHobby === h.value ? '#171717' : 'var(--border)',
                        background: createHobby === h.value ? '#171717' : 'var(--card)',
                        color: createHobby === h.value ? '#FAFAFA' : 'var(--foreground)',
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

      {/* Hidden export card for capture */}
      <div style={{ position: 'fixed', top: -9999, left: -9999, pointerEvents: 'none' }}>
        {exportData && <ActivityExportCard ref={exportCardRef} data={exportData} />}
      </div>

      {/* ── Export Preview Overlay ── */}
      {(exporting || exportPreviewUrl) && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button
              onClick={() => { setExportPreviewUrl(null); setExporting(false) }}
              className="flex items-center gap-1.5 text-para-sm font-semibold text-muted-foreground"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span className="text-para-sm font-bold text-foreground">Export</span>
            {exportPreviewUrl ? (
              <a
                href={exportPreviewUrl}
                download="activity.png"
                className="flex items-center gap-1.5 text-para-sm font-bold px-3 py-1.5 rounded-xl bg-foreground text-background"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download
              </a>
            ) : (
              <div className="w-20" />
            )}
          </div>

          {/* Preview or Loading */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6">
            {exportPreviewUrl ? (
              <img
                src={exportPreviewUrl}
                alt="Export preview"
                className="max-w-full rounded-2xl shadow-xl"
                style={{ maxHeight: '70dvh', objectFit: 'contain' }}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-para-sm font-medium">Generating image…</p>
              </div>
            )}
          </div>

          {exportPreviewUrl && (
            <p className="text-center text-para-xs text-muted-foreground pb-8">
              Tap Download to save to your device
            </p>
          )}
        </div>
      )}

    </div>
  )
}
