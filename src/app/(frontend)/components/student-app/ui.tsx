'use client'

import type { ReactNode } from 'react'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'

/*
 * Visual language of the student app: dark, high contrast and thumb-friendly
 * (Smart Fit), with Hevy-style logging. Elevn gold replaces the yellow.
 * Everything is sized for a 390 px wide phone.
 */

export const appTheme = {
  '--app-bg': '#09080f',
  '--app-card': '#17151f',
  '--app-card-2': '#211e2c',
  '--app-line': 'rgba(255,255,255,0.08)',
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
  return <div className={cx('rounded-[20px] bg-[var(--app-card)]', className)}>{children}</div>
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
        'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--app-gold)] text-[15px] font-semibold text-[#0d0a21] transition-transform active:scale-[0.98] disabled:opacity-40',
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
      <h2 className="text-[19px] font-semibold tracking-[-0.01em] text-white">{children}</h2>
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

/** Workout letter badge (Smart Fit style). */
export function LetterBadge({ code, size = 'md' }: { code: string; size?: 'md' | 'lg' }) {
  return (
    <span
      className={cx(
        'grid shrink-0 place-items-center rounded-lg bg-[var(--app-gold-deep)] font-bold text-[var(--app-gold)]',
        size === 'lg' ? 'size-11 text-lg' : 'size-8 text-sm',
      )}
    >
      {code}
    </span>
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
  if (!open) return null
  return (
    <div
      className="absolute inset-0 z-40 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div className="relative max-h-[85%] overflow-y-auto rounded-t-[28px] bg-[var(--app-card)] px-5 pt-3 pb-8 animate-[sheet-up_220ms_ease-out] motion-reduce:animate-none">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-9 place-items-center rounded-full bg-white/10 text-white"
          >
            <Icon name="close" className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const formatClock = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const sec = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}
