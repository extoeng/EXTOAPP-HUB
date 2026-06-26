export function useGreeting(firstName: string): { greeting: string; today: string } {
  const h = new Date().getHours()
  const greet = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'

  let today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
  today = today.charAt(0).toUpperCase() + today.slice(1)

  return { greeting: `${greet}, ${firstName}`, today }
}
