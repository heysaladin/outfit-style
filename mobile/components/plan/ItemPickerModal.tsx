import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { X, Check } from 'lucide-react-native'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/types'
import type { WardrobeItem, PlanEntry } from '@/lib/types'

interface Props {
  visible: boolean
  date: string
  dayPlans: PlanEntry[]
  allItems: WardrobeItem[]
  onClose: () => void
  onUpdate: () => void
}

export function ItemPickerModal({ visible, date, dayPlans, allItems, onClose, onUpdate }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const plannedItemIds = new Set(dayPlans.map(p => p.item_id))

  const filtered = activeCategory
    ? allItems.filter(i => i.category === activeCategory)
    : allItems

  async function toggle(item: WardrobeItem) {
    setLoadingId(item.id)
    try {
      if (plannedItemIds.has(item.id)) {
        const plan = dayPlans.find(p => p.item_id === item.id)
        if (plan) {
          await supabase.from('weekly_plans').delete().eq('id', plan.id)
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.from('weekly_plans').insert({
          user_id: user.id,
          item_id: item.id,
          planned_date: date,
        })
      }
      onUpdate()
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pick Items</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Category filter */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setActiveCategory(null)}
            style={[styles.chip, !activeCategory && styles.chipActive]}
          >
            <Text style={[styles.chipText, !activeCategory && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setActiveCategory(activeCategory === cat.value ? null : cat.value)}
              style={[styles.chip, activeCategory === cat.value && styles.chipActive]}
            >
              <Text style={[styles.chipText, activeCategory === cat.value && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const selected = plannedItemIds.has(item.id)
            const busy = loadingId === item.id
            return (
              <TouchableOpacity
                onPress={() => toggle(item)}
                activeOpacity={0.8}
                style={[styles.gridItem, selected && styles.gridItemSelected]}
              >
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.gridImage}
                  contentFit="cover"
                />
                {selected && (
                  <View style={styles.checkOverlay}>
                    {busy ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Check size={18} color="#FFF" strokeWidth={3} />
                    )}
                  </View>
                )}
                {busy && !selected && (
                  <View style={styles.checkOverlay}>
                    <ActivityIndicator color="#FFF" size="small" />
                  </View>
                )}
                <View style={styles.itemLabel}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  title: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  chipActive: { backgroundColor: '#FFF', borderColor: '#FFF' },
  chipText: { color: '#888', fontSize: 12, fontWeight: '500' },
  chipTextActive: { color: '#000' },
  grid: { padding: 12, paddingBottom: 40 },
  gridItem: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridItemSelected: { borderColor: '#FFFFFF' },
  gridImage: { flex: 1 },
  checkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  itemName: { color: '#FFF', fontSize: 10, fontWeight: '500' },
})
