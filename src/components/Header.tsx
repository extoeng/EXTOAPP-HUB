import { useEffect, useRef, useState } from 'react'
import { Search, Bell, HelpCircle, Menu } from 'lucide-react'
import { NotificationPopover } from './NotificationPopover'
import { fetchNotificacoes, marcarNotificacaoLida, marcarTodasNotificacoesLidas, type Notificacao } from '../services/notificacoes'

interface Props {
  query: string
  isNarrow: boolean
  onSearch: (q: string) => void
  onOpenMenu: () => void
  /** Abre um app do catálogo pelo slug (mesmo mecanismo do launcher). */
  onOpenApp: (slug: string) => void
}

// Sem push/websocket no backend — polling no intervalo abaixo, mais uma
// busca extra sempre que o usuário abre o sino (não espera o próximo tick).
const POLL_MS = 45_000

export function Header({ query, isNarrow, onSearch, onOpenMenu, onOpenApp }: Props) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notificacao[]>([])

  const carregar = useRef(() => {
    fetchNotificacoes().then(list => { if (list) setNotifications(list) })
  })

  useEffect(() => {
    carregar.current()
    const id = setInterval(() => carregar.current(), POLL_MS)
    return () => clearInterval(id)
  }, [])

  const unreadCount = notifications.filter(n => n.lida_em === null).length

  function marcarTodasLidas() {
    marcarTodasNotificacoesLidas().then(ok => {
      if (!ok) return
      setNotifications(prev => prev.map(n => ({ ...n, lida_em: n.lida_em ?? new Date().toISOString() })))
    })
  }

  function selecionar(n: Notificacao) {
    setNotifOpen(false)
    onOpenApp(n.app)
    if (n.lida_em !== null) return
    marcarNotificacaoLida(n.id).then(atualizada => {
      if (!atualizada) return
      setNotifications(prev => prev.map(x => x.id === atualizada.id ? atualizada : x))
    })
  }

  return (
    <header className="h-[70px] flex-shrink-0 flex items-center gap-[16px] px-[24px] bg-bg-app z-20">
      {isNarrow && (
        <button
          onClick={onOpenMenu}
          className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center cursor-pointer text-icon-default flex-shrink-0 hover:bg-[#EBE8E3] border-none bg-transparent transition-colors duration-150"
        >
          <Menu size={20} strokeWidth={1.7} />
        </button>
      )}

      <div className="flex-1 flex justify-center">
      <div className="w-full max-w-[520px] relative flex items-center">
        <span className="absolute left-[14px] w-[18px] h-[18px] text-text-faint inline-flex pointer-events-none">
          <Search size={18} strokeWidth={1.7} />
        </span>
        <input
          value={query}
          onChange={e => onSearch(e.target.value)}
          placeholder="Buscar aplicativos, ferramentas e atalhos…"
          name="hub-search"
          autoComplete="off"
          className="
            w-full h-[43px] border border-border-2 bg-surface rounded-[11px]
            pl-[42px] pr-[14px]
            font-hanken font-normal text-[14px] text-ink
            outline-none
            transition-all duration-150
            focus:border-accent focus:shadow-[0_0_0_3px_rgba(179,28,28,0.12)]
          "
        />
      </div>
      </div>

      <div className="flex items-center gap-[4px] flex-shrink-0">
        <button
          title="Ajuda"
          className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center cursor-pointer text-text-muted hover:bg-[#EBE8E3] hover:text-ink border-none bg-transparent transition-all duration-150"
        >
          <HelpCircle size={20} strokeWidth={1.7} />
        </button>

        <div className="relative">
          <button
            title="Notificações"
            onClick={() => { setNotifOpen(o => !o); carregar.current() }}
            className="relative w-[40px] h-[40px] rounded-[10px] flex items-center justify-center cursor-pointer text-text-muted hover:bg-[#EBE8E3] hover:text-ink border-none bg-transparent transition-all duration-150"
          >
            <Bell size={20} strokeWidth={1.7} />
            {unreadCount > 0 && (
              <span className="absolute top-[9px] right-[10px] w-[8px] h-[8px] rounded-full bg-accent border-[1.5px] border-bg-app animate-ex-pulse" />
            )}
          </button>
          {notifOpen && (
            <NotificationPopover
              notifications={notifications}
              onMarcarTodasLidas={marcarTodasLidas}
              onSelect={selecionar}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>

      </div>
    </header>
  )
}
