import type { Metadata } from 'next'
import { Suspense } from 'react'
import DashboardView from '../../components/views/DashboardView'

export const metadata: Metadata = { title: 'Dashboard · Elevn' }

// The view reads ?periodo= with useSearchParams; Suspense keeps the route static.
export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardView />
    </Suspense>
  )
}
