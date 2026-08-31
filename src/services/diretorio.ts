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

// Mock só pro bypass de dev (mesma lógica do DEV_BYPASS_USER do App.tsx):
// sem token real a API devolve 401 e a tela mostraria só o erro. Tamanhos
// variados de propósito, pra dar pra ver a ordenação por nº de integrantes.
const MOCK_DEPTOS: [string, number][] = [
  ['Guarita', 1], ['Presidência', 2], ['T.I', 2], ['GR8', 3],
  ['Casa Viva', 4], ['Jurídico', 4], ['Novos Negócios', 5], ['Suprimentos', 7],
  ['Marketing', 8], ['Administração', 8], ['Engenharia', 10], ['Comercial', 12],
]
const MOCK_CARGOS = ['Diretor', 'Gerente', 'Coordenador', 'Analista', 'Assistente']
const MOCK_DIRETORIO: ContatoPessoa[] = MOCK_DEPTOS.flatMap(([departamento, n], di) =>
  Array.from({ length: n }, (_, i): ContatoPessoa => ({
    id: `dev-${di}-${i}`,
    nome: `Colaborador ${di + 1}.${i + 1}`,
    cargo: MOCK_CARGOS[i % MOCK_CARGOS.length],
    ramal: String(1000 + di * 20 + i),
    email: `colab${di}${i}@exto.com.br`,
    celular: '',
    departamento,
    foto: null,
  })),
)

export async function fetchDiretorio(): Promise<ContatoPessoa[]> {
  const res = await apiFetch('/parties/diretorio/')
  if (!res.ok) {
    if (import.meta.env.DEV) return MOCK_DIRETORIO
    throw new Error('Falha ao carregar diretório de contatos.')
  }
  const data: RawContato[] = await res.json()
  return data.map(mapContato)
}
