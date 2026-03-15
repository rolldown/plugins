import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import relay from '@rolldown/plugin-relay'

export default defineConfig({
  input: resolve(import.meta.dirname, '../shared-app/src/index.tsx'),
  output: {
    dir: resolve(import.meta.dirname, '../dist/custom'),
  },
  plugins: [
    relay({
      artifactDirectory: resolve(import.meta.dirname, '../shared-app/src/__generated__'),
      language: 'typescript',
      eagerEsModules: true,
    }),
  ],
})
