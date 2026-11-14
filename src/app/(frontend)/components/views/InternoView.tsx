'use client'

import { useRouter } from 'next/navigation'
import InternalWorkspace from '../InternalWorkspace'
import { internoTabs, panelHref, tabFromInternal, tabFromUrl } from '../panel/navigation'
import { usePanel, useTrail } from '../panel/PanelState'
import { useUrlQuery } from '../panel/useUrlQuery'

export default function InternoView() {
  const router = useRouter()
  const query = useUrlQuery()
  const panel = usePanel()
  const tab = tabFromUrl(internoTabs, query.get('aba'))
  useTrail([tab.label])

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
      focusUpdateId={query.get('conversa')}
      formSearch={query.get('busca')}
      updates={panel.internalUpdates}
      onToggleUpdate={panel.toggleInternalUpdate}
      onMarkUpdateRead={panel.markInternalUpdateRead}
      onReplyUpdate={panel.replyInternalUpdate}
      onCreateUpdate={panel.createInternalUpdate}
      siteForms={panel.siteForms}
      onUpdateFormTemperature={panel.updateSiteFormTemperature}
      onCreateFormSubmission={panel.createSiteFormSubmission}
      onConvertLead={(lead) =>
        router.push(
          panelHref('/alunos', { novo: 'aluno', nome: lead.name, whatsapp: lead.phone.replace(/\D/g, '') }),
        )
      }
    />
  )
}
