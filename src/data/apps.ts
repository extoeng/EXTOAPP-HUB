import type { App, Category } from '../types'

export const APPS: App[] = [
  { id: 'copa-exto',          cat: 'geral',    name: 'Copa Exto',            desc: 'Acompanhe a tabela, resultados e classificação da Copa Exto.', url: 'https://copa.extoapp.com.br', icon: '/copa-exto-icon.png' },
  { id: 'controle-recepcao', cat: 'geral',    name: 'Controle Recepção',    desc: 'Gerencie o fluxo de visitantes e registros da recepção.', url: 'https://extoapp-11650.web.app', icon: '/recepcao-icon.ico', ssoEnabled: true },
  { id: 'listjur',           cat: 'juridico', name: 'ListJur',              desc: 'Gestão e consulta de processos jurídicos internos.',       icon: '/listjur-icon.svg', url: 'https://extoapp-listjur.web.app', ssoEnabled: true },
  { id: 'listjur-gr8',       cat: 'juridico', name: 'ListJur GR8',          desc: 'Módulo GR8 de acompanhamento jurídico especializado.',      icon: '/listjur-icon.svg' },
  { id: 'carimbo-digital',   cat: 'admin',    name: 'Carimbo Digital',      desc: 'Assine e carimbe documentos digitalmente com validade.' },
  { id: 'ctrl-estoque',      cat: 'admin',    name: 'Controle de Estoque',  desc: 'Gerencie entradas, saídas e saldo de materiais e insumos.', icon: '/estoque-icon.svg', url: 'https://estoque.extoapp.com.br' },
  { id: 'ctrl-frotas',       cat: 'admin',    name: 'Controle de Frotas',   desc: 'Acompanhe veículos, manutenções e reservas da frota.', icon: '/frotas-icon.png' },
  { id: 'painel-admin',      cat: 'admin',    name: 'Painel Administrativo', desc: 'Gerencie usuários, auditoria e configurações do ecossistema Exto.', url: 'https://extoapp-painel-adm.web.app', icon: '/painel-admin-icon.png', ssoEnabled: true },
  { id: 'extoapp',           cat: 'admin',    name: 'ExtoApp',              desc: 'Abertura e acompanhamento de contratos e supply chain.',    icon: '/extoapp-icon.svg', url: 'https://extoapp-contratos.web.app', ssoEnabled: true },
]

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
