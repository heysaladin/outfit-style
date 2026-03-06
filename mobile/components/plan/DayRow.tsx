import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { Plus, X } from 'lucide-react-native'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatMonthDay } from '@/lib/week'
import type { PlanEntry } from '@/lib/types'

interface Props {
  date: Date
  dayLabel: string
  isToday: boolean
  plans: PlanEntry[]
  onAdd: () => void
  onRemove: () => void
}

export function DayRow({ date, dayLabel, isToday, plans, onAdd, onRemove }: Props) {
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleRemove(plan: PlanEntry) {
    setRemovingId(plan.id)
    try {
      await supabase.from('weekly_plans').delete().eq('id', plan.id)
      onRemove()
    } catch (e) {
      console.error(e)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <View style={[styles.row, isToday && styles.rowToday]}>
      {/* Day label */}
      <View style={styles.dayLabel}>
        <Text style={[styles.dayName, isToday && styles.dayNameToday]}>{dayLabel}</Text>
        <Text style={[styles.dayDate, isToday && styles.dayDateToday]}>{formatMonthDay(date)}</Text>
      </View>

      {/* Items */}
      <View style={styles.items}>
        {plans.map(plan => (
          <View key={plan.id} style={styles.item}>
            <Image
              source={{ uri: plan.wardrobe_items.image_url }}
              style={styles.thumb}
              contentFit="cover"
            />
            <TouchableOpacity
              onPress={() => handleRemove(plan)}
              style={styles.removeBtn}
              hitSlop={{ top: 4, right: 4, bottom: 4, left: 4 }}
            >
              {removingId === plan.id ? (
                <ActivityIndicator size={10} color="#FFF" />
              ) : (
                <X size={10} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        ))}

        {/* Add button */}
        <TouchableOpacity onPress={onAdd} style={styles.addBtn} activeOpacity={0.7}>
          <Plus size={16} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  rowToday: {
    backgroundColor: '#111111',
  },
  dayLabel: {
    width: 52,
    marginRight: 12,
  },
  dayName: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNameToday: { color: '#FFFFFF' },
  dayDate: { color: '#444', fontSize: 11, marginTop: 2 },
  dayDateToday: { color: '#AAAAAA' },
  items: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  item: {
    width: 52,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  thumb: { flex: 1 },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 52,
    height: 68,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
