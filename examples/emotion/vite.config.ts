import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import emotion from '@rolldown/plugin-emotion'

export default defineConfig({
  plugins: [
    emotion({
      sourceMap: true,
      autoLabel: 'always',
    }),
    react({
      jsxImportSource: '@emotion/react',
    }),
  ],
})
