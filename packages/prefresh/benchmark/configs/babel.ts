import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import babel, { defineRolldownBabelPreset } from '@rolldown/plugin-babel'

const prefreshPreset = defineRolldownBabelPreset({
  preset: () => ({
    plugins: [['@prefresh/babel-plugin', { skipEnvCheck: true }]],
  }),
  rolldown: {
    filter: {
      id: { include: /\.[jt]sx?$/, exclude: /node_modules/ },
      code: /createContext/,
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
      presets: [prefreshPreset],
    }),
  ],
})
