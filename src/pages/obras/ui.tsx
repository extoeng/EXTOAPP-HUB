// Peças visuais da tela Dados das Obras (o HUB não tem kit de UI compartilhado).
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode, type ElementType } from 'react'
import { Check, Copy, Loader2, X } from 'lucide-react'
import { copiar } from './util'

export function CopyButton({ value, label = 'Copiar', size = 'md' }: { value: string; label?: string; size?: 'sm' | 'md' }) {
  const [copied, setCopied] = useState(false)
  const dim = size === 'sm' ? 'w-[28px] h-[28px]' : 'w-[34px] h-[34px]'
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        copiar(value).then(ok => {
          if (!ok) return
          setCopied(true)
          setTimeout(() => setCopied(false), 1400)
        })
      }}
      title={label}
      aria-label={label}
      className={`flex-shrink-0 inline-flex items-center justify-center ${dim} rounded-[8px] border-none bg-transparent cursor-pointer text-text-faint hover:text-accent hover:bg-tile-bg active:bg-tile-bg transition-colors duration-150`}
    >
      {copied ? <Check size={14} strokeWidth={2.2} className="text-accent" /> : <Copy size={14} strokeWidth={1.8} />}
    </button>
  )
}

/** Botão-ícone pra links de ação (ligar, WhatsApp, e-mail, mapa) — alvo de toque de 34px. */
export function IconLink({ href, title, Icon, externo }: { href: string; title: string; Icon: ElementType; externo?: boolean }) {
  return (
    <a
      href={href}
      title={title}
      aria-label={title}
      onClick={e => e.stopPropagation()}
      {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex-shrink-0 inline-flex items-center justify-center w-[34px] h-[34px] rounded-[8px] text-text-faint hover:text-accent hover:bg-tile-bg active:bg-tile-bg transition-colors duration-150"
    >
      <Icon size={15} strokeWidth={1.8} />
    </a>
  )
}

type Variante = 'primario' | 'secundario' | 'perigo' | 'fantasma'

const VARIANTES: Record<Variante, string> = {
  primario: 'text-white bg-accent border-accent hover:opacity-90',
  secundario: 'text-ink-soft bg-surface border-border hover:border-border-hover',
  perigo: 'text-accent bg-surface border-[rgba(179,28,28,0.35)] hover:bg-[rgba(179,28,28,0.06)]',
  fantasma: 'text-text-muted bg-transparent border-transparent hover:bg-tile-bg hover:text-ink',
}

export function Botao({
  variante = 'secundario', Icon, carregando, children, className = '', ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; Icon?: ElementType; carregando?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || carregando}
      className={`inline-flex items-center justify-center gap-[6px] font-hanken font-medium text-[13px] rounded-[10px] px-[13px] min-h-[38px] border cursor-pointer transition-colors duration-150 disabled:opacity-55 disabled:cursor-default whitespace-nowrap ${VARIANTES[variante]} ${className}`}
    >
      {carregando ? <Loader2 size={15} className="animate-spin" /> : Icon ? <Icon size={15} strokeWidth={1.9} /> : null}
      {children}
    </button>
  )
}

export function Rotulo({ children, obrigatorio }: { children: ReactNode; obrigatorio?: boolean }) {
  return (
    <span className="font-hanken font-medium text-[12px] text-label">
      {children}{obrigatorio && <span className="text-accent"> *</span>}
    </span>
  )
}

export function ErroCampo({ erro }: { erro?: string }) {
  return erro ? <span className="font-hanken text-[11.5px] text-accent">{erro}</span> : null
}

export function SectionTitle({ Icon, children, acao }: { Icon: ElementType; children: ReactNode; acao?: ReactNode }) {
  return (
    <div className="flex items-center gap-[8px] mb-[8px] mt-[22px] first:mt-0">
      <Icon size={15} strokeWidth={1.9} className="text-accent" />
      <h3 className="m-0 flex-1 font-archivo font-semibold text-[12px] tracking-[0.06em] uppercase text-label">{children}</h3>
      {acao}
    </div>
  )
}

export function Selo({ cor, bg, Icon, children }: { cor: string; bg: string; Icon?: ElementType; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-[4px] font-hanken font-semibold text-[10px] uppercase tracking-[0.04em] rounded-[5px] px-[6px] py-[2.5px] whitespace-nowrap"
      style={{ color: cor, background: bg }}
    >
      {Icon && <Icon size={10} strokeWidth={2.4} />}{children}
    </span>
  )
}

/** Painel sobreposto: gaveta lateral no computador, tela cheia no celular. */
export function Painel({ onClose, children, largura = 560, bloquearFechar }: {
  onClose: () => void
  children: ReactNode
  largura?: number
  bloquearFechar?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !bloquearFechar) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, bloquearFechar])

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div className="absolute inset-0 bg-[rgba(22,20,18,0.38)] animate-ex-float" onClick={bloquearFechar ? undefined : onClose} />
      <div
        className="relative w-full h-full bg-surface flex flex-col shadow-card-hover sm:border-l sm:border-border"
        style={{ maxWidth: largura, animation: 'exSlideIn 0.22s ease' }}
      >
        <style>{'@keyframes exSlideIn { from { transform: translateX(24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }'}</style>
        {children}
      </div>
    </div>
  )
}

/** Modal centralizado no computador, folha de baixo pra cima no celular. */
export function Modal({ titulo, onClose, children, rodape, largura = 520 }: {
  titulo: string
  onClose: () => void
  children: ReactNode
  rodape?: ReactNode
  largura?: number
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-[20px]">
      <div className="absolute inset-0 bg-[rgba(22,20,18,0.42)] animate-ex-float" onClick={onClose} />
      <div
        className="relative w-full bg-surface rounded-t-[18px] sm:rounded-[16px] shadow-card-hover flex flex-col max-h-[92dvh] animate-ex-float"
        style={{ maxWidth: largura }}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="flex items-center gap-[10px] px-[20px] pt-[16px] pb-[12px] border-b border-border flex-shrink-0">
          <h2 className="m-0 flex-1 font-archivo font-semibold text-[17px] text-ink">{titulo}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar"
            className="inline-flex items-center justify-center w-[34px] h-[34px] rounded-[9px] border-none bg-tile-bg cursor-pointer text-text-muted hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">{children}</div>
        {rodape && (
          <div className="flex flex-wrap items-center justify-end gap-[8px] px-[20px] py-[12px] border-t border-border flex-shrink-0 pb-[max(12px,env(safe-area-inset-bottom))]">
            {rodape}
          </div>
        )}
      </div>
    </div>
  )
}

export interface Confirmacao {
  titulo: string
  mensagem: ReactNode
  confirmar: string
  perigo?: boolean
  onConfirmar: () => Promise<void> | void
}

export function ConfirmDialog({ conf, onClose }: { conf: Confirmacao; onClose: () => void }) {
  const [rodando, setRodando] = useState(false)
  return (
    <Modal
      titulo={conf.titulo}
      onClose={rodando ? () => {} : onClose}
      largura={420}
      rodape={<>
        <Botao onClick={onClose} disabled={rodando}>Cancelar</Botao>
        <Botao
          variante={conf.perigo ? 'perigo' : 'primario'}
          carregando={rodando}
          onClick={async () => {
            setRodando(true)
            await conf.onConfirmar()
            setRodando(false)
            onClose()
          }}
        >{conf.confirmar}</Botao>
      </>}
    >
      <div className="font-hanken text-[14px] text-ink-soft leading-[1.5]">{conf.mensagem}</div>
    </Modal>
  )
}

/** Aviso flutuante curto ("Obra salva", erros de ação). */
export function Aviso({ texto, erro, onFim }: { texto: string; erro?: boolean; onFim: () => void }) {
  useEffect(() => {
    const t = setTimeout(onFim, erro ? 5000 : 2600)
    return () => clearTimeout(t)
  }, [texto, erro, onFim])
  return (
    <div className="fixed left-1/2 bottom-[calc(24px+env(safe-area-inset-bottom))] -translate-x-1/2 z-[90] max-w-[calc(100vw-32px)] bg-ink text-white px-[18px] py-[11px] rounded-[14px] font-hanken font-medium text-[13.5px] shadow-toast flex items-center gap-[10px] animate-ex-float">
      <span className={`w-[8px] h-[8px] flex-shrink-0 rounded-full ${erro ? 'bg-accent' : 'bg-[#4CAF7A]'}`} />
      {texto}
    </div>
  )
}

/** "Quem pode ver": Padrão e/ou Avançado (ao menos um). Não deixa desmarcar o último. */
export function QuemPodeVer({ valor, onChange, nome = 'quem-ve' }: {
  valor: { visivel_padrao: boolean; visivel_avancado: boolean }
  onChange: (v: { visivel_padrao: boolean; visivel_avancado: boolean }) => void
  nome?: string
}) {
  const opcoes = [
    ['visivel_padrao', 'Padrão', 'Quem tem o acesso Padrão aos Dados das Obras.'],
    ['visivel_avancado', 'Avançado', 'Quem tem o acesso Avançado aos Dados das Obras.'],
  ] as const
  const marcadas = Number(valor.visivel_padrao) + Number(valor.visivel_avancado)
  return (
    <div className="flex flex-col gap-[8px]" role="group" aria-label="Quem pode ver">
      {opcoes.map(([campo, rotulo, desc]) => {
        const ligado = valor[campo]
        return (
          <label key={campo} className={`flex items-start gap-[10px] rounded-[12px] border p-[10px] cursor-pointer ${ligado ? 'border-accent bg-[rgba(179,28,28,0.05)]' : 'border-border'}`}>
            <input type="checkbox" name={`${nome}-${campo}`} checked={ligado} disabled={ligado && marcadas === 1}
              onChange={e => onChange({ ...valor, [campo]: e.target.checked })} className="mt-[3px] w-[17px] h-[17px] accent-[#B31C1C]" />
            <span>
              <span className="block font-hanken font-semibold text-[13.5px] text-ink">{rotulo}</span>
              <span className="block font-hanken text-[12px] text-text-muted">{desc}</span>
            </span>
          </label>
        )
      })}
      <span className="font-hanken text-[11.5px] text-text-faint">Marque os dois para a obra aparecer pros dois perfis. O Administrador vê todas.</span>
    </div>
  )
}
