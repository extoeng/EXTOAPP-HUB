import { useEffect, useRef, useState } from 'react'
import { APPS, CAT_ORDER, CAT_LABELS, RECENT_IDS, DEFAULT_FAVS } from './data/apps'
import type { ActiveCat } from './types'
import type { AuthUser } from './services/auth'
import { useNarrow } from './hooks/useNarrow'
import { useGreeting } from './hooks/useGreeting'
import { LoginPage } from './pages/LoginPage'
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

  if (!user) {
    return <LoginPage onLogin={setUser} />
  }

  return <Hub user={user} onLogout={() => setUser(null)} />
}

function Hub({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState<ActiveCat>('all')
  const [favs, setFavs] = useState<string[]>(DEFAULT_FAVS)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isNarrow = useNarrow(860)
  const { greeting, today } = useGreeting(user.name.split(' ')[0])

  useEffect(() => {
    if (!isNarrow) setMenuOpen(false)
  }, [isNarrow])

  const openApp = (name: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(name)
    toastTimerRef.current = setTimeout(() => setToast(null), 2200)
  }

  const toggleFav = (id: string) => {
    setFavs(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const q = query.trim().toLowerCase()

  const match = (app: typeof APPS[0]) =>
    q === '' || app.name.toLowerCase().includes(q) || app.desc.toLowerCase().includes(q)

  const groups = CAT_ORDER
    .map(cat => ({
      cat,
      label: CAT_LABELS[cat],
      apps: APPS.filter(a => a.cat === cat && (activeCat === 'all' || activeCat === cat) && match(a)),
    }))
    .filter(g => g.apps.length > 0)

  const showExtras = q === '' && activeCat === 'all'
  const favApps = APPS.filter(a => favs.includes(a.id))
  const recentApps = RECENT_IDS.map(id => APPS.find(a => a.id === id)!).filter(Boolean)
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
        onSetCat={setActiveCat}
        onClose={() => setMenuOpen(false)}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          query={query}
          isNarrow={isNarrow}
          onSearch={setQuery}
          onOpenMenu={() => setMenuOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto px-[24px] pt-[26px] pb-[64px] scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          <div className="max-w-[1180px] mx-auto">

            <div className="mb-[28px]">
              <div className="font-archivo font-semibold text-[28px] leading-[1.15] text-ink">
                {greeting}
              </div>
              <div className="font-hanken font-normal text-[15px] leading-none text-text-muted mt-[6px]">
                {today}
              </div>
            </div>

            {showExtras && <Banner />}

            {showExtras && <RecentShortcuts apps={recentApps} onOpen={openApp} />}

            {showExtras && favApps.length > 0 && (
              <div className="mt-[30px]">
                <div className="flex items-baseline gap-[10px] mb-[14px]">
                  <h3 className="m-0 font-archivo font-semibold text-[13px] leading-none tracking-[0.08em] uppercase text-label">
                    Favoritos
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

          {!isNarrow && <RightPanel />}
        </div>
      </div>

      {toast && <Toast appName={toast} />}
    </div>
  )
}
