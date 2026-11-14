'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from './cx'

/**
 * Side panel over the page. Closes on Esc and on overlay click, returns focus
 * to the element that opened it, and keeps Tab inside while open.
 */
export function Sheet({
  open,
  onClose,
  side = 'right',
  label,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right'
  label: string
  className?: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
    focusables()[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  return (
    <div
      className={cx('fixed inset-0 z-50', open ? 'visible' : 'invisible pointer-events-none')}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar painel"
        onClick={onClose}
        className={cx(
          'absolute inset-0 cursor-default bg-night/45 backdrop-blur-[2px] transition-opacity duration-300 ease-out-soft',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cx(
          'absolute top-0 bottom-0 flex flex-col shadow-modal transition-transform duration-300 ease-out-soft motion-reduce:transition-none',
          side === 'left' ? 'left-0' : 'right-0',
          open ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
