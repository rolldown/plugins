import * as babel from '@babel/core'
import type { ResolvedConfig } from 'vite'
import {
  compilePresetFilter,
  convertToBabelPresetItem,
  type CompiledPresetFilter,
  type PartialEnvironment,
  type PresetConversionContext,
  type RolldownBabelPresetItem,
} from './rolldownPreset'
import { filterMap } from './utils'

export interface InnerTransformOptions extends Pick<
  babel.InputOptions,
  | 'assumptions'
  | 'auxiliaryCommentAfter'
  | 'auxiliaryCommentBefore'
  | 'exclude'
  | 'comments'
  | 'compact'
  | 'cwd'
  | 'generatorOpts'
  | 'include'
  | 'parserOpts'
  | 'plugins'
  | 'retainLines'
  | 'shouldPrintComment'
  | 'targets'
  | 'wrapPluginVisitorMethod'
> {
  /**
   * List of presets (a set of plugins) to load and use
   *
   * Default: `[]`
   */
  presets?: RolldownBabelPresetItem[] | undefined
}

export interface PluginOptions extends Omit<InnerTransformOptions, 'include' | 'exclude'> {
  /**
   * If specified, only files matching the pattern will be processed by babel.
   * @default `/\.(?:[jt]sx?|[cm][jt]s)(?:$|\?)/`
   *
   * Note that this option receives the syntax supported by babel instead of picomatch.
   * @see https://babeljs.io/docs/options#matchpattern
   */
  include?: InnerTransformOptions['include']

  /**
   * If any of patterns match, babel will not process the file.
   * @default `/[\/\\]node_modules[\/\\]/`
   *
   * Note that this option receives the syntax supported by babel instead of picomatch.
   * @see https://babeljs.io/docs/options#matchpattern
   */
  exclude?: InnerTransformOptions['exclude']

  /**
   * If false, skips source map generation. This will improve performance.
   * @default true
   */
  sourceMap?: boolean

  /**
   * Allows users to provide an array of options that will be merged into the current configuration one at a time.
   * This feature is best used alongside the "test"/"include"/"exclude" options to provide conditions for which an override should apply
   */
  overrides?: InnerTransformOptions[] | undefined
}

export type ResolvedPluginOptions = PluginOptions &
  Required<Pick<PluginOptions, 'include' | 'exclude' | 'sourceMap'>>

export const DEFAULT_INCLUDE = [/\.(?:[jt]sx?|[cm][jt]s)(?:$|\?)/]
export const DEFAULT_EXCLUDE = [/[/\\]node_modules[/\\]/]

export function resolveOptions(options: PluginOptions): ResolvedPluginOptions {
  return {
    ...options,
    include: options.include ?? DEFAULT_INCLUDE,
    exclude: options.exclude ?? DEFAULT_EXCLUDE,
    sourceMap: options.sourceMap ?? true,
  }
}

function compilePresetFilters(
  presets: RolldownBabelPresetItem[],
): (CompiledPresetFilter | undefined)[] {
  return presets.map((preset) =>
    typeof preset === 'object' && 'rolldown' in preset
      ? compilePresetFilter(preset.rolldown.filter)
      : undefined,
  )
}

function filterPresetArrayWithEnvironment(
  presets: RolldownBabelPresetItem[],
  environment: PartialEnvironment,
): RolldownBabelPresetItem[] {
  return presets.filter((preset) => {
    if (typeof preset !== 'object' || !('rolldown' in preset)) return true
    if (!preset.rolldown.applyToEnvironmentHook) return true
    return preset.rolldown.applyToEnvironmentHook(environment)
  })
}

export function filterPresetsWithEnvironment(
  options: PluginOptions,
  environment: PartialEnvironment,
): PluginOptions {
  return {
    ...options,
    presets: options.presets
      ? filterPresetArrayWithEnvironment(options.presets, environment)
      : undefined,
    overrides: options.overrides?.map((override) =>
      override.presets
        ? { ...override, presets: filterPresetArrayWithEnvironment(override.presets, environment) }
        : override,
    ),
  }
}

function filterPresetArray(
  presets: RolldownBabelPresetItem[],
  config: ResolvedConfig,
): RolldownBabelPresetItem[] {
  return presets.filter((preset) => {
    if (typeof preset !== 'object' || !('rolldown' in preset)) return true
    if (!preset.rolldown.configResolvedHook) return true
    return preset.rolldown.configResolvedHook(config)
  })
}

export function filterPresetsWithConfigResolved(
  options: PluginOptions,
  config: ResolvedConfig,
): PluginOptions {
  return {
    ...options,
    presets: options.presets ? filterPresetArray(options.presets, config) : undefined,
    overrides: options.overrides?.map((override) =>
      override.presets
        ? { ...override, presets: filterPresetArray(override.presets, config) }
        : override,
    ),
  }
}

export function collectOptimizeDepsInclude(options: PluginOptions): string[] {
  const result: string[] = []
  for (const preset of options.presets ?? []) {
    if (typeof preset === 'object' && 'rolldown' in preset) {
      result.push(...(preset.rolldown.optimizeDeps?.include ?? []))
    }
  }
  for (const override of options.overrides ?? []) {
    for (const preset of override.presets ?? []) {
      if (typeof preset === 'object' && 'rolldown' in preset) {
        result.push(...(preset.rolldown.optimizeDeps?.include ?? []))
      }
    }
  }
  return result
}

/**
 * Pre-compile all preset filters and return a function that
 * converts options to babel options for a given context.
 */
export function createBabelOptionsConverter(options: ResolvedPluginOptions) {
  const presetFilters = options.presets ? compilePresetFilters(options.presets) : undefined
  const overridePresetFilters = options.overrides?.map((override) =>
    override.presets ? compilePresetFilters(override.presets) : undefined,
  )

  return function (ctx: PresetConversionContext): babel.InputOptions {
    return {
      ...options,
      presets: options.presets
        ? filterMap(options.presets, (preset, i) =>
            convertToBabelPresetItem(ctx, preset, presetFilters![i]),
          )
        : undefined,
      overrides: options.overrides?.map((override, i) =>
        override.presets
          ? {
              ...override,
              presets: filterMap(override.presets, (preset, j) =>
                convertToBabelPresetItem(ctx, preset, overridePresetFilters![i]![j]),
              ),
            }
          : (override as Omit<InnerTransformOptions, 'presets'>),
      ),
    }
  }
}
