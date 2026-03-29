import { Visitor } from 'rolldown/utils'
import type { ESTree, VisitorObject } from 'rolldown/utils'
import { ScopeTracker, type Invalidatable } from './scope-tracker.ts'
import { extractBindingNames } from './binding-names.ts'
import type { VisitorContext } from './types.ts'
import {
  mergeVisitors,
  type SimpleScopedVisitorObject,
  type SimpleVisitorObject,
} from './merge-visitors.ts'

export interface TransformRecord<T> {
  name: string
  node: object
  data: T
}

interface InternalRecord<T> extends TransformRecord<T>, Invalidatable {
  nameIdx: number
  invalidated: boolean
}

type ScopedVisitorHandler<H, T> = H extends (node: infer N) => void
  ? (node: N, ctx: VisitorContext<T>) => void
  : H

export type ScopedVisitorObject<T> = {
  [K in keyof VisitorObject]?:
    | ScopedVisitorHandler<Exclude<VisitorObject[K], undefined>, T>
    | undefined
}

export interface ScopedVisitorOptions<T> {
  trackedNames: string[]
  visitor: ScopedVisitorObject<T>
}

export class ScopedVisitor<T = unknown> {
  private trackedNames: string[]
  private userVisitor: ScopedVisitorObject<T>

  constructor(options: ScopedVisitorOptions<T>) {
    this.trackedNames = options.trackedNames
    this.userVisitor = options.visitor
  }

  walk(program: ESTree.Program): TransformRecord<T>[] {
    const records: InternalRecord<T>[] = []
    const trackedNames = this.trackedNames
    const tracker = new ScopeTracker(trackedNames.length)

    const ctx: VisitorContext<T> = {
      record(opts) {
        const nameIdx = trackedNames.indexOf(opts.name)
        if (nameIdx === -1) return // not a tracked name

        records.push({
          name: opts.name,
          node: opts.node,
          data: opts.data,
          nameIdx,
          invalidated: tracker.isShadowed(nameIdx),
        })
      },
    }

    // Reusable temp array to avoid allocations per declaration
    const tempNames: string[] = []

    /**
     * Declare all binding names from a pattern for a given declaration style.
     */
    const declarePattern = (
      pattern: ESTree.ParamPattern | ESTree.BindingPattern,
      mode: 'block' | 'var',
    ): void => {
      tempNames.length = 0
      extractBindingNames(pattern, tempNames)
      for (const name of tempNames) {
        const idx = trackedNames.indexOf(name)
        if (idx === -1) continue
        if (mode === 'block') {
          tracker.declareBlock(idx, records)
        } else {
          tracker.declareVar(idx, records)
        }
      }
    }
    /**
     * Declare all function params as block-scoped bindings.
     */
    const declareParams = (params: ESTree.ParamPattern[]): void => {
      for (const param of params) declarePattern(param, 'block')
    }

    const scopeEnter: VisitorObject = {
      FunctionDeclaration(node) {
        // Declare function name in OUTER block scope before pushing
        if (node.id) declarePattern(node.id, 'block')
        tracker.pushScope('function', records.length)
        if (node.params) declareParams(node.params)
      },
      FunctionExpression(node) {
        tracker.pushScope('function', records.length)
        // Declare function name inside function scope (named function expression)
        if (node.id) declarePattern(node.id, 'block')
        if (node.params) declareParams(node.params)
      },
      ArrowFunctionExpression(node) {
        tracker.pushScope('function', records.length)
        if (node.params) declareParams(node.params)
      },
      BlockStatement(_node) {
        tracker.pushScope('block', records.length)
      },
      ForStatement(_node) {
        tracker.pushScope('block', records.length)
      },
      ForInStatement(_node) {
        tracker.pushScope('block', records.length)
      },
      ForOfStatement(_node) {
        tracker.pushScope('block', records.length)
      },
      SwitchStatement(_node) {
        tracker.pushScope('block', records.length)
      },
      StaticBlock(_node) {
        tracker.pushScope('block', records.length)
      },
      CatchClause(node) {
        tracker.pushScope('block', records.length)
        if (node.param) {
          declarePattern(node.param, 'block')
        }
      },
    }
    const scopeExit: SimpleVisitorObject = {}
    for (const key of Object.keys(scopeEnter)) {
      scopeExit[`${key}:exit`] = () => tracker.popScope()
    }

    const declarationOnlyEnter: VisitorObject = {
      VariableDeclaration(node) {
        const mode = node.kind === 'var' ? 'var' : 'block'
        for (const declarator of node.declarations) {
          declarePattern(declarator.id, mode)
        }
      },
      ClassDeclaration(node) {
        if (node.id) {
          declarePattern(node.id, 'block')
        }
      },
    }

    const oxcVisitor = mergeVisitors(
      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion --- TypeScript cannot handle these complex types
      this.userVisitor as SimpleScopedVisitorObject<T>,
      ctx,
      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion --- TypeScript cannot handle these complex types
      { ...(scopeEnter as SimpleVisitorObject), ...(declarationOnlyEnter as SimpleVisitorObject) },
      scopeExit,
    )

    const visitor = new Visitor(oxcVisitor)
    visitor.visit(program)

    return records
      .filter((r) => !r.invalidated)
      .map(({ name, node, data }) => ({ name, node, data }))
  }
}
