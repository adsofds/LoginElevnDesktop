'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { progressPhotos, studentProfile, type ProgressPhoto } from '@/lib/demo-student-app'
import { senderOf } from '@/lib/demo-team'
import { SenderAvatar } from '../team/SenderAvatar'
import { fillPlaceholders } from '@/lib/student-notifications'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { planExpiration } from './HomeTab'
import { useStudentApp } from './StudentApp'
import {
  Avatar,
  Card,
  Chip,
  GhostButton,
  GoldButton,
  PhoneSheet,
  ScreenHeader,
  squarePhoto,
} from './ui'

/* ---------------------------------------------------------------- Account (Smart Fit "Conta") */

const renewalPlans: [string, string, string?][] = [
  ['Mensal', 'R$ 490/mês'],
  ['Trimestral', 'R$ 420/mês', 'Seu plano'],
  ['Semestral', 'R$ 380/mês', 'Mais escolhido'],
]

/** Conversations happen on WhatsApp: opens the team's chat with a message ready. */
function openCoachWhatsApp(text: string) {
  window.open(
    `https://wa.me/${studentProfile.coachWhatsapp}?text=${encodeURIComponent(text)}`,
    '_blank',
    'noopener,noreferrer',
  )
}

const themeOptions = [
  { id: 'dark', label: 'Escuro', icon: 'moon' },
  { id: 'light', label: 'Claro', icon: 'sun' },
  { id: 'system', label: 'Automático', icon: 'phone' },
] as const

export function AccountTab() {
  const { push, avatar, setAvatar, themePref, setThemePref } = useStudentApp()
  const [sheet, setSheet] = useState<'renovar' | 'config' | 'foto' | null>(null)
  const [photoError, setPhotoError] = useState('')
  const cameraInput = useRef<HTMLInputElement>(null)
  const galleryInput = useRef<HTMLInputElement>(null)

  const onPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPhotoError('Escolha uma imagem (JPG, PNG ou HEIC).')
      return
    }
    try {
      setAvatar(await squarePhoto(file))
      setPhotoError('')
      setSheet(null)
    } catch {
      setPhotoError('Não foi possível abrir essa imagem. Tente outra.')
    }
  }
  const [renewPlan, setRenewPlan] = useState(studentProfile.plan)
  const [prefs, setPrefs] = useState({ treino: true, som: true })

  const menu = [
    {
      id: 'fotos',
      label: 'Minhas fotos',
      hint: 'Envie e compare sua evolução',
      icon: 'photo',
      onClick: () => push({ name: 'photos' }),
    },
    {
      id: 'avisos',
      label: 'Avisos da equipe',
      hint: 'Treino, dieta e lembretes',
      icon: 'bell',
      onClick: () => push({ name: 'notifications' }),
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
      <section className="px-5 pt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setPhotoError('')
            setSheet('foto')
          }}
          aria-label="Trocar foto de perfil"
          className="relative mx-auto block rounded-full transition-transform active:scale-95"
        >
          <Avatar
            src={avatar}
            name={studentProfile.name}
            className="size-24 text-[28px] ring-4 ring-[var(--app-gold)]/25"
          />
          <span className="absolute right-0 bottom-0 grid size-8 place-items-center rounded-full bg-[var(--app-gold)] text-[#0d0a21] ring-4 ring-[var(--app-bg)]">
            <Icon name="photo" className="size-4" />
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setPhotoError('')
            setSheet('foto')
          }}
          className="mt-2 text-[13px] font-semibold text-[var(--app-gold)]"
        >
          {avatar ? 'Trocar foto' : 'Adicionar foto'}
        </button>
        <h1 className="mt-2 text-[26px] leading-8 font-semibold tracking-[-0.02em]">
          {studentProfile.name}
        </h1>
        <div className="mt-2 flex justify-center gap-1.5">
          <Chip tone="gold">Plano {studentProfile.plan}</Chip>
          <Chip>Vence {planExpiration()}</Chip>
        </div>
      </section>

      {studentProfile.daysToExpire <= 7 && (
        <Card className="relative mx-5 mt-6 overflow-hidden p-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-10 size-52 rounded-full opacity-40 blur-2xl"
            style={{ background: 'var(--app-gold-deep)' }}
          />
          <p className="relative text-[15px] leading-6">
            Seu plano vence em{' '}
            <strong className="text-[var(--app-gold)]">{studentProfile.daysToExpire} dias</strong>.
            Renove para não perder o acompanhamento.
          </p>
          <GoldButton className="relative mt-4" onClick={() => setSheet('renovar')}>
            Renovar plano
          </GoldButton>
        </Card>
      )}

      <Card className="mx-5 mt-3 divide-y divide-[var(--app-line)]">
        {[
          ['Objetivo', `${studentProfile.goal} (${studentProfile.phase})`],
          ['Frequência', studentProfile.frequency],
          ['Peso atual', studentProfile.weight],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <span className="text-sm text-white/50">{label}</span>
            <span className="text-right text-[15px] font-medium">{value}</span>
          </div>
        ))}
      </Card>

      <Card className="mx-5 mt-3 p-4">
        <p id="aparencia-titulo" className="text-[15px] font-medium">
          Aparência
        </p>
        <p className="text-xs text-white/45">Modo escuro, claro ou igual ao do celular</p>
        <div
          role="radiogroup"
          aria-labelledby="aparencia-titulo"
          className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-white/[0.06] p-1"
        >
          {themeOptions.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={themePref === id}
              onClick={() => setThemePref(id)}
              className={cx(
                'flex h-10 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors',
                themePref === id ? 'bg-white text-[var(--app-on-fg)]' : 'text-white/60',
              )}
            >
              <Icon name={icon} className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mx-5 mt-3 overflow-hidden">
        <ul className="divide-y divide-[var(--app-line)]">
          {menu.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={item.onClick}
                className="flex w-full items-center gap-4 px-4 py-3.5 text-left active:bg-white/[0.04]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white/85">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-white/45">{item.hint}</span>
                </span>
                <Icon name="chevronRight" className="size-5 text-white/35" />
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <button
        type="button"
        className="mx-5 mt-3 mb-2 flex h-12 w-[calc(100%-40px)] items-center justify-center gap-2 text-sm font-medium text-white/45"
      >
        <Icon name="logout" className="size-4" /> Sair
      </button>

      <PhoneSheet open={sheet === 'foto'} onClose={() => setSheet(null)} title="Foto de perfil">
        <div className="flex items-center gap-4 pb-4">
          <Avatar src={avatar} name={studentProfile.name} className="size-16 text-xl" />
          <p className="text-[13px] leading-5 text-white/60">
            Aparece no seu perfil e para a equipe da Elevn na sua ficha.
          </p>
        </div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => cameraInput.current?.click()}
            className="flex h-12 w-full items-center gap-3 rounded-2xl bg-white/[0.06] px-4 text-[15px] font-medium active:bg-white/10"
          >
            <Icon name="photo" className="size-5 text-[var(--app-gold)]" /> Tirar foto
          </button>
          <button
            type="button"
            onClick={() => galleryInput.current?.click()}
            className="flex h-12 w-full items-center gap-3 rounded-2xl bg-white/[0.06] px-4 text-[15px] font-medium active:bg-white/10"
          >
            <Icon name="download" className="size-5 rotate-180 text-[var(--app-gold)]" /> Escolher
            da galeria
          </button>
          {avatar && (
            <button
              type="button"
              onClick={() => {
                setAvatar(null)
                setSheet(null)
              }}
              className="flex h-12 w-full items-center gap-3 rounded-2xl px-4 text-[15px] font-medium text-[var(--app-red)] active:bg-white/[0.06]"
            >
              <Icon name="trash" className="size-5" /> Remover foto
            </button>
          )}
        </div>
        {photoError && <p className="mt-3 text-[13px] text-[var(--app-red)]">{photoError}</p>}
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={onPhoto}
        />
        <input
          ref={galleryInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPhoto}
        />
      </PhoneSheet>

      <PhoneSheet open={sheet === 'renovar'} onClose={() => setSheet(null)} title="Renovar plano">
        <div role="radiogroup" aria-label="Plano" className="space-y-2">
          {renewalPlans.map(([name, price, tag]) => (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={renewPlan === name}
              onClick={() => setRenewPlan(name)}
              className={cx(
                'flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left ring-1 transition-colors ring-inset',
                renewPlan === name
                  ? 'bg-[var(--app-gold)]/12 ring-[var(--app-gold)]'
                  : 'bg-white/[0.05] ring-transparent',
              )}
            >
              <span>
                <span className="block font-semibold">{name}</span>
                {tag && <span className="text-xs text-[var(--app-gold)]">{tag}</span>}
              </span>
              <span className="font-semibold tabular-nums">{price}</span>
            </button>
          ))}
        </div>
        <GoldButton
          className="mt-5"
          onClick={() => {
            openCoachWhatsApp(
              `Oi ${studentProfile.coachFirstName}! Quero renovar meu acompanhamento no plano ${renewPlan}.`,
            )
            setSheet(null)
          }}
        >
          Renovar pelo WhatsApp
        </GoldButton>
        <p className="mt-2 text-center text-xs text-white/45">
          A equipe confirma o valor e envia o pagamento por lá.
        </p>
      </PhoneSheet>

      <PhoneSheet open={sheet === 'config'} onClose={() => setSheet(null)} title="Configurações">
        <ul className="divide-y divide-[var(--app-line)]">
          {(
            [
              ['treino', 'Lembrete de treino', 'No horário em que você costuma treinar'],
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
                    'absolute top-1 size-5 rounded-full bg-[#fff] shadow-sm transition-all',
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

/* ---------------------------------------------------------------- Progress photos */

const photoDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(`${iso}T12:00:00`))
    .replaceAll('.', '')

const todayIso = () => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function PhotosScreen() {
  const { pop } = useStudentApp()
  const [photos, setPhotos] = useState<ProgressPhoto[]>(progressPhotos)
  const [pose, setPose] = useState<ProgressPhoto['pose']>('Frente')
  const [date, setDate] = useState(todayIso)
  const [weight, setWeight] = useState(() => studentProfile.weight.replace(/[^\d,]/g, ''))
  const [weightError, setWeightError] = useState('')
  const sorted = [...photos].sort((a, b) => a.dateIso.localeCompare(b.dateIso))
  const [beforeId, setBeforeId] = useState(sorted[0]?.id ?? '')
  // Default comparison: first photo vs. the latest one in the same pose.
  const [afterId, setAfterId] = useState(
    () =>
      [...sorted].reverse().find((photo) => photo.pose === sorted[0]?.pose)?.id ??
      sorted[sorted.length - 1]?.id ??
      '',
  )
  const [compare, setCompare] = useState(50)
  const input = useRef<HTMLInputElement>(null)
  const before = photos.find((photo) => photo.id === beforeId)
  const after = photos.find((photo) => photo.id === afterId)

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const weightKg = Number(weight.replace(',', '.'))
    const created: ProgressPhoto = {
      id: `upload-${Date.now()}`,
      url: URL.createObjectURL(file),
      dateIso: date,
      pose,
      weightKg: weightKg >= 30 && weightKg <= 300 ? weightKg : undefined,
    }
    setPhotos((current) => [...current, created])
    setAfterId(created.id)
    event.target.value = ''
  }

  const kgLabel = (kg: number) => `${kg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`
  const optionLabel = (photo: ProgressPhoto) =>
    `${photoDate(photo.dateIso)} · ${photo.pose}${photo.weightKg ? ` · ${kgLabel(photo.weightKg)}` : ''}`
  const weightDiff = before?.weightKg && after?.weightKg ? after.weightKg - before.weightKg : null
  const pickPhoto = () => {
    const kg = Number(weight.replace(',', '.'))
    if (!(kg >= 30 && kg <= 300)) {
      setWeightError('Informe o seu peso no dia da foto (ex.: 81,4).')
      return
    }
    setWeightError('')
    input.current?.click()
  }

  return (
    <div>
      <ScreenHeader title="Minhas fotos" onBack={pop} subtitle="O Breno vê na sua ficha" />

      {before && after && (
        <section className="px-5">
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={after.url}
              alt={`Depois, ${optionLabel(after)}`}
              className="absolute inset-0 size-full object-cover"
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - compare}% 0 0)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={before.url}
                alt={`Antes, ${optionLabel(before)}`}
                className="absolute inset-0 size-full object-cover"
              />
            </div>
            <span
              className="absolute inset-y-0 w-0.5 bg-[#fff] shadow"
              style={{ left: `${compare}%` }}
              aria-hidden="true"
            />
            <span className="absolute top-3 left-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-[#fff] backdrop-blur">
              Antes
            </span>
            <span className="absolute top-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-[#fff] backdrop-blur">
              Depois
            </span>
          </div>
          {weightDiff !== null && (
            <p className="mt-3 flex items-center justify-center gap-2 text-sm">
              <span className="text-white/55">Peso</span>
              <span className="font-semibold tabular-nums">{kgLabel(before!.weightKg!)}</span>
              <span className="text-white/40">→</span>
              <span className="font-semibold tabular-nums">{kgLabel(after!.weightKg!)}</span>
              <span
                className={cx(
                  'rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                  weightDiff <= 0
                    ? 'bg-[var(--app-green)]/15 text-[var(--app-green)]'
                    : 'bg-white/[0.08] text-white/70',
                )}
              >
                {weightDiff > 0 ? '+' : '−'}
                {kgLabel(Math.abs(weightDiff))}
              </span>
            </p>
          )}
          <input
            type="range"
            min={0}
            max={100}
            value={compare}
            onChange={(event) => setCompare(Number(event.target.value))}
            aria-label="Comparar antes e depois"
            className="mt-3 w-full accent-[var(--app-gold)]"
          />
          <div className="mt-2 space-y-2">
            {(
              [
                ['Antes', beforeId, setBeforeId],
                ['Depois', afterId, setAfterId],
              ] as const
            ).map(([label, value, setValue]) => (
              <label key={label} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-xs text-white/50">{label}</span>
                <select
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-2xl bg-white/[0.06] px-3 text-sm text-white ring-1 ring-white/10 ring-inset focus:ring-[var(--app-gold)] focus:outline-none"
                >
                  {sorted.map((photo) => (
                    <option key={photo.id} value={photo.id} className="bg-[var(--app-card)]">
                      {optionLabel(photo)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 px-5">
        <Card className="p-4">
          <p className="font-semibold">Enviar foto nova</p>
          <p className="mt-0.5 text-[13px] text-white/55">
            Mesma luz e mesmo lugar facilitam a comparação.
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
                  pose === item
                    ? 'bg-white text-[var(--app-on-fg)]'
                    : 'bg-white/[0.07] text-white/70',
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="mt-3 block">
            <span className="text-xs text-white/50">Data da foto</span>
            <input
              type="date"
              value={date}
              max={todayIso()}
              onChange={(event) => setDate(event.target.value || todayIso())}
              className="mt-1 h-11 w-full rounded-2xl bg-white/[0.06] px-3 text-sm text-white ring-1 ring-white/10 ring-inset focus:ring-[var(--app-gold)] focus:outline-none"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs text-white/50">Seu peso no dia da foto</span>
            <span className="relative mt-1 block">
              <input
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(event) => setWeight(event.target.value.replace(/[^\d.,]/g, ''))}
                placeholder="81,4"
                className="h-11 w-full rounded-2xl bg-white/[0.06] px-3 pr-10 text-base text-white ring-1 ring-white/10 ring-inset focus:ring-[var(--app-gold)] focus:outline-none"
              />
              <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-white/45">
                kg
              </span>
            </span>
            {weightError && (
              <span className="mt-1 block text-xs text-[var(--app-red)]">{weightError}</span>
            )}
          </label>
          <input
            ref={input}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={onFile}
            tabIndex={-1}
          />
          <GoldButton className="mt-3" onClick={pickPhoto}>
            <Icon name="photo" className="size-5" /> Tirar ou escolher foto
          </GoldButton>
        </Card>
      </section>

      <h2 className="mt-6 mb-3 px-5 text-[17px] font-semibold">Todas as fotos</h2>
      <ul className="grid grid-cols-3 gap-1.5 px-5">
        {[...sorted].reverse().map((photo) => (
          <li
            key={photo.id}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={optionLabel(photo)} className="size-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 pt-5 pb-1.5 text-[10px] text-[#fff] leading-3">
              <span className="block font-semibold">{photo.pose}</span>
              {photoDate(photo.dateIso)}
              {photo.weightKg && <span className="block">{kgLabel(photo.weightKg)}</span>}
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
  const sent = notifications.filter((item) => item.status === 'enviada')
  const mine = sent.filter((item) => item.audience.studentIds.includes(studentProfile.id))
  const items = mine.length ? mine : sent.slice(0, 3)

  const timeAgo = (iso: string) => {
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
    if (minutes < 60) return `${Math.max(1, minutes)} min`
    if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h`
    return `${Math.round(minutes / 1440)} d`
  }
  const fill = (text: string, iso: string) =>
    fillPlaceholders(text, {
      name: studentProfile.name,
      date: new Date(iso),
      expiration: planExpiration(),
    })

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
                <SenderAvatar sender={senderOf(item)} className="size-11" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="min-w-0 flex-1 truncate font-semibold">
                      {fill(item.title, item.atIso)}
                    </p>
                    <span className="shrink-0 text-xs text-white/45">{timeAgo(item.atIso)}</span>
                  </div>
                  <p className="mt-0.5 text-sm leading-5 text-white/70">
                    {fill(item.message, item.atIso)}
                  </p>
                  <p className="mt-1 text-[11px] text-white/45">
                    {senderOf(item).firstName} · {senderOf(item).role}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 px-5 text-center text-xs text-white/40">
        Para responder, fale com sua equipe no WhatsApp.
      </p>
      <GhostButton
        className="mx-auto mt-3"
        onClick={() => openCoachWhatsApp(`Oi ${studentProfile.coachFirstName}, vi o aviso no app.`)}
      >
        Falar no WhatsApp
      </GhostButton>
    </div>
  )
}
