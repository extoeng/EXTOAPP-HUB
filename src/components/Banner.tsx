import { ArrowRight, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { COMUNICADOS } from '../data/comunicados'

const INTERVAL_MS = 8000
const TRANSITION_MS = 650

interface Props {
  onRead: (id: number) => void
}

export function Banner({ onRead }: Props) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % COMUNICADOS.length)
        setVisible(true)
      }, TRANSITION_MS)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  const c = COMUNICADOS[index]

  const goTo = (i: number) => {
    if (i === index) return
    setVisible(false)
    setTimeout(() => { setIndex(i); setVisible(true) }, TRANSITION_MS)
  }

  return (
    <div>
      <div
        className="bg-surface border border-border border-l-4 border-l-accent rounded-[14px] px-[26px] py-[22px] flex items-center gap-[26px]"
        style={{
          transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[12px] mb-[11px]">
            <span className="font-archivo font-semibold text-[10.5px] leading-none tracking-[0.12em] uppercase text-accent bg-[rgba(174,58,35,0.10)] px-[10px] py-[5px] rounded-[20px]">
              Comunicado
            </span>
            <span className="inline-flex items-center gap-[6px] font-hanken font-medium text-[12px] text-text-faint">
              <Calendar size={14} strokeWidth={1.7} />
              {c.date}
            </span>
          </div>
          <h2 className="m-0 mb-[6px] font-archivo font-semibold text-[19px] leading-[1.3] text-ink">
            {c.title}
          </h2>
          <p className="m-0 font-hanken font-normal text-[14px] leading-[1.5] text-text-muted-2 max-w-[62ch]">
            {c.desc}
          </p>
        </div>
        <button
          onClick={() => onRead(c.id)}
          className="
            flex-shrink-0 inline-flex items-center gap-[9px]
            bg-accent text-white border-none rounded-[11px] px-[20px] py-[12px]
            font-hanken font-semibold text-[14px] cursor-pointer
            transition-all duration-150 ease-out
            hover:brightness-[0.93] hover:-translate-y-[1px]
          "
        >
          Ler comunicado
          <ArrowRight size={17} strokeWidth={1.7} />
        </button>
      </div>

      <div className="flex justify-center gap-[6px] mt-[10px]">
        {COMUNICADOS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="border-none p-0 cursor-pointer rounded-full transition-all duration-200"
            style={{
              width: i === index ? '18px' : '6px',
              height: '6px',
              background: i === index ? '#AE3A23' : '#D9D5D0',
            }}
          />
        ))}
      </div>
    </div>
  )
}
