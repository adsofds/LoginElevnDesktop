'use client'

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'

/*
 * Visual language of the student app: dark, high contrast and thumb-friendly
 * (Smart Fit), with Hevy-style logging. Elevn gold replaces the yellow.
 * Everything is sized for a 390 px wide phone.
 */

export const appTheme = {
  '--app-bg': '#0b0a12',
  '--app-card': '#16141e',
  '--app-card-2': '#1f1c2a',
  '--app-line': 'rgba(255,255,255,0.07)',
  '--app-gold': 'var(--elevn-accent-light)',
  '--app-gold-deep': 'var(--elevn-accent)',
  '--app-green': '#4cc38a',
  '--app-red': '#ff6b6b',
} as React.CSSProperties

export function ScreenHeader({
  title,
  onBack,
  action,
  subtitle,
}: {
  title: string
  onBack?: () => void
  action?: ReactNode
  subtitle?: string
}) {
  return (
    <header className="flex items-center gap-3 px-5 pt-3 pb-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          className="-ml-2 grid size-10 place-items-center rounded-full text-white/80 active:bg-white/10"
        >
          <Icon name="arrowLeft" className="size-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1
          className={cx(
            'truncate font-semibold tracking-[-0.02em] text-white',
            onBack ? 'text-lg' : 'text-[28px] leading-9',
          )}
        >
          {title}
        </h1>
        {subtitle && <p className="truncate text-[13px] text-white/55">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'rounded-[24px] bg-[var(--app-card)] ring-1 ring-white/[0.06] ring-inset',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function GoldButton({
  children,
  onClick,
  className,
  type = 'button',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-gold)_80%,white),var(--app-gold))] text-[15px] font-semibold text-[#0d0a21] shadow-[0_8px_24px_-12px_var(--app-gold)] transition-transform active:scale-[0.98] disabled:opacity-40 disabled:shadow-none',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function GhostButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-medium text-white active:bg-white/10',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 px-5">
      <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-white">{children}</h2>
      {action}
    </div>
  )
}

export function LinkButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-[13px] font-medium text-white/60 active:text-white"
    >
      {children}
      <Icon name="chevronRight" className="size-4" />
    </button>
  )
}

/** Workout letter badge (Smart Fit style), in Elevn gold. */
export function LetterBadge({ code, size = 'md' }: { code: string; size?: 'md' | 'lg' | 'xl' }) {
  return (
    <span
      className={cx(
        'grid shrink-0 place-items-center bg-[linear-gradient(145deg,var(--app-gold),var(--app-gold-deep))] font-bold text-[#0d0a21] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]',
        size === 'xl'
          ? 'size-16 rounded-2xl text-[28px]'
          : size === 'lg'
            ? 'size-12 rounded-[14px] text-xl'
            : 'size-9 rounded-[10px] text-sm',
      )}
    >
      {code}
    </span>
  )
}

export function Chip({
  children,
  tone = 'muted',
}: {
  children: ReactNode
  tone?: 'muted' | 'gold' | 'green'
}) {
  return (
    <span
      className={cx(
        'inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold',
        tone === 'gold' && 'bg-[var(--app-gold)]/15 text-[var(--app-gold)]',
        tone === 'green' && 'bg-[var(--app-green)]/15 text-[var(--app-green)]',
        tone === 'muted' && 'bg-white/[0.07] text-white/70',
      )}
    >
      {children}
    </span>
  )
}

/**
 * Placeholder for Breno's own exercise videos: shows where the video goes, its length,
 * and a play affordance. Swap the inner content for the real thumbnail when uploaded.
 */
export function VideoTile({
  label,
  length,
  size = 'md',
  onPlay,
}: {
  label: string
  length: string
  size?: 'sm' | 'md'
  onPlay: () => void
}) {
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Ver vídeo: ${label}`}
      className={cx(
        'relative grid shrink-0 place-items-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_60%),linear-gradient(160deg,#2a2536,#15131c)] ring-1 ring-white/10 ring-inset',
        size === 'md' ? 'h-16 w-14 rounded-2xl' : 'h-12 w-11 rounded-xl',
      )}
    >
      <span className="grid size-7 place-items-center rounded-full bg-[var(--app-gold)] text-[#0d0a21]">
        <svg viewBox="0 0 24 24" className="ml-0.5 size-3.5" fill="currentColor" aria-hidden="true">
          <path d="M7 4.5v15l13-7.5z" />
        </svg>
      </span>
      <span className="absolute bottom-1 text-[9px] font-semibold text-white/70 tabular-nums">
        {length}
      </span>
    </button>
  )
}

/** Progress ring for macros and goals. */
export function Ring({
  value,
  max,
  size = 120,
  stroke = 10,
  color = 'var(--app-gold)',
  children,
}: {
  value: number
  max: number
  size?: number
  stroke?: number
  color?: string
  children?: ReactNode
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = Math.min(1, max ? value / max : 0)
  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="relative text-center">{children}</div>
    </div>
  )
}

export function Bar({
  value,
  max,
  color = 'var(--app-gold)',
}: {
  value: number
  max: number
  color?: string
}) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
        style={{ width: `${Math.min(100, max ? (value / max) * 100 : 0)}%`, background: color }}
      />
    </div>
  )
}

/** Bottom sheet inside the phone (exercise video, swaps…). */
/**
 * The app's root element. Sheets render there so they cover the phone screen, not the
 * (possibly very tall) scrolling content they were opened from.
 */
export const SheetHostContext = createContext<HTMLElement | null>(null)

export function PhoneSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const host = useContext(SheetHostContext)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Esc closes; focus goes into the sheet and back to where it was on close.
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus({ preventScroll: true })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus?.({ preventScroll: true })
    }
  }, [open])

  if (!open) return null
  const sheet = (
    <div
      className="absolute inset-0 z-40 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div className="relative max-h-[85%] overflow-y-auto rounded-t-[28px] bg-[var(--app-card)] px-5 pt-3 pb-8 animate-[sheet-up_220ms_ease-out] motion-reduce:animate-none">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-white"
          >
            <Icon name="close" className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
  return host ? createPortal(sheet, host) : sheet
}

export const formatClock = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const sec = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}
