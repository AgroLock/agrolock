import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this repo from /agrolock/ — only apply that prefix
  // for production builds so `npm run dev` still serves from / locally.
  base: command === 'build' ? '/agrolock/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
}))
