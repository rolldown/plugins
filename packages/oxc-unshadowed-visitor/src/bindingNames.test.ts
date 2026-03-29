import { describe, test, expect } from 'vitest'
import { parseSync, type ESTree } from 'rolldown/utils'
import { extractBindingNames } from './bindingNames.ts'

function parse(code: string) {
  return parseSync('test.js', code).program
}

describe('extractBindingNames', () => {
  function extractFromParam(code: string): string[] {
    const program = parse(`function f(${code}) {}`)
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const fn = program.body[0] as ESTree.Function
    const names: string[] = []
    for (const param of fn.params) {
      extractBindingNames(param, names)
    }
    return names
  }

  function extractFromDecl(code: string): string[] {
    const program = parse(code)
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const decl = program.body[0] as ESTree.VariableDeclaration
    const names: string[] = []
    for (const declarator of decl.declarations) {
      extractBindingNames(declarator.id, names)
    }
    return names
  }

  test('simple identifier', () => {
    expect(extractFromParam('a')).toEqual(['a'])
  })

  test('multiple params', () => {
    expect(extractFromParam('a, b, c')).toEqual(['a', 'b', 'c'])
  })

  test('rest param', () => {
    expect(extractFromParam('a, ...rest')).toEqual(['a', 'rest'])
  })

  test('array destructuring', () => {
    expect(extractFromDecl('const [a, b] = arr')).toEqual(['a', 'b'])
  })

  test('array destructuring with holes', () => {
    expect(extractFromDecl('const [a, , b] = arr')).toEqual(['a', 'b'])
  })

  test('object destructuring', () => {
    expect(extractFromDecl('const { a, b } = obj')).toEqual(['a', 'b'])
  })

  test('renamed object destructuring', () => {
    expect(extractFromDecl('const { x: a, y: b } = obj')).toEqual(['a', 'b'])
  })

  test('rest element in array', () => {
    expect(extractFromDecl('const [a, ...rest] = arr')).toEqual(['a', 'rest'])
  })

  test('rest element in object', () => {
    expect(extractFromDecl('const { a, ...rest } = obj')).toEqual(['a', 'rest'])
  })

  test('assignment pattern', () => {
    expect(extractFromParam('a = 1, b = 2')).toEqual(['a', 'b'])
  })

  test('nested destructuring', () => {
    expect(extractFromDecl('const { a: { b, c }, d } = obj')).toEqual(['b', 'c', 'd'])
  })

  test('deeply nested mixed destructuring', () => {
    expect(extractFromDecl('const { a: [b, { c: d }], ...e } = obj')).toEqual(['b', 'd', 'e'])
  })
})
