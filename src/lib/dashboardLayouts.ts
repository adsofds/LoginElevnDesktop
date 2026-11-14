import { defaultDashboardLayout, type DashboardLayoutItem, type WidgetId } from './dashboard'

export type WidgetSize = { columns: number; height: number }
export type WidgetSizes = Partial<Record<WidgetId, WidgetSize>>

export type SavedDashboardLayout = {
  id: string
  name: string
  description?: string
  /** Ships with the app; can be customized and restored, not deleted. */
  builtIn?: boolean
  items: DashboardLayoutItem[]
  /** Free-form sizes from "Personalizar". Missing widgets fall back to their preset height. */
  sizes?: WidgetSizes
}

const item = (
  widget: WidgetId,
  order: number,
  width: DashboardLayoutItem['width'],
  height: DashboardLayoutItem['height'] = 'medium',
): DashboardLayoutItem => ({ widget, order, width, height, visible: true })

/** Starting layouts for each role in the consultancy. */
export const builtInLayouts: SavedDashboardLayout[] = [
  {
    id: 'operacional',
    name: 'Operacional',
    description: 'Visão geral: pendências, carteira, agenda e receita',
    builtIn: true,
    items: defaultDashboardLayout,
  },
  {
    id: 'treino',
    name: 'Treino',
    description: 'Adesão aos treinos, evolução e quem não treinou',
    builtIn: true,
    items: [
      item('kpi-overview', 0, '12', 'compact'),
      item('attention-list', 1, '8', 'tall'),
      item('weekly-agenda', 2, '4', 'tall'),
      item('workout-adherence', 3, '6'),
      item('progress', 4, '6'),
      item('students-table', 5, '12', 'tall'),
    ],
  },
  {
    id: 'dieta',
    name: 'Dieta',
    description: 'Adesão nutricional, check-ins e objetivos',
    builtIn: true,
    items: [
      item('kpi-overview', 0, '12', 'compact'),
      item('nutrition-adherence', 1, '6'),
      item('adherence-chart', 2, '6'),
      item('goals-chart', 3, '6'),
      item('team-overview', 4, '6'),
      item('students-table', 5, '12', 'tall'),
    ],
  },
  {
    id: 'comercial',
    name: 'Comercial',
    description: 'Leads do site, renovações e crescimento da carteira',
    builtIn: true,
    items: [
      item('kpi-overview', 0, '12', 'compact'),
      item('leads-funnel', 1, '6', 'tall'),
      item('renewals-overview', 2, '6', 'tall'),
      item('site-forms', 3, '12'),
      item('active-students-chart', 4, '6'),
      item('goals-chart', 5, '6'),
    ],
  },
]

/* Saved per browser for now. With real app login (Payload `users`), move this to a
   per-user collection so layouts follow the person across devices. */
const STORAGE_KEY = 'elevn-dashboard-layouts'

type StoredState = {
  /** Custom layouts plus customized copies of built-ins (same id). */
  layouts: SavedDashboardLayout[]
  activeId?: string
  defaultId?: string
}

export function readLayoutState(): StoredState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { layouts: [] }
    const parsed = JSON.parse(raw) as StoredState
    return { layouts: Array.isArray(parsed.layouts) ? parsed.layouts : [], activeId: parsed.activeId, defaultId: parsed.defaultId }
  } catch {
    return { layouts: [] }
  }
}

export function writeLayoutState(state: StoredState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable: changes last until reload */
  }
}

/** Built-ins (with any customization applied) followed by the user's own layouts. */
export function mergeLayouts(stored: SavedDashboardLayout[]): SavedDashboardLayout[] {
  const overrides = new Map(stored.map((layout) => [layout.id, layout]))
  const builtIns = builtInLayouts.map((layout) => {
    const override = overrides.get(layout.id)
    return override ? { ...layout, name: override.name, items: override.items, sizes: override.sizes } : layout
  })
  const custom = stored.filter((layout) => !builtInLayouts.some((builtIn) => builtIn.id === layout.id))
  return [...builtIns, ...custom]
}

export function isCustomizedBuiltIn(id: string, stored: SavedDashboardLayout[]) {
  return builtInLayouts.some((layout) => layout.id === id) && stored.some((layout) => layout.id === id)
}

export function makeLayoutId(name: string) {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'layout'}-${Date.now().toString(36)}`
}
