import { useEffect, useState } from 'react'
import { Home, User, LogOut, X, ShieldCheck, Pin, PinOff } from 'lucide-react'
import type { ActiveCat, App } from '../types'
import type { AuthUser } from '../services/auth'
import logoUrl from '../assets/exto-logo-2.png'

export const SIDEBAR_COLLAPSED_W = 68
export const SIDEBAR_EXPANDED_W = 248
const SIDEBAR_GAP = 12

const NAV_MENU = [
  { id: 'all' as ActiveCat, label: 'Início', Icon: Home },
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
  isProfileActive: boolean
  /** Início: sempre volta pra home, mesmo estando em outra aba (Comunicados, Perfil...). */
  onGoHome: () => void
  /** Painel Administrativo: só quem tem acesso (MASTER) vê esse botão fixo. */
  showPainelAdmin: boolean
  onOpenPainelAdmin: () => void
  /** Notifica o pai quando o estado expandido/recolhido muda, pra ele poder
   *  ajustar o espaçamento do conteúdo e não ficar sobreposto pela sidebar. */
  onExpandedChange?: (expanded: boolean) => void
}

function NavItem({ label, Icon, active, expanded, onClick }: {
  label: string
  Icon: React.ElementType
  active: boolean
  expanded: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={!expanded ? label : undefined}
      className={`
        w-full flex items-center rounded-[10px] cursor-pointer
        font-hanken font-medium text-[14px] leading-none
        transition-all duration-150 border-none
        ${expanded ? 'gap-[12px] px-[12px] py-[10px]' : 'justify-center p-[12px]'}
        ${active ? 'bg-accent text-white' : 'bg-transparent text-white/90 hover:text-white hover:bg-white/[0.06]'}
      `}
    >
      <Icon size={19} strokeWidth={1.7} className="flex-shrink-0" />
      {expanded && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
    </button>
  )
}

export function Sidebar({ activeCat, isNarrow, menuOpen, user, onSetCat, onClose, onLogout, onOpenProfile, isProfileActive, onGoHome, onOpenPainelAdmin, onExpandedChange }: Props) {
  const [hovered, setHovered] = useState(false)
  // Sem preferência salva ainda, começa fixado (aberto) — clicar no pin
  // (ou fechar) recolhe e passa a lembrar essa escolha daí pra frente.
  const [pinned, setPinned] = useState(() => {
    try {
      const stored = localStorage.getItem('exto-hub-sidebar-pinned')
      return stored === null ? true : stored === '1'
    } catch { return true }
  })

  // Desktop: recolhe pra uma faixa de ícones e só expande com o mouse em
  // cima, liberando espaço de tela. Mobile: controlado só pelo hambúrguer.
  // "pinned" permite travar o menu sempre expandido, ignorando o hover.
  const isExpanded = isNarrow ? menuOpen : (pinned || hovered)

  useEffect(() => {
    onExpandedChange?.(isExpanded)
  }, [isExpanded])

  const togglePinned = () => {
    setPinned(prev => {
      const next = !prev
      try { localStorage.setItem('exto-hub-sidebar-pinned', next ? '1' : '0') } catch {}
      return next
    })
  }

  const handleCat = (cat: ActiveCat) => {
    onSetCat(cat)
    if (cat === 'all') onGoHome()
    if (isNarrow) onClose()
  }

  const handleProfile = () => {
    onOpenProfile()
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
      <div className={`shrink-0 flex flex-col items-center transition-all duration-300 ${isExpanded ? 'px-[20px] pt-[26px] pb-[20px]' : 'pt-[22px] pb-[16px]'}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 flex justify-center">
            <img
              src={logoUrl}
              alt="Exto"
              className={`object-contain transition-all duration-300 ${isExpanded ? 'h-[64px]' : 'h-[36px]'}`}
            />
          </div>
          {isNarrow && isExpanded && (
            <button
              onClick={onClose}
              className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center cursor-pointer text-side-muted hover:bg-white/[0.06] hover:text-white border-none bg-transparent transition-colors duration-150"
            >
              <X size={18} strokeWidth={1.7} />
            </button>
          )}
          {!isNarrow && isExpanded && (
            <button
              onClick={togglePinned}
              aria-label={pinned ? 'Desafixar menu' : 'Fixar menu'}
              title={pinned ? 'Desafixar menu' : 'Fixar menu'}
              className={`p-1.5 rounded-lg transition-colors border-none bg-transparent cursor-pointer flex-shrink-0 ${pinned ? 'text-accent hover:bg-white/[0.06]' : 'text-side-muted hover:text-white hover:bg-white/[0.06]'}`}
            >
              {pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
          )}
        </div>

      </div>

      <div className="shrink-0 h-px mx-[14px] bg-white/[0.06]" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-[10px] pb-[14px] flex flex-col gap-[3px]">
        {NAV_MENU.map(({ id, label, Icon }) => (
          <NavItem
            key={id}
            label={label}
            Icon={Icon}
            active={activeCat === id && !isProfileActive}
            expanded={isExpanded}
            onClick={() => handleCat(id)}
          />
        ))}

        <button
          onClick={handleProfile}
          title={!isExpanded ? 'Meu Perfil' : undefined}
          className={`
            w-full flex items-center rounded-[10px] cursor-pointer
            font-hanken font-medium text-[14px] leading-none
            transition-all duration-150 border-none
            ${isExpanded ? 'gap-[12px] px-[12px] py-[10px]' : 'justify-center p-[12px]'}
            ${isProfileActive ? 'bg-accent text-white' : 'bg-transparent text-white/90 hover:text-white hover:bg-white/[0.06]'}
          `}
        >
          <User size={19} strokeWidth={1.7} className="flex-shrink-0" />
          {isExpanded && <span className="whitespace-nowrap overflow-hidden">Meu Perfil</span>}
        </button>

      </nav>

      {/* Painel Administrativo — botão fixo. Temporariamente sempre visível
          (sem gate de showPainelAdmin) enquanto o catálogo de permissões
          reais ainda não existe no banco core. */}
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

      {/* User card */}
      <div className={`shrink-0 p-[10px] ${!isExpanded ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-[11px] ${isExpanded ? 'py-[8px] px-[8px] rounded-[12px]' : ''}`}>
          <div
            title={!isExpanded ? user.name : undefined}
            className="flex items-center gap-[11px] flex-1 min-w-0 rounded-[10px] -mx-[6px] px-[6px] py-[4px]"
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
          </div>
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
