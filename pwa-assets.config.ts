import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Fonte: public/hub-icon-source.png — o wordmark "exto" (o mesmo do
// favicon.ico atual, logo novo) centralizado num tile branco quadrado. O
// wordmark em si é retangular (256x110), por isso não dá pra apontar
// direto pro favicon.ico/wordmark — precisa de um mestre quadrado. Fica
// dentro de public/ (mesma pasta da imagem-fonte) de propósito: é onde
// este gerador sempre escreve os PNGs de saída, então rodar de novo não
// exige mover arquivo nenhum na mão.
//
// Preset minimal2023 cobre o mínimo pra instalabilidade (192/512 any +
// maskable, apple-touch-icon) sem os tamanhos legados do preset "all"
// (splash screens de iOS antigo etc.), que este app não usa.
export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    transparent: {
      ...minimal2023Preset.transparent,
      // Sem favicon.ico aqui: o público/favicon.ico é o wordmark oficial
      // (ver commit "feat: favicon com o logo novo no hub") — gerar um
      // segundo favicon.ico a partir do tile quadrado sobrescreveria esse
      // arquivo com uma versão errada a cada `generate-pwa-assets`.
      favicons: [],
    },
    maskable: {
      ...minimal2023Preset.maskable,
      // O tile-fonte já tem bastante margem branca ao redor do wordmark
      // (72% da largura do canvas) — padding extra baixo evita que o
      // wordmark fique minúsculo demais dentro da máscara do Android.
      padding: 0.1,
    },
  },
  images: ['public/hub-icon-source.png'],
})
