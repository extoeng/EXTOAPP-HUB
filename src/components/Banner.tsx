import { ArrowRight, Calendar } from 'lucide-react'

export function Banner() {
  return (
    <div className="bg-surface border border-border border-l-4 border-l-accent rounded-[14px] px-[26px] py-[22px] flex items-center gap-[26px]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[12px] mb-[11px]">
          <span className="font-archivo font-semibold text-[10.5px] leading-none tracking-[0.12em] uppercase text-accent bg-[rgba(174,58,35,0.10)] px-[10px] py-[5px] rounded-[20px]">
            Comunicado
          </span>
          <span className="inline-flex items-center gap-[6px] font-hanken font-medium text-[12px] text-text-faint">
            <Calendar size={14} strokeWidth={1.7} />
            23 jun
          </span>
        </div>
        <h2 className="m-0 mb-[6px] font-archivo font-semibold text-[19px] leading-[1.3] text-ink">
          Nova Política de Segurança em Obras entra em vigor
        </h2>
        <p className="m-0 font-hanken font-normal text-[14px] leading-[1.5] text-text-muted-2 max-w-[62ch]">
          Treinamento NR-18 obrigatório disponível até 30/06. Confira as diretrizes atualizadas para todos os canteiros da Exto.
        </p>
      </div>
      <button className="
        flex-shrink-0 inline-flex items-center gap-[9px]
        bg-accent text-white border-none rounded-[11px] px-[20px] py-[12px]
        font-hanken font-semibold text-[14px] cursor-pointer
        transition-all duration-150 ease-out
        hover:brightness-[0.93] hover:-translate-y-[1px]
      ">
        Ler comunicado
        <ArrowRight size={17} strokeWidth={1.7} />
      </button>
    </div>
  )
}
