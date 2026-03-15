export interface JotaiPluginOptions {
  /**
   * Custom atom function names (beyond built-in jotai ones)
   * @example ['customAtom']
   */
  atomNames?: string[]
  /**
   * Enable Debug Label transform which adds `debugLabel` property to atoms for better debugging in React DevTools
   * @default true for development, otherwise false
   */
  debugLabel?: boolean
  /**
   * Enable React Refresh transform for Jotai atoms
   * @default true for development, otherwise false
   */
  reactRefresh?: boolean
}
