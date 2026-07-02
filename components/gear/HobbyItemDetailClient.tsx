'use client'

import { useTransition, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, Upload, Link } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { HobbyItem } from '@/lib/types'
import { HOBBIES } from '@/lib/types'
import { WorthCard } from '@/components/worth/WorthCard'
import { updateHobbyItem, deleteHobbyItem } from '@/app/actions'

interface HobbyItemDetailClientProps {
  item: HobbyItem
  hobby: string
  user: User | null
}

export function HobbyItemDetailClient({ item, hobby, user }: HobbyItemDetailClientProps) {
  const router                        = useRouter()
  const [isPending, startTransition]  = useTransition()
  const [mode, setMode]               = useState<'view' | 'edit'>('view')
  const [error, setError]             = useState<string | null>(null)
  const [preview, setPreview]         = useState<string | null>(null)
  const [useUrl, setUseUrl]           = useState(false)
  const [imageUrl, setImageUrl]       = useState('')
  const fileRef                       = useRef<HTMLInputElement>(null)

  const hobbyDef = HOBBIES.find(h => h.value === hobby)

  function handleDelete() {
    if (!confirm('Hapus item ini?')) return
    startTransition(async () => {
      const res = await deleteHobbyItem(item.id, hobby)
      if (res.error) { setError(res.error); return }
      router.push(`/${hobby}`)
    })
  }

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    if (useUrl && imageUrl.trim()) fd.set('image_url_direct', imageUrl.trim())
    startTransition(async () => {
      const res = await updateHobbyItem(item.id, fd)
      if (res.error) { setError(res.error); return }
      router.refresh()
      setMode('view')
      setPreview(null)
    })
  }

  const displayImage = preview ?? item.image_url

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-4 pt-12 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => mode === 'edit' ? setMode('view') : router.push(`/${hobby}`)}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ArrowLeft size={16} className="text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">{hobbyDef?.icon}</span>
            <h1 className="text-foreground font-bold text-lg tracking-tight truncate max-w-[180px]">
              {mode === 'edit' ? 'Edit Item' : item.name}
            </h1>
          </div>
        </div>

        {user && mode === 'view' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('edit')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-accent text-foreground text-xs font-medium transition-colors"
            >
              <Pencil size={12} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium transition-colors disabled:opacity-40"
            >
              <Trash2 size={12} />
              Hapus
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE */}
      {mode === 'view' && (
        <>
          {displayImage ? (
            <div className="aspect-square w-full bg-muted">
              <img src={displayImage} alt={item.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-square w-full bg-muted flex items-center justify-center text-8xl">
              {hobbyDef?.icon}
            </div>
          )}

          <div className="p-5 space-y-4">
            <div>
              <h2 className="text-foreground font-bold text-2xl">{item.name}</h2>
              <p className="text-muted-foreground text-sm mt-0.5 capitalize">{hobbyDef?.label}</p>
            </div>

            {item.description && (
              <p className="text-foreground/80 text-sm leading-relaxed">{item.description}</p>
            )}

            {/* Pembelian */}
            <div className="bg-muted rounded-xl p-3.5 space-y-2">
              <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Pembelian</p>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Harga Beli</span>
                <span className="text-foreground text-xs font-semibold">
                  {item.purchase_price
                    ? item.purchase_price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
                    : <span className="text-muted-foreground/50">Belum diisi</span>}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Tanggal Beli</span>
                <span className="text-foreground text-xs">
                  {item.purchase_date
                    ? new Date(item.purchase_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                    : <span className="text-muted-foreground/50">Belum diisi</span>}
                </span>
              </div>
            </div>

            {/* Worth */}
            <WorthCard
              purchasePrice={item.purchase_price}
              purchaseDate={item.purchase_date}
            />

            <p className="text-muted-foreground/40 text-[10px]">
              Ditambahkan {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </>
      )}

      {/* EDIT MODE */}
      {mode === 'edit' && (
        <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
          {/* Image */}
          <div>
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Foto</label>
            {!useUrl && (
              <div
                onClick={() => fileRef.current?.click()}
                className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-dashed border-border hover:border-foreground/40 transition-colors cursor-pointer flex items-center justify-center"
              >
                {preview || item.image_url ? (
                  <img
                    src={preview ?? item.image_url ?? ''}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload size={20} />
                    <span className="text-xs">Tap untuk upload foto</span>
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileRef} type="file" name="image" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)) }}
            />
            <button
              type="button"
              onClick={() => { setUseUrl(v => !v); setPreview(null); setImageUrl('') }}
              className="flex items-center justify-between w-full px-3.5 py-2.5 bg-muted rounded-xl mt-2"
            >
              <div className="flex items-center gap-2 text-foreground text-xs font-medium">
                <Link size={13} className="text-muted-foreground" />
                Gunakan URL gambar
              </div>
              <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${useUrl ? 'bg-primary' : 'bg-border'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${useUrl ? 'left-4 bg-white' : 'left-0.5 bg-muted-foreground'}`} />
              </div>
            </button>
            {useUrl && (
              <div className="mt-2 space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); setPreview(e.target.value.startsWith('http') ? e.target.value : null) }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-foreground/20"
                />
                {preview && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted border border-border">
                    <img src={preview} alt="preview" className="w-full h-full object-contain" onError={() => setPreview(null)} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Nama *</label>
            <input
              name="name" required defaultValue={item.name}
              className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>

          {/* Harga + Tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Harga Beli</label>
              <input
                name="purchase_price" type="number" min="0" step="0.01"
                defaultValue={item.purchase_price ?? ''}
                className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Tanggal Beli</label>
              <input
                name="purchase_date" type="date"
                defaultValue={item.purchase_date ?? ''}
                className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-muted-foreground text-xs font-medium mb-1.5 block">Catatan</label>
            <textarea
              name="description" rows={3} defaultValue={item.description ?? ''}
              className="w-full bg-muted rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
              placeholder="Catatan tentang item ini…"
            />
          </div>

          {error && (
            <p className="text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit" disabled={isPending}
            className="w-full bg-foreground text-background font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {isPending ? 'Menyimpan…' : 'Simpan Perubahan'}
          </button>

          <button
            type="button" onClick={handleDelete} disabled={isPending}
            className="w-full flex items-center justify-center gap-2 text-destructive font-medium py-3 rounded-xl text-sm border border-destructive/20 bg-destructive/5 disabled:opacity-40 hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={14} />
            {isPending ? 'Menghapus…' : 'Hapus Item'}
          </button>
        </form>
      )}
    </div>
  )
}
