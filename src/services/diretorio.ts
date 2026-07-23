// Diretório de contatos (card "Contatos" em Informações Úteis). Consome
// GET /api/parties/diretorio/ (nexus) — dado real do Colaborador, atrás da
// capability `contatos:view` (ver parties/permissions.py::HasContatosAccess).

import { apiFetch } from './api'

export interface ContatoPessoa {
  id: string
  nome: string
  cargo: string
  ramal: string
  email: string
  celular: string
  departamento: string
  foto: string | null
}

interface RawContato {
  id: string
  full_name: string
  nome_inter: string
  ramal: string
  email_corp: string
  phone_number_corp: string
  departamento: { id: string; nome: string } | null
  cargo: { id: string; nome: string } | null
  photo_url: string | null
}

const SEM_DEPARTAMENTO = 'Sem departamento'

function mapContato(raw: RawContato): ContatoPessoa {
  return {
    id: raw.id,
    // Nome interno é o preferido no diretório — nome completo só como
    // fallback pra quem ainda não tem nome interno cadastrado.
    nome: raw.nome_inter.trim() || raw.full_name,
    cargo: raw.cargo?.nome ?? '',
    ramal: raw.ramal,
    email: raw.email_corp,
    celular: raw.phone_number_corp,
    departamento: raw.departamento?.nome ?? SEM_DEPARTAMENTO,
    foto: raw.photo_url,
  }
}

export async function fetchDiretorio(): Promise<ContatoPessoa[]> {
  const res = await apiFetch('/parties/diretorio/')
  if (!res.ok) throw new Error('Falha ao carregar diretório de contatos.')
  const data: RawContato[] = await res.json()
  return data.map(mapContato)
}
