import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['jspdf', 'canvg', 'core-js'],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
