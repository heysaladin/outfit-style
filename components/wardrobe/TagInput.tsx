'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  name: string
  defaultValue?: string[]
  placeholder?: string
}

export function TagInput({ name, defaultValue = [], placeholder = 'Add tag…' }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(defaultValue)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(raw: string) {
    const trimmed = raw.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed])
    }
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 items-center min-h-12 px-3 py-2 rounded-xl border border-border bg-muted cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <input type="hidden" name={name} value={tags.join(', ')} />
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-border text-foreground">
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
            aria-label={`Remove ${tag}`}
            className="hover:text-destructive transition-colors"
          >
            <X size={11} aria-hidden />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        id="tag-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input) }}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-24 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
      />
    </div>
  )
}
