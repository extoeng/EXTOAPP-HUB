import {
  Building2, FileText, MapPin, Phone, Mail, Users, Hash, X, Pencil, ClipboardCopy, Share2,
  MessageCircle, Navigation, StickyNote, CopyPlus, Power, Trash2, EyeOff,
} from 'lucide-react'
import type { Obra } from '../../services/obras'
import {
  categoriaMeta, copiar, enderecoPrincipal, mapaHref, rotuloAba, telHref, telefonePrincipal, textoDaObra, whatsappHref,
} from './util'
import { Botao, CopyButton, IconLink, SectionTitle, Selo } from './ui'

function Linha({ rotulo, children, acoes }: { rotulo: string; children: React.ReactNode; acoes?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-[8px] py-[6px] border-b border-border last:border-b-0">
      <span className="flex-shrink-0 w-[80px] sm:w-[92px] font-hanken font-medium text-[12px] text-label pt-[8px]">{rotulo}</span>
      <span className="flex-1 min-w-0 font-hanken text-[14px] sm:text-[13.5px] text-ink-soft leading-[1.45] break-words pt-[7px]">{children}</span>
      {acoes && <div className="flex items-center flex-shrink-0">{acoes}</div>}
    </div>
  )
}

function AcaoRapida({ href, onClick, Icon, children, externo }: {
  href?: string; onClick?: () => void; Icon: React.ElementType; children: React.ReactNode; externo?: boolean
}) {
  const cls = 'flex-1 min-w-[72px] flex flex-col items-center gap-[5px] rounded-[12px] bg-tile-bg hover:bg-border/70 active:bg-border px-[6px] py-[10px] font-hanken font-medium text-[11.5px] text-ink-soft no-underline cursor-pointer border-none'
  const conteudo = <><Icon size={18} strokeWidth={1.8} className="text-accent" />{children}</>
  return href
    ? <a href={href} className={cls} {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{conteudo}</a>
    : <button type="button" onClick={onClick} className={cls}>{conteudo}</button>
}

export function ObraDetalhe({ obra, canManage, onClose, onEditar, onDuplicar, onAlternarAtivo, onExcluir, avisar }: {
  obra: Obra
  canManage: boolean
  onClose: () => void
  onEditar: () => void
  onDuplicar: () => void
  onAlternarAtivo: () => void
  onExcluir: () => void
  avisar: (texto: string, erro?: boolean) => void
}) {
  const meta = categoriaMeta(obra.categoria)
  const tel = telefonePrincipal(obra)
  const endereco = enderecoPrincipal(obra)
  const docs: [string, string][] = ([['CNPJ', obra.cnpj], ['CNO', obra.cno], ['IE', obra.ie], ['IM', obra.im]] as [string, string][]).filter(([, v]) => v)
  const ends: [string, string][] = ([['Entrega', obra.endereco_entrega], ['Cobrança', obra.endereco_cobranca], ['Fatura', obra.endereco_fatura]] as [string, string][]).filter(([, v]) => v)
  const equipe = obra.equipe.filter(m => m.nome || m.cargo)
  const podeCompartilhar = typeof navigator.share === 'function'

  async function copiarTudo() {
    const ok = await copiar(textoDaObra(obra))
    avisar(ok ? 'Dados da obra copiados' : 'Não foi possível copiar', !ok)
  }

  return (
    <>
      <div className="flex items-start gap-[12px] px-[18px] sm:px-[26px] pt-[max(16px,env(safe-area-inset-top))] pb-[16px] border-b border-border flex-shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-[8px] mb-[6px]">
            {obra.numero && (
              <span className="inline-flex items-center gap-[3px] font-hanken font-semibold text-[12px] text-accent bg-[rgba(179,28,28,0.08)] rounded-[7px] px-[8px] py-[3px]">
                <Hash size={11} strokeWidth={2.4} />{obra.numero}
              </span>
            )}
            <span className="font-hanken text-[11.5px] text-text-faint uppercase tracking-[0.05em]">{rotuloAba(obra.aba)}</span>
          </div>
          <h2 className="m-0 font-archivo font-semibold text-[19px] sm:text-[20px] leading-[1.2] text-ink break-words">{obra.nome}</h2>
          <div className="flex flex-wrap items-center gap-[6px] mt-[8px]">
            <Selo cor={meta.color} bg={meta.bg} Icon={meta.Icon}>{meta.label}</Selo>
            {!obra.ativo && <Selo cor="#6E6B67" bg="rgba(110,107,103,0.12)" Icon={EyeOff}>Inativa</Selo>}
          </div>
        </div>
        {canManage && (
          <Botao variante="secundario" Icon={Pencil} onClick={onEditar} className="hidden sm:inline-flex">Editar</Botao>
        )}
        <button type="button" onClick={onClose} title="Fechar (Esc)" aria-label="Fechar"
          className="flex-shrink-0 inline-flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border-none bg-tile-bg cursor-pointer text-text-muted hover:text-ink hover:bg-border transition-colors">
          <X size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-[18px] sm:px-[26px] py-[16px]">
          <div className="flex gap-[8px] mb-[20px]">
            {tel && <AcaoRapida href={telHref(tel)} Icon={Phone}>Ligar</AcaoRapida>}
            {obra.email && <AcaoRapida href={`mailto:${obra.email}`} Icon={Mail}>E-mail</AcaoRapida>}
            {endereco && <AcaoRapida href={mapaHref(endereco)} Icon={Navigation} externo>Mapa</AcaoRapida>}
            <AcaoRapida onClick={copiarTudo} Icon={ClipboardCopy}>Copiar</AcaoRapida>
            {podeCompartilhar && (
              <AcaoRapida
                onClick={() => { navigator.share({ title: obra.nome, text: textoDaObra(obra) }).catch(() => {}) }}
                Icon={Share2}
              >Enviar</AcaoRapida>
            )}
          </div>

          {obra.organizacao && (
            <>
              <SectionTitle Icon={Building2}>Organização</SectionTitle>
              <Linha rotulo="Razão social" acoes={<CopyButton value={obra.organizacao} />}>{obra.organizacao}</Linha>
            </>
          )}

          {docs.length > 0 && (
            <>
              <SectionTitle Icon={FileText}>Documentos</SectionTitle>
              {docs.map(([k, v]) => <Linha key={k} rotulo={k} acoes={<CopyButton value={v} label={`Copiar ${k}`} />}><span className="tabular-nums">{v}</span></Linha>)}
            </>
          )}

          {ends.length > 0 && (
            <>
              <SectionTitle Icon={MapPin}>Endereços</SectionTitle>
              {ends.map(([k, v]) => (
                <Linha key={k} rotulo={k} acoes={<>
                  <IconLink href={mapaHref(v)} title="Abrir no mapa" Icon={Navigation} externo />
                  <CopyButton value={v} />
                </>}>{v}</Linha>
              ))}
            </>
          )}

          {(obra.email || obra.telefones.length > 0) && (
            <>
              <SectionTitle Icon={Phone}>Contato</SectionTitle>
              {obra.email && (
                <Linha rotulo="E-mail" acoes={<CopyButton value={obra.email} />}>
                  <a href={`mailto:${obra.email}`} className="text-accent no-underline hover:underline break-all">{obra.email}</a>
                </Linha>
              )}
              {obra.telefones.map((t, i) => {
                const wa = whatsappHref(t)
                return (
                  <Linha key={i} rotulo={i === 0 ? 'Telefone' : ''} acoes={<>
                    {wa && <IconLink href={wa} title="WhatsApp" Icon={MessageCircle} externo />}
                    <CopyButton value={t} />
                  </>}>
                    <a href={telHref(t)} className="text-ink-soft no-underline hover:text-accent tabular-nums">{t}</a>
                  </Linha>
                )
              })}
            </>
          )}

          {equipe.length > 0 && (
            <>
              <SectionTitle Icon={Users}>Equipe</SectionTitle>
              <ul className="m-0 p-0 list-none flex flex-col gap-[8px]">
                {equipe.map((m, i) => {
                  const wa = m.telefone ? whatsappHref(m.telefone) : null
                  return (
                    <li key={i} className="flex items-center gap-[10px] bg-tile-bg/70 rounded-[12px] px-[12px] py-[9px]">
                      <div className="flex-shrink-0 w-[32px] h-[32px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[12px]">
                        {((m.nome || m.cargo)[0] || '?').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-hanken font-medium text-[14px] text-ink truncate">{m.nome || '—'}</div>
                        <div className="font-hanken text-[12px] text-text-faint truncate">
                          {m.cargo || 'Sem cargo'}{m.telefone ? ` · ${m.telefone}` : ''}
                        </div>
                        {m.email && <div className="font-hanken text-[12px] text-text-faint truncate">{m.email}</div>}
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        {m.telefone && <IconLink href={telHref(m.telefone)} title={`Ligar para ${m.nome}`} Icon={Phone} />}
                        {wa && <IconLink href={wa} title="WhatsApp" Icon={MessageCircle} externo />}
                        {m.email && <IconLink href={`mailto:${m.email}`} title="E-mail" Icon={Mail} />}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {obra.observacoes && (
            <>
              <SectionTitle Icon={StickyNote}>Observações</SectionTitle>
              <p className="m-0 font-hanken text-[14px] sm:text-[13.5px] text-ink-soft leading-[1.5] whitespace-pre-wrap">{obra.observacoes}</p>
            </>
          )}

          {canManage && (
            <div className="mt-[28px] pt-[16px] border-t border-border flex flex-wrap gap-[8px]">
              <Botao Icon={CopyPlus} onClick={onDuplicar}>Duplicar</Botao>
              <Botao Icon={Power} onClick={onAlternarAtivo}>{obra.ativo ? 'Desativar' : 'Reativar'}</Botao>
              <Botao variante="perigo" Icon={Trash2} onClick={onExcluir}>Excluir</Botao>
            </div>
          )}
        </div>
      </div>

      {canManage && (
        <div className="sm:hidden flex-shrink-0 border-t border-border px-[16px] pt-[10px] pb-[max(10px,env(safe-area-inset-bottom))] bg-surface">
          <Botao variante="primario" Icon={Pencil} onClick={onEditar} className="w-full min-h-[44px]">Editar obra</Botao>
        </div>
      )}
    </>
  )
}
