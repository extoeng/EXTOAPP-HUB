import { useMemo, useState } from 'react'
import {
  X, Save, Plus, Trash2, Building2, FileText, MapPin, Phone, Users, StickyNote, LayoutGrid,
} from 'lucide-react'
import { atualizarObra, criarObra, mensagemErro, type EquipeMembro, type ErrosApi, type Obra, type ObraDados } from '../../services/obras'
import { ABAS_CONHECIDAS, inputCls, rotuloAba } from './util'
import { EquipeMembroCampo } from './EquipeMembroCampo'
import { Botao, ErroCampo, QuemPodeVer, Rotulo, SectionTitle } from './ui'

const CARGOS_SUGERIDOS = ['Gerente', 'Engº Coord.', 'Engº Resid.', 'Administr.', 'Estagiário', 'Técnico de Segurança']

export interface Sugestoes { abas: string[]; categorias: string[]; cargos: string[] }

function Campo({ rotulo, obrigatorio, erro, children, className = '' }: {
  rotulo: string; obrigatorio?: boolean; erro?: string; children: React.ReactNode; className?: string
}) {
  return (
    <label className={`flex flex-col gap-[5px] min-w-0 ${className}`}>
      <Rotulo obrigatorio={obrigatorio}>{rotulo}</Rotulo>
      {children}
      <ErroCampo erro={erro} />
    </label>
  )
}

function Bloco({ Icon, titulo, children }: { Icon: React.ElementType; titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[14px] border border-border p-[14px] sm:p-[16px] flex flex-col gap-[12px]">
      <SectionTitle Icon={Icon}>{titulo}</SectionTitle>
      {children}
    </section>
  )
}

function BotaoIcone({ onClick, title, Icon, disabled }: { onClick: () => void; title: string; Icon: React.ElementType; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} disabled={disabled}
      className="inline-flex items-center justify-center w-[34px] h-[34px] rounded-[8px] border-none bg-transparent cursor-pointer text-text-faint hover:text-accent hover:bg-tile-bg disabled:opacity-30 disabled:cursor-default">
      <Icon size={15} />
    </button>
  )
}

function erroDe(erros: ErrosApi, campo: string): string | undefined {
  const e = erros[campo]
  if (!e) return undefined
  return Array.isArray(e) ? (typeof e[0] === 'string' ? e[0] : 'Valor inválido.') : String(e)
}

export function ObraForm({ obraId, inicial, sugestoes, onCancel, onSalvo }: {
  /** Sem id = obra nova. */
  obraId?: string
  inicial: ObraDados
  sugestoes: Sugestoes
  onCancel: () => void
  onSalvo: (obra: Obra, criada: boolean) => void
}) {
  const [f, setF] = useState<ObraDados>(inicial)
  const [salvando, setSalvando] = useState(false)
  const [erros, setErros] = useState<ErrosApi>({})
  const set = (patch: Partial<ObraDados>) => setF(prev => ({ ...prev, ...patch }))
  const alterado = useMemo(() => JSON.stringify(f) !== JSON.stringify(inicial), [f, inicial])

  const abas = useMemo(() => {
    const todas = [...ABAS_CONHECIDAS.map(a => a.valor), ...sugestoes.abas]
    return [...new Set(todas.filter(Boolean))]
  }, [sugestoes.abas])
  const cargos = useMemo(() => [...new Set([...CARGOS_SUGERIDOS, ...sugestoes.cargos].filter(Boolean))], [sugestoes.cargos])

  const setTel = (i: number, v: string) => set({ telefones: f.telefones.map((t, j) => (j === i ? v : t)) })
  const setMembro = (i: number, patch: Partial<EquipeMembro>) =>
    set({ equipe: f.equipe.map((m, j) => (j === i ? { ...m, ...patch } : m)) })
  const moverMembro = (i: number, d: -1 | 1) => {
    const n = [...f.equipe]
    ;[n[i], n[i + d]] = [n[i + d], n[i]]
    set({ equipe: n })
  }

  function cancelar() {
    if (alterado && !window.confirm('Descartar as alterações não salvas?')) return
    onCancel()
  }

  async function salvar(e?: React.FormEvent) {
    e?.preventDefault()
    if (!f.nome.trim()) { setErros({ nome: ['Informe o nome da obra.'] }); return }
    setErros({}); setSalvando(true)
    const r = obraId ? await atualizarObra(obraId, f) : await criarObra(f)
    setSalvando(false)
    if (!r.ok) { setErros(r.erros); return }
    onSalvo(r.data, !obraId)
  }

  const erroGeral = erros.detail || erros.non_field_errors
    ? mensagemErro(erros)
    : Object.keys(erros).length > 0 ? 'Confira os campos destacados.' : null

  return (
    <form onSubmit={salvar} className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-[12px] px-[18px] sm:px-[26px] pt-[max(14px,env(safe-area-inset-top))] pb-[14px] border-b border-border flex-shrink-0">
        <div className="flex-1 min-w-0">
          <div className="font-hanken text-[11.5px] text-text-faint uppercase tracking-[0.05em]">{obraId ? 'Editando obra' : 'Nova obra'}</div>
          <h2 className="m-0 font-archivo font-semibold text-[18px] text-ink truncate">{f.nome || 'Sem nome'}</h2>
        </div>
        <button type="button" onClick={cancelar} aria-label="Fechar"
          className="flex-shrink-0 inline-flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border-none bg-tile-bg cursor-pointer text-text-muted hover:text-ink">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-[14px] sm:px-[26px] py-[16px] flex flex-col gap-[14px]">
          <Bloco Icon={Building2} titulo="Identificação">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-[12px]">
              <Campo rotulo="Nome da obra / projeto" obrigatorio erro={erroDe(erros, 'nome')}>
                <input className={inputCls} value={f.nome} onChange={e => set({ nome: e.target.value })} autoFocus={!obraId} maxLength={200} />
              </Campo>
              <Campo rotulo="Nº" erro={erroDe(erros, 'numero')}>
                <input className={inputCls} value={f.numero} onChange={e => set({ numero: e.target.value })} inputMode="numeric" maxLength={20} />
              </Campo>
            </div>
            <Campo rotulo="Organização (razão social)" erro={erroDe(erros, 'organizacao')}>
              <input className={inputCls} value={f.organizacao} onChange={e => set({ organizacao: e.target.value })} maxLength={200} />
            </Campo>
          </Bloco>

          <Bloco Icon={LayoutGrid} titulo="Organização na tela">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
              <Campo rotulo="Aba" erro={erroDe(erros, 'aba')}>
                <input className={inputCls} list="obras-abas" value={f.aba} onChange={e => set({ aba: e.target.value })}
                  placeholder="Escolha ou digite uma nova" maxLength={120} />
                <datalist id="obras-abas">
                  {abas.map(a => <option key={a} value={a}>{rotuloAba(a)}</option>)}
                </datalist>
              </Campo>
              <Campo rotulo="Categoria (seção)" erro={erroDe(erros, 'categoria')}>
                <input className={inputCls} list="obras-categorias" value={f.categoria} onChange={e => set({ categoria: e.target.value })}
                  placeholder="Escolha ou digite uma nova" maxLength={120} />
                <datalist id="obras-categorias">
                  {sugestoes.categorias.map(c => <option key={c} value={c} />)}
                </datalist>
              </Campo>
            </div>
            <div className="flex flex-col gap-[5px]">
              <Rotulo>Quem pode ver</Rotulo>
              <QuemPodeVer valor={f} onChange={set} nome="obra" />
              <ErroCampo erro={erroDe(erros, 'visivel_padrao')} />
            </div>
            <label className="flex items-center gap-[10px] cursor-pointer select-none">
              <input type="checkbox" checked={f.ativo} onChange={e => set({ ativo: e.target.checked })} className="w-[18px] h-[18px] accent-[#B31C1C]" />
              <span className="font-hanken text-[13.5px] text-ink-soft">
                Ativa <span className="text-text-faint">— inativa fica oculta pra quem não é Administrador</span>
              </span>
            </label>
          </Bloco>

          <Bloco Icon={FileText} titulo="Documentos">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
              <Campo rotulo="CNPJ" erro={erroDe(erros, 'cnpj')}>
                <input className={inputCls} value={f.cnpj} onChange={e => set({ cnpj: e.target.value })} inputMode="numeric" placeholder="00.000.000/0000-00" maxLength={30} />
              </Campo>
              <Campo rotulo="CNO" erro={erroDe(erros, 'cno')}>
                <input className={inputCls} value={f.cno} onChange={e => set({ cno: e.target.value })} maxLength={30} />
              </Campo>
              <Campo rotulo="Inscrição estadual (IE)" erro={erroDe(erros, 'ie')}>
                <input className={inputCls} value={f.ie} onChange={e => set({ ie: e.target.value })} placeholder="ou Isenta" maxLength={30} />
              </Campo>
              <Campo rotulo="Inscrição municipal (IM)" erro={erroDe(erros, 'im')}>
                <input className={inputCls} value={f.im} onChange={e => set({ im: e.target.value })} maxLength={30} />
              </Campo>
            </div>
          </Bloco>

          <Bloco Icon={MapPin} titulo="Endereços">
            {([
              ['endereco_entrega', 'Entrega (local da obra)'],
              ['endereco_fatura', 'Fatura'],
              ['endereco_cobranca', 'Cobrança'],
            ] as const).map(([campo, rotulo]) => (
              <Campo key={campo} rotulo={rotulo} erro={erroDe(erros, campo)}>
                <textarea className={`${inputCls} resize-y min-h-[44px]`} rows={2} value={f[campo]} onChange={e => set({ [campo]: e.target.value })} maxLength={255} />
              </Campo>
            ))}
          </Bloco>

          <Bloco Icon={Phone} titulo="Contato da obra">
            <Campo rotulo="E-mail" erro={erroDe(erros, 'email')}>
              <input className={inputCls} type="email" inputMode="email" value={f.email} onChange={e => set({ email: e.target.value })} maxLength={254} />
            </Campo>
            <div className="flex flex-col gap-[6px]">
              <Rotulo>Telefones</Rotulo>
              {f.telefones.map((t, i) => (
                <div key={i} className="flex items-center gap-[6px]">
                  <input className={inputCls} type="tel" inputMode="tel" value={t} onChange={e => setTel(i, e.target.value)} placeholder="(11) 0000-0000" maxLength={60} />
                  <BotaoIcone onClick={() => set({ telefones: f.telefones.filter((_, j) => j !== i) })} title="Remover telefone" Icon={Trash2} />
                </div>
              ))}
              <ErroCampo erro={erroDe(erros, 'telefones')} />
              <Botao variante="fantasma" Icon={Plus} onClick={() => set({ telefones: [...f.telefones, ''] })} className="self-start text-accent px-[6px]">
                Adicionar telefone
              </Botao>
            </div>
          </Bloco>

          <Bloco Icon={Users} titulo={`Equipe${f.equipe.length ? ` (${f.equipe.length})` : ''}`}>
            {f.equipe.length === 0 && (
              <div className="rounded-[12px] border border-dashed border-border px-[14px] py-[14px] font-hanken text-[13px] text-text-faint text-center">
                Nenhuma pessoa na equipe. A equipe é escolhida entre os colaboradores cadastrados.
              </div>
            )}
            <datalist id="obras-cargos">{cargos.map(c => <option key={c} value={c} />)}</datalist>
            {f.equipe.map((m, i) => (
              <EquipeMembroCampo key={i} indice={i} total={f.equipe.length} membro={m}
                onChange={patch => setMembro(i, patch)} onMover={d => moverMembro(i, d)}
                onRemover={() => set({ equipe: f.equipe.filter((_, j) => j !== i) })} />
            ))}
            <ErroCampo erro={erroDe(erros, 'equipe') ? 'Confira a equipe: ' + erroDe(erros, 'equipe') : undefined} />
            <Botao variante="fantasma" Icon={Plus} className="self-start text-accent px-[6px]"
              onClick={() => set({ equipe: [...f.equipe, { colaborador_id: null, cargo: '', nome: '', telefone: '', email: '' }] })}>
              Adicionar pessoa
            </Botao>
          </Bloco>

          <Bloco Icon={StickyNote} titulo="Observações">
            <textarea className={`${inputCls} resize-y`} rows={3} value={f.observacoes} onChange={e => set({ observacoes: e.target.value })}
              placeholder="Informações extras (não vão pra planilha)" />
          </Bloco>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-border bg-surface px-[16px] sm:px-[26px] pt-[10px] pb-[max(10px,env(safe-area-inset-bottom))] flex flex-col gap-[8px]">
        {erroGeral && <div className="font-hanken text-[12.5px] text-accent bg-[rgba(179,28,28,0.08)] rounded-[9px] px-[12px] py-[8px]">{erroGeral}</div>}
        <div className="flex items-center gap-[8px]">
          <Botao onClick={cancelar} disabled={salvando} className="flex-1 sm:flex-none min-h-[44px] sm:min-h-[38px]">Cancelar</Botao>
          <Botao type="submit" variante="primario" Icon={Save} carregando={salvando} disabled={!alterado && !!obraId}
            className="flex-[2] sm:flex-none min-h-[44px] sm:min-h-[38px]">
            {obraId ? 'Salvar alterações' : 'Criar obra'}
          </Botao>
        </div>
      </div>
    </form>
  )
}
