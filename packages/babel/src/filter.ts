import type { HookFilter, GeneralHookFilter, ModuleTypeFilter } from 'rolldown'
import type { ResolvedPluginOptions } from './options'
import type { RolldownBabelPresetItem, RolldownBabelPreset } from './rolldownPreset'
import type { InputOptions } from '@babel/core'
import { arrayify } from './utils'

type ConfigApplicableTest = Exclude<InputOptions['include'], undefined>
type StringOrRegExp = string | RegExp

/**
 * Extract string/RegExp values from babel's ConfigApplicableTest,
 * filtering out function entries which HookFilter can't represent.
 * If any function entry is present, returns undefined because the
 * function could match anything we can't predict at the HookFilter level.
 */
function extractStringOrRegExp(
  test: ConfigApplicableTest | undefined,
): StringOrRegExp[] | undefined {
  if (test === undefined) return undefined

  const items = arrayify(test)
  const result: StringOrRegExp[] = []
  for (const item of items) {
    if (typeof item === 'function') {
      return undefined
    }
    result.push(item)
  }
  return result.length > 0 ? result : undefined
}

interface NormalizedFilter {
  include?: StringOrRegExp[]
  exclude?: StringOrRegExp[]
}

/**
 * Normalize a GeneralHookFilter into { include?, exclude? } form.
 */
function normalizeGeneralHookFilter(filter: GeneralHookFilter | undefined): NormalizedFilter {
  if (filter == null) return {}
  if (typeof filter === 'string' || filter instanceof RegExp) {
    return { include: [filter] }
  }
  if (Array.isArray(filter)) {
    return { include: filter }
  }
  return {
    include: filter.include != null ? arrayify(filter.include) : undefined,
    exclude: filter.exclude != null ? arrayify(filter.exclude) : undefined,
  }
}

function isRolldownBabelPreset(preset: RolldownBabelPresetItem): preset is RolldownBabelPreset {
  return typeof preset === 'object' && preset !== null && 'rolldown' in preset
}

function normalizeModuleTypeFilter(filter: ModuleTypeFilter): string[] {
  if (Array.isArray(filter)) return filter
  return filter.include ?? []
}

function patternKey(pattern: StringOrRegExp): string {
  return typeof pattern === 'string' ? `s:${pattern}` : `r:${pattern.source}:${pattern.flags}`
}

/**
 * Compute the intersection of arrays by key.
 * An item is kept only if it appears in every array.
 * If any array is undefined, the intersection is empty.
 */
function intersectArrays<T>(arrays: (T[] | undefined)[], keyFn: (item: T) => string): T[] {
  if (arrays.length === 0) return []
  const defined = arrays.filter((a): a is T[] => a != null)
  if (defined.length < arrays.length) return []

  let result = new Map(defined[0].map((p) => [keyFn(p), p]))
  for (let i = 1; i < defined.length; i++) {
    const keys = new Set(defined[i].map((p) => keyFn(p)))
    for (const key of result.keys()) {
      if (!keys.has(key)) result.delete(key)
    }
  }
  return [...result.values()]
}

function concatArrays<T>(a: T[] | undefined, b: T[] | undefined): T[] | undefined {
  if (!a) return b
  if (!b) return a
  return [...a, ...b]
}

interface DimensionUnion<T> {
  /** Union of includes across presets. undefined = match all. */
  includes: T[] | undefined
  /** Intersection of excludes across presets. */
  excludes: T[]
}

/**
 * Union filter values from multiple presets for a single dimension.
 * Includes are unioned (OR). Excludes are intersected (only items in ALL presets are kept).
 *
 * @param rawFilters  Per-preset filter values. undefined = no filter (matches everything).
 * @param normalize   Converts a raw filter into { include?, exclude? } arrays.
 * @param keyFn       Serializes an item for intersection comparison.
 */
function unionFilters<F, T>(
  rawFilters: readonly (F | undefined)[],
  normalize: (filter: F) => { include?: T[]; exclude?: T[] },
  keyFn: (item: T) => string,
): DimensionUnion<T> {
  let matchAll = false
  const includes: T[] = []
  const excludeArrays: (T[] | undefined)[] = []

  for (const raw of rawFilters) {
    if (raw === undefined) {
      matchAll = true
      excludeArrays.push(undefined)
      continue
    }
    const n = normalize(raw)
    if (!matchAll) {
      if (n.include) {
        includes.push(...n.include)
      } else {
        matchAll = true
      }
    }
    excludeArrays.push(n.exclude)
  }

  return {
    includes: matchAll ? undefined : includes.length > 0 ? includes : undefined,
    excludes: intersectArrays(excludeArrays, keyFn),
  }
}

/**
 * Build the transform hook filter by intersecting a baseFilter (from user
 * include/exclude options) with a presetFilter (union of all RolldownBabelPreset
 * filters).
 *
 * - baseFilter constrains by id only (include/exclude from user options).
 * - presetFilter constrains by id, moduleType, and code. Includes are unioned
 *   across presets (OR), excludes are intersected (only patterns in ALL presets).
 * - The result uses user includes when present, otherwise falls back to preset
 *   includes. Excludes are combined from both (excluded by either → excluded).
 * - If the user has explicit plugins, presetFilter is skipped (plugins can match
 *   any file). Same if any preset is a plain babel preset without rolldown filters.
 */
function calculateTransformFilter(options: ResolvedPluginOptions): HookFilter {
  const userInclude = extractStringOrRegExp(options.include)
  const userExclude = extractStringOrRegExp(options.exclude)
  const baseFilter: HookFilter = {
    id: { include: userInclude, exclude: userExclude },
  }

  // If user has explicit plugins, only use base filter
  // (plugins can match any file, so preset filters don't apply)
  if (options.plugins && options.plugins.length > 0) {
    return baseFilter
  }

  // Build presetFilter (preset union filter)
  const presets = options.presets
  if (!presets || presets.length === 0) {
    return baseFilter
  }
  // If any preset is a plain babel preset or lacks a filter → presetFilter matches everything
  for (const preset of presets) {
    if (!isRolldownBabelPreset(preset) || !preset.rolldown.filter) {
      return baseFilter
    }
  }

  // All presets are RolldownBabelPreset with filter — compute their union.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion --- checked in the loop above
  const typedPresets = presets as RolldownBabelPreset[]
  const filters = typedPresets.map((p) => p.rolldown.filter!)

  const idUnion = unionFilters(
    filters.map((f) => f.id),
    normalizeGeneralHookFilter,
    patternKey,
  )
  const moduleTypeUnion = unionFilters(
    filters.map((f) => f.moduleType),
    (f) => {
      const types = normalizeModuleTypeFilter(f)
      return { include: types.length > 0 ? types : undefined }
    },
    (s) => s,
  )
  const codeUnion = unionFilters(
    filters.map((f) => f.code),
    normalizeGeneralHookFilter,
    patternKey,
  )

  // Compute presetFilter ∩ baseFilter
  const finalFilter: HookFilter = {}

  // id: user include takes priority; fallback to preset union includes.
  // exclude: user excludes + intersection of preset excludes (excluded by either → excluded).
  const finalFilterIdInclude = userInclude ?? idUnion.includes
  const finalFilterIdExclude = concatArrays(
    userExclude,
    idUnion.excludes.length > 0 ? idUnion.excludes : undefined,
  )
  if (finalFilterIdInclude || finalFilterIdExclude) {
    finalFilter.id = { include: finalFilterIdInclude, exclude: finalFilterIdExclude }
  }

  // moduleType: from presetFilter only (baseFilter doesn't constrain these)
  if (moduleTypeUnion.includes) {
    finalFilter.moduleType = moduleTypeUnion.includes
  }

  // code: from presetFilter only, with intersected excludes
  if (codeUnion.includes) {
    const finalFilterCodeExclude = codeUnion.excludes.length > 0 ? codeUnion.excludes : undefined
    if (finalFilterCodeExclude) {
      finalFilter.code = { include: codeUnion.includes, exclude: finalFilterCodeExclude }
    } else {
      finalFilter.code = codeUnion.includes
    }
  }

  return finalFilter
}

/**
 * Calculate the filters to apply to the plugin
 */
export function calculatePluginFilters(options: ResolvedPluginOptions): {
  transformFilter: HookFilter
} {
  return {
    transformFilter: calculateTransformFilter(options),
  }
}
