import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import { withFilter } from 'rolldown/filter'
import swc from '@rollup/plugin-swc'

export default defineConfig({
  input: resolve(import.meta.dirname, '../shared-app/src/index.js'),
  external: [/^ui-components/, /^utils-lib/, /^icons-pack/, /^data-helpers/, /^form-controls/],
  output: {
    dir: resolve(import.meta.dirname, '../dist/swc'),
  },
  plugins: [
    withFilter(
      swc({
        swc: {
          jsc: {
            parser: {
              syntax: 'ecmascript',
            },
            experimental: {
              plugins: [
                [
                  '@swc/plugin-transform-imports',
                  {
                    'ui-components': { transform: 'ui-components/lib/{{ kebabCase member }}' },
                    'utils-lib': { transform: 'utils-lib/{{ camelCase member }}' },
                    'icons-pack': { transform: 'icons-pack/icons/{{ kebabCase member }}' },
                    'data-helpers': { transform: 'data-helpers/{{ member }}' },
                    'form-controls': { transform: 'form-controls/lib/{{ kebabCase member }}' },
                  },
                ],
              ],
            },
          },
        },
      }),
      {
        transform: {
          id: { include: /\.[jt]sx?$/, exclude: /node_modules/ },
        },
      },
    ),
  ],
})
