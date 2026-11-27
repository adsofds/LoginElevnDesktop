/*
 * The weekly check-in exactly as the student answers it in LiveClin: 14 questions, each
 * with its own input (kg, 0–N scale, options, emoji scale or free text). The panel
 * turns the answers into faces (1–5) per theme so the coach reads the week at a glance.
 */

export type FaceScore = 1 | 2 | 3 | 4 | 5

export type HungerAnswer = 'baixo' | 'medio' | 'sem-fome' | 'alto'
export type BowelAnswer = 'regulado' | 'alternado' | 'irregular'
export type DiscomfortAnswer = 'raro' | 'as-vezes' | 'frequente'

/** One submitted check-in. Numbers are the value the student tapped in LiveClin. */
export type LiveClinAnswers = {
  submittedAt: string
  protocolName: string
  /** Q1 · kg */
  weightKg: number
  /** Context shown next to the weight (computed by the panel, not asked). */
  weightTrend?: string
  /** Q2 · 0–9 (9 = 9 ou mais) */
  offPlanMeals: number
  offPlanNote?: string
  /** Q3 */
  hunger: HungerAnswer
  /** Q4 · litros, 0–5 (5 = 5 ou mais) */
  waterLiters: number
  /** Q5 */
  bowel: BowelAnswer
  /** Q6 (+ description when it happens) */
  discomfort: DiscomfortAnswer
  discomfortNote?: string
  /** Q7 */
  menuChanges: string
  /** Q8 · 0–7 */
  strengthSessions: number
  /** Q9 · 5 = Melhorou muito … 1 = Piorou muito */
  performance: FaceScore
  /** Q10 · 0–7 */
  aerobicSessions: number
  /** Q11 · 1–10 */
  sleepHours: number
  /** Q12 · 5 = Dei o meu melhor … 1 = Chutei o balde totalmente */
  dedication: FaceScore
  dedicationNote?: string
  /** Q13 · 5 = Bastante evolução … 1 = Estou regredindo */
  evolution: FaceScore
  evolutionNote?: string
  /** Q14 */
  feedback: string
}

export type QuestionIcon =
  | 'scale'
  | 'meal'
  | 'hunger'
  | 'water'
  | 'timer'
  | 'face'
  | 'menu'
  | 'dumbbell'
  | 'trend'
  | 'heart'
  | 'sleep'
  | 'star'
  | 'body'
  | 'chat'

type Base = { id: string; icon: QuestionIcon; title: string; question: string; example?: string }

export type LiveClinQuestion =
  | (Base & { kind: 'kg' })
  | (Base & {
      kind: 'scale'
      min: number
      max: number
      minLabel: string
      maxLabel: string
      /** Singular and plural unit for the one-line summary ("1 refeição", "3 litros"). */
      unit: [string, string]
      /** The top value means "or more". */
      orMore?: boolean
      noteLabel?: string
    })
  | (Base & { kind: 'options'; options: string[]; noteLabel?: string; noteWhen?: number[] })
  | (Base & { kind: 'emoji'; options: string[]; noteLabel?: string })
  | (Base & { kind: 'text'; label: string })

const emoji = ['😍', '🙂', '😐', '🙁', '😞'] as const
/** Emoji shown in LiveClin for score 5 (first option) down to 1 (last option). */
export const emojiFor = (score: FaceScore) => emoji[5 - score]

export const hungerOptions: Record<HungerAnswer, string> = {
  baixo: 'Baixo; não sinto muita fome, mas consigo comer tudo.',
  medio: 'Médio; às vezes sinto fome, mas isso não me atrapalha.',
  'sem-fome': 'Não sinto fome e tenho dificuldade para comer.',
  alto: 'Alto; sinto bastante fome.',
}
export const bowelOptions: Record<BowelAnswer, string> = {
  regulado: 'Meu intestino está regulado, todos os dias.',
  alternado: 'Às vezes, dia sim, dia não',
  irregular: 'É irregular, uma a três vezes por semana.',
}
export const discomfortOptions: Record<DiscomfortAnswer, string> = {
  raro: 'Raramente ou nunca',
  'as-vezes': 'Às vezes',
  frequente: 'Frequentemente',
}

export const liveClinQuestions: LiveClinQuestion[] = [
  {
    id: 'weight',
    icon: 'scale',
    title: 'Peso corporal',
    question: 'Qual foi o seu último peso em jejum?',
    kind: 'kg',
  },
  {
    id: 'offPlan',
    icon: 'meal',
    title: 'Refeições fora do plano alimentar',
    question: 'Quantas refeições fora do planejado você fez na última semana?',
    kind: 'scale',
    min: 0,
    max: 9,
    minLabel: '(0) Nenhuma',
    maxLabel: '(9) ou mais',
    unit: ['refeição fora do plano', 'refeições fora do plano'],
    orMore: true,
    noteLabel: 'Descreva as quantidades de forma resumida',
  },
  {
    id: 'hunger',
    icon: 'hunger',
    title: 'Níveis de fome',
    question: 'Como você considera que está o seu nível de fome e apetite atualmente?',
    kind: 'options',
    options: Object.values(hungerOptions),
  },
  {
    id: 'water',
    icon: 'water',
    title: 'Ingestão de líquidos',
    question: 'Quantos litros de água você está bebendo por dia em média?',
    kind: 'scale',
    min: 0,
    max: 5,
    minLabel: '(0) Pouco',
    maxLabel: '(5) ou mais',
    unit: ['litro por dia', 'litros por dia'],
    orMore: true,
  },
  {
    id: 'bowel',
    icon: 'timer',
    title: 'Frequência intestinal',
    question: 'Você tem ido ao banheiro diariamente?',
    kind: 'options',
    options: Object.values(bowelOptions),
  },
  {
    id: 'discomfort',
    icon: 'face',
    title: 'Desconforto Abdominal',
    question: 'Você sentiu desconforto abdominal, como gases ou inchaço nos últimos dias?',
    kind: 'options',
    options: Object.values(discomfortOptions),
    noteLabel: 'Descreva esse desconforto e quando ele acontece',
    noteWhen: [1, 2],
  },
  {
    id: 'menu',
    icon: 'menu',
    title: 'Alterações no cardápio',
    question: 'Você gostaria de fazer alguma alteração no seu planejamento alimentar?',
    example: 'Por exemplo, incluir um novo alimento, adicionar ou modificar uma refeição.',
    kind: 'text',
    label: 'Descreva',
  },
  {
    id: 'strength',
    icon: 'dumbbell',
    title: 'Treinos de Força',
    question: 'Quantas sessões de treinos com pesos você realizou nos últimos 7 dias?',
    example: 'Exemplo: Musculação, Pilates, Crossfit, Calistenia.',
    kind: 'scale',
    min: 0,
    max: 7,
    minLabel: '(0) Nenhuma',
    maxLabel: '(7) ou +',
    unit: ['treino de força', 'treinos de força'],
    orMore: true,
  },
  {
    id: 'performance',
    icon: 'trend',
    title: 'Desempenho em exercícios',
    question: 'Você sente que seu desempenho em exercícios físicos está melhorando?',
    kind: 'emoji',
    options: ['Melhorou muito', 'Melhorou pouco', 'Não melhorou', 'Piorou', 'Piorou muito'],
  },
  {
    id: 'aerobic',
    icon: 'heart',
    title: 'Frequência de Aeróbico',
    question: 'Você fez quantas sessões de atividade aeróbica (cardio) na semana anterior?',
    example: 'Exemplo: Corrida, ciclismo, natação, caminhada.',
    kind: 'scale',
    min: 0,
    max: 7,
    minLabel: '(0) Nenhuma',
    maxLabel: '(7) Sessões',
    unit: ['sessão de aeróbico', 'sessões de aeróbico'],
  },
  {
    id: 'sleep',
    icon: 'sleep',
    title: 'Horas de Sono',
    question: 'Quantas horas de sono você está dormindo por noite, em média?',
    kind: 'scale',
    min: 1,
    max: 10,
    minLabel: '(1) Pouco',
    maxLabel: '(10) Muito',
    unit: ['hora de sono', 'horas de sono'],
  },
  {
    id: 'dedication',
    icon: 'star',
    title: 'Dedicação',
    question: 'O quanto você se dedicou na última semana?',
    kind: 'emoji',
    options: [
      'Dei o meu melhor',
      'Me dediquei',
      'Neutro',
      'Poderia ter feito mais',
      'Chutei o balde totalmente',
    ],
    noteLabel: 'O que você poderia melhorar?',
  },
  {
    id: 'evolution',
    icon: 'body',
    title: 'Percepção corporal',
    question: 'Você consegue notar evolução corporal em direção ao seu objetivo?',
    kind: 'emoji',
    options: [
      'Bastante evolução',
      'Consigo notar evolução',
      'Não noto evolução',
      'Talvez esteja regredindo',
      'Estou regredindo',
    ],
    noteLabel: 'Quais são as suas percepções?',
  },
  {
    id: 'feedback',
    icon: 'chat',
    title: 'Feedback Aberto',
    question: 'O que mais você gostaria de compartilhar sobre sua experiência?',
    kind: 'text',
    label: 'Escreva',
  },
]

/** The answer to one question, in the shape its input uses. */
export function answerFor(
  question: LiveClinQuestion,
  answers: LiveClinAnswers,
): { value?: number | string; note?: string } {
  switch (question.id) {
    case 'weight':
      return { value: answers.weightKg }
    case 'offPlan':
      return { value: answers.offPlanMeals, note: answers.offPlanNote }
    case 'hunger':
      return { value: Object.keys(hungerOptions).indexOf(answers.hunger) }
    case 'water':
      return { value: answers.waterLiters }
    case 'bowel':
      return { value: Object.keys(bowelOptions).indexOf(answers.bowel) }
    case 'discomfort':
      return {
        value: Object.keys(discomfortOptions).indexOf(answers.discomfort),
        note: answers.discomfortNote,
      }
    case 'menu':
      return { value: answers.menuChanges }
    case 'strength':
      return { value: answers.strengthSessions }
    case 'performance':
      return { value: answers.performance }
    case 'aerobic':
      return { value: answers.aerobicSessions }
    case 'sleep':
      return { value: answers.sleepHours }
    case 'dedication':
      return { value: answers.dedication, note: answers.dedicationNote }
    case 'evolution':
      return { value: answers.evolution, note: answers.evolutionNote }
    case 'feedback':
      return { value: answers.feedback }
    default:
      return {}
  }
}

/** One-line version of an answer, for the compact list in the student's file. */
export function answerSummary(question: LiveClinQuestion, answers: LiveClinAnswers) {
  const { value, note } = answerFor(question, answers)
  let main = ''
  if (question.kind === 'kg') {
    main = [formatKg(Number(value)), answers.weightTrend].filter(Boolean).join(' · ')
  } else if (question.kind === 'scale') {
    const amount = Number(value)
    const more = question.orMore && amount === question.max ? ' ou mais' : ''
    main = `${amount}${more} ${amount === 1 && !more ? question.unit[0] : question.unit[1]}`
  } else if (question.kind === 'options') {
    main = question.options[Number(value)] ?? 'Sem resposta'
  } else if (question.kind === 'emoji') {
    const index = 5 - Number(value)
    main = `${emojiFor(Number(value) as FaceScore)} ${question.options[index] ?? 'Sem resposta'}`
  } else {
    main = typeof value === 'string' && value ? value : 'Sem resposta'
  }
  return { main, note }
}

const clampFace = (value: number) => Math.min(5, Math.max(1, value)) as FaceScore

/**
 * Themes the coach reads as faces, each computed from the student's own answers.
 * `question` points at the LiveClin question it comes from.
 */
export const faceThemes = [
  {
    id: 'alimentacao',
    label: 'Alimentação',
    question: 'offPlan',
    score: (a: LiveClinAnswers) =>
      clampFace(
        a.offPlanMeals === 0
          ? 5
          : a.offPlanMeals === 1
            ? 4
            : a.offPlanMeals === 2
              ? 3
              : a.offPlanMeals <= 4
                ? 2
                : 1,
      ),
  },
  {
    id: 'fome',
    label: 'Fome',
    question: 'hunger',
    score: (a: LiveClinAnswers) =>
      ({ medio: 5, baixo: 4, alto: 2, 'sem-fome': 2 })[a.hunger] as FaceScore,
  },
  {
    id: 'hidratacao',
    label: 'Hidratação',
    question: 'water',
    score: (a: LiveClinAnswers) => clampFace(a.waterLiters + 1),
  },
  {
    id: 'intestino',
    label: 'Intestino',
    question: 'bowel',
    score: (a: LiveClinAnswers) =>
      ({ regulado: 5, alternado: 3, irregular: 1 })[a.bowel] as FaceScore,
  },
  {
    id: 'digestao',
    label: 'Desconforto abdominal',
    question: 'discomfort',
    score: (a: LiveClinAnswers) =>
      ({ raro: 5, 'as-vezes': 3, frequente: 1 })[a.discomfort] as FaceScore,
  },
  {
    id: 'treinos',
    label: 'Treinos de força',
    question: 'strength',
    score: (a: LiveClinAnswers) => clampFace(a.strengthSessions),
  },
  {
    id: 'desempenho',
    label: 'Desempenho',
    question: 'performance',
    score: (a: LiveClinAnswers) => a.performance,
  },
  {
    id: 'sono',
    label: 'Sono',
    question: 'sleep',
    score: (a: LiveClinAnswers) =>
      clampFace(
        a.sleepHours >= 8
          ? 5
          : a.sleepHours === 7
            ? 4
            : a.sleepHours === 6
              ? 3
              : a.sleepHours === 5
                ? 2
                : 1,
      ),
  },
  {
    id: 'dedicacao',
    label: 'Dedicação',
    question: 'dedication',
    score: (a: LiveClinAnswers) => a.dedication,
  },
  {
    id: 'evolucao',
    label: 'Percepção corporal',
    question: 'evolution',
    score: (a: LiveClinAnswers) => a.evolution,
  },
] as const

export type FaceThemeId = (typeof faceThemes)[number]['id']

/** Face for one question, when that question feeds a theme. */
export function faceForQuestion(questionId: string, answers: LiveClinAnswers) {
  const theme = faceThemes.find((item) => item.question === questionId)
  return theme ? theme.score(answers) : null
}

/**
 * Faces per theme for the last `weeks` check-ins (oldest first). The latest comes from
 * the real answers; earlier weeks are demo history, deterministic per student.
 */
export function faceHistory(studentId: string, answers: LiveClinAnswers, weeks = 8) {
  let seed = Array.from(studentId).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  return Object.fromEntries(
    faceThemes.map((theme) => {
      const current = theme.score(answers)
      const earlier = Array.from({ length: weeks - 1 }, () =>
        clampFace(Math.round(current + (next() - 0.5) * 2.4)),
      )
      return [theme.id, [...earlier, current]]
    }),
  ) as Record<FaceThemeId, FaceScore[]>
}

/**
 * One face for the whole check-in. Mostly happy faces give a happy face; the average is
 * rounded, but two low themes cap it at "Regular" and three or more at "Ruim", so a few
 * bad answers are never hidden by the good ones.
 */
export function overallFace(scores: FaceScore[]): FaceScore {
  if (!scores.length) return 3
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const low = scores.filter((score) => score <= 2).length
  const cap = low >= 3 ? 2 : low >= 2 ? 3 : 5
  return clampFace(Math.min(Math.round(average), cap))
}

/** How the student is doing overall, in the coach's words. */
export const overallLabels: Record<FaceScore, string> = {
  5: 'Muito bem',
  4: 'Bem',
  3: 'Regular',
  2: 'Pede atenção',
  1: 'Crítico',
}

/** Good (4–5), regular (3) and low (1–2) themes in one check-in. */
export function faceTally(scores: FaceScore[]) {
  return {
    good: scores.filter((score) => score >= 4).length,
    regular: scores.filter((score) => score === 3).length,
    low: scores.filter((score) => score <= 2).length,
  }
}

/** One past check-in, as the admin compares them. */
export type CheckinHistoryEntry = {
  /** 0 = latest check-in, 1 = the one before… */
  weeksAgo: number
  /** Days between that check-in and today. */
  daysAgo: number
  weightKg: number
  faces: Record<FaceThemeId, FaceScore>
  overall: FaceScore
  feedback: string
}

const pastFeedback = [
  'Semana tranquila, consegui seguir quase tudo.',
  'Tive dois jantares fora, mas voltei ao plano no dia seguinte.',
  'Senti mais fome à noite; o lanche da tarde ajudou.',
  'Dormi pouco por causa do trabalho e o treino rendeu menos.',
  'Aumentei carga no agachamento e no supino.',
  'Intestino mais regulado depois de aumentar a água.',
  'Fim de semana difícil, exagerei no sábado.',
  'Me senti com mais energia nos treinos da manhã.',
  '',
]

/** "Hoje, 08:42", "Ontem…", "Há 3 dias…", "Pendente há 11 dias" → days ago. */
export function daysAgoFromLabel(label: string) {
  if (/hoje/i.test(label)) return 0
  if (/ontem/i.test(label)) return 1
  const match = label.match(/h[áa]\s+(\d+)\s+dias?/i)
  return match ? Number(match[1]) : 0
}

/** "-1,1 kg na quinzena" → kg per week (negative = losing). */
function weeklyWeightChange(trend?: string) {
  const match = trend?.match(/([+-−]?)\s*(\d+(?:,\d+)?)\s*kg/)
  if (!match) return 0
  const value = Number(match[2].replace(',', '.')) * (match[1] === '+' ? 1 : -1)
  const weeks = /quinzena/.test(trend!)
    ? 2
    : /m[êe]s/.test(trend!)
      ? 4
      : /trimestre/.test(trend!)
        ? 12
        : /(\d+)\s*dias/.test(trend!)
          ? Number(trend!.match(/(\d+)\s*dias/)![1]) / 7
          : 1
  return value / weeks
}

/**
 * Check-in history for the admin (newest first): the latest from the real answers,
 * the rest demo data that follows the student's weight trend. With the LiveClin
 * integration this is the list of submitted check-ins.
 */
export function checkinHistory(
  studentId: string,
  answers: LiveClinAnswers,
  weeks = 8,
): CheckinHistoryEntry[] {
  const faces = faceHistory(studentId, answers, weeks)
  const perWeek = weeklyWeightChange(answers.weightTrend)
  const lastDays = daysAgoFromLabel(answers.submittedAt)
  let seed = Array.from(studentId).reduce((sum, char) => sum + char.charCodeAt(0) * 7, 0)
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  let lastFeedback = answers.feedback
  // Never the same text two weeks in a row.
  const pickFeedback = () => {
    let pick = pastFeedback[Math.floor(next() * pastFeedback.length)]
    if (pick && pick === lastFeedback) {
      pick = pastFeedback[(pastFeedback.indexOf(pick) + 1) % pastFeedback.length]
    }
    lastFeedback = pick
    return pick
  }
  return Array.from({ length: weeks }, (_, weeksAgo) => {
    const index = weeks - 1 - weeksAgo
    const weekFaces = Object.fromEntries(
      faceThemes.map((theme) => [theme.id, faces[theme.id][index]]),
    ) as Record<FaceThemeId, FaceScore>
    const noise = weeksAgo === 0 ? 0 : (next() - 0.5) * 0.4
    return {
      weeksAgo,
      daysAgo: lastDays + weeksAgo * 7,
      weightKg: Math.round((answers.weightKg - perWeek * weeksAgo + noise) * 10) / 10,
      faces: weekFaces,
      overall: overallFace(Object.values(weekFaces)),
      feedback: weeksAgo === 0 ? answers.feedback : pickFeedback(),
    }
  })
}

export const formatKg = (kg: number) =>
  `${kg.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`

/** "81,4 kg (-1,1 kg na quinzena)" for places that show the weight with its trend. */
export const weightLabel = (answers: LiveClinAnswers) =>
  answers.weightTrend
    ? `${formatKg(answers.weightKg)} (${answers.weightTrend})`
    : formatKg(answers.weightKg)
