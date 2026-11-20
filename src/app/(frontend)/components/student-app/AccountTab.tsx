'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { progressPhotos, studentProfile, type ProgressPhoto } from '@/lib/demo-student-app'
import { fillPlaceholders } from '@/lib/student-notifications'
import { Face, faceLabels, faceThemes, type FaceScore } from '../students/FaceCheckin'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { planExpiration } from './HomeTab'
import { useStudentApp } from './StudentApp'
import { Card, GhostButton, GoldButton, PhoneSheet, ScreenHeader } from './ui'

/* ---------------------------------------------------------------- Account (Smart Fit "Conta") */

export function AccountTab() {
  const { push } = useStudentApp()
  const [sheet, setSheet] = useState<'renovar' | 'whatsapp' | 'config' | null>(null)
  const [prefs, setPrefs] = useState({ treino: true, checkin: true, som: true })

  const menu = [
    {
      id: 'fotos',
      label: 'Minhas fotos',
      hint: 'Envie e compare sua evolução',
      icon: 'photo',
      onClick: () => push({ name: 'photos' }),
    },
    {
      id: 'checkin',
      label: 'Check-in semanal',
      hint: 'Responder ou ver o último',
      icon: 'form',
      onClick: () => push({ name: 'checkin' }),
    },
    {
      id: 'notificacoes',
      label: 'Avisos da equipe',
      hint: 'Treino, dieta e lembretes',
      icon: 'bell',
      onClick: () => push({ name: 'notifications' }),
    },
    {
      id: 'whatsapp',
      label: 'Falar com o treinador',
      hint: studentProfile.coach,
      icon: 'mail',
      onClick: () => setSheet('whatsapp'),
    },
    {
      id: 'config',
      label: 'Configurações',
      hint: 'Lembretes e sons',
      icon: 'settings',
      onClick: () => setSheet('config'),
    },
  ]

  return (
    <div>
      <section className="px-5 pt-6">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={studentProfile.avatar}
            alt=""
            className="size-16 rounded-full object-cover ring-2 ring-[var(--app-gold)]/50"
          />
          <div className="min-w-0">
            <h1 className="truncate text-[28px] leading-8 font-bold tracking-[-0.02em]">
              {studentProfile.firstName}
            </h1>
            <p className="truncate text-sm text-white/55">{studentProfile.name}</p>
          </div>
        </div>
        <p className="mt-4 flex gap-6 text-[13px] tracking-wide text-white/60 uppercase">
          <span>
            Matrícula{' '}
            <strong className="font-semibold text-white">{studentProfile.enrollment}</strong>
          </span>
          <span>
            Plano{' '}
            <strong className="font-semibold text-white normal-case">{studentProfile.plan}</strong>
          </span>
        </p>
      </section>

      {studentProfile.daysToExpire <= 7 && (
        <section className="mt-5 bg-[var(--app-gold-deep)]/70 px-5 py-5">
          <p className="text-[15px] leading-6 text-white">
            Seu plano vence em <strong>{studentProfile.daysToExpire} dias</strong> (
            {planExpiration()}). Renove para não perder o acompanhamento.
          </p>
          <GoldButton className="mt-4" onClick={() => setSheet('renovar')}>
            Renovar plano
          </GoldButton>
        </section>
      )}

      <dl className="mt-5 space-y-3.5 px-5">
        {[
          ['Objetivo', `${studentProfile.goal} (${studentProfile.phase})`],
          ['Frequência', studentProfile.frequency],
          ['Experiência', studentProfile.experience],
          ['Treinador', studentProfile.coach],
          ['Peso atual', `${studentProfile.weight} · ${studentProfile.weightDelta}`],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-[13px] text-white/50">{label}</dt>
            <dd className="text-[16px]">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-6 border-t border-[var(--app-line)]">
        {menu.map((item) => (
          <li key={item.id} className="border-b border-[var(--app-line)]">
            <button
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center gap-4 px-5 py-4 text-left active:bg-white/[0.04]"
            >
              <Icon name={item.icon} className="size-6 text-white/80" />
              <span className="min-w-0 flex-1">
                <span className="block text-[16px]">{item.label}</span>
                <span className="block truncate text-xs text-white/45">{item.hint}</span>
              </span>
              <Icon name="chevronRight" className="size-5 text-white/40" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mx-5 mt-4 mb-2 flex h-12 w-[calc(100%-40px)] items-center justify-center gap-2 text-sm font-medium text-white/50"
      >
        <Icon name="logout" className="size-4" /> Sair
      </button>

      <PhoneSheet open={sheet === 'renovar'} onClose={() => setSheet(null)} title="Renovar plano">
        <ul className="space-y-2">
          {[
            ['Mensal', 'R$ 490/mês'],
            ['Trimestral', 'R$ 420/mês', 'Seu plano'],
            ['Semestral', 'R$ 380/mês', 'Mais escolhido'],
          ].map(([name, price, tag]) => (
            <li
              key={name}
              className="flex items-center justify-between rounded-xl bg-white/[0.05] px-4 py-3.5"
            >
              <span>
                <span className="block font-semibold">{name}</span>
                {tag && <span className="text-xs text-[var(--app-gold)]">{tag}</span>}
              </span>
              <span className="font-semibold tabular-nums">{price}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-white/45">
          Na versão final, a renovação abre a conversa com a equipe no WhatsApp ou o pagamento.
        </p>
      </PhoneSheet>

      <PhoneSheet
        open={sheet === 'whatsapp'}
        onClose={() => setSheet(null)}
        title="Falar com o treinador"
      >
        <p className="text-sm leading-5 text-white/70">
          Dúvidas, ajustes e conversas com o {studentProfile.coach} acontecem no WhatsApp. Por aqui
          você recebe só os avisos da equipe.
        </p>
        <p className="mt-3 text-xs text-white/45">
          Na versão final este botão abre o WhatsApp da equipe Elevn.
        </p>
        <GoldButton className="mt-5" onClick={() => setSheet(null)}>
          Abrir WhatsApp
        </GoldButton>
      </PhoneSheet>

      <PhoneSheet open={sheet === 'config'} onClose={() => setSheet(null)} title="Configurações">
        <ul className="divide-y divide-[var(--app-line)]">
          {(
            [
              ['treino', 'Lembrete de treino', 'No horário em que você costuma treinar'],
              ['checkin', 'Lembrete de check-in', 'No dia do check-in semanal'],
              ['som', 'Som no fim do descanso', 'Toca e vibra quando o descanso acaba'],
            ] as const
          ).map(([id, label, hint]) => (
            <li key={id} className="flex items-center gap-3 py-3.5">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-white/45">{hint}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[id]}
                aria-label={label}
                onClick={() => setPrefs((current) => ({ ...current, [id]: !current[id] }))}
                className={cx(
                  'relative h-7 w-12 rounded-full transition-colors',
                  prefs[id] ? 'bg-[var(--app-gold)]' : 'bg-white/20',
                )}
              >
                <span
                  className={cx(
                    'absolute top-1 size-5 rounded-full bg-white transition-all',
                    prefs[id] ? 'left-6' : 'left-1',
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
      </PhoneSheet>
    </div>
  )
}

/* ---------------------------------------------------------------- Weekly check-in (faces) */

export function CheckinFlow() {
  const { pop, setCheckinDone, checkinDone, setTab } = useStudentApp()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<Record<string, FaceScore>>>({})
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(checkinDone)
  const total = faceThemes.length + 1

  if (sent) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6 pt-24 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-[var(--app-green)]/15 text-[var(--app-green)]">
          <Icon name="check" className="size-9" />
        </span>
        <h1 className="mt-5 text-[26px] font-semibold tracking-[-0.02em]">Check-in enviado!</h1>
        <p className="mt-2 text-sm text-white/60">
          Seu treinador recebe agora e ajusta o plano se precisar.
        </p>
        <GoldButton className="mt-8" onClick={() => setTab('inicio')}>
          Voltar ao início
        </GoldButton>
      </div>
    )
  }

  const theme = faceThemes[step]
  const choose = (score: FaceScore) => {
    setAnswers((current) => ({ ...current, [theme.id]: score }))
    window.setTimeout(() => setStep((current) => Math.min(current + 1, total - 1)), 220)
  }

  return (
    <div className="flex min-h-full flex-col px-5 pt-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (step === 0 ? pop() : setStep(step - 1))}
          aria-label={step === 0 ? 'Fechar check-in' : 'Pergunta anterior'}
          className="-ml-2 grid size-10 place-items-center rounded-full text-white/80"
        >
          <Icon name={step === 0 ? 'close' : 'arrowLeft'} className="size-5" />
        </button>
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-label="Progresso do check-in"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={step + 1}
        >
          <div
            className="h-full rounded-full bg-[var(--app-gold)] transition-[width] duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
        <span className="w-10 text-right text-xs text-white/50 tabular-nums">
          {step + 1}/{total}
        </span>
      </div>

      {theme ? (
        <div
          key={theme.id}
          className="flex flex-1 flex-col pt-14 animate-[app-screen-in_200ms_ease-out] motion-reduce:animate-none"
        >
          <p className="text-sm font-semibold text-[var(--app-gold)]">{theme.label}</p>
          <h1 className="mt-1 text-[26px] leading-8 font-semibold tracking-[-0.02em]">
            {theme.question}
          </h1>
          <div className="mt-12 flex flex-col gap-2.5" role="radiogroup" aria-label={theme.label}>
            {([5, 4, 3, 2, 1] as FaceScore[]).map((score) => {
              const selected = answers[theme.id] === score
              return (
                <button
                  key={score}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => choose(score)}
                  className={cx(
                    'flex items-center gap-4 rounded-2xl px-4 py-3 text-left transition-all active:scale-[0.98]',
                    selected ? 'bg-white/15 ring-2 ring-[var(--app-gold)]' : 'bg-[var(--app-card)]',
                  )}
                >
                  <Face score={score} className="size-10" />
                  <span className="text-[17px] font-medium">{faceLabels[score]}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <form
          className="flex flex-1 flex-col pt-14"
          onSubmit={(event) => {
            event.preventDefault()
            setCheckinDone(true)
            setSent(true)
          }}
        >
          <p className="text-sm font-semibold text-[var(--app-gold)]">Para fechar</p>
          <h1 className="mt-1 text-[26px] leading-8 font-semibold tracking-[-0.02em]">
            Peso e observação
          </h1>
          <label className="mt-8 block">
            <span className="text-sm text-white/60">Peso em jejum (kg)</span>
            <input
              inputMode="decimal"
              value={weight}
              onChange={(event) => setWeight(event.target.value.replace(/[^\d.,]/g, ''))}
              placeholder="81,4"
              className="mt-2 h-14 w-full rounded-2xl bg-[var(--app-card)] px-4 text-2xl font-semibold tabular-nums placeholder:text-white/25 focus:ring-2 focus:ring-[var(--app-gold)] focus:outline-none"
            />
          </label>
          <label className="mt-5 block">
            <span className="text-sm text-white/60">Quer contar algo? (opcional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              maxLength={300}
              placeholder="Ex.: senti mais fome à tarde"
              className="mt-2 w-full resize-none rounded-2xl bg-[var(--app-card)] px-4 py-3 text-[15px] placeholder:text-white/30 focus:ring-2 focus:ring-[var(--app-gold)] focus:outline-none"
            />
          </label>
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Suas respostas">
            {faceThemes.map((item) => {
              const score = answers[item.id]
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-1.5 rounded-full bg-white/[0.06] py-1 pr-2.5 pl-1 text-xs"
                >
                  {score ? <Face score={score} className="size-5" /> : <span className="size-5" />}
                  {item.label}
                </li>
              )
            })}
          </ul>
          <GoldButton
            type="submit"
            className="mt-auto mb-2"
            disabled={Object.keys(answers).length < faceThemes.length}
          >
            Enviar check-in
          </GoldButton>
        </form>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- Progress photos */

export function PhotosScreen() {
  const { pop } = useStudentApp()
  const [photos, setPhotos] = useState<ProgressPhoto[]>(progressPhotos)
  const [pose, setPose] = useState<ProgressPhoto['pose']>('Frente')
  const [compare, setCompare] = useState(50)
  const input = useRef<HTMLInputElement>(null)
  const front = photos.filter((photo) => photo.pose === 'Frente')
  const before = front[0]
  const after = front[front.length - 1]

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
      .format(new Date())
      .replace('.', '')
    setPhotos((current) => [
      ...current,
      {
        id: `upload-${Date.now()}`,
        url: URL.createObjectURL(file),
        label: 'Enviada agora',
        date,
        pose,
      },
    ])
    event.target.value = ''
  }

  return (
    <div>
      <ScreenHeader title="Minhas fotos" onBack={pop} subtitle="Seu treinador vê na sua ficha" />

      {before && after && before.id !== after.id && (
        <section className="px-5">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={after.url} alt="Depois" className="absolute inset-0 size-full object-cover" />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - compare}% 0 0)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={before.url}
                alt="Antes"
                className="absolute inset-0 size-full object-cover"
              />
            </div>
            <span
              className="absolute inset-y-0 w-0.5 bg-white"
              style={{ left: `${compare}%` }}
              aria-hidden="true"
            />
            <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold">
              Antes · {before.date}
            </span>
            <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold">
              Depois · {after.date}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={compare}
            onChange={(event) => setCompare(Number(event.target.value))}
            aria-label="Comparar antes e depois"
            className="mt-3 w-full accent-[var(--app-gold)]"
          />
        </section>
      )}

      <section className="mt-5 px-5">
        <Card className="p-4">
          <p className="font-semibold">Enviar foto nova</p>
          <p className="mt-0.5 text-[13px] text-white/55">
            Mesma luz e mesmo lugar, de manhã e em jejum. Fica mais fácil comparar.
          </p>
          <div className="mt-3 flex gap-1.5" role="radiogroup" aria-label="Pose">
            {(['Frente', 'Lado', 'Costas'] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={pose === item}
                onClick={() => setPose(item)}
                className={cx(
                  'h-9 flex-1 rounded-full text-sm font-medium',
                  pose === item ? 'bg-white text-[#0d0a21]' : 'bg-white/[0.07] text-white/70',
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <input
            ref={input}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={onFile}
            tabIndex={-1}
          />
          <GoldButton className="mt-3" onClick={() => input.current?.click()}>
            <Icon name="photo" className="size-5" /> Tirar ou escolher foto
          </GoldButton>
        </Card>
      </section>

      <h2 className="mt-6 mb-3 px-5 text-[17px] font-semibold">Todas as fotos</h2>
      <ul className="grid grid-cols-3 gap-1.5 px-5">
        {[...photos].reverse().map((photo) => (
          <li
            key={photo.id}
            className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white/5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={`${photo.pose}, ${photo.date}`}
              className="size-full object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pt-4 pb-1.5 text-[10px] leading-3">
              <span className="block font-semibold">{photo.pose}</span>
              {photo.date}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------- Notices from the team */

export function NotificationsScreen() {
  const { pop, notifications } = useStudentApp()
  const mine = notifications.filter(
    (item) => item.status === 'enviada' && item.audience.studentIds.includes(studentProfile.id),
  )
  const items = mine.length
    ? mine
    : notifications.filter((item) => item.status === 'enviada').slice(0, 3)

  const timeAgo = (iso: string) => {
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
    if (minutes < 60) return `${Math.max(1, minutes)} min`
    if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h`
    return `${Math.round(minutes / 1440)} d`
  }

  return (
    <div>
      <ScreenHeader title="Avisos" onBack={pop} subtitle="Da sua equipe Elevn" />
      {items.length === 0 ? (
        <div className="px-6 pt-16 text-center">
          <Icon name="bell" className="mx-auto size-10 text-white/30" />
          <p className="mt-4 font-semibold">Nenhum aviso por enquanto</p>
          <p className="mt-1 text-sm text-white/55">
            Quando sua equipe atualizar treino ou dieta, você vê aqui.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5 px-5">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="flex gap-3 p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--app-gold-deep)] text-[var(--app-gold)]">
                  <Icon name="bell" className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="min-w-0 flex-1 truncate font-semibold">
                      {fillPlaceholders(item.title, {
                        name: studentProfile.name,
                        date: new Date(item.atIso),
                        expiration: planExpiration(),
                      })}
                    </p>
                    <span className="shrink-0 text-xs text-white/45">{timeAgo(item.atIso)}</span>
                  </div>
                  <p className="mt-0.5 text-sm leading-5 text-white/70">
                    {fillPlaceholders(item.message, {
                      name: studentProfile.name,
                      date: new Date(item.atIso),
                      expiration: planExpiration(),
                    })}
                  </p>
                  <p className="mt-1 text-[11px] text-white/40">{item.sentBy}</p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 px-5 text-center text-xs text-white/40">
        Para responder, fale com sua equipe no WhatsApp.
      </p>
      <GhostButton className="mx-auto mt-3" onClick={pop}>
        Voltar
      </GhostButton>
    </div>
  )
}
