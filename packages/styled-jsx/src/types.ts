import type { Targets } from 'lightningcss'

export interface StyledJsxPluginOptions {
  /**
   * Target browser versions
   * @see https://lightningcss.dev/transpilation.html#browser-targets
   */
  browsers?: Targets
  /**
   * Generate inline source maps for scoped CSS.
   * @default true in development, false otherwise
   */
  sourceMap?: boolean
}
