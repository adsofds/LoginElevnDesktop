'use client'

import { useState, type ReactNode } from 'react'
import {
  nextWorkoutCode,
  studentProfile,
  workouts,
  type Exercise,
  type SetType,
  type Workout,
} from '@/lib/demo-student-app'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { BodyMap, workedLabel } from './BodyMap'
import {
  dayLabel,
  durationLabel,
  formatSet,
  musclesOf,
  workLabel,
  useDoneWorkouts,
  useTimesDone,
  workoutOf,
  type DoneWorkout,
} from './history'
import { trainedDaysThisMonth, weekStreak } from './HomeTab'
import { useStudentApp, type SetLog } from './StudentApp'
import {
  Card,
  Chip,
  formatClock,
  GhostButton,
  GoldButton,
  ElevnMark,
  LetterBadge,
  PhoneSheet,
  ScreenHeader,
  VideoTile,
} from './ui'

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
              view === id ? 'bg-white text-[var(--app-on-fg)]' : 'text-white/55',
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
  const { push } = useStudentApp()
  const done = useDoneWorkouts()
  const times = useTimesDone()
  const total = Object.values(times).reduce((sum, value) => sum + value, 0)
  const max = Math.max(...Object.values(times))

  return (
    <div className="px-5 pt-5">
      <Card className="p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[13px] text-white/55">Desde o início do plano</p>
            <p className="mt-0.5 text-[28px] leading-8 font-bold tracking-[-0.02em] tabular-nums">
              {total} <span className="text-base font-semibold text-white/60">treinos</span>
            </p>
          </div>
          <Chip tone="gold">A → B → C → D</Chip>
        </div>
        <ul className="mt-5 space-y-4" aria-label="Quantas vezes você fez cada treino">
          {workouts.map((workout) => {
            const last = done.find((item) => item.code === workout.code)
            return (
              <li key={workout.code} className="flex items-center gap-3">
                <LetterBadge code={workout.code} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{workout.title}</p>
                    <p className="shrink-0 text-lg leading-none font-bold tabular-nums">
                      {times[workout.code]}
                      <span className="text-xs font-semibold text-white/50">x</span>
                    </p>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--app-gold-deep),var(--app-gold))]"
                      style={{ width: `${(times[workout.code] / max) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-white/45 first-letter:uppercase">
                    {last ? `Último: ${dayLabel(last.date).toLowerCase()}` : 'Sem registro recente'}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      <h2 className="mt-7 mb-3 text-[17px] font-semibold">Treinos feitos</h2>
      <ul className="space-y-2.5">
        {done.map((item) => {
          const workout = workoutOf(item.code)
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => push({ name: 'done', key: item.key })}
                className="flex w-full items-center gap-3.5 rounded-[22px] bg-[var(--app-card)] p-3.5 text-left ring-1 ring-white/[0.06] ring-inset active:bg-[var(--app-card-2)]"
              >
                <span className="flex w-11 shrink-0 flex-col items-center border-r border-white/10 pr-3">
                  <span className="text-[10px] font-semibold tracking-wide text-white/50 uppercase">
                    {new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
                      .format(item.date)
                      .replace('.', '')}
                  </span>
                  <span className="text-xl leading-6 font-bold tabular-nums">
                    {item.date.getDate()}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold text-[var(--app-gold)]">
                    Treino {item.code} · {item.nth}ª vez
                    {item.key === 'hoje' && ' · hoje'}
                  </span>
                  <span className="block truncate font-semibold">{workout.title}</span>
                  <span className="mt-0.5 block text-xs text-white/50 tabular-nums">
                    {Math.round(item.seconds / 60)} min · {workLabel(item)}
                    {item.prs > 0 && ` · 🏆 ${item.prs}`}
                  </span>
                </span>
                <BodyMap
                  muscles={musclesOf(item)}
                  width={52}
                  height={52}
                  className="-mr-1 shrink-0"
                />
              </button>
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

/* ---------------------------------------------------------------- Recap card (MFIT) */

/** The card shown after finishing a workout and in the history: what was done, at a glance. */
function RecapCard({ done, children }: { done: DoneWorkout; children?: ReactNode }) {
  const workout = workoutOf(done.code)
  const muscles = musclesOf(done)
  return (
    <section
      aria-label={`Resumo do treino ${done.code}`}
      className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(110%_70%_at_100%_0%,color-mix(in_srgb,var(--app-gold-deep)_75%,transparent),transparent_65%),linear-gradient(165deg,#231f2f,#121019)] p-5 ring-1 ring-white/10 ring-inset"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold tracking-[0.25em] text-[var(--app-gold)]">
          ELEVN
        </span>
        <span className="text-xs text-white/60 first-letter:uppercase">
          {dayLabel(done.date)} ·{' '}
          {done.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-3.5">
        <LetterBadge code={done.code} size="lg" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--app-gold)]">
            Treino {done.code} · {done.nth}ª vez
          </p>
          <h2 className="text-[22px] leading-7 font-semibold tracking-[-0.01em]">
            {workout.title}
          </h2>
        </div>
      </div>
      <BodyMap
        muscles={muscles}
        className="mx-auto mt-4 h-[220px] w-auto"
        label={`Músculos trabalhados: ${workedLabel(muscles)}`}
      />
      <p className="mt-2 flex items-center justify-center gap-4 text-[11px] text-white/55">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#f26a5d]" aria-hidden="true" /> Trabalhado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#f7bcb4]" aria-hidden="true" /> Auxiliar
        </span>
      </p>
      <dl className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-black/25 py-3 text-center">
        {[
          ['Duração', durationLabel(done.seconds)],
          ['Séries', done.sets ? String(done.sets) : '—'],
          ['Recordes', done.prs ? `🏆 ${done.prs}` : '—'],
        ].map(([label, value]) => (
          <div key={label}>
            <dd className="text-[17px] font-bold tabular-nums">{value}</dd>
            <dt className="text-[11px] text-white/50">{label}</dt>
          </div>
        ))}
      </dl>
      {children}
    </section>
  )
}

function ShareButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-[var(--app-on-fg)] active:scale-[0.98]"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Compartilhar
    </button>
  )
}

/* ---------------------------------------------------------------- Done workout (history detail) */

export function DoneWorkoutScreen({ doneKey }: { doneKey: string }) {
  const { pop, push } = useStudentApp()
  const done = useDoneWorkouts().find((item) => item.key === doneKey)
  if (!done) return null
  const setTagLabel = (type: SetType, normal: number) =>
    type === 'aquecimento' ? 'A' : type === 'falha' ? 'F' : String(normal)

  return (
    <div>
      <ScreenHeader
        title={dayLabel(done.date).replace(/^./, (letter) => letter.toUpperCase())}
        subtitle={`Treino ${done.code} · ${done.nth}ª vez`}
        onBack={pop}
      />
      <div className="px-5">
        <RecapCard done={done}>
          <ShareButton onClick={() => push({ name: 'share', key: done.key })} />
        </RecapCard>

        <h2 className="mt-7 mb-3 text-[17px] font-semibold">O que você fez</h2>
        {done.sets === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-white/70">
              Treino registrado sem séries anotadas. Exercícios do plano:
            </p>
            <ul className="mt-3 space-y-1.5">
              {done.exercises.map((exercise, index) => (
                <li key={exercise.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="text-white/35 tabular-nums">{index + 1}. </span>
                    {exercise.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-white/45">{exercise.muscle}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <ol className="space-y-2.5">
            {done.exercises.map((exercise, index) => {
              let normal = 0
              return (
                <li key={exercise.id}>
                  <Card className="p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="min-w-0 truncate font-semibold">
                        <span className="text-white/35 tabular-nums">{index + 1}. </span>
                        {exercise.name}
                      </p>
                      <span className="shrink-0 text-[11px] text-white/45">{exercise.muscle}</span>
                    </div>
                    {exercise.sets.length ? (
                      <ul className="mt-2.5 space-y-1">
                        {exercise.sets.map((set, setIndex) => {
                          if (set.type !== 'aquecimento') normal += 1
                          return (
                            <li
                              key={setIndex}
                              className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2 text-sm"
                            >
                              <span
                                className={cx(
                                  'w-4 text-center text-xs font-bold',
                                  set.type === 'aquecimento' && 'text-[var(--app-gold)]',
                                  set.type === 'falha' && 'text-[var(--app-red)]',
                                  set.type === 'normal' && 'text-white/50',
                                )}
                              >
                                {setTagLabel(set.type, normal)}
                              </span>
                              <span className="flex-1 font-medium tabular-nums">
                                {formatSet(exercise, set)}
                              </span>
                              {set.pr && <Chip tone="gold">🏆 Recorde</Chip>}
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="mt-2 text-[13px] text-white/45">Não feito neste dia.</p>
                    )}
                  </Card>
                </li>
              )
            })}
          </ol>
        )}
      </div>
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

      {/* The solid strip below the button covers the space reserved for the tab bar,
          so the list doesn't show between the button and the tabs. */}
      <div className="sticky bottom-0 mt-4 bg-gradient-to-t from-[var(--app-bg)] via-[var(--app-bg)] to-transparent px-5 pt-6 pb-2 after:absolute after:inset-x-0 after:top-full after:h-28 after:bg-[var(--app-bg)]">
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

/** A checked set that beats the last time (more kg × reps than "Anterior"). */
function isRecord(set: SetLog) {
  if (!set.done || !set.previous) return false
  const kg = Number(set.kgInput.replace(',', '.')) || 0
  const reps = Number(set.repsInput) || 0
  return kg > 0 && kg * reps > set.previous.kg * set.previous.reps
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
    swapExercise,
  } = useStudentApp()
  const [video, setVideo] = useState<Exercise | null>(null)
  const [confirm, setConfirm] = useState<'finalizar' | 'descartar' | null>(null)
  const [swapFor, setSwapFor] = useState<Exercise | null>(null)

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
        </div>
        <dl className="mt-2 grid grid-cols-3 px-2 text-center">
          <div>
            <dt className="text-[11px] text-white/45">Duração</dt>
            <dd className="font-semibold text-[var(--app-gold)] tabular-nums">
              {formatClock(elapsed)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-white/45">Peso levantado</dt>
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

      <div className="space-y-7 px-4 pt-5 pb-6">
        {workout.exercises.map((exercise) => {
          const logs = session.sets[exercise.id]
          const swapped = session.swaps?.[exercise.id]
          const shownName = swapped?.name ?? exercise.name
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
                    {shownName}
                  </h2>
                  <p className="truncate text-xs text-white/50">
                    {swapped
                      ? `Substituindo ${exercise.name}`
                      : `${exercise.muscle} · descanso ${restLabel(exercise.restSec)}`}
                  </p>
                </div>
                {exercise.alternatives && exercise.alternatives.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSwapFor(exercise)}
                    aria-label={`Trocar ${shownName}`}
                    className={cx(
                      'flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold',
                      swapped
                        ? 'bg-[var(--app-gold)]/15 text-[var(--app-gold)]'
                        : 'bg-white/[0.07] text-white/70',
                    )}
                  >
                    <Icon name="swap" className="size-3.5" />
                    {swapped ? 'Trocado' : 'Trocar'}
                  </button>
                )}
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
                          {isRecord(set) ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--app-gold)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--app-gold)]">
                              🏅 Recorde
                            </span>
                          ) : set.previous ? (
                            `${formatKg(set.previous.kg)} × ${set.previous.reps}`
                          ) : (
                            '—'
                          )}
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
                            aria-label={`${set.done ? 'Desmarcar' : 'Concluir'} série ${label} de ${shownName}`}
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

      {/* Follows the student down the list: rest timer (when running) + finish bar. The
          solid strip below covers the screen's bottom padding. */}
      <div className="sticky bottom-0 z-30 space-y-2 bg-gradient-to-t from-[var(--app-bg)] via-[var(--app-bg)]/95 to-transparent px-3 pt-6 pb-2 after:absolute after:inset-x-0 after:top-full after:h-8 after:bg-[var(--app-bg)]">
        {session.rest && (
          <div
            role="timer"
            aria-label="Descanso"
            className="rounded-2xl bg-[var(--app-card-2)] p-4 shadow-2xl ring-1 ring-white/10"
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
        <div className="flex items-center gap-3 rounded-2xl bg-[var(--app-card-2)] py-2 pr-2 pl-4 shadow-2xl ring-1 ring-white/10">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tabular-nums">
              {doneSets}/{totalSets} séries
            </p>
            <p className="text-[11px] text-white/50 tabular-nums">
              {formatClock(elapsed)} de treino
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirm('finalizar')}
            className="h-11 rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[#0d0a21] active:scale-[0.98]"
          >
            Finalizar treino
          </button>
        </div>
      </div>

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
              className="mt-5 h-12 w-full rounded-full bg-[var(--app-red)] font-semibold text-[#fff]"
            >
              Descartar
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-white/70">
              {doneSets
                ? `${doneSets} de ${totalSets} séries concluídas em ${formatClock(elapsed)}.`
                : `Nenhuma série marcada (${formatClock(elapsed)} de treino). Sem problema: o treino fica registrado mesmo assim.`}
            </p>
            {doneSets > 0 && doneSets < totalSets && (
              <p className="mt-2 text-xs text-white/45">
                As séries não marcadas ficam de fora do registro.
              </p>
            )}
            <GoldButton className="mt-5" onClick={() => finishSession()}>
              Salvar treino
            </GoldButton>
            <CoachWhatsAppButton className="mt-2" />
          </>
        )}
        <GhostButton className="mt-2 w-full border-0" onClick={() => setConfirm(null)}>
          Continuar treinando
        </GhostButton>
      </PhoneSheet>

      <ExerciseVideoSheet exercise={video} onClose={() => setVideo(null)} />

      <PhoneSheet open={swapFor !== null} onClose={() => setSwapFor(null)} title="Trocar exercício">
        {swapFor && (
          <>
            <p className="rounded-2xl bg-[var(--app-gold)]/10 px-4 py-3 text-[13px] leading-5 text-white/80 ring-1 ring-[var(--app-gold)]/25 ring-inset">
              ⚠️ Use só em caso de urgência: aparelho ocupado, academia lotada ou um dia sem tempo.
              Sempre que der, siga o treino original do {studentProfile.coachFirstName}.
            </p>
            <p className="mt-4 text-xs font-semibold tracking-wide text-white/45 uppercase">
              No lugar de {swapFor.name}
            </p>
            <ul className="mt-2 space-y-2">
              {swapFor.alternatives?.map((alternative) => {
                const active = session.swaps?.[swapFor.id]?.id === alternative.id
                return (
                  <li key={alternative.id}>
                    <button
                      type="button"
                      onClick={() => {
                        swapExercise(swapFor.id, alternative)
                        setSwapFor(null)
                      }}
                      className={cx(
                        'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 ring-inset',
                        active
                          ? 'bg-[var(--app-gold)]/12 ring-[var(--app-gold)]/50'
                          : 'bg-white/[0.05] ring-white/[0.06] active:bg-white/10',
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold">{alternative.name}</span>
                        <span className="block text-xs text-white/50">
                          {alternative.equipment}
                          {alternative.note && ` · ${alternative.note}`}
                        </span>
                      </span>
                      {active && <Icon name="check" className="size-4 text-[var(--app-gold)]" />}
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-xs text-white/45">
              Substitutos cadastrados pelo {studentProfile.coachFirstName}. As séries deste
              exercício recomeçam e não contam recorde.
            </p>
            {session.swaps?.[swapFor.id] && (
              <GhostButton
                className="mt-3 w-full"
                onClick={() => {
                  swapExercise(swapFor.id, null)
                  setSwapFor(null)
                }}
              >
                Voltar para {swapFor.name}
              </GhostButton>
            )}
          </>
        )}
      </PhoneSheet>
    </div>
  )
}

/** "Tem alguma observação? Comente no WhatsApp": comments go to the coach's WhatsApp. */
function CoachWhatsAppButton({ className }: { className?: string }) {
  const text = `Oi ${studentProfile.coachFirstName}! Sobre o treino de hoje: `
  return (
    <a
      href={`https://wa.me/${studentProfile.coachWhatsapp}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1f9d55]/15 px-4 text-center text-[13px] font-semibold text-[#5fd394] ring-1 ring-[#1f9d55]/40 ring-inset active:bg-[#1f9d55]/25',
        className,
      )}
    >
      <WhatsAppMark className="size-4 shrink-0" />
      Tem alguma observação? Comente no WhatsApp
    </a>
  )
}

function WhatsAppMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1 2.7 11.5 11.5 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  )
}

/* ---------------------------------------------------------------- Summary */

export function SummaryScreen() {
  const { setTab, push } = useStudentApp()
  const done = useDoneWorkouts().find((item) => item.key === 'hoje')
  if (!done) return null

  return (
    <div className="px-5 pt-6">
      <div className="text-center">
        <p className="text-3xl" aria-hidden="true">
          🎉
        </p>
        <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em]">Treino concluído!</h1>
        <p className="mt-1 text-sm text-white/60">
          Boa, {studentProfile.firstName}. Esse foi seu {done.nth}º treino {done.code}.
        </p>
      </div>

      <div className="mt-5">
        <RecapCard done={done}>
          <ShareButton onClick={() => push({ name: 'share', key: 'hoje' })} />
        </RecapCard>
      </div>

      <CoachWhatsAppButton className="mt-4" />

      <div className="mt-5 space-y-2">
        <GhostButton className="w-full" onClick={() => push({ name: 'done', key: 'hoje' })}>
          Ver séries do treino
        </GhostButton>
        <GoldButton onClick={() => setTab('inicio')}>Voltar ao início</GoldButton>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Calendar (Smart Fit) */

/** Trained days of a month: the real history for this month, a steady pattern before. */
function trainedDaysOf(year: number, month: number, today: Date) {
  if (year === today.getFullYear() && month === today.getMonth()) return trainedDaysThisMonth(today)
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: 31 }, (_, index) => {
    if (index >= days) return false
    const date = new Date(year, month, index + 1)
    const weekday = date.getDay()
    // Mon, Tue, Thu, Fri, and every other Wednesday, skipping a few days here and there.
    const planned =
      [1, 2, 4, 5].includes(weekday) || (weekday === 3 && Math.floor(index / 7) % 2 === 0)
    return planned && (index * 7 + month * 3) % 11 !== 0
  })
}

/**
 * Monthly calendar in the Smart Fit style: month switcher, round days, trained days filled
 * in gold with the Elevn mark, today ringed, and the day's workout below.
 */
export function CalendarScreen() {
  const { pop, setTab, push, lastFinished } = useStudentApp()
  const doneList = useDoneWorkouts()
  const today = new Date()
  const [offset, setOffset] = useState(0)
  const view = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const year = view.getFullYear()
  const month = view.getMonth()
  const isCurrent = offset === 0
  const lastDay = isCurrent ? today.getDate() : new Date(year, month + 1, 0).getDate()
  const [selected, setSelected] = useState(today.getDate())
  const trained = trainedDaysOf(year, month, today)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Sunday first, like the week on Início (D S T Q Q S S).
  const firstWeekday = new Date(year, month, 1).getDay()
  const isDone = (day: number) =>
    Boolean(
      (isCurrent && day === today.getDate() && lastFinished) ||
      (day <= lastDay && trained[day - 1]),
    )
  const monthCount = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(isDone).length
  // Weekly goal (Sunday first): days of this week, inside this month, already trained.
  const thisMonth = trainedDaysThisMonth(today)
  const weekStartDay = today.getDate() - today.getDay()
  const weekDone = Array.from({ length: today.getDay() + 1 }, (_, i) => weekStartDay + i).filter(
    (day) => day >= 1 && ((day === today.getDate() && lastFinished) || thisMonth[day - 1]),
  ).length
  const weeklyTarget = studentProfile.weeklyTarget
  const streak = weekStreak(thisMonth, today)
  const selectedDay = Math.min(selected, daysInMonth)
  const selectedDate = new Date(year, month, selectedDay)
  const history = isCurrent
    ? doneList.find(
        (entry) => entry.date.getMonth() === month && entry.date.getDate() === selectedDay,
      )
    : undefined
  const doneSelected = isDone(selectedDay)
  const code = history?.code ?? (['A', 'B', 'C', 'D'] as const)[selectedDay % 4]
  const isTodaySelected = isCurrent && selectedDay === today.getDate()

  const changeMonth = (step: number) => {
    const next = Math.min(0, Math.max(-5, offset + step))
    setOffset(next)
    setSelected(next === 0 ? today.getDate() : 1)
  }

  return (
    <div>
      <ScreenHeader title="Frequência" onBack={pop} />
      <div className="grid grid-cols-3 gap-2 px-5">
        {(
          [
            [String(monthCount), isCurrent ? 'Treinos no mês' : 'Treinos', false],
            [`${weekDone}/${weeklyTarget}`, 'Meta da semana', weekDone >= weeklyTarget],
            [`🔥 ${streak}`, streak === 1 ? 'Semana seguida' : 'Semanas seguidas', false],
          ] as const
        ).map(([value, label, highlight]) => (
          <Card
            key={label}
            className={cx('py-3.5 text-center', highlight && 'ring-[var(--app-green)]/40')}
          >
            <p className="text-[22px] leading-7 font-bold tabular-nums">{value}</p>
            <p className="text-[11px] text-white/55">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="mx-5 mt-4 px-3 pt-3 pb-4">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            disabled={offset <= -5}
            aria-label="Mês anterior"
            className="grid size-10 place-items-center rounded-full text-white/70 active:bg-white/10 disabled:opacity-30"
          >
            <Icon name="chevronRight" className="size-5 rotate-180" />
          </button>
          <p className="text-[16px] font-semibold first-letter:uppercase">
            {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(view)}
          </p>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            disabled={isCurrent}
            aria-label="Próximo mês"
            className="grid size-10 place-items-center rounded-full text-white/70 active:bg-white/10 disabled:opacity-30"
          >
            <Icon name="chevronRight" className="size-5" />
          </button>
        </div>
        <div
          className="mt-2 grid grid-cols-7 gap-y-1.5 text-center"
          role="grid"
          aria-label="Dias do mês"
        >
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
            <span
              key={index}
              className="pb-1 text-[11px] font-semibold text-white/45"
              aria-hidden="true"
            >
              {day}
            </span>
          ))}
          {Array.from({ length: firstWeekday }, (_, index) => (
            <span key={`pad-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1
            const future = isCurrent && day > today.getDate()
            const done = isDone(day)
            const isToday = isCurrent && day === today.getDate()
            const isSelected = day === selectedDay
            return (
              <button
                key={day}
                type="button"
                role="gridcell"
                disabled={future}
                aria-selected={isSelected}
                aria-label={`${day}${done ? ', treinou' : ''}${isToday ? ', hoje' : ''}`}
                onClick={() => setSelected(day)}
                className="mx-auto grid size-11 place-items-center rounded-full"
              >
                <span
                  className={cx(
                    'relative grid size-10 place-items-center rounded-full text-[14px] font-semibold tabular-nums transition-colors',
                    done
                      ? 'bg-[var(--app-gold)] text-[#0d0a21]'
                      : future
                        ? 'text-white/20'
                        : 'text-white/80',
                    isToday && !done && 'ring-2 ring-[var(--app-gold)] ring-inset',
                    isSelected && 'outline-2 outline-offset-2 outline-white/70 outline-solid',
                  )}
                >
                  {done ? <ElevnMark className="w-[62%]" /> : day}
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-3 flex items-center justify-center gap-4 text-[11px] text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="grid size-4 place-items-center rounded-full bg-[var(--app-gold)] text-[#0d0a21]">
              <ElevnMark className="w-[62%]" />
            </span>
            Treinou
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-4 rounded-full ring-2 ring-[var(--app-gold)] ring-inset" />
            Hoje
          </span>
        </p>
      </Card>

      <div className="px-5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[17px] font-semibold first-letter:uppercase">
            {isTodaySelected
              ? 'Hoje'
              : new Intl.DateTimeFormat('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                }).format(selectedDate)}
          </p>
          {isTodaySelected && !lastFinished && (
            <GhostButton onClick={() => setTab('treino')}>+ Registrar treino</GhostButton>
          )}
        </div>
        {doneSelected ? (
          <button
            type="button"
            disabled={!history}
            onClick={() => history && push({ name: 'done', key: history.key })}
            className="mt-3 flex w-full items-center gap-3 rounded-[24px] bg-[var(--app-card)] p-4 text-left ring-1 ring-white/[0.06] ring-inset active:bg-[var(--app-card-2)]"
          >
            <LetterBadge code={code} />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{workoutOf(code).title}</span>
              <span className="block text-xs text-white/55">
                {history
                  ? `${Math.round(history.seconds / 60)} min · ${workLabel(history)}`
                  : 'Treino registrado'}
              </span>
            </span>
            {history && <Icon name="chevronRight" className="size-4 text-white/35" />}
          </button>
        ) : (
          <p className="mt-5 rounded-2xl bg-white/[0.03] py-5 text-center text-sm text-white/45">
            Nenhum treino registrado nesta data
          </p>
        )}
      </div>
    </div>
  )
}
