/*
 * Stylized muscle map (front and back) for workout recaps and share stickers.
 * Pure SVG so it can be nested inside the share templates and exported as PNG.
 * Worked muscles are red; muscles that only assist are a lighter red.
 */

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
  if (name.startsWith('quadriceps')) return { main: ['quads'], assist: ['glutes'] }
  if (name.startsWith('posterior')) return { main: ['hamstrings'], assist: ['glutes'] }
  if (name.startsWith('gluteo')) return { main: ['glutes'], assist: ['hamstrings'] }
  if (name.startsWith('panturrilha')) return { main: ['calves'], assist: [] }
  if (name.startsWith('abdom')) return { main: ['abs'], assist: ['obliques'] }
  if (name.startsWith('core')) return { main: ['abs', 'obliques'], assist: ['lowerBack'] }
  if (name.startsWith('cardio')) return { main: [], assist: ['quads', 'calves'] }
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

type Shape =
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; rotate?: number }
  | { kind: 'path'; d: string }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; r: number }

type Part = { region?: MuscleRegion; shape: Shape; mirror?: boolean }

const e = (cx: number, cy: number, rx: number, ry: number, rotate?: number): Shape => ({
  kind: 'ellipse',
  cx,
  cy,
  rx,
  ry,
  rotate,
})
const p = (d: string): Shape => ({ kind: 'path', d })
const r = (x: number, y: number, w: number, h: number, radius = 2): Shape => ({
  kind: 'rect',
  x,
  y,
  w,
  h,
  r: radius,
})

// Each figure lives in a 100 × 214 box. Parts with `mirror` are drawn on both sides.
// Parts without a region only shape the body; every part also feeds the silhouette.
const sharedParts: Part[] = [
  { shape: e(50, 15, 9.5, 11.5) },
  { shape: p('M45.5 24 L54.5 24 L55.5 32 L44.5 32 Z') },
  { region: 'shoulders', shape: e(30, 44, 7.2, 8.6, 22), mirror: true },
  { region: 'forearms', shape: e(21.5, 89, 4.4, 12, 12), mirror: true },
  { shape: e(18.5, 106, 3.6, 5.2, 10), mirror: true },
  { shape: e(43.2, 156, 4.2, 3.6), mirror: true },
  { shape: e(42.5, 205, 4.6, 3.4), mirror: true },
]

// Body volume under the muscles (torso, upper arm, thigh, lower leg).
const connectors: Part[] = [
  {
    shape: p(
      'M45 28 L50 28 L50 113 L37.6 110.5 Q35.4 103 37.2 95.5 Q33.8 78 35.6 61 Q31.5 51 33.5 40 Q38 33 45 30 Z',
    ),
    mirror: true,
  },
  { shape: e(26.3, 61.5, 6.2, 15.5, 10), mirror: true },
  { shape: e(21.5, 89, 5.2, 13.6, 12), mirror: true },
  {
    shape: p('M37.4 106 Q32.8 128 36.6 152 Q40 161 45.8 160 Q50.4 138 50 112 Z'),
    mirror: true,
  },
  { shape: e(42, 181, 5.4, 20.5), mirror: true },
]

const frontParts: Part[] = [
  ...sharedParts,
  { region: 'traps', shape: p('M44.5 29.5 Q39 32 35 35.5 L44.5 36.5 Z'), mirror: true },
  {
    region: 'chest',
    shape: p('M49 38.5 L37.8 40 Q32.6 46 34.4 53.6 Q39.6 60 49 58 Z'),
    mirror: true,
  },
  { region: 'biceps', shape: e(25.8, 64, 4.8, 10.6, 10), mirror: true },
  { region: 'obliques', shape: p('M36.8 61 Q34.6 76 38.2 92.5 L43 90.6 L43 62 Z'), mirror: true },
  { region: 'abs', shape: r(44.4, 61, 5.1, 8.6), mirror: true },
  { region: 'abs', shape: r(44.4, 70.8, 5.1, 8.6), mirror: true },
  { region: 'abs', shape: r(44.4, 80.6, 5.1, 8.6), mirror: true },
  { region: 'abs', shape: p('M44.4 91 L55.6 91 L53.4 103 L46.6 103 Z') },
  { region: 'quads', shape: e(40.4, 131, 5.2, 20, 4), mirror: true },
  { region: 'quads', shape: e(46.7, 136, 3.3, 17, -2), mirror: true },
  { region: 'calves', shape: e(41.6, 180, 4, 16), mirror: true },
]

const backParts: Part[] = [
  ...sharedParts,
  {
    region: 'traps',
    shape: p('M50 25.5 L44 31 L35 36.6 L44.6 41.2 L50 57 L55.4 41.2 L65 36.6 L56 31 Z'),
  },
  { region: 'upperBack', shape: e(39.6, 48.6, 4.8, 6, -18), mirror: true },
  { region: 'triceps', shape: e(25.8, 64, 4.8, 10.6, 10), mirror: true },
  {
    region: 'lats',
    shape: p('M36 56.5 Q33.8 71 39.4 86.6 L47.2 81 L48.2 62.5 L44.4 56.2 Z'),
    mirror: true,
  },
  { region: 'lowerBack', shape: p('M44.8 84 L55.2 84 L56.4 98.6 L43.6 98.6 Z') },
  { region: 'glutes', shape: e(43.8, 108.6, 7.2, 9), mirror: true },
  { region: 'hamstrings', shape: e(41.3, 136, 5, 18, 3), mirror: true },
  { region: 'hamstrings', shape: e(47, 138, 3, 15, -2), mirror: true },
  { region: 'calves', shape: e(41.4, 177, 5.2, 14), mirror: true },
]

function ShapeEl({ shape }: { shape: Shape }) {
  if (shape.kind === 'ellipse')
    return (
      <ellipse
        cx={shape.cx}
        cy={shape.cy}
        rx={shape.rx}
        ry={shape.ry}
        transform={shape.rotate ? `rotate(${shape.rotate} ${shape.cx} ${shape.cy})` : undefined}
      />
    )
  if (shape.kind === 'rect')
    return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.r} />
  return <path d={shape.d} />
}

function Parts({ parts }: { parts: Part[] }) {
  return (
    <>
      {parts.map((part, index) => (
        <g key={index}>
          <ShapeEl shape={part.shape} />
          {part.mirror && (
            <g transform="translate(100 0) scale(-1 1)">
              <ShapeEl shape={part.shape} />
            </g>
          )}
        </g>
      ))}
    </>
  )
}

export const muscleRed = '#ff3b30'

const tones = {
  // On the app's dark cards.
  app: { body: 0.11, muscle: 0.17 },
  // On share stickers, which may sit over a photo.
  sticker: { body: 0.2, muscle: 0.3 },
}

function Figure({
  parts,
  x,
  main,
  assist,
  tone,
}: {
  parts: Part[]
  x: number
  main: Set<MuscleRegion>
  assist: Set<MuscleRegion>
  tone: keyof typeof tones
}) {
  const muscles = parts.filter((part) => part.region)
  const pick = (test: (region: MuscleRegion) => boolean) =>
    muscles.filter((part) => test(part.region!))
  return (
    <g transform={`translate(${x} 0)`}>
      {/* Silhouette: every shape, merged by a round stroke, drawn once at low opacity. */}
      <g
        opacity={tones[tone].body}
        fill="#fff"
        stroke="#fff"
        strokeWidth={2.8}
        strokeLinejoin="round"
      >
        <Parts parts={[...connectors, ...parts]} />
      </g>
      <g opacity={tones[tone].muscle} fill="#fff">
        <Parts parts={pick((region) => !main.has(region) && !assist.has(region))} />
      </g>
      <g opacity={0.5} fill={muscleRed}>
        <Parts parts={pick((region) => assist.has(region))} />
      </g>
      <g fill={muscleRed}>
        <Parts parts={pick((region) => main.has(region))} />
      </g>
    </g>
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
  const { main, assist } = musclesWorked(muscles)
  return (
    <svg
      viewBox="0 0 212 214"
      width={width}
      height={height}
      x={x}
      y={y}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Figure parts={frontParts} x={0} main={main} assist={assist} tone={tone} />
      <Figure parts={backParts} x={112} main={main} assist={assist} tone={tone} />
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
}

/** Readable list of the main regions, for alt text. */
export function workedLabel(muscles: string[]) {
  return [...musclesWorked(muscles).main].map((region) => regionNames[region]).join(', ')
}
