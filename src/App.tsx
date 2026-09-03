import { useEffect, useMemo, useRef, useState } from 'react'
import { APPS, CATEGORIAS_FALLBACK, agruparPorCategoria, RECENT_IDS, DEFAULT_FAVS } from './data/apps'
import { COMUNICADOS } from './data/comunicados'
import { MANUAIS } from './data/manuais'
import { OBRAS, type Obra } from './data/obras'
import type { ActiveCat, App as AppType, Categoria, Evento, LibraryDoc, SearchResult } from './types'
import type { AuthUser } from './services/auth'
import { getMe, fetchApps, fetchCategorias, getSatelliteCode, exchangeCode, logout as apiLogout } from './services/auth'
import { getToken, setToken, goToLogin, tryRefresh } from './services/api'
import { fetchFavoritos, addFavorito, removeFavorito } from './services/favoritos'
import { fetchDocuments } from './services/documents'
import { fetchEventos, setRsvp } from './services/eventos'
import { fetchObras } from './services/obras'
import { fetchDiretorio, type ContatoPessoa } from './services/diretorio'
import coverUrl from './assets/perfil-sede.webp'
import { eventoFuturo } from './utils/eventoData'
import { delay } from './utils/delay'
import { useNarrow } from './hooks/useNarrow'
import { useGreeting } from './hooks/useGreeting'
import { ComunicadosPage } from './pages/ComunicadosPage'
import { EventosPage } from './pages/EventosPage'
import { ManuaisPage } from './pages/ManuaisPage'
import { ObrasPage, rowKey as obraRowKey } from './pages/ObrasPage'
import { RamaisPage } from './pages/RamaisPage'
import { ProfilePage } from './pages/ProfilePage'
import { Sidebar, SIDEBAR_COLLAPSED_W, SIDEBAR_EXPANDED_W } from './components/Sidebar'
import { Header } from './components/Header'
import { Banner } from './components/Banner'
import { EventosBanner } from './components/EventosBanner'
import { RecentShortcuts } from './components/RecentShortcuts'
import { AppGrid } from './components/AppGrid'
import { AppCard } from './components/AppCard'
import { EmptyState } from './components/EmptyState'
import { Toast } from './components/Toast'
import { RightPanel } from './components/RightPanel'
import { LoadingBars } from './components/LoadingBars'

// Bypass de login só em `npm run dev` (import.meta.env.DEV nunca é true em
// build de produção) — evita ter que logar de verdade só pra ver o layout
// localmente. Sem chamadas à API real (o token seria inválido); a sidebar e
// o grid usam o fallback estático de data/apps.ts mesmo assim.
const DEV_BYPASS_USER: AuthUser = {
  id: 'dev', name: 'Dev Local', role: 'Desenvolvedor', initials: 'DL',
  email: 'dev@exto.com.br', phoneExtension: '', mobile: '', photoUrl: null,
  apps: {},
}

// Catálogo real (data/apps.ts) está vazio de propósito — sem apps não dá pra
// ver os grupos/flyout da sidebar. Só usado se a API não devolver nada
// (fetchApps falha sem token real de qualquer forma, no bypass acima).
const DEV_MOCK_APPS: AppType[] = [
  { id: 'dev-rh-1', cat: 'rh', name: 'Folha de Pagamento', desc: '' },
  { id: 'dev-rh-2', cat: 'rh', name: 'Recrutamento', desc: '' },
  { id: 'dev-rh-3', cat: 'rh', name: 'Benefícios', desc: '' },
  { id: 'dev-obras-1', cat: 'obras', name: 'Cronograma de Obras', desc: '' },
  { id: 'dev-obras-2', cat: 'obras', name: 'Medições', desc: '' },
  { id: 'dev-fin-1', cat: 'fin', name: 'Contas a Pagar', desc: '' },
  { id: 'dev-fin-2', cat: 'fin', name: 'Faturamento', desc: '' },
  // Liga o gate hasEventos no dev (slug está em HIDDEN_CATALOG_SLUGS, não
  // vira card) — sem backend local a lista vem vazia, banner some.
  { id: 'eventos', cat: 'geral', name: 'Eventos', desc: '' },
  // Mesmo esquema: liga o gate hasRamais (botão Contatos) no dev —
  // o diretório cai no mock de dev do fetchDiretorio.
  { id: 'contatos', cat: 'geral', name: 'Contatos', desc: '' },
]

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [restoring, setRestoring] = useState(true)

  useEffect(() => {
    async function restaurarSessao() {
      if (import.meta.env.DEV) {
        setUser(DEV_BYPASS_USER)
        return
      }

      // Se o app de login redirecionou com ?code=, troca pelo access token
      // e limpa a URL antes de seguir.
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        await exchangeCode(code)
        params.delete('code')
        window.history.replaceState({}, '', params.toString() ? `?${params}` : window.location.pathname)
      }

      // Restaura sessão a partir do token salvo. Fase 2 (sessão compartilhada):
      // sem token, tenta renovar pelo cookie de refresh do domínio
      // (.extoapp.com.br) antes de mandar pro login — quem já logou em outro
      // app entra sem handoff. Falhou = sem sessão, cai no login como antes.
      if (!getToken() && !(await tryRefresh())) return
      await getMe().then(u => setUser(u)).catch(() => {})
    }
    // Transição de app: a animação de barras fica pelo menos 1,5s na tela
    // (pedido do produto) — o finally garante que uma falha em qualquer
    // passo acima não deixa a tela presa no loading.
    Promise.all([restaurarSessao(), delay(1500)]).finally(() => setRestoring(false))
  }, [])

  const handleLogout = async () => {
    await apiLogout()
    sessionStorage.removeItem(PAGE_STORAGE_KEY)
    // Navega direto pro app de login com o flag de logout — não basta
    // limpar a sessão local: sem o flag, o app de login (dono do cookie
    // "mestre" do SSO) reautenticaria sozinho e devolveria o usuário pra
    // cá sem pedir credenciais de novo (ver goToLogin em services/api.ts).
    // Manda `return_to` também: sem ele, depois de logar de novo o app de
    // login não sabe pra onde te devolver (cai em "não foi possível
    // identificar para onde te levar"). Seguro mesmo no fluxo de logout
    // porque `logout=1` nunca passa pelo tryRefresh() — vai direto pro
    // formulário, sem risco do loop de reautenticação silenciosa.
    goToLogin(window.location.href, { logout: true })
  }

  // Sessão morreu no servidor (refresh já tentado e falhou) — não vale a
  // pena chamar /auth/logout com um token já inválido, só limpa localmente.
  const handleSessionExpired = () => {
    setToken(null)
    setUser(null)
    sessionStorage.removeItem(PAGE_STORAGE_KEY)
  }

  if (restoring) {
    return <div className="h-screen bg-bg-app flex items-center justify-center"><LoadingBars /></div>
  }

  if (!user) {
    return <SemSessao />
  }

  const directTarget = DIRECT_APP_BY_EMAIL[user.email.trim().toLowerCase()]
  const hasDirectAppAccess =
    directTarget && (user.apps[directTarget.appSlug] ?? []).length > 0
  const hasReturnTo = new URLSearchParams(window.location.search).has('return_to')

  if (directTarget && hasDirectAppAccess && !hasReturnTo) {
    return (
      <DirectAppRedirect
        target={directTarget}
        onSessionExpired={handleSessionExpired}
      />
    )
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

// Exibido quando não há sessão ativa (sem token, sessão expirada, e o
// refresh via cookie também falhou — ou logout manual). Sempre volta pro
// app de login com `?return_to=` — ele autentica (ou já reconhece sessão
// própria) e devolve pra cá sozinho via ?code=, sem exigir ação manual.
function SemSessao() {
  useEffect(() => {
    goToLogin(window.location.href)
  }, [])

  return (
    <div className="h-screen flex items-center justify-center bg-bg-app">
      <p className="font-hanken text-[14px] text-text-muted">Redirecionando…</p>
    </div>
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
  | { name: 'eventos'; id?: number }
  | { name: 'profile' }
  // openKey/openContatoId: vêm da busca global do Header, pra abrir direto
  // o card/modal do resultado clicado (ver `searchResults` abaixo).
  | { name: 'obras'; openKey?: string }
  | { name: 'ramais'; openContatoId?: string }

// Guarda a página atual entre reloads (F5/Ctrl+Shift+R) — sem isso o usuário
// sempre "voltava pro Início" ao atualizar, já que não há router/URL real.
// sessionStorage (não localStorage): some ao fechar a aba, não persiste
// indefinidamente entre sessões diferentes.
const PAGE_STORAGE_KEY = 'exto_hub_page'


// INÍCIO — REDIRECIONAMENTO PROVISÓRIO POR USUÁRIO
//
// Para desativar/remover esta regra, apague:
// 1. este bloco DIRECT_APP_BY_EMAIL;
// 2. o componente DirectAppRedirect abaixo;
// 3. o bloco de decisão marcado dentro de App, antes de renderizar <Hub>.
//
// O usuário só é direcionado se também tiver permissão para o app em user.apps.
interface DirectAppTarget {
  appSlug: string
  url: string
}

const DIRECT_APP_BY_EMAIL: Record<string, DirectAppTarget> = {
  'fabio.chaves@exto.com.br': {
    appSlug: 'relatorio-seg-trab',
    url: 'https://relatorioseg.extoapp.com.br',
  },
}

function DirectAppRedirect({
  target,
  onSessionExpired,
}: {
  target: DirectAppTarget
  onSessionExpired: () => void
}) {
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    getSatelliteCode(target.appSlug)
      .then(code => {
        if (!code) {
          onSessionExpired()
          return
        }

        const separator = target.url.includes('?') ? '&' : '?'
        const destination = `${target.url}${separator}code=${encodeURIComponent(code)}`
        window.location.replace(destination)
      })
      .catch(onSessionExpired)
  }, [target, onSessionExpired])

  return <div className="h-screen bg-bg-app flex items-center justify-center"><LoadingBars /></div>
}
// FIM — REDIRECIONAMENTO PROVISÓRIO POR USUÁRIO

function loadStoredPage(): Page {
  // Deep-link vindo da cascata dos satélites: ?page=perfil abre o Meu Perfil
  // direto (o item MEU PERFIL do nível Hub nos outros apps navega pra cá).
  // Sobrevive ao exchange do ?code= (o boot só remove o param `code`).
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('page') === 'perfil') {
      params.delete('page')
      window.history.replaceState({}, '', params.toString() ? `?${params}` : window.location.pathname)
      return { name: 'profile' }
    }
  } catch {
    // URL indisponível/malformada — segue pro fluxo normal.
  }
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
// "trajetoria" não é um app de verdade — é só o domínio de permissão do
// módulo Departamento/Cargo dentro do Painel Administrativo, sem tela própria
// no hub.
const HIDDEN_CATALOG_SLUGS = ['agenda-publica', 'painel-admin', 'trajetoria', 'contatos', 'obras', 'comunicados', 'eventos', 'spe', 'disparo-email']
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
  // Favoritos: vem da API (por usuário, não por navegador) — DEFAULT_FAVS só
  // como fallback enquanto a chamada não responde (ou se ela falhar).
  const [favs, setFavs] = useState<string[]>(DEFAULT_FAVS)
  const [favsLoaded, setFavsLoaded] = useState(false)

  useEffect(() => {
    fetchFavoritos().then(list => {
      if (list) setFavs(list)
      setFavsLoaded(true)
    })
  }, [])

  // Comunicados — buscado aqui (em paralelo com apps/favoritos), não dentro
  // do próprio Banner: antes o Banner só montava depois que fetchApps
  // confirmava acesso (hasComunicados), fazendo o request de comunicados
  // esperar o de apps terminar pra só então começar (waterfall visível: menu
  // -> grid -> comunicados). Documentos é aberto a qualquer autenticado (ver
  // services/documents.ts), então não há problema em já ter os dados
  // prontos antes de saber se o Banner vai aparecer. Lista completa (não só
  // os destaque do Banner) também alimenta a busca global do Header.
  const [comunicados, setComunicados] = useState<LibraryDoc[] | null>(null)
  useEffect(() => {
    fetchDocuments('comunicado').then(list => setComunicados(list ?? []))
  }, [])
  const comunicadosBanner = useMemo(() => {
    if (!comunicados) return null
    const destacados = comunicados.filter(c => c.destaque)
    return destacados.length > 0 ? destacados : comunicados.slice(0, 5)
  }, [comunicados])

  // Eventos — mesmo racional dos comunicados (busca em paralelo, leitura
  // aberta a qualquer autenticado). null = carregando; [] = nenhum evento
  // (o banner some por conta do contrato do EventosBanner).
  const [eventos, setEventos] = useState<Evento[] | null>(null)
  useEffect(() => {
    fetchEventos().then(list => setEventos(list ?? []))
  }, [])
  const eventosBanner = useMemo(() => {
    if (!eventos) return null
    // Só eventos que ainda não passaram, do mais próximo pro mais distante.
    return eventos
      .filter(e => eventoFuturo(e.inicioISO))
      .sort((a, b) => a.inicioISO.localeCompare(b.inicioISO))
      .slice(0, 5)
  }, [eventos])

  // ── Revelação única da Home ─────────────────────────────────────────
  // Sem isso cada seção pipoca quando o próprio fetch responde: o grid troca
  // de ordem quando /apps chega, Comunicados aparece e empurra tudo pra
  // baixo, Eventos chega por último e empurra de novo. Os fetches já são
  // paralelos — a home só segura a renderização numa animação única até
  // todos resolverem, e revela tudo de uma vez. Teto de 6s (uma API lenta
  // não pode travar o portal — revela com o que tiver) e piso de 600ms
  // (resposta em cache não pode virar flash de splash).
  const [minHold, setMinHold] = useState(false)
  const [tetoEstourado, setTetoEstourado] = useState(false)
  useEffect(() => {
    delay(600).then(() => setMinHold(true))
    delay(6000).then(() => setTetoEstourado(true))
  }, [])

  // As imagens visíveis (ícones dos apps, capas do banner de eventos) entram
  // no gate — efeito mais abaixo, depois da declaração de allApps. Só aquecer
  // não bastava: o download começava no splash mas a revelação não esperava,
  // e ícone/capa lentos (redirect assinado do bucket) pipocavam por último.
  const [imagensProntas, setImagensProntas] = useState(false)

  // RSVP do banner: otimista, reverte se a API recusar (mesmo padrão dos
  // favoritos).
  const handleRsvpBanner = (ev: Evento) => {
    const confirmar = !ev.confirmado
    setEventos(prev => (prev ?? []).map(e => e.id === ev.id ? { ...e, confirmado: confirmar } : e))
    setRsvp(ev.id, confirmar).then(updated => {
      if (updated) setEventos(prev => (prev ?? []).map(e => e.id === updated.id ? updated : e))
      else setEventos(prev => (prev ?? []).map(e => e.id === ev.id ? { ...e, confirmado: ev.confirmado } : e))
    })
  }

  // Obras/Contatos pra busca global do Header — só busca pra quem tem acesso
  // (mesma capability que já decide a visibilidade do atalho, ver
  // hasObras/hasRamais abaixo). Fallback estático (OBRAS) enquanto a API não
  // responde, mesmo padrão do allApps.
  const [obrasSearch, setObrasSearch] = useState<Obra[]>(OBRAS)
  const [contatosSearch, setContatosSearch] = useState<ContatoPessoa[]>([])

  // Aquece o cache do navegador pro plano de fundo do Perfil — sem isso, só
  // começa a baixar (246KB) quando o usuário já clicou em "Meu Perfil",
  // daí o "pop-in" perceptível. Silencioso: só um prefetch, sem afetar o
  // primeiro paint da Home.
  useEffect(() => {
    const img = new Image()
    img.src = coverUrl
  }, [])
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  // Lista completa (não filtrada) — precisa dela crua pra saber se o usuário
  // tem acesso a apps escondidos do grid (ex.: Painel Administrativo), já que
  // `apps` abaixo remove esses antes de renderizar grid/sidebar.
  const [allApps, setAllApps] = useState<AppType[]>(import.meta.env.DEV ? DEV_MOCK_APPS : APPS)
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
  // Categorias do menu (rótulo/ícone/ordem) — CRUD no painel-admin; o
  // espelho estático fica só como fallback se a API falhar.
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_FALLBACK)
  useEffect(() => {
    fetchCategorias().then(list => { if (list && list.length) setCategorias(list) })
  }, [])

  // Espera as imagens visíveis carregarem de verdade (onload/onerror), não só
  // dispara o download: parte do gate da revelação única. Roda quando os dois
  // fetches que trazem URL de imagem já resolveram; onerror também resolve
  // (imagem quebrada não segura a home), e o teto de 6s cobre o resto.
  useEffect(() => {
    if (!appsLoaded || eventos === null) return
    const urls = [
      ...allApps.map(a => a.icon).filter((u): u is string => !!u),
      ...eventos.map(e => e.coverUrl).filter((u): u is string => !!u),
    ]
    if (urls.length === 0) { setImagensProntas(true); return }
    let vivo = true
    const carrega = (u: string) => new Promise<void>(res => {
      const img = new Image()
      img.onload = () => res()
      img.onerror = () => res()
      img.src = u
    })
    Promise.all(urls.map(carrega)).then(() => { if (vivo) setImagensProntas(true) })
    return () => { vivo = false }
  }, [appsLoaded, eventos, allApps])

  // Gate da revelação única (racional no bloco "Revelação única da Home").
  const homeReady = minHold &&
    (tetoEstourado || (appsLoaded && favsLoaded && comunicados !== null && eventos !== null && imagensProntas))

  // Retorno automático pro app satélite que mandou o usuário de volta pro hub
  // (?return_to=<url>) — hoje é só fallback: o satélite renova o próprio access
  // pelo cookie que o exchange-code deixa na origem dele, então só cai aqui
  // quando nem o refresh vale mais (inatividade longa, sessão revogada) ou
  // quando ele nunca teve token (F5 direto no domínio do app). Sem isso, o
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
  const hasEventos = allApps.some(a => a.id === 'eventos')
  const hasManuais = allApps.some(a => a.id === 'manuais')
  const hasObras = allApps.some(a => a.id === 'obras')
  const hasRamais = allApps.some(a => a.id === 'contatos')

  // Dados pra busca global (ver searchResults) — só busca pra quem tem
  // acesso, mesmo critério de hasObras/hasRamais acima.
  useEffect(() => {
    if (!hasObras) return
    fetchObras().then(list => { if (list && list.length) setObrasSearch(list) })
  }, [hasObras])
  useEffect(() => {
    if (!hasRamais) return
    fetchDiretorio().then(setContatosSearch).catch(() => {})
  }, [hasRamais])

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
      eventos: hasEventos,
    }
    if (page.name in precisaDe && !precisaDe[page.name]) setPage({ name: 'home' })
  }, [appsLoaded, page.name, hasComunicados, hasManuais, hasObras, hasRamais, hasEventos])

  // Handoff SSO (Fase 1, interina): navega pro satélite já autenticado via
  // code de curta duração — na MESMA aba, pra experiência de portal único
  // (o menu do app "substitui" o do hub, cascata contínua). Navegar a aba
  // atual não sofre bloqueio de pop-up, então não precisa mais do
  // window.open('', '_blank') síncrono que existia aqui antes. Reutilizado
  // por qualquer app/atalho com SSO, esteja ele no catálogo (apps[]) ou
  // seja um atalho estático (ex.: Agendas).
  // Apps cujo front já tem o /refresh-no-boot DEPLOYADO (Fase 2 do plano de
  // sessão compartilhada): navegação direta, a sessão entra pelo refresh
  // cookie de `.extoapp.com.br` — sem satellite-code, sem `?code=` na URL.
  // Quem não está aqui segue no handoff por code (agenda, contratações e
  // fronts ainda não confirmados em produção): falha segura — o pior caso é
  // continuar como hoje. ponytail: allowlist manual; cresce a cada front
  // confirmado e morre inteira na Fase 4 (quando todo front for cookie-only).
  const COOKIE_NAV_APPS = new Set([
    'controle-recepcao', 'solicitacoes', 'painel-admin', 'frota',
    'ad-forn-ctts', 'ctrl-estoque', 'extosign', 'listjur',
  ])

  const openViaSatelliteHandoff = async (appSlug: string, url: string) => {
    const code = await getSatelliteCode(appSlug)
    if (!code) {
      // apiFetch já tentou renovar o access e falhou — sessão está morta.
      // Não navega pro satélite sem code; volta pro login (fluxo já existente).
      onSessionExpired()
      return
    }
    window.location.href = `${url}${url.includes('?') ? '&' : '?'}code=${encodeURIComponent(code)}`
  }

  // Aceita tanto o nome (launcher/sidebar) quanto o slug (ex.: notificação
  // do sino traz `app` = slug do catálogo, não o nome de exibição).
  const openApp = async (nameOrSlug: string) => {
    const app = apps.find(a => a.name === nameOrSlug || a.id === nameOrSlug)
    if (!app?.url) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      setToast(nameOrSlug)
      toastTimerRef.current = setTimeout(() => setToast(null), 2200)
      return
    }

    if (app.ssoEnabled) {
      if (COOKIE_NAV_APPS.has(app.id)) {
        window.location.href = app.url
        return
      }
      await openViaSatelliteHandoff(app.id, app.url)
      return
    }

    // App externo (fora de *.extoapp.com.br, ex.: Mega ERP): abre em ABA
    // NOVA — é só um direcionamento, o portal continua onde estava. Apps
    // internos sem SSO seguem na mesma aba (portal unificado). window.open
    // aqui é síncrono com o clique (nenhum await antes), sem popup-blocker.
    const hostname = (() => { try { return new URL(app.url).hostname } catch { return '' } })()
    const interno = hostname === 'extoapp.com.br' || hostname.endsWith('.extoapp.com.br')
    if (!interno) {
      window.open(app.url, '_blank', 'noopener,noreferrer')
      return
    }

    window.location.href = app.url
  }

  const openAgenda = () => openViaSatelliteHandoff('agenda-publica', 'https://agenda.extoapp.com.br')
  // painel-admin está na COOKIE_NAV_APPS — entra pelo cookie compartilhado.
  const openPainelAdmin = () => { window.location.href = 'https://adm.extoapp.com.br' }

  const toggleFav = (id: string) => {
    const eraFav = favs.includes(id)
    setFavs(prev => eraFav ? prev.filter(f => f !== id) : [...prev, id])
    const ok = eraFav ? removeFavorito(id) : addFavorito(id)
    ok.then(sucesso => {
      if (sucesso) return
      // reverte se a API recusou (ex.: sessão expirada) — evita favorito
      // "fantasma" que volta assim que a página recarregar.
      setFavs(prev => eraFav ? [...prev, id] : prev.filter(f => f !== id))
    })
  }

  // Busca do Header é só pro dropdown de resultados (ver searchResults) —
  // não filtra a tela do Início, que fica sempre igual enquanto se digita.
  const q = query.trim().toLowerCase()

  const groups = agruparPorCategoria(apps.filter(a => activeCat === 'all' || a.cat === activeCat), categorias)
    .map(g => ({ cat: g.slug, label: g.nome, apps: g.apps }))

  const showExtras = activeCat === 'all'
  const favApps = apps.filter(a => favs.includes(a.id))
  const recentApps = RECENT_IDS.map(id => apps.find(a => a.id === id)!).filter(Boolean)
  const isEmpty = groups.length === 0

  // Busca global do Header — varre apps/comunicados/contatos/obras (não só
  // o grid de apps) e monta um resultado único por item, com o `type` que o
  // Header usa pra desenhar a tag à esquerda. Cap de 8 por categoria: lista
  // é só um atalho rápido, não uma tela de resultados completa.
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!q) return []
    const out: SearchResult[] = []

    apps
      .filter(a => a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q))
      .slice(0, 8)
      .forEach(a => out.push({
        type: 'app', id: `app:${a.id}`, title: a.name, subtitle: a.desc,
        onSelect: () => openApp(a.name),
      }))

    ;(comunicados ?? [])
      .filter(c => c.title.toLowerCase().includes(q) || (c.numero ?? '').toLowerCase().includes(q))
      .slice(0, 8)
      .forEach(c => out.push({
        type: 'comunicado', id: `comunicado:${c.id}`, title: c.title, subtitle: c.date,
        onSelect: () => setPage({ name: 'comunicados', id: c.id }),
      }))

    contatosSearch
      .filter(p =>
        p.nome.toLowerCase().includes(q) || p.cargo.toLowerCase().includes(q) ||
        p.departamento.toLowerCase().includes(q) || p.ramal.includes(q))
      .slice(0, 8)
      .forEach(p => out.push({
        type: 'contato', id: `contato:${p.id}`, title: p.nome, subtitle: p.cargo || p.departamento,
        onSelect: () => setPage({ name: 'ramais', openContatoId: p.id }),
      }))

    obrasSearch
      .filter(o =>
        o.nome.toLowerCase().includes(q) || o.numero.toLowerCase().includes(q) ||
        o.organizacao.toLowerCase().includes(q))
      .slice(0, 8)
      .forEach(o => out.push({
        type: 'obra', id: `obra:${obraRowKey(o)}`, title: o.nome, subtitle: o.organizacao,
        onSelect: () => setPage({ name: 'obras', openKey: obraRowKey(o) }),
      }))

    return out
  }, [q, apps, comunicados, contatosSearch, obrasSearch])

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
        categorias={categorias}
        onSetCat={setActiveCat}
        onOpenApp={openApp}
        onClose={() => setMenuOpen(false)}
        onLogout={onLogout}
        onOpenProfile={() => setPage({ name: 'profile' })}
        isProfileActive={page.name === 'profile'}
        onGoHome={() => setPage({ name: 'home' })}
        showPainelAdmin={hasPainelAdmin}
        onOpenPainelAdmin={openPainelAdmin}
        onExpandedChange={setSidebarExpanded}
      />

      {/* Sidebar agora é fixed (flutuante) e recolhe sozinha — este espaçamento
          reserva a faixa de ícones pra ela nunca sobrepor o conteúdo. Quando a
          sidebar expande (hover ou pin), o padding acompanha em sincronia (mesma
          duração/easing da transição de largura do <aside>) pra nunca sobrepor
          o conteúdo da página. */}
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{
          paddingLeft: isNarrow ? 0 : (sidebarExpanded ? SIDEBAR_EXPANDED_W + 24 : SIDEBAR_COLLAPSED_W + 24),
          transition: 'padding-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Header
          query={query}
          isNarrow={isNarrow}
          onSearch={setQuery}
          onOpenMenu={() => setMenuOpen(true)}
          onOpenApp={openApp}
          searchResults={searchResults}
          onSelectSearchResult={r => { r.onSelect(); setQuery('') }}
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
          {page.name === 'eventos' && hasEventos && (
            <div className="flex-1 overflow-hidden bg-bg-app">
              <EventosPage
                initialId={page.id}
                onBack={() => setPage({ name: 'home' })}
                user={user}
                onEventosChange={setEventos}
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
              <ObrasPage onBack={() => setPage({ name: 'home' })} canManage={canManageObras} initialSelectKey={page.openKey} />
            </div>
          )}
          {page.name === 'ramais' && hasRamais && (
            <div className="flex-1 overflow-hidden bg-bg-app">
              <RamaisPage onBack={() => setPage({ name: 'home' })} initialContatoId={page.openContatoId} />
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

            {!homeReady ? (
              /* Revelação única: as MESMAS barras da transição de app (não a
                 Lottie das bibliotecas de documento) enquanto TODOS os fetches
                 da home resolvem, em vez de cada seção pipocar na sua vez. */
              <div className="flex items-center justify-center" style={{ minHeight: '55vh' }}>
                <LoadingBars />
              </div>
            ) : (
            <>
            {showExtras && hasComunicados && (
              <Banner itens={comunicadosBanner} onRead={(id) => setPage({ name: 'comunicados', id })} />
            )}

            {/* Sem evento futuro cadastrado, a seção inteira some — mesmo
                contrato do Banner de Comunicados acima. */}
            {showExtras && hasEventos && (
              <EventosBanner
                itens={eventosBanner}
                onRsvp={handleRsvpBanner}
                onOpen={(id) => setPage({ name: 'eventos', id })}
              />
            )}

            {showExtras && (
              <RecentShortcuts
                apps={recentApps}
                onOpen={openApp}
                onOpenComunicados={() => setPage({ name: 'comunicados', id: COMUNICADOS[0].id })}
                onOpenEventos={() => setPage({ name: 'eventos' })}
                onOpenManuais={() => setPage({ name: 'manuais', id: MANUAIS[0].id })}
                onOpenAgenda={openAgenda}
                onOpenObras={() => setPage({ name: 'obras' })}
                onOpenRamais={() => setPage({ name: 'ramais' })}
                showAgenda={hasAgenda}
                showComunicados={hasComunicados}
                showEventos={hasEventos}
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
            </>
            )}
          </div>
          </main>

          {!isNarrow && page.name === 'home' && <RightPanel />}
        </div>
      </div>

      {toast && <Toast appName={toast} />}
    </div>
  )
}
