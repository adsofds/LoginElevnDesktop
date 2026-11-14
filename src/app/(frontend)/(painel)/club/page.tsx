import type { Metadata } from 'next'
import { Suspense } from 'react'
import ClubView from '../../components/views/ClubView'

export const metadata: Metadata = { title: 'Elevn Club · Elevn' }

// The view reads ?aba=/?ficha= with useSearchParams; Suspense keeps the route static.
export default function ClubPage() {
  return (
    <Suspense fallback={null}>
      <ClubView />
    </Suspense>
  )
}
