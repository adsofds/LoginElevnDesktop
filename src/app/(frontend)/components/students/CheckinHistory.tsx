'use client'

import { useMemo, useState } from 'react'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { Face, faceLabels, faceTone } from './FaceCheckin'
import {
  checkinHistory,
  faceThemes,
  formatKg,
  overallLabels,
  type CheckinHistoryEntry,
  type FaceScore,
  type LiveClinAnswers,
} from './liveclin'

const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

function Change({ from, to }: { from: FaceScore; to: FaceScore }) {
  if (from === to) return <span className="text-xs text-ink-3">= igual</span>
  const better = to > from
  return (
    <span className={cx('text-xs font-medium', better ? 'text-success' : 'text-danger')}>
      {better ? '↑ melhorou' : '↓ piorou'}
    </span>
  )
}

const kgDelta = (kg: number) =>
  `${kg > 0 ? '+' : kg < 0 ? '−' : ''}${Math.abs(kg).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} kg`

/**
 * Check-in history for the admin: pick any two check-ins and compare them theme by
 * theme (with weight and feedback), and scan the full list of past check-ins.
 */
export function CheckinHistory({
  studentId,
  studentName,
  answers,
}: {
  studentId: string
  studentName: string
  answers: LiveClinAnswers
}) {
  const history = useMemo(() => checkinHistory(studentId, answers), [studentId, answers])
  // Rendered only in the open sheet (client), so "today" is the viewer's today.
  const [today] = useState(() => Date.now())
  const [first, setFirst] = useState(1)
  const [second, setSecond] = useState(0)
  // The full list is a dropdown, closed until the coach opens it.
  const [listOpen, setListOpen] = useState(false)

  const dateOf = (entry: CheckinHistoryEntry) =>
    dayMonth.format(new Date(today - entry.daysAgo * 86_400_000)).replaceAll('.', '')
  const labelOf = (entry: CheckinHistoryEntry) =>
    entry.weeksAgo === 0
      ? `Atual · ${dateOf(entry)}`
      : `${dateOf(entry)} · há ${entry.weeksAgo} sem.`

  const a = history[first]
  const b = history[second]
  // Always compare older → newer, whatever order the coach picked them in.
  const [older, newer] = a.weeksAgo >= b.weeksAgo ? [a, b] : [b, a]

  const select =
    'h-9 rounded-control border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand'

  return (
    <div className="space-y-7">
      <section aria-labelledby="comparar-checkins">
        <h3 id="comparar-checkins" className="text-sm font-semibold text-ink">
          Comparar dois check-ins
        </h3>
        <p className="text-xs text-ink-3">Escolha quaisquer dois check-ins do histórico.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-2">
          <label className="sr-only" htmlFor="checkin-a">
            Primeiro check-in
          </label>
          <select
            id="checkin-a"
            className={select}
            value={first}
            onChange={(event) => setFirst(Number(event.target.value))}
          >
            {history.map((entry) => (
              <option key={entry.weeksAgo} value={entry.weeksAgo}>
                {labelOf(entry)}
              </option>
            ))}
          </select>
          <span>com</span>
          <label className="sr-only" htmlFor="checkin-b">
            Segundo check-in
          </label>
          <select
            id="checkin-b"
            className={select}
            value={second}
            onChange={(event) => setSecond(Number(event.target.value))}
          >
            {history.map((entry) => (
              <option key={entry.weeksAgo} value={entry.weeksAgo}>
                {labelOf(entry)}
              </option>
            ))}
          </select>
        </div>

        {older === newer ? (
          <p className="mt-3 rounded-lg bg-subtle px-3 py-2 text-sm text-ink-2">
            Escolha dois check-ins diferentes para comparar.
          </p>
        ) : (
          <>
            <table className="mt-3 w-full border-collapse text-sm">
              <caption className="sr-only">
                Check-in de {labelOf(older)} comparado com {labelOf(newer)}, de {studentName}
              </caption>
              <thead>
                <tr className="text-xs text-ink-3">
                  <th scope="col" className="pb-2 text-left font-medium">
                    Tema
                  </th>
                  <th scope="col" className="pb-2 text-center font-medium">
                    {labelOf(older)}
                  </th>
                  <th scope="col" className="pb-2 text-center font-semibold text-ink">
                    {labelOf(newer)}
                  </th>
                  <th scope="col" className="pb-2 text-right font-medium">
                    Mudança
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line bg-subtle/60">
                  <th scope="row" className="py-2.5 pl-2 text-left font-semibold text-ink">
                    Geral
                  </th>
                  {[older, newer].map((entry) => (
                    <td key={entry.weeksAgo} className="py-2.5">
                      <span className="flex items-center justify-center gap-1.5">
                        <Face score={entry.overall} className="size-6" />
                        <span className={cx('text-xs font-medium', faceTone[entry.overall])}>
                          {overallLabels[entry.overall]}
                        </span>
                      </span>
                    </td>
                  ))}
                  <td className="py-2.5 pr-2 text-right">
                    <Change from={older.overall} to={newer.overall} />
                  </td>
                </tr>
                <tr className="border-t border-line-subtle">
                  <th scope="row" className="py-2 pl-2 text-left font-medium text-ink">
                    Peso
                  </th>
                  {[older, newer].map((entry) => (
                    <td key={entry.weeksAgo} className="py-2 text-center tabular-nums">
                      {formatKg(entry.weightKg)}
                    </td>
                  ))}
                  <td className="py-2 pr-2 text-right text-xs font-medium text-ink-2 tabular-nums">
                    {kgDelta(Math.round((newer.weightKg - older.weightKg) * 10) / 10)}
                  </td>
                </tr>
                {faceThemes.map((theme) => {
                  const before = older.faces[theme.id]
                  const after = newer.faces[theme.id]
                  return (
                    <tr
                      key={theme.id}
                      className={cx(
                        'border-t border-line-subtle',
                        after <= 2 && 'bg-danger-soft/60',
                      )}
                    >
                      <th
                        scope="row"
                        className={cx(
                          'py-2 pl-2 text-left font-medium',
                          after <= 2 ? 'text-danger' : 'text-ink',
                        )}
                      >
                        {theme.label}
                      </th>
                      {[before, after].map((score, index) => (
                        <td key={index} className="py-2 text-center" title={faceLabels[score]}>
                          <Face score={score} className="mx-auto size-6" />
                          <span className="sr-only">{faceLabels[score]}</span>
                        </td>
                      ))}
                      <td className="py-2 pr-2 text-right">
                        <Change from={before} to={after} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[older, newer].map((entry) => (
                <figure
                  key={entry.weeksAgo}
                  className="rounded-lg border border-line bg-subtle px-3 py-2"
                >
                  <figcaption className="text-xs font-medium text-ink-3">
                    Feedback · {labelOf(entry)}
                  </figcaption>
                  {entry.feedback ? (
                    <blockquote className="mt-0.5 text-[13px] leading-5 text-ink-2">
                      “{entry.feedback}”
                    </blockquote>
                  ) : (
                    <p className="mt-0.5 text-[13px] text-ink-3">Sem feedback escrito.</p>
                  )}
                </figure>
              ))}
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="historico-checkins" className="rounded-card border border-line">
        <button
          type="button"
          onClick={() => setListOpen((open) => !open)}
          aria-expanded={listOpen}
          aria-controls="historico-checkins-lista"
          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-card px-4 py-3 text-left hover:bg-subtle/60"
        >
          <span>
            <span id="historico-checkins" className="block text-sm font-semibold text-ink">
              Histórico de check-ins ({history.length})
            </span>
            <span className="block text-xs text-ink-3">
              {listOpen ? 'Do mais recente ao mais antigo.' : 'Clique para ver todos os check-ins.'}
            </span>
          </span>
          <Icon
            name="chevronRight"
            className={cx(
              'size-4 shrink-0 text-ink-3 transition-transform',
              listOpen && 'rotate-90',
            )}
          />
        </button>
        <div
          id="historico-checkins-lista"
          hidden={!listOpen}
          className="overflow-x-auto border-t border-line-subtle px-4 pt-3 pb-2"
        >
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <caption className="sr-only">Todos os check-ins de {studentName}</caption>
            <thead>
              <tr className="text-left text-xs text-ink-3">
                <th scope="col" className="pr-3 pb-2 font-medium">
                  Data
                </th>
                <th scope="col" className="pr-3 pb-2 font-medium">
                  Geral
                </th>
                <th scope="col" className="pr-3 pb-2 font-medium">
                  Peso
                </th>
                <th scope="col" className="pr-3 pb-2 font-medium">
                  Temas baixos
                </th>
                <th scope="col" className="pr-3 pb-2 font-medium">
                  Feedback
                </th>
                <th scope="col" className="pb-2">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => {
                const previous = history[index + 1]
                const low = Object.values(entry.faces).filter((score) => score <= 2).length
                const inComparison = entry.weeksAgo === first || entry.weeksAgo === second
                return (
                  <tr
                    key={entry.weeksAgo}
                    className={cx(
                      'border-t border-line-subtle align-top',
                      inComparison && 'bg-brand-soft/40',
                    )}
                  >
                    <td className="py-2.5 pr-3 whitespace-nowrap">
                      <span className="block font-medium text-ink">{dateOf(entry)}</span>
                      <span className="block text-xs text-ink-3">
                        {entry.weeksAgo === 0 ? 'Atual' : `há ${entry.weeksAgo} sem.`}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Face score={entry.overall} className="size-6" />
                        <span className={cx('text-xs font-medium', faceTone[entry.overall])}>
                          {overallLabels[entry.overall]}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap tabular-nums">
                      <span className="block text-ink">{formatKg(entry.weightKg)}</span>
                      {previous && (
                        <span className="block text-xs text-ink-3">
                          {kgDelta(Math.round((entry.weightKg - previous.weightKg) * 10) / 10)}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      {low ? (
                        <span className="text-xs font-semibold text-danger">{low}</span>
                      ) : (
                        <span className="text-xs text-ink-3">Nenhum</span>
                      )}
                    </td>
                    <td className="max-w-[260px] py-2.5 pr-3">
                      <span
                        className="line-clamp-2 text-xs leading-5 text-ink-2"
                        title={entry.feedback || undefined}
                      >
                        {entry.feedback ? `“${entry.feedback}”` : '—'}
                      </span>
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      {entry.weeksAgo !== 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setFirst(entry.weeksAgo)
                            setSecond(0)
                            document
                              .getElementById('comparar-checkins')
                              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }}
                        >
                          Comparar com atual
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
