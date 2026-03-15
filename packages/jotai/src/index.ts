import { withMagicString, type RolldownString } from 'rolldown-string'
import type { Plugin } from 'rolldown'
import type { ESTree } from 'rolldown/utils'
import { Visitor } from 'rolldown/utils'
import type { JotaiPluginOptions } from './types.js'
import { createAtomImportMap, type AtomImportMap } from './atomImportMap.js'
import { escapeRegExp, getDefaultExportAtomName, getFileKey } from './utils.js'

export type { JotaiPluginOptions } from './types.js'

const JOTAI_CACHE_INIT = `globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
  cache: new Map(),
  get(name, inst) {
    if (this.cache.has(name)) return this.cache.get(name);
    this.cache.set(name, inst);
    return inst;
  }
};`

function buildCodeFilter(atomNames: ReadonlyArray<string>): RegExp {
  const needles = new Set<string>(['jotai', 'atom'])
  for (const atomName of atomNames) {
    if (atomName.length > 0) needles.add(atomName)
  }
  return new RegExp([...needles].map(escapeRegExp).join('|'))
}

function createCacheKey(fileKey: string, accessPath: ReadonlyArray<string>): string {
  return `${fileKey}/${accessPath.join('.')}`
}

function wrapWithCacheGetExpression(
  s: RolldownString,
  key: string,
  prefixPos: number,
  suffixPos: number,
): void {
  s.prependRight(prefixPos, `globalThis.jotaiAtomCache.get(${JSON.stringify(key)}, `)
  s.appendLeft(suffixPos, `)`)
}

function getCacheInsertionPosition(program: ESTree.Program): number {
  for (const statement of program.body) {
    if (!(statement.type === 'ExpressionStatement' && typeof statement.directive === 'string')) {
      return statement.start
    }
  }
  return 0
}

function isExpressionExportDefault(
  declaration: ESTree.ExportDefaultDeclaration['declaration'],
): declaration is ESTree.Expression {
  if (
    declaration.type !== 'FunctionDeclaration' &&
    declaration.type !== 'ClassDeclaration' &&
    declaration.type !== 'TSInterfaceDeclaration' &&
    declaration.type !== 'TSDeclareFunction'
  ) {
    declaration satisfies ESTree.Expression
    return true
  } else {
    return false
  }
}

function collectDebugLabelNames(
  declaration: ESTree.VariableDeclaration,
  atomImportMap: AtomImportMap,
): string[] {
  const labels: string[] = []
  for (const declarator of declaration.declarations) {
    if (declarator.id.type !== 'Identifier') continue
    if (!declarator.init) continue
    if (!atomImportMap.isAtomImport(declarator.init)) continue
    labels.push(declarator.id.name)
  }
  return labels
}

function scanForAtomCalls(
  node: ESTree.Expression,
  accessPath: string[],
  atomImportMap: AtomImportMap,
  fileKey: string,
  s: RolldownString,
): boolean {
  if (node.type === 'CallExpression' && atomImportMap.isAtomImport(node.callee)) {
    const key = createCacheKey(fileKey, accessPath)
    wrapWithCacheGetExpression(s, key, node.start, node.end)
    return true
  }
  if (node.type === 'ArrayExpression') {
    let found = false
    for (const [index, element] of node.elements.entries()) {
      if (element === null || element.type === 'SpreadElement') continue
      if (scanForAtomCalls(element, [...accessPath, index.toString()], atomImportMap, fileKey, s)) {
        found = true
      }
    }
    return found
  }
  if (node.type === 'ObjectExpression') {
    let found = false
    for (const property of node.properties) {
      if (property.type === 'Property') {
        let keyName: string
        if (property.shorthand) {
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion --- shorthand properties must have Identifier keys
          keyName = (property.key as ESTree.IdentifierReference).name
        } else {
          keyName =
            property.key.type === 'Identifier'
              ? property.key.name
              : property.key.type === 'Literal'
                ? String(property.key.value)
                : property.computed
                  ? `[computed:(${property.key.start},${property.key.end})]`
                  : 'unknown'
        }
        if (
          property.value.type !== 'FunctionExpression' &&
          property.value.type !== 'ArrowFunctionExpression' &&
          scanForAtomCalls(
            property.value as ESTree.Expression,
            [...accessPath, keyName],
            atomImportMap,
            fileKey,
            s,
          )
        ) {
          found = true
        }
      }
    }
    return found
  }
  return false
}

export function jotaiPlugin(options: JotaiPluginOptions = {}): Plugin {
  const atomNames = options.atomNames ?? []
  let debugLabelEnabled = options.debugLabel!
  let reactRefreshEnabled = options.reactRefresh!
  const codeFilter = buildCodeFilter(atomNames)

  const plugin: Plugin = {
    name: 'rolldown-plugin-jotai',
    // @ts-expect-error Vite-specific property
    enforce: 'pre',

    // @ts-expect-error Vite-specific hook
    configResolved(config) {
      debugLabelEnabled ??= !config.isProduction
      reactRefreshEnabled ??= !config.isProduction
      if (!debugLabelEnabled && !reactRefreshEnabled) {
        delete plugin.transform
      }
    },

    outputOptions() {
      if ('viteVersion' in this.meta) return
      debugLabelEnabled ??= process.env.NODE_ENV === 'development'
      reactRefreshEnabled ??= process.env.NODE_ENV === 'development'
      if (!debugLabelEnabled && !reactRefreshEnabled) {
        delete plugin.transform
      }
    },

    transform: {
      filter: {
        id: /\.[jt]sx?$/,
        code: {
          include: codeFilter,
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

        const atomImportMap = createAtomImportMap(atomNames)
        const fileKey = getFileKey(id)
        let usedAtom = false
        let functionDepth = 0
        const exportedVarDecls = new Set<ESTree.VariableDeclaration>()

        function handleVarDecl(node: ESTree.VariableDeclaration, containerEnd: number): void {
          if (debugLabelEnabled) {
            const labels = collectDebugLabelNames(node, atomImportMap)
            if (labels.length > 0) {
              const assignments = labels
                .map((label) => `${label}.debugLabel = ${JSON.stringify(label)};`)
                .join('\n')
              s.appendRight(containerEnd, `\n${assignments}`)
            }
          }
          if (reactRefreshEnabled && functionDepth === 0) {
            for (const decl of node.declarations) {
              if (!decl.init) continue
              const key = decl.id.type === 'Identifier' ? decl.id.name : '[missing-declarator]'
              if (
                scanForAtomCalls(decl.init, [key], atomImportMap, fileKey, s)
              ) {
                usedAtom = true
              }
            }
          }
        }

        new Visitor({
          ImportDeclaration(node) {
            atomImportMap.addFromImportDecl(node)
          },

          FunctionDeclaration() { functionDepth++ },
          'FunctionDeclaration:exit'() { functionDepth-- },
          FunctionExpression() { functionDepth++ },
          'FunctionExpression:exit'() { functionDepth-- },
          ArrowFunctionExpression() { functionDepth++ },
          'ArrowFunctionExpression:exit'() { functionDepth-- },

          ExportDefaultDeclaration(node: ESTree.ExportDefaultDeclaration) {
            if (debugLabelEnabled && isExpressionExportDefault(node.declaration)) {
              if (atomImportMap.isAtomImport(node.declaration)) {
                const atomName = getDefaultExportAtomName(id)

                s.move(node.declaration.start, node.declaration.end, node.start)
                s.prependLeft(node.start, `const ${atomName} = `)
                s.appendRight(
                  node.start,
                  `;\n${atomName}.debugLabel = ${JSON.stringify(atomName)};\n`,
                )
                s.appendRight(node.declaration.end, `${atomName};`)
              }
            }
          },

          ExportNamedDeclaration(node) {
            if (node.declaration?.type === 'VariableDeclaration') {
              exportedVarDecls.add(node.declaration)
              handleVarDecl(node.declaration, node.end)
            }
          },

          VariableDeclaration(node: ESTree.VariableDeclaration) {
            if (exportedVarDecls.has(node)) return
            handleVarDecl(node, node.end)
          },
        }).visit(program)

        if (reactRefreshEnabled && usedAtom) {
          const insertPos = getCacheInsertionPosition(program)
          s.appendLeft(insertPos, `${JOTAI_CACHE_INIT}\n`)
        }
      }),
    },
  }
  return plugin
}

export default jotaiPlugin
