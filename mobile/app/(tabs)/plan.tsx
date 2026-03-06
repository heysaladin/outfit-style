import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { DAY_NAMES, getMonday, addDays, formatDate, formatMonthDay } from '@/lib/week'
import type { WardrobeItem, PlanEntry } from '@/lib/types'
import { DayRow } from '@/components/plan/DayRow'
import { ItemPickerModal } from '@/components/plan/ItemPickerModal'

export default function PlanScreen() {
  const [monday, setMonday] = useState(() => getMonday(new Date()))
  const [plans, setPlans] = useState<PlanEntry[]>([])
  const [allItems, setAllItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pickerDay, setPickerDay] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const weekStart = formatDate(monday)
    const weekEnd = formatDate(addDays(monday, 6))

    const [{ data: planData }, { data: itemData }] = await Promise.all([
      supabase
        .from('weekly_plans')
        .select('*, wardrobe_items(*)')
        .eq('user_id', user.id)
        .gte('planned_date', weekStart)
        .lte('planned_date', weekEnd),
      supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    setPlans((planData ?? []) as PlanEntry[])
    setAllItems((itemData ?? []) as WardrobeItem[])
    setLoading(false)
  }, [monday])

  useFocusEffect(useCallback(() => { fetchData() }, [fetchData]))

  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const today = formatDate(new Date())

  const plansByDate = plans.reduce<Record<string, PlanEntry[]>>((acc, plan) => {
    acc[plan.planned_date] = [...(acc[plan.planned_date] ?? []), plan]
    return acc
  }, {})

  const weekLabel = `${formatMonthDay(monday)} – ${formatMonthDay(addDays(monday, 6))}`

  function navigate(dir: number) {
    setMonday(prev => addDays(prev, dir * 7))
  }

  const pickerDayPlans = pickerDay ? (plansByDate[pickerDay] ?? []) : []

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1F1F1F]">
        <Text className="text-white font-bold text-lg tracking-tight mb-2">Weekly Plan</Text>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigate(-1)} className="w-8 h-8 items-center justify-center">
            <ChevronLeft size={20} color="#555555" />
          </TouchableOpacity>
          <Text className="text-white text-sm font-medium">{weekLabel}</Text>
          <TouchableOpacity onPress={() => navigate(1)} className="w-8 h-8 items-center justify-center">
            <ChevronRight size={20} color="#555555" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#555" />
        </View>
      ) : (
        <ScrollView className="flex-1">
          {days.map((date, i) => {
            const dateStr = formatDate(date)
            return (
              <DayRow
                key={dateStr}
                date={date}
                dayLabel={DAY_NAMES[i]}
                isToday={dateStr === today}
                plans={plansByDate[dateStr] ?? []}
                onAdd={() => setPickerDay(dateStr)}
                onRemove={() => fetchData()}
              />
            )
          })}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      <ItemPickerModal
        visible={pickerDay !== null}
        date={pickerDay ?? ''}
        dayPlans={pickerDayPlans}
        allItems={allItems}
        onClose={() => setPickerDay(null)}
        onUpdate={fetchData}
      />
    </SafeAreaView>
  )
}
