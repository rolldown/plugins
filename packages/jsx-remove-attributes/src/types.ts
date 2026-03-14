export interface JsxRemoveAttributesOptions {
  /**
   * Patterns to match JSX attribute names to remove.
   * Strings are exact matches.
   * @default [/^data-test/]
   */
  attributes?: Array<string | RegExp>
}
