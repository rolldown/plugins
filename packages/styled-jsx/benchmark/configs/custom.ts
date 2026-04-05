import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import styledJsx from '@rolldown/plugin-styled-jsx'

export default defineConfig({
  input: resolve(import.meta.dirname, '../shared-app/src/index.tsx'),
  output: {
    dir: resolve(import.meta.dirname, '../dist/custom'),
  },
  plugins: [styledJsx()],
})
