import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import emotion from '@rolldown/plugin-emotion'

export default defineConfig({
  input: resolve(import.meta.dirname, '../shared-app/src/index.tsx'),
  output: {
    dir: resolve(import.meta.dirname, '../dist/custom'),
  },
  plugins: [emotion({ autoLabel: 'always', sourceMap: false })],
})
