import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/superman/',  // 🔑 確保有結尾的斜線 /
  server: {
    port: 5173,
    host: true
  }
})