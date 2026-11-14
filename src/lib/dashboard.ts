export const widgetIds = [
  'kpi-overview',
  'attention-list',
  'site-forms',
  'students-table',
  'weekly-agenda',
  'team-overview',
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

export const defaultDashboardLayout: DashboardLayoutItem[] = [
  {
    widget: 'kpi-overview',
    order: 0,
    width: '12',
    height: 'compact',
    visible: true,
  },
  {
    widget: 'attention-list',
    order: 1,
    width: '12',
    height: 'medium',
    visible: true,
  },
  {
    widget: 'students-table',
    order: 2,
    width: '8',
    height: 'tall',
    visible: true,
  },
  {
    widget: 'weekly-agenda',
    order: 3,
    width: '4',
    height: 'tall',
    visible: true,
  },
  {
    widget: 'team-overview',
    order: 4,
    width: '4',
    height: 'medium',
    visible: true,
  },
  {
    widget: 'active-students-chart',
    order: 5,
    width: '4',
    height: 'medium',
    visible: true,
  },
  {
    widget: 'adherence-chart',
    order: 6,
    width: '4',
    height: 'medium',
    visible: true,
  },
  {
    widget: 'goals-chart',
    order: 7,
    width: '4',
    height: 'medium',
    visible: true,
  },
  {
    widget: 'renewals-overview',
    order: 8,
    width: '4',
    height: 'medium',
    visible: true,
  },
  {
    widget: 'site-forms',
    order: 9,
    width: '8',
    height: 'medium',
    visible: true,
  },
]
