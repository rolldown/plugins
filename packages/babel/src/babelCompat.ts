/**
 * A type compatibility layer for Babel 7 and 8.
 */

export * from '@babel/core'

import * as babel from '@babel/core'

// https://github.com/type-challenges/type-challenges/issues/29285
type IsAny<T> = boolean extends (T extends never ? true : false) ? true : false

/** **When using babel 7, install `@types/babel__core` to get proper types.** */
type InputOptionsFallback = {
  /** **When using babel 7, install `@types/babel__core` to get proper types.** */
  plugins?: unknown[]
  /** **When using babel 7, install `@types/babel__core` to get proper types.** */
  presets?: unknown[]
}

// @ts-ignore -- InputOptions doesn't exist in Babel 7
type InputOptions8 = babel.InputOptions
// @ts-ignore -- PresetItem doesn't exist in Babel 7
type PresetItem8 = babel.PresetItem
// @ts-ignore -- PluginObject doesn't exist in Babel 7
type PluginObject8<T> = babel.PluginObject<T>
// @ts-ignore -- FileResult doesn't exist in Babel 7
type FileResult8 = babel.FileResult

// @ts-ignore -- TransformOptions doesn't exist in Babel 8
type TransformOptions = babel.TransformOptions
// @ts-ignore -- PluginObj doesn't exist in Babel 8
type PluginObj<T> = babel.PluginObj<T>
// @ts-ignore -- BabelFileResult doesn't exist in Babel 8
type BabelFileResult = babel.BabelFileResult

export type InputOptions = IsAny<InputOptions8> extends false ? InputOptions8 : IsAny<TransformOptions> extends false ? TransformOptions : InputOptionsFallback
export type PresetItem = IsAny<PresetItem8> extends false ? PresetItem8 : babel.PluginItem
export type PluginObject<T = babel.PluginPass> =
  IsAny<PluginObject8<T>> extends false ? PluginObject8<T> : PluginObj<T>
export type FileResult = IsAny<FileResult8> extends false ? FileResult8 : BabelFileResult

export const loadOptionsAsync: (
  options?: InputOptions,
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
) => Promise<InputOptions & { plugins: babel.PluginItem[] }> = (babel as any).loadOptionsAsync
