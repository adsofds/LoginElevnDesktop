import type { Metadata, Viewport } from 'next'
import StudentAppFullScreen from '../components/student-app/StudentAppFullScreen'

export const metadata: Metadata = {
  title: 'Elevn · App do aluno (demonstração)',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#09080f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

/** The student app full screen, to open on a phone during reviews. Demo data only. */
export default function AlunoPage() {
  return <StudentAppFullScreen />
}
