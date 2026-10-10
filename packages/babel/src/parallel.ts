import { availableParallelism } from 'node:os'
import { Worker } from 'artichokie'
import type { PluginOptions } from './options.ts'
import { findUncloneableOption } from './cloneable.ts'
import type { transformWithBabel, TransformResult } from './transform.ts'
import type { WorkerResponse } from './worker.ts'

type TransformArgs = Parameters<typeof transformWithBabel>

// The source worker is used when this file runs unbundled, for example in tests.
const WORKER_URL = new URL(
  import.meta.url.endsWith('.ts') ? './worker.ts' : './worker.mjs',
  import.meta.url,
).href

// More workers rarely help, because each worker loads babel and the plugins again.
const DEFAULT_MAX_WORKERS = 4

/**
 * Returns the worker count, or `undefined` when parallel mode is off.
 */
export function resolveParallelOption(options: PluginOptions): number | undefined {
  const { parallel } = options
  if (typeof parallel === 'number' && (!Number.isInteger(parallel) || parallel < 1)) {
    throw new Error(
      'The "parallel" option must be true or a positive integer that sets the worker count.',
    )
  }
  if (!parallel) return

  return typeof parallel === 'number'
    ? parallel
    : Math.min(availableParallelism(), DEFAULT_MAX_WORKERS)
}

export interface WorkerPool {
  run(...args: TransformArgs): Promise<TransformResult | undefined>
  stop(): void
}

export function createWorkerPool(maxWorkers: number): WorkerPool {
  // artichokie sends this function to the worker as a string, so it cannot use outer variables.
  const worker = new Worker(
    () =>
      async (workerUrl: string, args: TransformArgs): Promise<WorkerResponse> => {
        const { transform } = await import(workerUrl)
        return transform(args)
      },
    { max: maxWorkers },
  )

  return {
    async run(...args) {
      const response = await worker.run(WORKER_URL, args)
      if ('error' in response) {
        throw Object.assign(new Error(response.error.message), response.error)
      }
      return response.result
    },
    stop() {
      worker.stop()
    },
  }
}

/**
 * Returns a message that names the option, if `err` says that a value cannot go to a worker.
 */
export function describeCloneError(err: unknown, options: PluginOptions): string | undefined {
  if (!(err instanceof Error) || err.name !== 'DataCloneError') return
  const uncloneable = findUncloneableOption(options)
  if (!uncloneable) return
  return (
    `Cannot use the "parallel" option, because "${uncloneable}" cannot be sent to a worker thread. ` +
    'Refer to plugins and presets by module name instead of by function or object.'
  )
}
