/**
 * Demo series for the Dashboard period selector. Every number lines up with the
 * rest of the panel: 128 active students today, R$ 24.200 of monthly revenue and
 * 114 of 128 check-ins answered this week (the same values shown in Alunos).
 */

export type DashboardPeriod = '7d' | '30d' | '6m'

export const periodOptions: { id: DashboardPeriod; label: string }[] = [
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
  { id: '6m', label: '6 meses' },
]

export const isDashboardPeriod = (value: string | null | undefined): value is DashboardPeriod =>
  value === '7d' || value === '30d' || value === '6m'

/** How each point is labeled: days ago (weekday / day + month) or months ago. */
export type SeriesPoint = { offset: number; unit: 'day' | 'month'; value: number }

const days = (offsets: number[], values: number[]): SeriesPoint[] =>
  offsets.map((offset, index) => ({ offset, unit: 'day', value: values[index] }))
const months = (values: number[]): SeriesPoint[] =>
  values.map((value, index) => ({ offset: values.length - 1 - index, unit: 'month', value }))

export const activeStudentsSeries: Record<DashboardPeriod, SeriesPoint[]> = {
  '7d': days([6, 5, 4, 3, 2, 1, 0], [127, 127, 127, 127, 128, 128, 128]),
  '30d': days([28, 21, 14, 7, 0], [125, 126, 126, 127, 128]),
  '6m': months([116, 118, 121, 123, 125, 128]),
}

/** Weekly check-in response rate (answered of 128 active students). */
export type AdherencePoint = {
  offset: number
  unit: 'day' | 'month'
  answered: number
  total: number
}

const weekly: AdherencePoint[] = [
  { offset: 28, unit: 'day', answered: 105, total: 128 },
  { offset: 21, unit: 'day', answered: 110, total: 128 },
  { offset: 14, unit: 'day', answered: 108, total: 128 },
  { offset: 7, unit: 'day', answered: 116, total: 128 },
  { offset: 0, unit: 'day', answered: 114, total: 128 },
]

export const adherenceSeries: Record<DashboardPeriod, AdherencePoint[]> = {
  '7d': weekly.slice(-2),
  '30d': weekly,
  '6m': [
    { offset: 5, unit: 'month', answered: 394, total: 464 },
    { offset: 4, unit: 'month', answered: 415, total: 472 },
    { offset: 3, unit: 'month', answered: 421, total: 484 },
    { offset: 2, unit: 'month', answered: 430, total: 492 },
    { offset: 1, unit: 'month', answered: 438, total: 500 },
    { offset: 0, unit: 'month', answered: 222, total: 256 },
  ],
}

export const ADHERENCE_GOAL = 80

const periodPhrase: Record<DashboardPeriod, string> = {
  '7d': 'em 7 dias',
  '30d': 'em 30 dias',
  '6m': 'em 6 meses',
}

export function periodDelta(period: DashboardPeriod, series: SeriesPoint[]) {
  const diff = series[series.length - 1].value - series[0].value
  const sign = diff > 0 ? '+' : diff < 0 ? '−' : ''
  return {
    text: `${diff >= 0 ? '▲' : '▼'} ${sign}${Math.abs(diff)} ${periodPhrase[period]}`,
    tone: diff > 0 ? ('success' as const) : diff < 0 ? ('danger' as const) : ('neutral' as const),
  }
}

/** Small trend lines for the KPI strip (only their shape matters). */
export const kpiSparks: Record<DashboardPeriod, Record<string, number[]>> = {
  '7d': {
    revenue: [21.4, 21.9, 22.3, 22.8, 23.4, 23.9, 24.2],
    expiring: [6, 7, 7, 8, 8, 9, 9],
    pending: [9, 11, 12, 10, 12, 13, 14],
    answered: [84, 86, 87, 88, 88, 89, 89],
  },
  '30d': {
    revenue: [22.1, 22.6, 23.0, 23.6, 24.2],
    expiring: [5, 6, 8, 7, 9],
    pending: [16, 12, 15, 11, 14],
    answered: [82, 86, 84, 91, 89],
  },
  '6m': {
    revenue: [19.8, 20.6, 21.3, 22.4, 23.1, 24.2],
    expiring: [7, 8, 6, 9, 8, 9],
    pending: [18, 15, 16, 13, 15, 14],
    answered: [85, 88, 87, 87, 88, 87],
  },
}

const TIME_ZONE = 'America/Sao_Paulo'
const weekdayShort = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: TIME_ZONE })
const dayMonth = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  timeZone: TIME_ZONE,
})
const monthShort = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: TIME_ZONE })
const monthLong = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: TIME_ZONE,
})
const dayMonthLong = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  timeZone: TIME_ZONE,
})

const clean = (value: string) => value.replace('.', '').replace(' de ', ' ')

/** Axis label ("sáb", "14 nov", "nov") and full label for tooltips. */
export function pointLabels(
  point: { offset: number; unit: 'day' | 'month' },
  now: Date,
  granularity: 'weekday' | 'date',
) {
  if (point.unit === 'month') {
    const date = new Date(now.getFullYear(), now.getMonth() - point.offset, 15)
    return { short: clean(monthShort.format(date)), full: monthLong.format(date) }
  }
  const date = new Date(now.getTime() - point.offset * 86_400_000)
  if (point.offset === 0) return { short: 'hoje', full: `Hoje, ${dayMonthLong.format(date)}` }
  return {
    short:
      granularity === 'weekday' ? clean(weekdayShort.format(date)) : clean(dayMonth.format(date)),
    full: dayMonthLong.format(date),
  }
}
