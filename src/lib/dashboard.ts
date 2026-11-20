export const widgetIds = [
  'kpi-overview',
  'attention-list',
  'site-forms',
  'leads-funnel',
  'students-table',
  'weekly-agenda',
  'active-students-chart',
  'adherence-chart',
  'renewals-overview',
  'goals-chart',
  'students-summary',
  'pending-checkins',
  'workout-adherence',
  'nutrition-adherence',
  'recent-activity',
  'alerts',
  'progress',
  'appointments',
] as const

export type WidgetId = (typeof widgetIds)[number]
export type WidgetWidth = '4' | '6' | '8' | '12'
export type WidgetHeight = 'compact' | 'medium' | 'tall'

export type DashboardLayoutItem = {
  widget: WidgetId
  order: number
  width: WidgetWidth
  height: WidgetHeight
  visible: boolean
}

const layoutItem = (
  widget: WidgetId,
  order: number,
  width: WidgetWidth,
  height: WidgetHeight = 'medium',
): DashboardLayoutItem => ({ widget, order, width, height, visible: true })

/**
 * "Operacional": answers "what do I do today and how is the business" in one screen.
 * KPIs → Hoje (atenção + agenda) → saúde da carteira → receita e retenção.
 * Pairs share a row and a height so the grid has no gaps.
 */
export const defaultDashboardLayout: DashboardLayoutItem[] = [
  layoutItem('kpi-overview', 0, '12', 'compact'),
  layoutItem('attention-list', 1, '8', 'tall'),
  layoutItem('weekly-agenda', 2, '4', 'tall'),
  layoutItem('active-students-chart', 3, '6'),
  layoutItem('adherence-chart', 4, '6'),
  layoutItem('renewals-overview', 5, '6', 'tall'),
  layoutItem('leads-funnel', 6, '6', 'tall'),
]
