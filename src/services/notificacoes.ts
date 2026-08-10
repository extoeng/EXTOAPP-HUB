import { apiFetch } from './api'

export interface Notificacao {
  id: number
  tipo: string
  titulo: string
  mensagem: string
  app: string
  lida_em: string | null
  criado_em: string
}

/** 50 mais recentes do usuário logado, decrescente. */
export async function fetchNotificacoes(): Promise<Notificacao[] | null> {
  const res = await apiFetch('/notificacoes/minhas/')
  if (!res.ok) return null
  return res.json()
}

export async function marcarNotificacaoLida(id: number): Promise<Notificacao | null> {
  const res = await apiFetch(`/notificacoes/minhas/${id}/lida/`, { method: 'POST' })
  if (!res.ok) return null
  return res.json()
}

export async function marcarTodasNotificacoesLidas(): Promise<boolean> {
  const res = await apiFetch('/notificacoes/minhas/ler-todas/', { method: 'POST' })
  return res.ok
}
