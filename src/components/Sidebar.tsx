import { Home, Users, Building2, Wallet, LifeBuoy, LogOut, X, Globe, Scale, ClipboardList } from 'lucide-react'
import type { ActiveCat, Category, App } from '../types'
import type { AuthUser } from '../services/auth'
import logoUrl from '../assets/exto-logo-transparent.png'

const NAV_MENU = [
  { id: 'all' as ActiveCat, label: 'Início', Icon: Home },
]

const ALL_CATS: { id: Category; label: string; Icon: React.ElementType }[] = [
  { id: 'geral',    label: 'Geral',              Icon: Globe },
  { id: 'rh',       label: 'RH & Pessoas',       Icon: Users },
  { id: 'obras',    label: 'Obras & Operações',  Icon: Building2 },
  { id: 'fin',      label: 'Financeiro',         Icon: Wallet },
  { id: 'ti',       label: 'Suporte & TI',       Icon: LifeBuoy },
  { id: 'admin',    label: 'Administração',      Icon: ClipboardList },
  { id: 'juridico', label: 'Jurídico',           Icon: Scale },
]

interface Props {
  activeCat: ActiveCat
  isNarrow: boolean
  menuOpen: boolean
  user: AuthUser
  apps: App[]
  onSetCat: (cat: ActiveCat) => void
  onClose: () => void
  onLogout: () => void
  onOpenProfile: () => void
}

function NavItem({ id, label, Icon, activeCat, onClick }: {
  id: ActiveCat
  label: string
  Icon: React.ElementType
  activeCat: ActiveCat
  onClick: () => void
}) {
  const active = activeCat === id
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] cursor-pointer
        font-hanken font-medium text-[14px] leading-none
        transition-colors duration-150
        hover:bg-tile-bg border-none
        ${active ? 'bg-[rgba(174,58,35,0.08)] text-ink' : 'bg-transparent text-text-muted'}
      `}
    >
      <Icon
        size={19}
        strokeWidth={1.7}
        style={{ color: active ? '#AE3A23' : '#9C978F' }}
      />
      {label}
    </button>
  )
}

export function Sidebar({ activeCat, isNarrow, menuOpen, user, apps, onSetCat, onClose, onLogout, onOpenProfile }: Props) {
  const activeCats = new Set(apps.map(a => a.cat))
  const navCats = ALL_CATS.filter(c => activeCats.has(c.id))

  const handleCat = (cat: ActiveCat) => {
    onSetCat(cat)
    if (isNarrow) onClose()
  }

  return (
    <aside
      className="
        top-0 left-0 z-40
        bg-surface flex flex-col flex-shrink-0
        transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]
      "
      style={{
        position: isNarrow ? 'fixed' : 'relative',
        transform: isNarrow && !menuOpen ? 'translateX(-110%)' : 'translateX(0)',
        width: isNarrow ? '264px' : '248px',
        height: isNarrow ? '100%' : 'calc(100% - 16px)',
        margin: isNarrow ? '0' : '8px 0 8px 8px',
        borderRadius: isNarrow ? '0' : '20px',
        border: '1px solid #EAE7E2',
        boxShadow: isNarrow ? 'none' : '0 4px 24px -6px rgba(38,37,36,0.10)',
      }}
    >
      {/* Header */}
      <div className="px-[22px] pt-[14px] pb-[14px] flex items-start justify-between">
        <div className="flex-1 flex justify-center">
          <img src={logoUrl} alt="Exto" className="h-[80px] w-auto block" />
        </div>
        {isNarrow && (
          <button
            onClick={onClose}
            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center cursor-pointer text-text-muted hover:bg-tile-bg border-none bg-transparent transition-colors duration-150"
          >
            <X size={18} strokeWidth={1.7} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-[14px] pb-[14px] flex flex-col gap-[3px]">
        <div className="font-archivo font-semibold text-[11px] leading-none tracking-[0.13em] uppercase text-label-2 px-[12px] pt-[14px] pb-[8px]">
          Menu
        </div>
        {NAV_MENU.map(({ id, label, Icon }) => (
          <NavItem key={id} id={id} label={label} Icon={Icon} activeCat={activeCat} onClick={() => handleCat(id)} />
        ))}

        <div className="font-archivo font-semibold text-[11px] leading-none tracking-[0.13em] uppercase text-label-2 px-[12px] pt-[18px] pb-[8px]">
          Categorias
        </div>
        {navCats.map(({ id, label, Icon }) => (
          <NavItem key={id} id={id} label={label} Icon={Icon} activeCat={activeCat} onClick={() => handleCat(id)} />
        ))}
      </nav>

      {/* User card */}
      <div className="p-[14px]">
        <div className="flex items-center gap-[11px] px-[8px] py-[8px] rounded-[12px]">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-[11px] flex-1 min-w-0 border-none bg-transparent p-0 cursor-pointer rounded-[10px] transition-colors duration-150 hover:bg-tile-bg -mx-[6px] px-[6px] py-[4px] text-left"
          >
            <div className="w-[40px] h-[40px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[14px] flex-shrink-0">
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-archivo font-semibold text-[14px] leading-[1.2] text-ink whitespace-nowrap overflow-hidden text-ellipsis">
                {user.name}
              </div>
              <div className="font-hanken font-normal text-[12px] leading-[1.3] text-text-faint whitespace-nowrap overflow-hidden text-ellipsis">
                {user.role}
              </div>
            </div>
          </button>
          <button
            title="Sair"
            onClick={onLogout}
            className="w-[32px] h-[32px] rounded-[9px] flex items-center justify-center cursor-pointer text-text-faint flex-shrink-0 transition-all duration-150 hover:bg-tile-bg hover:text-ink border-none bg-transparent"
          >
            <LogOut size={17} strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </aside>
  )
}
