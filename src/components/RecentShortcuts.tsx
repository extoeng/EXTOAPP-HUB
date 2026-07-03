import { Clock, Receipt, Building2, LifeBuoy, Phone, CalendarDays, Megaphone, BookOpen } from 'lucide-react'
import type { App } from '../types'

const ICON_MAP: Record<string, React.ElementType> = {
  ponto:    Clock,
  holerite: Receipt,
  obras:    Building2,
  chamados: LifeBuoy,
}

const QUICK_CARDS = [
  { id: 'ramais', label: 'Ramais', Icon: Phone, url: '' },
]

interface Props {
  apps: App[]
  onOpen: (name: string) => void
  onOpenComunicados: () => void
  onOpenManuais: () => void
  onOpenAgenda: () => void
}

export function RecentShortcuts({ apps, onOpen, onOpenComunicados, onOpenManuais, onOpenAgenda }: Props) {
  return (
    <div>
      <div className="mt-[30px] mb-[14px]">
        <h3 className="m-0 font-archivo font-semibold text-[13px] leading-none tracking-[0.08em] uppercase text-label">
          Informações úteis
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

        <button
          onClick={onOpenComunicados}
          className="
            flex-none flex items-center gap-[11px] bg-surface border border-border rounded-[12px]
            px-[15px] py-[11px] cursor-pointer
            transition-all duration-150 ease-out
            hover:border-border-hover hover:shadow-chip-hover hover:-translate-y-[2px]
          "
        >
          <Megaphone size={19} strokeWidth={1.7} className="text-icon-default" />
          <span className="font-hanken font-medium text-[13.5px] text-ink-soft whitespace-nowrap">
            Comunicados
          </span>
        </button>

        <button
          onClick={onOpenManuais}
          className="
            flex-none flex items-center gap-[11px] bg-surface border border-border rounded-[12px]
            px-[15px] py-[11px] cursor-pointer
            transition-all duration-150 ease-out
            hover:border-border-hover hover:shadow-chip-hover hover:-translate-y-[2px]
          "
        >
          <BookOpen size={19} strokeWidth={1.7} className="text-icon-default" />
          <span className="font-hanken font-medium text-[13.5px] text-ink-soft whitespace-nowrap">
            Manuais
          </span>
        </button>

        <button
          onClick={onOpenAgenda}
          className="
            flex-none flex items-center gap-[11px] bg-surface border border-border rounded-[12px]
            px-[15px] py-[11px] cursor-pointer
            transition-all duration-150 ease-out
            hover:border-border-hover hover:shadow-chip-hover hover:-translate-y-[2px]
          "
        >
          <CalendarDays size={19} strokeWidth={1.7} className="text-icon-default" />
          <span className="font-hanken font-medium text-[13.5px] text-ink-soft whitespace-nowrap">
            Agendas
          </span>
        </button>

        {QUICK_CARDS.map(({ id, label, Icon, url }) => (
          <button
            key={id}
            onClick={() => url && window.open(url, '_blank', 'noopener,noreferrer')}
            className="
              flex-none flex items-center gap-[11px] bg-surface border border-border rounded-[12px]
              px-[15px] py-[11px] cursor-pointer
              transition-all duration-150 ease-out
              hover:border-border-hover hover:shadow-chip-hover hover:-translate-y-[2px]
            "
          >
            <Icon size={19} strokeWidth={1.7} className="text-icon-default" />
            <span className="font-hanken font-medium text-[13.5px] text-ink-soft whitespace-nowrap">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
