import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import type { WardrobeItem } from '@/lib/types'

interface Props {
  item: WardrobeItem
  onPress: () => void
}

export function ItemCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.overlay}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  image: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  category: {
    color: '#AAAAAA',
    fontSize: 10,
    marginTop: 2,
    textTransform: 'capitalize',
  },
})
