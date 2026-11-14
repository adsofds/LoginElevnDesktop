import type { Metadata } from 'next'
import { Suspense } from 'react'
import ConfiguracoesView from '../../components/views/ConfiguracoesView'

export const metadata: Metadata = { title: 'Configurações · Elevn' }

// The view reads ?aba=/?ficha= with useSearchParams; Suspense keeps the route static.
export default function ConfiguracoesPage() {
  return (
    <Suspense fallback={null}>
      <ConfiguracoesView />
    </Suspense>
  )
}
