'use client'

import { cx } from '../ui/cx'
import {
  faceHistory,
  faceTally,
  faceThemes,
  formatKg,
  overallFace,
  overallLabels,
  type FaceScore,
  type LiveClinAnswers,
} from './liveclin'

/**
 * Weekly check-in read as faces: each theme's face is computed from the student's own
 * LiveClin answers (see liveclin.ts), so the coach reads the week at a glance.
 */

export type { FaceScore } from './liveclin'

export const faceLabels: Record<FaceScore, string> = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Ótimo',
}

export const faceTone: Record<FaceScore, string> = {
  1: 'text-danger',
  2: 'text-[#c2611f]',
  3: 'text-ink-3',
  4: 'text-[#4f8a5b]',
  5: 'text-success',
}

const mouths: Record<FaceScore, string> = {
  1: 'M8 16.8 Q12 12.6 16 16.8',
  2: 'M8.5 16.2 Q12 14 15.5 16.2',
  3: 'M8.6 15.2 H15.4',
  4: 'M8.5 14.4 Q12 16.8 15.5 14.4',
  5: 'M8 13.8 Q12 18.8 16 13.8',
}

export function Face({ score, className }: { score: FaceScore; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cx(faceTone[score], className)}>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="9" cy="9.8" r="1.1" fill="currentColor" />
      <circle cx="15" cy="9.8" r="1.1" fill="currentColor" />
      <path
        d={mouths[score]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Trend({ current, previous }: { current: FaceScore; previous: FaceScore }) {
  if (current === previous) return <span className="text-xs text-ink-3">= igual</span>
  const better = current > previous
  return (
    <span className={cx('text-xs font-medium', better ? 'text-success' : 'text-danger')}>
      {better ? '↑ melhorou' : '↓ piorou'}
    </span>
  )
}

const weekLabels = ['há 4 sem.', 'há 3 sem.', 'há 2 sem.', 'Anterior', 'Atual']

export function FaceCheckin({
  studentId,
  studentName,
  answers,
}: {
  studentId: string
  studentName: string
  answers: LiveClinAnswers
}) {
  // Same history as the Histórico tab (8 check-ins); this table shows the last 5.
  const history = faceHistory(studentId, answers, 8)
  const rows = faceThemes.map((theme) => {
    const weeks = history[theme.id].slice(-5)
    return { ...theme, weeks, current: weeks[weeks.length - 1], previous: weeks[weeks.length - 2] }
  })
  const flagged = rows.filter((row) => row.current <= 2)
  const weekCount = rows[0]?.weeks.length ?? 0
  /** Overall face of each check-in, oldest first. */
  const overallByWeek = Array.from({ length: weekCount }, (_, week) =>
    overallFace(rows.map((row) => row.weeks[week])),
  )
  const overall = overallByWeek[weekCount - 1] ?? 3
  const overallBefore = overallByWeek[weekCount - 2] ?? overall
  const tally = faceTally(rows.map((row) => row.current))

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
        <span>
          {answers.submittedAt.startsWith('Pendente')
            ? `Check-in ${answers.submittedAt.toLowerCase()}`
            : `Enviado ${answers.submittedAt.charAt(0).toLowerCase()}${answers.submittedAt.slice(1)}`}
        </span>
        <span>
          Peso em jejum:{' '}
          <strong className="font-semibold text-ink">{formatKg(answers.weightKg)}</strong>
          {answers.weightTrend && ` (${answers.weightTrend})`}
        </span>
        <span className="ml-auto">Notas calculadas a partir das respostas</span>
      </div>

      <section
        aria-label="Resumo geral do check-in"
        className="mt-3 flex flex-wrap items-center gap-4 rounded-card border border-line bg-subtle/60 px-4 py-3"
      >
        <Face score={overall} className="size-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-ink-3">Resumo geral</p>
          <p className={cx('text-lg leading-6 font-semibold', faceTone[overall])}>
            {overallLabels[overall]}
          </p>
          <p className="text-[13px] text-ink-2">
            {tally.good} {tally.good === 1 ? 'tema bom' : 'temas bons'} · {tally.regular}{' '}
            {tally.regular === 1 ? 'regular' : 'regulares'} · {tally.low}{' '}
            {tally.low === 1 ? 'baixo' : 'baixos'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-ink-3">Desde o último check-in</p>
          <p className="mt-0.5">
            {overall === overallBefore ? (
              <span className="text-sm text-ink-2">= Igual</span>
            ) : (
              <span
                className={cx(
                  'text-sm font-semibold',
                  overall > overallBefore ? 'text-success' : 'text-danger',
                )}
              >
                {overall > overallBefore ? '↑ Melhorou' : '↓ Piorou'}
              </span>
            )}
          </p>
        </div>
      </section>

      <p
        role="status"
        className={cx(
          'mt-3 rounded-lg px-3 py-2 text-sm',
          flagged.length ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success',
        )}
      >
        {flagged.length
          ? `${flagged.length} ${flagged.length === 1 ? 'tema pede' : 'temas pedem'} atenção: ${flagged.map((row) => row.label).join(', ')}.`
          : 'Nenhum tema com nota baixa neste check-in.'}
      </p>

      <h3 className="mt-5 text-sm font-semibold text-ink">Comparar com os últimos check-ins</h3>
      <p className="text-xs text-ink-3">
        Cada coluna é um check-in. A linha Geral resume a semana inteira.
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <caption className="sr-only">
            Check-ins de {studentName} comparados por tema, do mais antigo ao atual
          </caption>
          <thead>
            <tr className="text-xs text-ink-3">
              <th scope="col" className="pb-2 text-left font-medium">
                Tema
              </th>
              {weekLabels.slice(-weekCount).map((label, index) => (
                <th
                  key={label}
                  scope="col"
                  className={cx(
                    'pb-2 text-center font-medium',
                    index === weekCount - 1 && 'font-semibold text-ink',
                  )}
                >
                  {label}
                </th>
              ))}
              <th scope="col" className="pb-2 text-right font-medium">
                vs. anterior
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line bg-subtle/60">
              <th scope="row" className="py-2.5 pl-2 text-left font-semibold text-ink">
                Geral
              </th>
              {overallByWeek.map((score, index) => (
                <td
                  key={index}
                  className={cx('py-2.5 text-center', index === weekCount - 1 && 'bg-subtle')}
                  title={`${weekLabels.slice(-weekCount)[index]}: ${overallLabels[score]}`}
                >
                  <Face score={score} className="mx-auto size-7" />
                  <span className="sr-only">{overallLabels[score]}</span>
                </td>
              ))}
              <td className="py-2.5 pr-2 text-right">
                <Trend current={overall} previous={overallBefore} />
              </td>
            </tr>
            {rows.map((row) => {
              const low = row.current <= 2
              return (
                <tr
                  key={row.id}
                  className={cx('border-t border-line-subtle', low && 'bg-danger-soft/60')}
                >
                  <th
                    scope="row"
                    className={cx(
                      'py-2 pl-2 text-left font-medium',
                      low ? 'text-danger' : 'text-ink',
                    )}
                  >
                    {row.label}
                  </th>
                  {row.weeks.map((score, index) => (
                    <td
                      key={index}
                      className={cx(
                        'py-2 text-center',
                        index === weekCount - 1 ? 'bg-subtle/70' : 'opacity-75',
                      )}
                      title={`${weekLabels.slice(-weekCount)[index]}: ${faceLabels[score]}`}
                    >
                      <Face score={score} className="mx-auto size-6" />
                      <span className="sr-only">{faceLabels[score]}</span>
                    </td>
                  ))}
                  <td className="py-2 pr-2 text-right">
                    <Trend current={row.current} previous={row.previous} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {answers.feedback && (
        <blockquote className="mt-3 rounded-lg border border-line bg-subtle px-3 py-2 text-[13px] leading-5 text-ink-2">
          <span className="block text-xs font-medium text-ink-3">Feedback aberto do aluno</span>“
          {answers.feedback}”
        </blockquote>
      )}
    </div>
  )
}
