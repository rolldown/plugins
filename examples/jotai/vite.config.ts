import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jotai from '@rolldown/plugin-jotai'

export default defineConfig({
  plugins: [
    jotai(),
    react(),
  ],
})
