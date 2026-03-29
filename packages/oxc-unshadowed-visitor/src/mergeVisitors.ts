import type * as ESTree from '@oxc-project/types'
import type { SimpleVisitorObject, VisitorContext } from './types.ts'

export type SimpleScopedVisitorObject<T> = {
  [key: string]: (node: ESTree.Node, ctx: VisitorContext<T>) => void
}
export type { SimpleVisitorObject }

/**
 * Merge user visitors with internal scope-tracking visitors.
 * Enter: internal runs FIRST, then user.
 * Exit: user runs FIRST, then internal.
 */
export function mergeVisitors<T>(
  userVisitor: SimpleScopedVisitorObject<T>,
  ctx: VisitorContext<T>,
  internalEnter: SimpleVisitorObject,
  internalExit: SimpleVisitorObject,
): SimpleVisitorObject {
  const merged: SimpleVisitorObject = {}

  // Process user visitor keys
  for (const key of Object.keys(userVisitor)) {
    const userFn = userVisitor[key]
    const isExit = key.endsWith(':exit')
    const baseKey = isExit ? key.slice(0, -5) : key

    if (isExit) {
      const internalExitFn = internalExit[key]
      if (internalExitFn) {
        merged[key] = (node) => {
          userFn?.(node, ctx)
          internalExitFn(node)
        }
      } else {
        merged[key] = (node) => {
          userFn?.(node, ctx)
        }
      }
    } else {
      const internalEnterFn = internalEnter[baseKey]
      if (internalEnterFn) {
        merged[key] = (node) => {
          internalEnterFn(node)
          userFn(node, ctx)
        }
      } else {
        merged[key] = (node) => {
          userFn(node, ctx)
        }
      }
    }
  }

  // Add internal-only visitors that the user didn't define
  for (const [key, fn] of Object.entries(internalEnter)) {
    if (!(key in merged)) merged[key] = fn
  }
  for (const [key, fn] of Object.entries(internalExit)) {
    if (!(key in merged)) merged[key] = fn
  }

  return merged
}
