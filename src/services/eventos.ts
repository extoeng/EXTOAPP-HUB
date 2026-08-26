import type { Evento } from '../types'
import { apiFetch } from './api'

/** Lista aberta a qualquer usuário autenticado — shape já é Evento puro. */
export async function fetchEventos(): Promise<Evento[] | null> {
  const res = await apiFetch('/eventos/')
  if (!res.ok) return null
  const data = await res.json()
  return Array.isArray(data) ? data : (data.results ?? [])
}

export interface EventoInput {
  tipo: string
  titulo: string
  descricao?: string
  /** ISO local "YYYY-MM-DDTHH:mm" (input datetime-local) — o backend guarda com TZ. */
  inicioISO: string
  local?: string
  rsvpEnabled?: boolean
  capa?: File | null
}

function toForm(input: Partial<EventoInput>): FormData {
  const form = new FormData()
  if (input.tipo !== undefined) form.append('tipo', input.tipo)
  if (input.titulo !== undefined) form.append('titulo', input.titulo)
  if (input.descricao !== undefined) form.append('descricao', input.descricao)
  if (input.inicioISO !== undefined) form.append('inicio', input.inicioISO)
  if (input.local !== undefined) form.append('local', input.local)
  if (input.rsvpEnabled !== undefined) form.append('rsvp_habilitado', String(input.rsvpEnabled))
  if (input.capa) form.append('capa', input.capa)
  return form
}

/** Exige capability 'manage' no app 'eventos' — 403 se não tiver. */
export async function createEvento(input: EventoInput): Promise<Evento | null> {
  const res = await apiFetch('/eventos/', { method: 'POST', body: toForm(input) })
  if (!res.ok) return null
  return await res.json()
}

/** Exige 'manage'. Campos omitidos ficam como estão; capa nova substitui a antiga. */
export async function updateEvento(id: number, input: Partial<EventoInput>): Promise<Evento | null> {
  const res = await apiFetch(`/eventos/${id}/`, { method: 'PATCH', body: toForm(input) })
  if (!res.ok) return null
  return await res.json()
}

/** Exige 'manage'. Remove também a capa do bucket (lado do backend). */
export async function deleteEvento(id: number): Promise<boolean> {
  const res = await apiFetch(`/eventos/${id}/`, { method: 'DELETE' })
  return res.ok
}

/** Confirma (true) ou desconfirma (false) presença — aberto a qualquer
 *  autenticado; 400 se o evento não aceita RSVP. */
export async function setRsvp(id: number, confirmar: boolean): Promise<Evento | null> {
  const res = await apiFetch(`/eventos/${id}/rsvp/`, { method: confirmar ? 'POST' : 'DELETE' })
  if (!res.ok) return null
  return await res.json()
}
