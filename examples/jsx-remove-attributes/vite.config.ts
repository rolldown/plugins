import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jsxRemoveAttributes from '@rolldown/plugin-jsx-remove-attributes'

export default defineConfig({
  plugins: [jsxRemoveAttributes(), react()],
})
