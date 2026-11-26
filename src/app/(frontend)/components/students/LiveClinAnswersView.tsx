'use client'

import { useState, type ReactNode } from 'react'
import { cx } from '../ui/cx'
import { Face, faceLabels } from './FaceCheckin'
import {
  answerFor,
  answerSummary,
  emojiFor,
  faceForQuestion,
  formatKg,
  liveClinQuestions,
  type FaceScore,
  type LiveClinAnswers,
  type LiveClinQuestion,
  type QuestionIcon,
} from './liveclin'

/** Small line icons in the spirit of LiveClin's question headers. */
const iconPaths: Record<QuestionIcon, ReactNode> = {
  scale: (
    <>
      <path d="M6 20h12l-1.6-11H7.6z" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0" />
    </>
  ),
  meal: <path d="M7 4v7m-2-7v4a2 2 0 0 0 4 0V4M7 11v9m9-16c-1.7 0-3 2-3 5s1 4 3 4v7" />,
  hunger: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 15c1.8-1.3 4.2-1.3 6 0M9.5 10h.01M14.5 10h.01" />
    </>
  ),
  water: <path d="M7 4h10l-1.4 15a1.5 1.5 0 0 1-1.5 1.4H9.9a1.5 1.5 0 0 1-1.5-1.4zM7.6 10h8.8" />,
  timer: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 13V9.5M10 3h4" />
    </>
  ),
  face: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 15h6M9.5 10h.01M14.5 10h.01" />
    </>
  ),
  menu: <path d="M8 3v8m-2-8v5h4V3m-2 8v10M16 3c-2 1-2.5 3-2.5 6s1 3 2.5 3v9" />,
  dumbbell: (
    <path d="M6.5 6.5l11 11M4 9l5-5M15 20l5-5M3 12l2.5-2.5M12 3L9.5 5.5M21 12l-2.5 2.5M12 21l2.5-2.5" />
  ),
  trend: <path d="M4 17l6-6 4 4 6-7m0 0h-4m4 0v4" />,
  heart: (
    <path d="M12 19s-7-4.4-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 2.5C19 14.6 12 19 12 19zM12 10v4m-2-2h4" />
  ),
  sleep: <path d="M12 4a6 6 0 0 0 6 6v2a6 6 0 1 1-6-8zM15 3h4l-4 4h4" />,
  star: <path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4 7.2 18.9l.9-5.4-3.9-3.8 5.4-.8z" />,
  body: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M6 9h12M12 9v5m0 0l-3 6m3-6l3 6" />
    </>
  ),
  chat: <path d="M5 18l1.5-3.5A7 7 0 1 1 12 19a7 7 0 0 1-3.3-.8zM9 11h6" />,
}

function QuestionGlyph({ icon }: { icon: QuestionIcon }) {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-subtle text-ink-2">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {iconPaths[icon]}
      </svg>
    </span>
  )
}

const label = 'text-xs font-semibold text-ink-2'

function NoteBox({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mt-3">
      <p className={label}>{title}</p>
      <p
        className={cx(
          'mt-1.5 rounded-lg border border-line bg-subtle px-3 py-2 text-[13px] leading-5',
          text ? 'text-ink' : 'text-ink-3 italic',
        )}
      >
        {text || 'Sem resposta'}
      </p>
    </div>
  )
}

function Answer({ question, answers }: { question: LiveClinQuestion; answers: LiveClinAnswers }) {
  const { value, note } = answerFor(question, answers)

  if (question.kind === 'kg') {
    return (
      <div className="mt-3">
        <p className={label}>Informe a medida em quilogramas (kg)</p>
        <p className="mt-1.5 flex h-10 items-center justify-between rounded-lg border border-line bg-subtle px-3 text-sm font-semibold text-ink tabular-nums">
          {formatKg(Number(value))}
          {answers.weightTrend && (
            <span className="text-xs font-medium text-ink-3">{answers.weightTrend}</span>
          )}
        </p>
      </div>
    )
  }

  if (question.kind === 'scale') {
    const options = Array.from(
      { length: question.max - question.min + 1 },
      (_, i) => question.min + i,
    )
    return (
      <div className="mt-3">
        <p className={label}>Selecione uma alternativa</p>
        <ol className="mt-2 flex flex-wrap gap-1.5" aria-label={question.title}>
          {options.map((option) => {
            const selected = option === value
            return (
              <li
                key={option}
                aria-current={selected ? 'true' : undefined}
                className={cx(
                  'grid size-8 place-items-center rounded-md border text-xs font-semibold tabular-nums',
                  selected ? 'border-ink bg-ink text-surface' : 'border-line text-ink-3',
                )}
              >
                {option}
                {selected && <span className="sr-only"> (resposta)</span>}
              </li>
            )
          })}
        </ol>
        <p className="mt-1.5 flex justify-between text-[11px] font-semibold text-ink-3">
          <span>{question.minLabel}</span>
          <span>{question.maxLabel}</span>
        </p>
        {question.noteLabel && <NoteBox title={question.noteLabel} text={note} />}
      </div>
    )
  }

  if (question.kind === 'options' || question.kind === 'emoji') {
    const selectedIndex = question.kind === 'emoji' ? 5 - Number(value) : Number(value)
    const showNote =
      question.noteLabel &&
      (question.kind === 'emoji' || !question.noteWhen || question.noteWhen.includes(selectedIndex))
    return (
      <div className="mt-3">
        <p className={label}>Selecione uma alternativa</p>
        <ul
          className={cx('mt-2 gap-1.5', question.kind === 'emoji' ? 'flex flex-wrap' : 'grid')}
          aria-label={question.title}
        >
          {question.options.map((option, index) => {
            const selected = index === selectedIndex
            return (
              <li
                key={option}
                aria-current={selected ? 'true' : undefined}
                className={cx(
                  'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] leading-5',
                  selected
                    ? 'border-ink bg-ink/[0.04] font-semibold text-ink'
                    : 'border-line text-ink-3',
                )}
              >
                {question.kind === 'emoji' && (
                  <span aria-hidden="true">{emojiFor((5 - index) as FaceScore)}</span>
                )}
                <span className="min-w-0 flex-1">{option}</span>
                {selected && (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="size-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12.5l4.2 4.2L19 7" />
                  </svg>
                )}
                {selected && <span className="sr-only"> (resposta)</span>}
              </li>
            )
          })}
        </ul>
        {showNote && <NoteBox title={question.noteLabel!} text={note} />}
      </div>
    )
  }

  return <NoteBox title={question.label} text={typeof value === 'string' ? value : undefined} />
}

/**
 * The 14 LiveClin questions as a compact list: one line per question with the answer and
 * the computed face. Opening a line shows it exactly as the student saw it in LiveClin.
 */
export function LiveClinAnswersView({ answers }: { answers: LiveClinAnswers }) {
  const [open, setOpen] = useState<string[]>([])
  const allOpen = open.length === liveClinQuestions.length
  const toggle = (id: string) =>
    setOpen((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )

  return (
    <div className="@container">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs text-ink-3">Toque numa pergunta para ver como no LiveClin.</p>
        <button
          type="button"
          onClick={() => setOpen(allOpen ? [] : liveClinQuestions.map((item) => item.id))}
          className="shrink-0 cursor-pointer rounded-control border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink-2 hover:border-ink-3 hover:text-ink"
        >
          {allOpen ? 'Recolher todas' : 'Expandir todas'}
        </button>
      </div>
      <ol className="grid gap-1.5 @2xl:grid-cols-2">
        {liveClinQuestions.map((question, index) => {
          const face = faceForQuestion(question.id, answers)
          const expanded = open.includes(question.id)
          const { main, note } = answerSummary(question, answers)
          const low = face !== null && face <= 2
          const panelId = `liveclin-${question.id}`
          return (
            <li
              key={question.id}
              className={cx(
                'overflow-hidden rounded-lg border bg-surface',
                (question.kind === 'text' || expanded) && '@2xl:col-span-2',
                low ? 'border-danger/40 bg-danger-soft/40' : 'border-line',
              )}
            >
              <button
                type="button"
                onClick={() => toggle(question.id)}
                aria-expanded={expanded}
                aria-controls={panelId}
                className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left hover:bg-subtle/60"
              >
                <QuestionGlyph icon={question.icon} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-[11px] text-ink-3 tabular-nums">{index + 1}.</span>
                    <span className="truncate text-[13px] font-semibold text-ink">
                      {question.title}
                    </span>
                  </span>
                  <span className="block truncate text-[13px] text-ink-2">
                    {main}
                    {note && <span className="text-ink-3"> · “{note}”</span>}
                  </span>
                </span>
                {face !== null && (
                  <span title={`Carinha calculada: ${faceLabels[face]}`} className="shrink-0">
                    <Face score={face} className="size-5" />
                    <span className="sr-only">{faceLabels[face]}</span>
                  </span>
                )}
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className={cx(
                    'size-4 shrink-0 text-ink-3 transition-transform',
                    expanded && 'rotate-180',
                  )}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {expanded && (
                <div id={panelId} className="border-t border-line-subtle px-3 pt-2.5 pb-3">
                  <p className="text-[11px] text-ink-3 tabular-nums">
                    Pergunta {index + 1} de {liveClinQuestions.length}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-5 text-ink">
                    {question.question}
                    {question.example && (
                      <span className="mt-1 block text-ink-3">{question.example}</span>
                    )}
                  </p>
                  <Answer question={question} answers={answers} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
