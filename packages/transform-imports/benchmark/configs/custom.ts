import { defineConfig } from 'rolldown'
import { resolve } from 'node:path'
import transformImports from '@rolldown/plugin-transform-imports'

const modules = {
  'ui-components': { transform: 'ui-components/lib/{{kebabCase member}}' },
  'utils-lib': { transform: 'utils-lib/{{camelCase member}}' },
  'icons-pack': { transform: 'icons-pack/icons/{{kebabCase member}}' },
  'data-helpers': { transform: 'data-helpers/{{member}}' },
  'form-controls': { transform: 'form-controls/lib/{{kebabCase member}}' },
}

export default defineConfig({
  input: resolve(import.meta.dirname, '../shared-app/src/index.js'),
  external: [/^ui-components/, /^utils-lib/, /^icons-pack/, /^data-helpers/, /^form-controls/],
  output: {
    dir: resolve(import.meta.dirname, '../dist/custom'),
  },
  plugins: [transformImports(modules)],
})
