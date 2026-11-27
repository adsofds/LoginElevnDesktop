'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  fillPlaceholders,
  notificationTemplates,
  type NotificationAudience,
  type NotificationTemplateId,
  type StudentNotification,
} from '@/lib/student-notifications'
import { usePanel } from '../panel/PanelState'
import { studentDirectory } from '../StudentsWorkspace'
import { Badge, type BadgeTone } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { Segmented } from '../ui/Segmented'
import { Sheet } from '../ui/Sheet'
import { NotificationSchedules } from './NotificationSchedules'
import { defaultSender, SenderPicker } from './SenderPicker'
import { senderOf, type NotificationSenderId } from '@/lib/demo-team'
import { SenderAvatar } from '../team/SenderAvatar'

type Student = (typeof studentDirectory)[number]

const field =
  'mt-1 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:outline-none'

/** Audience filters: id → label + who matches. */
export const audienceFilters: {
  id: string
  label: string
  match: (student: Student) => boolean
}[] = [
  { id: 'ativos', label: 'Todos os alunos ativos', match: () => true },
  {
    id: 'checkin-pendente',
    label: 'Check-in pendente',
    match: (s) => s.checkinState !== 'Realizado',
  },
  { id: 'status-risco', label: 'Status: Em risco', match: (s) => s.status === 'Em risco' },
  { id: 'status-atencao', label: 'Status: Atenção', match: (s) => s.status === 'Atenção' },
  {
    id: 'objetivo-emagrecimento',
    label: 'Objetivo: Emagrecimento',
    match: (s) => s.goal === 'Emagrecimento',
  },
  {
    id: 'objetivo-hipertrofia',
    label: 'Objetivo: Hipertrofia',
    match: (s) => s.goal === 'Hipertrofia',
  },
  {
    id: 'objetivo-performance',
    label: 'Objetivo: Performance',
    match: (s) => s.goal === 'Performance',
  },
]

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const dateTime = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/** Sheet to write and send (or schedule) a notification. */
export function NotificationComposer({
  open,
  initialStudentIds,
  onClose,
  onSent,
}: {
  open: boolean
  initialStudentIds?: string[]
  onClose: () => void
  onSent: (summary: string) => void
}) {
  const { user, addNotification } = usePanel()
  const [mode, setMode] = useState<'um' | 'varios' | 'filtro'>('um')
  const [singleId, setSingleId] = useState(studentDirectory[0]?.id ?? '')
  const [multiIds, setMultiIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [filterId, setFilterId] = useState('checkin-pendente')
  const [templateId, setTemplateId] = useState<NotificationTemplateId>('treino')
  const [title, setTitle] = useState(notificationTemplates[0].title)
  const [message, setMessage] = useState(notificationTemplates[0].message)
  const [when, setWhen] = useState<'agora' | 'agendar'>('agora')
  const [scheduleAt, setScheduleAt] = useState('')
  const [error, setError] = useState('')
  const [senderId, setSenderId] = useState<NotificationSenderId>(defaultSender.treino)

  // Each opening starts clean; from a student file it comes addressed to that student.
  useEffect(() => {
    if (!open) return
    const preset = initialStudentIds ?? []
    setMode(preset.length > 1 ? 'varios' : 'um')
    if (preset.length === 1) setSingleId(preset[0])
    setMultiIds(preset.length > 1 ? preset : [])
    setSearch('')
    setError('')
    setWhen('agora')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    setScheduleAt(toLocalInput(tomorrow))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const pickTemplate = (id: NotificationTemplateId) => {
    const template = notificationTemplates.find((item) => item.id === id)!
    setTemplateId(id)
    setSenderId(defaultSender[id])
    setTitle(template.title)
    setMessage(template.message)
  }

  const recipients = useMemo(() => {
    if (mode === 'um') return studentDirectory.filter((student) => student.id === singleId)
    if (mode === 'varios')
      return studentDirectory.filter((student) => multiIds.includes(student.id))
    const filter = audienceFilters.find((item) => item.id === filterId)
    return filter ? studentDirectory.filter(filter.match) : []
  }, [mode, singleId, multiIds, filterId])

  const sendDate = when === 'agendar' && scheduleAt ? new Date(scheduleAt) : new Date()
  const previewStudent = recipients[0]
  const preview = previewStudent
    ? {
        title: fillPlaceholders(title, {
          name: previewStudent.name,
          date: sendDate,
          expiration: previewStudent.expirationDate,
        }),
        message: fillPlaceholders(message, {
          name: previewStudent.name,
          date: sendDate,
          expiration: previewStudent.expirationDate,
        }),
      }
    : { title, message }

  const listed = studentDirectory.filter((student) =>
    student.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (recipients.length === 0) return setError('Escolha pelo menos um aluno.')
    if (!title.trim() || !message.trim()) return setError('Preencha o título e a mensagem.')
    if (when === 'agendar' && (!scheduleAt || new Date(scheduleAt).getTime() <= Date.now()))
      return setError('Escolha uma data e hora no futuro para o agendamento.')

    const filter = audienceFilters.find((item) => item.id === filterId)
    const audience: NotificationAudience =
      mode === 'filtro' && filter
        ? {
            kind: 'filtro',
            filter: filter.id,
            label: filter.label,
            studentIds: recipients.map((s) => s.id),
          }
        : { kind: 'alunos', studentIds: recipients.map((s) => s.id) }
    const notification: StudentNotification = {
      id: `notif-${Date.now().toString(36)}`,
      templateId,
      title: title.trim(),
      message: message.trim(),
      audience,
      sentBy: senderOf({ senderId, sentBy: '' }).firstName,
      senderId,
      atIso: sendDate.toISOString(),
      status: when === 'agendar' ? 'agendada' : 'enviada',
    }
    addNotification(notification)
    const who = recipients.length === 1 ? recipients[0].name : `${recipients.length} alunos`
    onSent(
      when === 'agendar'
        ? `Agendada para ${who} em ${dateTime.format(sendDate)} (demonstração).`
        : `Enviada para ${who} (demonstração: nada foi entregue de verdade).`,
    )
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      label="Nova notificação"
      layer="z-[100]"
      className="w-[min(940px,100vw)] bg-surface"
    >
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-ink">Nova notificação</h2>
            <p className="mt-0.5 text-sm text-ink-2">
              Mensagem de mão única para o app do aluno. Conversas continuam no WhatsApp.
            </p>
          </div>
          <Button size="icon" variant="ghost" type="button" aria-label="Fechar" onClick={onClose}>
            <Icon name="close" className="size-4" />
          </Button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6 px-6 py-5">
            <p className="rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
              Demonstração: o envio é simulado até o app do aluno estar no ar.
            </p>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">Para quem</legend>
              <Segmented
                size="sm"
                className="mt-2"
                label="Tipo de destinatário"
                value={mode}
                onChange={setMode}
                items={[
                  { id: 'um', label: 'Um aluno' },
                  { id: 'varios', label: 'Vários alunos' },
                  { id: 'filtro', label: 'Por filtro' },
                ]}
              />

              {mode === 'um' && (
                <label className="mt-3 block">
                  <span className="sr-only">Aluno</span>
                  <select
                    value={singleId}
                    onChange={(e) => setSingleId(e.target.value)}
                    className={cx(field, 'h-10')}
                  >
                    {studentDirectory.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} · {student.goal}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {mode === 'varios' && (
                <div className="mt-3">
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar aluno"
                    aria-label="Buscar aluno"
                    className={cx(field, 'h-9')}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-ink-3">
                    <span className="tabular-nums">{multiIds.length} selecionados</span>
                    <span className="flex gap-3">
                      <button
                        type="button"
                        className="font-medium text-brand hover:underline"
                        onClick={() => setMultiIds(listed.map((s) => s.id))}
                      >
                        Selecionar todos
                      </button>
                      <button
                        type="button"
                        className="font-medium text-ink-2 hover:underline"
                        onClick={() => setMultiIds([])}
                      >
                        Limpar
                      </button>
                    </span>
                  </div>
                  <ul className="mt-1 max-h-56 divide-y divide-line-subtle overflow-y-auto rounded-lg border border-line">
                    {listed.map((student) => {
                      const checked = multiIds.includes(student.id)
                      return (
                        <li key={student.id}>
                          <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-subtle">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setMultiIds((current) =>
                                  checked
                                    ? current.filter((id) => id !== student.id)
                                    : [...current, student.id],
                                )
                              }
                              className="size-4 accent-[var(--elevn-accent)]"
                            />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={student.avatar}
                              alt=""
                              className="size-7 rounded-full object-cover"
                            />
                            <span className="min-w-0 flex-1 truncate text-sm text-ink">
                              {student.name}
                            </span>
                            <span className="text-xs text-ink-3">{student.status}</span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {mode === 'filtro' && (
                <div className="mt-3">
                  <label className="block">
                    <span className="sr-only">Filtro</span>
                    <select
                      value={filterId}
                      onChange={(e) => setFilterId(e.target.value)}
                      className={cx(field, 'h-10')}
                    >
                      {audienceFilters.map((filter) => (
                        <option key={filter.id} value={filter.id}>
                          {filter.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-2 text-xs text-ink-3">
                    {recipients.length
                      ? `${recipients.length} ${recipients.length === 1 ? 'aluno' : 'alunos'}: ${recipients
                          .slice(0, 4)
                          .map((s) => s.name.split(' ')[0])
                          .join(
                            ', ',
                          )}${recipients.length > 4 ? ` e mais ${recipients.length - 4}` : ''}`
                      : 'Nenhum aluno neste filtro agora.'}
                  </p>
                </div>
              )}
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">Ícone da notificação</legend>
              <SenderPicker value={senderId} onChange={setSenderId} />
              <p className="mt-1.5 text-xs text-ink-3">
                Aparece na notificação do celular e ao lado do aviso no app.
              </p>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">Mensagem</legend>
              <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Modelo">
                {notificationTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    role="radio"
                    aria-checked={templateId === template.id}
                    onClick={() => pickTemplate(template.id)}
                    className={cx(
                      'h-8 rounded-full px-3 text-xs font-medium transition-colors',
                      templateId === template.id
                        ? 'bg-night text-on-dark'
                        : 'border border-line text-ink-2 hover:bg-subtle hover:text-ink',
                    )}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
              <label className="mt-3 block">
                <span className="text-xs font-medium text-ink-2">Título</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={60}
                  className={cx(field, 'h-10')}
                  placeholder="Ex.: Novidade no seu treino"
                />
              </label>
              <label className="mt-3 block">
                <span className="text-xs font-medium text-ink-2">Texto</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  maxLength={240}
                  className={cx(field, 'py-2 leading-5')}
                  placeholder="Escreva a mensagem"
                />
              </label>
              <p className="mt-1 text-[11px] text-ink-3">
                Use <code className="rounded bg-subtle px-1">{'{nome}'}</code> para o primeiro nome,{' '}
                <code className="rounded bg-subtle px-1">{'{data}'}</code> para a data do envio e{' '}
                <code className="rounded bg-subtle px-1">{'{vencimento}'}</code> para o vencimento
                do plano.
              </p>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">Quando</legend>
              <Segmented
                size="sm"
                className="mt-2"
                label="Quando enviar"
                value={when}
                onChange={setWhen}
                items={[
                  { id: 'agora', label: 'Enviar agora' },
                  { id: 'agendar', label: 'Agendar' },
                ]}
              />
              {when === 'agendar' && (
                <label className="mt-3 block max-w-xs">
                  <span className="text-xs font-medium text-ink-2">Data e hora</span>
                  <input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                    className={cx(field, 'h-10')}
                  />
                </label>
              )}
            </fieldset>
          </div>

          <aside
            className="border-t border-line bg-subtle px-6 py-5 lg:border-t-0 lg:border-l"
            aria-label="Prévia no celular do aluno"
          >
            <p className="text-xs font-semibold text-ink-3">
              Prévia{previewStudent ? ` para ${previewStudent.name.split(' ')[0]}` : ''}
              {recipients.length > 1 ? ` · +${recipients.length - 1}` : ''}
            </p>
            <div className="mx-auto mt-3 w-[250px] overflow-hidden rounded-[34px] border-[7px] border-black bg-gradient-to-b from-[#2b2540] to-[#121026] px-3 pt-10 pb-24 shadow-modal">
              <p className="text-center text-[44px] leading-none font-light text-white/90 tabular-nums">
                {sendDate.getHours().toString().padStart(2, '0')}:
                {sendDate.getMinutes().toString().padStart(2, '0')}
              </p>
              <p className="mt-1 text-center text-[11px] text-white/60 first-letter:uppercase">
                {new Intl.DateTimeFormat('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                }).format(sendDate)}
              </p>
              <div className="mt-8 rounded-2xl bg-white/85 p-3 backdrop-blur">
                <div className="flex items-center gap-2">
                  <SenderAvatar
                    sender={senderOf({ senderId, sentBy: '' })}
                    shape="rounded"
                    className="size-6"
                  />
                  <span className="text-[10px] font-semibold tracking-wide text-ink-2">
                    ELEVN
                    {senderId !== 'elevn' &&
                      ` · ${senderOf({ senderId, sentBy: '' }).firstName.toUpperCase()}`}
                  </span>
                  <span className="ml-auto text-[10px] text-ink-3">
                    {when === 'agendar' ? 'agendada' : 'agora'}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-4 font-semibold text-ink">
                  {preview.title || 'Título da notificação'}
                </p>
                <p className="mt-0.5 line-clamp-4 text-xs leading-4 text-ink-2">
                  {preview.message || 'Texto da mensagem'}
                </p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-6 py-4">
          {error && (
            <p role="alert" className="mr-auto text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            <Icon name="bell" className="size-4" />
            {when === 'agendar' ? 'Agendar' : 'Enviar'}
            {recipients.length > 0 && <span className="tabular-nums">· {recipients.length}</span>}
          </Button>
        </footer>
      </form>
    </Sheet>
  )
}

const statusTone: Record<StudentNotification['status'], BadgeTone> = {
  enviada: 'success',
  agendada: 'info',
  cancelada: 'neutral',
}
const statusLabel: Record<StudentNotification['status'], string> = {
  enviada: 'Enviada',
  agendada: 'Agendada',
  cancelada: 'Cancelada',
}

/** "Notificações" tab in Alunos: what was sent or scheduled, and a button to write a new one. */
export function NotificationsCenter({ onCompose }: { onCompose: () => void }) {
  const { notifications, cancelNotification, schedules } = usePanel()
  const [view, setView] = useState<'historico' | 'agendamentos'>('historico')
  const activeSchedules = schedules.filter((item) => item.active).length
  const nameOf = (id: string) =>
    studentDirectory.find((student) => student.id === id)?.name ?? 'Aluno'
  const scheduled = notifications.filter((item) => item.status === 'agendada').length
  const sentWeek = notifications.filter(
    (item) =>
      item.status === 'enviada' && Date.now() - new Date(item.atIso).getTime() < 7 * 86_400_000,
  ).length

  return (
    <section className="mt-2" aria-labelledby="notif-title">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h2 id="notif-title" className="text-xl font-semibold text-ink">
            Notificações para alunos
          </h2>
          <p className="mt-0.5 text-sm text-ink-2">
            Avisos de mão única no app: treino ou dieta atualizados, lembrete de check-in, plano
            vencendo.
          </p>
        </div>
        <Button variant="primary" onClick={onCompose}>
          <Icon name="plus" className="size-4" /> Nova notificação
        </Button>
      </div>

      <dl className="mt-5 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-card border border-line bg-line">
        {[
          ['Enviadas (7 dias)', sentWeek],
          ['Agendadas', scheduled],
          ['Agendamentos ativos', activeSchedules],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface px-4 py-3">
            <dt className="text-xs text-ink-3">{label}</dt>
            <dd className="mt-0.5 text-xl font-semibold text-ink tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <Segmented
        className="mt-5"
        label="Visão de notificações"
        value={view}
        onChange={setView}
        items={[
          { id: 'historico', label: 'Histórico', count: notifications.length },
          { id: 'agendamentos', label: 'Agendamentos', count: schedules.length },
        ]}
      />

      {view === 'agendamentos' ? (
        <NotificationSchedules />
      ) : (
        <div className="mt-5 overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm text-ink">
            <caption className="sr-only">Histórico de notificações</caption>
            <thead>
              <tr className="border-b border-line bg-subtle/60 text-xs text-ink-3">
                {['Data', 'Mensagem', 'Destinatários', 'Enviada por', 'Situação', ''].map(
                  (label, index) => (
                    <th
                      key={index}
                      scope="col"
                      className={cx('h-10 px-4 font-semibold whitespace-nowrap')}
                    >
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {notifications.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-ink-3">
                    Nenhuma notificação ainda.
                  </td>
                </tr>
              )}
              {notifications.map((item) => {
                const ids = item.audience.studentIds
                const template = notificationTemplates.find((t) => t.id === item.templateId)
                return (
                  <tr
                    key={item.id}
                    className={cx(
                      'border-b border-line-subtle last:border-0',
                      item.status === 'cancelada' && 'text-ink-3',
                    )}
                  >
                    <td className="px-4 py-3 align-top whitespace-nowrap text-ink-2 tabular-nums">
                      {dateTime.format(new Date(item.atIso)).replace('.', '')}
                    </td>
                    <td className="max-w-[300px] px-4 py-3 align-top">
                      <span className="block text-xs text-ink-3">{template?.label}</span>
                      <span
                        className={cx(
                          'block truncate font-medium',
                          item.status === 'cancelada' && 'line-through',
                        )}
                      >
                        {item.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top" title={ids.map(nameOf).join(', ')}>
                      <span className="block font-medium tabular-nums">
                        {ids.length} {ids.length === 1 ? 'aluno' : 'alunos'}
                      </span>
                      <span className="block max-w-[200px] truncate text-xs text-ink-3">
                        {item.audience.kind === 'filtro'
                          ? item.audience.label
                          : ids.map((id) => nameOf(id).split(' ')[0]).join(', ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap text-ink-2">
                      <span className="inline-flex items-center gap-2">
                        <SenderAvatar sender={senderOf(item)} className="size-6" />
                        {senderOf(item).firstName}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge tone={statusTone[item.status]} dot>
                        {statusLabel[item.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      {item.status === 'agendada' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => cancelNotification(item.id)}
                        >
                          Cancelar envio
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
