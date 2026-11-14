'use client'

import type { HeroAdSlide, StudentPlaylist } from '../CreationWorkspace'
import { Button } from '../ui/Button'
import { Icon } from '../ui/icons'
import { Sheet } from '../ui/Sheet'

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

/**
 * How the Club looks on the student's phone (390 × 844), so the team can check
 * banners and covers before publishing.
 */
export default function AppPreview({
  open,
  onClose,
  ad,
  playlists,
  tracks,
}: {
  open: boolean
  onClose: () => void
  ad?: HeroAdSlide
  playlists: StudentPlaylist[]
  tracks: string[]
}) {
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
          <p className="text-xs text-on-dark/60">iPhone · 390 × 844, como o aluno vê o Início</p>
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
          <div className="h-full overflow-y-auto pb-20 text-on-dark [scrollbar-width:none]">
            <div className="flex items-center justify-between px-5 pt-12 pb-3">
              <span className="flex items-center gap-2 text-sm font-semibold tracking-[0.04em]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/symbol-beige.png" alt="" className="h-4 w-auto" /> Elevn Club
              </span>
              <span aria-hidden="true" className="size-7 rounded-full bg-white/10" />
            </div>

            {ad && (
              <div className="relative mx-4 aspect-[4/3] overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ad.coverUrl} alt="" className="absolute inset-0 size-full object-cover" />
                {!ad.imageOnly && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-white/90 backdrop-blur">
                        {ad.tagPill}
                      </span>
                      <p className="mt-2 text-[15px] leading-5 font-semibold text-white">
                        <span className="text-brand-light">{ad.titleHighlight}</span> {ad.titleMain}
                      </p>
                      <span className="mt-2 inline-block rounded-full bg-brand-light px-3 py-1 text-[11px] font-semibold text-night">
                        {ad.ctaLabel}
                      </span>
                    </div>
                  </>
                )}
              </div>
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
                        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={playlist.coverUrl} alt="" className="size-full object-cover" />
                        </div>
                        <p className="mt-1.5 truncate text-xs font-medium">{playlist.title}</p>
                        <p className="text-[11px] text-on-dark/55">{playlistMeta(playlist)}</p>
                      </article>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
          <nav
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 flex justify-around border-t border-white/10 bg-[#0d0a21]/95 px-6 pt-2.5 pb-6 text-[10px] text-on-dark/60"
          >
            <span className="text-brand-light">Início</span>
            <span>Explorar</span>
            <span>Comunidade</span>
          </nav>
        </div>
      </div>
    </Sheet>
  )
}
