const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/** "2026-08-29T18:30:00-03:00" -> "Sex, 29 de agosto · 18h30" (fuso local). */
export function formatarInicio(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} · ${d.getHours()}h${min}`
}

/** O evento ainda não passou (compara pelo dia, não pelo horário — o evento
 *  de hoje à noite continua no banner durante o dia todo). */
export function eventoFuturo(iso: string): boolean {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return false
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return d.getTime() >= hoje.getTime()
}
