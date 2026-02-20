import { assert, expect, test } from 'vitest'
import babelPlugin from './index.ts'
import * as babel from '@babel/core'
import { rolldown, type OutputChunk } from 'rolldown'

test('plugin works', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).toContain('const result = true')
})

async function build(
  filename: string,
  code: string,
  options: babel.TransformOptions,
): Promise<OutputChunk> {
  const bundle = await rolldown({
    input: filename,
    plugins: [
      {
        name: 'virtual',
        resolveId(id) {
          if (id === filename) {
            return id
          }
        },
        load(id) {
          if (id === filename) {
            return code
          }
        },
      },
      babelPlugin(options),
    ],
  })
  const { output } = await bundle.generate()
  assert(output[0].type === 'chunk')
  return output[0]
}

function identifierReplaceBabelPlugin(name: string, value: boolean): babel.PluginItem {
  return ({ types: t }): babel.PluginObj => ({
    visitor: {
      Identifier(path) {
        if (path.node.name === 'foo') {
          path.replaceWith(t.booleanLiteral(value))
        }
      },
    },
  })
}
