import { ArrowLeft, Calendar, FileText, Download, ChevronDown, X, Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { LibraryDoc } from '../types'
import { fetchDocuments, uploadDocument, type DocType } from '../services/documents'

interface Props {
  title: string
  tipo: DocType
  /** Estado inicial/fallback enquanto a API não responde (ou se falhar). */
  fallbackItems: LibraryDoc[]
  initialId?: number
  onBack: () => void
  emptyMessage?: string
  /** Exibe o botão "Adicionar documento" — decidido pelo chamador conforme permissão do usuário. */
  canUpload?: boolean
}

const PAGE_SIZE = 10

export function DocumentLibrary({ title, tipo, fallbackItems, initialId, onBack, emptyMessage = 'Nenhum documento anexado', canUpload = false }: Props) {
  const [docs, setDocs] = useState<LibraryDoc[]>(fallbackItems)
  const [selected, setSelected] = useState<LibraryDoc | undefined>(
    fallbackItems.find(c => c.id === initialId) ?? fallbackItems[0]
  )
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // API é a fonte de verdade quando disponível; fallbackItems só cobre o
  // instante antes da resposta chegar (ou uma eventual falha de rede).
  useEffect(() => {
    fetchDocuments(tipo).then(list => {
      if (!list) return
      setDocs(list)
      setSelected(list.find(c => c.id === initialId) ?? list[0])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo])

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setUploadError(null)
    const doc = await uploadDocument(tipo, file)
    setUploading(false)
    if (!doc) {
      setUploadError('Não foi possível enviar o documento. Tente novamente.')
      return
    }
    setDocs(prev => [doc, ...prev])
    setSelected(doc)
    setVisibleCount(PAGE_SIZE)
  }

  const filtered = useMemo(() => {
    return docs.filter(c => {
      if (dateFrom && c.dateISO < dateFrom) return false
      if (dateTo && c.dateISO > dateTo) return false
      return true
    })
  }, [docs, dateFrom, dateTo])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  const updateFilter = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
    setVisibleCount(PAGE_SIZE)
  }

  const clearFilter = () => updateFilter('', '')

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
        <span className="font-archivo font-semibold text-[20px] text-ink">{title}</span>

        {canUpload && (
          <>
            <div className="ml-auto flex items-center gap-[10px]">
              {uploadError && (
                <span className="font-hanken text-[12px] text-red-600">{uploadError}</span>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="
                  inline-flex items-center gap-[6px] px-[14px] py-[8px] rounded-[9px]
                  border-none bg-accent text-white cursor-pointer disabled:opacity-60 disabled:cursor-default
                  font-hanken font-medium text-[13px]
                  hover:brightness-95 transition-[filter] duration-150
                "
              >
                <Plus size={15} strokeWidth={2.2} />
                {uploading ? 'Enviando...' : 'Adicionar documento'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelected}
              className="hidden"
            />
          </>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex flex-col flex-shrink-0 border-r border-border" style={{ width: '280px' }}>
          {/* Filtro de data */}
          <div className="px-[16px] pt-[14px] pb-[12px] border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between mb-[8px]">
              <span className="font-archivo font-semibold text-[11px] tracking-[0.08em] uppercase text-label">
                Filtrar por data
              </span>
              {(dateFrom || dateTo) && (
                <button
                  onClick={clearFilter}
                  className="inline-flex items-center gap-[3px] border-none bg-transparent cursor-pointer font-hanken text-[11px] text-accent p-0"
                >
                  <X size={11} strokeWidth={2} />
                  Limpar
                </button>
              )}
            </div>
            <div className="flex gap-[8px]">
              <input
                type="date"
                value={dateFrom}
                onChange={e => updateFilter(e.target.value, dateTo)}
                className="flex-1 min-w-0 border border-border rounded-[8px] px-[8px] py-[6px] font-hanken text-[12px] text-ink bg-bg-app outline-none focus:border-accent"
              />
              <input
                type="date"
                value={dateTo}
                onChange={e => updateFilter(dateFrom, e.target.value)}
                className="flex-1 min-w-0 border border-border rounded-[8px] px-[8px] py-[6px] font-hanken text-[12px] text-ink bg-bg-app outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {visible.length === 0 && (
              <div className="px-[16px] py-[24px] text-center font-hanken text-[13px] text-text-faint">
                Nenhum item no período.
              </div>
            )}
            {visible.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`
                  w-full text-left px-[16px] py-[14px] border-none cursor-pointer transition-colors duration-150
                  flex items-start gap-[12px] border-b border-border
                  ${selected?.id === c.id ? 'bg-[rgba(174,58,35,0.06)]' : 'bg-transparent hover:bg-tile-bg'}
                `}
              >
                <div
                  className="flex-shrink-0 w-[36px] h-[36px] rounded-[10px] flex items-center justify-center mt-[1px]"
                  style={{ background: selected?.id === c.id ? 'rgba(174,58,35,0.12)' : '#F0EDE8' }}
                >
                  <FileText size={16} strokeWidth={1.7} style={{ color: selected?.id === c.id ? '#AE3A23' : '#9A958F' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-hanken font-medium text-[13px] leading-[1.35] mb-[4px] line-clamp-2"
                    style={{ color: selected?.id === c.id ? '#AE3A23' : 'var(--color-ink)' }}
                  >
                    {c.title}
                  </div>
                  <div className="inline-flex items-center gap-[4px] font-hanken text-[11px] text-text-faint">
                    <Calendar size={10} strokeWidth={1.8} />
                    {c.date}
                  </div>
                </div>
                {selected?.id === c.id && (
                  <div className="flex-shrink-0 w-[3px] self-stretch rounded-full bg-accent -mr-[16px]" />
                )}
              </button>
            ))}

            {hasMore && (
              <button
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                className="w-full flex items-center justify-center gap-[6px] px-[16px] py-[13px] border-none bg-transparent cursor-pointer font-hanken font-medium text-[13px] text-accent hover:bg-tile-bg transition-colors duration-150"
              >
                <ChevronDown size={15} strokeWidth={2} />
                Ver mais {Math.min(PAGE_SIZE, filtered.length - visibleCount)}
              </button>
            )}
          </div>
        </aside>

        {/* PDF viewer */}
        <div className="flex-1 relative overflow-hidden bg-[#F5F3F0]">
          {selected?.pdfUrl ? (
            <>
              <iframe
                key={selected.id}
                src={`${selected.pdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none"
                title={selected.title}
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
              <a
                href={selected.pdfUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                title="Baixar PDF"
                className="
                  absolute top-[16px] right-[16px] w-[38px] h-[38px] rounded-[10px]
                  bg-surface border border-border shadow-card-hover
                  flex items-center justify-center text-icon-default no-underline
                  hover:border-border-hover hover:-translate-y-[1px]
                  transition-all duration-150
                "
              >
                <Download size={17} strokeWidth={1.8} />
              </a>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-[12px] text-text-faint">
              <FileText size={48} strokeWidth={1.2} />
              <span className="font-hanken text-[14px]">{emptyMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
