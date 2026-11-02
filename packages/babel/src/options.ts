import * as babel from './babelCompat'
import type { HookFilterExtension } from 'rolldown'
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

export interface InnerTransformOptions extends Partial<
  Pick<
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
  >
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
   * When set, automatically adds `@babel/plugin-transform-runtime` so that
   * babel helpers are imported from `@babel/runtime` instead of being inlined
   * into every file.
   *
   * Requires `@babel/plugin-transform-runtime` and `@babel/runtime` to be installed.
   */
  runtimeVersion?: string

  /**
   * Transform files in worker threads.
   * Pass a number to set the worker count.
   * `true` uses the number of CPU cores, with a maximum of 4.
   *
   * All babel options must be structured-cloneable:
   * refer to plugins and presets by name, not by function.
   * Rolldown preset filters and hooks stay in the main thread.
   * @default false
   */
  parallel?: boolean | number

  /**
   * The filter for the transform hook.
   * When set, it replaces the filter built from `include`, `exclude`, and the preset filters,
   * so it cannot be used with `include` or `exclude`.
   *
   * Accepts the object form (`{ id, moduleType, code }`)
   * and the composable filter expressions from `@rolldown/pluginutils`.
   * Vite's dev server does not apply composable filter expressions,
   * so the plugin also checks them in JS during `vite dev`.
   * @see https://rolldown.rs/apis/plugin-api/hook-filters
   */
  filter?: TransformHookFilter

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

export type TransformHookFilter = NonNullable<HookFilterExtension<'transform'>['filter']>

// `include` and `exclude` stay unset when `filter` is set,
// because babel would also apply the defaults and skip files that `filter` allows.
export type ResolvedPluginOptions = PluginOptions & Required<Pick<PluginOptions, 'sourceMap'>>

export const DEFAULT_INCLUDE: RegExp[] = [/\.(?:[jt]sx?|[cm][jt]s)(?:$|\?)/]
// oxlint-disable-next-line no-control-regex
export const DEFAULT_EXCLUDE: RegExp[] = [/[/\\]node_modules[/\\]|^\0rolldown\/runtime\.js$/]

export function resolveOptions(options: PluginOptions): ResolvedPluginOptions {
  if (options.filter && (options.include || options.exclude)) {
    throw new Error(
      '[@rolldown/plugin-babel] `filter` replaces `include` and `exclude`. Set `filter` alone, or use `include` and `exclude` without it.',
    )
  }
  return {
    ...options,
    include: options.filter ? undefined : (options.include ?? DEFAULT_INCLUDE),
    exclude: options.filter ? undefined : (options.exclude ?? DEFAULT_EXCLUDE),
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
    // Strip plugin-level options that babel doesn't understand
    const { runtimeVersion: _, parallel: __, filter: ___, ...babelOptions } = options
    return {
      ...babelOptions,
      // sourcemap collapsing is handled by Rolldown
      // @ts-ignore babel v7 types does not allow `false` but it is actually supported
      inputSourceMap: false,
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
          : // oxlint-disable-next-line typescript/no-unnecessary-type-assertion
            (override as Omit<InnerTransformOptions, 'presets'>),
      ),
    }
  }
}
