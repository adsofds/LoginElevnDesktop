'use client'

import { useEffect, useRef, useState } from 'react'
import { Count } from './Badge'
import { cx } from './cx'
import { Icon } from './icons'

export type FilterOption<T extends string> = { id: T; label: string; count?: number }

/** Multi-select filter in a popover (checkbox list). Stays open while toggling options. */
export function FilterMenu<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string
  options: FilterOption<T>[]
  value: T[]
  onChange: (next: T[]) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const toggle = (id: T) => onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id])

  return (
    <div ref={rootRef} className={cx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cx(
          'inline-flex h-9 cursor-pointer items-center gap-2 rounded-control border bg-surface px-3 text-sm font-medium transition-colors',
          value.length ? 'border-brand text-ink' : 'border-line text-ink-2 hover:border-ink-3',
        )}
      >
        {label}
        {value.length > 0 && <Count value={value.length} tone="brand" />}
        <Icon name="chevronUpDown" className="size-3.5 text-ink-3" />
      </button>
      {open && (
        <div
          role="group"
          aria-label={label}
          className="absolute top-full left-0 z-40 mt-2 w-64 rounded-card border border-line bg-surface p-1.5 shadow-pop animate-[menu-in_160ms_var(--ease-out-soft)]"
        >
          {options.map((option) => {
            const checked = value.includes(option.id)
            return (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-sm text-ink hover:bg-subtle"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option.id)}
                  className="size-4 accent-[var(--elevn-accent)]"
                />
                <span className="flex-1">{option.label}</span>
                {option.count !== undefined && <span className="text-xs text-ink-3 tabular-nums">{option.count}</span>}
              </label>
            )
          })}
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 w-full cursor-pointer rounded-[8px] border-t border-line px-2.5 py-2 text-left text-xs font-medium text-ink-3 hover:text-ink"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
