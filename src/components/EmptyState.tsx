import { Search } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="text-center py-[80px] px-[20px] text-text-faint">
      <div className="w-[54px] h-[54px] rounded-[14px] bg-[#EDEAE5] flex items-center justify-center mx-auto mb-[16px] text-label-2">
        <Search size={26} strokeWidth={1.7} />
      </div>
      <div className="font-archivo font-semibold text-[16px] text-text-muted mb-[5px]">
        Nenhum aplicativo encontrado
      </div>
      <div className="font-hanken font-normal text-[13.5px]">
        Tente outro termo de busca ou categoria.
      </div>
    </div>
  )
}
