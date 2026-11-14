/**
 * Demo agenda relative to today, so the Dashboard always shows a realistic day.
 * Fictional data; in production this comes from the team's calendar.
 */

export type AgendaType = 'Avaliação' | 'Reavaliação' | 'Reunião' | 'Prazo'

export type AgendaEvent = {
  id: string
  /** Days from today (0 = today). */
  dayOffset: number
  time: string
  durationMin: number
  title: string
  person: string
  type: AgendaType
}

export const demoAgenda: AgendaEvent[] = [
  {
    id: 'ag-1',
    dayOffset: 0,
    time: '08:00',
    durationMin: 30,
    title: 'Reunião de alinhamento',
    person: 'Equipe Elevn',
    type: 'Reunião',
  },
  {
    id: 'ag-2',
    dayOffset: 0,
    time: '09:30',
    durationMin: 45,
    title: 'Reavaliação mensal',
    person: 'Lucas Andrade',
    type: 'Reavaliação',
  },
  {
    id: 'ag-3',
    dayOffset: 0,
    time: '14:00',
    durationMin: 60,
    title: 'Avaliação inicial',
    person: 'Aline Moraes',
    type: 'Avaliação',
  },
  {
    id: 'ag-4',
    dayOffset: 0,
    time: '17:30',
    durationMin: 30,
    title: 'Responder check-ins pendentes',
    person: 'Trello · Operação',
    type: 'Prazo',
  },
  {
    id: 'ag-5',
    dayOffset: 1,
    time: '10:00',
    durationMin: 45,
    title: 'Reavaliação mensal',
    person: 'Camila Rocha',
    type: 'Reavaliação',
  },
  {
    id: 'ag-6',
    dayOffset: 1,
    time: '16:00',
    durationMin: 60,
    title: 'Avaliação inicial',
    person: 'Bruno Martins',
    type: 'Avaliação',
  },
  {
    id: 'ag-7',
    dayOffset: 2,
    time: '11:00',
    durationMin: 30,
    title: 'Ajuste de treino',
    person: 'Rafael Souza',
    type: 'Reunião',
  },
  {
    id: 'ag-8',
    dayOffset: 3,
    time: '09:00',
    durationMin: 45,
    title: 'Reavaliação mensal',
    person: 'Juliana Costa',
    type: 'Reavaliação',
  },
]

/** Accent bar / dot color per event type (Tailwind classes). */
export const agendaTypeColor: Record<AgendaType, string> = {
  Avaliação: 'bg-brand',
  Reavaliação: 'bg-info',
  Reunião: 'bg-ink-3',
  Prazo: 'bg-warning',
}

export const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** Minutes since midnight in Brasília time. */
export function minutesNowInSaoPaulo(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
    timeZone: 'America/Sao_Paulo',
  }).formatToParts(now)
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0)
  return get('hour') * 60 + get('minute')
}
