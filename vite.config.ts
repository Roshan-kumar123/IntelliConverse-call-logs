import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://prod.routesvr6e.aionos.ai',
        changeOrigin: true,
        secure: true,
      },
      '/auth-api': {
        target: 'https://prod.ic6e.aionos.ai',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/auth-api/, ''),
      },
    },
  },
})
