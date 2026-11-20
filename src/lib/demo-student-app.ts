/**
 * Demo data for the student app preview (Lucas Andrade). Mirrors what the panel shows in
 * his file so the coach sees the same plan on both sides. Replace with Payload data when
 * the student app goes live.
 */

const img = (id: string, w = 480) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`

export const appImages = {
  gym: img('1637430308606-86576d8fef3c', 900),
  barbell: img('1672344048213-76b6e77304bd'),
  dumbbells: img('1734630341082-0fec0e10126c'),
  deadlift: img('1605296867304-46d5465a13f1'),
  dumbbellGrab: img('1583454110551-21f2fa2afe61'),
  pushup: img('1571019614242-c5c5dee9f50b'),
  crunch: img('1571019613454-1cb2f99b2d8b'),
  rack: img('1534438327276-14e5300c3a48'),
  legs: img('1518611012118-696072aa579a'),
  floorBarbell: img('1517838277536-f5f99be501cd'),
  mealPrep: img('1543352632-5a4b24e4d2a6', 900),
  plate: img('1547592180-85f173990554', 900),
}

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
  image: string
  restSec: number
  /** Video from the exercise library (MFIT). */
  videoLength: string
  trainerNote?: string
  sets: PlannedSet[]
}

export type Workout = {
  code: 'A' | 'B' | 'C' | 'D'
  title: string
  focus: string
  minutes: number
  cover: string
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
    minutes: 55,
    cover: appImages.barbell,
    exercises: [
      {
        id: 'supino-reto',
        name: 'Supino reto com barra',
        muscle: 'Peitoral',
        equipment: 'Barra',
        image: appImages.barbell,
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
        image: appImages.dumbbells,
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
        image: appImages.dumbbellGrab,
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
        image: appImages.rack,
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
        image: appImages.gym,
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
        image: appImages.pushup,
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
    minutes: 50,
    cover: appImages.dumbbellGrab,
    exercises: [
      {
        id: 'puxada',
        name: 'Puxada frontal na polia',
        muscle: 'Dorsal',
        equipment: 'Polia',
        image: appImages.gym,
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
        image: appImages.floorBarbell,
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
        image: appImages.dumbbellGrab,
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
        image: appImages.barbell,
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
        image: appImages.rack,
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
    minutes: 60,
    cover: appImages.deadlift,
    exercises: [
      {
        id: 'agachamento',
        name: 'Agachamento livre',
        muscle: 'Quadríceps',
        equipment: 'Barra',
        image: appImages.deadlift,
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
        image: appImages.gym,
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
        image: appImages.floorBarbell,
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
        image: appImages.legs,
        restSec: 45,
        videoLength: '0:22',
        sets: [s('normal', 5, 15, [5, 15]), s('normal', 5, 15, [5, 15])],
      },
      {
        id: 'panturrilha',
        name: 'Panturrilha em pé',
        muscle: 'Panturrilhas',
        equipment: 'Máquina',
        image: appImages.rack,
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
    minutes: 40,
    cover: appImages.crunch,
    exercises: [
      {
        id: 'esteira',
        name: 'Esteira intervalada (min)',
        muscle: 'Cardio',
        equipment: 'Esteira',
        image: appImages.gym,
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
        image: appImages.crunch,
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
        image: appImages.pushup,
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
  volumeKg: number
  sets: number
  prs: number
  comment?: string
}

export const workoutHistory: HistoryEntry[] = [
  {
    daysAgo: 1,
    code: 'A',
    minutes: 58,
    volumeKg: 6420,
    sets: 19,
    prs: 1,
    comment: 'Supino inclinado rendeu muito bem com 22 kg.',
  },
  { daysAgo: 3, code: 'D', minutes: 41, volumeKg: 0, sets: 10, prs: 0 },
  { daysAgo: 4, code: 'C', minutes: 63, volumeKg: 9850, sets: 15, prs: 2 },
  {
    daysAgo: 6,
    code: 'B',
    minutes: 49,
    volumeKg: 5310,
    sets: 15,
    prs: 0,
    comment: 'Senti o lombar na remada curvada.',
  },
  { daysAgo: 8, code: 'A', minutes: 55, volumeKg: 6180, sets: 19, prs: 0 },
]

export type Food = { name: string; amount: string; kcal: number; p: number; c: number; g: number }
export type Meal = {
  id: string
  name: string
  time: string
  foods: Food[]
  swaps?: string[]
}

export const dietPlan = {
  strategy: 'Déficit calórico estruturado',
  nutritionist: 'Dra. Paula Nunes',
  targets: { kcal: 1850, p: 150, c: 170, g: 55 },
  waterGoalMl: 3000,
  note: 'Nos dias de perna, some 1 banana no pré-treino (+100 kcal).',
  cover: appImages.plate,
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
  enrollment: '24077213',
  plan: 'Trimestral',
  planPrice: 'R$ 420/mês',
  expiration: '18 nov',
  daysToExpire: 3,
  goal: 'Emagrecimento',
  phase: 'Déficit',
  frequency: '5x por semana',
  experience: 'Treina há 2 anos',
  coach: 'Prof. Rafael Costa',
  coachWhatsapp: '5584999990000',
  weight: '81,4 kg',
  weightDelta: '-1,1 kg na quinzena',
  planWorkoutsDone: 8,
  planWorkoutsTotal: 36,
}

export type ProgressPhoto = {
  id: string
  url: string
  label: string
  date: string
  pose: 'Frente' | 'Lado' | 'Costas'
}

/** Same photos the panel shows in the student's file. */
export const progressPhotos: ProgressPhoto[] = [
  {
    id: 'p1',
    url: img('1518611012118-696072aa579a', 500),
    label: 'Início do plano',
    date: '10 jan',
    pose: 'Frente',
  },
  {
    id: 'p2',
    url: img('1571019613454-1cb2f99b2d8b', 500),
    label: 'Início do plano',
    date: '10 jan',
    pose: 'Costas',
  },
  {
    id: 'p3',
    url: img('1548690312-e3b507d8c110', 500),
    label: 'Mês 2',
    date: '22 fev',
    pose: 'Lado',
  },
  {
    id: 'p4',
    url: img('1594381898411-846e7d193883', 500),
    label: 'Mês 3',
    date: '12 abr',
    pose: 'Frente',
  },
]
