'use client'

import { useState } from 'react'
import { dietPlan, type Meal } from '@/lib/demo-student-app'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { useStudentApp } from './StudentApp'
import { SmartSwaps } from './SmartSwaps'
import { Card, Chip, PhoneSheet, Ring, ScreenHeader } from './ui'

/*
 * Plano: calories per meal and the portions to eat (protein, carbs and fat of the plan stay
 * with the nutritionist). Trocas inteligentes: a separate calculator to swap any food for
 * another with the same calories, plus a barcode lookup.
 */

const mealKcal = (meal: Meal) => meal.foods.reduce((sum, food) => sum + food.kcal, 0)

/**
 * The meal to show as "Agora" / "Próxima refeição": the first one not eaten yet whose time
 * is at most 30 minutes ago. Shared by Início and Dieta so both say the same thing.
 */
export function currentMeal(eatenMeals: string[], now = new Date()) {
  const minutesNow = now.getHours() * 60 + now.getMinutes()
  return dietPlan.meals.find((meal) => {
    const [h, m] = meal.time.split(':').map(Number)
    return h * 60 + m >= minutesNow - 30 && !eatenMeals.includes(meal.id)
  })
}

export function DietTab() {
  const { eatenMeals, toggleMeal } = useStudentApp()
  const [view, setView] = useState<'plano' | 'trocas'>('plano')
  const [open, setOpen] = useState<string | null>(null)
  const [sheet, setSheet] = useState<Meal | null>(null)
  const kcalOf = mealKcal

  const target = dietPlan.targets.kcal
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
                              <span className="shrink-0 text-[13px] text-white/50">
                                {food.amount}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          disabled={!meal.swaps}
                          onClick={() => setSheet(meal)}
                          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.06] text-[13px] font-medium disabled:opacity-35"
                        >
                          <Icon name="swap" className="size-4" /> Ver substituições da nutri
                        </button>
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
              <p className="text-xs font-semibold text-[var(--app-gold)]">Recado da nutri</p>
              <p className="mt-0.5 text-sm leading-5 text-white/80">{dietPlan.note}</p>
            </div>
          </Card>
        </>
      )}

      <PhoneSheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={`Substituições · ${sheet?.name ?? ''}`}
      >
        <p className="mb-3 text-[13px] text-white/55">
          Troque um alimento por outro, sem mudar o resto da refeição.
        </p>
        <ul className="space-y-2">
          {sheet?.swaps?.map((item) => (
            <li key={item} className="rounded-2xl bg-white/[0.05] px-4 py-3 text-sm">
              {item}
            </li>
          ))}
        </ul>
      </PhoneSheet>
    </div>
  )
}
