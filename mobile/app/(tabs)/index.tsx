import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import type { WardrobeItem } from '@/lib/types'
import { ItemCard } from '@/components/wardrobe/ItemCard'
import { FilterBar } from '@/components/wardrobe/FilterBar'
import { UploadModal } from '@/components/wardrobe/UploadModal'
import { ItemDetailModal } from '@/components/wardrobe/ItemDetailModal'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WardrobeScreen() {
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeColor, setActiveColor] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setItems((data ?? []) as WardrobeItem[])
    setLoading(false)
  }, [])

  useFocusEffect(useCallback(() => { fetchItems() }, [fetchItems]))

  const filtered = items.filter(item => {
    if (activeCategory && item.category !== activeCategory) return false
    if (activeColor && item.color !== activeColor) return false
    return true
  })

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#1F1F1F] flex-row items-center justify-between">
        <Text className="text-white font-bold text-lg tracking-tight">Outfit Style</Text>
      </View>

      <FilterBar
        activeCategory={activeCategory}
        activeColor={activeColor}
        onCategoryChange={setActiveCategory}
        onColorChange={setActiveColor}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#555" />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-4xl mb-4">👔</Text>
          <Text className="text-white font-semibold text-base mb-1">
            {items.length === 0 ? 'Your wardrobe is empty' : 'No items match filter'}
          </Text>
          <Text className="text-[#444444] text-sm text-center">
            {items.length === 0 ? 'Tap + to add your first item' : 'Try a different filter'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: 10 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <ItemCard item={item} onPress={() => setSelectedItem(item)} />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setUploadOpen(true)}
        className="absolute bottom-8 right-5 w-14 h-14 bg-white rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.85}
      >
        <Plus size={22} color="#000" strokeWidth={2.5} />
      </TouchableOpacity>

      <UploadModal
        visible={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => { setUploadOpen(false); fetchItems() }}
      />
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={() => { setSelectedItem(null); fetchItems() }}
      />
    </SafeAreaView>
  )
}
