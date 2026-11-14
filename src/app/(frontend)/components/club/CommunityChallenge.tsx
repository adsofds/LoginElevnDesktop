'use client'

import { useState } from 'react'
import type {
  GymRatsActivityKind,
  GymRatsChallenge,
  GymRatsCheckinPost,
  GymRatsRankingEntry,
} from '../CreationWorkspace'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'

/** "01/04/2026 a 30/04/2026 · Faltam 11 dias" → day 19 of 30 (null when it can't be read). */
function challengeProgress(periodLabel: string) {
  const dates = [...periodLabel.matchAll(/(\d{2})\/(\d{2})\/(\d{4})/g)].map(
    ([, day, month, year]) => new Date(Number(year), Number(month) - 1, Number(day)),
  )
  if (dates.length < 2) return null
  const total = Math.round((dates[1].getTime() - dates[0].getTime()) / 86_400_000) + 1
  const remaining = periodLabel.match(/Faltam (\d+) dias?/)
  if (!remaining) return { day: null, total, range: periodLabel.split('·')[0].trim() }
  return {
    day: Math.max(1, total - Number(remaining[1])),
    total,
    range: periodLabel.split('·')[0].trim(),
  }
}

const kindFilters: { id: 'todos' | GymRatsActivityKind; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'Treino Feito', label: 'Treino' },
  { id: 'Cardio Pago', label: 'Cardio' },
  { id: 'Refeição Feita', label: 'Refeição' },
  { id: 'Meta de Água Batida', label: 'Água' },
]

type Moderation = 'aprovado' | 'oculto' | 'destaque'

const card = 'rounded-card border border-white/10 bg-white/[0.03] p-5'
const overline = 'text-[11px] font-semibold tracking-[0.06em] text-[var(--gold-73)] uppercase'
const darkButton =
  'inline-flex h-8 items-center gap-1.5 rounded-control border border-white/15 px-3 text-xs font-medium text-on-dark transition-colors hover:bg-white/10'

export default function CommunityChallenge({
  challenge,
  leaderboard,
  feed,
  onEditChallenge,
  onPost,
  onCheer,
}: {
  challenge: GymRatsChallenge
  leaderboard: GymRatsRankingEntry[]
  feed: GymRatsCheckinPost[]
  onEditChallenge: () => void
  onPost: () => void
  onCheer: (postId: string) => void
}) {
  const [kind, setKind] = useState<(typeof kindFilters)[number]['id']>('todos')
  const [moderation, setModeration] = useState<Record<string, Moderation>>({})
  const [pulse, setPulse] = useState<string | null>(null)
  const progress = challengeProgress(challenge.periodLabel)
  const ranked = [...leaderboard].sort((a, b) => b.points - a.points)
  const podium = [ranked[1], ranked[0], ranked[2]].filter(Boolean)
  const prizes = [challenge.prizeFirst, challenge.prizeSecond, challenge.prizeThird]
  const visibleFeed = feed
    .filter((post) => kind === 'todos' || post.activityKind === kind)
    .sort(
      (a, b) => Number(moderation[b.id] === 'destaque') - Number(moderation[a.id] === 'destaque'),
    )
  const scoring = [
    ['Treino concluído (MFIT)', challenge.scoring.treinoFeito],
    ['Cardio pago (mín. 25 min)', challenge.scoring.cardioPago],
    ['Refeição do plano feita', challenge.scoring.refeicaoFeita],
    ['Meta de água batida', challenge.scoring.aguaTomada],
    ['Check-in LiveClin em dia', challenge.scoring.checkinLiveClin],
    ['Bônus ofensiva (7 dias seguidos)', challenge.scoring.bonusOfensiva7Dias],
  ] as const

  const moderate = (postId: string, action: Moderation) =>
    setModeration((current) => {
      const next = { ...current }
      if (next[postId] === action) delete next[postId]
      else next[postId] = action
      return next
    })

  return (
    <div className="space-y-5 text-on-dark">
      {/* Hero */}
      <section className={cx(card, 'grid gap-5 lg:grid-cols-[1fr_260px]')}>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--success-fg)_22%,transparent)] px-2.5 py-0.5 text-xs font-medium text-[#9fe0bb]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#9fe0bb]" /> Aberto a
            todos no app
          </span>
          <h2 className="mt-3 text-2xl leading-8 font-semibold tracking-[-0.01em]">
            {challenge.title}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-on-dark/70">
            {challenge.description}
          </p>

          {progress && (
            <div className="mt-5 max-w-xl">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium">
                  {progress.day ? `Dia ${progress.day} de ${progress.total}` : progress.range}
                </span>
                <span className="text-on-dark/55">{progress.range}</span>
              </div>
              <div
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label="Andamento do desafio"
                aria-valuemin={0}
                aria-valuemax={progress.total}
                aria-valuenow={progress.day ?? 0}
              >
                <div
                  className="h-full rounded-full bg-[var(--gold-88)]"
                  style={{ width: `${progress.day ? (progress.day / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {ranked.slice(0, 4).map((member) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={member.id}
                    src={member.avatar}
                    alt=""
                    className="size-8 rounded-full border-2 border-[#17142c] object-cover"
                  />
                ))}
              </div>
              <span className="ml-2 text-xs text-on-dark/70">
                {challenge.participantsCount} participantes
              </span>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <button type="button" className={darkButton} onClick={onEditChallenge}>
                Editar desafio
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-control bg-[var(--gold-88)] px-3 text-xs font-semibold text-night transition-opacity hover:opacity-90"
                onClick={onPost}
              >
                <Icon name="plus" className="size-3.5" /> Postar como Elevn
              </button>
            </div>
          </div>
        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={challenge.coverUrl} alt="" className="size-full object-cover" />
          <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] text-white/85">
            Capa 4:3
          </span>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Podium + ranking */}
        <section className={card} aria-labelledby="podium-title">
          <div className="flex items-center justify-between">
            <div>
              <p className={overline}>Ranking em tempo real</p>
              <h3 id="podium-title" className="mt-1 text-[15px] font-semibold">
                Pódio e premiação
              </h3>
            </div>
            <button type="button" className={darkButton} onClick={onEditChallenge}>
              Editar prêmios
            </button>
          </div>
          <ol className="mt-6 grid grid-cols-3 items-end gap-3" aria-label="Pódio">
            {podium.map((member) => {
              const place = ranked.indexOf(member) + 1
              const height = place === 1 ? 'h-32' : place === 2 ? 'h-24' : 'h-20'
              const medal =
                place === 1
                  ? 'from-[#f3e2a1] to-[#b99a3c]'
                  : place === 2
                    ? 'from-[#eceff3] to-[#9aa3ad]'
                    : 'from-[#f0c9a2] to-[#a86a3c]'
              return (
                <li
                  key={member.id}
                  className="flex flex-col items-center text-center"
                  aria-label={`${place}º lugar: ${member.name}, ${member.points} pontos`}
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.avatar}
                      alt=""
                      className={cx(
                        'rounded-full object-cover ring-2 ring-white/15',
                        place === 1 ? 'size-16' : 'size-12',
                      )}
                    />
                    <span
                      className={cx(
                        'absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-gradient-to-br text-[11px] font-bold text-night',
                        medal,
                      )}
                    >
                      {place}
                    </span>
                  </div>
                  <p className="mt-2 w-full truncate text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-on-dark/60 tabular-nums">
                    {member.points.toLocaleString('pt-BR')} pts
                  </p>
                  <div
                    className={cx(
                      'mt-2 flex w-full flex-col justify-start rounded-t-lg border border-b-0 border-white/10 bg-white/[0.05] p-2',
                      height,
                    )}
                  >
                    <p className="line-clamp-3 text-[11px] leading-4 text-on-dark/70">
                      {prizes[place - 1]}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
          {ranked.length > 3 && (
            <ol start={4} className="mt-4 divide-y divide-white/10 border-t border-white/10">
              {ranked.slice(3).map((member, index) => (
                <li key={member.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="w-6 text-xs text-on-dark/55 tabular-nums">{index + 4}º</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.avatar} alt="" className="size-7 rounded-full object-cover" />
                  <span className="min-w-0 flex-1 truncate">{member.name}</span>
                  <span className="text-xs text-on-dark/55">{member.streakDays} dias seguidos</span>
                  <strong className="w-20 text-right font-semibold tabular-nums">
                    {member.points.toLocaleString('pt-BR')} pts
                  </strong>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Scoring + rules */}
        <section className={cx(card, 'space-y-5')}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">Pontuação</h3>
              <button type="button" className={darkButton} onClick={onEditChallenge}>
                Ajustar pontos
              </button>
            </div>
            <dl className="mt-3 divide-y divide-white/10 text-sm">
              {scoring.map(([label, points]) => (
                <div key={label} className="flex items-center justify-between py-2">
                  <dt className="text-on-dark/75">{label}</dt>
                  <dd className="font-semibold text-[var(--gold-88)] tabular-nums">+{points}</dd>
                </div>
              ))}
            </dl>
          </div>
          <details className="group rounded-lg border border-white/10 px-3 py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium [&::-webkit-details-marker]:hidden">
              Regulamento ({challenge.rules.length} regras)
              <Icon
                name="chevronRight"
                className="size-4 text-on-dark/60 transition-transform group-open:rotate-90"
              />
            </summary>
            <ol className="mt-2 list-decimal space-y-1.5 pb-1 pl-5 text-[13px] leading-5 text-on-dark/75 marker:text-on-dark/45">
              {challenge.rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ol>
          </details>
        </section>
      </div>

      {/* Mural */}
      <section className={card} aria-labelledby="mural-title">
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <p className={overline}>Mural de check-ins</p>
            <h3 id="mural-title" className="mt-1 text-[15px] font-semibold">
              Registros dos alunos
            </h3>
          </div>
          <div role="radiogroup" aria-label="Filtrar por tipo" className="flex flex-wrap gap-1">
            {kindFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                role="radio"
                aria-checked={kind === filter.id}
                onClick={() => setKind(filter.id)}
                className={cx(
                  'h-7 rounded-full px-3 text-xs font-medium transition-colors',
                  kind === filter.id
                    ? 'bg-[var(--gold-88)] text-night'
                    : 'border border-white/15 text-on-dark/75 hover:bg-white/10',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {visibleFeed.length === 0 ? (
          <p className="py-10 text-center text-sm text-on-dark/55">
            Nenhum registro deste tipo ainda.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleFeed.map((post) => {
              const state = moderation[post.id]
              return (
                <article
                  key={post.id}
                  className={cx(
                    'group/post overflow-hidden rounded-xl border bg-white/[0.03] transition-opacity',
                    state === 'destaque' ? 'border-[var(--gold-88)]' : 'border-white/10',
                    state === 'oculto' && 'opacity-45',
                  )}
                >
                  <div className="relative aspect-[4/3]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.photoUrl4x3}
                      alt={post.title}
                      className="size-full object-cover"
                    />
                    <span className="absolute top-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] text-white/90">
                      {post.activityKind}
                    </span>
                    {state && (
                      <span className="absolute top-2 right-2 rounded-md bg-black/65 px-2 py-0.5 text-[11px] font-medium text-[var(--gold-88)]">
                        {state === 'aprovado'
                          ? 'Aprovado'
                          : state === 'oculto'
                            ? 'Oculto no app'
                            : 'Em destaque'}
                      </span>
                    )}
                    <div className="absolute inset-x-2 bottom-2 flex gap-1.5 opacity-0 transition-opacity group-hover/post:opacity-100 group-focus-within/post:opacity-100 [@media(hover:none)]:opacity-100">
                      {(
                        [
                          ['aprovado', 'Aprovar'],
                          ['oculto', 'Ocultar'],
                          ['destaque', 'Destacar'],
                        ] as const
                      ).map(([action, label]) => (
                        <button
                          key={action}
                          type="button"
                          aria-pressed={state === action}
                          onClick={() => moderate(post.id, action)}
                          className={cx(
                            'h-7 flex-1 rounded-md text-xs font-medium backdrop-blur transition-colors',
                            state === action
                              ? 'bg-[var(--gold-88)] text-night'
                              : 'bg-black/60 text-white hover:bg-black/75',
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.studentAvatar}
                        alt=""
                        className="size-7 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{post.studentName}</p>
                        <p className="text-[11px] text-on-dark/55">{post.timeLabel}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#9fe0bb] tabular-nums">
                        +{post.pointsEarned} pts
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium">{post.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-on-dark/65">
                      {post.note}
                    </p>
                    <button
                      type="button"
                      aria-pressed={!!post.cheeredByMe}
                      onClick={() => {
                        onCheer(post.id)
                        setPulse(post.id)
                        window.setTimeout(() => setPulse(null), 400)
                      }}
                      className={cx(
                        'mt-3 inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all',
                        post.cheeredByMe
                          ? 'bg-[var(--gold-88)] text-night'
                          : 'border border-white/15 text-on-dark/80 hover:bg-white/10',
                        pulse === post.id && 'scale-110 motion-reduce:scale-100',
                      )}
                    >
                      ◆ Incentivar <span className="tabular-nums">{post.cheersCount}</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
