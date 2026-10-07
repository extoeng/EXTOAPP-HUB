// "Abas e categorias" (só `manage`): renomeia grupos e escolhe a ordem das abas.
// Renomear vale pra TODAS as obras do grupo (a categoria, em todas as abas) e
// grava na hora; se o nome novo já existe, os dois grupos se juntam. A ordem
// das abas fica num rascunho local e só grava em "Salvar ordem".
import { useState } from 'react'
import { ArrowUp, ArrowDown, Pencil, Check, X, Save } from 'lucide-react'
import { categoriaMeta, inputCls, rotuloAba } from './util'
import { Botao, Modal } from './ui'

type Tipo = 'aba' | 'categoria'

interface Props {
  /** Abas na ordem atual da tela. */
  abas: string[]
  contagemAbas: Map<string, number>
  categorias: { nome: string; qtd: number }[]
  onClose: () => void
  /** Devolvem a mensagem de erro, ou null se deu certo. */
  onRenomear: (tipo: Tipo, de: string, para: string) => Promise<string | null>
  onSalvarOrdem: (abas: string[]) => Promise<string | null>
}

function BotaoIcone({ onClick, title, Icon, disabled }: { onClick: () => void; title: string; Icon: React.ElementType; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} disabled={disabled}
      className="inline-flex items-center justify-center w-[34px] h-[34px] rounded-[8px] border-none bg-transparent cursor-pointer text-text-faint hover:text-accent hover:bg-tile-bg disabled:opacity-25 disabled:cursor-default">
      <Icon size={16} />
    </button>
  )
}

function Linha({ tipo, nome, rotulo, qtd, cor, aoRenomear, extra }: {
  tipo: Tipo; nome: string; rotulo: string; qtd: number; cor?: string
  aoRenomear: (tipo: Tipo, de: string, para: string) => Promise<string | null>
  extra?: React.ReactNode
}) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(rotulo)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar() {
    const novo = texto.trim()
    if (!novo || novo === nome || novo === rotulo) { setEditando(false); return }
    setSalvando(true)
    const e = await aoRenomear(tipo, nome, novo)
    setSalvando(false)
    if (e) { setErro(e); return }
    setEditando(false)
  }

  return (
    <li className="rounded-[12px] border border-border bg-surface px-[10px] py-[6px]">
      <div className="flex items-center gap-[6px] min-h-[38px]">
        {cor && <span className="flex-shrink-0 w-[10px] h-[10px] rounded-full" style={{ background: cor }} />}
        {editando ? (
          <input className={inputCls} value={texto} autoFocus maxLength={120} disabled={salvando}
            onChange={e => { setTexto(e.target.value); setErro(null) }}
            onKeyDown={e => { if (e.key === 'Enter') void salvar(); if (e.key === 'Escape') { e.stopPropagation(); setEditando(false); setErro(null) } }} />
        ) : (
          <span className="flex-1 min-w-0 font-hanken font-medium text-[13.5px] text-ink truncate" title={nome}>{rotulo || 'Sem nome'}</span>
        )}
        {!editando && <span className="flex-shrink-0 font-hanken text-[11.5px] text-text-faint">{qtd} obra{qtd === 1 ? '' : 's'}</span>}
        {editando ? (
          <>
            <BotaoIcone onClick={() => void salvar()} title="Salvar nome" Icon={Check} disabled={salvando} />
            <BotaoIcone onClick={() => { setEditando(false); setErro(null) }} title="Cancelar" Icon={X} disabled={salvando} />
          </>
        ) : (
          <>
            {extra}
            <BotaoIcone onClick={() => { setTexto(rotulo); setErro(null); setEditando(true) }} title="Renomear" Icon={Pencil} disabled={!nome && tipo === 'categoria'} />
          </>
        )}
      </div>
      {erro && <div className="font-hanken text-[12px] text-accent pb-[4px]">{erro}</div>}
    </li>
  )
}

export function GruposModal({ abas, contagemAbas, categorias, onClose, onRenomear, onSalvarOrdem }: Props) {
  const [tab, setTab] = useState<Tipo>('aba')
  const [ordem, setOrdem] = useState<string[]>(abas)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Renomear reflete no rascunho da ordem sem perder o que já foi movido.
  async function renomear(tipo: Tipo, de: string, para: string) {
    const e = await onRenomear(tipo, de, para)
    if (!e && tipo === 'aba') setOrdem(prev => [...new Set(prev.map(a => (a === de ? para : a)))])
    return e
  }

  const alterada = ordem.join('\n') !== abas.join('\n')
  const mover = (i: number, d: -1 | 1) => setOrdem(prev => {
    const n = [...prev]
    ;[n[i], n[i + d]] = [n[i + d], n[i]]
    return n
  })

  async function salvarOrdem() {
    setSalvando(true)
    const e = await onSalvarOrdem(ordem)
    setSalvando(false)
    if (e) setErro(e)
  }

  return (
    <Modal titulo="Abas e categorias" onClose={onClose} largura={560}
      rodape={tab === 'aba' ? <>
        <Botao onClick={onClose} disabled={salvando}>Fechar</Botao>
        <Botao variante="primario" Icon={Save} carregando={salvando} disabled={!alterada} onClick={() => void salvarOrdem()}>Salvar ordem</Botao>
      </> : <Botao onClick={onClose}>Fechar</Botao>}>
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center rounded-[10px] border border-border bg-surface p-[3px] self-start">
          {([['aba', 'Abas'], ['categoria', 'Categorias']] as const).map(([t, rot]) => (
            <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t}
              className={`px-[14px] py-[6px] rounded-[7px] border-none cursor-pointer font-hanken text-[13px] ${tab === t ? 'bg-tile-bg text-ink font-medium' : 'bg-transparent text-text-faint hover:text-ink'}`}>
              {rot}
            </button>
          ))}
        </div>

        <p className="m-0 font-hanken text-[12.5px] text-text-muted">
          {tab === 'aba'
            ? 'Use as setas para escolher a ordem das abas e o lápis para renomear. Renomear muda a aba de todas as obras dela.'
            : 'Renomear muda a categoria de todas as obras que a usam, em qualquer aba. Se o nome novo já existir, os dois grupos se juntam.'}
        </p>
        {erro && <div className="font-hanken text-[12.5px] text-accent bg-[rgba(179,28,28,0.08)] rounded-[9px] px-[12px] py-[8px]">{erro}</div>}

        <ul className="m-0 p-0 list-none flex flex-col gap-[6px]">
          {tab === 'aba' ? ordem.map((a, i) => (
            <Linha key={a} tipo="aba" nome={a} rotulo={rotuloAba(a)} qtd={contagemAbas.get(a) ?? 0} aoRenomear={renomear}
              extra={<>
                <BotaoIcone onClick={() => mover(i, -1)} title="Subir" Icon={ArrowUp} disabled={i === 0} />
                <BotaoIcone onClick={() => mover(i, 1)} title="Descer" Icon={ArrowDown} disabled={i === ordem.length - 1} />
              </>} />
          )) : categorias.map(c => (
            <Linha key={c.nome} tipo="categoria" nome={c.nome} rotulo={c.nome ? categoriaMeta(c.nome).label : 'Sem categoria'}
              qtd={c.qtd} cor={categoriaMeta(c.nome).color} aoRenomear={renomear} />
          ))}
        </ul>
      </div>
    </Modal>
  )
}
