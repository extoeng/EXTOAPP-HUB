import { useEffect, useState } from 'react'
import {
  Home, User, LogOut, X, ShieldCheck, Pin, PinOff, ChevronRight, ArrowLeft,
  LayoutGrid, Users, HardHat, Wallet, Monitor, Scale, Briefcase,
} from 'lucide-react'
import type { ActiveCat, App, Category } from '../types'
import type { AuthUser } from '../services/auth'
import { CAT_LABELS, CAT_ORDER } from '../data/apps'
import logoUrl from '../assets/exto-logo-full.png'

export const SIDEBAR_COLLAPSED_W = 68
export const SIDEBAR_EXPANDED_W = 248
const SIDEBAR_GAP = 12

const NAV_MENU = [
  { id: 'all' as ActiveCat, label: 'Início', Icon: Home },
]

// Ícone por categoria — mesmo usado no rótulo (menu expandido) e sozinho no
// lugar do nome quando o menu recolhe pra faixa de ícones.
const CAT_ICON: Record<Category, React.ElementType> = {
  geral: LayoutGrid,
  rh: Users,
  obras: HardHat,
  fin: Wallet,
  ti: Monitor,
  juridico: Scale,
  admin: Briefcase,
}

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
      {expanded && <span className="whitespace-nowrap overflow-hidden uppercase tracking-[0.04em] text-[13px]">{label}</span>}
    </button>
  )
}

function AppNavItem({ app, onClick }: { app: App; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={app.name}
      className={`
        w-full flex items-center gap-[10px] rounded-[10px] cursor-pointer
        font-hanken font-medium text-[14px] leading-none
        transition-all duration-150 border-none px-[12px] py-[10px]
        bg-transparent text-white/90 hover:text-white hover:bg-white/[0.06]
      `}
    >
      {/* Ícone do próprio app, nas cores originais. */}
      {app.icon && (
        <img src={app.icon} alt="" className="w-[16px] h-[16px] object-contain flex-shrink-0" />
      )}
      <span className="whitespace-nowrap overflow-hidden text-ellipsis leading-[1.4]">{app.name}</span>
    </button>
  )
}

// Linha de grupo na listagem raiz — clicar entra na cascata (drill-down)
// mostrando só os subitens dele (ver `openCat` em Sidebar). Menu recolhido
// (faixa de ícones): mostra só o ícone da categoria, no lugar do nome.
function AppGroupRow({ label, Icon, expanded, onClick }: {
  label: string
  Icon: React.ElementType
  expanded: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={!expanded ? label : undefined}
      className={`
        w-full flex items-center rounded-[10px] cursor-pointer
        font-hanken font-medium text-[13px] leading-none border-none
        transition-all duration-150
        ${expanded ? 'gap-[10px] px-[12px] py-[9px]' : 'justify-center p-[12px]'}
        bg-transparent text-white hover:bg-white/[0.06]
      `}
    >
      <Icon size={16} strokeWidth={1.8} className="flex-shrink-0" />
      {expanded && (
        <>
          <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis uppercase tracking-[0.04em] text-[13px]">{label}</span>
          <ChevronRight size={14} className="flex-shrink-0" />
        </>
      )}
    </button>
  )
}

// Cabeçalho "<- Voltar" da cascata — some a listagem raiz e volta pra ela.
function BackRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center gap-[10px] rounded-[10px] px-[12px] py-[9px] cursor-pointer
        font-hanken font-medium text-[13px] leading-none border-none mb-[3px]
        bg-transparent text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-150
      "
    >
      <ArrowLeft size={15} className="flex-shrink-0" />
      <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis uppercase tracking-[0.04em] text-[12px]">{label}</span>
    </button>
  )
}

export function Sidebar({ activeCat, isNarrow, menuOpen, user, apps, onSetCat, onOpenApp, onClose, onLogout, onOpenProfile, isProfileActive, onGoHome, showPainelAdmin, onOpenPainelAdmin, onExpandedChange }: Props) {
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

  // Grupos de app no menu — mesma categoria/ordem do grid da home. Clicar no
  // grupo entra em cascata: a listagem raiz some e mostra só os subitens
  // dele, com "<- Voltar" no topo pra retornar. Só um nível de profundidade
  // (sem sub-sub-grupos hoje).
  const [openCat, setOpenCat] = useState<Category | null>(null)
  // Saída da cascata ao abrir um app: os subitens deslizam pra fora enquanto
  // o satellite-code é buscado — a página navega (mesma aba) logo em seguida,
  // então a animação "emenda" com a entrada do menu do app no destino. O
  // timer é só failsafe: se a navegação não acontecer (app sem URL → toast),
  // a lista volta.
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => setLeaving(false), 1600)
    return () => clearTimeout(t)
  }, [leaving])

  useEffect(() => {
    if (!isExpanded) setOpenCat(null)
  }, [isExpanded])

  const appGroups = CAT_ORDER
    .map(cat => ({ cat, label: CAT_LABELS[cat], items: apps.filter(a => a.cat === cat) }))
    .filter(g => g.items.length > 0)
  const openGroup = appGroups.find(g => g.cat === openCat)

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
        width: isExpanded ? `${SIDEBAR_EXPANDED_W}px` : (isNarrow ? `${SIDEBAR_EXPANDED_W}px` : `${SIDEBAR_COLLAPSED_W}px`),
        borderRadius: isNarrow ? 0 : 20,
        transform: isNarrow && !menuOpen ? 'translateX(-110%)' : 'translateX(0)',
        boxShadow: isNarrow ? 'none' : '0 8px 40px -8px rgba(20,18,16,0.45)',
      }}
    >
      {/* Header / logo — mesmo modelo dos apps satélite (Adição de Fornecedores etc.):
          logo pequeno e nome ao lado, na mesma linha. */}
      <div className={`shrink-0 flex flex-col items-center transition-all duration-300 ${isExpanded ? 'px-[20px] pt-[26px] pb-[20px]' : 'pt-[22px] pb-[16px]'}`}>
        <div className="flex items-center w-full">
          <div className="flex flex-1 justify-center">
            <img
              src={logoUrl}
              alt="Exto"
              className={`object-contain transition-all duration-300 ${isExpanded ? 'h-[64px] w-auto rotate-0' : 'h-[36px] w-[36px] -rotate-90'}`}
            />
          </div>
          {isNarrow && isExpanded && (
            <button
              onClick={onClose}
              className="ml-auto w-[34px] h-[34px] rounded-[9px] flex items-center justify-center cursor-pointer text-side-muted hover:bg-white/[0.06] hover:text-white border-none bg-transparent transition-colors duration-150"
            >
              <X size={18} strokeWidth={1.7} />
            </button>
          )}
          {!isNarrow && isExpanded && (
            <button
              onClick={togglePinned}
              aria-label={pinned ? 'Desafixar menu' : 'Fixar menu'}
              title={pinned ? 'Desafixar menu' : 'Fixar menu'}
              className={`ml-auto p-1.5 rounded-lg transition-colors border-none bg-transparent cursor-pointer flex-shrink-0 ${pinned ? 'text-accent hover:bg-white/[0.06]' : 'text-side-muted hover:text-white hover:bg-white/[0.06]'}`}
            >
              {pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
          )}
        </div>
      </div>

      <div className="shrink-0 h-px mx-[14px] bg-white/[0.06]" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-[10px] pb-[14px] flex flex-col gap-[3px]">
        <style>{`
          @keyframes exCascadeIn { from { transform: translateX(14px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
          @keyframes exCascadeBack { from { transform: translateX(-14px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
          @keyframes exCascadeOut { to { transform: translateX(-14px); opacity: 0 } }
        `}</style>
        <div
          key={openGroup ? openGroup.cat : 'root'}
          className="flex flex-col gap-[3px]"
          style={{ animation: leaving ? 'exCascadeOut 0.18s ease forwards' : `${openGroup ? 'exCascadeIn' : 'exCascadeBack'} 0.18s ease` }}
        >
        {isExpanded && openGroup ? (
          <>
            <BackRow label={openGroup.label} onClick={() => setOpenCat(null)} />
            {openGroup.items.map(app => (
              <AppNavItem key={app.id} app={app}
                onClick={() => { setLeaving(true); onOpenApp(app.name) }} />
            ))}
          </>
        ) : (
          <>
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

            {appGroups.length > 0 && (
              <>
                <div className="my-[6px] mx-[2px] h-px bg-white/[0.06]" />
                {appGroups.map(g => (
                  <AppGroupRow
                    key={g.cat}
                    label={g.label}
                    Icon={CAT_ICON[g.cat]}
                    expanded={isExpanded}
                    onClick={() => setOpenCat(g.cat)}
                  />
                ))}
              </>
            )}
          </>
        )}
        </div>

        <button
          onClick={handleProfile}
          title={!isExpanded ? 'Meu Perfil' : undefined}
          className={`
            mt-auto w-full flex items-center rounded-[10px] cursor-pointer
            font-hanken font-medium text-[14px] leading-none
            transition-all duration-150 border-none
            ${isExpanded ? 'gap-[12px] px-[12px] py-[10px]' : 'justify-center p-[12px]'}
            ${isProfileActive ? 'bg-accent text-white' : 'bg-transparent text-white/90 hover:text-white hover:bg-white/[0.06]'}
          `}
        >
          <User size={19} strokeWidth={1.7} className="flex-shrink-0" />
          {isExpanded && <span className="whitespace-nowrap overflow-hidden uppercase tracking-[0.04em] text-[13px]">Meu Perfil</span>}
        </button>
      </nav>

      {/* Painel Administrativo — botão fixo, só pra quem tem capability no
          app `painel-admin` (ver showPainelAdmin em App.tsx). */}
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
            {isExpanded && <span className="whitespace-nowrap overflow-hidden uppercase tracking-[0.04em] text-[12px]">Painel Administrativo</span>}
          </button>
        </div>
      )}

      {/* User card */}
      <div className={`shrink-0 p-[10px] ${!isExpanded ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-[11px] ${isExpanded ? 'py-[8px] px-[8px] rounded-[12px]' : ''}`}>
          <div
            title={!isExpanded ? user.name : undefined}
            className="flex items-center gap-[11px] flex-1 min-w-0 rounded-[10px] -mx-[6px] px-[6px] py-[4px]"
          >
            <div className="w-[36px] h-[36px] rounded-full bg-accent text-white flex items-center justify-center font-archivo font-semibold text-[13px] flex-shrink-0 overflow-hidden">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.initials
              )}
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
