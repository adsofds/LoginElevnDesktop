'use client'

import { useState } from 'react'
import { dietPlan, type Meal, type SmartSwap } from '@/lib/demo-student-app'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { useStudentApp } from './StudentApp'
import { Card, Chip, GoldButton, PhoneSheet, Ring, ScreenHeader } from './ui'

/*
 * The student only sees calories per meal and the portions to eat. Protein, carbs and fat
 * are the nutritionist's working data and stay in the panel.
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
  const { eatenMeals, toggleMeal, mealSwaps, setMealSwap } = useStudentApp()
  const [open, setOpen] = useState<string | null>(null)
  const [sheet, setSheet] = useState<{ kind: 'subs' | 'smart'; meal: Meal } | null>(null)

  const swapOf = (meal: Meal): SmartSwap | undefined =>
    meal.smartSwaps?.find((swap) => swap.id === mealSwaps[meal.id])
  const kcalOf = (meal: Meal) => swapOf(meal)?.kcal ?? mealKcal(meal)

  const target = dietPlan.targets.kcal
  const consumed = dietPlan.meals
    .filter((meal) => eatenMeals.includes(meal.id))
    .reduce((sum, meal) => sum + kcalOf(meal), 0)
  const doneCount = dietPlan.meals.filter((meal) => eatenMeals.includes(meal.id)).length
  const currentMealId = currentMeal(eatenMeals)?.id

  return (
    <div>
      <ScreenHeader title="Dieta" subtitle={dietPlan.strategy} />

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
          const swap = swapOf(meal)
          const foods = swap ? swap.foods : meal.foods
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
                        {swap && <Chip tone="green">Trocada</Chip>}
                      </span>
                      <span
                        className={cx('block text-[16px] font-semibold', eaten && 'text-white/55')}
                      >
                        {swap ? swap.name : meal.name}
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
                    {swap && <p className="pt-3 text-xs text-white/50">No lugar de: {meal.name}</p>}
                    <ul className="divide-y divide-[var(--app-line)]">
                      {foods.map((food) => (
                        <li
                          key={food.name}
                          className="flex items-center justify-between gap-3 py-3"
                        >
                          <span className="text-[15px]">{food.name}</span>
                          <span className="shrink-0 text-[13px] text-white/50">{food.amount}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={!meal.swaps}
                        onClick={() => setSheet({ kind: 'subs', meal })}
                        className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-white/[0.06] text-[13px] font-medium disabled:opacity-35"
                      >
                        <Icon name="swap" className="size-4" /> Ver substituições
                      </button>
                      <button
                        type="button"
                        disabled={!meal.smartSwaps}
                        onClick={() => setSheet({ kind: 'smart', meal })}
                        className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--app-gold)]/12 text-[13px] font-semibold text-[var(--app-gold)] disabled:opacity-35"
                      >
                        ✨ Trocas inteligentes
                      </button>
                    </div>
                    {swap && (
                      <button
                        type="button"
                        onClick={() => setMealSwap(meal.id, null)}
                        className="mt-2 h-10 w-full text-[13px] font-medium text-white/55"
                      >
                        Voltar para a refeição do plano
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
          <p className="text-xs font-semibold text-[var(--app-gold)]">Recado da nutri</p>
          <p className="mt-0.5 text-sm leading-5 text-white/80">{dietPlan.note}</p>
        </div>
      </Card>

      <PhoneSheet
        open={sheet?.kind === 'subs'}
        onClose={() => setSheet(null)}
        title={`Substituições · ${sheet?.meal.name ?? ''}`}
      >
        <p className="mb-3 text-[13px] text-white/55">
          Troque um alimento por outro, sem mudar o resto da refeição.
        </p>
        <ul className="space-y-2">
          {sheet?.meal.swaps?.map((item) => (
            <li key={item} className="rounded-2xl bg-white/[0.05] px-4 py-3 text-sm">
              {item}
            </li>
          ))}
        </ul>
      </PhoneSheet>

      <PhoneSheet
        open={sheet?.kind === 'smart'}
        onClose={() => setSheet(null)}
        title={`Trocas inteligentes · ${sheet?.meal.name ?? ''}`}
      >
        <p className="mb-3 text-[13px] text-white/55">
          Refeições inteiras com calorias parecidas, para quando o plano não cabe no dia.
        </p>
        <ul className="space-y-2.5">
          {sheet?.meal.smartSwaps?.map((option) => {
            const active = mealSwaps[sheet.meal.id] === option.id
            return (
              <li
                key={option.id}
                className={cx(
                  'rounded-2xl bg-white/[0.05] p-4',
                  active && 'ring-2 ring-[var(--app-gold)] ring-inset',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{option.name}</p>
                    <p className="text-xs text-white/50">{option.context}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {option.kcal} kcal
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-[13px] text-white/70">
                  {option.foods.map((food) => (
                    <li key={food.name} className="flex justify-between gap-3">
                      <span>{food.name}</span>
                      <span className="shrink-0 text-white/45">{food.amount}</span>
                    </li>
                  ))}
                </ul>
                <GoldButton
                  className="mt-3 h-11 text-sm"
                  onClick={() => {
                    setMealSwap(sheet.meal.id, active ? null : option.id)
                    setSheet(null)
                  }}
                >
                  {active ? 'Desfazer troca' : 'Usar esta troca hoje'}
                </GoldButton>
              </li>
            )
          })}
        </ul>
      </PhoneSheet>
    </div>
  )
}
