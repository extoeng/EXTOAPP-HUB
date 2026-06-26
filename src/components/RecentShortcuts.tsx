import {
  Clock, Receipt, Building2, LifeBuoy,
} from 'lucide-react'
import type { App } from '../types'

const ICON_MAP: Record<string, React.ElementType> = {
  ponto:    Clock,
  holerite: Receipt,
  obras:    Building2,
  chamados: LifeBuoy,
}

interface Props {
  apps: App[]
  onOpen: (name: string) => void
}

export function RecentShortcuts({ apps, onOpen }: Props) {
  return (
    <div>
      <div className="mt-[30px] mb-[14px]">
        <h3 className="m-0 font-archivo font-semibold text-[13px] leading-none tracking-[0.08em] uppercase text-label">
          Atalhos recentes
        </h3>
      </div>
      <div className="flex gap-[10px] overflow-x-auto pb-[4px] mb-[6px]">
        {apps.map(app => {
          const Icon = ICON_MAP[app.id]
          return (
            <button
              key={app.id}
              onClick={() => onOpen(app.name)}
              className="
                flex-none flex items-center gap-[11px] bg-surface border border-border rounded-[12px]
                px-[15px] py-[11px] cursor-pointer
                transition-all duration-150 ease-out
                hover:border-border-hover hover:shadow-chip-hover hover:-translate-y-[2px]
              "
            >
              {Icon && <Icon size={19} strokeWidth={1.7} className="text-icon-default" />}
              <span className="font-hanken font-medium text-[13.5px] text-ink-soft whitespace-nowrap">
                {app.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
