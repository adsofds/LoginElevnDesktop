'use client'

import { useState } from 'react'
import {
  nextWorkoutCode,
  studentProfile,
  workoutHistory,
  workouts,
  type Exercise,
  type SetType,
  type Workout,
} from '@/lib/demo-student-app'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { trainedDaysThisMonth, weekStreak } from './HomeTab'
import { useStudentApp } from './StudentApp'
import {
  Card,
  Chip,
  formatClock,
  GhostButton,
  GoldButton,
  LetterBadge,
  PhoneSheet,
  ScreenHeader,
  VideoTile,
} from './ui'

const workoutOf = (code: Workout['code']) => workouts.find((item) => item.code === code)!

const formatKg = (kg: number) => kg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

function repRange(exercise: Exercise) {
  const reps = exercise.sets.filter((set) => set.type !== 'aquecimento').map((set) => set.reps)
  const min = Math.min(...reps)
  const max = Math.max(...reps)
  return min === max ? `${min}` : `${min}–${max}`
}

function restLabel(seconds: number) {
  if (!seconds) return 'sem descanso'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m ? `${m}min${s ? ` ${s}s` : ''}` : `${s}s`
}

/* ---------------------------------------------------------------- Video */

function ExerciseVideoSheet({
  exercise,
  onClose,
}: {
  exercise: Exercise | null
  onClose: () => void
}) {
  return (
    <PhoneSheet open={!!exercise} onClose={onClose} title={exercise?.name ?? ''}>
      {exercise && (
        <>
          <div className="relative mx-auto grid aspect-[4/5] w-full max-w-[300px] place-items-center overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.10),transparent_60%),linear-gradient(160deg,#2a2536,#121019)] ring-1 ring-white/10 ring-inset">
            <div className="text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--app-gold)] text-[#0d0a21] shadow-[0_8px_30px_-8px_var(--app-gold)]">
                <svg
                  viewBox="0 0 24 24"
                  className="ml-1 size-7"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M7 4.5v15l13-7.5z" />
                </svg>
              </span>
              <p className="mt-4 text-sm font-semibold">Vídeo do {studentProfile.coachFirstName}</p>
              <p className="text-xs text-white/50 tabular-nums">{exercise.videoLength}</p>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-white/45">
            O {studentProfile.coachFirstName} grava a execução de cada exercício. Na demonstração, o
            espaço do vídeo.
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              ['Músculo', exercise.muscle],
              ['Equipamento', exercise.equipment],
              ['Descanso', restLabel(exercise.restSec)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/[0.05] px-2 py-2.5">
                <dt className="text-[11px] text-white/50">{label}</dt>
                <dd className="mt-0.5 text-[13px] font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          {exercise.trainerNote && (
            <p className="mt-4 rounded-2xl border-l-2 border-[var(--app-gold)] bg-white/[0.04] px-3 py-2.5 text-sm leading-5 text-white/80">
              <span className="block text-[11px] font-semibold text-[var(--app-gold)]">
                Dica do {studentProfile.coachFirstName}
              </span>
              {exercise.trainerNote}
            </p>
          )}
        </>
      )}
    </PhoneSheet>
  )
}

/* ---------------------------------------------------------------- List */

export function WorkoutTab() {
  const { push } = useStudentApp()
  const [view, setView] = useState<'plano' | 'historico'>('plano')

  return (
    <div>
      <ScreenHeader
        title="Treinos"
        action={
          <button
            type="button"
            onClick={() => push({ name: 'calendar' })}
            className="flex h-10 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-sm font-medium ring-1 ring-white/10 ring-inset"
          >
            <Icon name="calendar" className="size-4" /> Calendário
          </button>
        }
      />
      <div
        role="tablist"
        aria-label="Treinos"
        className="mx-5 grid grid-cols-2 rounded-full bg-white/[0.06] p-1"
      >
        {(
          [
            ['plano', 'Meu plano'],
            ['historico', 'Histórico'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={cx(
              'h-9 rounded-full text-sm font-semibold transition-colors',
              view === id ? 'bg-white text-[#0d0a21]' : 'text-white/55',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'plano' ? (
        <div className="px-5 pt-5">
          <p className="text-[13px] leading-5 text-white/55">
            Montado pelo {studentProfile.coach}. Siga na ordem e repita: A → B → C → D.
          </p>
          <ul className="mt-4 space-y-3">
            {workouts.map((workout) => {
              const recommended = workout.code === nextWorkoutCode
              return (
                <li key={workout.code}>
                  <button
                    type="button"
                    onClick={() => push({ name: 'workout', code: workout.code })}
                    className={cx(
                      'flex w-full items-center gap-4 rounded-[24px] bg-[var(--app-card)] p-4 text-left ring-1 ring-inset active:bg-[var(--app-card-2)]',
                      recommended ? 'ring-[var(--app-gold)]/45' : 'ring-white/[0.06]',
                    )}
                  >
                    <LetterBadge code={workout.code} size="lg" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[17px] font-semibold">{workout.title}</span>
                      </span>
                      <span className="mt-0.5 block text-[13px] text-white/50">
                        {workout.minutes} min · {workout.exercises.length} exercícios
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {recommended && <Chip tone="gold">Próximo</Chip>}
                        <Chip>Feito {workout.timesDone}x</Chip>
                      </span>
                    </span>
                    <Icon name="chevronRight" className="size-5 shrink-0 text-white/35" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <HistoryList />
      )}
    </div>
  )
}

function HistoryList() {
  const { lastFinished } = useStudentApp()
  const entries = [
    ...(lastFinished
      ? [
          {
            daysAgo: 0,
            code: lastFinished.code,
            minutes: Math.max(1, Math.round(lastFinished.seconds / 60)),
            sets: lastFinished.sets,
            prs: lastFinished.prs,
            comment: undefined as string | undefined,
          },
        ]
      : []),
    ...workoutHistory,
  ]
  // Most recent first: the newest session of each workout is its highest count.
  const counters = Object.fromEntries(
    workouts.map((workout) => [
      workout.code,
      workout.timesDone + (lastFinished?.code === workout.code ? 1 : 0),
    ]),
  ) as Record<Workout['code'], number>
  const numbered = entries.map((entry) => ({ ...entry, nth: counters[entry.code]-- }))

  const dayLabel = (daysAgo: number) => {
    if (daysAgo === 0) return 'Hoje'
    if (daysAgo === 1) return 'Ontem'
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
      .format(date)
      .replaceAll('.', '')
  }

  return (
    <div className="px-5 pt-5">
      <ul className="grid grid-cols-4 gap-2" aria-label="Vezes que você fez cada treino">
        {workouts.map((workout) => (
          <li key={workout.code}>
            <Card className="flex flex-col items-center py-3">
              <LetterBadge code={workout.code} />
              <span className="mt-2 text-lg font-bold tabular-nums">
                {workout.timesDone + (lastFinished?.code === workout.code ? 1 : 0)}x
              </span>
            </Card>
          </li>
        ))}
      </ul>
      <ul className="mt-4 space-y-3">
        {numbered.map((entry, index) => {
          const workout = workoutOf(entry.code)
          return (
            <li key={index}>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <LetterBadge code={entry.code} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{workout.title}</p>
                    <p className="text-xs text-white/50 first-letter:uppercase">
                      {dayLabel(entry.daysAgo)}
                    </p>
                  </div>
                  <Chip tone="gold">{entry.nth}ª vez</Chip>
                </div>
                <dl className="mt-3 flex gap-6 text-sm">
                  <div>
                    <dt className="text-[11px] text-white/45">Duração</dt>
                    <dd className="font-semibold tabular-nums">{entry.minutes} min</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-white/45">Séries</dt>
                    <dd className="font-semibold tabular-nums">{entry.sets}</dd>
                  </div>
                  {entry.prs > 0 && (
                    <div>
                      <dt className="text-[11px] text-white/45">Recordes</dt>
                      <dd className="font-semibold tabular-nums">🏆 {entry.prs}</dd>
                    </div>
                  )}
                </dl>
                {entry.comment && (
                  <p className="mt-3 rounded-2xl bg-white/[0.04] px-3 py-2 text-[13px] text-white/70">
                    <span className="text-white/45">Seu comentário: </span>
                    {entry.comment}
                  </p>
                )}
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function HistoryScreen() {
  const { pop } = useStudentApp()
  return (
    <div>
      <ScreenHeader title="Histórico" onBack={pop} />
      <HistoryList />
    </div>
  )
}

/* ---------------------------------------------------------------- Detail */

export function WorkoutDetail({ code }: { code: Workout['code'] }) {
  const { pop, startSession, session, push } = useStudentApp()
  const workout = workoutOf(code)
  const [video, setVideo] = useState<Exercise | null>(null)
  const sets = workout.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)
  const otherSession = session && session.code !== code

  return (
    <div className="relative">
      <ScreenHeader title={`Treino ${workout.code}`} onBack={pop} />
      <div className="px-5">
        <div className="flex items-center gap-4">
          <LetterBadge code={workout.code} size="xl" />
          <div className="min-w-0">
            <p className="text-[13px] text-white/50">
              Treino {workout.code} · {workout.focus}
            </p>
            <h2 className="text-[26px] leading-8 font-semibold tracking-[-0.02em]">
              {workout.title}
            </h2>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {workout.muscles.map((muscle) => (
            <Chip key={muscle}>{muscle}</Chip>
          ))}
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-2">
          {[
            ['Duração', `${workout.minutes} min`],
            ['Séries', String(sets)],
            ['Já fez', `${workout.timesDone}x`],
          ].map(([label, value]) => (
            <Card key={label} className="py-3 text-center">
              <dd className="text-lg font-bold tabular-nums">{value}</dd>
              <dt className="text-[11px] text-white/50">{label}</dt>
            </Card>
          ))}
        </dl>

        <h2 className="mt-7 mb-1 text-[17px] font-semibold">Exercícios</h2>
        <p className="mb-2 text-xs text-white/45">
          Toque no vídeo para ver a execução gravada pelo {studentProfile.coachFirstName}.
        </p>
        <ol className="divide-y divide-[var(--app-line)]">
          {workout.exercises.map((exercise, index) => (
            <li key={exercise.id} className="flex items-center gap-3 py-3">
              <VideoTile
                label={exercise.name}
                length={exercise.videoLength}
                onPlay={() => setVideo(exercise)}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  <span className="text-white/35 tabular-nums">{index + 1}. </span>
                  {exercise.name}
                </p>
                <p className="text-[13px] text-white/50">
                  {exercise.sets.length} séries · {repRange(exercise)} reps ·{' '}
                  {restLabel(exercise.restSec)}
                </p>
                {exercise.trainerNote && (
                  <p className="mt-0.5 truncate text-xs text-[var(--app-gold)]">
                    💬 {exercise.trainerNote}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="sticky bottom-0 mt-4 bg-gradient-to-t from-[var(--app-bg)] via-[var(--app-bg)] to-transparent px-5 pt-6 pb-2">
        {session?.code === code ? (
          <GoldButton onClick={() => push({ name: 'session' })}>Continuar treino</GoldButton>
        ) : (
          <GoldButton disabled={!!otherSession} onClick={() => startSession(code)}>
            {otherSession ? 'Finalize o treino em andamento primeiro' : 'Começar treino'}
          </GoldButton>
        )}
      </div>

      <ExerciseVideoSheet exercise={video} onClose={() => setVideo(null)} />
    </div>
  )
}

/* ---------------------------------------------------------------- Live session (Hevy) */

const setTag: Record<SetType, { label: string; className: string; title: string }> = {
  aquecimento: { label: 'A', className: 'text-[var(--app-gold)]', title: 'Aquecimento' },
  normal: { label: '', className: 'text-white', title: 'Série' },
  falha: { label: 'F', className: 'text-[var(--app-red)]', title: 'Até a falha' },
}

export function SessionScreen() {
  const {
    session,
    now,
    pop,
    updateSet,
    toggleSetDone,
    addSet,
    adjustRest,
    skipRest,
    finishSession,
    discardSession,
  } = useStudentApp()
  const [video, setVideo] = useState<Exercise | null>(null)
  const [confirm, setConfirm] = useState<'finalizar' | 'descartar' | null>(null)

  if (!session) {
    return (
      <div className="px-5 pt-10 text-center text-white/60">
        Nenhum treino em andamento.
        <GhostButton className="mx-auto mt-4" onClick={pop}>
          Voltar
        </GhostButton>
      </div>
    )
  }

  const workout = workoutOf(session.code)
  const elapsed = Math.round((now - session.startedAt) / 1000)
  let volume = 0
  let doneSets = 0
  let totalSets = 0
  for (const exercise of workout.exercises) {
    for (const set of session.sets[exercise.id]) {
      totalSets += 1
      if (set.done) {
        doneSets += 1
        if (exercise.muscle !== 'Cardio')
          volume += (Number(set.kgInput.replace(',', '.')) || 0) * (Number(set.repsInput) || 0)
      }
    }
  }
  const restLeft = session.rest ? Math.max(0, Math.ceil((session.rest.endsAt - now) / 1000)) : 0

  return (
    <div className="relative">
      <header className="sticky top-0 z-20 border-b border-[var(--app-line)] bg-[var(--app-bg)]/95 px-4 pt-2 pb-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={pop}
            aria-label="Minimizar treino"
            className="grid size-10 place-items-center rounded-full text-white/80"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-wide text-white/50 uppercase">
              Treino {workout.code}
            </p>
            <p className="truncate font-semibold">{workout.title}</p>
          </div>
          <button
            type="button"
            onClick={() => setConfirm('finalizar')}
            className="h-9 rounded-full bg-[var(--app-gold)] px-4 text-sm font-semibold text-[#0d0a21]"
          >
            Finalizar
          </button>
        </div>
        <dl className="mt-2 grid grid-cols-3 px-2 text-center">
          <div>
            <dt className="text-[11px] text-white/45">Duração</dt>
            <dd className="font-semibold text-[var(--app-gold)] tabular-nums">
              {formatClock(elapsed)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-white/45">Volume</dt>
            <dd className="font-semibold tabular-nums">{formatKg(volume)} kg</dd>
          </div>
          <div>
            <dt className="text-[11px] text-white/45">Séries</dt>
            <dd className="font-semibold tabular-nums">
              {doneSets}/{totalSets}
            </dd>
          </div>
        </dl>
      </header>

      <div className={cx('space-y-7 px-4 pt-5', session.rest ? 'pb-40' : 'pb-8')}>
        {workout.exercises.map((exercise) => {
          const logs = session.sets[exercise.id]
          let normalIndex = 0
          return (
            <section key={exercise.id} aria-label={exercise.name}>
              <div className="flex items-center gap-3">
                <VideoTile
                  label={exercise.name}
                  length={exercise.videoLength}
                  size="sm"
                  onPlay={() => setVideo(exercise)}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[15px] font-semibold text-[var(--app-gold)]">
                    {exercise.name}
                  </h2>
                  <p className="text-xs text-white/50">
                    {exercise.muscle} · descanso {restLabel(exercise.restSec)}
                  </p>
                </div>
              </div>
              {exercise.trainerNote && (
                <p className="mt-2 rounded-lg bg-white/[0.04] px-3 py-2 text-[13px] leading-5 text-white/70">
                  💬 {exercise.trainerNote}
                </p>
              )}

              <table className="mt-3 w-full border-separate border-spacing-y-1 text-center text-sm">
                <thead>
                  <tr className="text-[11px] font-semibold tracking-wide text-white/40 uppercase">
                    <th scope="col" className="w-10 font-semibold">
                      Série
                    </th>
                    <th scope="col" className="font-semibold">
                      Anterior
                    </th>
                    <th scope="col" className="w-16 font-semibold">
                      {exercise.muscle === 'Cardio' ? 'km/h' : 'kg'}
                    </th>
                    <th scope="col" className="w-16 font-semibold">
                      {exercise.name.includes('(segundos)')
                        ? 'seg'
                        : exercise.name.includes('(min)')
                          ? 'min'
                          : 'reps'}
                    </th>
                    <th scope="col" className="w-11 font-semibold">
                      <span className="sr-only">Feita</span>
                      <Icon name="check" className="mx-auto size-4" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((set, index) => {
                    if (set.type !== 'aquecimento') normalIndex += 1
                    const tag = setTag[set.type]
                    const label = tag.label || String(normalIndex)
                    return (
                      <tr
                        key={index}
                        className={cx(
                          'transition-colors',
                          set.done ? 'bg-[var(--app-green)]/15' : '',
                        )}
                      >
                        <td
                          className={cx('rounded-l-lg py-1.5 font-bold', tag.className)}
                          title={tag.title}
                        >
                          {label}
                          <span className="sr-only"> ({tag.title})</span>
                        </td>
                        <td className="py-1.5 text-[13px] text-white/45 tabular-nums">
                          {set.previous
                            ? `${formatKg(set.previous.kg)} × ${set.previous.reps}`
                            : '—'}
                        </td>
                        <td className="py-1.5">
                          <input
                            inputMode="decimal"
                            value={set.kgInput}
                            placeholder={formatKg(set.kg)}
                            onChange={(event) =>
                              updateSet(exercise.id, index, {
                                kgInput: event.target.value.replace(/[^\d.,]/g, ''),
                              })
                            }
                            aria-label={`${exercise.name}, série ${label}: carga`}
                            className="h-9 w-14 rounded-lg bg-white/[0.07] text-center font-semibold text-white tabular-nums placeholder:font-normal placeholder:text-white/35 focus:bg-white/15 focus:outline-none"
                          />
                        </td>
                        <td className="py-1.5">
                          <input
                            inputMode="numeric"
                            value={set.repsInput}
                            placeholder={String(set.reps)}
                            onChange={(event) =>
                              updateSet(exercise.id, index, {
                                repsInput: event.target.value.replace(/\D/g, ''),
                              })
                            }
                            aria-label={`${exercise.name}, série ${label}: repetições`}
                            className="h-9 w-14 rounded-lg bg-white/[0.07] text-center font-semibold text-white tabular-nums placeholder:font-normal placeholder:text-white/35 focus:bg-white/15 focus:outline-none"
                          />
                        </td>
                        <td className="rounded-r-lg py-1.5">
                          <button
                            type="button"
                            onClick={() => toggleSetDone(exercise.id, index)}
                            aria-pressed={set.done}
                            aria-label={`${set.done ? 'Desmarcar' : 'Concluir'} série ${label} de ${exercise.name}`}
                            className={cx(
                              'mx-auto grid size-9 place-items-center rounded-lg transition-all active:scale-90',
                              set.done
                                ? 'bg-[var(--app-green)] text-[#06210f]'
                                : 'bg-white/[0.07] text-white/50',
                            )}
                          >
                            <Icon name="check" className="size-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <button
                type="button"
                onClick={() => addSet(exercise.id)}
                className="mt-2 h-10 w-full rounded-xl bg-white/[0.05] text-sm font-medium text-white/80 active:bg-white/10"
              >
                + Adicionar série
              </button>
            </section>
          )
        })}

        <button
          type="button"
          onClick={() => setConfirm('descartar')}
          className="h-11 w-full rounded-xl text-sm font-medium text-[var(--app-red)]"
        >
          Descartar treino
        </button>
      </div>

      {session.rest && (
        <div
          role="timer"
          aria-label="Descanso"
          className="sticky bottom-3 z-30 mx-3 rounded-2xl bg-[var(--app-card-2)] p-4 shadow-2xl ring-1 ring-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-wide text-white/50 uppercase">
                Descanso
              </p>
              <p className="truncate text-xs text-white/60">{session.rest.exercise}</p>
            </div>
            <span
              className="text-[32px] leading-none font-bold text-[var(--app-gold)] tabular-nums"
              aria-live="off"
            >
              {formatClock(restLeft)}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--app-gold)] transition-[width] duration-1000 ease-linear"
              style={{ width: `${(restLeft / session.rest.total) * 100}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => adjustRest(-15)}
              className="h-9 rounded-lg bg-white/[0.08] text-sm font-semibold"
            >
              −15s
            </button>
            <button
              type="button"
              onClick={() => adjustRest(15)}
              className="h-9 rounded-lg bg-white/[0.08] text-sm font-semibold"
            >
              +15s
            </button>
            <button
              type="button"
              onClick={skipRest}
              className="h-9 rounded-lg bg-[var(--app-gold)] text-sm font-semibold text-[#0d0a21]"
            >
              Pular
            </button>
          </div>
        </div>
      )}

      <PhoneSheet
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === 'descartar' ? 'Descartar treino?' : 'Finalizar treino?'}
      >
        {confirm === 'descartar' ? (
          <>
            <p className="text-sm text-white/70">As séries marcadas neste treino serão perdidas.</p>
            <button
              type="button"
              onClick={discardSession}
              className="mt-5 h-12 w-full rounded-full bg-[var(--app-red)] font-semibold text-white"
            >
              Descartar
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-white/70">
              {doneSets
                ? `${doneSets} de ${totalSets} séries concluídas em ${formatClock(elapsed)}.`
                : 'Você ainda não marcou nenhuma série. Marque as séries feitas com ✓ antes de salvar.'}
            </p>
            {doneSets > 0 && doneSets < totalSets && (
              <p className="mt-2 text-xs text-white/45">
                As séries não marcadas ficam de fora do registro.
              </p>
            )}
            <GoldButton className="mt-5" disabled={!doneSets} onClick={finishSession}>
              Salvar treino
            </GoldButton>
          </>
        )}
        <GhostButton className="mt-2 w-full border-0" onClick={() => setConfirm(null)}>
          Continuar treinando
        </GhostButton>
      </PhoneSheet>

      <ExerciseVideoSheet exercise={video} onClose={() => setVideo(null)} />
    </div>
  )
}

/* ---------------------------------------------------------------- Summary */

export function SummaryScreen() {
  const { lastFinished, setTab } = useStudentApp()
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const [share, setShare] = useState(false)
  if (!lastFinished) return null
  const workout = workoutOf(lastFinished.code)
  const times = workout.timesDone + 1

  return (
    <div className="px-5 pt-8">
      <div className="text-center">
        <span
          className="mx-auto grid size-20 place-items-center rounded-full bg-[var(--app-gold)]/15 text-4xl"
          aria-hidden="true"
        >
          🏆
        </span>
        <h1 className="mt-4 text-[26px] font-semibold tracking-[-0.02em]">Treino concluído!</h1>
        <p className="mt-1 text-sm text-white/60">
          Treino {workout.code} · {workout.title}
        </p>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-2">
        {[
          ['Duração', formatClock(lastFinished.seconds)],
          ['Séries', String(lastFinished.sets)],
          ['Vezes neste treino', `${times}ª`],
          ['Recordes', lastFinished.prs ? `🏆 ${lastFinished.prs}` : '—'],
        ].map(([label, value]) => (
          <Card key={label} className="px-4 py-4">
            <dt className="text-xs text-white/50">{label}</dt>
            <dd className="mt-0.5 text-2xl font-bold tabular-nums">{value}</dd>
          </Card>
        ))}
      </dl>

      <Card className="mt-4 p-4">
        {sent ? (
          <p className="flex items-center gap-2 text-sm text-[var(--app-green)]">
            <Icon name="check" className="size-4" /> Comentário enviado para o{' '}
            {studentProfile.coachFirstName}.
          </p>
        ) : (
          <>
            <label htmlFor="treino-comentario" className="text-sm font-semibold">
              Comentário para o {studentProfile.coachFirstName}{' '}
              <span className="font-normal text-white/45">(opcional)</span>
            </label>
            <textarea
              id="treino-comentario"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              maxLength={280}
              placeholder="Como foi? Sentiu alguma dor, alguma carga ficou leve?"
              className="mt-2 w-full resize-none rounded-2xl bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:bg-white/10 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-white/45">
              Ele vê na sua ficha. Para conversar, use o WhatsApp.
            </p>
            <GhostButton className="mt-3 w-full" onClick={() => comment.trim() && setSent(true)}>
              Enviar comentário
            </GhostButton>
          </>
        )}
      </Card>

      <div className="mt-6 space-y-2">
        <GoldButton onClick={() => setShare(true)}>Compartilhar treino</GoldButton>
        <GhostButton className="w-full" onClick={() => setTab('inicio')}>
          Voltar ao início
        </GhostButton>
      </div>

      <PhoneSheet open={share} onClose={() => setShare(false)} title="Compartilhar">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_80%_0%,var(--app-gold-deep),transparent_55%),linear-gradient(170deg,#1f1c2a,#0b0a12)] p-5 ring-1 ring-white/10 ring-inset">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/wordmark-beige.png" alt="Elevn" className="h-5 w-auto" />
          <div className="absolute inset-x-5 bottom-5">
            <LetterBadge code={workout.code} size="lg" />
            <p className="mt-3 text-xs font-semibold text-[var(--app-gold)]">
              TREINO {workout.code} · {times}ª VEZ
            </p>
            <p className="text-xl leading-6 font-semibold">{workout.title}</p>
            <p className="mt-2 text-sm text-white/75 tabular-nums">
              {formatClock(lastFinished.seconds)} · {lastFinished.sets} séries
            </p>
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-white/45">
          Rascunho. Os modelos finais de compartilhamento estão com a Lunaris.
        </p>
      </PhoneSheet>
    </div>
  )
}

/* ---------------------------------------------------------------- Calendar (Smart Fit) */

export function CalendarScreen() {
  const { pop, setTab, lastFinished } = useStudentApp()
  const today = new Date()
  const [selected, setSelected] = useState(today.getDate())
  const trained = trainedDaysThisMonth()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7 // Monday first
  const isDone = (day: number) =>
    (day === today.getDate() && lastFinished) || (day <= today.getDate() && trained[day - 1])
  const monthCount = Array.from({ length: today.getDate() }, (_, i) => i + 1).filter((day) =>
    isDone(day),
  ).length
  const streak = weekStreak(trained, today)
  const selectedDate = new Date(year, month, selected)
  const history = workoutHistory.find((entry) => today.getDate() - entry.daysAgo === selected)
  const doneSelected = isDone(selected)
  const code = history?.code ?? (['A', 'B', 'C', 'D'] as const)[selected % 4]

  return (
    <div>
      <ScreenHeader title="Calendário" onBack={pop} />
      <div className="grid grid-cols-2 gap-2 px-5">
        <Card className="py-4 text-center">
          <p className="text-2xl font-bold tabular-nums">🔥 {streak}</p>
          <p className="text-xs text-white/55">Semanas seguidas</p>
        </Card>
        <Card className="py-4 text-center">
          <p className="text-2xl font-bold tabular-nums">{monthCount}</p>
          <p className="text-xs text-white/55">Treinos no mês</p>
        </Card>
      </div>

      <p className="mt-6 text-center text-[17px] font-semibold first-letter:uppercase">
        {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(today)}
      </p>
      <div
        className="mt-4 grid grid-cols-7 gap-y-2 px-3 text-center"
        role="grid"
        aria-label="Dias do mês"
      >
        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => (
          <span key={index} className="text-xs font-semibold text-white/60" aria-hidden="true">
            {day}
          </span>
        ))}
        {Array.from({ length: firstWeekday }, (_, index) => (
          <span key={`pad-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1
          const future = day > today.getDate()
          const done = isDone(day)
          const isSelected = day === selected
          return (
            <button
              key={day}
              type="button"
              role="gridcell"
              disabled={future}
              aria-selected={isSelected}
              aria-label={`${day}${done ? ', treinou' : ''}`}
              onClick={() => setSelected(day)}
              className={cx(
                'mx-auto grid size-11 place-items-center rounded-xl text-[15px] font-semibold tabular-nums transition-colors',
                future && 'text-white/25',
                !future && done && 'bg-[var(--app-gold-deep)] text-[var(--app-gold)]',
                !future && !done && 'text-white/85',
                isSelected && 'ring-2 ring-[var(--app-gold)]',
              )}
            >
              {day === today.getDate() ? 'Hoje' : day}
            </button>
          )
        })}
      </div>

      <div className="mt-6 border-t border-[var(--app-line)] px-5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[17px] font-semibold first-letter:uppercase">
            {selected === today.getDate()
              ? 'Hoje'
              : new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric' }).format(
                  selectedDate,
                )}
          </p>
          {selected === today.getDate() && !lastFinished && (
            <GhostButton onClick={() => setTab('treino')}>+ Registrar treino</GhostButton>
          )}
        </div>
        {doneSelected ? (
          <Card className="mt-3 flex items-center gap-3 p-4">
            <LetterBadge code={code} />
            <div>
              <p className="font-semibold">{workoutOf(code).title}</p>
              <p className="text-xs text-white/55">
                {history ? `${history.minutes} min · ${history.sets} séries` : 'Treino registrado'}
              </p>
            </div>
          </Card>
        ) : (
          <p className="mt-6 text-center text-sm text-white/50">
            Nenhum treino registrado nesta data
          </p>
        )}
      </div>
    </div>
  )
}
