'use client'

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { cx } from '../ui/cx'
import { Icon } from '../ui/icons'
import { BodyMap, workedLabel } from './BodyMap'
import {
  bestSet,
  dayLabel,
  durationLabel,
  formatSet,
  musclesOf,
  useDoneWorkouts,
  workoutOf,
  type DoneWorkout,
} from './history'
import { trainedDaysThisMonth, weekStreak } from './HomeTab'
import { useStudentApp } from './StudentApp'

/*
 * Strava-style share studio: five stickers drawn as SVG on a 1080 × 1920 canvas (Instagram
 * Stories size). The background is transparent by default, so the student can paste the
 * sticker over their own photo; they can also pick a photo or a dark background here.
 */

const W = 1080
const H = 1920
const GOLD = '#c5bb83'
const INK = '#0d0a21'
const FONT = 'var(--font-figtree), Figtree, ui-sans-serif, system-ui, sans-serif'

type Background = 'transparente' | 'foto' | 'escuro'

const templates = ['Músculos', 'Números', 'Treino', 'Exercícios', 'Semana'] as const

type TemplateProps = { done: DoneWorkout; logo: string | null; id: string }

/* ---------------------------------------------------------------- Pieces */

function Text({
  x = W / 2,
  y,
  size,
  weight = 600,
  fill = '#fff',
  opacity,
  anchor = 'middle',
  spacing,
  children,
}: {
  x?: number
  y: number
  size: number
  weight?: number
  fill?: string
  opacity?: number
  anchor?: 'start' | 'middle' | 'end'
  spacing?: number
  children: ReactNode
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontWeight={weight}
      fill={fill}
      fillOpacity={opacity}
      textAnchor={anchor}
      letterSpacing={spacing}
    >
      {children}
    </text>
  )
}

function Logo({ logo, y, width = 250 }: { logo: string | null; y: number; width?: number }) {
  if (logo)
    return (
      <image
        href={logo}
        x={(W - width) / 2}
        y={y - width * 0.18}
        width={width}
        height={width * 0.36}
        preserveAspectRatio="xMidYMid meet"
      />
    )
  return (
    <Text y={y + 18} size={width * 0.2} weight={700} spacing={width * 0.06} fill={GOLD}>
      ELEVN
    </Text>
  )
}

/** Shadow so white text stays readable over bright photos. */
function Shadow({ id }: { id: string }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="10" floodColor="#000" floodOpacity="0.38" />
    </filter>
  )
}

const short = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value

/* ---------------------------------------------------------------- Templates */

function MusclesTemplate({ done, logo, id }: TemplateProps) {
  const workout = workoutOf(done.code)
  return (
    <>
      <defs>
        <Shadow id={id} />
      </defs>
      <g filter={`url(#${id})`}>
        <Text y={470} size={40} weight={700} fill={GOLD} spacing={6}>
          {`TREINO ${done.code} · ${done.nth}ª VEZ`}
        </Text>
        <Text y={560} size={70} weight={700}>
          {short(workout.title, 24)}
        </Text>
        <BodyMap
          muscles={musclesOf(done)}
          x={130}
          y={640}
          width={820}
          height={828}
          tone="sticker"
        />
        <Text y={1560} size={46} weight={600} opacity={0.92}>
          {`${durationLabel(done.seconds)}  ·  ${done.sets} séries`}
        </Text>
        <Logo logo={logo} y={1690} />
      </g>
    </>
  )
}

function NumbersTemplate({ done, logo, id }: TemplateProps) {
  const workout = workoutOf(done.code)
  const rows: [string, string, number][] = [
    ['Treino', short(workout.title, 24), 72],
    ['Tempo', durationLabel(done.seconds), 104],
    ['Séries', String(done.sets), 104],
    done.prs
      ? ['Recordes', String(done.prs), 104]
      : [
          'Exercícios',
          String(done.exercises.filter((exercise) => exercise.sets.length).length),
          104,
        ],
  ]
  return (
    <>
      <defs>
        <Shadow id={id} />
      </defs>
      <g filter={`url(#${id})`}>
        {rows.map(([label, value, size], index) => {
          const top = 520 + index * 250
          return (
            <g key={label}>
              <Text y={top} size={40} weight={500} opacity={0.8}>
                {label}
              </Text>
              <Text y={top + 30 + size * 0.85} size={size} weight={700}>
                {value}
              </Text>
            </g>
          )
        })}
        <Logo logo={logo} y={1560} />
      </g>
    </>
  )
}

function LetterTemplate({ done, logo, id }: TemplateProps) {
  const workout = workoutOf(done.code)
  return (
    <>
      <defs>
        <Shadow id={id} />
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2d9a6" />
          <stop offset="1" stopColor="#6b6133" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id})`}>
        <rect x={370} y={470} width={340} height={340} rx={84} fill={`url(#${id}-gold)`} />
        <Text y={728} size={220} weight={800} fill={INK}>
          {done.code}
        </Text>
        <Text y={1010} size={150} weight={800}>
          {`${done.nth}ª vez`}
        </Text>
        <Text y={1080} size={42} weight={500} opacity={0.85}>
          fazendo este treino
        </Text>
        <Text y={1210} size={62} weight={700} fill={GOLD}>
          {short(workout.title, 26)}
        </Text>
        <Text y={1290} size={42} weight={500} opacity={0.85}>
          {`${dayLabel(done.date)} · ${durationLabel(done.seconds)}`}
        </Text>
        <Logo logo={logo} y={1440} />
      </g>
    </>
  )
}

function ExercisesTemplate({ done, logo, id }: TemplateProps) {
  const workout = workoutOf(done.code)
  const rows = done.exercises.filter((exercise) => exercise.sets.length).slice(0, 6)
  const top = 640
  const step = 118
  const bottom = top + rows.length * step
  return (
    <>
      <defs>
        <Shadow id={id} />
      </defs>
      <rect
        x={90}
        y={380}
        width={900}
        height={bottom - 380 + 200}
        rx={56}
        fill="#0b0a12"
        fillOpacity={0.55}
      />
      <g filter={`url(#${id})`}>
        <Text x={150} y={470} size={38} weight={700} fill={GOLD} anchor="start" spacing={5}>
          {`TREINO ${done.code} · ${done.nth}ª VEZ`}
        </Text>
        <Text x={150} y={550} size={62} weight={700} anchor="start">
          {short(workout.title, 24)}
        </Text>
        {rows.map((exercise, index) => {
          const y = top + index * step
          const best = bestSet(exercise)
          return (
            <g key={exercise.id}>
              <line
                x1={150}
                x2={930}
                y1={y - 12}
                y2={y - 12}
                stroke="#fff"
                strokeOpacity={0.18}
                strokeWidth={2}
              />
              <Text x={150} y={y + 58} size={38} weight={500} anchor="start">
                {short(exercise.name, 25)}
              </Text>
              <Text
                x={930}
                y={y + 58}
                size={36}
                weight={700}
                anchor="end"
                fill={best.pr ? GOLD : '#fff'}
              >
                {formatSet(exercise, best)}
              </Text>
            </g>
          )
        })}
        <Text x={150} y={bottom + 70} size={38} weight={500} anchor="start" opacity={0.85}>
          {`${durationLabel(done.seconds)} · ${done.sets} séries`}
        </Text>
        <Logo logo={logo} y={bottom + 330} />
      </g>
    </>
  )
}

function WeekTemplate({ done, logo, id }: TemplateProps) {
  const workout = workoutOf(done.code)
  const today = new Date()
  const trained = trainedDaysThisMonth(today)
  if (done.key === 'hoje') trained[today.getDate() - 1] = true
  const streak = weekStreak(trained, today)
  const monthCount = trained.slice(0, today.getDate()).filter(Boolean).length
  const start = new Date(done.date)
  start.setDate(done.date.getDate() - done.date.getDay())
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const sameMonth = date.getMonth() === today.getMonth() && date <= today
    return {
      date,
      done: sameMonth && trained[date.getDate() - 1],
      current: date.toDateString() === done.date.toDateString(),
    }
  })
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(today)
  return (
    <>
      <defs>
        <Shadow id={id} />
      </defs>
      <g filter={`url(#${id})`}>
        <Text y={760} size={300} weight={800} fill={GOLD}>
          {streak}
        </Text>
        <Text y={850} size={54} weight={700}>
          {streak === 1 ? 'semana seguida' : 'semanas seguidas'}
        </Text>
        {days.map((day, index) => {
          const cx = W / 2 + (index - 3) * 128
          return (
            <g key={index}>
              <Text x={cx} y={990} size={32} weight={600} opacity={0.75}>
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][index]}
              </Text>
              <circle
                cx={cx}
                cy={1068}
                r={48}
                fill={day.done ? GOLD : 'none'}
                stroke={day.done ? 'none' : '#fff'}
                strokeOpacity={0.45}
                strokeWidth={4}
              />
              {day.done && (
                <path
                  d={`M${cx - 20} ${1068} l13 13 l26 -28`}
                  fill="none"
                  stroke={INK}
                  strokeWidth={9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {day.current && (
                <circle cx={cx} cy={1068} r={60} fill="none" stroke="#fff" strokeWidth={5} />
              )}
            </g>
          )
        })}
        <Text y={1230} size={46} weight={600}>
          {`${monthCount} treinos em ${month}`}
        </Text>
        <Text y={1300} size={40} weight={500} opacity={0.85}>
          {`${dayLabel(done.date)}: treino ${done.code} · ${short(workout.title, 22)}`}
        </Text>
        <Logo logo={logo} y={1450} />
      </g>
    </>
  )
}

const templateComponents = [
  MusclesTemplate,
  NumbersTemplate,
  LetterTemplate,
  ExercisesTemplate,
  WeekTemplate,
]

/* ---------------------------------------------------------------- Export */

let fontCssCache: Promise<string> | null = null

const toDataUrl = async (url: string) => {
  const blob = await (await fetch(url)).blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/** Figtree as data URLs: an SVG drawn into a canvas can't load the page's web fonts. */
function fontFaceCss() {
  fontCssCache ??= (async () => {
    const rules: string[] = []
    for (const sheet of Array.from(document.styleSheets)) {
      let list: CSSRuleList
      try {
        list = sheet.cssRules
      } catch {
        continue
      }
      for (const rule of Array.from(list)) {
        if (!(rule instanceof CSSFontFaceRule)) continue
        if (!/figtree/i.test(rule.style.getPropertyValue('font-family'))) continue
        const match = rule.style.getPropertyValue('src').match(/url\(["']?([^"')]+)["']?\)/)
        if (!match) continue
        try {
          const data = await toDataUrl(new URL(match[1], sheet.href ?? location.href).href)
          const weight = rule.style.getPropertyValue('font-weight') || '100 900'
          const range = rule.style.getPropertyValue('unicode-range')
          rules.push(
            `@font-face{font-family:ShareFont;src:url(${data});font-weight:${weight};${range ? `unicode-range:${range};` : ''}}`,
          )
        } catch {
          /* fall back to the system font */
        }
      }
    }
    return rules.join('\n')
  })()
  return fontCssCache
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

async function renderPng(svg: SVGSVGElement, background: Background, photo: string | null) {
  const ns = 'http://www.w3.org/2000/svg'
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', ns)
  clone.setAttribute('width', String(W))
  clone.setAttribute('height', String(H))
  clone.removeAttribute('class')
  clone.setAttribute('style', 'font-family: ShareFont, ui-sans-serif, system-ui, sans-serif')
  const css = await fontFaceCss()
  if (css) {
    const style = document.createElementNS(ns, 'style')
    style.textContent = css
    clone.insertBefore(style, clone.firstChild)
  }
  const sticker = await loadImage(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`,
  )
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const context = canvas.getContext('2d')!
  if (background === 'escuro') {
    const gradient = context.createLinearGradient(0, 0, W * 0.35, H)
    gradient.addColorStop(0, '#2a2536')
    gradient.addColorStop(1, '#0b0a12')
    context.fillStyle = gradient
    context.fillRect(0, 0, W, H)
  } else if (background === 'foto' && photo) {
    const image = await loadImage(photo)
    const scale = Math.max(W / image.width, H / image.height)
    const w = image.width * scale
    const h = image.height * scale
    context.drawImage(image, (W - w) / 2, (H - h) / 2, w, h)
    context.fillStyle = 'rgba(0,0,0,0.25)'
    context.fillRect(0, 0, W, H)
  }
  context.drawImage(sticker, 0, 0, W, H)
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('png'))), 'image/png'),
  )
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}

/* ---------------------------------------------------------------- Screen */

export function ShareStudio({ doneKey }: { doneKey: string }) {
  const { pop } = useStudentApp()
  const done = useDoneWorkouts().find((item) => item.key === doneKey)
  const [index, setIndex] = useState(0)
  const [background, setBackground] = useState<Background>('transparente')
  const [photo, setPhoto] = useState<string | null>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const svgs = useRef<(SVGSVGElement | null)[]>([])
  const scroller = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  // The wordmark goes into the sticker as a data URL so it survives the PNG export.
  useEffect(() => {
    let alive = true
    toDataUrl('/brand/wordmark-white.png')
      .then(async (data) => {
        await loadImage(data)
        if (alive) setLogo(data)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => () => void (photo && URL.revokeObjectURL(photo)), [photo])

  if (!done) return null
  const workout = workoutOf(done.code)
  const fileName = `elevn-treino-${done.code.toLowerCase()}-${templates[index].toLowerCase()}.png`

  const goTo = (next: number) => {
    const element = scroller.current
    if (element) element.scrollTo({ left: next * element.clientWidth, behavior: 'smooth' })
  }

  const onPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPhoto(URL.createObjectURL(file))
    setBackground('foto')
  }

  const chooseBackground = (next: Background) => {
    if (next === 'foto' && !photo) {
      fileInput.current?.click()
      return
    }
    setBackground(next)
  }

  const run = async (action: 'stories' | 'copiar' | 'salvar') => {
    const svg = svgs.current[index]
    if (!svg || busy) return
    setBusy(true)
    try {
      const blob = await renderPng(svg, background, photo)
      if (action === 'salvar') {
        download(blob, fileName)
        setToast('Imagem salva.')
      } else if (action === 'copiar') {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          setToast('Figurinha copiada. Cole nos Stories do Instagram.')
        } catch {
          download(blob, fileName)
          setToast('Não deu para copiar aqui, então salvamos a imagem.')
        }
      } else {
        const file = new File([blob], fileName, { type: 'image/png' })
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Treino ${done.code} · ${workout.title}`,
            })
          } catch (error) {
            if ((error as Error).name !== 'AbortError') throw error
          }
        } else {
          download(blob, fileName)
          setToast('Imagem salva. Abra o Instagram e adicione aos Stories.')
        }
      }
    } catch {
      setToast('Não foi possível gerar a imagem agora.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-3 px-4 pt-2 pb-3">
        <button
          type="button"
          onClick={pop}
          aria-label="Fechar"
          className="grid size-10 place-items-center rounded-full bg-white/[0.08] text-white"
        >
          <Icon name="close" className="size-4" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="text-[17px] font-semibold">Compartilhar treino</h1>
          <p className="truncate text-xs text-white/50">
            Treino {done.code} · {workout.title}
          </p>
        </div>
        <span className="w-10 text-right text-xs font-semibold text-white/50 tabular-nums">
          {index + 1}/{templates.length}
        </span>
      </header>

      <div
        ref={scroller}
        onScroll={(event) => {
          const element = event.currentTarget
          setIndex(Math.round(element.scrollLeft / element.clientWidth))
        }}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        aria-label="Modelos de compartilhamento"
        role="region"
      >
        {templateComponents.map((Template, position) => (
          <div
            key={templates[position]}
            className="grid w-full shrink-0 snap-center place-items-center py-1"
            aria-roledescription="modelo"
            aria-label={`${templates[position]} (${position + 1} de ${templates.length})`}
          >
            <div
              className={cx(
                'relative aspect-[9/16] w-[232px] overflow-hidden rounded-[22px] ring-1 ring-white/10',
                background === 'transparente' &&
                  'bg-[conic-gradient(#2b2834_25%,#1c1a23_0_50%,#2b2834_0_75%,#1c1a23_0)] bg-[length:18px_18px]',
                background === 'escuro' && 'bg-[linear-gradient(170deg,#2a2536,#0b0a12)]',
                background === 'foto' && 'bg-black',
              )}
            >
              {background === 'foto' && photo && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />
                  <span className="absolute inset-0 bg-black/25" />
                </>
              )}
              <svg
                ref={(element) => {
                  svgs.current[position] = element
                }}
                viewBox={`0 0 ${W} ${H}`}
                className="absolute inset-0 size-full"
                style={{ fontFamily: FONT }}
                role="img"
                aria-label={
                  position === 0
                    ? `Músculos trabalhados: ${workedLabel(musclesOf(done))}`
                    : `Modelo ${templates[position]}`
                }
              >
                <Template done={done} logo={logo} id={`share-${position}`} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5" role="tablist">
        {templates.map((name, position) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={position === index}
            aria-label={`Modelo ${name}`}
            onClick={() => goTo(position)}
            className={cx(
              'h-2 rounded-full transition-all',
              position === index ? 'w-6 bg-[var(--app-gold)]' : 'w-2 bg-white/25',
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-center text-sm font-semibold">{templates[index]}</p>

      <div
        className="mx-5 mt-4 grid grid-cols-3 rounded-full bg-white/[0.06] p-1"
        role="radiogroup"
        aria-label="Fundo"
      >
        {(
          [
            ['transparente', 'Transparente'],
            ['foto', photo ? 'Sua foto' : 'Foto'],
            ['escuro', 'Escuro'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={background === id}
            onClick={() => chooseBackground(id)}
            className={cx(
              'h-9 rounded-full text-[13px] font-semibold transition-colors',
              background === id ? 'bg-white text-[#0d0a21]' : 'text-white/60',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mx-6 mt-2 text-center text-[11px] leading-4 text-white/45">
        {background === 'transparente' ? (
          'Sem fundo: cole a figurinha por cima de uma foto nos Stories.'
        ) : background === 'foto' ? (
          <button type="button" onClick={() => fileInput.current?.click()} className="underline">
            Trocar foto
          </button>
        ) : (
          'Fundo escuro da Elevn.'
        )}
      </p>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        onChange={onPhoto}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="mt-auto grid grid-cols-3 gap-2 px-6 pt-5 pb-2">
        {(
          [
            ['stories', 'Stories', 'photo'],
            ['copiar', 'Copiar', 'swap'],
            ['salvar', 'Salvar', 'download'],
          ] as const
        ).map(([action, label, icon]) => (
          <button
            key={action}
            type="button"
            disabled={busy}
            onClick={() => run(action)}
            className="flex flex-col items-center gap-1.5 text-xs font-medium text-white/80 disabled:opacity-50"
          >
            <span
              className={cx(
                'grid size-14 place-items-center rounded-full',
                action === 'stories'
                  ? 'bg-[linear-gradient(45deg,#f9a03f,#e1306c_55%,#833ab4)] text-white'
                  : 'bg-white/[0.08] text-white',
              )}
            >
              <Icon name={icon} className="size-6" />
            </span>
            {label}
          </button>
        ))}
      </div>

      {toast && (
        <p
          role="status"
          className="absolute inset-x-6 bottom-28 z-30 rounded-2xl bg-white px-4 py-3 text-center text-[13px] font-medium text-[#0d0a21] shadow-xl"
        >
          {toast}
        </p>
      )}
    </div>
  )
}
