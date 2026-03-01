/**
 * Configuration for custom emotion-like packages
 * Maps export names to their canonical emotion equivalents
 */
export interface ImportMapEntry {
  /**
   * The canonical emotion import this maps to
   * @example ["@emotion/styled", "default"]
   */
  canonicalImport: [packageName: string, exportName: string]

  /**
   * The styled base import for this package
   * @example ["package/base", "something"]
   */
  styledBaseImport?: [packageName: string, exportName: string]
}

export type ImportMapConfig = Record<string, ImportMapEntry>

export interface EmotionPluginOptions {
  /**
   * Generate source maps for emotion CSS.
   * @default true for development, otherwise false
   */
  sourceMap?: boolean

  /**
   * When to add debug labels to styled components.
   * - 'never': Never add labels
   * - 'dev-only': Only add labels in development mode (default)
   * - 'always': Always add labels
   * @default 'dev-only'
   */
  autoLabel?: 'never' | 'dev-only' | 'always'

  /**
   * Label format template.
   *
   * Defines the format of the generated debug labels.
   * This option is only relevant if `autoLabel` is not set to 'never'.
   *
   * Supports placeholders:
   * - [local]: The variable name that the result of `css` or `styled` call is assigned to
   * - [filename]: The file name (without extension) that the `css` or `styled` call is in
   * - [dirname]: The directory name of the file that the `css` or `styled` call is in
   *
   * @default "[local]"
   * @example "[dirname]--[filename]--[local]"
   */
  labelFormat?: string

  /**
   * Custom import mappings for non-standard emotion packages.
   * Maps package names to their export configurations.
   *
   * @example
   * If you have a custom library "my-emotion-lib" that re-exports
   * the default export of `@emotion/styled` as `myStyled` and
   * the `css` export of `@emotion/react` as `myCss`,
   * then you can configure it like this:
   * ```
   * {
   *   "my-emotion-lib": {
   *     "myStyled": {
   *       canonicalImport: ["@emotion/styled", "default"]
   *     },
   *     "myCss": {
   *       canonicalImport: ["@emotion/react", "css"]
   *     }
   *   }
   * }
   * ```
   */
  importMap?: Record<string, ImportMapConfig>
}
