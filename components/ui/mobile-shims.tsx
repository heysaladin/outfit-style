'use client'

import type { ReactNode, CSSProperties } from 'react'
import { Search, Loader2 } from 'lucide-react'

// ── MobileButton ─────────────────────────────────────────────────────────────

interface MobileButtonProps {
  variant?: 'ghost' | 'destructive'
  size?: 'sm'
  icon?: ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  className?: string
  type?: 'submit' | 'button'
  style?: CSSProperties
  children?: ReactNode
}

export function MobileButton({
  variant, size, icon, onClick, disabled, loading, fullWidth, className = '', type = 'button', style, children,
}: MobileButtonProps) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-semibold transition-all rounded-xl disabled:opacity-40'
  const variants = {
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted',
    destructive: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20',
    default: 'bg-primary text-primary-foreground hover:opacity-90',
  }
  const sizes = { sm: 'text-sm px-2 py-1', default: 'text-sm px-4 py-3' }
  const v = variant ?? 'default'
  const s = size ?? 'default'
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      className={`${base} ${variants[v]} ${sizes[s]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
      {children}
    </button>
  )
}

// ── MobileSearchBar ───────────────────────────────────────────────────────────

interface MobileSearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function MobileSearchBar({ placeholder, value, onChange, className = '' }: MobileSearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
      />
    </div>
  )
}

// ── MobileEmptyState ──────────────────────────────────────────────────────────

interface MobileEmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  className?: string
}

export function MobileEmptyState({ icon, title, description, className = '' }: MobileEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center px-6 ${className}`}>
      {icon && <div className="mb-3">{icon}</div>}
      <p className="text-foreground font-semibold text-sm">{title}</p>
      {description && <p className="text-muted-foreground text-xs mt-1">{description}</p>}
    </div>
  )
}

// ── MobileChip ────────────────────────────────────────────────────────────────

interface MobileChipProps {
  label: string
  type?: 'filter'
  selected?: boolean
  onSelect?: (selected: boolean) => void
  icon?: ReactNode
  className?: string
}

export function MobileChip({ label, selected, onSelect, icon, className = '' }: MobileChipProps) {
  return (
    <button
      onClick={() => onSelect?.(!selected)}
      className={`inline-flex shrink-0 items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        selected
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
      } ${className}`}
    >
      {icon}
      {label}
    </button>
  )
}

// ── MobileFormField ───────────────────────────────────────────────────────────

interface MobileFormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
  type?: string
  className?: string
}

export function MobileFormField({ label, value, onChange, placeholder, multiline, rows = 3, type = 'text', className = '' }: MobileFormFieldProps) {
  const inputCls = `w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors ${className}`
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${inputCls} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
      )}
    </div>
  )
}

// ── MobileTopTabs ─────────────────────────────────────────────────────────────

interface MobileTab { key: string; label: string; badge?: number }
interface MobileTopTabsProps {
  tabs: MobileTab[]
  activeKey: string
  onChange: (key: string) => void
  className?: string
}

export function MobileTopTabs({ tabs, activeKey, onChange, className = '' }: MobileTopTabsProps) {
  return (
    <div className={`flex border-b border-border ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeKey === tab.key
              ? 'text-foreground after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
          {tab.badge != null && tab.badge > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ── SegmentedControl ──────────────────────────────────────────────────────────

interface SegmentedControlProps {
  segments: string[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SegmentedControl({ segments, value, onChange, className = '' }: SegmentedControlProps) {
  return (
    <div className={`flex rounded-xl bg-muted p-1 gap-1 ${className}`}>
      {segments.map(seg => (
        <button
          key={seg}
          onClick={() => onChange(seg)}
          className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={value === seg
            ? { background: 'var(--background)', color: 'var(--foreground)', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }
            : { color: 'var(--muted-foreground)' }}
        >
          {seg}
        </button>
      ))}
    </div>
  )
}

// ── InputAccessoryView ────────────────────────────────────────────────────────

interface InputAccessoryViewProps {
  children: ReactNode
  className?: string
}

export function InputAccessoryView({ children, className = '' }: InputAccessoryViewProps) {
  return (
    <div className={`sticky bottom-0 bg-background/95 backdrop-blur border-t border-border px-4 py-2 ${className}`}>
      {children}
    </div>
  )
}

// ── ProgressRing ──────────────────────────────────────────────────────────────

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProgressRing({ value, size = 36, strokeWidth = 3.5 }: ProgressRingProps) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--primary)" strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  )
}
