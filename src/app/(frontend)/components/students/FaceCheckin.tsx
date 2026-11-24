'use client'

import { cx } from '../ui/cx'
import { faceHistory, faceThemes, formatKg, type FaceScore, type LiveClinAnswers } from './liveclin'

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

const faceTone: Record<FaceScore, string> = {
  1: 'text-danger',
  2: 'text-[#c2611f]',
  3: 'text-ink-3',
  4: 'text-[#4f8a5b]',
  5: 'text-success',
}

const faceDot: Record<FaceScore, string> = {
  1: 'bg-danger',
  2: 'bg-[#c2611f]',
  3: 'bg-ink-3',
  4: 'bg-[#4f8a5b]',
  5: 'bg-success',
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

export function FaceCheckin({
  studentId,
  studentName,
  answers,
}: {
  studentId: string
  studentName: string
  answers: LiveClinAnswers
}) {
  const history = faceHistory(studentId, answers)
  const rows = faceThemes.map((theme) => {
    const weeks = history[theme.id]
    return { ...theme, weeks, current: weeks[weeks.length - 1], previous: weeks[weeks.length - 2] }
  })
  const flagged = rows.filter((row) => row.current <= 2)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
        <span>Enviado {answers.submittedAt}</span>
        <span>
          Peso em jejum:{' '}
          <strong className="font-semibold text-ink">{formatKg(answers.weightKg)}</strong>
          {answers.weightTrend && ` (${answers.weightTrend})`}
        </span>
        <span className="ml-auto">Carinhas calculadas a partir das respostas</span>
      </div>

      <p
        role="status"
        className={cx(
          'mt-3 rounded-lg px-3 py-2 text-sm',
          flagged.length ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success',
        )}
      >
        {flagged.length
          ? `${flagged.length} ${flagged.length === 1 ? 'tema pede' : 'temas pedem'} atenção: ${flagged.map((row) => row.label).join(', ')}.`
          : 'Nenhum tema com nota baixa nesta semana.'}
      </p>

      <table className="mt-3 w-full border-collapse text-sm">
        <caption className="sr-only">
          Check-in semanal de {studentName} em escala de carinhas
        </caption>
        <thead>
          <tr className="text-left text-xs text-ink-3">
            <th scope="col" className="pb-2 font-medium">
              Tema
            </th>
            <th scope="col" className="pb-2 font-medium">
              Esta semana
            </th>
            <th scope="col" className="hidden pb-2 font-medium sm:table-cell">
              vs. anterior
            </th>
            <th scope="col" className="pb-2 text-right font-medium">
              Últimas 4 semanas
            </th>
          </tr>
        </thead>
        <tbody>
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
                    'py-2.5 pl-2 text-left font-medium',
                    low ? 'text-danger' : 'text-ink',
                  )}
                >
                  {row.label}
                </th>
                <td className="py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <Face score={row.current} className="size-7" />
                    <span
                      className={cx(
                        'text-[13px]',
                        low ? 'font-semibold text-danger' : 'text-ink-2',
                      )}
                    >
                      {faceLabels[row.current]}
                    </span>
                  </span>
                </td>
                <td className="hidden py-2.5 sm:table-cell">
                  <Trend current={row.current} previous={row.previous} />
                </td>
                <td className="py-2.5 pr-2">
                  <ol className="flex justify-end gap-1.5" aria-label={`Histórico de ${row.label}`}>
                    {row.weeks.slice(-4).map((score, index, list) => (
                      <li
                        key={index}
                        title={`${index === list.length - 1 ? 'Esta semana' : `${list.length - 1 - index} sem. atrás`}: ${faceLabels[score]}`}
                        className={cx(
                          'size-2.5 rounded-full',
                          faceDot[score],
                          index < list.length - 1 && 'opacity-60',
                        )}
                      >
                        <span className="sr-only">{faceLabels[score]}</span>
                      </li>
                    ))}
                  </ol>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {answers.feedback && (
        <blockquote className="mt-3 rounded-lg border border-line bg-subtle px-3 py-2 text-[13px] leading-5 text-ink-2">
          <span className="block text-xs font-medium text-ink-3">Feedback aberto do aluno</span>“
          {answers.feedback}”
        </blockquote>
      )}
    </div>
  )
}
