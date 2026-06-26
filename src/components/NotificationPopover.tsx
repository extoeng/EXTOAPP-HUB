import { useEffect, useRef } from 'react'
import { CheckCheck } from 'lucide-react'

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Novo informe de rendimento disponível',
    desc: 'Seu holerite de junho já está disponível no sistema.',
    time: 'Agora mesmo',
    unread: true,
    color: '#AE3A23',
  },
  {
    id: 2,
    title: 'Reembolso em análise',
    desc: '2 solicitações de reembolso estão aguardando aprovação.',
    time: '15 min atrás',
    unread: true,
    color: '#9A6A12',
  },
  {
    id: 3,
    title: 'Chamado TI atualizado',
    desc: 'Seu chamado #4521 foi atribuído à equipe de infraestrutura.',
    time: '1h atrás',
    unread: true,
    color: '#2A5A8C',
  },
  {
    id: 4,
    title: 'Acompanhamento de Obras atualizado',
    desc: 'Novo avanço físico registrado na Obra Lote 7.',
    time: '3h atrás',
    unread: false,
    color: '#2F7D5B',
  },
  {
    id: 5,
    title: 'Nova Política de Segurança',
    desc: 'Treinamento NR-18 obrigatório disponível até 30/06.',
    time: 'Ontem',
    unread: false,
    color: '#AE3A23',
  },
]

interface Props {
  onClose: () => void
}

export function NotificationPopover({ onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length

  return (
    <div
      ref={ref}
      className="absolute right-0 top-[calc(100%+10px)] z-50 animate-ex-float"
      style={{
        width: '340px',
        background: '#fff',
        border: '1px solid #EAE7E2',
        borderRadius: '16px',
        boxShadow: '0 16px 40px -10px rgba(38,37,36,0.18)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-[18px] pt-[16px] pb-[12px] border-b border-border">
        <div className="flex items-center gap-[8px]">
          <span className="font-archivo font-semibold text-[14px] text-ink">Notificações</span>
          {unreadCount > 0 && (
            <span className="font-hanken font-semibold text-[11px] text-accent bg-[rgba(174,58,35,0.10)] px-[7px] py-[2px] rounded-full">
              {unreadCount} novas
            </span>
          )}
        </div>
        <button className="inline-flex items-center gap-[5px] font-hanken text-[12px] text-text-muted hover:text-accent transition-colors duration-150 border-none bg-transparent cursor-pointer">
          <CheckCheck size={13} strokeWidth={2} />
          Marcar todas
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col py-[6px]">
        {NOTIFICATIONS.map(n => (
          <div
            key={n.id}
            className="flex gap-[12px] px-[18px] py-[12px] cursor-pointer hover:bg-[#F9F8F6] transition-colors duration-150"
          >
            <div className="flex-shrink-0 mt-[3px]">
              <div
                className="w-[8px] h-[8px] rounded-full mt-[1px]"
                style={{ background: n.unread ? n.color : 'transparent', border: n.unread ? 'none' : '1.5px solid #D6D1C9' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-hanken text-[13px] leading-[1.35] ${n.unread ? 'font-medium text-ink' : 'font-normal text-text-muted'}`}>
                {n.title}
              </div>
              <div className="font-hanken font-normal text-[12px] leading-[1.4] text-text-muted-2 mt-[2px]">
                {n.desc}
              </div>
              <div className="font-hanken text-[11px] text-text-faint mt-[4px]">
                {n.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-[18px] py-[12px]">
        <button className="w-full text-center font-hanken font-medium text-[13px] text-accent hover:text-[#8a2e1b] transition-colors duration-150 border-none bg-transparent cursor-pointer">
          Ver todas as notificações
        </button>
      </div>
    </div>
  )
}
