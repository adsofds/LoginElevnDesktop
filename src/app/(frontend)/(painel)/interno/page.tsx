import type { Metadata } from 'next'
import { Suspense } from 'react'
import InternoView from '../../components/views/InternoView'

export const metadata: Metadata = { title: 'Interno · Elevn' }

// The view reads ?aba=/?ficha= with useSearchParams; Suspense keeps the route static.
export default function InternoPage() {
  return (
    <Suspense fallback={null}>
      <InternoView />
    </Suspense>
  )
}
