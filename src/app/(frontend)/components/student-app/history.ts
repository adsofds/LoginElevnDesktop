'use client'

import {
  workoutHistory,
  workouts,
  type HistoryEntry,
  type SetType,
  type Workout,
} from '@/lib/demo-student-app'
import { useStudentApp } from './StudentApp'

export type DoneSet = { type: SetType; kg: number; reps: number; pr: boolean }
export type DoneExercise = { id: string; name: string; muscle: string; sets: DoneSet[] }

/** A workout the student finished: today's session or one from the history. */
export type DoneWorkout = {
  key: string
  code: Workout['code']
  date: Date
  seconds: number
  /** Which time this was for this workout (8 = "8ª vez"). */
  nth: number
  prs: number
  sets: number
  comment?: string
  exercises: DoneExercise[]
}

export const workoutOf = (code: Workout['code']) => workouts.find((item) => item.code === code)!

/**
 * What the student logged in a past session. The demo history only keeps totals, so the
 * sets come from Breno's plan: recent sessions at the planned load, older ones at the
 * "previous" load. Records go on the heaviest set of the first exercises.
 */
export function historyLog(entry: Pick<HistoryEntry, 'code' | 'daysAgo' | 'prs'>) {
  let recordsLeft = entry.prs
  return workoutOf(entry.code).exercises.map<DoneExercise>((exercise) => {
    const sets = exercise.sets.map<DoneSet>((set) => {
      const use = entry.daysAgo > 2 && set.previous ? set.previous : set
      return { type: set.type, kg: use.kg, reps: use.reps, pr: false }
    })
    if (recordsLeft > 0 && exercise.muscle !== 'Cardio') {
      let best = -1
      sets.forEach((set, index) => {
        if (set.type === 'aquecimento') return
        if (best < 0 || set.kg * set.reps > sets[best].kg * sets[best].reps) best = index
      })
      if (best >= 0) {
        sets[best].pr = true
        recordsLeft -= 1
      }
    }
    return { id: exercise.id, name: exercise.name, muscle: exercise.muscle, sets }
  })
}

const countSets = (exercises: DoneExercise[]) =>
  exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)

/** Every finished workout, newest first, numbered per workout ("8ª vez"). */
export function useDoneWorkouts(): DoneWorkout[] {
  const { lastFinished } = useStudentApp()
  const today = new Date()
  const list: Omit<DoneWorkout, 'nth'>[] = []
  if (lastFinished) {
    list.push({
      key: 'hoje',
      code: lastFinished.code,
      date: new Date(lastFinished.finishedAt),
      seconds: lastFinished.seconds,
      prs: lastFinished.prs,
      sets: lastFinished.sets,
      exercises: lastFinished.log,
    })
  }
  workoutHistory.forEach((entry, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - entry.daysAgo)
    date.setHours(7, 30 + (entry.minutes % 20), 0, 0)
    const exercises = historyLog(entry)
    list.push({
      key: `h${index}`,
      code: entry.code,
      date,
      seconds: entry.minutes * 60 + ((entry.minutes * 7) % 60),
      prs: entry.prs,
      sets: countSets(exercises),
      comment: entry.comment,
      exercises,
    })
  })
  const counters = Object.fromEntries(
    workouts.map((workout) => [
      workout.code,
      workout.timesDone + (lastFinished?.code === workout.code ? 1 : 0),
    ]),
  ) as Record<Workout['code'], number>
  return list.map((item) => ({ ...item, nth: counters[item.code]-- }))
}

/** Times each workout has been done (including today's session). */
export function useTimesDone() {
  const { lastFinished } = useStudentApp()
  return Object.fromEntries(
    workouts.map((workout) => [
      workout.code,
      workout.timesDone + (lastFinished?.code === workout.code ? 1 : 0),
    ]),
  ) as Record<Workout['code'], number>
}

const formatKg = (kg: number) => kg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

/** "55 kg × 10", "45 min a 9 km/h", "40 s"… */
export function formatSet(exercise: Pick<DoneExercise, 'name' | 'muscle'>, set: DoneSet) {
  if (exercise.muscle === 'Cardio') return `${set.reps} min · ${formatKg(set.kg)} km/h`
  if (exercise.name.includes('(segundos)'))
    return set.kg ? `${formatKg(set.kg)} kg × ${set.reps} s` : `${set.reps} s`
  return set.kg ? `${formatKg(set.kg)} kg × ${set.reps}` : `${set.reps} reps`
}

/** Best set of an exercise, for compact lists. */
export function bestSet(exercise: DoneExercise) {
  const working = exercise.sets.filter((set) => set.type !== 'aquecimento')
  const pool = working.length ? working : exercise.sets
  return pool.reduce((best, set) => (set.kg * set.reps > best.kg * best.reps ? set : best), pool[0])
}

/** "qui, 19 nov" / "Hoje" / "Ontem". */
export function dayLabel(date: Date, today = new Date()) {
  const start = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate())
  const diff = Math.round((start(today).getTime() - start(date).getTime()) / 864e5)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
    .format(date)
    .replaceAll('.', '')
}

/** "49min 12s" (Strava style). */
export function durationLabel(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h) return `${h}h ${m}min`
  return m ? `${m}min ${String(s).padStart(2, '0')}s` : `${s}s`
}

/** All exercise muscle labels of a done workout (for the body map). */
export const musclesOf = (done: Pick<DoneWorkout, 'exercises'>) =>
  done.exercises.filter((exercise) => exercise.sets.length).map((exercise) => exercise.muscle)

/** "1 série" / "15 séries". */
export const seriesLabel = (count: number) => `${count} ${count === 1 ? 'série' : 'séries'}`
