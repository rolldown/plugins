import { Plugin, type SourceMapInput } from 'rolldown'
import type { PluginOptions } from './options.ts'

// lazy load babel since it may only be used during development
let babelCache: typeof import('@babel/core')
async function loadBabel() {
  babelCache ||= await import('@babel/core')
  return babelCache
}

function babelPlugin(options: PluginOptions): Plugin {
  return {
    name: '@rolldown/plugin-babel',
    transform: {
      // TODO: filter
      async handler(code) {

        // TODO: filter

        const babel = await loadBabel()
        const result = await babel.transformAsync(code, options)
        if (result) {
          return {
            code: result.code ?? undefined,
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            map: result.map as SourceMapInput,
          }
        }
      },
    },
  }
}

export default babelPlugin
