import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import babel, { defineRolldownBabelPreset } from '@rolldown/plugin-babel'

const jotaiPreset = defineRolldownBabelPreset({
  preset: () => ({
    plugins: ['jotai/babel/plugin-debug-label', 'jotai/babel/plugin-react-refresh'],
  }),
  rolldown: {
    filter: {
      id: { include: /\.[jt]sx?$/ },
      code: /atom/,
    },
  },
})

export default defineConfig({
  input: resolve(import.meta.dirname, '../shared-app/src/index.tsx'),
  output: {
    dir: resolve(import.meta.dirname, '../dist/babel'),
  },
  plugins: [
    babel({
      presets: [jotaiPreset],
    }),
  ],
})
