'use client'

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import {
  ADHERENCE_GOAL,
  activeStudentsSeries,
  adherenceSeries,
  kpiSparks,
  periodDelta,
  pointLabels,
  type DashboardPeriod,
} from '@/lib/dashboardPeriod'
import {
  agendaTypeColor,
  demoAgenda,
  minutesNowInSaoPaulo,
  toMinutes,
  type AgendaEvent,
} from '@/lib/demo-agenda'
import type { SiteFormSubmission } from '@/lib/demo-internal'
import { panelHref } from '../panel/navigation'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { KpiStrip, type KpiItem } from '../ui/KpiStrip'
import { Kbd } from '../ui/Badge'
import { Menu } from '../ui/Menu'

/* ------------------------------------------------------------------ hooks */

/** Current time, set after hydration and refreshed every minute (null on the server). */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const timer = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])
  return now
}

function useElementWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    setWidth(element.getBoundingClientRect().width)
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return width
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ------------------------------------------------------------- primitives */

/** Loading placeholder shaped like the widget it stands in for. */
export function WidgetSkeleton({ rows = 4, chart = false }: { rows?: number; chart?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-1 animate-pulse flex-col gap-3 px-5 pb-5 motion-reduce:animate-none"
    >
      {chart ? (
        <>
          <div className="h-7 w-24 rounded-md bg-subtle" />
          <div className="mt-2 flex-1 rounded-lg bg-subtle" />
        </>
      ) : (
        Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="size-8 shrink-0 rounded-full bg-subtle" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-2/3 rounded bg-subtle" />
              <div className="h-2.5 w-1/3 rounded bg-subtle" />
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function WidgetFooterLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-auto inline-flex items-center gap-1 self-start pt-3 text-[13px] font-medium text-brand transition-colors hover:text-brand-hover"
    >
      {children}
      <Icon name="arrowRight" className="size-3.5" />
    </button>
  )
}

function Avatar({ src, name, size = 32 }: { src?: string; name: string; size?: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand"
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  )
}

/* ------------------------------------------------------------------- KPIs */

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export function KpiOverview({
  period,
  siteForms,
  onNavigate,
  onOpenSiteForms,
}: {
  period: DashboardPeriod
  siteForms: SiteFormSubmission[]
  onNavigate: (href: string) => void
  onOpenSiteForms: () => void
}) {
  const active = activeStudentsSeries[period]
  const sparks = kpiSparks[period]
  const closed = siteForms.filter((item) => item.temperature === 'Fechado').length
  const hot = siteForms.filter((item) => item.temperature === 'Quente').length
  const answeredRate = period === '6m' ? 87 : 89

  const items: KpiItem[] = [
    {
      id: 'active',
      label: 'Alunos ativos',
      value: active[active.length - 1].value,
      delta: periodDelta(period, active),
      spark: active.map((point) => point.value),
      onClick: () => onNavigate('/alunos'),
      actionLabel: 'Abrir carteira de alunos',
    },
    {
      id: 'forms',
      label: 'Formulários do site',
      value: String(siteForms.length).padStart(2, '0'),
      delta: { text: `${closed} fechados · ${hot} quentes`, tone: 'neutral' },
      hint: 'total recebido',
      onClick: onOpenSiteForms,
      actionLabel: 'Abrir planilha de formulários',
    },
    {
      id: 'expiring',
      label: 'Planos vencendo',
      value: '09',
      delta: { text: '3 críticos em 4 dias', tone: 'danger' },
      hint: 'nos próximos 7 dias',
      spark: sparks.expiring,
      onClick: () => onNavigate(panelHref('/alunos', { visao: 'vencendo' })),
      actionLabel: 'Abrir alunos com plano vencendo',
    },
    {
      id: 'revenue',
      label: 'Receita do mês',
      value: currency.format(24200),
      delta: { text: '▲ +8% vs. mês anterior', tone: 'success' },
      hint: 'ticket médio R$ 418',
      spark: sparks.revenue,
    },
    {
      id: 'pending',
      label: 'Check-ins pendentes',
      value: '14',
      delta: { text: '5 novos hoje', tone: 'warning' },
      hint: '4 para responder hoje',
      spark: sparks.pending,
      onClick: () => onNavigate(panelHref('/alunos', { visao: 'atencao' })),
      actionLabel: 'Abrir alunos que precisam de atenção',
    },
    {
      id: 'answered',
      label: 'Check-ins respondidos',
      value: `${answeredRate}%`,
      delta: {
        text:
          answeredRate >= ADHERENCE_GOAL
            ? `acima da meta de ${ADHERENCE_GOAL}%`
            : `abaixo da meta de ${ADHERENCE_GOAL}%`,
        tone: answeredRate >= ADHERENCE_GOAL ? 'success' : 'warning',
      },
      hint: period === '6m' ? 'média dos últimos 6 meses' : '114 de 128 nesta semana',
      spark: sparks.answered,
    },
  ]

  return <KpiStrip label="Indicadores executivos" items={items} />
}

/* -------------------------------------------------------- Precisa de atenção */

type Priority = 'alta' | 'media' | 'baixa'

type AttentionItem = {
  id: string
  area: string
  priority: Priority
  description: string
  student: string
  studentId?: string
  avatar?: string
  action: string
}

const attentionItems: AttentionItem[] = [
  {
    id: 'at-1',
    area: 'Treino',
    priority: 'alta',
    description: 'Sem registrar treino há 5 dias',
    student: 'Lucas Andrade',
    studentId: 'student-lucas',
    avatar: '/people/gustavo-lima.jpg',
    action: 'Enviar mensagem',
  },
  {
    id: 'at-2',
    area: 'Financeiro',
    priority: 'alta',
    description: 'Pagamento atrasado',
    student: 'Pedro Lima',
    studentId: 'student-pedro',
    avatar: '/people/breno-monteiro.png',
    action: 'Ver cobrança',
  },
  {
    id: 'at-3',
    area: 'Dieta',
    priority: 'alta',
    description: 'Plano de dieta vence em 2 dias',
    student: 'Rafael Souza',
    studentId: 'student-rafael',
    avatar: '/people/gustavo-lima.jpg',
    action: 'Renovar',
  },
  {
    id: 'at-4',
    area: 'Check-in',
    priority: 'media',
    description: 'Check-in semanal enviado com fotos',
    student: 'Camila Rocha',
    studentId: 'student-camila',
    avatar: '/people/renata-alves.jpg',
    action: 'Revisar',
  },
  {
    id: 'at-5',
    area: 'Mensagem',
    priority: 'media',
    description: 'Mensagem sem resposta há 1 dia',
    student: 'Juliana Costa',
    studentId: 'student-juliana',
    avatar: '/people/paula-nunes.jpg',
    action: 'Responder',
  },
  {
    id: 'at-6',
    area: 'Treino',
    priority: 'baixa',
    description: 'Treino precisa de ajuste de carga',
    student: 'Sofia Ribeiro',
    action: 'Ajustar',
  },
  {
    id: 'at-7',
    area: 'Check-in',
    priority: 'baixa',
    description: 'Avaliação mensal ainda não revisada',
    student: 'Diego Castro',
    action: 'Revisar',
  },
]

const priorityStyle: Record<Priority, { dot: string; label: string }> = {
  alta: { dot: 'bg-danger', label: 'Alta' },
  media: { dot: 'bg-warning', label: 'Média' },
  baixa: { dot: 'bg-ink-3', label: 'Baixa' },
}

const VISIBLE_ATTENTION = 5

export function AttentionQueue({ onNavigate }: { onNavigate: (href: string) => void }) {
  const [done, setDone] = useState<string[]>([])
  const [leaving, setLeaving] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [toast, setToast] = useState<{ id: string; text: string } | null>(null)
  const rowRefs = useRef(new Map<string, HTMLDivElement>())

  const open = attentionItems.filter((item) => !done.includes(item.id))
  const visible = expanded ? open : open.slice(0, VISIBLE_ATTENTION)
  const hidden = open.length - visible.length

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 6000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const focusRow = (id?: string) => {
    if (id) rowRefs.current.get(id)?.focus()
  }

  const complete = (item: AttentionItem, verb = 'concluído') => {
    if (leaving) return
    const index = visible.findIndex((entry) => entry.id === item.id)
    const next = visible[index + 1] ?? visible[index - 1]
    setLeaving(item.id)
    setToast({ id: item.id, text: `${item.student} · ${verb}` })
    window.setTimeout(
      () => {
        setDone((current) => [...current, item.id])
        setLeaving(null)
        focusRow(next?.id)
      },
      prefersReducedMotion() ? 0 : 200,
    )
  }

  const undo = () => {
    if (!toast) return
    setDone((current) => current.filter((id) => id !== toast.id))
    setToast(null)
  }

  const onRowKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    item: AttentionItem,
    index: number,
  ) => {
    if (event.target !== event.currentTarget) return
    const key = event.key.toLowerCase()
    if (key === 'j' || key === 'arrowdown') {
      event.preventDefault()
      focusRow(visible[index + 1]?.id)
    } else if (key === 'k' || key === 'arrowup') {
      event.preventDefault()
      focusRow(visible[index - 1]?.id)
    } else if (key === 'e' || key === 'enter') {
      event.preventDefault()
      complete(item)
    }
  }

  return (
    <div className="flex min-h-full flex-col px-5 pb-4">
      <div className="mb-1 flex items-center justify-between gap-3 text-xs text-ink-3">
        <span>
          <strong className="font-semibold text-ink-2 tabular-nums">{open.length}</strong>{' '}
          {open.length === 1 ? 'pendência' : 'pendências'} para hoje
        </span>
        <span className="hidden items-center gap-1 lg:inline-flex" aria-hidden="true">
          <Kbd>J</Kbd>
          <Kbd>K</Kbd> navegar · <Kbd>E</Kbd> concluir
        </span>
      </div>

      {open.length === 0 ? (
        <div className="grid flex-1 place-items-center py-8 text-center">
          <div>
            <span className="mx-auto grid size-10 place-items-center rounded-full bg-success-soft text-success">
              <Icon name="check" className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium text-ink">Tudo em dia por hoje</p>
            <p className="mt-0.5 text-xs text-ink-3">
              Novas pendências aparecem aqui assim que chegarem.
            </p>
          </div>
        </div>
      ) : (
        <div role="list" aria-label="Pendências" className="divide-y divide-line-subtle">
          {visible.map((item, index) => {
            const priority = priorityStyle[item.priority]
            return (
              <div
                key={item.id}
                role="listitem"
                ref={(node) => {
                  if (node) rowRefs.current.set(item.id, node)
                  else rowRefs.current.delete(item.id)
                }}
                tabIndex={0}
                aria-label={`${item.description}, ${item.student}. Prioridade ${priority.label}.`}
                onKeyDown={(event) => onRowKeyDown(event, item, index)}
                className={cx(
                  'group/row -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 outline-none transition-[opacity,transform,background-color] duration-200 ease-out-soft',
                  'hover:bg-subtle focus-visible:bg-subtle focus-visible:ring-2 focus-visible:ring-brand/40',
                  leaving === item.id && 'translate-x-4 opacity-0',
                )}
              >
                <Avatar src={item.avatar} name={item.student} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{item.description}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink-3">
                    <span
                      aria-hidden="true"
                      className={cx('size-1.5 shrink-0 rounded-full', priority.dot)}
                    />
                    <span className="sr-only">Prioridade {priority.label}.</span>
                    {item.area} · {item.student}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="shrink-0 max-sm:hidden"
                  onClick={() => complete(item)}
                >
                  {item.action}
                </Button>
                <Menu
                  label={`Mais ações para ${item.student}`}
                  items={[
                    { id: 'primary', label: item.action, onSelect: () => complete(item) },
                    ...(item.studentId
                      ? [
                          {
                            id: 'ficha',
                            label: 'Abrir ficha do aluno',
                            onSelect: () =>
                              onNavigate(panelHref('/alunos', { ficha: item.studentId })),
                          },
                        ]
                      : []),
                    {
                      id: 'snooze',
                      label: 'Adiar para amanhã',
                      onSelect: () => complete(item, 'adiado para amanhã'),
                    },
                    {
                      id: 'done',
                      label: 'Marcar como concluído',
                      shortcut: <Kbd>E</Kbd>,
                      onSelect: () => complete(item),
                    },
                  ]}
                  trigger={({ open: menuOpen, toggle, id }) => (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 shrink-0"
                      onClick={toggle}
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                      aria-controls={menuOpen ? id : undefined}
                      aria-label={`Mais ações para ${item.student}`}
                    >
                      <Icon name="dots" className="size-4" />
                    </Button>
                  )}
                />
              </div>
            )
          })}
        </div>
      )}

      {(hidden > 0 || expanded) && open.length > VISIBLE_ATTENTION && (
        <WidgetFooterLink onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Mostrar menos' : `Ver todas (${open.length})`}
        </WidgetFooterLink>
      )}

      {toast &&
        createPortal(
          <div
            role="status"
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full bg-night py-2 pr-2 pl-4 text-sm text-on-dark shadow-pop"
          >
            <span>{toast.text}</span>
            <button
              type="button"
              onClick={undo}
              className="rounded-full px-3 py-1 font-semibold text-brand-light transition-colors hover:bg-white/10"
            >
              Desfazer
            </button>
          </div>,
          document.body,
        )}
    </div>
  )
}

/* ------------------------------------------------------------- Agenda */

const dayLabel = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  timeZone: 'America/Sao_Paulo',
})

function agendaDayTitle(offset: number, now: Date) {
  if (offset === 1) return 'Amanhã'
  const label = dayLabel.format(new Date(now.getTime() + offset * 86_400_000)).replace('.', '')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function AgendaRow({ event, state }: { event: AgendaEvent; state: 'past' | 'now' | 'next' }) {
  return (
    <li className={cx('relative flex gap-3 py-2', state === 'past' && 'opacity-55')}>
      <time className="w-11 shrink-0 pt-0.5 text-xs font-medium text-ink-2 tabular-nums">
        {event.time}
      </time>
      <span
        aria-hidden="true"
        className={cx(
          'mt-1 w-[3px] shrink-0 self-stretch rounded-full',
          agendaTypeColor[event.type],
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">
          {event.title}
          {state === 'now' && (
            <span className="ml-2 rounded-full bg-brand-soft px-1.5 py-0.5 align-middle text-[11px] font-semibold text-brand">
              agora
            </span>
          )}
        </p>
        <p className="truncate text-xs text-ink-3">
          {event.person} · {event.type} · {event.durationMin} min
        </p>
      </div>
    </li>
  )
}

export function TodayAgenda({ onNavigate }: { onNavigate: (href: string) => void }) {
  const now = useNow()
  if (!now) return <WidgetSkeleton rows={4} />

  const minutes = minutesNowInSaoPaulo(now)
  const today = demoAgenda
    .filter((event) => event.dayOffset === 0)
    .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
  const upcoming = demoAgenda.filter((event) => event.dayOffset > 0 && event.dayOffset <= 3)
  const markerIndex = today.findIndex((event) => toMinutes(event.time) > minutes)
  const nowLabel = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  const remaining = today.filter(
    (event) => toMinutes(event.time) + event.durationMin > minutes,
  ).length

  const marker = (
    <li key="now" aria-label={`Agora, ${nowLabel}`} className="flex items-center gap-3 py-1">
      <span className="w-11 shrink-0 text-[11px] font-semibold text-brand tabular-nums">
        {nowLabel}
      </span>
      <span aria-hidden="true" className="relative h-px flex-1 bg-brand">
        <span className="absolute -top-[3.5px] -left-1 size-2 rounded-full bg-brand" />
      </span>
    </li>
  )

  const rows: ReactNode[] = []
  today.forEach((event, index) => {
    if (index === markerIndex) rows.push(marker)
    const start = toMinutes(event.time)
    const state = start + event.durationMin <= minutes ? 'past' : start <= minutes ? 'now' : 'next'
    rows.push(<AgendaRow key={event.id} event={event} state={state} />)
  })
  if (markerIndex === -1) rows.push(marker)

  const groups = [1, 2, 3]
    .map((offset) => ({ offset, events: upcoming.filter((event) => event.dayOffset === offset) }))
    .filter((group) => group.events.length > 0)

  return (
    <div className="flex min-h-full flex-col px-5 pb-4">
      <p className="mb-1 text-xs text-ink-3">
        {remaining > 0
          ? `${remaining} ${remaining === 1 ? 'compromisso restante' : 'compromissos restantes'} hoje`
          : 'Sem mais compromissos hoje'}
      </p>
      <ol aria-label="Compromissos de hoje">{rows}</ol>

      {groups.length > 0 && (
        <details className="group/details mt-2 border-t border-line-subtle pt-2">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded py-1 text-xs font-medium text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
            <Icon
              name="chevronRight"
              className="size-3.5 transition-transform group-open/details:rotate-90"
            />
            Próximos 3 dias ({upcoming.length})
          </summary>
          {groups.map((group) => (
            <div key={group.offset} className="mt-2">
              <p className="text-[11px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
                {agendaDayTitle(group.offset, now)}
              </p>
              <ol>
                {group.events.map((event) => (
                  <AgendaRow key={event.id} event={event} state="next" />
                ))}
              </ol>
            </div>
          ))}
        </details>
      )}

      <WidgetFooterLink onClick={() => onNavigate(panelHref('/interno', { aba: 'atualizacoes' }))}>
        Abrir agenda no Interno
      </WidgetFooterLink>
    </div>
  )
}

/* ------------------------------------------------------------- Charts */

function ChartTooltip({ x, title, children }: { x: number; title: string; children: ReactNode }) {
  return (
    <div
      role="status"
      className="pointer-events-none absolute top-0 z-10 w-max max-w-[220px] -translate-x-1/2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-pop"
      style={{ left: x }}
    >
      <p className="text-ink-3">{title}</p>
      <div className="font-semibold text-ink tabular-nums">{children}</div>
    </div>
  )
}

const niceBounds = (values: number[]) => {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const step = max - min > 8 ? 5 : 1
  const low = Math.floor((min - step) / step) * step
  const high = Math.ceil((max + step) / step) * step
  return { low, high, mid: Math.round((low + high) / 2) }
}

export function ActiveStudentsChart({ period }: { period: DashboardPeriod }) {
  const now = useNow()
  const boxRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(boxRef)
  const [hover, setHover] = useState<number | null>(null)
  const series = activeStudentsSeries[period]
  const values = series.map((point) => point.value)
  const delta = periodDelta(period, series)
  const height = 176
  const pad = { top: 34, right: 36, bottom: 24, left: 34 }
  const { low, high, mid } = niceBounds(values)
  const innerWidth = Math.max(0, width - pad.left - pad.right)
  const x = (index: number) =>
    pad.left + (series.length === 1 ? innerWidth / 2 : (index * innerWidth) / (series.length - 1))
  const y = (value: number) =>
    pad.top + (1 - (value - low) / (high - low)) * (height - pad.top - pad.bottom)
  const granularity = period === '7d' ? 'weekday' : 'date'
  const labels = now ? series.map((point) => pointLabels(point, now, granularity)) : []
  const line = series
    .map((point, index) => `${index ? 'L' : 'M'}${x(index)},${y(point.value)}`)
    .join(' ')
  const last = series.length - 1

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    setHover((current) => {
      const start = current ?? last
      return Math.max(0, Math.min(last, start + (event.key === 'ArrowRight' ? 1 : -1)))
    })
  }

  return (
    <div className="flex min-h-full flex-col px-5 pb-4">
      <div className="flex items-baseline gap-2">
        <strong className="text-[28px] leading-8 font-semibold tracking-[-0.02em] text-ink tabular-nums">
          {values[last]}
        </strong>
        <span
          className={cx(
            'text-xs font-semibold',
            delta.tone === 'success'
              ? 'text-success'
              : delta.tone === 'danger'
                ? 'text-danger'
                : 'text-ink-3',
          )}
        >
          {delta.text}
        </span>
      </div>
      <div ref={boxRef} className="relative mt-1 min-h-[176px] flex-1">
        {width > 0 && now && (
          <>
            <svg
              width={width}
              height={height}
              role="img"
              tabIndex={0}
              aria-label={`Alunos ativos: ${series.map((point, index) => `${labels[index].full}, ${point.value}`).join('; ')}`}
              onKeyDown={onKeyDown}
              onFocus={() => setHover(last)}
              onBlur={() => setHover(null)}
              onMouseLeave={() => setHover(null)}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                const relative = event.clientX - rect.left - pad.left
                const index = Math.round((relative / (innerWidth || 1)) * last)
                setHover(Math.max(0, Math.min(last, index)))
              }}
              className="block overflow-visible rounded outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <defs>
                <linearGradient id="active-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--elevn-accent)" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="var(--elevn-accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[high, mid, low].map((tick) => (
                <g key={tick}>
                  <line
                    x1={pad.left}
                    x2={width - pad.right}
                    y1={y(tick)}
                    y2={y(tick)}
                    stroke="var(--border-subtle)"
                  />
                  <text
                    x={pad.left - 8}
                    y={y(tick)}
                    dy="0.32em"
                    textAnchor="end"
                    className="fill-ink-3 text-[11px] tabular-nums"
                  >
                    {tick}
                  </text>
                </g>
              ))}
              <path
                d={`${line} L${x(last)},${height - pad.bottom} L${x(0)},${height - pad.bottom} Z`}
                fill="url(#active-area)"
              />
              <path
                d={line}
                fill="none"
                stroke="var(--elevn-accent)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {hover !== null && (
                <line
                  x1={x(hover)}
                  x2={x(hover)}
                  y1={pad.top - 6}
                  y2={height - pad.bottom}
                  stroke="var(--text-tertiary)"
                  strokeDasharray="3 3"
                />
              )}
              {series.map((point, index) => (
                <circle
                  key={index}
                  cx={x(index)}
                  cy={y(point.value)}
                  r={hover === index || index === last ? 4 : 0}
                  fill="var(--bg-surface)"
                  stroke="var(--elevn-accent)"
                  strokeWidth="2"
                />
              ))}
              <text
                x={x(last) + 8}
                y={y(values[last])}
                dy="0.32em"
                className="fill-ink text-xs font-semibold tabular-nums"
              >
                {values[last]}
              </text>
              {series.map((_, index) => {
                const step = Math.ceil(series.length / Math.max(2, Math.floor(innerWidth / 56)))
                if (index % step !== 0 && index !== last) return null
                return (
                  <text
                    key={index}
                    x={x(index)}
                    y={height - 6}
                    textAnchor="middle"
                    className="fill-ink-3 text-[11px]"
                  >
                    {labels[index].short}
                  </text>
                )
              })}
            </svg>
            {hover !== null && (
              <ChartTooltip x={x(hover)} title={labels[hover].full}>
                {series[hover].value} alunos ativos
              </ChartTooltip>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function AdherenceChart({ period }: { period: DashboardPeriod }) {
  const now = useNow()
  const [hover, setHover] = useState<number | null>(null)
  const points = adherenceSeries[period]
  const rates = points.map((point) => Math.round((point.answered / point.total) * 100))
  const current = points[points.length - 1]
  const currentRate = rates[rates.length - 1]
  const monthly = period === '6m'

  const label = (index: number) => {
    const point = points[index]
    if (!now) return { short: '', full: '' }
    if (point.unit === 'month') return pointLabels(point, now, 'date')
    if (point.offset === 0) return { short: 'atual', full: 'Semana atual' }
    const { short, full } = pointLabels(point, now, 'date')
    return { short, full: `Semana de ${full}` }
  }

  return (
    <div className="flex min-h-full flex-col px-5 pb-4">
      <div className="flex items-baseline gap-2">
        <strong className="text-[28px] leading-8 font-semibold tracking-[-0.02em] text-ink tabular-nums">
          {currentRate}%
        </strong>
        <span className="text-xs text-ink-3">
          {current.answered} de {current.total} {monthly ? 'neste mês' : 'nesta semana'}
        </span>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3" aria-label="Legenda">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-sm bg-brand" /> Respondidos
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-sm bg-line" /> Não respondidos
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-3 border-t border-dashed border-ink-2" /> Meta{' '}
          {ADHERENCE_GOAL}%
        </li>
      </ul>
      <div className="relative mt-3 flex min-h-[150px] flex-1 flex-col">
        <div className="relative flex-1 pt-5">
          <div className="relative flex h-full gap-3" onMouseLeave={() => setHover(null)}>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 z-[1] border-t-[1.5px] border-dashed border-ink"
              style={{ bottom: `${ADHERENCE_GOAL}%`, boxShadow: '0 1px 0 rgb(255 255 255 / 0.55)' }}
            />
            {points.map((point, index) => {
              const rate = rates[index]
              const below = rate < ADHERENCE_GOAL
              const { full } = label(index)
              return (
                <div
                  key={index}
                  tabIndex={0}
                  aria-label={`${full}: ${rate}% respondidos, ${point.answered} de ${point.total}`}
                  onMouseEnter={() => setHover(index)}
                  onFocus={() => setHover(index)}
                  onBlur={() => setHover(null)}
                  className="relative h-full flex-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <span
                    className={cx(
                      'absolute inset-x-0 bottom-full mb-1 text-center text-xs font-semibold tabular-nums',
                      below ? 'text-warning' : 'text-ink',
                    )}
                  >
                    {rate}%
                  </span>
                  <div className="flex h-full flex-col overflow-hidden rounded-md">
                    <span
                      className={cx(
                        'transition-colors',
                        hover === index ? 'bg-ink-3/40' : 'bg-line',
                      )}
                      style={{ height: `${100 - rate}%` }}
                    />
                    <span
                      className={cx(
                        'flex-1 transition-colors',
                        below ? 'bg-warning' : hover === index ? 'bg-brand-hover' : 'bg-brand',
                      )}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-1.5 flex gap-3" aria-hidden="true">
          {points.map((_, index) => (
            <span key={index} className="flex-1 truncate text-center text-[11px] text-ink-3">
              {label(index).short}
            </span>
          ))}
        </div>
        {hover !== null && now && (
          <div
            className="pointer-events-none absolute top-0 right-0 z-10 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-pop"
            role="status"
          >
            <p className="text-ink-3">{label(hover).full}</p>
            <p className="font-semibold text-ink tabular-nums">
              {points[hover].answered} respondidos · {points[hover].total - points[hover].answered}{' '}
              não
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const goals = [
  { label: 'Emagrecimento', students: 59, color: 'var(--elevn-accent)', swatch: 'bg-brand' },
  {
    label: 'Hipertrofia',
    students: 44,
    color: 'var(--elevn-accent-light)',
    swatch: 'bg-brand-light',
  },
  { label: 'Performance', students: 25, color: 'var(--text-tertiary)', swatch: 'bg-ink-3' },
]

export function GoalsChart() {
  const [hover, setHover] = useState<number | null>(null)
  const total = goals.reduce((sum, goal) => sum + goal.students, 0)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex min-h-full flex-col items-center px-5 pb-4">
      <div className="relative size-36 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
          {goals.map((goal, index) => {
            const length = (goal.students / total) * circumference
            const segment = (
              <circle
                key={goal.label}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={goal.color}
                strokeWidth={hover === index ? 14 : 11}
                strokeDasharray={`${Math.max(0, length - 1.5)} ${circumference}`}
                strokeDashoffset={-offset}
                className="transition-[stroke-width] duration-150"
              />
            )
            offset += length
            return segment
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <span>
            <strong className="block text-2xl leading-7 font-semibold text-ink tabular-nums">
              {hover === null ? total : goals[hover].students}
            </strong>
            <small className="text-xs text-ink-3">
              {hover === null ? 'alunos' : goals[hover].label}
            </small>
          </span>
        </div>
      </div>
      <ul
        className="mt-4 w-full divide-y divide-line-subtle"
        aria-label="Distribuição por objetivo"
      >
        {goals.map((goal, index) => (
          <li
            key={goal.label}
            tabIndex={0}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(index)}
            onBlur={() => setHover(null)}
            className="flex items-center gap-2 rounded px-1 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <span aria-hidden="true" className={cx('size-2.5 rounded-sm', goal.swatch)} />
            <span className="flex-1 text-ink-2">{goal.label}</span>
            <span className="text-ink-3 tabular-nums">{goal.students}</span>
            <strong className="w-10 text-right font-semibold text-ink tabular-nums">
              {Math.round((goal.students / total) * 100)}%
            </strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------- Leads funnel */

export function LeadsFunnel({
  siteForms,
  onOpenSiteForms,
}: {
  siteForms: SiteFormSubmission[]
  onOpenSiteForms: () => void
}) {
  const count = (temperature: SiteFormSubmission['temperature']) =>
    siteForms.filter((item) => item.temperature === temperature).length
  const total = siteForms.length
  const closed = count('Fechado')
  const hot = count('Quente')
  const stages = [
    { label: 'Recebidos', value: total, hint: 'formulários do site' },
    { label: 'Quentes', value: hot + closed, hint: 'quentes ou já fechados' },
    { label: 'Fechados', value: closed, hint: 'viraram alunos' },
  ]
  const conversion = total ? Math.round((closed / total) * 100) : 0

  return (
    <div className="flex min-h-full flex-col px-5 pb-4">
      <div className="flex items-baseline gap-2">
        <strong className="text-[28px] leading-8 font-semibold tracking-[-0.02em] text-ink tabular-nums">
          {conversion}%
        </strong>
        <span className="text-xs text-ink-3">
          de conversão · {closed} de {total} leads
        </span>
      </div>
      <ol className="mt-4 space-y-3" aria-label="Funil de leads do site">
        {stages.map((stage, index) => {
          const share = total ? stage.value / total : 0
          const fromPrevious =
            index > 0 && stages[index - 1].value
              ? Math.round((stage.value / stages[index - 1].value) * 100)
              : null
          return (
            <li key={stage.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-ink">
                  {stage.label}{' '}
                  <span className="text-xs font-normal text-ink-3">· {stage.hint}</span>
                </span>
                <span className="text-ink tabular-nums">
                  <strong className="font-semibold">{stage.value}</strong>
                  {fromPrevious !== null && (
                    <span className="ml-1.5 text-xs text-ink-3">{fromPrevious}%</span>
                  )}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
                <div
                  className={cx(
                    'h-full rounded-full transition-[width] duration-300 ease-out-soft',
                    index === 2 ? 'bg-success' : index === 1 ? 'bg-brand' : 'bg-ink-3/50',
                  )}
                  style={{ width: `${Math.max(share * 100, stage.value ? 3 : 0)}%` }}
                />
              </div>
            </li>
          )
        })}
      </ol>
      <p className="mt-4 text-xs text-ink-3">
        Também na planilha: {count('Morno')} mornos · {count('Frio')} frios
      </p>
      <WidgetFooterLink onClick={onOpenSiteForms}>Abrir planilha</WidgetFooterLink>
    </div>
  )
}
