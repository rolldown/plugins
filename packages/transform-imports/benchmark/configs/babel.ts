import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import babel, { defineRolldownBabelPreset } from '@rolldown/plugin-babel'

// babel-plugin-transform-imports uses ${member} syntax instead of {{member}}
// and camelCase/kebabCase are provided as function options, not template helpers.
// The Babel plugin supports a `transform` function in JS config.
const transformImportsPreset = defineRolldownBabelPreset({
  preset: () => ({
    plugins: [
      [
        'babel-plugin-transform-imports',
        {
          'ui-components': { transform: 'ui-components/lib/${member}', preventFullImport: false },
          'utils-lib': { transform: 'utils-lib/${member}', preventFullImport: false },
          'icons-pack': { transform: 'icons-pack/icons/${member}', preventFullImport: false },
          'data-helpers': { transform: 'data-helpers/${member}', preventFullImport: false },
          'form-controls': { transform: 'form-controls/lib/${member}', preventFullImport: false },
        },
      ],
    ],
  }),
  rolldown: {
    filter: {
      id: { include: /\.[jt]sx?$/, exclude: /node_modules/ },
    },
  },
})

export default defineConfig({
  input: resolve(import.meta.dirname, '../shared-app/src/index.js'),
  external: [/^ui-components/, /^utils-lib/, /^icons-pack/, /^data-helpers/, /^form-controls/],
  output: {
    dir: resolve(import.meta.dirname, '../dist/babel'),
  },
  plugins: [
    babel({
      presets: [transformImportsPreset],
    }),
  ],
})
