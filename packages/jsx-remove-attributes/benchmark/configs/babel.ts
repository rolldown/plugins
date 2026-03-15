import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import babel, { defineRolldownBabelPreset } from '@rolldown/plugin-babel'

const removePropertiesPreset = defineRolldownBabelPreset({
  preset: () => ({
    plugins: [['babel-plugin-react-remove-properties', { properties: [/^data-test/] }]],
  }),
  rolldown: {
    filter: {
      id: { include: /\.[jt]sx?$/, exclude: /node_modules/ },
      code: /data-test/,
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
      presets: [removePropertiesPreset],
    }),
  ],
})
