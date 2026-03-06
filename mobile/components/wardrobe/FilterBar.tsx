import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { CATEGORIES, COLORS } from '@/lib/types'

interface Props {
  activeCategory: string | null
  activeColor: string | null
  onCategoryChange: (v: string | null) => void
  onColorChange: (v: string | null) => void
}

export function FilterBar({ activeCategory, activeColor, onCategoryChange, onColorChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <TouchableOpacity
          onPress={() => onCategoryChange(null)}
          style={[styles.chip, !activeCategory && styles.chipActive]}
        >
          <Text style={[styles.chipText, !activeCategory && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.value}
            onPress={() => onCategoryChange(activeCategory === cat.value ? null : cat.value)}
            style={[styles.chip, activeCategory === cat.value && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeCategory === cat.value && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {COLORS.map(color => (
          <TouchableOpacity
            key={color.value}
            onPress={() => onColorChange(activeColor === color.value ? null : color.value)}
            style={[styles.colorDot, activeColor === color.value && styles.colorDotActive]}
          >
            <View style={[styles.colorInner, { backgroundColor: color.hex }]} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#000000',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#2A2A2A',
    marginHorizontal: 4,
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: '#FFFFFF',
  },
  colorInner: {
    flex: 1,
    borderRadius: 11,
  },
})
