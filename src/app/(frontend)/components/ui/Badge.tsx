import type { ReactNode } from 'react'
import { cx } from './cx'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'danger' | 'warning' | 'info' | 'dark'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-subtle text-ink-2 border-line',
  brand: 'bg-brand-soft text-brand border-brand/20',
  success: 'bg-success-soft text-success border-success/15',
  danger: 'bg-danger-soft text-danger border-danger/15',
  warning: 'bg-warning-soft text-warning border-warning/15',
  info: 'bg-info-soft text-info border-info/15',
  dark: 'bg-white/8 text-white/70 border-white/12',
}

const dots: Record<BadgeTone, string> = {
  neutral: 'bg-ink-3',
  brand: 'bg-brand',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-info',
  dark: 'bg-brand-light',
}

/**
 * Status badge: a dot plus dark text on a tinted background, never a saturated pill,
 * so it stays readable (AA) and quiet next to the rest of the panel.
 */
export function Badge({
  tone = 'neutral',
  dot = false,
  className,
  children,
}: {
  tone?: BadgeTone
  dot?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cx(
        'inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cx('size-1.5 rounded-full', dots[tone])} aria-hidden="true" />}
      {children}
    </span>
  )
}

/** Small numeric counter for nav items and tabs. */
export function Count({
  value,
  tone = 'neutral',
  className,
}: {
  value: number
  tone?: 'neutral' | 'brand' | 'dark'
  className?: string
}) {
  if (!value) return null
  return (
    <span
      className={cx(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
        tone === 'brand' && 'bg-brand text-white',
        tone === 'neutral' && 'bg-line-subtle text-ink-2',
        tone === 'dark' && 'bg-white/10 text-white/75',
        className,
      )}
    >
      {value > 99 ? '99+' : value}
    </span>
  )
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cx(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-line bg-surface px-1 font-sans text-[11px] font-semibold text-ink-3',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
