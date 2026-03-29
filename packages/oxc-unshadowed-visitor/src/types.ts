import type * as ESTree from './oxcCompat.ts'

export interface VisitorContext<T> {
  record(opts: { name: string; node: object; data: T }): void
}

export type SimpleVisitorObject = {
  [key: string]: (node: ESTree.Node) => void
}

export type WalkFn = (program: ESTree.Program, visitor: SimpleVisitorObject) => void
