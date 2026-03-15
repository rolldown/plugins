import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import jotai from '@rolldown/plugin-jotai'

export default defineConfig({
  input: resolve(import.meta.dirname, '../shared-app/src/index.tsx'),
  output: {
    dir: resolve(import.meta.dirname, '../dist/custom'),
  },
  plugins: [jotai({ debugLabel: true, reactRefresh: true })],
})
