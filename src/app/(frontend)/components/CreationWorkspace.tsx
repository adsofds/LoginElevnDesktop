'use client'

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import AppPreview, { playlistMeta, playlistMinutes } from './club/AppPreview'
import {
  ChallengeEditorSheet,
  CheckinSheet,
  LiveEventSheet,
  TrackSheet,
  VideoUploadSheet,
  type ChallengeDraft,
  type LiveEvent,
  type VideoDraft,
} from './club/ClubEditors'
import CommunityChallenge from './club/CommunityChallenge'
import { Icon } from './ui/icons'
import { Menu } from './ui/Menu'
import { Tabs } from './ui/Tabs'

export type ClubTab = 'inicio' | 'explorar' | 'comunidade'

/** Track name. Tracks are created by the admin (see ClubTrack). */
export type PlaylistTrackCategory = string

export type ClubTrack = {
  id: string
  name: string
  /** Who it is for, shown under the name ("para quem treina e não recupera bem"). */
  goal: string
  color: string
}

export type HeroAdSlide = {
  id: string
  imageOnly?: boolean
  tagPill: string
  titleHighlight: string
  titleMain: string
  presenterOrSponsor: string
  ctaLabel: string
  dateBadge: string
  secondaryPill: string
  coverUrl: string
}

export type PlaylistLessonVideo = {
  id: string
  numberLabel: string
  title: string
  description: string
  durationMinutes: string
  coverUrl: string
  videoFileName: string
  publishedAt: string
  watchProgressPercent?: number
  stoppedAtLabel?: string
  lastWatchedLabel?: string
  /** The video can be 4:3 or 16:9; the cover is always 4:3. */
  aspectRatio?: '4:3' | '16:9'
  /** Optional PDF the student downloads with the lesson. */
  materialName?: string
}

export type StudentPlaylist = {
  id: string
  title: string
  shortUpperTitle: string
  trackCategory: PlaylistTrackCategory
  description: string
  accentColor: string
  coverUrl: string
  completionRate: number
  studentsWatching: number
  lessons: PlaylistLessonVideo[]
}

export type GymRatsRankingEntry = {
  id: string
  name: string
  avatar: string
  workoutsPaid: number
  cardioDone: number
  mealsLogged: number
  waterDays: number
  streakDays: number
  points: number
  goalBadge: string
}

/** Activity name as configured in the challenge. */
export type GymRatsActivityKind = string

/** Something students can register in a challenge, with the points it is worth. */
export type ChallengeActivity = {
  id: string
  icon: string
  name: string
  points: number
  requiresPhoto: boolean
  /** How many times per day it can score. */
  dailyLimit: number
  rule?: string
}

export type GymRatsCheckinPost = {
  id: string
  challengeId: string
  studentName: string
  studentAvatar: string
  activityKind: GymRatsActivityKind
  workoutOrMealTag: string
  pointsEarned: number
  title: string
  note: string
  photoUrl4x3: string
  timeLabel: string
  cheersCount: number
  cheeredByMe?: boolean
  activityId?: string
  activityIcon?: string
  /** Real timestamp (set on load for the demo seeds, from dayOffset/time). */
  postedAtIso?: string
  dayOffset?: number
  time?: string
  /** Check-ins are approved automatically; the admin can reject with a reason. */
  status?: 'aprovado' | 'reprovado'
  rejectReason?: string
  highlighted?: boolean
  /** Automatic badge shown on the post, e.g. "14 dias seguidos". */
  achievement?: string
}

export type GymRatsChallenge = {
  id: string
  title: string
  periodLabel: string
  participantsCount: number
  description: string
  coverUrl: string
  prizeFirst: string
  prizeSecond: string
  prizeThird: string
  rules: string[]
  activities: ChallengeActivity[]
  startIso?: string
  endIso?: string
  /** Demo seeds: start relative to today and length, resolved on load. */
  startOffset?: number
  lengthDays?: number
}

const studioCoverPresets4x3: { label: string; url: string; accent: string }[] = [
  {
    label: 'Força & Halteres Elevn',
    url: 'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    accent: '#6b6133',
  },
  {
    label: 'Biomecânica & Execução',
    url: 'https://images.unsplash.com/photo-1672344048213-76b6e77304bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    accent: '#1d1936',
  },
  {
    label: 'Nutrição & Marmitas',
    url: 'https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    accent: '#2f5e48',
  },
  {
    label: 'Performance & Corrida',
    url: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    accent: '#4f461e',
  },
  {
    label: 'Suplementação & Estúdio',
    url: 'https://images.unsplash.com/photo-1734630341082-0fec0e10126c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    accent: '#786b36',
  },
  {
    label: 'Bowl & Dieta Flexível',
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    accent: '#375847',
  },
]

const initialHeroAds: HeroAdSlide[] = [
  {
    id: 'ad-slide-1',
    imageOnly: false,
    tagPill: 'DESTAQUE DO MÊS · PUBLICIDADE',
    titleHighlight: 'Você no comando do resultado:',
    titleMain: 'protocolo de suplementação e ajustes de treino para o novo ciclo Elevn!',
    presenterOrSponsor: 'com Dr. Breno Monteiro & Parceiro Oficial Dux (Cupom ELEVN18)',
    ctaLabel: 'GARANTA SEU DESCONTO!',
    dateBadge: '28/04/2026',
    secondaryPill: 'EXCLUSIVO NO ELEVN CLUB',
    coverUrl:
      'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'ad-slide-2',
    imageOnly: false,
    tagPill: 'CAMPANHA DE RENOVAÇÃO VIP',
    titleHighlight: 'Plano Semestral Elevn Black:',
    titleMain: 'garanta 6 meses de acompanhamento integrado MFIT + WebDiet + LiveClin.',
    presenterOrSponsor: 'Condição especial para alunos ativos da consultoria',
    ctaLabel: 'RENOVAR COM DESCONTO',
    dateBadge: 'VAGAS LIMITADAS',
    secondaryPill: 'BÔNUS AVALIAÇÃO FÍSICA',
    coverUrl:
      'https://images.unsplash.com/photo-1502904550040-7534597429ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
]

const initialPlaylists: StudentPlaylist[] = [
  {
    id: 'pl-superiores',
    title: 'Execução de Membros Superiores',
    shortUpperTitle: 'MEMBROS SUPERIORES',
    trackCategory: 'Treino & Biomecânica',
    description:
      'Ajustes de escápula, ângulo de cotovelo e controle excêntrico para Treino A e Treino B.',
    accentColor: '#6b6133',
    coverUrl:
      'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    completionRate: 68,
    studentsWatching: 184,
    lessons: [
      {
        id: 'les-1',
        numberLabel: '001',
        title: 'Como estabilizar a escápula na Puxada Frontal e Remada Baixa',
        description:
          'Evite roubar com bíceps e trapézio superior durante as séries principais do Treino B.',
        durationMinutes: '08 MIN',
        coverUrl:
          'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        videoFileName: '001-escapula-puxada-4x3.mp4',
        publishedAt: 'Publicado hoje',
        watchProgressPercent: 65,
        stoppedAtLabel: 'Parou em 05:12 · Faltam 3 min',
        lastWatchedLabel: 'Visto hoje às 08:40',
      },
      {
        id: 'les-2',
        numberLabel: '002',
        title: 'Supino Inclinado com Halteres: ângulo do banco e proteção do ombro',
        description:
          'Posicionamento seguro da articulação glenoumeral para progredir carga no Treino A.',
        durationMinutes: '11 MIN',
        coverUrl:
          'https://images.unsplash.com/photo-1672344048213-76b6e77304bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        videoFileName: '002-supino-inclinado-4x3.mp4',
        publishedAt: 'Há 2 dias',
        watchProgressPercent: 100,
        lastWatchedLabel: 'Concluído ontem às 19:15',
      },
      {
        id: 'les-3',
        numberLabel: '003',
        title: 'Elevação Lateral na Polia vs Halter: tensão constante no deltoide',
        description:
          'Dica prática para encaixar no final do treino de empurrar sem compensar com o tronco.',
        durationMinutes: '06 MIN',
        coverUrl:
          'https://images.unsplash.com/photo-1734630341082-0fec0e10126c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        videoFileName: '003-elevacao-lateral-4x3.mp4',
        publishedAt: 'Há 5 dias',
      },
    ],
  },
  {
    id: 'pl-inferiores',
    title: 'Biomecânica de Inferiores & Glúteos',
    shortUpperTitle: 'BIOMECÂNICA INFERIOR',
    trackCategory: 'Treino & Biomecânica',
    description:
      'Profundidade segura no agachamento, alinhamento de joelhos e ativação de posterior no Treino C.',
    accentColor: '#1f1b38',
    coverUrl:
      'https://images.unsplash.com/photo-1672344048213-76b6e77304bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    completionRate: 54,
    studentsWatching: 162,
    lessons: [
      {
        id: 'les-4',
        numberLabel: '001',
        title: 'Mobilidade de quadril e tornozelo em 4 minutos antes do Agachamento Livre',
        description: 'Sequência obrigatória antes de iniciar o Treino C para destravar amplitude.',
        durationMinutes: '05 MIN',
        coverUrl:
          'https://images.unsplash.com/photo-1672344048213-76b6e77304bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        videoFileName: '001-mobilidade-agachamento-4x3.mp4',
        publishedAt: 'Há 3 dias',
        watchProgressPercent: 40,
        stoppedAtLabel: 'Parou em 02:00 · Faltam 3 min',
        lastWatchedLabel: 'Visto ontem às 17:20',
      },
      {
        id: 'les-5',
        numberLabel: '002',
        title: 'Stiff com Barra vs Búlgaro: onde posicionar o quadril para proteger a lombar',
        description:
          'Correção do erro mais comentado pelos alunos no aplicativo MFIT durante o Treino C.',
        durationMinutes: '09 MIN',
        coverUrl:
          'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        videoFileName: '002-stiff-bulgaro-4x3.mp4',
        publishedAt: 'Há 1 semana',
      },
    ],
  },
  {
    id: 'pl-mobilidade',
    title: 'Core, Postura & Prevenção',
    shortUpperTitle: 'MOBILIDADE & CORE',
    trackCategory: 'Treino & Biomecânica',
    description:
      'Rotinas curtas de 10 minutos para fazer em casa ou antes da musculação pelo celular.',
    accentColor: '#4f461e',
    coverUrl:
      'https://images.unsplash.com/photo-1502904550040-7534597429ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    completionRate: 82,
    studentsWatching: 210,
    lessons: [
      {
        id: 'les-6',
        numberLabel: '001',
        title: 'Ativação de transverso abdominal e estabilidade lombar',
        description: 'Base para manter o abdômen firme em exercícios livres pesados.',
        durationMinutes: '07 MIN',
        coverUrl:
          'https://images.unsplash.com/photo-1502904550040-7534597429ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        videoFileName: '001-core-lombar-4x3.mp4',
        publishedAt: 'Há 4 dias',
        watchProgressPercent: 52,
        stoppedAtLabel: 'Parou em 03:40 · Faltam 3 min',
        lastWatchedLabel: 'Visto ontem às 21:00',
      },
    ],
  },
  {
    id: 'pl-webdiet',
    title: 'Marmitas & Guia Prático WebDiet',
    shortUpperTitle: 'ORGANIZAÇÃO ALIMENTAR',
    trackCategory: 'Nutrição & Rotina que Funciona',
    description:
      'Como pesar alimentos, usar a lista de substituições no WebDiet e montar refeições rápidas.',
    accentColor: '#2f5e48',
    coverUrl:
      'https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    completionRate: 74,
    studentsWatching: 195,
    lessons: [
      {
        id: 'les-7',
        numberLabel: '001',
        title: 'Organizando as 4 refeições da semana em 45 minutos no domingo',
        description:
          'Passo a passo de pesagem cru vs cozido para bater os macronutrientes sem estresse.',
        durationMinutes: '12 MIN',
        coverUrl:
          'https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        videoFileName: '001-marmitas-domingo-4x3.mp4',
        publishedAt: 'Ontem',
        watchProgressPercent: 80,
        stoppedAtLabel: 'Parou em 09:35 · Faltam 2 min',
        lastWatchedLabel: 'Visto hoje às 12:10',
      },
      {
        id: 'les-8',
        numberLabel: '002',
        title: 'Como usar a tabela de equivalências do WebDiet em viagens e restaurantes',
        description: 'Estratégia prática para manter a adesão acima de 90% mesmo fora de casa.',
        durationMinutes: '09 MIN',
        coverUrl:
          'https://images.unsplash.com/photo-1547592180-85f173990554?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        videoFileName: '002-equivalencias-webdiet-4x3.mp4',
        publishedAt: 'Há 6 dias',
        watchProgressPercent: 100,
        lastWatchedLabel: 'Concluído há 2 dias',
      },
    ],
  },
  {
    id: 'pl-onboarding',
    title: 'Boas-vindas & Check-in LiveClin',
    shortUpperTitle: 'PRIMEIROS PASSOS ELEVN',
    trackCategory: 'Nutrição & Rotina que Funciona',
    description:
      'Tudo o que o novo aluno precisa saber para enviar fotos de avaliação e responder o check-in.',
    accentColor: '#5c5228',
    coverUrl:
      'https://images.unsplash.com/photo-1734630341082-0fec0e10126c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    completionRate: 91,
    studentsWatching: 240,
    lessons: [
      {
        id: 'les-9',
        numberLabel: '001',
        title: 'Como responder o Check-in Quinzenal LiveClin e comentar nos treinos pelo celular',
        description: 'Tour rápido de 4 minutos mostrando onde enviar dúvidas do Treino A, B e C.',
        durationMinutes: '04 MIN',
        coverUrl:
          'https://images.unsplash.com/photo-1734630341082-0fec0e10126c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        videoFileName: '001-boas-vindas-liveclin-4x3.mp4',
        publishedAt: 'Fixado no Onboarding',
        watchProgressPercent: 100,
        lastWatchedLabel: 'Concluído no cadastro',
      },
    ],
  },
]

const initialChallenges: GymRatsChallenge[] = [
  {
    id: 'chal-abril',
    title: 'Desafio 30 Dias Consistência Elevn · Abril',
    periodLabel: '01/04/2026 a 30/04/2026 · Faltam 11 dias',
    participantsCount: 28,
    description:
      'Desafio oficial aberto a todos os alunos ativos do aplicativo. Some pontos diariamente com treino feito, cardio pago, refeições do WebDiet e meta de água batida!',
    coverUrl:
      'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    prizeFirst: '1 Mês de Consultoria Elevn Black Grátis + Kit Dux (Whey + Creatina)',
    prizeSecond: '50% OFF na Renovação do Plano + Camiseta Oficial Elevn Club',
    prizeThird: 'Avaliação Física Completa + Coqueteleira & Strap Elevn',
    rules: [
      'Aberto a todos os alunos com acesso ao aplicativo Elevn.',
      'Envie foto 4:3 do treino ou equipamento para validar o Treino Feito do dia.',
      'O Cardio Pago exige registro mínimo de 25 minutos contínuos (esteira, escada, bike ou corrida).',
      'Refeições do plano WebDiet e meta de água (mínimo 35ml/kg) somam pontos extras diários.',
      'Manter 7 dias seguidos sem falhar libera automaticamente o Bônus de Ofensiva.',
    ],
    activities: [
      {
        id: 'abr-1',
        icon: '🏋️',
        name: 'Treino feito',
        points: 100,
        requiresPhoto: true,
        dailyLimit: 1,
        rule: 'Foto do treino ou do equipamento.',
      },
      {
        id: 'abr-2',
        icon: '🏃',
        name: 'Cardio pago',
        points: 70,
        requiresPhoto: true,
        dailyLimit: 1,
        rule: 'Mínimo de 25 minutos contínuos.',
      },
      {
        id: 'abr-3',
        icon: '🥗',
        name: 'Refeição do plano',
        points: 40,
        requiresPhoto: true,
        dailyLimit: 5,
        rule: 'Refeição do WebDiet.',
      },
      {
        id: 'abr-4',
        icon: '💧',
        name: 'Meta de água',
        points: 30,
        requiresPhoto: false,
        dailyLimit: 1,
        rule: 'Mínimo 35 ml/kg.',
      },
      {
        id: 'abr-5',
        icon: '✅',
        name: 'Check-in LiveClin em dia',
        points: 150,
        requiresPhoto: false,
        dailyLimit: 1,
      },
      {
        id: 'abr-6',
        icon: '🔥',
        name: 'Bônus 7 dias seguidos',
        points: 200,
        requiresPhoto: false,
        dailyLimit: 1,
        rule: 'Liberado automaticamente.',
      },
    ],
    startOffset: -18,
    lengthDays: 30,
  },
  {
    id: 'chal-elite',
    title: 'Desafio Hidratação & Dieta 100% no Alvo',
    periodLabel: '15/04/2026 a 15/05/2026 · Aberto a todos no App',
    participantsCount: 34,
    description:
      'Desafio aberto a todos os alunos do aplicativo focado em bater 100% das refeições do WebDiet, meta diária de água e cardio.',
    coverUrl:
      'https://images.unsplash.com/photo-1502904550040-7534597429ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    prizeFirst: 'Mentoria Individual com Dr. Breno + Kit Performance Completo',
    prizeSecond: '30 dias de ajuste semanal prioritário + Pré-treino',
    prizeThird: 'Kit Marmitas Gourmet Semanal + Camiseta Elevn',
    rules: [
      'Aberto a todos os alunos que utilizam o aplicativo Elevn.',
      'Obrigatório registrar 100% dos cardios prescritos e pesagem alimentar no WebDiet.',
    ],
    activities: [
      {
        id: 'eli-1',
        icon: '🏋️',
        name: 'Treino feito',
        points: 120,
        requiresPhoto: true,
        dailyLimit: 1,
        rule: 'Foto do treino ou do equipamento.',
      },
      {
        id: 'eli-2',
        icon: '🏃',
        name: 'Cardio pago',
        points: 100,
        requiresPhoto: true,
        dailyLimit: 1,
        rule: 'Mínimo de 25 minutos contínuos.',
      },
      {
        id: 'eli-3',
        icon: '🥗',
        name: 'Refeição do plano',
        points: 60,
        requiresPhoto: true,
        dailyLimit: 5,
        rule: 'Refeição do WebDiet.',
      },
      {
        id: 'eli-4',
        icon: '💧',
        name: 'Meta de água',
        points: 40,
        requiresPhoto: false,
        dailyLimit: 1,
        rule: 'Mínimo 35 ml/kg.',
      },
      {
        id: 'eli-5',
        icon: '✅',
        name: 'Check-in LiveClin em dia',
        points: 200,
        requiresPhoto: false,
        dailyLimit: 1,
      },
      {
        id: 'eli-6',
        icon: '🔥',
        name: 'Bônus 7 dias seguidos',
        points: 250,
        requiresPhoto: false,
        dailyLimit: 1,
        rule: 'Liberado automaticamente.',
      },
    ],
    startOffset: -10,
    lengthDays: 31,
  },
]

export const initialTracks: ClubTrack[] = [
  {
    id: 'track-treino',
    name: 'Treino & Biomecânica',
    goal: 'Para executar melhor e evoluir carga sem dor',
    color: '#6b6133',
  },
  {
    id: 'track-nutricao',
    name: 'Nutrição & Rotina que Funciona',
    goal: 'Para seguir a dieta na vida real',
    color: '#1f6e50',
  },
  {
    id: 'track-mente',
    name: 'Mentalidade & Performance',
    goal: 'Para manter a constância quando a motivação acaba',
    color: '#28518a',
  },
]

const initialGymRatsLeaderboard: GymRatsRankingEntry[] = [
  {
    id: 'gr-1',
    name: 'Lucas Andrade',
    avatar: '/people/gustavo-lima.jpg',
    workoutsPaid: 22,
    cardioDone: 16,
    mealsLogged: 48,
    waterDays: 20,
    streakDays: 14,
    points: 5840,
    goalBadge: 'Hipertrofia',
  },
  {
    id: 'gr-2',
    name: 'Camila Rocha',
    avatar: '/people/paula-nunes.jpg',
    workoutsPaid: 20,
    cardioDone: 18,
    mealsLogged: 44,
    waterDays: 19,
    streakDays: 11,
    points: 5490,
    goalBadge: 'Emagrecimento',
  },
  {
    id: 'gr-3',
    name: 'Thiago Mendes',
    avatar: '/people/breno-monteiro.png',
    workoutsPaid: 19,
    cardioDone: 15,
    mealsLogged: 41,
    waterDays: 18,
    streakDays: 9,
    points: 5130,
    goalBadge: 'Performance',
  },
  {
    id: 'gr-4',
    name: 'Mariana Costa',
    avatar: '/people/renata-alves.jpg',
    workoutsPaid: 17,
    cardioDone: 12,
    mealsLogged: 39,
    waterDays: 16,
    streakDays: 7,
    points: 4580,
    goalBadge: 'Hipertrofia',
  },
]

const initialGymRatsFeed: GymRatsCheckinPost[] = [
  {
    id: 'post-1',
    challengeId: 'chal-abril',
    studentName: 'Lucas Andrade',
    studentAvatar: '/people/gustavo-lima.jpg',
    activityKind: 'Treino feito',
    activityIcon: '🏋️',
    activityId: 'abr-1',
    workoutOrMealTag: 'Treino B · Dorsal & Bíceps',
    pointsEarned: 100,
    title: 'Dorsal & Bíceps pago antes do trabalho!',
    note: 'Apliquei o ajuste de escápula da aula 001 do Elevn Club e senti muito mais a dorsal.',
    photoUrl4x3:
      'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    timeLabel: 'Hoje · 07:18',
    dayOffset: 0,
    time: '07:18',
    achievement: '14 dias seguidos',
    cheersCount: 18,
    cheeredByMe: true,
  },
  {
    id: 'post-2',
    challengeId: 'chal-abril',
    studentName: 'Camila Rocha',
    studentAvatar: '/people/paula-nunes.jpg',
    activityKind: 'Refeição do plano',
    activityIcon: '🥗',
    activityId: 'abr-3',
    workoutOrMealTag: 'Almoço WebDiet + 3,2L de Água',
    pointsEarned: 70,
    title: 'Marmita pesada na grama + meta de água batida!',
    note: 'Seguindo 100% o guia prático de marmitas da playlist de Nutrição.',
    photoUrl4x3:
      'https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    timeLabel: 'Hoje · 12:40',
    dayOffset: 0,
    time: '12:40',
    achievement: '11 dias seguidos',
    cheersCount: 24,
  },
  {
    id: 'post-3',
    challengeId: 'chal-abril',
    studentName: 'Thiago Mendes',
    studentAvatar: '/people/breno-monteiro.png',
    activityKind: 'Cardio pago',
    activityIcon: '🏃',
    activityId: 'abr-2',
    workoutOrMealTag: 'Corrida 40 min · Z2/Z3',
    pointsEarned: 70,
    title: 'Cardio pago na pista + mobilidade de quadril',
    note: 'Foco total para garantir o pódio do Desafio de Abril.',
    photoUrl4x3:
      'https://images.unsplash.com/photo-1502904550040-7534597429ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    timeLabel: 'Ontem · 19:30',
    dayOffset: -1,
    time: '19:30',
    cheersCount: 15,
  },
  {
    id: 'post-4',
    challengeId: 'chal-abril',
    studentName: 'Mariana Costa',
    studentAvatar: '/people/renata-alves.jpg',
    activityKind: 'Meta de água',
    activityIcon: '💧',
    activityId: 'abr-4',
    workoutOrMealTag: '3,4 L no dia',
    pointsEarned: 30,
    title: 'Garrafa de 2L zerada antes das 15h',
    note: 'Lembrete no celular de hora em hora funcionou.',
    photoUrl4x3: '',
    timeLabel: '',
    dayOffset: -1,
    time: '15:05',
    cheersCount: 7,
  },
  {
    id: 'post-5',
    challengeId: 'chal-abril',
    studentName: 'Lucas Andrade',
    studentAvatar: '/people/gustavo-lima.jpg',
    activityKind: 'Cardio pago',
    activityIcon: '🏃',
    activityId: 'abr-2',
    workoutOrMealTag: 'Bike 30 min · Z2',
    pointsEarned: 70,
    title: 'Bike antes do almoço',
    note: 'Mantive a zona 2 o tempo todo.',
    photoUrl4x3:
      'https://images.unsplash.com/photo-1502904550040-7534597429ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    timeLabel: '',
    dayOffset: -2,
    time: '11:40',
    achievement: '13 dias seguidos',
    cheersCount: 10,
  },
  {
    id: 'post-6',
    challengeId: 'chal-abril',
    studentName: 'Camila Rocha',
    studentAvatar: '/people/paula-nunes.jpg',
    activityKind: 'Treino feito',
    activityIcon: '🏋️',
    activityId: 'abr-1',
    workoutOrMealTag: 'Treino A · Inferiores',
    pointsEarned: 100,
    title: 'Agachamento livre com carga nova',
    note: 'Subi 5 kg mantendo a técnica da aula 002.',
    photoUrl4x3:
      'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    timeLabel: '',
    dayOffset: -2,
    time: '06:50',
    cheersCount: 10,
  },
  {
    id: 'post-7',
    challengeId: 'chal-abril',
    studentName: 'Thiago Mendes',
    studentAvatar: '/people/breno-monteiro.png',
    activityKind: 'Refeição do plano',
    activityIcon: '🥗',
    activityId: 'abr-3',
    workoutOrMealTag: 'Jantar WebDiet',
    pointsEarned: 40,
    title: 'Jantar no ponto mesmo fora de casa',
    note: 'Usei a tabela de equivalências da playlist de Nutrição.',
    photoUrl4x3:
      'https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    timeLabel: '',
    dayOffset: -4,
    time: '20:10',
    cheersCount: 16,
  },
  {
    id: 'post-8',
    challengeId: 'chal-abril',
    studentName: 'Mariana Costa',
    studentAvatar: '/people/renata-alves.jpg',
    activityKind: 'Treino feito',
    activityIcon: '🏋️',
    activityId: 'abr-1',
    workoutOrMealTag: 'Treino C · Posterior',
    pointsEarned: 100,
    title: 'Posterior completo',
    note: 'Primeira semana sem faltar nenhum treino.',
    photoUrl4x3:
      'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    timeLabel: '',
    dayOffset: -6,
    time: '18:30',
    achievement: '7 dias seguidos',
    cheersCount: 22,
  },
]

const dateBR = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** "01/11/2026 a 30/11/2026 · Faltam 11 dias" */
export function challengePeriodLabel(startIso?: string, endIso?: string) {
  if (!startIso || !endIso) return ''
  const start = new Date(startIso)
  const end = new Date(endIso)
  const left = Math.ceil((end.getTime() - Date.now()) / 86_400_000)
  const status =
    Date.now() < start.getTime()
      ? 'Começa em breve'
      : left > 0
        ? `Faltam ${left} dias`
        : 'Encerrado'
  return `${dateBR.format(start)} a ${dateBR.format(end)} · ${status}`
}

type ModalKind = 'none' | 'video' | 'playlist' | 'ad' | 'challenge' | 'gymrats-checkin'

export default function CreationWorkspace({
  tab,
  onTabChange,
}: {
  /** Controlled tab (from the URL). Falls back to local state when omitted. */
  tab?: ClubTab
  onTabChange?: (tab: ClubTab) => void
} = {}) {
  const [localClubTab, setLocalClubTab] = useState<ClubTab>('inicio')
  const clubTab = tab ?? localClubTab
  const setClubTab = (next: ClubTab) => {
    setLocalClubTab(next)
    onTabChange?.(next)
  }
  const [heroAds, setHeroAds] = useState<HeroAdSlide[]>(initialHeroAds)
  const [activeAdIndex, setActiveAdIndex] = useState(0)
  const [playlists, setPlaylists] = useState<StudentPlaylist[]>(initialPlaylists)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)
  const [trackFilter, setTrackFilter] = useState<string>('Todos')
  const [explorePlaylistFilter, setExplorePlaylistFilter] = useState<string>('Todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Estado da Comunidade (GymRats próprio da Elevn com múltiplos desafios, premiações e pontos)
  const [challenges, setChallenges] = useState<GymRatsChallenge[]>(initialChallenges)
  const [activeChallengeId, setActiveChallengeId] = useState<string>(initialChallenges[0].id)
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<GymRatsRankingEntry[]>(initialGymRatsLeaderboard)
  const [gymRatsFeed, setGymRatsFeed] = useState<GymRatsCheckinPost[]>(initialGymRatsFeed)

  // Trilhas, desafios, vídeos e encontros (editados em painéis laterais)
  const [tracks, setTracks] = useState<ClubTrack[]>(initialTracks)
  const [trackSheet, setTrackSheet] = useState<{ open: boolean; track: ClubTrack | null }>({
    open: false,
    track: null,
  })
  const [challengeSheet, setChallengeSheet] = useState<{
    open: boolean
    challenge: GymRatsChallenge | null
  }>({ open: false, challenge: null })
  const [videoSheet, setVideoSheet] = useState<{ open: boolean; playlistId?: string }>({
    open: false,
  })
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [liveOpen, setLiveOpen] = useState(false)
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([])

  // Modais de cadastro direto no Elevn Club
  const [activeModal, setActiveModal] = useState<ModalKind>('none')
  const [editingAdId, setEditingAdId] = useState<string | null>(null)

  // Campos Modal: Playlist
  const [plTitle, setPlTitle] = useState('')
  const [plShortUpper, setPlShortUpper] = useState('')
  const [plTrack, setPlTrack] = useState<PlaylistTrackCategory>(initialTracks[0].name)
  const [plDescription, setPlDescription] = useState('')
  const [plAccent, setPlAccent] = useState('#6b6133')
  const [plCoverUrl, setPlCoverUrl] = useState(studioCoverPresets4x3[0].url)

  // Campos Modal: Anúncio / Destaque Compacto
  const [adImageOnly, setAdImageOnly] = useState(false)
  const [adTagPill, setAdTagPill] = useState('DESTAQUE DO MÊS · PUBLICIDADE')
  const [adTitleHighlight, setAdTitleHighlight] = useState('')
  const [adTitleMain, setAdTitleMain] = useState('')
  const [adPresenter, setAdPresenter] = useState('')
  const [adCtaLabel, setAdCtaLabel] = useState('GARANTA SEU LUGAR!')
  const [adDateBadge, setAdDateBadge] = useState('28/04/2026')
  const [adSecondaryPill, setAdSecondaryPill] = useState('EXCLUSIVO NO ELEVN CLUB')
  const [adCoverUrl, setAdCoverUrl] = useState(studioCoverPresets4x3[0].url)

  const selectedPlaylist = selectedPlaylistId
    ? (playlists.find((item) => item.id === selectedPlaylistId) ?? null)
    : null

  const currentHeroAd = heroAds[activeAdIndex] ?? heroAds[0]
  const [previewOpen, setPreviewOpen] = useState(false)
  const activeChallenge = challenges.find((item) => item.id === activeChallengeId) ?? challenges[0]

  const handleImageFileUpload = (
    event: ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const openUploadVideoModal = (preselectedPlaylistId?: string) =>
    setVideoSheet({
      open: true,
      playlistId: preselectedPlaylistId || selectedPlaylistId || undefined,
    })

  const openNewPlaylistModal = (defaultTrack?: PlaylistTrackCategory) => {
    setPlTitle('')
    setPlShortUpper('')
    setPlTrack(defaultTrack || tracks[0]?.name || '')
    setPlDescription('')
    setPlAccent('#6b6133')
    setPlCoverUrl(studioCoverPresets4x3[1].url)
    setActiveModal('playlist')
  }

  const openAdModal = (slideToEdit?: HeroAdSlide) => {
    if (slideToEdit) {
      setEditingAdId(slideToEdit.id)
      setAdImageOnly(Boolean(slideToEdit.imageOnly))
      setAdTagPill(slideToEdit.tagPill)
      setAdTitleHighlight(slideToEdit.titleHighlight)
      setAdTitleMain(slideToEdit.titleMain)
      setAdPresenter(slideToEdit.presenterOrSponsor)
      setAdCtaLabel(slideToEdit.ctaLabel)
      setAdDateBadge(slideToEdit.dateBadge)
      setAdSecondaryPill(slideToEdit.secondaryPill)
      setAdCoverUrl(slideToEdit.coverUrl)
    } else {
      setEditingAdId(null)
      setAdImageOnly(false)
      setAdTagPill('CAMPANHA EM DESTAQUE')
      setAdTitleHighlight('')
      setAdTitleMain('')
      setAdPresenter('com Dr. Breno Monteiro')
      setAdCtaLabel('ACESSAR OFERTA!')
      setAdDateBadge('30/05/2026')
      setAdSecondaryPill('EXCLUSIVO NO ELEVN CLUB')
      setAdCoverUrl(studioCoverPresets4x3[4].url)
    }
    setActiveModal('ad')
  }

  const openChallengeModal = (challengeToEdit?: GymRatsChallenge) =>
    setChallengeSheet({ open: true, challenge: challengeToEdit ?? null })

  const saveChallenge = (draft: ChallengeDraft) => {
    const label = challengePeriodLabel(draft.startIso, draft.endIso)
    if (challengeSheet.challenge) {
      const id = challengeSheet.challenge.id
      setChallenges((current) =>
        current.map((ch) => (ch.id === id ? { ...ch, ...draft, periodLabel: label } : ch)),
      )
      setToastMessage(`Desafio “${draft.title}” atualizado.`)
    } else {
      const created: GymRatsChallenge = {
        ...draft,
        id: `chal-${Date.now()}`,
        participantsCount: 0,
        periodLabel: label,
      }
      setChallenges((current) => [created, ...current])
      setActiveChallengeId(created.id)
      setToastMessage(`Desafio “${created.title}” criado e aberto a todos no app.`)
    }
    setChallengeSheet({ open: false, challenge: null })
  }

  const saveVideo = (playlistId: string, lesson: VideoDraft) => {
    const target = playlists.find((item) => item.id === playlistId)
    if (!target) return
    const numberLabel = String(target.lessons.length + 1).padStart(3, '0')
    setPlaylists((current) =>
      current.map((pl) =>
        pl.id === playlistId
          ? {
              ...pl,
              lessons: [
                ...pl.lessons,
                { ...lesson, id: `les-${Date.now()}`, numberLabel, publishedAt: 'Publicado agora' },
              ],
            }
          : pl,
      ),
    )
    setVideoSheet({ open: false })
    setToastMessage(
      `Vídeo ${lesson.aspectRatio} “${numberLabel} - ${lesson.title}” publicado em “${target.title}”.`,
    )
  }

  const saveTrack = (track: ClubTrack) => {
    const previous = tracks.find((item) => item.id === track.id)
    if (previous) {
      setTracks((current) => current.map((item) => (item.id === track.id ? track : item)))
      if (previous.name !== track.name) {
        setPlaylists((current) =>
          current.map((pl) =>
            pl.trackCategory === previous.name ? { ...pl, trackCategory: track.name } : pl,
          ),
        )
        if (trackFilter === previous.name) setTrackFilter(track.name)
      }
      setToastMessage(`Trilha “${track.name}” atualizada.`)
    } else {
      setTracks((current) => [...current, track])
      setToastMessage(`Trilha “${track.name}” criada. Adicione a primeira playlist.`)
    }
    setTrackSheet({ open: false, track: null })
  }

  const moveTrack = (id: string, step: -1 | 1) =>
    setTracks((current) => {
      const index = current.findIndex((item) => item.id === id)
      const target = index + step
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const deleteTrack = (track: ClubTrack) => {
    if (playlists.some((pl) => pl.trackCategory === track.name)) return
    setTracks((current) => current.filter((item) => item.id !== track.id))
    if (trackFilter === track.name) setTrackFilter('Todos')
    setToastMessage(`Trilha “${track.name}” excluída.`)
  }

  const handleSavePlaylist = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!plTitle.trim()) return
    const created: StudentPlaylist = {
      id: `pl-${Date.now()}`,
      title: plTitle.trim(),
      shortUpperTitle: (plShortUpper.trim() || plTitle.trim()).toUpperCase(),
      trackCategory: plTrack,
      description: plDescription.trim() || 'Trilha de vídeos 4:3 do Elevn Club.',
      accentColor: plAccent,
      coverUrl: plCoverUrl,
      completionRate: 100,
      studentsWatching: 1,
      lessons: [],
    }
    setPlaylists((current) => [...current, created])
    setActiveModal('none')
    setToastMessage(`Playlist "${created.title}" adicionada ao Elevn Club!`)
  }

  const handleSaveAd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanHighlight = adTitleHighlight.trim() || 'Você no comando:'
    const cleanMain =
      adTitleMain.trim() || 'confira a nova campanha exclusiva para alunos no Elevn Club!'

    if (editingAdId) {
      setHeroAds((current) =>
        current.map((slide) =>
          slide.id === editingAdId
            ? {
                ...slide,
                imageOnly: adImageOnly,
                tagPill: adTagPill.trim() || 'DESTAQUE DO MÊS',
                titleHighlight: cleanHighlight,
                titleMain: cleanMain,
                presenterOrSponsor: adPresenter.trim() || 'Equipe Elevn',
                ctaLabel: adCtaLabel.trim() || 'SAIBA MAIS!',
                dateBadge: adDateBadge.trim() || 'EM BREVE',
                secondaryPill: adSecondaryPill.trim() || 'NO ELEVN CLUB',
                coverUrl: adCoverUrl,
              }
            : slide,
        ),
      )
      setToastMessage(
        adImageOnly
          ? 'Anúncio atualizado no modo "Só a foto (Arte completa)"!'
          : 'Anúncio atualizado com foto integrada e sobreposição!',
      )
    } else {
      const newSlide: HeroAdSlide = {
        id: `ad-slide-${Date.now()}`,
        imageOnly: adImageOnly,
        tagPill: adTagPill.trim() || 'DESTAQUE DO MÊS',
        titleHighlight: cleanHighlight,
        titleMain: cleanMain,
        presenterOrSponsor: adPresenter.trim() || 'Equipe Elevn',
        ctaLabel: adCtaLabel.trim() || 'SAIBA MAIS!',
        dateBadge: adDateBadge.trim() || 'EM BREVE',
        secondaryPill: adSecondaryPill.trim() || 'NO ELEVN CLUB',
        coverUrl: adCoverUrl,
      }
      setHeroAds((current) => [newSlide, ...current])
      setActiveAdIndex(0)
      setToastMessage(
        adImageOnly
          ? 'Novo anúncio publicado ocupando todo o espaço com a arte enviada!'
          : 'Novo anúncio publicado com foto integrada e sobreposição!',
      )
    }
    setActiveModal('none')
  }

  /** "Postar como Elevn": official post, approved and outside the ranking. */
  const saveOfficialPost = (input: {
    activity: ChallengeActivity
    title: string
    note: string
    photoUrl: string
  }) => {
    if (!activeChallenge) return
    const now = new Date()
    const post: GymRatsCheckinPost = {
      id: `post-${Date.now()}`,
      challengeId: activeChallenge.id,
      studentName: 'Equipe Elevn',
      studentAvatar: '/people/breno-monteiro.png',
      activityKind: input.activity.name,
      activityIcon: input.activity.icon,
      activityId: input.activity.id,
      workoutOrMealTag: 'Post oficial',
      pointsEarned: 0,
      title: input.title,
      note: input.note,
      photoUrl4x3: input.activity.requiresPhoto ? input.photoUrl : '',
      timeLabel: 'Agora',
      postedAtIso: now.toISOString(),
      status: 'aprovado',
      cheersCount: 0,
    }
    setGymRatsFeed((current) => [post, ...current])
    setCheckinOpen(false)
    setToastMessage('Post oficial publicado no mural.')
  }

  const rejectPost = (postId: string, reason: string) => {
    setGymRatsFeed((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, status: 'reprovado', rejectReason: reason, highlighted: false }
          : post,
      ),
    )
    const post = gymRatsFeed.find((item) => item.id === postId)
    if (post)
      setToastMessage(
        `Check-in de ${post.studentName} reprovado (−${post.pointsEarned} pts). O aluno vê o motivo no app.`,
      )
  }

  const restorePost = (postId: string) =>
    setGymRatsFeed((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, status: 'aprovado', rejectReason: undefined } : post,
      ),
    )

  const toggleHighlight = (postId: string) =>
    setGymRatsFeed((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, highlighted: !post.highlighted } : post,
      ),
    )

  // Ranking minus the points of rejected check-ins
  const moderatedLeaderboard = leaderboard.map((member) => ({
    ...member,
    points:
      member.points -
      gymRatsFeed
        .filter((post) => post.status === 'reprovado' && post.studentName === member.name)
        .reduce((sum, post) => sum + post.pointsEarned, 0),
  }))

  // Demo dates relative to today (resolved after hydration so the static page matches)
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const day = (offset: number) => new Date(today.getTime() + offset * 86_400_000)
    setChallenges((current) =>
      current.map((ch) => {
        if (ch.startOffset === undefined || ch.startIso) return ch
        const start = day(ch.startOffset)
        const end = day(ch.startOffset + (ch.lengthDays ?? 30) - 1)
        return {
          ...ch,
          startIso: start.toISOString(),
          endIso: end.toISOString(),
          periodLabel: challengePeriodLabel(start.toISOString(), end.toISOString()),
        }
      }),
    )
    setGymRatsFeed((current) =>
      current.map((post) => {
        if (post.postedAtIso || post.dayOffset === undefined) return post
        const [hours, minutes] = (post.time ?? '12:00').split(':').map(Number)
        const at = day(post.dayOffset)
        at.setHours(hours, minutes)
        return { ...post, postedAtIso: at.toISOString(), status: post.status ?? 'aprovado' }
      }),
    )
    setLiveEvents((current) =>
      current.length
        ? current
        : [
            {
              id: 'live-1',
              title: 'Aulão de mobilidade para quem treina cedo',
              host: 'Prof. Rafael Costa',
              startsAtIso: new Date(day(2).getTime() + 19 * 3_600_000).toISOString(),
              link: '',
            },
            {
              id: 'live-2',
              title: 'Clube do livro: Hábitos Atômicos, cap. 3',
              host: 'Dr. Breno Monteiro',
              startsAtIso: new Date(day(6).getTime() + 20 * 3_600_000).toISOString(),
              link: '',
            },
          ],
    )
  }, [])

  const toggleCheerPost = (postId: string) => {
    setGymRatsFeed((current) =>
      current.map((post) => {
        if (post.id !== postId) return post
        const nextCheered = !post.cheeredByMe
        return {
          ...post,
          cheeredByMe: nextCheered,
          cheersCount: nextCheered ? post.cheersCount + 1 : Math.max(0, post.cheersCount - 1),
        }
      }),
    )
  }

  const deleteLessonFromPlaylist = (playlistId: string, lessonId: string) => {
    setPlaylists((current) =>
      current.map((pl) => {
        if (pl.id !== playlistId) return pl
        const remaining = pl.lessons
          .filter((item) => item.id !== lessonId)
          .map((item, idx) => ({
            ...item,
            numberLabel: String(idx + 1).padStart(3, '0'),
          }))
        return { ...pl, lessons: remaining }
      }),
    )
  }

  const filteredPlaylists = playlists.filter((pl) => {
    if (trackFilter !== 'Todos' && pl.trackCategory !== trackFilter) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      pl.title.toLowerCase().includes(q) ||
      pl.shortUpperTitle.toLowerCase().includes(q) ||
      pl.description.toLowerCase().includes(q) ||
      pl.lessons.some((les) => les.title.toLowerCase().includes(q))
    )
  })

  const tracksToRender =
    trackFilter === 'Todos' ? tracks : tracks.filter((track) => track.name === trackFilter)

  const totalLessons = playlists.reduce((acc, p) => acc + p.lessons.length, 0)
  const totalMinutes = playlists.reduce((acc, p) => acc + playlistMinutes(p), 0)
  const averageCompletion = playlists.length
    ? Math.round(playlists.reduce((acc, p) => acc + p.completionRate, 0) / playlists.length)
    : 0
  const watchingNow = playlists.reduce((acc, p) => acc + p.studentsWatching, 0)
  const checkinsToday = gymRatsFeed.filter(
    (post) =>
      post.postedAtIso && new Date(post.postedAtIso).toDateString() === new Date().toDateString(),
  ).length
  const liveFormat = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const allVideosWithPlaylist = playlists.flatMap((pl) =>
    pl.lessons.map((lesson) => ({
      ...lesson,
      playlistId: pl.id,
      playlistTitle: pl.title,
      playlistShortTitle: pl.shortUpperTitle,
      trackCategory: pl.trackCategory,
    })),
  )

  const continueWatchingVideos = allVideosWithPlaylist.filter(
    (v) =>
      typeof v.watchProgressPercent === 'number' &&
      v.watchProgressPercent > 0 &&
      v.watchProgressPercent < 100,
  )

  const recentlyWatchedVideos = allVideosWithPlaylist.filter((v) => Boolean(v.lastWatchedLabel))

  const filteredAllExploreVideos = allVideosWithPlaylist.filter((v) => {
    if (explorePlaylistFilter !== 'Todas' && v.playlistId !== explorePlaylistFilter) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      v.title.toLowerCase().includes(q) ||
      v.playlistTitle.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q)
    )
  })

  return (
    <div className="elevn-club-desktop-shell">
      <div className="elevn-club-canvas">
        {/* BARRA SUPERIOR INTERNA DO ELEVN CLUB (DESKTOP) */}
        <header className="elevn-club-navbar">
          <div className="elevn-club-nav-left">
            <div className="elevn-club-logo">
              <img src="/brand/symbol-beige.png" alt="Elevn" />
              <div>
                <strong>ELEVN CLUB</strong>
                <small>CONTEÚDO, PLAYLISTS & COMUNIDADE</small>
              </div>
            </div>

            <Tabs
              label="Navegação do Elevn Club"
              tone="dark"
              className="border-b-0"
              value={clubTab}
              onChange={(next) => {
                setClubTab(next)
                setSelectedPlaylistId(null)
              }}
              items={[
                { id: 'inicio', label: 'Início' },
                { id: 'explorar', label: 'Explorar playlists' },
                { id: 'comunidade', label: 'Comunidade (GymRats)' },
              ]}
            />
          </div>

          <div className="elevn-club-nav-right">
            <div className="elevn-club-searchbox">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Pesquisar vídeos, playlists ou desafios..."
                aria-label="Pesquisar no Elevn Club"
              />
            </div>

            <div className="elevn-club-admin-actions">
              <button
                type="button"
                className="elevn-club-preview-btn"
                onClick={() => setPreviewOpen(true)}
              >
                <Icon name="eye" className="size-4" /> Prévia no app
              </button>
              <Menu
                label="Publicar no Elevn Club"
                items={[
                  {
                    id: 'video',
                    label: 'Vídeo',
                    description: '4:3 ou 16:9 · a capa é sempre 4:3',
                    onSelect: () => openUploadVideoModal(),
                  },
                  {
                    id: 'playlist',
                    label: 'Playlist',
                    description: 'Sequência de aulas dentro de uma trilha',
                    onSelect: () => openNewPlaylistModal(),
                  },
                  {
                    id: 'trilha',
                    label: 'Trilha',
                    description: 'Agrupa playlists por objetivo',
                    onSelect: () => setTrackSheet({ open: true, track: null }),
                  },
                  {
                    id: 'ao-vivo',
                    label: 'Encontro ao vivo',
                    description: 'Aparece em “Próximos encontros”',
                    onSelect: () => setLiveOpen(true),
                  },
                  {
                    id: 'anuncio',
                    label: 'Anúncio',
                    description: 'Banner do topo do Início',
                    onSelect: () => openAdModal(),
                  },
                  {
                    id: 'desafio',
                    label: 'Desafio',
                    description: 'Comunidade GymRats',
                    onSelect: () => openChallengeModal(),
                  },
                ]}
                trigger={({ open, toggle, id }) => (
                  <button
                    type="button"
                    className="gold-solid"
                    onClick={toggle}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    aria-controls={open ? id : undefined}
                  >
                    + Publicar
                  </button>
                )}
              />
            </div>
          </div>
        </header>

        <AppPreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          ad={currentHeroAd}
          playlists={playlists}
          tracks={tracks.map((track) => track.name)}
          challenge={activeChallenge ?? null}
          feed={gymRatsFeed}
          leaderboard={moderatedLeaderboard}
          liveEvents={liveEvents}
        />

        {toastMessage && (
          <div className="elevn-club-toast" role="status">
            <span>{toastMessage}</span>
            <button type="button" onClick={() => setToastMessage(null)}>
              Fechar
            </button>
          </div>
        )}

        {/* SE UMA PLAYLIST ESTIVER ABERTA -> VISÃO INTERNA DA PLAYLIST (ESTILO IMAGEM 3 DO RD NAS CORES ELEVN) */}
        {selectedPlaylist ? (
          <div className="elevn-playlist-detail-view">
            <section
              className="elevn-pl-detail-hero"
              style={{ '--pl-accent': selectedPlaylist.accentColor } as React.CSSProperties}
            >
              <div className="elevn-pl-detail-left">
                <button
                  type="button"
                  className="elevn-back-btn"
                  onClick={() => setSelectedPlaylistId(null)}
                >
                  ← Voltar para Playlists
                </button>

                <span className="elevn-pl-track-badge">{selectedPlaylist.trackCategory}</span>
                <h1>{selectedPlaylist.title}</h1>
                <p className="elevn-pl-featured-text">
                  Conteúdo:{' '}
                  {selectedPlaylist.lessons[0]
                    ? `${selectedPlaylist.lessons[0].numberLabel} - ${selectedPlaylist.lessons[0].title}`
                    : 'Nenhuma aula cadastrada ainda nesta playlist'}
                </p>
                <p className="elevn-pl-subdesc">{selectedPlaylist.description}</p>

                <div className="elevn-pl-hero-cta-row">
                  <button
                    type="button"
                    className="elevn-primary-gold-btn"
                    onClick={() => openUploadVideoModal(selectedPlaylist.id)}
                  >
                    + Adicionar vídeo nesta playlist
                  </button>
                </div>
              </div>

              <div className="elevn-pl-detail-art">
                <img src={selectedPlaylist.coverUrl} alt={selectedPlaylist.title} />
                <div className="elevn-pl-detail-fade" />
                <span className="elevn-pl-watermark">{selectedPlaylist.shortUpperTitle}</span>
              </div>
            </section>

            <section className="elevn-pl-detail-body">
              <header className="elevn-pl-content-head">
                <h2>Conteúdo</h2>
                <span>
                  1 módulo · {selectedPlaylist.lessons.length}{' '}
                  {selectedPlaylist.lessons.length === 1 ? 'aula no total' : 'aulas no total'} ·
                  Capas 4:3
                </span>
              </header>

              <div className="elevn-pl-split-grid">
                <div className="elevn-pl-lessons-card">
                  <header className="elevn-pl-box-head">
                    <div>
                      <h3>{selectedPlaylist.title}</h3>
                      <span>
                        Total de aulas ({selectedPlaylist.lessons.length} de{' '}
                        {selectedPlaylist.lessons.length})
                      </span>
                    </div>
                    <button type="button" onClick={() => openUploadVideoModal(selectedPlaylist.id)}>
                      + Subir vídeo aqui
                    </button>
                  </header>

                  <div className="elevn-pl-lessons-list">
                    {selectedPlaylist.lessons.length === 0 ? (
                      <div className="elevn-empty-box">
                        <p>Esta playlist ainda não possui vídeos cadastrados.</p>
                        <button
                          type="button"
                          onClick={() => openUploadVideoModal(selectedPlaylist.id)}
                        >
                          + Subir primeiro vídeo
                        </button>
                      </div>
                    ) : (
                      selectedPlaylist.lessons.map((lesson) => (
                        <article key={lesson.id} className="elevn-pl-lesson-row">
                          <div className="elevn-pl-lesson-thumb-4x3">
                            <img src={lesson.coverUrl} alt={lesson.title} />
                            <span>{lesson.aspectRatio ?? '4:3'}</span>
                          </div>
                          <div className="elevn-pl-lesson-copy">
                            <h4>
                              {lesson.numberLabel} - {lesson.title}
                            </h4>
                            <small>
                              ▶ VÍDEO - {lesson.durationMinutes} · {lesson.publishedAt}
                            </small>
                            <p>{lesson.description}</p>
                            {lesson.materialName && (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-on-dark/75">
                                <Icon name="form" className="size-3" /> {lesson.materialName}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="elevn-lesson-delete-btn"
                            onClick={() => deleteLessonFromPlaylist(selectedPlaylist.id, lesson.id)}
                          >
                            Remover aula
                          </button>
                        </article>
                      ))
                    )}
                  </div>
                </div>

                <aside className="elevn-pl-progress-card">
                  <h3>Progresso dos alunos</h3>
                  <div className="elevn-pl-progress-nums">
                    <strong>{selectedPlaylist.completionRate}%</strong>
                    <span>
                      {selectedPlaylist.lessons.length} de {selectedPlaylist.lessons.length}{' '}
                      conteúdos
                    </span>
                  </div>
                  <div className="elevn-pl-progress-bar">
                    <i style={{ width: `${selectedPlaylist.completionRate}%` }} />
                  </div>
                  <small>
                    Em andamento · {selectedPlaylist.studentsWatching} alunos acompanhando esta
                    playlist
                  </small>
                  <p>
                    Aulas curtas e práticas aumentam a conclusão. Vídeos 16:9 aparecem com faixas no
                    celular; a capa continua 4:3.
                  </p>
                </aside>
              </div>
            </section>
          </div>
        ) : clubTab === 'inicio' ? (
          /* ABA 1: INÍCIO (BANNER DE ANÚNCIO CURTO INTEGRADO AO TEXTO + TRILHAS DE PLAYLISTS) */
          <div className="elevn-inicio-view">
            {currentHeroAd && (
              <section
                className={`elevn-compact-ad-hero ${
                  currentHeroAd.imageOnly ? 'is-image-only' : ''
                }`}
                aria-label="Anúncio e destaque do topo"
              >
                {/* SE FOR "SÓ A FOTO", A ARTE OCUPA 100% DA PUBLICIDADE SEM TEXTO SOBREPOSTO */}
                {currentHeroAd.imageOnly ? (
                  <div className="elevn-full-bleed-ad-image">
                    <img src={currentHeroAd.coverUrl} alt="Banner publicitário completo" />
                    <div className="elevn-full-bleed-floating-controls">
                      <span className="elevn-ad-pill">
                        ARTE COMPLETA · SLIDE {activeAdIndex + 1}/{heroAds.length}
                      </span>
                      <div className="elevn-compact-admin-btns">
                        <button type="button" onClick={() => openAdModal(currentHeroAd)}>
                          ✎ Editar anúncio
                        </button>
                        <button type="button" onClick={() => openAdModal()}>
                          + Novo anúncio
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* IMAGEM INTEGRADA AO PRÓPRIO ANÚNCIO COM A SOBREPOSIÇÃO SUAVE */}
                    <div className="elevn-compact-ad-integrated-art">
                      <img src={currentHeroAd.coverUrl} alt={currentHeroAd.titleHighlight} />
                      <div className="elevn-compact-ad-gradient" />
                    </div>

                    <div className="elevn-compact-ad-content">
                      <div className="elevn-compact-ad-topline">
                        <div className="elevn-compact-tag-wrap">
                          <span className="elevn-ad-pill">{currentHeroAd.tagPill}</span>
                          <small>
                            Slide {activeAdIndex + 1} de {heroAds.length}
                          </small>
                        </div>

                        <div className="elevn-compact-admin-btns">
                          <button type="button" onClick={() => openAdModal(currentHeroAd)}>
                            ✎ Editar anúncio
                          </button>
                          <button type="button" onClick={() => openAdModal()}>
                            + Novo anúncio
                          </button>
                        </div>
                      </div>

                      <div className="elevn-compact-ad-mainrow">
                        <div className="elevn-compact-ad-text">
                          <h2>
                            <strong>{currentHeroAd.titleHighlight}</strong>{' '}
                            {currentHeroAd.titleMain}
                          </h2>
                          <p className="elevn-compact-presenter">
                            {currentHeroAd.presenterOrSponsor}
                          </p>

                          <div className="elevn-compact-cta-row">
                            <span className="cta-main">{currentHeroAd.ctaLabel}</span>
                            <span className="cta-date">{currentHeroAd.dateBadge}</span>
                            <span className="cta-secondary">▶ {currentHeroAd.secondaryPill}</span>
                          </div>
                        </div>
                      </div>

                      <div className="elevn-compact-ad-nav">
                        <div className="dots">
                          {heroAds.map((slide, idx) => (
                            <button
                              key={slide.id}
                              type="button"
                              className={idx === activeAdIndex ? 'active' : ''}
                              onClick={() => setActiveAdIndex(idx)}
                              aria-label={`Slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                        <div className="arrows">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveAdIndex((c) => (c === 0 ? heroAds.length - 1 : c - 1))
                            }
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveAdIndex((c) => (c + 1) % heroAds.length)}
                          >
                            →
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {currentHeroAd.imageOnly && (
                  <div className="elevn-compact-ad-nav image-only-nav">
                    <div className="dots">
                      {heroAds.map((slide, idx) => (
                        <button
                          key={slide.id}
                          type="button"
                          className={idx === activeAdIndex ? 'active' : ''}
                          onClick={() => setActiveAdIndex(idx)}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <div className="arrows">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveAdIndex((c) => (c === 0 ? heroAds.length - 1 : c - 1))
                        }
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAdIndex((c) => (c + 1) % heroAds.length)}
                      >
                        →
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            <div className="elevn-catalog-container">
              <section
                aria-label="Engajamento do Club"
                className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 lg:grid-cols-4"
              >
                {[
                  {
                    label: 'Alunos assistindo',
                    value: watchingNow.toLocaleString('pt-BR'),
                    hint: `em ${playlists.length} playlists`,
                  },
                  {
                    label: 'Conteúdo publicado',
                    value: `${totalLessons} aulas`,
                    hint: `${totalMinutes} min no total`,
                  },
                  {
                    label: 'Conclusão média',
                    value: `${averageCompletion}%`,
                    hint: 'das playlists iniciadas',
                  },
                  {
                    label: 'Check-ins hoje',
                    value: String(checkinsToday),
                    hint: activeChallenge?.title ?? 'Comunidade',
                    onClick: () => setClubTab('comunidade'),
                  },
                ].map((item) => {
                  const body = (
                    <>
                      <span className="text-xs text-on-dark/60">{item.label}</span>
                      <strong className="mt-1 block text-2xl font-semibold tracking-[-0.01em] text-on-dark tabular-nums">
                        {item.value}
                      </strong>
                      <span className="mt-0.5 block truncate text-[11px] text-on-dark/50">
                        {item.hint}
                      </span>
                    </>
                  )
                  return item.onClick ? (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="bg-[#17142c] px-4 py-3.5 text-left transition-colors hover:bg-[#1e1a38]"
                    >
                      {body}
                    </button>
                  ) : (
                    <div key={item.label} className="bg-[#17142c] px-4 py-3.5">
                      {body}
                    </div>
                  )
                })}
              </section>

              <section
                aria-labelledby="live-title"
                className="rounded-card border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 id="live-title" className="text-[15px] font-semibold text-on-dark">
                    Próximos encontros ao vivo
                  </h2>
                  <button
                    type="button"
                    onClick={() => setLiveOpen(true)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-control border border-white/15 px-3 text-xs font-medium text-on-dark hover:bg-white/10"
                  >
                    <Icon name="calendar" className="size-3.5" /> Agendar encontro
                  </button>
                </div>
                {liveEvents.length === 0 ? (
                  <p className="mt-3 text-sm text-on-dark/55">
                    Nenhum encontro agendado. Lives aumentam o retorno dos alunos ao app.
                  </p>
                ) : (
                  <ul className="mt-3 flex gap-3 overflow-x-auto pb-1">
                    {liveEvents.map((event) => (
                      <li
                        key={event.id}
                        className="flex min-w-[240px] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--gold-88)]/15 text-[var(--gold-88)]">
                          <Icon name="calendar" className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-on-dark">{event.title}</p>
                          <p className="truncate text-[11px] text-on-dark/55 capitalize">
                            {liveFormat.format(new Date(event.startsAtIso)).replace('.', '')} ·{' '}
                            {event.host}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Cancelar encontro ${event.title}`}
                          onClick={() =>
                            setLiveEvents((current) =>
                              current.filter((item) => item.id !== event.id),
                            )
                          }
                          className="grid size-7 place-items-center rounded-md text-on-dark/50 hover:bg-white/10 hover:text-on-dark"
                        >
                          <Icon name="close" className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  role="radiogroup"
                  aria-label="Filtrar trilha"
                  className="flex flex-wrap gap-1.5"
                >
                  {['Todos', ...tracks.map((track) => track.name)].map((name) => (
                    <button
                      key={name}
                      type="button"
                      role="radio"
                      aria-checked={trackFilter === name}
                      onClick={() => setTrackFilter(name)}
                      className={
                        trackFilter === name
                          ? 'h-8 rounded-full bg-[var(--gold-88)] px-3.5 text-xs font-semibold text-night'
                          : 'h-8 rounded-full border border-white/15 px-3.5 text-xs font-medium text-on-dark/75 hover:bg-white/10'
                      }
                    >
                      {name === 'Todos' ? 'Todas as trilhas' : name}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setTrackSheet({ open: true, track: null })}
                  className="h-8 rounded-full border border-dashed border-white/25 px-3.5 text-xs font-medium text-on-dark/80 hover:bg-white/10"
                >
                  + Nova trilha
                </button>
                <button
                  type="button"
                  className="ml-auto text-xs font-medium text-[var(--gold-73)] hover:underline"
                  onClick={() => setClubTab('explorar')}
                >
                  Ver onde os alunos param →
                </button>
              </div>

              {tracks.length === 0 && (
                <div className="rounded-card border border-dashed border-white/15 px-6 py-10 text-center text-sm text-on-dark/60">
                  Crie a primeira trilha para organizar as playlists por objetivo.
                </div>
              )}
              {tracksToRender.map((track) => {
                const trackName = track.name
                const list = filteredPlaylists.filter((pl) => pl.trackCategory === trackName)
                const all = playlists.filter((pl) => pl.trackCategory === trackName)
                const lessons = all.reduce((acc, pl) => acc + pl.lessons.length, 0)
                const completion = all.length
                  ? Math.round(all.reduce((acc, pl) => acc + pl.completionRate, 0) / all.length)
                  : 0
                const position = tracks.findIndex((item) => item.id === track.id)
                return (
                  <section
                    key={track.id}
                    className="elevn-track-group"
                    aria-labelledby={`track-${track.id}`}
                  >
                    <header className="flex flex-wrap items-end gap-3">
                      <span
                        aria-hidden="true"
                        className="h-10 w-1 shrink-0 rounded-full"
                        style={{ background: track.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <h3
                          id={`track-${track.id}`}
                          className="text-base font-semibold text-on-dark"
                        >
                          {trackName}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-on-dark/60">
                          {track.goal ? `${track.goal} · ` : ''}
                          {all.length} {all.length === 1 ? 'playlist' : 'playlists'} · {lessons}{' '}
                          aulas
                        </p>
                      </div>
                      {all.length > 0 && (
                        <div className="hidden w-36 sm:block" title="Conclusão média da trilha">
                          <div className="flex justify-between text-[11px] text-on-dark/60">
                            <span>Conclusão</span>
                            <span className="tabular-nums">{completion}%</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${completion}%`, background: track.color }}
                            />
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => openNewPlaylistModal(trackName)}
                        className="h-8 rounded-control border border-white/15 px-3 text-xs font-medium text-on-dark hover:bg-white/10"
                      >
                        + Playlist
                      </button>
                      <Menu
                        label={`Opções da trilha ${trackName}`}
                        items={[
                          {
                            id: 'editar',
                            label: 'Editar trilha',
                            description: 'Nome, objetivo e cor',
                            onSelect: () => setTrackSheet({ open: true, track }),
                          },
                          ...(position > 0
                            ? [
                                {
                                  id: 'subir',
                                  label: 'Mover para cima',
                                  onSelect: () => moveTrack(track.id, -1),
                                },
                              ]
                            : []),
                          ...(position < tracks.length - 1
                            ? [
                                {
                                  id: 'descer',
                                  label: 'Mover para baixo',
                                  onSelect: () => moveTrack(track.id, 1),
                                },
                              ]
                            : []),
                          {
                            id: 'excluir',
                            label: 'Excluir trilha',
                            description: all.length
                              ? 'Mova ou exclua as playlists antes'
                              : 'A trilha está vazia',
                            danger: true,
                            onSelect: () =>
                              all.length
                                ? setToastMessage(
                                    `Mova as ${all.length} playlists de “${trackName}” antes de excluir a trilha.`,
                                  )
                                : deleteTrack(track),
                          },
                        ]}
                        trigger={({ open, toggle, id }) => (
                          <button
                            type="button"
                            onClick={toggle}
                            aria-haspopup="menu"
                            aria-expanded={open}
                            aria-controls={open ? id : undefined}
                            className="grid size-8 place-items-center rounded-control text-on-dark/70 hover:bg-white/10 hover:text-on-dark"
                          >
                            <Icon name="dots" className="size-4" />
                            <span className="sr-only">Opções da trilha {trackName}</span>
                          </button>
                        )}
                      />
                    </header>

                    <div className="elevn-posters-row">
                      {list.length === 0 && (
                        <p className="elevn-track-empty">Nenhuma playlist nesta trilha ainda.</p>
                      )}
                      {list.map((playlist) => (
                        <article
                          key={playlist.id}
                          className="elevn-poster-card"
                          style={{ '--poster-tone': playlist.accentColor } as React.CSSProperties}
                          onClick={() => setSelectedPlaylistId(playlist.id)}
                        >
                          <img src={playlist.coverUrl} alt={playlist.title} />
                          <div className="elevn-poster-overlay" />

                          <div className="elevn-poster-bottom">
                            <strong>{playlist.title}</strong>
                            <small>
                              {playlistMeta(playlist)} · {playlist.studentsWatching} assistindo ·{' '}
                              {playlist.completionRate}% concluem
                            </small>
                            <div className="elevn-poster-actions">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedPlaylistId(playlist.id)
                                }}
                              >
                                Abrir aulas ({playlist.lessons.length})
                              </button>
                              <button
                                type="button"
                                className="gold"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openUploadVideoModal(playlist.id)
                                }}
                              >
                                + Vídeo
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        ) : clubTab === 'explorar' ? (
          /* ABA 2: EXPLORAR PLAYLISTS (CONTINUAR DE ONDE PAROU + VÍDEOS RECENTES VISTOS + TODOS OS VÍDEOS) */
          <div className="elevn-explorar-view">
            <section className="elevn-explore-block">
              <header className="elevn-explore-block-head">
                <div>
                  <span>ONDE OS ALUNOS PARAM</span>
                  <h2>Aulas abandonadas no meio</h2>
                </div>
                <small>{continueWatchingVideos.length} vídeos em andamento</small>
              </header>

              <div className="elevn-continue-grid">
                {continueWatchingVideos.map((video) => (
                  <article
                    key={video.id}
                    className="elevn-continue-item"
                    onClick={() => setSelectedPlaylistId(video.playlistId)}
                  >
                    <div className="elevn-continue-thumb">
                      <img src={video.coverUrl} alt={video.title} />
                      <span className="play-badge">▶ Continuar</span>
                      <div className="progress-line">
                        <i style={{ width: `${video.watchProgressPercent ?? 50}%` }} />
                      </div>
                    </div>
                    <div className="elevn-continue-meta">
                      <small>{video.playlistTitle}</small>
                      <strong>
                        {video.numberLabel} - {video.title}
                      </strong>
                      <span>
                        {video.stoppedAtLabel} ({video.watchProgressPercent}% concluído)
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="elevn-explore-block">
              <header className="elevn-explore-block-head">
                <div>
                  <span>HISTÓRICO DE REPRODUÇÃO</span>
                  <h2>Vídeos recentes vistos</h2>
                </div>
              </header>

              <div className="elevn-recent-grid">
                {recentlyWatchedVideos.map((video) => (
                  <article
                    key={`rec-${video.id}`}
                    className="elevn-recent-card"
                    onClick={() => setSelectedPlaylistId(video.playlistId)}
                  >
                    <div className="elevn-recent-thumb">
                      <img src={video.coverUrl} alt={video.title} />
                      <span>{video.durationMinutes}</span>
                    </div>
                    <div className="elevn-recent-body">
                      <small>{video.playlistShortTitle}</small>
                      <strong>
                        {video.numberLabel} - {video.title}
                      </strong>
                      <span>{video.lastWatchedLabel}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="elevn-explore-block">
              <header className="elevn-explore-block-head">
                <div>
                  <span>BIBLIOTECA COMPLETA DO ELEVN CLUB</span>
                  <h2>Todos os vídeos ({filteredAllExploreVideos.length})</h2>
                </div>

                <div className="elevn-explore-toolbar-right">
                  <select
                    value={explorePlaylistFilter}
                    onChange={(e) => setExplorePlaylistFilter(e.target.value)}
                    aria-label="Filtrar por playlist"
                  >
                    <option value="Todas">Todas as Playlists ({playlists.length})</option>
                    {playlists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.title} ({pl.lessons.length})
                      </option>
                    ))}
                  </select>

                  <button type="button" onClick={() => openUploadVideoModal()}>
                    + Subir vídeo
                  </button>
                </div>
              </header>

              <div className="elevn-all-videos-grid">
                {filteredAllExploreVideos.map((video) => (
                  <article
                    key={`all-${video.id}`}
                    className="elevn-all-video-card"
                    onClick={() => setSelectedPlaylistId(video.playlistId)}
                  >
                    <div className="elevn-all-video-thumb">
                      <img src={video.coverUrl} alt={video.title} />
                      <span className="ratio">{video.aspectRatio ?? '4:3'}</span>
                      <time>{video.durationMinutes}</time>
                    </div>
                    <div className="elevn-all-video-body">
                      <span className="pl-chip">{video.playlistTitle}</span>
                      <h4>
                        {video.numberLabel} - {video.title}
                      </h4>
                      <p>{video.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* ABA 3: COMUNIDADE (GYMRATS PRÓPRIO DA ELEVN COM DESAFIOS, PREMIAÇÕES 1º/2º/3º, REGRAS E SISTEMA DE PONTOS) */
          <div className="elevn-comunidade-view">
            {/* SELETOR DE DESAFIOS CRIADOS PELO ADMIN + BOTÃO DE CRIAR OUTRO DESAFIO */}
            <section className="flex flex-wrap items-center gap-2" aria-label="Desafios">
              <div
                role="tablist"
                aria-label="Desafios"
                className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1"
              >
                {challenges.map((ch) => {
                  const active = ch.id === activeChallenge?.id
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveChallengeId(ch.id)}
                      className={
                        active
                          ? 'flex shrink-0 items-center gap-2.5 rounded-control border border-[var(--gold-88)]/60 bg-white/[0.06] py-1.5 pr-3 pl-1.5 text-left'
                          : 'flex shrink-0 items-center gap-2.5 rounded-control border border-white/10 py-1.5 pr-3 pl-1.5 text-left opacity-75 hover:bg-white/[0.04] hover:opacity-100'
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ch.coverUrl}
                        alt=""
                        className="aspect-[4/3] w-12 rounded-md object-cover"
                      />
                      <span>
                        <span className="block text-sm font-medium text-on-dark">{ch.title}</span>
                        <span className="block text-[11px] text-on-dark/55">
                          {ch.participantsCount} participantes · {ch.activities.length} atividades
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => openChallengeModal()}
                className="h-9 shrink-0 rounded-control border border-dashed border-white/25 px-3.5 text-xs font-medium text-on-dark/85 hover:bg-white/10"
              >
                + Novo desafio
              </button>
            </section>

            {activeChallenge && (
              <CommunityChallenge
                challenge={activeChallenge}
                leaderboard={moderatedLeaderboard}
                feed={gymRatsFeed}
                onReject={rejectPost}
                onRestore={restorePost}
                onHighlight={toggleHighlight}
                onEditChallenge={() => openChallengeModal(activeChallenge)}
                onPost={() => setCheckinOpen(true)}
                onCheer={toggleCheerPost}
              />
            )}
          </div>
        )}
      </div>

      <ChallengeEditorSheet
        open={challengeSheet.open}
        challenge={challengeSheet.challenge}
        presets={studioCoverPresets4x3}
        onClose={() => setChallengeSheet({ open: false, challenge: null })}
        onSave={saveChallenge}
      />
      <VideoUploadSheet
        open={videoSheet.open}
        playlists={playlists}
        defaultPlaylistId={videoSheet.playlistId}
        presets={studioCoverPresets4x3}
        onClose={() => setVideoSheet({ open: false })}
        onSave={saveVideo}
      />
      <TrackSheet
        open={trackSheet.open}
        track={trackSheet.track}
        takenNames={tracks
          .filter((item) => item.id !== trackSheet.track?.id)
          .map((item) => item.name)}
        onClose={() => setTrackSheet({ open: false, track: null })}
        onSave={saveTrack}
      />
      <CheckinSheet
        open={checkinOpen}
        challenge={activeChallenge ?? null}
        presets={studioCoverPresets4x3}
        onClose={() => setCheckinOpen(false)}
        onSave={saveOfficialPost}
      />
      <LiveEventSheet
        open={liveOpen}
        onClose={() => setLiveOpen(false)}
        onSave={(event) => {
          setLiveEvents((current) =>
            [...current, event].sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso)),
          )
          setLiveOpen(false)
          setToastMessage(`Encontro “${event.title}” agendado.`)
        }}
      />

      {/* MODAL: CRIAR PLAYLIST */}
      {activeModal === 'playlist' && (
        <div className="elevn-modal-backdrop" role="dialog" aria-modal="true">
          <div className="elevn-modal-card">
            <header className="elevn-modal-header">
              <div>
                <span>ELEVN CLUB · NOVA PLAYLIST 4:3</span>
                <h2>Criar Playlist de Conteúdos</h2>
              </div>
              <button type="button" onClick={() => setActiveModal('none')}>
                ✕
              </button>
            </header>

            <form className="elevn-modal-form" onSubmit={handleSavePlaylist}>
              <div className="elevn-modal-split">
                <div className="elevn-modal-cover-col">
                  <label className="elevn-field-title">Capa 4:3 da Playlist</label>
                  <div className="elevn-cover-4x3-box">
                    <img src={plCoverUrl} alt="Capa da playlist" />
                    <span>{plShortUpper || 'CAPA 4:3'}</span>
                  </div>

                  <label className="elevn-upload-trigger">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setPlCoverUrl)}
                    />
                    Subir capa 4:3 da playlist
                  </label>

                  <div className="elevn-dimension-note">
                    <strong>Observação de dimensões (Celular):</strong>
                    <span>
                      Dimensão recomendada do card da playlist:{' '}
                      <strong>1440 × 1080 px (Proporção 4:3 Mobile)</strong>. Mantenha o terço
                      inferior livre para o título da playlist.
                    </span>
                  </div>

                  <div className="elevn-presets-row">
                    {studioCoverPresets4x3.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        className={plCoverUrl === preset.url ? 'active' : ''}
                        onClick={() => {
                          setPlCoverUrl(preset.url)
                          setPlAccent(preset.accent)
                        }}
                      >
                        <img src={preset.url} alt={preset.label} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="elevn-modal-fields-col">
                  <label className="elevn-input-block">
                    <span>1. Trilha do Elevn Club</span>
                    <select
                      value={plTrack}
                      onChange={(e) => setPlTrack(e.target.value as PlaylistTrackCategory)}
                    >
                      {tracks.map((track) => (
                        <option key={track.id} value={track.name}>
                          {track.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="elevn-input-block">
                    <span>2. Título da Playlist</span>
                    <input
                      type="text"
                      value={plTitle}
                      onChange={(e) => setPlTitle(e.target.value)}
                      placeholder="Ex.: Execução Técnica de Costas & Bíceps"
                      required
                    />
                  </label>

                  <label className="elevn-input-block">
                    <span>3. Título Curto em Caixa Alta no Card</span>
                    <input
                      type="text"
                      value={plShortUpper}
                      onChange={(e) => setPlShortUpper(e.target.value)}
                      placeholder="Ex.: DORSAL & BÍCEPS"
                    />
                  </label>

                  <label className="elevn-input-block">
                    <span>4. Descrição da Playlist</span>
                    <textarea
                      rows={3}
                      value={plDescription}
                      onChange={(e) => setPlDescription(e.target.value)}
                      placeholder="Resumo do que o aluno encontrará nesta playlist..."
                    />
                  </label>
                </div>
              </div>

              <footer className="elevn-modal-footer">
                <button type="button" className="cancel" onClick={() => setActiveModal('none')}>
                  Cancelar
                </button>
                <button type="submit" className="confirm">
                  Criar Playlist no Elevn Club
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR / EDITAR ANÚNCIO DO TOPO */}
      {activeModal === 'ad' && (
        <div className="elevn-modal-backdrop" role="dialog" aria-modal="true">
          <div className="elevn-modal-card">
            <header className="elevn-modal-header">
              <div>
                <span>ELEVN CLUB · PUBLICIDADE COMPACTA INTEGRADA</span>
                <h2>{editingAdId ? 'Editar Anúncio do Topo' : 'Novo Anúncio no Elevn Club'}</h2>
              </div>
              <button type="button" onClick={() => setActiveModal('none')}>
                ✕
              </button>
            </header>

            <form className="elevn-modal-form" onSubmit={handleSaveAd}>
              <div className="elevn-modal-split">
                <div className="elevn-modal-cover-col">
                  <label className="elevn-field-title">
                    {adImageOnly
                      ? 'Arte Completa do Anúncio (Ocupa 100% sem texto)'
                      : 'Foto Integrada ao Anúncio (Com sobreposição)'}
                  </label>
                  <div className="elevn-cover-4x3-box">
                    <img src={adCoverUrl} alt="Capa do anúncio" />
                    <span>{adImageOnly ? 'ARTE COMPLETA (SÓ FOTO)' : 'INTEGRADA AO FUNDO'}</span>
                  </div>

                  <label className="elevn-upload-trigger">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setAdCoverUrl)}
                    />
                    Subir imagem do anúncio
                  </label>

                  <div className="elevn-dimension-note">
                    <strong>Observação de dimensões (Celular):</strong>
                    <span>
                      Para celular: envie em <strong>1080 × 540 px</strong> (banner horizontal
                      compacto) ou <strong>1440 × 1080 px (4:3)</strong>. Se marcar a opção{' '}
                      <em>&ldquo;Subir só a foto&rdquo;</em>, a imagem ocupará todo o espaço da
                      publicidade com os textos já integrados na própria arte.
                    </span>
                  </div>

                  <div className="elevn-presets-row">
                    {studioCoverPresets4x3.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        className={adCoverUrl === preset.url ? 'active' : ''}
                        onClick={() => setAdCoverUrl(preset.url)}
                      >
                        <img src={preset.url} alt={preset.label} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="elevn-modal-fields-col">
                  <label className="elevn-public-toggle-box">
                    <input
                      type="checkbox"
                      checked={adImageOnly}
                      onChange={(e) => setAdImageOnly(e.target.checked)}
                    />
                    <div>
                      <strong>
                        Subir só a foto (Arte pronta ocupando 100% da publicidade, sem texto do
                        sistema)
                      </strong>
                      <small>
                        Ative quando o texto já estiver desenhado dentro da própria imagem enviada.
                      </small>
                    </div>
                  </label>

                  {!adImageOnly && (
                    <>
                      <label className="elevn-input-block">
                        <span>1. Etiqueta Superior</span>
                        <input
                          type="text"
                          value={adTagPill}
                          onChange={(e) => setAdTagPill(e.target.value)}
                          placeholder="DESTAQUE DO MÊS · PUBLICIDADE"
                        />
                      </label>

                      <label className="elevn-input-block">
                        <span>2. Frase em Destaque (Bronze/Dourado)</span>
                        <input
                          type="text"
                          value={adTitleHighlight}
                          onChange={(e) => setAdTitleHighlight(e.target.value)}
                          placeholder="Ex.: Você no comando:"
                          required={!adImageOnly}
                        />
                      </label>

                      <label className="elevn-input-block">
                        <span>3. Complemento do Título</span>
                        <input
                          type="text"
                          value={adTitleMain}
                          onChange={(e) => setAdTitleMain(e.target.value)}
                          placeholder="Ex.: garanta condições especiais no ciclo de Abril!"
                          required={!adImageOnly}
                        />
                      </label>

                      <label className="elevn-input-block">
                        <span>4. Subtítulo / Parceiro</span>
                        <input
                          type="text"
                          value={adPresenter}
                          onChange={(e) => setAdPresenter(e.target.value)}
                          placeholder="com Dr. Breno Monteiro"
                        />
                      </label>

                      <div className="elevn-two-cols">
                        <label className="elevn-input-block">
                          <span>Texto do Botão (CTA)</span>
                          <input
                            type="text"
                            value={adCtaLabel}
                            onChange={(e) => setAdCtaLabel(e.target.value)}
                            placeholder="GARANTA SEU DESCONTO!"
                          />
                        </label>
                        <label className="elevn-input-block">
                          <span>Data / Selo</span>
                          <input
                            type="text"
                            value={adDateBadge}
                            onChange={(e) => setAdDateBadge(e.target.value)}
                            placeholder="28/04/2026"
                          />
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <footer className="elevn-modal-footer">
                <button type="button" className="cancel" onClick={() => setActiveModal('none')}>
                  Cancelar
                </button>
                <button type="submit" className="confirm">
                  Salvar Anúncio Compacto
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
