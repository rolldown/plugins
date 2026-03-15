import { withMagicString } from 'rolldown-string'
import type { Plugin } from 'rolldown'
import { Visitor } from 'rolldown/utils'
import type { ESTree } from 'rolldown/utils'
import { resolve } from 'node:path'
import type { CompiledProjectConfig, RelayPluginOptions } from './types.js'
import { extractOperationName } from './operationName.js'
import { resolveArtifactPath } from './artifactPath.js'

export type { RelayPluginOptions, ProjectConfig } from './types.js'

interface RelayImport {
  path: string
  item: string
}

function findInsertAfterDirectives(program: ESTree.Program): number {
  for (const stmt of program.body) {
    if ('directive' in stmt) continue
    return stmt.start
  }
  return 0
}

function getOutputFileExtension(options: RelayPluginOptions): 'js' | 'ts' {
  if (options.outputFileExtension === 'javascript') return 'js'
  if (options.outputFileExtension === 'typescript') return 'ts'
  if (options.language === 'typescript') return 'ts'
  return 'js'
}

function compileProjects(options: RelayPluginOptions): CompiledProjectConfig[] {
  if (!options.projects || options.projects.length === 0) return []

  return options.projects.map((project) => ({
    rootDir: resolve(project.rootDir),
    artifactDirectory: project.artifactDirectory,
  }))
}

export default function relayPlugin(options: RelayPluginOptions = {}): Plugin {
  const extension = getOutputFileExtension(options)
  const eagerEsModules = options.eagerEsModules !== false
  const projects = compileProjects(options)

  return {
    name: 'rolldown-plugin-relay',
    // @ts-expect-error Vite-specific property
    enforce: 'pre',

    transform: {
      filter: {
        id: /\.[jt]sx?$/,
        code: {
          include: 'graphql',
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

        const imports: RelayImport[] = []
        const seenImports = new Set<string>()

        new Visitor({
          TaggedTemplateExpression(node: ESTree.TaggedTemplateExpression) {
            if (node.tag.type !== 'Identifier' || node.tag.name !== 'graphql') return

            const operationName = extractOperationName(node)
            if (!operationName) return

            const artifactPath = resolveArtifactPath(
              id,
              operationName,
              extension,
              options,
              projects,
            )

            if (eagerEsModules) {
              const item = `__${operationName}`
              if (!seenImports.has(item)) {
                imports.push({ path: artifactPath, item })
                seenImports.add(item)
              }
              s.update(node.start, node.end, item)
            } else {
              s.update(node.start, node.end, `require(${JSON.stringify(artifactPath)})`)
            }
          },
        }).visit(program)

        if (!eagerEsModules || imports.length === 0) return

        const insertPos = findInsertAfterDirectives(program)
        const importCode = imports
          .map((importItem) => `import ${importItem.item} from ${JSON.stringify(importItem.path)};`)
          .join('\n')
        s.appendLeft(insertPos, `${importCode}\n`)
      }),
    },
  }
}
