'use client'

import SettingsWorkspace from '../SettingsWorkspace'
import { configTabs, tabFromInternal, tabFromUrl } from '../panel/navigation'
import { usePanel, useTrail } from '../panel/PanelState'
import { useUrlQuery } from '../panel/useUrlQuery'

export default function ConfiguracoesView() {
  const query = useUrlQuery()
  const { user, activeTheme, setActiveTheme } = usePanel()
  const tab = tabFromUrl(configTabs, query.get('aba'))
  useTrail([tab.label])

  return (
    <SettingsWorkspace
      adminUser={user}
      activeTheme={activeTheme}
      onSelectTheme={setActiveTheme}
      tab={tab.internal}
      onTabChange={(next) => query.set({ aba: tabFromInternal(configTabs, next).id })}
    />
  )
}
