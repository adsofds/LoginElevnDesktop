'use client'

import { useState } from 'react'
import { dietPlan, portionLabel, type Meal } from '@/lib/demo-student-app'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { useStudentApp } from './StudentApp'
import { SmartSwaps } from './SmartSwaps'
import { Card, Chip, Ring, ScreenHeader } from './ui'

/*
 * Plano: calories per meal and the portions to eat (protein, carbs and fat of the plan stay
 * with the nutritionist). Trocas inteligentes: a separate calculator to swap any food for
 * another with the same calories, plus a barcode lookup.
 */

const mealKcal = (meal: Meal) => meal.foods.reduce((sum, food) => sum + food.kcal, 0)

/**
 * The meal to show as "Próxima refeição": the first one not checked after the last meal the
 * student checked (a skipped lunch stays the next meal even at 16:30). With nothing checked
 * yet, the first meal of the day. Shared by Início and Dieta so both say the same thing.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function currentMeal(eatenMeals: string[], _now = new Date()) {
  const meals = dietPlan.meals
  const lastEaten = meals.reduce(
    (last, meal, index) => (eatenMeals.includes(meal.id) ? index : last),
    -1,
  )
  return (
    meals.slice(lastEaten + 1).find((meal) => !eatenMeals.includes(meal.id)) ??
    meals.find((meal) => !eatenMeals.includes(meal.id))
  )
}

/** Calories of the whole day: the sum of the meals, so checking all of them reaches 100%. */
export const dayKcal = dietPlan.meals.reduce((sum, meal) => sum + mealKcal(meal), 0)

export function DietTab() {
  const { eatenMeals, toggleMeal } = useStudentApp()
  const [view, setView] = useState<'plano' | 'trocas'>('plano')
  const [open, setOpen] = useState<string | null>(null)
  const kcalOf = mealKcal

  const target = dayKcal
  const consumed = dietPlan.meals
    .filter((meal) => eatenMeals.includes(meal.id))
    .reduce((sum, meal) => sum + kcalOf(meal), 0)
  const doneCount = dietPlan.meals.filter((meal) => eatenMeals.includes(meal.id)).length
  const currentMealId = currentMeal(eatenMeals)?.id

  return (
    <div>
      <ScreenHeader title="Dieta" subtitle={dietPlan.strategy} />

      <div
        role="tablist"
        aria-label="Dieta"
        className="mx-5 mb-5 grid grid-cols-2 rounded-full bg-white/[0.06] p-1"
      >
        {(
          [
            ['plano', 'Meu plano'],
            ['trocas', 'Trocas inteligentes'],
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

      {view === 'trocas' ? (
        <SmartSwaps />
      ) : (
        <>
          <Card className="relative mx-5 overflow-hidden p-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-16 size-52 rounded-full opacity-25 blur-2xl"
              style={{ background: 'var(--app-gold-deep)' }}
            />
            <div className="relative flex items-center gap-5">
              <Ring value={consumed} max={target} size={118} stroke={10}>
                <span className="block text-[26px] leading-7 font-bold tabular-nums">
                  {Math.max(0, target - consumed)}
                </span>
                <span className="text-[11px] text-white/55">kcal restantes</span>
              </Ring>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/55">Hoje</p>
                <p className="text-[22px] leading-7 font-semibold tabular-nums">
                  {consumed}
                  <span className="text-base font-normal text-white/45"> / {target} kcal</span>
                </p>
                <p className="mt-2 text-xs text-white/50">
                  {doneCount} de {dietPlan.meals.length} refeições feitas
                </p>
              </div>
            </div>
          </Card>

          <h2 className="mt-7 mb-3 px-5 text-[18px] font-semibold tracking-[-0.01em]">
            Refeições de hoje
          </h2>
          <ul className="space-y-2.5 px-5">
            {dietPlan.meals.map((meal) => {
              const eaten = eatenMeals.includes(meal.id)
              const expanded = open === meal.id
              const current = meal.id === currentMealId
              const foods = meal.foods
              return (
                <li key={meal.id}>
                  <Card className={cx('overflow-hidden', current && 'ring-[var(--app-gold)]/50')}>
                    <div className="flex items-center gap-3 p-4">
                      <button
                        type="button"
                        onClick={() => toggleMeal(meal.id)}
                        aria-pressed={eaten}
                        aria-label={`${eaten ? 'Desmarcar' : 'Marcar'} ${meal.name} como feita`}
                        className={cx(
                          'grid size-9 shrink-0 place-items-center rounded-full transition-all active:scale-90',
                          eaten
                            ? 'bg-[var(--app-green)] text-[#06210f]'
                            : 'text-transparent ring-2 ring-white/20 ring-inset',
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
                          <span className="flex items-center gap-2 text-[13px] text-white/50 tabular-nums">
                            {meal.time}
                            {current && <Chip tone="gold">Agora</Chip>}
                          </span>
                          <span
                            className={cx(
                              'block text-[16px] font-semibold',
                              eaten && 'text-white/55',
                            )}
                          >
                            {meal.name}
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-white/75 tabular-nums">
                          {kcalOf(meal)} kcal
                        </span>
                        <Icon
                          name="chevronRight"
                          className={cx(
                            'size-4 shrink-0 text-white/35 transition-transform',
                            expanded && 'rotate-90',
                          )}
                        />
                      </button>
                    </div>
                    {expanded && (
                      <div className="border-t border-[var(--app-line)] px-4 pt-1 pb-4">
                        <ul className="divide-y divide-[var(--app-line)]">
                          {foods.map((food) => (
                            <li
                              key={food.name}
                              className="flex items-center justify-between gap-3 py-3"
                            >
                              <span className="text-[15px]">{food.name}</span>
                              <span className="shrink-0 text-right text-[13px] text-white/55 tabular-nums">
                                {portionLabel(food)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {meal.swaps && meal.swaps.length > 0 && (
                          <details className="group mt-2 overflow-hidden rounded-2xl bg-white/[0.05]">
                            <summary className="flex h-11 cursor-pointer list-none items-center gap-2 px-4 text-[13px] font-medium [&::-webkit-details-marker]:hidden">
                              <Icon name="swap" className="size-4 text-[var(--app-gold)]" />
                              Substituições da nutri
                              <span className="text-white/45">({meal.swaps.length})</span>
                              <Icon
                                name="chevronRight"
                                className="ml-auto size-4 text-white/40 transition-transform group-open:rotate-90"
                              />
                            </summary>
                            <ul className="space-y-1.5 border-t border-[var(--app-line)] px-4 py-3">
                              {meal.swaps.map((item) => (
                                <li key={item} className="text-[13px] leading-5 text-white/75">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    )}
                  </Card>
                </li>
              )
            })}
          </ul>

          <details className="group mx-5 mt-4 overflow-hidden rounded-[22px] bg-[var(--app-card)] ring-1 ring-white/[0.06] ring-inset">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--app-gold)]/15 text-[var(--app-gold)]">
                <Icon name="meal" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">Orientações gerais</span>
                <span className="block text-xs text-white/50">
                  {dietPlan.guidelines.length} orientações da nutri
                </span>
              </span>
              <Icon
                name="chevronRight"
                className="size-4 text-white/40 transition-transform group-open:rotate-90"
              />
            </summary>
            <ul className="space-y-2.5 border-t border-[var(--app-line)] px-4 py-4">
              {dietPlan.guidelines.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-5 text-white/80">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--app-gold)]" />
                  {item}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </div>
  )
}
