// Modo "Organizar ordem" (só `manage`): arrastar pela alça (mouse ou dedo) ou
// usar as setas pra reordenar obras dentro da seção e as próprias seções.
// Tudo fica num rascunho local; só grava ao tocar em "Salvar ordem" (uma
// chamada a /obras/reordenar/ com os ids na ordem final).
import { useMemo, useRef, useState, type RefObject } from 'react'
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, GripVertical, Save, Undo2 } from 'lucide-react'
import { reordenarObras, mensagemErro, type Obra } from '../../services/obras'
import { categoriaMeta, rotuloAba } from './util'
import { Botao } from './ui'

type GrupoIds = { key: string; ids: string[] }

function gruposIniciais(obras: Obra[]): GrupoIds[] {
  const mapa = new Map<string, string[]>()
  for (const o of [...obras].sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR'))) {
    if (!mapa.has(o.categoria)) mapa.set(o.categoria, [])
    mapa.get(o.categoria)!.push(o.id)
  }
  return [...mapa.entries()].map(([key, ids]) => ({ key, ids }))
}

function mover<T>(lista: T[], de: number, para: number): T[] {
  const n = [...lista]
  const [item] = n.splice(de, 1)
  n.splice(para, 0, item)
  return n
}

function BotaoSeta({ onClick, title, Icon, disabled }: { onClick: () => void; title: string; Icon: React.ElementType; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} disabled={disabled}
      className="inline-flex items-center justify-center w-[34px] h-[34px] rounded-[8px] border-none bg-transparent cursor-pointer text-text-faint hover:text-accent hover:bg-tile-bg disabled:opacity-25 disabled:cursor-default">
      <Icon size={16} />
    </button>
  )
}

/** Lista arrastável por ponteiro (funciona com toque). As linhas têm altura
 *  igual, então as posições ("slots") medidas no início do arraste valem até
 *  o fim; a rolagem do contêiner durante o arraste é compensada. */
function ListaOrdenavel({ ids, porId, onChange, scrollRef }: {
  ids: string[]
  porId: Map<string, Obra>
  onChange: (ids: string[]) => void
  scrollRef: RefObject<HTMLDivElement | null>
}) {
  const refs = useRef(new Map<string, HTMLLIElement>())
  const ini = useRef<{ id: string; y: number; tops: number[]; meia: number; de: number; base: string[]; scroll0: number } | null>(null)
  const [arrastando, setArrastando] = useState<{ id: string; dy: number } | null>(null)

  function down(e: React.PointerEvent, id: string) {
    if (e.button !== 0) return
    const de = ids.indexOf(id)
    const tops = ids.map(x => refs.current.get(x)!.getBoundingClientRect().top)
    const altura = refs.current.get(id)!.getBoundingClientRect().height
    ini.current = { id, y: e.clientY, tops, meia: altura / 2, de, base: ids.filter(x => x !== id), scroll0: scrollRef.current?.scrollTop ?? 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
    setArrastando({ id, dy: 0 })
  }

  function move(e: React.PointerEvent) {
    const s = ini.current
    if (!s) return
    const cont = scrollRef.current
    if (cont) {
      const r = cont.getBoundingClientRect()
      if (e.clientY < r.top + 56) cont.scrollTop -= 12
      else if (e.clientY > r.bottom - 56) cont.scrollTop += 12
    }
    const rolou = (cont?.scrollTop ?? 0) - s.scroll0
    // Centro da linha arrastada em coordenadas do início do arraste.
    const centro = s.tops[s.de] + s.meia + (e.clientY - s.y) + rolou
    const alvo = Math.max(0, Math.min(s.tops.length - 1, s.tops.filter(t => t + s.meia < centro).length - (s.tops[s.de] + s.meia < centro ? 1 : 0)))
    const novo = [...s.base]
    novo.splice(alvo, 0, s.id)
    if (novo.join() !== ids.join()) onChange(novo)
    setArrastando({ id: s.id, dy: centro - (s.tops[alvo] + s.meia) })
  }

  function up() {
    ini.current = null
    setArrastando(null)
  }

  return (
    <ul className="m-0 p-0 list-none flex flex-col gap-[6px]">
      {ids.map((id, i) => {
        const o = porId.get(id)!
        const ativo = arrastando?.id === id
        return (
          <li
            key={id}
            ref={el => { if (el) refs.current.set(id, el); else refs.current.delete(id) }}
            className={`flex items-center gap-[6px] h-[52px] bg-surface border rounded-[12px] pr-[4px] select-none ${ativo ? 'border-accent shadow-card-hover relative z-[5]' : 'border-border'} ${o.ativo ? '' : 'opacity-60'}`}
            style={ativo ? { transform: `translateY(${arrastando!.dy}px)` } : undefined}
          >
            <button
              type="button"
              aria-label={`Arrastar ${o.nome}`}
              title="Arraste para mudar a posição"
              onPointerDown={e => down(e, id)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              className={`flex-shrink-0 self-stretch inline-flex items-center justify-center w-[40px] border-none bg-transparent text-text-faint hover:text-accent touch-none ${ativo ? 'cursor-grabbing text-accent' : 'cursor-grab'}`}
            >
              <GripVertical size={18} />
            </button>
            <span className="flex-shrink-0 w-[44px] font-hanken font-semibold text-[12px] text-text-muted tabular-nums">{o.numero ? `#${o.numero}` : '—'}</span>
            <div className="flex-1 min-w-0">
              <div className="font-hanken font-medium text-[13.5px] text-ink truncate">{o.nome}</div>
              <div className="font-hanken text-[11.5px] text-text-faint truncate">{o.organizacao || (o.ativo ? '' : 'Inativa')}</div>
            </div>
            <div className="hidden sm:flex items-center">
              <BotaoSeta onClick={() => onChange(mover(ids, i, 0))} title="Mover para o início" Icon={ChevronsUp} disabled={i === 0} />
              <BotaoSeta onClick={() => onChange(mover(ids, i, ids.length - 1))} title="Mover para o fim" Icon={ChevronsDown} disabled={i === ids.length - 1} />
            </div>
            <BotaoSeta onClick={() => onChange(mover(ids, i, i - 1))} title="Subir" Icon={ArrowUp} disabled={i === 0} />
            <BotaoSeta onClick={() => onChange(mover(ids, i, i + 1))} title="Descer" Icon={ArrowDown} disabled={i === ids.length - 1} />
          </li>
        )
      })}
    </ul>
  )
}

export function OrganizarOrdem({ obras, aba, scrollRef, onSair, onSalvo, avisar }: {
  /** Obras da aba filtrada (sem busca). */
  obras: Obra[]
  aba: string
  scrollRef: RefObject<HTMLDivElement | null>
  onSair: () => void
  onSalvo: (atualizadas: Obra[]) => void
  avisar: (texto: string, erro?: boolean) => void
}) {
  const inicial = useMemo(() => gruposIniciais(obras), [obras])
  const [grupos, setGrupos] = useState<GrupoIds[]>(inicial)
  const [salvando, setSalvando] = useState(false)
  const porId = useMemo(() => new Map(obras.map(o => [o.id, o])), [obras])
  const alterado = JSON.stringify(grupos) !== JSON.stringify(inicial)

  const setIds = (gi: number, ids: string[]) => setGrupos(prev => prev.map((g, j) => (j === gi ? { ...g, ids } : g)))

  function sair() {
    if (alterado && !window.confirm('Descartar a nova ordem sem salvar?')) return
    onSair()
  }

  async function salvar() {
    setSalvando(true)
    const r = await reordenarObras(grupos.flatMap(g => g.ids))
    setSalvando(false)
    if (!r.ok) { avisar(mensagemErro(r.erros), true); return }
    onSalvo(r.data)
    avisar('Ordem salva')
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="rounded-[12px] bg-[rgba(61,111,180,0.08)] px-[14px] py-[11px] font-hanken text-[13px] text-ink-soft leading-[1.5]">
        <b>Organizando a ordem{aba !== 'todas' ? ` — ${rotuloAba(aba)}` : ''}.</b> Arraste pela alça <GripVertical size={13} className="inline -mt-[2px]" /> ou use as setas;
        as setas no título da seção movem a seção inteira. Nada é gravado até você tocar em <b>Salvar ordem</b>.
        A mesma ordem vale pra exportação da planilha.
      </div>

      {grupos.map((g, gi) => {
        const meta = categoriaMeta(g.key)
        return (
          <section key={g.key}>
            <div className="flex items-center gap-[8px] mb-[8px]">
              <span className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-[7px] flex-shrink-0" style={{ background: meta.bg }}>
                <meta.Icon size={14} strokeWidth={2.2} style={{ color: meta.color }} />
              </span>
              <h4 className="m-0 flex-1 min-w-0 font-archivo font-semibold text-[12.5px] tracking-[0.05em] uppercase truncate" style={{ color: meta.color }}>
                {meta.label} <span className="font-hanken font-normal text-text-faint normal-case tracking-normal">· {g.ids.length}</span>
              </h4>
              {grupos.length > 1 && (
                <>
                  <BotaoSeta onClick={() => setGrupos(mover(grupos, gi, gi - 1))} title="Subir a seção" Icon={ArrowUp} disabled={gi === 0} />
                  <BotaoSeta onClick={() => setGrupos(mover(grupos, gi, gi + 1))} title="Descer a seção" Icon={ArrowDown} disabled={gi === grupos.length - 1} />
                </>
              )}
            </div>
            <ListaOrdenavel ids={g.ids} porId={porId} onChange={ids => setIds(gi, ids)} scrollRef={scrollRef} />
          </section>
        )
      })}

      <div className="fixed left-0 right-0 bottom-0 z-[45] flex justify-center px-[10px] pb-[max(10px,env(safe-area-inset-bottom))] pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[560px] bg-ink text-white rounded-[16px] shadow-toast px-[12px] py-[10px] flex items-center gap-[8px]">
          <span className="font-hanken font-semibold text-[13.5px] px-[4px] mr-auto whitespace-nowrap">
            {alterado ? 'Não salva' : 'Organizando'}
          </span>
          <button type="button" onClick={sair} disabled={salvando}
            className="inline-flex items-center gap-[6px] min-h-[40px] px-[12px] rounded-[10px] border border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer font-hanken font-medium text-[13px] disabled:opacity-40">
            <Undo2 size={15} />{alterado ? 'Descartar' : 'Sair'}
          </button>
          <Botao variante="primario" Icon={Save} onClick={salvar} carregando={salvando} disabled={!alterado} className="min-h-[40px]">
            Salvar ordem
          </Botao>
        </div>
      </div>
    </div>
  )
}
