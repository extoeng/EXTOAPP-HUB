import type { App, Categoria } from '../types'

// Catálogo esvaziado de propósito — modelo sendo reconstruído do zero,
// apps voltam um a um conforme forem recriados no catálogo real (API).
export const APPS: App[] = []

// Categorias do menu vêm de GET /apps/categorias (CRUD no painel-admin).
// Este espelho é só fallback se a chamada falhar — mesmo conteúdo do seed
// da migration catalog/0022 da API.
export const CATEGORIAS_FALLBACK: Categoria[] = [
  { slug: 'geral', nome: 'Geral', icone: 'layout-grid', ordem: 0 },
  { slug: 'rh', nome: 'RH & Pessoas', icone: 'users', ordem: 1 },
  { slug: 'admin', nome: 'Administração', icone: 'briefcase', ordem: 2 },
  { slug: 'obras', nome: 'Obras', icone: 'hard-hat', ordem: 3 },
  { slug: 'fin', nome: 'Financeiro', icone: 'wallet', ordem: 4 },
  { slug: 'ti', nome: 'Suporte & TI', icone: 'monitor', ordem: 5 },
  { slug: 'juridico', nome: 'Jurídico', icone: 'scale', ordem: 6 },
]

/** Categorias presentes em `apps`, na ordem do cadastro. Slug desconhecido
 *  (categoria apagada/renomeada) não some: vira grupo com o slug cru. */
export function agruparPorCategoria<T extends { cat: string }>(apps: T[], categorias: Categoria[]) {
  const info = (slug: string): Categoria =>
    categorias.find(c => c.slug === slug) ?? { slug, nome: slug, icone: 'layout-grid', ordem: 999 }
  return [...new Set(apps.map(a => a.cat))]
    .map(slug => ({ ...info(slug), apps: apps.filter(a => a.cat === slug) }))
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))
}

export const RECENT_IDS: string[] = []
export const DEFAULT_FAVS: string[] = []
