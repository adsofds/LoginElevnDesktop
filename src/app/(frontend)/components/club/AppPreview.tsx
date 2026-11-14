'use client'

import { useState } from 'react'
import type {
  GymRatsChallenge,
  GymRatsCheckinPost,
  GymRatsRankingEntry,
  HeroAdSlide,
  StudentPlaylist,
} from '../CreationWorkspace'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { Sheet } from '../ui/Sheet'
import type { LiveEvent } from './ClubEditors'

export const playlistMinutes = (playlist: StudentPlaylist) =>
  playlist.lessons.reduce(
    (sum, lesson) => sum + (Number.parseInt(lesson.durationMinutes, 10) || 0),
    0,
  )

export const playlistMeta = (playlist: StudentPlaylist) => {
  const count = playlist.lessons.length
  const minutes = playlistMinutes(playlist)
  return `${count} ${count === 1 ? 'aula' : 'aulas'}${minutes ? ` · ${minutes} min` : ''}`
}

type PhoneTab = 'inicio' | 'explorar' | 'comunidade'
const phoneTabs: { id: PhoneTab; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Início', icon: 'dashboard' },
  { id: 'explorar', label: 'Explorar', icon: 'search' },
  { id: 'comunidade', label: 'Comunidade', icon: 'team' },
]
const tabDescription: Record<PhoneTab, string> = {
  inicio: 'como o aluno vê o Início',
  explorar: 'como o aluno vê o Explorar',
  comunidade: 'como o aluno vê o desafio',
}

const liveFormat = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * How the Club looks on the student's phone (390 × 844), so the team can check
 * banners, covers and the community before publishing.
 */
export default function AppPreview({
  open,
  onClose,
  ad,
  playlists,
  tracks,
  challenge,
  feed,
  leaderboard,
  liveEvents,
}: {
  open: boolean
  onClose: () => void
  ad?: HeroAdSlide
  playlists: StudentPlaylist[]
  tracks: string[]
  challenge: GymRatsChallenge | null
  feed: GymRatsCheckinPost[]
  leaderboard: GymRatsRankingEntry[]
  liveEvents: LiveEvent[]
}) {
  const [tab, setTab] = useState<PhoneTab>('inicio')
  const lessons = playlists.flatMap((playlist) =>
    playlist.lessons.map((lesson) => ({ ...lesson, playlistTitle: playlist.title })),
  )
  const inProgress = lessons.filter((lesson) => (lesson.watchProgressPercent ?? 0) > 0)
  const ranked = [...leaderboard].sort((a, b) => b.points - a.points)
  const posts = feed
    .filter((post) => post.challengeId === challenge?.id && post.status !== 'reprovado')
    .sort((a, b) => (b.postedAtIso ?? '').localeCompare(a.postedAtIso ?? ''))

  return (
    <Sheet
      open={open}
      onClose={onClose}
      label="Prévia no app do aluno"
      className="w-[min(480px,100vw)] bg-[#17142c]"
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 text-on-dark">
        <div>
          <h2 className="text-[15px] font-semibold">Prévia no app</h2>
          <p className="text-xs text-on-dark/60">iPhone · 390 × 844, {tabDescription[tab]}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Fechar prévia"
          className="text-on-dark hover:bg-white/10 hover:text-on-dark"
          onClick={onClose}
        >
          <Icon name="close" className="size-4" />
        </Button>
      </header>
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-5 py-6">
        {/* 390 × 844 scaled to fit the panel */}
        <div className="relative h-[760px] w-[351px] shrink-0 overflow-hidden rounded-[46px] border-[10px] border-black bg-[#0d0a21] shadow-modal">
          <div
            className="absolute top-2 left-1/2 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-black"
            aria-hidden="true"
          />
          <div
            key={tab}
            className="h-full overflow-y-auto pb-24 text-on-dark [scrollbar-width:none]"
          >
            <div className="flex items-center justify-between px-5 pt-12 pb-3">
              <span className="flex items-center gap-2 text-sm font-semibold tracking-[0.04em]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/symbol-beige.png" alt="" className="h-4 w-auto" /> Elevn Club
              </span>
              <span aria-hidden="true" className="size-7 rounded-full bg-white/10" />
            </div>

            {tab === 'inicio' && (
              <>
                {ad && (
                  <div className="relative mx-4 aspect-[4/3] overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ad.coverUrl}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                    {!ad.imageOnly && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-white/90 backdrop-blur">
                            {ad.tagPill}
                          </span>
                          <p className="mt-2 text-[15px] leading-5 font-semibold text-white">
                            <span className="text-brand-light">{ad.titleHighlight}</span>{' '}
                            {ad.titleMain}
                          </p>
                          <span className="mt-2 inline-block rounded-full bg-brand-light px-3 py-1 text-[11px] font-semibold text-night">
                            {ad.ctaLabel}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {inProgress[0] && (
                  <section className="mx-4 mt-5 flex items-center gap-3 rounded-xl bg-white/[0.06] p-2.5">
                    <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={inProgress[0].coverUrl} alt="" className="size-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold tracking-[0.06em] text-brand-light uppercase">
                        Continuar assistindo
                      </p>
                      <p className="truncate text-xs font-medium">{inProgress[0].title}</p>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-brand-light"
                          style={{ width: `${inProgress[0].watchProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  </section>
                )}

                {liveEvents[0] && (
                  <section className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-white/10 p-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-[#e5484d]/20 text-[10px] font-bold text-[#ff9592]">
                      AO VIVO
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{liveEvents[0].title}</p>
                      <p className="text-[11px] text-on-dark/55 capitalize">
                        {liveFormat.format(new Date(liveEvents[0].startsAtIso)).replace('.', '')}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium">
                      Lembrar
                    </span>
                  </section>
                )}

                {tracks.map((track) => {
                  const list = playlists.filter((playlist) => playlist.trackCategory === track)
                  if (!list.length) return null
                  return (
                    <section key={track} className="mt-6">
                      <h3 className="px-5 text-sm font-semibold">{track}</h3>
                      <div className="mt-2 flex gap-3 overflow-x-auto px-5 [scrollbar-width:none]">
                        {list.map((playlist) => (
                          <article key={playlist.id} className="w-36 shrink-0">
                            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white/5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={playlist.coverUrl}
                                alt=""
                                className="size-full object-cover"
                              />
                              {playlist.completionRate > 0 && (
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
                                  <div
                                    className="h-full bg-brand-light"
                                    style={{ width: `${playlist.completionRate}%` }}
                                  />
                                </div>
                              )}
                            </div>
                            <p className="mt-1.5 truncate text-xs font-medium">{playlist.title}</p>
                            <p className="text-[11px] text-on-dark/55">{playlistMeta(playlist)}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </>
            )}

            {tab === 'explorar' && (
              <div className="px-4">
                <div className="flex h-9 items-center gap-2 rounded-full bg-white/[0.07] px-3 text-xs text-on-dark/45">
                  <Icon name="search" className="size-3.5" /> Buscar aulas
                </div>
                {inProgress.length > 0 && (
                  <>
                    <h3 className="mt-5 text-sm font-semibold">Continuar de onde parou</h3>
                    <div className="mt-2 flex gap-3 overflow-x-auto [scrollbar-width:none]">
                      {inProgress.map((lesson) => (
                        <article key={lesson.id} className="w-40 shrink-0">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={lesson.coverUrl} alt="" className="size-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
                              <div
                                className="h-full bg-brand-light"
                                style={{ width: `${lesson.watchProgressPercent}%` }}
                              />
                            </div>
                          </div>
                          <p className="mt-1.5 truncate text-xs font-medium">{lesson.title}</p>
                          <p className="text-[11px] text-on-dark/55">{lesson.stoppedAtLabel}</p>
                        </article>
                      ))}
                    </div>
                  </>
                )}
                <h3 className="mt-5 text-sm font-semibold">Todas as aulas</h3>
                <ul className="mt-2 space-y-2.5">
                  {lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center gap-3">
                      <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={lesson.coverUrl} alt="" className="size-full object-cover" />
                        <span className="absolute right-1 bottom-1 rounded bg-black/70 px-1 text-[9px]">
                          {lesson.durationMinutes}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{lesson.title}</p>
                        <p className="truncate text-[11px] text-on-dark/55">
                          {lesson.playlistTitle}
                        </p>
                        <p className="mt-0.5 text-[10px] text-on-dark/45">
                          Vídeo {lesson.aspectRatio ?? '4:3'}
                          {lesson.materialName ? ' · PDF' : ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === 'comunidade' &&
              (challenge ? (
                <div className="px-4">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={challenge.coverUrl} alt="" className="size-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3.5">
                      <p className="text-[15px] leading-5 font-semibold">{challenge.title}</p>
                      <p className="text-[11px] text-white/70">
                        {challenge.participantsCount} participantes
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="mt-3 h-10 w-full rounded-full bg-brand-light text-sm font-semibold text-night"
                  >
                    + Registrar check-in
                  </button>
                  <h3 className="mt-5 text-sm font-semibold">Ranking</h3>
                  <ol className="mt-2 space-y-1.5">
                    {ranked.slice(0, 5).map((member, index) => (
                      <li
                        key={member.id}
                        className={cx(
                          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs',
                          index === 0 ? 'bg-brand-light/15' : 'bg-white/[0.04]',
                        )}
                      >
                        <span className="w-4 text-on-dark/55 tabular-nums">{index + 1}</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={member.avatar}
                          alt=""
                          className="size-6 rounded-full object-cover"
                        />
                        <span className="min-w-0 flex-1 truncate font-medium">{member.name}</span>
                        <span className="font-semibold tabular-nums">{member.points}</span>
                      </li>
                    ))}
                  </ol>
                  <h3 className="mt-5 text-sm font-semibold">Mural</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {posts.slice(0, 6).map((post) => (
                      <article key={post.id} className="overflow-hidden rounded-xl bg-white/[0.05]">
                        <div className="aspect-[4/3]">
                          {post.photoUrl4x3 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.photoUrl4x3} alt="" className="size-full object-cover" />
                          ) : (
                            <div className="grid size-full place-items-center text-3xl">
                              {post.activityIcon ?? '✅'}
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="truncate text-[11px] font-medium">{post.studentName}</p>
                          <p className="truncate text-[10px] text-on-dark/55">
                            {post.activityKind}
                            {post.pointsEarned ? ` · +${post.pointsEarned}` : ''}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="px-5 pt-10 text-center text-sm text-on-dark/55">
                  Nenhum desafio ativo.
                </p>
              ))}
          </div>
          <nav
            aria-label="Abas do app"
            className="absolute inset-x-0 bottom-0 flex justify-around border-t border-white/10 bg-[#0d0a21]/95 px-4 pt-2 pb-5 backdrop-blur"
          >
            {phoneTabs.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cx(
                  'flex min-w-16 flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors',
                  tab === item.id ? 'text-brand-light' : 'text-on-dark/55 hover:text-on-dark/80',
                )}
              >
                <Icon name={item.icon} className="size-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </Sheet>
  )
}
