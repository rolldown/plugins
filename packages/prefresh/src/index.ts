import crypto from 'node:crypto'
import { withMagicString } from 'rolldown-string'
import type { Plugin } from 'rolldown'
import type { ESTree } from 'rolldown/utils'
import { ScopedVisitor } from '@rolldown/oxc-unshadowed-visitor'
import type { PrefreshPluginOptions } from './types.ts'

export type { PrefreshPluginOptions } from './types.ts'

const DEFAULT_LIBRARY = ['preact', 'react', 'preact/compat']

interface RecordData {
  callNode: ESTree.CallExpression
  parentKey: string
  paramNames: string[]
}

function resolveLibrary(options: PrefreshPluginOptions): Set<string> {
  return new Set(options.library ?? DEFAULT_LIBRARY)
}

function createFileHash(id: string): string {
  return crypto.hash('sha256', id, 'hex').slice(0, 16)
}

function getSimpleParamNames(params: ESTree.ParamPattern[]): string[] {
  const names: string[] = []
  for (const parameter of params) {
    if (parameter.type === 'Identifier') {
      names.push(parameter.name)
    }
  }
  return names
}

function getObjectPatternKey(property: ESTree.Node & { type: 'Property' }): string | null {
  if (property.computed) return null
  if (property.key.type === 'Identifier') {
    return property.key.name
  }
  if (property.key.type === 'Literal') {
    return String(property.key.value)
  }
  return null
}

function buildContextKey(
  fileHash: string,
  parentKey: string,
  count: number,
  paramNames: readonly string[],
): string {
  const base = `${fileHash}${parentKey}${count}`
  if (paramNames.length === 0) {
    return `\`${base}\``
  }

  const suffix = paramNames.map((name) => `\${${name}}`).join('')
  return `\`${base}_${suffix}\``
}

/**
 * Prefresh plugin for Rolldown
 *
 * Memoizes createContext() calls from Preact/React to preserve context identity
 * across HMR cycles. Wraps createContext() calls with a caching pattern using
 * the function itself as a cache object.
 */
export default function prefreshPlugin(options: PrefreshPluginOptions = {}): Plugin {
  const libraries = resolveLibrary(options)
  let isEnabled = options.enabled!

  const plugin: Plugin = {
    name: 'rolldown-plugin-prefresh',
    // @ts-expect-error Vite-specific property
    enforce: 'pre',

    // @ts-expect-error Vite-specific hook
    configResolved(config) {
      isEnabled ??= !config.isProduction
      if (!isEnabled) {
        delete plugin.transform
      }
    },

    outputOptions() {
      if ('viteVersion' in this.meta) return
      isEnabled ??= process.env.NODE_ENV === 'development'
      if (!isEnabled) {
        delete plugin.transform
      }
    },

    transform: {
      filter: {
        id: /\.[jt]sx?$/,
        code: {
          include: 'createContext',
        },
      },

      handler: withMagicString(function (this, s, id, meta) {
        const lang = id.endsWith('.tsx')
          ? 'tsx'
          : id.endsWith('.ts')
            ? 'ts'
            : id.endsWith('.jsx')
              ? 'jsx'
              : 'js'
        const program = meta?.ast ?? this.parse(s.original, { lang })

        // ── Phase 1: Scan imports ──
        const namedImports = new Set<string>()
        const namespaceImports = new Set<string>()

        for (const node of program.body) {
          if (node.type !== 'ImportDeclaration') continue
          if (!libraries.has(node.source.value)) continue

          for (const specifier of node.specifiers) {
            if (specifier.type === 'ImportSpecifier') {
              const importedName =
                specifier.imported.type === 'Identifier'
                  ? specifier.imported.name
                  : specifier.imported.value
              if (importedName === 'createContext') {
                namedImports.add(specifier.local.name)
              }
            } else if (
              specifier.type === 'ImportDefaultSpecifier' ||
              specifier.type === 'ImportNamespaceSpecifier'
            ) {
              namespaceImports.add(specifier.local.name)
            }
          }
        }

        const trackedNames = [...namedImports, ...namespaceImports]
        if (trackedNames.length === 0) return

        // ── Phase 2: Walk with ScopedVisitor ──
        const paramNamesStack: string[][] = [[]]
        const parentKeyStack: string[] = ['']
        let objectPatternDepth = 0

        const sv = new ScopedVisitor<RecordData>({
          trackedNames,
          visitor: {
            FunctionDeclaration(node) {
              paramNamesStack.push(getSimpleParamNames(node.params))
            },
            'FunctionDeclaration:exit'() {
              paramNamesStack.pop()
            },

            FunctionExpression(node) {
              paramNamesStack.push(getSimpleParamNames(node.params))
            },
            'FunctionExpression:exit'() {
              paramNamesStack.pop()
            },

            ArrowFunctionExpression(node) {
              paramNamesStack.push(getSimpleParamNames(node.params))
            },
            'ArrowFunctionExpression:exit'() {
              paramNamesStack.pop()
            },

            VariableDeclarator(node) {
              if (node.id.type === 'Identifier') {
                parentKeyStack.push(`$${node.id.name}`)
              } else {
                parentKeyStack.push(parentKeyStack[parentKeyStack.length - 1])
              }
            },
            'VariableDeclarator:exit'() {
              parentKeyStack.pop()
            },

            AssignmentExpression(node) {
              if (node.left.type === 'Identifier') {
                parentKeyStack.push(`_${node.left.name}`)
              } else {
                parentKeyStack.push(parentKeyStack[parentKeyStack.length - 1])
              }
            },
            'AssignmentExpression:exit'() {
              parentKeyStack.pop()
            },

            ObjectPattern() {
              objectPatternDepth++
            },
            'ObjectPattern:exit'() {
              objectPatternDepth--
            },

            Property(node) {
              if (objectPatternDepth > 0) {
                const key = getObjectPatternKey(node)
                if (key) {
                  parentKeyStack.push(`__${key}`)
                  return
                }
              }
              parentKeyStack.push(parentKeyStack[parentKeyStack.length - 1])
            },
            'Property:exit'() {
              parentKeyStack.pop()
            },

            CallExpression(node, ctx) {
              const callee = node.callee
              const parentKey = parentKeyStack[parentKeyStack.length - 1]
              const paramNames = paramNamesStack[paramNamesStack.length - 1]

              if (callee.type === 'Identifier' && namedImports.has(callee.name)) {
                ctx.record({
                  name: callee.name,
                  node,
                  data: { callNode: node, parentKey, paramNames },
                })
                return
              }

              if (
                callee.type === 'MemberExpression' &&
                callee.object.type === 'Identifier' &&
                namespaceImports.has(callee.object.name)
              ) {
                const isCreateContext = callee.computed
                  ? callee.property.type === 'Literal' &&
                    typeof callee.property.value === 'string' &&
                    callee.property.value === 'createContext'
                  : callee.property.type === 'Identifier' &&
                    callee.property.name === 'createContext'

                if (isCreateContext) {
                  ctx.record({
                    name: callee.object.name,
                    node,
                    data: { callNode: node, parentKey, paramNames },
                  })
                }
              }
            },
          },
        })

        const records = sv.walk(program)
        if (records.length === 0) return

        // ── Phase 3: Apply transformations ──
        const counters = new Map<string, number>()
        const fileHash = createFileHash(id)

        for (const record of records) {
          const { callNode, parentKey, paramNames } = record.data
          const counter = (counters.get(parentKey) ?? 0) + 1
          counters.set(parentKey, counter)

          const callee = s.slice(callNode.callee.start, callNode.callee.end)
          const key = buildContextKey(fileHash, parentKey, counter, paramNames)

          const firstArg = callNode.arguments[0]
          if (firstArg && firstArg.type !== 'SpreadElement') {
            const value = s.slice(firstArg.start, firstArg.end)
            s.update(
              callNode.start,
              callNode.end,
              `Object.assign(${callee}[${key}] || (${callee}[${key}] = ${callee}(${value})), { __: ${value} })`,
            )
            continue
          }

          s.update(
            callNode.start,
            callNode.end,
            `${callee}[${key}] || (${callee}[${key}] = ${callee}())`,
          )
        }
      }),
    },
  }
  return plugin
}
