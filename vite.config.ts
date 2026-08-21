import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate: troca o service worker assim que uma versão nova é
      // publicada, sem prompt de "há uma atualização disponível" — este é
      // o hub de entrada do ecossistema, não pode travar numa versão velha
      // do bundle esperando o usuário aceitar atualizar.
      registerType: 'autoUpdate',
      // Nada de cache de API aqui — o service worker gerado (workbox
      // generateSW) só precacha os assets do build (js/css/html/ícones);
      // chamadas a /api/** nunca passam pelo glob padrão, então login/SSO
      // sempre bate no servidor, nunca em uma resposta velha guardada.
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
      },
      manifest: {
        name: 'extoapp',
        short_name: 'extoapp',
        description: 'Hub de acesso aos apps da Exto',
        lang: 'pt-BR',
        theme_color: '#7e14ff',
        background_color: '#F4F3F1', // mesmo tom de bg-app (tailwind.config.js) — evita flash escuro no boot
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    // Dev local: espelha o rewrite do Hosting — /api vai pra API no Cloud Run.
    // Assim o front usa sempre o mesmo caminho (/api), sem CORS em dev nem prod.
    proxy: {
      '/api': {
        target: 'https://nexus-582146265415.southamerica-east1.run.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
