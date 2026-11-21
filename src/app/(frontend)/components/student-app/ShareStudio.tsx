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
  exercisesDone,
  liftedKg,
  workLabel,
  useTimesDone,
  workoutOf,
  type DoneWorkout,
} from './history'
import { trainedDaysThisMonth, weekStreak } from './HomeTab'
import { paintSvg } from './paintSvg'
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

type Background = 'sem-fundo' | 'cor' | 'foto'

const templates = [
  'Músculos',
  'Card',
  'Resumo',
  'Números',
  'Treino',
  'Exercícios',
  'Semana',
  'Faixa',
] as const

type TemplateProps = {
  done: DoneWorkout
  logo: string | null
  id: string
  /** Every finished workout, newest first. */
  all: DoneWorkout[]
  /** Which workout overall this was (29 = 29º treino). */
  overall: number
}

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

function Logo({
  logo,
  y,
  width = 250,
  left,
}: {
  logo: string | null
  y: number
  width?: number
  /** Left edge; centered on the canvas when omitted. */
  left?: number
}) {
  const x = left ?? (W - width) / 2
  if (logo)
    return (
      <image
        href={logo}
        x={x}
        y={y - width * 0.18}
        width={width}
        height={width * 0.36}
        preserveAspectRatio={left === undefined ? 'xMidYMid meet' : 'xMinYMid meet'}
      />
    )
  return (
    <Text
      x={left ?? W / 2}
      anchor={left === undefined ? 'middle' : 'start'}
      y={y + 18}
      size={width * 0.2}
      weight={700}
      spacing={width * 0.06}
      fill={GOLD}
    >
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
          {`${durationLabel(done.seconds)}  ·  ${workLabel(done)}`}
        </Text>
        <Logo logo={logo} y={1690} />
      </g>
    </>
  )
}

/** Strava-like summary that works with or without records: exercises, sets, weight, time. */
function SummaryTemplate({ done, logo, id }: TemplateProps) {
  const workout = workoutOf(done.code)
  const kg = liftedKg(done)
  const cells: [string, string, string?][] = [
    ['Exercícios', String(exercisesDone(done).length)],
    ['Séries', done.sets ? String(done.sets) : '—'],
    ['Peso levantado', kg ? kg.toLocaleString('pt-BR') : '—', kg ? ' kg' : undefined],
    ['Tempo', durationLabel(done.seconds)],
  ]
  const left = 150
  // Two centered columns.
  const centers = [W / 2 - 230, W / 2 + 230]
  return (
    <>
      <defs>
        <Shadow id={id} />
      </defs>
      <g filter={`url(#${id})`}>
        <Text y={500} size={40} weight={700} fill={GOLD} spacing={6}>
          {`TREINO ${done.code} · ${done.nth}ª VEZ`}
        </Text>
        <Text y={590} size={70} weight={700}>
          {short(workout.title, 24)}
        </Text>
        <line
          x1={left}
          x2={W - left}
          y1={680}
          y2={680}
          stroke="#fff"
          strokeOpacity={0.3}
          strokeWidth={3}
        />
        {cells.map(([label, value, unit], index) => {
          const x = centers[index % 2]
          const y = 780 + Math.floor(index / 2) * 270
          return (
            <g key={label}>
              <Text x={x} y={y} size={36} weight={500} opacity={0.8}>
                {label}
              </Text>
              <text
                x={x}
                y={y + 112}
                fontSize={100}
                fontWeight={800}
                fill="#fff"
                textAnchor="middle"
              >
                {value}
                {unit && (
                  <tspan fontSize={48} fontWeight={600}>
                    {unit}
                  </tspan>
                )}
              </text>
            </g>
          )
        })}
        <line
          x1={left}
          x2={W - left}
          y1={1330}
          y2={1330}
          stroke="#fff"
          strokeOpacity={0.3}
          strokeWidth={3}
        />
        {done.prs > 0 && (
          <Text y={1410} size={40} weight={700} fill={GOLD}>
            {done.prs === 1 ? '1 recorde pessoal' : `${done.prs} recordes pessoais`}
          </Text>
        )}
        <Logo logo={logo} y={done.prs > 0 ? 1540 : 1450} />
      </g>
    </>
  )
}

function NumbersTemplate({ done, logo, id }: TemplateProps) {
  const workout = workoutOf(done.code)
  const exercises = String(exercisesDone(done).length)
  const rows: [string, string, number][] = [
    ['Treino', short(workout.title, 24), 72],
    ['Tempo', durationLabel(done.seconds), 104],
    done.sets ? ['Séries', String(done.sets), 104] : ['Exercícios', exercises, 104],
    done.prs
      ? ['Recordes', String(done.prs), 104]
      : done.sets
        ? ['Exercícios', exercises, 104]
        : ['Vez', `${done.nth}ª`, 104],
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
  // Without marked sets, list the plan's exercises (with no load).
  const rows = exercisesDone(done).slice(0, 6)
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
                fill={best?.pr ? GOLD : '#fff'}
              >
                {best ? formatSet(exercise, best) : 'feito'}
              </Text>
            </g>
          )
        })}
        <Text x={150} y={bottom + 70} size={38} weight={500} anchor="start" opacity={0.85}>
          {`${durationLabel(done.seconds)} · ${workLabel(done)}`}
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

/** Hevy-like card: the body map, the last 7 days and how often the student trained. */
function CardTemplate({ done, logo, id, all, overall }: TemplateProps) {
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(done.date)
    date.setDate(done.date.getDate() - 6 + index)
    return { date, done: all.some((item) => sameDay(item.date, date)) }
  })
  const count = days.filter((day) => day.done).length
  // Card spans x 80–1000; content keeps 70px inside it. The week bar sits inside that
  // padding and the circles keep their own gap from the bar's rounded ends.
  const pad = 150
  const barHeight = 128
  const left = pad + barHeight / 2
  const step = (W - left * 2) / 6
  return (
    <>
      <defs>
        <Shadow id={id} />
      </defs>
      <rect
        x={80}
        y={230}
        width={920}
        height={1530}
        rx={72}
        fill="#0d0b14"
        fillOpacity={0.94}
        stroke="#fff"
        strokeOpacity={0.1}
        strokeWidth={3}
      />
      <Text y={400} size={76} weight={800}>
        Mandou bem!
      </Text>
      <Text y={470} size={40} weight={500} opacity={0.8}>
        {`Esse foi seu ${overall}º treino`}
      </Text>
      <BodyMap muscles={musclesOf(done)} x={150} y={540} width={780} height={690} tone="sticker" />
      {days.map((day, index) => (
        <Text
          key={`l${index}`}
          x={left + index * step}
          y={1320}
          size={34}
          weight={600}
          opacity={0.75}
        >
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][day.date.getDay()]}
        </Text>
      ))}
      <rect
        x={pad}
        y={1357}
        width={W - pad * 2}
        height={barHeight}
        rx={barHeight / 2}
        fill="#fff"
        fillOpacity={0.06}
      />
      {days.map((day, index) => {
        const cx = left + index * step
        return day.done ? (
          <g key={`d${index}`}>
            <circle cx={cx} cy={1421} r={40} fill={GOLD} />
            <path
              d={`M${cx - 17} 1421 l11 11 l23 -24`}
              fill="none"
              stroke={INK}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : (
          <circle key={`d${index}`} cx={cx} cy={1421} r={13} fill="#fff" fillOpacity={0.25} />
        )
      })}
      <text x={W / 2} y={1570} fontSize={40} fontWeight={500} fill="#fff" textAnchor="middle">
        {'Você treinou '}
        <tspan fontWeight={800}>{count === 1 ? '1 vez' : `${count} vezes`}</tspan>
        {' nos últimos 7 dias'}
      </text>
      <Logo logo={logo} y={1668} width={200} left={pad} />
      <Text x={W - pad} y={1680} size={36} weight={600} anchor="end" opacity={0.8}>
        {`Treino ${done.code} · ${done.nth}ª vez`}
      </Text>
    </>
  )
}

/** Strava-like strip at the bottom, meant to sit over the student's photo. */
function StripTemplate({ done, logo, id }: TemplateProps) {
  const workout = workoutOf(done.code)
  const stats: [string, string][] = [
    ['Tempo', durationLabel(done.seconds)],
    done.sets ? ['Séries', String(done.sets)] : ['Exercícios', String(exercisesDone(done).length)],
    done.prs ? ['Recordes', String(done.prs)] : ['Vez', `${done.nth}ª`],
  ]
  return (
    <>
      <defs>
        <Shadow id={id} />
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.72} />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2d9a6" />
          <stop offset="1" stopColor="#6b6133" />
        </linearGradient>
      </defs>
      <rect x={0} y={1180} width={W} height={H - 1180} fill={`url(#${id}-fade)`} />
      <g filter={`url(#${id})`}>
        <Logo logo={logo} y={190} width={210} left={90} />
        <rect x={90} y={1430} width={150} height={150} rx={40} fill={`url(#${id}-gold)`} />
        <Text x={165} y={1540} size={96} weight={800} fill={INK}>
          {done.code}
        </Text>
        <Text x={275} y={1495} size={58} weight={700} anchor="start">
          {short(workout.title, 22)}
        </Text>
        <Text x={275} y={1560} size={36} weight={500} anchor="start" opacity={0.85}>
          {`Treino ${done.code} · ${done.nth}ª vez · ${dayLabel(done.date)}`}
        </Text>
        <line
          x1={90}
          x2={990}
          y1={1640}
          y2={1640}
          stroke="#fff"
          strokeOpacity={0.25}
          strokeWidth={3}
        />
        {stats.map(([label, value], index) => (
          <g key={label}>
            <Text
              x={90 + index * 310}
              y={1712}
              size={32}
              weight={500}
              anchor="start"
              opacity={0.75}
            >
              {label}
            </Text>
            <Text x={90 + index * 310} y={1790} size={66} weight={700} anchor="start">
              {value}
            </Text>
          </g>
        ))}
      </g>
    </>
  )
}

const templateComponents = [
  MusclesTemplate,
  CardTemplate,
  SummaryTemplate,
  NumbersTemplate,
  LetterTemplate,
  ExercisesTemplate,
  WeekTemplate,
  StripTemplate,
]

/* ---------------------------------------------------------------- Export */

const toDataUrl = async (url: string) => {
  const blob = await (await fetch(url)).blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

/** Background colors for "Com cor" (top-left → bottom-right gradient). */
const colorStops = {
  escuro: ['#2a2536', '#0b0a12'],
  dourado: ['#7d7140', '#1d190c'],
  vinho: ['#5a2434', '#14090d'],
} as const
type ColorId = keyof typeof colorStops
const colorNames: Record<ColorId, string> = { escuro: 'Escuro', dourado: 'Dourado', vinho: 'Vinho' }

/**
 * PNG 1080 × 1920. "Sem fundo" keeps the alpha channel (a sticker, like Strava's);
 * "Com cor" and "Foto" paint a background first. The sticker itself is painted with the
 * canvas 2D API (see paintSvg) so it comes out complete on mobile browsers too.
 */
async function renderPng(
  svg: SVGSVGElement,
  background: Background,
  color: ColorId,
  photo: string | null,
) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const context = canvas.getContext('2d')!
  if (background === 'cor') {
    const gradient = context.createLinearGradient(0, 0, W * 0.35, H)
    gradient.addColorStop(0, colorStops[color][0])
    gradient.addColorStop(1, colorStops[color][1])
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
  await paintSvg(svg, context)
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
  const all = useDoneWorkouts()
  const times = useTimesDone()
  const done = all.find((item) => item.key === doneKey)
  const overall =
    Object.values(times).reduce((sum, value) => sum + value, 0) -
    all.findIndex((item) => item.key === doneKey)
  const [index, setIndex] = useState(0)
  const [background, setBackground] = useState<Background>('sem-fundo')
  const [color, setColor] = useState<ColorId>('escuro')
  const [photo, setPhoto] = useState<string | null>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const svgs = useRef<(SVGSVGElement | null)[]>([])
  const scroller = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  // The PNG is prepared ahead of the tap: mobile browsers only allow share/copy while the
  // tap is still "fresh", so there is no time to render after it.
  const [ready, setReady] = useState<{ key: string; blob: Blob } | null>(null)
  const renderKey = `${doneKey}|${index}|${background}|${color}|${photo ?? ''}|${logo ? 1 : 0}`

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

  useEffect(() => {
    let alive = true
    const timer = window.setTimeout(() => {
      const svg = svgs.current[index]
      if (!svg) return
      renderPng(svg, background, color, photo)
        .then((blob) => alive && setReady({ key: renderKey, blob }))
        .catch(() => {})
    }, 300)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [renderKey, index, background, color, photo])

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

  const freshBlob = () => {
    const svg = svgs.current[index]
    return svg ? renderPng(svg, background, color, photo) : Promise.reject(new Error('svg'))
  }

  const savedToast =
    background === 'sem-fundo'
      ? 'Imagem sem fundo salva. Na galeria ela pode aparecer com preto ou branco atrás: é só a visualização.'
      : 'Imagem salva.'

  /** Opens the phone's share sheet; false when the browser can't share files. */
  const shareFile = (blob: Blob) => {
    const file = new File([blob], fileName, { type: 'image/png' })
    if (!navigator.canShare?.({ files: [file] })) return false
    navigator
      .share({ files: [file], title: `Treino ${done.code} · ${workout.title}` })
      .catch((error: Error) => {
        if (error.name === 'AbortError') return
        download(blob, fileName)
        setToast(savedToast)
      })
    return true
  }

  const act = (action: 'stories' | 'salvar', blob: Blob) => {
    const phone = window.matchMedia('(pointer: coarse)').matches
    // On phones, "Salvar" also goes through the share sheet ("Salvar imagem" puts it in
    // the gallery); a plain download would land in Files/Downloads instead.
    if ((action === 'stories' || phone) && shareFile(blob)) return
    download(blob, fileName)
    setToast(
      action === 'stories' ? 'Imagem salva. No Instagram, adicione aos Stories.' : savedToast,
    )
  }

  const run = (action: 'stories' | 'copiar' | 'salvar') => {
    if (busy) return
    const cached = ready?.key === renderKey ? ready.blob : null
    if (action === 'copiar') {
      // The clipboard accepts a promise, so copying works even if the PNG isn't ready yet.
      const copy = navigator.clipboard?.write
        ? navigator.clipboard.write([new ClipboardItem({ 'image/png': cached ?? freshBlob() })])
        : Promise.reject(new Error('clipboard'))
      copy
        .then(() => setToast('Figurinha copiada. Nos Stories, toque e segure para colar.'))
        .catch(async () => {
          try {
            download(cached ?? (await freshBlob()), fileName)
            setToast('Não deu para copiar neste navegador, então salvamos a imagem.')
          } catch {
            setToast('Não foi possível gerar a imagem agora.')
          }
        })
      return
    }
    if (cached) return act(action, cached)
    setBusy(true)
    freshBlob()
      .then((blob) => act(action, blob))
      .catch(() => setToast('Não foi possível gerar a imagem agora.'))
      .finally(() => setBusy(false))
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
                // Sized by height so the actions stay on screen on short phones.
                'relative aspect-[9/16] h-[clamp(260px,calc(100svh-400px),440px)] overflow-hidden rounded-[22px] ring-1 ring-white/10',
                background === 'sem-fundo' &&
                  'bg-[conic-gradient(#2b2834_25%,#1c1a23_0_50%,#2b2834_0_75%,#1c1a23_0)] bg-[length:18px_18px]',
                background === 'foto' && 'bg-black',
              )}
              style={
                background === 'cor'
                  ? {
                      background: `linear-gradient(170deg, ${colorStops[color][0]}, ${colorStops[color][1]})`,
                    }
                  : undefined
              }
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
                <Template
                  done={done}
                  logo={logo}
                  id={`share-${position}`}
                  all={all}
                  overall={overall}
                />
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
            ['sem-fundo', 'Sem fundo'],
            ['cor', 'Com cor'],
            ['foto', photo ? 'Sua foto' : 'Foto'],
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
      {background === 'cor' ? (
        <div className="mt-3 flex justify-center gap-3" role="radiogroup" aria-label="Cor do fundo">
          {(Object.keys(colorStops) as ColorId[]).map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={color === id}
              aria-label={colorNames[id]}
              title={colorNames[id]}
              onClick={() => setColor(id)}
              className={cx(
                'size-8 rounded-full ring-2 ring-offset-2 ring-offset-[var(--app-bg)] transition',
                color === id ? 'ring-white' : 'ring-transparent',
              )}
              style={{
                background: `linear-gradient(135deg, ${colorStops[id][0]}, ${colorStops[id][1]})`,
              }}
            />
          ))}
        </div>
      ) : (
        <p className="mx-6 mt-2 text-center text-[11px] leading-4 text-white/45">
          {background === 'sem-fundo' ? (
            'PNG sem fundo, como figurinha. Nos Stories, use Copiar e cole por cima da sua foto.'
          ) : (
            <button type="button" onClick={() => fileInput.current?.click()} className="underline">
              Trocar foto
            </button>
          )}
        </p>
      )}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        onChange={onPhoto}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="mt-auto grid grid-cols-3 gap-2 px-6 pt-4 pb-2">
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
