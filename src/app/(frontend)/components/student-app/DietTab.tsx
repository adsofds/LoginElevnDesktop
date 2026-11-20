'use client'

import { useState } from 'react'
import { dietPlan, type Meal } from '@/lib/demo-student-app'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { useStudentApp } from './StudentApp'
import { Bar, Card, PhoneSheet, Ring, ScreenHeader } from './ui'

const GLASS_ML = 375

const mealTotals = (meal: Meal) =>
  meal.foods.reduce(
    (sum, food) => ({
      kcal: sum.kcal + food.kcal,
      p: sum.p + food.p,
      c: sum.c + food.c,
      g: sum.g + food.g,
    }),
    { kcal: 0, p: 0, c: 0, g: 0 },
  )

export function DietTab() {
  const { eatenMeals, toggleMeal, waterGlasses, setWaterGlasses } = useStudentApp()
  const [open, setOpen] = useState<string | null>(null)
  const [swaps, setSwaps] = useState<Meal | null>(null)
  const { targets } = dietPlan
  const consumed = dietPlan.meals
    .filter((meal) => eatenMeals.includes(meal.id))
    .reduce(
      (sum, meal) => {
        const totals = mealTotals(meal)
        return {
          kcal: sum.kcal + totals.kcal,
          p: sum.p + totals.p,
          c: sum.c + totals.c,
          g: sum.g + totals.g,
        }
      },
      { kcal: 0, p: 0, c: 0, g: 0 },
    )
  const glasses = Math.round(dietPlan.waterGoalMl / GLASS_ML)
  const minutesNow = new Date().getHours() * 60 + new Date().getMinutes()
  const currentMealId = dietPlan.meals.find((meal) => {
    const [h, m] = meal.time.split(':').map(Number)
    return h * 60 + m >= minutesNow - 30 && !eatenMeals.includes(meal.id)
  })?.id

  return (
    <div>
      <ScreenHeader title="Dieta" subtitle={`${dietPlan.strategy} · ${dietPlan.nutritionist}`} />

      <Card className="mx-5 p-5">
        <div className="flex items-center gap-5">
          <Ring value={consumed.kcal} max={targets.kcal} size={124} stroke={11}>
            <span className="block text-2xl font-bold tabular-nums">
              {Math.max(0, targets.kcal - consumed.kcal)}
            </span>
            <span className="text-[11px] text-white/55">kcal restantes</span>
          </Ring>
          <div className="min-w-0 flex-1 space-y-3">
            {(
              [
                ['Proteína', consumed.p, targets.p, '#7cc4ff'],
                ['Carboidrato', consumed.c, targets.c, 'var(--app-gold)'],
                ['Gordura', consumed.g, targets.g, '#ff9f7a'],
              ] as const
            ).map(([label, value, max, color]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-white/70">{label}</span>
                  <span className="text-white/50 tabular-nums">
                    <strong className="font-semibold text-white">{value}</strong>/{max} g
                  </span>
                </div>
                <Bar value={value} max={max} color={color} />
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-white/50 tabular-nums">
          {consumed.kcal} de {targets.kcal} kcal · marque as refeições que você fez
        </p>
      </Card>

      {/* Water */}
      <Card className="mx-5 mt-3 p-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Água</p>
          <p className="text-sm text-white/60 tabular-nums">
            {((waterGlasses * GLASS_ML) / 1000).toLocaleString('pt-BR', {
              maximumFractionDigits: 2,
            })}{' '}
            de {(dietPlan.waterGoalMl / 1000).toLocaleString('pt-BR')} L
          </p>
        </div>
        <div className="mt-3 grid grid-cols-8 gap-1.5" role="group" aria-label="Copos de água">
          {Array.from({ length: glasses }, (_, index) => {
            const filled = index < waterGlasses
            return (
              <button
                key={index}
                type="button"
                onClick={() =>
                  setWaterGlasses(filled && index === waterGlasses - 1 ? index : index + 1)
                }
                aria-label={`${index + 1} ${index === 0 ? 'copo' : 'copos'}`}
                aria-pressed={filled}
                className={cx(
                  'relative h-11 overflow-hidden rounded-b-xl rounded-t-md border-2 transition-colors',
                  filled ? 'border-[#7cc4ff]' : 'border-white/15',
                )}
              >
                <span
                  className={cx(
                    'absolute inset-x-0 bottom-0 bg-[#7cc4ff]/70 transition-[height] duration-300',
                    filled ? 'h-[80%]' : 'h-0',
                  )}
                />
              </button>
            )
          })}
        </div>
      </Card>

      {/* Meals */}
      <h2 className="mt-7 mb-3 px-5 text-[19px] font-semibold tracking-[-0.01em]">
        Refeições de hoje
      </h2>
      <ul className="space-y-2.5 px-5">
        {dietPlan.meals.map((meal) => {
          const eaten = eatenMeals.includes(meal.id)
          const expanded = open === meal.id
          const totals = mealTotals(meal)
          const current = meal.id === currentMealId
          return (
            <li key={meal.id}>
              <Card
                className={cx('overflow-hidden', current && 'ring-1 ring-[var(--app-gold)]/60')}
              >
                <div className="flex items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => toggleMeal(meal.id)}
                    aria-pressed={eaten}
                    aria-label={`${eaten ? 'Desmarcar' : 'Marcar'} ${meal.name} como feita`}
                    className={cx(
                      'grid size-9 shrink-0 place-items-center rounded-full border-2 transition-all active:scale-90',
                      eaten
                        ? 'border-[var(--app-green)] bg-[var(--app-green)] text-[#06210f]'
                        : 'border-white/25 text-transparent',
                    )}
                  >
                    <Icon name="check" className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : meal.id)}
                    aria-expanded={expanded}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-[13px] text-white/50">
                        {meal.time}
                        {current && (
                          <span className="rounded bg-[var(--app-gold)] px-1.5 text-[10px] font-bold text-[#0d0a21]">
                            AGORA
                          </span>
                        )}
                      </span>
                      <span className={cx('block font-semibold', eaten && 'text-white/60')}>
                        {meal.name}
                      </span>
                      {!expanded && (
                        <span className="block truncate text-[13px] text-white/45">
                          {meal.foods.map((food) => food.name).join(' · ')}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-white/70 tabular-nums">
                      {totals.kcal} kcal
                    </span>
                    <Icon
                      name="chevronRight"
                      className={cx(
                        'size-4 shrink-0 text-white/40 transition-transform',
                        expanded && 'rotate-90',
                      )}
                    />
                  </button>
                </div>
                {expanded && (
                  <div className="border-t border-[var(--app-line)] px-4 pt-2 pb-4">
                    <ul className="divide-y divide-[var(--app-line)]">
                      {meal.foods.map((food) => (
                        <li key={food.name} className="flex items-center gap-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{food.name}</p>
                            <p className="text-xs text-white/50">{food.amount}</p>
                          </div>
                          <p className="text-right text-[11px] leading-4 text-white/45 tabular-nums">
                            {food.kcal} kcal
                            <br />P {food.p} · C {food.c} · G {food.g}
                          </p>
                        </li>
                      ))}
                    </ul>
                    {meal.swaps && (
                      <button
                        type="button"
                        onClick={() => setSwaps(meal)}
                        className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] text-sm font-medium"
                      >
                        <Icon name="swap" className="size-4" /> Ver substituições
                      </button>
                    )}
                  </div>
                )}
              </Card>
            </li>
          )
        })}
      </ul>

      <Card className="mx-5 mt-4 flex gap-3 p-4">
        <span className="text-xl" aria-hidden="true">
          📝
        </span>
        <div>
          <p className="text-xs font-semibold text-[var(--app-gold)]">Recado da nutricionista</p>
          <p className="mt-0.5 text-sm leading-5 text-white/80">{dietPlan.note}</p>
        </div>
      </Card>

      <PhoneSheet
        open={!!swaps}
        onClose={() => setSwaps(null)}
        title={`Substituições · ${swaps?.name ?? ''}`}
      >
        <ul className="space-y-2">
          {swaps?.swaps?.map((swap) => (
            <li key={swap} className="rounded-xl bg-white/[0.05] px-4 py-3 text-sm">
              {swap}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-white/45">
          Trocas aprovadas pela {dietPlan.nutritionist}. As calorias ficam equivalentes.
        </p>
      </PhoneSheet>
    </div>
  )
}
