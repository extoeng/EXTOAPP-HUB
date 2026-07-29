// Janela de "novo" pra um comunicado — usada tanto no selo diagonal do
// Banner quanto nas notificações do sino (Header/NotificationPopover).
// ponytail: dateISO é a data de publicação escolhida no formulário, não um
// timestamp real de criação (API não expõe created_at pro HUB) — proxy
// aceitável já que o popup preenche a data com "hoje" por padrão.
export const NOVO_JANELA_MS = 24 * 60 * 60 * 1000

export function isComunicadoNovo(dateISO?: string): boolean {
  if (!dateISO) return false
  return Date.now() - new Date(dateISO).getTime() < NOVO_JANELA_MS
}
