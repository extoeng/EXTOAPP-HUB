export type BadgeKind = 'ok' | 'warn' | 'accent'

export interface App {
  id: string
  cat: Category
  name: string
  desc: string
  badge?: string
  badgeKind?: BadgeKind
  url?: string
  icon?: string
  ssoEnabled?: boolean
}

// Slug de uma categoria do menu — CRUD no painel-admin (Gestão de Módulos ›
// Categorias), lida via GET /apps/categorias. Não é mais união fixa.
export type Category = string

export interface Categoria {
  slug: string
  nome: string
  /** Nome lucide em kebab-case — resolvido por lib/iconesCategoria. */
  icone: string
  ordem: number
}
export type ActiveCat = 'all' | Category

export interface AppState {
  query: string
  activeCat: ActiveCat
  favs: string[]
  menuOpen: boolean
  isNarrow: boolean
  toast: string | null
}

/** Item de uma biblioteca de documentos (Comunicados, Manuais...). */
export interface LibraryDoc {
  id: number
  date: string
  dateISO: string
  title: string
  desc: string
  /** Número do comunicado (só usado no tipo "comunicado"). */
  numero?: string
  pdfUrl?: string
  /** Marcado manualmente pra aparecer no card da home (ver Banner.tsx). */
  destaque?: boolean
}

/** Evento interno do HUB (banner na home + tela Eventos) — shape vindo
 *  pronto de GET /api/eventos/ (eventos/serializers.py do NEXUS). */
export interface Evento {
  id: number
  /** Rótulo livre da pill (Confraternização, Treinamento...). */
  tipo: string
  title: string
  desc: string
  /** Data/hora do evento em ISO com timezone. */
  inicioISO: string
  local: string
  coverUrl: string | null
  /** false = evento informativo, sem botão de confirmar presença. */
  rsvpEnabled: boolean
  /** O usuário logado já confirmou presença. */
  confirmado: boolean
}

/** Um resultado da busca global do Header (ver App.tsx `searchResults`). */
export interface SearchResult {
  type: 'app' | 'comunicado' | 'contato' | 'obra'
  id: string
  title: string
  subtitle?: string
  onSelect: () => void
}
