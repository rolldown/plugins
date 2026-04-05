import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import babel, { defineRolldownBabelPreset } from '@rolldown/plugin-babel'

const styledJsxPreset = defineRolldownBabelPreset({
  preset: () => ({
    plugins: ['styled-jsx/babel'],
  }),
  rolldown: {
    filter: {
      id: { include: /\.[jt]sx$/, exclude: /node_modules/ },
      code: /style/,
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
      presets: [styledJsxPreset],
    }),
  ],
})
