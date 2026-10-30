// Cartão CNPJ da obra (comprovante da Receita): quem vê a obra abre o arquivo;
// o Administrador (`manage`) anexa, troca e remove. Um arquivo por obra.
import { useRef, useState } from 'react'
import { FileCheck2, FileText, Paperclip, Trash2, ExternalLink, RefreshCw, TriangleAlert, Landmark } from 'lucide-react'
import { abrirCartaoCnpj, anexarCartaoCnpj, mensagemErro, removerCartaoCnpj, type Obra } from '../../services/obras'
import { Botao, ConfirmDialog, SectionTitle } from './ui'

const MAX_BYTES = 10 * 1024 * 1024
const ACEITOS = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'
const RECEITA = 'https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp'

/** Página da Receita com o CNPJ da obra já preenchido (só falta o desafio de segurança). Null se não há 14 dígitos. */
function linkReceita(cnpj: string): string | null {
  const digitos = cnpj.replace(/\D/g, '')
  return digitos.length === 14 ? `${RECEITA}?cnpj=${digitos}` : null
}

function dataHora(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function tamanhoLegivel(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function CartaoCnpjSecao({ obra, canManage, onAtualizada, avisar }: {
  obra: Obra
  canManage: boolean
  onAtualizada: (obra: Obra) => void
  avisar: (texto: string, erro?: boolean) => void
}) {
  const entrada = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [abrindo, setAbrindo] = useState(false)
  const [removendo, setRemovendo] = useState(false)
  const cartao = obra.cartao_cnpj
  const receita = linkReceita(obra.cnpj)

  // Quem só consulta não tem o que fazer numa obra sem cartão.
  if (!cartao && !canManage) return null

  async function enviar(arquivo: File) {
    if (arquivo.size > MAX_BYTES) { avisar('O arquivo passa de 10 MB.', true); return }
    setEnviando(true)
    const r = await anexarCartaoCnpj(obra.id, arquivo)
    setEnviando(false)
    if (!r.ok) { avisar(mensagemErro(r.erros), true); return }
    onAtualizada(r.data)
    avisar(cartao ? 'Cartão CNPJ substituído' : 'Cartão CNPJ anexado')
  }

  async function abrir() {
    // Abre a aba já no clique (antes do fetch) pro navegador não barrar como pop-up.
    const aba = window.open('', '_blank')
    if (aba) aba.opener = null
    setAbrindo(true)
    const r = await abrirCartaoCnpj(obra.id)
    setAbrindo(false)
    if (!r.ok) { aba?.close(); avisar(mensagemErro(r.erros), true); return }
    if (aba) aba.location.href = r.data.url
    else window.location.assign(r.data.url)
  }

  async function remover() {
    const r = await removerCartaoCnpj(obra.id)
    if (!r.ok) { avisar(mensagemErro(r.erros), true); return }
    onAtualizada({ ...obra, cartao_cnpj: null })
    avisar('Cartão CNPJ removido')
  }

  return (
    <>
      <SectionTitle Icon={FileCheck2}>Cartão CNPJ</SectionTitle>
      <input
        ref={entrada}
        type="file"
        accept={ACEITOS}
        className="hidden"
        onChange={e => {
          const arquivo = e.target.files?.[0]
          e.target.value = '' // deixa escolher o mesmo arquivo de novo
          if (arquivo) void enviar(arquivo)
        }}
      />

      {cartao ? (
        <div className="flex flex-col gap-[10px] bg-tile-bg/70 rounded-[12px] px-[12px] py-[10px]">
          <div className="flex items-center gap-[10px] min-w-0">
            <FileText size={18} strokeWidth={1.8} className="flex-shrink-0 text-accent" />
            <div className="flex-1 min-w-0">
              <div className="font-hanken font-medium text-[14px] text-ink truncate" title={cartao.nome}>{cartao.nome}</div>
              <div className="font-hanken text-[12px] text-text-muted">
                Última versão anexada em {dataHora(cartao.enviado_em) || '—'} · {tamanhoLegivel(cartao.tamanho)}
              </div>
            </div>
          </div>
          {cartao.desatualizado && (
            <div className="flex items-start gap-[7px] font-hanken text-[12.5px] text-accent bg-[rgba(179,28,28,0.07)] rounded-[9px] px-[10px] py-[8px]">
              <TriangleAlert size={15} className="flex-shrink-0 mt-[1px]" />
              O CNPJ da obra mudou depois deste anexo. Emita um cartão novo na Receita e anexe de novo.
            </div>
          )}
          <div className="flex flex-wrap gap-[8px]">
            <Botao variante="primario" Icon={ExternalLink} carregando={abrindo} onClick={abrir}>Abrir</Botao>
            {receita && <Botao Icon={Landmark} onClick={() => window.open(receita, '_blank', 'noopener,noreferrer')}>Emitir na Receita</Botao>}
            {canManage && <Botao Icon={RefreshCw} carregando={enviando} onClick={() => entrada.current?.click()}>Substituir</Botao>}
            {canManage && <Botao variante="perigo" Icon={Trash2} disabled={enviando} onClick={() => setRemovendo(true)}>Remover</Botao>}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-[8px] border border-dashed border-border rounded-[12px] px-[12px] py-[12px]">
          <span className="font-hanken text-[13px] text-text-muted">Nenhum cartão anexado. Aceita PDF, JPG ou PNG, até 10 MB.</span>
          <div className="flex flex-wrap gap-[8px]">
            {receita && <Botao Icon={Landmark} onClick={() => window.open(receita, '_blank', 'noopener,noreferrer')}>Emitir na Receita</Botao>}
            <Botao variante="primario" Icon={Paperclip} carregando={enviando} onClick={() => entrada.current?.click()}>Anexar cartão CNPJ</Botao>
          </div>
        </div>
      )}
      {receita && (
        <p className="m-0 mt-[6px] font-hanken text-[11.5px] text-text-faint">
          “Emitir na Receita” abre o site já com o CNPJ preenchido. Resolva o desafio de segurança, salve o comprovante em PDF e anexe aqui.
        </p>
      )}

      {removendo && (
        <ConfirmDialog
          conf={{
            titulo: 'Remover cartão CNPJ?',
            mensagem: <>O arquivo “{cartao?.nome}” será apagado desta obra. Dá pra anexar outro depois.</>,
            confirmar: 'Remover',
            perigo: true,
            onConfirmar: remover,
          }}
          onClose={() => setRemovendo(false)}
        />
      )}
    </>
  )
}
