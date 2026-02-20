import * as babel from '@babel/core'

// TODO
type RolldownBabelPresetItem = babel.PluginItem

export interface InnerTransformOptions extends Pick<
  babel.TransformOptions,
  | 'assumptions'
  | 'auxiliaryCommentAfter'
  | 'auxiliaryCommentBefore'
  | 'exclude'
  | 'comments'
  | 'compact'
  | 'cwd'
  | 'generatorOpts'
  | 'ignore'
  | 'include'
  | 'only'
  | 'parserOpts'
  | 'plugins'
  | 'retainLines'
  | 'shouldPrintComment'
  | 'test'
  | 'targets'
  | 'wrapPluginVisitorMethod'
> {
  /**
   * List of presets (a set of plugins) to load and use
   *
   * Default: `[]`
   */
  presets?: RolldownBabelPresetItem[] | null | undefined
}

export interface PluginOptions extends InnerTransformOptions {
  /**
   * If any of patterns match, the current configuration object is considered inactive and is ignored during config processing.
   * @default `/[\/\\]node_modules[\/\\]/`
   */
  exclude?: InnerTransformOptions['exclude']

  /**
   * If false, skips source map generation. This will improve performance.
   * @default true
   */
  sourceMap?: boolean;

  /**
   * Allows users to provide an array of options that will be merged into the current configuration one at a time.
   * This feature is best used alongside the "test"/"include"/"exclude" options to provide conditions for which an override should apply
   */
  overrides?: InnerTransformOptions[] | undefined
}
