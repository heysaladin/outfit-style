import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { HOBBIES } from '@/lib/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HobbyItemPage({
  params,
}: {
  params: Promise<{ hobby: string; itemId: string }>
}) {
  const { hobby, itemId } = await params
  const hobbyDef = HOBBIES.find(h => h.value === hobby)
  if (!hobbyDef) notFound()

  const supabase = await createClient()
  const { data: item } = await supabase
    .from('hobby_items')
    .select('*')
    .eq('id', itemId)
    .eq('status', 'verified')
    .single()

  if (!item) notFound()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/40 px-4 pt-12 pb-3 flex items-center gap-3">
        <Link
          href={`/${hobby}`}
          className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowLeft size={16} className="text-muted-foreground" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xl">{hobbyDef.icon}</span>
          <h1 className="text-foreground font-bold text-lg tracking-tight">{item.name}</h1>
        </div>
      </div>

      {/* Image */}
      {item.image_url ? (
        <div className="aspect-square w-full bg-muted">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-square w-full bg-muted flex items-center justify-center text-8xl">
          {hobbyDef.icon}
        </div>
      )}

      {/* Info */}
      <div className="p-5 space-y-4">
        <div>
          <h2 className="text-foreground font-bold text-2xl">{item.name}</h2>
          <p className="text-muted-foreground text-sm mt-0.5 capitalize">{hobbyDef.label}</p>
        </div>

        {item.description && (
          <p className="text-foreground/80 text-sm leading-relaxed">{item.description}</p>
        )}
      </div>
    </div>
  )
}
