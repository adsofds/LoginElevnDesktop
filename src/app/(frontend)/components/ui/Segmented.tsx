'use client'

import { useRef, type KeyboardEvent } from 'react'
import { cx } from './cx'

export type SegmentedItem<T extends string> = { id: T; label: string; count?: number }

/**
 * Compact single-choice control (radio group). Arrow keys move the selection,
 * like native radios. Use for filters and periods; use Tabs for switching views.
 */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  label,
  size = 'md',
  className,
}: {
  items: SegmentedItem<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0
    if (!step) return
    event.preventDefault()
    const next = (index + step + items.length) % items.length
    onChange(items[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(
        'inline-flex items-center gap-0.5 rounded-control border border-line bg-surface p-0.5',
        className,
      )}
    >
      {items.map((item, index) => {
        const selected = item.id === value
        return (
          <button
            key={item.id}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-[8px] font-medium whitespace-nowrap transition-colors duration-150',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-[13px]',
              selected ? 'bg-ink text-surface' : 'text-ink-2 hover:bg-subtle hover:text-ink',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cx(
                  'tabular-nums text-[11px]',
                  selected ? 'text-surface/70' : 'text-ink-3',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
