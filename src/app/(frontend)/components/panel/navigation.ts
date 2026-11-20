/**
 * Single source of truth for the panel's URLs.
 * Sections are routes (/alunos); tabs, the open student file and "create" intents
 * live in the query string (?aba=, ?ficha=, ?novo=) so switching them never remounts
 * the workspace and its local edits survive.
 */

export type SectionId =
  | 'dashboard'
  | 'interno'
  | 'alunos'
  | 'nutricao'
  | 'treino'
  | 'club'
  | 'app-aluno'
  | 'configuracoes'

export type Section = {
  id: SectionId
  label: string
  href: string
  icon: string
  group: 'Operação' | 'Conteúdo' | 'Sistema'
  comingSoon?: boolean
}

export const sections: Section[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard', group: 'Operação' },
  { id: 'interno', label: 'Interno', href: '/interno', icon: 'internal', group: 'Operação' },
  { id: 'alunos', label: 'Alunos', href: '/alunos', icon: 'students', group: 'Operação' },
  {
    id: 'nutricao',
    label: 'Nutrição',
    href: '/nutricao',
    icon: 'nutrition',
    group: 'Operação',
    comingSoon: true,
  },
  {
    id: 'treino',
    label: 'Treino',
    href: '/treino',
    icon: 'training',
    group: 'Operação',
    comingSoon: true,
  },
  {
    id: 'club',
    label: 'Elevn Club',
    href: '/club',
    icon: 'creation',
    group: 'Conteúdo',
    comingSoon: true,
  },
  {
    id: 'app-aluno',
    label: 'App do aluno',
    href: '/app-aluno',
    icon: 'phone',
    group: 'Conteúdo',
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    href: '/configuracoes',
    icon: 'settings',
    group: 'Sistema',
  },
]

export const sectionGroups = ['Operação', 'Conteúdo', 'Sistema'] as const

export function sectionFromPathname(pathname: string | null): Section | undefined {
  if (!pathname) return undefined
  return sections.find(
    (section) => pathname === section.href || pathname.startsWith(`${section.href}/`),
  )
}

/* Tabs: URL id (Portuguese, shareable) ↔ the id each workspace already uses internally */

export const internoTabs = [
  { id: 'trello', label: 'Trello', internal: 'board' },
  { id: 'agenda', label: 'Agenda', internal: 'updates' },
  { id: 'postagens', label: 'Postagens', internal: 'posts' },
  { id: 'formulario', label: 'Formulário', internal: 'forms' },
] as const

export const clubTabs = [
  { id: 'inicio', label: 'Início', internal: 'inicio' },
  { id: 'explorar', label: 'Explorar playlists', internal: 'explorar' },
  { id: 'comunidade', label: 'Comunidade (GymRats)', internal: 'comunidade' },
] as const

export const configTabs = [
  { id: 'equipe', label: 'Equipe e permissões', internal: 'employees' },
  { id: 'tema', label: 'Aparência', internal: 'theme' },
  { id: 'seguranca', label: 'Segurança', internal: 'security' },
] as const

/** Sections of the student file (?aba= opens and scrolls to one of them). */
export const fichaTabs = [
  { id: 'checkin', label: 'Check-in semanal' },
  { id: 'treino', label: 'Treino' },
  { id: 'dieta', label: 'Dieta' },
  { id: 'fotos', label: 'Fotos e evolução' },
  { id: 'acesso', label: 'Acesso e plano' },
] as const

type TabDef = { readonly id: string; readonly label: string; readonly internal: string }

export function tabFromUrl<T extends readonly TabDef[]>(tabs: T, value: string | null): T[number] {
  return tabs.find((tab) => tab.id === value) ?? tabs[0]
}

export function tabFromInternal<T extends readonly TabDef[]>(tabs: T, internal: string): T[number] {
  return tabs.find((tab) => tab.internal === internal) ?? tabs[0]
}

/** Builds a panel URL with query params, dropping empty values and default tabs. */
export function panelHref(path: string, query: Record<string, string | null | undefined> = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }
  const search = params.toString()
  return search ? `${path}?${search}` : path
}
