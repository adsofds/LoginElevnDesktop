import type { ReactNode } from 'react'
import { cx } from './cx'

export type KpiTone = 'neutral' | 'success' | 'danger' | 'warning'

export type KpiItem = {
  id: string
  label: string
  value: ReactNode
  delta?: { text: string; tone?: KpiTone }
  hint?: string
  active?: boolean
  onClick?: () => void
}

const deltaTone: Record<KpiTone, string> = {
  neutral: 'text-ink-3',
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
}

/**
 * KPIs in a single card split by 1px dividers (Stripe-style). A clickable cell
 * acts as a filter toggle and shows its active state with an accent underline.
 */
export function KpiStrip({ items, label, className }: { items: KpiItem[]; label: string; className?: string }) {
  return (
    <section
      aria-label={label}
      className={cx(
        'grid overflow-hidden rounded-card border border-line bg-surface',
        'grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
        '[&>*]:border-line-subtle [&>*]:border-b md:[&>*]:border-r',
        className,
      )}
    >
      {items.map((item) => {
        const body = (
          <>
            <span className="block text-xs font-medium text-ink-3">{item.label}</span>
            <span className="mt-1.5 block text-[28px] leading-8 font-semibold tracking-[-0.02em] text-ink tabular-nums">
              {item.value}
            </span>
            {item.delta && (
              <span className={cx('mt-1 block text-xs font-semibold', deltaTone[item.delta.tone ?? 'neutral'])}>
                {item.delta.text}
              </span>
            )}
            {item.hint && <span className="mt-0.5 block text-xs text-ink-3">{item.hint}</span>}
            {item.active && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />}
          </>
        )
        const classes = cx(
          'relative min-w-0 px-5 py-4 text-left',
          item.onClick && 'cursor-pointer transition-colors hover:bg-subtle',
          item.active && 'bg-brand-soft/40',
        )
        return item.onClick ? (
          <button key={item.id} type="button" className={classes} onClick={item.onClick} aria-pressed={!!item.active}>
            {body}
          </button>
        ) : (
          <div key={item.id} className={classes}>
            {body}
          </div>
        )
      })}
    </section>
  )
}
