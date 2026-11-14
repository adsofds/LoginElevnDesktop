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
import type { DashboardPeriod } from '@/lib/dashboardPeriod'
import {
  ActiveStudentsChart,
  AdherenceChart,
  AttentionQueue,
  GoalsChart,
  KpiOverview,
  LeadsFunnel,
  TodayAgenda,
} from './dashboard/DashboardWidgets'
import { TemperaturePicker } from './interno/LeadsSpreadsheet'
import { Button } from './ui/Button'
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
    id: 'team-overview',
    title: 'Últimas atualizações',
    description: 'Comentários direcionados pela gestão.',
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

function InternalUpdates({
  updates,
  onToggleUpdate,
  onOpen,
}: {
  updates: InternalUpdate[]
  onToggleUpdate: (updateId: string) => void
  onOpen: () => void
}) {
  return (
    <div className="internal-updates">
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
      <button type="button" className="widget-footer-link" onClick={onOpen}>
        Abrir Atualizações no Interno →
      </button>
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
    </div>
  )
}

function WidgetContent({
  id,
  period,
  internalUpdates,
  onToggleInternalUpdate,
  siteForms,
  onUpdateFormTemperature,
  onOpenSiteForms,
  onOpenInternal,
  onNavigate,
}: {
  id: WidgetId
  period: DashboardPeriod
  internalUpdates: InternalUpdate[]
  onToggleInternalUpdate: (updateId: string) => void
  siteForms: SiteFormSubmission[]
  onUpdateFormTemperature: (formId: string, temperature: LeadTemperature) => void
  onOpenSiteForms: () => void
  onOpenInternal: () => void
  onNavigate: (href: string) => void
}) {
  if (id === 'kpi-overview') {
    return <KpiOverview period={period} siteForms={siteForms} onNavigate={onNavigate} onOpenSiteForms={onOpenSiteForms} />
  }
  if (id === 'attention-list') return <AttentionQueue onNavigate={onNavigate} />
  if (id === 'students-table') return <StudentsTable />
  if (id === 'weekly-agenda') return <TodayAgenda onNavigate={onNavigate} />
  if (id === 'team-overview') {
    return <InternalUpdates updates={internalUpdates} onToggleUpdate={onToggleInternalUpdate} onOpen={onOpenInternal} />
  }
  if (id === 'active-students-chart') return <ActiveStudentsChart period={period} />
  if (id === 'adherence-chart') return <AdherenceChart period={period} />
  if (id === 'renewals-overview') return <RenewalsOverview />
  if (id === 'goals-chart') return <GoalsChart />
  if (id === 'leads-funnel') return <LeadsFunnel siteForms={siteForms} onOpenSiteForms={onOpenSiteForms} />
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

function withFallback(items: DashboardLayoutItem[]): DashboardLayoutItem[] {
  return items.length > 0 ? items : defaultDashboardLayout
}

export default function CustomDashboard({
  initialLayout,
  internalUpdates,
  onToggleInternalUpdate,
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
      {editing ? (
        <div
          role="region"
          aria-label="Edição do layout"
          className="sticky top-16 z-30 -mx-1 mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card bg-night px-4 py-3 text-on-dark shadow-pop"
        >
          <div className="mr-auto min-w-0">
            <p className="text-sm font-semibold">Editando layout “{activeLayout.name}”</p>
            <p className="text-xs text-on-dark/65">
              Arraste pelo puxador para mover e pelo canto inferior direito para redimensionar. Setas também funcionam.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" className="text-on-dark hover:bg-white/10 hover:text-on-dark" onClick={cancelEditing}>
              Cancelar
            </Button>
            <Button size="sm" variant="ghost" className="text-on-dark hover:bg-white/10 hover:text-on-dark" onClick={() => setCatalogOpen(true)}>
              <Icon name="plus" className="size-4" /> Adicionar widget
            </Button>
            <Button size="sm" variant="ghost" className="text-on-dark hover:bg-white/10 hover:text-on-dark" onClick={() => setNameDialog({ mode: 'save-as', value: '' })}>
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
          takenNames={allLayouts.filter((item) => item.id !== (nameDialog.mode === 'rename' ? activeLayout.id : '')).map((item) => item.name)}
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
                  period={period}
                  onNavigate={onNavigate}
                  onOpenInternal={onOpenInternal}
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

      <Sheet
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        label="Adicionar widget"
        className="w-[min(420px,100vw)] bg-surface"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-xl leading-7 font-semibold text-ink">Adicionar widget</h2>
            <p className="mt-1 text-sm text-ink-2">Entra no fim do layout “{activeLayout.name}”, com 6 colunas.</p>
          </div>
          <Button size="icon" variant="ghost" aria-label="Fechar catálogo" onClick={() => setCatalogOpen(false)}>
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
                    <span aria-hidden="true" className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                      <Icon name={widget.category === 'Treino' ? 'training' : widget.category === 'Nutrição' ? 'nutrition' : 'dashboard'} className="size-4" />
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
            <p className="px-2 py-8 text-center text-sm text-ink-3">Todos os widgets já estão neste layout.</p>
          )}
        </div>
      </Sheet>
    </>
  )
}

