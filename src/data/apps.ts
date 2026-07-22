import type { App, Category } from '../types'

// Catálogo esvaziado de propósito — modelo sendo reconstruído do zero,
// apps voltam um a um conforme forem recriados no catálogo real (API).
export const APPS: App[] = []

export const CAT_LABELS: Record<Category, string> = {
  geral:    'Geral',
  rh:       'RH & Pessoas',
  obras:    'Obras & Operações',
  fin:      'Financeiro',
  ti:       'Suporte & TI',
  juridico: 'Jurídico',
  admin:    'Administração',
}

export const CAT_ORDER: Category[] = ['geral', 'rh', 'obras', 'fin', 'ti', 'admin', 'juridico']

export const RECENT_IDS: string[] = []
export const DEFAULT_FAVS: string[] = []
