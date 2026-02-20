import { assert, expect, test } from 'vitest'
import babelPlugin from './index.ts'
import * as babel from '@babel/core'
import { rolldown, type OutputChunk } from 'rolldown'
import path from 'node:path'

test('plugin works', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).toContain('const result = true')
})

test('presets option applies preset transformations', async () => {
  const myPreset = (): babel.TransformOptions => ({
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  const result = await build('foo.js', 'export const result = foo', {
    presets: [myPreset],
  })
  expect(result.code).toContain('const result = true')
})

test('overrides option merges additional transformations', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    overrides: [
      {
        plugins: [identifierReplaceBabelPlugin('foo', true)],
      },
    ],
  })
  expect(result.code).toContain('const result = true')
})

test('comments false strips comments from output', async () => {
  const result = await build('foo.js', '/* strip-me */\nexport const result = 42', {
    comments: false,
  })
  expect(result.code).not.toContain('strip-me')
})

test('shouldPrintComment selectively filters comments', async () => {
  const result = await build(
    'foo.js',
    '/* @license MIT */\n/* internal-note */\nexport const result = 42',
    {
      shouldPrintComment: (comment: string) => comment.includes('@license'),
    },
  )
  expect(result.code).not.toContain('internal-note')
})

test('compact option is forwarded to babel', async () => {
  let receivedCompact: any
  const checkPlugin: babel.PluginItem = (): babel.PluginObj => ({
    visitor: {
      Program(_path, state) {
        receivedCompact = state.file.opts.compact
      },
    },
  })
  await build('foo.js', 'export const result = 42', {
    compact: true,
    plugins: [checkPlugin],
  })
  expect(receivedCompact).toBe(true)
})

test('retainLines option is forwarded to babel', async () => {
  let receivedRetainLines: any
  const checkPlugin: babel.PluginItem = (): babel.PluginObj => ({
    visitor: {
      Program(_path, state) {
        receivedRetainLines = state.file.opts.retainLines
      },
    },
  })
  await build('foo.js', 'export const result = 42', {
    retainLines: true,
    plugins: [checkPlugin],
  })
  expect(receivedRetainLines).toBe(true)
})

test('assumptions are accessible from plugins', async () => {
  let receivedAssumption: boolean | undefined
  const checkPlugin: babel.PluginItem = (api: any): babel.PluginObj => {
    receivedAssumption = api.assumption('setPublicClassFields')
    return { visitor: {} }
  }
  const result = await build('foo.js', 'export const result = 42', {
    assumptions: { setPublicClassFields: true },
    plugins: [checkPlugin],
  })
  expect(receivedAssumption).toBe(true)
  expect(result.code).toContain('const result = 42')
})

test('auxiliaryCommentBefore is forwarded to babel', async () => {
  let receivedValue: string | null | undefined
  const checkPlugin: babel.PluginItem = (): babel.PluginObj => ({
    visitor: {
      Program(_path, state) {
        receivedValue = state.file.opts.auxiliaryCommentBefore
      },
    },
  })
  await build('foo.js', 'export const result = 42', {
    auxiliaryCommentBefore: 'AUX_BEFORE',
    plugins: [checkPlugin],
  })
  expect(receivedValue).toBe('AUX_BEFORE')
})

test('auxiliaryCommentAfter is forwarded to babel', async () => {
  let receivedValue: string | null | undefined
  const checkPlugin: babel.PluginItem = (): babel.PluginObj => ({
    visitor: {
      Program(_path, state) {
        receivedValue = state.file.opts.auxiliaryCommentAfter
      },
    },
  })
  await build('foo.js', 'export const result = 42', {
    auxiliaryCommentAfter: 'AUX_AFTER',
    plugins: [checkPlugin],
  })
  expect(receivedValue).toBe('AUX_AFTER')
})

test('exclude skips transformation for matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    exclude: /\.js$/,
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).not.toContain('const result = true')
})

test('exclude allows transformation for non-matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    exclude: /\.ts$/,
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).toContain('const result = true')
})

test('include activates config only for matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    include: /\.js$/,
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).toContain('const result = true')
})

test('include skips transformation for non-matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    include: /\.ts$/,
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).not.toContain('const result = true')
})

test('ignore skips transformation for matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    ignore: [/foo\.js$/],
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).not.toContain('const result = true')
})

test('ignore allows transformation for non-matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    ignore: [/\.ts$/],
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).toContain('const result = true')
})

test('only allows transformation for matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    only: [/\.js$/],
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).toContain('const result = true')
})

test('only skips transformation for non-matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    only: [/\.ts$/],
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).not.toContain('const result = true')
})

test('test activates config for matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    test: /\.js$/,
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).toContain('const result = true')
})

test('test skips transformation for non-matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    test: /\.ts$/,
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).not.toContain('const result = true')
})

test('cwd option sets working directory for babel', async () => {
  const customCwd = path.resolve(import.meta.dirname, 'custom-cwd')
  let receivedCwd: string | null | undefined
  const checkPlugin: babel.PluginItem = (): babel.PluginObj => ({
    visitor: {
      Program(_path, state) {
        receivedCwd = state.file.opts.cwd
      },
    },
  })
  await build('foo.js', 'export const result = 42', {
    cwd: customCwd,
    plugins: [checkPlugin],
  })
  expect(receivedCwd).toBe(customCwd)
})

test('targets option is forwarded to babel', async () => {
  let receivedTargets: babel.TransformOptions['targets']
  const checkPlugin: babel.PluginItem = (): babel.PluginObj => ({
    visitor: {
      Program(_path, state) {
        receivedTargets = state.file.opts.targets
      },
    },
  })
  await build('foo.js', 'export const result = 42', {
    targets: { chrome: '100' },
    plugins: [checkPlugin],
  })
  expect(receivedTargets).toMatchObject({ chrome: '100.0.0' })
})

test('parserOpts are forwarded to babel parser', async () => {
  let receivedParserOpts: babel.TransformOptions['parserOpts']
  const checkPlugin: babel.PluginItem = (): babel.PluginObj => ({
    visitor: {
      Program(_path, state) {
        receivedParserOpts = state.file.opts.parserOpts
      },
    },
  })
  await build('foo.js', 'export const result = 42', {
    parserOpts: { strictMode: true },
    plugins: [checkPlugin],
  })
  expect(receivedParserOpts).toMatchObject({ strictMode: true })
})

test('generatorOpts controls code generation', async () => {
  const result = await build('foo.js', '/* gen-comment */\nexport const result = 42', {
    generatorOpts: {
      comments: false,
    },
  })
  expect(result.code).not.toContain('gen-comment')
})

test('wrapPluginVisitorMethod wraps visitor calls', async () => {
  let wrapCalled = false
  const result = await build('foo.js', 'export const result = foo', {
    plugins: [identifierReplaceBabelPlugin('foo', true)],
    wrapPluginVisitorMethod(_pluginAlias: string, _visitorType: string, callback: Function) {
      return function (this: any, ...args: any[]) {
        wrapCalled = true
        return callback.apply(this, args)
      }
    },
  })
  expect(wrapCalled).toBe(true)
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
      Identifier(p) {
        if (p.node.name === 'foo') {
          p.replaceWith(t.booleanLiteral(value))
        }
      },
    },
  })
}
