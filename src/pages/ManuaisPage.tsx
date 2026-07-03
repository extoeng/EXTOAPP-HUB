import { DocumentLibrary } from '../components/DocumentLibrary'
import { MANUAIS } from '../data/manuais'

interface Props {
  initialId?: number
  onBack: () => void
}

export function ManuaisPage({ initialId, onBack }: Props) {
  return (
    <DocumentLibrary
      title="Manuais"
      items={MANUAIS}
      initialId={initialId}
      onBack={onBack}
    />
  )
}
