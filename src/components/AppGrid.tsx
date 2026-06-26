import type { App } from '../types'
import { AppCard } from './AppCard'

interface Props {
  label: string
  apps: App[]
  favs: string[]
  onOpen: (name: string) => void
  onToggleFav: (id: string) => void
  showDivider?: boolean
}

export function AppGrid({ label, apps, favs, onOpen, onToggleFav, showDivider = true }: Props) {
  const count = apps.length === 1 ? '1 app' : `${apps.length} apps`

  return (
    <section className="mt-[34px]">
      <div className="flex items-center gap-[12px] mb-[14px]">
        <h3 className="m-0 font-archivo font-semibold text-[13px] leading-none tracking-[0.08em] uppercase text-label whitespace-nowrap">
          {label}
        </h3>
        {showDivider && <span className="h-px flex-1 bg-border-3" />}
        <span className="font-hanken font-medium text-[12px] text-label-2 whitespace-nowrap">
          {count}
        </span>
      </div>
      <div className="grid gap-[16px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(244px, 1fr))' }}>
        {apps.map(app => (
          <AppCard
            key={app.id}
            app={app}
            isFav={favs.includes(app.id)}
            onOpen={() => onOpen(app.name)}
            onToggleFav={(e) => { e.stopPropagation(); onToggleFav(app.id) }}
          />
        ))}
      </div>
    </section>
  )
}
