'use client'

import type { ReactNode } from 'react'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'

/** One collapsible block of the student file (Check-in, Treino, Dieta, Fotos, Acesso). */
export function FichaSection({
  id,
  title,
  summary,
  badge,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  /** One line shown next to the title, so a closed section still says something useful. */
  summary?: ReactNode
  badge?: ReactNode
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const panelId = `ficha-panel-${id}`
  return (
    <section
      id={`ficha-${id}`}
      className={cx(
        'scroll-mt-32 rounded-card border bg-surface transition-colors',
        open ? 'border-line' : 'border-line-subtle',
      )}
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center gap-3 rounded-card px-5 py-4 text-left transition-colors hover:bg-subtle/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
        >
          <span className="text-[15px] font-semibold text-ink">{title}</span>
          {badge}
          {summary && (
            <span className="hidden min-w-0 flex-1 truncate text-[13px] text-ink-3 sm:block">
              {summary}
            </span>
          )}
          <Icon
            name="chevronRight"
            className={cx(
              'ml-auto size-4 shrink-0 text-ink-3 transition-transform duration-200 ease-out-soft motion-reduce:transition-none',
              open && 'rotate-90',
            )}
          />
        </button>
      </h3>
      {open && (
        <div id={panelId} className="border-t border-line px-5 py-5">
          {children}
        </div>
      )}
    </section>
  )
}
