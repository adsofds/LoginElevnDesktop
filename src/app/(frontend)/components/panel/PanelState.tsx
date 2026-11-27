'use client'

import { useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  initialSiteFormSubmissions,
  type LeadTemperature,
  type SiteFormSubmission,
} from '@/lib/demo-internal'
import { demoNotificationHistory, type StudentNotification } from '@/lib/student-notifications'
import { demoSchedules, type NotificationSchedule } from '@/lib/notification-schedules'
import { presetThemes, type ThemeConfig } from '../SettingsWorkspace'

/* Demo session. Real authentication (Payload `users`) is a later phase; until then the
   flag only keeps the demo logged in across reloads and new tabs on this browser. */
export const DEMO_SESSION_KEY = 'elevn-demo-session'
const THEME_KEY = 'elevn-theme'

export function readDemoSession() {
  try {
    return window.localStorage.getItem(DEMO_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function writeDemoSession(active: boolean) {
  try {
    if (active) window.localStorage.setItem(DEMO_SESSION_KEY, '1')
    else window.localStorage.removeItem(DEMO_SESSION_KEY)
  } catch {
    /* storage unavailable (private mode): the session lasts until reload */
  }
}

type PanelState = {
  ready: boolean
  user: { name: string; profession: string; avatar: string }
  currentDate: string
  trail: string[]
  setTrail: (trail: string[]) => void
  /** Alert ids ("Precisa de atenção") already seen in the bell. */
  seenAlerts: string[]
  markAlertsSeen: (ids: string[]) => void
  /** One-way notifications to students (simulated delivery). */
  notifications: StudentNotification[]
  addNotification: (notification: StudentNotification) => void
  cancelNotification: (id: string) => void
  /** Recurring notification schedules. */
  schedules: NotificationSchedule[]
  saveSchedule: (schedule: NotificationSchedule) => void
  removeSchedule: (id: string) => void
  siteForms: SiteFormSubmission[]
  updateSiteFormTemperature: (id: string, temperature: LeadTemperature) => void
  createSiteFormSubmission: (submission: SiteFormSubmission) => void
  activeTheme: ThemeConfig
  setActiveTheme: (theme: ThemeConfig) => void
  logout: () => void
}

const PanelContext = createContext<PanelState | null>(null)

export function usePanel() {
  const value = useContext(PanelContext)
  if (!value) throw new Error('usePanel must be used inside <PanelProvider>')
  return value
}

/** Sets the breadcrumb shown in the header for the current view. */
export function useTrail(trail: string[]) {
  const { setTrail } = usePanel()
  const key = trail.join('\u0000')
  useEffect(() => {
    setTrail(key ? key.split('\u0000') : [])
  }, [key, setTrail])
}

const user = {
  name: 'Breno Monteiro',
  profession: 'Personal Trainer',
  avatar: '/people/breno-monteiro.png',
}

function formatToday() {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date())
}

/**
 * State shared by every panel route. It lives in the (painel) layout, so it survives
 * navigation between sections: alerts, leads and theme no longer reset when you switch pages.
 */
export function PanelProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const [trail, setTrailState] = useState<string[]>([])
  const [seenAlerts, setSeenAlerts] = useState<string[]>([])
  const [notifications, setNotifications] = useState<StudentNotification[]>([])
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([])
  const [siteForms, setSiteForms] = useState<SiteFormSubmission[]>(initialSiteFormSubmissions)
  const [activeTheme, setActiveThemeState] = useState<ThemeConfig>(presetThemes[0])

  // Session guard + per-browser preferences (client only, after hydration)
  useEffect(() => {
    if (!readDemoSession()) {
      router.replace('/')
      return
    }
    try {
      const stored = window.localStorage.getItem(THEME_KEY)
      if (stored) setActiveThemeState({ ...presetThemes[0], ...JSON.parse(stored) })
    } catch {
      /* ignore a corrupt or unavailable theme preference */
    }
    setCurrentDate(formatToday())
    setNotifications(demoNotificationHistory(new Date()))
    setSchedules(demoSchedules(new Date()))
    setReady(true)
  }, [router])

  const setTrail = useCallback((next: string[]) => setTrailState(next), [])

  const setActiveTheme = useCallback((theme: ThemeConfig) => {
    setActiveThemeState(theme)
    try {
      window.localStorage.setItem(THEME_KEY, JSON.stringify(theme))
    } catch {
      /* preference not persisted */
    }
  }, [])

  const updateSiteFormTemperature = useCallback((formId: string, temperature: LeadTemperature) => {
    setSiteForms((current) =>
      current.map((item) => (item.id === formId ? { ...item, temperature } : item)),
    )
  }, [])

  const createSiteFormSubmission = useCallback((submission: SiteFormSubmission) => {
    setSiteForms((current) => [submission, ...current])
  }, [])

  const logout = useCallback(() => {
    writeDemoSession(false)
    router.push('/')
  }, [router])

  const markAlertsSeen = useCallback((ids: string[]) => {
    setSeenAlerts((current) => Array.from(new Set([...current, ...ids])))
  }, [])

  const addNotification = useCallback((notification: StudentNotification) => {
    setNotifications((current) => [notification, ...current])
  }, [])

  const cancelNotification = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, status: 'cancelada' } : item)),
    )
  }, [])

  const saveSchedule = useCallback((schedule: NotificationSchedule) => {
    setSchedules((current) =>
      current.some((item) => item.id === schedule.id)
        ? current.map((item) => (item.id === schedule.id ? schedule : item))
        : [schedule, ...current],
    )
  }, [])

  const removeSchedule = useCallback((id: string) => {
    setSchedules((current) => current.filter((item) => item.id !== id))
  }, [])

  const value = useMemo<PanelState>(
    () => ({
      ready,
      user,
      currentDate,
      trail,
      setTrail,
      seenAlerts,
      markAlertsSeen,
      notifications,
      addNotification,
      cancelNotification,
      schedules,
      saveSchedule,
      removeSchedule,
      siteForms,
      updateSiteFormTemperature,
      createSiteFormSubmission,
      activeTheme,
      setActiveTheme,
      logout,
    }),
    [
      ready,
      currentDate,
      trail,
      setTrail,
      seenAlerts,
      markAlertsSeen,
      notifications,
      addNotification,
      cancelNotification,
      schedules,
      saveSchedule,
      removeSchedule,
      siteForms,
      updateSiteFormTemperature,
      createSiteFormSubmission,
      activeTheme,
      setActiveTheme,
      logout,
    ],
  )

  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
}
