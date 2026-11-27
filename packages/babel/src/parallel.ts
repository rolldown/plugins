import { availableParallelism } from 'node:os'
import { Worker } from 'artichokie'
import type { PluginOptions } from './options.ts'
import { findUncloneableOption } from './cloneable.ts'
import type { transformWithBabel, TransformResult } from './transform.ts'

type TransformArgs = Parameters<typeof transformWithBabel>

interface WorkerError {
  message: string
  stack: string | undefined
  code: string | undefined
  reasonCode: string | undefined
  pos: number | undefined
  loc: { line: number; column: number } | undefined
}

type WorkerResponse = { result: TransformResult | undefined } | { error: WorkerError }

// The source module is used when this file runs unbundled, for example in tests.
const TRANSFORM_URL = new URL(
  import.meta.url.endsWith('.ts') ? './transform.ts' : './transform.mjs',
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
  const getTransformUrl = () => TRANSFORM_URL

  const worker = new Worker(
    async () => {
      const { transformWithBabel }: typeof import('./transform.ts') = await import(
        getTransformUrl()
      )
      return async (...args: TransformArgs): Promise<WorkerResponse> => {
        try {
          return { result: await transformWithBabel(...args) }
        } catch (err: any) {
          // The structured clone of an error drops fields such as `loc`, so send a plain object.
          return {
            error: {
              message: err.message,
              stack: err.stack,
              code: err.code,
              reasonCode: err.reasonCode,
              pos: err.pos,
              loc: err.loc && { line: err.loc.line, column: err.loc.column },
            },
          }
        }
      }
    },
    {
      max: maxWorkers,
      parentFunctions: { getTransformUrl },
      // By default, artichokie starts the worker with `eval: true`. Node's CommonJS eval
      // setup puts `require`, `module`, `__dirname`, and `__filename` on the worker's
      // `globalThis`, where Babel plugins loaded as ES modules can see them. In a regular
      // CommonJS file on the main thread, those names are local wrapper parameters.
      // Starting the worker as an ES module keeps plugin behavior consistent with the main thread.
      type: 'module',
    },
  )

  return {
    async run(...args) {
      const response = await worker.run(...args)
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
