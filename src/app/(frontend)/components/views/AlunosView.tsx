'use client'

import { useRouter } from 'next/navigation'
import StudentsWorkspace, { studentDirectory, type FichaTab } from '../StudentsWorkspace'
import { fichaTabs, panelHref } from '../panel/navigation'
import { usePanel, useTrail } from '../panel/PanelState'
import { useUrlQuery } from '../panel/useUrlQuery'

export default function AlunosView() {
  const router = useRouter()
  const query = useUrlQuery()
  const { sendWorkoutReplyToInternal } = usePanel()

  const fichaId = query.get('ficha')
  const tab = fichaTabs.find((item) => item.id === query.get('aba')) ?? fichaTabs[0]
  const student = studentDirectory.find((item) => item.id === fichaId)
  useTrail(fichaId ? [student?.name ?? 'Ficha do aluno', tab.label] : [])

  return (
    <StudentsWorkspace
      ficha={fichaId ? { studentId: fichaId, tab: tab.id as FichaTab } : null}
      onFichaChange={(next) =>
        query.set(
          next
            ? { ficha: next.studentId, aba: next.tab === 'checkin' ? null : next.tab }
            : { ficha: null, aba: null },
        )
      }
      initialView={query.get('visao')}
      onInitialViewHandled={() => query.set({ visao: null }, { replace: true })}
      startNew={query.get('novo') === 'aluno'}
      onStartNewHandled={() => query.set({ novo: null }, { replace: true })}
      onSendWorkoutReplyToInternal={sendWorkoutReplyToInternal}
      onOpenInternalInbox={() => router.push(panelHref('/interno', { aba: 'atualizacoes' }))}
    />
  )
}
