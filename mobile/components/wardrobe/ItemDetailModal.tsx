import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { X, Trash2 } from 'lucide-react-native'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { WardrobeItem } from '@/lib/types'

interface Props {
  item: WardrobeItem | null
  onClose: () => void
  onDelete: () => void
}

export function ItemDetailModal({ item, onClose, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!item) return
    Alert.alert('Delete item', `Remove "${item.name}" from your wardrobe?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true)
          try {
            await supabase.from('wardrobe_items').delete().eq('id', item.id)

            // Also remove from storage
            const path = item.image_url.split('/wardrobe/')[1]
            if (path) {
              await supabase.storage.from('wardrobe').remove([path])
            }
            if (item.original_image_url) {
              const origPath = item.original_image_url.split('/wardrobe/')[1]
              if (origPath && origPath !== path) {
                await supabase.storage.from('wardrobe').remove([origPath])
              }
            }

            onDelete()
          } catch (e) {
            console.error(e)
          } finally {
            setDeleting(false)
          }
        },
      },
    ])
  }

  return (
    <Modal
      visible={item !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} disabled={deleting}>
            {deleting ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <Trash2 size={20} color="#EF4444" />
            )}
          </TouchableOpacity>
        </View>

        {item && (
          <>
            <Image
              source={{ uri: item.image_url }}
              style={styles.image}
              contentFit="contain"
              transition={200}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.tags}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.category}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.color}</Text>
                </View>
              </View>
            </View>
          </>
        )}
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
  image: {
    width: '100%',
    flex: 1,
    backgroundColor: '#111',
  },
  info: {
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  name: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  tags: { flexDirection: 'row', gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  tagText: { color: '#AAA', fontSize: 12, textTransform: 'capitalize' },
})
