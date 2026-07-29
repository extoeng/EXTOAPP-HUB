import { useEffect, useState } from 'react'
import { Search, Bell, HelpCircle, Menu } from 'lucide-react'
import { NotificationPopover, type NotificationItem } from './NotificationPopover'
import { fetchDocuments } from '../services/documents'
import { isComunicadoNovo } from '../utils/comunicadoNovo'

interface Props {
  query: string
  isNarrow: boolean
  onSearch: (q: string) => void
  onOpenMenu: () => void
}

// IDs de comunicado já vistos/removidos pelo usuário nesta notificação —
// localStorage (não sessionStorage), pra não voltar a piscar/aparecer depois.
const LIDOS_STORAGE_KEY = 'exto_hub_notif_lidos'
const REMOVIDOS_STORAGE_KEY = 'exto_hub_notif_removidos'
function loadIds(key: string): number[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function Header({ query, isNarrow, onSearch, onOpenMenu }: Props) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [lidos, setLidos] = useState<number[]>(() => loadIds(LIDOS_STORAGE_KEY))
  const [removidos, setRemovidos] = useState<number[]>(() => loadIds(REMOVIDOS_STORAGE_KEY))

  useEffect(() => {
    fetchDocuments('comunicado').then(list => {
      if (!list) return
      const recentes = list.filter(c => isComunicadoNovo(c.dateISO))
      setNotifications(recentes.map(c => ({
        id: c.id,
        title: c.numero ? `Comunicado Nº ${c.numero}` : 'Comunicado',
        time: c.date,
        color: '#AE3A23',
      })))
    })
  }, [])

  const visiveis = notifications.filter(n => !removidos.includes(n.id))
  const unreadIds = visiveis.filter(n => !lidos.includes(n.id)).map(n => n.id)

  function marcarTodasLidas() {
    const next = [...new Set([...lidos, ...visiveis.map(n => n.id)])]
    setLidos(next)
    localStorage.setItem(LIDOS_STORAGE_KEY, JSON.stringify(next))
  }

  function remover(id: number) {
    const next = [...new Set([...removidos, id])]
    setRemovidos(next)
    localStorage.setItem(REMOVIDOS_STORAGE_KEY, JSON.stringify(next))
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
            focus:border-accent focus:shadow-[0_0_0_3px_rgba(174,58,35,0.12)]
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
            onClick={() => setNotifOpen(o => !o)}
            className="relative w-[40px] h-[40px] rounded-[10px] flex items-center justify-center cursor-pointer text-text-muted hover:bg-[#EBE8E3] hover:text-ink border-none bg-transparent transition-all duration-150"
          >
            <Bell size={20} strokeWidth={1.7} />
            {unreadIds.length > 0 && (
              <span className="absolute top-[9px] right-[10px] w-[8px] h-[8px] rounded-full bg-accent border-[1.5px] border-bg-app animate-ex-pulse" />
            )}
          </button>
          {notifOpen && (
            <NotificationPopover
              notifications={visiveis}
              lidos={lidos}
              onMarcarTodasLidas={marcarTodasLidas}
              onRemover={remover}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>

      </div>
    </header>
  )
}
