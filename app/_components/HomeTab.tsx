'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HOBBIES } from '@/lib/types'
import type { HobbyActivity } from '@/lib/types'
import type { ActivityExportData } from '@/components/ActivityExportCard'
import { daysDiff } from '@/lib/date'
import type { MonthlyGoal, GoalTask } from './types'

interface WeekDot { label: string; active: boolean; isToday: boolean }

interface HomeTabProps {
  activities: HobbyActivity[]
  goals: MonthlyGoal[]
  goalTasks: GoalTask[]
  streak: number
  weekDots: WeekDot[]
  totalPoints: number
  firstName: string
  dateStr: string
  now: Date
  onOpenActivity: (act: HobbyActivity) => void
  onOpenGoalSheet: () => void
  onEditGoal: (goal: MonthlyGoal) => void
  onAddTask: (goalId: string) => void
  onEditTask: (task: GoalTask) => void
  onToggleTask: (id: string) => void
  onDeleteGoal: (id: string) => void
  onDeleteTask: (id: string) => void
  onTriggerExport: (data: ActivityExportData) => void
  exporting: boolean
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ padding: '28px 0', textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: 18, background: '#F5F5F5', border: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 22 }}>{icon}</div>
      <b style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{title}</b>
      <p style={{ fontSize: 13, color: 'rgb(163,163,163)', margin: 0 }}>{desc}</p>
    </div>
  )
}

const HomeTab = React.memo(function HomeTab({
  activities,
  goals,
  goalTasks,
  streak,
  weekDots,
  totalPoints,
  firstName,
  dateStr,
  now,
  onOpenActivity,
  onOpenGoalSheet,
  onEditGoal,
  onAddTask,
  onEditTask,
  onToggleTask,
  onDeleteGoal,
  onDeleteTask,
}: HomeTabProps) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const activeGoals   = goals.filter(g => !g.deadline || new Date(g.deadline) >= today)
  const archivedGoals = goals.filter(g => g.deadline && new Date(g.deadline) < today)

  return (
    <>
      {/* ── Dark hero ── */}
      <div style={{ background: '#0A0A0A', borderRadius: '0 0 28px 28px', padding: '0 12px 28px' }}>

        {/* Greeting */}
        <div style={{ padding: '16px 8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 14, lineHeight: '21px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500, color: 'rgb(163,163,163)', margin: 0 }}>{dateStr}</p>
          <h1 style={{ fontSize: 30, lineHeight: '30px', letterSpacing: '-1px', fontWeight: 600, color: 'rgb(250,250,250)', margin: 0 }}>
            Hey {firstName},<br />let&apos;s add to your{' '}
            <em className="not-italic" style={{ color: 'rgb(238,240,64)' }}>story</em>
          </h1>
        </div>

        {/* Momo strip */}
        <div style={{ marginTop: 24, background: 'rgb(28,28,28)', borderRadius: '12px 12px 0 0', padding: '12px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/momo.png" alt="Momo" width={32} height={32} className="object-contain flex-shrink-0" />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: 14, lineHeight: '21px', fontWeight: 500, color: 'rgb(250,250,250)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {streak > 1 ? `${streak}-day streak! You're on fire 🔥` : 'Start logging to build your story'}
            </p>
            <span style={{ fontSize: 12, lineHeight: '18px', color: 'rgb(163,163,163)' }}>Momo · your interest friend</span>
          </div>
          {totalPoints > 0 && (
            <div style={{ height: 30, padding: '0 7px', borderRadius: 8, background: 'rgb(52,52,26)', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#F5B82E"><path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z"/></svg>
              <span style={{ fontSize: 14, lineHeight: '21px', fontFamily: '"Geist Mono", monospace', fontWeight: 600, color: 'rgb(238,240,64)' }}>{totalPoints}</span>
              <span style={{ fontSize: 12, lineHeight: '18px', color: 'rgb(184,186,74)' }}>pts</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Streak card ── */}
      <div style={{ margin: '-28px 12px 0', position: 'relative', zIndex: 2, marginBottom: '-1.5rem', background: 'rgb(34,34,34)', borderRadius: '0 0 12px 12px', padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, boxShadow: 'rgba(0,0,0,0.1) 0px 10px 15px -3px, rgba(0,0,0,0.1) 0px 4px 6px -4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20, lineHeight: '24px' }}>{streak > 0 ? '🔥' : '✨'}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            {streak > 0 ? (
              <>
                <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 24, lineHeight: '28.8px', letterSpacing: '-0.5px', fontWeight: 600, color: 'rgb(250,250,250)' }}>{streak}</span>
                <span style={{ fontSize: 14, lineHeight: '21px', color: 'rgb(163,163,163)' }}>day streak</span>
              </>
            ) : (
              <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>Start today!</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {weekDots.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 13 }}>
              <span style={{ fontSize: 12, lineHeight: '18px', fontWeight: 500, color: 'rgb(163,163,163)' }}>{d.label}</span>
              <div style={{
                width: 7, height: 7, borderRadius: 9999,
                background: d.active ? 'rgb(238,240,64)' : (d.isToday ? 'transparent' : '#333'),
                border: d.isToday && !d.active ? '1.5px solid rgba(255,255,255,0.25)' : 'none',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Light content ── */}
      <div style={{ background: '#FFFFFF' }}>

        {/* Recent Activities */}
        {activities.length > 0 && (
          <div style={{ padding: '32px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 20, lineHeight: '24px', letterSpacing: 0, fontWeight: 600, color: 'rgb(10,10,10)' }}>Recent</div>
            <div style={{ border: '1px solid rgb(229,229,229)', borderRadius: 10, display: 'flex', flexDirection: 'column' }}>
              {activities.slice(0, 3).map((act, idx) => {
                const h = [{ label: 'Fashion', icon: '👔', value: 'fashion' }, ...HOBBIES].find(x => x.value === act.hobby)
                const diff = daysDiff(act.activity_at, now)
                const timeAgo = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : `${diff}d ago`
                const initials = (h?.label ?? act.hobby).slice(0, 2).toUpperCase()
                return (
                  <button
                    key={act.id}
                    type="button"
                    aria-label={`View ${h?.label ?? act.hobby} activity`}
                    onClick={() => onOpenActivity(act)}
                    style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 0, borderBottom: idx < 2 ? '1px solid rgb(240,240,240)' : 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgb(245,245,245)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, lineHeight: '18px', fontWeight: 600, color: 'rgb(82,82,82)' }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 500, color: 'rgb(10,10,10)' }}>{h?.label ?? act.hobby}</div>
                      <p style={{ fontSize: 14, lineHeight: '21px', margin: 0, color: 'rgb(163,163,163)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{act.note}</p>
                    </div>
                    <span style={{ fontSize: 12, lineHeight: '18px', color: 'rgb(163,163,163)', flexShrink: 0 }}>{timeAgo}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Monthly Goals */}
        <div style={{ padding: '24px 20px 112px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontSize: 20, lineHeight: '24px', letterSpacing: 0, fontWeight: 600, color: 'rgb(10,10,10)', whiteSpace: 'nowrap' }}>Monthly Goals</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {archivedGoals.length > 0 && (
                <Link
                  href="/goals/archive"
                  style={{ height: 32, padding: '0 12px', border: '1px solid rgb(229,229,229)', borderRadius: 6, background: '#fff', fontFamily: 'Geist, sans-serif', fontSize: 14, lineHeight: '21px', fontWeight: 500, color: 'rgb(23,23,23)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10h14V9M10 13h4"/>
                  </svg>
                  <span style={{ fontSize: 12, lineHeight: '18px', fontFamily: '"Geist Mono", monospace', color: 'rgb(163,163,163)' }}>{archivedGoals.length}</span>
                </Link>
              )}
              <button
                onClick={onOpenGoalSheet}
                style={{ height: 32, padding: '0 12px', border: '1px solid rgb(229,229,229)', borderRadius: 6, background: '#fff', fontFamily: 'Geist, sans-serif', fontSize: 14, lineHeight: '21px', fontWeight: 500, color: 'rgb(23,23,23)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                Add
              </button>
            </div>
          </div>

          {/* Goal list */}
          {activeGoals.length === 0 && archivedGoals.length === 0 ? (
            <EmptyState icon="🎯" title="No goals yet" desc="Set monthly goals to stay on track" />
          ) : activeGoals.length === 0 ? (
            <EmptyState icon="🎯" title="No active goals" desc="All past goals are in the archive" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {activeGoals.map(goal => {
                const tasks = goalTasks.filter(t => t.goal_id === goal.id)
                const doneCount = tasks.filter(t => t.done).length
                const pct = tasks.length > 0 ? doneCount / tasks.length : 0
                const deadlineDate = goal.deadline ? new Date(goal.deadline) : null
                const isOverdue = deadlineDate && deadlineDate < new Date() && pct < 1
                return (
                  <div key={goal.id} style={{ border: '1px solid rgb(229,229,229)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>

                    {/* Goal header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 600, color: 'rgb(10,10,10)', flex: 1 }}>{goal.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        {deadlineDate && (
                          <span style={{ height: 26, padding: '0 10px', borderRadius: 9999, background: isOverdue ? '#FDE8E4' : 'rgb(245,245,245)', fontSize: 12, lineHeight: '18px', fontWeight: 500, color: isOverdue ? '#e53e3e' : 'rgb(115,115,115)', display: 'flex', alignItems: 'center' }}>
                            {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <button aria-label="Edit goal" onClick={() => onEditGoal(goal)} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>
                        </button>
                        <button aria-label="Delete goal" onClick={() => onDeleteGoal(goal.id)} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </div>

                    {/* Narrative */}
                    {goal.narrative && (
                      <p style={{ fontSize: 14, lineHeight: '21px', color: 'rgb(115,115,115)', margin: 0 }}>{goal.narrative}</p>
                    )}

                    {/* Progress */}
                    {tasks.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, lineHeight: '21px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500, color: 'rgb(163,163,163)', marginBottom: 8 }}>
                          <span>Progress</span>
                          <span>{doneCount}/{tasks.length} tasks</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 9999, background: 'rgb(245,245,245)', overflow: 'hidden' }}>
                          <div style={{ width: `${pct * 100}%`, height: 6, background: 'rgb(238,240,64)' }} />
                        </div>
                      </div>
                    )}

                    {/* Tasks by week */}
                    {([1,2,3,4] as const).map(week => {
                      const weekTasks = tasks.filter(t => t.week === week)
                      if (weekTasks.length === 0) return null
                      return (
                        <div key={week}>
                          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgb(163,163,163)', display: 'block', marginBottom: 2 }}>Week {week}</span>
                          {weekTasks.map(t => (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                              <div
                                onClick={() => onToggleTask(t.id)}
                                style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: t.done ? 'none' : '2px solid rgb(229,229,229)', background: t.done ? 'rgb(10,10,10)' : 'transparent' }}
                              >
                                {t.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EEF040" strokeWidth="4" strokeLinecap="round"><path d="M5 13l4 4 10-10"/></svg>}
                              </div>
                              <span style={{ flex: 1, fontSize: 14, lineHeight: '21px', color: t.done ? 'rgb(163,163,163)' : 'rgb(10,10,10)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.task}</span>
                              <button aria-label="Edit task" onClick={() => onEditTask(t)} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '0.5px', display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>
                              </button>
                              <button aria-label="Delete task" onClick={() => onDeleteTask(t.id)} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '0.5px', display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )
                    })}

                    <button
                      onClick={() => onAddTask(goal.id)}
                      style={{ marginTop: 8, background: 'transparent', border: '1px dashed rgb(229,229,229)', borderRadius: 12, padding: '7px 12px', cursor: 'pointer', color: 'rgb(163,163,163)', fontSize: 12, fontWeight: 700, width: '100%', textAlign: 'center' }}
                    >
                      + Add task
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </>
  )
})

export default HomeTab
