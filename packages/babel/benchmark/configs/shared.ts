import { resolve } from 'node:path'
import type { RolldownOptions } from 'rolldown'
import babel from '@rolldown/plugin-babel'

export function createConfig(name: string, parallel: boolean): RolldownOptions {
  return {
    input: resolve(import.meta.dirname, '../shared-app/src/index.js'),
    output: {
      dir: resolve(import.meta.dirname, '../dist', name),
    },
    plugins: [
      babel({
        parallel,
        plugins: [['@babel/plugin-proposal-decorators', { version: '2023-11' }]],
      }),
    ],
  }
}
