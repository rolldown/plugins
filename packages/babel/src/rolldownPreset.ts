import * as babel from '@babel/core'
import type { GeneralHookFilter, ModuleTypeFilter } from 'rolldown'
import type { ResolvedConfig, Plugin as VitePlugin } from 'vite'
import picomatch from 'picomatch'
import { arrayify } from './utils'

export type PartialEnvironment = Parameters<NonNullable<VitePlugin['applyToEnvironment']>>[0]

export type RolldownBabelPreset = {
  preset: babel.PresetItem
  rolldown: {
    filter?: {
      id?: GeneralHookFilter
      moduleType?: ModuleTypeFilter
      code?: GeneralHookFilter
    }
    applyToEnvironmentHook?: (environment: PartialEnvironment) => boolean
    configResolvedHook?: (config: ResolvedConfig) => boolean
  }
}

export type RolldownBabelPresetItem = babel.PresetItem | RolldownBabelPreset

export type PresetConversionContext = {
  id: string
  moduleType: string
  code: string
}

type StringOrRegExp = string | RegExp
type Matcher = (value: string) => boolean

function compilePattern(pattern: StringOrRegExp): Matcher {
  if (pattern instanceof RegExp) {
    return (value) => pattern.test(value)
  }
  return picomatch(pattern)
}

function compilePatterns(patterns: StringOrRegExp[]): Matcher {
  const matchers = patterns.map(compilePattern)
  return (value) => matchers.some((m) => m(value))
}

/**
 * Pre-compile a GeneralHookFilter into a single matcher function.
 * Returns undefined when the filter matches everything.
 */
function compileGeneralHookFilter(filter: GeneralHookFilter | undefined): Matcher | undefined {
  if (filter == null) return undefined

  let include: StringOrRegExp[] | undefined
  let exclude: StringOrRegExp[] | undefined

  if (typeof filter === 'string' || filter instanceof RegExp) {
    include = [filter]
  } else if (Array.isArray(filter)) {
    include = filter as StringOrRegExp[]
  } else {
    include = filter.include != null ? arrayify(filter.include) : undefined
    exclude = filter.exclude != null ? arrayify(filter.exclude) : undefined
  }

  const includeMatcher = include ? compilePatterns(include) : undefined
  const excludeMatcher = exclude ? compilePatterns(exclude) : undefined

  if (includeMatcher && excludeMatcher) {
    return (value) => !excludeMatcher(value) && includeMatcher(value)
  }
  if (excludeMatcher) {
    return (value) => !excludeMatcher(value)
  }
  return includeMatcher
}

function compileModuleTypeFilter(filter: ModuleTypeFilter | undefined): Matcher | undefined {
  if (filter == null) return undefined
  const types = Array.isArray(filter) ? filter : (filter.include ?? [])
  if (types.length === 0) return undefined
  const typeSet = new Set(types)
  return (value) => typeSet.has(value)
}

export type CompiledPresetFilter = (ctx: PresetConversionContext) => boolean

/**
 * Pre-compile a preset's filter into a single matcher function
 * that checks all dimensions (id, moduleType, code) at once.
 * Returns undefined when the filter matches everything.
 */
export function compilePresetFilter(
  filter: RolldownBabelPreset['rolldown']['filter'],
): CompiledPresetFilter | undefined {
  if (!filter) return undefined
  const matchId = compileGeneralHookFilter(filter.id)
  const matchModuleType = compileModuleTypeFilter(filter.moduleType)
  const matchCode = compileGeneralHookFilter(filter.code)
  if (!matchId && !matchModuleType && !matchCode) return undefined
  return (ctx) =>
    (!matchId || matchId(ctx.id)) &&
    (!matchModuleType || matchModuleType(ctx.moduleType)) &&
    (!matchCode || matchCode(ctx.code))
}

export function defineRolldownBabelPreset(preset: RolldownBabelPreset): RolldownBabelPreset {
  return preset
}

export function convertToBabelPresetItem(
  ctx: PresetConversionContext,
  preset: RolldownBabelPresetItem,
  compiledFilter?: CompiledPresetFilter,
): { value: babel.PresetItem } | undefined {
  if (typeof preset !== 'object' || !('rolldown' in preset)) {
    return { value: preset }
  }

  if (compiledFilter && !compiledFilter(ctx)) return undefined

  return { value: preset.preset }
}
