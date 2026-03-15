import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import type { CompiledProjectConfig, RelayPluginOptions } from './types.js'

function normalizeImportPath(path: string): string {
  return path.replaceAll('\\', '/')
}

function ensureRelativeImportPath(path: string): string {
  if (path.startsWith('.') || path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path)) {
    return path
  }
  return `./${path}`
}

function isFileInsideDirectory(filePath: string, directory: string): boolean {
  const rel = relative(directory, filePath)
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

export function resolveArtifactPath(
  id: string,
  operationName: string,
  extension: 'js' | 'ts',
  options: RelayPluginOptions,
  projects: ReadonlyArray<CompiledProjectConfig>,
): string {
  const fileName = `${operationName}.graphql.${extension}`
  const resolvedId = resolve(id)

  if (projects.length > 0) {
    for (const project of projects) {
      if (!isFileInsideDirectory(resolvedId, project.rootDir)) continue
      const baseDir = project.artifactDirectory ?? ''
      return normalizeImportPath(join(baseDir, '__generated__', fileName))
    }
  }

  if (options.artifactDirectory) {
    return normalizeImportPath(join(options.artifactDirectory, fileName))
  }

  const sourceDir = dirname(resolvedId)
  const artifactPath = normalizeImportPath(
    relative(sourceDir, join(sourceDir, '__generated__', fileName)),
  )
  return ensureRelativeImportPath(artifactPath)
}
