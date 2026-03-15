import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import prefresh from '@rolldown/plugin-prefresh'

export default defineConfig({
  input: resolve(import.meta.dirname, '../shared-app/src/index.tsx'),
  output: {
    dir: resolve(import.meta.dirname, '../dist/custom'),
  },
  transform: {
    jsx: {
      development: true,
      refresh: true,
    },
  },
  plugins: [prefresh({ enabled: true })],
})
