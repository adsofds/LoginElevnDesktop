'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Menu } from './ui/Menu'
import { Tabs } from './ui/Tabs'

export type ClubTab = 'inicio' | 'explorar' | 'comunidade'

export type PlaylistTrackCategory =
  | 'Treino & Biomecânica'
  | 'Nutrição & Rotina que Funciona'
  | 'Mentalidade & Performance'

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

export type ChallengeScoringConfig = {
  treinoFeito: number
  cardioPago: number
  refeicaoFeita: number
  aguaTomada: number
  checkinLiveClin: number
  bonusOfensiva7Dias: number
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

export type GymRatsActivityKind =
  | 'Treino Feito'
  | 'Cardio Pago'
  | 'Refeição Feita'
  | 'Meta de Água Batida'

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
  scoring: ChallengeScoringConfig
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
    scoring: {
      treinoFeito: 100,
      cardioPago: 70,
      refeicaoFeita: 40,
      aguaTomada: 30,
      checkinLiveClin: 150,
      bonusOfensiva7Dias: 200,
    },
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
    scoring: {
      treinoFeito: 120,
      cardioPago: 100,
      refeicaoFeita: 60,
      aguaTomada: 40,
      checkinLiveClin: 200,
      bonusOfensiva7Dias: 250,
    },
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
    activityKind: 'Treino Feito',
    workoutOrMealTag: 'Treino B · Dorsal & Bíceps',
    pointsEarned: 100,
    title: 'Dorsal & Bíceps pago antes do trabalho!',
    note: 'Apliquei o ajuste de escápula da aula 001 do Elevn Club e senti muito mais a dorsal.',
    photoUrl4x3:
      'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    timeLabel: 'Hoje · 07:18 · 14º dia seguido',
    cheersCount: 18,
    cheeredByMe: true,
  },
  {
    id: 'post-2',
    challengeId: 'chal-abril',
    studentName: 'Camila Rocha',
    studentAvatar: '/people/paula-nunes.jpg',
    activityKind: 'Refeição Feita',
    workoutOrMealTag: 'Almoço WebDiet + 3,2L de Água',
    pointsEarned: 70,
    title: 'Marmita pesada na grama + meta de água batida!',
    note: 'Seguindo 100% o guia prático de marmitas da playlist de Nutrição.',
    photoUrl4x3:
      'https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    timeLabel: 'Hoje · 12:40 · 11º dia seguido',
    cheersCount: 24,
  },
  {
    id: 'post-3',
    challengeId: 'chal-abril',
    studentName: 'Thiago Mendes',
    studentAvatar: '/people/breno-monteiro.png',
    activityKind: 'Cardio Pago',
    workoutOrMealTag: 'Corrida 40 min · Z2/Z3',
    pointsEarned: 70,
    title: 'Cardio pago na pista + mobilidade de quadril',
    note: 'Foco total para garantir o pódio do Desafio de Abril.',
    photoUrl4x3:
      'https://images.unsplash.com/photo-1502904550040-7534597429ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    timeLabel: 'Ontem · 19:30 · 9º dia seguido',
    cheersCount: 15,
  },
]

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
  const [trackFilter, setTrackFilter] = useState<'Todos' | PlaylistTrackCategory>('Todos')
  const [explorePlaylistFilter, setExplorePlaylistFilter] = useState<string>('Todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Estado da Comunidade (GymRats próprio da Elevn com múltiplos desafios, premiações e pontos)
  const [challenges, setChallenges] = useState<GymRatsChallenge[]>(initialChallenges)
  const [activeChallengeId, setActiveChallengeId] = useState<string>(initialChallenges[0].id)
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<GymRatsRankingEntry[]>(initialGymRatsLeaderboard)
  const [gymRatsFeed, setGymRatsFeed] = useState<GymRatsCheckinPost[]>(initialGymRatsFeed)

  // Campos do Modal Criar / Editar Desafio GymRats
  const [chalTitle, setChalTitle] = useState('')
  const [chalPeriod, setChalPeriod] = useState('01/05/2026 a 31/05/2026 · 30 dias')
  const [chalDesc, setChalDesc] = useState('')
  const [chalCoverUrl, setChalCoverUrl] = useState(studioCoverPresets4x3[0].url)
  const [chalPrize1, setChalPrize1] = useState('1 Mês de Consultoria Elevn Black Grátis + Kit Dux')
  const [chalPrize2, setChalPrize2] = useState('50% OFF na Renovação + Camiseta Oficial Elevn Club')
  const [chalPrize3, setChalPrize3] = useState('Avaliação Física + Coqueteleira Elevn')
  const [chalRulesText, setChalRulesText] = useState(
    'Envie foto 4:3 para validar o treino do dia.\nCardio mínimo de 25 minutos.\nRefeições do WebDiet e meta de água batida somam pontos diários.',
  )
  const [ptsTreino, setPtsTreino] = useState(100)
  const [ptsCardio, setPtsCardio] = useState(70)
  const [ptsRefeicao, setPtsRefeicao] = useState(40)
  const [ptsAgua, setPtsAgua] = useState(30)
  const [ptsCheckin, setPtsCheckin] = useState(150)
  const [ptsBonus7d, setPtsBonus7d] = useState(200)

  // Campos do Modal Registrar Pontos / Check-in na Comunidade
  const [checkinActivityKind, setCheckinActivityKind] =
    useState<GymRatsActivityKind>('Treino Feito')
  const [checkinTag, setCheckinTag] = useState('Treino A · Superiores')
  const [checkinTitle, setCheckinTitle] = useState('')
  const [checkinNote, setCheckinNote] = useState('')
  const [checkinPhotoUrl, setCheckinPhotoUrl] = useState(studioCoverPresets4x3[0].url)

  // Modais de cadastro direto no Elevn Club
  const [activeModal, setActiveModal] = useState<ModalKind>('none')
  const [editingAdId, setEditingAdId] = useState<string | null>(null)

  // Campos Modal: Vídeo 4:3
  const [videoPlaylistId, setVideoPlaylistId] = useState<string>(initialPlaylists[0].id)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [videoDuration, setVideoDuration] = useState('08 MIN')
  const [videoCoverUrl, setVideoCoverUrl] = useState(studioCoverPresets4x3[0].url)
  const [videoFileName, setVideoFileName] = useState('aula-elevn-4x3.mp4')

  // Campos Modal: Playlist
  const [plTitle, setPlTitle] = useState('')
  const [plShortUpper, setPlShortUpper] = useState('')
  const [plTrack, setPlTrack] = useState<PlaylistTrackCategory>('Treino & Biomecânica')
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

  const openUploadVideoModal = (preselectedPlaylistId?: string) => {
    setVideoPlaylistId(preselectedPlaylistId || selectedPlaylistId || playlists[0]?.id || '')
    setVideoTitle('')
    setVideoDescription('')
    setVideoDuration('08 MIN')
    setVideoCoverUrl(studioCoverPresets4x3[0].url)
    setVideoFileName('nova-aula-4x3.mp4')
    setActiveModal('video')
  }

  const openNewPlaylistModal = (defaultTrack?: PlaylistTrackCategory) => {
    setPlTitle('')
    setPlShortUpper('')
    setPlTrack(defaultTrack || 'Treino & Biomecânica')
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

  const openChallengeModal = (challengeToEdit?: GymRatsChallenge) => {
    if (challengeToEdit) {
      setEditingChallengeId(challengeToEdit.id)
      setChalTitle(challengeToEdit.title)
      setChalPeriod(challengeToEdit.periodLabel)
      setChalDesc(challengeToEdit.description)
      setChalCoverUrl(challengeToEdit.coverUrl)
      setChalPrize1(challengeToEdit.prizeFirst)
      setChalPrize2(challengeToEdit.prizeSecond)
      setChalPrize3(challengeToEdit.prizeThird)
      setChalRulesText(challengeToEdit.rules.join('\n'))
      setPtsTreino(challengeToEdit.scoring.treinoFeito)
      setPtsCardio(challengeToEdit.scoring.cardioPago)
      setPtsRefeicao(challengeToEdit.scoring.refeicaoFeita)
      setPtsAgua(challengeToEdit.scoring.aguaTomada)
      setPtsCheckin(challengeToEdit.scoring.checkinLiveClin)
      setPtsBonus7d(challengeToEdit.scoring.bonusOfensiva7Dias)
    } else {
      setEditingChallengeId(null)
      setChalTitle('')
      setChalPeriod('01/05/2026 a 31/05/2026 · 30 dias')
      setChalDesc('')
      setChalCoverUrl(studioCoverPresets4x3[0].url)
      setChalPrize1('1 Mês de Consultoria Elevn Black Grátis + Kit Dux')
      setChalPrize2('50% OFF na Renovação + Camiseta Oficial Elevn Club')
      setChalPrize3('Avaliação Física Completa + Coqueteleira Elevn')
      setChalRulesText(
        'Aberto a todos os alunos do aplicativo Elevn.\nEnvie foto 4:3 para validar o treino do dia.\nCardio mínimo de 25 minutos.\nRefeições do WebDiet e meta de água batida somam pontos diários.',
      )
      setPtsTreino(100)
      setPtsCardio(70)
      setPtsRefeicao(40)
      setPtsAgua(30)
      setPtsCheckin(150)
      setPtsBonus7d(200)
    }
    setActiveModal('challenge')
  }

  const handleSaveChallenge = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanTitle = chalTitle.trim() || 'Novo Desafio Consistência Elevn Club'
    const parsedRules = chalRulesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const nextScoring: ChallengeScoringConfig = {
      treinoFeito: Number(ptsTreino) || 100,
      cardioPago: Number(ptsCardio) || 70,
      refeicaoFeita: Number(ptsRefeicao) || 40,
      aguaTomada: Number(ptsAgua) || 30,
      checkinLiveClin: Number(ptsCheckin) || 150,
      bonusOfensiva7Dias: Number(ptsBonus7d) || 200,
    }

    if (editingChallengeId) {
      setChallenges((current) =>
        current.map((ch) =>
          ch.id === editingChallengeId
            ? {
                ...ch,
                title: cleanTitle,
                periodLabel: chalPeriod.trim() || '30 dias',
                description:
                  chalDesc.trim() ||
                  'Desafio oficial aberto a todos os alunos do aplicativo com pontuação por treino, cardio, dieta e água.',
                coverUrl: chalCoverUrl,
                prizeFirst: chalPrize1.trim() || 'Prêmio 1º colocado',
                prizeSecond: chalPrize2.trim() || 'Prêmio 2º colocado',
                prizeThird: chalPrize3.trim() || 'Prêmio 3º colocado',
                rules:
                  parsedRules.length > 0
                    ? parsedRules
                    : ['Registre suas atividades diárias com foto 4:3.'],
                scoring: nextScoring,
              }
            : ch,
        ),
      )
      setToastMessage(`Desafio "${cleanTitle}" atualizado para todos os alunos do aplicativo!`)
    } else {
      const created: GymRatsChallenge = {
        id: `chal-${Date.now()}`,
        title: cleanTitle,
        periodLabel: chalPeriod.trim() || '30 dias',
        participantsCount: 1,
        description:
          chalDesc.trim() ||
          'Desafio oficial aberto a todos os alunos do aplicativo com pontuação por treino, cardio, dieta e água.',
        coverUrl: chalCoverUrl,
        prizeFirst: chalPrize1.trim() || 'Prêmio 1º colocado',
        prizeSecond: chalPrize2.trim() || 'Prêmio 2º colocado',
        prizeThird: chalPrize3.trim() || 'Prêmio 3º colocado',
        rules:
          parsedRules.length > 0 ? parsedRules : ['Registre suas atividades diárias com foto 4:3.'],
        scoring: nextScoring,
      }
      setChallenges((current) => [created, ...current])
      setActiveChallengeId(created.id)
      setToastMessage(`Novo desafio "${created.title}" criado e liberado para todos no aplicativo!`)
    }

    setActiveModal('none')
  }

  const handleSaveVideo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!videoTitle.trim()) return

    const targetPlaylist = playlists.find((item) => item.id === videoPlaylistId) ?? playlists[0]
    if (!targetPlaylist) return

    const nextNumber = String(targetPlaylist.lessons.length + 1).padStart(3, '0')
    const newLesson: PlaylistLessonVideo = {
      id: `les-${Date.now()}`,
      numberLabel: nextNumber,
      title: videoTitle.trim(),
      description:
        videoDescription.trim() ||
        'Aula publicada em formato 4:3 para visualização no celular dos alunos.',
      durationMinutes: videoDuration.trim().toUpperCase().includes('MIN')
        ? videoDuration.trim().toUpperCase()
        : `${videoDuration.trim() || '08'} MIN`,
      coverUrl: videoCoverUrl,
      videoFileName,
      publishedAt: 'Publicado agora',
      watchProgressPercent: 15,
      stoppedAtLabel: 'Recém-publicado · Começar agora',
      lastWatchedLabel: 'Adicionado agora no Elevn Club',
    }

    setPlaylists((current) =>
      current.map((pl) =>
        pl.id === targetPlaylist.id ? { ...pl, lessons: [...pl.lessons, newLesson] } : pl,
      ),
    )
    setActiveModal('none')
    setToastMessage(
      `Vídeo "${newLesson.numberLabel} - ${newLesson.title}" publicado em "${targetPlaylist.title}"!`,
    )
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

  const getPointsForActivity = (kind: GymRatsActivityKind): number => {
    const s = activeChallenge?.scoring ?? {
      treinoFeito: 100,
      cardioPago: 70,
      refeicaoFeita: 40,
      aguaTomada: 30,
      checkinLiveClin: 150,
      bonusOfensiva7Dias: 200,
    }
    if (kind === 'Treino Feito') return s.treinoFeito
    if (kind === 'Cardio Pago') return s.cardioPago
    if (kind === 'Refeição Feita') return s.refeicaoFeita
    return s.aguaTomada
  }

  const handleSaveGymRatsCheckin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!checkinTitle.trim() || !activeChallenge) return
    const awardedPoints = getPointsForActivity(checkinActivityKind)
    const newPost: GymRatsCheckinPost = {
      id: `post-${Date.now()}`,
      challengeId: activeChallenge.id,
      studentName: 'Breno Monteiro (Admin)',
      studentAvatar: '/people/breno-monteiro.png',
      activityKind: checkinActivityKind,
      workoutOrMealTag: checkinTag.trim() || checkinActivityKind,
      pointsEarned: awardedPoints,
      title: checkinTitle.trim(),
      note:
        checkinNote.trim() ||
        `Registro validado no ${activeChallenge.title} (+${awardedPoints} pts).`,
      photoUrl4x3: checkinPhotoUrl,
      timeLabel: 'Agora mesmo · Verificado',
      cheersCount: 1,
      cheeredByMe: true,
    }
    setGymRatsFeed((current) => [newPost, ...current])
    setLeaderboard((current) =>
      current.map((entry, idx) =>
        idx === 0
          ? {
              ...entry,
              workoutsPaid:
                checkinActivityKind === 'Treino Feito'
                  ? entry.workoutsPaid + 1
                  : entry.workoutsPaid,
              cardioDone:
                checkinActivityKind === 'Cardio Pago' ? entry.cardioDone + 1 : entry.cardioDone,
              mealsLogged:
                checkinActivityKind === 'Refeição Feita'
                  ? entry.mealsLogged + 1
                  : entry.mealsLogged,
              waterDays:
                checkinActivityKind === 'Meta de Água Batida'
                  ? entry.waterDays + 1
                  : entry.waterDays,
              points: entry.points + awardedPoints,
            }
          : entry,
      ),
    )
    setCheckinTitle('')
    setCheckinNote('')
    setActiveModal('none')
    setToastMessage(
      `${checkinActivityKind} registrado (+${awardedPoints} pts) na Comunidade Elevn Club!`,
    )
  }

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

  const tracksToRender: PlaylistTrackCategory[] =
    trackFilter === 'Todos'
      ? ['Treino & Biomecânica', 'Nutrição & Rotina que Funciona', 'Mentalidade & Performance']
      : [trackFilter]

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
              <Menu
                label="Publicar no Elevn Club"
                items={[
                  {
                    id: 'video',
                    label: 'Vídeo (4:3)',
                    description: '1440 × 1080 px, para o celular do aluno',
                    onSelect: () => openUploadVideoModal(),
                  },
                  {
                    id: 'playlist',
                    label: 'Playlist',
                    description: 'Nova trilha de aulas',
                    onSelect: () => openNewPlaylistModal(),
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
                    + ADICIONAR VÍDEO (4:3) NESTA PLAYLIST
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
                          + Subir primeiro vídeo 4:3
                        </button>
                      </div>
                    ) : (
                      selectedPlaylist.lessons.map((lesson) => (
                        <article key={lesson.id} className="elevn-pl-lesson-row">
                          <div className="elevn-pl-lesson-thumb-4x3">
                            <img src={lesson.coverUrl} alt={lesson.title} />
                            <span>4:3</span>
                          </div>
                          <div className="elevn-pl-lesson-copy">
                            <h4>
                              {lesson.numberLabel} - {lesson.title}
                            </h4>
                            <small>
                              ▶ VÍDEO - {lesson.durationMinutes} · {lesson.publishedAt}
                            </small>
                            <p>{lesson.description}</p>
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
                  <h3>Meu Progresso</h3>
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
                    Você está indo muito bem! Continue subindo aulas práticas em formato 4:3 para
                    guiar a execução dos alunos no aplicativo.
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
              <div className="elevn-track-filters-bar">
                <div className="pills">
                  <button
                    type="button"
                    className={trackFilter === 'Todos' ? 'active' : ''}
                    onClick={() => setTrackFilter('Todos')}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    className={trackFilter === 'Treino & Biomecânica' ? 'active' : ''}
                    onClick={() => setTrackFilter('Treino & Biomecânica')}
                  >
                    Treino & Biomecânica
                  </button>
                  <button
                    type="button"
                    className={trackFilter === 'Nutrição & Rotina que Funciona' ? 'active' : ''}
                    onClick={() => setTrackFilter('Nutrição & Rotina que Funciona')}
                  >
                    Nutrição & Rotina que Funciona
                  </button>
                  <button
                    type="button"
                    className={trackFilter === 'Mentalidade & Performance' ? 'active' : ''}
                    onClick={() => setTrackFilter('Mentalidade & Performance')}
                  >
                    Mentalidade & Performance
                  </button>
                </div>

                <button
                  type="button"
                  className="inline-Explore-link"
                  onClick={() => setClubTab('explorar')}
                >
                  Ver todos os vídeos & Continuar assistindo →
                </button>
              </div>

              <div className="elevn-welcome-header">
                <h2>Seja bem-vindo(a) ao Elevn Club!</h2>
                <span>
                  {playlists.length} playlists ativas ·{' '}
                  {playlists.reduce((acc, p) => acc + p.lessons.length, 0)} aulas em formato 4:3
                </span>
              </div>

              {tracksToRender.map((trackName) => {
                const list = filteredPlaylists.filter((pl) => pl.trackCategory === trackName)
                return (
                  <section key={trackName} className="elevn-track-group">
                    <header className="elevn-track-group-head">
                      <h3>{trackName}</h3>
                      <button type="button" onClick={() => openNewPlaylistModal(trackName)}>
                        + Nova playlist nesta trilha
                      </button>
                    </header>

                    <div className="elevn-posters-row">
                      {list.map((playlist) => (
                        <article
                          key={playlist.id}
                          className="elevn-poster-card"
                          style={{ '--poster-tone': playlist.accentColor } as React.CSSProperties}
                          onClick={() => setSelectedPlaylistId(playlist.id)}
                        >
                          <img src={playlist.coverUrl} alt={playlist.title} />
                          <div className="elevn-poster-overlay" />

                          <div className="elevn-poster-top">
                            <span>{playlist.lessons.length} aulas · 4:3</span>
                            <i>◆</i>
                          </div>

                          <div className="elevn-poster-bottom">
                            <strong>{playlist.shortUpperTitle}</strong>
                            <small>{playlist.title}</small>
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

                      <button
                        type="button"
                        className="elevn-add-poster-card"
                        onClick={() => openNewPlaylistModal(trackName)}
                      >
                        <span>+</span>
                        <strong>Nova Playlist</strong>
                        <small>Adicionar em {trackName}</small>
                      </button>
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
                  <span>ONDE VOCÊ PAROU</span>
                  <h2>Continuar de onde parou</h2>
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
                    + Subir Vídeo (4:3)
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
                      <span className="ratio">4:3</span>
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
            <section className="elevn-challenges-strip">
              <div className="challenges-strip-left">
                <span>DESAFIOS DA COMUNIDADE ELEVN CLUB:</span>
                <div className="challenge-pills-row">
                  {challenges.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      className={ch.id === activeChallenge?.id ? 'active' : ''}
                      onClick={() => setActiveChallengeId(ch.id)}
                    >
                      <strong>{ch.title}</strong>
                      <small className="pub">Aberto a todos no App</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="challenges-strip-actions">
                <button
                  type="button"
                  className="outline"
                  onClick={() => activeChallenge && openChallengeModal(activeChallenge)}
                >
                  ✎ Editar Desafio, Prêmios & Pontos
                </button>
                <button type="button" className="gold" onClick={() => openChallengeModal()}>
                  + Criar Novo Desafio
                </button>
              </div>
            </section>

            {activeChallenge && (
              <>
                {/* CABEÇALHO DO DESAFIO ATIVO (ABERTO A TODOS OS ALUNOS DO APP) */}
                <section className="elevn-challenge-banner">
                  <div className="challenge-banner-main">
                    <div className="challenge-meta-row">
                      <span className="club-tag">GYMRATS ELEVN CLUB</span>
                      <span className="visibility-pill public">
                        ● ABERTO A TODOS OS ALUNOS DO APLICATIVO
                      </span>
                    </div>

                    <h2>{activeChallenge.title}</h2>
                    <p>{activeChallenge.description}</p>

                    <div className="challenge-quick-stats">
                      <div>
                        <span>PERÍODO DO DESAFIO</span>
                        <strong>{activeChallenge.periodLabel}</strong>
                      </div>
                      <div>
                        <span>PARTICIPANTES ATIVOS</span>
                        <strong>{activeChallenge.participantsCount} alunos no ranking</strong>
                      </div>
                    </div>

                    <div className="challenge-cta-row">
                      <button
                        type="button"
                        className="register-activity-btn"
                        onClick={() => setActiveModal('gymrats-checkin')}
                      >
                        + REGISTRAR TREINO, CARDIO, REFEIÇÃO OU ÁGUA (FOTO 4:3)
                      </button>
                      <button
                        type="button"
                        className="edit-challenge-btn"
                        onClick={() => openChallengeModal(activeChallenge)}
                      >
                        Configurar Premiações, Regras e Pontos
                      </button>
                    </div>
                  </div>

                  <div className="challenge-banner-thumb">
                    <img src={activeChallenge.coverUrl} alt={activeChallenge.title} />
                    <span>CAPA 4:3 DO DESAFIO</span>
                  </div>
                </section>

                {/* BLOCO DE PREMIAÇÕES (1º, 2º E 3º COLOCADO) + SISTEMA DE PONTOS + REGRAS */}
                <section className="elevn-challenge-details-grid">
                  {/* PREMIAÇÕES DO PÓDIO */}
                  <article className="elevn-prizes-card">
                    <header>
                      <div>
                        <span>PREMIAÇÕES OFICIAIS DO DESAFIO</span>
                        <h3>Recompensas para 1º, 2º e 3º Colocado</h3>
                      </div>
                      <button type="button" onClick={() => openChallengeModal(activeChallenge)}>
                        ✎ Editar prêmios
                      </button>
                    </header>

                    <div className="prizes-stack">
                      <div className="prize-item gold">
                        <span className="medal">1º LUGAR</span>
                        <strong>{activeChallenge.prizeFirst}</strong>
                      </div>
                      <div className="prize-item silver">
                        <span className="medal">2º LUGAR</span>
                        <strong>{activeChallenge.prizeSecond}</strong>
                      </div>
                      <div className="prize-item bronze">
                        <span className="medal">3º LUGAR</span>
                        <strong>{activeChallenge.prizeThird}</strong>
                      </div>
                    </div>
                  </article>

                  {/* SISTEMA DE PONTOS: QUANTO VALE CADA COISA */}
                  <article className="elevn-scoring-card">
                    <header>
                      <div>
                        <span>SISTEMA DE PONTOS DO DESAFIO</span>
                        <h3>Quanto vale cada atividade registrada</h3>
                      </div>
                      <button type="button" onClick={() => openChallengeModal(activeChallenge)}>
                        ✎ Ajustar pontos
                      </button>
                    </header>

                    <div className="scoring-items-grid">
                      <div className="score-pill-box">
                        <span>Treino Concluído (MFIT)</span>
                        <strong>+{activeChallenge.scoring.treinoFeito} pts</strong>
                      </div>
                      <div className="score-pill-box">
                        <span>Cardio Pago ( mín. 25 min)</span>
                        <strong>+{activeChallenge.scoring.cardioPago} pts</strong>
                      </div>
                      <div className="score-pill-box">
                        <span>Refeição do Plano Feita</span>
                        <strong>+{activeChallenge.scoring.refeicaoFeita} pts</strong>
                      </div>
                      <div className="score-pill-box">
                        <span>Meta de Água Batida no Dia</span>
                        <strong>+{activeChallenge.scoring.aguaTomada} pts</strong>
                      </div>
                      <div className="score-pill-box">
                        <span>Check-in LiveClin em Dia</span>
                        <strong>+{activeChallenge.scoring.checkinLiveClin} pts</strong>
                      </div>
                      <div className="score-pill-box highlight">
                        <span>Bônus Ofensiva (7 dias seguidos)</span>
                        <strong>+{activeChallenge.scoring.bonusOfensiva7Dias} pts</strong>
                      </div>
                    </div>
                  </article>

                  {/* REGRAS DO DESAFIO */}
                  <article className="elevn-rules-card">
                    <header>
                      <div>
                        <span>REGULAMENTO DO DESAFIO</span>
                        <h3>Regras de validação definidas pelo Admin</h3>
                      </div>
                      <button type="button" onClick={() => openChallengeModal(activeChallenge)}>
                        ✎ Editar regras
                      </button>
                    </header>

                    <ul className="rules-list">
                      {activeChallenge.rules.map((rule, idx) => (
                        <li key={idx}>
                          <span>{String(idx + 1).padStart(2, '0')}</span>
                          <p>{rule}</p>
                        </li>
                      ))}
                    </ul>
                  </article>
                </section>

                {/* RANKING GERAL + MURAL DE ATIVIDADES DA COMUNIDADE */}
                <section className="elevn-gymrats-bottom-split">
                  <div className="elevn-leaderboard-card">
                    <header>
                      <span>RANKING EM TEMPO REAL</span>
                      <h3>Classificação dos Alunos (1º ao 4º)</h3>
                    </header>

                    <div className="leaderboard-rows">
                      {leaderboard.map((member, index) => (
                        <article key={member.id} className="leaderboard-row">
                          <span className={`pos-badge pos-${index + 1}`}>{index + 1}º</span>
                          <img src={member.avatar} alt={member.name} />
                          <div className="member-copy">
                            <strong>{member.name}</strong>
                            <small>
                              {member.workoutsPaid} treinos · {member.cardioDone} cardios ·{' '}
                              {member.mealsLogged} refeições · {member.waterDays}d água
                            </small>
                          </div>
                          <div className="member-points">
                            <strong>{member.points} pts</strong>
                            <span>{member.streakDays} dias seguidos</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="elevn-community-feed-card">
                    <header>
                      <div>
                        <span>MURAL DE CHECK-INS 4:3</span>
                        <h3>Treinos, Cardios, Refeições e Água Registrados</h3>
                      </div>
                      <button type="button" onClick={() => setActiveModal('gymrats-checkin')}>
                        + Postar Registro
                      </button>
                    </header>

                    <div className="community-feed-grid">
                      {gymRatsFeed.map((post) => (
                        <article key={post.id} className="community-post-card">
                          <header className="post-top">
                            <img src={post.studentAvatar} alt={post.studentName} />
                            <div>
                              <strong>{post.studentName}</strong>
                              <small>{post.timeLabel}</small>
                            </div>
                            <span className="points-earned-pill">+{post.pointsEarned} pts</span>
                          </header>

                          <div className="post-photo-4x3">
                            <img src={post.photoUrl4x3} alt={post.title} />
                            <span className="kind-chip">{post.activityKind}</span>
                            <span className="tag-chip">{post.workoutOrMealTag}</span>
                          </div>

                          <div className="post-body">
                            <h4>{post.title}</h4>
                            <p>{post.note}</p>
                            <button
                              type="button"
                              className={post.cheeredByMe ? 'active' : ''}
                              onClick={() => toggleCheerPost(post.id)}
                            >
                              ◆ Incentivar ({post.cheersCount})
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </div>

      {/* MODAL: CRIAR / EDITAR DESAFIO GYMRATS (ABERTO/FECHADO, PRÊMIOS 1º/2º/3º, REGRAS E SISTEMA DE PONTOS) */}
      {activeModal === 'challenge' && (
        <div className="elevn-modal-backdrop" role="dialog" aria-modal="true">
          <div className="elevn-modal-card wide">
            <header className="elevn-modal-header">
              <div>
                <span>COMUNIDADE ELEVN CLUB · CONFIGURAR DESAFIO & SISTEMA DE PONTOS</span>
                <h2>
                  {editingChallengeId
                    ? 'Editar Desafio, Premiações, Regras e Pontuação'
                    : 'Criar Novo Desafio na Comunidade'}
                </h2>
              </div>
              <button type="button" onClick={() => setActiveModal('none')}>
                ✕
              </button>
            </header>

            <form className="elevn-modal-form" onSubmit={handleSaveChallenge}>
              <div className="elevn-modal-split">
                <div className="elevn-modal-cover-col">
                  <label className="elevn-field-title">Capa 4:3 do Desafio</label>
                  <div className="elevn-cover-4x3-box">
                    <img src={chalCoverUrl} alt="Capa do desafio" />
                    <span>DESAFIO 4:3</span>
                  </div>

                  <label className="elevn-upload-trigger">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setChalCoverUrl)}
                    />
                    Subir capa 4:3 do desafio
                  </label>

                  <div className="elevn-dimension-note">
                    <strong>Observação de dimensões (Celular):</strong>
                    <span>
                      Envie a capa do desafio em <strong>1440 × 1080 px (Proporção 4:3)</strong>{' '}
                      para exibição perfeita na tela do celular dos alunos. Todos os desafios ficam
                      abertos a todos que têm o aplicativo.
                    </span>
                  </div>
                </div>

                <div className="elevn-modal-fields-col">
                  <div className="elevn-two-cols">
                    <label className="elevn-input-block">
                      <span>Título do Desafio</span>
                      <input
                        type="text"
                        value={chalTitle}
                        onChange={(e) => setChalTitle(e.target.value)}
                        placeholder="Ex.: Desafio 30 Dias Seca Barriga & Consistência"
                        required
                      />
                    </label>
                    <label className="elevn-input-block">
                      <span>Período / Duração</span>
                      <input
                        type="text"
                        value={chalPeriod}
                        onChange={(e) => setChalPeriod(e.target.value)}
                        placeholder="01/05/2026 a 31/05/2026"
                      />
                    </label>
                  </div>

                  <label className="elevn-input-block">
                    <span>Descrição do Desafio</span>
                    <input
                      type="text"
                      value={chalDesc}
                      onChange={(e) => setChalDesc(e.target.value)}
                      placeholder="Explique o objetivo geral do desafio para os alunos..."
                    />
                  </label>

                  {/* PREMIAÇÕES 1º, 2º E 3º COLOCADO */}
                  <div className="elevn-modal-subbox">
                    <strong>Premiações do Pódio (1º, 2º e 3º Colocado)</strong>
                    <div className="elevn-three-cols">
                      <label className="elevn-input-block">
                        <span>1º Colocado (Ouro)</span>
                        <input
                          type="text"
                          value={chalPrize1}
                          onChange={(e) => setChalPrize1(e.target.value)}
                        />
                      </label>
                      <label className="elevn-input-block">
                        <span>2º Colocado (Prata)</span>
                        <input
                          type="text"
                          value={chalPrize2}
                          onChange={(e) => setChalPrize2(e.target.value)}
                        />
                      </label>
                      <label className="elevn-input-block">
                        <span>3º Colocado (Bronze)</span>
                        <input
                          type="text"
                          value={chalPrize3}
                          onChange={(e) => setChalPrize3(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* SISTEMA DE PONTOS */}
                  <div className="elevn-modal-subbox">
                    <strong>Sistema de Pontos (Quanto vale cada atividade em pontos)</strong>
                    <div className="elevn-three-cols">
                      <label className="elevn-input-block">
                        <span>Treino Feito (pts)</span>
                        <input
                          type="number"
                          value={ptsTreino}
                          onChange={(e) => setPtsTreino(Number(e.target.value))}
                        />
                      </label>
                      <label className="elevn-input-block">
                        <span>Cardio Pago (pts)</span>
                        <input
                          type="number"
                          value={ptsCardio}
                          onChange={(e) => setPtsCardio(Number(e.target.value))}
                        />
                      </label>
                      <label className="elevn-input-block">
                        <span>Refeição Feita (pts)</span>
                        <input
                          type="number"
                          value={ptsRefeicao}
                          onChange={(e) => setPtsRefeicao(Number(e.target.value))}
                        />
                      </label>
                      <label className="elevn-input-block">
                        <span>Água Batida (pts)</span>
                        <input
                          type="number"
                          value={ptsAgua}
                          onChange={(e) => setPtsAgua(Number(e.target.value))}
                        />
                      </label>
                      <label className="elevn-input-block">
                        <span>Check-in LiveClin (pts)</span>
                        <input
                          type="number"
                          value={ptsCheckin}
                          onChange={(e) => setPtsCheckin(Number(e.target.value))}
                        />
                      </label>
                      <label className="elevn-input-block">
                        <span>Bônus 7 Dias Seguidos</span>
                        <input
                          type="number"
                          value={ptsBonus7d}
                          onChange={(e) => setPtsBonus7d(Number(e.target.value))}
                        />
                      </label>
                    </div>
                  </div>

                  <label className="elevn-input-block">
                    <span>Regras do Desafio (uma regra por linha)</span>
                    <textarea
                      rows={3}
                      value={chalRulesText}
                      onChange={(e) => setChalRulesText(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <footer className="elevn-modal-footer">
                <button type="button" className="cancel" onClick={() => setActiveModal('none')}>
                  Cancelar
                </button>
                <button type="submit" className="confirm">
                  {editingChallengeId ? 'Salvar Alterações do Desafio' : 'Publicar Novo Desafio'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBIR VÍDEO 4:3 */}
      {activeModal === 'video' && (
        <div className="elevn-modal-backdrop" role="dialog" aria-modal="true">
          <div className="elevn-modal-card">
            <header className="elevn-modal-header">
              <div>
                <span>ELEVN CLUB · NOVO VÍDEO 4:3</span>
                <h2>Subir Aula em Vídeo para Playlist</h2>
              </div>
              <button type="button" onClick={() => setActiveModal('none')}>
                ✕
              </button>
            </header>

            <form className="elevn-modal-form" onSubmit={handleSaveVideo}>
              <div className="elevn-modal-split">
                <div className="elevn-modal-cover-col">
                  <label className="elevn-field-title">Capa do Vídeo (Exclusiva 4:3)</label>
                  <div className="elevn-cover-4x3-box">
                    <img src={videoCoverUrl} alt="Capa 4:3" />
                    <span>4:3 · MOBILE</span>
                  </div>

                  <label className="elevn-upload-trigger">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setVideoCoverUrl)}
                    />
                    Subir capa 4:3 do dispositivo
                  </label>

                  <div className="elevn-dimension-note">
                    <strong>Observação de dimensões (Celular):</strong>
                    <span>
                      Dimensão recomendada da capa do vídeo:{' '}
                      <strong>1440 × 1080 px (Proporção 4:3 Mobile)</strong> · JPG ou PNG até 5 MB.
                    </span>
                  </div>

                  <div className="elevn-presets-row">
                    {studioCoverPresets4x3.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        className={videoCoverUrl === preset.url ? 'active' : ''}
                        onClick={() => setVideoCoverUrl(preset.url)}
                      >
                        <img src={preset.url} alt={preset.label} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="elevn-modal-fields-col">
                  <label className="elevn-input-block">
                    <span>1. Playlist de destino</span>
                    <select
                      value={videoPlaylistId}
                      onChange={(e) => setVideoPlaylistId(e.target.value)}
                    >
                      {playlists.map((pl) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.title} ({pl.trackCategory})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="elevn-input-block">
                    <span>2. Título do Vídeo</span>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Ex.: Ajuste de escápula na Remada Baixa"
                      required
                    />
                  </label>

                  <div className="elevn-two-cols">
                    <label className="elevn-input-block">
                      <span>3. Arquivo de Vídeo</span>
                      <label className="elevn-file-input">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) setVideoFileName(f.name)
                          }}
                        />
                        <span>Escolher</span>
                        <small>{videoFileName}</small>
                      </label>
                    </label>

                    <label className="elevn-input-block">
                      <span>Duração</span>
                      <input
                        type="text"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                        placeholder="08 MIN"
                      />
                    </label>
                  </div>

                  <label className="elevn-input-block">
                    <span>4. Descrição da Aula</span>
                    <textarea
                      rows={3}
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Orientação prática que o aluno verá abaixo do vídeo..."
                    />
                  </label>
                </div>
              </div>

              <footer className="elevn-modal-footer">
                <button type="button" className="cancel" onClick={() => setActiveModal('none')}>
                  Cancelar
                </button>
                <button type="submit" className="confirm">
                  Publicar no Elevn Club
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

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
                      <option value="Treino & Biomecânica">Treino & Biomecânica</option>
                      <option value="Nutrição & Rotina que Funciona">
                        Nutrição & Rotina que Funciona
                      </option>
                      <option value="Mentalidade & Performance">Mentalidade & Performance</option>
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

      {/* MODAL: REGISTRAR ATIVIDADE PONTUADA NO GYMRATS (TREINO, CARDIO, REFEIÇÃO OU ÁGUA) */}
      {activeModal === 'gymrats-checkin' && (
        <div className="elevn-modal-backdrop" role="dialog" aria-modal="true">
          <div className="elevn-modal-card">
            <header className="elevn-modal-header">
              <div>
                <span>COMUNIDADE ELEVN CLUB · REGISTRAR ATIVIDADE PONTUADA</span>
                <h2>Registrar Treino, Cardio, Refeição ou Meta de Água</h2>
              </div>
              <button type="button" onClick={() => setActiveModal('none')}>
                ✕
              </button>
            </header>

            <form className="elevn-modal-form" onSubmit={handleSaveGymRatsCheckin}>
              <div className="elevn-modal-split">
                <div className="elevn-modal-cover-col">
                  <label className="elevn-field-title">Foto 4:3 da Atividade</label>
                  <div className="elevn-cover-4x3-box">
                    <img src={checkinPhotoUrl} alt="Foto da atividade" />
                    <span>+{getPointsForActivity(checkinActivityKind)} PTS</span>
                  </div>

                  <label className="elevn-upload-trigger">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setCheckinPhotoUrl)}
                    />
                    Enviar foto 4:3
                  </label>
                </div>

                <div className="elevn-modal-fields-col">
                  <label className="elevn-input-block">
                    <span>1. Qual atividade está sendo registrada?</span>
                    <select
                      value={checkinActivityKind}
                      onChange={(e) =>
                        setCheckinActivityKind(e.target.value as GymRatsActivityKind)
                      }
                    >
                      <option value="Treino Feito">
                        Treino Feito (+{activeChallenge?.scoring.treinoFeito ?? 100} pts)
                      </option>
                      <option value="Cardio Pago">
                        Cardio Pago (+{activeChallenge?.scoring.cardioPago ?? 70} pts)
                      </option>
                      <option value="Refeição Feita">
                        Refeição do Plano Feita (+{activeChallenge?.scoring.refeicaoFeita ?? 40}{' '}
                        pts)
                      </option>
                      <option value="Meta de Água Batida">
                        Meta de Água Batida (+{activeChallenge?.scoring.aguaTomada ?? 30} pts)
                      </option>
                    </select>
                  </label>

                  <label className="elevn-input-block">
                    <span>2. Identificação (Ex.: Treino A, Almoço WebDiet, 3.5L Água)</span>
                    <input
                      type="text"
                      value={checkinTag}
                      onChange={(e) => setCheckinTag(e.target.value)}
                      placeholder="Ex.: Treino A · Peito & Ombro"
                    />
                  </label>

                  <label className="elevn-input-block">
                    <span>3. Título do Registro</span>
                    <input
                      type="text"
                      value={checkinTitle}
                      onChange={(e) => setCheckinTitle(e.target.value)}
                      placeholder="Ex.: Treino concluído e água do dia batida!"
                      required
                    />
                  </label>

                  <label className="elevn-input-block">
                    <span>4. Comentário para a Comunidade</span>
                    <textarea
                      rows={2}
                      value={checkinNote}
                      onChange={(e) => setCheckinNote(e.target.value)}
                      placeholder="Conte como foi o registro de hoje..."
                    />
                  </label>
                </div>
              </div>

              <footer className="elevn-modal-footer">
                <button type="button" className="cancel" onClick={() => setActiveModal('none')}>
                  Cancelar
                </button>
                <button type="submit" className="confirm">
                  Publicar Registro (+{getPointsForActivity(checkinActivityKind)} pts)
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
