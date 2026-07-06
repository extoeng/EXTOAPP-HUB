import { DocumentLibrary } from '../components/DocumentLibrary'
import { COMUNICADOS } from '../data/comunicados'
import type { AuthUser } from '../services/auth'

interface Props {
  initialId?: number
  onBack: () => void
  user: AuthUser
}

export function ComunicadosPage({ initialId, onBack, user }: Props) {
  const canUpload = user.apps['comunicados']?.includes('manage') ?? false
  return (
    <DocumentLibrary
      title="Comunicados"
      tipo="comunicado"
      fallbackItems={COMUNICADOS}
      initialId={initialId}
      onBack={onBack}
      canUpload={canUpload}
    />
  )
}
