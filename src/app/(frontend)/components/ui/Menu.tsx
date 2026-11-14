'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { cx } from './cx'

export type MenuItem = {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  shortcut?: ReactNode
  onSelect: () => void
  danger?: boolean
}

/**
 * Dropdown menu (popover). Opens below its trigger, closes on outside click,
 * Esc or selection; arrow keys move between items.
 */
export function Menu({
  trigger,
  items,
  align = 'end',
  placement = 'bottom',
  label,
  header,
  className,
}: {
  trigger: (props: { open: boolean; toggle: () => void; id: string }) => ReactNode
  items: MenuItem[]
  align?: 'start' | 'end'
  placement?: 'bottom' | 'top'
  label: string
  header?: ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const id = useId()

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
    listRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const onListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const nodes = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    )
    const index = nodes.indexOf(document.activeElement as HTMLElement)
    const next =
      event.key === 'ArrowDown'
        ? (index + 1) % nodes.length
        : (index - 1 + nodes.length) % nodes.length
    nodes[next]?.focus()
  }

  return (
    <div ref={rootRef} className={cx('relative', className)}>
      {trigger({ open, toggle: () => setOpen((current) => !current), id })}
      {open && (
        <div
          ref={listRef}
          id={id}
          role="menu"
          aria-label={label}
          onKeyDown={onListKeyDown}
          className={cx(
            'absolute z-40 min-w-60 rounded-card border border-line bg-surface p-1.5 text-ink shadow-pop',
            'origin-top animate-[menu-in_160ms_var(--ease-out-soft)] motion-reduce:animate-none',
            align === 'end' ? 'right-0' : 'left-0',
            placement === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
          )}
        >
          {header}
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
              className={cx(
                'flex w-full cursor-pointer items-center gap-3 rounded-[8px] px-2.5 py-2 text-left text-sm outline-none',
                'hover:bg-subtle focus-visible:bg-subtle',
                item.danger ? 'text-danger' : 'text-ink',
              )}
            >
              {item.icon && (
                <span className="grid size-5 shrink-0 place-items-center text-ink-3">
                  {item.icon}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{item.label}</span>
                {item.description && (
                  <span className="block text-xs text-ink-3">{item.description}</span>
                )}
              </span>
              {item.shortcut}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
