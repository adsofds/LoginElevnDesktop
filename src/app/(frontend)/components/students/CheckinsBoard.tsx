'use client'

import { useMemo, useState } from 'react'
import { WhatsAppGlyph, whatsappUrl } from '../dashboard/AttentionActions'
import { Badge, type BadgeTone } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { KpiStrip } from '../ui/KpiStrip'
import { Segmented } from '../ui/Segmented'
import { Sheet } from '../ui/Sheet'
import { Face, FaceCheckin, faceLabels } from './FaceCheckin'
import { LiveClinAnswersView } from './LiveClinAnswersView'
import { faceThemes, formatKg, type FaceScore, type LiveClinAnswers } from './liveclin'

/** Na tabela o "via LiveClin" é redundante: a aba inteira é do LiveClin. */
const shortSent = (value: string) => value.replace(/\s+via LiveClin$/, '')

export type CheckinStudent = {
  id: string
  name: string
  avatar: string
  whatsapp: string
  goal: string
  phase: string
  checkinState: 'Pendente' | 'Realizado' | 'Atrasado'
}

type Filter = 'todos' | 'avaliar' | 'alertas' | 'avaliados'

const stateLabel: Record<CheckinStudent['checkinState'], string> = {
  Pendente: 'Para avaliar',
  Atrasado: 'Atrasado',
  Realizado: 'Avaliado',
}
const stateTone: Record<CheckinStudent['checkinState'], BadgeTone> = {
  Pendente: 'warning',
  Atrasado: 'danger',
  Realizado: 'success',
}

/**
 * Check-ins tab (Alunos → Check-ins): every student's weekly LiveClin check-in in one
 * list, with the faces per theme; clicking opens the full answers and the actions.
 */
export function CheckinsBoard({
  students,
  answersFor,
  selectedId,
  onSelect,
  onComplete,
  onOpenFicha,
}: {
  students: CheckinStudent[]
  answersFor: (id: string) => LiveClinAnswers
  selectedId: string | null
  onSelect: (id: string | null) => void
  onComplete: (id: string) => void
  onOpenFicha: (id: string) => void
}) {
  const [filter, setFilter] = useState<Filter>('todos')
  const [search, setSearch] = useState('')

  const rows = useMemo(
    () =>
      students
        .map((student) => {
          const answers = answersFor(student.id)
          const faces = faceThemes.map((theme) => ({
            id: theme.id,
            label: theme.label,
            score: theme.score(answers),
          }))
          const alerts = faces.filter((face) => face.score <= 2).length
          return { student, answers, faces, alerts }
        })
        .sort((a, b) => {
          const rank = (state: string) => (state === 'Atrasado' ? 0 : state === 'Pendente' ? 1 : 2)
          return rank(a.student.checkinState) - rank(b.student.checkinState) || b.alerts - a.alerts
        }),
    [students, answersFor],
  )

  const counts = {
    avaliar: rows.filter((row) => row.student.checkinState !== 'Realizado').length,
    alertas: rows.filter((row) => row.alerts > 0).length,
    avaliados: rows.filter((row) => row.student.checkinState === 'Realizado').length,
  }

  const visible = rows.filter((row) => {
    if (search.trim() && !row.student.name.toLowerCase().includes(search.trim().toLowerCase()))
      return false
    if (filter === 'avaliar') return row.student.checkinState !== 'Realizado'
    if (filter === 'alertas') return row.alerts > 0
    if (filter === 'avaliados') return row.student.checkinState === 'Realizado'
    return true
  })

  const selected = rows.find((row) => row.student.id === selectedId)

  return (
    <section aria-labelledby="checkins-title" className="mt-2">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h2 id="checkins-title" className="text-xl font-semibold text-ink">
            Check-ins do LiveClin
          </h2>
          <p className="mt-0.5 text-sm text-ink-2">
            Como cada aluno foi na semana. Clique num aluno para ver as respostas e dar o retorno
            pelo WhatsApp.
          </p>
        </div>
      </div>

      <KpiStrip
        label="Resumo dos check-ins"
        className="mt-5"
        items={[
          { id: 'recebidos', label: 'Recebidos na semana', value: rows.length },
          { id: 'avaliar', label: 'Para avaliar', value: counts.avaliar },
          { id: 'alertas', label: 'Com alertas', value: counts.alertas },
          { id: 'avaliados', label: 'Avaliados', value: counts.avaliados },
        ]}
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Segmented
          label="Filtrar check-ins"
          value={filter}
          onChange={setFilter}
          items={[
            { id: 'todos', label: 'Todos', count: rows.length },
            { id: 'avaliar', label: 'Para avaliar', count: counts.avaliar },
            { id: 'alertas', label: 'Com alertas', count: counts.alertas },
            { id: 'avaliados', label: 'Avaliados', count: counts.avaliados },
          ]}
        />
        <label className="relative ml-auto w-full max-w-xs">
          <span className="sr-only">Buscar aluno</span>
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar aluno"
            className="h-9 w-full rounded-control border border-line bg-surface pr-3 pl-9 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-brand"
          />
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm text-ink">
          <caption className="sr-only">Check-ins da semana</caption>
          <thead>
            <tr className="border-b border-line bg-subtle/60 text-xs text-ink-3">
              {['Aluno', 'Enviado', 'Peso', 'Carinhas da semana', 'Alertas', 'Situação', ''].map(
                (label, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="h-10 px-3 font-semibold whitespace-nowrap first:pl-4 last:pr-4"
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-ink-3">
                  Nenhum check-in com esse filtro.
                </td>
              </tr>
            )}
            {visible.map(({ student, answers, faces, alerts }) => (
              <tr
                key={student.id}
                onClick={() => onSelect(student.id)}
                className="cursor-pointer border-b border-line-subtle last:border-0 hover:bg-subtle/50"
              >
                <td className="py-3 pr-3 pl-4">
                  <span className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={student.avatar}
                      alt=""
                      className="size-9 shrink-0 rounded-full object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold whitespace-nowrap">{student.name}</span>
                      <span className="block text-xs text-ink-3">
                        {student.goal} · {student.phase}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-ink-2">
                  {shortSent(answers.submittedAt)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="block font-medium tabular-nums">
                    {formatKg(answers.weightKg)}
                  </span>
                  {answers.weightTrend && (
                    <span className="block text-xs text-ink-3">{answers.weightTrend}</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className="flex gap-0.5" aria-label="Carinhas por tema">
                    {faces.map((face) => (
                      <span
                        key={face.id}
                        title={`${face.label}: ${faceLabels[face.score as FaceScore]}`}
                      >
                        <Face score={face.score as FaceScore} className="size-5" />
                      </span>
                    ))}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {alerts > 0 ? (
                    <Badge tone="danger" dot>
                      {alerts}
                    </Badge>
                  ) : (
                    <span className="text-xs text-ink-3">Nenhum</span>
                  )}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <Badge tone={stateTone[student.checkinState]} dot>
                    {stateLabel[student.checkinState]}
                  </Badge>
                </td>
                <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap text-brand">
                    Ver detalhes <Icon name="chevronRight" className="size-3.5" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet
        open={!!selected}
        onClose={() => onSelect(null)}
        label={selected ? `Check-in de ${selected.student.name}` : 'Check-in'}
        className="w-[min(820px,100vw)] bg-surface"
      >
        {selected && (
          <div className="flex min-h-0 flex-1 flex-col">
            <header className="flex items-start gap-3 border-b border-line px-6 py-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.student.avatar}
                alt=""
                className="size-12 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tracking-[0.1em] text-ink-3 uppercase">
                  Check-in semanal · LiveClin
                </p>
                <h2 className="text-lg font-semibold text-ink">{selected.student.name}</h2>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-ink-2">
                  {selected.answers.protocolName}
                  <Badge tone={stateTone[selected.student.checkinState]} dot>
                    {stateLabel[selected.student.checkinState]}
                  </Badge>
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Fechar"
                onClick={() => onSelect(null)}
              >
                <Icon name="close" className="size-4" />
              </Button>
            </header>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <FaceCheckin
                studentId={selected.student.id}
                studentName={selected.student.name}
                answers={selected.answers}
              />
              <section aria-label="Respostas do LiveClin">
                <h3 className="mb-2 text-sm font-semibold text-ink">
                  Respostas do aluno (14 perguntas)
                </h3>
                <LiveClinAnswersView answers={selected.answers} />
              </section>
            </div>

            <footer
              className={cx('flex flex-wrap items-center gap-2 border-t border-line px-6 py-4')}
            >
              <a
                href={whatsappUrl(
                  selected.student.whatsapp,
                  `Oi ${selected.student.name.split(' ')[0]}! Vi seu check-in desta semana no LiveClin.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-control border border-line bg-surface px-3 text-sm font-semibold text-ink hover:border-ink-3"
              >
                <WhatsAppGlyph className="size-4 text-[#1f9d55]" />
                Responder no WhatsApp
              </a>
              <Button
                variant="primary"
                size="sm"
                disabled={selected.student.checkinState === 'Realizado'}
                onClick={() => onComplete(selected.student.id)}
              >
                <Icon name="check" className="size-4" />
                {selected.student.checkinState === 'Realizado'
                  ? 'Check-in avaliado'
                  : 'Marcar como avaliado'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => onOpenFicha(selected.student.id)}
              >
                Abrir ficha do aluno
              </Button>
            </footer>
          </div>
        )}
      </Sheet>
    </section>
  )
}
