import { cx } from '../ui/cx'

type Goal = {
  id: string
  intern: string
  category: string
  target: number
  completed: number
  selectedSlots: number[]
}

const WEEK = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

function Ring({ value }: { value: number }) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  return (
    <span className="relative grid size-14 shrink-0 place-items-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="5"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={value >= 100 ? 'var(--success-fg)' : 'var(--elevn-accent)'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${(Math.min(value, 100) / 100) * circumference} ${circumference}`}
          className="transition-[stroke-dasharray] duration-300"
        />
      </svg>
      <span className="text-xs font-semibold text-ink tabular-nums">{value}%</span>
    </span>
  )
}

/** One card per intern: overall ring, a thin bar per format and a 7-day consistency strip. */
export default function InternProgress({ goals }: { goals: Goal[] }) {
  const interns = [...new Set(goals.map((goal) => goal.intern))]
  return (
    <section
      aria-label="Progresso por estagiário"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      {interns.map((intern) => {
        const own = goals.filter((goal) => goal.intern === intern)
        const target = own.reduce((sum, goal) => sum + goal.target, 0)
        const done = own.reduce((sum, goal) => sum + Math.min(goal.completed, goal.target), 0)
        const percent = target ? Math.round((done / target) * 100) : 0
        return (
          <article key={intern} className="rounded-card border border-line bg-surface p-4">
            <header className="flex items-center gap-3">
              <Ring value={percent} />
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-semibold text-ink">{intern}</h3>
                <p className="text-xs text-ink-3">
                  {done} de {target} entregas nesta semana
                </p>
              </div>
            </header>
            <ul className="mt-3 space-y-2.5">
              {own.map((goal) => {
                const share = goal.target ? Math.min(goal.completed / goal.target, 1) : 0
                return (
                  <li key={goal.id}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium text-ink-2">{goal.category}</span>
                      <span className="text-ink-3 tabular-nums">
                        {goal.completed}/{goal.target}
                      </span>
                    </div>
                    <div
                      className="mt-1 h-1.5 overflow-hidden rounded-full bg-subtle"
                      aria-hidden="true"
                    >
                      <div
                        className={cx(
                          'h-full rounded-full transition-[width] duration-300',
                          share >= 1 ? 'bg-success' : 'bg-brand',
                        )}
                        style={{ width: `${share * 100}%` }}
                      />
                    </div>
                    <div
                      className="mt-1.5 flex gap-1"
                      aria-label={`Dias com entrega de ${goal.category}: ${goal.selectedSlots.length}`}
                    >
                      {WEEK.map((day, index) => (
                        <span
                          key={index}
                          title={day}
                          className={cx(
                            'h-3 flex-1 rounded-[3px]',
                            goal.selectedSlots.includes(index)
                              ? share >= 1
                                ? 'bg-success/70'
                                : 'bg-brand/70'
                              : 'bg-subtle',
                          )}
                        />
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>
          </article>
        )
      })}
    </section>
  )
}
