// Carrossel de EVENTOS abaixo do Banner de Comunicados — mesma anatomia
// (borda esquerda accent, pill, bolinhas, cadência), com capa à esquerda e
// botão de RSVP à direita. Layout validado localmente em 2026-08-25/26.
import { ArrowRight, Calendar, CalendarDays, Check, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Evento } from '../types'
import { formatarInicio } from '../utils/eventoData'

const INTERVAL_MS = 8000
const TRANSITION_MS = 650

interface Props {
  // null = ainda carregando. [] = sem evento futuro cadastrado — o card
  // inteiro some (mesmo contrato do Banner de Comunicados).
  itens: Evento[] | null
  /** Confirma/desconfirma presença — o pai atualiza a lista (otimista). */
  onRsvp: (ev: Evento) => void
  /** Abre a tela de Eventos no evento clicado ("Ver detalhes"). */
  onOpen: (id: number) => void
}

export function EventosBanner({ itens, onRsvp, onOpen }: Props) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!itens || itens.length < 2) return
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % itens.length)
        setVisible(true)
      }, TRANSITION_MS)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [itens])

  if (!itens || itens.length === 0) return null

  const ev = itens[Math.min(index, itens.length - 1)]

  const goTo = (i: number) => {
    if (i === index) return
    setVisible(false)
    setTimeout(() => { setIndex(i); setVisible(true) }, TRANSITION_MS)
  }

  return (
    <div className="mt-[26px]">
      <h3 className="m-0 mb-[14px] font-archivo font-semibold text-[13px] leading-none tracking-[0.08em] uppercase text-label">
        Eventos
      </h3>

      <div
        className="relative overflow-hidden bg-surface border border-border border-l-4 border-l-accent rounded-[14px] flex items-stretch h-[132px]"
        style={{
          transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
        }}
      >
        {/* Capa à esquerda, altura cheia — foto do evento com object-cover;
            sem foto, bloco da marca com ícone genérico. */}
        <div className="flex-shrink-0 w-[210px] h-full overflow-hidden">
          {ev.coverUrl ? (
            <img src={ev.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/85" style={{ background: 'linear-gradient(135deg, #B31C1C, #7d1414)' }}>
              <CalendarDays size={34} strokeWidth={1.4} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center px-[24px]">
          {/* Pill centralizada à esquerda das duas linhas (data/hora em
              cima, local embaixo); título abaixo do conjunto. */}
          <div className="flex items-center gap-[12px] mb-[9px]">
            <span className="font-archivo font-semibold text-[10.5px] leading-none tracking-[0.12em] uppercase text-accent bg-[rgba(179,28,28,0.10)] px-[10px] py-[5px] rounded-[20px] flex-shrink-0">
              {ev.tipo}
            </span>
            <div className="flex flex-col gap-[3px] min-w-0">
              <span className="inline-flex items-center gap-[6px] font-hanken font-medium text-[12px] text-text-faint">
                <Calendar size={14} strokeWidth={1.7} />
                {formatarInicio(ev.inicioISO)}
              </span>
              {ev.local && (
                <span className="inline-flex items-center gap-[6px] font-hanken font-medium text-[12px] text-text-faint">
                  <MapPin size={14} strokeWidth={1.7} />
                  {ev.local}
                </span>
              )}
            </div>
          </div>
          <h2 className="m-0 font-archivo font-semibold text-[16.5px] leading-[1.3] text-ink line-clamp-2">
            {ev.title}
          </h2>
        </div>
        <div className="flex items-center pr-[24px] flex-shrink-0">
          {ev.rsvpEnabled ? (
            <button
              onClick={() => onRsvp(ev)}
              className={`
                flex-shrink-0 inline-flex items-center gap-[9px]
                rounded-[11px] px-[20px] py-[12px]
                font-hanken font-semibold text-[14px] cursor-pointer
                transition-all duration-150 ease-out
                ${ev.confirmado
                  ? 'bg-surface text-ink border border-border-2 hover:border-border-hover'
                  : 'bg-accent text-white border-none hover:brightness-[0.93] hover:-translate-y-[1px]'}
              `}
            >
              {ev.confirmado
                ? <><Check size={17} strokeWidth={2} /> Presença confirmada</>
                : <>Confirmar presença<ArrowRight size={17} strokeWidth={1.7} /></>}
            </button>
          ) : (
            <button
              onClick={() => onOpen(ev.id)}
              className="flex-shrink-0 inline-flex items-center gap-[9px] bg-surface text-ink border border-border-2 rounded-[11px] px-[20px] py-[12px] font-hanken font-semibold text-[14px] cursor-pointer transition-all duration-150 ease-out hover:border-border-hover"
            >
              Ver detalhes
              <ArrowRight size={17} strokeWidth={1.7} />
            </button>
          )}
        </div>
      </div>

      {itens.length > 1 && (
        <div className="flex justify-center gap-[6px] mt-[10px]">
          {itens.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="border-none p-0 cursor-pointer rounded-full transition-all duration-200"
              style={{
                width: i === index ? '18px' : '6px',
                height: '6px',
                background: i === index ? '#B31C1C' : '#D9D5D0',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
