import {
  Clock, Receipt, Sun, Building2, ClipboardList, Truck,
  Wallet, ShoppingCart, LifeBuoy, FolderOpen, Star,
} from 'lucide-react'
import type { App } from '../types'

const ICON_MAP: Record<string, React.ElementType> = {
  ponto:     Clock,
  holerite:  Receipt,
  ferias:    Sun,
  obras:     Building2,
  diario:    ClipboardList,
  frota:     Truck,
  reembolso: Wallet,
  compras:   ShoppingCart,
  chamados:  LifeBuoy,
  ged:       FolderOpen,
}

const BADGE_STYLES = {
  ok:     { text: 'text-[#2F7D5B]', bg: 'bg-[rgba(47,125,91,0.10)]' },
  warn:   { text: 'text-[#9A6A12]', bg: 'bg-[rgba(154,106,18,0.12)]' },
  accent: { text: 'text-accent',    bg: 'bg-[rgba(174,58,35,0.10)]' },
}

interface Props {
  app: App
  isFav: boolean
  onOpen: () => void
  onToggleFav: (e: React.MouseEvent) => void
}

export function AppCard({ app, isFav, onOpen, onToggleFav }: Props) {
  const Icon = ICON_MAP[app.id]
  const badge = app.badge && app.badgeKind ? BADGE_STYLES[app.badgeKind] : null

  return (
    <div
      onClick={onOpen}
      className="
        relative bg-surface border border-border rounded-[16px] p-[18px] cursor-pointer
        transition-all duration-[180ms] ease-out
        hover:border-border-hover hover:shadow-card-hover hover:-translate-y-[3px]
      "
    >
      <div className="flex items-start justify-between gap-[10px] mb-[14px]">
        <div className="w-[46px] h-[46px] rounded-[12px] bg-tile-bg flex items-center justify-center text-icon-default flex-shrink-0">
          {Icon && <Icon size={23} strokeWidth={1.7} />}
        </div>
        <button
          onClick={onToggleFav}
          title={isFav ? 'Remover dos favoritos' : 'Favoritar'}
          className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-tile-bg flex-shrink-0"
          style={{ color: isFav ? '#AE3A23' : '#CBC6BE' }}
        >
          <Star size={17} strokeWidth={1.7} fill={isFav ? 'currentColor' : 'none'} stroke={isFav ? 'none' : 'currentColor'} />
        </button>
      </div>

      <div className="font-archivo font-semibold text-[15.5px] leading-[1.2] text-ink mb-[5px]">
        {app.name}
      </div>
      <div className="font-hanken font-normal text-[13px] leading-[1.45] text-text-muted-2">
        {app.desc}
      </div>

      {badge && (
        <div className={`mt-[13px] inline-flex items-center font-hanken font-medium text-[11.5px] px-[10px] py-[4px] rounded-[20px] ${badge.text} ${badge.bg}`}>
          {app.badge}
        </div>
      )}
    </div>
  )
}
