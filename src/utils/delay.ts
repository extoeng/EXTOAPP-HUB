/** Espera fixa em ms — usado pra segurar uma tela de loading por um tempo
 *  mínimo (ex.: animação que não pode ser cortada antes de rodar por completo). */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
