export type BadgeKind = 'ok' | 'warn' | 'accent'

export interface App {
  id: string
  cat: Category
  name: string
  desc: string
  badge?: string
  badgeKind?: BadgeKind
}

export type Category = 'rh' | 'obras' | 'fin' | 'ti'
export type ActiveCat = 'all' | Category

export interface AppState {
  query: string
  activeCat: ActiveCat
  favs: string[]
  menuOpen: boolean
  isNarrow: boolean
  toast: string | null
}
