import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import babel, { defineRolldownBabelPreset } from '@rolldown/plugin-babel'

const relayPreset = defineRolldownBabelPreset({
  preset: () => ({
    plugins: [
      [
        'babel-plugin-relay',
        {
          artifactDirectory: resolve(import.meta.dirname, '../shared-app/src/__generated__'),
          language: 'typescript',
          eagerEsModules: true,
        },
      ],
    ],
  }),
  rolldown: {
    filter: {
      id: { include: /\.[jt]sx?$/, exclude: /node_modules/ },
      code: /graphql/,
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
      presets: [relayPreset],
    }),
  ],
})
