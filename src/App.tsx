import { useEffect, useRef, useState } from 'react'
import { APPS, CAT_ORDER, CAT_LABELS, RECENT_IDS, DEFAULT_FAVS } from './data/apps'
import type { ActiveCat, App as AppType } from './types'
import type { AuthUser } from './services/auth'
import { getMe, fetchApps, getSatelliteCode, logout as apiLogout } from './services/auth'
import { getToken, setToken } from './services/api'
import { useNarrow } from './hooks/useNarrow'
import { useGreeting } from './hooks/useGreeting'
import { LoginPage } from './pages/LoginPage'
import { ComunicadosPage } from './pages/ComunicadosPage'
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
  }

  // Sessão morreu no servidor (refresh já tentado e falhou) — não vale a
  // pena chamar /auth/logout com um token já inválido, só limpa localmente.
  const handleSessionExpired = () => {
    setToken(null)
    setUser(null)
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

function Hub({ user, onLogout, onUserChange, onSessionExpired }: HubProps) {
  const [page, setPage] = useState<{ name: 'home' } | { name: 'comunicados'; id: number } | { name: 'profile' }>({ name: 'home' })
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState<ActiveCat>('all')
  const [favs, setFavs] = useState<string[]>(DEFAULT_FAVS)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [apps, setApps] = useState<AppType[]>(APPS)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isNarrow = useNarrow(860)
  const { greeting, today } = useGreeting(user.name.split(' ')[0])

  useEffect(() => {
    if (!isNarrow) setMenuOpen(false)
  }, [isNarrow])

  // Catálogo de apps vem da API (apps que o usuário pode acessar);
  // mantém o estático como fallback se a API falhar.
  useEffect(() => {
    fetchApps().then(list => {
      if (list && list.length) setApps(list)
    })
  }, [])

  const openApp = async (name: string) => {
    const app = apps.find(a => a.name === name)
    if (!app?.url) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      setToast(name)
      toastTimerRef.current = setTimeout(() => setToast(null), 2200)
      return
    }

    if (app.ssoEnabled) {
      // Abre a aba já (síncrono, dentro do gesto de clique) para não ser
      // bloqueada como pop-up — o navegador só permite window.open sem bloqueio
      // se ele ocorrer antes de qualquer await.
      const janela = window.open('', '_blank')
      const code = await getSatelliteCode(app.id)
      if (!code) {
        // apiFetch já tentou renovar o access e falhou — sessão está morta.
        // Não navega pro satélite sem code; volta pro login (fluxo já existente).
        onSessionExpired()
        janela?.close()
        return
      }
      const target = `${app.url}${app.url.includes('?') ? '&' : '?'}code=${encodeURIComponent(code)}`
      if (janela) janela.location.href = target
      else window.open(target, '_blank', 'noopener,noreferrer') // fallback se a 1ª chamada foi bloqueada
      return
    }

    window.open(app.url, '_blank', 'noopener,noreferrer')
  }

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
        onClose={() => setMenuOpen(false)}
        onLogout={onLogout}
        onOpenProfile={() => setPage({ name: 'profile' })}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          query={query}
          isNarrow={isNarrow}
          onSearch={setQuery}
          onOpenMenu={() => setMenuOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          {page.name === 'comunicados' && (
            <div className="flex-1 overflow-hidden bg-bg-app">
              <ComunicadosPage
                initialId={page.id}
                onBack={() => setPage({ name: 'home' })}
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

            {showExtras && (
              <div>
                <h3 className="m-0 mb-[14px] font-archivo font-semibold text-[13px] leading-none tracking-[0.08em] uppercase text-label">
                  Comunicados
                </h3>
                <Banner onRead={(id) => setPage({ name: 'comunicados', id })} />
              </div>
            )}

            {showExtras && <RecentShortcuts apps={recentApps} onOpen={openApp} />}

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
