'use client'

import { useEffect } from 'react'
import CreationWorkspace, { type ClubTab } from '../CreationWorkspace'
import { clubTabs, tabFromInternal, tabFromUrl } from '../panel/navigation'
import { useTrail } from '../panel/PanelState'
import { useUrlQuery } from '../panel/useUrlQuery'

export default function ClubView() {
  const query = useUrlQuery()
  const tab = tabFromUrl(clubTabs, query.get('aba'))
  useTrail([tab.label])

  // "Modo Club": the panel turns dark while this page is open
  useEffect(() => {
    const shell = document.querySelector('.admin-shell')
    shell?.setAttribute('data-mode', 'club')
    return () => shell?.removeAttribute('data-mode')
  }, [])

  return (
    <CreationWorkspace
      tab={tab.internal as ClubTab}
      onTabChange={(next) => query.set({ aba: tabFromInternal(clubTabs, next).id })}
    />
  )
}
