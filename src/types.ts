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

export type Category = 'rh' | 'obras' | 'fin' | 'ti' | 'geral' | 'juridico' | 'admin'
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
  pdfUrl?: string
}
