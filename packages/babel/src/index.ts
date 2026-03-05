import { Plugin, type HookFilter, type SourceMapInput } from 'rolldown'
import {
  collectOptimizeDepsInclude,
  createBabelOptionsConverter,
  filterPresetsWithConfigResolved,
  filterPresetsWithEnvironment,
  resolveOptions,
  type PluginOptions,
} from './options.ts'
import * as babel from './babelCompat.ts'
import type { PartialEnvironment, PresetConversionContext } from './rolldownPreset.ts'
import { calculatePluginFilters } from './filter.ts'
import type { ResolvedConfig, Plugin as VitePlugin } from 'vite'

async function babelPlugin(rawOptions: PluginOptions): Promise<Plugin> {
  if (rawOptions.runtimeVersion) {
    try {
      import.meta.resolve('@babel/plugin-transform-runtime')
    } catch (err) {
      throw new Error(
        `Failed to load @babel/plugin-transform-runtime. Please install it to use the runtime option.`,
        { cause: err },
      )
    }
  }

  let configFilteredOptions: PluginOptions | undefined
  const envState = new Map<string | undefined, ReturnType<typeof createBabelOptionsConverter>>()

  const plugin = {
    name: '@rolldown/plugin-babel',
    // this plugin should run before TS, JSX, TSX transformations are done
    enforce: 'pre',
    config() {
      const include = collectOptimizeDepsInclude(rawOptions)
      if (include.length > 0) {
        return { optimizeDeps: { include } }
      }
    },
    configResolved(config: ResolvedConfig) {
      configFilteredOptions = filterPresetsWithConfigResolved(rawOptions, config)
      const resolved = resolveOptions(configFilteredOptions)
      plugin.transform.filter = calculatePluginFilters(resolved).transformFilter
    },
    applyToEnvironment(environment: PartialEnvironment) {
      const envOptions = filterPresetsWithEnvironment(configFilteredOptions!, environment)
      if (
        !envOptions.presets?.length &&
        !envOptions.plugins?.length &&
        !envOptions.overrides?.some((o) => o.presets?.length || o.plugins?.length)
      ) {
        return false
      }
      const resolved = resolveOptions(envOptions)
      envState.set(environment.name, createBabelOptionsConverter(resolved))
      return true
    },
    outputOptions() {
      if (this.meta.viteVersion) return
      const resolved = resolveOptions(rawOptions)
      envState.set(undefined, createBabelOptionsConverter(resolved))
      plugin.transform.filter = calculatePluginFilters(resolved).transformFilter
    },
    transform: {
      filter: undefined as HookFilter | undefined,
      async handler(code, id, opts) {
        const convertToBabelOptions = envState.get(this.environment?.name)
        if (!convertToBabelOptions) return
        const conversionContext: PresetConversionContext = {
          id,
          moduleType: opts?.moduleType ?? 'js',
          code,
        }
        const babelOptions = convertToBabelOptions(conversionContext)
        const loadedOptions = await babel.loadOptionsAsync({
          ...babelOptions,
          babelrc: false,
          configFile: false,
          parserOpts: {
            sourceType: 'module',
            allowAwaitOutsideFunction: true,
            ...babelOptions.parserOpts,
          },
          overrides: [
            {
              test: '**/*.jsx',
              parserOpts: { plugins: ['jsx'] },
            },
            {
              test: '**/*.ts',
              parserOpts: { plugins: ['typescript'] },
            },
            {
              test: '**/*.tsx',
              parserOpts: { plugins: ['typescript', 'jsx'] },
            },
            ...(babelOptions.overrides ?? []),
          ],
          filename: id,
        })
        if (!loadedOptions || loadedOptions.plugins.length === 0) {
          // No plugins to run — @babel/plugin-transform-runtime only affects
          // how other plugins' helpers are emitted, so skip it too.
          return
        }

        if (rawOptions.runtimeVersion) {
          loadedOptions.plugins ??= []
          loadedOptions.plugins.push([
            '@babel/plugin-transform-runtime',
            { version: rawOptions.runtimeVersion },
          ])
        }

        let result: babel.FileResult | null
        try {
          result = await babel.transformAsync(
            code,
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            loadedOptions as unknown as babel.InputOptions,
          )
        } catch (err: any) {
          this.error({
            message: `[BabelError] ${err.message}`,
            loc: err.loc,
            pos: err.pos,
            cause: err,
            pluginCode: `${err.code}:${err.reasonCode}`,
          })
        }
        if (result) {
          return {
            code: result.code ?? undefined,
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            map: result.map as SourceMapInput,
          }
        }
      },
    },
  } satisfies VitePlugin

  return plugin as Plugin
}

export default babelPlugin
export { defineRolldownBabelPreset } from './rolldownPreset.ts'
export type { RolldownBabelPreset } from './rolldownPreset.ts'
