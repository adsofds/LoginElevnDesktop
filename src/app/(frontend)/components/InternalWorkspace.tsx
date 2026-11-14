'use client'

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import {
  formatFormTimestamp,
  formatPersonName,
  formatRelativeTime,
  splitReferralOrBirth,
  initialSiteFormSubmissions,
  type InternalUpdate,
  type InternalUpdateReply,
  type LeadTemperature,
  type SiteFormSubmission,
} from '@/lib/demo-internal'
import { agendaTypeColor, demoAgenda, type AgendaType } from '@/lib/demo-agenda'
import LeadsSpreadsheet from './interno/LeadsSpreadsheet'
import InternProgress from './interno/InternProgress'
import WeekCalendar, { type CalendarAppointment } from './interno/WeekCalendar'
import { Segmented } from './ui/Segmented'
import { Badge, Kbd } from './ui/Badge'
import { Button } from './ui/Button'
import { cx } from './ui/cx'
import { Icon } from './ui/icons'
import { Menu } from './ui/Menu'
import { Tabs } from './ui/Tabs'

/** Today's year/month/day in Brasília, independent of the viewer's machine time zone. */
function getBusinessToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { year: get('year'), month: get('month') - 1, day: get('day') }
}

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const currentMonthLabel = (() => {
  const today = getBusinessToday()
  return `${monthNames[today.month]} de ${today.year}`
})()

/** Previous month, current month and the next four, as "Nov 26". */
const monthSelectorLabels = (() => {
  const today = getBusinessToday()
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(today.year, today.month - 1 + i, 1)
    return `${monthNames[date.getMonth()].slice(0, 3)} ${String(date.getFullYear()).slice(2)}`
  })
})()

type BoardCard = {
  id: string
  title: string
  note: string
  labelId: string
  due: string
  dueDate?: string
  dueTime?: string
}

type BoardList = {
  id: string
  title: string
  color: string
  cards: BoardCard[]
}

type BoardLabel = {
  id: string
  name: string
  color: string
}

type Workspace = {
  id: string
  title: string
  color: string
  description: string
  labels: BoardLabel[]
  lists: BoardList[]
}

type Appointment = {
  id: string
  title: string
  date: string
  time: string
  person: string
  type: string
  description?: string
  source?: {
    type: 'trello'
    cardId: string
    workspaceId: string
  }
}

type AppointmentDraft = Omit<Appointment, 'id' | 'source'> & {
  trelloWorkspaceId: string
}

type ContentGoal = {
  id: string
  intern: string
  category: string
  target: number
  completed: number
  selectedSlots: number[]
  cadence: string
  description: string
}

type ContentNote = {
  id: string
  intern: string
  status: string
  date: string
  completed: string
  pending: string
  reason: string
  seen: boolean
  reply?: string
}

type ColorStyle = CSSProperties & {
  '--item-color': string
}

const starterWorkspaces: Workspace[] = [
  {
    id: 'prospection',
    title: 'Prospecção',
    color: '#6B6133',
    description: 'Organize contatos, conversas e novas oportunidades.',
    labels: [
      { id: 'referral', name: 'Indicação', color: '#6B6133' },
      { id: 'partnership', name: 'Parceria', color: '#546A76' },
      { id: 'follow-up', name: 'Follow-up', color: '#A16F45' },
      { id: 'corporate', name: 'Corporativo', color: '#655B7C' },
    ],
    lists: [
      {
        id: 'new-leads',
        title: 'Novos leads',
        color: '#8C814B',
        cards: [
          {
            id: 'lead-ana',
            title: 'Ana Martins',
            note: 'Chegou por indicação da Camila. Objetivo: emagrecimento.',
            labelId: 'referral',
            due: 'Hoje',
          },
          {
            id: 'lead-studio',
            title: 'Parceria Studio Axis',
            note: 'Preparar proposta para acompanhamento dos alunos do estúdio.',
            labelId: 'partnership',
            due: '22 nov',
            dueDate: '2026-11-22',
          },
        ],
      },
      {
        id: 'in-conversation',
        title: 'Em conversa',
        color: '#A16F45',
        cards: [
          {
            id: 'lead-marcelo',
            title: 'Marcelo Vieira',
            note: 'Retornar com opções de plano trimestral.',
            labelId: 'follow-up',
            due: 'Amanhã',
          },
        ],
      },
      {
        id: 'proposal',
        title: 'Proposta enviada',
        color: '#655B7C',
        cards: [
          {
            id: 'lead-company',
            title: 'Programa corporativo Nexo',
            note: 'Proposta enviada para 18 colaboradores.',
            labelId: 'corporate',
            due: '25 nov',
            dueDate: '2026-11-25',
          },
        ],
      },
    ],
  },
  {
    id: 'content',
    title: 'Conteúdos',
    color: '#765D69',
    description: 'Planeje pautas, produção e publicações da consultoria.',
    labels: [
      { id: 'instagram', name: 'Instagram', color: '#765D69' },
      { id: 'reels', name: 'Reels', color: '#A16F45' },
      { id: 'rich-material', name: 'Material rico', color: '#4F7462' },
    ],
    lists: [
      {
        id: 'ideas',
        title: 'Ideias',
        color: '#8C814B',
        cards: [
          {
            id: 'content-checkin',
            title: 'Como responder um check-in',
            note: 'Carrossel com os critérios usados na análise semanal.',
            labelId: 'instagram',
            due: 'Sem prazo',
          },
          {
            id: 'content-adherence',
            title: 'Adesão sem culpa',
            note: 'Roteiro curto sobre consistência e retomada.',
            labelId: 'reels',
            due: '28 nov',
            dueDate: '2026-11-28',
          },
        ],
      },
      {
        id: 'production',
        title: 'Em produção',
        color: '#A16F45',
        cards: [
          {
            id: 'content-protein',
            title: 'Guia prático de proteína',
            note: 'Design em revisão com a equipe de nutrição.',
            labelId: 'rich-material',
            due: '23 nov',
            dueDate: '2026-11-23',
          },
        ],
      },
      {
        id: 'published',
        title: 'Publicados',
        color: '#4F7462',
        cards: [
          {
            id: 'content-routine',
            title: 'Rotina de treino realista',
            note: 'Publicado e distribuído no grupo de alunos.',
            labelId: 'instagram',
            due: 'Publicado',
          },
        ],
      },
    ],
  },
]

const starterAppointments: Appointment[] = [
  {
    id: 'appointment-lucas',
    title: 'Reavaliação mensal',
    date: '2026-11-05',
    time: '09:00',
    person: 'Lucas Andrade',
    type: 'Reavaliação',
  },
  {
    id: 'appointment-aline',
    title: 'Avaliação inicial',
    date: '2026-11-05',
    time: '14:30',
    person: 'Aline Moraes',
    type: 'Avaliação',
  },
  {
    id: 'appointment-camila',
    title: 'Reavaliação mensal',
    date: '2026-11-06',
    time: '10:00',
    person: 'Camila Rocha',
    type: 'Reavaliação',
  },
  {
    id: 'appointment-bruno',
    title: 'Avaliação inicial',
    date: '2026-11-07',
    time: '16:00',
    person: 'Bruno Martins',
    type: 'Avaliação',
  },
  ...starterWorkspaces.flatMap((workspace) =>
    workspace.lists.flatMap((list) =>
      list.cards
        .filter((card) => card.dueDate)
        .map((card) => ({
          id: `trello-${card.id}`,
          title: card.title,
          date: card.dueDate as string,
          time: 'Dia todo',
          person: workspace.title,
          type: 'Prazo do Trello',
          description: card.note,
          source: {
            type: 'trello' as const,
            cardId: card.id,
            workspaceId: workspace.id,
          },
        })),
    ),
  ),
]

const starterContentGoals: ContentGoal[] = [
  {
    id: 'goal-social',
    intern: 'Marina Lopes',
    category: 'Social selling',
    target: 1,
    completed: 1,
    selectedSlots: [0],
    cadence: 'por semana',
    description: 'Criar conversas qualificadas e registrar os principais retornos.',
  },
  {
    id: 'goal-stories',
    intern: 'Felipe Santos',
    category: 'Stories',
    target: 3,
    completed: 2,
    selectedSlots: [0, 2],
    cadence: 'por semana',
    description: 'Mostrar rotina, bastidores e prova social da Elevn.',
  },
  {
    id: 'goal-feed',
    intern: 'Renata Alves',
    category: 'Feed',
    target: 2,
    completed: 0,
    selectedSlots: [],
    cadence: 'por semana',
    description: 'Publicar conteúdo educativo com chamada para conversa.',
  },
]

const starterContentNotes: ContentNote[] = [
  {
    id: 'note-marina',
    intern: 'Marina Lopes',
    status: 'Parcial',
    date: '2026-11-06',
    completed: 'Abri novas conversas e organizei os retornos do social selling.',
    pending: 'Finalizar o roteiro do segundo conteúdo da semana.',
    reason: 'A aprovação do tema chegou depois do previsto.',
    seen: false,
  },
  {
    id: 'note-felipe',
    intern: 'Felipe Santos',
    status: 'Concluído',
    date: '2026-11-05',
    completed: 'Publiquei os stories planejados e organizei os destaques.',
    pending: 'Nenhuma pendência nesta frente.',
    reason: 'O planejamento foi concluído dentro do prazo.',
    seen: true,
    reply: 'Ótimo trabalho. Mantenha esse padrão de registro nas próximas semanas.',
  },
]

const quickReplies = [
  'Ajuste aplicado, mantém a carga.',
  'Recebido! Reviso e te retorno hoje.',
  'Ótimo trabalho, segue assim.',
]

const mailField =
  'mt-1 h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none'

/** Where a conversation came from, shown as a small icon in the list. */
function mailOrigin(update: InternalUpdate): { icon: string; label: string } {
  if (/MFIT/.test(update.subject)) return { icon: 'training', label: 'Comentário do MFIT' }
  if (update.role === 'Aluno' || update.recipientCategory === 'aluno')
    return { icon: 'students', label: 'Aluno pelo app' }
  return { icon: 'team', label: 'Equipe' }
}

/** ⌘Enter / Ctrl+Enter submits the textarea's form. */
function submitOnModEnter(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function toISODate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function parseISODate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(parseISODate(value))
    .replace('.', '')
}

function formatAppointmentDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(
    parseISODate(value),
  )
}

function formatMonth(year: number, month: number) {
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1),
  )
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function InternalWorkspace({
  updates,
  onCreateUpdate,
  onToggleUpdate,
  onMarkUpdateRead,
  onReplyUpdate,
  siteForms = initialSiteFormSubmissions,
  onUpdateFormTemperature,
  onCreateFormSubmission,
  initialSection = 'board',
  section,
  onSectionChange,
  intent,
  onIntentHandled,
  focusUpdateId,
  formSearch,
  onConvertLead,
}: {
  /** "Converter em aluno" from the lead panel. */
  onConvertLead?: (lead: SiteFormSubmission) => void
  updates: InternalUpdate[]
  onCreateUpdate: (update: InternalUpdate) => void
  onToggleUpdate: (updateId: string) => void
  onMarkUpdateRead: (updateId: string, unread?: boolean) => void
  onReplyUpdate: (updateId: string, reply: InternalUpdateReply) => void
  siteForms?: SiteFormSubmission[]
  onUpdateFormTemperature?: (formId: string, temperature: LeadTemperature) => void
  onCreateFormSubmission?: (submission: SiteFormSubmission) => void
  initialSection?: 'board' | 'updates' | 'posts' | 'forms'
  /** Controlled tab (from the URL). Falls back to local state when omitted. */
  section?: 'board' | 'updates' | 'posts' | 'forms'
  onSectionChange?: (section: 'board' | 'updates' | 'posts' | 'forms') => void
  /** Opens a create flow once ("+ Novo" / ⌘K): lead, mensagem, compromisso or cartao. */
  intent?: string | null
  onIntentHandled?: () => void
  /** Selects a conversation in the inbox (deep link from notifications). */
  focusUpdateId?: string | null
  /** Pre-fills the leads search (deep link from ⌘K). */
  formSearch?: string | null
}) {
  const [workspaces, setWorkspaces] = useState(starterWorkspaces)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(starterWorkspaces[0].id)
  const [workspaceComposerOpen, setWorkspaceComposerOpen] = useState(false)
  const [listComposerOpen, setListComposerOpen] = useState(false)
  const [cardComposerListId, setCardComposerListId] = useState<string | null>(null)
  const [editingCard, setEditingCard] = useState<{ cardId: string; listId: string } | null>(null)
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; listId: string } | null>(null)
  const [dropListId, setDropListId] = useState<string | null>(null)
  const [labelManagerOpen, setLabelManagerOpen] = useState(false)
  const [localSection, setLocalSection] = useState<'board' | 'updates' | 'posts' | 'forms'>(
    initialSection,
  )
  const activeSection = section ?? localSection
  const setActiveSection = (next: 'board' | 'updates' | 'posts' | 'forms') => {
    setLocalSection(next)
    onSectionChange?.(next)
  }
  const [localForms, setLocalForms] = useState<SiteFormSubmission[]>(siteForms)
  const [formTempFilter, setFormTempFilter] = useState<'Todos' | LeadTemperature>('Todos')
  const [formSearchQuery, setFormSearchQuery] = useState('')
  const [newFormModalOpen, setNewFormModalOpen] = useState(false)
  const [appointments, setAppointments] = useState(starterAppointments)
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const today = getBusinessToday()
    return { year: today.year, month: today.month }
  })
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [appointmentComposerOpen, setAppointmentComposerOpen] = useState(false)
  const [appointmentDraft, setAppointmentDraft] = useState<AppointmentDraft>({
    title: '',
    date: '2026-11-05',
    time: '09:00',
    person: '',
    type: 'Reunião',
    description: '',
    trelloWorkspaceId: '',
  })
  const [calendarView, setCalendarView] = useState<'semana' | 'mes'>('semana')
  const [todayIso, setTodayIso] = useState('')
  const [showPastAppointments, setShowPastAppointments] = useState(false)

  // Today (Brasília) and this week's demo agenda are set after hydration so the
  // static page and the browser agree; the same events show on the Dashboard.
  useEffect(() => {
    const { year, month, day } = getBusinessToday()
    const today = new Date(year, month, day)
    const iso = toISODate(today)
    setTodayIso(iso)
    setCalendarCursor({ year, month })
    setAppointmentDraft((current) => ({ ...current, date: iso }))
    setAppointments((current) => {
      if (current.some((item) => item.id.startsWith('demo-'))) return current
      const relative: Appointment[] = demoAgenda.map((event) => {
        const date = new Date(today)
        date.setDate(today.getDate() + event.dayOffset)
        return {
          id: `demo-${event.id}`,
          title: event.title,
          date: toISODate(date),
          time: event.time,
          person: event.person,
          type: event.type === 'Prazo' ? 'Lembrete' : event.type,
        }
      })
      return [...relative, ...current]
    })
  }, [])

  const shiftWeek = (days: number) => {
    const date = parseISODate(appointmentDraft.date)
    date.setDate(date.getDate() + days)
    selectCalendarDay(date)
  }

  const [postView, setPostView] = useState<'week' | 'month' | 'goals' | 'notes'>('goals')
  const [contentGoals, setContentGoals] = useState(starterContentGoals)
  const [contentNotes, setContentNotes] = useState(starterContentNotes)
  const [replyingNoteId, setReplyingNoteId] = useState<string | null>(null)
  const [conversationSaved, setConversationSaved] = useState(false)
  const [mailFolder, setMailFolder] = useState<
    'inbox' | 'unread' | 'students' | 'team' | 'sent' | 'completed'
  >('inbox')
  const [mailSearch, setMailSearch] = useState('')
  const [selectedUpdateId, setSelectedUpdateId] = useState<string>(updates[0]?.id ?? '')
  const [composingMail, setComposingMail] = useState(false)
  const [recipientCategory, setRecipientCategory] = useState<'equipe' | 'aluno'>('equipe')
  const [replyDraft, setReplyDraft] = useState('')

  useEffect(() => {
    setAppointments((current) => {
      const agendaOnlyAppointments = current.filter(
        (appointment) => appointment.source?.type !== 'trello',
      )
      const trelloAppointments = workspaces.flatMap((workspace) =>
        workspace.lists.flatMap((list) =>
          list.cards
            .filter((card) => card.dueDate)
            .map((card) => {
              const existingAppointment = current.find(
                (appointment) =>
                  appointment.source?.type === 'trello' &&
                  appointment.source.cardId === card.id &&
                  appointment.source.workspaceId === workspace.id,
              )

              return {
                id: existingAppointment?.id ?? `trello-${workspace.id}-${card.id}`,
                title: card.title,
                date: card.dueDate as string,
                time: card.dueTime || existingAppointment?.time || 'Dia todo',
                person: existingAppointment?.person || workspace.title,
                type: existingAppointment?.type || 'Prazo do Trello',
                description: card.note,
                source: {
                  type: 'trello' as const,
                  cardId: card.id,
                  workspaceId: workspace.id,
                },
              }
            }),
        ),
      )

      return [...agendaOnlyAppointments, ...trelloAppointments]
    })
  }, [workspaces])

  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0]

  // Deep links from the shell ("+ Novo", ⌘K, notifications): run once, then let the URL forget them
  useEffect(() => {
    if (!intent) return
    if (intent === 'lead') setNewFormModalOpen(true)
    else if (intent === 'mensagem') setComposingMail(true)
    else if (intent === 'compromisso') {
      setEditingAppointmentId(null)
      setAppointmentComposerOpen(true)
      // The agenda sits below the inbox: bring the new form into view
      window.setTimeout(() => {
        const form = document.querySelector<HTMLElement>('.appointment-form')
        form?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        form?.querySelector<HTMLElement>('input, select, textarea')?.focus({ preventScroll: true })
      }, 120)
    } else if (intent === 'cartao') {
      const firstList = activeWorkspace.lists[0]
      if (firstList) setCardComposerListId(firstList.id)
    }
    onIntentHandled?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent])

  useEffect(() => {
    if (focusUpdateId) {
      setSelectedUpdateId(focusUpdateId)
      setComposingMail(false)
    }
  }, [focusUpdateId])

  useEffect(() => {
    if (formSearch) {
      setFormSearchQuery(formSearch)
      setFormTempFilter('Todos')
    }
  }, [formSearch])

  const updateActiveWorkspace = (update: (workspace: Workspace) => Workspace) => {
    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === activeWorkspace.id ? update(workspace) : workspace,
      ),
    )
  }

  const createWorkspace = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('workspace-title') || '').trim()
    const description = String(form.get('workspace-description') || '').trim()
    if (!title) return
    const workspace: Workspace = {
      id: makeId('workspace'),
      title,
      color: String(form.get('workspace-color') || '#6B6133'),
      description: description || 'Área pessoal de organização do admin.',
      labels: [{ id: makeId('label'), name: 'Tarefa', color: '#6B6133' }],
      lists: [{ id: makeId('list'), title: 'A fazer', color: '#8C814B', cards: [] }],
    }
    setWorkspaces((current) => [...current, workspace])
    setActiveWorkspaceId(workspace.id)
    setWorkspaceComposerOpen(false)
    event.currentTarget.reset()
  }

  const createList = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('list-title') || '').trim()
    const color = String(form.get('list-color') || '#8C814B')
    if (!title) return
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      lists: [...workspace.lists, { id: makeId('list'), title, color, cards: [] }],
    }))
    setListComposerOpen(false)
    event.currentTarget.reset()
  }

  const createCard = (event: FormEvent<HTMLFormElement>, listId: string) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('card-title') || '').trim()
    const note = String(form.get('card-note') || '').trim()
    const due = String(form.get('card-due') || '').trim()
    const labelId = String(form.get('card-label') || activeWorkspace.labels[0]?.id || '')
    if (!title) return
    const card: BoardCard = {
      id: makeId('card'),
      title,
      note: note || 'Sem descrição adicional.',
      labelId,
      due: due ? `Até ${formatShortDate(due)}` : 'Sem prazo',
      dueDate: due || undefined,
    }
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      lists: workspace.lists.map((list) =>
        list.id === listId ? { ...list, cards: [...list.cards, card] } : list,
      ),
    }))
    setCardComposerListId(null)
    event.currentTarget.reset()
  }

  const updateCard = (event: FormEvent<HTMLFormElement>, listId: string, cardId: string) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('card-title') || '').trim()
    const note = String(form.get('card-note') || '').trim()
    const dueDate = String(form.get('card-due') || '').trim()
    const labelId = String(form.get('card-label') || activeWorkspace.labels[0]?.id || '')
    if (!title) return
    const currentCard = activeWorkspace.lists
      .find((list) => list.id === listId)
      ?.cards.find((card) => card.id === cardId)

    const updatedCard: BoardCard = {
      id: cardId,
      title,
      note: note || 'Sem descrição adicional.',
      labelId,
      due: dueDate
        ? `Até ${formatShortDate(dueDate)}${currentCard?.dueTime ? ` · ${currentCard.dueTime}` : ''}`
        : 'Sem prazo',
      dueDate: dueDate || undefined,
      dueTime: dueDate ? currentCard?.dueTime : undefined,
    }

    updateActiveWorkspace((workspace) => ({
      ...workspace,
      lists: workspace.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              cards: list.cards.map((card) =>
                card.id === cardId ? { ...card, ...updatedCard } : card,
              ),
            }
          : list,
      ),
    }))
    setEditingCard(null)
  }

  const saveAppointment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !appointmentDraft.title.trim() ||
      !appointmentDraft.date ||
      !appointmentDraft.time ||
      !appointmentDraft.person.trim()
    ) {
      return
    }

    const { trelloWorkspaceId, ...appointmentFields } = appointmentDraft
    const normalizedDraft: Omit<Appointment, 'id' | 'source'> = {
      ...appointmentFields,
      title: appointmentDraft.title.trim(),
      person: appointmentDraft.person.trim(),
      description: appointmentDraft.description?.trim() || '',
    }
    const sourceAppointment = editingAppointmentId
      ? appointments.find((appointment) => appointment.id === editingAppointmentId)
      : undefined

    if (editingAppointmentId) {
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === editingAppointmentId
            ? {
                ...appointment,
                ...normalizedDraft,
              }
            : appointment,
        ),
      )
    } else {
      const cardId = trelloWorkspaceId ? makeId('agenda-card') : ''
      setAppointments((current) => [
        ...current,
        {
          id: makeId('appointment'),
          ...normalizedDraft,
          ...(trelloWorkspaceId
            ? {
                source: {
                  type: 'trello' as const,
                  cardId,
                  workspaceId: trelloWorkspaceId,
                },
              }
            : {}),
        },
      ])
      if (trelloWorkspaceId) {
        setWorkspaces((current) =>
          current.map((workspace) =>
            workspace.id === trelloWorkspaceId
              ? {
                  ...workspace,
                  lists: workspace.lists.map((list, index) =>
                    index === 0
                      ? {
                          ...list,
                          cards: [
                            ...list.cards,
                            {
                              id: cardId,
                              title: normalizedDraft.title,
                              note: normalizedDraft.description || 'Criado pela Agenda.',
                              labelId: workspace.labels[0]?.id || '',
                              dueDate: normalizedDraft.date,
                              dueTime: normalizedDraft.time,
                              due: `Até ${formatShortDate(normalizedDraft.date)} · ${normalizedDraft.time}`,
                            },
                          ],
                        }
                      : list,
                  ),
                }
              : workspace,
          ),
        )
      }
    }

    if (sourceAppointment?.source?.type === 'trello') {
      setWorkspaces((current) =>
        current.map((workspace) =>
          workspace.id === sourceAppointment.source?.workspaceId
            ? {
                ...workspace,
                lists: workspace.lists.map((list) => ({
                  ...list,
                  cards: list.cards.map((card) =>
                    card.id === sourceAppointment.source?.cardId
                      ? {
                          ...card,
                          title: normalizedDraft.title,
                          note: normalizedDraft.description || 'Sem descrição adicional.',
                          dueDate: normalizedDraft.date,
                          dueTime: normalizedDraft.time,
                          due: `Até ${formatShortDate(normalizedDraft.date)} · ${normalizedDraft.time}`,
                        }
                      : card,
                  ),
                })),
              }
            : workspace,
        ),
      )
    } else if (editingAppointmentId && trelloWorkspaceId) {
      const cardId = makeId('agenda-card')
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === editingAppointmentId
            ? {
                ...appointment,
                source: {
                  type: 'trello',
                  cardId,
                  workspaceId: trelloWorkspaceId,
                },
              }
            : appointment,
        ),
      )
      setWorkspaces((current) =>
        current.map((workspace) =>
          workspace.id === trelloWorkspaceId
            ? {
                ...workspace,
                lists: workspace.lists.map((list, index) =>
                  index === 0
                    ? {
                        ...list,
                        cards: [
                          ...list.cards,
                          {
                            id: cardId,
                            title: normalizedDraft.title,
                            note: normalizedDraft.description || 'Criado pela Agenda.',
                            labelId: workspace.labels[0]?.id || '',
                            dueDate: normalizedDraft.date,
                            dueTime: normalizedDraft.time,
                            due: `Até ${formatShortDate(normalizedDraft.date)} · ${normalizedDraft.time}`,
                          },
                        ],
                      }
                    : list,
                ),
              }
            : workspace,
        ),
      )
    }

    const savedDate = parseISODate(appointmentDraft.date)
    setCalendarCursor({ year: savedDate.getFullYear(), month: savedDate.getMonth() })
    setEditingAppointmentId(null)
    setAppointmentComposerOpen(false)
    setAppointmentDraft((current) => ({
      title: '',
      date: current.date,
      time: '09:00',
      person: '',
      type: 'Reunião',
      description: '',
      trelloWorkspaceId: '',
    }))
  }

  const selectCalendarDay = (date: Date) => {
    const dateValue = toISODate(date)
    setCalendarCursor({ year: date.getFullYear(), month: date.getMonth() })
    setEditingAppointmentId(null)
    setAppointmentComposerOpen(false)
    setAppointmentDraft((current) => ({ ...current, date: dateValue }))
  }

  const editAppointment = (appointment: Appointment) => {
    const date = parseISODate(appointment.date)
    setCalendarCursor({ year: date.getFullYear(), month: date.getMonth() })
    setEditingAppointmentId(appointment.id)
    setAppointmentComposerOpen(true)
    setAppointmentDraft({
      title: appointment.title,
      date: appointment.date,
      time: appointment.time === 'Dia todo' ? '09:00' : appointment.time,
      person: appointment.person,
      type: appointment.type,
      description: appointment.description || '',
      trelloWorkspaceId: appointment.source?.workspaceId || '',
    })
  }

  const removeAppointment = (appointmentId: string) => {
    const appointment = appointments.find((item) => item.id === appointmentId)
    if (appointment?.source?.type === 'trello') {
      setWorkspaces((current) =>
        current.map((workspace) =>
          workspace.id === appointment.source?.workspaceId
            ? {
                ...workspace,
                lists: workspace.lists.map((list) => ({
                  ...list,
                  cards: list.cards.filter((card) => card.id !== appointment.source?.cardId),
                })),
              }
            : workspace,
        ),
      )
    }
    setAppointments((current) => current.filter((appointment) => appointment.id !== appointmentId))
    if (editingAppointmentId === appointmentId) {
      setEditingAppointmentId(null)
      setAppointmentComposerOpen(false)
      setAppointmentDraft((current) => ({ ...current, title: '', person: '' }))
    }
  }

  const changeCalendarMonth = (offset: number) => {
    const date = new Date(calendarCursor.year, calendarCursor.month + offset, 1)
    setCalendarCursor({ year: date.getFullYear(), month: date.getMonth() })
  }

  const firstDayOffset = (new Date(calendarCursor.year, calendarCursor.month, 1).getDay() + 6) % 7
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarCursor.year, calendarCursor.month, index - firstDayOffset + 1)
    return {
      date,
      value: toISODate(date),
      isCurrentMonth: date.getMonth() === calendarCursor.month,
    }
  })
  const sortedAppointments = [...appointments].sort((first, second) =>
    `${first.date}T${first.time}`.localeCompare(`${second.date}T${second.time}`),
  )
  const selectedDayAppointments = sortedAppointments.filter(
    (appointment) => appointment.date === appointmentDraft.date,
  )
  const editingAppointment = appointments.find(
    (appointment) => appointment.id === editingAppointmentId,
  )
  const isEditingTrelloAppointment = editingAppointment?.source?.type === 'trello'

  const moveCard = (cardId: string, sourceListId: string, targetListId: string) => {
    if (sourceListId === targetListId) return
    updateActiveWorkspace((workspace) => {
      const card = workspace.lists
        .find((list) => list.id === sourceListId)
        ?.cards.find((item) => item.id === cardId)
      if (!card) return workspace
      return {
        ...workspace,
        lists: workspace.lists.map((list) => {
          if (list.id === sourceListId) {
            return { ...list, cards: list.cards.filter((item) => item.id !== cardId) }
          }
          if (list.id === targetListId) return { ...list, cards: [...list.cards, card] }
          return list
        }),
      }
    })
  }

  const moveCardByDirection = (listId: string, cardId: string, direction: -1 | 1) => {
    const listIndex = activeWorkspace.lists.findIndex((list) => list.id === listId)
    const targetList = activeWorkspace.lists[listIndex + direction]
    if (targetList) moveCard(cardId, listId, targetList.id)
  }

  const removeCard = (listId: string, cardId: string) => {
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      lists: workspace.lists.map((list) =>
        list.id === listId
          ? { ...list, cards: list.cards.filter((card) => card.id !== cardId) }
          : list,
      ),
    }))
    setAppointments((current) =>
      current.filter(
        (appointment) =>
          !(
            appointment.source?.type === 'trello' &&
            appointment.source.cardId === cardId &&
            appointment.source.workspaceId === activeWorkspace.id
          ),
      ),
    )
  }

  const updateListColor = (listId: string, color: string) => {
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      lists: workspace.lists.map((list) => (list.id === listId ? { ...list, color } : list)),
    }))
  }

  const createLabel = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('label-name') || '').trim()
    const color = String(form.get('label-color') || '#6B6133')
    if (!name) return
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      labels: [...workspace.labels, { id: makeId('label'), name, color }],
    }))
    event.currentTarget.reset()
  }

  const updateLabel = (labelId: string, changes: Partial<BoardLabel>) => {
    updateActiveWorkspace((workspace) => ({
      ...workspace,
      labels: workspace.labels.map((label) =>
        label.id === labelId ? { ...label, ...changes } : label,
      ),
    }))
  }

  const createInternalUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const subject = String(form.get('update-subject') || '').trim()
    const message = String(form.get('update-message') || '').trim()
    const audience = String(form.get('update-audience') || 'Toda a equipe')
    const type = String(form.get('update-type') || 'Mensagem') as InternalUpdate['type']
    if (!message) return
    const newUpdateId = makeId('update')
    onCreateUpdate({
      id: newUpdateId,
      author: 'Breno Monteiro',
      initials: 'BM',
      avatar: '/people/breno-monteiro.png',
      role: 'Administrador',
      time: 'Agora',
      subject: subject || `${type} para ${audience}`,
      message,
      audience,
      recipientCategory,
      type,
      completed: false,
      unread: false,
      replies: [],
    })
    setSelectedUpdateId(newUpdateId)
    setComposingMail(false)
    event.currentTarget.reset()
  }

  const submitMailReply = (event: FormEvent<HTMLFormElement>, updateId: string) => {
    event.preventDefault()
    const text = replyDraft.trim()
    if (!text) return
    onReplyUpdate(updateId, {
      id: makeId('reply'),
      author: 'Breno Monteiro',
      avatar: '/people/breno-monteiro.png',
      role: 'Administrador · Personal Trainer',
      time: 'Agora',
      message: text,
    })
    setReplyDraft('')
  }

  const filteredMailUpdates = updates.filter((update) => {
    if (mailFolder === 'inbox' && update.completed) return false
    if (mailFolder === 'unread' && !update.unread) return false
    if (
      mailFolder === 'students' &&
      update.recipientCategory !== 'aluno' &&
      update.role !== 'Aluno'
    )
      return false
    if (mailFolder === 'team' && (update.recipientCategory === 'aluno' || update.role === 'Aluno'))
      return false
    if (mailFolder === 'sent' && update.author !== 'Breno Monteiro') return false
    if (mailFolder === 'completed' && !update.completed) return false

    if (!mailSearch.trim()) return true
    const query = mailSearch.toLowerCase()
    return (
      (update.author ?? '').toLowerCase().includes(query) ||
      (update.audience ?? '').toLowerCase().includes(query) ||
      (update.subject ?? '').toLowerCase().includes(query) ||
      (update.message ?? '').toLowerCase().includes(query)
    )
  })

  const selectedMail =
    updates.find((update) => update.id === selectedUpdateId) ?? filteredMailUpdates[0] ?? updates[0]

  const replyRef = useRef<HTMLTextAreaElement>(null)

  const selectMail = (id: string) => {
    setSelectedUpdateId(id)
    setComposingMail(false)
    const target = updates.find((update) => update.id === id)
    if (target?.unread) onMarkUpdateRead(id, false)
  }

  /** Inbox triage: J/K move, E concludes, U toggles unread, R jumps to the reply box. */
  const onInboxKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (
      target.closest('input, textarea, select, [contenteditable="true"]') ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    )
      return
    const key = event.key.toLowerCase()
    const index = filteredMailUpdates.findIndex((update) => update.id === selectedMail?.id)
    if (key === 'j' || key === 'k') {
      event.preventDefault()
      const next =
        filteredMailUpdates[
          Math.max(0, Math.min(filteredMailUpdates.length - 1, index + (key === 'j' ? 1 : -1)))
        ]
      if (next) {
        selectMail(next.id)
        document.querySelector<HTMLElement>(`[data-mail-id="${next.id}"]`)?.focus()
      }
    } else if (key === 'e' && selectedMail) {
      event.preventDefault()
      onToggleUpdate(selectedMail.id)
    } else if (key === 'u' && selectedMail) {
      event.preventDefault()
      onMarkUpdateRead(selectedMail.id, !selectedMail.unread)
    } else if (key === 'r' && selectedMail) {
      event.preventDefault()
      replyRef.current?.focus()
    }
  }

  const inboxCount = updates.filter((update) => !update.completed).length
  const unreadMailCount = updates.filter((update) => update.unread).length
  const studentMailCount = updates.filter(
    (update) => update.recipientCategory === 'aluno' || update.role === 'Aluno',
  ).length
  const teamMailCount = updates.filter(
    (update) => update.recipientCategory !== 'aluno' && update.role !== 'Aluno',
  ).length
  const sentMailCount = updates.filter((update) => update.author === 'Breno Monteiro').length
  const completedMailCount = updates.filter((update) => update.completed).length

  const createContentGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const intern = String(form.get('goal-intern') || '').trim()
    const category = String(form.get('goal-category') || '').trim()
    const target = Math.max(1, Number(form.get('goal-target') || 1))
    const cadence = String(form.get('goal-cadence') || 'por semana')
    const description = String(form.get('goal-description') || '').trim()
    if (!intern || !category) return

    setContentGoals((current) => [
      ...current,
      {
        id: makeId('goal'),
        intern,
        category,
        target,
        completed: 0,
        selectedSlots: [],
        cadence,
        description: description || 'Meta de conteúdo definida pelo administrador.',
      },
    ])
    event.currentTarget.reset()
  }

  const updateGoalTarget = (goalId: string, increment: number) => {
    setContentGoals((current) =>
      current.map((goal) =>
        (() => {
          if (goal.id !== goalId) return goal
          const target = Math.max(1, goal.target + increment)
          const selectedSlots = goal.selectedSlots.slice(0, target)
          return {
            ...goal,
            target,
            selectedSlots,
            completed: selectedSlots.length,
          }
        })(),
      ),
    )
  }

  const toggleGoalDelivery = (goalId: string, deliveryIndex: number) => {
    setContentGoals((current) =>
      current.map((goal) => {
        if (goal.id !== goalId) return goal
        const isSelected = goal.selectedSlots.includes(deliveryIndex)
        if (!isSelected && goal.selectedSlots.length >= goal.target) return goal
        const selectedSlots = isSelected
          ? goal.selectedSlots.filter((slot) => slot !== deliveryIndex)
          : [...goal.selectedSlots, deliveryIndex].sort((first, second) => first - second)
        return { ...goal, selectedSlots, completed: selectedSlots.length }
      }),
    )
  }

  const logConversation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setConversationSaved(true)
    event.currentTarget.reset()
  }

  const markContentNoteSeen = (noteId: string) => {
    setContentNotes((current) =>
      current.map((note) => (note.id === noteId ? { ...note, seen: true } : note)),
    )
  }

  const replyToContentNote = (event: FormEvent<HTMLFormElement>, noteId: string) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const reply = String(form.get('note-reply') || '').trim()
    if (!reply) return
    setContentNotes((current) =>
      current.map((note) => (note.id === noteId ? { ...note, reply, seen: true } : note)),
    )
    setReplyingNoteId(null)
  }

  const totalGoalTarget = contentGoals.reduce((total, goal) => total + goal.target, 0)
  const totalGoalCompleted = contentGoals.reduce((total, goal) => total + goal.completed, 0)
  const monthlyProgress =
    totalGoalTarget === 0 ? 0 : Math.round((totalGoalCompleted / totalGoalTarget) * 100)
  const completedGoals = contentGoals.filter((goal) => goal.completed >= goal.target).length
  const unreadNotes = contentNotes.filter((note) => !note.seen).length

  const effectiveForms = onUpdateFormTemperature ? siteForms : localForms

  const handleTemperatureChange = (formId: string, nextTemp: LeadTemperature) => {
    if (onUpdateFormTemperature) {
      onUpdateFormTemperature(formId, nextTemp)
    } else {
      setLocalForms((current) =>
        current.map((item) => (item.id === formId ? { ...item, temperature: nextTemp } : item)),
      )
    }
  }

  return (
    <section className="internal-workspace">
      <h1 className="mb-4 text-[32px] leading-[38px] font-semibold tracking-[-0.02em] text-ink">
        Interno
      </h1>

      <Tabs
        label="Seções de Interno"
        className="mb-6"
        value={activeSection}
        onChange={setActiveSection}
        items={[
          { id: 'board', label: 'Trello' },
          {
            id: 'updates',
            label: 'Atualizações e Agenda',
            count: updates.filter((u) => u.unread).length,
          },
          { id: 'posts', label: 'Postagens' },
          {
            id: 'forms',
            label: 'Formulário',
            count: effectiveForms.filter((f) => f.temperature === 'Quente').length,
          },
        ]}
      />

      {activeSection === 'forms' && (
        <LeadsSpreadsheet
          forms={effectiveForms}
          onTemperatureChange={handleTemperatureChange}
          onCreate={(lead) =>
            onCreateFormSubmission
              ? onCreateFormSubmission(lead)
              : setLocalForms((current) => [lead, ...current])
          }
          onConvert={(lead) => onConvertLead?.(lead)}
          search={formSearchQuery}
          onSearchChange={setFormSearchQuery}
          filter={formTempFilter}
          onFilterChange={setFormTempFilter}
          composerOpen={newFormModalOpen}
          onComposerOpenChange={setNewFormModalOpen}
        />
      )}

      {activeSection === 'updates' && (
        <section className="updates-agenda-section">
          <section
            className="flex min-h-[560px] flex-col overflow-hidden rounded-card border border-line bg-surface lg:h-[calc(100dvh-210px)]"
            aria-label="Caixa de entrada e mensagens"
            onKeyDown={onInboxKeyDown}
          >
            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[200px_minmax(300px,380px)_1fr]">
              <aside
                className="flex flex-col gap-1 border-b border-line bg-subtle p-3 lg:border-r lg:border-b-0"
                aria-label="Pastas de mensagens"
              >
                <Button
                  variant="accent"
                  size="sm"
                  className="mb-2 w-full"
                  onClick={() => setComposingMail(true)}
                >
                  <Icon name="plus" className="size-4" /> Escrever
                </Button>
                <nav className="flex gap-1 overflow-x-auto lg:flex-col">
                  {(
                    [
                      ['inbox', 'Caixa de entrada', inboxCount],
                      ['unread', 'Não lidas', unreadMailCount],
                      ['students', 'Alunos', studentMailCount],
                      ['team', 'Equipe interna', teamMailCount],
                      ['sent', 'Enviados', sentMailCount],
                      ['completed', 'Concluídos', completedMailCount],
                    ] as const
                  ).map(([id, label, count]) => {
                    const active = mailFolder === id && !composingMail
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-current={active ? 'true' : undefined}
                        onClick={() => {
                          setMailFolder(id)
                          setComposingMail(false)
                        }}
                        className={cx(
                          'flex shrink-0 items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-[13px] whitespace-nowrap transition-colors',
                          active
                            ? 'bg-surface font-medium text-ink shadow-[0_0_0_1px_var(--border-default)]'
                            : 'text-ink-2 hover:bg-surface/70 hover:text-ink',
                        )}
                      >
                        {label}
                        <span
                          className={cx(
                            'text-xs tabular-nums',
                            id === 'unread' && count > 0
                              ? 'font-semibold text-brand'
                              : 'text-ink-3',
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </nav>
                <p className="mt-auto hidden pt-4 text-[11px] leading-5 text-ink-3 lg:block">
                  <Kbd>J</Kbd> <Kbd>K</Kbd> navegar · <Kbd>E</Kbd> concluir · <Kbd>U</Kbd> não lida
                  · <Kbd>R</Kbd> responder
                </p>
              </aside>

              <div className="flex min-h-0 flex-col border-b border-line lg:border-r lg:border-b-0">
                <label className="relative block border-b border-line p-2.5">
                  <span className="sr-only">Buscar mensagens</span>
                  <Icon
                    name="search"
                    className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-ink-3"
                  />
                  <input
                    type="search"
                    value={mailSearch}
                    onChange={(event) => setMailSearch(event.target.value)}
                    placeholder="Buscar pessoa, aluno ou assunto"
                    className="h-9 w-full rounded-control border border-line bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none"
                  />
                </label>
                <div
                  className="max-h-[420px] min-h-0 flex-1 overflow-y-auto lg:max-h-none"
                  role="list"
                  aria-label="Lista de mensagens"
                >
                  {filteredMailUpdates.length === 0 ? (
                    <p className="px-4 py-10 text-center text-sm text-ink-3">
                      Nenhuma conversa nesta pasta.
                    </p>
                  ) : (
                    filteredMailUpdates.map((update) => {
                      const isSelected = !composingMail && selectedMail?.id === update.id
                      const replyCount = update.replies?.length ?? 0
                      const origin = mailOrigin(update)
                      return (
                        <button
                          key={update.id}
                          type="button"
                          role="listitem"
                          aria-current={isSelected ? 'true' : undefined}
                          data-mail-id={update.id}
                          className={cx(
                            'relative flex w-full gap-3 border-b border-line-subtle px-4 py-3 text-left transition-colors',
                            isSelected ? 'bg-brand-soft/50' : 'hover:bg-subtle',
                            update.completed && 'opacity-60',
                          )}
                          onClick={() => selectMail(update.id)}
                        >
                          {isSelected && (
                            <span
                              aria-hidden="true"
                              className="absolute inset-y-0 left-0 w-0.5 bg-brand"
                            />
                          )}
                          <img
                            src={update.avatar}
                            alt=""
                            className="size-8 shrink-0 rounded-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1.5">
                              <span
                                className={cx(
                                  'truncate text-sm',
                                  update.unread ? 'font-semibold text-ink' : 'text-ink-2',
                                )}
                              >
                                {update.author}
                              </span>
                              <span title={origin.label} className="shrink-0 text-ink-3">
                                <Icon name={origin.icon} className="size-3.5" />
                                <span className="sr-only">{origin.label}</span>
                              </span>
                              <time className="ml-auto shrink-0 text-[11px] text-ink-3">
                                {update.time}
                              </time>
                            </p>
                            <p
                              className={cx(
                                'truncate text-[13px]',
                                update.unread ? 'font-medium text-ink' : 'text-ink-2',
                              )}
                            >
                              {update.subject || `${update.type} · ${update.audience}`}
                            </p>
                            <p className="flex items-center gap-2 text-xs text-ink-3">
                              <span className="truncate">{update.message}</span>
                              {replyCount > 0 && (
                                <span className="shrink-0 tabular-nums">· {replyCount}</span>
                              )}
                            </p>
                          </div>
                          {update.unread && (
                            <span
                              aria-label="Não lida"
                              className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
                            />
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="flex min-h-[420px] min-w-0 flex-col">
                {composingMail ? (
                  <form className="flex min-h-0 flex-1 flex-col" onSubmit={createInternalUpdate}>
                    <header className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
                      <h3 className="text-[15px] font-semibold text-ink">
                        Nova mensagem ou tarefa
                      </h3>
                      <Button size="sm" variant="ghost" onClick={() => setComposingMail(false)}>
                        Cancelar
                      </Button>
                    </header>
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="block text-xs font-medium text-ink-2">
                          Enviar para
                          <select
                            value={recipientCategory}
                            onChange={(event) =>
                              setRecipientCategory(event.target.value as 'equipe' | 'aluno')
                            }
                            className={mailField}
                          >
                            <option value="equipe">Equipe / colaboradores</option>
                            <option value="aluno">Aluno da consultoria</option>
                          </select>
                        </label>
                        <label className="block text-xs font-medium text-ink-2">
                          Destinatário
                          {recipientCategory === 'equipe' ? (
                            <select
                              name="update-audience"
                              defaultValue="Toda a equipe"
                              className={mailField}
                            >
                              <option>Toda a equipe</option>
                              <option>Grupo Nutrição</option>
                              <option>Grupo Treino</option>
                              <option>Administradores</option>
                              <option>Gerentes</option>
                              <option>Renata Alves (Nutrição)</option>
                              <option>Gustavo Lima (Gerente)</option>
                              <option>Paula Nunes (Admin)</option>
                              <option>Marina Lopes (Estagiária)</option>
                              <option>Felipe Santos (Estagiário)</option>
                            </select>
                          ) : (
                            <select
                              name="update-audience"
                              defaultValue="Lucas Andrade (Aluno)"
                              className={mailField}
                            >
                              <option>Lucas Andrade (Aluno)</option>
                              <option>Camila Rocha (Aluna)</option>
                              <option>Rafael Souza (Aluno)</option>
                              <option>Juliana Costa (Aluna)</option>
                              <option>Pedro Lima (Aluno)</option>
                              <option>Aline Moraes (Aluna)</option>
                              <option>Bruno Martins (Aluno)</option>
                              <option>Todos os alunos ativos</option>
                            </select>
                          )}
                        </label>
                        <label className="block text-xs font-medium text-ink-2">
                          Categoria
                          <select name="update-type" defaultValue="Mensagem" className={mailField}>
                            <option>Mensagem</option>
                            <option>Tarefa</option>
                            <option>Lembrete</option>
                          </select>
                        </label>
                      </div>
                      <label className="block text-xs font-medium text-ink-2">
                        Assunto
                        <input
                          name="update-subject"
                          required
                          placeholder="Ex.: ajuste no plano alimentar"
                          className={mailField}
                        />
                      </label>
                      <label className="block text-xs font-medium text-ink-2">
                        Mensagem
                        <textarea
                          name="update-message"
                          rows={8}
                          required
                          placeholder="Escreva a orientação ou a tarefa"
                          onKeyDown={submitOnModEnter}
                          className={cx(mailField, 'h-auto resize-none py-2')}
                        />
                      </label>
                    </div>
                    <footer className="flex items-center justify-between gap-3 border-t border-line px-6 py-3">
                      <span className="text-xs text-ink-3">
                        <Kbd>⌘</Kbd> <Kbd>Enter</Kbd> envia
                      </span>
                      <Button type="submit" variant="accent">
                        Enviar
                      </Button>
                    </footer>
                  </form>
                ) : selectedMail ? (
                  <article className="flex min-h-0 flex-1 flex-col">
                    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-6 py-4">
                      <div className="min-w-0">
                        <h3 className="text-xl leading-7 font-semibold text-ink">
                          {selectedMail.subject ||
                            `${selectedMail.type} · ${selectedMail.audience}`}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <Badge>{selectedMail.type}</Badge>
                          <Badge>{selectedMail.role}</Badge>
                          {selectedMail.completed && (
                            <Badge tone="success" dot>
                              Concluído
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Atalho: U"
                          onClick={() => onMarkUpdateRead(selectedMail.id, !selectedMail.unread)}
                        >
                          {selectedMail.unread ? 'Marcar como lida' : 'Marcar não lida'}
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedMail.completed ? 'secondary' : 'primary'}
                          title="Atalho: E"
                          onClick={() => onToggleUpdate(selectedMail.id)}
                        >
                          {selectedMail.completed ? (
                            'Reabrir'
                          ) : (
                            <>
                              <Icon name="check" className="size-4" /> Concluir
                            </>
                          )}
                        </Button>
                      </div>
                    </header>

                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
                      {/\(MFIT\)/.test(selectedMail.subject) && (
                        <div className="flex items-center gap-3 rounded-lg border border-line bg-subtle px-3 py-2">
                          <span
                            aria-hidden="true"
                            className="grid size-8 place-items-center rounded-md bg-brand-soft text-brand"
                          >
                            <Icon name="training" className="size-4" />
                          </span>
                          <div className="min-w-0 text-xs">
                            <p className="font-semibold text-ink">
                              {selectedMail.subject.split('·').slice(1).join('·').trim() ||
                                'Treino'}
                            </p>
                            <p className="text-ink-3">
                              {selectedMail.subject
                                .split('·')[0]
                                .replace('Comentário no ', '')
                                .trim()}
                            </p>
                          </div>
                        </div>
                      )}
                      {[
                        {
                          id: selectedMail.id,
                          author: selectedMail.author,
                          avatar: selectedMail.avatar,
                          role: `Para: ${selectedMail.audience} · ${selectedMail.role}`,
                          time: selectedMail.time,
                          message: selectedMail.message,
                          own: selectedMail.author === 'Breno Monteiro',
                        },
                        ...(selectedMail.replies ?? []).map((reply) => ({
                          ...reply,
                          own: reply.author === 'Breno Monteiro' || selectedMail.role === 'Aluno',
                        })),
                      ].map((message, index) => (
                        <section
                          key={message.id}
                          className={cx(
                            'max-w-[640px] rounded-xl border px-4 py-3',
                            index > 0 && message.own
                              ? 'ml-auto border-brand/15 bg-brand-soft/60'
                              : 'border-line bg-surface',
                          )}
                        >
                          <header className="flex items-center gap-2.5">
                            <img
                              src={message.avatar}
                              alt=""
                              className="size-7 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-ink">
                                {message.author}
                              </p>
                              <p className="truncate text-[11px] text-ink-3">{message.role}</p>
                            </div>
                            <time className="shrink-0 text-[11px] text-ink-3">{message.time}</time>
                          </header>
                          <p className="mt-2 text-sm leading-6 whitespace-pre-line text-ink">
                            {message.message}
                          </p>
                        </section>
                      ))}
                    </div>

                    <form
                      className="border-t border-line px-6 py-3"
                      onSubmit={(event) => submitMailReply(event, selectedMail.id)}
                    >
                      <div className="mb-2 flex flex-wrap gap-1.5" aria-label="Respostas rápidas">
                        {quickReplies.map((text) => (
                          <button
                            key={text}
                            type="button"
                            onClick={() => {
                              setReplyDraft(text)
                              replyRef.current?.focus()
                            }}
                            className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-2 transition-colors hover:border-brand/40 hover:text-ink"
                          >
                            {text}
                          </button>
                        ))}
                      </div>
                      <label htmlFor="mail-reply" className="sr-only">
                        Responder para {selectedMail.author}
                      </label>
                      <textarea
                        id="mail-reply"
                        ref={replyRef}
                        rows={2}
                        value={replyDraft}
                        onChange={(event) => setReplyDraft(event.target.value)}
                        onKeyDown={submitOnModEnter}
                        placeholder={`Responder para ${selectedMail.author}`}
                        className="w-full resize-none rounded-control border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none"
                      />
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-xs text-ink-3">
                          <Kbd>⌘</Kbd> <Kbd>Enter</Kbd> envia · fica registrada na conversa
                        </span>
                        <Button
                          size="sm"
                          type="submit"
                          variant="accent"
                          disabled={!replyDraft.trim()}
                        >
                          Responder
                        </Button>
                      </div>
                    </form>
                  </article>
                ) : (
                  <p className="m-auto px-6 text-center text-sm text-ink-3">
                    Selecione uma conversa ou escreva uma mensagem.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="internal-calendar">
            <header className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
              <h2 className="mr-auto text-xl leading-7 font-semibold text-ink">
                Agenda da equipe{' '}
                <span className="text-sm font-normal text-ink-3">
                  · {appointments.length}{' '}
                  {appointments.length === 1 ? 'compromisso' : 'compromissos'}
                </span>
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={calendarView === 'semana' ? 'Semana anterior' : 'Mês anterior'}
                  onClick={() =>
                    calendarView === 'semana' ? shiftWeek(-7) : changeCalendarMonth(-1)
                  }
                >
                  <Icon name="chevronRight" className="size-4 rotate-180" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => todayIso && selectCalendarDay(parseISODate(todayIso))}
                >
                  Hoje
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={calendarView === 'semana' ? 'Próxima semana' : 'Próximo mês'}
                  onClick={() =>
                    calendarView === 'semana' ? shiftWeek(7) : changeCalendarMonth(1)
                  }
                >
                  <Icon name="chevronRight" className="size-4" />
                </Button>
              </div>
              <Segmented
                label="Visualização da agenda"
                size="sm"
                items={[
                  { id: 'semana' as const, label: 'Semana' },
                  { id: 'mes' as const, label: 'Mês' },
                ]}
                value={calendarView}
                onChange={setCalendarView}
              />
            </header>

            <div className="internal-calendar-layout">
              {calendarView === 'semana' ? (
                <WeekCalendar
                  appointments={appointments as CalendarAppointment[]}
                  selectedDate={appointmentDraft.date}
                  today={todayIso}
                  onSelectDate={(iso) => selectCalendarDay(parseISODate(iso))}
                  onEdit={(item) => {
                    const appointment = appointments.find((entry) => entry.id === item.id)
                    if (appointment) editAppointment(appointment)
                  }}
                  onCreateAt={(iso, time) => {
                    selectCalendarDay(parseISODate(iso))
                    setEditingAppointmentId(null)
                    setAppointmentComposerOpen(true)
                    setAppointmentDraft((current) => ({
                      ...current,
                      date: iso,
                      time,
                      title: '',
                      person: '',
                      type: 'Reunião',
                      description: '',
                      trelloWorkspaceId: '',
                    }))
                  }}
                />
              ) : (
                <div className="calendar-month">
                  <header>
                    <button
                      type="button"
                      className="hidden"
                      onClick={() => changeCalendarMonth(-1)}
                      aria-label="Mês anterior"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    <h3>{formatMonth(calendarCursor.year, calendarCursor.month)}</h3>
                    <button
                      type="button"
                      className="hidden"
                      onClick={() => changeCalendarMonth(1)}
                      aria-label="Próximo mês"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </header>
                  <div className="calendar-weekdays" aria-hidden="true">
                    {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                  <div className="calendar-grid">
                    {calendarDays.map(({ date, value, isCurrentMonth }) => {
                      const dayAppointments = appointments
                        .filter((appointment) => appointment.date === value)
                        .sort((first, second) => first.time.localeCompare(second.time))
                      return (
                        <button
                          key={value}
                          type="button"
                          className={`${isCurrentMonth ? '' : 'outside-month'} ${
                            appointmentDraft.date === value ? 'selected' : ''
                          }`}
                          onClick={() => selectCalendarDay(date)}
                          aria-label={`Selecionar ${date.toLocaleDateString('pt-BR')}`}
                        >
                          <span className="calendar-day-number">{date.getDate()}</span>
                          <span className="calendar-day-events">
                            {dayAppointments.slice(0, 2).map((appointment) => (
                              <small key={appointment.id}>
                                <b>{appointment.time}</b> {appointment.title}
                              </small>
                            ))}
                            {dayAppointments.length > 2 && (
                              <small className="calendar-more">
                                +{dayAppointments.length - 2} compromisso
                              </small>
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <aside className="calendar-sidebar">
                <section className="calendar-day-detail">
                  <header>
                    <div>
                      <span>DIA SELECIONADO</span>
                      <h3>{formatShortDate(appointmentDraft.date)}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAppointmentId(null)
                        setAppointmentComposerOpen(true)
                        setAppointmentDraft((current) => ({
                          ...current,
                          title: '',
                          person: '',
                          time: '09:00',
                          type: 'Reunião',
                          description: '',
                          trelloWorkspaceId: '',
                        }))
                      }}
                    >
                      Novo compromisso
                    </button>
                  </header>
                  <div>
                    {selectedDayAppointments.length === 0 ? (
                      <p>Nenhum compromisso neste dia.</p>
                    ) : (
                      selectedDayAppointments.map((appointment) => (
                        <article key={appointment.id}>
                          <header>
                            <div>
                              <strong>{appointment.title}</strong>
                              <span>
                                {appointment.time} · {appointment.person}
                              </span>
                            </div>
                            <small>{appointment.type}</small>
                          </header>
                          <p>
                            {appointment.description ||
                              `${appointment.type} com ${appointment.person}.`}
                          </p>
                          <footer>
                            {appointment.source?.type === 'trello' ? (
                              <>
                                <span>Sincronizado com o Trello</span>
                                <button type="button" onClick={() => editAppointment(appointment)}>
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeAppointment(appointment.id)}
                                >
                                  Excluir
                                </button>
                              </>
                            ) : (
                              <>
                                <button type="button" onClick={() => editAppointment(appointment)}>
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeAppointment(appointment.id)}
                                >
                                  Excluir
                                </button>
                              </>
                            )}
                          </footer>
                        </article>
                      ))
                    )}
                  </div>
                </section>

                {(appointmentComposerOpen || editingAppointmentId) && (
                  <form className="appointment-form" onSubmit={saveAppointment}>
                    <header>
                      <span>
                        {editingAppointmentId ? 'EDITAR COMPROMISSO' : 'NOVO COMPROMISSO'}
                      </span>
                      <h3>
                        {editingAppointmentId
                          ? 'Atualize os detalhes'
                          : `Agendar em ${formatShortDate(appointmentDraft.date)}`}
                      </h3>
                    </header>
                    <label>
                      <span>Título</span>
                      <input
                        value={appointmentDraft.title}
                        onChange={(event) =>
                          setAppointmentDraft((current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        placeholder="Ex.: Reunião de alinhamento"
                        required
                      />
                    </label>
                    <label>
                      <span>Participante</span>
                      <input
                        value={appointmentDraft.person}
                        onChange={(event) =>
                          setAppointmentDraft((current) => ({
                            ...current,
                            person: event.target.value,
                          }))
                        }
                        placeholder="Nome do participante"
                        readOnly={isEditingTrelloAppointment}
                        required
                      />
                    </label>
                    <div>
                      <label>
                        <span>Data</span>
                        <input
                          type="date"
                          value={appointmentDraft.date}
                          onChange={(event) => {
                            const nextDate = event.target.value
                            setAppointmentDraft((current) => ({ ...current, date: nextDate }))
                            if (nextDate) {
                              const date = parseISODate(nextDate)
                              setCalendarCursor({
                                year: date.getFullYear(),
                                month: date.getMonth(),
                              })
                            }
                          }}
                          required
                        />
                      </label>
                      <label>
                        <span>Horário</span>
                        <input
                          type="time"
                          value={appointmentDraft.time}
                          onChange={(event) =>
                            setAppointmentDraft((current) => ({
                              ...current,
                              time: event.target.value,
                            }))
                          }
                          required
                        />
                      </label>
                    </div>
                    <label>
                      <span>Tipo</span>
                      <select
                        value={appointmentDraft.type}
                        onChange={(event) =>
                          setAppointmentDraft((current) => ({
                            ...current,
                            type: event.target.value,
                          }))
                        }
                        disabled={isEditingTrelloAppointment}
                      >
                        <option>Reunião</option>
                        <option>Avaliação</option>
                        <option>Reavaliação</option>
                        <option>Consulta</option>
                        <option>Lembrete</option>
                        <option>Prazo do Trello</option>
                      </select>
                    </label>
                    <label>
                      <span>Enviar também para o Trello</span>
                      <select
                        value={appointmentDraft.trelloWorkspaceId}
                        onChange={(event) =>
                          setAppointmentDraft((current) => ({
                            ...current,
                            trelloWorkspaceId: event.target.value,
                          }))
                        }
                        disabled={isEditingTrelloAppointment}
                      >
                        <option value="">Somente Agenda</option>
                        {workspaces.map((workspace) => (
                          <option key={workspace.id} value={workspace.id}>
                            {workspace.title}
                          </option>
                        ))}
                      </select>
                      <small className="field-help">
                        Selecione uma área para criar um cartão vinculado automaticamente.
                      </small>
                    </label>
                    <label>
                      <span>Observação</span>
                      <textarea
                        value={appointmentDraft.description || ''}
                        onChange={(event) =>
                          setAppointmentDraft((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Inclua detalhes importantes sobre o compromisso."
                        rows={3}
                      />
                    </label>
                    {isEditingTrelloAppointment && (
                      <p className="trello-sync-notice">
                        Título, observação, data e horário serão atualizados também no cartão do
                        Trello.
                      </p>
                    )}
                    <div className="appointment-form-actions">
                      <button type="submit">
                        {editingAppointmentId ? 'Salvar alterações' : 'Marcar compromisso'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAppointmentId(null)
                          setAppointmentComposerOpen(false)
                          setAppointmentDraft((current) => ({
                            ...current,
                            title: '',
                            person: '',
                            description: '',
                            trelloWorkspaceId: '',
                          }))
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
                <section
                  aria-labelledby="upcoming-title"
                  className="mt-5 border-t border-line px-4 pt-4 pb-4"
                >
                  {(() => {
                    const upcoming = sortedAppointments.filter(
                      (item) => !todayIso || item.date >= todayIso,
                    )
                    const past = sortedAppointments.length - upcoming.length
                    const list = showPastAppointments ? sortedAppointments : upcoming
                    const groups = list.reduce<{ date: string; items: Appointment[] }[]>(
                      (acc, item) => {
                        const last = acc[acc.length - 1]
                        if (last?.date === item.date) last.items.push(item)
                        else acc.push({ date: item.date, items: [item] })
                        return acc
                      },
                      [],
                    )
                    const dayLabel = (iso: string) => {
                      if (iso === todayIso) return 'Hoje'
                      if (todayIso) {
                        const next = parseISODate(todayIso)
                        next.setDate(next.getDate() + 1)
                        if (toISODate(next) === iso) return 'Amanhã'
                      }
                      return formatAppointmentDate(iso)
                    }
                    return (
                      <>
                        <header className="flex items-baseline justify-between gap-3">
                          <h3 id="upcoming-title" className="text-[15px] font-semibold text-ink">
                            Próximos compromissos{' '}
                            <span className="text-xs font-normal text-ink-3 tabular-nums">
                              {upcoming.length}
                            </span>
                          </h3>
                          {past > 0 && (
                            <button
                              type="button"
                              onClick={() => setShowPastAppointments((value) => !value)}
                              className="text-xs font-medium text-brand hover:underline"
                            >
                              {showPastAppointments
                                ? 'Ocultar anteriores'
                                : `Ver anteriores (${past})`}
                            </button>
                          )}
                        </header>
                        {groups.length === 0 ? (
                          <p className="py-6 text-center text-sm text-ink-3">
                            Nada marcado daqui pra frente. Clique num horário da agenda para criar.
                          </p>
                        ) : (
                          <div className="mt-2 space-y-3">
                            {groups.map((group) => (
                              <div key={group.date}>
                                <p
                                  className={cx(
                                    'text-xs font-semibold first-letter:uppercase',
                                    group.date === todayIso ? 'text-brand' : 'text-ink-3',
                                  )}
                                >
                                  {dayLabel(group.date)}
                                </p>
                                <ul className="mt-1 divide-y divide-line-subtle">
                                  {group.items.map((appointment) => (
                                    <li
                                      key={appointment.id}
                                      className="group/appt flex items-center gap-3 py-2"
                                    >
                                      <span className="w-14 shrink-0 text-xs font-medium whitespace-nowrap text-ink-2 tabular-nums">
                                        {appointment.time}
                                      </span>
                                      <span
                                        aria-hidden="true"
                                        className={cx(
                                          'h-8 w-0.5 shrink-0 rounded-full',
                                          agendaTypeColor[appointment.type as AgendaType] ??
                                            'bg-ink-3',
                                        )}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => editAppointment(appointment)}
                                        className="min-w-0 flex-1 text-left"
                                      >
                                        <span className="block truncate text-sm font-medium text-ink group-hover/appt:text-brand">
                                          {appointment.title}
                                        </span>
                                        <span className="block truncate text-xs text-ink-3">
                                          {appointment.person} · {appointment.type}
                                          {appointment.source?.type === 'trello' ? ' · Trello' : ''}
                                        </span>
                                      </button>
                                      <Menu
                                        label={`Ações de ${appointment.title}`}
                                        items={[
                                          {
                                            id: 'editar',
                                            label: 'Editar',
                                            onSelect: () => editAppointment(appointment),
                                          },
                                          {
                                            id: 'excluir',
                                            label: 'Excluir',
                                            description:
                                              appointment.source?.type === 'trello'
                                                ? 'Também remove a data do cartão no Trello'
                                                : undefined,
                                            danger: true,
                                            onSelect: () => removeAppointment(appointment.id),
                                          },
                                        ]}
                                        trigger={({ open, toggle, id }) => (
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            aria-label={`Ações de ${appointment.title}`}
                                            aria-haspopup="menu"
                                            aria-expanded={open}
                                            aria-controls={open ? id : undefined}
                                            onClick={toggle}
                                            className="opacity-0 group-hover/appt:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
                                          >
                                            <Icon name="dots" className="size-4" />
                                          </Button>
                                        )}
                                      />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </section>
              </aside>
            </div>
          </section>
        </section>
      )}

      {activeSection === 'posts' && (
        <section className="space-y-5" aria-label="Postagens">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl leading-7 font-semibold text-ink">Postagens</h2>
              <p className="mt-0.5 text-sm text-ink-2">
                Metas da equipe de social media e o que já foi entregue na semana.
              </p>
            </div>
            <Segmented
              label="Visões de postagens"
              items={[
                { id: 'week' as const, label: 'Semana' },
                { id: 'month' as const, label: 'Mês' },
                { id: 'goals' as const, label: 'Metas' },
                {
                  id: 'notes' as const,
                  label: 'Anotações',
                  ...(unreadNotes > 0 ? { count: unreadNotes } : {}),
                },
              ]}
              value={postView}
              onChange={setPostView}
            />
          </header>

          <InternProgress goals={contentGoals} />

          <div className="content-planner-body">
            {postView === 'week' && (
              <section className="content-week-view">
                <header className="content-view-heading">
                  <div>
                    <span>SEMANA ATUAL</span>
                    <h3>Entregas de 03 a 09 de novembro</h3>
                    <p>Visão administrativa das entregas registradas pelos estagiários.</p>
                  </div>
                  <strong>
                    {totalGoalCompleted} de {totalGoalTarget} entregas
                  </strong>
                </header>

                <div className="week-navigation">
                  <button type="button" aria-label="Semana anterior">
                    ‹
                  </button>
                  <div>
                    <span>NOVEMBRO · SEMANA 1 DE 4</span>
                    <strong>03/11 a 09/11</strong>
                  </div>
                  <button type="button" aria-label="Próxima semana">
                    ›
                  </button>
                </div>

                <div className="weekly-progress-overview">
                  <div>
                    <strong>{completedGoals}</strong>
                    <span>de {contentGoals.length} metas completas nesta semana</span>
                  </div>
                  <span>{monthlyProgress}% do combinado realizado</span>
                  <progress value={totalGoalCompleted} max={Math.max(totalGoalTarget, 1)} />
                  <footer>
                    {contentGoals.map((goal) => (
                      <span
                        key={goal.id}
                        className={goal.completed >= goal.target ? 'complete' : ''}
                      >
                        {goal.completed >= goal.target && '✓ '}
                        {goal.category}
                      </span>
                    ))}
                  </footer>
                </div>

                <p className="tracking-helper">
                  Marque cada entrega quando fizer. O painel atualiza o progresso automaticamente.
                </p>
                <div className="weekly-tracking-grid">
                  {contentGoals.map((goal) => {
                    const isStories = goal.category.toLowerCase().includes('stories')
                    const deliveryCount = isStories ? 7 : goal.target
                    return (
                      <article key={goal.id}>
                        <header>
                          <div>
                            <span>{goal.category}</span>
                            <small>
                              Meta: {goal.target} {goal.cadence}
                            </small>
                          </div>
                          <strong>
                            {goal.completed} <small>de {goal.target}</small>
                          </strong>
                        </header>
                        <div className={isStories ? 'day-deliveries' : 'goal-deliveries'}>
                          {Array.from({ length: deliveryCount }, (_, index) => (
                            <button
                              key={index}
                              type="button"
                              className={goal.selectedSlots.includes(index) ? 'complete' : ''}
                              onClick={() => toggleGoalDelivery(goal.id, index)}
                            >
                              <i>{goal.selectedSlots.includes(index) ? '✓' : ''}</i>
                              <span>
                                {isStories
                                  ? ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'][index]
                                  : `Entrega ${index + 1}`}
                              </span>
                            </button>
                          ))}
                        </div>
                        <progress value={goal.completed} max={goal.target} />
                        <footer>
                          {goal.completed >= goal.target
                            ? 'Meta batida'
                            : `Faltam ${goal.target - goal.completed}`}
                        </footer>
                      </article>
                    )
                  })}
                </div>
                <label className="week-reflection">
                  <span>Como foi a semana</span>
                  <textarea placeholder="O que funcionou, o que travou, alguma ideia nova..." />
                </label>
              </section>
            )}

            {postView === 'month' && (
              <section className="content-month-view">
                <header className="content-view-heading">
                  <div>
                    <span>RESUMO DO MÊS</span>
                    <h3>{currentMonthLabel}</h3>
                    <p>Leitura gerencial do desempenho consolidado da equipe.</p>
                  </div>
                  <strong>{monthlyProgress}% concluído</strong>
                </header>

                <nav className="month-selector" aria-label="Selecionar mês">
                  {monthSelectorLabels.map((month, index) => (
                    <button key={month} type="button" className={index === 1 ? 'active' : ''}>
                      {month}
                    </button>
                  ))}
                </nav>

                <div className="management-kpis month-management-kpis">
                  <article>
                    <span>Semanas completas</span>
                    <strong>
                      1 <small>de 4 semanas</small>
                    </strong>
                    <progress value={1} max={4} />
                  </article>
                  <article>
                    <span>Social selling</span>
                    <strong>
                      3 <small>de 4 vezes</small>
                    </strong>
                    <progress value={3} max={4} />
                  </article>
                  <article>
                    <span>Stories</span>
                    <strong>
                      8 <small>de 12 dias</small>
                    </strong>
                    <progress value={8} max={12} />
                  </article>
                  <article>
                    <span>Feed</span>
                    <strong>
                      2 <small>de 4 posts</small>
                    </strong>
                    <progress value={2} max={4} />
                  </article>
                </div>

                <div className="month-week-list">
                  <h4>Semana a semana</h4>
                  {[
                    ['03/11 a 09/11', 'Em andamento'],
                    ['10/11 a 16/11', 'Ainda não começou'],
                    ['17/11 a 23/11', 'Ainda não começou'],
                    ['24/11 a 30/11', 'Ainda não começou'],
                  ].map(([period, status], index) => (
                    <button key={period} type="button">
                      <strong>{period}</strong>
                      <span>
                        {contentGoals.map((goal) => (
                          <small key={goal.id} className={index === 0 ? 'active' : ''}>
                            {goal.category}
                          </small>
                        ))}
                      </span>
                      <i>{status}</i>
                      <b>›</b>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {postView === 'goals' && (
              <section className="content-goals-view">
                <header className="content-view-heading">
                  <div>
                    <span>CONTROLE DO ADMINISTRADOR</span>
                    <h3>Metas de cada semana</h3>
                    <p>Cadastre o combinado para cada estagiário e ajuste a quantidade esperada.</p>
                  </div>
                  <strong>{contentGoals.length} metas ativas</strong>
                </header>

                <div className="goal-reference-grid">
                  {contentGoals.map((goal) => (
                    <article key={goal.id}>
                      <span>{goal.category}</span>
                      <strong>{goal.target}</strong>
                      <small>{goal.cadence}</small>
                      <p>{goal.description}</p>
                    </article>
                  ))}
                </div>

                <section className="goal-adjustments">
                  <header>
                    <div>
                      <span>AJUSTAR METAS</span>
                      <h4>Volumes combinados</h4>
                    </div>
                    <small>Aparece para toda a equipe</small>
                  </header>
                  <div>
                    {contentGoals.map((goal) => (
                      <article key={goal.id}>
                        <span>{goal.category}</span>
                        <div>
                          <button type="button" onClick={() => updateGoalTarget(goal.id, -1)}>
                            −
                          </button>
                          <strong>{goal.target}</strong>
                          <button type="button" onClick={() => updateGoalTarget(goal.id, 1)}>
                            +
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <details className="new-goal-details">
                  <summary>Adicionar outra meta</summary>
                  <form className="goal-composer" onSubmit={createContentGoal}>
                    <header>
                      <span>NOVA META</span>
                      <h4>Definir entrega</h4>
                    </header>
                    <label>
                      <span>Estagiário</span>
                      <select name="goal-intern" defaultValue="Marina Lopes">
                        <option>Marina Lopes</option>
                        <option>Felipe Santos</option>
                        <option>Renata Alves</option>
                        <option>João Pedro</option>
                      </select>
                    </label>
                    <label>
                      <span>Categoria</span>
                      <input name="goal-category" placeholder="Ex.: Stories" required />
                    </label>
                    <div>
                      <label>
                        <span>Quantidade</span>
                        <input name="goal-target" type="number" min="1" defaultValue="1" required />
                      </label>
                      <label>
                        <span>Frequência</span>
                        <select name="goal-cadence" defaultValue="por semana">
                          <option>por semana</option>
                          <option>por dia</option>
                          <option>por mês</option>
                        </select>
                      </label>
                    </div>
                    <label>
                      <span>Orientação</span>
                      <textarea
                        name="goal-description"
                        rows={3}
                        placeholder="Explique o que deve ser produzido e o resultado esperado."
                      />
                    </label>
                    <button type="submit">Cadastrar meta</button>
                  </form>
                </details>
              </section>
            )}

            {postView === 'notes' && (
              <section className="content-notes-view">
                <header className="content-view-heading">
                  <div>
                    <span>RETORNO DOS ESTAGIÁRIOS</span>
                    <h3>Anotações da semana</h3>
                    <p>Revise os relatos da equipe, responda e confirme a leitura.</p>
                  </div>
                  <strong>{unreadNotes} não lidas</strong>
                </header>

                <form className="conversation-form" onSubmit={logConversation}>
                  <header>
                    <div>
                      <span>REGISTRAR UMA CONVERSA</span>
                      <h4>Anotação de acompanhamento</h4>
                    </div>
                    {conversationSaved && <strong>Salvo nesta demonstração</strong>}
                  </header>
                  <div className="conversation-options">
                    <label>
                      <span>Data</span>
                      <input type="date" name="conversation-date" defaultValue="2026-11-06" />
                    </label>
                    <fieldset>
                      <legend>Tipo</legend>
                      {['Semanal', 'Quinzenal', 'Mensal', 'Trimestral'].map((type) => (
                        <label key={type}>
                          <input type="radio" name="conversation-type" value={type} />
                          <span>{type}</span>
                        </label>
                      ))}
                    </fieldset>
                  </div>
                  <fieldset>
                    <legend>Com quem</legend>
                    {['Breno', 'Marina', 'Felipe', 'Equipe completa'].map((person) => (
                      <label key={person}>
                        <input type="radio" name="conversation-person" value={person} />
                        <span>{person}</span>
                      </label>
                    ))}
                  </fieldset>
                  <label>
                    <span>Como foi</span>
                    <textarea
                      name="conversation-summary"
                      rows={4}
                      placeholder="Pontos principais da conversa."
                      required
                    />
                  </label>
                  <label>
                    <span>Próximos passos</span>
                    <textarea
                      name="conversation-next"
                      rows={4}
                      placeholder="O que fica combinado até o próximo encontro."
                    />
                  </label>
                  <button type="submit">Salvar anotação</button>
                </form>

                <div className="notes-inbox-layout">
                  <aside className="notes-inbox-summary">
                    <span>CAIXA DE ENTRADA</span>
                    <h4>Acompanhamento da equipe</h4>
                    <p>
                      As anotações são criadas pelos estagiários. Como Admin, você pode confirmar a
                      leitura ou enviar uma orientação.
                    </p>
                    <div>
                      <strong>{contentNotes.length}</strong>
                      <small>anotações recebidas</small>
                    </div>
                    <div>
                      <strong>{unreadNotes}</strong>
                      <small>aguardando leitura</small>
                    </div>
                  </aside>

                  <div className="notes-feed">
                    {contentNotes.length === 0 ? (
                      <p>Nenhuma anotação registrada nesta sessão.</p>
                    ) : (
                      contentNotes.map((note) => (
                        <article key={note.id} className={note.seen ? 'seen' : 'unread'}>
                          <header>
                            <div>
                              <strong>{note.intern}</strong>
                              <span>{formatShortDate(note.date)}</span>
                            </div>
                            <div className="note-badges">
                              {!note.seen && <span>Nova</span>}
                              <small data-status={note.status}>{note.status}</small>
                            </div>
                          </header>
                          <dl>
                            <div>
                              <dt>Feito</dt>
                              <dd>{note.completed}</dd>
                            </div>
                            <div>
                              <dt>Pendente</dt>
                              <dd>{note.pending}</dd>
                            </div>
                            <div>
                              <dt>Motivo e próximos passos</dt>
                              <dd>{note.reason}</dd>
                            </div>
                          </dl>
                          {note.reply && (
                            <div className="note-admin-reply">
                              <span>RESPOSTA DO ADMIN</span>
                              <p>{note.reply}</p>
                            </div>
                          )}
                          <footer className="note-actions">
                            <button
                              type="button"
                              onClick={() => markContentNoteSeen(note.id)}
                              disabled={note.seen}
                            >
                              {note.seen ? 'Visto' : 'Marcar como visto'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setReplyingNoteId((current) =>
                                  current === note.id ? null : note.id,
                                )
                              }
                            >
                              {note.reply ? 'Editar resposta' : 'Responder'}
                            </button>
                          </footer>
                          {replyingNoteId === note.id && (
                            <form
                              className="note-reply-form"
                              onSubmit={(event) => replyToContentNote(event, note.id)}
                            >
                              <textarea
                                name="note-reply"
                                defaultValue={note.reply}
                                rows={3}
                                placeholder="Escreva uma orientação para o estagiário..."
                                autoFocus
                              />
                              <div>
                                <button type="submit">Enviar resposta</button>
                                <button type="button" onClick={() => setReplyingNoteId(null)}>
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          )}
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>
        </section>
      )}

      {activeSection === 'board' && (
        <>
          <header className="workspace-area-header">
            <div>
              <span>TRELLO PESSOAL</span>
              <h2>Áreas de trabalho</h2>
            </div>
            <button type="button" onClick={() => setWorkspaceComposerOpen(true)}>
              <span aria-hidden="true">+</span>
              Nova área de trabalho
            </button>
          </header>

          <nav className="workspace-tabs" aria-label="Áreas de trabalho">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className={workspace.id === activeWorkspace.id ? 'active' : ''}
                style={{ '--item-color': workspace.color } as ColorStyle}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveWorkspaceId(workspace.id)
                    setCardComposerListId(null)
                  }}
                >
                  <span style={{ '--item-color': workspace.color } as ColorStyle} />
                  <span>
                    <strong>{workspace.title}</strong>
                    <small>{workspace.lists.length} grupos</small>
                  </span>
                </button>
                <input
                  type="color"
                  value={workspace.color}
                  onChange={(event) =>
                    setWorkspaces((current) =>
                      current.map((item) =>
                        item.id === workspace.id ? { ...item, color: event.target.value } : item,
                      ),
                    )
                  }
                  aria-label={`Alterar cor da área ${workspace.title}`}
                  title="Alterar cor da área"
                />
              </div>
            ))}
          </nav>

          {workspaceComposerOpen && (
            <form className="workspace-inline-form" onSubmit={createWorkspace}>
              <label>
                <span>Nome da nova área</span>
                <input name="workspace-title" placeholder="Ex.: Prospecção e conteúdo" autoFocus />
              </label>
              <label>
                <span>Descrição</span>
                <textarea
                  name="workspace-description"
                  placeholder="Ex.: Organize contatos, conversas e novas oportunidades."
                  rows={2}
                />
              </label>
              <label className="workspace-color-field">
                <span>Cor</span>
                <input
                  name="workspace-color"
                  type="color"
                  defaultValue="#6B6133"
                  aria-label="Cor da nova área"
                />
              </label>
              <button type="submit">Criar área</button>
              <button type="button" onClick={() => setWorkspaceComposerOpen(false)}>
                Cancelar
              </button>
            </form>
          )}

          <section className="personal-board">
            <header className="personal-board-header">
              <div>
                <h2>{activeWorkspace.title}</h2>
                <p>{activeWorkspace.description}</p>
              </div>
              <div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setLabelManagerOpen((current) => !current)}
                >
                  Etiquetas
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setListComposerOpen(true)}>
                  <Icon name="plus" className="size-4" /> Adicionar grupo
                </Button>
              </div>
            </header>

            {labelManagerOpen && (
              <section className="label-manager">
                <header>
                  <div>
                    <span>ETIQUETAS DE {activeWorkspace.title.toUpperCase()}</span>
                    <h3>Crie nomes e personalize as cores</h3>
                  </div>
                  <button type="button" onClick={() => setLabelManagerOpen(false)}>
                    Fechar
                  </button>
                </header>
                <div className="label-manager-grid">
                  {activeWorkspace.labels.map((label) => (
                    <label key={label.id} className="label-editor">
                      <input
                        type="color"
                        value={label.color}
                        onChange={(event) => updateLabel(label.id, { color: event.target.value })}
                        aria-label={`Cor de ${label.name}`}
                      />
                      <input
                        value={label.name}
                        onChange={(event) => updateLabel(label.id, { name: event.target.value })}
                        aria-label={`Nome da etiqueta ${label.name}`}
                      />
                    </label>
                  ))}
                </div>
                <form className="create-label-form" onSubmit={createLabel}>
                  <input
                    name="label-color"
                    type="color"
                    defaultValue="#6B6133"
                    aria-label="Cor da nova etiqueta"
                  />
                  <input name="label-name" placeholder="Nome da nova etiqueta" />
                  <button type="submit">Criar etiqueta</button>
                </form>
              </section>
            )}

            {listComposerOpen && (
              <form className="list-inline-form" onSubmit={createList}>
                <input
                  className="list-color-input"
                  name="list-color"
                  type="color"
                  defaultValue="#8C814B"
                  aria-label="Cor do novo grupo"
                />
                <input name="list-title" placeholder="Nome do novo grupo" autoFocus />
                <button type="submit">Adicionar</button>
                <button type="button" onClick={() => setListComposerOpen(false)}>
                  Cancelar
                </button>
              </form>
            )}

            <div className="board-lists">
              {activeWorkspace.lists.map((list, listIndex) => (
                <section
                  key={list.id}
                  className={`board-list ${draggedCard ? 'receiving' : ''} ${dropListId === list.id && draggedCard?.listId !== list.id ? 'drop-target' : ''}`}
                  style={{ '--item-color': list.color } as ColorStyle}
                  onDragOver={(event) => {
                    event.preventDefault()
                    if (draggedCard && dropListId !== list.id) setDropListId(list.id)
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setDropListId((current) => (current === list.id ? null : current))
                    }
                  }}
                  onDrop={() => {
                    if (draggedCard) moveCard(draggedCard.cardId, draggedCard.listId, list.id)
                    setDraggedCard(null)
                    setDropListId(null)
                  }}
                >
                  <header>
                    <div>
                      <i aria-hidden="true" />
                      <h3>{list.title}</h3>
                    </div>
                    <div className="board-list-actions">
                      <input
                        type="color"
                        value={list.color}
                        onChange={(event) => updateListColor(list.id, event.target.value)}
                        aria-label={`Cor do grupo ${list.title}`}
                      />
                      <span>{list.cards.length}</span>
                    </div>
                  </header>

                  <div className="board-cards">
                    {list.cards.map((card) =>
                      (() => {
                        const label = activeWorkspace.labels.find(
                          (workspaceLabel) => workspaceLabel.id === card.labelId,
                        )
                        return (
                          <article
                            key={card.id}
                            className={`board-card group/card ${draggedCard?.cardId === card.id ? 'is-dragging' : ''}`}
                            draggable={
                              !(editingCard?.cardId === card.id && editingCard.listId === list.id)
                            }
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = 'move'
                              // Lifted ghost: a tilted copy with a deeper shadow follows the cursor.
                              const source = event.currentTarget
                              const rect = source.getBoundingClientRect()
                              const ghost = source.cloneNode(true) as HTMLElement
                              ghost.classList.add('board-card-ghost')
                              ghost.style.width = `${rect.width}px`
                              document.body.appendChild(ghost)
                              event.dataTransfer.setDragImage(
                                ghost,
                                event.clientX - rect.left,
                                event.clientY - rect.top,
                              )
                              window.setTimeout(() => ghost.remove(), 0)
                              // Defer so the browser snapshots the card before it fades.
                              window.setTimeout(
                                () => setDraggedCard({ cardId: card.id, listId: list.id }),
                                0,
                              )
                            }}
                            onDragEnd={() => {
                              setDraggedCard(null)
                              setDropListId(null)
                            }}
                          >
                            <div className="board-card-top">
                              <span
                                className="board-label"
                                style={
                                  {
                                    '--item-color': label?.color ?? '#6B6133',
                                  } as ColorStyle
                                }
                              >
                                <i aria-hidden="true" />
                                {label?.name ?? 'Sem etiqueta'}
                              </span>
                              <Menu
                                label={`Ações do cartão ${card.title}`}
                                items={[
                                  {
                                    id: 'edit',
                                    label: 'Editar',
                                    onSelect: () =>
                                      setEditingCard({ cardId: card.id, listId: list.id }),
                                  },
                                  ...(listIndex > 0
                                    ? [
                                        {
                                          id: 'prev',
                                          label: `Mover para ${activeWorkspace.lists[listIndex - 1].title}`,
                                          onSelect: () => moveCardByDirection(list.id, card.id, -1),
                                        },
                                      ]
                                    : []),
                                  ...(listIndex < activeWorkspace.lists.length - 1
                                    ? [
                                        {
                                          id: 'next',
                                          label: `Mover para ${activeWorkspace.lists[listIndex + 1].title}`,
                                          onSelect: () => moveCardByDirection(list.id, card.id, 1),
                                        },
                                      ]
                                    : []),
                                  {
                                    id: 'remove',
                                    label: 'Remover',
                                    danger: true,
                                    onSelect: () => removeCard(list.id, card.id),
                                  },
                                ]}
                                trigger={({ open, toggle, id }) => (
                                  <button
                                    type="button"
                                    onClick={toggle}
                                    aria-haspopup="menu"
                                    aria-expanded={open}
                                    aria-controls={open ? id : undefined}
                                    aria-label={`Ações do cartão ${card.title}`}
                                    className="board-card-menu grid size-7 place-items-center rounded-md text-ink-3 opacity-0 transition-opacity group-hover/card:opacity-100 hover:bg-subtle hover:text-ink focus-visible:opacity-100 aria-expanded:opacity-100"
                                  >
                                    <Icon name="dots" className="size-4" />
                                  </button>
                                )}
                              />
                            </div>
                            {editingCard?.cardId === card.id && editingCard.listId === list.id ? (
                              <form
                                className="card-composer card-edit-form"
                                onSubmit={(event) => updateCard(event, list.id, card.id)}
                              >
                                <input
                                  name="card-title"
                                  defaultValue={card.title}
                                  aria-label="Título do cartão"
                                  autoFocus
                                />
                                <textarea
                                  name="card-note"
                                  defaultValue={card.note}
                                  aria-label="Descrição do cartão"
                                  rows={3}
                                />
                                <label className="card-date-field">
                                  <span>Data limite</span>
                                  <input type="date" name="card-due" defaultValue={card.dueDate} />
                                  <small>Sincroniza automaticamente com a Agenda.</small>
                                </label>
                                <select
                                  name="card-label"
                                  defaultValue={card.labelId}
                                  aria-label="Etiqueta do cartão"
                                >
                                  {activeWorkspace.labels.map((workspaceLabel) => (
                                    <option key={workspaceLabel.id} value={workspaceLabel.id}>
                                      {workspaceLabel.name}
                                    </option>
                                  ))}
                                </select>
                                <div>
                                  <button type="submit">Salvar</button>
                                  <button type="button" onClick={() => setEditingCard(null)}>
                                    Cancelar
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <div className="board-card-body">
                                <h4 className="text-sm leading-5 font-medium text-ink">
                                  {card.title}
                                </h4>
                                {card.note && (
                                  <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-ink-2">
                                    {card.note}
                                  </p>
                                )}
                                <footer className="mt-3 flex items-center gap-2">
                                  {card.due &&
                                    (() => {
                                      const due =
                                        card.dueDate && todayIso
                                          ? card.dueDate < todayIso
                                            ? 'overdue'
                                            : card.dueDate === todayIso
                                              ? 'today'
                                              : 'later'
                                          : 'later'
                                      return (
                                        <span
                                          title={
                                            card.dueDate ? 'Aparece também na Agenda' : undefined
                                          }
                                          className={cx(
                                            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                                            due === 'overdue'
                                              ? 'bg-danger-soft text-danger'
                                              : due === 'today'
                                                ? 'bg-warning-soft text-warning'
                                                : 'bg-subtle text-ink-2',
                                          )}
                                        >
                                          <Icon name="calendar" className="size-3" />
                                          {due === 'overdue' ? `Venceu · ${card.due}` : card.due}
                                        </span>
                                      )
                                    })()}
                                  <span className="ml-auto flex gap-0.5 opacity-0 transition-opacity group-hover/card:opacity-100 group-focus-within/card:opacity-100">
                                    <button
                                      type="button"
                                      disabled={listIndex === 0}
                                      onClick={() => moveCardByDirection(list.id, card.id, -1)}
                                      aria-label={`Mover ${card.title} para o grupo anterior`}
                                      className="grid size-6 place-items-center rounded text-ink-3 hover:bg-subtle hover:text-ink disabled:invisible"
                                    >
                                      <Icon name="chevronRight" className="size-3.5 rotate-180" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={listIndex === activeWorkspace.lists.length - 1}
                                      onClick={() => moveCardByDirection(list.id, card.id, 1)}
                                      aria-label={`Mover ${card.title} para o próximo grupo`}
                                      className="grid size-6 place-items-center rounded text-ink-3 hover:bg-subtle hover:text-ink disabled:invisible"
                                    >
                                      <Icon name="chevronRight" className="size-3.5" />
                                    </button>
                                  </span>
                                </footer>
                              </div>
                            )}
                          </article>
                        )
                      })(),
                    )}
                    {dropListId === list.id && draggedCard && draggedCard.listId !== list.id && (
                      <div className="board-drop-placeholder" aria-hidden="true">
                        Soltar aqui
                      </div>
                    )}
                  </div>

                  {cardComposerListId === list.id ? (
                    <form
                      className="card-composer"
                      onSubmit={(event) => createCard(event, list.id)}
                    >
                      <input name="card-title" placeholder="Título do cartão" autoFocus />
                      <textarea name="card-note" placeholder="Descrição do cartão" rows={3} />
                      <label className="card-date-field">
                        <span>Data limite</span>
                        <input type="date" name="card-due" />
                        <small>Cartões com data aparecem automaticamente na Agenda.</small>
                      </label>
                      <select name="card-label" defaultValue={activeWorkspace.labels[0]?.id}>
                        {activeWorkspace.labels.map((label) => (
                          <option key={label.id} value={label.id}>
                            {label.name}
                          </option>
                        ))}
                      </select>
                      <div>
                        <button type="submit">Criar cartão</button>
                        <button type="button" onClick={() => setCardComposerListId(null)}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      className="add-card-button"
                      type="button"
                      onClick={() => setCardComposerListId(list.id)}
                    >
                      <span aria-hidden="true">+</span>
                      Adicionar cartão
                    </button>
                  )}
                </section>
              ))}

              <button
                className="add-list-card"
                type="button"
                onClick={() => setListComposerOpen(true)}
              >
                <span aria-hidden="true">+</span>
                Criar novo grupo
              </button>
            </div>
          </section>
        </>
      )}
    </section>
  )
}
