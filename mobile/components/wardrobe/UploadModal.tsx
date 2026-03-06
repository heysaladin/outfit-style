import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { X, ImagePlus } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { CATEGORIES, COLORS } from '@/lib/types'
import type { Category, Color } from '@/lib/types'

interface Props {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export function UploadModal({ visible, onClose, onSuccess }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('tops')
  const [color, setColor] = useState<Color>('black')
  const [loading, setLoading] = useState(false)

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [3, 4],
    })
    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
    }
  }

  function reset() {
    setImageUri(null)
    setName('')
    setCategory('tops')
    setColor('black')
  }

  async function handleUpload() {
    if (!imageUri || !name.trim()) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const ext = imageUri.split('.').pop() ?? 'jpg'
      const fileName = `${user.id}/${Date.now()}.${ext}`

      const response = await fetch(imageUri)
      const blob = await response.blob()

      const { error: uploadError } = await supabase.storage
        .from('wardrobe')
        .upload(fileName, blob, { contentType: `image/${ext}` })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('wardrobe')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('wardrobe_items')
        .insert({
          user_id: user.id,
          name: name.trim(),
          category,
          color,
          image_url: publicUrl,
          original_image_url: publicUrl,
        })

      if (dbError) throw dbError

      reset()
      onSuccess()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add Item</Text>
          <TouchableOpacity onPress={() => { reset(); onClose() }}>
            <X size={22} color="#888" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Image Picker */}
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker} activeOpacity={0.7}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImagePlus size={32} color="#555" />
                <Text style={styles.imagePlaceholderText}>Tap to select photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. White Oxford Shirt"
            placeholderTextColor="#444"
            autoCapitalize="words"
          />

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                style={[styles.chip, category === cat.value && styles.chipActive]}
              >
                <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Color */}
          <Text style={styles.label}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {COLORS.map(c => (
              <TouchableOpacity
                key={c.value}
                onPress={() => setColor(c.value)}
                style={[styles.colorDot, color === c.value && styles.colorDotActive]}
              >
                <View style={[styles.colorInner, { backgroundColor: c.hex }]} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleUpload}
            disabled={loading || !imageUri || !name.trim()}
            style={[styles.btn, (loading || !imageUri || !name.trim()) && styles.btnDisabled]}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.btnText}>Add to Wardrobe</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  body: { padding: 20, gap: 12 },
  imagePicker: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    marginBottom: 8,
  },
  previewImage: { flex: 1 },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  imagePlaceholderText: { color: '#555', fontSize: 13 },
  label: { color: '#888', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  chipRow: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#FFF', borderColor: '#FFF' },
  chipText: { color: '#888', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#000' },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
  },
  colorDotActive: { borderColor: '#FFF' },
  colorInner: { flex: 1, borderRadius: 12 },
  btn: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#000', fontWeight: '700', fontSize: 15 },
})
