/**
 * Per-student adherence for the dashboard widgets (demo data until check-ins and workout
 * logs live in Payload). Patterns are deterministic so server and client render the same.
 */

export type StudentAdherence = {
  id: string
  name: string
  avatar: string
  /** Last 30 days of check-ins, oldest first (true = answered that day). */
  checkins: boolean[]
  /** Workouts logged by day of the current month, index 0 = day 1. */
  trainedDays: boolean[]
}

function pattern(seed: number, rate: number, length: number) {
  let state = seed
  return Array.from({ length }, () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648 < rate
  })
}

const roster: {
  id: string
  name: string
  avatar: string
  checkinRate: number
  trainRate: number
}[] = [
  {
    id: 'student-lucas',
    name: 'Lucas Andrade',
    avatar: '/people/gustavo-lima.jpg',
    checkinRate: 0.45,
    trainRate: 0.42,
  },
  {
    id: 'student-camila',
    name: 'Camila Rocha',
    avatar: '/people/renata-alves.jpg',
    checkinRate: 0.93,
    trainRate: 0.86,
  },
  {
    id: 'student-juliana',
    name: 'Juliana Costa',
    avatar: '/people/paula-nunes.jpg',
    checkinRate: 0.7,
    trainRate: 0.64,
  },
  {
    id: 'student-pedro',
    name: 'Pedro Lima',
    avatar: '/people/breno-monteiro.png',
    checkinRate: 0.55,
    trainRate: 0.58,
  },
  {
    id: 'student-rafael',
    name: 'Rafael Souza',
    avatar: '/people/gustavo-lima.jpg',
    checkinRate: 0.88,
    trainRate: 0.9,
  },
  {
    id: 'student-aline',
    name: 'Aline Moraes',
    avatar: '/people/renata-alves.jpg',
    checkinRate: 0.8,
    trainRate: 0.74,
  },
  {
    id: 'student-thiago',
    name: 'Thiago Nunes',
    avatar: '/people/gustavo-lima.jpg',
    checkinRate: 0.62,
    trainRate: 0.5,
  },
  {
    id: 'student-gabriel',
    name: 'Gabriel Torres',
    avatar: '/people/breno-monteiro.png',
    checkinRate: 0.76,
    trainRate: 0.7,
  },
]

export const studentAdherence: StudentAdherence[] = roster.map((student, index) => ({
  id: student.id,
  name: student.name,
  avatar: student.avatar,
  checkins: pattern(97 + index * 31, student.checkinRate, 30),
  trainedDays: pattern(211 + index * 17, student.trainRate, 31),
}))

/** Answered check-ins over the last `days` days (max 30). */
export function checkinCount(student: StudentAdherence, days: number) {
  const window = student.checkins.slice(-Math.min(days, 30))
  return { answered: window.filter(Boolean).length, expected: window.length }
}

/** Days trained in the month so far, counting only days up to `today` (1–31). */
export function trainingCount(student: StudentAdherence, today: number) {
  const elapsed = student.trainedDays.slice(0, today)
  return { trained: elapsed.filter(Boolean).length, elapsed: elapsed.length }
}
