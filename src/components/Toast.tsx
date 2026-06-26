interface Props {
  appName: string
}

export function Toast({ appName }: Props) {
  return (
    <div className="
      fixed left-1/2 bottom-[28px] -translate-x-1/2
      bg-ink text-white px-[22px] py-[13px] rounded-[30px]
      font-hanken font-medium text-[13.5px]
      shadow-toast z-[60]
      flex items-center gap-[11px]
      animate-ex-float
    ">
      <span className="w-[8px] h-[8px] rounded-full bg-accent animate-ex-pulse-fast" />
      Abrindo {appName}…
    </div>
  )
}
