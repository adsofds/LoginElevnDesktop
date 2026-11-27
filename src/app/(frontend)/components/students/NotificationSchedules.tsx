'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  describeRepeat,
  nextRuns,
  toDateInput,
  weekdayShort,
  type NotificationSchedule,
  type ScheduleRepeat,
} from '@/lib/notification-schedules'
import {
  fillPlaceholders,
  notificationTemplates,
  type NotificationTemplateId,
} from '@/lib/student-notifications'
import { usePanel } from '../panel/PanelState'
import { studentDirectory } from '../StudentsWorkspace'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { Sheet } from '../ui/Sheet'
import { audienceFilters } from './Notifications'
import { defaultSender, SenderPicker } from './SenderPicker'
import { senderOf, teamMember, type TeamMemberId } from '@/lib/demo-team'

const field =
  'mt-1 h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:outline-none'

const runFormat = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})
const formatRun = (date: Date) => runFormat.format(date).replace('.', '').replace(',', ' ·')

type RepeatKind = ScheduleRepeat['kind']

const repeatOptions: { id: RepeatKind; label: string }[] = [
  { id: 'weekly', label: 'Dias da semana' },
  { id: 'daily', label: 'Todo dia' },
  { id: 'monthly', label: 'Todo mês' },
  { id: 'interval', label: 'A cada X dias' },
  { id: 'once', label: 'Uma vez' },
]

/** Weekdays in Brazilian order: Monday first. */
const weekOrder = [1, 2, 3, 4, 5, 6, 0]

function audienceLabel(schedule: NotificationSchedule) {
  if (schedule.audience.kind === 'filtro') return schedule.audience.label
  const ids = schedule.audience.studentIds
  const names = ids
    .map((id) => studentDirectory.find((student) => student.id === id)?.name.split(' ')[0])
    .filter(Boolean)
  return ids.length === 1 ? names[0] : `${ids.length} alunos (${names.slice(0, 3).join(', ')}…)`
}

/** Recurring schedules: list, pause, edit, delete and create. */
export function NotificationSchedules() {
  const { schedules, saveSchedule, removeSchedule } = usePanel()
  const [editing, setEditing] = useState<NotificationSchedule | 'new' | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const now = new Date()

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-ink-2">
          Envios automáticos que se repetem: escolha os dias, a hora e para quem. Cada envio vai
          para quem estiver no público naquele momento.
        </p>
        <Button variant="accent" onClick={() => setEditing('new')}>
          <Icon name="calendar" className="size-4" /> Novo agendamento
        </Button>
      </div>

      {schedules.length === 0 ? (
        <div className="mt-4 rounded-card border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-semibold text-ink">Nenhum agendamento</p>
          <p className="mt-1 text-sm text-ink-2">
            Ex.: toda segunda às 8h, lembrete do check-in semanal para todos os alunos.
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 xl:grid-cols-2">
          {schedules.map((schedule) => {
            const runs = schedule.active ? nextRuns(schedule, now, 1) : []
            return (
              <li
                key={schedule.id}
                className={cx(
                  'rounded-card border border-line bg-surface p-4',
                  !schedule.active && 'bg-subtle/60',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cx(
                      'grid size-10 shrink-0 place-items-center rounded-full',
                      schedule.active ? 'bg-brand/15 text-brand' : 'bg-line text-ink-3',
                    )}
                  >
                    <Icon name="calendar" className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{schedule.name}</span>
                      <Badge tone={schedule.active ? 'success' : 'neutral'} dot>
                        {schedule.active ? 'Ativo' : 'Pausado'}
                      </Badge>
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-ink-2">
                      {describeRepeat(schedule)}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-3">
                      Enviado por{' '}
                      {
                        senderOf({ senderId: schedule.senderId, sentBy: schedule.createdBy })
                          .firstName
                      }{' '}
                      · Para: {audienceLabel(schedule)}
                      {schedule.endDate &&
                        ` · até ${schedule.endDate.split('-').reverse().slice(0, 2).join('/')}`}
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-control bg-subtle px-3 py-2 text-sm">
                  <p className="font-medium text-ink">{schedule.title}</p>
                  <p className="line-clamp-2 text-ink-2">{schedule.message}</p>
                </div>
                <p className="mt-2 text-xs text-ink-3">
                  {schedule.active
                    ? runs[0]
                      ? `Próximo envio: ${formatRun(runs[0])}`
                      : 'Sem próximos envios (período encerrado).'
                    : 'Pausado: nada será enviado até reativar.'}
                </p>
                {confirmDelete === schedule.id ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-control border border-danger/30 bg-danger-soft px-3 py-2">
                    <span className="mr-auto text-sm text-ink">Excluir este agendamento?</span>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        removeSchedule(schedule.id)
                        setConfirmDelete(null)
                      }}
                    >
                      Excluir
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line-subtle pt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => saveSchedule({ ...schedule, active: !schedule.active })}
                    >
                      {schedule.active ? 'Pausar' : 'Reativar'}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditing(schedule)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setConfirmDelete(schedule.id)}
                    >
                      <Icon name="trash" className="size-3.5" /> Excluir
                    </Button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <ScheduleComposer
        schedule={editing === 'new' ? null : editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSave={(schedule) => {
          saveSchedule(schedule)
          setEditing(null)
        }}
      />
    </div>
  )
}

function ScheduleComposer({
  open,
  schedule,
  onClose,
  onSave,
}: {
  open: boolean
  schedule: NotificationSchedule | null
  onClose: () => void
  onSave: (schedule: NotificationSchedule) => void
}) {
  const { user } = usePanel()
  const [name, setName] = useState('')
  const [templateId, setTemplateId] = useState<NotificationTemplateId>('checkin')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [audienceMode, setAudienceMode] = useState<'filtro' | 'alunos'>('filtro')
  const [filterId, setFilterId] = useState('ativos')
  const [studentIds, setStudentIds] = useState<string[]>([])
  const [repeatKind, setRepeatKind] = useState<RepeatKind>('weekly')
  const [weekdays, setWeekdays] = useState<number[]>([1])
  const [monthDay, setMonthDay] = useState(1)
  const [everyDays, setEveryDays] = useState(2)
  const [onceDate, setOnceDate] = useState('')
  const [time, setTime] = useState('08:00')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const [senderId, setSenderId] = useState<TeamMemberId>('breno')

  useEffect(() => {
    if (!open) return
    const today = toDateInput(new Date())
    const base = schedule
    const template = notificationTemplates.find((item) => item.id === 'checkin')!
    setName(base?.name ?? '')
    setTemplateId(base?.templateId ?? 'checkin')
    setTitle(base?.title ?? template.title)
    setMessage(base?.message ?? template.message)
    setAudienceMode(base?.audience.kind ?? 'filtro')
    setFilterId(base?.audience.kind === 'filtro' ? base.audience.filter : 'ativos')
    setStudentIds(base?.audience.kind === 'alunos' ? base.audience.studentIds : [])
    const repeat = base?.repeat ?? { kind: 'weekly', weekdays: [1] }
    setRepeatKind(repeat.kind)
    setWeekdays(repeat.kind === 'weekly' ? repeat.weekdays : [1])
    setMonthDay(repeat.kind === 'monthly' ? repeat.day : 1)
    setEveryDays(repeat.kind === 'interval' ? repeat.everyDays : 2)
    setOnceDate(repeat.kind === 'once' ? repeat.date : today)
    setTime(base?.time ?? '08:00')
    setStartDate(base?.startDate ?? today)
    setEndDate(base?.endDate ?? '')
    setSenderId(base?.senderId ?? defaultSender[base?.templateId ?? 'checkin'])
    setError('')
  }, [open, schedule])

  const repeat: ScheduleRepeat =
    repeatKind === 'weekly'
      ? { kind: 'weekly', weekdays }
      : repeatKind === 'monthly'
        ? { kind: 'monthly', day: monthDay }
        : repeatKind === 'interval'
          ? { kind: 'interval', everyDays }
          : repeatKind === 'once'
            ? { kind: 'once', date: onceDate }
            : { kind: 'daily' }

  const draft: NotificationSchedule = {
    id: schedule?.id ?? `schedule-${Date.now().toString(36)}`,
    name: name.trim() || title.trim() || 'Agendamento',
    templateId,
    title: title.trim(),
    message: message.trim(),
    audience:
      audienceMode === 'filtro'
        ? {
            kind: 'filtro',
            filter: filterId,
            label: audienceFilters.find((item) => item.id === filterId)?.label ?? '',
          }
        : { kind: 'alunos', studentIds },
    repeat,
    time,
    startDate: repeatKind === 'once' ? onceDate : startDate,
    endDate: repeatKind === 'once' ? '' : endDate,
    active: schedule?.active ?? true,
    createdBy: schedule?.createdBy ?? user.name,
    senderId,
  }

  const preview = useMemo(
    () => (time ? nextRuns(draft, new Date(), 4) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [time, repeatKind, weekdays, monthDay, everyDays, onceDate, startDate, endDate],
  )
  const audienceCount =
    audienceMode === 'filtro'
      ? studentDirectory.filter(
          audienceFilters.find((item) => item.id === filterId)?.match ?? (() => false),
        ).length
      : studentIds.length

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.title || !draft.message) return setError('Preencha o título e a mensagem.')
    if (audienceMode === 'alunos' && studentIds.length === 0)
      return setError('Escolha pelo menos um aluno.')
    if (repeatKind === 'weekly' && weekdays.length === 0)
      return setError('Marque pelo menos um dia da semana.')
    if (endDate && startDate && endDate < startDate)
      return setError('A data de término precisa ser depois do início.')
    if (preview.length === 0)
      return setError('Com essas opções não há nenhum envio futuro. Revise a data e a hora.')
    onSave(draft)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      label={schedule ? 'Editar agendamento' : 'Novo agendamento'}
      layer="z-[100]"
      className="w-[min(880px,100vw)] bg-surface"
    >
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {schedule ? 'Editar agendamento' : 'Novo agendamento'}
            </h2>
            <p className="mt-0.5 text-sm text-ink-2">
              Notificação que se repete sozinha: escolha quando e para quem.
            </p>
          </div>
          <Button size="icon" variant="ghost" type="button" aria-label="Fechar" onClick={onClose}>
            <Icon name="close" className="size-4" />
          </Button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6 px-6 py-5">
            <fieldset>
              <legend className="text-sm font-semibold text-ink">1. Mensagem</legend>
              <label className="mt-3 block text-sm text-ink-2">
                Nome do agendamento (só para a equipe)
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: Lembrete do check-in semanal"
                  className={field}
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Modelo">
                {notificationTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    role="radio"
                    aria-checked={templateId === template.id}
                    onClick={() => {
                      setTemplateId(template.id)
                      setSenderId(defaultSender[template.id])
                      if (template.id !== 'livre') {
                        setTitle(template.title)
                        setMessage(template.message)
                      }
                    }}
                    className={cx(
                      'h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold',
                      templateId === template.id
                        ? 'border-ink bg-ink text-surface'
                        : 'border-line bg-surface text-ink-2 hover:border-ink-3',
                    )}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
              <label className="mt-3 block text-sm text-ink-2">
                Título
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={60}
                  className={field}
                />
              </label>
              <label className="mt-3 block text-sm text-ink-2">
                Mensagem
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={3}
                  maxLength={240}
                  className={cx(field, 'h-auto py-2')}
                />
                <span className="mt-1 block text-xs text-ink-3">
                  Use {'{nome}'} para o primeiro nome do aluno e {'{data}'} para a data do envio.
                </span>
              </label>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">Quem envia</legend>
              <SenderPicker value={senderId} onChange={setSenderId} />
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">2. Quando</legend>
              <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Repetição">
                {repeatOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={repeatKind === option.id}
                    onClick={() => setRepeatKind(option.id)}
                    className={cx(
                      'h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold',
                      repeatKind === option.id
                        ? 'border-ink bg-ink text-surface'
                        : 'border-line bg-surface text-ink-2 hover:border-ink-3',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {repeatKind === 'weekly' && (
                <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Dias da semana">
                  {weekOrder.map((day) => {
                    const on = weekdays.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          setWeekdays((current) =>
                            on ? current.filter((item) => item !== day) : [...current, day],
                          )
                        }
                        className={cx(
                          'size-10 cursor-pointer rounded-full border text-xs font-semibold',
                          on
                            ? 'border-brand bg-brand text-on-dark'
                            : 'border-line bg-surface text-ink-2 hover:border-ink-3',
                        )}
                      >
                        {weekdayShort[day]}
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {repeatKind === 'once' && (
                  <label className="block text-sm text-ink-2">
                    Data
                    <input
                      type="date"
                      value={onceDate}
                      onChange={(event) => setOnceDate(event.target.value)}
                      className={field}
                    />
                  </label>
                )}
                {repeatKind === 'monthly' && (
                  <label className="block text-sm text-ink-2">
                    Dia do mês
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={monthDay}
                      onChange={(event) =>
                        setMonthDay(Math.min(31, Math.max(1, Number(event.target.value) || 1)))
                      }
                      className={field}
                    />
                  </label>
                )}
                {repeatKind === 'interval' && (
                  <label className="block text-sm text-ink-2">
                    A cada quantos dias
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={everyDays}
                      onChange={(event) =>
                        setEveryDays(Math.min(90, Math.max(1, Number(event.target.value) || 1)))
                      }
                      className={field}
                    />
                  </label>
                )}
                <label className="block text-sm text-ink-2">
                  Hora
                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    required
                    className={field}
                  />
                </label>
                {repeatKind !== 'once' && (
                  <>
                    <label className="block text-sm text-ink-2">
                      Começa em
                      <input
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className={field}
                      />
                    </label>
                    <label className="block text-sm text-ink-2">
                      Termina em (opcional)
                      <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        className={field}
                      />
                    </label>
                  </>
                )}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">3. Para quem</legend>
              <div className="mt-3 flex gap-1.5" role="radiogroup" aria-label="Público">
                {(
                  [
                    ['filtro', 'Um grupo de alunos'],
                    ['alunos', 'Alunos específicos'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={audienceMode === id}
                    onClick={() => setAudienceMode(id)}
                    className={cx(
                      'h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold',
                      audienceMode === id
                        ? 'border-ink bg-ink text-surface'
                        : 'border-line bg-surface text-ink-2 hover:border-ink-3',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {audienceMode === 'filtro' ? (
                <label className="mt-3 block max-w-sm text-sm text-ink-2">
                  Grupo
                  <select
                    value={filterId}
                    onChange={(event) => setFilterId(event.target.value)}
                    className={field}
                  >
                    {audienceFilters.map((filter) => (
                      <option key={filter.id} value={filter.id}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="mt-3 grid max-h-48 gap-1 overflow-y-auto rounded-control border border-line p-2 sm:grid-cols-2">
                  {studentDirectory.map((student) => (
                    <label
                      key={student.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-subtle"
                    >
                      <input
                        type="checkbox"
                        checked={studentIds.includes(student.id)}
                        onChange={(event) =>
                          setStudentIds((current) =>
                            event.target.checked
                              ? [...current, student.id]
                              : current.filter((id) => id !== student.id),
                          )
                        }
                      />
                      {student.name}
                    </label>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-ink-3">
                Hoje são {audienceCount} {audienceCount === 1 ? 'aluno' : 'alunos'} nesse público.
              </p>
            </fieldset>
          </div>

          <aside className="border-t border-line bg-subtle/60 px-6 py-5 lg:border-t-0 lg:border-l">
            <p className="text-xs font-semibold tracking-[0.12em] text-ink-3 uppercase">Resumo</p>
            <p className="mt-2 text-[15px] font-semibold text-ink">{describeRepeat(draft)}</p>
            <p className="mt-4 text-xs font-semibold text-ink-3">Próximos envios</p>
            {preview.length ? (
              <ul className="mt-1.5 space-y-1 text-sm text-ink-2 tabular-nums">
                {preview.map((run) => (
                  <li key={run.toISOString()} className="capitalize">
                    {formatRun(run)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-sm text-danger">Nenhum envio futuro com essas opções.</p>
            )}
            <div className="mt-5 rounded-card border border-line bg-surface p-3">
              <p className="flex items-center gap-2 text-xs text-ink-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={teamMember(senderId).avatar}
                  alt=""
                  className="size-6 rounded-full [image-rendering:pixelated]"
                />
                Como chega no app · {teamMember(senderId).firstName}
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {fillPlaceholders(title || 'Título', {
                  name: 'Lucas Andrade',
                  date: preview[0] ?? new Date(),
                })}
              </p>
              <p className="mt-0.5 text-sm text-ink-2">
                {fillPlaceholders(message || 'Mensagem', {
                  name: 'Lucas Andrade',
                  date: preview[0] ?? new Date(),
                  expiration: '29 nov',
                })}
              </p>
            </div>
          </aside>
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-6 py-4">
          {error && <p className="mr-auto text-sm text-danger">{error}</p>}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {schedule ? 'Salvar alterações' : 'Criar agendamento'}
          </Button>
        </footer>
      </form>
    </Sheet>
  )
}
