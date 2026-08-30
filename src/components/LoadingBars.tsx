// Barras pulsantes (padrão "bars" da loading-ui) — a animação única de
// transição de app do ecossistema. CSS puro: keyframes em index.css
// (@keyframes loading-bars), cor pelo token accent do Tailwind.
export function LoadingBars() {
  return (
    <div className="flex items-center gap-[5px]" role="status" aria-label="Carregando">
      {[0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className="w-[6px] h-[32px] rounded-full bg-accent"
          style={{ animation: 'loading-bars 1s ease-in-out infinite', animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  )
}
