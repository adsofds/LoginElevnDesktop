'use client'

import { useState } from 'react'
import type {
  GymRatsChallenge,
  GymRatsCheckinPost,
  GymRatsRankingEntry,
} from '../CreationWorkspace'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'

const DAY = 86_400_000
const startOfDay = (date: Date) => {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/** Day X of N from the challenge dates (null until the client resolves them). */
export function challengeProgress(challenge: GymRatsChallenge) {
  if (!challenge.startIso || !challenge.endIso) return null
  const start = startOfDay(new Date(challenge.startIso))
  const end = startOfDay(new Date(challenge.endIso))
  const total = Math.round((end.getTime() - start.getTime()) / DAY) + 1
  const elapsed = Math.floor((startOfDay(new Date()).getTime() - start.getTime()) / DAY) + 1
  const day = Math.min(total, Math.max(0, elapsed))
  return { day, total, start, range: challenge.periodLabel.split('·')[0].trim() }
}

const timeFormat = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const dayFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

export function postTime(post: GymRatsCheckinPost) {
  if (!post.postedAtIso) return post.timeLabel
  const at = new Date(post.postedAtIso)
  const diff = Math.round((startOfDay(new Date()).getTime() - startOfDay(at).getTime()) / DAY)
  const dayLabel =
    diff === 0 ? 'Hoje' : diff === 1 ? 'Ontem' : dayFormat.format(at).replace('.', '')
  return `${dayLabel} · ${timeFormat.format(at)}`
}

const rejectReasons = [
  'Foto não comprova a atividade',
  'Fora do horário ou do dia',
  'Registro duplicado',
  'Não segue o regulamento',
]

type DateFilter =
  | { mode: 'hoje' | '7d' | 'tudo' }
  | { mode: 'dia'; day: number }
  | { mode: 'periodo'; from: string; to: string }

const card = 'min-w-0 rounded-card border border-white/10 bg-white/[0.03] p-5'
const overline = 'text-[11px] font-semibold tracking-[0.06em] text-[var(--gold-73)] uppercase'
const darkButton =
  'inline-flex h-8 items-center gap-1.5 rounded-control border border-white/15 px-3 text-xs font-medium text-on-dark transition-colors hover:bg-white/10'
const chip = (active: boolean) =>
  cx(
    'h-7 shrink-0 rounded-full px-3 text-xs font-medium transition-colors',
    active
      ? 'bg-[var(--gold-88)] text-night'
      : 'border border-white/15 text-on-dark/75 hover:bg-white/10',
  )
const dateInput =
  'h-7 rounded-md border border-white/15 bg-transparent px-2 text-xs text-on-dark [color-scheme:dark]'

export default function CommunityChallenge({
  challenge,
  leaderboard,
  feed,
  onEditChallenge,
  onPost,
  onCheer,
  onReject,
  onRestore,
  onHighlight,
}: {
  challenge: GymRatsChallenge
  leaderboard: GymRatsRankingEntry[]
  feed: GymRatsCheckinPost[]
  onEditChallenge: () => void
  onPost: () => void
  onCheer: (postId: string) => void
  onReject: (postId: string, reason: string) => void
  onRestore: (postId: string) => void
  onHighlight: (postId: string) => void
}) {
  const [kind, setKind] = useState('todos')
  const [status, setStatus] = useState<'todos' | 'aprovado' | 'reprovado' | 'destaque'>('todos')
  const [dateFilter, setDateFilter] = useState<DateFilter>({ mode: 'tudo' })
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [customReason, setCustomReason] = useState('')
  const [pulse, setPulse] = useState<string | null>(null)

  const progress = challengeProgress(challenge)
  const ranked = [...leaderboard].sort((a, b) => b.points - a.points)
  const podium = [ranked[1], ranked[0], ranked[2]].filter(Boolean)
  const prizes = [challenge.prizeFirst, challenge.prizeSecond, challenge.prizeThird]

  const challengeFeed = feed.filter((post) => post.challengeId === challenge.id)
  const today = startOfDay(new Date()).getTime()
  const postDay = (post: GymRatsCheckinPost) =>
    post.postedAtIso ? startOfDay(new Date(post.postedAtIso)).getTime() : null
  const dayIndex = (post: GymRatsCheckinPost) => {
    const at = postDay(post)
    return progress && at !== null ? Math.floor((at - progress.start.getTime()) / DAY) + 1 : null
  }
  const inDate = (post: GymRatsCheckinPost) => {
    if (dateFilter.mode === 'tudo') return true
    const at = postDay(post)
    if (at === null) return false
    if (dateFilter.mode === 'hoje') return at === today
    if (dateFilter.mode === '7d') return at > today - 7 * DAY
    if (dateFilter.mode === 'dia') return dayIndex(post) === dateFilter.day
    if (dateFilter.mode !== 'periodo') return true
    const from = dateFilter.from ? new Date(`${dateFilter.from}T00:00:00`).getTime() : -Infinity
    const to = dateFilter.to ? new Date(`${dateFilter.to}T00:00:00`).getTime() : Infinity
    return at >= from && at <= to
  }
  const visibleFeed = challengeFeed
    .filter((post) => kind === 'todos' || post.activityKind === kind)
    .filter(inDate)
    .filter((post) =>
      status === 'todos'
        ? true
        : status === 'destaque'
          ? post.highlighted
          : (post.status ?? 'aprovado') === status,
    )
    .sort(
      (a, b) =>
        Number(!!b.highlighted) - Number(!!a.highlighted) ||
        (b.postedAtIso ?? '').localeCompare(a.postedAtIso ?? ''),
    )
  const perDay = new Map<number, number>()
  challengeFeed.forEach((post) => {
    const index = dayIndex(post)
    if (index) perDay.set(index, (perDay.get(index) ?? 0) + 1)
  })
  const rejectedCount = challengeFeed.filter((post) => post.status === 'reprovado').length
  const todayCount = challengeFeed.filter((post) => postDay(post) === today).length

  const confirmReject = (postId: string, reason: string) => {
    onReject(postId, reason)
    setRejecting(null)
    setCustomReason('')
  }

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
                  {progress.day ? `Dia ${progress.day} de ${progress.total}` : 'Começa em breve'}
                </span>
                <span className="text-on-dark/55">{progress.range}</span>
              </div>
              <div
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label="Andamento do desafio"
                aria-valuemin={0}
                aria-valuemax={progress.total}
                aria-valuenow={progress.day}
              >
                <div
                  className="h-full rounded-full bg-[var(--gold-88)]"
                  style={{ width: `${(progress.day / progress.total) * 100}%` }}
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
                {challenge.participantsCount} participantes · {todayCount} check-ins hoje
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
          {ranked.length === 0 ? (
            <p className="py-10 text-center text-sm text-on-dark/55">
              O ranking aparece com os primeiros check-ins.
            </p>
          ) : (
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
                    className="flex min-w-0 flex-col items-center text-center"
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
                        {prizes[place - 1] || 'Prêmio a definir'}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
          {ranked.length > 3 && (
            <ol start={4} className="mt-4 divide-y divide-white/10 border-t border-white/10">
              {ranked.slice(3).map((member, index) => (
                <li key={member.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="w-6 text-xs text-on-dark/55 tabular-nums">{index + 4}º</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.avatar} alt="" className="size-7 rounded-full object-cover" />
                  <span className="min-w-0 flex-1 truncate">{member.name}</span>
                  <span className="hidden text-xs text-on-dark/55 sm:inline">
                    {member.streakDays} dias seguidos
                  </span>
                  <strong className="w-20 text-right font-semibold tabular-nums">
                    {member.points.toLocaleString('pt-BR')} pts
                  </strong>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Activities + rules */}
        <section className={cx(card, 'space-y-5')}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">Atividades e pontos</h3>
              <button type="button" className={darkButton} onClick={onEditChallenge}>
                Editar atividades
              </button>
            </div>
            {challenge.activities.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-white/15 px-4 py-6 text-center text-sm text-on-dark/60">
                Nenhuma atividade cadastrada. Os alunos só registram check-ins depois que você criar
                as atividades.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-white/10 text-sm">
                {challenge.activities.map((activity) => (
                  <li key={activity.id} className="flex items-center gap-3 py-2">
                    <span aria-hidden="true" className="text-base">
                      {activity.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-on-dark/90">{activity.name}</p>
                      <p className="truncate text-[11px] text-on-dark/50">
                        {activity.requiresPhoto ? 'Foto obrigatória' : 'Sem foto'} · até{' '}
                        {activity.dailyLimit}× por dia
                        {activity.rule ? ` · ${activity.rule}` : ''}
                      </p>
                    </div>
                    <span className="font-semibold text-[var(--gold-88)] tabular-nums">
                      +{activity.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <details className="group rounded-lg border border-white/10 px-3 py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium [&::-webkit-details-marker]:hidden">
              Regulamento ({challenge.rules.filter(Boolean).length} regras)
              <Icon
                name="chevronRight"
                className="size-4 text-on-dark/60 transition-transform group-open:rotate-90"
              />
            </summary>
            <ol className="mt-2 list-decimal space-y-1.5 pb-1 pl-5 text-[13px] leading-5 text-on-dark/75 marker:text-on-dark/45">
              {challenge.rules.filter(Boolean).map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ol>
          </details>
        </section>
      </div>

      {/* Mural */}
      <section className={card} aria-labelledby="mural-title">
        <div className="flex flex-wrap items-end gap-3">
          <div className="mr-auto">
            <p className={overline}>Mural de check-ins</p>
            <h3 id="mural-title" className="mt-1 text-[15px] font-semibold">
              Registros dos alunos{' '}
              <span className="text-xs font-normal text-on-dark/55">
                · aprovados automaticamente{rejectedCount ? ` · ${rejectedCount} reprovados` : ''}
              </span>
            </h3>
          </div>
          <div role="radiogroup" aria-label="Situação" className="flex flex-wrap gap-1">
            {(
              [
                ['todos', 'Todos'],
                ['aprovado', 'Aprovados'],
                ['reprovado', 'Reprovados'],
                ['destaque', 'Destaques'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={status === id}
                onClick={() => setStatus(id)}
                className={chip(status === id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Date + activity filters */}
        <div className="mt-4 space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Período">
            {(
              [
                ['hoje', 'Hoje'],
                ['7d', '7 dias'],
                ['tudo', 'Desafio todo'],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                aria-pressed={dateFilter.mode === mode}
                onClick={() => setDateFilter({ mode })}
                className={chip(dateFilter.mode === mode)}
              >
                {label}
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-white/15" aria-hidden="true" />
            <label className="flex items-center gap-1.5 text-xs text-on-dark/70">
              De
              <input
                type="date"
                value={dateFilter.mode === 'periodo' ? dateFilter.from : ''}
                onChange={(event) =>
                  setDateFilter({
                    mode: 'periodo',
                    from: event.target.value,
                    to: dateFilter.mode === 'periodo' ? dateFilter.to : '',
                  })
                }
                className={dateInput}
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-on-dark/70">
              até
              <input
                type="date"
                value={dateFilter.mode === 'periodo' ? dateFilter.to : ''}
                onChange={(event) =>
                  setDateFilter({
                    mode: 'periodo',
                    from: dateFilter.mode === 'periodo' ? dateFilter.from : '',
                    to: event.target.value,
                  })
                }
                className={dateInput}
              />
            </label>
          </div>
          {progress && (
            <div
              className="flex gap-1 overflow-x-auto pb-1"
              role="group"
              aria-label="Dia do desafio"
            >
              {Array.from({ length: progress.total }, (_, index) => index + 1).map((day) => {
                const count = perDay.get(day) ?? 0
                const active = dateFilter.mode === 'dia' && dateFilter.day === day
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={active}
                    disabled={day > progress.day}
                    aria-label={`Dia ${day}: ${count} check-ins`}
                    title={`Dia ${day} · ${count} check-ins`}
                    onClick={() => setDateFilter(active ? { mode: 'tudo' } : { mode: 'dia', day })}
                    className={cx(
                      'flex h-11 w-9 shrink-0 flex-col items-center justify-center rounded-lg text-[11px] tabular-nums transition-colors disabled:opacity-30',
                      active
                        ? 'bg-[var(--gold-88)] text-night'
                        : day === progress.day
                          ? 'border border-[var(--gold-88)]/60 text-on-dark'
                          : 'bg-white/[0.04] text-on-dark/70 hover:bg-white/10',
                    )}
                  >
                    <span className="font-semibold">{day}</span>
                    <span
                      aria-hidden="true"
                      className={cx(
                        'mt-1 h-1 w-4 rounded-full',
                        count ? (active ? 'bg-night/60' : 'bg-[var(--gold-88)]') : 'bg-white/10',
                      )}
                      style={count ? { opacity: Math.min(1, 0.4 + count * 0.2) } : undefined}
                    />
                  </button>
                )
              })}
            </div>
          )}
          <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Atividade">
            <button
              type="button"
              role="radio"
              aria-checked={kind === 'todos'}
              onClick={() => setKind('todos')}
              className={chip(kind === 'todos')}
            >
              Todas as atividades
            </button>
            {challenge.activities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                role="radio"
                aria-checked={kind === activity.name}
                onClick={() => setKind(activity.name)}
                className={chip(kind === activity.name)}
              >
                <span aria-hidden="true">{activity.icon}</span> {activity.name}
              </button>
            ))}
          </div>
        </div>

        {visibleFeed.length === 0 ? (
          <p className="py-10 text-center text-sm text-on-dark/55">
            Nenhum check-in com esses filtros.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleFeed.map((post) => {
              const rejected = post.status === 'reprovado'
              return (
                <article
                  key={post.id}
                  className={cx(
                    'overflow-hidden rounded-xl border bg-white/[0.03]',
                    post.highlighted
                      ? 'border-[var(--gold-88)]'
                      : rejected
                        ? 'border-[#e5484d]/50'
                        : 'border-white/10',
                  )}
                >
                  <div className={cx('relative aspect-[4/3]', rejected && 'opacity-50 grayscale')}>
                    {post.photoUrl4x3 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.photoUrl4x3}
                        alt={post.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div
                        className="grid size-full place-items-center bg-gradient-to-br from-white/[0.07] to-white/[0.02] text-5xl"
                        aria-hidden="true"
                      >
                        {post.activityIcon ?? '✅'}
                      </div>
                    )}
                    <span className="absolute top-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] text-white/90">
                      {post.activityIcon} {post.activityKind}
                    </span>
                    {post.highlighted && (
                      <span className="absolute top-2 right-2 rounded-md bg-black/65 px-2 py-0.5 text-[11px] font-medium text-[var(--gold-88)]">
                        ★ Destaque
                      </span>
                    )}
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
                        <p className="text-[11px] text-on-dark/55">{postTime(post)}</p>
                      </div>
                      <span
                        className={cx(
                          'text-xs font-semibold tabular-nums',
                          rejected ? 'text-on-dark/40 line-through' : 'text-[#9fe0bb]',
                        )}
                      >
                        {post.pointsEarned ? `+${post.pointsEarned} pts` : 'Oficial'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium">{post.title}</p>
                    {post.note && (
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-on-dark/65">
                        {post.note}
                      </p>
                    )}
                    {post.achievement && !rejected && (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--gold-88)]/15 px-2 py-0.5 text-[11px] font-medium text-[var(--gold-88)]">
                        <span aria-hidden="true">🔥</span> {post.achievement}
                      </p>
                    )}

                    <div className="mt-3 border-t border-white/10 pt-2.5">
                      {rejected ? (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-[#e5484d]/15 px-2 py-0.5 font-medium text-[#ff9592]">
                            Reprovado
                          </span>
                          <span
                            className="min-w-0 flex-1 truncate text-on-dark/60"
                            title={post.rejectReason}
                          >
                            {post.rejectReason}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRestore(post.id)}
                            className="font-medium text-[var(--gold-88)] hover:underline"
                          >
                            Desfazer
                          </button>
                        </div>
                      ) : rejecting === post.id ? (
                        <div
                          className="space-y-2"
                          role="group"
                          aria-label={`Motivo para reprovar o check-in de ${post.studentName}`}
                        >
                          <p className="text-xs text-on-dark/70">Motivo (o aluno vê no app):</p>
                          <div className="flex flex-wrap gap-1">
                            {rejectReasons.map((reason) => (
                              <button
                                key={reason}
                                type="button"
                                onClick={() => confirmReject(post.id, reason)}
                                className="rounded-full border border-white/15 px-2 py-1 text-[11px] text-on-dark/80 hover:border-[#ff9592] hover:text-[#ff9592]"
                              >
                                {reason}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              value={customReason}
                              onChange={(event) => setCustomReason(event.target.value)}
                              placeholder="Outro motivo"
                              aria-label="Outro motivo"
                              className="h-7 min-w-0 flex-1 rounded-md border border-white/15 bg-transparent px-2 text-xs text-on-dark placeholder:text-on-dark/40"
                            />
                            <button
                              type="button"
                              disabled={!customReason.trim()}
                              onClick={() => confirmReject(post.id, customReason.trim())}
                              className="h-7 rounded-md bg-[#e5484d] px-2.5 text-xs font-medium text-white disabled:opacity-40"
                            >
                              Reprovar
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejecting(null)}
                              className="h-7 px-2 text-xs text-on-dark/70 hover:text-on-dark"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="mr-auto inline-flex items-center gap-1 text-[11px] text-[#9fe0bb]">
                            <Icon name="check" className="size-3.5" />
                            {post.pointsEarned ? 'Aprovado automaticamente' : 'Post oficial'}
                          </span>
                          <button
                            type="button"
                            aria-pressed={!!post.cheeredByMe}
                            onClick={() => {
                              onCheer(post.id)
                              setPulse(post.id)
                              window.setTimeout(() => setPulse(null), 400)
                            }}
                            className={cx(
                              'inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium transition-transform',
                              post.cheeredByMe
                                ? 'bg-[var(--gold-88)] text-night'
                                : 'border border-white/15 text-on-dark/80 hover:bg-white/10',
                              pulse === post.id && 'scale-110 motion-reduce:scale-100',
                            )}
                          >
                            <span aria-hidden="true">◆</span>
                            <span className="tabular-nums">{post.cheersCount}</span>
                            <span className="sr-only">incentivos</span>
                          </button>
                          <button
                            type="button"
                            aria-pressed={!!post.highlighted}
                            onClick={() => onHighlight(post.id)}
                            title="Destacar no topo do mural"
                            className={cx(
                              'h-7 rounded-full px-2.5 text-[11px] font-medium',
                              post.highlighted
                                ? 'bg-white/15 text-[var(--gold-88)]'
                                : 'text-on-dark/70 hover:bg-white/10',
                            )}
                          >
                            ★ {post.highlighted ? 'Destacado' : 'Destacar'}
                          </button>
                          {post.pointsEarned > 0 && (
                            <button
                              type="button"
                              onClick={() => setRejecting(post.id)}
                              className="h-7 rounded-full px-2.5 text-[11px] font-medium text-[#ff9592] hover:bg-[#e5484d]/15"
                            >
                              Reprovar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
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
