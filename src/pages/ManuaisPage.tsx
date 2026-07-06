import { DocumentLibrary } from '../components/DocumentLibrary'
import { MANUAIS } from '../data/manuais'
import type { AuthUser } from '../services/auth'

interface Props {
  initialId?: number
  onBack: () => void
  user: AuthUser
}

export function ManuaisPage({ initialId, onBack, user }: Props) {
  const canUpload = user.apps['manuais']?.includes('manage') ?? false
  return (
    <DocumentLibrary
      title="Manuais"
      tipo="manual"
      fallbackItems={MANUAIS}
      initialId={initialId}
      onBack={onBack}
      canUpload={canUpload}
    />
  )
}
