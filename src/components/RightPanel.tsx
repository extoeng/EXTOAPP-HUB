import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { useState } from 'react'

const MEETINGS = [
  {
    id: 1,
    title: 'Reunião de Obras — Lote 7',
    time: '09:00',
    duration: '1h',
    location: 'Sala de Projetos',
    color: '#AE3A23',
  },
  {
    id: 2,
    title: 'Alinhamento RH',
    time: '11:30',
    duration: '30min',
    location: 'Meet',
    color: '#2A5A8C',
  },
  {
    id: 3,
    title: 'Revisão de Orçamento Q3',
    time: '14:00',
    duration: '2h',
    location: 'Sala Financeiro',
    color: '#2F7D5B',
  },
  {
    id: 4,
    title: 'Check-in com Fornecedor',
    time: '16:30',
    duration: '45min',
    location: 'Telefone',
    color: '#9A6A12',
  },
]

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const CARD_STYLE: React.CSSProperties = {
  borderRadius: '20px',
  background: '#fff',
  border: '1px solid #EAE7E2',
  boxShadow: '0 4px 24px -6px rgba(38,37,36,0.10)',
}

export function RightPanel() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="flex-shrink-0 flex flex-col gap-[8px] overflow-y-auto py-[8px] pr-[8px] scrollbar-none" style={{ width: '240px', scrollbarWidth: 'none' }}>

      {/* Calendar card */}
      <div style={CARD_STYLE} className="px-[16px] pt-[16px] pb-[14px] flex-shrink-0">
        <div className="flex items-center justify-between mb-[12px]">
          <button
            onClick={prevMonth}
            className="w-[26px] h-[26px] flex items-center justify-center rounded-[8px] text-text-muted hover:bg-tile-bg border-none bg-transparent cursor-pointer transition-colors duration-150"
          >
            <ChevronLeft size={14} strokeWidth={2} />
          </button>
          <span className="font-archivo font-semibold text-[12.5px] text-ink">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-[26px] h-[26px] flex items-center justify-center rounded-[8px] text-text-muted hover:bg-tile-bg border-none bg-transparent cursor-pointer transition-colors duration-150"
          >
            <ChevronRight size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-[2px]">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center font-archivo font-semibold text-[10px] text-label-2 py-[3px]">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-[1px]">
          {cells.map((d, i) => (
            <div key={i} className="flex items-center justify-center aspect-square">
              {d !== null && (
                <button
                  className={`
                    w-[26px] h-[26px] flex items-center justify-center rounded-full
                    font-hanken text-[11.5px] cursor-pointer border-none transition-colors duration-150
                    ${isToday(d)
                      ? 'bg-accent text-white font-semibold'
                      : 'bg-transparent text-ink-soft hover:bg-tile-bg font-normal'
                    }
                  `}
                >
                  {d}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Meetings card */}
      <div style={CARD_STYLE} className="px-[16px] pt-[14px] pb-[16px] flex-shrink-0">
        <div className="font-archivo font-semibold text-[11px] tracking-[0.08em] uppercase text-label mb-[12px]">
          Hoje
        </div>

        <div className="flex flex-col gap-[12px]">
          {MEETINGS.map(m => (
            <div key={m.id} className="flex gap-[10px] cursor-pointer group">
              <div className="w-[3px] rounded-full flex-shrink-0 self-stretch" style={{ background: m.color }} />
              <div className="flex-1 min-w-0">
                <div className="font-hanken font-medium text-[12.5px] leading-[1.3] text-ink group-hover:text-accent transition-colors duration-150">
                  {m.title}
                </div>
                <div className="flex flex-wrap gap-x-[8px] mt-[4px]">
                  <span className="inline-flex items-center gap-[3px] font-hanken text-[11px] text-text-faint">
                    <Clock size={10} strokeWidth={1.8} />
                    {m.time} · {m.duration}
                  </span>
                  <span className="inline-flex items-center gap-[3px] font-hanken text-[11px] text-text-faint">
                    <MapPin size={10} strokeWidth={1.8} />
                    {m.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
