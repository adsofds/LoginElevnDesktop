'use client'

import { studentAdherence } from '@/lib/demo-adherence'
import {
  dietPlan,
  nextWorkoutCode,
  studentProfile,
  workoutHistory,
  workouts,
} from '@/lib/demo-student-app'
import { Face } from '../students/FaceCheckin'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { useStudentApp } from './StudentApp'
import { Bar, Card, GoldButton, LetterBadge, LinkButton, SectionTitle } from './ui'

const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

/**
 * Days trained this month (index 0 = day 1): the recent history shown in the app, and the
 * panel's adherence pattern for older days.
 */
export function trainedDaysThisMonth(today = new Date()) {
  const pattern = studentAdherence.find((item) => item.id === studentProfile.id)?.trainedDays ?? []
  const recent = new Set(workoutHistory.map((entry) => entry.daysAgo))
  const oldest = Math.max(...workoutHistory.map((entry) => entry.daysAgo))
  return Array.from({ length: 31 }, (_, index) => {
    const daysAgo = today.getDate() - (index + 1)
    if (daysAgo < 0) return false
    return daysAgo <= oldest ? recent.has(daysAgo) : Boolean(pattern[index])
  })
}

/** "vence 23 nov": the demo plan always expires a few days from today. */
export function planExpiration(today = new Date()) {
  const date = new Date(today)
  date.setDate(date.getDate() + studentProfile.daysToExpire)
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' })
    .format(date)
    .replace('.', '')
}

/** Consecutive weeks (ending this week) with at least 3 workouts. */
export function weekStreak(trained: boolean[], today: Date) {
  let streak = 0
  const day = today.getDate()
  for (let end = day; end > 0; end -= 7) {
    const count = trained.slice(Math.max(0, end - 7), end).filter(Boolean).length
    if (count >= 3) streak += 1
    else break
  }
  return streak
}

export function HomeTab() {
  const { push, setTab, session, lastFinished, checkinDone, notifications, startSession } =
    useStudentApp()
  const today = new Date()
  const trained = trainedDaysThisMonth()
  const streak = weekStreak(trained, today)
  const workout = workouts.find((item) => item.code === nextWorkoutCode)!
  const doneToday = lastFinished !== null
  const sent = notifications.filter((item) => item.status === 'enviada')
  const mine = sent.filter((item) => item.audience.studentIds.includes(studentProfile.id))
  const unread = (mine.length ? mine : sent.slice(0, 3)).length

  // Current week, Sunday first (Smart Fit strip).
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    const sameMonth = date.getMonth() === today.getMonth()
    const isToday = date.toDateString() === today.toDateString()
    const future = date > today && !isToday
    const done = (sameMonth && !future && trained[date.getDate() - 1]) || (isToday && doneToday)
    return { date, isToday, future, done }
  })

  const minutesNow = today.getHours() * 60 + today.getMinutes()
  const nextMeal =
    dietPlan.meals.find((meal) => {
      const [h, m] = meal.time.split(':').map(Number)
      return h * 60 + m >= minutesNow - 30
    }) ?? dietPlan.meals[0]

  const monthTrained = trained.slice(0, today.getDate()).filter(Boolean).length

  return (
    <div>
      <header className="flex items-center justify-between px-5 pt-3 pb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/wordmark-beige.png" alt="Elevn" className="h-6 w-auto" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => push({ name: 'notifications' })}
            aria-label={unread ? `Notificações, ${unread} novas` : 'Notificações'}
            className="relative grid size-10 place-items-center rounded-full border border-white/15 text-white"
          >
            <Icon name="bell" className="size-5" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[var(--app-gold)] px-1 text-[10px] font-bold text-[#0d0a21]">
                {unread}
              </span>
            )}
          </button>
          <button type="button" onClick={() => setTab('conta')} aria-label="Minha conta">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={studentProfile.avatar}
              alt=""
              className="size-10 rounded-full object-cover ring-2 ring-white/15"
            />
          </button>
        </div>
      </header>

      <section className="px-5 pt-4">
        <p className="text-[13px] text-white/55 first-letter:uppercase">
          {new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(today)}
        </p>
        <h1 className="mt-0.5 text-[28px] leading-9 font-semibold tracking-[-0.02em]">
          Olá, {studentProfile.firstName}
        </h1>
      </section>

      {/* Week strip */}
      <section aria-label="Sua semana" className="mt-5 flex items-center gap-3 px-5">
        <div className="flex w-16 shrink-0 flex-col items-center">
          <span
            className={cx(
              'text-2xl font-bold tabular-nums',
              streak ? 'text-[var(--app-gold)]' : 'text-white/40',
            )}
          >
            🔥 {streak}
          </span>
          <span className="text-[11px] text-white/55">{streak === 1 ? 'semana' : 'semanas'}</span>
        </div>
        <ol className="grid flex-1 grid-cols-7 gap-1">
          {week.map((day, index) => (
            <li key={index} className="flex flex-col items-center gap-1.5">
              <span
                className={cx(
                  'text-[11px] font-medium',
                  day.isToday ? 'text-white' : 'text-white/45',
                )}
              >
                {day.isToday ? 'Hoje' : weekdays[index]}
              </span>
              <span
                className={cx(
                  'grid aspect-square w-full max-w-9 place-items-center rounded-full text-[13px] font-semibold tabular-nums',
                  day.done
                    ? 'bg-[var(--app-gold)] text-[#0d0a21]'
                    : day.isToday
                      ? 'border-2 border-[var(--app-gold)] text-white'
                      : day.future
                        ? 'text-white/30'
                        : 'bg-white/[0.06] text-white/60',
                )}
                aria-label={`${day.date.getDate()}: ${day.done ? 'treinou' : day.future ? 'ainda não chegou' : 'sem treino'}`}
              >
                {day.done ? <Icon name="check" className="size-4" /> : day.date.getDate()}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Today's workout */}
      <section className="mt-7">
        <SectionTitle action={<LinkButton onClick={() => setTab('treino')}>Ver todos</LinkButton>}>
          Treino de hoje
        </SectionTitle>
        <Card className="mx-5 overflow-hidden">
          <div className="relative h-36">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={workout.cover} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-card)] via-[var(--app-card)]/40 to-transparent" />
            <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-[var(--app-gold)] backdrop-blur">
              {doneToday ? 'Concluído hoje' : 'Recomendado'}
            </span>
          </div>
          <div className="relative -mt-6 px-4 pb-4">
            <button
              type="button"
              onClick={() => push({ name: 'workout', code: workout.code })}
              className="flex w-full items-center gap-3 text-left"
            >
              <LetterBadge code={workout.code} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg font-semibold">{workout.title}</span>
                <span className="text-[13px] text-white/55">
                  {workout.minutes} min · {workout.exercises.length} exercícios
                </span>
              </span>
              <Icon name="chevronRight" className="size-5 text-white/40" />
            </button>
            <div className="mt-4">
              {session ? (
                <GoldButton onClick={() => push({ name: 'session' })}>Continuar treino</GoldButton>
              ) : doneToday ? (
                <p className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--app-green)]/15 text-sm font-semibold text-[var(--app-green)]">
                  <Icon name="check" className="size-4" /> Treino registrado. Bom trabalho!
                </p>
              ) : (
                <GoldButton onClick={() => startSession(workout.code)}>Começar treino</GoldButton>
              )}
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs text-white/55">
                <span>
                  <strong className="font-semibold text-white">
                    {studentProfile.planWorkoutsDone}
                  </strong>{' '}
                  de {studentProfile.planWorkoutsTotal} treinos do plano
                </span>
                <span>vence {planExpiration(today)}</span>
              </div>
              <Bar value={studentProfile.planWorkoutsDone} max={studentProfile.planWorkoutsTotal} />
            </div>
          </div>
        </Card>
      </section>

      {/* Weekly check-in */}
      <section className="mt-7">
        <SectionTitle>Check-in semanal</SectionTitle>
        <Card className="mx-5 p-4">
          {checkinDone ? (
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[var(--app-green)]/15 text-[var(--app-green)]">
                <Icon name="check" className="size-5" />
              </span>
              <div>
                <p className="font-semibold">Check-in enviado</p>
                <p className="text-[13px] text-white/55">Seu treinador vai ver ainda hoje.</p>
              </div>
            </div>
          ) : (
            <>
              <p className="font-semibold">Como foi sua semana?</p>
              <p className="mt-0.5 text-[13px] text-white/55">
                6 perguntas, um toque cada. Leva 30 segundos.
              </p>
              <div className="mt-3 flex justify-between px-2" aria-hidden="true">
                {([1, 2, 3, 4, 5] as const).map((score) => (
                  <Face key={score} score={score} className="size-9" />
                ))}
              </div>
              <GoldButton className="mt-4" onClick={() => push({ name: 'checkin' })}>
                Responder check-in
              </GoldButton>
            </>
          )}
        </Card>
      </section>

      {/* Next meal */}
      <section className="mt-7">
        <SectionTitle
          action={<LinkButton onClick={() => setTab('dieta')}>Dieta completa</LinkButton>}
        >
          Próxima refeição
        </SectionTitle>
        <button
          type="button"
          onClick={() => setTab('dieta')}
          className="mx-5 block w-[calc(100%-40px)] text-left"
        >
          <Card className="flex items-center gap-4 p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/[0.06] text-[var(--app-gold)]">
              <Icon name="nutrition" className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] text-white/55">{nextMeal.time}</span>
              <span className="block font-semibold">{nextMeal.name}</span>
              <span className="block truncate text-[13px] text-white/55">
                {nextMeal.foods.map((food) => food.name).join(' · ')}
              </span>
            </span>
            <span className="text-sm font-semibold tabular-nums text-white/80">
              {nextMeal.foods.reduce((sum, food) => sum + food.kcal, 0)} kcal
            </span>
          </Card>
        </button>
      </section>

      {/* Last month */}
      <section className="mt-7 px-5">
        <h2 className="text-[19px] font-semibold tracking-[-0.01em]">Neste mês</h2>
        <dl className="mt-3 grid grid-cols-3 gap-2">
          {[
            ['Treinos feitos', String(monthTrained + (doneToday ? 1 : 0))],
            ['Check-ins', checkinDone ? '4' : '3'],
            ['Peso', studentProfile.weight.replace(' kg', '')],
          ].map(([label, value]) => (
            <Card key={label} className="px-3 py-4 text-center">
              <dd className="text-2xl font-bold tabular-nums">{value}</dd>
              <dt className="mt-0.5 text-[11px] text-white/55">{label}</dt>
            </Card>
          ))}
        </dl>
        <button
          type="button"
          onClick={() => push({ name: 'calendar' })}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 text-sm font-medium text-white/80"
        >
          <Icon name="calendar" className="size-4" /> Ver calendário de treinos
        </button>
      </section>
    </div>
  )
}
