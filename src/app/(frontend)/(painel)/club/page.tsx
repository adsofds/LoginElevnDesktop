import type { Metadata } from 'next'
import { ComingSoon } from '../../components/panel/ComingSoon'

export const metadata: Metadata = { title: 'Elevn Club · Elevn' }

// The Club (playlists, trilhas, GymRats) is paused while the core of the panel is built.
// Its code stays in components/CreationWorkspace.tsx and components/club/ — to bring it back,
// render <ClubView /> inside <Suspense> here and drop `comingSoon` from the Club entry in
// components/panel/navigation.ts.
export default function ClubPage() {
  return (
    <ComingSoon
      icon="creation"
      title="Elevn Club"
      description="A área de playlists, trilhas e desafios da comunidade está em construção. Por enquanto o foco é o essencial do painel: alunos, check-ins e treinos."
    />
  )
}
