'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { workouts, type PlannedSet, type Workout } from '@/lib/demo-student-app'
import type { StudentNotification } from '@/lib/student-notifications'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { AccountTab, NotificationsScreen, PhotosScreen } from './AccountTab'
import { DietTab } from './DietTab'
import { HomeTab } from './HomeTab'
import { appTheme, formatClock } from './ui'
import {
  CalendarScreen,
  HistoryScreen,
  SessionScreen,
  SummaryScreen,
  WorkoutDetail,
  WorkoutTab,
} from './WorkoutTab'

export type AppTab = 'inicio' | 'treino' | 'dieta' | 'conta'

export type AppRoute =
  | { name: 'workout'; code: Workout['code'] }
  | { name: 'session' }
  | { name: 'summary' }
  | { name: 'calendar' }
  | { name: 'history' }
  | { name: 'photos' }
  | { name: 'notifications' }

export type SetLog = PlannedSet & { kgInput: string; repsInput: string; done: boolean }

export type Session = {
  code: Workout['code']
  startedAt: number
  sets: Record<string, SetLog[]>
  rest: { endsAt: number; total: number; exercise: string } | null
}

export type FinishedSession = {
  code: Workout['code']
  seconds: number
  volume: number
  sets: number
  prs: number
}

type AppContextValue = {
  tab: AppTab
  setTab: (tab: AppTab) => void
  push: (route: AppRoute) => void
  pop: () => void
  replace: (route: AppRoute) => void
  session: Session | null
  now: number
  startSession: (code: Workout['code']) => void
  updateSet: (exerciseId: string, index: number, patch: Partial<SetLog>) => void
  toggleSetDone: (exerciseId: string, index: number) => void
  addSet: (exerciseId: string) => void
  adjustRest: (deltaSec: number) => void
  skipRest: () => void
  finishSession: () => void
  discardSession: () => void
  lastFinished: FinishedSession | null
  eatenMeals: string[]
  toggleMeal: (mealId: string) => void
  /** Smart swap chosen for a meal today (meal id → swap id). */
  mealSwaps: Record<string, string>
  setMealSwap: (mealId: string, swapId: string | null) => void
  notifications: StudentNotification[]
}

const AppContext = createContext<AppContextValue | null>(null)

export function useStudentApp() {
  const value = useContext(AppContext)
  if (!value) throw new Error('useStudentApp must be used inside <StudentApp>')
  return value
}

const tabs: { id: AppTab; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Início', icon: 'dashboard' },
  { id: 'treino', label: 'Treino', icon: 'training' },
  { id: 'dieta', label: 'Dieta', icon: 'nutrition' },
  { id: 'conta', label: 'Conta', icon: 'settings' },
]

function freshSets(workout: Workout): Record<string, SetLog[]> {
  return Object.fromEntries(
    workout.exercises.map((exercise) => [
      exercise.id,
      exercise.sets.map((set) => ({ ...set, kgInput: '', repsInput: '', done: false })),
    ]),
  )
}

/**
 * The student app (mobile only). Rendered inside a phone frame in the panel preview and
 * full screen at /aluno. `startAt` lets the preview jump straight to a screen.
 */
export default function StudentApp({
  startAt,
  notifications = [],
  topInset = 0,
}: {
  startAt?: { tab: AppTab; route?: AppRoute }
  notifications?: StudentNotification[]
  /** Space for the status bar / notch when shown in a phone frame. */
  topInset?: number
}) {
  const [tab, setTabState] = useState<AppTab>(startAt?.tab ?? 'inicio')
  const [stack, setStack] = useState<AppRoute[]>(startAt?.route ? [startAt.route] : [])
  const [session, setSession] = useState<Session | null>(null)
  const [lastFinished, setLastFinished] = useState<FinishedSession | null>(null)
  const [eatenMeals, setEatenMeals] = useState<string[]>(['cafe', 'lanche1'])
  const [mealSwaps, setMealSwaps] = useState<Record<string, string>>({})
  const [now, setNow] = useState(() => Date.now())
  // Client-only: the app shows "today", streaks and timers, which differ from build time.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!session) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [session])

  // Preview shortcuts that start inside a workout need a session to exist.
  useEffect(() => {
    if (startAt?.route?.name === 'session' && !session) {
      const workout = workouts[1]
      const sets = freshSets(workout)
      // Show the log mid-workout: first exercise done, rest timer running.
      sets[workout.exercises[0].id] = sets[workout.exercises[0].id].map((set, index) => ({
        ...set,
        kgInput: index < 2 ? String(set.kg) : '',
        repsInput: index < 2 ? String(set.reps) : '',
        done: index < 2,
      }))
      setSession({
        code: workout.code,
        startedAt: Date.now() - 14 * 60_000,
        sets,
        rest: { endsAt: Date.now() + 64_000, total: 90, exercise: workout.exercises[0].name },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Rest timer: clear when it ends and buzz if the device allows it.
  useEffect(() => {
    if (session?.rest && now >= session.rest.endsAt) {
      try {
        window.navigator.vibrate?.([120, 80, 120])
      } catch {
        /* no vibration */
      }
      setSession((current) => (current ? { ...current, rest: null } : current))
    }
  }, [now, session])

  const value = useMemo<AppContextValue>(() => {
    const workoutOf = (code: Workout['code']) => workouts.find((item) => item.code === code)!
    return {
      tab,
      setTab: (next) => {
        setTabState(next)
        setStack([])
      },
      push: (route) => setStack((current) => [...current, route]),
      pop: () => setStack((current) => current.slice(0, -1)),
      replace: (route) => setStack((current) => [...current.slice(0, -1), route]),
      session,
      now,
      startSession: (code) => {
        setSession({ code, startedAt: Date.now(), sets: freshSets(workoutOf(code)), rest: null })
        setNow(Date.now())
        setStack((current) => [...current, { name: 'session' }])
      },
      updateSet: (exerciseId, index, patch) =>
        setSession((current) =>
          current
            ? {
                ...current,
                sets: {
                  ...current.sets,
                  [exerciseId]: current.sets[exerciseId].map((set, i) =>
                    i === index ? { ...set, ...patch } : set,
                  ),
                },
              }
            : current,
        ),
      toggleSetDone: (exerciseId, index) =>
        setSession((current) => {
          if (!current) return current
          const exercise = workoutOf(current.code).exercises.find((item) => item.id === exerciseId)!
          const set = current.sets[exerciseId][index]
          const done = !set.done
          // Empty inputs take the planned values, like Hevy's placeholders.
          const filled = {
            ...set,
            done,
            kgInput: set.kgInput || String(set.kg),
            repsInput: set.repsInput || String(set.reps),
          }
          return {
            ...current,
            sets: {
              ...current.sets,
              [exerciseId]: current.sets[exerciseId].map((item, i) =>
                i === index ? filled : item,
              ),
            },
            rest:
              done && exercise.restSec
                ? {
                    endsAt: Date.now() + exercise.restSec * 1000,
                    total: exercise.restSec,
                    exercise: exercise.name,
                  }
                : current.rest,
          }
        }),
      addSet: (exerciseId) =>
        setSession((current) => {
          if (!current) return current
          const list = current.sets[exerciseId]
          const last = list[list.length - 1]
          return {
            ...current,
            sets: {
              ...current.sets,
              [exerciseId]: [
                ...list,
                {
                  ...last,
                  type: 'normal',
                  previous: undefined,
                  kgInput: '',
                  repsInput: '',
                  done: false,
                },
              ],
            },
          }
        }),
      adjustRest: (delta) =>
        setSession((current) =>
          current?.rest
            ? {
                ...current,
                rest: {
                  ...current.rest,
                  endsAt: Math.max(Date.now() + 1000, current.rest.endsAt + delta * 1000),
                  total: Math.max(5, current.rest.total + delta),
                },
              }
            : current,
        ),
      skipRest: () => setSession((current) => (current ? { ...current, rest: null } : current)),
      finishSession: () => {
        if (!session) return
        const workout = workoutOf(session.code)
        let volume = 0
        let sets = 0
        let prs = 0
        for (const exercise of workout.exercises) {
          for (const set of session.sets[exercise.id] ?? []) {
            if (!set.done) continue
            const kg = Number(set.kgInput.replace(',', '.')) || 0
            const reps = Number(set.repsInput) || 0
            sets += 1
            if (exercise.muscle !== 'Cardio') volume += kg * reps
            if (set.previous && kg * reps > set.previous.kg * set.previous.reps && kg > 0) prs += 1
          }
        }
        setLastFinished({
          code: session.code,
          seconds: Math.round((Date.now() - session.startedAt) / 1000),
          volume: Math.round(volume),
          sets,
          prs,
        })
        setSession(null)
        setStack([{ name: 'summary' }])
        setTabState('treino')
      },
      discardSession: () => {
        setSession(null)
        setStack([])
      },
      lastFinished,
      eatenMeals,
      toggleMeal: (mealId) =>
        setEatenMeals((current) =>
          current.includes(mealId) ? current.filter((id) => id !== mealId) : [...current, mealId],
        ),
      mealSwaps,
      setMealSwap: (mealId, swapId) =>
        setMealSwaps((current) => {
          const next = { ...current }
          if (swapId) next[mealId] = swapId
          else delete next[mealId]
          return next
        }),
      notifications,
    }
  }, [tab, session, now, lastFinished, eatenMeals, mealSwaps, notifications])

  const route = stack[stack.length - 1]
  const fullScreen = route?.name === 'session' || route?.name === 'summary'

  let screen: ReactNode
  if (route) {
    switch (route.name) {
      case 'workout':
        screen = <WorkoutDetail code={route.code} />
        break
      case 'session':
        screen = <SessionScreen />
        break
      case 'summary':
        screen = <SummaryScreen />
        break
      case 'calendar':
        screen = <CalendarScreen />
        break
      case 'history':
        screen = <HistoryScreen />
        break
      case 'photos':
        screen = <PhotosScreen />
        break
      case 'notifications':
        screen = <NotificationsScreen />
        break
    }
  } else {
    screen =
      tab === 'inicio' ? (
        <HomeTab />
      ) : tab === 'treino' ? (
        <WorkoutTab />
      ) : tab === 'dieta' ? (
        <DietTab />
      ) : (
        <AccountTab />
      )
  }

  const sessionWorkout = session ? workouts.find((item) => item.code === session.code) : null
  const showSessionBar = session && route?.name !== 'session'

  if (!mounted) {
    return <div style={appTheme} className="h-full w-full bg-[var(--app-bg)]" aria-busy="true" />
  }

  return (
    <AppContext.Provider value={value}>
      <div
        style={appTheme}
        className="relative flex h-full w-full flex-col overflow-clip bg-[var(--app-bg)] font-sans text-white antialiased [-webkit-tap-highlight-color:transparent]"
      >
        {/* Gold glow at the top, like the Smart Fit app */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[140%] -translate-x-1/2 rounded-[50%] opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, var(--app-gold-deep), transparent)' }}
        />
        {topInset > 0 && (
          <div
            aria-hidden="true"
            className="relative z-30 shrink-0 bg-[var(--app-bg)]/90 backdrop-blur"
            style={{ height: topInset }}
          />
        )}
        <main
          key={`${tab}-${stack.length}-${route?.name ?? 'root'}`}
          className={cx(
            'relative min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] animate-[app-screen-in_200ms_ease-out] motion-reduce:animate-none',
            fullScreen ? 'pb-6' : 'pb-28',
          )}
        >
          {screen}
        </main>

        {showSessionBar && sessionWorkout && (
          <button
            type="button"
            onClick={() => value.push({ name: 'session' })}
            className="absolute inset-x-3 bottom-[84px] z-20 flex items-center gap-3 rounded-2xl bg-[var(--app-gold)] px-4 py-3 text-left text-[#0d0a21] shadow-lg"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#0d0a21]/50 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[#0d0a21]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold tracking-wide uppercase opacity-70">
                Treino em andamento
              </span>
              <span className="block truncate text-sm font-semibold">
                Treino {sessionWorkout.code} · {sessionWorkout.title}
              </span>
            </span>
            <span className="font-semibold tabular-nums">
              {formatClock(Math.round((now - session!.startedAt) / 1000))}
            </span>
          </button>
        )}

        {!fullScreen && (
          <nav
            aria-label="Abas do app"
            className="absolute inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-[var(--app-line)] bg-[var(--app-bg)]/95 px-2 pt-2 pb-6 backdrop-blur"
          >
            {tabs.map((item) => {
              const active = tab === item.id && !route
              const current = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => value.setTab(item.id)}
                  aria-current={current ? 'page' : undefined}
                  className={cx(
                    'flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-medium transition-colors',
                    current ? 'text-white' : 'text-white/40',
                  )}
                >
                  <span
                    className={cx(
                      'grid h-7 w-12 place-items-center rounded-full transition-colors',
                      active ? 'bg-white/10' : '',
                    )}
                  >
                    <Icon name={item.icon} className="size-[22px]" />
                  </span>
                  {item.label}
                </button>
              )
            })}
          </nav>
        )}
      </div>
    </AppContext.Provider>
  )
}
