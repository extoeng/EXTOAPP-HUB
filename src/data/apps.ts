import type { App, Category } from '../types'

export const APPS: App[] = [
  { id: 'ponto',     cat: 'rh',    name: 'Ponto Digital',           desc: 'Registre entradas, saídas e justifique ausências.' },
  { id: 'holerite',  cat: 'rh',    name: 'Holerite',                desc: 'Contracheques, informes de rendimento e 13º.',            badge: 'Novo informe',   badgeKind: 'accent' },
  { id: 'ferias',    cat: 'rh',    name: 'Férias & Benefícios',     desc: 'Solicite férias e gerencie seus benefícios.' },
  { id: 'obras',     cat: 'obras', name: 'Acompanhamento de Obras', desc: 'Cronograma, medições e avanço físico das obras.',          badge: 'Atualizado hoje', badgeKind: 'ok' },
  { id: 'diario',    cat: 'obras', name: 'Diário de Obra',          desc: 'Registros diários, clima e efetivo em campo.' },
  { id: 'frota',     cat: 'obras', name: 'Frota & Veículos',        desc: 'Reserve veículos e acompanhe manutenções.' },
  { id: 'reembolso', cat: 'fin',   name: 'Reembolsos',              desc: 'Lance despesas e adiantamentos de viagem.',               badge: '2 em análise',   badgeKind: 'warn' },
  { id: 'compras',   cat: 'fin',   name: 'Compras & Suprimentos',   desc: 'Requisições, cotações e ordens de compra.' },
  { id: 'chamados',  cat: 'ti',    name: 'Chamados TI',             desc: 'Abra e acompanhe tickets de suporte técnico.',            badge: '1 aberto',       badgeKind: 'accent' },
  { id: 'ged',       cat: 'ti',    name: 'Documentos (GED)',        desc: 'Contratos, projetos e arquivos da empresa.' },
]

export const CAT_LABELS: Record<Category, string> = {
  rh:    'RH & Pessoas',
  obras: 'Obras & Operações',
  fin:   'Financeiro',
  ti:    'Suporte & TI',
}

export const CAT_ORDER: Category[] = ['rh', 'obras', 'fin', 'ti']

export const RECENT_IDS = ['ponto', 'obras', 'holerite', 'chamados']
export const DEFAULT_FAVS = ['ponto', 'holerite', 'obras', 'reembolso']
