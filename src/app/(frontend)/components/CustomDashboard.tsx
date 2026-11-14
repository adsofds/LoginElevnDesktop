'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { defaultDashboardLayout, type DashboardLayoutItem, type WidgetId } from '@/lib/dashboard'
import {
  formatFormTimestamp,
  formatPersonName,
  formatRelativeTime,
  splitReferralOrBirth,
  initialSiteFormSubmissions,
  type InternalUpdate,
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
import { Button } from './ui/Button'
import { Icon } from './ui/icons'
import { Menu } from './ui/Menu'
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
    description: 'Números essenciais e tendências do mês.',
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
    title: 'Agenda da semana',
    description: 'Próximos compromissos e avaliações.',
    category: 'Gestão',
  },
  {
    id: 'team-overview',
    title: 'Últimas atualizações',
    description: 'Comentários direcionados pela gestão.',
    category: 'Gestão',
  },
  {
    id: 'active-students-chart',
    title: 'Alunos ativos por mês',
    description: 'Evolução da carteira nos últimos 6 meses.',
    category: 'Gestão',
  },
  {
    id: 'adherence-chart',
    title: 'Adesão ao Check-in',
    description: 'Percentual de check-ins respondidos e não respondidos por semana.',
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
    description: 'Frequência e conclusão dos treinos.',
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
  medium: 290,
  tall: 390,
}

function createWidgetSizes(layout: DashboardLayoutItem[]): WidgetSizes {
  return Object.fromEntries(
    layout.map((item) => [
      item.widget,
      {
        columns: Number(item.width),
        height:
          item.widget === 'students-table' || item.widget === 'weekly-agenda'
            ? 590
            : item.widget === 'renewals-overview'
              ? 380
              : item.widget === 'site-forms'
                ? 420
                : presetHeights[item.height],
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

function KpiOverview({
  siteForms,
  onOpenSiteForms,
}: {
  siteForms: SiteFormSubmission[]
  onOpenSiteForms: () => void
}) {
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
  const fechadosCount = siteForms.filter((item) => item.temperature === 'Fechado').length
  const quentesCount = siteForms.filter((item) => item.temperature === 'Quente').length

  const kpis = [
    {
      title: 'Alunos ativos',
      value: '128',
      detail: '+12 este mês',
      trend: 'up',
      path: 'M2 25 C15 27 20 18 32 20 S50 14 61 16 S77 6 94 8',
    },
    {
      title: 'Formulários do site',
      value: String(siteForms.length).padStart(2, '0'),
      detail: `${fechadosCount} fechados · ${quentesCount} quentes`,
      trend: 'up',
      path: 'M2 22 C18 15 25 23 39 17 S58 20 69 12 S84 14 94 7',
      onClick: onOpenSiteForms,
    },
    {
      title: 'Planos vencendo',
      value: '09',
      detail: 'Nos próximos 7 dias',
      trend: 'down',
      path: 'M2 9 C14 13 23 8 35 15 S53 13 65 20 S79 19 94 26',
    },
    {
      title: 'Receita do mês',
      // Mesmo valor exibido em Alunos (receita da carteira ativa). Em produção, ler da mesma fonte.
      value: currencyFormatter.format(24200),
      detail: '+8% no mês',
      trend: 'up',
      path: 'M2 27 C17 25 22 19 35 21 S52 14 64 16 S79 7 94 5',
    },
    {
      title: 'Check-ins pendentes',
      value: '14',
      detail: '5 novos hoje',
      trend: 'neutral',
      path: 'M2 18 C18 16 25 20 38 15 S56 18 68 14 S82 17 94 12',
    },
    {
      title: 'Check-ins respondidos',
      // 114 de 128 alunos ativos: igual ao gráfico de adesão (Semana 5) e ao KPI de Alunos
      value: '89%',
      detail: '114 de 128 nesta semana',
      trend: 'neutral',
      path: 'M2 26 C14 24 24 20 36 21 S54 14 67 15 S82 8 94 6',
    },
  ]

  return (
    <div className="kpi-overview">
      {kpis.map((kpi) => (
        <article
          key={kpi.title}
          className="kpi-card"
          onClick={kpi.onClick}
          style={kpi.onClick ? { cursor: 'pointer' } : undefined}
          title={kpi.onClick ? 'Abrir planilha de Formulários do site em Interno' : undefined}
        >
          <span>{kpi.title}</span>
          <div>
            <strong>{kpi.value}</strong>
            <small className={kpi.trend}>
              {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '•'} {kpi.detail}
            </small>
          </div>
          <svg viewBox="0 0 96 32" preserveAspectRatio="none" aria-hidden="true">
            <path d={kpi.path} />
          </svg>
        </article>
      ))}
    </div>
  )
}

const attentionItems = [
  {
    type: 'training',
    description: 'Sem registrar treino há 5 dias',
    student: 'Lucas Andrade',
    action: 'Enviar mensagem',
  },
  {
    type: 'checkin',
    description: 'Check-in semanal enviado com fotos',
    student: 'Camila Rocha',
    action: 'Revisar',
  },
  {
    type: 'nutrition',
    description: 'Plano de dieta vence em 2 dias',
    student: 'Rafael Souza',
    action: 'Renovar',
  },
  {
    type: 'message',
    description: 'Mensagem sem resposta há 1 dia',
    student: 'Juliana Costa',
    action: 'Responder',
  },
  {
    type: 'billing',
    description: 'Pagamento atrasado',
    student: 'Pedro Lima',
    action: 'Ver cobrança',
  },
  {
    type: 'training',
    description: 'Treino precisa de ajuste de carga',
    student: 'Sofia Ribeiro',
    action: 'Ajustar',
  },
  {
    type: 'checkin',
    description: 'Avaliação mensal ainda não revisada',
    student: 'Diego Castro',
    action: 'Revisar',
  },
]

function AttentionList() {
  const [handled, setHandled] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  const items = expanded ? attentionItems : attentionItems.slice(0, 5)

  return (
    <div className="attention-content">
      <button type="button" className="view-all" onClick={() => setExpanded((value) => !value)}>
        {expanded ? 'Mostrar menos' : 'Ver todas'}
      </button>
      <div className="attention-list">
        {items.map((item) => {
          const isHandled = handled.includes(item.student)
          return (
            <div key={`${item.student}-${item.description}`} className={isHandled ? 'handled' : ''}>
              <span className={`attention-icon ${item.type}`} aria-hidden="true">
                <i />
              </span>
              <span>
                <strong>{item.description}</strong>
                <small>{item.student}</small>
              </span>
              <button
                type="button"
                onClick={() =>
                  setHandled((current) =>
                    isHandled
                      ? current.filter((student) => student !== item.student)
                      : [...current, item.student],
                  )
                }
              >
                {isHandled ? 'Concluído' : item.action}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
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

  const selectStatus = (nextStatus: 'Todos' | StudentStatus) => {
    setStatus(nextStatus)
    setPage(1)
  }

  return (
    <div className="students-table-content">
      <div className="students-filters">
        <div>
          {(['Todos', 'Em dia', 'Atenção', 'Em risco'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              className={status === filter ? 'active' : ''}
              onClick={() => selectStatus(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <label>
          <span className="sr-only">Filtrar por objetivo</span>
          <select
            value={goal}
            onChange={(event) => {
              setGoal(event.target.value)
              setPage(1)
            }}
          >
            <option>Todos</option>
            <option>Emagrecimento</option>
            <option>Hipertrofia</option>
            <option>Performance</option>
          </select>
        </label>
      </div>
      <div className="students-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Objetivo</th>
              <th>Fase</th>
              <th>Origem / Formulário</th>
              <th>Última atividade</th>
              <th>Vencimento</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleStudents.map((student) => (
              <tr key={student.name}>
                <td>
                  <img src={student.avatar} alt="" width="32" height="32" loading="lazy" />
                  <strong>{student.name}</strong>
                </td>
                <td>{student.goal}</td>
                <td>{student.phase}</td>
                <td>{student.leadSource}</td>
                <td>{student.activity}</td>
                <td>{student.expiration}</td>
                <td>
                  <span
                    className={`status-badge status-${student.status.replace(' ', '-').toLowerCase()}`}
                  >
                    <i />
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="table-pagination">
        <span>
          {filteredStudents.length === 0
            ? 'Nenhum aluno'
            : `${(safePage - 1) * pageSize + 1}–${Math.min(
                safePage * pageSize,
                filteredStudents.length,
              )} de ${filteredStudents.length} alunos`}
        </span>
        <div>
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage === 1}
          >
            Anterior
          </button>
          <strong>{safePage}</strong>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={safePage === totalPages}
          >
            Próxima
          </button>
        </div>
      </footer>
    </div>
  )
}

function WeeklyAgenda() {
  const appointments = [
    ['05 nov', '09:00', 'Lucas Andrade', 'Reavaliação mensal'],
    ['05 nov', '14:30', 'Aline Moraes', 'Avaliação inicial'],
    ['06 nov', '10:00', 'Camila Rocha', 'Reavaliação mensal'],
    ['07 nov', '16:00', 'Bruno Martins', 'Avaliação inicial'],
  ]

  return (
    <div className="weekly-agenda">
      <p className="widget-context-label">Próximos compromissos</p>
      {appointments.map(([date, time, name, type]) => (
        <div key={`${date}-${time}`}>
          <time>
            <strong>{date}</strong>
            <span>{time}</span>
          </time>
          <span>
            <strong>{name}</strong>
            <small>{type}</small>
          </span>
        </div>
      ))}
    </div>
  )
}

function InternalUpdates({
  updates,
  onToggleUpdate,
}: {
  updates: InternalUpdate[]
  onToggleUpdate: (updateId: string) => void
}) {
  return (
    <div className="internal-updates">
      <p className="widget-context-label">Área interna</p>
      {updates.slice(0, 6).map((update) => (
        <article key={update.id} className={update.completed ? 'completed' : ''}>
          <img className="update-avatar" src={update.avatar} alt={`Foto de ${update.author}`} />
          <div>
            <header>
              <strong>{update.author}</strong>
              <small>{update.time}</small>
            </header>
            <span className="update-role">{update.role}</span>
            <p>
              <strong>{update.subject || update.type}</strong> — {update.message}
            </p>
            <footer>
              <span>{update.type}</span>
              <strong>Para: {update.audience}</strong>
              <button type="button" onClick={() => onToggleUpdate(update.id)}>
                {update.completed ? 'Reabrir' : 'Concluir'}
              </button>
            </footer>
          </div>
        </article>
      ))}
    </div>
  )
}

function ChartHoverDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="chart-hover-detail" role="status">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

const activeStudentPoints = [
  { label: 'Junho', short: 'Jun', value: 116, x: 3, y: 118 },
  { label: 'Julho', short: 'Jul', value: 118, x: 86, y: 105 },
  { label: 'Agosto', short: 'Ago', value: 121, x: 172, y: 89 },
  { label: 'Setembro', short: 'Set', value: 123, x: 258, y: 69 },
  { label: 'Outubro', short: 'Out', value: 125, x: 344, y: 54 },
  { label: 'Novembro', short: 'Nov', value: 128, x: 427, y: 30 },
]

function ActiveStudentsChart() {
  const [hoveredPoint, setHoveredPoint] = useState<(typeof activeStudentPoints)[number] | null>(
    null,
  )

  return (
    <div className="chart-content line-chart">
      <div className="chart-summary">
        <strong>128</strong>
        <span>+10,3% em 6 meses</span>
      </div>
      {hoveredPoint && (
        <ChartHoverDetail
          label={hoveredPoint.label}
          value={`${hoveredPoint.value} alunos ativos`}
        />
      )}
      <svg
        viewBox="0 0 430 160"
        preserveAspectRatio="none"
        aria-label="Alunos ativos por mês"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <defs>
          <linearGradient id="active-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--gold-34)' }} stopOpacity=".24" />
            <stop offset="100%" style={{ stopColor: 'var(--gold-34)' }} stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="chart-grid">
          <path d="M0 30H430M0 75H430M0 120H430" />
        </g>
        <path
          className="area"
          d="M0 118 C45 112 60 103 86 105 S140 84 172 89 S228 65 258 69 S320 48 344 54 S397 27 430 30 V150 H0Z"
        />
        <path
          className="line"
          d="M0 118 C45 112 60 103 86 105 S140 84 172 89 S228 65 258 69 S320 48 344 54 S397 27 430 30"
        />
        <g className="chart-points">
          {activeStudentPoints.map((point) => (
            <circle
              key={point.short}
              className={hoveredPoint?.short === point.short ? 'active' : ''}
              cx={point.x}
              cy={point.y}
              r="5"
              tabIndex={0}
              aria-label={`${point.label}: ${point.value} alunos ativos`}
              onMouseEnter={() => setHoveredPoint(point)}
              onFocus={() => setHoveredPoint(point)}
              onBlur={() => setHoveredPoint(null)}
            />
          ))}
        </g>
        <g className="chart-labels">
          {activeStudentPoints.map((point) => (
            <text key={point.short} x={Math.min(point.x, 411)} y="158">
              {point.short}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}

function AdherenceChart() {
  const weeks = [
    {
      week: 'Semana 1',
      short: 'S1',
      answered: 82,
      unanswered: 18,
      count: '105 respondidos · 23 não respondidos',
    },
    {
      week: 'Semana 2',
      short: 'S2',
      answered: 86,
      unanswered: 14,
      count: '110 respondidos · 18 não respondidos',
    },
    {
      week: 'Semana 3',
      short: 'S3',
      answered: 84,
      unanswered: 16,
      count: '108 respondidos · 20 não respondidos',
    },
    {
      week: 'Semana 4',
      short: 'S4',
      answered: 91,
      unanswered: 9,
      count: '116 respondidos · 12 não respondidos',
    },
    {
      week: 'Semana 5',
      short: 'S5',
      answered: 89,
      unanswered: 11,
      count: '114 respondidos · 14 não respondidos',
    },
  ]
  const [hoveredWeek, setHoveredWeek] = useState<(typeof weeks)[number] | null>(null)

  return (
    <div className="chart-content bar-chart">
      {hoveredWeek && (
        <ChartHoverDetail
          label={hoveredWeek.week}
          value={`Respondidos ${hoveredWeek.answered}% · Não respondidos ${hoveredWeek.unanswered}% (${hoveredWeek.count})`}
        />
      )}
      <div className="chart-legend">
        <span>
          <i className="training" /> Respondidos (89%)
        </span>
        <span>
          <i className="diet" /> Não respondidos (11%)
        </span>
      </div>
      <div className="grouped-bars" onMouseLeave={() => setHoveredWeek(null)}>
        {weeks.map((week) => (
          <div
            key={week.short}
            tabIndex={0}
            aria-label={`${week.week}: check-ins respondidos ${week.answered}%, não respondidos ${week.unanswered}%`}
            onMouseEnter={() => setHoveredWeek(week)}
            onFocus={() => setHoveredWeek(week)}
            onBlur={() => setHoveredWeek(null)}
          >
            <span>
              <i className="training" style={{ height: `${week.answered}%` }} />
              <i className="diet" style={{ height: `${week.unanswered}%` }} />
            </span>
            <small>{week.short}</small>
          </div>
        ))}
      </div>
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

  return (
    <div className="renewals-widget">
      <div className="renewals-kpi-strip four-cols">
        <div>
          <span>Para vencer</span>
          <strong>{expiringTotal}</strong>
          <small>neste ciclo</small>
        </div>
        <div className="highlight">
          <span>Recuperados</span>
          <strong>{recoveredCount}</strong>
          <small>{recoveryRate}% retidos</small>
        </div>
        <div>
          <span>Em conversa</span>
          <strong>{String(inNegotiation).padStart(2, '0')}</strong>
          <small>prioridade</small>
        </div>
        <div className="lost">
          <span>Não renovaram</span>
          <strong>{String(lostCount).padStart(2, '0')}</strong>
          <small>com motivo</small>
        </div>
      </div>

      <div className="renewals-progress-block">
        <div>
          <span>Taxa de recuperação de vencimentos</span>
          <strong>
            {recoveredCount} recuperados · {lostCount} não renovaram ({recoveryRate}%)
          </strong>
        </div>
        <div className="renewals-progress-bar" aria-hidden="true">
          <i style={{ width: `${recoveryRate}%` }} />
        </div>
      </div>

      <div className="renewals-mini-list">
        {records.map((item) => (
          <div key={item.id} className="renewal-row-card">
            <div className="renewal-row-main">
              <span>
                <strong>{item.name}</strong>
                <small>
                  Plano {item.plan} · Venc. {item.due}
                </small>
              </span>
              <div className="renewal-row-actions">
                <em
                  className={
                    item.status === 'Recuperado'
                      ? 'recovered'
                      : item.status === 'Não renovou'
                        ? 'lost'
                        : 'pending'
                  }
                >
                  {item.status}
                </em>
                {item.status !== 'Recuperado' && (
                  <button
                    type="button"
                    className="renewal-mini-btn approve"
                    onClick={() => markAsRecovered(item.id)}
                    title="Marcar como renovado"
                  >
                    Renovou
                  </button>
                )}
                <button
                  type="button"
                  className="renewal-mini-btn lost"
                  onClick={() => openReasonEditor(item)}
                >
                  {item.status === 'Não renovou' ? 'Motivo' : 'Não renovou'}
                </button>
              </div>
            </div>

            {item.status === 'Não renovou' && item.reason && editingReasonId !== item.id && (
              <p className="renewal-lost-reason">
                <strong>Motivo (Admin):</strong> {item.reason}
              </p>
            )}

            {editingReasonId === item.id && (
              <div className="renewal-reason-editor">
                <input
                  type="text"
                  value={reasonDraft}
                  onChange={(event) => setReasonDraft(event.target.value)}
                  placeholder="Escreva o motivo da não renovação (ex.: financeiro, rotina)..."
                  aria-label={`Motivo da não renovação de ${item.name}`}
                  autoFocus
                />
                <div>
                  <button type="button" onClick={() => saveNonRenewalReason(item.id)}>
                    Salvar motivo
                  </button>
                  <button type="button" className="cancel" onClick={() => setEditingReasonId(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function GoalsChart() {
  const goals = [
    { label: 'Emagrecimento', className: 'weight-loss', percentage: 46, students: 59 },
    { label: 'Hipertrofia', className: 'hypertrophy', percentage: 34, students: 44 },
    { label: 'Performance', className: 'performance', percentage: 20, students: 25 },
  ]
  const goalSummary = {
    label: 'Total da carteira',
    className: '',
    percentage: 100,
    students: 128,
  }
  const [hoveredGoal, setHoveredGoal] = useState<(typeof goals)[number] | null>(null)

  return (
    <div className="chart-content goals-chart" onMouseLeave={() => setHoveredGoal(null)}>
      {hoveredGoal && (
        <ChartHoverDetail
          label={hoveredGoal.label}
          value={`${hoveredGoal.percentage}% · ${hoveredGoal.students} alunos`}
        />
      )}
      <div
        className="goals-donut"
        tabIndex={0}
        aria-label="128 alunos distribuídos em três objetivos"
        onMouseEnter={() => setHoveredGoal(goalSummary)}
        onFocus={() => setHoveredGoal(goalSummary)}
        onBlur={() => setHoveredGoal(null)}
      >
        <span>
          <strong>128</strong>
          <small>alunos</small>
        </span>
      </div>
      <div className="goals-legend">
        {goals.map((goal) => (
          <span
            key={goal.label}
            tabIndex={0}
            aria-label={`${goal.label}: ${goal.percentage}%, ${goal.students} alunos`}
            onMouseEnter={() => setHoveredGoal(goal)}
            onFocus={() => setHoveredGoal(goal)}
            onBlur={() => setHoveredGoal(null)}
          >
            <i className={goal.className} />
            <small>{goal.label}</small>
            <strong>{goal.percentage}%</strong>
          </span>
        ))}
      </div>
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
  const countFechado = siteForms.filter((f) => f.temperature === 'Fechado').length
  const countQuente = siteForms.filter((f) => f.temperature === 'Quente').length
  const countMorno = siteForms.filter((f) => f.temperature === 'Morno').length
  const countFrio = siteForms.filter((f) => f.temperature === 'Frio').length

  return (
    <div className="dashboard-site-forms-widget">
      <div className="dashboard-site-forms-summary">
        <div className="summary-chip fechado">
          <span>Fechados</span>
          <strong>{countFechado}</strong>
        </div>
        <div className="summary-chip quente">
          <span>Quentes</span>
          <strong>{countQuente}</strong>
        </div>
        <div className="summary-chip morno">
          <span>Mornos</span>
          <strong>{countMorno}</strong>
        </div>
        <div className="summary-chip frio">
          <span>Frios</span>
          <strong>{countFrio}</strong>
        </div>
        <button type="button" className="open-internal-forms-btn" onClick={onOpenSiteForms}>
          Abrir planilha em Interno →
        </button>
      </div>

      <div className="dashboard-site-forms-table-wrap">
        <table className="dashboard-site-forms-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone & Instagram</th>
              <th>Indicação</th>
              <th>Data e Hora do Preenchimento</th>
              <th>Temperatura</th>
            </tr>
          </thead>
          <tbody>
            {[...siteForms]
              .sort((a, b) => b.submittedAtIso.localeCompare(a.submittedAtIso))
              .slice(0, 8)
              .map((item) => {
                const ts = formatFormTimestamp(item.submittedAtIso)
                const tempSlug = item.temperature.toLowerCase()
                const { referral } = splitReferralOrBirth(item.referralOrBirth)
                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{formatPersonName(item.name)}</strong>
                    </td>
                    <td>
                      <div className="dash-form-contact">
                        <span>{item.phone}</span>
                        <small>{item.instagram}</small>
                      </div>
                    </td>
                    <td>{referral}</td>
                    <td>
                      <div className="dash-form-timestamp" title={item.submittedAtIso}>
                        <strong>{ts.fullLabel}</strong>
                        <small>{formatRelativeTime(item.submittedAtIso)}</small>
                      </div>
                    </td>
                    <td>
                      <div className={`dash-temp-pill temp-${tempSlug}`}>
                        <span className="dot" aria-hidden="true" />
                        <select
                          aria-label={`Temperatura de ${item.name}`}
                          value={item.temperature}
                          onChange={(e) =>
                            onUpdateFormTemperature(item.id, e.target.value as LeadTemperature)
                          }
                        >
                          <option value="Fechado">Fechado</option>
                          <option value="Quente">Quente</option>
                          <option value="Morno">Morno</option>
                          <option value="Frio">Frio</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function WidgetContent({
  id,
  internalUpdates,
  onToggleInternalUpdate,
  siteForms,
  onUpdateFormTemperature,
  onOpenSiteForms,
}: {
  id: WidgetId
  internalUpdates: InternalUpdate[]
  onToggleInternalUpdate: (updateId: string) => void
  siteForms: SiteFormSubmission[]
  onUpdateFormTemperature: (formId: string, temperature: LeadTemperature) => void
  onOpenSiteForms: () => void
}) {
  if (id === 'kpi-overview') {
    return <KpiOverview siteForms={siteForms} onOpenSiteForms={onOpenSiteForms} />
  }
  if (id === 'attention-list') return <AttentionList />
  if (id === 'students-table') return <StudentsTable />
  if (id === 'weekly-agenda') return <WeeklyAgenda />
  if (id === 'team-overview') {
    return <InternalUpdates updates={internalUpdates} onToggleUpdate={onToggleInternalUpdate} />
  }
  if (id === 'active-students-chart') return <ActiveStudentsChart />
  if (id === 'adherence-chart') return <AdherenceChart />
  if (id === 'renewals-overview') return <RenewalsOverview />
  if (id === 'goals-chart') return <GoalsChart />
  if (id === 'site-forms') {
    return (
      <SiteFormsDashboardWidget
        siteForms={siteForms}
        onUpdateFormTemperature={onUpdateFormTemperature}
        onOpenSiteForms={onOpenSiteForms}
      />
    )
  }

  if (id === 'students-summary') {
    return (
      <div className="metric-content">
        <div>
          <strong>48</strong>
          <span>alunos ativos</span>
        </div>
        <div className="metric-trend">
          <svg viewBox="0 0 90 34" preserveAspectRatio="none" aria-hidden="true">
            <path d="M2 28 C16 27 18 17 32 20 S51 12 62 15 S75 5 88 7" />
          </svg>
          <small>+6 neste mês</small>
        </div>
      </div>
    )
  }

  if (id === 'pending-checkins') {
    return (
      <div className="metric-content">
        <div>
          <strong>07</strong>
          <span>aguardando análise</span>
        </div>
        <div className="mini-avatars" aria-label="Alunos pendentes">
          <i>LM</i>
          <i>RS</i>
          <i>CA</i>
          <i>+4</i>
        </div>
      </div>
    )
  }

  if (id === 'alerts') {
    return (
      <div className="metric-content alert-metric">
        <div>
          <strong>03</strong>
          <span>precisam de atenção</span>
        </div>
        <div className="alert-bars" aria-label="Distribuição dos alertas">
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
    )
  }

  if (id === 'workout-adherence' || id === 'nutrition-adherence') {
    const workout = id === 'workout-adherence'
    const value = workout ? 87 : 78
    const rows = workout
      ? [
          ['Força e hipertrofia', '92%'],
          ['Condicionamento', '84%'],
          ['Mobilidade', '73%'],
        ]
      : [
          ['Plano alimentar', '82%'],
          ['Hidratação', '76%'],
          ['Registro de refeições', '69%'],
        ]

    return (
      <div className="adherence-content">
        <div className="adherence-score">
          <div className="score-ring" style={{ '--score': `${value * 3.6}deg` } as CSSProperties}>
            <strong>{value}%</strong>
          </div>
          <span>média nos últimos 30 dias</span>
        </div>
        <div className="adherence-list">
          {rows.map(([label, percentage]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{percentage}</strong>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (id === 'recent-activity') {
    return (
      <div className="activity-list">
        <div>
          <i>JM</i>
          <span>
            <strong>João Martins</strong>
            concluiu o treino B
          </span>
          <small>12 min</small>
        </div>
        <div>
          <i>AL</i>
          <span>
            <strong>Ana Lima</strong>
            enviou um check-in
          </span>
          <small>34 min</small>
        </div>
        <div>
          <i>RF</i>
          <span>
            <strong>Rafael Freitas</strong>
            registrou uma refeição
          </span>
          <small>1 h</small>
        </div>
      </div>
    )
  }

  if (id === 'progress') {
    return (
      <div className="progress-widget">
        <div>
          <strong>+18%</strong>
          <span>evolução média em 90 dias</span>
        </div>
        <svg viewBox="0 0 500 120" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="progress-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--gold-42)' }} stopOpacity=".28" />
              <stop offset="100%" style={{ stopColor: 'var(--gold-42)' }} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 100 C70 92 85 68 145 76 S240 54 290 61 S385 20 500 28 V120 H0Z"
            fill="url(#progress-fill)"
          />
          <path
            d="M0 100 C70 92 85 68 145 76 S240 54 290 61 S385 20 500 28"
            fill="none"
            style={{ stroke: 'var(--gold-42)' }}
            strokeWidth="2"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="appointment-list">
      <div>
        <time>09:00</time>
        <span>
          <strong>Lucas Mendes</strong>
          Avaliação mensal
        </span>
      </div>
      <div>
        <time>11:30</time>
        <span>
          <strong>Camila Rocha</strong>
          Ajuste de treino
        </span>
      </div>
      <div>
        <time>15:00</time>
        <span>
          <strong>Bruno Alves</strong>
          Check-in inicial
        </span>
      </div>
    </div>
  )
}

function ensureRenewalsWidget(items: DashboardLayoutItem[]): DashboardLayoutItem[] {
  const base = items.length > 0 ? items : defaultDashboardLayout
  let next = [...base]
  if (!next.some((item) => item.widget === 'renewals-overview')) {
    const renewalDefault = defaultDashboardLayout.find(
      (item) => item.widget === 'renewals-overview',
    ) ?? {
      widget: 'renewals-overview' as const,
      order: next.length,
      width: '4' as const,
      height: 'medium' as const,
      visible: true,
    }
    next = [...next, { ...renewalDefault, order: next.length }]
  }
  if (!next.some((item) => item.widget === 'site-forms')) {
    const formsDefault = defaultDashboardLayout.find((item) => item.widget === 'site-forms') ?? {
      widget: 'site-forms' as const,
      order: next.length,
      width: '8' as const,
      height: 'medium' as const,
      visible: true,
    }
    next = [...next, { ...formsDefault, order: next.length }]
  }
  return next
}

export default function CustomDashboard({
  initialLayout,
  internalUpdates,
  onToggleInternalUpdate,
  onOpenInternal,
  siteForms = initialSiteFormSubmissions,
  onUpdateFormTemperature,
  onOpenSiteForms,
}: {
  initialLayout: DashboardLayoutItem[]
  internalUpdates: InternalUpdate[]
  onToggleInternalUpdate: (updateId: string) => void
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
  const startingLayout = ensureRenewalsWidget(initialLayout)
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
  const resizeSessionRef = useRef<ResizeSession | null>(null)

  /* ---- Saved layouts (Operacional, Treino, Dieta, Comercial + the user's own) ---- */
  const [storedLayouts, setStoredLayouts] = useState<SavedDashboardLayout[]>([])
  const [activeLayoutId, setActiveLayoutId] = useState('operacional')
  const [defaultLayoutId, setDefaultLayoutId] = useState('operacional')
  const [nameDialog, setNameDialog] = useState<null | { mode: 'save-as' | 'rename'; value: string }>(null)
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
    const defaultId = merged.some((item) => item.id === state.defaultId) ? state.defaultId! : 'operacional'
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
    const target = mergeLayouts(remaining).find((item) => item.id === nextDefault) ?? builtInLayouts[0]
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

  const startDragging = (widget: WidgetId) => {
    draggedWidgetRef.current = widget
    setDraggedWidget(widget)
    setFeedback('')
  }

  const stopDragging = () => {
    draggedWidgetRef.current = null
    setDraggedWidget(null)
  }

  const movePointerDrag = (clientX: number, clientY: number) => {
    const sourceWidget = draggedWidgetRef.current
    if (!sourceWidget) return
    const target = document
      .elementFromPoint(clientX, clientY)
      ?.closest<HTMLElement>('[data-widget-id]')
    const targetWidget = target?.dataset.widgetId as WidgetId | undefined
    if (targetWidget) reorderWidget(sourceWidget, targetWidget)
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
          {editing ? (
            <>
              <Button size="sm" variant="ghost" onClick={cancelEditing}>
                Cancelar
              </Button>
              <Button size="sm" onClick={() => setCatalogOpen(true)}>
                <Icon name="plus" className="size-4" /> Adicionar widget
              </Button>
              <Button size="sm" onClick={() => setNameDialog({ mode: 'save-as', value: '' })}>
                Salvar como novo…
              </Button>
              <Button size="sm" variant="accent" onClick={saveLayout}>
                Salvar layout
              </Button>
            </>
          ) : (
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
                    ? [{ id: 'delete', label: 'Excluir layout', danger: true, onSelect: deleteLayout }]
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
                    <span aria-hidden="true" className="text-base leading-none">⋯</span>
                  </Button>
                )}
              />
              <Button size="sm" onClick={() => setEditing(true)}>
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
          )}
        </div>
      </div>

      {nameDialog && (
        <NameDialog
          title={nameDialog.mode === 'save-as' ? 'Salvar como novo layout' : 'Renomear layout'}
          description="Ex.: Layout Avaliações, Layout Segunda-feira."
          label="Nome do layout"
          confirmLabel={nameDialog.mode === 'save-as' ? 'Criar layout' : 'Renomear'}
          initialValue={nameDialog.value}
          takenNames={allLayouts.filter((item) => item.id !== (nameDialog.mode === 'rename' ? activeLayout.id : '')).map((item) => item.name)}
          onCancel={() => setNameDialog(null)}
          onConfirm={(name) => {
            if (nameDialog.mode === 'save-as') saveAsNewLayout(name)
            else renameLayout(name)
            setNameDialog(null)
          }}
        />
      )}

      {editing && (
        <div className="edit-dashboard-note">
          <span>Modo de edição</span>
          Arraste pelo puxador superior para mover. Puxe o canto inferior direito para ajustar
          largura e altura. Clique em “Salvar layout” para guardar neste navegador.
        </div>
      )}

      <section
        ref={dashboardGridRef}
        className="custom-dashboard-grid"
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
          const opensInternal = item.widget === 'weekly-agenda' || item.widget === 'team-overview'
          return (
            <article
              key={item.widget}
              data-widget-id={item.widget}
              style={widgetStyle}
              className={`dashboard-widget widget-${item.widget} ${opensInternal && !editing ? 'opens-internal' : ''} ${editing ? 'editing' : ''} ${draggedWidget === item.widget ? 'dragging' : ''} ${resizingWidget === item.widget ? 'resizing' : ''}`}
              role={opensInternal && !editing ? 'link' : undefined}
              tabIndex={opensInternal && !editing ? 0 : undefined}
              aria-label={
                opensInternal && !editing
                  ? `${definition.title}. Abrir Atualizações e Agenda em Interno`
                  : undefined
              }
              onClick={(event) => {
                if (!opensInternal || editing) return
                if ((event.target as HTMLElement).closest('button, input, select, textarea, a')) {
                  return
                }
                onOpenInternal()
              }}
              onKeyDown={(event) => {
                if (!opensInternal || editing || (event.key !== 'Enter' && event.key !== ' '))
                  return
                event.preventDefault()
                onOpenInternal()
              }}
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
                        startDragging(item.widget)
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
                  <span className={`widget-category ${definition.category}`}>
                    {definition.category}
                  </span>
                  <h2>{definition.title}</h2>
                </div>
                {editing && (
                  <div className="widget-controls">
                    <button
                      type="button"
                      onClick={() => moveWidget(item.widget, -1)}
                      disabled={index === 0}
                      title="Mover para trás"
                    >
                      Antes
                    </button>
                    <button
                      type="button"
                      onClick={() => moveWidget(item.widget, 1)}
                      disabled={index === orderedLayout.length - 1}
                      title="Mover para frente"
                    >
                      Depois
                    </button>
                    <button
                      className="remove-widget"
                      type="button"
                      onClick={() => removeWidget(item.widget)}
                      aria-label={`Remover ${definition.title}`}
                    >
                      Remover
                    </button>
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
                  internalUpdates={internalUpdates}
                  onToggleInternalUpdate={onToggleInternalUpdate}
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

      {catalogOpen && (
        <div
          className="widget-catalog-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setCatalogOpen(false)
          }}
        >
          <section
            className="widget-catalog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="widget-catalog-title"
          >
            <header>
              <div>
                <span>PERSONALIZE SUA VISÃO</span>
                <h2 id="widget-catalog-title">Adicionar widget</h2>
                <p>Misture indicadores de treino, nutrição e gestão conforme a sua rotina.</p>
              </div>
              <button
                type="button"
                onClick={() => setCatalogOpen(false)}
                aria-label="Fechar catálogo"
              >
                Fechar
              </button>
            </header>
            <div className="widget-catalog-grid">
              {availableWidgets.length > 0 ? (
                availableWidgets.map((widget) => (
                  <button key={widget.id} type="button" onClick={() => addWidget(widget.id)}>
                    <span className={`widget-category ${widget.category}`}>{widget.category}</span>
                    <strong>{widget.title}</strong>
                    <small>{widget.description}</small>
                    <i>Adicionar</i>
                  </button>
                ))
              ) : (
                <div className="catalog-empty">Todos os widgets já estão no seu Dashboard.</div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

