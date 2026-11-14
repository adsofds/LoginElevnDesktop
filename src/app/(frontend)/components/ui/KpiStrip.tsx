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
  /** Accessible name for a clickable cell, e.g. "Abrir alunos vencendo". */
  actionLabel?: string
  /** Trend line drawn under the value; neutral until the cell is hovered. */
  spark?: number[]
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const points = values
    .map(
      (value, index) =>
        `${(index / (values.length - 1)) * 100},${22 - ((value - min) / range) * 20}`,
    )
    .join(' ')
  return (
    <div className="mt-auto pt-3">
      <svg
        viewBox="0 0 100 24"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="block h-6 w-full overflow-visible text-ink-3/45 transition-colors duration-200 group-hover:text-brand"
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
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
export function KpiStrip({
  items,
  label,
  className,
  columns = 6,
}: {
  items: KpiItem[]
  label: string
  className?: string
  columns?: 4 | 6
}) {
  return (
    <section
      aria-label={label}
      className={cx(
        'grid overflow-hidden rounded-card border border-line bg-surface',
        columns === 6 ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6' : 'grid-cols-2 lg:grid-cols-4',
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
              <span
                className={cx(
                  'mt-1 block text-xs font-semibold',
                  deltaTone[item.delta.tone ?? 'neutral'],
                )}
              >
                {item.delta.text}
              </span>
            )}
            {item.hint && <span className="mt-0.5 block text-xs text-ink-3">{item.hint}</span>}
            {item.spark && <Sparkline values={item.spark} />}
            {item.actionLabel && <span className="sr-only">. {item.actionLabel}</span>}
            {item.active && (
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
            )}
          </>
        )
        const classes = cx(
          'group relative flex min-w-0 flex-col px-5 py-4 text-left',
          item.onClick && 'cursor-pointer transition-colors hover:bg-subtle',
          item.active && 'bg-brand-soft/40',
        )
        return item.onClick ? (
          <button
            key={item.id}
            type="button"
            className={classes}
            onClick={item.onClick}
            aria-pressed={item.active}
            title={item.actionLabel}
          >
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
