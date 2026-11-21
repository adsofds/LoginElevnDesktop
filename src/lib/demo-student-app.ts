/**
 * Demo data for the student app preview (Lucas Andrade). Mirrors what the panel shows in
 * his file so the coach sees the same plan on both sides. Replace with Payload data when
 * the student app goes live.
 */

const img = (id: string, w = 480) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`

export type SetType = 'aquecimento' | 'normal' | 'falha'

export type PlannedSet = {
  type: SetType
  kg: number
  reps: number
  /** What the student did last time (Hevy's "Anterior" column). */
  previous?: { kg: number; reps: number }
}

export type Exercise = {
  id: string
  name: string
  muscle: string
  equipment: string
  restSec: number
  /** Length of Breno's own video for the exercise. */
  videoLength: string
  trainerNote?: string
  sets: PlannedSet[]
}

export type Workout = {
  code: 'A' | 'B' | 'C' | 'D'
  title: string
  focus: string
  minutes: number
  /** Times the student has done this workout so far. */
  timesDone: number
  muscles: string[]
  exercises: Exercise[]
}

const s = (type: SetType, kg: number, reps: number, prev?: [number, number]): PlannedSet => ({
  type,
  kg,
  reps,
  previous: prev ? { kg: prev[0], reps: prev[1] } : undefined,
})

export const workouts: Workout[] = [
  {
    code: 'A',
    title: 'Peito, Ombro e Tríceps',
    focus: 'Empurrar',
    timesDone: 8,
    muscles: ['Peito', 'Ombros', 'Tríceps'],
    minutes: 55,
    exercises: [
      {
        id: 'supino-reto',
        name: 'Supino reto com barra',
        muscle: 'Peitoral',
        equipment: 'Barra',
        restSec: 120,
        videoLength: '0:48',
        trainerNote: 'Desce controlando em 3 segundos. Escápulas presas no banco.',
        sets: [
          s('aquecimento', 20, 15, [20, 15]),
          s('normal', 50, 10, [50, 9]),
          s('normal', 50, 10, [50, 8]),
          s('normal', 50, 8, [47.5, 8]),
        ],
      },
      {
        id: 'supino-inclinado',
        name: 'Supino inclinado com halteres',
        muscle: 'Peitoral superior',
        equipment: 'Halteres',
        restSec: 90,
        videoLength: '0:41',
        sets: [
          s('normal', 22, 12, [20, 12]),
          s('normal', 22, 10, [20, 12]),
          s('normal', 22, 10, [20, 10]),
        ],
      },
      {
        id: 'desenvolvimento',
        name: 'Desenvolvimento com halteres',
        muscle: 'Ombros',
        equipment: 'Halteres',
        restSec: 90,
        videoLength: '0:36',
        sets: [
          s('normal', 16, 12, [16, 11]),
          s('normal', 16, 10, [16, 10]),
          s('normal', 16, 10, [14, 10]),
        ],
      },
      {
        id: 'elevacao-lateral',
        name: 'Elevação lateral',
        muscle: 'Ombros',
        equipment: 'Halteres',
        restSec: 60,
        videoLength: '0:29',
        trainerNote: 'Bi-set com o próximo exercício.',
        sets: [
          s('normal', 8, 15, [8, 15]),
          s('normal', 8, 15, [8, 13]),
          s('falha', 6, 15, [6, 15]),
        ],
      },
      {
        id: 'triceps-corda',
        name: 'Tríceps na polia com corda',
        muscle: 'Tríceps',
        equipment: 'Polia',
        restSec: 60,
        videoLength: '0:33',
        sets: [
          s('normal', 25, 12, [25, 12]),
          s('normal', 25, 12, [25, 11]),
          s('falha', 20, 15, [20, 14]),
        ],
      },
      {
        id: 'flexao',
        name: 'Flexão de braço',
        muscle: 'Peitoral',
        equipment: 'Peso corporal',
        restSec: 60,
        videoLength: '0:25',
        sets: [s('falha', 0, 15, [0, 14]), s('falha', 0, 12, [0, 12])],
      },
    ],
  },
  {
    code: 'B',
    title: 'Dorsal e Bíceps',
    focus: 'Puxar',
    timesDone: 7,
    muscles: ['Costas', 'Bíceps'],
    minutes: 50,
    exercises: [
      {
        id: 'puxada',
        name: 'Puxada frontal na polia',
        muscle: 'Dorsal',
        equipment: 'Polia',
        restSec: 90,
        videoLength: '0:44',
        trainerNote: 'Peito alto, puxe com os cotovelos e não balance o tronco.',
        sets: [
          s('aquecimento', 30, 15, [30, 15]),
          s('normal', 55, 10, [55, 10]),
          s('normal', 55, 10, [55, 9]),
          s('normal', 55, 8, [50, 10]),
        ],
      },
      {
        id: 'remada-curvada',
        name: 'Remada curvada com barra',
        muscle: 'Dorsal',
        equipment: 'Barra',
        restSec: 120,
        videoLength: '0:52',
        sets: [
          s('normal', 40, 10, [40, 10]),
          s('normal', 40, 10, [40, 9]),
          s('normal', 40, 8, [37.5, 10]),
        ],
      },
      {
        id: 'remada-unilateral',
        name: 'Remada unilateral com halter',
        muscle: 'Dorsal',
        equipment: 'Halter',
        restSec: 60,
        videoLength: '0:38',
        sets: [
          s('normal', 24, 12, [22, 12]),
          s('normal', 24, 12, [22, 12]),
          s('normal', 24, 10, [22, 10]),
        ],
      },
      {
        id: 'rosca-direta',
        name: 'Rosca direta com barra',
        muscle: 'Bíceps',
        equipment: 'Barra',
        restSec: 60,
        videoLength: '0:31',
        sets: [
          s('normal', 20, 12, [20, 12]),
          s('normal', 20, 10, [20, 10]),
          s('falha', 15, 12, [15, 12]),
        ],
      },
      {
        id: 'rosca-martelo',
        name: 'Rosca martelo',
        muscle: 'Bíceps',
        equipment: 'Halteres',
        restSec: 60,
        videoLength: '0:27',
        sets: [s('normal', 12, 12, [12, 12]), s('normal', 12, 12, [12, 10])],
      },
    ],
  },
  {
    code: 'C',
    title: 'Pernas',
    focus: 'Membros inferiores',
    timesDone: 7,
    muscles: ['Quadríceps', 'Posterior', 'Glúteos'],
    minutes: 60,
    exercises: [
      {
        id: 'agachamento',
        name: 'Agachamento livre',
        muscle: 'Quadríceps',
        equipment: 'Barra',
        restSec: 150,
        videoLength: '0:58',
        trainerNote: 'Profundidade até a coxa paralela. Joelhos acompanham a ponta dos pés.',
        sets: [
          s('aquecimento', 20, 12, [20, 12]),
          s('normal', 60, 10, [60, 10]),
          s('normal', 60, 10, [60, 8]),
          s('normal', 60, 8, [55, 8]),
        ],
      },
      {
        id: 'leg-press',
        name: 'Leg press 45°',
        muscle: 'Quadríceps',
        equipment: 'Máquina',
        restSec: 120,
        videoLength: '0:40',
        sets: [
          s('normal', 160, 12, [150, 12]),
          s('normal', 160, 12, [150, 12]),
          s('normal', 160, 10, [150, 10]),
        ],
      },
      {
        id: 'stiff',
        name: 'Stiff com barra',
        muscle: 'Posterior de coxa',
        equipment: 'Barra',
        restSec: 90,
        videoLength: '0:46',
        sets: [
          s('normal', 40, 12, [40, 12]),
          s('normal', 40, 12, [40, 10]),
          s('normal', 40, 10, [40, 10]),
        ],
      },
      {
        id: 'gluteo-4-apoios',
        name: 'Glúteo em 4 apoios',
        muscle: 'Glúteos',
        equipment: 'Caneleira',
        restSec: 45,
        videoLength: '0:22',
        sets: [s('normal', 5, 15, [5, 15]), s('normal', 5, 15, [5, 15])],
      },
      {
        id: 'panturrilha',
        name: 'Panturrilha em pé',
        muscle: 'Panturrilhas',
        equipment: 'Máquina',
        restSec: 45,
        videoLength: '0:20',
        sets: [
          s('normal', 60, 15, [60, 15]),
          s('normal', 60, 15, [60, 14]),
          s('falha', 50, 20, [50, 18]),
        ],
      },
    ],
  },
  {
    code: 'D',
    title: 'Cardio e Abdômen',
    focus: 'Condicionamento',
    timesDone: 5,
    muscles: ['Cardio', 'Abdômen'],
    minutes: 40,
    exercises: [
      {
        id: 'esteira',
        name: 'Esteira intervalada (min)',
        muscle: 'Cardio',
        equipment: 'Esteira',
        restSec: 0,
        videoLength: '0:35',
        trainerNote: '1 minuto forte, 2 minutos leve. O "kg" aqui é a velocidade (km/h).',
        sets: [
          s('normal', 12, 1, [11, 1]),
          s('normal', 6, 2, [6, 2]),
          s('normal', 12, 1, [11, 1]),
          s('normal', 6, 2, [6, 2]),
        ],
      },
      {
        id: 'abdominal',
        name: 'Abdominal supra',
        muscle: 'Abdômen',
        equipment: 'Peso corporal',
        restSec: 45,
        videoLength: '0:24',
        sets: [
          s('normal', 0, 20, [0, 20]),
          s('normal', 0, 20, [0, 18]),
          s('falha', 0, 20, [0, 16]),
        ],
      },
      {
        id: 'prancha',
        name: 'Prancha (segundos)',
        muscle: 'Core',
        equipment: 'Peso corporal',
        restSec: 45,
        videoLength: '0:18',
        sets: [
          s('normal', 0, 45, [0, 40]),
          s('normal', 0, 45, [0, 40]),
          s('normal', 0, 45, [0, 35]),
        ],
      },
    ],
  },
]

/** The next workout in the rotation (the "Recomendado" one). */
export const nextWorkoutCode: Workout['code'] = 'B'

export type HistoryEntry = {
  daysAgo: number
  code: Workout['code']
  minutes: number
  sets: number
  prs: number
  comment?: string
}

export const workoutHistory: HistoryEntry[] = [
  {
    daysAgo: 1,
    code: 'A',
    minutes: 58,

    sets: 19,
    prs: 1,
    comment: 'Supino inclinado rendeu muito bem com 22 kg.',
  },
  { daysAgo: 3, code: 'D', minutes: 41, sets: 10, prs: 0 },
  { daysAgo: 4, code: 'C', minutes: 63, sets: 15, prs: 2 },
  {
    daysAgo: 6,
    code: 'B',
    minutes: 49,

    sets: 15,
    prs: 0,
    comment: 'Senti o lombar na remada curvada.',
  },
  { daysAgo: 8, code: 'A', minutes: 55, sets: 19, prs: 0 },
]

export type Food = { name: string; amount: string; kcal: number; p: number; c: number; g: number }
export type SmartSwap = {
  id: string
  name: string
  /** Why it fits: eating out, no time to cook… */
  context: string
  kcal: number
  foods: { name: string; amount: string }[]
}

export type Meal = {
  id: string
  name: string
  time: string
  foods: Food[]
  /** Food-by-food substitutions approved by the nutritionist. */
  swaps?: string[]
  /** Whole-meal alternatives with similar calories ("Trocas inteligentes"). */
  smartSwaps?: SmartSwap[]
}

export const dietPlan = {
  strategy: 'Déficit calórico estruturado',
  targets: { kcal: 1850, p: 150, c: 170, g: 55 },
  note: 'Nos dias de perna, some 1 banana no pré-treino (+100 kcal).',
  meals: [
    {
      id: 'cafe',
      name: 'Café da manhã',
      time: '07:00',
      foods: [
        { name: 'Ovos mexidos', amount: '3 unidades', kcal: 215, p: 19, c: 2, g: 15 },
        { name: 'Pão integral', amount: '2 fatias', kcal: 140, p: 6, c: 24, g: 2 },
        { name: 'Mamão', amount: '1 fatia média', kcal: 55, p: 1, c: 13, g: 0 },
      ],
      swaps: ['Pão integral ↔ 4 col. de tapioca', 'Mamão ↔ 1 banana pequena'],
      smartSwaps: [
        {
          id: 'cafe-padaria',
          name: 'Café na padaria',
          context: 'Saiu cedo de casa',
          kcal: 400,
          foods: [
            { name: 'Pão na chapa sem manteiga', amount: '1 unidade' },
            { name: 'Omelete simples', amount: '2 ovos' },
            { name: 'Café com leite desnatado', amount: '1 copo' },
          ],
        },
        {
          id: 'cafe-rapido',
          name: 'Shake rápido',
          context: 'Sem tempo de cozinhar',
          kcal: 390,
          foods: [
            { name: 'Whey protein', amount: '1 scoop' },
            { name: 'Banana', amount: '1 unidade' },
            { name: 'Aveia', amount: '3 col. sopa' },
            { name: 'Leite desnatado', amount: '200 ml' },
          ],
        },
      ],
    },
    {
      id: 'lanche1',
      name: 'Lanche da manhã',
      time: '10:00',
      foods: [
        { name: 'Iogurte natural desnatado', amount: '170 g', kcal: 90, p: 9, c: 12, g: 0 },
        { name: 'Whey protein', amount: '1 scoop (30 g)', kcal: 120, p: 24, c: 3, g: 2 },
      ],
    },
    {
      id: 'almoco',
      name: 'Almoço',
      time: '12:30',
      foods: [
        { name: 'Frango grelhado', amount: '150 g', kcal: 240, p: 45, c: 0, g: 6 },
        { name: 'Arroz integral', amount: '120 g', kcal: 150, p: 3, c: 31, g: 1 },
        { name: 'Feijão', amount: '1 concha (80 g)', kcal: 75, p: 5, c: 13, g: 0 },
        {
          name: 'Salada verde + azeite',
          amount: 'à vontade + 1 col. chá',
          kcal: 60,
          p: 1,
          c: 4,
          g: 5,
        },
      ],
      swaps: ['Frango ↔ 150 g de patinho moído', 'Arroz ↔ 150 g de batata-doce'],
      smartSwaps: [
        {
          id: 'almoco-restaurante',
          name: 'Prato feito no restaurante',
          context: 'Almoço fora de casa',
          kcal: 540,
          foods: [
            { name: 'Grelhado (frango, peixe ou carne magra)', amount: '1 filé médio' },
            { name: 'Arroz', amount: '4 col. sopa' },
            { name: 'Feijão', amount: '1 concha' },
            { name: 'Salada', amount: 'metade do prato' },
          ],
        },
        {
          id: 'almoco-japones',
          name: 'Japonês',
          context: 'Encontro com amigos',
          kcal: 520,
          foods: [
            { name: 'Sashimi de salmão', amount: '8 fatias' },
            { name: 'Sushi', amount: '6 peças' },
            { name: 'Sunomono', amount: '1 porção' },
          ],
        },
      ],
    },
    {
      id: 'pre',
      name: 'Pré-treino',
      time: '16:30',
      foods: [
        { name: 'Batata-doce', amount: '150 g', kcal: 130, p: 2, c: 30, g: 0 },
        { name: 'Peito de peru', amount: '60 g', kcal: 60, p: 10, c: 1, g: 2 },
      ],
    },
    {
      id: 'jantar',
      name: 'Jantar',
      time: '20:00',
      foods: [
        { name: 'Tilápia assada', amount: '180 g', kcal: 200, p: 40, c: 0, g: 4 },
        { name: 'Legumes no vapor', amount: '200 g', kcal: 70, p: 3, c: 13, g: 1 },
        { name: 'Azeite de oliva', amount: '1 col. sopa', kcal: 90, p: 0, c: 0, g: 10 },
      ],
      swaps: ['Tilápia ↔ 150 g de frango'],
      smartSwaps: [
        {
          id: 'jantar-delivery',
          name: 'Delivery de poke',
          context: 'Cansado para cozinhar',
          kcal: 380,
          foods: [
            { name: 'Poke de atum', amount: 'tamanho pequeno' },
            { name: 'Base de folhas no lugar do arroz', amount: '—' },
          ],
        },
        {
          id: 'jantar-omelete',
          name: 'Omelete de legumes',
          context: 'Geladeira vazia',
          kcal: 340,
          foods: [
            { name: 'Ovos', amount: '3 unidades' },
            { name: 'Legumes picados', amount: '1 xícara' },
            { name: 'Queijo branco', amount: '1 fatia' },
          ],
        },
      ],
    },
    {
      id: 'ceia',
      name: 'Ceia',
      time: '22:30',
      foods: [
        { name: 'Pasta de amendoim', amount: '1 col. sopa (15 g)', kcal: 90, p: 4, c: 3, g: 8 },
      ],
    },
  ] satisfies Meal[],
}

export const studentProfile = {
  id: 'student-lucas',
  name: 'Lucas Andrade',
  firstName: 'Lucas',
  avatar: '/people/gustavo-lima.jpg',
  plan: 'Trimestral',
  planPrice: 'R$ 420/mês',
  daysToExpire: 3,
  goal: 'Emagrecimento',
  phase: 'Déficit',
  frequency: '5x por semana',
  weeklyTarget: 5,
  coach: 'Breno Monteiro',
  coachFirstName: 'Breno',
  coachWhatsapp: '5584999990000',
  weight: '81,4 kg',
  weightDelta: '-1,1 kg na quinzena',
  planWorkoutsDone: 8,
  planWorkoutsTotal: 36,
}

export type ProgressPhoto = {
  id: string
  url: string
  /** Day the photo was taken (yyyy-mm-dd), chosen by whoever uploads it. */
  dateIso: string
  pose: 'Frente' | 'Lado' | 'Costas'
}

/** Same photos the panel shows in the student's file. */
export const progressPhotos: ProgressPhoto[] = [
  { id: 'p1', url: img('1518611012118-696072aa579a', 500), dateIso: '2026-01-10', pose: 'Frente' },
  { id: 'p2', url: img('1571019613454-1cb2f99b2d8b', 500), dateIso: '2026-01-10', pose: 'Costas' },
  { id: 'p3', url: img('1548690312-e3b507d8c110', 500), dateIso: '2026-02-22', pose: 'Lado' },
  { id: 'p4', url: img('1594381898411-846e7d193883', 500), dateIso: '2026-04-12', pose: 'Frente' },
]
