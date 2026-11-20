'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import InternalWorkspace from '../InternalWorkspace'
import { internoTabs, panelHref, tabFromInternal, tabFromUrl } from '../panel/navigation'
import { usePanel, useTrail } from '../panel/PanelState'
import { useUrlQuery } from '../panel/useUrlQuery'

export default function InternoView() {
  const router = useRouter()
  const query = useUrlQuery()
  const panel = usePanel()
  // "Atualizações" became "Agenda": old links (?aba=atualizacoes) land on the agenda.
  const legacyUpdates = query.get('aba') === 'atualizacoes'
  const tab = tabFromUrl(internoTabs, legacyUpdates ? 'agenda' : query.get('aba'))
  useTrail([tab.label])
  useEffect(() => {
    if (legacyUpdates) query.set({ aba: 'agenda', conversa: null }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legacyUpdates])

  return (
    <InternalWorkspace
      section={tab.internal}
      onSectionChange={(next) =>
        query.set({
          aba: tabFromInternal(internoTabs, next).id,
          novo: null,
          conversa: null,
          busca: null,
        })
      }
      intent={query.get('novo')}
      onIntentHandled={() => query.set({ novo: null }, { replace: true })}
      formSearch={query.get('busca')}
      siteForms={panel.siteForms}
      onUpdateFormTemperature={panel.updateSiteFormTemperature}
      onCreateFormSubmission={panel.createSiteFormSubmission}
      onConvertLead={(lead) =>
        router.push(
          panelHref('/alunos', {
            novo: 'aluno',
            nome: lead.name,
            whatsapp: lead.phone.replace(/\D/g, ''),
          }),
        )
      }
    />
  )
}
