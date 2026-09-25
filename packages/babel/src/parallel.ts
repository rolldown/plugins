import { availableParallelism } from 'node:os'
import { fileURLToPath } from 'node:url'
import workerpool, { type Pool } from 'workerpool'
import type { PluginOptions } from './options.ts'
import { findUncloneableOption } from './cloneable.ts'

// The source worker is used when this file runs unbundled, for example in tests.
const WORKER_PATH = fileURLToPath(
  new URL(import.meta.url.endsWith('.ts') ? './worker.ts' : './worker.mjs', import.meta.url),
)

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

  const uncloneable = findUncloneableOption(options)
  if (uncloneable) {
    throw new Error(
      `Cannot use the "parallel" option, because "${uncloneable}" cannot be sent to a worker thread. ` +
        'Refer to plugins and presets by module name instead of by function or object.',
    )
  }

  return typeof parallel === 'number'
    ? parallel
    : Math.min(availableParallelism(), DEFAULT_MAX_WORKERS)
}

export function createWorkerPool(maxWorkers: number): Pool {
  return workerpool.pool(WORKER_PATH, { maxWorkers, workerType: 'thread' })
}
