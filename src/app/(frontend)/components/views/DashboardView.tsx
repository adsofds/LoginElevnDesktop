'use client'

import { useRouter } from 'next/navigation'
import { defaultDashboardLayout } from '@/lib/dashboard'
import { isDashboardPeriod, periodOptions, type DashboardPeriod } from '@/lib/dashboardPeriod'
import CustomDashboard from '../CustomDashboard'
import { useNow } from '../dashboard/DashboardWidgets'
import { panelHref } from '../panel/navigation'
import { usePanel, useTrail } from '../panel/PanelState'
import { useUrlQuery } from '../panel/useUrlQuery'
import { Segmented } from '../ui/Segmented'

const TIME_ZONE = 'America/Sao_Paulo'
const longDate = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: TIME_ZONE,
})

export default function DashboardView() {
  const router = useRouter()
  const query = useUrlQuery()
  const now = useNow()
  const { user, internalUpdates, toggleInternalUpdate, siteForms, updateSiteFormTemperature } =
    usePanel()
  useTrail([])

  const requested = query.get('periodo')
  const period: DashboardPeriod = isDashboardPeriod(requested) ? requested : '30d'
  const firstName = user.name.split(' ')[0]
  const today = now ? longDate.format(now) : ''

  return (
    <>
      <section className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-[32px] leading-[38px] font-semibold tracking-[-0.02em] text-ink">
            {now ? `${greeting(now)}, ${firstName}` : `Olá, ${firstName}`}
          </h1>
          <p className="mt-1 min-h-5 text-sm text-ink-2">
            {today && (
              <>
                <span className="first-letter:uppercase inline-block">{today}</span>
                <span className="text-ink-3">
                  {' '}
                  · o que precisa de você hoje e como está a consultoria
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-ink-3 sm:inline" aria-hidden="true">
            Período
          </span>
          <Segmented
            label="Período dos indicadores e gráficos"
            items={periodOptions}
            value={period}
            onChange={(next) =>
              query.set({ periodo: next === '30d' ? null : next }, { replace: true })
            }
          />
        </div>
      </section>
      <CustomDashboard
        initialLayout={defaultDashboardLayout}
        period={period}
        onNavigate={(href) => router.push(href)}
        internalUpdates={internalUpdates}
        onToggleInternalUpdate={toggleInternalUpdate}
        onOpenInternal={() => router.push(panelHref('/interno', { aba: 'atualizacoes' }))}
        siteForms={siteForms}
        onUpdateFormTemperature={updateSiteFormTemperature}
        onOpenSiteForms={() => router.push(panelHref('/interno', { aba: 'formulario' }))}
      />
    </>
  )
}

function greeting(now: Date) {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: TIME_ZONE,
    }).format(now),
  )
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}
