'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { Badge, type BadgeTone } from './ui/Badge'
import { Button } from './ui/Button'
import { cx } from './ui/cx'
import { FilterMenu } from './ui/FilterMenu'
import { Icon } from './ui/icons'
import { KpiStrip } from './ui/KpiStrip'
import { Menu } from './ui/Menu'
import { NameDialog } from './ui/NameDialog'
import { Sheet } from './ui/Sheet'
import { Table, TD, TH, THead, TR } from './ui/Table'
import { Tabs } from './ui/Tabs'
import { FaceCheckin } from './students/FaceCheckin'
import { CheckinsBoard } from './students/CheckinsBoard'
import { faceThemes, formatKg, weightLabel, type LiveClinAnswers } from './students/liveclin'
import { FichaSection } from './students/FichaSection'
import { WhatsAppGlyph, whatsappUrl } from './dashboard/AttentionActions'
import { downloadComparison, exportTemplates } from './students/photoExport'

type CheckinState = 'Pendente' | 'Realizado' | 'Atrasado'

export type StudentPhotoAngle = 'Frente' | 'Costas' | 'Perfil Direito' | 'Pós-Treino'

export type StudentAppPhoto = {
  id: string
  angle: StudentPhotoAngle
  dateLabel: string
  cycleLabel: string
  weightKg: string
  imageUrl: string
  studentNote: string
  adminObservation?: string
}
type RenewalState = 'Em dia' | 'Perto de vencer' | 'Recuperado' | 'Não renovou'
type StudentHealth = 'Em dia' | 'Atenção' | 'Em risco'

type LiveClinCheckinData = LiveClinAnswers

type AppStudentObservation = {
  id: string
  when: string
  category: 'Treino' | 'Dieta' | 'Rotina'
  note: string
}

type WorkoutExercise = {
  name: string
  sets: string
  rest: string
  loadNote: string
}

type WorkoutSessionPlan = {
  code: string
  title: string
  schedule: string
  studentAppComment: string
  commentSentAt: string
  exercises: WorkoutExercise[]
}

type WorkoutAppComment = {
  workoutCode: 'Treino A' | 'Treino B' | 'Treino C'
  workoutTitle: string
  sentAt: string
  comment: string
}

type StudentWorkoutPlan = {
  splitName: string
  frequency: string
  cardioPrescription: string
  technicalGuideline: string
  sessions: WorkoutSessionPlan[]
}

type DietMealPlan = {
  time: string
  title: string
  macros: string
  items: string[]
  substitutions: string
}

type StudentDietPlan = {
  strategyName: string
  dailyCalories: string
  proteinTarget: string
  carbsTarget: string
  fatTarget: string
  waterTarget: string
  supplements: string
  meals: DietMealPlan[]
}

type StudentRecord = {
  id: string
  name: string
  avatar: string
  whatsapp: string
  goal: 'Emagrecimento' | 'Hipertrofia' | 'Performance'
  phase: 'Déficit' | 'Superávit' | 'Manutenção'
  plan: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual'
  monthlyRevenue: number
  adherence: number
  checkinAdherence: number
  checkinState: CheckinState
  lastCheckin: string
  checkinNote: string
  lastWorkoutActivity: string
  lastWorkoutTitle: string
  weeklyWorkoutsCompleted: string
  expirationDate: string
  daysToExpire: number
  renewalState: RenewalState
  nonRenewalReason?: string
  /** Months of the last confirmed renewal (3, 6 or 12). */
  renewedMonths?: number
  status: StudentHealth
  weightChange: string
  hasLogin?: boolean
  loginEmail?: string
  accessKey?: string
  accessKeyGeneratedAt?: string
  workoutComments?: WorkoutAppComment[]
  appPhotos?: StudentAppPhoto[]
  liveClinCheckin: LiveClinCheckinData
  appObservations: AppStudentObservation[]
}

type StudentAccessInfo = {
  hasLogin: boolean
  loginEmail?: string
  accessKey?: string
  accessKeyGeneratedAt?: string
}

const defaultAccessByStudentId: Record<string, StudentAccessInfo> = {
  'student-lucas': {
    hasLogin: true,
    loginEmail: 'lucas.andrade@gmail.com',
    accessKey: 'ELVN-4821-LA',
    accessKeyGeneratedAt: 'Ativada no primeiro acesso',
  },
  'student-camila': {
    hasLogin: true,
    loginEmail: 'camila.rocha@outlook.com',
    accessKey: 'ELVN-7390-CR',
    accessKeyGeneratedAt: 'Ativada no primeiro acesso',
  },
  'student-juliana': {
    hasLogin: false,
  },
  'student-pedro': {
    hasLogin: false,
  },
  'student-rafael': {
    hasLogin: true,
    loginEmail: 'rafael.souza@uol.com.br',
    accessKey: 'ELVN-9102-RS',
    accessKeyGeneratedAt: 'Ativada no primeiro acesso',
  },
  'student-aline': {
    hasLogin: true,
    loginEmail: 'aline.moraes@gmail.com',
    accessKey: 'ELVN-6540-AM',
    accessKeyGeneratedAt: 'Ativada no primeiro acesso',
  },
  'student-thiago': {
    hasLogin: true,
    loginEmail: 'thiago.nunes@icloud.com',
    accessKey: 'ELVN-3381-TN',
    accessKeyGeneratedAt: 'Ativada no primeiro acesso',
  },
  'student-gabriel': {
    hasLogin: false,
  },
}

function getStudentAccessInfo(
  student: StudentRecord,
  generatedKeysMap?: Record<string, { key: string; generatedAt: string }>,
): StudentAccessInfo {
  const fallback = defaultAccessByStudentId[student.id] ?? {
    hasLogin: false,
  }
  const hasLogin = typeof student.hasLogin === 'boolean' ? student.hasLogin : fallback.hasLogin
  const loginEmail = student.loginEmail ?? fallback.loginEmail
  const sessionGenerated = generatedKeysMap?.[student.id]
  const accessKey = sessionGenerated
    ? sessionGenerated.key
    : hasLogin
      ? (student.accessKey ?? fallback.accessKey)
      : undefined
  const accessKeyGeneratedAt = sessionGenerated
    ? sessionGenerated.generatedAt
    : hasLogin
      ? (student.accessKeyGeneratedAt ?? fallback.accessKeyGeneratedAt)
      : undefined
  return {
    hasLogin,
    loginEmail: hasLogin ? loginEmail : undefined,
    accessKey,
    accessKeyGeneratedAt,
  }
}

function createFormattedAccessKey(studentName: string): string {
  const parts = studentName.trim().split(/\s+/)
  const initials =
    parts.length >= 2
      ? `${parts[0][0] ?? 'E'}${parts[parts.length - 1][0] ?? 'L'}`.toUpperCase()
      : (parts[0]?.slice(0, 2) || 'EL').toUpperCase()
  const randomDigits = Math.floor(1000 + Math.random() * 9000)
  return `ELVN-${randomDigits}-${initials}`
}

function buildWhatsAppUrl(phone: string, studentName: string) {
  const firstName = studentName.split(' ')[0]
  const text = encodeURIComponent(
    `Olá ${firstName}, tudo bem? Passando aqui pela Elevn para falarmos sobre seu acompanhamento e check-in da semana!`,
  )
  return `https://wa.me/${phone}?text=${text}`
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.82 14.01c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.93-4.36-.14-.19-1.18-1.57-1.18-2.99 0-1.42.74-2.12 1.01-2.41.26-.29.58-.36.77-.36.19 0 .38 0 .55.01.18.01.41-.07.65.49.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.3-.12.58.17.29.75 1.24 1.61 2 .89.79 1.61 1.07 1.92 1.2.24.1.38.08.53-.05.15-.14.62-.72.79-.96.17-.24.34-.19.58-.11.24.08 1.51.71 1.77.84.26.13.43.19.5.3.07.11.07.63-.17 1.31z"
      />
    </svg>
  )
}

function SearchLupIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35"
      />
    </svg>
  )
}

type ExternalPlatformStudent = {
  id: string
  name: string
  avatar: string
  whatsapp: string
  email: string
  goal: StudentRecord['goal']
  phase: StudentRecord['phase']
  plan: StudentRecord['plan']
  mfitWorkoutSummary: string
  webDietSummary: string
}

const externalPlatformCatalog: ExternalPlatformStudent[] = [
  {
    id: 'ext-mariana',
    name: 'Mariana Azevedo',
    avatar: '/people/renata-alves.jpg',
    whatsapp: '5511998441122',
    email: 'mariana.azevedo@gmail.com',
    goal: 'Emagrecimento',
    phase: 'Déficit',
    plan: 'Trimestral',
    mfitWorkoutSummary: 'MFIT: Divisão ABC + Cardio (5x/semana)',
    webDietSummary: 'WebDiet: Déficit 1.850 kcal · 160g Proteína',
  },
  {
    id: 'ext-bruno',
    name: 'Bruno Cavalcanti',
    avatar: '/people/gustavo-lima.jpg',
    whatsapp: '5511997113344',
    email: 'bruno.cavalcanti@outlook.com',
    goal: 'Hipertrofia',
    phase: 'Superávit',
    plan: 'Semestral',
    mfitWorkoutSummary: 'MFIT: Periodização ABCD Força & Hipertrofia',
    webDietSummary: 'WebDiet: Superávit Limpo 2.750 kcal',
  },
  {
    id: 'ext-fernanda',
    name: 'Fernanda Tavares',
    avatar: '/people/paula-nunes.jpg',
    whatsapp: '5511996225588',
    email: 'fernanda.tavares@icloud.com',
    goal: 'Performance',
    phase: 'Manutenção',
    plan: 'Anual',
    mfitWorkoutSummary: 'MFIT: Híbrido Força + Corrida 10km',
    webDietSummary: 'WebDiet: Normocalórica 2.450 kcal',
  },
  {
    id: 'ext-henrique',
    name: 'Henrique Bastos',
    avatar: '/people/breno-monteiro.png',
    whatsapp: '5511995337799',
    email: 'henrique.bastos@gmail.com',
    goal: 'Hipertrofia',
    phase: 'Superávit',
    plan: 'Trimestral',
    mfitWorkoutSummary: 'MFIT: Upper / Lower 4x por semana',
    webDietSummary: 'WebDiet: Superávit 2.680 kcal',
  },
]

const initialStudents: StudentRecord[] = [
  {
    id: 'student-lucas',
    name: 'Lucas Andrade',
    avatar: '/people/gustavo-lima.jpg',
    whatsapp: '5511998123401',
    goal: 'Emagrecimento',
    phase: 'Déficit',
    plan: 'Trimestral',
    monthlyRevenue: 420,
    adherence: 86,
    checkinAdherence: 92,
    checkinState: 'Pendente',
    lastCheckin: 'Hoje, 08:42',
    checkinNote: 'Reduziu 1,1 kg na quinzena e pediu ajuste no lanche da tarde em dias de perna.',
    lastWorkoutActivity: 'Treinou hoje às 07:15',
    lastWorkoutTitle: 'Treino B · Dorsal e Bíceps',
    weeklyWorkoutsCompleted: '5/5 treinos na semana',
    expirationDate: '18 nov',
    daysToExpire: 11,
    renewalState: 'Em dia',
    status: 'Em dia',
    weightChange: '-1,1 kg',
    liveClinCheckin: {
      submittedAt: 'Hoje, 08:42 via LiveClin',
      protocolName: 'Cutting Fase 2 · Ciclo Novembro',
      weightKg: 81.4,
      weightTrend: '-1,1 kg na quinzena',
      offPlanMeals: 1,
      offPlanNote: 'Jantar de sábado com a família.',
      hunger: 'medio',
      waterLiters: 3,
      bowel: 'regulado',
      discomfort: 'raro',
      menuChanges:
        'Gostaria de incluir uma fruta ou aumentar o carboidrato no lanche das 16h30 nos dias de inferiores.',
      strengthSessions: 5,
      performance: 5,
      aerobicSessions: 4,
      sleepHours: 7,
      dedication: 4,
      dedicationNote: 'Dormir um pouco mais cedo nos dias de perna.',
      evolution: 4,
      evolutionNote: 'Cintura mais fina (-2 cm) e mais definição no abdômen.',
      feedback:
        'Semana muito consistente nos treinos. Senti mais fome no fim da tarde apenas nos dias de perna pesada.',
    },
    appObservations: [
      {
        id: 'obs-lucas-1',
        when: 'Hoje, 07:58 (MFIT)',
        category: 'Treino',
        note: 'Subi carga na remada curvada para 35kg cada lado mantendo 10 repetições limpas.',
      },
      {
        id: 'obs-lucas-2',
        when: 'Quinta, 16:40 (WebDiet)',
        category: 'Dieta',
        note: 'Troquei o pão integral por tapioca com ovos antes da reunião externa.',
      },
    ],
  },
  {
    id: 'student-camila',
    name: 'Camila Rocha',
    avatar: '/people/renata-alves.jpg',
    whatsapp: '5511997451290',
    goal: 'Hipertrofia',
    phase: 'Superávit',
    plan: 'Anual',
    monthlyRevenue: 390,
    adherence: 74,
    checkinAdherence: 85,
    checkinState: 'Realizado',
    lastCheckin: 'Hoje, 09:40',
    checkinNote:
      'Bateu 100% dos treinos da semana e relatou melhora no sono após ajuste do jantar.',
    lastWorkoutActivity: 'Treinou hoje às 08:30',
    lastWorkoutTitle: 'Treino C · Glúteos e Posterior',
    weeklyWorkoutsCompleted: '5/5 treinos na semana',
    expirationDate: '12 nov',
    daysToExpire: 5,
    renewalState: 'Recuperado',
    status: 'Atenção',
    weightChange: '+0,6 kg',
    liveClinCheckin: {
      submittedAt: 'Hoje, 09:40 via LiveClin',
      protocolName: 'Bulking Limpo · Fase 3',
      weightKg: 62.8,
      weightTrend: '+0,6 kg no mês',
      offPlanMeals: 0,
      hunger: 'baixo',
      waterLiters: 3,
      bowel: 'regulado',
      discomfort: 'raro',
      menuChanges: 'Manter cardápio atual, apenas variar a opção de fruta no café da manhã.',
      strengthSessions: 5,
      performance: 5,
      aerobicSessions: 3,
      sleepHours: 8,
      dedication: 5,
      evolution: 4,
      evolutionNote: 'Glúteo e posterior mais densos mantendo a linha de cintura.',
      feedback:
        'Treinos renderam demais essa semana! Não marquei todos os checks de refeição no app na quarta e quinta por correria, mas segui a marmita 100%.',
    },
    appObservations: [
      {
        id: 'obs-camila-1',
        when: 'Hoje, 09:15 (MFIT)',
        category: 'Treino',
        note: 'Elevação pélvica fechou com 110kg para 4x10. Ótima ativação!',
      },
      {
        id: 'obs-camila-2',
        when: 'Quarta, 20:10 (WebDiet)',
        category: 'Rotina',
        note: 'Dia intenso de fechamento, não consegui dar check nas refeições mas comi tudo do plano.',
      },
    ],
  },
  {
    id: 'student-juliana',
    name: 'Juliana Costa',
    avatar: '/people/paula-nunes.jpg',
    whatsapp: '5511996338812',
    goal: 'Emagrecimento',
    phase: 'Déficit',
    plan: 'Trimestral',
    monthlyRevenue: 450,
    adherence: 52,
    checkinAdherence: 58,
    checkinState: 'Pendente',
    lastCheckin: 'Ontem, 21:15',
    checkinNote: 'Enviou fotos e relatou dificuldade no fim de semana por viagem a trabalho.',
    lastWorkoutActivity: 'Treinou ontem às 19:20',
    lastWorkoutTitle: 'Treino A · Superiores + HIIT',
    weeklyWorkoutsCompleted: '3/5 treinos na semana',
    expirationDate: '08 nov',
    daysToExpire: 2,
    renewalState: 'Perto de vencer',
    status: 'Em risco',
    weightChange: '-0,3 kg',
    liveClinCheckin: {
      submittedAt: 'Ontem, 21:15 via LiveClin',
      protocolName: 'Recomposição Corporal · Executivo',
      weightKg: 69.2,
      weightTrend: '-0,3 kg',
      offPlanMeals: 3,
      offPlanNote: '3 refeições em restaurante durante a viagem a trabalho.',
      hunger: 'alto',
      waterLiters: 2,
      bowel: 'alternado',
      discomfort: 'as-vezes',
      discomfortNote: 'Leve inchaço e retenção depois do voo, principalmente à noite.',
      menuChanges:
        'Gostaria de opções práticas de lanche proteico para levar na bolsa em semanas de viagem.',
      strengthSessions: 3,
      performance: 3,
      aerobicSessions: 2,
      sleepHours: 6,
      dedication: 2,
      dedicationNote: 'Organizar os lanches antes de viajar.',
      evolution: 4,
      evolutionNote: 'Leve redução de medidas apesar da retenção da viagem.',
      feedback:
        'Viajei de quarta a sexta para congresso. Mesmo sem marcar a dieta, consegui fazer 3 treinos no hotel.',
    },
    appObservations: [
      {
        id: 'obs-juliana-1',
        when: 'Ontem, 19:55 (MFIT)',
        category: 'Treino',
        note: 'Fiz o Treino A adaptado com halteres na academia do hotel + 20 min de esteira inclinada.',
      },
      {
        id: 'obs-juliana-2',
        when: 'Sexta, 13:30 (WebDiet)',
        category: 'Dieta',
        note: 'Almoço no evento: escolhi grelhado com legumes e arroz branco.',
      },
    ],
  },
  {
    id: 'student-pedro',
    name: 'Pedro Lima',
    avatar: '/people/breno-monteiro.png',
    whatsapp: '5511995027741',
    goal: 'Hipertrofia',
    phase: 'Superávit',
    plan: 'Semestral',
    monthlyRevenue: 410,
    adherence: 63,
    checkinAdherence: 70,
    checkinState: 'Atrasado',
    lastCheckin: 'Há 4 dias',
    checkinNote: 'Aguardando envio das fotos comparativas e confirmação da renovação.',
    lastWorkoutActivity: 'Treinou há 3 dias (Seg, 18:10)',
    lastWorkoutTitle: 'Treino A · Peito, Ombro e Tríceps',
    weeklyWorkoutsCompleted: '2/5 treinos na semana',
    expirationDate: '06 nov',
    daysToExpire: 1,
    renewalState: 'Perto de vencer',
    status: 'Em risco',
    weightChange: '+0,4 kg',
    liveClinCheckin: {
      submittedAt: 'Pendente há 11 dias',
      protocolName: 'Hipertrofia Intermediário · Fase 2',
      weightKg: 79.0,
      weightTrend: '+0,4 kg',
      offPlanMeals: 2,
      offPlanNote: 'Lanches na faculdade à noite.',
      hunger: 'medio',
      waterLiters: 3,
      bowel: 'regulado',
      discomfort: 'raro',
      menuChanges: 'Refeições mais rápidas para o horário noturno.',
      strengthSessions: 2,
      performance: 3,
      aerobicSessions: 1,
      sleepHours: 6,
      dedication: 2,
      dedicationNote: 'Semana corrida na pós-graduação; preciso encaixar os treinos.',
      evolution: 3,
      evolutionNote: 'Estável nesta quinzena.',
      feedback: 'Semana de provas na pós. Treinei só segunda e terça.',
    },
    appObservations: [
      {
        id: 'obs-pedro-1',
        when: 'Segunda, 19:02 (MFIT)',
        category: 'Treino',
        note: 'Supino inclinado com halteres concluído. Semana corrida com provas da pós.',
      },
    ],
  },
  {
    id: 'student-rafael',
    name: 'Rafael Souza',
    avatar: '/people/gustavo-lima.jpg',
    whatsapp: '5511994189920',
    goal: 'Performance',
    phase: 'Manutenção',
    plan: 'Semestral',
    monthlyRevenue: 480,
    adherence: 93,
    checkinAdherence: 96,
    checkinState: 'Realizado',
    lastCheckin: 'Hoje, 06:30',
    checkinNote: 'PR no agachamento e excelente recuperação entre sessões de corrida e força.',
    lastWorkoutActivity: 'Treinou hoje às 06:00',
    lastWorkoutTitle: 'Treino Força + Rodagem 8km',
    weeklyWorkoutsCompleted: '6/6 treinos na semana',
    expirationDate: '22 nov',
    daysToExpire: 15,
    renewalState: 'Em dia',
    status: 'Em dia',
    weightChange: 'Estável',
    liveClinCheckin: {
      submittedAt: 'Hoje, 06:30 via LiveClin',
      protocolName: 'Híbrido Força & Meia Maratona',
      weightKg: 75.2,
      weightTrend: 'estável na meta',
      offPlanMeals: 0,
      hunger: 'medio',
      waterLiters: 4,
      bowel: 'regulado',
      discomfort: 'raro',
      menuChanges: 'Não precisa alterar o cardápio, está perfeito para a rotina.',
      strengthSessions: 4,
      performance: 5,
      aerobicSessions: 3,
      sleepHours: 8,
      dedication: 5,
      evolution: 5,
      evolutionNote: 'Musculatura mais seca e melhor rendimento cardiovascular.',
      feedback:
        'Semana excelente! Bati meu PR no agachamento e mantive pace 4:35 nos tiros de quinta sem fadiga residual.',
    },
    appObservations: [
      {
        id: 'obs-rafael-1',
        when: 'Hoje, 06:15 (MFIT)',
        category: 'Treino',
        note: 'Finalizei o treino de força inferior em 48 min. Sensação de esforço 8/10.',
      },
    ],
  },
  {
    id: 'student-aline',
    name: 'Aline Moraes',
    avatar: '/people/renata-alves.jpg',
    whatsapp: '5511993114509',
    goal: 'Emagrecimento',
    phase: 'Déficit',
    plan: 'Trimestral',
    monthlyRevenue: 420,
    adherence: 94,
    checkinAdherence: 95,
    checkinState: 'Realizado',
    lastCheckin: 'Hoje, 10:05',
    checkinNote: 'Redução de 4 cm de cintura nas últimas 3 semanas com alta adesão alimentar.',
    lastWorkoutActivity: 'Treinou hoje às 09:10',
    lastWorkoutTitle: 'Treino B · Inferiores Foco Quadríceps',
    weeklyWorkoutsCompleted: '5/5 treinos na semana',
    expirationDate: '03 dez',
    daysToExpire: 26,
    renewalState: 'Em dia',
    status: 'Em dia',
    weightChange: '-1,8 kg',
    liveClinCheckin: {
      submittedAt: 'Hoje, 10:05 via LiveClin',
      protocolName: 'Definição Feminina · Fase 2',
      weightKg: 60.4,
      weightTrend: '-1,8 kg em 21 dias',
      offPlanMeals: 1,
      offPlanNote: 'Refeição livre planejada no domingo.',
      hunger: 'baixo',
      waterLiters: 3,
      bowel: 'regulado',
      discomfort: 'raro',
      menuChanges: 'Gostaria de incluir opção de panqueca de banana no pré-treino.',
      strengthSessions: 5,
      performance: 5,
      aerobicSessions: 4,
      sleepHours: 8,
      dedication: 5,
      evolution: 5,
      evolutionNote: '-4 cm de cintura e roupas mais folgadas.',
      feedback:
        'Estou muito feliz com o resultado no espelho e nas roupas! O treino novo encaixou perfeitamente no meu horário de almoço.',
    },
    appObservations: [
      {
        id: 'obs-aline-1',
        when: 'Hoje, 09:50 (MFIT)',
        category: 'Treino',
        note: 'Leg press 45° concluído com +10kg em relação à semana passada.',
      },
    ],
  },
  {
    id: 'student-thiago',
    name: 'Thiago Nunes',
    avatar: '/people/gustavo-lima.jpg',
    whatsapp: '5511992083317',
    goal: 'Hipertrofia',
    phase: 'Superávit',
    plan: 'Trimestral',
    monthlyRevenue: 420,
    adherence: 58,
    checkinAdherence: 64,
    checkinState: 'Pendente',
    lastCheckin: 'Há 2 dias',
    checkinNote: 'Pediu revisão do treino B por desconforto leve no ombro direito.',
    lastWorkoutActivity: 'Treinou ontem às 20:15',
    lastWorkoutTitle: 'Treino C · Pernas Completo',
    weeklyWorkoutsCompleted: '4/5 treinos na semana',
    expirationDate: '10 nov',
    daysToExpire: 4,
    renewalState: 'Perto de vencer',
    status: 'Em risco',
    weightChange: '+0,2 kg',
    liveClinCheckin: {
      submittedAt: 'Há 2 dias via LiveClin',
      protocolName: 'Hipertrofia · Ajuste Articular',
      weightKg: 84.1,
      weightTrend: '+0,2 kg',
      offPlanMeals: 2,
      offPlanNote: 'Pizza no sábado e um lanche fora na quarta.',
      hunger: 'medio',
      waterLiters: 3,
      bowel: 'regulado',
      discomfort: 'raro',
      menuChanges: 'Substituir batata-doce do almoço por macarrão ou mandioca.',
      strengthSessions: 4,
      performance: 4,
      aerobicSessions: 2,
      sleepHours: 7,
      dedication: 4,
      dedicationNote: 'Fazer o cardio que ficou faltando.',
      evolution: 4,
      evolutionNote: 'Ganho de volume em dorsal e quadríceps.',
      feedback:
        'Continuei treinando firme (fiz 4 treinos na semana). Só gostaria de trocar o desenvolvimento militar com barra por halter pegada neutra: senti leve incômodo no ombro direito.',
    },
    appObservations: [
      {
        id: 'obs-thiago-1',
        when: 'Ontem, 21:05 (MFIT)',
        category: 'Treino',
        note: 'Treino de pernas 100% feito! No treino de amanhã vou usar pegada neutra para poupar o ombro.',
      },
    ],
  },
  {
    id: 'student-gabriel',
    name: 'Gabriel Torres',
    avatar: '/people/breno-monteiro.png',
    whatsapp: '5511991556082',
    goal: 'Emagrecimento',
    phase: 'Déficit',
    plan: 'Trimestral',
    monthlyRevenue: 390,
    adherence: 61,
    checkinAdherence: 68,
    checkinState: 'Realizado',
    lastCheckin: 'Há 3 dias',
    checkinNote: 'Encerrou ciclo trimestral e informou pausa temporária.',
    lastWorkoutActivity: 'Treinou há 5 dias',
    lastWorkoutTitle: 'Treino Full Body',
    weeklyWorkoutsCompleted: '2/4 treinos na semana',
    expirationDate: '02 nov',
    daysToExpire: 0,
    renewalState: 'Não renovou',
    nonRenewalReason: 'Pausa financeira temporária; pediu para retomar contato em janeiro.',
    status: 'Atenção',
    weightChange: '-3,4 kg no ciclo',
    liveClinCheckin: {
      submittedAt: 'Há 3 dias via LiveClin',
      protocolName: 'Fechamento de Ciclo Trimestral',
      weightKg: 86.2,
      weightTrend: '-3,4 kg no trimestre',
      offPlanMeals: 2,
      offPlanNote: 'Dois almoços de trabalho.',
      hunger: 'medio',
      waterLiters: 3,
      bowel: 'regulado',
      discomfort: 'raro',
      menuChanges: 'Gostaria de um guia de manutenção para os próximos 60 dias.',
      strengthSessions: 3,
      performance: 4,
      aerobicSessions: 2,
      sleepHours: 7,
      dedication: 4,
      evolution: 5,
      evolutionNote: 'Perdi 3,4 kg e 5 cm de abdômen no ciclo.',
      feedback:
        'Gostei muito do acompanhamento e perdi mais de 3 kg, mas vou precisar pausar 2 meses por reforma de apartamento. Volto em janeiro!',
    },
    appObservations: [
      {
        id: 'obs-gabriel-1',
        when: 'Há 5 dias (MFIT)',
        category: 'Rotina',
        note: 'Agradeço demais o suporte da equipe! Em janeiro estou de volta.',
      },
    ],
  },
]

/** Lightweight list for the shell (command palette, nav counter). */
export const studentDirectory = initialStudents.map((student) => ({
  id: student.id,
  name: student.name,
  avatar: student.avatar,
  goal: student.goal,
  plan: student.plan,
  checkinState: student.checkinState,
  status: student.status,
  expirationDate: student.expirationDate,
}))

type QuickFilter =
  | 'todos'
  | 'pendentes'
  | 'atrasados'
  | 'realizados'
  | 'vencendo'
  | 'recuperados'
  | 'nao-renovaram'
  | 'sem-login'

type StatusKey = Exclude<QuickFilter, 'todos'>

type StudentView = {
  id: string
  name: string
  statuses: StatusKey[]
  goal: string
  search: string
  builtIn?: boolean
}

/** Saved views shown as tabs above the roster. The user can add their own. */
const builtInStudentViews: StudentView[] = [
  { id: 'todos', name: 'Todos', statuses: [], goal: 'Todos', search: '', builtIn: true },
  {
    id: 'atencao',
    name: 'Precisa de atenção',
    statuses: ['pendentes', 'atrasados', 'vencendo'],
    goal: 'Todos',
    search: '',
    builtIn: true,
  },
  {
    id: 'vencendo',
    name: 'Vencendo',
    statuses: ['vencendo'],
    goal: 'Todos',
    search: '',
    builtIn: true,
  },
  {
    id: 'sem-login',
    name: 'Sem login',
    statuses: ['sem-login'],
    goal: 'Todos',
    search: '',
    builtIn: true,
  },
]
const STUDENT_VIEWS_KEY = 'elevn-student-views'

const checkinTone: Record<CheckinState, BadgeTone> = {
  Pendente: 'warning',
  Atrasado: 'danger',
  Realizado: 'success',
}
const renewalTone: Record<RenewalState, BadgeTone> = {
  'Em dia': 'neutral',
  'Perto de vencer': 'warning',
  Recuperado: 'success',
  'Não renovou': 'danger',
}

function getLiveClinAnswers(student: StudentRecord): LiveClinCheckinData {
  return (
    student.liveClinCheckin ??
    initialStudents.find((item) => item.id === student.id)?.liveClinCheckin ??
    initialStudents[0].liveClinCheckin
  )
}

const defaultWorkoutCommentsByStudentId: Record<string, WorkoutAppComment[]> = {
  'student-lucas': [
    {
      workoutCode: 'Treino A',
      workoutTitle: 'Peito, Ombro e Tríceps',
      sentAt: 'Segunda, 08:10 (App MFIT)',
      comment:
        'Supino inclinado rendeu muito bem com 30kg/lado. Senti ótimo pump de ombro no bi-set final.',
    },
    {
      workoutCode: 'Treino B',
      workoutTitle: 'Dorsal e Bíceps',
      sentAt: 'Hoje, 07:58 (App MFIT)',
      comment:
        'Subi carga na remada curvada para 35kg cada lado mantendo 10 repetições limpas e sem roubar.',
    },
    {
      workoutCode: 'Treino C',
      workoutTitle: 'Membros Inferiores Completo',
      sentAt: 'Quarta, 08:05 (App MFIT)',
      comment:
        'Treino de perna foi bem puxado! Saí com bastante fome no fim da tarde após o leg press.',
    },
  ],
  'student-camila': [
    {
      workoutCode: 'Treino A',
      workoutTitle: 'Superiores & Core',
      sentAt: 'Segunda, 09:20 (App MFIT)',
      comment:
        'Puxada frontal e desenvolvimento com halteres concluídos sem desconforto e com boa postura.',
    },
    {
      workoutCode: 'Treino B',
      workoutTitle: 'Inferiores Foco Quadríceps',
      sentAt: 'Quarta, 09:10 (App MFIT)',
      comment:
        'Agachamento no hack e cadeira extensora com drop-set queimaram demais, mantive os intervalos de 60s.',
    },
    {
      workoutCode: 'Treino C',
      workoutTitle: 'Glúteos e Posterior',
      sentAt: 'Hoje, 09:15 (App MFIT)',
      comment:
        'Elevação pélvica fechou com 110kg para 4x10 com 2s de isometria no topo. Ótima ativação!',
    },
  ],
  'student-juliana': [
    {
      workoutCode: 'Treino A',
      workoutTitle: 'Superiores + HIIT',
      sentAt: 'Ontem, 19:55 (App MFIT)',
      comment:
        'Fiz o Treino A adaptado com halteres na academia do hotel + 20 min de esteira inclinada.',
    },
    {
      workoutCode: 'Treino B',
      workoutTitle: 'Dorsal, Ombro Posterior & Abdômen',
      sentAt: 'Terça, 19:10 (App MFIT)',
      comment:
        'Consegui fazer todas as séries de remada e puxada antes de viajar, ritmo excelente.',
    },
    {
      workoutCode: 'Treino C',
      workoutTitle: 'Inferiores Completo',
      sentAt: 'Sábado, 11:00 (App MFIT)',
      comment:
        'Afundo búlgaro exigiu bastante equilíbrio, mas fechei as 3 séries de 10 repetições por perna.',
    },
  ],
  'student-pedro': [
    {
      workoutCode: 'Treino A',
      workoutTitle: 'Peito, Ombro e Tríceps',
      sentAt: 'Segunda, 19:02 (App MFIT)',
      comment:
        'Supino inclinado com halteres concluído. Semana corrida com provas da pós, mas mantive a carga.',
    },
    {
      workoutCode: 'Treino B',
      workoutTitle: 'Dorsal e Bíceps',
      sentAt: 'Terça, 19:40 (App MFIT)',
      comment:
        'Puxada aberta e remada cavalinho feitas em 45 minutos para conseguir estudar à noite.',
    },
    {
      workoutCode: 'Treino C',
      workoutTitle: 'Pernas Completo',
      sentAt: 'Sexta passada, 18:50 (App MFIT)',
      comment: 'Leg press e mesa flexora ok; senti o posterior bem trabalhado no stiff com barra.',
    },
  ],
  'student-rafael': [
    {
      workoutCode: 'Treino A',
      workoutTitle: 'Força Inferior & Core',
      sentAt: 'Hoje, 06:15 (App MFIT)',
      comment:
        'Finalizei o treino de força inferior em 48 min. Bati meu PR no agachamento livre com RPE 8!',
    },
    {
      workoutCode: 'Treino B',
      workoutTitle: 'Força Superior & Mobilidade',
      sentAt: 'Quarta, 06:20 (App MFIT)',
      comment:
        'Barra fixa com +10kg no cinto saiu limpa nas 4 séries. Zero fadiga para a corrida de quinta.',
    },
    {
      workoutCode: 'Treino C',
      workoutTitle: 'Potência, Unilaterais & Preventivo',
      sentAt: 'Sexta, 06:10 (App MFIT)',
      comment:
        ' Panturrilha, tibial e RDL concluídos sem dor muscular tardia antes do longão de 14km.',
    },
  ],
  'student-aline': [
    {
      workoutCode: 'Treino A',
      workoutTitle: 'Superiores & Cintura Escapular',
      sentAt: 'Segunda, 12:50 (App MFIT)',
      comment:
        'Treino encaixou certinho no horário de almoço (42 min). Aumentei 2kg na elevação lateral.',
    },
    {
      workoutCode: 'Treino B',
      workoutTitle: 'Inferiores Foco Quadríceps',
      sentAt: 'Hoje, 09:50 (App MFIT)',
      comment: 'Leg press 45° concluído com +10kg em relação à semana passada e ótima amplitude.',
    },
    {
      workoutCode: 'Treino C',
      workoutTitle: 'Glúteos, Posterior & Escada',
      sentAt: 'Quinta, 12:55 (App MFIT)',
      comment:
        'Stiff e elevação pélvica renderam super bem + 25 min de escada ergométrica sem parar.',
    },
  ],
  'student-thiago': [
    {
      workoutCode: 'Treino A',
      workoutTitle: 'Peito, Ombro e Tríceps',
      sentAt: 'Segunda, 20:30 (App MFIT)',
      comment:
        'Senti leve incômodo no ombro direito no desenvolvimento com barra; com halter pegada neutra ficou 100%.',
    },
    {
      workoutCode: 'Treino B',
      workoutTitle: 'Dorsal, Trapézio e Bíceps',
      sentAt: 'Quarta, 20:45 (App MFIT)',
      comment: 'Treino de costas excelente! Remada serrote com 38kg e ótimo controle na descida.',
    },
    {
      workoutCode: 'Treino C',
      workoutTitle: 'Pernas Completo',
      sentAt: 'Ontem, 21:05 (App MFIT)',
      comment:
        'Treino de pernas 100% feito! Agachamento hack e mesa flexora com carga máxima da quinzena.',
    },
  ],
  'student-gabriel': [
    {
      workoutCode: 'Treino A',
      workoutTitle: 'Superiores Completo',
      sentAt: 'Há 6 dias (App MFIT)',
      comment: 'Treino de manutenção de superiores concluído em 45 minutos.',
    },
    {
      workoutCode: 'Treino B',
      workoutTitle: 'Inferiores & Core',
      sentAt: 'Há 5 dias (App MFIT)',
      comment: 'Mantive as cargas no leg press e agachamento para preservar massa magra.',
    },
    {
      workoutCode: 'Treino C',
      workoutTitle: 'Full Body Metabólico',
      sentAt: 'Há 4 dias (App MFIT)',
      comment: 'Última sessão do ciclo antes da pausa; vou manter 3x por semana até janeiro.',
    },
  ],
}

function getStudentWorkoutComments(student: StudentRecord): WorkoutAppComment[] {
  if (student.workoutComments && student.workoutComments.length === 3) {
    return student.workoutComments
  }
  return (
    defaultWorkoutCommentsByStudentId[student.id] ?? [
      {
        workoutCode: 'Treino A',
        workoutTitle: 'Empurrar · Peito, Ombros e Tríceps',
        sentAt: 'Segunda (App MFIT)',
        comment:
          'Boa adaptação às cargas iniciais no supino inclinado e desenvolvimento com halteres.',
      },
      {
        workoutCode: 'Treino B',
        workoutTitle: 'Puxar · Dorsal e Bíceps',
        sentAt: 'Quarta (App MFIT)',
        comment: 'Execução controlada na puxada frontal e remada curvada, mantendo intervalos.',
      },
      {
        workoutCode: 'Treino C',
        workoutTitle: 'Membros Inferiores Completo',
        sentAt: 'Sexta (App MFIT)',
        comment: 'Treino de pernas finalizado com ótima percepção de esforço no leg press 45°.',
      },
    ]
  )
}

function getStudentWorkoutPlan(student: StudentRecord): StudentWorkoutPlan {
  const comments = getStudentWorkoutComments(student)
  const commentA = comments.find((c) => c.workoutCode === 'Treino A') ?? comments[0]
  const commentB = comments.find((c) => c.workoutCode === 'Treino B') ?? comments[1]
  const commentC = comments.find((c) => c.workoutCode === 'Treino C') ?? comments[2]

  if (student.goal === 'Hipertrofia') {
    return {
      splitName: `Periodização ABCD · Hipertrofia (${student.phase})`,
      frequency: '5 sessões de musculação + 3 sessões de cardio leve por semana',
      cardioPrescription:
        '25 min de bike ergométrica ou caminhada inclinada (125–135 bpm) pós-treino',
      technicalGuideline:
        'Cadência controlada 2010 nos compostos; manter 1 a 2 repetições na reserva (RIR 1–2) e progredir carga quando atingir o topo da faixa.',
      sessions: [
        {
          code: 'Treino A',
          title: 'Peito, Ombro Anterior & Tríceps',
          schedule: 'Segunda e Quinta',
          studentAppComment: commentA.comment,
          commentSentAt: commentA.sentAt,
          exercises: [
            {
              name: 'Supino Inclinado com Halteres',
              sets: '4 × 8–10 reps',
              rest: '90s',
              loadNote: '32 kg/lado · ótima estabilidade',
            },
            {
              name: 'Supino Reto Máquina Articulada',
              sets: '3 × 10–12 reps',
              rest: '75s',
              loadNote: '80 kg totais · pico de contração 1s',
            },
            {
              name: 'Desenvolvimento Neutro com Halteres',
              sets: '4 × 8–10 reps',
              rest: '90s',
              loadNote: 'Pegada neutra confortável para o ombro',
            },
            {
              name: 'Elevação Lateral na Polia Baixa',
              sets: '4 × 12–15 reps',
              rest: '60s',
              loadNote: 'Controle excêntrico de 3 segundos',
            },
            {
              name: 'Tríceps Corda no Pulley + Francês Unilateral',
              sets: '4 × 10–12 reps',
              rest: '60s',
              loadNote: 'Extensão completa sem mover cotovelos',
            },
          ],
        },
        {
          code: 'Treino B',
          title: 'Dorsal, Trapézio & Bíceps',
          schedule: 'Terça e Sexta',
          studentAppComment: commentB.comment,
          commentSentAt: commentB.sentAt,
          exercises: [
            {
              name: 'Puxada Frontal Aberta Pronada',
              sets: '4 × 8–10 reps',
              rest: '90s',
              loadNote: 'Depressão escapular antes de puxar',
            },
            {
              name: 'Remada Curvada / Cavalinho Apoio no Peito',
              sets: '4 × 8–10 reps',
              rest: '90s',
              loadNote: 'Progressão de carga registrada nesta semana',
            },
            {
              name: 'Remada Unilateral com Halter (Serrote)',
              sets: '3 × 10–12 reps',
              rest: '75s',
              loadNote: 'Alongamento máximo na fase excêntrica',
            },
            {
              name: 'Crucifixo Inverso na Máquina (Deltoide Posterior)',
              sets: '3 × 12–15 reps',
              rest: '60s',
              loadNote: 'Foco em posterior de ombro',
            },
            {
              name: 'Rosca Direta Barra W + Rosca Martelo',
              sets: '4 × 10–12 reps',
              rest: '60s',
              loadNote: 'Sem balanço de tronco',
            },
          ],
        },
        {
          code: 'Treino C',
          title: 'Membros Inferiores Completo (Quadríceps, Posterior & Glúteos)',
          schedule: 'Quarta e Sábado',
          studentAppComment: commentC.comment,
          commentSentAt: commentC.sentAt,
          exercises: [
            {
              name: 'Agachamento Livre ou Hack Machine',
              sets: '4 × 8–10 reps',
              rest: '120s',
              loadNote: 'Amplitude completa com controle lombar',
            },
            {
              name: 'Elevação Pélvica com Barra',
              sets: '4 × 10–12 reps',
              rest: '90s',
              loadNote: '110 kg · 2s de isometria no topo',
            },
            {
              name: 'Leg Press 45°',
              sets: '4 × 10–12 reps',
              rest: '90s',
              loadNote: '+10 kg na última sessão sem perder padrão',
            },
            {
              name: 'Mesa Flexora + Stiff com Barra',
              sets: '4 × 10–12 reps',
              rest: '75s',
              loadNote: 'Alongamento de isquiotibiais controlado',
            },
            {
              name: 'Cadeira Extensora + Panturrilha em Pé',
              sets: '4 × 12–15 reps',
              rest: '60s',
              loadNote: 'Falha concêntrica na última série',
            },
          ],
        },
      ],
    }
  }

  if (student.goal === 'Performance') {
    return {
      splitName: 'Protocolo Híbrido · Força Específica & Corrida (Meia Maratona)',
      frequency: '4 sessões de força + 3 sessões de corrida periodizada por semana',
      cardioPrescription:
        'Terça: Tiros 6×1km (pace 4:35) · Quinta: Tempo Run 8km · Sábado: Longão 14km (Z2)',
      technicalGuideline:
        'Priorizar velocidade de barra nos levantamentos básicos e manter RIR 2 para evitar fadiga residual nas sessões de pista.',
      sessions: [
        {
          code: 'Treino A',
          title: 'Força Inferior & Estabilidade de Core',
          schedule: 'Segunda e Quinta',
          studentAppComment: commentA.comment,
          commentSentAt: commentA.sentAt,
          exercises: [
            {
              name: 'Agachamento Livre Barra Alta',
              sets: '4 × 5 reps',
              rest: '120s',
              loadNote: 'PR batido nesta semana · RPE 8',
            },
            {
              name: 'Levantamento Terra Romeno (RDL)',
              sets: '4 × 6–8 reps',
              rest: '90s',
              loadNote: 'Potência na subida e controle excêntrico',
            },
            {
              name: 'Afundo Búlgaro com Halteres',
              sets: '3 × 8 reps/perna',
              rest: '75s',
              loadNote: 'Estabilidade de quadril e tornozelo',
            },
            {
              name: 'Panturrilha Sóleo Sentado + Tibial Anterior',
              sets: '4 × 15 reps',
              rest: '60s',
              loadNote: 'Prevenção de canelite e potência elástica',
            },
            {
              name: 'Prancha RKC + Pallof Press no Cabo',
              sets: '3 × 40s',
              rest: '45s',
              loadNote: 'Transferência direta para economia de corrida',
            },
          ],
        },
        {
          code: 'Treino B',
          title: 'Força Superior & Mobilidade Torácica',
          schedule: 'Quarta e Sexta',
          studentAppComment: commentB.comment,
          commentSentAt: commentB.sentAt,
          exercises: [
            {
              name: 'Supino Reto com Halteres',
              sets: '4 × 6–8 reps',
              rest: '90s',
              loadNote: 'Execução explosiva na concêntrica',
            },
            {
              name: 'Barra Fixa Pronada (Pull-ups)',
              sets: '4 × 8–10 reps',
              rest: '90s',
              loadNote: 'Peso corporal + 10 kg no cinto',
            },
            {
              name: 'Desenvolvimento Landmine Unilateral',
              sets: '3 × 8–10 reps',
              rest: '75s',
              loadNote: 'Integração escapular e core',
            },
            {
              name: 'Remada Baixa Triângulo + Face Pull',
              sets: '3 × 12 reps',
              rest: '60s',
              loadNote: 'Postura torácica para corrida longa',
            },
          ],
        },
        {
          code: 'Treino C',
          title: 'Potência Unilateral, Core & Preventivo de Corrida',
          schedule: 'Sexta e Sábado',
          studentAppComment: commentC.comment,
          commentSentAt: commentC.sentAt,
          exercises: [
            {
              name: 'Agachamento Búlgaro Explosivo com Halteres',
              sets: '3 × 8 reps/perna',
              rest: '75s',
              loadNote: 'Estabilidade de quadril para corrida',
            },
            {
              name: 'Stiff Unilateral + Panturrilha no Degrau',
              sets: '4 × 12 reps',
              rest: '60s',
              loadNote: 'Prevenção de tendinopatia de Aquiles',
            },
            {
              name: 'Prancha Lateral Dinâmica + Dead Bug',
              sets: '3 × 45s',
              rest: '45s',
              loadNote: 'Controle pélvico em fadiga',
            },
          ],
        },
      ],
    }
  }

  return {
    splitName: `Divisão ABC + Cardio Metabólico · ${student.goal} (${student.phase})`,
    frequency: '5 sessões de musculação + 4 sessões de cardio estruturado por semana',
    cardioPrescription:
      '30 min de esteira inclinada (inclin. 10–12% · 5,4 km/h) ou escada ergométrica pós-treino',
    technicalGuideline:
      'Manter densidade alta de treino respeitando os intervalos de descanso para otimizar gasto energético e preservação de massa magra.',
    sessions: [
      {
        code: 'Treino A',
        title: 'Empurrar · Peito, Ombros, Tríceps & Core',
        schedule: 'Segunda e Quinta',
        studentAppComment: commentA.comment,
        commentSentAt: commentA.sentAt,
        exercises: [
          {
            name: 'Supino Inclinado com Halteres',
            sets: '4 × 10–12 reps',
            rest: '75s',
            loadNote: 'Carga firme mantendo amplitude máxima',
          },
          {
            name: 'Crucifixo Máquina (Peck Deck)',
            sets: '3 × 12–15 reps',
            rest: '60s',
            loadNote: 'Segurar 1s no pico de contração',
          },
          {
            name: 'Desenvolvimento com Halteres + Elevação Lateral',
            sets: '4 × 10 + 12 reps',
            rest: '75s',
            loadNote: 'Bi-set metabólico para deltoides',
          },
          {
            name: 'Tríceps Pulley Barra Reta',
            sets: '3 × 12–15 reps',
            rest: '60s',
            loadNote: 'Cotovelos fixos ao lado do tronco',
          },
          {
            name: 'Abdominal Infra Paralela + Prancha Isométrica',
            sets: '4 × 15 reps + 45s',
            rest: '45s',
            loadNote: 'Ativação de transverso abdominal',
          },
        ],
      },
      {
        code: 'Treino B',
        title: 'Puxar · Dorsal, Posterior de Ombro & Bíceps',
        schedule: 'Terça e Sexta',
        studentAppComment: commentB.comment,
        commentSentAt: commentB.sentAt,
        exercises: [
          {
            name: 'Remada Curvada Pronada com Barra',
            sets: '4 × 8–10 reps',
            rest: '90s',
            loadNote: '35 kg/lado · 10 repetições limpas',
          },
          {
            name: 'Puxada Alta Pegada Neutra (Triângulo)',
            sets: '4 × 10–12 reps',
            rest: '75s',
            loadNote: 'Alongar bem dorsal no topo',
          },
          {
            name: 'Pulldown com Corda na Polia Alta',
            sets: '3 × 12–15 reps',
            rest: '60s',
            loadNote: 'Conexão mente-músculo constante',
          },
          {
            name: 'Rosca Alternada Banco 45° + Rosca Martelo',
            sets: '3 × 10–12 reps',
            rest: '60s',
            loadNote: 'Controle total da descida',
          },
        ],
      },
      {
        code: 'Treino C',
        title: 'Membros Inferiores · Quadríceps, Posterior & Glúteos',
        schedule: 'Quarta e Sábado',
        studentAppComment: commentC.comment,
        commentSentAt: commentC.sentAt,
        exercises: [
          {
            name: 'Leg Press 45° Amplitude Completa',
            sets: '4 × 10–12 reps',
            rest: '90s',
            loadNote: 'Subiu +10 kg nesta semana',
          },
          {
            name: 'Agachamento Búlgaro ou Passada com Halteres',
            sets: '3 × 10 reps/perna',
            rest: '90s',
            loadNote: 'Foco em glúteo e estabilidade de joelho',
          },
          {
            name: 'Cadeira Extensora com Drop-set na Última',
            sets: '4 × 12–15 reps',
            rest: '60s',
            loadNote: '1s de contração no topo',
          },
          {
            name: 'Mesa Flexora + Stiff com Halteres',
            sets: '4 × 10–12 reps',
            rest: '75s',
            loadNote: 'Coluna neutra e posterior alongado',
          },
          {
            name: 'Panturrilha no Leg Press',
            sets: '4 × 15–20 reps',
            rest: '45s',
            loadNote: 'Pausa de 2s no alongamento',
          },
        ],
      },
    ],
  }
}

function getStudentDietPlan(student: StudentRecord): StudentDietPlan {
  if (student.phase === 'Superávit') {
    return {
      strategyName: `Superávit Limpo Controlado · ${student.goal}`,
      dailyCalories: '2.680 kcal / dia (2.850 kcal nos dias de membros inferiores)',
      proteinTarget: '175 g / dia (2,1 g/kg)',
      carbsTarget: '345 g / dia (4,2 g/kg)',
      fatTarget: '66 g / dia (0,8 g/kg)',
      waterTarget: '3,2 L a 3,5 L de água por dia',
      supplements: 'Creatina 5g/dia · Whey Concentrado 30g · Beta-Alanina 3g · Ômega-3 2g',
      meals: [
        {
          time: '07:30',
          title: 'Refeição 1 · Café da Manhã',
          macros: '540 kcal · 36g P · 64g C · 14g G',
          items: [
            '3 ovos inteiros mexidos + 2 claras',
            '2 fatias de pão de fermentação natural (80g) ou 60g de tapioca',
            '1 banana prata amassada com 30g de aveia em flocos e canela',
            'Café preto sem açúcar + 150g de mamão ou morangos',
          ],
          substitutions:
            'Pode substituir o pão por 120g de cuscuz de milho hidratado ou panqueca de banana com aveia.',
        },
        {
          time: '12:30',
          title: 'Refeição 2 · Almoço',
          macros: '720 kcal · 48g P · 92g C · 16g G',
          items: [
            '160g de peito de frango grelhado ou patinho moído (pesado pronto)',
            '220g de arroz branco ou integral + 100g de feijão carioca',
            'Salada crua à vontade + 120g de legumes no vapor (brócolis e cenoura)',
            '1 colher de sopa de azeite de oliva extravirgem (10 ml)',
          ],
          substitutions:
            'Pode substituir o arroz por 240g de macarrão grano duro ou 260g de batata-inglesa/mandioca.',
        },
        {
          time: '16:30',
          title: 'Refeição 3 · Lanche da Tarde / Pré-Treino',
          macros: '490 kcal · 32g P · 68g C · 10g G',
          items: [
            '170g de iogurte natural desnatado + 30g de Whey Protein',
            '45g de granola sem açúcar ou 50g de aveia em flocos',
            '1 maçã média ou 140g de uva sem semente + 15g de pasta de amendoim',
          ],
          substitutions:
            'Em dias de rotina externa: sanduíche com 2 fatias de pão integral + 120g de frango desfiado + 1 fruta.',
        },
        {
          time: '19:30',
          title: 'Refeição 4 · Pós-Treino Imediato',
          macros: '360 kcal · 28g P · 58g C · 2g G',
          items: [
            '30g de Whey Protein em água + 5g de Creatina monohidratada',
            '1 banana nanica grande + 20g de doce de leite ou mel',
          ],
          substitutions: 'Pode unir ao jantar quando treinar próximo das 20h.',
        },
        {
          time: '21:00',
          title: 'Refeição 5 · Jantar (Sem Lactose)',
          macros: '570 kcal · 44g P · 63g C · 14g G',
          items: [
            '160g de tilápia assada, salmão ou filé de frango grelhado',
            '200g de purê de batata-inglesa ou arroz jasmine',
            'Mix de folhas verdes, abobrinha grelhada e tomate-cereja + 8 ml de azeite',
          ],
          substitutions:
            'Pode substituir o peixe por 150g de mignon suíno ou carne magra grelhada.',
        },
      ],
    }
  }

  if (student.phase === 'Manutenção') {
    return {
      strategyName: `Manutenção Normocalórica & Performance Híbrida · ${student.goal}`,
      dailyCalories: '2.550 kcal / dia (ajuste de +300 kcal nos sábados de corrida longa)',
      proteinTarget: '165 g / dia (2,2 g/kg)',
      carbsTarget: '330 g / dia (4,4 g/kg)',
      fatTarget: '62 g / dia (0,8 g/kg)',
      waterTarget: '4,0 L de água por dia + eletrólitos nos treinos >60 min',
      supplements:
        'Creatina 5g/dia · Gel de Carboidrato (30g CHO intra-longão) · Eletrólitos · Whey 30g',
      meals: [
        {
          time: '05:30',
          title: 'Refeição 1 · Pré-Treino Matinal (Rápida Absorção)',
          macros: '310 kcal · 20g P · 52g C · 3g G',
          items: [
            '2 fatias de pão branco tostado com 25g de geleia de frutas',
            '20g de Whey Protein diluído em água ou café expresso',
            '500 ml de água com pitada de sal integral ao acordar',
          ],
          substitutions: 'Nos treinos >12km, incluir 1 sachê de gel de carboidrato no km 7.',
        },
        {
          time: '08:00',
          title: 'Refeição 2 · Pós-Treino / Café da Manhã Completo',
          macros: '560 kcal · 38g P · 66g C · 15g G',
          items: [
            '3 ovos mexidos + 50g de queijo cottage ou minas frescal light',
            '80g de cuscuz ou tapioca + 1 porção de mamão papaya com 20g de aveia',
          ],
          substitutions: 'Pode substituir por 2 fatias de pão sourdough + omelete de 3 ovos.',
        },
        {
          time: '12:45',
          title: 'Refeição 3 · Almoço',
          macros: '690 kcal · 46g P · 88g C · 16g G',
          items: [
            '160g de alcatra limpa grelhada ou peito de frango',
            '200g de arroz + 100g de feijão preto ou lentilha',
            'Legumes assados (abóbora cabotiá e brócolis) + salada verde com azeite',
          ],
          substitutions: 'Pode trocar arroz e feijão por 250g de batata-doce assada ou macarrão.',
        },
        {
          time: '16:30',
          title: 'Refeição 4 · Lanche da Tarde',
          macros: '420 kcal · 30g P · 50g C · 11g G',
          items: [
            'Mingau proteico: 40g de aveia + 30g de Whey + 1 banana fatiada + 10g de castanhas',
          ],
          substitutions: 'Iogurte proteico + 1 fruta + 40g de granola sem açúcar.',
        },
        {
          time: '20:30',
          title: 'Refeição 5 · Jantar Recuperativo',
          macros: '570 kcal · 42g P · 64g C · 15g G',
          items: [
            '160g de filé de frango ou peixe branco grelhado',
            '180g de arroz ou mandioca cozida + salada completa com azeite extravirgem',
          ],
          substitutions: 'Wrap integral recheado com 150g de frango desfiado, ricota e salada.',
        },
      ],
    }
  }

  return {
    strategyName: `Déficit Calórico Estruturado · Alta Saciedade (${student.goal})`,
    dailyCalories: '1.850 kcal / dia (2.050 kcal nos dias de treino de pernas)',
    proteinTarget: '160 g / dia (2,2 g/kg)',
    carbsTarget: '175 g / dia (2,3 g/kg)',
    fatTarget: '54 g / dia (0,75 g/kg)',
    waterTarget: '3,2 L a 3,5 L de água por dia',
    supplements: 'Creatina 5g/dia · Whey Protein Isolado/Concentrado 30g · Psyllium 5g · Ômega-3',
    meals: [
      {
        time: '07:30',
        title: 'Refeição 1 · Café da Manhã Proteico',
        macros: '380 kcal · 32g P · 34g C · 12g G',
        items: [
          '2 ovos inteiros + 2 claras mexidas com espinafre e tomate',
          '1 fatia de pão integral (40g) ou 45g de tapioca com chia',
          '120g de mamão ou melão + café preto sem açúcar',
        ],
        substitutions:
          'Opção pré-treino rápida: panqueca de 1 banana + 2 ovos + 20g de aveia + canela.',
      },
      {
        time: '12:30',
        title: 'Refeição 2 · Almoço (Alta Densidade Nutricional)',
        macros: '510 kcal · 45g P · 52g C · 13g G',
        items: [
          '150g de peito de frango grelhado ou patinho moído magro',
          '130g de arroz integral ou branco + 80g de feijão',
          'Prato cheio de folhas verdes + 150g de legumes (abobrinha, brócolis, vagem)',
          '1 colher de chá de azeite de oliva extravirgem (5 ml)',
        ],
        substitutions:
          'Pode substituir o arroz + feijão por 180g de batata-inglesa assada ou 160g de abóbora cabotiá + 100g de arroz.',
      },
      {
        time: '16:30',
        title: 'Refeição 3 · Lanche da Tarde (Reforçado em Dias de Inferiores)',
        macros: '360 kcal · 30g P · 38g C · 9g G',
        items: [
          '160g de iogurte natural desnatado + 30g de Whey Protein',
          '25g de aveia em flocos + 100g de morangos ou 1 maçã média',
          'Nos dias de treino de pernas: adicionar +1 fruta média ou 30g de pão integral',
        ],
        substitutions:
          'Opção prática para bolsa/viagem: 1 shake proteico (30g Whey) + 1 fruta + 15g de amêndoas.',
      },
      {
        time: '20:00',
        title: 'Refeição 4 · Jantar de Definição',
        macros: '430 kcal · 42g P · 36g C · 12g G',
        items: [
          '150g de filé de tilápia, merluza ou peito de frango em tiras',
          '130g de batata-doce, mandioca ou arroz',
          'Salada verde variada à vontade + aspargos ou brócolis no vapor',
        ],
        substitutions: 'Omelete de forno com 2 ovos + 100g de frango desfiado + salada completa.',
      },
      {
        time: '22:00',
        title: 'Refeição 5 · Ceia (Controle de Apetite Noturno)',
        macros: '170 kcal · 14g P · 15g C · 8g G',
        items: [
          '120g de iogurte zero lactose ou mingau leve com 15g de Whey + cacau 100%',
          'Chá de camomila ou melissa sem açúcar',
        ],
        substitutions: '2 quadradinhos (15g) de chocolate 70% cacau + 100g de morangos.',
      },
    ],
  }
}

const FICHA_SECTIONS_KEY = 'elevn-ficha-secoes'

type StudentsWorkspaceProps = {
  /** Top-level tab of the page: the roster or the notifications center. */
  section?: 'carteira' | 'checkins' | 'notificacoes'
  onSectionChange?: (section: 'carteira' | 'checkins' | 'notificacoes') => void
  /** Student whose check-in is open in the Check-ins tab (?checkin=). */
  checkinStudentId?: string | null
  onCheckinSelect?: (studentId: string | null) => void
  /** Rendered in place of the roster when section is "notificacoes". */
  notificationsContent?: ReactNode
  /** "Notificar" in the student file. */
  onNotifyStudent?: (studentId: string) => void
  /** "Ver check-in" in the student file: opens the Check-ins tab on that student. */
  onOpenCheckin?: (studentId: string) => void
  /** Student file opened from the URL (?ficha=&aba=). null closes it. */
  ficha?: { studentId: string; tab: FichaTab } | null
  /** Saved view requested from the URL (?visao=vencendo), e.g. from a Dashboard KPI. */
  initialView?: string | null
  onInitialViewHandled?: () => void
  /** Called when the user opens, closes or changes tab in the student file. */
  onFichaChange?: (next: { studentId: string; tab: FichaTab } | null) => void
  /** Opens the "Cadastrar aluno" form once (from "+ Novo" or ⌘K). */
  startNew?: boolean
  /** Pre-fills the cadastro when converting a lead (?nome=&whatsapp=). */
  newStudentPrefill?: { name?: string | null; whatsapp?: string | null }
  onStartNewHandled?: () => void
}

export type FichaTab = 'checkin' | 'treino' | 'dieta' | 'fotos' | 'acesso'

function getStudentDefaultAppPhotos(student: StudentRecord): StudentAppPhoto[] {
  if (student.appPhotos && student.appPhotos.length > 0) {
    return student.appPhotos
  }

  const isFemale =
    student.name.startsWith('Camila') ||
    student.name.startsWith('Juliana') ||
    student.name.startsWith('Marina') ||
    student.name.startsWith('Sofia') ||
    student.name.startsWith('Aline') ||
    student.name.startsWith('Beatriz') ||
    student.name.startsWith('Renata') ||
    student.name.startsWith('Fernanda') ||
    student.name.startsWith('Larissa') ||
    student.name.startsWith('Gabriela') ||
    student.name.startsWith('Bianca')

  if (isFemale) {
    return [
      {
        id: `${student.id}-photo-1`,
        angle: 'Frente',
        dateLabel: '10/01/2026 · 07:45',
        cycleLabel: 'Avaliação Inicial (Semana 1)',
        weightKg: '68,4 kg',
        imageUrl:
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
        studentNote: 'Foto enviada pelo aplicativo em jejum logo após acordar.',
        adminObservation: 'Marco inicial para comparação de linha de cintura e definição.',
      },
      {
        id: `${student.id}-photo-2`,
        angle: 'Costas',
        dateLabel: '10/01/2026 · 07:47',
        cycleLabel: 'Avaliação Inicial (Semana 1)',
        weightKg: '68,4 kg',
        imageUrl:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
        studentNote: 'Registro de costas relaxada no primeiro check-in do app.',
      },
      {
        id: `${student.id}-photo-3`,
        angle: 'Perfil Direito',
        dateLabel: '22/02/2026 · 08:10',
        cycleLabel: 'Check-in Intermediário (Semana 6)',
        weightKg: '65,9 kg',
        imageUrl:
          'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=900&q=80',
        studentNote: 'Já sentindo muita diferença na retenção abdominal e disposição!',
        adminObservation: 'Redução nítida de circunferência abdominal.',
      },
      {
        id: `${student.id}-photo-4`,
        angle: 'Frente',
        dateLabel: '12/04/2026 · 07:50',
        cycleLabel: 'Check-in Atual (Semana 12)',
        weightKg: '63,8 kg',
        imageUrl:
          'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=900&q=80',
        studentNote: 'Foto atual enviada pelo aplicativo hoje cedo em jejum.',
        adminObservation: 'Excelente evolução estética (-4,6 kg e -7 cm de cintura).',
      },
      {
        id: `${student.id}-photo-5`,
        angle: 'Costas',
        dateLabel: '12/04/2026 · 07:52',
        cycleLabel: 'Check-in Atual (Semana 12)',
        weightKg: '63,8 kg',
        imageUrl:
          'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=900&q=80',
        studentNote: 'Costas e posteriores bem mais marcados neste ciclo.',
      },
      {
        id: `${student.id}-photo-6`,
        angle: 'Pós-Treino',
        dateLabel: '14/04/2026 · 19:20',
        cycleLabel: 'Registro no App · Pós-Treino B',
        weightKg: '63,9 kg',
        imageUrl:
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
        studentNote: 'Foto enviada no app após finalizar o treino de membros inferiores.',
      },
    ]
  }

  return [
    {
      id: `${student.id}-photo-1`,
      angle: 'Frente',
      dateLabel: '08/01/2026 · 07:30',
      cycleLabel: 'Avaliação Inicial (Semana 1)',
      weightKg: '84,6 kg',
      imageUrl:
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80',
      studentNote: 'Primeira foto enviada pelo aplicativo Elevn em jejum.',
      adminObservation: 'Ponto de partida para recomposição corporal.',
    },
    {
      id: `${student.id}-photo-2`,
      angle: 'Costas',
      dateLabel: '08/01/2026 · 07:32',
      cycleLabel: 'Avaliação Inicial (Semana 1)',
      weightKg: '84,6 kg',
      imageUrl:
        'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=80',
      studentNote: 'Costas relaxado na primeira semana do protocolo.',
    },
    {
      id: `${student.id}-photo-3`,
      angle: 'Perfil Direito',
      dateLabel: '20/02/2026 · 08:00',
      cycleLabel: 'Check-in Intermediário (Semana 6)',
      weightKg: '81,2 kg',
      imageUrl:
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80',
      studentNote: 'Metade do protocolo concluída, cintura diminuiu bastante.',
      adminObservation: 'Ótima resposta ao ajuste de cardio e déficit controlado.',
    },
    {
      id: `${student.id}-photo-4`,
      angle: 'Frente',
      dateLabel: '12/04/2026 · 07:40',
      cycleLabel: 'Check-in Atual (Semana 12)',
      weightKg: '78,4 kg',
      imageUrl:
        'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?auto=format&fit=crop&w=900&q=80',
      studentNote: 'Foto enviada hoje pelo aplicativo em jejum. Densidade muito melhor!',
      adminObservation: 'Redução de 6,2 kg mantendo volume de peitoral e ombros.',
    },
    {
      id: `${student.id}-photo-5`,
      angle: 'Costas',
      dateLabel: '12/04/2026 · 07:42',
      cycleLabel: 'Check-in Atual (Semana 12)',
      weightKg: '78,4 kg',
      imageUrl:
        'https://images.unsplash.com/photo-1672344048213-76b6e77304bd?auto=format&fit=crop&w=900&q=80',
      studentNote: 'Costas atual após 12 semanas de Treino B focado em largura dorsal.',
    },
    {
      id: `${student.id}-photo-6`,
      angle: 'Pós-Treino',
      dateLabel: '14/04/2026 · 20:10',
      cycleLabel: 'Registro no App · Pós-Treino A',
      weightKg: '78,7 kg',
      imageUrl:
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
      studentNote: 'Registro enviado direto pelo aplicativo após finalizar o treino.',
    },
  ]
}

/** Stacked bar of the day's macros (energy share of protein, carbs and fat). */
function MacroBar({ protein, carbs, fat }: { protein: string; carbs: string; fat: string }) {
  const grams = (value: string) =>
    Number((value.match(/\d+(?:[.,]\d+)?/)?.[0] ?? '0').replace(',', '.'))
  const parts = [
    { label: 'Proteína', grams: grams(protein), kcal: grams(protein) * 4, color: 'bg-brand' },
    { label: 'Carboidrato', grams: grams(carbs), kcal: grams(carbs) * 4, color: 'bg-brand-light' },
    { label: 'Gordura', grams: grams(fat), kcal: grams(fat) * 9, color: 'bg-ink-3' },
  ]
  const total = parts.reduce((sum, part) => sum + part.kcal, 0)
  if (!total) return null
  return (
    <div className="macro-bar mt-4 rounded-card border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-ink">Distribuição de macros</p>
        <p className="text-xs text-ink-3 tabular-nums">
          {Math.round(total).toLocaleString('pt-BR')} kcal dos macros
        </p>
      </div>
      <div
        className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-line-subtle"
        role="img"
        aria-label={parts
          .map((part) => `${part.label} ${Math.round((part.kcal / total) * 100)}%`)
          .join(', ')}
      >
        {parts.map((part) => (
          <span
            key={part.label}
            className={part.color}
            style={{ width: `${(part.kcal / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {parts.map((part) => (
          <li key={part.label} className="flex items-center gap-1.5 text-ink-2">
            <span aria-hidden="true" className={`size-2 rounded-full ${part.color}`} />
            <span className="font-semibold text-ink tabular-nums">
              {Math.round((part.kcal / total) * 100)}%
            </span>
            {part.label} · {part.grams} g
          </li>
        ))}
      </ul>
    </div>
  )
}

function parseMeasure(value?: string) {
  if (!value) return null
  const match = value.match(/\d+(?:[.,]\d+)?/)
  return match ? Number(match[0].replace(',', '.')) : null
}

function parsePhotoDate(label: string) {
  const match = label.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  return match ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])) : null
}

/** What changed between photo A and photo B: weight and time. */
function ComparisonDeltas({ before, after }: { before: StudentAppPhoto; after: StudentAppPhoto }) {
  const fmt = (value: number, unit: string) =>
    `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${unit}`
  const weightA = parseMeasure(before.weightKg)
  const weightB = parseMeasure(after.weightKg)
  const dateA = parsePhotoDate(before.dateLabel)
  const dateB = parsePhotoDate(after.dateLabel)
  const weeks =
    dateA && dateB ? Math.round(Math.abs(dateB.getTime() - dateA.getTime()) / (7 * 864e5)) : null
  const items = [
    weightA !== null && weightB !== null
      ? { label: 'Peso', value: fmt(weightB - weightA, 'kg') }
      : null,
    weeks !== null
      ? { label: 'Intervalo', value: `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}` }
      : null,
  ].filter(Boolean) as { label: string; value: string }[]
  if (!items.length) return null
  return (
    <dl className="mb-3 flex flex-wrap gap-x-8 gap-y-2 rounded-card bg-night px-5 py-3 text-on-dark">
      <div className="flex items-baseline gap-2">
        <dt className="text-xs text-white/55">De A para B</dt>
        <dd className="text-xs text-white/70">
          {before.angle === after.angle ? before.angle : `${before.angle} → ${after.angle}`}
        </dd>
      </div>
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-2">
          <dt className="text-xs text-white/55">{item.label}</dt>
          <dd className="text-base font-semibold tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Weight trend from the photos the student sent (each photo records the day's weight). */
function WeightTrend({ photos, current }: { photos: StudentAppPhoto[]; current: string }) {
  const points = photos
    .map((photo) => ({
      date: parsePhotoDate(photo.dateLabel),
      weight: parseMeasure(photo.weightKg),
    }))
    .filter(
      (point): point is { date: Date; weight: number } => !!point.date && point.weight !== null,
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  const first = points[0]?.weight
  const last = points[points.length - 1]?.weight
  const min = Math.min(...points.map((point) => point.weight))
  const max = Math.max(...points.map((point) => point.weight))
  const path = points
    .map((point, index) => {
      const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100
      const y = max === min ? 50 : 6 + ((max - point.weight) / (max - min)) * 88
      return `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
  const delta = first !== undefined && last !== undefined ? last - first : null
  return (
    <section
      className="rounded-card border border-line bg-surface p-4"
      aria-label="Evolução do peso"
    >
      <p className="text-xs font-medium text-ink-3">Peso em jejum (LiveClin)</p>
      <p className="mt-1 text-lg font-semibold text-ink">{current}</p>
      {points.length > 1 && (
        <>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="mt-2 h-12 w-full"
            aria-hidden="true"
          >
            <path
              d={path}
              fill="none"
              stroke="var(--elevn-accent)"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-1 text-xs text-ink-3">
            {delta !== null && (
              <span
                className={delta < 0 ? 'font-semibold text-success' : 'font-semibold text-ink-2'}
              >
                {delta > 0 ? '+' : delta < 0 ? '−' : ''}
                {Math.abs(delta).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
              </span>
            )}{' '}
            em {points.length} registros com foto
          </p>
        </>
      )}
    </section>
  )
}

export const RENEWAL_OPTIONS = [
  { months: 3, label: '3 meses', plan: 'Trimestral' },
  { months: 6, label: '6 meses', plan: 'Semestral' },
  { months: 12, label: '1 ano', plan: 'Anual' },
] as const

export const renewalLabel = (months?: number) =>
  RENEWAL_OPTIONS.find((option) => option.months === months)?.label ?? `${months} meses`

/** Asks for how long the plan was renewed before confirming it. */
export function RenewalChooser({
  name,
  onPick,
  onCancel,
}: {
  name: string
  onPick: (months: number) => void
  onCancel: () => void
}) {
  return (
    <div
      role="group"
      aria-label={`Por quanto tempo ${name} renovou?`}
      className="mt-2 rounded-control border border-success/30 bg-success-soft/60 p-2.5"
    >
      <p className="text-xs font-semibold text-ink">Renovou por quanto tempo?</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {RENEWAL_OPTIONS.map((option) => (
          <Button
            key={option.months}
            size="sm"
            variant="secondary"
            onClick={() => onPick(option.months)}
          >
            {option.label}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

const PRIORITY_OPEN_KEY = 'elevn-prioridades-abertas'

/**
 * Priority card with a dropdown header. Starts collapsed; the cards the coach opens
 * stay open on the next visit (remembered per card on this device).
 */
function PriorityPanel({
  id,
  title,
  source,
  total,
  onSeeAll,
  children,
}: {
  id: string
  title: string
  source: string
  total: number
  onSeeAll: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(PRIORITY_OPEN_KEY) ?? '[]')
      if (Array.isArray(stored) && stored.includes(id)) setOpen(true)
    } catch {
      /* ignore */
    }
  }, [id])
  const toggle = () => {
    const next = !open
    setOpen(next)
    try {
      const stored = JSON.parse(window.localStorage.getItem(PRIORITY_OPEN_KEY) ?? '[]')
      const list: string[] = Array.isArray(stored) ? stored : []
      window.localStorage.setItem(
        PRIORITY_OPEN_KEY,
        JSON.stringify(next ? [...new Set([...list, id])] : list.filter((item) => item !== id)),
      )
    } catch {
      /* preference not saved */
    }
  }
  return (
    <article className="flex min-w-0 flex-col self-start rounded-card border border-line bg-surface">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={cx(
          'flex w-full cursor-pointer items-start justify-between gap-3 px-5 pt-4 pb-3 text-left hover:bg-subtle/50',
          open && 'border-b border-line-subtle',
        )}
      >
        <div>
          <p className="text-[11px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
            {source}
          </p>
          <h2 className="mt-0.5 text-[15px] font-semibold text-ink">{title}</h2>
        </div>
        <span className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink-2 tabular-nums">
          {total}
          <Icon
            name="chevronRight"
            className={cx('size-4 text-ink-3 transition-transform', open && 'rotate-90')}
          />
        </span>
      </button>
      {open && <div className="flex flex-1 flex-col divide-y divide-line-subtle">{children}</div>}
      {open && total > 3 && (
        <button
          type="button"
          onClick={onSeeAll}
          className="cursor-pointer border-t border-line-subtle px-5 py-2.5 text-left text-xs font-semibold text-brand hover:bg-subtle"
        >
          Ver todos ({total}) →
        </button>
      )}
    </article>
  )
}

function PriorityRow({
  student,
  meta,
  context,
  action,
  extra,
  footer,
}: {
  student: { name: string; avatar: string; whatsapp: string }
  meta: ReactNode
  /** Clamped to two lines. */
  context?: string
  action?: ReactNode
  extra?: ReactNode
  /** Full-width block under the row (aligned with the name), e.g. the student's feedback. */
  footer?: ReactNode
}) {
  return (
    <div className="px-5 py-3.5">
      <div className="flex gap-3">
        <img src={student.avatar} alt="" className="size-8 shrink-0 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{student.name}</p>
          <p className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-ink-3">{meta}</p>
          {context && <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-2">{context}</p>}
          {extra}
        </div>
        <div className="flex shrink-0 items-start gap-1">
          {action}
          <a
            href={buildWhatsAppUrl(student.whatsapp, student.name)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Conversar com ${student.name} no WhatsApp`}
            className="grid size-8 place-items-center rounded-control text-success hover:bg-success-soft [&_svg]:size-4"
          >
            <WhatsAppIcon />
          </a>
        </div>
      </div>
      {footer && <div className="mt-2 ml-11">{footer}</div>}
    </div>
  )
}

/** The open feedback the student wrote in the LiveClin check-in, shown whole. */
function CheckinFeedback({ student }: { student: StudentRecord }) {
  const feedback = getLiveClinAnswers(student).feedback?.trim()
  return (
    <figure className="rounded-control border border-line-subtle bg-subtle/70 px-3 py-2">
      <figcaption className="text-[11px] font-semibold text-ink-3">
        {student.checkinState === 'Atrasado'
          ? 'Último feedback no LiveClin'
          : 'Feedback no LiveClin'}
      </figcaption>
      {feedback ? (
        <blockquote className="mt-0.5 text-xs leading-5 text-ink-2">“{feedback}”</blockquote>
      ) : (
        <p className="mt-0.5 text-xs leading-5 text-ink-3">O aluno não escreveu feedback.</p>
      )}
    </figure>
  )
}

export default function StudentsWorkspace({
  section = 'carteira',
  onSectionChange,
  notificationsContent,
  onNotifyStudent,
  onOpenCheckin,
  checkinStudentId = null,
  onCheckinSelect,
  ficha,
  onFichaChange,
  startNew,
  onStartNewHandled,
  newStudentPrefill,
  initialView,
  onInitialViewHandled,
}: StudentsWorkspaceProps = {}) {
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents)
  const [statusFilters, setStatusFilters] = useState<StatusKey[]>([])
  const [goalFilter, setGoalFilter] = useState<string>('Todos')
  const [customViews, setCustomViews] = useState<StudentView[]>([])
  const [activeViewId, setActiveViewId] = useState('todos')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [modalStudentId, setModalStudentId] = useState<string | null>(null)
  const [modalTab, setModalTab] = useState<FichaTab>('checkin')
  /* Collapsible sections of the student file. Only "Check-in" starts open; what the
     coach opens or closes is remembered per student on this browser. */
  const [openSections, setOpenSections] = useState<Record<string, FichaTab[]>>({})
  const [exportingTemplate, setExportingTemplate] = useState<string | null>(null)
  const [exportError, setExportError] = useState('')
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FICHA_SECTIONS_KEY)
      if (stored) setOpenSections(JSON.parse(stored))
    } catch {
      /* no stored preference */
    }
  }, [])
  const sectionsOpenFor = (studentId: string) => openSections[studentId] ?? ['checkin']
  const setSectionsFor = (studentId: string, next: FichaTab[]) => {
    setOpenSections((current) => {
      const updated = { ...current, [studentId]: next }
      try {
        window.localStorage.setItem(FICHA_SECTIONS_KEY, JSON.stringify(updated))
      } catch {
        /* preference not persisted */
      }
      return updated
    })
  }
  const [photoAngleFilter, setPhotoAngleFilter] = useState<'Todos' | StudentPhotoAngle>('Todos')
  const [compareMode, setCompareMode] = useState<'side-by-side' | 'slider'>('side-by-side')
  const [sliderPosition, setSliderPosition] = useState(50)
  const [blurThumbs, setBlurThumbs] = useState(false)
  const [overlayBlendOpacity, setOverlayBlendOpacity] = useState(0)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const sliderViewportRef = useRef<HTMLDivElement | null>(null)
  const [compareBeforeId, setCompareBeforeId] = useState<string>('')

  const updateSliderFromClientX = (clientX: number) => {
    const container = sliderViewportRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    if (rect.width <= 0) return
    const rawPercent = ((clientX - rect.left) / rect.width) * 100
    const clamped = Math.max(2, Math.min(98, Math.round(rawPercent)))
    setSliderPosition(clamped)
  }

  const handleSliderPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDraggingSlider(true)
    updateSliderFromClientX(event.clientX)
  }

  const handleSliderPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingSlider) return
    event.preventDefault()
    updateSliderFromClientX(event.clientX)
  }

  const handleSliderPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setIsDraggingSlider(false)
  }
  const [compareAfterId, setCompareAfterId] = useState<string>('')
  const [addPhotoFormOpen, setAddPhotoFormOpen] = useState(false)
  const [newPhotoAngle, setNewPhotoAngle] = useState<StudentPhotoAngle>('Frente')
  /** Day the photo was taken (yyyy-mm-dd); empty means today. */
  const [newPhotoDate, setNewPhotoDate] = useState('')
  const [newPhotoWeight, setNewPhotoWeight] = useState('78,0 kg')
  const [newPhotoCycle, setNewPhotoCycle] = useState('Novo Envio pelo App')
  const [newPhotoNote, setNewPhotoNote] = useState('')
  const [newPhotoUrl, setNewPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?auto=format&fit=crop&w=900&q=80',
  )
  const [newStudentOpen, setNewStudentOpen] = useState(false)
  const [nonRenewalOpenForId, setNonRenewalOpenForId] = useState<string | null>(null)
  const [nonRenewalDraft, setNonRenewalDraft] = useState('')
  const [priorityNonRenewalId, setPriorityNonRenewalId] = useState<string | null>(null)
  const [priorityNonRenewalDraft, setPriorityNonRenewalDraft] = useState('')
  const [generatedKeysByStudent, setGeneratedKeysByStudent] = useState<
    Record<string, { key: string; generatedAt: string }>
  >({})
  const [generatedKeyBanner, setGeneratedKeyBanner] = useState<{
    studentId: string
    studentName: string
    key: string
  } | null>(null)
  const [loginEmailDraft, setLoginEmailDraft] = useState('')
  const [newStudentNameQuery, setNewStudentNameQuery] = useState('')
  const [externalSearchOpen, setExternalSearchOpen] = useState(false)
  const [externalSearchResults, setExternalSearchResults] = useState<ExternalPlatformStudent[]>([])
  const openStudentModal = (studentId: string, initialTab: FichaTab = 'checkin') => {
    setModalStudentId(studentId)
    setModalTab(initialTab)
    const target = students.find((item) => item.id === studentId)
    if (target) {
      const info = getStudentAccessInfo(target, generatedKeysByStudent)
      setLoginEmailDraft(info.loginEmail ?? '')
      const photos = getStudentDefaultAppPhotos(target)
      const firstFront = photos.find((p) => p.angle === 'Frente') ?? photos[0]
      const latestFront =
        [...photos].reverse().find((p) => p.angle === 'Frente' && p.id !== firstFront?.id) ??
        photos[photos.length - 1] ??
        photos[0]
      setCompareBeforeId(firstFront?.id ?? '')
      setCompareAfterId(latestFront?.id ?? '')
    }
  }

  /* URL ⇄ student file sync (?ficha=&aba=). The URL wins when it changes (deep link,
     back button); local opens/closes/tab switches are reported back with onFichaChange. */
  const fichaStateKey = modalStudentId ? `${modalStudentId}:${modalTab}` : ''
  const fichaStateKeyRef = useRef(fichaStateKey)
  fichaStateKeyRef.current = fichaStateKey
  const pendingFromUrl = useRef<string | null>(null)
  const fichaPropKey = ficha ? `${ficha.studentId}:${ficha.tab}` : ''

  useEffect(() => {
    if (ficha === undefined) return
    if (fichaPropKey === fichaStateKeyRef.current) return
    pendingFromUrl.current = fichaPropKey
    if (!ficha) {
      setModalStudentId(null)
    } else if (ficha.studentId !== modalStudentId) {
      if (students.some((item) => item.id === ficha.studentId))
        openStudentModal(ficha.studentId, ficha.tab)
      else pendingFromUrl.current = null
    } else {
      setModalTab(ficha.tab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fichaPropKey])

  useEffect(() => {
    if (pendingFromUrl.current !== null) {
      if (pendingFromUrl.current === fichaStateKey) pendingFromUrl.current = null
      return
    }
    if (fichaStateKey === fichaPropKey) return
    onFichaChange?.(modalStudentId ? { studentId: modalStudentId, tab: modalTab } : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fichaStateKey])

  useEffect(() => {
    if (!modalStudentId || modalTab === 'checkin') return
    setOpenSections((current) => {
      const open = current[modalStudentId] ?? ['checkin']
      return open.includes(modalTab)
        ? current
        : { ...current, [modalStudentId]: [...open, modalTab] }
    })
    const timer = window.setTimeout(
      () =>
        document
          .getElementById(`ficha-${modalTab}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      60,
    )
    return () => window.clearTimeout(timer)
  }, [modalStudentId, modalTab])

  const [prefillWhatsapp, setPrefillWhatsapp] = useState('')

  useEffect(() => {
    if (!startNew) return
    if (newStudentPrefill?.name) setNewStudentNameQuery(newStudentPrefill.name)
    setPrefillWhatsapp(newStudentPrefill?.whatsapp ?? '')
    setNewStudentOpen(true)
    onStartNewHandled?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startNew])

  useEffect(() => {
    setStudents((current) =>
      current.map((student) => {
        const access = getStudentAccessInfo(student, {})
        return {
          ...student,
          hasLogin: access.hasLogin,
          loginEmail: access.loginEmail,
          accessKey: access.accessKey,
          accessKeyGeneratedAt: access.accessKeyGeneratedAt,
          workoutComments: getStudentWorkoutComments(student),
          liveClinCheckin: getLiveClinAnswers(student),
        }
      }),
    )
  }, [])

  const pendingCheckinsCount = students.filter(
    (student) => student.checkinState === 'Pendente' || student.checkinState === 'Atrasado',
  ).length
  const onlyPendingCount = students.filter((student) => student.checkinState === 'Pendente').length
  const delayedCheckinsCount = students.filter(
    (student) => student.checkinState === 'Atrasado',
  ).length
  const completedCheckinsCount = students.filter(
    (student) => student.checkinState === 'Realizado',
  ).length
  const expiringSoonCount = students.filter(
    (student) => student.renewalState === 'Perto de vencer',
  ).length
  const recoveredCount = students.filter((student) => student.renewalState === 'Recuperado').length
  const nonRenewedCount = students.filter(
    (student) => student.renewalState === 'Não renovou',
  ).length
  const noLoginCount = students.filter(
    (student) => !getStudentAccessInfo(student, generatedKeysByStudent).hasLogin,
  ).length
  const activePortfolioRevenue =
    21210 +
    students
      .filter((student) => student.renewalState !== 'Não renovou')
      .reduce((acc, item) => acc + item.monthlyRevenue, 0)

  const matchesStatus = (student: StudentRecord, key: StatusKey) => {
    if (key === 'pendentes') return student.checkinState === 'Pendente'
    if (key === 'atrasados') return student.checkinState === 'Atrasado'
    if (key === 'realizados') return student.checkinState === 'Realizado'
    if (key === 'vencendo') return student.renewalState === 'Perto de vencer'
    if (key === 'recuperados') return student.renewalState === 'Recuperado'
    if (key === 'nao-renovaram') return student.renewalState === 'Não renovou'
    return !getStudentAccessInfo(student, generatedKeysByStudent).hasLogin
  }

  const passesFilters = (
    student: StudentRecord,
    statuses: StatusKey[],
    goal: string,
    term: string,
  ) => {
    if (statuses.length && !statuses.some((key) => matchesStatus(student, key))) return false
    if (goal !== 'Todos' && student.goal !== goal) return false
    if (!term.trim()) return true
    const query = term.toLowerCase()
    return (
      student.name.toLowerCase().includes(query) ||
      student.goal.toLowerCase().includes(query) ||
      student.phase.toLowerCase().includes(query) ||
      student.plan.toLowerCase().includes(query) ||
      student.lastWorkoutTitle.toLowerCase().includes(query)
    )
  }

  const filteredStudents = students.filter((student) =>
    passesFilters(student, statusFilters, goalFilter, search),
  )

  /* Saved views: built-ins + the user's own (this browser) */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STUDENT_VIEWS_KEY)
      if (stored) setCustomViews(JSON.parse(stored))
    } catch {
      /* ignore unreadable views */
    }
  }, [])

  const allViews = [...builtInStudentViews, ...customViews]
  const activeView = allViews.find((view) => view.id === activeViewId) ?? builtInStudentViews[0]
  const sameStatuses = (a: StatusKey[], b: StatusKey[]) =>
    a.length === b.length && a.every((key) => b.includes(key))
  const viewModified =
    !sameStatuses(activeView.statuses, statusFilters) ||
    activeView.goal !== goalFilter ||
    activeView.search !== search

  const applyView = (view: StudentView) => {
    setActiveViewId(view.id)
    setStatusFilters(view.statuses)
    setGoalFilter(view.goal)
    setSearch(view.search)
  }

  useEffect(() => {
    if (!initialView) return
    const view = builtInStudentViews.find((item) => item.id === initialView)
    if (view) {
      applyView(view)
      window.requestAnimationFrame(() =>
        document.getElementById('carteira-alunos')?.scrollIntoView({ block: 'start' }),
      )
    }
    onInitialViewHandled?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialView])

  const persistViews = (views: StudentView[]) => {
    setCustomViews(views)
    try {
      window.localStorage.setItem(STUDENT_VIEWS_KEY, JSON.stringify(views))
    } catch {
      /* not persisted */
    }
  }

  const saveCurrentAsView = (name: string) => {
    const view: StudentView = {
      id: `view-${Date.now().toString(36)}`,
      name,
      statuses: statusFilters,
      goal: goalFilter,
      search,
    }
    persistViews([...customViews, view])
    setActiveViewId(view.id)
  }

  const deleteActiveView = () => {
    if (activeView.builtIn) return
    persistViews(customViews.filter((view) => view.id !== activeView.id))
    applyView(builtInStudentViews[0])
  }

  /** Shortcut from KPIs and priority panels: filter by statuses, keep the "Todos" tab. */
  const showStatuses = (statuses: StatusKey[]) => {
    const isSame = sameStatuses(statuses, statusFilters) && goalFilter === 'Todos' && !search
    const match = builtInStudentViews.find((view) => sameStatuses(view.statuses, statuses))
    if (isSame) applyView(builtInStudentViews[0])
    else if (match) applyView(match)
    else {
      setActiveViewId('todos')
      setStatusFilters(statuses)
      setGoalFilter('Todos')
      setSearch('')
    }
    document
      .getElementById('carteira-alunos')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const statusOptions: { id: StatusKey; label: string; count: number }[] = [
    { id: 'pendentes', label: 'LiveClin pendente', count: onlyPendingCount },
    { id: 'atrasados', label: 'Check-in atrasado', count: delayedCheckinsCount },
    { id: 'realizados', label: 'Check-in realizado', count: completedCheckinsCount },
    { id: 'vencendo', label: 'Perto do vencimento', count: expiringSoonCount },
    { id: 'recuperados', label: 'Recuperados', count: recoveredCount },
    { id: 'nao-renovaram', label: 'Não renovaram', count: nonRenewedCount },
    { id: 'sem-login', label: 'Sem login', count: noLoginCount },
  ]

  const modalStudent = modalStudentId
    ? (students.find((student) => student.id === modalStudentId) ?? null)
    : null
  const modalLiveClin = modalStudent ? getLiveClinAnswers(modalStudent) : null
  const modalWorkoutPlan = modalStudent ? getStudentWorkoutPlan(modalStudent) : null
  const modalDietPlan = modalStudent ? getStudentDietPlan(modalStudent) : null
  const modalAccessInfo = modalStudent
    ? getStudentAccessInfo(modalStudent, generatedKeysByStudent)
    : null
  const modalWorkoutComments = modalStudent ? getStudentWorkoutComments(modalStudent) : []
  const modalAppPhotos = modalStudent ? getStudentDefaultAppPhotos(modalStudent) : []
  const filteredModalPhotos = modalAppPhotos.filter(
    (photo) => photoAngleFilter === 'Todos' || photo.angle === photoAngleFilter,
  )
  const photoBefore =
    modalAppPhotos.find((p) => p.id === compareBeforeId) ?? modalAppPhotos[0] ?? null
  const photoAfter =
    modalAppPhotos.find((p) => p.id === compareAfterId) ??
    modalAppPhotos[modalAppPhotos.length - 1] ??
    modalAppPhotos[0] ??
    null

  const handleNewPhotoFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPhotoUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddStudentAppPhoto = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!modalStudent) return
    const existingPhotos = getStudentDefaultAppPhotos(modalStudent)
    const now = new Date()
    const dateLabel = newPhotoDate
      ? new Date(`${newPhotoDate}T12:00:00`).toLocaleDateString('pt-BR')
      : `${now.toLocaleDateString('pt-BR')} · ${now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}`
    const createdPhoto: StudentAppPhoto = {
      id: `${modalStudent.id}-photo-${Date.now()}`,
      angle: newPhotoAngle,
      dateLabel,
      cycleLabel: newPhotoCycle.trim() || 'Enviada pelo Aplicativo',
      weightKg:
        newPhotoWeight.trim() || (modalLiveClin && formatKg(modalLiveClin.weightKg)) || '78,0 kg',
      imageUrl: newPhotoUrl,
      studentNote:
        newPhotoNote.trim() || 'Foto cadastrada pelo aluno diretamente no aplicativo Elevn.',
    }
    const updatedList = [...existingPhotos, createdPhoto]
    setStudents((current) =>
      current.map((item) =>
        item.id === modalStudent.id ? { ...item, appPhotos: updatedList } : item,
      ),
    )
    setCompareAfterId(createdPhoto.id)
    setNewPhotoNote('')
    setNewPhotoDate('')
    setAddPhotoFormOpen(false)
  }

  const pairSameAngleForComparison = (angle: StudentPhotoAngle) => {
    setPhotoAngleFilter(angle)
    const matching = modalAppPhotos.filter((p) => p.angle === angle)
    if (matching.length >= 2) {
      setCompareBeforeId(matching[0].id)
      setCompareAfterId(matching[matching.length - 1].id)
    } else if (matching.length === 1) {
      setCompareBeforeId(matching[0].id)
      setCompareAfterId(matching[0].id)
    }
  }

  const generateAccessKeyForStudent = (student: StudentRecord) => {
    const newKey = createFormattedAccessKey(student.name)
    const currentAccess = getStudentAccessInfo(student, generatedKeysByStudent)
    setGeneratedKeysByStudent((current) => ({
      ...current,
      [student.id]: {
        key: newKey,
        generatedAt: 'Gerada agora pelo admin',
      },
    }))
    setStudents((current) =>
      current.map((item) =>
        item.id === student.id
          ? {
              ...item,
              hasLogin: currentAccess.hasLogin,
              loginEmail: currentAccess.loginEmail,
              accessKey: newKey,
              accessKeyGeneratedAt: 'Gerada agora pelo admin',
            }
          : item,
      ),
    )
    setGeneratedKeyBanner({
      studentId: student.id,
      studentName: student.name,
      key: newKey,
    })
  }

  const saveStudentLoginEmail = (studentId: string, emailValue: string) => {
    const cleanEmail = emailValue.trim().toLowerCase()
    if (!cleanEmail) return
    setStudents((current) =>
      current.map((item) => {
        if (item.id !== studentId) return item
        const currentAccess = getStudentAccessInfo(item)
        return {
          ...item,
          hasLogin: true,
          loginEmail: cleanEmail,
          accessKey: currentAccess.accessKey || createFormattedAccessKey(item.name),
          accessKeyGeneratedAt: 'Vinculada ao login ativo',
        }
      }),
    )
  }

  const [renewingId, setRenewingId] = useState<string | null>(null)
  const checkinAnswersFor = useCallback(
    (id: string) => {
      const student = students.find((item) => item.id === id)
      return getLiveClinAnswers(student ?? students[0])
    },
    [students],
  )

  const completeCheckin = (studentId: string) => {
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId
          ? {
              ...student,
              checkinState: 'Realizado',
              lastCheckin: 'Respondido agora',
              checkinAdherence: Math.min(100, student.checkinAdherence + 4),
              status: student.status === 'Em risco' ? 'Atenção' : 'Em dia',
            }
          : student,
      ),
    )
  }

  const recoverStudentPlan = (studentId: string, months: number) => {
    const until = new Date()
    until.setMonth(until.getMonth() + months)
    const option = RENEWAL_OPTIONS.find((item) => item.months === months)
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId
          ? {
              ...student,
              renewalState: 'Recuperado',
              nonRenewalReason: undefined,
              renewedMonths: months,
              plan: option?.plan ?? student.plan,
              status: 'Em dia',
              daysToExpire: Math.round((until.getTime() - Date.now()) / 86_400_000),
              expirationDate: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
                .format(until)
                .replace('.', '')
                .replace(' de ', ' '),
            }
          : student,
      ),
    )
    setRenewingId(null)
    setNonRenewalOpenForId(null)
    if (priorityNonRenewalId === studentId) {
      setPriorityNonRenewalId(null)
      setPriorityNonRenewalDraft('')
    }
  }

  const markNonRenewed = (studentId: string, reasonText: string) => {
    const cleanReason =
      reasonText.trim() || 'Aluno optou por não renovar neste ciclo (registrado pelo admin).'
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId
          ? {
              ...student,
              renewalState: 'Não renovou',
              nonRenewalReason: cleanReason,
              status: 'Atenção',
            }
          : student,
      ),
    )
    setNonRenewalOpenForId(null)
    setNonRenewalDraft('')
    setPriorityNonRenewalId(null)
    setPriorityNonRenewalDraft('')
  }

  const handleSearchExternalPlatforms = () => {
    const query = newStudentNameQuery.trim().toLowerCase()
    const existingNames = new Set(students.map((item) => item.name.toLowerCase()))
    const available = externalPlatformCatalog.filter(
      (candidate) => !existingNames.has(candidate.name.toLowerCase()),
    )
    const matched = query
      ? available.filter(
          (candidate) =>
            candidate.name.toLowerCase().includes(query) ||
            candidate.goal.toLowerCase().includes(query) ||
            candidate.mfitWorkoutSummary.toLowerCase().includes(query) ||
            candidate.webDietSummary.toLowerCase().includes(query),
        )
      : available

    if (query && matched.length === 0) {
      const cleanTypedName = newStudentNameQuery.trim()
      const customMatch: ExternalPlatformStudent = {
        id: `ext-custom-${Date.now()}`,
        name: cleanTypedName,
        avatar: '/people/renata-alves.jpg',
        whatsapp: '5511998887766',
        email: `${cleanTypedName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        goal: 'Emagrecimento',
        phase: 'Déficit',
        plan: 'Trimestral',
        mfitWorkoutSummary: 'MFIT: Treino ABC + Cardio encontrado no MFIT',
        webDietSummary: 'WebDiet: Plano alimentar sincronizado do WebDiet',
      }
      setExternalSearchResults([customMatch])
    } else {
      setExternalSearchResults(matched)
    }
    setExternalSearchOpen(true)
  }

  const handleImportExternalStudent = (candidate: ExternalPlatformStudent) => {
    const importedRecord: StudentRecord = {
      id: `student-${Date.now()}`,
      name: candidate.name,
      avatar: candidate.avatar,
      whatsapp: candidate.whatsapp,
      goal: candidate.goal,
      phase: candidate.phase,
      plan: candidate.plan,
      monthlyRevenue: candidate.plan === 'Anual' ? 480 : candidate.plan === 'Semestral' ? 450 : 420,
      adherence: 90,
      checkinAdherence: 95,
      checkinState: 'Pendente',
      lastCheckin: 'Importado agora',
      checkinNote: `${candidate.webDietSummary} · ${candidate.mfitWorkoutSummary}.`,
      lastWorkoutActivity: 'Sincronizado via MFIT',
      lastWorkoutTitle: candidate.mfitWorkoutSummary.replace('MFIT: ', ''),
      weeklyWorkoutsCompleted: '5/5 treinos na semana',
      expirationDate: '15 fev',
      daysToExpire: 90,
      renewalState: 'Em dia',
      status: 'Em dia',
      weightChange: 'Importado',
      hasLogin: true,
      loginEmail: candidate.email,
      accessKey: createFormattedAccessKey(candidate.name),
      accessKeyGeneratedAt: 'Importada junto com o cadastro MFIT/WebDiet',
      liveClinCheckin: {
        submittedAt: 'Sincronizado na importação (LiveClin + WebDiet + MFIT)',
        protocolName: `${candidate.goal} · ${candidate.phase}`,
        weightKg: 71.5,
        weightTrend: 'importado do WebDiet',
        offPlanMeals: 0,
        hunger: 'medio',
        waterLiters: 3,
        bowel: 'regulado',
        discomfort: 'raro',
        menuChanges: 'Cardápio importado do WebDiet sem pendências.',
        strengthSessions: 5,
        performance: 4,
        aerobicSessions: 3,
        sleepHours: 7,
        dedication: 5,
        evolution: 3,
        feedback: 'Dados de treino (MFIT) e dieta (WebDiet) vinculados com sucesso.',
      },
      appObservations: [
        {
          id: `obs-import-${Date.now()}`,
          when: 'Agora (MFIT & WebDiet)',
          category: 'Treino',
          note: `Ficha importada com sucesso: ${candidate.mfitWorkoutSummary} e ${candidate.webDietSummary}.`,
        },
      ],
    }
    setStudents((current) => [importedRecord, ...current])
    setExternalSearchOpen(false)
    setExternalSearchResults([])
    setNewStudentNameQuery('')
    setNewStudentOpen(false)
  }

  const handleCreateStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = (newStudentNameQuery || String(form.get('student-name') || '')).trim()
    if (!name) return
    const whatsapp =
      String(form.get('student-whatsapp') || '').replace(/\D/g, '') || '5511999999999'
    const goal = String(form.get('student-goal') || 'Emagrecimento') as StudentRecord['goal']
    const phase = String(form.get('student-phase') || 'Déficit') as StudentRecord['phase']
    const plan = String(form.get('student-plan') || 'Trimestral') as StudentRecord['plan']
    const newRecord: StudentRecord = {
      id: `student-${Date.now()}`,
      name,
      avatar: '/people/renata-alves.jpg',
      whatsapp,
      goal,
      phase,
      plan,
      monthlyRevenue: 420,
      adherence: 88,
      checkinAdherence: 100,
      checkinState: 'Pendente',
      lastCheckin: 'Novo cadastro',
      checkinNote: 'Avaliação inicial recebida. Aguardando montagem do primeiro protocolo.',
      lastWorkoutActivity: 'Primeiro acesso hoje',
      lastWorkoutTitle: 'Avaliação física & Treino A',
      weeklyWorkoutsCompleted: '1/5 treinos na semana',
      expirationDate: '05 fev',
      daysToExpire: 90,
      renewalState: 'Em dia',
      status: 'Em dia',
      weightChange: 'Inicial',
      hasLogin: false,
      liveClinCheckin: {
        submittedAt: 'Hoje via LiveClin (Anamnese Inicial)',
        protocolName: 'Protocolo Inicial Personalizado',
        weightKg: 72.0,
        weightTrend: 'peso inicial em jejum',
        offPlanMeals: 0,
        hunger: 'medio',
        waterLiters: 2,
        bowel: 'regulado',
        discomfort: 'raro',
        menuChanges: 'Prefere refeições práticas no almoço.',
        strengthSessions: 4,
        performance: 3,
        aerobicSessions: 3,
        sleepHours: 7,
        dedication: 5,
        evolution: 3,
        evolutionNote: 'Marco zero registrado com fotos iniciais.',
        feedback: 'Anamnese completa preenchida no LiveClin para estruturação do plano.',
      },
      appObservations: [
        {
          id: `obs-${Date.now()}`,
          when: 'Hoje (MFIT & WebDiet)',
          category: 'Rotina',
          note: 'Acesso liberado no MFIT e no WebDiet com horários configurados.',
        },
      ],
    }
    setStudents((current) => [newRecord, ...current])
    setModalStudentId(newRecord.id)
    setNewStudentOpen(false)
    setNewStudentNameQuery('')
    setExternalSearchOpen(false)
    event.currentTarget.reset()
  }

  return (
    <section className="students-workspace">
      <header className="students-workspace-header">
        <div>
          <p>GESTÃO DE CARTEIRA · CHECK-IN LIVECLIN, TREINO MFIT & DIETA WEBDIET</p>
          <h1>Alunos</h1>
          <span>
            Check-in semanal no LiveClin, atividade de treino no MFIT, dieta no WebDiet, receita e
            controle de renovações.
          </span>
        </div>
        <div className="students-header-actions">
          <button
            type="button"
            className="students-primary-button"
            onClick={() => setNewStudentOpen(true)}
          >
            + Cadastrar aluno
          </button>
        </div>
      </header>

      <Sheet
        open={newStudentOpen}
        onClose={() => {
          setNewStudentOpen(false)
          setExternalSearchOpen(false)
        }}
        label="Cadastrar aluno"
        className="w-[min(560px,100vw)] bg-surface"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-ink">Cadastrar aluno</h2>
            <p className="mt-0.5 text-sm text-ink-3">
              Digite o nome e use a lupa para importar do WebDiet e do MFIT com um clique.
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Fechar"
            onClick={() => {
              setNewStudentOpen(false)
              setExternalSearchOpen(false)
            }}
          >
            <Icon name="close" />
          </Button>
        </header>
        <div className="student-create-sheet flex-1 overflow-y-auto px-6 py-5">
          <div className="student-create-wrapper">
            <form className="student-create-form" onSubmit={handleCreateStudent}>
              <label>
                <span>Nome do aluno (buscar no WebDiet e MFIT)</span>
                <div className="student-name-search-field">
                  <input
                    name="student-name"
                    value={newStudentNameQuery}
                    onChange={(event) => setNewStudentNameQuery(event.target.value)}
                    placeholder="Digite o nome ou clique na lupa..."
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="student-search-lupa-btn"
                    onClick={handleSearchExternalPlatforms}
                    title="Buscar aluno no WebDiet e MFIT"
                    aria-label="Buscar aluno no WebDiet e MFIT"
                  >
                    <SearchLupIcon />
                  </button>
                </div>
              </label>
              <label>
                <span>WhatsApp (com DDD)</span>
                <input
                  key={prefillWhatsapp}
                  name="student-whatsapp"
                  defaultValue={prefillWhatsapp}
                  placeholder="Ex.: 5511998887766"
                />
              </label>
              <label>
                <span>Objetivo</span>
                <select name="student-goal" defaultValue="Emagrecimento">
                  <option>Emagrecimento</option>
                  <option>Hipertrofia</option>
                  <option>Performance</option>
                </select>
              </label>
              <label>
                <span>Fase nutricional</span>
                <select name="student-phase" defaultValue="Déficit">
                  <option>Déficit</option>
                  <option>Superávit</option>
                  <option>Manutenção</option>
                </select>
              </label>
              <label>
                <span>Plano</span>
                <select name="student-plan" defaultValue="Trimestral">
                  <option>Mensal</option>
                  <option>Trimestral</option>
                  <option>Semestral</option>
                  <option>Anual</option>
                </select>
              </label>
              <div className="student-create-actions">
                <button type="submit">Salvar aluno</button>
                <button
                  type="button"
                  onClick={() => {
                    setNewStudentOpen(false)
                    setExternalSearchOpen(false)
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>

            {externalSearchOpen && (
              <div
                className="external-platform-results"
                role="region"
                aria-label="Alunos encontrados no WebDiet e MFIT"
              >
                <header>
                  <div>
                    <span>INTEGRAÇÃO DIRETA · WEBDIET & MFIT</span>
                    <strong>
                      {externalSearchResults.length}{' '}
                      {externalSearchResults.length === 1
                        ? 'aluno encontrado pronto para importar'
                        : 'alunos encontrados prontos para importar'}
                    </strong>
                  </div>
                  <button type="button" onClick={() => setExternalSearchOpen(false)}>
                    Fechar busca
                  </button>
                </header>
                <div className="external-platform-list">
                  {externalSearchResults.map((candidate) => (
                    <article key={candidate.id} className="external-platform-item">
                      <img src={candidate.avatar} alt={`Foto de ${candidate.name}`} />
                      <div>
                        <strong>{candidate.name}</strong>
                        <span>
                          {candidate.goal} ({candidate.phase}) · Plano {candidate.plan} ·{' '}
                          {candidate.email}
                        </span>
                        <small>
                          {candidate.mfitWorkoutSummary} · {candidate.webDietSummary}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="import-student-btn"
                        onClick={() => handleImportExternalStudent(candidate)}
                      >
                        IMPORTAR
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Sheet>

      <Tabs
        label="Seções de Alunos"
        className="mb-6"
        value={section}
        onChange={(next) => onSectionChange?.(next)}
        items={[
          { id: 'carteira', label: 'Carteira', count: students.length },
          {
            id: 'checkins',
            label: 'Check-ins',
            count: students.filter((student) => student.checkinState !== 'Realizado').length,
          },
          { id: 'notificacoes', label: 'Notificações' },
        ]}
      />

      {section === 'notificacoes' ? (
        notificationsContent
      ) : section === 'checkins' ? (
        <CheckinsBoard
          students={students}
          answersFor={checkinAnswersFor}
          selectedId={checkinStudentId}
          onSelect={(id) => onCheckinSelect?.(id)}
          onComplete={completeCheckin}
          onOpenFicha={(id) => {
            onCheckinSelect?.(null)
            openStudentModal(id)
          }}
        />
      ) : (
        <>
          <KpiStrip
            label="Indicadores da carteira"
            className="mb-6"
            items={[
              {
                id: 'receita',
                label: 'Receita do mês',
                value: `R$ ${activePortfolioRevenue.toLocaleString('pt-BR')}`,
                delta: { text: '▲ 8% no mês', tone: 'success' },
                hint: `Ticket médio R$ 418 · ${students.length + 120} ativos`,
              },
              {
                id: 'pendentes',
                label: 'Check-ins LiveClin pendentes',
                value: pendingCheckinsCount + 10,
                delta: { text: `${pendingCheckinsCount} para responder hoje`, tone: 'warning' },
                active: sameStatuses(statusFilters, ['pendentes', 'atrasados']),
                onClick: () => showStatuses(['pendentes', 'atrasados']),
              },
              {
                id: 'realizados',
                label: 'Check-ins realizados',
                value: completedCheckinsCount + 110,
                delta: { text: 'No prazo', tone: 'success' },
                active: sameStatuses(statusFilters, ['realizados']),
                onClick: () => showStatuses(['realizados']),
              },
              {
                id: 'vencendo',
                label: 'Perto de vencer',
                value: String(expiringSoonCount + 6).padStart(2, '0'),
                delta: { text: `${expiringSoonCount} críticos em 4 dias`, tone: 'danger' },
                active: sameStatuses(statusFilters, ['vencendo']),
                onClick: () => showStatuses(['vencendo']),
              },
              {
                id: 'recuperados',
                label: 'Planos recuperados',
                value: `${recoveredCount + 13}/18`,
                delta: { text: '83% de retenção', tone: 'success' },
                active: sameStatuses(statusFilters, ['recuperados']),
                onClick: () => showStatuses(['recuperados']),
              },
              {
                id: 'nao-renovaram',
                label: 'Não renovaram',
                value: String(nonRenewedCount + 1).padStart(2, '0'),
                delta: { text: 'Ver motivos', tone: 'neutral' },
                active: sameStatuses(statusFilters, ['nao-renovaram']),
                onClick: () => showStatuses(['nao-renovaram']),
              },
            ]}
          />

          <section className="mb-8 grid gap-4 lg:grid-cols-3" aria-label="Prioridades de hoje">
            <PriorityPanel
              id="checkins"
              title="Check-ins para avaliar"
              source="LiveClin"
              total={pendingCheckinsCount}
              onSeeAll={() => onSectionChange?.('checkins')}
            >
              {students
                .filter(
                  (student) =>
                    student.checkinState === 'Pendente' || student.checkinState === 'Atrasado',
                )
                .slice(0, 3)
                .map((student) => (
                  <PriorityRow
                    key={student.id}
                    student={student}
                    meta={
                      <>
                        <Badge tone={checkinTone[student.checkinState]} dot>
                          {student.checkinState}
                        </Badge>
                        <span className="truncate">{student.lastCheckin} via LiveClin</span>
                      </>
                    }
                    footer={<CheckinFeedback student={student} />}
                    action={
                      <Button size="sm" onClick={() => openStudentModal(student.id)}>
                        Avaliar
                      </Button>
                    }
                  />
                ))}
            </PriorityPanel>

            <PriorityPanel
              id="treinos"
              title="Treinos concluídos"
              source="MFIT"
              total={completedCheckinsCount}
              onSeeAll={() => showStatuses(['realizados'])}
            >
              {students
                .filter((student) => student.checkinState === 'Realizado')
                .slice(0, 3)
                .map((student) => {
                  return (
                    <PriorityRow
                      key={student.id}
                      student={student}
                      meta={
                        <span className="truncate">
                          {student.lastWorkoutActivity} · {student.weeklyWorkoutsCompleted}
                        </span>
                      }
                      // Students no longer message coaches in the app: show the workout only.
                      context={student.lastWorkoutTitle}
                      action={
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openStudentModal(student.id, 'treino')}
                        >
                          Ver treino
                        </Button>
                      }
                    />
                  )
                })}
            </PriorityPanel>

            <PriorityPanel
              id="renovacoes"
              title="Vencimentos e renovações"
              source="Retenção"
              total={expiringSoonCount + recoveredCount + nonRenewedCount}
              onSeeAll={() => showStatuses(['vencendo', 'recuperados', 'nao-renovaram'])}
            >
              {students
                .filter(
                  (student) =>
                    student.renewalState === 'Perto de vencer' ||
                    student.renewalState === 'Recuperado' ||
                    student.renewalState === 'Não renovou',
                )
                .slice(0, 3)
                .map((student) => (
                  <PriorityRow
                    key={student.id}
                    student={student}
                    meta={
                      <>
                        <Badge tone={renewalTone[student.renewalState]} dot>
                          {student.renewalState}
                        </Badge>
                        <span className="truncate">Venc. {student.expirationDate}</span>
                      </>
                    }
                    context={
                      student.renewalState === 'Recuperado'
                        ? student.renewedMonths
                          ? `Renovou por ${renewalLabel(student.renewedMonths)} · novo vencimento ${student.expirationDate}.`
                          : 'Renovação confirmada, próximo ciclo liberado.'
                        : student.renewalState === 'Não renovou'
                          ? `Motivo: ${student.nonRenewalReason || 'registrado pela administração.'}`
                          : `Vence em ${student.daysToExpire} ${student.daysToExpire === 1 ? 'dia' : 'dias'}: acionar o aluno.`
                    }
                    action={
                      student.renewalState === 'Perto de vencer' ? (
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() => setRenewingId(student.id)}
                        >
                          Renovar
                        </Button>
                      ) : student.renewalState === 'Não renovou' ? (
                        <Button size="sm" onClick={() => setRenewingId(student.id)}>
                          Recuperar
                        </Button>
                      ) : undefined
                    }
                    extra={
                      renewingId === student.id ? (
                        <RenewalChooser
                          name={student.name}
                          onPick={(months) => recoverStudentPlan(student.id, months)}
                          onCancel={() => setRenewingId(null)}
                        />
                      ) : priorityNonRenewalId === student.id ? (
                        <div className="mt-2 flex flex-col gap-2">
                          <input
                            type="text"
                            value={priorityNonRenewalDraft}
                            onChange={(event) => setPriorityNonRenewalDraft(event.target.value)}
                            placeholder="Motivo (ex.: financeiro, pausa)…"
                            aria-label={`Motivo da não renovação de ${student.name}`}
                            autoFocus
                            className="h-9 rounded-control border border-line bg-surface px-3 text-sm outline-none focus:border-brand"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => markNonRenewed(student.id, priorityNonRenewalDraft)}
                            >
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setPriorityNonRenewalId(null)
                                setPriorityNonRenewalDraft('')
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : student.renewalState !== 'Não renovou' ? (
                        <Button
                          size="sm"
                          variant="danger"
                          className="mt-2"
                          onClick={() => {
                            setPriorityNonRenewalId(student.id)
                            setPriorityNonRenewalDraft(student.nonRenewalReason ?? '')
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="size-3.5"
                            aria-hidden
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M5.6 5.6l12.8 12.8" />
                          </svg>
                          Registrar não renovação
                        </Button>
                      ) : null
                    }
                  />
                ))}
            </PriorityPanel>
          </section>

          <section
            id="carteira-alunos"
            className="min-w-0 scroll-mt-20"
            aria-label="Carteira de alunos"
          >
            {generatedKeyBanner && (
              <div
                role="status"
                className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-success/20 bg-success-soft px-4 py-3"
              >
                <p className="text-sm text-ink">
                  <strong className="font-semibold">
                    Chave gerada para {generatedKeyBanner.studentName}:
                  </strong>{' '}
                  <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[13px] tracking-wider">
                    {generatedKeyBanner.key}
                  </code>
                  <span className="block text-xs text-ink-2">
                    Envie ao aluno para ele criar ou redefinir o login no app.
                  </span>
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => openStudentModal(generatedKeyBanner.studentId)}>
                    Abrir ficha
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setGeneratedKeyBanner(null)}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-end justify-between gap-3">
              <Tabs
                label="Visões salvas da carteira"
                className="min-w-0 flex-1 border-b-0"
                value={activeView.id}
                onChange={(id) => {
                  const view = allViews.find((item) => item.id === id)
                  if (view) applyView(view)
                }}
                items={allViews.map((view) => ({
                  id: view.id,
                  label: view.name,
                  count:
                    view.id === 'todos'
                      ? undefined
                      : students.filter((student) =>
                          passesFilters(student, view.statuses, view.goal, view.search),
                        ).length,
                }))}
              />
              <div className="flex items-center gap-2 pb-1.5">
                {viewModified && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => applyView(activeView)}>
                      Limpar
                    </Button>
                    <Button size="sm" onClick={() => setViewDialogOpen(true)}>
                      Salvar visão
                    </Button>
                  </>
                )}
                {!activeView.builtIn && !viewModified && (
                  <Button size="sm" variant="ghost" onClick={deleteActiveView}>
                    Excluir visão
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 mb-3 flex flex-wrap items-center gap-2">
              <label className="relative min-w-[220px] flex-1 md:max-w-xs">
                <span className="sr-only">Buscar aluno</span>
                <Icon
                  name="search"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar aluno, treino, plano ou fase"
                  className="h-9 w-full rounded-control border border-line bg-surface pr-3 pl-9 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-brand"
                />
              </label>
              <div
                role="radiogroup"
                aria-label="Objetivo"
                className="inline-flex h-9 max-w-full overflow-x-auto rounded-control border border-line bg-surface p-0.5 [scrollbar-width:none]"
              >
                {['Todos', 'Emagrecimento', 'Hipertrofia', 'Performance'].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    role="radio"
                    aria-checked={goalFilter === goal}
                    onClick={() => setGoalFilter(goal)}
                    className={cx(
                      'shrink-0 cursor-pointer rounded-[8px] px-3 text-xs font-semibold transition-colors',
                      goalFilter === goal ? 'bg-night text-white' : 'text-ink-2 hover:text-ink',
                    )}
                  >
                    {goal}
                  </button>
                ))}
              </div>
              <FilterMenu
                label="Status"
                options={statusOptions}
                value={statusFilters}
                onChange={setStatusFilters}
              />
              <span className="ml-auto text-xs text-ink-3 tabular-nums">
                {filteredStudents.length} de {students.length} alunos
              </span>
            </div>

            <Table>
              <THead>
                <tr>
                  <TH>Aluno</TH>
                  <TH>Objetivo · Fase</TH>
                  <TH>Treino (MFIT)</TH>
                  <TH>Check-in (LiveClin)</TH>
                  <TH>Vencimento</TH>
                  <TH className="w-24 text-right">
                    <span className="sr-only">Ações</span>
                  </TH>
                </tr>
              </THead>
              <tbody>
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink-3">
                      Nenhum aluno com esses filtros.{' '}
                      <button
                        type="button"
                        className="cursor-pointer font-semibold text-brand hover:underline"
                        onClick={() => applyView(builtInStudentViews[0])}
                      >
                        Ver todos
                      </button>
                    </td>
                  </tr>
                )}
                {filteredStudents.map((student) => {
                  const accessInfo = getStudentAccessInfo(student, generatedKeysByStudent)
                  const photosCount = getStudentDefaultAppPhotos(student).length
                  return (
                    <TR
                      key={student.id}
                      tabIndex={0}
                      aria-label={`Abrir ficha de ${student.name}`}
                      onClick={() => openStudentModal(student.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && event.target === event.currentTarget)
                          openStudentModal(student.id)
                      }}
                      className={cx(
                        'h-14 cursor-pointer',
                        modalStudent?.id === student.id && 'bg-brand-soft/40',
                      )}
                    >
                      <TD>
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar}
                            alt=""
                            className="size-8 shrink-0 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate font-medium text-ink">
                              {student.name}
                              <span
                                title={
                                  accessInfo.hasLogin
                                    ? `Login ativo: ${accessInfo.loginEmail}`
                                    : accessInfo.accessKey
                                      ? `Sem login · chave ${accessInfo.accessKey}`
                                      : 'Sem login no app'
                                }
                                className={accessInfo.hasLogin ? 'text-success' : 'text-ink-3'}
                              >
                                <Icon name="key" className="size-3.5" />
                                <span className="sr-only">
                                  {accessInfo.hasLogin ? 'Login ativo' : 'Sem login'}
                                </span>
                              </span>
                            </p>
                            <p className="truncate text-xs text-ink-3">
                              Plano {student.plan} · R$ {student.monthlyRevenue}/mês
                            </p>
                          </div>
                        </div>
                      </TD>
                      <TD>
                        <p className="text-ink">{student.goal}</p>
                        <p className="text-xs text-ink-3">{student.phase}</p>
                      </TD>
                      <TD>
                        <p className="text-ink">
                          {student.lastWorkoutActivity.replace('Treinou ', '')}
                        </p>
                        <p className="text-xs text-ink-3">
                          {student.weeklyWorkoutsCompleted.replace(' na semana', '/sem.')}
                        </p>
                      </TD>
                      <TD>
                        <Badge tone={checkinTone[student.checkinState]} dot>
                          {student.checkinState}
                        </Badge>
                        <p className="mt-0.5 text-xs text-ink-3">{student.lastCheckin}</p>
                      </TD>
                      <TD>
                        <p className="text-ink">{student.expirationDate}</p>
                        <p
                          className={cx(
                            'text-xs',
                            student.renewalState === 'Perto de vencer' &&
                              'font-medium text-warning',
                            student.renewalState === 'Não renovou' && 'font-medium text-danger',
                            student.renewalState === 'Recuperado' && 'font-medium text-success',
                            student.renewalState === 'Em dia' && 'text-ink-3',
                          )}
                          title={student.nonRenewalReason || undefined}
                        >
                          {student.renewalState === 'Perto de vencer'
                            ? `em ${student.daysToExpire} ${student.daysToExpire === 1 ? 'dia' : 'dias'}`
                            : student.renewalState}
                        </p>
                      </TD>
                      <TD className="text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <a
                            href={buildWhatsAppUrl(student.whatsapp, student.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`WhatsApp de ${student.name}`}
                            aria-label={`Conversar com ${student.name} no WhatsApp`}
                            className="grid size-8 place-items-center rounded-control text-success transition-colors hover:bg-success-soft [&_svg]:size-4"
                          >
                            <WhatsAppIcon />
                          </a>
                          <Menu
                            label={`Ações de ${student.name}`}
                            items={[
                              {
                                id: 'ficha',
                                label: 'Abrir ficha',
                                icon: <Icon name="students" className="size-4" />,
                                onSelect: () => openStudentModal(student.id),
                              },
                              {
                                id: 'fotos',
                                label: `Fotos e comparador (${photosCount})`,
                                icon: <Icon name="photo" className="size-4" />,
                                onSelect: () => openStudentModal(student.id, 'fotos'),
                              },
                              {
                                id: 'chave',
                                label: 'Gerar chave de acesso',
                                icon: <Icon name="key" className="size-4" />,
                                onSelect: () => generateAccessKeyForStudent(student),
                              },
                              ...(student.checkinState !== 'Realizado'
                                ? [
                                    {
                                      id: 'concluir',
                                      label: 'Marcar check-in como avaliado',
                                      icon: <Icon name="check" className="size-4" />,
                                      onSelect: () => completeCheckin(student.id),
                                    },
                                  ]
                                : []),
                            ]}
                            trigger={({ open, toggle, id }) => (
                              <button
                                type="button"
                                onClick={toggle}
                                aria-haspopup="menu"
                                aria-expanded={open}
                                aria-controls={open ? id : undefined}
                                aria-label={`Mais ações para ${student.name}`}
                                className="grid size-8 cursor-pointer place-items-center rounded-control text-ink-3 transition-colors hover:bg-line-subtle hover:text-ink"
                              >
                                <Icon name="dots" className="size-4" />
                              </button>
                            )}
                          />
                        </div>
                      </TD>
                    </TR>
                  )
                })}
              </tbody>
            </Table>
          </section>
        </>
      )}

      {viewDialogOpen && (
        <NameDialog
          title="Salvar visão da carteira"
          description="Guarda os filtros atuais (status, objetivo e busca) como uma aba."
          label="Nome da visão"
          confirmLabel="Salvar visão"
          takenNames={allViews.map((view) => view.name)}
          onCancel={() => setViewDialogOpen(false)}
          onConfirm={(name) => {
            saveCurrentAsView(name)
            setViewDialogOpen(false)
          }}
        />
      )}

      {modalStudent && modalLiveClin && modalWorkoutPlan && modalDietPlan && modalAccessInfo && (
        <div
          className="student-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Ficha completa de acompanhamento de ${modalStudent.name}`}
          onClick={() => setModalStudentId(null)}
        >
          <div className="student-modal-dialog" onClick={(event) => event.stopPropagation()}>
            <header className="student-modal-header">
              <div className="student-modal-identity">
                <img src={modalStudent.avatar} alt={`Foto de ${modalStudent.name}`} />
                <div>
                  <span>FICHA DO ALUNO</span>
                  <h2>{modalStudent.name}</h2>
                  <p>
                    {modalStudent.goal} ({modalStudent.phase}) · Plano {modalStudent.plan} ·{' '}
                    <strong>R$ {modalStudent.monthlyRevenue}/mês</strong>
                  </p>
                </div>
              </div>
              <div className="student-modal-top-actions">
                <button
                  type="button"
                  className="modal-generate-key-btn"
                  onClick={() => generateAccessKeyForStudent(modalStudent)}
                >
                  Gerar chave de acesso
                </button>
                {onNotifyStudent && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onNotifyStudent(modalStudent.id)}
                    title={`Enviar notificação no app para ${modalStudent.name}`}
                  >
                    <Icon name="bell" className="size-4" /> Notificar
                  </Button>
                )}
                <a
                  href={buildWhatsAppUrl(modalStudent.whatsapp, modalStudent.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-whatsapp-cta"
                  title={`Conversar com ${modalStudent.name} no WhatsApp`}
                  aria-label={`Conversar com ${modalStudent.name} no WhatsApp`}
                >
                  <WhatsAppIcon />
                </a>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setModalStudentId(null)}
                  aria-label="Fechar ficha de acompanhamento"
                >
                  ✕ Fechar
                </button>
              </div>
            </header>

            <div className="ficha-stack">
              <section className="student-modal-highlights">
                <div>
                  <span>ÚLTIMA ATIVIDADE DE TREINO (MFIT)</span>
                  <strong>{modalStudent.lastWorkoutActivity}</strong>
                  <small>
                    {modalStudent.lastWorkoutTitle} ({modalStudent.weeklyWorkoutsCompleted})
                  </small>
                </div>
                <div>
                  <span>CHECK-IN SEMANAL (LIVECLIN)</span>
                  <strong>{modalStudent.checkinState}</strong>
                  <small>{modalLiveClin.submittedAt}</small>
                  {onOpenCheckin && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2 self-start"
                      onClick={() => {
                        const id = modalStudent.id
                        setModalStudentId(null)
                        onOpenCheckin(id)
                      }}
                    >
                      Ver check-in →
                    </Button>
                  )}
                </div>
                <div>
                  <span>STATUS DE RENOVAÇÃO</span>
                  <strong>
                    {modalStudent.renewalState}
                    {modalStudent.renewalState === 'Recuperado' &&
                      modalStudent.renewedMonths &&
                      ` · ${renewalLabel(modalStudent.renewedMonths)}`}
                  </strong>
                  <small>Vencimento: {modalStudent.expirationDate}</small>
                  {renewingId !== modalStudent.id && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setRenewingId(modalStudent.id)}
                      >
                        <Icon name="check" className="size-3.5" />
                        {modalStudent.renewalState === 'Recuperado' ? 'Renovar de novo' : 'Renovar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setNonRenewalOpenForId(
                            nonRenewalOpenForId === modalStudent.id ? null : modalStudent.id,
                          )
                          setNonRenewalDraft(modalStudent.nonRenewalReason ?? '')
                        }}
                      >
                        {modalStudent.renewalState === 'Não renovou'
                          ? 'Editar motivo'
                          : 'Não renovou'}
                      </Button>
                    </div>
                  )}
                  {renewingId === modalStudent.id && (
                    <RenewalChooser
                      name={modalStudent.name}
                      onPick={(months) => recoverStudentPlan(modalStudent.id, months)}
                      onCancel={() => setRenewingId(null)}
                    />
                  )}
                </div>
              </section>

              {modalStudent.renewalState === 'Não renovou' &&
                modalStudent.nonRenewalReason &&
                nonRenewalOpenForId !== modalStudent.id && (
                  <div className="inspector-nonrenewal-box">
                    <span>MOTIVO DA NÃO RENOVAÇÃO (REGISTRADO PELO ADMIN)</span>
                    <p>{modalStudent.nonRenewalReason}</p>
                  </div>
                )}
              {nonRenewalOpenForId === modalStudent.id && (
                <div className="modal-non-renewal-box">
                  <label>
                    <span>Motivo da não renovação (preenchido pelo Admin)</span>
                    <textarea
                      rows={2}
                      value={nonRenewalDraft}
                      onChange={(event) => setNonRenewalDraft(event.target.value)}
                      placeholder="Ex.: Pausa financeira, mudança para consultoria presencial, viagem..."
                      autoFocus
                    />
                  </label>
                  <div>
                    <button
                      type="button"
                      onClick={() => markNonRenewed(modalStudent.id, nonRenewalDraft)}
                    >
                      Salvar motivo da não renovação
                    </button>
                    <button
                      type="button"
                      className="cancel"
                      onClick={() => setNonRenewalOpenForId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {(() => {
                const open = sectionsOpenFor(modalStudent.id)
                const toggle = (id: FichaTab) => {
                  if (open.includes(id)) {
                    setSectionsFor(
                      modalStudent.id,
                      open.filter((item) => item !== id),
                    )
                  } else {
                    setSectionsFor(modalStudent.id, [...open, id])
                    setModalTab(id)
                  }
                }
                return (
                  <>
                    <FichaSection
                      id="treino"
                      title="Treino"
                      open={open.includes('treino')}
                      onToggle={() => toggle('treino')}
                      summary={`${modalWorkoutPlan.splitName} · ${modalWorkoutPlan.frequency}`}
                    >
                      <section className="modal-plan-view" aria-label="Treino atual do aluno">
                        <header className="modal-plan-banner">
                          <div>
                            <span>PRESCRIÇÃO DE TREINO ATIVA NO MFIT</span>
                            <h3>{modalWorkoutPlan.splitName}</h3>
                            <p>{modalWorkoutPlan.technicalGuideline}</p>
                          </div>
                          <div className="modal-plan-kpis">
                            <div>
                              <span>FREQUÊNCIA SEMANAL</span>
                              <strong>{modalWorkoutPlan.frequency}</strong>
                            </div>
                            <div>
                              <span>PRESCRIÇÃO DE CARDIO / AERÓBICO</span>
                              <strong>{modalWorkoutPlan.cardioPrescription}</strong>
                            </div>
                          </div>
                        </header>

                        <div className="workout-sessions-grid">
                          {modalWorkoutPlan.sessions.map((session) => (
                            <article key={session.code} className="workout-session-card">
                              <header>
                                <div>
                                  <span>{session.code}</span>
                                  <h4>{session.title}</h4>
                                </div>
                                <em>{session.schedule}</em>
                              </header>

                              <div className="workout-exercise-list">
                                {session.exercises.map((exercise) => (
                                  <div key={exercise.name} className="workout-exercise-row">
                                    <div>
                                      <strong>{exercise.name}</strong>
                                      <small>{exercise.loadNote}</small>
                                    </div>
                                    <div className="workout-exercise-meta">
                                      <span>{exercise.sets}</span>
                                      <em>Descanso: {exercise.rest}</em>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    </FichaSection>

                    <FichaSection
                      id="dieta"
                      title="Dieta"
                      open={open.includes('dieta')}
                      onToggle={() => toggle('dieta')}
                      summary={`${modalDietPlan.strategyName} · ${modalDietPlan.dailyCalories}`}
                    >
                      <section className="modal-plan-view" aria-label="Dieta atual do aluno">
                        <header className="modal-plan-banner">
                          <div>
                            <span>PLANO ALIMENTAR ATIVO NO WEBDIET</span>
                            <h3>{modalDietPlan.strategyName}</h3>
                            <p>Suplementação: {modalDietPlan.supplements}</p>
                          </div>
                          <div className="diet-macros-strip">
                            <div>
                              <span>META CALÓRICA</span>
                              <strong>{modalDietPlan.dailyCalories}</strong>
                            </div>
                            <div>
                              <span>PROTEÍNAS</span>
                              <strong>{modalDietPlan.proteinTarget}</strong>
                            </div>
                            <div>
                              <span>CARBOIDRATOS</span>
                              <strong>{modalDietPlan.carbsTarget}</strong>
                            </div>
                            <div>
                              <span>GORDURAS & ÁGUA</span>
                              <strong>
                                {modalDietPlan.fatTarget} · {modalDietPlan.waterTarget}
                              </strong>
                            </div>
                          </div>
                        </header>

                        <MacroBar
                          protein={modalDietPlan.proteinTarget}
                          carbs={modalDietPlan.carbsTarget}
                          fat={modalDietPlan.fatTarget}
                        />

                        <div className="diet-meals-grid">
                          {modalDietPlan.meals.map((meal) => (
                            <article key={meal.title} className="diet-meal-card">
                              <header>
                                <div>
                                  <span>{meal.time}</span>
                                  <h4>{meal.title}</h4>
                                </div>
                                <em>{meal.macros}</em>
                              </header>
                              <ul>
                                {meal.items.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                              <details className="group mt-3 rounded-control border border-line bg-subtle/50">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-ink-2 [&::-webkit-details-marker]:hidden">
                                  Opções de substituição
                                  <Icon
                                    name="chevronRight"
                                    className="size-3.5 text-ink-3 transition-transform group-open:rotate-90"
                                  />
                                </summary>
                                <ul className="space-y-1 border-t border-line-subtle px-3 py-2 text-xs leading-5 text-ink-2">
                                  {meal.substitutions
                                    .split(/(?<=\.)\s+|;\s*|\n+/)
                                    .map((option) => option.trim())
                                    .filter(Boolean)
                                    .map((option) => (
                                      <li key={option}>• {option}</li>
                                    ))}
                                </ul>
                              </details>
                            </article>
                          ))}
                        </div>
                      </section>
                    </FichaSection>

                    <FichaSection
                      id="fotos"
                      title="Fotos e evolução"
                      open={open.includes('fotos')}
                      onToggle={() => toggle('fotos')}
                      badge={
                        <span className="text-xs text-ink-3 tabular-nums">
                          {modalAppPhotos.length}
                        </span>
                      }
                      summary={`Peso atual ${weightLabel(modalLiveClin)}`}
                    >
                      <div className="mb-5">
                        <WeightTrend photos={modalAppPhotos} current={weightLabel(modalLiveClin)} />
                      </div>
                      <section
                        className="student-photos-comparator-view"
                        aria-label={`Fotos enviadas pelo aplicativo e comparador de ${modalStudent.name}`}
                      >
                        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-[15px] font-semibold text-ink">
                              Comparador Antes × Depois
                            </h3>
                            <p className="text-xs text-ink-3">
                              Fotos enviadas por {modalStudent.name} no app · escolha A e B nas
                              miniaturas abaixo
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div
                              role="radiogroup"
                              aria-label="Modo de comparação"
                              className="inline-flex h-9 rounded-control border border-line bg-surface p-0.5"
                            >
                              {(
                                [
                                  ['side-by-side', 'Lado a lado'],
                                  ['slider', 'Slider'],
                                ] as const
                              ).map(([mode, label]) => (
                                <button
                                  key={mode}
                                  type="button"
                                  role="radio"
                                  aria-checked={compareMode === mode}
                                  onClick={() => setCompareMode(mode)}
                                  className={`cursor-pointer rounded-[8px] px-3 text-xs font-semibold transition-colors ${compareMode === mode ? 'bg-night text-white' : 'text-ink-2 hover:text-ink'}`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-pressed={blurThumbs}
                              onClick={() => setBlurThumbs((current) => !current)}
                              title="Desfoca as miniaturas até passar o mouse (útil em reuniões)"
                            >
                              <Icon name={blurThumbs ? 'eye' : 'eyeOff'} className="size-4" />
                              {blurThumbs ? 'Mostrar miniaturas' : 'Desfocar miniaturas'}
                            </Button>
                            <Button size="sm" onClick={() => setAddPhotoFormOpen((open) => !open)}>
                              <Icon name="plus" className="size-4" /> Nova foto
                            </Button>
                            {photoBefore && photoAfter && (
                              <Menu
                                label="Baixar comparação"
                                items={exportTemplates.map((template) => ({
                                  id: template.id,
                                  label: template.label,
                                  description: template.description,
                                  onSelect: async () => {
                                    setExportError('')
                                    setExportingTemplate(template.id)
                                    const short = (label: string) => label.split('·')[0].trim()
                                    try {
                                      await downloadComparison(
                                        template,
                                        {
                                          before: {
                                            url: photoBefore.imageUrl,
                                            date: short(photoBefore.dateLabel),
                                            weight: photoBefore.weightKg,
                                            label: 'Antes',
                                          },
                                          after: {
                                            url: photoAfter.imageUrl,
                                            date: short(photoAfter.dateLabel),
                                            weight: photoAfter.weightKg,
                                            label: 'Depois',
                                          },
                                          studentName: modalStudent.name.split(' ')[0],
                                          accent:
                                            getComputedStyle(document.documentElement)
                                              .getPropertyValue('--elevn-accent')
                                              .trim() || '#6b5f2a',
                                        },
                                        `elevn-${modalStudent.id.replace('student-', '')}-antes-depois-${template.id}.png`,
                                      )
                                    } catch {
                                      setExportError(
                                        'Não foi possível gerar a imagem com estas fotos. Tente outro par ou envie as fotos de novo.',
                                      )
                                    } finally {
                                      setExportingTemplate(null)
                                    }
                                  },
                                }))}
                                trigger={({ open, toggle, id }) => (
                                  <Button
                                    size="sm"
                                    variant="accent"
                                    onClick={toggle}
                                    aria-haspopup="menu"
                                    aria-expanded={open}
                                    aria-controls={open ? id : undefined}
                                    disabled={!!exportingTemplate}
                                  >
                                    <Icon name="download" className="size-4" />
                                    {exportingTemplate ? 'Gerando…' : 'Baixar'}
                                  </Button>
                                )}
                              />
                            )}
                          </div>
                        </header>
                        {exportError && (
                          <p
                            role="alert"
                            className="mb-3 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
                          >
                            {exportError}
                          </p>
                        )}

                        {addPhotoFormOpen && (
                          <form className="add-app-photo-form" onSubmit={handleAddStudentAppPhoto}>
                            <div className="add-app-photo-head">
                              <strong>Adicionar foto de evolução</strong>
                              <button type="button" onClick={() => setAddPhotoFormOpen(false)}>
                                Fechar
                              </button>
                            </div>

                            <div className="add-app-photo-grid">
                              <label>
                                <span>Pose / Ângulo</span>
                                <select
                                  value={newPhotoAngle}
                                  onChange={(e) =>
                                    setNewPhotoAngle(e.target.value as StudentPhotoAngle)
                                  }
                                >
                                  <option value="Frente">Frente</option>
                                  <option value="Costas">Costas</option>
                                  <option value="Perfil Direito">Perfil Direito</option>
                                  <option value="Pós-Treino">Pós-Treino</option>
                                </select>
                              </label>
                              <label>
                                <span>Data da foto</span>
                                <input
                                  type="date"
                                  value={newPhotoDate}
                                  max={new Date().toISOString().slice(0, 10)}
                                  onChange={(e) => setNewPhotoDate(e.target.value)}
                                  aria-describedby="photo-date-hint"
                                />
                                <small
                                  id="photo-date-hint"
                                  style={{ fontSize: 11, color: 'var(--color-ink-3)' }}
                                >
                                  Em branco: hoje
                                </small>
                              </label>
                              <label>
                                <span>Etapa / Ciclo</span>
                                <input
                                  type="text"
                                  value={newPhotoCycle}
                                  onChange={(e) => setNewPhotoCycle(e.target.value)}
                                  placeholder="Ex.: Check-in Semana 14"
                                />
                              </label>
                              <label>
                                <span>Peso no dia da foto</span>
                                <input
                                  type="text"
                                  value={newPhotoWeight}
                                  onChange={(e) => setNewPhotoWeight(e.target.value)}
                                  placeholder="Ex.: 77,2 kg"
                                />
                              </label>
                              <label className="upload-file-label">
                                <span>Subir foto do dispositivo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleNewPhotoFileUpload}
                                />
                              </label>
                            </div>

                            <label className="add-app-photo-note">
                              <span>Observação enviada pelo aluno junto com a foto</span>
                              <input
                                type="text"
                                value={newPhotoNote}
                                onChange={(e) => setNewPhotoNote(e.target.value)}
                                placeholder="Ex.: Foto tirada em jejum pela manhã após concluir a semana 14..."
                              />
                            </label>

                            <div className="add-app-photo-foot">
                              <button type="submit">
                                Salvar foto na galeria do aluno e comparar
                              </button>
                            </div>
                          </form>
                        )}

                        {photoBefore && photoAfter && (
                          <ComparisonDeltas before={photoBefore} after={photoAfter} />
                        )}
                        {/* PALCO DO COMPARADOR DE FOTOS (LADO A LADO OU SLIDER) */}
                        {photoBefore && photoAfter && (
                          <div className="comparator-stage-card">
                            {compareMode === 'side-by-side' ? (
                              <div className="comparator-side-by-side-grid">
                                <article className="comparator-photo-pane before">
                                  <div className="pane-top-badges">
                                    <span className="pane-tag before-tag">FOTO A · ANTES</span>
                                    <span className="pane-angle">{photoBefore.angle}</span>
                                    <span className="pane-weight">{photoBefore.weightKg}</span>
                                  </div>
                                  <div className="pane-image-frame">
                                    <img
                                      src={photoBefore.imageUrl}
                                      alt={`Foto Antes (${photoBefore.angle}) de ${modalStudent.name}`}
                                    />
                                  </div>
                                  <div className="pane-footer-meta">
                                    <strong>{photoBefore.cycleLabel}</strong>
                                    <time>Enviada no App em {photoBefore.dateLabel}</time>
                                    <p>“{photoBefore.studentNote}”</p>
                                  </div>
                                </article>

                                <article className="comparator-photo-pane after">
                                  <div className="pane-top-badges">
                                    <span className="pane-tag after-tag">
                                      FOTO B · DEPOIS (ATUAL)
                                    </span>
                                    <span className="pane-angle">{photoAfter.angle}</span>
                                    <span className="pane-weight">{photoAfter.weightKg}</span>
                                  </div>
                                  <div className="pane-image-frame">
                                    <img
                                      src={photoAfter.imageUrl}
                                      alt={`Foto Depois (${photoAfter.angle}) de ${modalStudent.name}`}
                                    />
                                  </div>
                                  <div className="pane-footer-meta">
                                    <strong>{photoAfter.cycleLabel}</strong>
                                    <time>Enviada no App em {photoAfter.dateLabel}</time>
                                    <p>“{photoAfter.studentNote}”</p>
                                  </div>
                                </article>
                              </div>
                            ) : (
                              <div className="comparator-slider-stage">
                                <div className="slider-instructions-bar">
                                  <span>
                                    Clique e arraste o botão <strong>↔</strong> diretamente sobre a
                                    foto para revelar o <strong>Antes</strong> e o{' '}
                                    <strong>Depois</strong>:
                                  </span>
                                  <div className="slider-quick-positions">
                                    {[
                                      { label: 'Só Depois (0%)', val: 2 },
                                      { label: '25%', val: 25 },
                                      { label: 'Meio a Meio (50%)', val: 50 },
                                      { label: '75%', val: 75 },
                                      { label: 'Só Antes (100%)', val: 98 },
                                    ].map((preset) => (
                                      <button
                                        key={preset.label}
                                        type="button"
                                        className={
                                          Math.abs(sliderPosition - preset.val) <= 3 ? 'active' : ''
                                        }
                                        onClick={() => setSliderPosition(preset.val)}
                                      >
                                        {preset.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div
                                  ref={sliderViewportRef}
                                  className={`slider-viewport ${isDraggingSlider ? 'is-dragging' : ''}`}
                                  onPointerDown={handleSliderPointerDown}
                                  onPointerMove={handleSliderPointerMove}
                                  onPointerUp={handleSliderPointerUp}
                                  onPointerCancel={handleSliderPointerUp}
                                  role="slider"
                                  aria-label="Comparador deslizante Antes e Depois"
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-valuenow={sliderPosition}
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'ArrowLeft') {
                                      e.preventDefault()
                                      setSliderPosition((p) => Math.max(2, p - 5))
                                    } else if (e.key === 'ArrowRight') {
                                      e.preventDefault()
                                      setSliderPosition((p) => Math.min(98, p + 5))
                                    }
                                  }}
                                >
                                  {/* CAMADA DE FUNDO: FOTO B (DEPOIS / ATUAL) EM TAMANHO 100% FIXO */}
                                  <img
                                    src={photoAfter.imageUrl}
                                    alt="Foto Depois"
                                    className="slider-img-after"
                                    draggable={false}
                                  />

                                  {/* CAMADA DE RECORTE CORTINA: FOTO A (ANTES) EM TAMANHO 100% IDÊNTICO COM CLIP-PATH */}
                                  <div
                                    className="slider-before-clip"
                                    style={{
                                      clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                                      WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                                    }}
                                  >
                                    <img
                                      src={photoBefore.imageUrl}
                                      alt="Foto Antes"
                                      className="slider-img-before"
                                      draggable={false}
                                    />
                                  </div>

                                  {/* CAMADA OPCIONAL DE TRANSPARÊNCIA FANTASMA (SE O ADMIN QUISER SOBREPOR COM OPACIDADE) */}
                                  {overlayBlendOpacity > 0 && (
                                    <img
                                      src={photoBefore.imageUrl}
                                      alt=""
                                      aria-hidden="true"
                                      className="slider-img-ghost"
                                      style={{ opacity: overlayBlendOpacity / 100 }}
                                      draggable={false}
                                    />
                                  )}

                                  <div
                                    className="slider-divider-line"
                                    style={{ left: `${sliderPosition}%` }}
                                  >
                                    <span className="slider-handle-circle">
                                      ↔<small>{sliderPosition}%</small>
                                    </span>
                                  </div>

                                  <span className="slider-corner-badge left">
                                    FOTO A (ANTES) · {photoBefore.dateLabel} ·{' '}
                                    {photoBefore.weightKg}
                                  </span>
                                  <span className="slider-corner-badge right">
                                    FOTO B (DEPOIS) · {photoAfter.dateLabel} · {photoAfter.weightKg}
                                  </span>
                                </div>

                                <div className="slider-dual-controls-grid">
                                  <div className="slider-range-control">
                                    <span>Posição da Cortina (Antes × Depois):</span>
                                    <input
                                      type="range"
                                      min={2}
                                      max={98}
                                      value={sliderPosition}
                                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                                      aria-label="Controle deslizante de comparação entre Foto A e Foto B"
                                    />
                                    <strong>{sliderPosition}%</strong>
                                  </div>

                                  <div className="slider-range-control">
                                    <span>Transparência Fantasma (Sobrepor Foto A sobre B):</span>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      value={overlayBlendOpacity}
                                      onChange={(e) =>
                                        setOverlayBlendOpacity(Number(e.target.value))
                                      }
                                      aria-label="Opacidade de sobreposição fantasma"
                                    />
                                    <strong>{overlayBlendOpacity}%</strong>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 rounded-card border border-line bg-surface p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="mr-1 text-xs font-semibold text-ink-3">
                                Mesma pose:
                              </span>
                              {(['Frente', 'Costas', 'Perfil Direito', 'Pós-Treino'] as const).map(
                                (angle) => (
                                  <button
                                    key={angle}
                                    type="button"
                                    onClick={() => pairSameAngleForComparison(angle)}
                                    className={`h-7 cursor-pointer rounded-full border px-2.5 text-xs font-medium transition-colors ${photoBefore?.angle === angle && photoAfter?.angle === angle ? 'border-brand bg-brand-soft text-ink' : 'border-line text-ink-2 hover:border-ink-3'}`}
                                  >
                                    {angle}
                                  </button>
                                ),
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (!photoBefore || !photoAfter) return
                                const prevBefore = photoBefore.id
                                setCompareBeforeId(photoAfter.id)
                                setCompareAfterId(prevBefore)
                              }}
                            >
                              <Icon name="swap" className="size-4" /> Inverter A e B
                            </Button>
                          </div>
                          <ol
                            className={`mt-3 flex gap-3 overflow-x-auto pb-1 ${blurThumbs ? 'blur-thumbs' : ''}`}
                            aria-label="Fotos do aluno, da mais antiga para a mais recente"
                          >
                            {modalAppPhotos.map((photo) => {
                              const isA = photoBefore?.id === photo.id
                              const isB = photoAfter?.id === photo.id
                              return (
                                <li key={photo.id} className="w-28 shrink-0">
                                  <div
                                    className={`relative overflow-hidden rounded-[10px] border-2 ${isA ? 'border-ink-2' : isB ? 'border-brand' : 'border-transparent'}`}
                                  >
                                    <img
                                      src={photo.imageUrl}
                                      alt={`${photo.angle}, ${photo.dateLabel}`}
                                      className="aspect-[3/4] w-full bg-night object-cover"
                                    />
                                    {(isA || isB) && (
                                      <span
                                        className={`absolute top-1.5 left-1.5 rounded-full px-1.5 text-[11px] font-bold text-white ${isA ? 'bg-ink-2' : 'bg-brand'}`}
                                      >
                                        {isA ? 'A' : 'B'}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 truncate text-xs font-medium text-ink">
                                    {photo.angle}
                                  </p>
                                  <p className="truncate text-[11px] text-ink-3">
                                    {photo.dateLabel.split(' · ')[0]} · {photo.weightKg}
                                  </p>
                                  <div className="mt-1 grid grid-cols-2 gap-1">
                                    <button
                                      type="button"
                                      aria-pressed={isA}
                                      onClick={() => setCompareBeforeId(photo.id)}
                                      className={`h-6 cursor-pointer rounded-md border text-[11px] font-semibold ${isA ? 'border-ink-2 bg-ink-2 text-white' : 'border-line text-ink-2 hover:border-ink-3'}`}
                                    >
                                      Antes
                                    </button>
                                    <button
                                      type="button"
                                      aria-pressed={isB}
                                      onClick={() => setCompareAfterId(photo.id)}
                                      className={`h-6 cursor-pointer rounded-md border text-[11px] font-semibold ${isB ? 'border-brand bg-brand text-white' : 'border-line text-ink-2 hover:border-ink-3'}`}
                                    >
                                      Depois
                                    </button>
                                  </div>
                                </li>
                              )
                            })}
                          </ol>
                        </div>
                        {/* GALERIA COMPLETA DE TODAS AS FOTOS ENVIADAS PELO ALUNO NO APLICATIVO */}
                        <div className="student-all-photos-section">
                          <header className="all-photos-header">
                            <div>
                              <span>HISTÓRICO COMPLETO DE FOTOS NO APLICATIVO</span>
                              <h4>
                                Todas as fotos enviadas por {modalStudent.name} (
                                {filteredModalPhotos.length})
                              </h4>
                            </div>

                            <div className="all-photos-filter-pills">
                              {(
                                [
                                  'Todos',
                                  'Frente',
                                  'Costas',
                                  'Perfil Direito',
                                  'Pós-Treino',
                                ] as const
                              ).map((angle) => (
                                <button
                                  key={angle}
                                  type="button"
                                  className={photoAngleFilter === angle ? 'active' : ''}
                                  onClick={() => setPhotoAngleFilter(angle)}
                                >
                                  {angle}
                                </button>
                              ))}
                            </div>
                          </header>

                          <div
                            className={`student-photos-gallery-grid ${blurThumbs ? 'blur-thumbs' : ''}`}
                          >
                            {filteredModalPhotos.map((photo) => {
                              const isBefore = photoBefore?.id === photo.id
                              const isAfter = photoAfter?.id === photo.id
                              return (
                                <article
                                  key={photo.id}
                                  className={`student-photo-card ${isBefore ? 'selected-before' : ''} ${
                                    isAfter ? 'selected-after' : ''
                                  }`}
                                >
                                  <div className="photo-card-thumb">
                                    <img
                                      src={photo.imageUrl}
                                      alt={`${photo.angle} - ${photo.dateLabel}`}
                                    />
                                    <span className="angle-badge">{photo.angle}</span>
                                    <span className="weight-badge">{photo.weightKg}</span>
                                  </div>

                                  <div className="photo-card-body">
                                    <strong>{photo.cycleLabel}</strong>
                                    <time>Enviada em {photo.dateLabel}</time>
                                    <p>“{photo.studentNote}”</p>
                                    {photo.adminObservation && (
                                      <small className="admin-obs">
                                        Nota do Admin: {photo.adminObservation}
                                      </small>
                                    )}
                                  </div>

                                  <footer className="photo-card-compare-actions">
                                    <button
                                      type="button"
                                      className={isBefore ? 'active-before' : ''}
                                      onClick={() => setCompareBeforeId(photo.id)}
                                    >
                                      {isBefore ? '✓ Na Foto A (Antes)' : 'Usar como Foto A'}
                                    </button>
                                    <button
                                      type="button"
                                      className={isAfter ? 'active-after' : ''}
                                      onClick={() => setCompareAfterId(photo.id)}
                                    >
                                      {isAfter ? '✓ Na Foto B (Depois)' : 'Usar como Foto B'}
                                    </button>
                                  </footer>
                                </article>
                              )
                            })}
                          </div>
                        </div>
                      </section>
                    </FichaSection>

                    <FichaSection
                      id="acesso"
                      title="Acesso e plano"
                      open={open.includes('acesso')}
                      onToggle={() => toggle('acesso')}
                      summary={`${modalAccessInfo.hasLogin ? 'Login ativo' : 'Sem login'} · vence ${modalStudent.expirationDate}`}
                    >
                      <section
                        className={`student-access-panel ${modalAccessInfo.hasLogin ? 'has-login' : 'no-login'}`}
                        aria-label="Credenciais e status de login do aluno"
                      >
                        <div className="student-access-status">
                          <span>STATUS DE ACESSO & LOGIN DO ALUNO</span>
                          <div>
                            <em
                              className={
                                modalAccessInfo.hasLogin ? 'login-active' : 'login-missing'
                              }
                            >
                              {modalAccessInfo.hasLogin ? 'Possui login ativo' : 'Não possui login'}
                            </em>
                            <strong>
                              {modalAccessInfo.hasLogin
                                ? `E-mail cadastrado: ${modalAccessInfo.loginEmail}`
                                : 'Aluno ainda não possui login com e-mail cadastrado'}
                            </strong>
                          </div>
                          <small>
                            {modalAccessInfo.accessKey
                              ? `Chave de acesso atual: ${modalAccessInfo.accessKey} (${modalAccessInfo.accessKeyGeneratedAt || 'Ativa'})`
                              : 'Nenhuma chave de acesso gerada para este aluno ainda.'}
                          </small>
                        </div>

                        <div className="student-access-actions">
                          <div className="student-access-key-box">
                            <span>CHAVE DE ACESSO</span>
                            <code>{modalAccessInfo.accessKey ?? 'Não gerada'}</code>
                          </div>
                          <button
                            type="button"
                            className="generate-key-primary"
                            onClick={() => generateAccessKeyForStudent(modalStudent)}
                          >
                            Gerar chave de acesso
                          </button>
                          {!modalAccessInfo.hasLogin && (
                            <form
                              className="student-link-email-form"
                              onSubmit={(event) => {
                                event.preventDefault()
                                saveStudentLoginEmail(modalStudent.id, loginEmailDraft)
                              }}
                            >
                              <input
                                type="email"
                                value={loginEmailDraft}
                                onChange={(event) => setLoginEmailDraft(event.target.value)}
                                placeholder="Cadastrar e-mail de login..."
                                aria-label="E-mail de login do aluno"
                              />
                              <button type="submit">Ativar login</button>
                            </form>
                          )}
                        </div>
                      </section>
                    </FichaSection>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
