import type { TeamMemberId } from './demo-team'

/**
 * One-way notifications from the coach to students (app push). Conversations stay on
 * WhatsApp; this is for alerts like "treino atualizado" or "lembrete de check-in".
 * Sending is simulated until the student app and push delivery exist.
 */

export type NotificationTemplateId = 'treino' | 'dieta' | 'checkin' | 'plano' | 'livre'

export type NotificationTemplate = {
  id: NotificationTemplateId
  label: string
  title: string
  message: string
}

export const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'treino',
    label: 'Treino atualizado',
    title: 'Treino novo no app 💪',
    message: '{nome}, seu treino foi atualizado. Abra o app para ver os exercícios e as cargas.',
  },
  {
    id: 'dieta',
    label: 'Dieta atualizada',
    title: 'Seu plano alimentar mudou',
    message:
      '{nome}, ajustei sua dieta. Confira as refeições novas no app antes da próxima compra.',
  },
  {
    id: 'checkin',
    label: 'Lembrete de check-in',
    title: 'Hora do check-in semanal',
    message: '{nome}, seu check-in no LiveClin vence hoje ({data}). Responda por lá quando puder.',
  },
  {
    id: 'plano',
    label: 'Plano vencendo',
    title: 'Seu plano está acabando',
    message: '{nome}, seu plano vence em {vencimento}. Fale com a gente para renovar sem pausa.',
  },
  { id: 'livre', label: 'Mensagem livre', title: '', message: '' },
]

export type NotificationAudience =
  | { kind: 'alunos'; studentIds: string[] }
  | { kind: 'filtro'; filter: string; label: string; studentIds: string[] }

export type StudentNotification = {
  id: string
  templateId: NotificationTemplateId
  title: string
  message: string
  audience: NotificationAudience
  sentBy: string
  /** Team member shown next to the notice in the app (face + name). */
  senderId?: TeamMemberId
  /** When it was sent, or when it will be sent (scheduled). */
  atIso: string
  status: 'enviada' | 'agendada' | 'cancelada'
}

/** Replaces {nome}, {data} and {vencimento} for one recipient. */
export function fillPlaceholders(
  text: string,
  values: { name: string; date: Date; expiration?: string },
) {
  return text
    .replaceAll('{nome}', values.name.split(' ')[0])
    .replaceAll(
      '{data}',
      new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(values.date),
    )
    .replaceAll('{vencimento}', values.expiration ?? '—')
}

/** Starter history, placed relative to "now" on the client. */
export function demoNotificationHistory(now: Date): StudentNotification[] {
  const at = (days: number, hour: number) => {
    const date = new Date(now)
    date.setDate(date.getDate() + days)
    date.setHours(hour, 0, 0, 0)
    return date.toISOString()
  }
  return [
    {
      id: 'notif-demo-1',
      templateId: 'checkin',
      title: 'Hora do check-in semanal',
      message: 'Seu check-in no LiveClin vence hoje. Responda por lá quando puder.',
      audience: {
        kind: 'filtro',
        filter: 'checkin-pendente',
        label: 'Check-in pendente',
        studentIds: ['student-lucas', 'student-pedro', 'student-thiago'],
      },
      sentBy: 'Yasmin',
      senderId: 'yasmin',
      atIso: at(-1, 9),
      status: 'enviada',
    },
    {
      id: 'notif-demo-2',
      templateId: 'treino',
      title: 'Treino novo no app 💪',
      message: 'Seu treino foi atualizado. Abra o app para ver os exercícios e as cargas.',
      audience: { kind: 'alunos', studentIds: ['student-camila'] },
      sentBy: 'Breno Monteiro',
      senderId: 'breno',
      atIso: at(-3, 18),
      status: 'enviada',
    },
    {
      id: 'notif-demo-3',
      templateId: 'plano',
      title: 'Seu plano está acabando',
      message: 'Seu plano vence em breve. Fale com a gente para renovar sem pausa.',
      audience: { kind: 'alunos', studentIds: ['student-rafael', 'student-aline'] },
      sentBy: 'Yasmin',
      senderId: 'yasmin',
      atIso: at(1, 10),
      status: 'agendada',
    },
  ]
}
