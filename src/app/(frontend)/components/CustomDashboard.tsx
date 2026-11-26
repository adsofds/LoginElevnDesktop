'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { defaultDashboardLayout, type DashboardLayoutItem, type WidgetId } from '@/lib/dashboard'
import {
  formatFormTimestamp,
  formatPersonName,
  formatRelativeTime,
  splitReferralOrBirth,
  initialSiteFormSubmissions,
  type LeadTemperature,
  type SiteFormSubmission,
} from '@/lib/demo-internal'
import {
  builtInLayouts,
  isCustomizedBuiltIn,
  makeLayoutId,
  mergeLayouts,
  readLayoutState,
  writeLayoutState,
  type SavedDashboardLayout,
  type WidgetSizes,
} from '@/lib/dashboardLayouts'
import type { DashboardPeriod } from '@/lib/dashboardPeriod'
import {
  ActiveStudentsChart,
  AdherenceChart,
  AttentionQueue,
  Avatar,
  GoalsChart,
  KpiOverview,
  LeadsFunnel,
  TodayAgenda,
  WidgetFooterLink,
  WorkoutAdherence,
} from './dashboard/DashboardWidgets'
import { TemperaturePicker } from './interno/LeadsSpreadsheet'
import { Badge, type BadgeTone } from './ui/Badge'
import { Button } from './ui/Button'
import { cx } from './ui/cx'
import { Segmented } from './ui/Segmented'
import { Icon } from './ui/icons'
import { Menu } from './ui/Menu'
import { Sheet } from './ui/Sheet'
import { NameDialog } from './ui/NameDialog'
import { Tabs } from './ui/Tabs'

type WidgetDefinition = {
  id: WidgetId
  title: string
  description: string
  category: 'Treino' | 'Nutrição' | 'Gestão'
  legacy?: boolean
}

const widgets: WidgetDefinition[] = [
  {
    id: 'kpi-overview',
    title: 'Indicadores executivos',
    description: 'Números essenciais com tendência do período.',
    category: 'Gestão',
  },
  {
    id: 'attention-list',
    title: 'Precisa de atenção',
    description: 'Pendências prioritárias da sua operação.',
    category: 'Gestão',
  },
  {
    id: 'students-table',
    title: 'Alunos',
    description: 'Carteira completa com origem do formulário, fase e status.',
    category: 'Gestão',
  },
  {
    id: 'weekly-agenda',
    title: 'Agenda de hoje',
    description: 'Linha do tempo do dia com os próximos 3 dias recolhidos.',
    category: 'Gestão',
  },
  {
    id: 'active-students-chart',
    title: 'Alunos ativos',
    description: 'Evolução da carteira no período escolhido.',
    category: 'Gestão',
  },
  {
    id: 'adherence-chart',
    title: 'Adesão ao Check-in',
    description: 'Check-ins respondidos por semana, ou a taxa de um aluno (ex.: 14/30).',
    category: 'Gestão',
  },
  {
    id: 'renewals-overview',
    title: 'Renovações do mês',
    description: 'Recuperados, em negociação e não renovados com motivo registrado.',
    category: 'Gestão',
  },
  {
    id: 'goals-chart',
    title: 'Distribuição por objetivo',
    description: 'Composição atual da carteira.',
    category: 'Nutrição',
  },
  {
    id: 'site-forms',
    title: 'Formulários do site',
    description:
      'Leads preenchidos no site com data e hora exatas e temperatura comercial (Fechado, Quente, Morno e Frio).',
    category: 'Gestão',
  },
  {
    id: 'leads-funnel',
    title: 'Funil de leads do site',
    description: 'Recebidos, quentes e fechados com a taxa de conversão.',
    category: 'Gestão',
  },
  {
    id: 'students-summary',
    title: 'Resumo de alunos',
    description: 'Visão geral da sua carteira ativa.',
    category: 'Gestão',
    legacy: true,
  },
  {
    id: 'pending-checkins',
    title: 'Check-ins pendentes',
    description: 'Alunos aguardando sua avaliação.',
    category: 'Gestão',
  },
  {
    id: 'workout-adherence',
    title: 'Adesão aos treinos',
    description: 'Dias treinados no mês (ex.: 20/31), geral ou por aluno.',
    category: 'Treino',
  },
  {
    id: 'nutrition-adherence',
    title: 'Adesão nutricional',
    description: 'Acompanhamento do plano alimentar.',
    category: 'Nutrição',
  },
  {
    id: 'recent-activity',
    title: 'Atividade recente',
    description: 'Últimas ações dos seus alunos.',
    category: 'Gestão',
    legacy: true,
  },
  {
    id: 'alerts',
    title: 'Alertas',
    description: 'Situações que precisam de atenção.',
    category: 'Gestão',
    legacy: true,
  },
  {
    id: 'progress',
    title: 'Evolução dos alunos',
    description: 'Tendência de evolução geral.',
    category: 'Treino',
  },
  {
    id: 'appointments',
    title: 'Agenda',
    description: 'Próximos acompanhamentos marcados.',
    category: 'Gestão',
    legacy: true,
  },
]

type ResizeSession = {
  widget: WidgetId
  startX: number
  startY: number
  startColumns: number
  startHeight: number
  columnWidth: number
}

type DashboardWidgetStyle = CSSProperties & {
  '--widget-columns': number
  '--widget-height': string
}

const presetHeights = {
  compact: 190,
  medium: 330,
  tall: 430,
}

/** Widgets that need more room than their preset (tables). */
const fixedHeights: Partial<Record<WidgetId, number>> = {
  'students-table': 590,
  'site-forms': 430,
}

function createWidgetSizes(layout: DashboardLayoutItem[]): WidgetSizes {
  return Object.fromEntries(
    layout.map((item) => [
      item.widget,
      {
        columns: Number(item.width),
        height: fixedHeights[item.widget] ?? presetHeights[item.height],
      },
    ]),
  )
}

const avatarUrls = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&h=96&q=80',
  'https://images.unsplash.com/photo-1683848644087-c3cb69b77d4f?auto=format&fit=crop&w=96&h=96&q=80',
  'https://images.unsplash.com/photo-1565884280295-98eb83e41c65?auto=format&fit=crop&w=96&h=96&q=80',
  'https://images.unsplash.com/photo-1668800458317-34ef5976c422?auto=format&fit=crop&w=96&h=96&q=80',
  'https://images.unsplash.com/photo-1732464517760-ca7a7be3cc76?auto=format&fit=crop&w=96&h=96&q=80',
  'https://images.unsplash.com/photo-1535469618671-e58a8c365cbd?auto=format&fit=crop&w=96&h=96&q=80',
  'https://images.unsplash.com/photo-1661874117570-31e6b5ff325f?auto=format&fit=crop&w=96&h=96&q=80',
  'https://images.unsplash.com/photo-1581423880338-b9e4f9718df6?auto=format&fit=crop&w=96&h=96&q=80',
]

type StudentStatus = 'Em dia' | 'Atenção' | 'Em risco'

type Student = {
  name: string
  avatar: string
  goal: 'Emagrecimento' | 'Hipertrofia' | 'Performance'
  phase: 'Déficit' | 'Superávit' | 'Manutenção'
  leadSource: string
  activity: string
  expiration: string
  status: StudentStatus
}

const students: Student[] = [
  {
    name: 'Lucas Andrade',
    avatar: avatarUrls[0],
    goal: 'Emagrecimento',
    phase: 'Déficit',
    leadSource: 'Formulário do Site · Fechado',
    activity: 'Hoje, 08:42',
    expiration: '18 nov',
    status: 'Em dia',
  },
  {
    name: 'Camila Rocha',
    avatar: avatarUrls[1],
    goal: 'Hipertrofia',
    phase: 'Superávit',
    leadSource: 'Formulário do Site · Instagram',
    activity: 'Ontem, 19:10',
    expiration: '12 nov',
    status: 'Atenção',
  },
  {
    name: 'Rafael Souza',
    avatar: avatarUrls[2],
    goal: 'Performance',
    phase: 'Manutenção',
    leadSource: 'Indicação de Aluno (Formulário)',
    activity: 'Hoje, 06:30',
    expiration: '22 nov',
    status: 'Em dia',
  },
  {
    name: 'Juliana Costa',
    avatar: avatarUrls[3],
    goal: 'Emagrecimento',
    phase: 'Déficit',
    leadSource: 'Formulário do Site · Fechado',
    activity: 'Há 5 dias',
    expiration: '08 nov',
    status: 'Em risco',
  },
  {
    name: 'Pedro Lima',
    avatar: avatarUrls[4],
    goal: 'Hipertrofia',
    phase: 'Superávit',
    leadSource: 'Formulário do Site · Direto',
    activity: 'Há 3 dias',
    expiration: '04 nov',
    status: 'Em risco',
  },
  {
    name: 'Marina Alves',
    avatar: avatarUrls[5],
    goal: 'Emagrecimento',
    phase: 'Déficit',
    leadSource: 'Indicação · Formulário do Site',
    activity: 'Hoje, 07:15',
    expiration: '28 nov',
    status: 'Em dia',
  },
  {
    name: 'Bruno Martins',
    avatar: avatarUrls[6],
    goal: 'Performance',
    phase: 'Manutenção',
    leadSource: 'Formulário do Site · Fechado',
    activity: 'Ontem, 20:45',
    expiration: '30 nov',
    status: 'Em dia',
  },
  {
    name: 'Sofia Ribeiro',
    avatar: avatarUrls[7],
    goal: 'Hipertrofia',
    phase: 'Superávit',
    leadSource: 'Formulário do Site · Instagram',
    activity: 'Hoje, 09:20',
    expiration: '15 nov',
    status: 'Atenção',
  },
  {
    name: 'Diego Castro',
    avatar: avatarUrls[0],
    goal: 'Performance',
    phase: 'Manutenção',
    leadSource: 'Indicação de Aluno (Formulário)',
    activity: 'Há 2 dias',
    expiration: '19 nov',
    status: 'Atenção',
  },
  {
    name: 'Aline Moraes',
    avatar: avatarUrls[1],
    goal: 'Emagrecimento',
    phase: 'Déficit',
    leadSource: 'Formulário do Site · Fechado',
    activity: 'Hoje, 10:05',
    expiration: '03 dez',
    status: 'Em dia',
  },
  {
    name: 'Thiago Nunes',
    avatar: avatarUrls[2],
    goal: 'Hipertrofia',
    phase: 'Superávit',
    leadSource: 'Formulário do Site · Direto',
    activity: 'Há 4 dias',
    expiration: '10 nov',
    status: 'Em risco',
  },
  {
    name: 'Beatriz Ramos',
    avatar: avatarUrls[3],
    goal: 'Performance',
    phase: 'Manutenção',
    leadSource: 'Indicação · Formulário do Site',
    activity: 'Ontem, 17:30',
    expiration: '25 nov',
    status: 'Em dia',
  },
]

const statusTone: Record<StudentStatus, BadgeTone> = {
  'Em dia': 'success',
  Atenção: 'warning',
  'Em risco': 'danger',
}

function StudentsTable() {
  const [status, setStatus] = useState<'Todos' | StudentStatus>('Todos')
  const [goal, setGoal] = useState('Todos')
  const [page, setPage] = useState(1)

  const filteredStudents = students.filter(
    (student) =>
      (status === 'Todos' || student.status === status) &&
      (goal === 'Todos' || student.goal === goal),
  )
  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visibleStudents = filteredStudents.slice((safePage - 1) * pageSize, safePage * pageSize)
  const count = (value: StudentStatus) =>
    students.filter((student) => student.status === value).length

  return (
    <div className="flex min-h-full flex-col px-5 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented
          size="sm"
          label="Filtrar por status"
          value={status}
          onChange={(next) => {
            setStatus(next)
            setPage(1)
          }}
          items={[
            { id: 'Todos', label: 'Todos', count: students.length },
            { id: 'Em dia', label: 'Em dia', count: count('Em dia') },
            { id: 'Atenção', label: 'Atenção', count: count('Atenção') },
            { id: 'Em risco', label: 'Em risco', count: count('Em risco') },
          ]}
        />
        <label className="relative">
          <span className="sr-only">Filtrar por objetivo</span>
          <select
            value={goal}
            onChange={(event) => {
              setGoal(event.target.value)
              setPage(1)
            }}
            className="h-8 rounded-control border border-line bg-surface pr-8 pl-3 text-[13px] text-ink-2 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none"
          >
            <option value="Todos">Todos os objetivos</option>
            <option>Emagrecimento</option>
            <option>Hipertrofia</option>
            <option>Performance</option>
          </select>
        </label>
      </div>
      <div className="mt-3 -mx-5 flex-[1_0_auto] overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm text-ink">
          <thead>
            <tr className="border-y border-line bg-subtle/60 text-xs text-ink-3">
              {[
                'Aluno',
                'Objetivo',
                'Fase',
                'Origem',
                'Última atividade',
                'Vencimento',
                'Status',
              ].map((label, index) => (
                <th
                  key={label}
                  scope="col"
                  className={cx('h-9 px-3 font-semibold whitespace-nowrap', index === 0 && 'pl-5')}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleStudents.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-ink-3">
                  Nenhum aluno com esses filtros.
                </td>
              </tr>
            )}
            {visibleStudents.map((student) => (
              <tr
                key={student.name}
                className="border-b border-line-subtle last:border-0 hover:bg-subtle"
              >
                <td className="h-11 pr-3 pl-5">
                  <span className="flex items-center gap-2.5">
                    <Avatar src={student.avatar} name={student.name} size={28} />
                    <span className="font-medium whitespace-nowrap">{student.name}</span>
                  </span>
                </td>
                <td className="px-3 whitespace-nowrap text-ink-2">{student.goal}</td>
                <td className="px-3 whitespace-nowrap text-ink-2">{student.phase}</td>
                <td className="max-w-[180px] truncate px-3 text-ink-3" title={student.leadSource}>
                  {student.leadSource}
                </td>
                <td className="px-3 whitespace-nowrap text-ink-2">{student.activity}</td>
                <td className="px-3 whitespace-nowrap text-ink-2 tabular-nums">
                  {student.expiration}
                </td>
                <td className="px-3">
                  <Badge tone={statusTone[student.status]} dot>
                    {student.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="mt-3 flex items-center justify-between gap-3 text-xs text-ink-3">
        <span className="tabular-nums">
          {filteredStudents.length === 0
            ? 'Nenhum aluno'
            : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filteredStudents.length)} de ${filteredStudents.length}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Página anterior"
            disabled={safePage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <Icon name="arrowLeft" className="size-4" />
          </Button>
          <span className="min-w-8 text-center font-medium text-ink-2 tabular-nums">
            {safePage}/{totalPages}
          </span>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Próxima página"
            disabled={safePage === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            <Icon name="arrowRight" className="size-4" />
          </Button>
        </div>
      </footer>
    </div>
  )
}

type RenewalRecord = {
  id: string
  name: string
  plan: string
  due: string
  status: 'Recuperado' | 'Em conversa' | 'Não renovou'
  reason?: string
}

const initialRenewalRecords: RenewalRecord[] = [
  {
    id: 'ren-pedro',
    name: 'Pedro Lima',
    plan: 'Trimestral',
    due: '04 nov',
    status: 'Recuperado',
  },
  {
    id: 'ren-juliana',
    name: 'Juliana Costa',
    plan: 'Semestral',
    due: '08 nov',
    status: 'Recuperado',
  },
  {
    id: 'ren-thiago',
    name: 'Thiago Nunes',
    plan: 'Trimestral',
    due: '10 nov',
    status: 'Em conversa',
  },
  {
    id: 'ren-gabriel',
    name: 'Gabriel Torres',
    plan: 'Trimestral',
    due: '02 nov',
    status: 'Não renovou',
    reason: 'Pausa financeira temporária; pediu para retomar contato em janeiro.',
  },
  {
    id: 'ren-larissa',
    name: 'Larissa Melo',
    plan: 'Mensal',
    due: '05 nov',
    status: 'Não renovou',
    reason: 'Mudou para consultoria presencial na cidade dela.',
  },
  {
    id: 'ren-camila',
    name: 'Camila Rocha',
    plan: 'Anual',
    due: '12 nov',
    status: 'Recuperado',
  },
]

const renewalTone: Record<RenewalRecord['status'], BadgeTone> = {
  Recuperado: 'success',
  'Em conversa': 'warning',
  'Não renovou': 'danger',
}

function RenewalsOverview() {
  const [records, setRecords] = useState<RenewalRecord[]>(initialRenewalRecords)
  const [editingReasonId, setEditingReasonId] = useState<string | null>(null)
  const [reasonDraft, setReasonDraft] = useState('')

  const expiringTotal = 18
  const recoveredCount = 11 + records.filter((item) => item.status === 'Recuperado').length
  const lostCount = records.filter((item) => item.status === 'Não renovou').length
  const inNegotiation = Math.max(0, expiringTotal - recoveredCount - lostCount)
  const recoveryRate = Math.round((recoveredCount / expiringTotal) * 100)

  const openReasonEditor = (item: RenewalRecord) => {
    setEditingReasonId(item.id)
    setReasonDraft(item.reason ?? '')
  }

  const saveNonRenewalReason = (id: string) => {
    const cleanReason =
      reasonDraft.trim() || 'Não renovou neste ciclo (motivo registrado pela gestão).'
    setRecords((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: 'Não renovou', reason: cleanReason } : item,
      ),
    )
    setEditingReasonId(null)
    setReasonDraft('')
  }

  const markAsRecovered = (id: string) => {
    setRecords((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: 'Recuperado', reason: undefined } : item,
      ),
    )
    if (editingReasonId === id) {
      setEditingReasonId(null)
      setReasonDraft('')
    }
  }

  const stats = [
    { label: 'Para vencer', value: expiringTotal, hint: 'neste ciclo', tone: 'text-ink' },
    {
      label: 'Recuperados',
      value: recoveredCount,
      hint: `${recoveryRate}% retidos`,
      tone: 'text-success',
    },
    { label: 'Em conversa', value: inNegotiation, hint: 'prioridade', tone: 'text-warning' },
    { label: 'Não renovaram', value: lostCount, hint: 'com motivo', tone: 'text-danger' },
  ]

  return (
    <div className="flex min-h-full flex-col px-5 pb-4">
      <dl className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface px-3 py-2.5">
            <dt className="text-xs text-ink-3">{stat.label}</dt>
            <dd className={cx('mt-0.5 text-xl font-semibold tabular-nums', stat.tone)}>
              {stat.value}
            </dd>
            <dd className="text-[11px] text-ink-3">{stat.hint}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-ink-3">
          <span>Recuperação de vencimentos</span>
          <span className="font-medium text-ink-2 tabular-nums">{recoveryRate}%</span>
        </div>
        <div
          className="mt-1 h-1.5 overflow-hidden rounded-full bg-subtle"
          role="progressbar"
          aria-label="Taxa de recuperação"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={recoveryRate}
        >
          <div
            className="h-full rounded-full bg-success transition-[width] duration-500 ease-out-soft"
            style={{ width: `${recoveryRate}%` }}
          />
        </div>
      </div>

      <ul className="mt-2 divide-y divide-line-subtle">
        {records.map((item) => (
          <li key={item.id} className="py-2.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="min-w-[150px] flex-1">
                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                <p className="text-xs text-ink-3">
                  Plano {item.plan} · vence {item.due}
                </p>
              </div>
              <Badge tone={renewalTone[item.status]} dot>
                {item.status}
              </Badge>
              {editingReasonId !== item.id && (
                <div className="flex gap-1.5">
                  {item.status !== 'Recuperado' && (
                    <Button size="sm" variant="secondary" onClick={() => markAsRecovered(item.id)}>
                      <Icon name="check" className="size-3.5" />
                      Renovou
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => openReasonEditor(item)}>
                    {item.status === 'Não renovou' ? 'Editar motivo' : 'Não renovou'}
                  </Button>
                </div>
              )}
            </div>

            {item.status === 'Não renovou' && item.reason && editingReasonId !== item.id && (
              <p className="mt-1.5 rounded-md bg-subtle px-2.5 py-1.5 text-xs leading-5 text-ink-2">
                <span className="font-medium text-ink">Motivo:</span> {item.reason}
              </p>
            )}

            {editingReasonId === item.id && (
              <form
                className="mt-2 flex flex-wrap gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  saveNonRenewalReason(item.id)
                }}
              >
                <input
                  type="text"
                  value={reasonDraft}
                  onChange={(event) => setReasonDraft(event.target.value)}
                  placeholder="Motivo (ex.: financeiro, rotina, mudou de cidade)"
                  aria-label={`Motivo da não renovação de ${item.name}`}
                  autoFocus
                  className="h-8 min-w-0 flex-1 rounded-control border border-line bg-surface px-3 text-[13px] text-ink placeholder:text-ink-3 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none"
                />
                <Button size="sm" variant="primary" type="submit">
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => setEditingReasonId(null)}
                >
                  Cancelar
                </Button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SiteFormsDashboardWidget({
  siteForms,
  onUpdateFormTemperature,
  onOpenSiteForms,
}: {
  siteForms: SiteFormSubmission[]
  onUpdateFormTemperature: (formId: string, temperature: LeadTemperature) => void
  onOpenSiteForms: () => void
}) {
  const summary: { label: string; value: LeadTemperature; tone: BadgeTone }[] = [
    { label: 'Fechados', value: 'Fechado', tone: 'success' },
    { label: 'Quentes', value: 'Quente', tone: 'danger' },
    { label: 'Mornos', value: 'Morno', tone: 'warning' },
    { label: 'Frios', value: 'Frio', tone: 'info' },
  ]

  return (
    <div className="flex min-h-full flex-col px-5 pb-4">
      <div className="flex flex-wrap items-center gap-2">
        {summary.map((item) => (
          <Badge key={item.value} tone={item.tone} dot>
            {item.label}{' '}
            <span className="tabular-nums">
              {siteForms.filter((form) => form.temperature === item.value).length}
            </span>
          </Badge>
        ))}
      </div>
      <div className="mt-3 -mx-5 flex-[1_0_auto] overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm text-ink">
          <thead>
            <tr className="border-y border-line bg-subtle/60 text-xs text-ink-3">
              {['Nome', 'Contato', 'Indicação', 'Preenchido em', 'Temperatura'].map(
                (label, index) => (
                  <th
                    key={label}
                    scope="col"
                    className={cx(
                      'h-9 px-3 font-semibold whitespace-nowrap',
                      index === 0 && 'pl-5',
                    )}
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {[...siteForms]
              .sort((a, b) => b.submittedAtIso.localeCompare(a.submittedAtIso))
              .slice(0, 8)
              .map((item) => {
                const ts = formatFormTimestamp(item.submittedAtIso)
                const { referral } = splitReferralOrBirth(item.referralOrBirth)
                return (
                  <tr
                    key={item.id}
                    className="border-b border-line-subtle last:border-0 hover:bg-subtle"
                  >
                    <td className="h-12 pr-3 pl-5 font-medium whitespace-nowrap">
                      {formatPersonName(item.name)}
                    </td>
                    <td className="px-3 whitespace-nowrap">
                      <span className="block text-ink-2 tabular-nums">{item.phone}</span>
                      <span className="block text-xs text-ink-3">{item.instagram}</span>
                    </td>
                    <td className="max-w-[160px] truncate px-3 text-ink-2" title={referral}>
                      {referral}
                    </td>
                    <td className="px-3 whitespace-nowrap" title={item.submittedAtIso}>
                      <span className="block text-ink-2">{ts.fullLabel}</span>
                      <span className="block text-xs text-ink-3">
                        {formatRelativeTime(item.submittedAtIso)}
                      </span>
                    </td>
                    <td className="px-3">
                      <TemperaturePicker
                        value={item.temperature}
                        name={formatPersonName(item.name)}
                        onChange={(next) => onUpdateFormTemperature(item.id, next)}
                      />
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
      <WidgetFooterLink onClick={onOpenSiteForms}>Abrir planilha no Interno</WidgetFooterLink>
    </div>
  )
}

function WidgetContent({
  id,
  period,
  siteForms,
  onUpdateFormTemperature,
  onOpenSiteForms,
  onOpenInternal,
  onNavigate,
}: {
  id: WidgetId
  period: DashboardPeriod
  siteForms: SiteFormSubmission[]
  onUpdateFormTemperature: (formId: string, temperature: LeadTemperature) => void
  onOpenSiteForms: () => void
  onOpenInternal: () => void
  onNavigate: (href: string) => void
}) {
  if (id === 'kpi-overview') {
    return (
      <KpiOverview
        period={period}
        siteForms={siteForms}
        onNavigate={onNavigate}
        onOpenSiteForms={onOpenSiteForms}
      />
    )
  }
  if (id === 'attention-list') return <AttentionQueue onNavigate={onNavigate} />
  if (id === 'students-table') return <StudentsTable />
  if (id === 'weekly-agenda') return <TodayAgenda onNavigate={onNavigate} />
  if (id === 'active-students-chart') return <ActiveStudentsChart period={period} />
  if (id === 'adherence-chart') return <AdherenceChart period={period} onNavigate={onNavigate} />
  if (id === 'workout-adherence') return <WorkoutAdherence onNavigate={onNavigate} />
  if (id === 'renewals-overview') return <RenewalsOverview />
  if (id === 'goals-chart') return <GoalsChart />
  if (id === 'leads-funnel')
    return <LeadsFunnel siteForms={siteForms} onOpenSiteForms={onOpenSiteForms} />
  if (id === 'site-forms') {
    return (
      <SiteFormsDashboardWidget
        siteForms={siteForms}
        onUpdateFormTemperature={onUpdateFormTemperature}
        onOpenSiteForms={onOpenSiteForms}
      />
    )
  }

  if (id === 'students-summary' || id === 'pending-checkins' || id === 'alerts') {
    const metric = {
      'students-summary': {
        value: '48',
        label: 'alunos ativos',
        hint: '+6 neste mês',
        tone: 'text-success',
      },
      'pending-checkins': {
        value: '7',
        label: 'check-ins aguardando análise',
        hint: 'Lucas, Renata, Camila e +4',
        tone: 'text-ink-3',
      },
      alerts: {
        value: '3',
        label: 'alunos precisam de atenção',
        hint: 'sem treino há 4+ dias',
        tone: 'text-danger',
      },
    }[id]
    return (
      <div className="flex min-h-full flex-col justify-between gap-3 px-5 pb-4">
        <div>
          <strong className="block text-[32px] leading-none font-semibold tracking-[-0.02em] text-ink tabular-nums">
            {metric.value}
          </strong>
          <span className="mt-1.5 block text-sm text-ink-2">{metric.label}</span>
        </div>
        <span className={cx('text-xs font-medium', metric.tone)}>{metric.hint}</span>
      </div>
    )
  }

  if (id === 'nutrition-adherence') {
    const value = 78
    const rows: [string, number][] = [
      ['Plano alimentar', 82],
      ['Hidratação', 76],
      ['Registro de refeições', 69],
    ]
    const radius = 34
    const circumference = 2 * Math.PI * radius

    return (
      <div className="flex min-h-full items-center gap-5 px-5 pb-4">
        <div className="relative grid size-24 shrink-0 place-items-center">
          <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" aria-hidden="true">
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              strokeWidth="7"
              className="stroke-subtle"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              strokeWidth="7"
              strokeLinecap="round"
              className="stroke-brand"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - value / 100)}
            />
          </svg>
          <div className="text-center">
            <strong className="block text-xl font-semibold text-ink tabular-nums">{value}%</strong>
            <span className="text-[10px] text-ink-3">30 dias</span>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-2.5">
          {rows.map(([label, percentage]) => (
            <li key={label}>
              <div className="flex justify-between gap-2 text-[13px]">
                <span className="truncate text-ink-2">{label}</span>
                <span className="font-medium text-ink tabular-nums">{percentage}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-subtle">
                <div
                  className="h-full rounded-full bg-brand/70"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (id === 'recent-activity') {
    const activity = [
      { name: 'João Martins', action: 'concluiu o treino B', time: '12 min', icon: 'training' },
      { name: 'Ana Lima', action: 'enviou um check-in', time: '34 min', icon: 'photo' },
      { name: 'Rafael Freitas', action: 'registrou uma refeição', time: '1 h', icon: 'nutrition' },
    ]
    return (
      <ul className="divide-y divide-line-subtle px-5 pb-4">
        {activity.map((item) => (
          <li key={item.name} className="flex items-center gap-3 py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-subtle text-ink-2">
              <Icon name={item.icon} className="size-4" />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm text-ink-2">
              <span className="font-medium text-ink">{item.name}</span> {item.action}
            </p>
            <span className="shrink-0 text-xs text-ink-3">{item.time}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (id === 'progress') {
    return (
      <div className="flex min-h-full flex-col px-5 pb-4">
        <div className="flex items-baseline gap-2">
          <strong className="text-[28px] leading-none font-semibold text-ink tabular-nums">
            +18%
          </strong>
          <span className="text-sm text-ink-2">evolução média em 90 dias</span>
        </div>
        <svg
          viewBox="0 0 500 120"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="mt-3 min-h-20 w-full flex-1"
        >
          <defs>
            <linearGradient id="progress-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--elevn-accent)' }} stopOpacity=".2" />
              <stop offset="100%" style={{ stopColor: 'var(--elevn-accent)' }} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 100 C70 92 85 68 145 76 S240 54 290 61 S385 20 500 28 V120 H0Z"
            fill="url(#progress-fill)"
          />
          <path
            d="M0 100 C70 92 85 68 145 76 S240 54 290 61 S385 20 500 28"
            fill="none"
            style={{ stroke: 'var(--elevn-accent)' }}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    )
  }

  return <TodayAgenda onNavigate={onNavigate} />
}

function withFallback(items: DashboardLayoutItem[]): DashboardLayoutItem[] {
  return items.length > 0 ? items : defaultDashboardLayout
}

export default function CustomDashboard({
  initialLayout,
  onOpenInternal,
  siteForms = initialSiteFormSubmissions,
  onUpdateFormTemperature,
  onOpenSiteForms,
  period = '30d',
  onNavigate = () => {},
}: {
  period?: DashboardPeriod
  onNavigate?: (href: string) => void
  initialLayout: DashboardLayoutItem[]
  onOpenInternal: () => void
  siteForms?: SiteFormSubmission[]
  onUpdateFormTemperature?: (formId: string, temperature: LeadTemperature) => void
  onOpenSiteForms?: () => void
}) {
  const [localForms, setLocalForms] = useState<SiteFormSubmission[]>(siteForms)
  const effectiveForms = onUpdateFormTemperature ? siteForms : localForms
  const handleUpdateTemp = (formId: string, temp: LeadTemperature) => {
    if (onUpdateFormTemperature) {
      onUpdateFormTemperature(formId, temp)
    } else {
      setLocalForms((current) =>
        current.map((item) => (item.id === formId ? { ...item, temperature: temp } : item)),
      )
    }
  }
  const startingLayout = withFallback(initialLayout)
  const [layout, setLayout] = useState(startingLayout)
  const [savedLayout, setSavedLayout] = useState(startingLayout)
  const [editing, setEditing] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<WidgetId | null>(null)
  const [resizingWidget, setResizingWidget] = useState<WidgetId | null>(null)
  const [feedback, setFeedback] = useState('')
  const [widgetSizes, setWidgetSizes] = useState<WidgetSizes>(() =>
    createWidgetSizes(startingLayout),
  )
  const [savedWidgetSizes, setSavedWidgetSizes] = useState<WidgetSizes>(() =>
    createWidgetSizes(startingLayout),
  )
  const dashboardGridRef = useRef<HTMLElement | null>(null)
  const draggedWidgetRef = useRef<WidgetId | null>(null)
  const lastDropTargetRef = useRef<WidgetId | null>(null)
  const dragPointRef = useRef({ x: 0, y: 0 })
  const autoScrollRef = useRef(0)
  useEffect(() => () => window.cancelAnimationFrame(autoScrollRef.current), [])
  const resizeSessionRef = useRef<ResizeSession | null>(null)

  /* ---- Saved layouts (Operacional, Treino, Dieta, Comercial + the user's own) ---- */
  const [storedLayouts, setStoredLayouts] = useState<SavedDashboardLayout[]>([])
  const [activeLayoutId, setActiveLayoutId] = useState('operacional')
  const [defaultLayoutId, setDefaultLayoutId] = useState('operacional')
  const [nameDialog, setNameDialog] = useState<null | {
    mode: 'save-as' | 'rename'
    value: string
  }>(null)
  const allLayouts = mergeLayouts(storedLayouts)
  const activeLayout = allLayouts.find((item) => item.id === activeLayoutId) ?? allLayouts[0]

  const persist = (layouts: SavedDashboardLayout[], activeId: string, defaultId: string) => {
    setStoredLayouts(layouts)
    setActiveLayoutId(activeId)
    setDefaultLayoutId(defaultId)
    writeLayoutState({ layouts, activeId, defaultId })
  }

  const applyLayout = (target: SavedDashboardLayout) => {
    const items = [...target.items]
      .sort((a, b) => a.order - b.order)
      .map((item, order) => ({ ...item, order }))
    const sizes = { ...createWidgetSizes(items), ...target.sizes }
    setLayout(items)
    setSavedLayout(items)
    setWidgetSizes(sizes)
    setSavedWidgetSizes(sizes)
    setEditing(false)
    setCatalogOpen(false)
  }

  // Restore this browser's layouts after hydration (localStorage is client-only)
  useEffect(() => {
    const state = readLayoutState()
    const merged = mergeLayouts(state.layouts)
    const defaultId = merged.some((item) => item.id === state.defaultId)
      ? state.defaultId!
      : 'operacional'
    const activeId = merged.some((item) => item.id === state.activeId) ? state.activeId! : defaultId
    setStoredLayouts(state.layouts)
    setDefaultLayoutId(defaultId)
    setActiveLayoutId(activeId)
    const target = merged.find((item) => item.id === activeId)
    if (target) applyLayout(target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const switchLayout = (id: string) => {
    const target = allLayouts.find((item) => item.id === id)
    if (!target) return
    applyLayout(target)
    persist(storedLayouts, id, defaultLayoutId)
    setFeedback('')
  }

  const currentSnapshot = () => ({
    items: [...layout].sort((a, b) => a.order - b.order).map((item, order) => ({ ...item, order })),
    sizes: widgetSizes,
  })

  const saveAsNewLayout = (name: string) => {
    const created: SavedDashboardLayout = { id: makeLayoutId(name), name, ...currentSnapshot() }
    persist([...storedLayouts, created], created.id, defaultLayoutId)
    applyLayout(created)
    setFeedback(`Layout “${name}” criado.`)
  }

  const renameLayout = (name: string) => {
    const exists = storedLayouts.some((item) => item.id === activeLayout.id)
    const updated = exists
      ? storedLayouts.map((item) => (item.id === activeLayout.id ? { ...item, name } : item))
      : [...storedLayouts, { ...activeLayout, name }]
    persist(updated, activeLayout.id, defaultLayoutId)
    setFeedback(`Layout renomeado para “${name}”.`)
  }

  const deleteLayout = () => {
    if (activeLayout.builtIn) return
    const remaining = storedLayouts.filter((item) => item.id !== activeLayout.id)
    const nextDefault = defaultLayoutId === activeLayout.id ? 'operacional' : defaultLayoutId
    const target =
      mergeLayouts(remaining).find((item) => item.id === nextDefault) ?? builtInLayouts[0]
    persist(remaining, target.id, nextDefault)
    applyLayout(target)
    setFeedback(`Layout “${activeLayout.name}” excluído.`)
  }

  const restoreBuiltIn = () => {
    const original = builtInLayouts.find((item) => item.id === activeLayout.id)
    if (!original) return
    const remaining = storedLayouts.filter((item) => item.id !== original.id)
    persist(remaining, original.id, defaultLayoutId)
    applyLayout(original)
    setFeedback(`Layout “${original.name}” restaurado.`)
  }

  const orderedLayout = [...layout].sort((a, b) => a.order - b.order)
  const activeIds = new Set(layout.map((item) => item.widget))
  const availableWidgets = widgets.filter((widget) => !widget.legacy && !activeIds.has(widget.id))

  const removeWidget = (widget: WidgetId) => {
    setLayout((current) =>
      current
        .filter((item) => item.widget !== widget)
        .map((item, index) => ({ ...item, order: index })),
    )
  }

  const addWidget = (widget: WidgetId) => {
    setLayout((current) => [
      ...current,
      {
        widget,
        order: current.length,
        width: '6',
        height: 'medium',
        visible: true,
      },
    ])
    setWidgetSizes((current) => ({
      ...current,
      [widget]: { columns: 6, height: 290 },
    }))
    setCatalogOpen(false)
    setFeedback('')
  }

  const moveWidget = (widget: WidgetId, direction: -1 | 1) => {
    const current = [...orderedLayout]
    const index = current.findIndex((item) => item.widget === widget)
    const target = index + direction
    if (index < 0 || target < 0 || target >= current.length) return
    ;[current[index], current[target]] = [current[target], current[index]]
    setLayout(current.map((item, order) => ({ ...item, order })))
  }

  const reorderWidget = (sourceWidget: WidgetId, targetWidget: WidgetId) => {
    if (sourceWidget === targetWidget) return
    setLayout((currentLayout) => {
      const current = [...currentLayout].sort((a, b) => a.order - b.order)
      const from = current.findIndex((item) => item.widget === sourceWidget)
      const to = current.findIndex((item) => item.widget === targetWidget)
      if (from < 0 || to < 0) return currentLayout
      const [moved] = current.splice(from, 1)
      current.splice(to, 0, moved)
      return current.map((item, order) => ({ ...item, order }))
    })
  }

  const startDragging = (widget: WidgetId, clientX: number, clientY: number) => {
    draggedWidgetRef.current = widget
    dragPointRef.current = { x: clientX, y: clientY }
    lastDropTargetRef.current = widget
    setDraggedWidget(widget)
    setFeedback('')
    // Auto-scroll while the pointer sits near the top or bottom edge of the window, so a
    // widget can be dragged to a spot that is off screen.
    const tick = () => {
      if (!draggedWidgetRef.current) return
      const { y } = dragPointRef.current
      const edge = 90
      const speed =
        y < edge
          ? -Math.ceil((edge - y) / 6)
          : y > window.innerHeight - edge
            ? Math.ceil((y - (window.innerHeight - edge)) / 6)
            : 0
      if (speed) {
        window.scrollBy(0, speed)
        movePointerDrag(dragPointRef.current.x, y)
      }
      autoScrollRef.current = window.requestAnimationFrame(tick)
    }
    autoScrollRef.current = window.requestAnimationFrame(tick)
  }

  const stopDragging = () => {
    draggedWidgetRef.current = null
    lastDropTargetRef.current = null
    if (autoScrollRef.current) window.cancelAnimationFrame(autoScrollRef.current)
    autoScrollRef.current = 0
    setDraggedWidget(null)
  }

  const movePointerDrag = (clientX: number, clientY: number) => {
    const sourceWidget = draggedWidgetRef.current
    if (!sourceWidget) return
    dragPointRef.current = { x: clientX, y: clientY }
    const target = document
      .elementFromPoint(clientX, clientY)
      ?.closest<HTMLElement>('[data-widget-id]')
    const targetWidget = target?.dataset.widgetId as WidgetId | undefined
    // Move once per widget entered: after a move the neighbour shifts under the pointer,
    // and reacting to it again would make widgets of different sizes flip back and forth.
    if (!targetWidget || targetWidget === lastDropTargetRef.current) return
    lastDropTargetRef.current = targetWidget
    if (targetWidget !== sourceWidget) reorderWidget(sourceWidget, targetWidget)
  }

  const updateWidgetSize = (widget: WidgetId, columns: number, height: number) => {
    setWidgetSizes((current) => ({
      ...current,
      [widget]: {
        columns: Math.max(3, Math.min(12, columns)),
        height: Math.max(180, Math.min(900, height)),
      },
    }))
  }

  const startResizing = (widget: WidgetId, clientX: number, clientY: number) => {
    const size = widgetSizes[widget] ?? { columns: 6, height: 290 }
    const gridWidth = dashboardGridRef.current?.getBoundingClientRect().width ?? 1200
    const columnWidth = Math.max(24, (gridWidth - 11 * 16) / 12 + 16)
    resizeSessionRef.current = {
      widget,
      startX: clientX,
      startY: clientY,
      startColumns: size.columns,
      startHeight: size.height,
      columnWidth,
    }
    setResizingWidget(widget)
    setFeedback('')
  }

  const moveResize = (clientX: number, clientY: number) => {
    const session = resizeSessionRef.current
    if (!session) return
    const columns = Math.round(
      session.startColumns + (clientX - session.startX) / session.columnWidth,
    )
    const height = Math.round(session.startHeight + clientY - session.startY)
    updateWidgetSize(session.widget, columns, height)
  }

  const stopResizing = () => {
    resizeSessionRef.current = null
    setResizingWidget(null)
  }

  const resizeWithKeyboard = (widget: WidgetId, key: string) => {
    const size = widgetSizes[widget] ?? { columns: 6, height: 290 }
    if (key === 'ArrowLeft') updateWidgetSize(widget, size.columns - 1, size.height)
    if (key === 'ArrowRight') updateWidgetSize(widget, size.columns + 1, size.height)
    if (key === 'ArrowUp') updateWidgetSize(widget, size.columns, size.height - 24)
    if (key === 'ArrowDown') updateWidgetSize(widget, size.columns, size.height + 24)
  }

  /** "Salvar layout": stores the edits in the active layout (a built-in keeps a customized copy). */
  const saveLayout = () => {
    const snapshot = currentSnapshot()
    setLayout(snapshot.items)
    setSavedLayout(snapshot.items)
    setSavedWidgetSizes(widgetSizes)
    setEditing(false)
    const exists = storedLayouts.some((item) => item.id === activeLayout.id)
    const updatedEntry: SavedDashboardLayout = { ...activeLayout, ...snapshot }
    const updated = exists
      ? storedLayouts.map((item) => (item.id === activeLayout.id ? updatedEntry : item))
      : [...storedLayouts, updatedEntry]
    persist(updated, activeLayout.id, defaultLayoutId)
    setFeedback(`Layout “${activeLayout.name}” salvo.`)
  }

  const cancelEditing = () => {
    setLayout(savedLayout)
    setWidgetSizes(savedWidgetSizes)
    setEditing(false)
    setCatalogOpen(false)
    setFeedback('')
  }

  return (
    <>
      {editing ? (
        <div
          role="region"
          aria-label="Edição do layout"
          className="sticky top-16 z-30 -mx-1 mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card bg-night px-4 py-3 text-on-dark shadow-pop"
        >
          <div className="mr-auto min-w-0">
            <p className="text-sm font-semibold">Editando layout “{activeLayout.name}”</p>
            <p className="text-xs text-on-dark/65">
              Arraste pelo puxador para mover e pelo canto inferior direito para redimensionar.
              Setas também funcionam.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-on-dark hover:bg-white/10 hover:text-on-dark"
              onClick={cancelEditing}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-on-dark hover:bg-white/10 hover:text-on-dark"
              onClick={() => setCatalogOpen(true)}
            >
              <Icon name="plus" className="size-4" /> Adicionar widget
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-on-dark hover:bg-white/10 hover:text-on-dark"
              onClick={() => setNameDialog({ mode: 'save-as', value: '' })}
            >
              Salvar como novo…
            </Button>
            <Button size="sm" variant="accent" onClick={saveLayout}>
              Salvar layout
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <Tabs
            label="Layouts do dashboard"
            className="min-w-0 flex-1 border-b-0"
            value={activeLayout.id}
            onChange={switchLayout}
            items={allLayouts.map((item) => ({ id: item.id, label: item.name }))}
          />
          <div className="flex items-center gap-2 pb-1">
            {feedback && (
              <span className="mr-2 text-xs font-medium text-success" role="status">
                {feedback}
              </span>
            )}
            <>
              <Menu
                label="Opções do layout"
                header={
                  <p className="mb-1 border-b border-line px-2.5 pt-1.5 pb-2 text-xs text-ink-3">
                    {activeLayout.description ?? 'Layout personalizado'}
                    {activeLayout.id === defaultLayoutId && ' · padrão ao abrir'}
                  </p>
                }
                items={[
                  {
                    id: 'save-as',
                    label: 'Salvar como novo layout…',
                    onSelect: () => setNameDialog({ mode: 'save-as', value: '' }),
                  },
                  {
                    id: 'rename',
                    label: 'Renomear',
                    onSelect: () => setNameDialog({ mode: 'rename', value: activeLayout.name }),
                  },
                  ...(activeLayout.id !== defaultLayoutId
                    ? [
                        {
                          id: 'default',
                          label: 'Abrir sempre neste layout',
                          onSelect: () => {
                            persist(storedLayouts, activeLayout.id, activeLayout.id)
                            setFeedback(`“${activeLayout.name}” agora abre por padrão.`)
                          },
                        },
                      ]
                    : []),
                  ...(isCustomizedBuiltIn(activeLayout.id, storedLayouts)
                    ? [{ id: 'restore', label: 'Restaurar original', onSelect: restoreBuiltIn }]
                    : []),
                  ...(!activeLayout.builtIn
                    ? [
                        {
                          id: 'delete',
                          label: 'Excluir layout',
                          danger: true,
                          onSelect: deleteLayout,
                        },
                      ]
                    : []),
                ]}
                trigger={({ open, toggle, id }) => (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggle}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    aria-controls={open ? id : undefined}
                    aria-label="Opções do layout"
                    className="size-8"
                  >
                    <span aria-hidden="true" className="text-base leading-none">
                      ⋯
                    </span>
                  </Button>
                )}
              />
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
                  <path
                    d="M4 20h4l11-11-4-4L4 16v4ZM13.5 6.5l4 4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Personalizar
              </Button>
            </>
          </div>
        </div>
      )}

      {nameDialog && (
        <NameDialog
          title={nameDialog.mode === 'save-as' ? 'Salvar como novo layout' : 'Renomear layout'}
          description="Ex.: Layout Avaliações, Layout Segunda-feira."
          label="Nome do layout"
          confirmLabel={nameDialog.mode === 'save-as' ? 'Criar layout' : 'Renomear'}
          initialValue={nameDialog.value}
          takenNames={allLayouts
            .filter((item) => item.id !== (nameDialog.mode === 'rename' ? activeLayout.id : ''))
            .map((item) => item.name)}
          onCancel={() => setNameDialog(null)}
          onConfirm={(name) => {
            if (nameDialog.mode === 'save-as') saveAsNewLayout(name)
            else renameLayout(name)
            setNameDialog(null)
          }}
        />
      )}

      <section
        ref={dashboardGridRef}
        className={`custom-dashboard-grid ${editing ? 'editing' : ''}`}
        aria-label="Widgets do Dashboard"
      >
        {orderedLayout.map((item, index) => {
          const definition = widgets.find((widget) => widget.id === item.widget)!
          const size = widgetSizes[item.widget] ?? {
            columns: Number(item.width),
            height: presetHeights[item.height],
          }
          const widgetStyle: DashboardWidgetStyle = {
            '--widget-columns': size.columns,
            '--widget-height': `${size.height}px`,
          }
          return (
            <article
              key={item.widget}
              data-widget-id={item.widget}
              style={widgetStyle}
              aria-label={definition.title}
              className={`dashboard-widget widget-${item.widget} ${editing ? 'editing' : ''} ${draggedWidget === item.widget ? 'dragging' : ''} ${resizingWidget === item.widget ? 'resizing' : ''}`}
            >
              <header className="widget-header">
                <div>
                  {editing && (
                    <button
                      className="drag-handle"
                      type="button"
                      aria-label={`Arrastar ${definition.title}`}
                      title="Segure e arraste para reposicionar"
                      onPointerDown={(event) => {
                        event.preventDefault()
                        event.currentTarget.setPointerCapture(event.pointerId)
                        startDragging(item.widget, event.clientX, event.clientY)
                      }}
                      onPointerMove={(event) => movePointerDrag(event.clientX, event.clientY)}
                      onPointerUp={(event) => {
                        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                          event.currentTarget.releasePointerCapture(event.pointerId)
                        }
                        stopDragging()
                      }}
                      onPointerCancel={stopDragging}
                    >
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                    </button>
                  )}
                  <h2>{definition.title}</h2>
                </div>
                {editing && (
                  <div
                    className="flex items-center gap-0.5"
                    role="group"
                    aria-label={`Organizar ${definition.title}`}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => moveWidget(item.widget, -1)}
                      disabled={index === 0}
                      title="Mover para antes"
                      aria-label={`Mover ${definition.title} para antes`}
                    >
                      <Icon name="arrowLeft" className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => moveWidget(item.widget, 1)}
                      disabled={index === orderedLayout.length - 1}
                      title="Mover para depois"
                      aria-label={`Mover ${definition.title} para depois`}
                    >
                      <Icon name="arrowRight" className="size-4" />
                    </Button>
                    <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeWidget(item.widget)}
                      title="Remover do painel"
                      aria-label={`Remover ${definition.title}`}
                      className="text-ink-3 hover:bg-danger-soft hover:text-danger"
                    >
                      <Icon name="trash" className="size-4" />
                    </Button>
                  </div>
                )}
              </header>
              <div
                className="widget-body-scroll"
                tabIndex={0}
                aria-label={`Conteúdo de ${definition.title}`}
              >
                <WidgetContent
                  id={item.widget}
                  period={period}
                  onNavigate={onNavigate}
                  onOpenInternal={onOpenInternal}
                  siteForms={effectiveForms}
                  onUpdateFormTemperature={handleUpdateTemp}
                  onOpenSiteForms={onOpenSiteForms ?? onOpenInternal}
                />
              </div>
              {editing && (
                <button
                  className="resize-handle"
                  type="button"
                  aria-label={`Redimensionar ${definition.title}. Use as setas para ajustar.`}
                  title="Arraste para ajustar largura e altura"
                  onKeyDown={(event) => {
                    if (!event.key.startsWith('Arrow')) return
                    event.preventDefault()
                    resizeWithKeyboard(item.widget, event.key)
                  }}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    event.currentTarget.setPointerCapture(event.pointerId)
                    startResizing(item.widget, event.clientX, event.clientY)
                  }}
                  onPointerMove={(event) => {
                    if (!resizeSessionRef.current) return
                    event.preventDefault()
                    moveResize(event.clientX, event.clientY)
                  }}
                  onPointerUp={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId)
                    }
                    stopResizing()
                  }}
                  onPointerCancel={stopResizing}
                />
              )}
            </article>
          )
        })}
      </section>

      <Sheet
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        label="Adicionar widget"
        className="w-[min(420px,100vw)] bg-surface"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-xl leading-7 font-semibold text-ink">Adicionar widget</h2>
            <p className="mt-1 text-sm text-ink-2">
              Entra no fim do layout “{activeLayout.name}”, com 6 colunas.
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Fechar catálogo"
            onClick={() => setCatalogOpen(false)}
          >
            <Icon name="close" className="size-4" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {availableWidgets.length > 0 ? (
            <ul className="space-y-2">
              {availableWidgets.map((widget) => (
                <li key={widget.id}>
                  <button
                    type="button"
                    onClick={() => addWidget(widget.id)}
                    className="group flex w-full items-start gap-3 rounded-control border border-line bg-surface p-3 text-left transition-colors hover:border-brand/40 hover:bg-subtle"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand"
                    >
                      <Icon
                        name={
                          widget.category === 'Treino'
                            ? 'training'
                            : widget.category === 'Nutrição'
                              ? 'nutrition'
                              : 'dashboard'
                        }
                        className="size-4"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">{widget.title}</span>
                      <span className="mt-0.5 block text-xs text-ink-2">{widget.description}</span>
                      <span className="mt-1 block text-[11px] text-ink-3">{widget.category}</span>
                    </span>
                    <span className="self-center text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      Adicionar
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2 py-8 text-center text-sm text-ink-3">
              Todos os widgets já estão neste layout.
            </p>
          )}
        </div>
      </Sheet>
    </>
  )
}
