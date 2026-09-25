import { Plugin, type HookFilter, type SourceMapInput } from 'rolldown'
import {
  collectOptimizeDepsInclude,
  createBabelOptionsConverter,
  filterPresetsWithConfigResolved,
  filterPresetsWithEnvironment,
  resolveOptions,
  type PluginOptions,
} from './options.ts'
import type { Pool } from 'workerpool'
import { createWorkerPool, resolveParallelOption } from './parallel.ts'
import { transformWithBabel, type TransformResult } from './transform.ts'
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

  const maxWorkers = resolveParallelOption(rawOptions)
  // Created on first use, so that builds with no babel work do not start workers.
  let workerPool: Pool | undefined
  async function terminateWorkerPool() {
    const pool = workerPool
    workerPool = undefined
    await pool?.terminate()
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

        let result: TransformResult | undefined
        try {
          if (maxWorkers) {
            workerPool ??= createWorkerPool(maxWorkers)
            result = await workerPool.exec('transform', [
              code,
              id,
              babelOptions,
              rawOptions.runtimeVersion,
            ])
          } else {
            result = await transformWithBabel(code, id, babelOptions, rawOptions.runtimeVersion)
          }
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
            code: result.code,
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            map: result.map as SourceMapInput,
          }
        }
      },
    },
    async closeBundle() {
      if (!this.meta.watchMode) await terminateWorkerPool()
    },
    async closeWatcher() {
      await terminateWorkerPool()
    },
  } satisfies VitePlugin

  return plugin as Plugin
}

export default babelPlugin
export { defineRolldownBabelPreset } from './rolldownPreset.ts'
export type { RolldownBabelPreset } from './rolldownPreset.ts'
