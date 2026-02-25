import { assert, describe, expect, test } from 'vitest'
import babelPlugin from './index.ts'
import * as babel from '@babel/core'
import { rolldown, type OutputChunk } from 'rolldown'
import { build as viteBuild, createBuilder, type Rollup } from 'vite'
import path from 'node:path'
import type { PluginOptions } from './options.ts'
import type { RolldownBabelPreset } from './rolldownPreset.ts'

test('plugin works', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).toContain('const result = true')
})

test('presets option applies preset transformations', async () => {
  const myPreset = (): babel.InputOptions => ({
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
  const checkPlugin: babel.PluginItem = (): babel.PluginObject => ({
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
  const checkPlugin: babel.PluginItem = (): babel.PluginObject => ({
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
  const checkPlugin: babel.PluginItem = (api: any): babel.PluginObject => {
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
  const checkPlugin: babel.PluginItem = (): babel.PluginObject => ({
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
  const checkPlugin: babel.PluginItem = (): babel.PluginObject => ({
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
    exclude: [/\.js$/],
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).not.toContain('const result = true')
})

test('exclude allows transformation for non-matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    exclude: [/\.ts$/],
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).toContain('const result = true')
})

test('include activates config only for matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    include: [/\.js$/],
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).toContain('const result = true')
})

test('include skips transformation for non-matching files', async () => {
  const result = await build('foo.js', 'export const result = foo', {
    include: [/\.ts$/],
    plugins: [identifierReplaceBabelPlugin('foo', true)],
  })
  expect(result.code).not.toContain('const result = true')
})

test('cwd option sets working directory for babel', async () => {
  const customCwd = path.resolve(import.meta.dirname, 'custom-cwd')
  let receivedCwd: string | null | undefined
  const checkPlugin: babel.PluginItem = (): babel.PluginObject => ({
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
  let receivedTargets: babel.InputOptions['targets']
  const checkPlugin: babel.PluginItem = (): babel.PluginObject => ({
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
  let receivedParserOpts: babel.InputOptions['parserOpts']
  const checkPlugin: babel.PluginItem = (): babel.PluginObject => ({
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
    wrapPluginVisitorMethod(_pluginAlias, _visitorType, callback) {
      return function (this, p, state) {
        wrapCalled = true
        return callback.call(this, p, state)
      }
    },
  })
  expect(wrapCalled).toBe(true)
  expect(result.code).toContain('const result = true')
})

describe('configResolved hook', () => {
  test('filters out presets whose configResolvedHook returns false', async () => {
    let transformCalled = false
    const removedPreset: RolldownBabelPreset = {
      preset: (): babel.InputOptions => ({
        plugins: [
          (): babel.PluginObject => ({
            visitor: {
              Program() {
                transformCalled = true
              },
            },
          }),
        ],
      }),
      rolldown: { configResolvedHook: () => false },
    }
    await buildWithVite('foo.js', 'export const result = 42', {
      presets: [removedPreset],
    })
    expect(transformCalled).toBe(false)
  })

  test('keeps presets whose configResolvedHook returns true', async () => {
    let transformCalled = false
    const keptPreset: RolldownBabelPreset = {
      preset: (): babel.InputOptions => ({
        plugins: [
          (): babel.PluginObject => ({
            visitor: {
              Program() {
                transformCalled = true
              },
            },
          }),
        ],
      }),
      rolldown: { configResolvedHook: () => true },
    }
    await buildWithVite('foo.js', 'export const result = 42', {
      presets: [keptPreset],
    })
    expect(transformCalled).toBe(true)
  })

  test('configResolvedHook receives the resolved config', async () => {
    let receivedCommand: string | undefined
    const preset: RolldownBabelPreset = {
      preset: (): babel.InputOptions => ({
        plugins: [identifierReplaceBabelPlugin('foo', true)],
      }),
      rolldown: {
        configResolvedHook(config) {
          receivedCommand = config.command
          return true
        },
      },
    }
    await buildWithVite('foo.js', 'export const result = foo', {
      presets: [preset],
    })
    expect(receivedCommand).toBe('build')
  })
})

describe('applyToEnvironment hook', () => {
  test('filters out presets whose applyToEnvironmentHook returns false', async () => {
    let transformCalled = false
    const removedPreset: RolldownBabelPreset = {
      preset: (): babel.InputOptions => ({
        plugins: [
          (): babel.PluginObject => ({
            visitor: {
              Program() {
                transformCalled = true
              },
            },
          }),
        ],
      }),
      rolldown: { applyToEnvironmentHook: () => false },
    }
    await buildWithVite('foo.js', 'export const result = 42', {
      presets: [removedPreset],
    })
    expect(transformCalled).toBe(false)
  })

  test('keeps presets whose applyToEnvironmentHook returns true', async () => {
    let transformCalled = false
    const keptPreset: RolldownBabelPreset = {
      preset: (): babel.InputOptions => ({
        plugins: [
          (): babel.PluginObject => ({
            visitor: {
              Program() {
                transformCalled = true
              },
            },
          }),
        ],
      }),
      rolldown: { applyToEnvironmentHook: () => true },
    }
    await buildWithVite('foo.js', 'export const result = 42', {
      presets: [keptPreset],
    })
    expect(transformCalled).toBe(true)
  })

  test('filters by environment name', async () => {
    const ssrOnlyPreset: RolldownBabelPreset = {
      preset: (): babel.InputOptions => ({
        plugins: [identifierReplaceBabelPlugin('foo', true)],
      }),
      rolldown: {
        applyToEnvironmentHook: (env) => env.name === 'ssr',
      },
    }
    const result = await buildWithVite('foo.js', 'export const result = foo', {
      presets: [ssrOnlyPreset],
    })
    // preset is SSR-only, so it should NOT transform in the client environment
    expect(result.code).not.toContain('const result = true')
  })
})

describe('configResolvedHook and applyToEnvironmentHook compose', () => {
  test('preset passing configResolvedHook can still be filtered by applyToEnvironmentHook', async () => {
    let transformCalled = false
    const preset: RolldownBabelPreset = {
      preset: (): babel.InputOptions => ({
        plugins: [
          (): babel.PluginObject => ({
            visitor: {
              Program() {
                transformCalled = true
              },
            },
          }),
        ],
      }),
      rolldown: {
        configResolvedHook: () => true,
        applyToEnvironmentHook: (env) => env.name === 'ssr',
      },
    }
    await buildWithVite('foo.js', 'export const result = 42', {
      presets: [preset],
    })
    // passes configResolved but fails applyToEnvironment for client
    expect(transformCalled).toBe(false)
  })

  test('preset removed by configResolvedHook is not seen by applyToEnvironmentHook', async () => {
    let applyToEnvCalled = false
    const preset: RolldownBabelPreset = {
      preset: (): babel.InputOptions => ({
        plugins: [identifierReplaceBabelPlugin('foo', true)],
      }),
      rolldown: {
        configResolvedHook: () => false,
        applyToEnvironmentHook: () => {
          applyToEnvCalled = true
          return true
        },
      },
    }
    const result = await buildWithVite('foo.js', 'export const result = foo', {
      presets: [preset],
    })
    expect(result.code).not.toContain('const result = true')
    expect(applyToEnvCalled).toBe(false)
  })
})

describe('per-environment state isolation', () => {
  test('each environment gets its own presets with shared plugins', async () => {
    const clientOnlyPreset: RolldownBabelPreset = {
      preset: (): babel.InputOptions => ({
        plugins: [identifierReplaceBabelPlugin('CLIENT_MARKER', true)],
      }),
      rolldown: {
        applyToEnvironmentHook: (env) => env.name === 'client',
      },
    }

    const ssrOnlyPreset: RolldownBabelPreset = {
      preset: (): babel.InputOptions => ({
        plugins: [identifierReplaceBabelPlugin('SSR_MARKER', true)],
      }),
      rolldown: {
        applyToEnvironmentHook: (env) => env.name === 'ssr',
      },
    }

    const filename = 'foo.js'
    const virtualId = `\0virtual:${filename}`
    const code = 'console.log(CLIENT_MARKER, SSR_MARKER)'

    const builder = await createBuilder({
      configFile: false,
      logLevel: 'silent',
      plugins: [
        {
          name: 'virtual',
          resolveId(id) {
            if (id === filename) return virtualId
          },
          load(id) {
            if (id === virtualId) return code
          },
        },
        babelPlugin({
          presets: [clientOnlyPreset, ssrOnlyPreset],
        }),
      ],
      environments: {
        client: {},
        ssr: {},
      },
      builder: {
        sharedPlugins: true,
      },
      build: {
        write: false,
        minify: false,
        rollupOptions: { input: filename, treeshake: false },
      },
    })

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const clientOutput = (await builder.build(
      builder.environments.client,
    )) as Rollup.RolldownOutput
    const clientChunk = clientOutput.output.find((o) => o.type === 'chunk')
    assert(clientChunk, 'expected a chunk in client output')
    // client preset replaces CLIENT_MARKER → true, leaves SSR_MARKER alone
    expect(clientChunk.code).not.toContain('CLIENT_MARKER')
    expect(clientChunk.code).toContain('SSR_MARKER')

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const ssrOutput = (await builder.build(
      builder.environments.ssr,
    )) as Rollup.RolldownOutput
    const ssrChunk = ssrOutput.output.find((o) => o.type === 'chunk')
    assert(ssrChunk, 'expected a chunk in ssr output')
    // ssr preset replaces SSR_MARKER → true, leaves CLIENT_MARKER alone
    expect(ssrChunk.code).toContain('CLIENT_MARKER')
    expect(ssrChunk.code).not.toContain('SSR_MARKER')
  })

  test('environment with no matching presets is skipped entirely', async () => {
    let ssrTransformCalled = false
    const clientOnlyPreset: RolldownBabelPreset = {
      preset: (): babel.InputOptions => ({
        plugins: [
          (): babel.PluginObject => ({
            visitor: {
              Program() {
                ssrTransformCalled = true
              },
            },
          }),
        ],
      }),
      rolldown: {
        applyToEnvironmentHook: (env) => env.name === 'client',
      },
    }

    const filename = 'foo.js'
    const virtualId = `\0virtual:${filename}`

    const builder = await createBuilder({
      configFile: false,
      logLevel: 'silent',
      plugins: [
        {
          name: 'virtual',
          resolveId(id) {
            if (id === filename) return virtualId
          },
          load(id) {
            if (id === virtualId) return 'export const result = 42'
          },
        },
        babelPlugin({
          presets: [clientOnlyPreset],
        }),
      ],
      environments: {
        client: {},
        ssr: {},
      },
      builder: {
        sharedPlugins: true,
      },
      build: {
        write: false,
        minify: false,
        rollupOptions: { input: filename, treeshake: false },
      },
    })

    // Build SSR first — the client-only preset should not run
    ssrTransformCalled = false
    await builder.build(builder.environments.ssr)
    expect(ssrTransformCalled).toBe(false)

    // Build client — the preset should run
    ssrTransformCalled = false
    await builder.build(builder.environments.client)
    expect(ssrTransformCalled).toBe(true)
  })
})

async function buildWithVite(
  filename: string,
  code: string,
  options: PluginOptions,
): Promise<Rollup.OutputChunk> {
  const virtualId = `\0virtual:${filename}`
  const result = await viteBuild({
    configFile: false,
    logLevel: 'silent',
    plugins: [
      {
        name: 'virtual',
        resolveId(id) {
          if (id === filename) return virtualId
        },
        load(id) {
          if (id === virtualId) return code
        },
      },
      babelPlugin(options),
    ],
    build: {
      write: false,
      minify: false,
      rollupOptions: { input: filename, treeshake: false },
    },
  })
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const output = (result as Rollup.RolldownOutput).output
  const chunk = output.find((o) => o.type === 'chunk')
  assert(chunk, 'expected a chunk in output')
  return chunk
}

async function build(filename: string, code: string, options: PluginOptions): Promise<OutputChunk> {
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
  return ({ types: t }): babel.PluginObject => ({
    visitor: {
      Identifier(p) {
        if (p.node.name === name) {
          p.replaceWith(t.booleanLiteral(value))
        }
      },
    },
  })
}
