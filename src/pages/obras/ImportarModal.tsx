import { useRef, useState } from 'react'
import { FileSpreadsheet, Upload, CircleAlert, CheckCircle2, ChevronDown, TriangleAlert } from 'lucide-react'
import { importarPlanilha, mensagemErro, type AusentesAcao, type ResumoImportacao } from '../../services/obras'
import { rotuloAba } from './util'
import { Botao, Modal } from './ui'

function Lista({ titulo, qtd, cor, children, aberta = false }: {
  titulo: string; qtd: number; cor: string; children?: React.ReactNode; aberta?: boolean
}) {
  const [open, setOpen] = useState(aberta)
  const temItens = qtd > 0 && children
  return (
    <div className="rounded-[12px] border border-border overflow-hidden">
      <button type="button" onClick={() => temItens && setOpen(o => !o)}
        className={`w-full flex items-center gap-[10px] px-[12px] py-[10px] bg-surface border-none text-left ${temItens ? 'cursor-pointer hover:bg-tile-bg/60' : 'cursor-default'}`}>
        <span className="font-archivo font-semibold text-[18px] tabular-nums min-w-[32px]" style={{ color: cor }}>{qtd}</span>
        <span className="flex-1 font-hanken text-[13.5px] text-ink-soft">{titulo}</span>
        {temItens && <ChevronDown size={16} className={`text-text-faint transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && temItens && (
        <ul className="m-0 px-[12px] pb-[10px] pt-[2px] list-none flex flex-col gap-[4px] max-h-[220px] overflow-y-auto">{children}</ul>
      )}
    </div>
  )
}

export function ImportarModal({ totalAtual, onClose, onImportado }: {
  totalAtual: number
  onClose: () => void
  onImportado: (resumo: ResumoImportacao) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [ausentes, setAusentes] = useState<AusentesAcao>('manter')
  const [previa, setPrevia] = useState<ResumoImportacao | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [arrastando, setArrastando] = useState(false)

  async function escolher(file: File | undefined) {
    if (!file) return
    setArquivo(file); setPrevia(null); setErro(null)
    if (!/\.xlsx?$/i.test(file.name)) { setErro('Escolha um arquivo do Excel (.xls ou .xlsx).'); return }
    setCarregando(true)
    const r = await importarPlanilha(file, { aplicar: false, ausentes })
    setCarregando(false)
    if (!r.ok) { setErro(mensagemErro(r.erros)); return }
    setPrevia(r.data)
  }

  async function aplicar() {
    if (!arquivo) return
    setCarregando(true); setErro(null)
    const r = await importarPlanilha(arquivo, { aplicar: true, ausentes })
    setCarregando(false)
    if (!r.ok) { setErro(mensagemErro(r.erros)); return }
    onImportado(r.data)
  }

  const nadaMuda = previa && previa.novas.length === 0 && previa.atualizadas.length === 0
    && (ausentes === 'manter' || previa.ausentes.every(a => !a.ativo))

  return (
    <Modal
      titulo="Importar planilha de obras"
      onClose={carregando ? () => {} : onClose}
      largura={600}
      rodape={<>
        <Botao onClick={onClose} disabled={carregando}>Cancelar</Botao>
        <Botao variante="primario" Icon={Upload} carregando={carregando && !!previa} disabled={!previa || !!nadaMuda} onClick={aplicar}>
          Aplicar importação
        </Botao>
      </>}
    >
      <div className="flex flex-col gap-[14px]">
        <p className="m-0 font-hanken text-[13.5px] text-text-muted leading-[1.5]">
          Use o mesmo modelo da <b>Tabela de Obras</b> da Suprimentos (.xls ou .xlsx) — ou um arquivo exportado por aqui.
          Antes de gravar você vê o que vai mudar.
        </p>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setArrastando(true) }}
          onDragLeave={() => setArrastando(false)}
          onDrop={e => { e.preventDefault(); setArrastando(false); escolher(e.dataTransfer.files[0]) }}
          className={`flex flex-col items-center justify-center gap-[8px] rounded-[14px] border-2 border-dashed px-[16px] py-[22px] text-center cursor-pointer transition-colors ${arrastando ? 'border-accent bg-[rgba(179,28,28,0.05)]' : 'border-border hover:border-border-hover bg-tile-bg/40'}`}
        >
          <FileSpreadsheet size={30} strokeWidth={1.5} className="text-accent" />
          {arquivo
            ? <span className="font-hanken font-medium text-[14px] text-ink break-all">{arquivo.name}</span>
            : <span className="font-hanken font-medium text-[14px] text-ink">Toque para escolher o arquivo</span>}
          <span className="font-hanken text-[12px] text-text-faint">{arquivo ? 'Toque para trocar' : 'ou arraste aqui (computador)'}</span>
          <input ref={inputRef} type="file" className="hidden"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={e => { escolher(e.target.files?.[0]); e.target.value = '' }} />
        </div>

        <fieldset className="m-0 p-0 border-none flex flex-col gap-[6px]">
          <legend className="font-hanken font-medium text-[12.5px] text-label mb-[6px]">
            Obras que estão no app mas não estão no arquivo:
          </legend>
          {([
            ['manter', 'Manter como estão'],
            ['desativar', 'Desativar (somem pra quem não é Administrador; dá pra reativar depois)'],
          ] as const).map(([valor, rotulo]) => (
            <label key={valor} className="flex items-start gap-[9px] cursor-pointer font-hanken text-[13.5px] text-ink-soft">
              <input type="radio" name="ausentes" checked={ausentes === valor} onChange={() => setAusentes(valor)} className="mt-[3px] w-[16px] h-[16px] accent-[#B31C1C]" />
              {rotulo}
            </label>
          ))}
        </fieldset>

        {carregando && !previa && <div className="font-hanken text-[13px] text-text-faint">Lendo a planilha…</div>}

        {erro && (
          <div className="flex items-start gap-[8px] font-hanken text-[13px] text-accent bg-[rgba(179,28,28,0.07)] rounded-[10px] px-[12px] py-[10px]">
            <CircleAlert size={16} className="flex-shrink-0 mt-[1px]" />{erro}
          </div>
        )}

        {previa && (
          <div className="flex flex-col gap-[8px]">
            <div className="font-hanken text-[13px] text-text-muted">
              <b className="text-ink">{previa.total}</b> obras no arquivo
              ({previa.abas.map(a => `${rotuloAba(a.nome)}: ${a.obras}`).join(' · ')}) · {totalAtual} hoje no app
            </div>
            <Lista titulo="obras novas" qtd={previa.novas.length} cor="#2F8F5B" aberta={previa.novas.length <= 5}>
              {previa.novas.map((n, i) => (
                <li key={i} className="font-hanken text-[12.5px] text-ink-soft">
                  {n.numero && <b>#{n.numero} </b>}{n.nome} <span className="text-text-faint">· {rotuloAba(n.aba)}</span>
                </li>
              ))}
            </Lista>
            <Lista titulo="obras com dados alterados" qtd={previa.atualizadas.length} cor="#3D6FB4" aberta={previa.atualizadas.length <= 5}>
              {previa.atualizadas.map(a => (
                <li key={a.id} className="font-hanken text-[12.5px] text-ink-soft">
                  {a.nome} <span className="text-text-faint">· {a.campos.join(', ')}</span>
                </li>
              ))}
            </Lista>
            <Lista titulo="sem mudança" qtd={previa.sem_mudanca} cor="#9A958D" />
            <Lista titulo={`no app e fora do arquivo${ausentes === 'desativar' ? ' — serão desativadas' : ' — ficam como estão'}`}
              qtd={previa.ausentes.length} cor={ausentes === 'desativar' ? '#B31C1C' : '#9A958D'}>
              {previa.ausentes.map(a => (
                <li key={a.id} className="font-hanken text-[12.5px] text-ink-soft">
                  {a.nome} <span className="text-text-faint">· {rotuloAba(a.aba)}{!a.ativo ? ' · já inativa' : ''}</span>
                </li>
              ))}
            </Lista>
            {previa.avisos.map((a, i) => (
              <div key={i} className="flex items-start gap-[8px] font-hanken text-[12.5px] text-[#8A5A00] bg-[rgba(184,134,43,0.10)] rounded-[10px] px-[12px] py-[8px]">
                <TriangleAlert size={15} className="flex-shrink-0 mt-[1px]" />{a}
              </div>
            ))}
            {nadaMuda && (
              <div className="flex items-center gap-[8px] font-hanken text-[13px] text-[#2F8F5B]">
                <CheckCircle2 size={16} /> O app já está igual ao arquivo — nada a importar.
              </div>
            )}
            <p className="m-0 font-hanken text-[12px] text-text-faint leading-[1.5]">
              A importação substitui os dados da planilha (inclusive a equipe e a ordem). "Ativa" e "Observações" não estão na planilha e não mudam.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
