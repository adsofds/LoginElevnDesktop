'use client'

/*
 * Anatomical muscle map (front and back) for workout recaps and share stickers.
 * Pure SVG so it can be nested inside the share templates and exported as PNG.
 * Worked muscles are red; muscles that only assist are a darker red. Each muscle gets
 * its own radial gradient so the figure reads as modeled, not flat.
 */

import { useId } from 'react'
import { anatomyBack, anatomyFront, outlineBack, outlineFront } from './body-anatomy'

export type MuscleRegion =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'traps'
  | 'upperBack'
  | 'lats'
  | 'lowerBack'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'adductors'
  | 'tibialis'

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

/** Exercise muscle label (as Breno writes it) → regions it works, and regions that assist. */
function regionsFor(muscle: string): { main: MuscleRegion[]; assist: MuscleRegion[] } {
  const name = normalize(muscle)
  if (name.startsWith('peito')) return { main: ['chest'], assist: ['shoulders', 'triceps'] }
  if (name.startsWith('ombro') || name.includes('deltoide'))
    return { main: ['shoulders'], assist: ['traps'] }
  if (name.startsWith('triceps')) return { main: ['triceps'], assist: [] }
  if (name.startsWith('biceps')) return { main: ['biceps'], assist: ['forearms'] }
  if (name.startsWith('antebraco')) return { main: ['forearms'], assist: [] }
  if (name.startsWith('dorsal') || name.startsWith('costas'))
    return { main: ['lats', 'upperBack'], assist: ['traps', 'biceps'] }
  if (name.startsWith('trapezio')) return { main: ['traps'], assist: [] }
  if (name.startsWith('lombar')) return { main: ['lowerBack'], assist: [] }
  if (name.startsWith('quadriceps')) return { main: ['quads'], assist: ['glutes', 'adductors'] }
  if (name.startsWith('posterior')) return { main: ['hamstrings'], assist: ['glutes'] }
  if (name.startsWith('gluteo')) return { main: ['glutes'], assist: ['hamstrings'] }
  if (name.startsWith('panturrilha')) return { main: ['calves'], assist: ['tibialis'] }
  if (name.startsWith('abdom')) return { main: ['abs'], assist: ['obliques'] }
  if (name.startsWith('core')) return { main: ['abs', 'obliques'], assist: ['lowerBack'] }
  if (name.startsWith('cardio')) return { main: [], assist: ['quads', 'calves', 'tibialis'] }
  return { main: [], assist: [] }
}

/** Which regions to paint for a list of exercise muscle labels. */
export function musclesWorked(muscles: string[]) {
  const main = new Set<MuscleRegion>()
  const assist = new Set<MuscleRegion>()
  for (const muscle of muscles) {
    const regions = regionsFor(muscle)
    regions.main.forEach((region) => main.add(region))
    regions.assist.forEach((region) => assist.add(region))
  }
  main.forEach((region) => assist.delete(region))
  return { main, assist }
}

/** Which drawing slugs belong to each region. */
const regionSlugs: Record<MuscleRegion, string[]> = {
  chest: ['chest'],
  shoulders: ['deltoids'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearms: ['forearm'],
  abs: ['abs'],
  obliques: ['obliques'],
  traps: ['trapezius'],
  upperBack: ['upper-back'],
  lats: ['upper-back'],
  lowerBack: ['lower-back'],
  glutes: ['gluteal'],
  quads: ['quadriceps'],
  hamstrings: ['hamstring'],
  calves: ['calves'],
  adductors: ['adductors'],
  tibialis: ['tibialis'],
}

const skinSlugs = new Set(['head', 'neck', 'hands', 'feet', 'knees', 'ankles'])

export const muscleRed = '#ff3b30'

const tones = {
  // On the app's dark cards.
  app: { body: '#1f1c27', muscle: ['#77728a', '#3d394b'], skin: ['#5e5a70', '#383445'] },
  // On share stickers, which may sit over a photo or a transparent background.
  sticker: { body: '#2a2633', muscle: ['#8e89a2', '#4b4759'], skin: ['#6c6880', '#403c4d'] },
}

const reds = { main: ['#ff7d70', '#cf2318'], assist: ['#b9574f', '#6a2a26'] }

function Shade({ id, colors }: { id: string; colors: string[] }) {
  return (
    <radialGradient id={id} cx="0.4" cy="0.32" r="0.8" fx="0.4" fy="0.3">
      <stop offset="0" stopColor={colors[0]} />
      <stop offset="1" stopColor={colors[1]} />
    </radialGradient>
  )
}

/**
 * Front and back figures side by side. Renders as a nested <svg>, so it works both in
 * HTML and inside the share templates (pass x/y/width/height there).
 */
export function BodyMap({
  muscles,
  width,
  height,
  x,
  y,
  tone = 'app',
  className,
  label,
}: {
  muscles: string[]
  width?: number | string
  height?: number | string
  x?: number
  y?: number
  tone?: keyof typeof tones
  className?: string
  label?: string
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const { main, assist } = musclesWorked(muscles)
  const slugsOf = (regions: Set<MuscleRegion>) =>
    new Set([...regions].flatMap((region) => regionSlugs[region]))
  const hot = slugsOf(main)
  const warm = slugsOf(assist)
  const palette = tones[tone]
  const fillFor = (slug: string) => {
    if (slug === 'hair') return palette.body
    if (skinSlugs.has(slug)) return `url(#${uid}-skin)`
    if (hot.has(slug)) return `url(#${uid}-hot)`
    if (warm.has(slug)) return `url(#${uid}-warm)`
    return `url(#${uid}-muscle)`
  }
  return (
    <svg
      viewBox="30 70 1388 1300"
      width={width}
      height={height}
      x={x}
      y={y}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <Shade id={`${uid}-muscle`} colors={palette.muscle} />
        <Shade id={`${uid}-skin`} colors={palette.skin} />
        <Shade id={`${uid}-hot`} colors={reds.main} />
        <Shade id={`${uid}-warm`} colors={reds.assist} />
      </defs>
      {/* The silhouette shows through the gaps between muscles as definition lines. */}
      <path d={outlineFront} fill={palette.body} />
      <path d={outlineBack} fill={palette.body} />
      {[...anatomyFront, ...anatomyBack].map((part, index) => (
        <g key={`${part.slug}-${index}`} fill={fillFor(part.slug)}>
          {part.paths.map((d, pathIndex) => (
            <path key={pathIndex} d={d} />
          ))}
        </g>
      ))}
    </svg>
  )
}

const regionNames: Record<MuscleRegion, string> = {
  chest: 'Peito',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebraço',
  abs: 'Abdômen',
  obliques: 'Oblíquos',
  traps: 'Trapézio',
  upperBack: 'Costas',
  lats: 'Dorsal',
  lowerBack: 'Lombar',
  glutes: 'Glúteos',
  quads: 'Quadríceps',
  hamstrings: 'Posterior',
  calves: 'Panturrilha',
  adductors: 'Adutores',
  tibialis: 'Tibial',
}

/** Readable list of the main regions, for alt text. */
export function workedLabel(muscles: string[]) {
  return [...musclesWorked(muscles).main].map((region) => regionNames[region]).join(', ')
}
