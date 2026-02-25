import { describe, expect, test } from 'vitest'
import {
  createBabelOptionsConverter,
  filterPresetsWithConfigResolved,
  filterPresetsWithEnvironment,
  resolveOptions,
  type PluginOptions,
} from './options.ts'
import type {
  PartialEnvironment,
  PresetConversionContext,
  RolldownBabelPreset,
} from './rolldownPreset.ts'
import type * as babel from '@babel/core'
import type { ResolvedConfig } from 'vite'

const presetA: babel.PresetItem = () => ({ plugins: [] })
const presetB: babel.PresetItem = () => ({ plugins: [] })

function makeCtx(overrides?: Partial<PresetConversionContext>): PresetConversionContext {
  return {
    id: 'src/app.tsx',
    moduleType: 'tsx',
    code: 'import React from "react"',
    ...overrides,
  }
}

function makeRolldownPreset(
  preset: babel.PresetItem,
  filter: RolldownBabelPreset['rolldown']['filter'],
): RolldownBabelPreset {
  return { preset, rolldown: { filter } }
}

describe('createBabelOptionsConverter', () => {
  test('plain babel preset is always included', () => {
    const convert = createBabelOptionsConverter(resolveOptions({ presets: [presetA] }))
    const result = convert(makeCtx())
    expect(result.presets).toStrictEqual([presetA])
  })

  test('rolldown preset without filter is always included', () => {
    const convert = createBabelOptionsConverter(
      resolveOptions({ presets: [makeRolldownPreset(presetA, undefined)] }),
    )
    const result = convert(makeCtx())
    expect(result.presets).toStrictEqual([presetA])
  })

  describe('id filter', () => {
    test('RegExp include matches', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({ presets: [makeRolldownPreset(presetA, { id: /\.tsx$/ })] }),
      )
      expect(convert(makeCtx({ id: 'src/app.tsx' })).presets).toStrictEqual([presetA])
    })

    test('RegExp include rejects', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({ presets: [makeRolldownPreset(presetA, { id: /\.tsx$/ })] }),
      )
      expect(convert(makeCtx({ id: 'src/app.js' })).presets).toStrictEqual([])
    })

    test('string glob include matches', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({ presets: [makeRolldownPreset(presetA, { id: '**/*.tsx' })] }),
      )
      expect(convert(makeCtx({ id: 'src/app.tsx' })).presets).toStrictEqual([presetA])
    })

    test('string glob include rejects', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({ presets: [makeRolldownPreset(presetA, { id: '**/*.tsx' })] }),
      )
      expect(convert(makeCtx({ id: 'src/app.js' })).presets).toStrictEqual([])
    })

    test('array of patterns matches any', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [makeRolldownPreset(presetA, { id: [/\.tsx$/, /\.jsx$/] })],
        }),
      )
      expect(convert(makeCtx({ id: 'src/app.tsx' })).presets).toStrictEqual([presetA])
      expect(convert(makeCtx({ id: 'src/app.jsx' })).presets).toStrictEqual([presetA])
      expect(convert(makeCtx({ id: 'src/app.js' })).presets).toStrictEqual([])
    })

    test('object with include and exclude', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [
            makeRolldownPreset(presetA, {
              id: { include: [/\.tsx$/], exclude: [/test\.tsx$/] },
            }),
          ],
        }),
      )
      expect(convert(makeCtx({ id: 'src/app.tsx' })).presets).toStrictEqual([presetA])
      expect(convert(makeCtx({ id: 'src/app.test.tsx' })).presets).toStrictEqual([])
    })

    test('exclude-only rejects matching', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [makeRolldownPreset(presetA, { id: { exclude: [/node_modules/] } })],
        }),
      )
      expect(convert(makeCtx({ id: 'src/app.tsx' })).presets).toStrictEqual([presetA])
      expect(convert(makeCtx({ id: 'node_modules/foo/index.js' })).presets).toStrictEqual([])
    })
  })

  describe('moduleType filter', () => {
    test('array matches included type', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [makeRolldownPreset(presetA, { moduleType: ['tsx', 'jsx'] })],
        }),
      )
      expect(convert(makeCtx({ moduleType: 'tsx' })).presets).toStrictEqual([presetA])
      expect(convert(makeCtx({ moduleType: 'js' })).presets).toStrictEqual([])
    })

    test('object with include matches', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [makeRolldownPreset(presetA, { moduleType: { include: ['tsx'] } })],
        }),
      )
      expect(convert(makeCtx({ moduleType: 'tsx' })).presets).toStrictEqual([presetA])
      expect(convert(makeCtx({ moduleType: 'js' })).presets).toStrictEqual([])
    })
  })

  describe('code filter', () => {
    test('RegExp include matches code content', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [makeRolldownPreset(presetA, { code: /import React/ })],
        }),
      )
      expect(convert(makeCtx({ code: 'import React from "react"' })).presets).toStrictEqual([
        presetA,
      ])
      expect(convert(makeCtx({ code: 'const x = 1' })).presets).toStrictEqual([])
    })

    test('object with include and exclude', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [
            makeRolldownPreset(presetA, {
              code: { include: [/import/], exclude: [/\/\/ @no-transform/] },
            }),
          ],
        }),
      )
      expect(convert(makeCtx({ code: 'import foo' })).presets).toStrictEqual([presetA])
      expect(convert(makeCtx({ code: 'import foo // @no-transform' })).presets).toStrictEqual([])
      expect(convert(makeCtx({ code: 'const x = 1' })).presets).toStrictEqual([])
    })
  })

  describe('combined dimensions', () => {
    test('all dimensions must match', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [
            makeRolldownPreset(presetA, {
              id: /\.tsx$/,
              moduleType: ['tsx'],
              code: /import React/,
            }),
          ],
        }),
      )
      expect(convert(makeCtx()).presets).toStrictEqual([presetA])
    })

    test('fails when id does not match', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [
            makeRolldownPreset(presetA, {
              id: /\.tsx$/,
              moduleType: ['tsx'],
              code: /import React/,
            }),
          ],
        }),
      )
      expect(convert(makeCtx({ id: 'src/app.js' })).presets).toStrictEqual([])
    })

    test('fails when moduleType does not match', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [
            makeRolldownPreset(presetA, {
              id: /\.tsx$/,
              moduleType: ['tsx'],
              code: /import React/,
            }),
          ],
        }),
      )
      expect(convert(makeCtx({ moduleType: 'js' })).presets).toStrictEqual([])
    })

    test('fails when code does not match', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [
            makeRolldownPreset(presetA, {
              id: /\.tsx$/,
              moduleType: ['tsx'],
              code: /import React/,
            }),
          ],
        }),
      )
      expect(convert(makeCtx({ code: 'const x = 1' })).presets).toStrictEqual([])
    })

    test('unconstrained dimensions are skipped', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [makeRolldownPreset(presetA, { id: /\.tsx$/ })],
        }),
      )
      expect(convert(makeCtx({ moduleType: 'anything', code: 'anything' })).presets).toStrictEqual([
        presetA,
      ])
    })
  })

  describe('multiple presets', () => {
    test('each preset is filtered independently', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [
            makeRolldownPreset(presetA, { id: /\.tsx$/ }),
            makeRolldownPreset(presetB, { id: /\.jsx$/ }),
          ],
        }),
      )
      expect(convert(makeCtx({ id: 'src/app.tsx' })).presets).toStrictEqual([presetA])
      expect(convert(makeCtx({ id: 'src/app.jsx' })).presets).toStrictEqual([presetB])
      expect(convert(makeCtx({ id: 'src/app.js' })).presets).toStrictEqual([])
    })

    test('mix of plain and rolldown presets', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          presets: [presetA, makeRolldownPreset(presetB, { id: /\.tsx$/ })],
        }),
      )
      expect(convert(makeCtx({ id: 'src/app.tsx' })).presets).toStrictEqual([presetA, presetB])
      expect(convert(makeCtx({ id: 'src/app.js' })).presets).toStrictEqual([presetA])
    })
  })

  describe('override presets', () => {
    test('override preset filters are applied', () => {
      const convert = createBabelOptionsConverter(
        resolveOptions({
          overrides: [
            {
              presets: [makeRolldownPreset(presetA, { id: /\.tsx$/ })],
            },
          ],
        }),
      )
      const matchResult = convert(makeCtx({ id: 'src/app.tsx' }))
      expect(matchResult.overrides![0].presets).toStrictEqual([presetA])

      const noMatchResult = convert(makeCtx({ id: 'src/app.js' }))
      expect(noMatchResult.overrides![0].presets).toStrictEqual([])
    })
  })
})

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const fakeConfig = { command: 'build', mode: 'production' } as ResolvedConfig

describe('filterPresetsWithConfigResolved', () => {
  test('keeps all presets when none have configResolvedHook', () => {
    const options: PluginOptions = { presets: [presetA, presetB] }
    const result = filterPresetsWithConfigResolved(options, fakeConfig)
    expect(result.presets).toStrictEqual([presetA, presetB])
  })

  test('removes presets whose configResolvedHook returns false', () => {
    const kept: RolldownBabelPreset = {
      preset: presetA,
      rolldown: { configResolvedHook: () => true },
    }
    const removed: RolldownBabelPreset = {
      preset: presetB,
      rolldown: { configResolvedHook: () => false },
    }
    const options: PluginOptions = { presets: [kept, removed] }
    const result = filterPresetsWithConfigResolved(options, fakeConfig)
    expect(result.presets).toStrictEqual([kept])
  })

  test('passes ResolvedConfig to the hook', () => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const config = { command: 'serve', mode: 'development' } as ResolvedConfig
    const preset: RolldownBabelPreset = {
      preset: presetA,
      rolldown: {
        configResolvedHook: (c) => c.command === 'build',
      },
    }
    const options: PluginOptions = { presets: [preset] }
    const result = filterPresetsWithConfigResolved(options, config)
    expect(result.presets).toStrictEqual([])
  })

  test('filters presets inside overrides', () => {
    const removed: RolldownBabelPreset = {
      preset: presetA,
      rolldown: { configResolvedHook: () => false },
    }
    const options: PluginOptions = {
      overrides: [{ presets: [removed, presetB] }],
    }
    const result = filterPresetsWithConfigResolved(options, fakeConfig)
    expect(result.overrides![0].presets).toStrictEqual([presetB])
  })

  test('keeps all override presets when all hooks return true', () => {
    const kept: RolldownBabelPreset = {
      preset: presetA,
      rolldown: { configResolvedHook: () => true },
    }
    const options: PluginOptions = {
      overrides: [{ presets: [kept] }],
    }
    const result = filterPresetsWithConfigResolved(options, fakeConfig)
    expect(result.overrides![0].presets).toStrictEqual([kept])
  })
})

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const fakeEnvironment = { name: 'client' } as PartialEnvironment

describe('filterPresetsWithEnvironment', () => {
  test('keeps all presets when none have applyToEnvironmentHook', () => {
    const options: PluginOptions = { presets: [presetA, presetB] }
    const result = filterPresetsWithEnvironment(options, fakeEnvironment)
    expect(result.presets).toStrictEqual([presetA, presetB])
  })

  test('removes presets whose applyToEnvironmentHook returns false', () => {
    const kept: RolldownBabelPreset = {
      preset: presetA,
      rolldown: { applyToEnvironmentHook: () => true },
    }
    const removed: RolldownBabelPreset = {
      preset: presetB,
      rolldown: { applyToEnvironmentHook: () => false },
    }
    const options: PluginOptions = { presets: [kept, removed] }
    const result = filterPresetsWithEnvironment(options, fakeEnvironment)
    expect(result.presets).toStrictEqual([kept])
  })

  test('passes PartialEnvironment to the hook', () => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const env = { name: 'ssr' } as PartialEnvironment
    const preset: RolldownBabelPreset = {
      preset: presetA,
      rolldown: {
        applyToEnvironmentHook: (e) => e.name === 'client',
      },
    }
    const options: PluginOptions = { presets: [preset] }
    const result = filterPresetsWithEnvironment(options, env)
    expect(result.presets).toStrictEqual([])
  })

  test('filters presets inside overrides', () => {
    const removed: RolldownBabelPreset = {
      preset: presetA,
      rolldown: { applyToEnvironmentHook: () => false },
    }
    const options: PluginOptions = {
      overrides: [{ presets: [removed, presetB] }],
    }
    const result = filterPresetsWithEnvironment(options, fakeEnvironment)
    expect(result.overrides![0].presets).toStrictEqual([presetB])
  })

  test('keeps all override presets when all hooks return true', () => {
    const kept: RolldownBabelPreset = {
      preset: presetA,
      rolldown: { applyToEnvironmentHook: () => true },
    }
    const options: PluginOptions = {
      overrides: [{ presets: [kept] }],
    }
    const result = filterPresetsWithEnvironment(options, fakeEnvironment)
    expect(result.overrides![0].presets).toStrictEqual([kept])
  })
})
