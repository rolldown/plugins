export interface PrefreshPluginOptions {
  /**
   * Libraries to detect `createContext` imports from.
   * @default ['preact', 'react', 'preact/compat']
   */
  library?: string[]

  /**
   * Enable transform
   * @default true for development, otherwise false
   */
  enabled?: boolean
}
