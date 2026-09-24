'use client'

import React from 'react'
import Image from 'next/image'
import { HOBBIES } from '@/lib/types'
import type { HobbyActivity } from '@/lib/types'
import type { ActivityExportData } from '@/components/ActivityExportCard'
import { cn } from '@/lib/utils'
import { daysDiff } from '@/lib/date'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
    <div className="py-7 text-center">
      <div className="w-13 h-13 rounded-[18px] bg-card border shadow-sm flex items-center justify-center mx-auto mb-2.5 text-[22px] w-[52px] h-[52px]">{icon}</div>
      <b className="block text-para-sm font-bold mb-1 font-sans">{title}</b>
      <p className="text-para-xs text-muted-foreground m-0">{desc}</p>
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
  return (
    <>
      {/* Dark hero section */}
      <div style={{ background: '#0A0A0A', padding: '20px 18px 28px', borderRadius: '0 0 28px 28px' }}>
        {/* Greeting */}
        <div className="mb-5">
          <p className="text-[12px] font-medium tracking-[1.5px] uppercase m-0 mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{dateStr}</p>
          <h1 className="text-[28px] leading-[31px] tracking-[-0.9px] font-semibold m-0" style={{ color: '#fff' }}>
            Hey {firstName},<br />let&apos;s add to your{' '}
            <em className="not-italic" style={{ color: '#f1f252' }}>story</em>
          </h1>
        </div>

        {/* Momo strip */}
        <div className="rounded-[12px] flex items-center gap-3 p-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <Image src="/momo.png" alt="Momo" width={40} height={40} className="object-contain flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] leading-[18px] font-medium m-0" style={{ color: '#fff' }}>
              {streak > 1 ? `${streak}-day streak! You're on fire 🔥` : 'Start logging to build your story'}
            </p>
            <span className="text-[12px] leading-[16px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Momo · your interest friend</span>
          </div>
          {totalPoints > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(241,242,82,0.15)' }}>
              <span className="text-[13px]">⭐</span>
              <span className="text-[13px] font-bold leading-none" style={{ color: '#f1f252' }}>{totalPoints}</span>
              <span className="text-[10px] font-medium leading-none" style={{ color: 'rgba(241,242,82,0.6)' }}>pts</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating streak card */}
      <div style={{ margin: '-1px 18px 0', position: 'relative', zIndex: 2, transform: 'translateY(-50%)', marginBottom: '-1.5rem' }}>
        <div className="rounded-[12px] flex items-center justify-between p-4" style={{ background: '#1e1e1e', boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}>
          <div className="flex items-center gap-2">
            <span className="text-[22px]">{streak > 0 ? '🔥' : '✨'}</span>
            <div className="flex items-baseline gap-1.5">
              {streak > 0 ? (
                <>
                  <span className="font-mono text-[22px] font-medium" style={{ color: '#fff' }}>{streak}</span>
                  <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>day streak</span>
                </>
              ) : (
                <span className="text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Start today!</span>
              )}
            </div>
          </div>
          <div className="flex gap-[9px]">
            {weekDots.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-[5px]">
                <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{d.label}</span>
                <div className="w-2 h-2 rounded-full" style={{
                  background: d.active ? '#f1f252' : (d.isToday ? 'transparent' : '#333'),
                  border: d.isToday && !d.active ? '1.5px solid rgba(255,255,255,0.25)' : 'none',
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Light content section */}
      <div className="px-6 pb-6" style={{ background: '#FFFFFF' }}>

        {/* Recent Activities */}
        {activities.length > 0 && (
          <>
            <div className="flex items-baseline justify-between mt-5 mb-2.5">
              <h2 className="text-[20px] leading-[24px] tracking-[-0.4px] font-semibold m-0" style={{ color: '#0A0A0A' }}>Recent</h2>
            </div>
            <div className="rounded-[8px] overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
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
                    className="w-full flex items-center gap-3 cursor-pointer transition-colors bg-transparent border-0 text-left"
                    style={{ padding: '14px 16px', borderBottom: idx < 2 ? '1px solid #F5F5F5' : 'none' }}
                    onClick={() => onOpenActivity(act)}
                  >
                    <div className="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0 text-[12px] font-semibold" style={{ background: '#F5F5F5', color: '#525252' }}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="text-[15px] font-medium" style={{ color: '#171717' }}>{h?.label ?? act.hobby}</div>
                      <p className="text-[13px] m-0 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#A3A3A3' }}>{act.note}</p>
                    </div>
                    <span className="text-[12px] flex-shrink-0" style={{ color: '#A3A3A3' }}>{timeAgo}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Monthly Goals */}
        <div className="flex items-center justify-between mt-[22px] mb-3">
          <h2 className="text-[20px] leading-[24px] tracking-[-0.4px] font-semibold m-0" style={{ color: '#0A0A0A' }}>
            Monthly Goals
          </h2>
          <button
            onClick={onOpenGoalSheet}
            className="h-[30px] px-3 border rounded-[6px] text-[13px] font-medium cursor-pointer transition-colors"
            style={{ borderColor: '#E5E5E5', background: '#FFFFFF', color: '#171717' }}
          >
            Add
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
                      <h3 className="font-bold text-para-sm leading-snug flex-1 m-0 font-sans">{goal.name}</h3>
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
                          aria-label="Edit goal"
                          onClick={() => onEditGoal(goal)}
                          className="bg-transparent border-0 cursor-pointer text-muted-foreground/50 p-0.5 flex items-center justify-center"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          aria-label="Delete goal"
                          onClick={() => onDeleteGoal(goal.id)}
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
                                onClick={() => onToggleTask(t.id)}
                                className="w-5 h-5 rounded-[7px] flex-shrink-0 cursor-pointer flex items-center justify-center"
                                style={{
                                  border: `2px solid ${t.done ? '#171717' : 'var(--border)'}`,
                                  background: t.done ? '#171717' : 'transparent',
                                }}
                              >
                                {t.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>}
                              </div>
                              <span className={cn('flex-1 text-para-sm font-medium', t.done ? 'text-muted-foreground/60 line-through' : 'text-foreground')}>{t.task}</span>
                              <button aria-label="Edit task" onClick={() => onEditTask(t)} className="bg-transparent border-0 cursor-pointer text-muted-foreground/50 p-0.5 flex items-center justify-center opacity-60">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button aria-label="Delete task" onClick={() => onDeleteTask(t.id)} className="bg-transparent border-0 cursor-pointer text-muted-foreground/50 p-0.5 flex items-center justify-center opacity-60">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )
                    })}

                    <button
                      onClick={() => onAddTask(goal.id)}
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
          <h2 className="text-para-lg font-bold tracking-h2 mx-1 mb-3 mt-0 font-sans">Calendar</h2>
          <div className="rounded-[22px] overflow-hidden">
            <iframe
              src="https://calendar.google.com/calendar/embed?src=79c86e5c0191c5c80b01061a0a7a82c71a621d0d74fab55e7d3091d1a7a5c351%40group.calendar.google.com&ctz=Asia%2FJakarta"
              title="Google Calendar"
              style={{ border: 0, display: 'block', filter: 'sepia(0.55) saturate(0.85) contrast(0.9) brightness(1.04)' }}
              width="100%"
              height="500"
              frameBorder={0}
              scrolling="no"
            />
          </div>
        </div>
      </div>{/* end light content section */}
    </>
  )
})

export default HomeTab
