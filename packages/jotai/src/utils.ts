import { basename, extname } from 'node:path'

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stripQueryAndHash(id: string): string {
  const queryIndex = id.indexOf('?')
  const hashIndex = id.indexOf('#')
  let endIndex = id.length
  if (queryIndex >= 0) endIndex = Math.min(endIndex, queryIndex)
  if (hashIndex >= 0) endIndex = Math.min(endIndex, hashIndex)
  return id.slice(0, endIndex)
}

export function getFileKey(id: string): string {
  const cleanId = stripQueryAndHash(id)
  const fileName = basename(cleanId)
  return fileName || 'atoms.ts'
}

function toIdentifier(value: string): string {
  const normalized = value.replace(/[^A-Za-z0-9_$]/g, '_')
  if (normalized.length === 0) return 'default_atom'
  if (/^[0-9]/.test(normalized)) return `_${normalized}`
  return normalized
}

export function getDefaultExportAtomName(id: string): string {
  const fileName = getFileKey(id)
  const extension = extname(fileName)
  const stem = extension.length > 0 ? fileName.slice(0, -extension.length) : fileName
  return toIdentifier(stem || 'default_atom')
}
