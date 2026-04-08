import { defineConfig } from 'vite'
import transformImports from '@rolldown/plugin-transform-imports'
import path from 'node:path'

export default defineConfig({
  plugins: [
    transformImports({
      modules: {
        'mock-lib': {
          transform: 'mock-lib/{{kebabCase member}}',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      'mock-lib': path.resolve(import.meta.dirname, './src/mock-lib'),
    },
  },
})
