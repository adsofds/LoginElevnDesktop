'use client'

import { useRouter } from 'next/navigation'
import { defaultDashboardLayout } from '@/lib/dashboard'
import CustomDashboard from '../CustomDashboard'
import { panelHref } from '../panel/navigation'
import { usePanel, useTrail } from '../panel/PanelState'

export default function DashboardView() {
  const router = useRouter()
  const {
    user,
    currentDate,
    internalUpdates,
    toggleInternalUpdate,
    siteForms,
    updateSiteFormTemperature,
  } = usePanel()
  useTrail([])

  return (
    <>
      <section className="dashboard-heading">
        <div>
          <p>SUA MELHOR VERSÃO, ALÉM</p>
          <h1>
            Boa {greeting()}, {user.name.split(' ')[0]}
          </h1>
          <span>Visão geral da consultoria e o que precisa de você hoje.</span>
        </div>
        <div className="dashboard-date">
          <small>HOJE</small>
          <strong>{currentDate}</strong>
        </div>
      </section>
      <CustomDashboard
        initialLayout={defaultDashboardLayout}
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

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date()),
  )
  if (hour < 12) return 'dia'
  if (hour < 18) return 'tarde'
  return 'noite'
}
