import { describe, expect, test } from 'vitest'
import { calculatePluginFilters } from './filter.ts'
import { resolveOptions, DEFAULT_INCLUDE, DEFAULT_EXCLUDE } from './options.ts'
import type { RolldownBabelPreset } from './rolldownPreset.ts'

function makeRolldownPreset(
  filter: RolldownBabelPreset['rolldown']['filter'],
): RolldownBabelPreset {
  return {
    preset: () => ({ plugins: [] }),
    rolldown: { filter },
  }
}

describe('calculatePluginFilters', () => {
  describe('baseFilter basics', () => {
    test('default options produce default id filter', () => {
      const { transformFilter } = calculatePluginFilters(resolveOptions({}))
      expect(transformFilter).toStrictEqual({
        id: { include: DEFAULT_INCLUDE, exclude: DEFAULT_EXCLUDE },
      })
    })

    test('user include is forwarded to id.include', () => {
      const { transformFilter } = calculatePluginFilters(resolveOptions({ include: [/\.tsx?$/] }))
      expect(transformFilter).toStrictEqual({
        id: { include: [/\.tsx?$/], exclude: DEFAULT_EXCLUDE },
      })
    })

    test('user include as single value is wrapped in array', () => {
      const { transformFilter } = calculatePluginFilters(resolveOptions({ include: '**/*.ts' }))
      expect(transformFilter).toStrictEqual({
        id: { include: ['**/*.ts'], exclude: DEFAULT_EXCLUDE },
      })
    })

    test('user exclude overrides default', () => {
      const customExclude = [/vendor/]
      const { transformFilter } = calculatePluginFilters(resolveOptions({ exclude: customExclude }))
      expect(transformFilter).toStrictEqual({
        id: { include: DEFAULT_INCLUDE, exclude: customExclude },
      })
    })

    test('function in include means include anything', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({ include: [() => true, /\.js$/] }),
      )
      expect(transformFilter).toStrictEqual({
        id: { include: undefined, exclude: DEFAULT_EXCLUDE },
      })
    })

    test('include with only function entries means include anything', () => {
      const { transformFilter } = calculatePluginFilters(resolveOptions({ include: [() => true] }))
      expect(transformFilter).toStrictEqual({
        id: { include: undefined, exclude: DEFAULT_EXCLUDE },
      })
    })

    test('function in exclude means exclude nothing', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({ exclude: [() => true, /vendor/] }),
      )
      expect(transformFilter).toStrictEqual({
        id: { include: DEFAULT_INCLUDE, exclude: undefined },
      })
    })

    test('exclude with only function entries means exclude nothing', () => {
      const { transformFilter } = calculatePluginFilters(resolveOptions({ exclude: [() => true] }))
      expect(transformFilter).toStrictEqual({
        id: { include: DEFAULT_INCLUDE, exclude: undefined },
      })
    })
  })

  describe('with explicit plugins', () => {
    test('returns baseFilter only when plugins are present', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          plugins: [() => ({ visitor: {} })],
          presets: [makeRolldownPreset({ id: /\.tsx$/ })],
        }),
      )
      // Preset filter is ignored; only baseFilter is returned
      expect(transformFilter).toStrictEqual({
        id: { include: DEFAULT_INCLUDE, exclude: DEFAULT_EXCLUDE },
      })
    })

    test('returns baseFilter with include when plugins are present', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          include: [/\.js$/],
          plugins: [() => ({ visitor: {} })],
          presets: [makeRolldownPreset({ id: /\.tsx$/ })],
        }),
      )
      expect(transformFilter).toStrictEqual({
        id: { include: [/\.js$/], exclude: DEFAULT_EXCLUDE },
      })
    })
  })

  describe('with no presets', () => {
    test('returns baseFilter when presets is undefined', () => {
      const { transformFilter } = calculatePluginFilters(resolveOptions({ presets: undefined }))
      expect(transformFilter).toStrictEqual({
        id: { include: DEFAULT_INCLUDE, exclude: DEFAULT_EXCLUDE },
      })
    })

    test('returns baseFilter when presets is empty', () => {
      const { transformFilter } = calculatePluginFilters(resolveOptions({ presets: [] }))
      expect(transformFilter).toStrictEqual({
        id: { include: DEFAULT_INCLUDE, exclude: DEFAULT_EXCLUDE },
      })
    })
  })

  describe('with plain babel presets (no rolldown filter)', () => {
    test('plain babel preset function causes fallback to baseFilter', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({ presets: [() => ({ plugins: [] })] }),
      )
      expect(transformFilter).toStrictEqual({
        id: { include: DEFAULT_INCLUDE, exclude: DEFAULT_EXCLUDE },
      })
    })

    test('mix of plain and rolldown presets causes fallback to baseFilter', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [() => ({ plugins: [] }), makeRolldownPreset({ id: /\.tsx$/ })],
        }),
      )
      expect(transformFilter).toStrictEqual({
        id: { include: DEFAULT_INCLUDE, exclude: DEFAULT_EXCLUDE },
      })
    })

    test('rolldown preset without filter causes fallback to baseFilter', () => {
      const preset: RolldownBabelPreset = {
        preset: () => ({ plugins: [] }),
        rolldown: {},
      }
      const { transformFilter } = calculatePluginFilters(resolveOptions({ presets: [preset] }))
      expect(transformFilter).toStrictEqual({
        id: { include: DEFAULT_INCLUDE, exclude: DEFAULT_EXCLUDE },
      })
    })
  })

  describe('presetFilter computation', () => {
    test('single preset with id include', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [makeRolldownPreset({ id: /\.tsx$/ })],
        }),
      )
      expect(transformFilter).toStrictEqual({
        id: { include: DEFAULT_INCLUDE, exclude: DEFAULT_EXCLUDE },
      })
    })

    test('unions id includes from multiple presets', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [makeRolldownPreset({ id: /\.tsx$/ }), makeRolldownPreset({ id: /\.jsx$/ })],
        }),
      )
      expect(transformFilter.id).toStrictEqual({
        include: DEFAULT_INCLUDE,
        exclude: DEFAULT_EXCLUDE,
      })
    })

    test('preset id as string is normalized', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [makeRolldownPreset({ id: '**/*.tsx' })],
        }),
      )
      expect(transformFilter.id).toStrictEqual({
        include: DEFAULT_INCLUDE,
        exclude: DEFAULT_EXCLUDE,
      })
    })

    test('preset id as array is collected', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [makeRolldownPreset({ id: [/\.tsx$/, /\.jsx$/] })],
        }),
      )
      expect(transformFilter.id).toStrictEqual({
        include: DEFAULT_INCLUDE,
        exclude: DEFAULT_EXCLUDE,
      })
    })

    test('preset id as object with include and exclude', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({
              id: { include: [/\.tsx$/], exclude: [/test/] },
            }),
          ],
        }),
      )
      // Single preset: its exclude is the intersection (just itself), combined with user exclude
      expect(transformFilter.id).toStrictEqual({
        include: DEFAULT_INCLUDE,
        exclude: [...DEFAULT_EXCLUDE, /test/],
      })
    })

    test('preset without id filter makes id match-all', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({ moduleType: ['tsx'] }),
            makeRolldownPreset({ id: /\.jsx$/ }),
          ],
        }),
      )
      // First preset has no id → id matches everything → no preset id include
      expect(transformFilter.id).toStrictEqual({
        include: DEFAULT_INCLUDE,
        exclude: DEFAULT_EXCLUDE,
      })
    })

    test('preset with id exclude-only (no include) makes id match-all with exclude kept', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({
              id: { exclude: [/test/] },
            }),
          ],
        }),
      )
      // No include → match-all, but exclude is kept (intersection of one preset)
      expect(transformFilter.id).toStrictEqual({
        include: DEFAULT_INCLUDE,
        exclude: [...DEFAULT_EXCLUDE, /test/],
      })
    })
  })

  describe('moduleType filter', () => {
    test('single preset with moduleType array', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [makeRolldownPreset({ id: /\.tsx$/, moduleType: ['tsx'] })],
        }),
      )
      expect(transformFilter.moduleType).toStrictEqual(['tsx'])
    })

    test('unions moduleType from multiple presets', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({ id: /\.tsx$/, moduleType: ['tsx'] }),
            makeRolldownPreset({ id: /\.jsx$/, moduleType: ['jsx'] }),
          ],
        }),
      )
      expect(transformFilter.moduleType).toStrictEqual(['tsx', 'jsx'])
    })

    test('moduleType as { include } object form', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({
              id: /\.tsx$/,
              moduleType: { include: ['tsx', 'ts'] },
            }),
          ],
        }),
      )
      expect(transformFilter.moduleType).toStrictEqual(['tsx', 'ts'])
    })

    test('preset without moduleType makes moduleType match-all (omitted)', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({ id: /\.tsx$/, moduleType: ['tsx'] }),
            makeRolldownPreset({ id: /\.jsx$/ }), // no moduleType
          ],
        }),
      )
      expect(transformFilter.moduleType).toBeUndefined()
    })
  })

  describe('code filter', () => {
    test('single preset with code include', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [makeRolldownPreset({ id: /\.tsx$/, code: /import React/ })],
        }),
      )
      expect(transformFilter.code).toStrictEqual([/import React/])
    })

    test('unions code includes from multiple presets', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({ id: /\.tsx$/, code: /import React/ }),
            makeRolldownPreset({ id: /\.jsx$/, code: /from 'react'/ }),
          ],
        }),
      )
      expect(transformFilter.code).toStrictEqual([/import React/, /from 'react'/])
    })

    test('preset without code makes code match-all (omitted)', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({ id: /\.tsx$/, code: /import React/ }),
            makeRolldownPreset({ id: /\.jsx$/ }), // no code
          ],
        }),
      )
      expect(transformFilter.code).toBeUndefined()
    })

    test('code as object with include', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({
              id: /\.tsx$/,
              code: { include: [/import React/, /from 'react'/] },
            }),
          ],
        }),
      )
      expect(transformFilter.code).toStrictEqual([/import React/, /from 'react'/])
    })
  })

  describe('finalFilter = presetFilter ∩ baseFilter', () => {
    test('user include takes priority over preset id includes', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          include: [/\.ts$/],
          presets: [makeRolldownPreset({ id: /\.tsx$/ })],
        }),
      )
      expect(transformFilter.id).toStrictEqual({
        include: [/\.ts$/],
        exclude: DEFAULT_EXCLUDE,
      })
    })

    test('default include takes priority over preset id includes', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [makeRolldownPreset({ id: /\.tsx$/ })],
        }),
      )
      expect(transformFilter.id).toStrictEqual({
        include: DEFAULT_INCLUDE,
        exclude: DEFAULT_EXCLUDE,
      })
    })

    test('user exclude is always applied', () => {
      const customExclude = [/vendor/, /dist/]
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          exclude: customExclude,
          presets: [makeRolldownPreset({ id: /\.tsx$/ })],
        }),
      )
      expect(transformFilter.id).toStrictEqual({
        include: DEFAULT_INCLUDE,
        exclude: customExclude,
      })
    })

    test('non-shared preset excludes are dropped in union', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({
              id: { include: [/\.tsx$/], exclude: [/test\.tsx$/] },
            }),
            makeRolldownPreset({
              id: { include: [/\.jsx$/], exclude: [/spec\.jsx$/] },
            }),
          ],
        }),
      )
      // No shared excludes across presets → only user exclude remains
      expect(transformFilter.id).toStrictEqual({
        include: DEFAULT_INCLUDE,
        exclude: DEFAULT_EXCLUDE,
      })
    })

    test('shared preset excludes are kept via intersection', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({
              id: { include: [/\.tsx$/], exclude: [/test/, /vendor/] },
            }),
            makeRolldownPreset({
              id: { include: [/\.jsx$/], exclude: [/test/, /dist/] },
            }),
          ],
        }),
      )
      // /test/ is in both presets' excludes → kept; /vendor/ and /dist/ are not shared → dropped
      expect(transformFilter.id).toStrictEqual({
        include: DEFAULT_INCLUDE,
        exclude: [...DEFAULT_EXCLUDE, /test/],
      })
    })

    test('preset without excludes makes exclude intersection empty', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({
              id: { include: [/\.tsx$/], exclude: [/test/] },
            }),
            makeRolldownPreset({
              id: /\.jsx$/,
            }),
          ],
        }),
      )
      // Second preset has no excludes → intersection is empty → only user exclude
      expect(transformFilter.id).toStrictEqual({
        include: DEFAULT_INCLUDE,
        exclude: DEFAULT_EXCLUDE,
      })
    })

    test('shared code excludes are kept via intersection', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          presets: [
            makeRolldownPreset({
              id: /\.tsx$/,
              code: { include: [/import React/], exclude: [/\/\/ @no-transform/] },
            }),
            makeRolldownPreset({
              id: /\.jsx$/,
              code: { include: [/from 'react'/], exclude: [/\/\/ @no-transform/] },
            }),
          ],
        }),
      )
      expect(transformFilter.code).toStrictEqual({
        include: [/import React/, /from 'react'/],
        exclude: [/\/\/ @no-transform/],
      })
    })

    test('moduleType and code pass through from presetFilter when present', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          include: [/\.tsx$/],
          presets: [
            makeRolldownPreset({
              id: /\.tsx$/,
              moduleType: ['tsx'],
              code: /import React/,
            }),
          ],
        }),
      )
      expect(transformFilter.id).toStrictEqual({
        include: [/\.tsx$/],
        exclude: DEFAULT_EXCLUDE,
      })
      expect(transformFilter.moduleType).toStrictEqual(['tsx'])
      expect(transformFilter.code).toStrictEqual([/import React/])
    })

    test('full intersection with all dimensions constrained', () => {
      const { transformFilter } = calculatePluginFilters(
        resolveOptions({
          include: [/src/],
          exclude: [/node_modules/],
          presets: [
            makeRolldownPreset({
              id: [/\.tsx$/, /\.jsx$/],
              moduleType: ['tsx', 'jsx'],
              code: { include: /import React/ },
            }),
          ],
        }),
      )
      expect(transformFilter).toStrictEqual({
        id: { include: [/src/], exclude: [/node_modules/] },
        moduleType: ['tsx', 'jsx'],
        code: [/import React/],
      })
    })
  })
})
