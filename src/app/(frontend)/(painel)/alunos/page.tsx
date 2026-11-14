import type { Metadata } from 'next'
import { Suspense } from 'react'
import AlunosView from '../../components/views/AlunosView'

export const metadata: Metadata = { title: 'Alunos · Elevn' }

// The view reads ?aba=/?ficha= with useSearchParams; Suspense keeps the route static.
export default function AlunosPage() {
  return (
    <Suspense fallback={null}>
      <AlunosView />
    </Suspense>
  )
}
