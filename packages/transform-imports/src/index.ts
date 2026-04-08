import { withMagicString, type RolldownString } from 'rolldown-string'
import type { Plugin } from 'rolldown'
import { Visitor } from 'rolldown/utils'
import type { ESTree } from 'rolldown/utils'
import type { TransformImportsOptions, TransformConfig, TransformPattern } from './types.js'
import { processTemplate } from './template.js'

export type {
  TransformImportsOptions,
  TransformConfig,
  PluginConfig,
  TransformPattern,
} from './types.js'

function getName(node: ESTree.ModuleExportName): string {
  return node.type === 'Literal' ? node.value : node.name
}

interface CompiledModule {
  regex: RegExp
  config: TransformConfig
}

function compileModulePatterns(modules: Record<string, TransformConfig>): CompiledModule[] {
  return Object.entries(modules).map(([pattern, config]) => ({
    regex:
      pattern.startsWith('^') && pattern.endsWith('$')
        ? new RegExp(pattern)
        : new RegExp(`^${pattern}$`),
    config,
  }))
}

function buildCodeFilter(modules: Record<string, TransformConfig>): RegExp | undefined {
  const literals = Object.keys(modules)
    .map((pattern) => {
      // Extract literal prefix before first regex metacharacter
      const match = pattern.match(/^[^\\?*+[\](){}|^$.]+/)
      return match ? match[0] : ''
    })
    .filter(Boolean)
  if (literals.length === 0) return undefined

  const escaped = literals.map((lit) => lit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(escaped.join('|'))
}

function findMatchingModule(
  source: string,
  compiledModules: CompiledModule[],
): { config: TransformConfig; matches: RegExpMatchArray } | null {
  for (const { regex, config } of compiledModules) {
    const match = source.match(regex)
    if (match) return { config, matches: match }
  }
  return null
}

function resolveTransformPath(
  transform: TransformPattern,
  member: string,
  moduleMatches: RegExpMatchArray,
): string {
  let result: string

  if (typeof transform === 'string') {
    result = processTemplate(transform, member, moduleMatches, null)
  } else {
    result = resolveFromTuples(transform, member, moduleMatches)
  }

  // Clean up consecutive slashes from empty template variables
  return result.replace(/\/\/+/g, '/')
}

function resolveFromTuples(
  tuples: [string, string][],
  member: string,
  moduleMatches: RegExpMatchArray,
): string {
  for (const [pattern, template] of tuples) {
    if (pattern === '*') {
      return processTemplate(template, member, moduleMatches, null)
    }
    // Treat all non-wildcard patterns as regex
    const regex = new RegExp(`^${pattern}$`)
    const match = member.match(regex)
    if (match) {
      return processTemplate(template, member, moduleMatches, match)
    }
  }

  return member
}

function processImportDeclaration(
  s: RolldownString,
  decl: ESTree.ImportDeclaration,
  compiledModules: CompiledModule[],
): void {
  const source = decl.source.value
  const match = findMatchingModule(source, compiledModules)
  if (!match) return

  const { config, matches } = match
  const specifiers = decl.specifiers

  // Check preventFullImport
  if (config.preventFullImport) {
    if (specifiers.some((sp) => sp.type === 'ImportNamespaceSpecifier')) {
      throw new Error(`preventFullImport: namespace import of "${source}" is not allowed`)
    }
    if (specifiers.length === 0) {
      throw new Error(`preventFullImport: side-effect import of "${source}" is not allowed`)
    }
  }

  // Side-effect import with no specifiers: rewrite source path
  if (specifiers.length === 0) {
    const transformedPath = resolveTransformPath(config.transform, '', matches)
    s.update(decl.source.start, decl.source.end, `"${transformedPath}"`)
    return
  }

  // Check if any specifiers will actually be transformed
  const hasTransformed = specifiers.some(
    (sp) =>
      sp.type === 'ImportSpecifier' ||
      (sp.type === 'ImportDefaultSpecifier' && config.handleDefaultImport) ||
      (sp.type === 'ImportNamespaceSpecifier' && config.handleNamespaceImport),
  )

  // If nothing will be transformed, leave the import unchanged
  if (!hasTransformed) return

  const newImports: string[] = []
  for (const spec of specifiers) {
    if (spec.type === 'ImportSpecifier') {
      const imported = getName(spec.imported)
      const local = getName(spec.local)
      const transformedPath = resolveTransformPath(config.transform, imported, matches)

      if (config.skipDefaultConversion) {
        newImports.push(`import { ${local} } from "${transformedPath}";`)
      } else {
        newImports.push(`import ${local} from "${transformedPath}";`)
      }
    } else if (spec.type === 'ImportDefaultSpecifier') {
      if (config.handleDefaultImport) {
        const local = getName(spec.local)
        const transformedPath = resolveTransformPath(config.transform, local, matches)
        newImports.push(`import ${local} from "${transformedPath}";`)
      }
      // Non-handled defaults in mixed imports are dropped
    } else if (spec.type === 'ImportNamespaceSpecifier') {
      if (config.handleNamespaceImport) {
        const local = getName(spec.local)
        const transformedPath = resolveTransformPath(config.transform, local, matches)
        newImports.push(`import * as ${local} from "${transformedPath}";`)
      }
      // Non-handled namespaces in mixed imports are dropped
    }
  }
  s.update(decl.start, decl.end, newImports.join('\n'))
}

function processExportNamedDeclaration(
  s: RolldownString,
  decl: ESTree.ExportNamedDeclaration,
  compiledModules: CompiledModule[],
): void {
  if (!decl.source) return

  const source = decl.source.value
  const match = findMatchingModule(source, compiledModules)
  if (!match) return

  const { config, matches } = match

  const reexports: string[] = []
  for (const spec of decl.specifiers) {
    const local = getName(spec.local)
    const exported = getName(spec.exported)
    const transformedPath = resolveTransformPath(config.transform, local, matches)
    if (config.skipDefaultConversion) {
      reexports.push(`export { ${exported} } from "${transformedPath}";`)
    } else {
      reexports.push(`export { default as ${exported} } from "${transformedPath}";`)
    }
  }
  s.update(decl.start, decl.end, reexports.join('\n'))
}

function processExportAllDeclaration(
  s: RolldownString,
  decl: ESTree.ExportAllDeclaration,
  compiledModules: CompiledModule[],
): void {
  const source = decl.source.value
  const match = findMatchingModule(source, compiledModules)
  if (!match) return

  const { config, matches } = match
  const transformedPath = resolveTransformPath(config.transform, '', matches)
  s.update(decl.source.start, decl.source.end, `"${transformedPath}"`)
}

function getStaticImportExpressionSource(source: ESTree.Expression): string | null {
  if (source.type === 'Literal' && typeof source.value === 'string') {
    return source.value
  }
  if (source.type === 'TemplateLiteral' && source.expressions.length === 0) {
    const [quasi] = source.quasis
    if (quasi) return quasi.value.cooked ?? quasi.value.raw
    return ''
  }
  return null
}

function processImportExpression(
  s: RolldownString,
  decl: ESTree.ImportExpression,
  compiledModules: CompiledModule[],
): void {
  const source = getStaticImportExpressionSource(decl.source)
  if (source == null) return

  const match = findMatchingModule(source, compiledModules)
  if (!match) return

  const { config, matches } = match
  const transformedPath = resolveTransformPath(config.transform, '', matches)
  s.update(decl.source.start, decl.source.end, `"${transformedPath}"`)
}

export function transformImportsPlugin(options: TransformImportsOptions): Plugin {
  const compiledModules = compileModulePatterns(options.modules)
  const codeFilter = buildCodeFilter(options.modules)

  return {
    name: 'rolldown-plugin-transform-imports',

    transform: {
      filter: {
        id: /\.[jt]sx?$/,
        ...(codeFilter && { code: { include: codeFilter } }),
      },

      handler: withMagicString(function (this, s, _id, meta) {
        const ast = meta?.ast ?? this.parse(s.original)

        new Visitor({
          ImportDeclaration(node: ESTree.ImportDeclaration) {
            processImportDeclaration(s, node, compiledModules)
          },
          ExportNamedDeclaration(node: ESTree.ExportNamedDeclaration) {
            processExportNamedDeclaration(s, node, compiledModules)
          },
          ExportAllDeclaration(node: ESTree.ExportAllDeclaration) {
            processExportAllDeclaration(s, node, compiledModules)
          },
          ImportExpression(node: ESTree.ImportExpression) {
            processImportExpression(s, node, compiledModules)
          },
        }).visit(ast)
      }),
    },
  }
}

export default transformImportsPlugin
