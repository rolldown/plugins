import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import babel, { defineRolldownBabelPreset } from '@rolldown/plugin-babel'

const emotionPreset = defineRolldownBabelPreset({
  preset: () => ({
    plugins: [['@emotion/babel-plugin', { autoLabel: 'always', sourceMap: false }]],
  }),
  rolldown: {
    filter: {
      id: /\.[jt]sx?$/,
      code: '@emotion',
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
      presets: [emotionPreset],
    }),
  ],
})
