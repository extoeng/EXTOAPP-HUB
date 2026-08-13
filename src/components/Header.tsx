import { useEffect, useRef, useState } from 'react'
import { Search, Bell, HelpCircle, Menu, LayoutGrid, Megaphone, User, Building2 } from 'lucide-react'
import { NotificationPopover } from './NotificationPopover'
import { fetchNotificacoes, marcarNotificacaoLida, marcarTodasNotificacoesLidas, type Notificacao } from '../services/notificacoes'
import type { SearchResult } from '../types'

interface Props {
  query: string
  isNarrow: boolean
  onSearch: (q: string) => void
  onOpenMenu: () => void
  /** Abre um app do catálogo pelo slug (mesmo mecanismo do launcher). */
  onOpenApp: (slug: string) => void
  /** Resultados da busca global (apps + comunicados + contatos + obras),
   *  já filtrados por `query` — montados em App.tsx (ver `searchResults`). */
  searchResults: SearchResult[]
  onSelectSearchResult: (r: SearchResult) => void
}

// Tag à esquerda de cada resultado, uma por tipo — a busca é sobre "tudo",
// a tag é o que deixa claro o que cada linha representa.
const SEARCH_TAG: Record<SearchResult['type'], { label: string; Icon: React.ElementType; color: string; bg: string }> = {
  app: { label: 'App', Icon: LayoutGrid, color: '#6B7280', bg: 'rgba(107,114,128,0.10)' },
  comunicado: { label: 'Comunicado', Icon: Megaphone, color: '#B31C1C', bg: 'rgba(179,28,28,0.10)' },
  contato: { label: 'Contato', Icon: User, color: '#3D6FB4', bg: 'rgba(61,111,180,0.10)' },
  obra: { label: 'Obra', Icon: Building2, color: '#2F8F5B', bg: 'rgba(47,143,91,0.10)' },
}

// Sem push/websocket no backend — polling no intervalo abaixo, mais uma
// busca extra sempre que o usuário abre o sino (não espera o próximo tick).
const POLL_MS = 45_000

export function Header({ query, isNarrow, onSearch, onOpenMenu, onOpenApp, searchResults, onSelectSearchResult }: Props) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notificacao[]>([])
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchOpen = searchFocused && query.trim() !== ''

  useEffect(() => {
    if (!searchOpen) return
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [searchOpen])

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
      <div ref={searchRef} className="w-full max-w-[520px] relative flex items-center">
        <span className="absolute left-[14px] w-[18px] h-[18px] text-text-faint inline-flex pointer-events-none">
          <Search size={18} strokeWidth={1.7} />
        </span>
        <input
          value={query}
          onChange={e => onSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          placeholder="Buscar apps, comunicados, contatos, obras…"
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

        {searchOpen && (
          <div
            className="absolute left-0 top-[calc(100%+8px)] w-full z-50 animate-ex-float bg-surface border border-border rounded-[14px] shadow-card-hover overflow-hidden"
            style={{ maxHeight: '420px', overflowY: 'auto' }}
          >
            {searchResults.length === 0 ? (
              <div className="px-[18px] py-[20px] font-hanken text-[13px] text-text-muted text-center">
                Nenhum resultado pra "{query}"
              </div>
            ) : (
              searchResults.map(r => {
                const tag = SEARCH_TAG[r.type]
                return (
                  <button
                    key={r.id}
                    onClick={() => { onSelectSearchResult(r); setSearchFocused(false) }}
                    className="w-full flex items-center gap-[12px] px-[14px] py-[10px] cursor-pointer border-none bg-transparent text-left hover:bg-[#F9F8F6] transition-colors duration-150"
                  >
                    <span
                      className="flex-shrink-0 inline-flex items-center gap-[5px] font-archivo font-semibold text-[10px] tracking-[0.06em] uppercase px-[8px] py-[4px] rounded-[7px]"
                      style={{ color: tag.color, background: tag.bg }}
                    >
                      <tag.Icon size={11} strokeWidth={2} />
                      {tag.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-hanken font-medium text-[13px] text-ink truncate">{r.title}</div>
                      {r.subtitle && (
                        <div className="font-hanken text-[11.5px] text-text-muted truncate">{r.subtitle}</div>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        )}
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
