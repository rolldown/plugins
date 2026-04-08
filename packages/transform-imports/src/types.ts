export type TransformPattern = string | [pattern: string, template: string][]

export interface TransformConfig {
  /** Template with {{member}} placeholder: "lodash/{{member}}" or array of [pattern, template] tuples */
  transform: TransformPattern
  /** Throw error on `import * as X` or `import 'mod'` */
  preventFullImport?: boolean
  /** Keep `import { X }` instead of `import X` */
  skipDefaultConversion?: boolean
  /** Transform default imports using local name as member (default: false) */
  handleDefaultImport?: boolean
  /** Transform namespace imports using local name as member (default: false) */
  handleNamespaceImport?: boolean
}

export type PluginConfig = Record<string, TransformConfig>

export interface TransformImportsOptions {
  modules: PluginConfig
}
