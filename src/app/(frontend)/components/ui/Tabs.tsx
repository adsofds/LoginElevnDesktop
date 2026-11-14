'use client'

import { useRef, type KeyboardEvent } from 'react'
import { Count } from './Badge'
import { cx } from './cx'

export type TabItem<T extends string> = {
  id: T
  label: string
  count?: number
}

/**
 * Underline tabs. One pattern for every workspace (Interno, Club, Configurações, Ficha).
 * Arrow keys move between tabs, as in the WAI-ARIA tabs pattern.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  tone = 'light',
  className,
}: {
  items: TabItem<T>[]
  value: T
  onChange: (id: T) => void
  label: string
  tone?: 'light' | 'dark'
  className?: string
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1
    const next =
      event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (next === null) return
    event.preventDefault()
    refs.current[next]?.focus()
    onChange(items[next].id)
  }

  const dark = tone === 'dark'

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx(
        'flex shrink-0 items-end gap-6 overflow-x-auto border-b [scrollbar-width:none]',
        dark ? 'border-white/10' : 'border-line',
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
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cx(
              '-mb-px inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 border-b-2 text-sm font-semibold whitespace-nowrap',
              'transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand',
              selected
                ? dark
                  ? 'border-brand-light text-on-dark'
                  : 'border-brand text-ink'
                : dark
                  ? 'border-transparent text-white/55 hover:text-white/85'
                  : 'border-transparent text-ink-3 hover:text-ink',
            )}
          >
            {item.label}
            {item.count ? (
              <Count value={item.count} tone={dark ? 'dark' : selected ? 'brand' : 'neutral'} />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
