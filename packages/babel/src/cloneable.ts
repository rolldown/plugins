import type { PluginOptions } from './options.ts'
import type { RolldownBabelPresetItem } from './rolldownPreset.ts'

function isCloneable(value: unknown): boolean {
  if (value === null) return true
  switch (typeof value) {
    case 'undefined':
    case 'string':
    case 'number':
    case 'boolean':
      return true
    case 'object':
      break
    default:
      return false
  }
  if (value instanceof RegExp) return true
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!isCloneable(item)) return false
    }
    return true
  }
  const proto = Object.getPrototypeOf(value)
  if (proto !== Object.prototype && proto !== null) return false
  for (const item of Object.values(value)) {
    if (!isCloneable(item)) return false
  }
  return true
}

function findUncloneablePreset(
  presets: RolldownBabelPresetItem[] | undefined,
  path: string,
): string | undefined {
  if (!presets) return
  for (let i = 0; i < presets.length; i++) {
    const preset = presets[i]
    // The `rolldown` part of a preset (filters and hooks) is only used in the main thread.
    const babelPreset = typeof preset === 'object' && 'rolldown' in preset ? preset.preset : preset
    if (!isCloneable(babelPreset)) return `${path}[${i}]`
  }
}

/**
 * Returns the path of the first option that cannot be sent to a worker.
 */
export function findUncloneableOption(options: PluginOptions): string | undefined {
  const { presets, overrides, ...rest } = options
  for (const [key, value] of Object.entries(rest)) {
    if (!isCloneable(value)) return key
  }
  const presetPath = findUncloneablePreset(presets, 'presets')
  if (presetPath) return presetPath
  if (!overrides) return
  for (let i = 0; i < overrides.length; i++) {
    const { presets: overridePresets, ...overrideRest } = overrides[i]
    for (const [key, value] of Object.entries(overrideRest)) {
      if (!isCloneable(value)) return `overrides[${i}].${key}`
    }
    const overridePresetPath = findUncloneablePreset(overridePresets, `overrides[${i}].presets`)
    if (overridePresetPath) return overridePresetPath
  }
}
