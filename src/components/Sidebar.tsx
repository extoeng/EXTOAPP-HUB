import { useState } from 'react'
import { Home, Users, Building2, Wallet, LifeBuoy, LogOut, X, Globe, Scale, ClipboardList, ChevronRight, ShieldCheck } from 'lucide-react'
import type { ActiveCat, Category, App } from '../types'
import type { AuthUser } from '../services/auth'

export const SIDEBAR_COLLAPSED_W = 68
const SIDEBAR_GAP = 12

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
  onOpenApp: (name: string) => void
  onClose: () => void
  onLogout: () => void
  onOpenProfile: () => void
  /** Início: sempre volta pra home, mesmo estando em outra aba (Comunicados, Perfil...). */
  onGoHome: () => void
  /** Painel Administrativo: só quem tem acesso (MASTER) vê esse botão fixo. */
  showPainelAdmin: boolean
  onOpenPainelAdmin: () => void
}

function NavItem({ id, label, Icon, activeCat, expanded, onClick }: {
  id: ActiveCat
  label: string
  Icon: React.ElementType
  activeCat: ActiveCat
  expanded: boolean
  onClick: () => void
}) {
  const active = activeCat === id
  return (
    <button
      onClick={onClick}
      title={!expanded ? label : undefined}
      className={`
        w-full flex items-center rounded-[10px] cursor-pointer
        font-hanken font-medium text-[14px] leading-none
        transition-all duration-150 border-none
        ${expanded ? 'gap-[12px] px-[12px] py-[10px]' : 'justify-center p-[12px]'}
        ${active ? 'bg-accent text-white' : 'bg-transparent text-side-muted hover:text-white hover:bg-white/[0.06]'}
      `}
    >
      <Icon size={19} strokeWidth={1.7} className="flex-shrink-0" />
      {expanded && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
    </button>
  )
}

function CategoryNavItem({ label, Icon, apps, expanded, sidebarExpanded, onToggle, onOpenApp }: {
  label: string
  Icon: React.ElementType
  apps: App[]
  expanded: boolean
  sidebarExpanded: boolean
  onToggle: () => void
  onOpenApp: (name: string) => void
}) {
  const active = expanded && sidebarExpanded

  return (
    <div>
      <button
        onClick={onToggle}
        title={!sidebarExpanded ? label : undefined}
        className={`
          w-full flex items-center rounded-[10px] cursor-pointer
          font-hanken font-medium text-[14px] leading-none
          transition-all duration-150 border-none
          ${sidebarExpanded ? 'gap-[12px] px-[12px] py-[10px]' : 'justify-center p-[12px]'}
          ${active ? 'bg-white/[0.08] text-white' : 'bg-transparent text-side-muted hover:text-white hover:bg-white/[0.06]'}
        `}
      >
        <Icon size={19} strokeWidth={1.7} className="flex-shrink-0" />
        {sidebarExpanded && (
          <>
            <span className="flex-1 text-left whitespace-nowrap overflow-hidden">{label}</span>
            <ChevronRight
              size={15}
              strokeWidth={2}
              className="transition-transform duration-150 flex-shrink-0 text-side-faint"
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          </>
        )}
      </button>

      {expanded && sidebarExpanded && (
        <div className="flex flex-col gap-[1px] mt-[2px] ml-[19px] pl-[13px] border-l border-white/[0.08]">
          {apps.map(app => (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.name)}
              className="
                w-full flex items-center gap-[9px] px-[10px] py-[8px] rounded-[8px] cursor-pointer
                font-hanken font-normal text-[13px] leading-none text-side-muted
                transition-colors duration-150 hover:bg-white/[0.06] hover:text-white border-none bg-transparent
                text-left
              "
            >
              <span className="truncate">{app.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ activeCat, isNarrow, menuOpen, user, apps, onSetCat, onOpenApp, onClose, onLogout, onOpenProfile, onGoHome, showPainelAdmin, onOpenPainelAdmin }: Props) {
  const activeCats = new Set(apps.map(a => a.cat))
  const navCats = ALL_CATS.filter(c => activeCats.has(c.id))
  const [expanded, setExpanded] = useState<Set<Category>>(new Set())
  const [hovered, setHovered] = useState(false)

  // Desktop: recolhe pra uma faixa de ícones e só expande com o mouse em
  // cima, liberando espaço de tela. Mobile: controlado só pelo hambúrguer.
  const isExpanded = isNarrow ? menuOpen : hovered

  const toggleCat = (cat: Category) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const handleCat = (cat: ActiveCat) => {
    onSetCat(cat)
    if (cat === 'all') onGoHome()
    if (isNarrow) onClose()
  }

  const handleOpenApp = (name: string) => {
    onOpenApp(name)
    if (isNarrow) onClose()
  }

  return (
    <aside
      onMouseEnter={() => !isNarrow && setHovered(true)}
      onMouseLeave={() => !isNarrow && setHovered(false)}
      className="
        fixed z-40 flex flex-col overflow-hidden
        bg-side-bg
        transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
      "
      style={{
        top: isNarrow ? 0 : SIDEBAR_GAP,
        left: isNarrow ? 0 : SIDEBAR_GAP,
        bottom: isNarrow ? 0 : SIDEBAR_GAP,
        width: isExpanded ? '248px' : (isNarrow ? '248px' : `${SIDEBAR_COLLAPSED_W}px`),
        borderRadius: isNarrow ? 0 : 20,
        transform: isNarrow && !menuOpen ? 'translateX(-110%)' : 'translateX(0)',
        boxShadow: isNarrow ? 'none' : '0 8px 40px -8px rgba(20,18,16,0.45)',
      }}
    >
      {/* Header / logo */}
      <div className={`shrink-0 flex flex-col items-center transition-all duration-300 ${isExpanded ? 'px-[20px] pt-[24px] pb-[18px]' : 'pt-[20px] pb-[16px]'}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 flex justify-center">
            <div
              className="rounded-[12px] bg-accent flex items-center justify-center flex-shrink-0"
              style={{ width: 36, height: 36 }}
            >
              <span className="font-archivo font-bold text-[16px] text-white leading-none">X</span>
            </div>
          </div>
          {isNarrow && isExpanded && (
            <button
              onClick={onClose}
              className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center cursor-pointer text-side-muted hover:bg-white/[0.06] hover:text-white border-none bg-transparent transition-colors duration-150"
            >
              <X size={18} strokeWidth={1.7} />
            </button>
          )}
        </div>

        {isExpanded && (
          <>
            <div className="w-full h-px my-[12px] bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
            <p className="font-archivo font-black text-[22px] tracking-[0.04em] text-white leading-none whitespace-nowrap">
              EXTO<span className="text-accent">HUB</span>
            </p>
            <p className="font-hanken text-[9px] text-side-faint tracking-[0.24em] uppercase mt-[8px] whitespace-nowrap font-semibold">
              Incorporação e Construção
            </p>
          </>
        )}
      </div>

      <div className="shrink-0 h-px mx-[14px] bg-white/[0.06]" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-[10px] pb-[14px] flex flex-col gap-[3px]">
        {isExpanded && (
          <div className="font-archivo font-semibold text-[11px] leading-none tracking-[0.13em] uppercase text-side-label px-[12px] pt-[14px] pb-[8px] whitespace-nowrap">
            Menu
          </div>
        )}
        {NAV_MENU.map(({ id, label, Icon }) => (
          <NavItem key={id} id={id} label={label} Icon={Icon} activeCat={activeCat} expanded={isExpanded} onClick={() => handleCat(id)} />
        ))}

        {isExpanded && (
          <div className="font-archivo font-semibold text-[11px] leading-none tracking-[0.13em] uppercase text-side-label px-[12px] pt-[18px] pb-[8px] whitespace-nowrap">
            Categorias
          </div>
        )}
        {navCats.map(({ id, label, Icon }) => (
          <CategoryNavItem
            key={id}
            label={label}
            Icon={Icon}
            apps={apps.filter(a => a.cat === id)}
            expanded={expanded.has(id)}
            sidebarExpanded={isExpanded}
            onToggle={() => toggleCat(id)}
            onOpenApp={handleOpenApp}
          />
        ))}
      </nav>

      {/* Painel Administrativo — botão fixo, só pra quem tem acesso MASTER */}
      {showPainelAdmin && (
        <div className="px-[10px] pt-[6px]">
          <button
            onClick={() => { onOpenPainelAdmin(); if (isNarrow) onClose() }}
            title={!isExpanded ? 'Painel Administrativo' : undefined}
            className={`
              w-full flex items-center rounded-[10px] cursor-pointer
              font-hanken font-medium text-[13px] leading-none text-white
              bg-white/[0.06] border border-accent/30
              hover:bg-white/[0.1] transition-colors duration-150
              ${isExpanded ? 'gap-[10px] px-[12px] py-[10px]' : 'justify-center p-[12px]'}
            `}
          >
            <ShieldCheck size={18} strokeWidth={1.8} className="text-accent flex-shrink-0" />
            {isExpanded && <span className="whitespace-nowrap overflow-hidden">Painel Administrativo</span>}
          </button>
        </div>
      )}

      <div className="shrink-0 h-px mx-[14px] mt-[10px] bg-white/[0.06]" />

      {/* User card */}
      <div className={`shrink-0 p-[10px] ${!isExpanded ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-[11px] ${isExpanded ? 'py-[8px] px-[8px] rounded-[12px]' : ''}`}>
          <button
            onClick={onOpenProfile}
            title={!isExpanded ? user.name : undefined}
            className="flex items-center gap-[11px] flex-1 min-w-0 border-none bg-transparent p-0 cursor-pointer rounded-[10px] transition-colors duration-150 hover:bg-white/[0.06] -mx-[6px] px-[6px] py-[4px] text-left"
          >
            <div className="w-[36px] h-[36px] rounded-full bg-accent text-white flex items-center justify-center font-archivo font-semibold text-[13px] flex-shrink-0">
              {user.initials}
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <div className="font-archivo font-semibold text-[14px] leading-[1.2] text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.name}
                </div>
                <div className="font-hanken font-normal text-[12px] leading-[1.3] text-side-faint whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.role}
                </div>
              </div>
            )}
          </button>
          {isExpanded && (
            <button
              title="Sair"
              onClick={onLogout}
              className="w-[32px] h-[32px] rounded-[9px] flex items-center justify-center cursor-pointer text-side-faint flex-shrink-0 transition-all duration-150 hover:bg-white/[0.06] hover:text-white border-none bg-transparent"
            >
              <LogOut size={17} strokeWidth={1.7} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
