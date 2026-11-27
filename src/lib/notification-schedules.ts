/**
 * Recurring notification schedules ("toda segunda às 8h, lembrete de check-in para todos
 * os alunos"). Each run creates one notification for whoever matches the audience at that
 * moment. Delivery is simulated, like the rest of the notifications.
 */

import type { NotificationSenderId } from './demo-team'
import type { NotificationTemplateId } from './student-notifications'

export type ScheduleRepeat =
  | { kind: 'once'; date: string }
  | { kind: 'daily' }
  | { kind: 'weekly'; weekdays: number[] }
  | { kind: 'monthly'; day: number }
  | { kind: 'interval'; everyDays: number }

export type ScheduleAudience =
  | { kind: 'filtro'; filter: string; label: string }
  | { kind: 'alunos'; studentIds: string[] }

export type NotificationSchedule = {
  id: string
  name: string
  templateId: NotificationTemplateId
  title: string
  message: string
  audience: ScheduleAudience
  repeat: ScheduleRepeat
  /** "HH:MM", local time. */
  time: string
  /** "YYYY-MM-DD": first day it can run. */
  startDate: string
  /** "YYYY-MM-DD" or empty for no end. */
  endDate: string
  active: boolean
  createdBy: string
  /** Who appears as the sender in the app. */
  senderId?: NotificationSenderId
}

export const weekdayShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const weekdayLong = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

const pad = (value: number) => String(value).padStart(2, '0')
export const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

/** "Toda segunda e quinta às 08:00", "Todo dia 5 às 09:30", "Uma vez em 30/11 às 10:00". */
export function describeRepeat(schedule: Pick<NotificationSchedule, 'repeat' | 'time'>) {
  const at = `às ${schedule.time}`
  const { repeat } = schedule
  if (repeat.kind === 'once') {
    const date = parseDate(repeat.date)
    return `Uma vez em ${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${at}`
  }
  if (repeat.kind === 'daily') return `Todo dia ${at}`
  if (repeat.kind === 'monthly') return `Todo dia ${repeat.day} do mês ${at}`
  if (repeat.kind === 'interval')
    return repeat.everyDays === 1 ? `Todo dia ${at}` : `A cada ${repeat.everyDays} dias ${at}`
  const days = [...repeat.weekdays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
  if (days.length === 7) return `Todo dia ${at}`
  if (days.length === 5 && days.every((day) => day >= 1 && day <= 5))
    return `De segunda a sexta ${at}`
  const names = days.map((day) => weekdayLong[day])
  const list =
    names.length > 1 ? `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}` : names[0]
  const every = days.length === 1 && (days[0] === 0 || days[0] === 6) ? 'Todo' : 'Toda'
  return `${every} ${list} ${at}`
}

/** Next `count` send times from `from` on, respecting start, end and the pattern. */
export function nextRuns(schedule: NotificationSchedule, from: Date, count = 3): Date[] {
  const [hours, minutes] = schedule.time.split(':').map(Number)
  const start = parseDate(schedule.startDate)
  const end = schedule.endDate ? parseDate(schedule.endDate) : null
  const runs: Date[] = []
  const day = new Date(Math.max(start.getTime(), new Date(from).setHours(0, 0, 0, 0)))
  for (let i = 0; i < 800 && runs.length < count; i++) {
    if (end && day > end) break
    const candidate = new Date(day)
    candidate.setHours(hours || 0, minutes || 0, 0, 0)
    const { repeat } = schedule
    const elapsed = Math.round((day.getTime() - start.getTime()) / 86_400_000)
    const matches =
      repeat.kind === 'once'
        ? toDateInput(day) === repeat.date
        : repeat.kind === 'daily'
          ? true
          : repeat.kind === 'weekly'
            ? repeat.weekdays.includes(day.getDay())
            : repeat.kind === 'monthly'
              ? day.getDate() ===
                Math.min(repeat.day, new Date(day.getFullYear(), day.getMonth() + 1, 0).getDate())
              : elapsed % Math.max(1, repeat.everyDays) === 0
    if (matches && candidate > from) runs.push(candidate)
    day.setDate(day.getDate() + 1)
  }
  return runs
}

/** Starter schedule: weekly check-in reminder, every Monday at 8h, for everyone. */
export function demoSchedules(now: Date): NotificationSchedule[] {
  const start = toDateInput(now)
  return [
    {
      id: 'schedule-checkin',
      name: 'Lembrete do check-in semanal',
      templateId: 'checkin',
      title: 'Hora do check-in semanal',
      message: '{nome}, bom dia! Responda o seu check-in semanal no LiveClin hoje. 💪',
      audience: { kind: 'filtro', filter: 'ativos', label: 'Todos os alunos ativos' },
      repeat: { kind: 'weekly', weekdays: [1] },
      time: '08:00',
      startDate: start,
      endDate: '',
      active: true,
      createdBy: 'Breno Monteiro',
      senderId: 'yasmin',
    },
    {
      id: 'schedule-hidratacao',
      name: 'Hidratação no fim de semana',
      templateId: 'livre',
      title: 'Bora beber água? 💧',
      message: '{nome}, fim de semana também conta: mantenha a meta de água de hoje.',
      audience: { kind: 'filtro', filter: 'ativos', label: 'Todos os alunos ativos' },
      repeat: { kind: 'weekly', weekdays: [6, 0] },
      time: '10:00',
      startDate: start,
      endDate: '',
      active: false,
      createdBy: 'Breno Monteiro',
      senderId: 'athison',
    },
  ]
}
