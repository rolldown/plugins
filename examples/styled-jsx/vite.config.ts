import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import styledJsx from '@rolldown/plugin-styled-jsx'

export default defineConfig({
  plugins: [styledJsx(), react()],
})
