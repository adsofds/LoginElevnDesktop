export type InternalUpdateReply = {
  id: string
  author: string
  avatar: string
  role: string
  time: string
  message: string
}

export type InternalUpdate = {
  id: string
  author: string
  initials: string
  avatar: string
  role: 'Administrador' | 'Gerente' | 'Colaborador' | 'Aluno'
  time: string
  subject: string
  message: string
  audience: string
  recipientCategory: 'equipe' | 'aluno'
  type: 'Mensagem' | 'Tarefa' | 'Lembrete'
  completed: boolean
  unread?: boolean
  replies?: InternalUpdateReply[]
}

export type LeadTemperature = 'Fechado' | 'Quente' | 'Morno' | 'Frio'

export type SiteFormSubmission = {
  id: string
  name: string
  phone: string
  instagram: string
  referralOrBirth: string
  submittedAtIso: string
  temperature: LeadTemperature
}

const BUSINESS_TIME_ZONE = 'America/Sao_Paulo'

const dateTimeParts = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BUSINESS_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

/** Formats an ISO timestamp in Brasília time (the stored value is UTC). */
export function formatFormTimestamp(isoString: string): {
  dateLabel: string
  timeLabel: string
  fullLabel: string
} {
  const parsed = new Date(isoString)
  if (Number.isNaN(parsed.getTime())) {
    return {
      dateLabel: isoString,
      timeLabel: '',
      fullLabel: isoString,
    }
  }
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateTimeParts.formatToParts(parsed).find((p) => p.type === type)?.value ?? ''
  const dd = part('day')
  const mm = part('month')
  const yyyy = part('year')
  const hh = part('hour')
  const min = part('minute')
  const sec = part('second')
  return {
    dateLabel: `${dd}/${mm}/${yyyy}`,
    timeLabel: `${hh}:${min}:${sec}`,
    fullLabel: `${dd}/${mm}/${yyyy} às ${hh}:${min}`,
  }
}

/** "há 3 dias", "há 2 h", "agora" relative to now. */
export function formatRelativeTime(isoString: string, now: Date = new Date()): string {
  const parsed = new Date(isoString)
  if (Number.isNaN(parsed.getTime())) return ''
  const diffMinutes = Math.round((now.getTime() - parsed.getTime()) / 60000)
  if (diffMinutes < 1) return 'agora'
  if (diffMinutes < 60) return `há ${diffMinutes} min`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `há ${diffHours} h`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays === 1) return 'ontem'
  if (diffDays < 30) return `há ${diffDays} dias`
  const diffMonths = Math.round(diffDays / 30)
  if (diffMonths < 12) return diffMonths === 1 ? 'há 1 mês' : `há ${diffMonths} meses`
  const diffYears = Math.round(diffMonths / 12)
  return diffYears === 1 ? 'há 1 ano' : `há ${diffYears} anos`
}

const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * The site form stores referral and birth date in one field (referralOrBirth).
 * Split it for display without changing the stored value.
 */
export function splitReferralOrBirth(value: string): { referral: string; birthDate: string } {
  const trimmed = value.trim()
  const match = trimmed.match(ISO_DATE_ONLY)
  if (match) {
    return { referral: '—', birthDate: `${match[3]}/${match[2]}/${match[1]}` }
  }
  const referral = trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : '—'
  return { referral, birthDate: '—' }
}

const LOWERCASE_NAME_PARTICLES = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])

/** Capitalizes names typed in lowercase on the form ("maria da silva" -> "Maria da Silva"). */
export function formatPersonName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed || trimmed !== trimmed.toLowerCase()) return trimmed
  return trimmed
    .split(/\s+/)
    .map((word, index) =>
      index > 0 && LOWERCASE_NAME_PARTICLES.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ')
}

// Dados fictícios de demonstração. Nunca coloque leads reais neste arquivo: ele vai para o navegador.
export const initialSiteFormSubmissions: SiteFormSubmission[] = [
  {
    id: 'form-1',
    name: 'Rafael Teixeira',
    phone: '(84) 90000-0101',
    instagram: '@rafa.teixeira.fit',
    referralOrBirth: 'Indicação',
    submittedAtIso: '2026-03-03T13:14:53.630Z',
    temperature: 'Quente',
  },
  {
    id: 'form-2',
    name: 'Bruna Cavalcanti',
    phone: '(84) 90000-0102',
    instagram: '—',
    referralOrBirth: '1994-03-12',
    submittedAtIso: '2026-08-22T12:33:15.718Z',
    temperature: 'Fechado',
  },
  {
    id: 'form-3',
    name: 'carolinamedeiros',
    phone: '(84) 90000-0103',
    instagram: '@carolinamedeiros',
    referralOrBirth: '1999-06-28',
    submittedAtIso: '2026-09-01T20:19:04.002Z',
    temperature: 'Fechado',
  },
  {
    id: 'form-4',
    name: 'Helena Duarte Lins de Albuquerque',
    phone: '(31) 90000-0104',
    instagram: '@helenaduarte',
    referralOrBirth: '1996-11-04',
    submittedAtIso: '2026-09-04T00:33:16.742Z',
    temperature: 'Frio',
  },
  {
    id: 'form-5',
    name: 'Sofia Barreto',
    phone: '(84) 90000-0105',
    instagram: '@sofiabarreto',
    referralOrBirth: '1992-01-19',
    submittedAtIso: '2026-09-08T20:45:49.869Z',
    temperature: 'Frio',
  },
  {
    id: 'form-6',
    name: 'Lívia Macedo',
    phone: '(84) 90000-0106',
    instagram: '@livia.macedo',
    referralOrBirth: '1998-05-30',
    submittedAtIso: '2026-09-15T01:01:32.063Z',
    temperature: 'Frio',
  },
  {
    id: 'form-7',
    name: 'Yasmin Torres Prado',
    phone: '(38) 90000-0107',
    instagram: '@yasmintprado',
    referralOrBirth: '1995-08-14',
    submittedAtIso: '2026-09-25T21:33:35.809Z',
    temperature: 'Frio',
  },
  {
    id: 'form-8',
    name: 'Natália Fontes Ribeiro',
    phone: '(38) 90000-0108',
    instagram: '@nat fontes',
    referralOrBirth: '1993-02-07',
    submittedAtIso: '2026-10-08T10:16:07.011Z',
    temperature: 'Fechado',
  },
  {
    id: 'form-9',
    name: 'Paula Quintela',
    phone: '(38) 90000-0109',
    instagram: '—',
    referralOrBirth: '1990-10-22',
    submittedAtIso: '2026-10-11T13:46:05.670Z',
    temperature: 'Frio',
  },
  {
    id: 'form-10',
    name: 'Beatriz Lemos',
    phone: '(61) 90000-0110',
    instagram: '@biia.lemos',
    referralOrBirth: 'Indicação da Beatriz',
    submittedAtIso: '2026-10-12T09:15:22.110Z',
    temperature: 'Frio',
  },
  {
    id: 'form-11',
    name: 'Daniela Rocha',
    phone: '(38) 90000-0111',
    instagram: '@dani.rocha',
    referralOrBirth: 'Vim pela Beatriz',
    submittedAtIso: '2026-10-12T14:28:10.405Z',
    temperature: 'Frio',
  },
  {
    id: 'form-12',
    name: 'Alice Marinho Costa',
    phone: '(38) 90000-0112',
    instagram: '@alice.marinho',
    referralOrBirth: 'Indicação',
    submittedAtIso: '2026-10-13T11:04:48.920Z',
    temperature: 'Quente',
  },
  {
    id: 'form-13',
    name: 'Gabriela Nóbrega Vaz',
    phone: '(38) 90000-0113',
    instagram: '@gabi-nobrega',
    referralOrBirth: 'Indicação de amigo',
    submittedAtIso: '2026-10-13T16:50:19.312Z',
    temperature: 'Frio',
  },
  {
    id: 'form-14',
    name: 'Fernanda Aragão Pires',
    phone: '(38) 90000-0114',
    instagram: '@fe_aragao',
    referralOrBirth: 'Indicação',
    submittedAtIso: '2026-10-14T10:12:05.100Z',
    temperature: 'Frio',
  },
  {
    id: 'form-15',
    name: 'Isabela Moraes Freire',
    phone: '(38) 90000-0115',
    instagram: '@isa.moraesfreire',
    referralOrBirth: 'Instagram',
    submittedAtIso: '2026-10-14T18:42:33.815Z',
    temperature: 'Quente',
  },
  {
    id: 'form-16',
    name: 'Vinícius Andrade Leal',
    phone: '(84) 90000-0116',
    instagram: '@vini.leal',
    referralOrBirth: 'Instagram',
    submittedAtIso: '2026-10-15T08:55:14.220Z',
    temperature: 'Frio',
  },
  {
    id: 'form-17',
    name: 'Juliana Prates Soares',
    phone: '(47) 90000-0117',
    instagram: '@jujuprates',
    referralOrBirth: 'Instagram',
    submittedAtIso: '2026-10-15T15:20:41.500Z',
    temperature: 'Frio',
  },
  {
    id: 'form-18',
    name: 'Clara Nogueira',
    phone: '(61) 90000-0118',
    instagram: '@claranogueira',
    referralOrBirth: 'instagram',
    submittedAtIso: '2026-10-16T11:09:27.640Z',
    temperature: 'Fechado',
  },
  {
    id: 'form-19',
    name: 'Mirela Campos Dantas',
    phone: '(38) 90000-0119',
    instagram: '@mirelacampos',
    referralOrBirth: 'Instagram de um amigo',
    submittedAtIso: '2026-10-16T17:31:09.118Z',
    temperature: 'Frio',
  },
  {
    id: 'form-20',
    name: 'Larissa Brito',
    phone: '(77) 90000-0120',
    instagram: '@larissabrito',
    referralOrBirth: 'Instagram de Beatriz Lemos',
    submittedAtIso: '2026-10-17T09:44:52.004Z',
    temperature: 'Frio',
  },
]

export const initialInternalUpdates: InternalUpdate[] = [
  {
    id: 'update-renata',
    author: 'Renata Alves',
    initials: 'RA',
    avatar: '/people/renata-alves.jpg',
    role: 'Administrador',
    time: 'Há 12 min',
    subject: 'Fechamento dos planos da semana e renovações',
    message: 'Revisar os planos com vencimento nesta semana antes do fechamento.',
    audience: 'Grupo Nutrição',
    recipientCategory: 'equipe',
    type: 'Lembrete',
    completed: false,
    unread: true,
    replies: [
      {
        id: 'reply-renata-1',
        author: 'Marina Lopes',
        avatar: '/people/paula-nunes.jpg',
        role: 'Nutrição',
        time: 'Há 6 min',
        message: 'Já separei os 4 alunos que vencem até sexta para revisarmos juntos.',
      },
    ],
  },
  {
    id: 'update-lucas-aluno',
    author: 'Lucas Andrade',
    initials: 'LA',
    avatar: '/people/gustavo-lima.jpg',
    role: 'Aluno',
    time: 'Há 28 min',
    subject: 'Comentário no Treino B (MFIT) · Dorsal e Bíceps',
    message:
      'Subi carga na remada curvada para 35kg cada lado mantendo 10 repetições limpas e sem roubar.',
    audience: 'Breno Monteiro',
    recipientCategory: 'aluno',
    type: 'Mensagem',
    completed: false,
    unread: true,
    replies: [],
  },
  {
    id: 'update-thiago-treino-a',
    author: 'Thiago Nunes',
    initials: 'TN',
    avatar: '/people/gustavo-lima.jpg',
    role: 'Aluno',
    time: 'Há 1 h',
    subject: 'Comentário no Treino A (MFIT) · Peito, Ombro e Tríceps',
    message:
      'Senti leve incômodo no ombro direito no desenvolvimento com barra; com halter pegada neutra ficou 100%.',
    audience: 'Breno Monteiro',
    recipientCategory: 'aluno',
    type: 'Mensagem',
    completed: false,
    unread: true,
    replies: [],
  },
  {
    id: 'update-gustavo',
    author: 'Gustavo Lima',
    initials: 'GL',
    avatar: '/people/gustavo-lima.jpg',
    role: 'Gerente',
    time: 'Há 48 min',
    subject: 'Reavaliação física da Camila liberada no sistema',
    message: 'A avaliação da Camila já está disponível para a próxima revisão.',
    audience: 'Marina Lopes',
    recipientCategory: 'equipe',
    type: 'Mensagem',
    completed: false,
    unread: false,
    replies: [],
  },
  {
    id: 'update-camila-aluna',
    author: 'Camila Rocha',
    initials: 'CR',
    avatar: '/people/renata-alves.jpg',
    role: 'Aluno',
    time: 'Hoje, 09:40',
    subject: 'Comentário no Treino C (MFIT) · Glúteos e Posterior',
    message:
      'Elevação pélvica fechou com 110kg para 4x10 com 2s de isometria no topo. Ótima ativação!',
    audience: 'Breno Monteiro',
    recipientCategory: 'aluno',
    type: 'Mensagem',
    completed: false,
    unread: false,
    replies: [
      {
        id: 'reply-camila-1',
        author: 'Breno Monteiro',
        avatar: '/people/breno-monteiro.png',
        role: 'Personal Trainer',
        time: 'Hoje, 10:05',
        message:
          'Excelente execução, Camila! Na próxima semana vamos manter 110kg e buscar 12 reps.',
      },
    ],
  },
  {
    id: 'update-paula',
    author: 'Paula Nunes',
    initials: 'PN',
    avatar: '/people/paula-nunes.jpg',
    role: 'Administrador',
    time: 'Hoje, 08:15',
    subject: 'Prioridade nos check-ins pendentes de sexta',
    message: 'Atualizem os check-ins prioritários até o fim do expediente.',
    audience: 'Toda a equipe',
    recipientCategory: 'equipe',
    type: 'Tarefa',
    completed: true,
    unread: false,
    replies: [],
  },
]
