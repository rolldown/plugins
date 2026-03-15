import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import relay from '@rolldown/plugin-relay'

export default defineConfig({
  plugins: [
    relay({
      language: 'typescript',
      eagerEsModules: true,
    }),
    react(),
  ],
})
