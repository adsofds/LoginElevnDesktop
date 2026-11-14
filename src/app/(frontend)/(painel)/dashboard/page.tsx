import type { Metadata } from 'next'
import DashboardView from '../../components/views/DashboardView'

export const metadata: Metadata = { title: 'Dashboard · Elevn' }

export default function DashboardPage() {
  return <DashboardView />
}
