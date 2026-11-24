'use client'

import { studentAdherence } from '@/lib/demo-adherence'
import { nextWorkoutCode, studentProfile, workoutHistory, workouts } from '@/lib/demo-student-app'
import { Face, type FaceScore } from '../students/FaceCheckin'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { currentMeal } from './DietTab'
import { useStudentApp } from './StudentApp'
import { Card, Chip, ElevnMark, GoldButton, LetterBadge, LinkButton, SectionTitle } from './ui'

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

/** "23 de nov": the demo plan always expires a few days from today. */
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
  for (let end = today.getDate(); end > 0; end -= 7) {
    const count = trained.slice(Math.max(0, end - 7), end).filter(Boolean).length
    if (count >= 3) streak += 1
    else break
  }
  return streak
}

/**
 * Weekly goal: workouts done this week vs the weekly target, and where the student
 * should be by today (pro-rated, Sunday first) to decide the face.
 */
export function weeklyAdherence(weekDone: number, today: Date) {
  const target = studentProfile.weeklyTarget
  const expected = Math.max(1, Math.min(target, Math.round(((today.getDay() + 1) / 7) * target)))
  const rate = Math.min(100, Math.round((weekDone / target) * 100))
  const reached = weekDone >= target
  const pace = weekDone / expected
  const mood: FaceScore = reached || pace >= 0.8 ? 5 : pace >= 0.5 ? 3 : 1
  const daysLeft = 6 - today.getDay()
  return { done: weekDone, target, expected, rate, reached, mood, daysLeft }
}

type Adherence = ReturnType<typeof weeklyAdherence>

const moodCopy: Record<
  1 | 3 | 5,
  { title: (a: Adherence) => string; text: (a: Adherence) => string; tone: string }
> = {
  5: {
    title: (a) => (a.reached ? 'Meta da semana batida!' : 'Você está mandando bem!'),
    text: (a) =>
      a.reached
        ? 'Tirou 11 na semana. O que vier agora é bônus.'
        : `No ritmo certo. Faltam ${a.target - a.done} ${a.target - a.done === 1 ? 'treino' : 'treinos'} para fechar a meta.`,
    tone: 'text-[var(--app-green)]',
  },
  3: {
    title: () => 'Dá pra melhorar',
    text: (a) =>
      `Faltam ${a.target - a.done} ${a.target - a.done === 1 ? 'treino' : 'treinos'} e ${a.daysLeft + 1} ${a.daysLeft === 0 ? 'dia' : 'dias'} para fechar a semana.`,
    tone: 'text-[var(--app-gold)]',
  },
  1: {
    title: () => 'Bora retomar?',
    text: () => 'Um treino hoje já muda a semana. Comece pelo próximo da lista.',
    tone: 'text-[var(--app-red)]',
  },
}

export function HomeTab() {
  const {
    push,
    setTab,
    session,
    lastFinished,
    notifications,
    startSession,
    mealSwaps,
    eatenMeals,
  } = useStudentApp()
  const today = new Date()
  const doneToday = lastFinished !== null
  const trained = trainedDaysThisMonth(today)
  const streak = weekStreak(trained, today)
  const workout = workouts.find((item) => item.code === nextWorkoutCode)!

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
  const weekDone = week.filter((day) => day.done).length
  const adherence = weeklyAdherence(weekDone, today)
  const copy = moodCopy[adherence.mood as 1 | 3 | 5]

  const minutesNow = today.getHours() * 60 + today.getMinutes()
  const nextMeal = currentMeal(eatenMeals, today)
  const nextSwap = nextMeal?.smartSwaps?.find((swap) => swap.id === mealSwaps[nextMeal.id])
  const nextFoods = nextSwap ? nextSwap.foods : (nextMeal?.foods ?? [])
  const nextKcal = nextSwap
    ? nextSwap.kcal
    : (nextMeal?.foods ?? []).reduce((sum, food) => sum + food.kcal, 0)

  return (
    <div className="pb-4">
      <header className="flex items-center gap-3 px-5 pt-3">
        <button
          type="button"
          onClick={() => setTab('conta')}
          aria-label="Minha conta"
          className="shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={studentProfile.avatar}
            alt=""
            className="size-11 rounded-full object-cover ring-2 ring-[var(--app-gold)]/40"
          />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-white/50 first-letter:uppercase">
            {new Intl.DateTimeFormat('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(today)}
          </p>
          <h1 className="truncate text-[22px] leading-7 font-semibold tracking-[-0.02em]">
            Olá, {studentProfile.firstName}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => push({ name: 'notifications' })}
          aria-label={unread ? `Avisos, ${unread} novos` : 'Avisos'}
          className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white/[0.06] text-white ring-1 ring-white/10 ring-inset"
        >
          <Icon name="bell" className="size-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[var(--app-gold)] px-1 text-[10px] font-bold text-[#0d0a21]">
              {unread}
            </span>
          )}
        </button>
      </header>

      {/* Week: tap to open the calendar */}
      <button
        type="button"
        onClick={() => push({ name: 'calendar' })}
        aria-label={`Sua semana: ${weekDone} treinos. Abrir calendário`}
        className="mx-5 mt-5 block w-[calc(100%-40px)] text-left"
      >
        <Card className="px-4 pt-3.5 pb-4 transition-colors active:bg-[var(--app-card-2)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Sua semana</p>
            <span className="flex items-center gap-2">
              <Chip tone={streak ? 'gold' : 'muted'}>
                🔥 {streak} {streak === 1 ? 'semana' : 'semanas'}
              </Chip>
              <Icon name="calendar" className="size-4 text-white/45" />
            </span>
          </div>
          <ol className="mt-3 grid grid-cols-7 gap-1">
            {week.map((day, index) => (
              <li key={index} className="flex flex-col items-center gap-1.5">
                <span
                  className={cx(
                    'text-[11px] font-medium',
                    day.isToday ? 'text-[var(--app-gold)]' : 'text-white/40',
                  )}
                >
                  {weekdays[index]}
                </span>
                <span
                  className={cx(
                    'grid aspect-square w-full max-w-9 place-items-center rounded-full text-[13px] font-semibold tabular-nums',
                    day.done
                      ? 'bg-[var(--app-gold)]/14 text-[var(--app-gold)] ring-1 ring-[var(--app-gold)]/45 ring-inset'
                      : day.isToday
                        ? 'text-white ring-2 ring-[var(--app-gold)] ring-inset'
                        : day.future
                          ? 'text-white/25'
                          : 'bg-white/[0.05] text-white/55',
                  )}
                >
                  {day.done ? <ElevnMark className="w-[58%]" /> : day.date.getDate()}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </button>

      {/* Today's workout */}
      <section className="mt-7">
        <SectionTitle action={<LinkButton onClick={() => setTab('treino')}>Ver todos</LinkButton>}>
          Treino de hoje
        </SectionTitle>
        <Card className="relative mx-5 overflow-hidden p-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full opacity-30 blur-2xl"
            style={{ background: 'var(--app-gold-deep)' }}
          />
          <button
            type="button"
            onClick={() => push({ name: 'workout', code: workout.code })}
            className="relative flex w-full items-start gap-4 text-left"
          >
            <LetterBadge code={workout.code} size="xl" />
            <span className="min-w-0 flex-1 pt-0.5">
              <span className="block text-[20px] leading-6 font-semibold tracking-[-0.01em]">
                {workout.title}
              </span>
              <span className="mt-1 block text-[13px] text-white/55">
                {workout.minutes} min · {workout.exercises.length} exercícios
              </span>
              <span className="mt-2.5 flex flex-wrap gap-1.5">
                <Chip tone="gold">{doneToday ? 'Concluído hoje' : 'Próximo treino'}</Chip>
                <Chip>Feito {workout.timesDone}x</Chip>
              </span>
            </span>
            <Icon name="chevronRight" className="mt-1 size-5 text-white/35" />
          </button>
          <div className="relative mt-5">
            {session ? (
              <GoldButton onClick={() => push({ name: 'session' })}>Continuar treino</GoldButton>
            ) : doneToday ? (
              <p className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-[var(--app-green)]/12 text-sm font-semibold text-[var(--app-green)]">
                <Icon name="check" className="size-4" /> Treino registrado. Bom trabalho!
              </p>
            ) : (
              <GoldButton onClick={() => startSession(workout.code)}>Começar treino</GoldButton>
            )}
          </div>
        </Card>
      </section>

      {/* Training adherence */}
      <section className="mt-7">
        <SectionTitle>Como você está indo</SectionTitle>
        <button
          type="button"
          onClick={() => push({ name: 'calendar' })}
          className="mx-5 block w-[calc(100%-40px)] text-left"
        >
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <Face score={adherence.mood} className="size-14 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className={cx('text-[17px] font-semibold', copy.tone)}>
                  {copy.title(adherence)}
                </p>
                <p className="mt-0.5 text-[13px] leading-5 text-white/60">{copy.text(adherence)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between text-xs text-white/55">
              <span>
                <strong className="text-base font-semibold text-white tabular-nums">
                  {adherence.done}
                </strong>{' '}
                de {adherence.target} treinos nesta semana
              </span>
              <span className="font-semibold text-white tabular-nums">{adherence.rate}%</span>
            </div>
            <ol className="mt-2 flex gap-1.5" aria-hidden>
              {Array.from({ length: adherence.target }, (_, index) => (
                <li
                  key={index}
                  className={cx(
                    'h-2 flex-1 rounded-full',
                    index < adherence.done
                      ? adherence.mood === 5
                        ? 'bg-[var(--app-green)]'
                        : adherence.mood === 3
                          ? 'bg-[var(--app-gold)]'
                          : 'bg-[var(--app-red)]'
                      : index < adherence.expected
                        ? 'bg-white/[0.16]'
                        : 'bg-white/[0.07]',
                  )}
                />
              ))}
            </ol>
            <p className="mt-3 text-xs text-white/45">
              Meta semanal: {adherence.target} treinos · renova todo domingo
            </p>
          </Card>
        </button>
      </section>

      {/* Next meal */}
      <section className="mt-7">
        <SectionTitle action={<LinkButton onClick={() => setTab('dieta')}>Dieta</LinkButton>}>
          Próxima refeição
        </SectionTitle>
        <button
          type="button"
          onClick={() => setTab('dieta')}
          className="mx-5 block w-[calc(100%-40px)] text-left"
        >
          <Card className="flex items-center gap-4 p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--app-gold)]/12 text-[var(--app-gold)]">
              <Icon name="nutrition" className="size-6" />
            </span>
            {nextMeal ? (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {nextSwap ? nextSwap.name : nextMeal.name}
                  </span>
                  <span className="block truncate text-[13px] text-white/50">
                    {nextMeal.time} · {nextFoods.map((food) => food.name).join(', ')}
                  </span>
                </span>
                <span className="text-sm font-semibold text-white/80 tabular-nums">
                  {nextKcal} kcal
                </span>
              </>
            ) : (
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">Dieta do dia completa</span>
                <span className="block text-[13px] text-white/50">
                  Todas as refeições de hoje foram marcadas.
                </span>
              </span>
            )}
          </Card>
        </button>
      </section>
    </div>
  )
}
