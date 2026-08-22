'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, FileText, ExternalLink, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { AdminNav } from '@/components/admin/AdminNav'
import type { Blog } from '@/app/admin/blogs/page'

interface Props {
  blogs: Blog[]
}

const EMPTY: Partial<Blog> = {
  title: '', slug: '', excerpt: '', content: '', status: 'draft', tags: [],
}

export function BlogsAdminClient({ blogs: initial }: Props) {
  const [blogs, setBlogs]             = useState<Blog[]>(initial)
  const [modal, setModal]             = useState(false)
  const [editing, setEditing]         = useState<Partial<Blog>>(EMPTY)
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)
  const [deletingId, setDeletingId]   = useState<string | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [, startTransition]           = useTransition()

  function openCreate() {
    setEditing(EMPTY)
    setEditingId(null)
    setError(null)
    setModal(true)
  }

  function openEdit(blog: Blog) {
    setEditing({ ...blog })
    setEditingId(blog.id)
    setError(null)
    setModal(true)
  }

  async function handleSave() {
    if (!editing.title?.trim()) { setError('Title is required.'); return }
    setSaving(true)
    setError(null)

    try {
      if (editingId) {
        const res = await fetch(`/api/blogs/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        })
        const json = await res.json()
        if (!res.ok) { setError(json.error); return }
        setBlogs(prev => prev.map(b => b.id === editingId ? json.data : b))
      } else {
        const res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        })
        const json = await res.json()
        if (!res.ok) { setError(json.error); return }
        setBlogs(prev => [json.data, ...prev])
      }
      setModal(false)
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this blog post?')) return
    setDeletingId(id)
    startTransition(async () => {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' })
      if (res.ok) setBlogs(prev => prev.filter(b => b.id !== id))
      setDeletingId(null)
    })
  }

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-foreground font-bold text-lg">Hyperfantasy Blogs</h1>
            <p className="text-muted-foreground text-xs">hyperfantasy.co</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-xl"
          >
            <Plus size={13} />
            New Post
          </button>
          <UserAvatarMenu />
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText size={32} className="text-muted-foreground mb-3" />
            <p className="text-foreground font-medium text-sm">No blog posts yet</p>
            <p className="text-muted-foreground text-xs mt-1">Create your first post to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {blogs.map(blog => (
              <BlogRow
                key={blog.id}
                blog={blog}
                deleting={deletingId === blog.id}
                onEdit={() => openEdit(blog)}
                onDelete={() => handleDelete(blog.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-background rounded-t-3xl sm:rounded-2xl border border-border shadow-xl overflow-hidden">
            <div className="px-4 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-foreground font-semibold text-sm">
                {editingId ? 'Edit Post' : 'New Blog Post'}
              </h2>
              <button
                onClick={() => setModal(false)}
                className="text-muted-foreground text-xs hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <div className="px-4 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <Field label="Title *">
                <input
                  className="w-full bg-muted text-foreground text-sm rounded-xl px-3 py-2 outline-none placeholder:text-muted-foreground"
                  placeholder="Post title"
                  value={editing.title ?? ''}
                  onChange={e => setEditing(p => ({ ...p, title: e.target.value }))}
                />
              </Field>

              <Field label="Slug">
                <input
                  className="w-full bg-muted text-foreground text-sm rounded-xl px-3 py-2 outline-none placeholder:text-muted-foreground font-mono"
                  placeholder="my-post-slug"
                  value={editing.slug ?? ''}
                  onChange={e => setEditing(p => ({ ...p, slug: e.target.value }))}
                />
              </Field>

              <Field label="Excerpt">
                <textarea
                  rows={2}
                  className="w-full bg-muted text-foreground text-sm rounded-xl px-3 py-2 outline-none placeholder:text-muted-foreground resize-none"
                  placeholder="Short description…"
                  value={editing.excerpt ?? ''}
                  onChange={e => setEditing(p => ({ ...p, excerpt: e.target.value }))}
                />
              </Field>

              <Field label="Content">
                <textarea
                  rows={8}
                  className="w-full bg-muted text-foreground text-sm rounded-xl px-3 py-2 outline-none placeholder:text-muted-foreground resize-none font-mono"
                  placeholder="Write your post here…"
                  value={editing.content ?? ''}
                  onChange={e => setEditing(p => ({ ...p, content: e.target.value }))}
                />
              </Field>

              <Field label="Status">
                <select
                  className="w-full bg-muted text-foreground text-sm rounded-xl px-3 py-2 outline-none"
                  value={editing.status ?? 'draft'}
                  onChange={e => setEditing(p => ({ ...p, status: e.target.value as 'draft' | 'published' }))}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>

              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>

            <div className="px-4 py-3 border-t border-border">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-foreground text-background text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50"
              >
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminNav />
    </div>
  )
}

function BlogRow({
  blog, deleting, onEdit, onDelete,
}: {
  blog: Blog
  deleting: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const date = new Date(blog.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${blog.status === 'published' ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-sm truncate">{blog.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-muted-foreground text-[11px]">{date}</span>
          {blog.slug && (
            <>
              <span className="text-border">·</span>
              <span className="text-muted-foreground text-[11px] font-mono truncate max-w-[140px]">/{blog.slug}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 flex-shrink-0">
        {blog.status === 'published' && (
          <a
            href={`https://hyperfantasy.co/blogs/${blog.slug ?? blog.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <ExternalLink size={13} />
          </a>
        )}
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
          <Pencil size={15} />
        </button>
      </div>
    </li>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-muted-foreground text-[11px] font-medium">{label}</label>
      {children}
    </div>
  )
}
