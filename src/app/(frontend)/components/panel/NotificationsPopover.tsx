'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { attentionItems, priorityStyle, type AttentionItem } from '../dashboard/DashboardWidgets'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { Tabs } from '../ui/Tabs'
import { panelHref } from './navigation'
import { usePanel } from './PanelState'

type Filter = 'tudo' | 'alta'

/**
 * Bell in the header: the "Precisa de atenção" alerts (no training logged, late payment,
 * diet plan expiring, check-in with photos, unanswered message). Conversations with the
 * team and students happen on WhatsApp, so there is no inbox here.
 */
export function NotificationsPopover() {
  const router = useRouter()
  const { seenAlerts, markAlertsSeen } = usePanel()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<Filter>('tudo')
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

  const unseen = attentionItems.filter((item) => !seenAlerts.includes(item.id))
  const unseenCount = unseen.length
  const highCount = attentionItems.filter((item) => item.priority === 'alta').length
  const items = attentionItems.filter((item) => filter === 'tudo' || item.priority === 'alta')

  const openAlert = (item: AttentionItem) => {
    markAlertsSeen([item.id])
    setOpen(false)
    router.push(item.studentId ? panelHref('/alunos', { ficha: item.studentId }) : '/dashboard')
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unseenCount ? `${unseenCount} alertas novos` : 'Alertas'}
        className="relative grid size-9 cursor-pointer place-items-center rounded-control text-ink-2 transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Icon name="bell" />
        {unseenCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-canvas bg-brand px-1 text-[10px] font-bold text-white tabular-nums">
            {unseenCount}
          </span>
        )}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Alertas"
          className="absolute top-full right-0 z-40 mt-2 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-card border border-line bg-surface shadow-pop animate-[menu-in_160ms_var(--ease-out-soft)] motion-reduce:animate-none"
        >
          <header className="flex items-center justify-between gap-3 px-4 pt-4">
            <div>
              <p className="text-[15px] font-semibold text-ink">Precisa de atenção</p>
              <p className="text-xs text-ink-3">
                {unseenCount ? `${unseenCount} novos` : 'Nada novo desde a última olhada'}
              </p>
            </div>
            {unseenCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAlertsSeen(attentionItems.map((item) => item.id))}
              >
                Marcar como vistos
              </Button>
            )}
          </header>

          <Tabs
            label="Filtrar alertas"
            className="mt-2 px-4"
            value={filter}
            onChange={setFilter}
            items={[
              { id: 'tudo', label: 'Tudo' },
              { id: 'alta', label: 'Prioridade alta', count: highCount },
            ]}
          />

          <div className="max-h-[360px] overflow-y-auto py-1">
            {items.map((item) => {
              const isNew = !seenAlerts.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openAlert(item)}
                  className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-subtle"
                >
                  {item.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.avatar}
                      alt=""
                      className="size-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-subtle text-xs font-semibold text-ink-2">
                      {item.student
                        .split(' ')
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={cx(
                          'truncate text-sm text-ink',
                          isNew ? 'font-semibold' : 'font-medium',
                        )}
                      >
                        {item.student}
                      </span>
                      <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs text-ink-3">
                        <span
                          aria-hidden="true"
                          className={cx('size-1.5 rounded-full', priorityStyle[item.priority].dot)}
                        />
                        {item.area}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-ink-2">{item.description}</span>
                  </span>
                  {isNew && <span className="sr-only">Novo</span>}
                </button>
              )
            })}
          </div>

          <footer className="border-t border-line p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setOpen(false)
                router.push('/dashboard')
              }}
            >
              Ver no Dashboard
            </Button>
          </footer>
        </section>
      )}
    </div>
  )
}
