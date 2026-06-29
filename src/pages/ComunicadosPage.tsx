import { ArrowLeft, Calendar, FileText } from 'lucide-react'
import { useState } from 'react'
import { COMUNICADOS } from '../data/comunicados'
import type { Comunicado } from '../data/comunicados'

interface Props {
  initialId?: number
  onBack: () => void
}

export function ComunicadosPage({ initialId, onBack }: Props) {
  const [selected, setSelected] = useState<Comunicado>(
    COMUNICADOS.find(c => c.id === initialId) ?? COMUNICADOS[0]
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-[14px] px-[24px] py-[16px] border-b border-border flex-shrink-0">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-[6px] border-none bg-transparent cursor-pointer font-hanken font-medium text-[13px] text-text-muted hover:text-ink transition-colors duration-150 p-0"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Voltar
        </button>
        <span className="text-border">|</span>
        <span className="font-archivo font-semibold text-[14px] text-ink">Comunicados</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex-shrink-0 overflow-y-auto border-r border-border py-[12px] scrollbar-none" style={{ width: '280px', scrollbarWidth: 'none' }}>
          {COMUNICADOS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`
                w-full text-left px-[16px] py-[14px] border-none cursor-pointer transition-colors duration-150
                flex items-start gap-[12px] border-b border-border last:border-b-0
                ${selected.id === c.id ? 'bg-[rgba(174,58,35,0.06)]' : 'bg-transparent hover:bg-tile-bg'}
              `}
            >
              <div
                className="flex-shrink-0 w-[36px] h-[36px] rounded-[10px] flex items-center justify-center mt-[1px]"
                style={{ background: selected.id === c.id ? 'rgba(174,58,35,0.12)' : '#F0EDE8' }}
              >
                <FileText size={16} strokeWidth={1.7} style={{ color: selected.id === c.id ? '#AE3A23' : '#9A958F' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-hanken font-medium text-[13px] leading-[1.35] mb-[4px] line-clamp-2"
                  style={{ color: selected.id === c.id ? '#AE3A23' : 'var(--color-ink)' }}
                >
                  {c.title}
                </div>
                <div className="inline-flex items-center gap-[4px] font-hanken text-[11px] text-text-faint">
                  <Calendar size={10} strokeWidth={1.8} />
                  {c.date}
                </div>
              </div>
              {selected.id === c.id && (
                <div className="flex-shrink-0 w-[3px] self-stretch rounded-full bg-accent -mr-[16px]" />
              )}
            </button>
          ))}
        </aside>

        {/* PDF viewer */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F3F0]">
          <div className="flex items-start gap-[16px] px-[28px] py-[20px] border-b border-border bg-surface flex-shrink-0">
            <div>
              <h2 className="m-0 mb-[4px] font-archivo font-semibold text-[17px] leading-[1.3] text-ink">
                {selected.title}
              </h2>
              <p className="m-0 font-hanken text-[13px] text-text-muted leading-[1.5]">
                {selected.desc}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-[20px]">
            {selected.pdfUrl ? (
              <iframe
                key={selected.id}
                src={selected.pdfUrl}
                className="w-full h-full rounded-[12px] border border-border"
                title={selected.title}
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-[12px] text-text-faint">
                <FileText size={48} strokeWidth={1.2} />
                <span className="font-hanken text-[14px]">Nenhum documento anexado</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
