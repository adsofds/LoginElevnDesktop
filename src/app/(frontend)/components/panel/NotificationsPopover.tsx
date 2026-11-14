'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Count } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { Tabs } from '../ui/Tabs'
import { panelHref } from './navigation'
import { usePanel } from './PanelState'

type Filter = 'tudo' | 'aluno' | 'equipe'

/** Bell in the header: unread inbox items, filtered by origin, with "mark all as read". */
export function NotificationsPopover() {
  const router = useRouter()
  const { internalUpdates, unreadCount, markInternalUpdateRead, markAllInternalUpdatesRead } =
    usePanel()
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

  const items = internalUpdates
    .filter((update) => filter === 'tudo' || update.recipientCategory === filter)
    .slice(0, 6)
  const countFor = (category: 'aluno' | 'equipe') =>
    internalUpdates.filter((update) => update.unread && update.recipientCategory === category)
      .length

  const openConversation = (id: string) => {
    markInternalUpdateRead(id, false)
    setOpen(false)
    router.push(panelHref('/interno', { aba: 'atualizacoes', conversa: id }))
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unreadCount ? `${unreadCount} mensagens não lidas` : 'Notificações'}
        className="relative grid size-9 cursor-pointer place-items-center rounded-control text-ink-2 transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Icon name="bell" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-canvas bg-brand px-1 text-[10px] font-bold text-white tabular-nums">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Notificações"
          className="absolute top-full right-0 z-40 mt-2 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-card border border-line bg-surface shadow-pop animate-[menu-in_160ms_var(--ease-out-soft)] motion-reduce:animate-none"
        >
          <header className="flex items-center justify-between gap-3 px-4 pt-4">
            <div>
              <p className="text-[15px] font-semibold text-ink">Caixa de entrada</p>
              <p className="text-xs text-ink-3">
                {unreadCount ? `${unreadCount} não lidas` : 'Tudo em dia'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllInternalUpdatesRead}>
                Marcar tudo como lido
              </Button>
            )}
          </header>

          <Tabs
            label="Filtrar notificações"
            className="mt-2 px-4"
            value={filter}
            onChange={setFilter}
            items={[
              { id: 'tudo', label: 'Tudo' },
              { id: 'aluno', label: 'Alunos', count: countFor('aluno') },
              { id: 'equipe', label: 'Equipe', count: countFor('equipe') },
            ]}
          />

          <div className="max-h-[360px] overflow-y-auto py-1">
            {items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-ink-3">Nenhuma mensagem aqui.</p>
            )}
            {items.map((update) => (
              <button
                key={update.id}
                type="button"
                onClick={() => openConversation(update.id)}
                className="flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition-colors hover:bg-subtle"
              >
                <img
                  src={update.avatar}
                  alt=""
                  className="size-8 shrink-0 rounded-full object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={cx(
                        'truncate text-sm text-ink',
                        update.unread ? 'font-semibold' : 'font-medium',
                      )}
                    >
                      {update.author}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-ink-3">{update.time}</span>
                  </span>
                  <span className="block truncate text-xs text-ink-2">
                    {update.subject || update.type}
                  </span>
                </span>
                {update.unread && (
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
                    aria-label="Não lida"
                  />
                )}
              </button>
            ))}
          </div>

          <footer className="border-t border-line p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setOpen(false)
                router.push(panelHref('/interno', { aba: 'atualizacoes' }))
              }}
            >
              Abrir caixa de entrada
              <Count value={unreadCount} />
            </Button>
          </footer>
        </section>
      )}
    </div>
  )
}
