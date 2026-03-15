import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import jsxRemoveAttributes from '@rolldown/plugin-jsx-remove-attributes'

export default defineConfig({
  input: resolve(import.meta.dirname, '../shared-app/src/index.tsx'),
  output: {
    dir: resolve(import.meta.dirname, '../dist/custom'),
  },
  plugins: [jsxRemoveAttributes()],
})
