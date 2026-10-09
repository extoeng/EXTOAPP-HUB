import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Link2, Loader2, Mail, Phone, Repeat, Search, Trash2 } from 'lucide-react'
import { buscarColaboradores, type ColaboradorBusca, type EquipeMembro } from '../../services/obras'
import { inputCls } from './util'

const MIN_LETRAS = 2

function BotaoIcone({ onClick, title, Icon, disabled }: { onClick: () => void; title: string; Icon: React.ElementType; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} disabled={disabled}
      className="inline-flex items-center justify-center w-[34px] h-[34px] rounded-[8px] border-none bg-transparent cursor-pointer text-text-faint hover:text-accent hover:bg-tile-bg disabled:opacity-30 disabled:cursor-default">
      <Icon size={15} />
    </button>
  )
}

/** Busca colaboradores (RH) por nome ou e-mail; escolher um preenche a pessoa. */
function BuscaColaborador({ onEscolher, onCancelar }: { onEscolher: (c: ColaboradorBusca) => void; onCancelar?: () => void }) {
  const [q, setQ] = useState('')
  const [resultados, setResultados] = useState<ColaboradorBusca[]>([])
  const [buscando, setBuscando] = useState(false)
  const pedido = useRef(0)
  const termo = q.trim()
  const valido = termo.length >= MIN_LETRAS

  useEffect(() => {
    if (!valido) return
    const meu = ++pedido.current
    const t = setTimeout(async () => {
      setBuscando(true)
      const r = await buscarColaboradores(termo)
      if (meu !== pedido.current) return  // chegou uma busca mais nova
      setResultados(r)
      setBuscando(false)
    }, 250)
    return () => clearTimeout(t)
  }, [termo, valido])

  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center gap-[6px]">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-[11px] top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
          <input className={`${inputCls} pl-[33px]`} value={q} onChange={e => setQ(e.target.value)} autoFocus
            placeholder="Buscar colaborador por nome ou e-mail" aria-label="Buscar colaborador" maxLength={80} />
          {buscando && <Loader2 size={15} className="absolute right-[11px] top-1/2 -translate-y-1/2 animate-spin text-text-faint" />}
        </div>
        {onCancelar && (
          <button type="button" onClick={onCancelar}
            className="font-hanken text-[12.5px] text-text-muted hover:text-ink bg-transparent border-none cursor-pointer px-[6px] min-h-[38px]">
            Cancelar
          </button>
        )}
      </div>
      {valido && !buscando && resultados.length === 0 && (
        <div className="font-hanken text-[12.5px] text-text-faint px-[4px]">Nenhum colaborador ativo encontrado.</div>
      )}
      {valido && resultados.length > 0 && (
        <ul className="m-0 p-0 list-none rounded-[10px] border border-border bg-surface max-h-[220px] overflow-y-auto">
          {resultados.map(c => (
            <li key={c.colaborador_id}>
              <button type="button" onClick={() => onEscolher(c)}
                className="w-full text-left bg-transparent border-none cursor-pointer px-[12px] py-[8px] hover:bg-tile-bg flex flex-col gap-[1px]">
                <span className="font-hanken font-medium text-[13.5px] text-ink">{c.nome}</span>
                <span className="font-hanken text-[12px] text-text-muted truncate">
                  {[c.cargo, c.email, c.telefone].filter(Boolean).join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {!valido && <div className="font-hanken text-[12px] text-text-faint px-[4px]">Digite ao menos {MIN_LETRAS} letras.</div>}
    </div>
  )
}

/** Uma pessoa da equipe: colaborador escolhido da lista (dados só leitura) +
 *  função na obra (única coisa editável). */
export function EquipeMembroCampo({ indice, total, membro, onChange, onMover, onRemover }: {
  indice: number
  total: number
  membro: EquipeMembro
  onChange: (patch: Partial<EquipeMembro>) => void
  onMover: (direcao: -1 | 1) => void
  onRemover: () => void
}) {
  const vazio = !membro.colaborador_id && !membro.nome
  const [trocando, setTrocando] = useState(false)
  const escolhendo = vazio || trocando
  const antigo = !membro.colaborador_id && !!membro.nome

  const escolher = (c: ColaboradorBusca) => {
    // Ao trocar de pessoa a função na obra continua a que estava, se já houver uma.
    onChange({ colaborador_id: c.colaborador_id, nome: c.nome, email: c.email, telefone: c.telefone, cargo: membro.cargo || c.cargo })
    setTrocando(false)
  }

  return (
    <div className="rounded-[12px] bg-tile-bg/60 p-[10px] sm:p-[12px] flex flex-col gap-[8px]">
      <div className="flex items-center gap-[4px]">
        <span className="flex-1 font-hanken font-semibold text-[12px] text-label">Pessoa {indice + 1}</span>
        <BotaoIcone onClick={() => onMover(-1)} title="Subir" Icon={ArrowUp} disabled={indice === 0} />
        <BotaoIcone onClick={() => onMover(1)} title="Descer" Icon={ArrowDown} disabled={indice === total - 1} />
        <BotaoIcone onClick={onRemover} title="Remover da equipe" Icon={Trash2} />
      </div>

      {escolhendo ? (
        <BuscaColaborador onEscolher={escolher} onCancelar={vazio ? undefined : () => setTrocando(false)} />
      ) : (
        <>
          <div className="flex items-start gap-[8px]">
            <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
              <span className="font-hanken font-semibold text-[14px] text-ink break-words">{membro.nome}</span>
              <span className="font-hanken text-[12.5px] text-text-muted inline-flex items-center gap-[6px] min-w-0">
                <Mail size={12} className="flex-shrink-0" /><span className="truncate">{membro.email || 'Sem e-mail no cadastro'}</span>
              </span>
              <span className="font-hanken text-[12.5px] text-text-muted inline-flex items-center gap-[6px]">
                <Phone size={12} className="flex-shrink-0" />{membro.telefone || 'Sem telefone no cadastro'}
              </span>
            </div>
            <button type="button" onClick={() => setTrocando(true)}
              className="flex-shrink-0 inline-flex items-center gap-[5px] font-hanken text-[12.5px] text-accent bg-transparent border-none cursor-pointer px-[6px] min-h-[34px]">
              {antigo ? <Link2 size={13} /> : <Repeat size={13} />}{antigo ? 'Vincular' : 'Trocar'}
            </button>
          </div>
          {antigo && (
            <div className="font-hanken text-[12px] text-text-faint">
              Texto vindo da planilha, sem vínculo com o cadastro de colaboradores. Use "Vincular" pra puxar os dados do RH.
            </div>
          )}
          <input className={inputCls} list="obras-cargos" value={membro.cargo} onChange={e => onChange({ cargo: e.target.value })}
            placeholder="Função na obra (ex.: Engº Resid.)" aria-label="Função na obra" maxLength={80} />
        </>
      )}
    </div>
  )
}
