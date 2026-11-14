import type { ReactNode } from 'react'
import AdminShell from '../components/AdminShell'
import { PanelProvider } from '../components/panel/PanelState'

/** Shared by every panel route: state, sidebar and header persist across navigation. */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <PanelProvider>
      <AdminShell>{children}</AdminShell>
    </PanelProvider>
  )
}
