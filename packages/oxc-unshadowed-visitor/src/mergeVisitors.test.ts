// oxlint-disable unicorn/consistent-function-scoping
import { describe, test, expect } from 'vitest'
import { mergeVisitors } from './mergeVisitors.ts'
import type { VisitorContext } from './types.ts'
import type { ESTree } from 'rolldown/utils'

describe('mergeVisitors', () => {
  const dummyIdentifierNode: ESTree.IdentifierReference = {
    type: 'Identifier',
    name: 'foo',
    start: 0,
    end: 3,
  }
  function makeCtx(): VisitorContext<string> {
    return {
      record() {},
    }
  }

  test('user enter runs after internal enter', () => {
    const order: string[] = []
    const merged = mergeVisitors(
      {
        Identifier: () => order.push('user-enter'),
      },
      makeCtx(),
      { Identifier: () => order.push('internal-enter') },
      {},
    )
    merged.Identifier(dummyIdentifierNode)
    expect(order).toEqual(['internal-enter', 'user-enter'])
  })

  test('user exit runs before internal exit', () => {
    const order: string[] = []
    const merged = mergeVisitors(
      {
        'Identifier:exit': () => order.push('user-exit'),
      },
      makeCtx(),
      {},
      { 'Identifier:exit': () => order.push('internal-exit') },
    )
    merged['Identifier:exit'](dummyIdentifierNode)
    expect(order).toEqual(['user-exit', 'internal-exit'])
  })

  test('internal-only visitors are included', () => {
    const ctx = makeCtx()
    const enterFn = () => {}
    const exitFn = () => {}
    const merged = mergeVisitors({}, ctx, { Identifier: enterFn }, { 'Identifier:exit': exitFn })
    expect(merged.Identifier).toBe(enterFn)
    expect(merged['Identifier:exit']).toBe(exitFn)
  })

  test('user-only visitors are included', () => {
    const called: string[] = []
    const ctx = makeCtx()
    const merged = mergeVisitors(
      {
        Identifier: () => called.push('identifier'),
        'Identifier:exit': () => called.push('identifier-exit'),
      },
      ctx,
      {},
      {},
    )
    merged.Identifier(dummyIdentifierNode)
    merged['Identifier:exit'](dummyIdentifierNode)
    expect(called).toEqual(['identifier', 'identifier-exit'])
  })

  test('ctx is passed to user visitor functions', () => {
    let receivedCtx: unknown
    const ctx = makeCtx()
    const merged = mergeVisitors(
      {
        Identifier: (_node, c) => {
          receivedCtx = c
        },
      },
      ctx,
      {},
      {},
    )
    merged.Identifier(dummyIdentifierNode)
    expect(receivedCtx).toBe(ctx)
  })

  test('ctx is passed to user exit visitor functions', () => {
    let receivedCtx: unknown
    const ctx = makeCtx()
    const merged = mergeVisitors(
      {
        'Identifier:exit': (_node, c) => {
          receivedCtx = c
        },
      },
      ctx,
      {},
      {},
    )
    merged['Identifier:exit'](dummyIdentifierNode)
    expect(receivedCtx).toBe(ctx)
  })
})
