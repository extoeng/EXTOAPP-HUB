import { useEffect, useRef, useState } from 'react'
import { APPS, CAT_ORDER, CAT_LABELS, RECENT_IDS, DEFAULT_FAVS } from './data/apps'
import { COMUNICADOS } from './data/comunicados'
import { MANUAIS } from './data/manuais'
import type { ActiveCat, App as AppType } from './types'
import type { AuthUser } from './services/auth'
import { getMe, fetchApps, getSatelliteCode, logout as apiLogout } from './services/auth'
import { getToken, setToken } from './services/api'
import { useNarrow } from './hooks/useNarrow'
import { useGreeting } from './hooks/useGreeting'
import { LoginPage } from './pages/LoginPage'
import { ComunicadosPage } from './pages/ComunicadosPage'
import { ManuaisPage } from './pages/ManuaisPage'
import { ObrasPage } from './pages/ObrasPage'
import { RamaisPage } from './pages/RamaisPage'
import { ProfilePage } from './pages/ProfilePage'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Banner } from './components/Banner'
import { RecentShortcuts } from './components/RecentShortcuts'
import { AppGrid } from './components/AppGrid'
import { AppCard } from './components/AppCard'
import { EmptyState } from './components/EmptyState'
import { Toast } from './components/Toast'
import { RightPanel } from './components/RightPanel'

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [restoring, setRestoring] = useState(true)

  // Restaura sessão a partir do token salvo
  useEffect(() => {
    if (!getToken()) {
      setRestoring(false)
      return
    }
    getMe()
      .then(u => setUser(u))
      .finally(() => setRestoring(false))
  }, [])

  const handleLogout = async () => {
    await apiLogout()
    setUser(null)
    sessionStorage.removeItem(PAGE_STORAGE_KEY)
  }

  // Sessão morreu no servidor (refresh já tentado e falhou) — não vale a
  // pena chamar /auth/logout com um token já inválido, só limpa localmente.
  const handleSessionExpired = () => {
    setToken(null)
    setUser(null)
    sessionStorage.removeItem(PAGE_STORAGE_KEY)
  }

  if (restoring) {
    return <div className="h-screen bg-bg-app" />
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />
  }

  return (
    <Hub
      user={user}
      onLogout={handleLogout}
      onUserChange={setUser}
      onSessionExpired={handleSessionExpired}
    />
  )
}

interface HubProps {
  user: AuthUser
  onLogout: () => void
  onUserChange: (u: AuthUser) => void
  onSessionExpired: () => void
}

type Page =
  | { name: 'home' }
  | { name: 'comunicados'; id: number }
  | { name: 'manuais'; id: number }
  | { name: 'profile' }
  | { name: 'obras' }
  | { name: 'ramais' }

// Guarda a página atual entre reloads (F5/Ctrl+Shift+R) — sem isso o usuário
// sempre "voltava pro Início" ao atualizar, já que não há router/URL real.
// sessionStorage (não localStorage): some ao fechar a aba, não persiste
// indefinidamente entre sessões diferentes.
const PAGE_STORAGE_KEY = 'exto_hub_page'

function loadStoredPage(): Page {
  try {
    const raw = sessionStorage.getItem(PAGE_STORAGE_KEY)
    if (!raw) return { name: 'home' }
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.name === 'string') return parsed as Page
  } catch {
    // sessionStorage indisponível ou JSON inválido — cai pro Início.
  }
  return { name: 'home' }
}

// Apps que existem no catálogo da API mas não devem virar card no grid/sidebar —
// o acesso a eles é só pelo atalho dedicado em "Informações úteis" (ver Agendas)
// ou pelo botão fixo do menu (ver Painel Administrativo, acima do usuário).
const HIDDEN_CATALOG_SLUGS = ['agenda-publica', 'painel-admin']
const hideCatalogOnly = (list: AppType[]) => list.filter(a => !HIDDEN_CATALOG_SLUGS.includes(a.id))

// A API pode devolver os apps em outra ordem (ex.: alfabética) — sem isso, o
// grid "pisca" trocando de posição assim que a resposta chega e substitui o
// fallback estático. Reordena sempre pela posição definida em data/apps.ts,
// mantendo apps novos (ainda não catalogados localmente) no fim, na ordem
// em que a API os enviou.
const CATALOG_ORDER = new Map(APPS.map((a, i) => [a.id, i]))
const sortByCatalogOrder = (list: AppType[]) =>
  [...list].sort((a, b) => (CATALOG_ORDER.get(a.id) ?? Infinity) - (CATALOG_ORDER.get(b.id) ?? Infinity))

function Hub({ user, onLogout, onUserChange, onSessionExpired }: HubProps) {
  const [page, setPage] = useState<Page>(loadStoredPage)

  useEffect(() => {
    sessionStorage.setItem(PAGE_STORAGE_KEY, JSON.stringify(page))
  }, [page])
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState<ActiveCat>('all')
  const [favs, setFavs] = useState<string[]>(DEFAULT_FAVS)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  // Lista completa (não filtrada) — precisa dela crua pra saber se o usuário
  // tem acesso a apps escondidos do grid (ex.: Painel Administrativo), já que
  // `apps` abaixo remove esses antes de renderizar grid/sidebar.
  const [allApps, setAllApps] = useState<AppType[]>(APPS)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isNarrow = useNarrow(860)
  const { greeting, today } = useGreeting(user.name.split(' ')[0])

  useEffect(() => {
    if (!isNarrow) setMenuOpen(false)
  }, [isNarrow])

  // Catálogo de apps vem da API (apps que o usuário pode acessar);
  // mantém o estático como fallback se a API falhar.
  const [appsLoaded, setAppsLoaded] = useState(false)
  useEffect(() => {
    fetchApps().then(list => {
      if (list && list.length) setAllApps(sortByCatalogOrder(list))
      setAppsLoaded(true)
    })
  }, [])

  // Retorno automático pro app satélite que mandou o usuário de volta pro hub
  // (?return_to=<url>) — acontece quando o access token do satélite expira
  // (ou nunca existiu, ex.: F5 direto nele) e ele não tem como renovar sozinho
  // (SSO Fase 1: satélite só recebe `access`, nunca `refresh`). Sem isso, o
  // usuário caía na home do hub e precisava clicar no app de novo manualmente.
  // Roda com `allApps` (não a lista filtrada) pra achar também apps escondidos
  // do grid, ex. Painel Administrativo/Agenda Pública.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const returnTo = params.get('return_to')
    if (!returnTo) return

    // Limpa a URL já, síncrono — evita repetir o handoff se o usuário der
    // outro F5 no hub antes do redirecionamento abaixo completar.
    params.delete('return_to')
    window.history.replaceState({}, '', params.toString() ? `?${params}` : window.location.pathname)

    let destino: URL
    try { destino = new URL(returnTo) } catch { return }
    const app = allApps.find(a => {
      if (!a.url) return false
      try { return new URL(a.url).origin === destino.origin } catch { return false }
    })
    if (!app) return

    // Navega a MESMA aba (não abre uma nova) — diferente de openViaSatelliteHandoff,
    // que abre em nova aba a partir de um clique. Aqui não há gesto de clique
    // (rodou sozinho ao carregar a página), então window.open seria bloqueado
    // pelo navegador; navegar a aba atual não tem essa restrição.
    getSatelliteCode(app.id).then(code => {
      if (!code) { onSessionExpired(); return }
      const sep = returnTo.includes('?') ? '&' : '?'
      window.location.href = `${returnTo}${sep}code=${encodeURIComponent(code)}`
    })
  }, [allApps])

  const apps = hideCatalogOnly(allApps)
  // Painel Administrativo não é um app de card comum — vira um botão fixo no
  // menu, acima do usuário, visível só pra quem a API já concedeu acesso
  // (o app só aparece em allApps se o usuário tiver capability lá).
  const hasPainelAdmin = allApps.some(a => a.id === 'painel-admin')
  // Edição dos Dados das Obras: só quem tem a capability `manage` ("Administrador")
  // no app `obras` (concedida via Painel Admin). O backend é a barreira real.
  const canManageObras = (user.apps['obras'] ?? []).includes('manage')
  // Agenda Pública (atalho "Agendas" em Informações Úteis): a VISIBILIDADE do
  // atalho é decidida pela capability do app próprio `agenda-publica`
  // (Visualizador) — mesmo critério de allApps usado pra painel-admin. É o
  // interruptor que o admin usa pra mostrar/esconder a agenda por perfil (ex.:
  // manutenção), decisão do dono do produto (2026-07-13).
  // ATENÇÃO: os DADOS da agenda continuam vindo de /api/recepcao/* (app
  // Recepção), protegidos por 'controle-recepcao' — quem tiver 'agenda-publica'
  // mas NÃO tiver 'controle-recepcao' vê o atalho e trava em "Carregando..."
  // (a API nega os dados com 403). Não dá pra resolver isso aqui sem tocar no
  // backend da Recepção (app compartilhado — ver patterns no MCP). Na prática o
  // admin deve conceder 'agenda-publica' só a quem já tem 'controle-recepcao'.
  const hasAgenda = allApps.some(a => a.id === 'agenda-publica')
  // Mesmo critério pros outros 4 atalhos de Informações Úteis (2026-07-13):
  // cada um só aparece pra quem tem `view` ou `manage` no app correspondente
  // (allApps já vem filtrado pela API por "tem qualquer capability nesse
  // app_slug") — sem isso, dá pra "desligar" a visibilidade de um desses
  // apps por perfil via Painel Admin (ex.: manutenção). NÃO existe um
  // equivalente pra Agenda aqui — a visibilidade dela é decidida pela
  // capability do app `controle-recepcao` (ver `hasAgenda` acima), que
  // pertence ao app Recepção, um sistema diferente — não mexer nisso.
  const hasComunicados = allApps.some(a => a.id === 'comunicados')
  const hasManuais = allApps.some(a => a.id === 'manuais')
  const hasObras = allApps.some(a => a.id === 'obras')
  const hasRamais = allApps.some(a => a.id === 'ramais')

  // Se a página vinda do sessionStorage (F5) exigir acesso que o usuário não
  // tem mais (perfil mudou desde a última visita), volta pro Início — sem
  // isso a área principal ficaria em branco (as páginas abaixo só renderizam
  // com a condição de acesso batendo). Só decide depois que allApps carregou
  // de verdade (appsLoaded), senão usaria o fallback estático (que nem lista
  // esses 4 apps) e mandaria todo mundo pro Início por engano no 1º render.
  useEffect(() => {
    if (!appsLoaded) return
    const precisaDe: Partial<Record<Page['name'], boolean>> = {
      comunicados: hasComunicados, manuais: hasManuais, obras: hasObras, ramais: hasRamais,
    }
    if (page.name in precisaDe && !precisaDe[page.name]) setPage({ name: 'home' })
  }, [appsLoaded, page.name, hasComunicados, hasManuais, hasObras, hasRamais])

  // Handoff SSO cross-domain (Fase 1, interina): abre o satélite já autenticado
  // via code de curta duração. Reutilizado por qualquer app/atalho com SSO,
  // esteja ele no catálogo (apps[]) ou seja um atalho estático (ex.: Agendas).
  const openViaSatelliteHandoff = async (appSlug: string, url: string) => {
    // Abre a aba já (síncrono, dentro do gesto de clique) para não ser
    // bloqueada como pop-up — o navegador só permite window.open sem bloqueio
    // se ele ocorrer antes de qualquer await.
    const janela = window.open('', '_blank')
    const code = await getSatelliteCode(appSlug)
    if (!code) {
      // apiFetch já tentou renovar o access e falhou — sessão está morta.
      // Não navega pro satélite sem code; volta pro login (fluxo já existente).
      onSessionExpired()
      janela?.close()
      return
    }
    const target = `${url}${url.includes('?') ? '&' : '?'}code=${encodeURIComponent(code)}`
    if (janela) janela.location.href = target
    else window.open(target, '_blank', 'noopener,noreferrer') // fallback se a 1ª chamada foi bloqueada
  }

  const openApp = async (name: string) => {
    const app = apps.find(a => a.name === name)
    if (!app?.url) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      setToast(name)
      toastTimerRef.current = setTimeout(() => setToast(null), 2200)
      return
    }

    if (app.ssoEnabled) {
      await openViaSatelliteHandoff(app.id, app.url)
      return
    }

    window.open(app.url, '_blank', 'noopener,noreferrer')
  }

  const openAgenda = () => openViaSatelliteHandoff('agenda-publica', 'https://extoapp-agenda.web.app')
  const openPainelAdmin = () => openViaSatelliteHandoff('painel-admin', 'https://extoapp-painel-adm.web.app')

  const toggleFav = (id: string) => {
    setFavs(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const q = query.trim().toLowerCase()

  const match = (app: AppType) =>
    q === '' || app.name.toLowerCase().includes(q) || app.desc.toLowerCase().includes(q)

  const groups = CAT_ORDER
    .map(cat => ({
      cat,
      label: CAT_LABELS[cat],
      apps: apps.filter(a => a.cat === cat && (activeCat === 'all' || activeCat === cat) && match(a)),
    }))
    .filter(g => g.apps.length > 0)

  const showExtras = q === '' && activeCat === 'all'
  const favApps = apps.filter(a => favs.includes(a.id))
  const recentApps = RECENT_IDS.map(id => apps.find(a => a.id === id)!).filter(Boolean)
  const isEmpty = groups.length === 0

  return (
    <div className="h-screen flex overflow-hidden font-hanken text-ink bg-bg-app">
      {isNarrow && menuOpen && (
        <div
          className="fixed inset-0 bg-[rgba(22,20,18,0.45)] z-[35]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <Sidebar
        activeCat={activeCat}
        isNarrow={isNarrow}
        menuOpen={menuOpen}
        user={user}
        apps={apps}
        onSetCat={setActiveCat}
        onOpenApp={openApp}
        onClose={() => setMenuOpen(false)}
        onLogout={onLogout}
        onOpenProfile={() => setPage({ name: 'profile' })}
        onGoHome={() => setPage({ name: 'home' })}
        showPainelAdmin={hasPainelAdmin}
        onOpenPainelAdmin={openPainelAdmin}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          query={query}
          isNarrow={isNarrow}
          onSearch={setQuery}
          onOpenMenu={() => setMenuOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          {page.name === 'comunicados' && hasComunicados && (
            <div className="flex-1 overflow-hidden bg-bg-app">
              <ComunicadosPage
                initialId={page.id}
                onBack={() => setPage({ name: 'home' })}
                user={user}
              />
            </div>
          )}
          {page.name === 'manuais' && hasManuais && (
            <div className="flex-1 overflow-hidden bg-bg-app">
              <ManuaisPage
                initialId={page.id}
                onBack={() => setPage({ name: 'home' })}
                user={user}
              />
            </div>
          )}
          {page.name === 'profile' && (
            <div className="flex-1 overflow-hidden bg-bg-app">
              <ProfilePage
                user={user}
                onBack={() => setPage({ name: 'home' })}
                onUserChange={onUserChange}
              />
            </div>
          )}
          {page.name === 'obras' && hasObras && (
            <div className="flex-1 overflow-hidden bg-bg-app">
              <ObrasPage onBack={() => setPage({ name: 'home' })} canManage={canManageObras} />
            </div>
          )}
          {page.name === 'ramais' && hasRamais && (
            <div className="flex-1 overflow-hidden bg-bg-app">
              <RamaisPage onBack={() => setPage({ name: 'home' })} isMaster={hasPainelAdmin} />
            </div>
          )}
          <main className={`flex-1 overflow-y-auto px-[24px] pt-[26px] pb-[64px] scrollbar-none${page.name !== 'home' ? ' hidden' : ''}`} style={{ scrollbarWidth: 'none' as const }}>
          <div className="max-w-[1180px] mx-auto">

            <div className="mb-[28px]">
              <div className="font-archivo font-semibold text-[28px] leading-[1.15] text-ink">
                {greeting}
              </div>
              <div className="font-hanken font-normal text-[15px] leading-none text-text-muted mt-[6px]">
                {today}
              </div>
            </div>

            {showExtras && hasComunicados && (
              <Banner onRead={(id) => setPage({ name: 'comunicados', id })} />
            )}

            {showExtras && (
              <RecentShortcuts
                apps={recentApps}
                onOpen={openApp}
                onOpenComunicados={() => setPage({ name: 'comunicados', id: COMUNICADOS[0].id })}
                onOpenManuais={() => setPage({ name: 'manuais', id: MANUAIS[0].id })}
                onOpenAgenda={openAgenda}
                onOpenObras={() => setPage({ name: 'obras' })}
                onOpenRamais={() => setPage({ name: 'ramais' })}
                showAgenda={hasAgenda}
                showComunicados={hasComunicados}
                showManuais={hasManuais}
                showObras={hasObras}
                showRamais={hasRamais}
              />
            )}

            {showExtras && favApps.length > 0 && (
              <div className="mt-[30px]">
                <div className="flex items-baseline gap-[10px] mb-[14px]">
                  <h3 className="m-0 font-archivo font-semibold text-[13px] leading-none tracking-[0.08em] uppercase text-label">
                    APPs Favoritos
                  </h3>
                  <span className="font-hanken font-medium text-[12px] text-label-2">
                    {favApps.length} {favApps.length === 1 ? 'aplicativo' : 'aplicativos'}
                  </span>
                </div>
                <div className="grid gap-[16px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(244px, 1fr))' }}>
                  {favApps.map(app => (
                    <AppCard
                      key={app.id}
                      app={app}
                      isFav={favs.includes(app.id)}
                      onOpen={() => openApp(app.name)}
                      onToggleFav={(e) => { e.stopPropagation(); toggleFav(app.id) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {groups.map(g => (
              <AppGrid
                key={g.cat}
                label={g.label}
                apps={g.apps}
                favs={favs}
                onOpen={openApp}
                onToggleFav={toggleFav}
              />
            ))}

            {isEmpty && <EmptyState />}
          </div>
          </main>

          {!isNarrow && page.name === 'home' && <RightPanel />}
        </div>
      </div>

      {toast && <Toast appName={toast} />}
    </div>
  )
}
