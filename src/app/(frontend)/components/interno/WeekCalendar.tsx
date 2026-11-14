'use client'

import { useEffect, useState } from 'react'
import { minutesNowInSaoPaulo, toMinutes } from '@/lib/demo-agenda'
import { cx } from '../ui/cx'

export type CalendarAppointment = {
  id: string
  title: string
  date: string
  time: string
  person: string
  type: string
  source?: { type: 'trello' }
}

const START_HOUR = 7
const END_HOUR = 21
const HOUR_HEIGHT = 48
const DEFAULT_DURATION = 60

/** Left bar color per appointment type (same palette as the Dashboard agenda). */
export const appointmentTypeColor = (type: string) =>
  type === 'Avaliação'
    ? 'border-l-brand'
    : type === 'Reavaliação'
      ? 'border-l-info'
      : type === 'Prazo do Trello'
        ? 'border-l-warning'
        : type === 'Consulta'
          ? 'border-l-success'
          : 'border-l-ink-3'

const toISO = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const parseISO = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Monday of the week containing `value`. */
export function weekStart(value: string) {
  const date = parseISO(value)
  const offset = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - offset)
  return date
}

const weekdayFormat = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })

export default function WeekCalendar({
  appointments,
  selectedDate,
  today,
  onSelectDate,
  onEdit,
  onCreateAt,
}: {
  appointments: CalendarAppointment[]
  selectedDate: string
  today: string
  onSelectDate: (iso: string) => void
  onEdit: (appointment: CalendarAppointment) => void
  onCreateAt: (iso: string, time: string) => void
}) {
  const [nowMinutes, setNowMinutes] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => setNowMinutes(minutesNowInSaoPaulo(new Date()))
    tick()
    const timer = window.setInterval(tick, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const monday = weekStart(selectedDate)
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return { date, iso: toISO(date) }
  })
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index)
  const timed = (item: CalendarAppointment) => /^\d{2}:\d{2}$/.test(item.time)

  return (
    <div className="min-w-0 overflow-x-auto bg-surface">
      <div className="min-w-[760px]">
        {/* day headers + all-day row */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-line">
          <span />
          {days.map(({ date, iso }) => {
            const isToday = iso === today
            const isSelected = iso === selectedDate
            const allDay = appointments.filter((item) => item.date === iso && !timed(item))
            return (
              <div
                key={iso}
                className={cx(
                  'border-l border-line-subtle px-1.5 pt-2 pb-1.5',
                  isSelected && 'bg-brand-soft/30',
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectDate(iso)}
                  aria-pressed={isSelected}
                  aria-label={`${date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}${isToday ? ', hoje' : ''}`}
                  className="flex w-full items-center gap-1.5 rounded-md px-1 py-0.5 text-left hover:bg-subtle"
                >
                  <span className="text-[11px] font-medium text-ink-3 uppercase">
                    {weekdayFormat.format(date).replace('.', '')}
                  </span>
                  <span
                    className={cx(
                      'grid size-7 place-items-center rounded-full text-sm font-semibold tabular-nums',
                      isToday ? 'bg-brand text-white' : 'text-ink',
                    )}
                  >
                    {date.getDate()}
                  </span>
                </button>
                <div className="mt-1 space-y-1">
                  {allDay.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onEdit(item)}
                      title={`${item.title} · ${item.person}`}
                      className={cx(
                        'block w-full truncate rounded border-l-[3px] bg-subtle px-1.5 py-0.5 text-left text-[11px] font-medium text-ink',
                        appointmentTypeColor(item.type),
                      )}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* hour grid */}
        <div
          className="relative grid grid-cols-[56px_repeat(7,1fr)]"
          style={{ height: hours.length * HOUR_HEIGHT }}
        >
          <div className="relative">
            {hours.map((hour, index) => (
              <span
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-ink-3 tabular-nums"
                style={{ top: index * HOUR_HEIGHT }}
              >
                {index === 0 ? '' : `${String(hour).padStart(2, '0')}:00`}
              </span>
            ))}
          </div>
          {days.map(({ iso }) => {
            const isToday = iso === today
            const dayItems = appointments
              .filter((item) => item.date === iso && timed(item))
              .sort((a, b) => a.time.localeCompare(b.time))
            return (
              <div
                key={iso}
                className={cx(
                  'relative border-l border-line-subtle',
                  iso === selectedDate && 'bg-brand-soft/20',
                )}
                style={{
                  backgroundImage: `repeating-linear-gradient(to bottom, var(--border-subtle) 0 1px, transparent 1px ${HOUR_HEIGHT}px)`,
                }}
              >
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={() => onCreateAt(iso, `${String(hour).padStart(2, '0')}:00`)}
                    className="absolute inset-x-0 block hover:bg-brand-soft/40"
                    style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  />
                ))}
                {dayItems.map((item) => {
                  const start = toMinutes(item.time)
                  const top = ((start - START_HOUR * 60) / 60) * HOUR_HEIGHT
                  if (top < 0 || top > hours.length * HOUR_HEIGHT) return null
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onEdit(item)}
                      title={`${item.time} · ${item.title} · ${item.person}`}
                      className={cx(
                        'absolute inset-x-1 z-[1] overflow-hidden rounded-md border border-line border-l-[3px] bg-surface px-1.5 py-1 text-left shadow-sm transition-shadow hover:shadow-pop',
                        appointmentTypeColor(item.type),
                      )}
                      style={{ top: top + 1, height: (DEFAULT_DURATION / 60) * HOUR_HEIGHT - 3 }}
                    >
                      <span className="block truncate text-[11px] font-semibold text-ink">
                        {item.title}
                      </span>
                      <span className="block truncate text-[11px] text-ink-3">
                        {item.time} · {item.person}
                      </span>
                    </button>
                  )
                })}
                {isToday &&
                  nowMinutes !== null &&
                  nowMinutes >= START_HOUR * 60 &&
                  nowMinutes <= END_HOUR * 60 && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 z-[2] h-0.5 bg-brand"
                      style={{ top: ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT }}
                    >
                      <span className="absolute -top-[3px] -left-1 size-2 rounded-full bg-brand" />
                    </span>
                  )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
