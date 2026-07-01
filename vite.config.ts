import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev local: espelha o rewrite do Hosting — /api vai pra API no Cloud Run.
    // Assim o front usa sempre o mesmo caminho (/api), sem CORS em dev nem prod.
    proxy: {
      '/api': {
        target: 'https://extoapp-api-582146265415.southamerica-east1.run.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
