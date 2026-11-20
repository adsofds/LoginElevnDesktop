'use client'

import { useEffect, useState } from 'react'
import StudentsWorkspace, { studentDirectory, type FichaTab } from '../StudentsWorkspace'
import { fichaTabs } from '../panel/navigation'
import { useTrail } from '../panel/PanelState'
import { useUrlQuery } from '../panel/useUrlQuery'
import { NotificationComposer, NotificationsCenter } from '../students/Notifications'

export default function AlunosView() {
  const query = useUrlQuery()

  const fichaId = query.get('ficha')
  const tab = fichaTabs.find((item) => item.id === query.get('aba')) ?? fichaTabs[0]
  const student = studentDirectory.find((item) => item.id === fichaId)
  // Without an open student file, ?aba=notificacoes selects the notifications center.
  const section = !fichaId && query.get('aba') === 'notificacoes' ? 'notificacoes' : 'carteira'
  useTrail(
    fichaId
      ? [student?.name ?? 'Ficha do aluno', tab.label]
      : section === 'notificacoes'
        ? ['Notificações']
        : [],
  )

  const [composer, setComposer] = useState<{ open: boolean; studentIds?: string[] }>({
    open: false,
  })
  const [toast, setToast] = useState('')
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 5000)
    return () => window.clearTimeout(timer)
  }, [toast])

  return (
    <>
      <StudentsWorkspace
        section={section}
        onSectionChange={(next) =>
          query.set({ aba: next === 'notificacoes' ? 'notificacoes' : null, ficha: null })
        }
        notificationsContent={<NotificationsCenter onCompose={() => setComposer({ open: true })} />}
        onNotifyStudent={(studentId) => setComposer({ open: true, studentIds: [studentId] })}
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
        newStudentPrefill={{ name: query.get('nome'), whatsapp: query.get('whatsapp') }}
        onStartNewHandled={() =>
          query.set({ novo: null, nome: null, whatsapp: null }, { replace: true })
        }
      />

      <NotificationComposer
        open={composer.open}
        initialStudentIds={composer.studentIds}
        onClose={() => setComposer({ open: false })}
        onSent={setToast}
      />

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[110] flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3 rounded-control bg-night px-4 py-3 text-sm text-on-dark shadow-modal"
        >
          {toast}
          {section !== 'notificacoes' && (
            <button
              type="button"
              onClick={() => {
                setToast('')
                query.set({ aba: 'notificacoes', ficha: null })
              }}
              className="shrink-0 font-semibold text-brand-light hover:underline"
            >
              Ver histórico
            </button>
          )}
        </div>
      )}
    </>
  )
}
