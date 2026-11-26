'use client'

import { useEffect, useState } from 'react'
import { usePanel } from '../panel/PanelState'
import StudentApp, { type AppRoute, type AppTab } from '../student-app/StudentApp'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'

type Shortcut = { id: string; label: string; hint: string; tab: AppTab; route?: AppRoute }

const shortcuts: { group: string; items: Shortcut[] }[] = [
  {
    group: 'Abas',
    items: [
      { id: 'inicio', label: 'Início', hint: 'Semana, treino de hoje, adesão', tab: 'inicio' },
      { id: 'treino', label: 'Treino', hint: 'Plano A–D e histórico', tab: 'treino' },
      { id: 'dieta', label: 'Dieta', hint: 'Refeições, calorias e trocas', tab: 'dieta' },
      { id: 'conta', label: 'Conta', hint: 'Plano, renovação e fotos', tab: 'conta' },
    ],
  },
  {
    group: 'Telas internas',
    items: [
      {
        id: 'detalhe',
        label: 'Detalhe do treino',
        hint: 'Exercícios com os vídeos do Breno',
        tab: 'treino',
        route: { name: 'workout', code: 'B' },
      },
      {
        id: 'sessao',
        label: 'Treino em andamento',
        hint: 'Registro de séries e descanso',
        tab: 'treino',
        route: { name: 'session' },
      },
      {
        id: 'feito',
        label: 'Treino feito',
        hint: 'Histórico: séries que o aluno fez',
        tab: 'treino',
        route: { name: 'done', key: 'h3' },
      },
      {
        id: 'compartilhar',
        label: 'Compartilhar treino',
        hint: '7 modelos para Stories',
        tab: 'treino',
        route: { name: 'share', key: 'h3' },
      },
      {
        id: 'calendario',
        label: 'Calendário',
        hint: 'Dias treinados no mês (toque na semana)',
        tab: 'treino',
        route: { name: 'calendar' },
      },
      {
        id: 'fotos',
        label: 'Minhas fotos',
        hint: 'Enviar com data e comparar',
        tab: 'conta',
        route: { name: 'photos' },
      },
      {
        id: 'avisos',
        label: 'Avisos da equipe',
        hint: 'Notificações enviadas pelo painel',
        tab: 'inicio',
        route: { name: 'notifications' },
      },
    ],
  },
]

function StatusBar() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      )
    update()
    const timer = window.setInterval(update, 30_000)
    return () => window.clearInterval(timer)
  }, [])
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-[47px] items-center justify-between px-8 text-[15px] font-semibold text-white"
      aria-hidden="true"
    >
      <span className="tabular-nums">{time}</span>
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" className="h-3 w-[18px]" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 26 12" className="h-3 w-[26px]" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" opacity="0.5" />
          <rect x="2" y="2" width="15" height="8" rx="1.5" fill="currentColor" />
          <rect x="24" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.5" />
        </svg>
      </span>
    </div>
  )
}

/** Panel page: how the student app looks on a phone. The app itself is mobile only. */
export default function AppAlunoView() {
  const { notifications } = usePanel()
  const [current, setCurrent] = useState<Shortcut>(shortcuts[0].items[0])
  const [version, setVersion] = useState(0)
  const [copied, setCopied] = useState(false)

  const open = (shortcut: Shortcut) => {
    setCurrent(shortcut)
    setVersion((value) => value + 1)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/aluno`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <header className="flex flex-wrap items-end gap-4">
        <div className="mr-auto">
          <p className="text-xs font-semibold tracking-[0.06em] text-[var(--gold-35)] uppercase">
            Prévia · somente celular
          </p>
          <h1 className="mt-1 text-[32px] leading-10 font-semibold tracking-[-0.02em] text-ink">
            App do aluno
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-2">
            Como o aluno vê o app no celular: Início, Treino, Dieta e Conta. Toque nas telas como se
            fosse o aluno. Tudo usa os dados de demonstração do Lucas Andrade.
          </p>
        </div>
        <Button variant="secondary" onClick={() => open(current)}>
          <Icon name="swap" className="size-4" /> Recomeçar
        </Button>
      </header>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[auto_minmax(0,1fr)]">
        {/* Phone */}
        <div className="mx-auto lg:sticky lg:top-6">
          <div className="relative h-[844px] w-[390px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[56px] bg-black p-3 shadow-[0_40px_80px_-20px_rgba(13,10,33,0.45),0_0_0_1px_rgba(255,255,255,0.08)_inset] max-sm:h-[760px]">
            <div className="relative h-full w-full overflow-hidden rounded-[44px]">
              <StatusBar />
              <div
                className="pointer-events-none absolute top-[11px] left-1/2 z-50 h-[30px] w-[110px] -translate-x-1/2 rounded-full bg-black"
                aria-hidden="true"
              />
              <StudentApp
                key={version}
                startAt={{ tab: current.tab, route: current.route }}
                notifications={notifications}
                topInset={47}
              />
              <div
                className="pointer-events-none absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-white/80"
                aria-hidden="true"
              />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-ink-3">iPhone · 390 × 844</p>
        </div>

        {/* Guide */}
        <aside className="space-y-6">
          {shortcuts.map((group) => (
            <section key={group.group} aria-labelledby={`atalhos-${group.group}`}>
              <h2 id={`atalhos-${group.group}`} className="text-sm font-semibold text-ink">
                {group.group}
              </h2>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => {
                  const active = item.id === current.id
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => open(item)}
                        aria-pressed={active}
                        className={cx(
                          'flex w-full items-center gap-3 rounded-card border px-4 py-3 text-left transition-colors',
                          active
                            ? 'border-brand bg-surface shadow-pop'
                            : 'border-line bg-surface hover:border-ink-3',
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink">{item.label}</span>
                          <span className="block truncate text-xs text-ink-3">{item.hint}</span>
                        </span>
                        <Icon name="chevronRight" className="size-4 shrink-0 text-ink-3" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}

          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink">Abrir no celular</h2>
            <p className="mt-1 text-sm leading-6 text-ink-2">
              O endereço <code className="rounded bg-subtle px-1.5 py-0.5 text-[13px]">/aluno</code>{' '}
              abre o app em tela cheia. Mande o link para o celular para sentir o toque, a rolagem e
              o teclado de verdade.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" onClick={copyLink}>
                <Icon name={copied ? 'check' : 'form'} className="size-4" />{' '}
                {copied ? 'Link copiado' : 'Copiar link'}
              </Button>
              <a
                href="/aluno"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-control border border-line px-4 text-sm font-medium text-ink hover:bg-subtle"
              >
                Abrir em nova aba
              </a>
            </div>
          </section>

          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink">O que cada aba faz</h2>
            <dl className="mt-3 space-y-3 text-sm leading-6">
              <div>
                <dt className="font-medium text-ink">Início</dt>
                <dd className="text-ink-2">
                  Semana com os dias treinados (toque para abrir o calendário), treino de hoje, como
                  está a adesão aos treinos com uma carinha feliz, neutra ou triste, e a próxima
                  refeição.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Treino</dt>
                <dd className="text-ink-2">
                  Plano A–D com quantas vezes cada treino foi feito. Cada exercício tem o vídeo
                  gravado pelo Breno. No treino em andamento o aluno vê a carga da última vez, marca
                  cada série e o descanso começa sozinho. No fim, pode deixar um comentário que
                  aparece na ficha.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Dieta</dt>
                <dd className="text-ink-2">
                  Calorias do dia e de cada refeição, alimentos com as porções e substituições da
                  nutri. A aba Trocas inteligentes calcula trocas com as mesmas calorias (base TACO
                  e TBCA), consulta produtos pelo código de barras e estima TMB e macros.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Conta</dt>
                <dd className="text-ink-2">
                  Plano e renovação, objetivo, fotos de evolução com data, avisos da equipe e
                  lembretes. O check-in continua no LiveClin.
                </dd>
              </div>
            </dl>
            <p className="mt-4 rounded-lg bg-subtle px-3 py-2 text-xs leading-5 text-ink-3">
              Conversas com o aluno seguem no WhatsApp. Notificações enviadas em Alunos →
              Notificações para o Lucas aparecem em “Avisos” aqui.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
