import type { ESTree } from 'rolldown/utils'
import { ExprKind } from './common'
import type { ImportMapConfig } from './types'

export type EmotionImportMap = Record<
  /* moduleName */ string,
  Record</* exportName */ string, ExprKind>
>

const EMOTION_OFFICIAL_LIBRARIES: EmotionImportMap = {
  '@emotion/css': { css: ExprKind.Css, default: ExprKind.Css },
  '@emotion/styled': { default: ExprKind.Styled },
  '@emotion/react': { css: ExprKind.Css, keyframes: ExprKind.Css, Global: ExprKind.GlobalJSX },
  '@emotion/primitives': { css: ExprKind.Css, default: ExprKind.Styled },
  '@emotion/native': { css: ExprKind.Css, default: ExprKind.Styled },
}

export function expandImportMap(
  importMap: Record<string, ImportMapConfig> | undefined,
): EmotionImportMap {
  const configs: EmotionImportMap = JSON.parse(JSON.stringify(EMOTION_OFFICIAL_LIBRARIES))
  if (!importMap) return configs

  for (const [importSource, exports] of Object.entries(importMap)) {
    for (const [localExportName, entry] of Object.entries(exports)) {
      const [packageName, exportName] = entry.canonicalImport
      if (packageName === '@emotion/react' && exportName === 'jsx') continue

      const canonicalConfig = EMOTION_OFFICIAL_LIBRARIES[packageName]
      if (canonicalConfig === undefined) {
        throw new Error(
          `Import map entry for "${importSource}" references unknown package "${packageName}". ` +
            `Must be one of: ${Object.keys(EMOTION_OFFICIAL_LIBRARIES).join(', ')}`,
        )
      }
      const kind = canonicalConfig[exportName]
      if (kind === undefined) {
        throw new Error(
          `Import map entry for "${importSource}" references unknown export "${exportName}" in package "${packageName}". ` +
            `Must be one of: ${Object.keys(canonicalConfig).join(', ')}`,
        )
      }
      configs[importSource] ??= {}
      configs[importSource][localExportName] = kind
    }
  }
  return configs
}

export type PackageMeta =
  | { type: 'named'; kind: ExprKind }
  | { type: 'namespace'; config: Record<string, ExprKind> }

export interface ImportMap {
  addFromImportDecl(importDecl: ESTree.ImportDeclaration): void
  get(importedName: string): PackageMeta | undefined
  getTrackedNames(): string[]
  isEmpty(): boolean
}

export function createImportMap(registeredImports: EmotionImportMap): ImportMap {
  const importPackages = new Map<string, PackageMeta>()

  return {
    addFromImportDecl(importDecl) {
      if (importDecl.importKind === 'type') return

      const src = importDecl.source.value
      const config = registeredImports[src]
      if (!config) return

      for (const spec of importDecl.specifiers) {
        if (spec.type === 'ImportSpecifier') {
          const importedName =
            spec.imported.type === 'Identifier' ? spec.imported.name : spec.imported.value
          const kind = config[importedName]
          if (kind !== undefined) {
            importPackages.set(spec.local.name, { type: 'named', kind })
          }
        } else if (spec.type === 'ImportDefaultSpecifier') {
          const kind = config.default
          if (kind !== undefined) {
            importPackages.set(spec.local.name, { type: 'named', kind })
          }
        } else if (spec.type === 'ImportNamespaceSpecifier') {
          importPackages.set(spec.local.name, {
            type: 'namespace',
            config,
          })
        }
      }
    },
    get(importedName) {
      return importPackages.get(importedName)
    },
    getTrackedNames() {
      return [...importPackages.keys()]
    },
    isEmpty() {
      return importPackages.size === 0
    },
  }
}
