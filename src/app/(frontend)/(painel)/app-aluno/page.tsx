import type { Metadata } from 'next'
import AppAlunoView from '../../components/views/AppAlunoView'

export const metadata: Metadata = { title: 'App do aluno · Elevn' }

export default function AppAlunoPage() {
  return <AppAlunoView />
}
