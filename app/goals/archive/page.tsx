'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft } from 'lucide-react'
import type { MonthlyGoal, GoalTask } from '@/app/_components/types'

export default function GoalsArchivePage() {
  const router = useRouter()
  const [goals, setGoals]         = useState<MonthlyGoal[]>([])
  const [goalTasks, setGoalTasks] = useState<GoalTask[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      const today = new Date().toISOString().split('T')[0]
      const [{ data: goalsData }, { data: tasksData }] = await Promise.all([
        supabase
          .from('monthly_goals')
          .select('*')
          .eq('user_id', user.id)
          .lt('deadline', today)
          .order('deadline', { ascending: false }),
        supabase
          .from('goal_tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at'),
      ])
      setGoals(goalsData ?? [])
      setGoalTasks(tasksData ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border flex items-center gap-2 px-3.5 pb-3"
        style={{ paddingTop: 'calc(14px + env(safe-area-inset-top, 0px))' }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground flex-shrink-0"
          aria-label="Back"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-extrabold tracking-tight leading-none">Goals Archive</h1>
          {!loading && (
            <span className="text-[11.5px] font-semibold text-muted-foreground">{goals.length} past goal{goals.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </header>

      <div className="px-4 py-4 pb-12">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Loading…</div>
        ) : goals.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-[52px] h-[52px] rounded-[18px] bg-card border shadow-sm flex items-center justify-center mx-auto mb-2.5 text-[22px]">🗂️</div>
            <b className="block text-sm font-bold mb-1">No archived goals yet</b>
            <p className="text-xs text-muted-foreground">Past goals (with a deadline) will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {goals.map(goal => {
              const tasks      = goalTasks.filter(t => t.goal_id === goal.id)
              const doneCount  = tasks.filter(t => t.done).length
              const pct        = tasks.length > 0 ? doneCount / tasks.length : 0
              const deadlineDate = new Date(goal.deadline)
              const isComplete = pct === 1 && tasks.length > 0

              return (
                <Card key={goal.id}>
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-base flex-shrink-0">{isComplete ? '✅' : '📦'}</span>
                        <h3 className="font-bold text-[14px] leading-snug m-0 font-sans truncate">{goal.name}</h3>
                      </div>
                      <span className="text-[11px] font-bold px-[9px] py-1 rounded-full flex-shrink-0" style={{ color: 'var(--muted-foreground)', background: 'var(--secondary)' }}>
                        {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {goal.narrative && (
                      <p className="text-[12px] text-muted-foreground m-0 leading-relaxed">{goal.narrative}</p>
                    )}

                    {tasks.length > 0 && (
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground/60 mb-1.5 uppercase tracking-wider">
                          <span>Progress</span>
                          <span>{doneCount}/{tasks.length} tasks</span>
                        </div>
                        <Progress value={pct * 100} className="h-[5px]" />
                      </div>
                    )}

                    {tasks.length > 0 && (
                      <div className="pt-1 space-y-1">
                        {tasks.map(t => (
                          <div key={t.id} className="flex items-center gap-2 py-[3px]">
                            <div
                              className="w-4 h-4 rounded-[5px] flex-shrink-0 flex items-center justify-center"
                              style={{
                                border: `2px solid ${t.done ? '#171717' : 'var(--border)'}`,
                                background: t.done ? '#171717' : 'transparent',
                              }}
                            >
                              {t.done && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>}
                            </div>
                            <span className={`flex-1 text-[13px] font-medium ${t.done ? 'text-muted-foreground/60 line-through' : 'text-foreground'}`}>{t.task}</span>
                            <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">Wk {t.week}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
