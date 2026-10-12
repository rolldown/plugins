import * as babel from './babelCompat.ts'

export interface TransformResult {
  code: string | undefined
  map: babel.FileResult['map']
}

/**
 * Runs in the main thread and in parallel workers,
 * so every argument must be structured-cloneable when `parallel` is set.
 */
export async function transformWithBabel(
  code: string,
  id: string,
  babelOptions: babel.InputOptions,
  runtimeVersion: string | undefined,
): Promise<TransformResult | undefined> {
  const loadedOptions = await babel.loadOptionsAsync({
    ...babelOptions,
    babelrc: false,
    configFile: false,
    parserOpts: {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
      ...babelOptions.parserOpts,
    },
    overrides: [
      {
        test: /\.jsx(?:$|\?)/,
        parserOpts: { plugins: ['jsx'] },
      },
      {
        test: /\.ts(?:$|\?)/,
        parserOpts: { plugins: ['typescript'] },
      },
      {
        test: /\.tsx(?:$|\?)/,
        parserOpts: { plugins: ['typescript', 'jsx'] },
      },
      ...(babelOptions.overrides ?? []),
    ],
    filename: id,
  })
  if (!loadedOptions || loadedOptions.plugins.length === 0) {
    // No plugins to run — @babel/plugin-transform-runtime only affects
    // how other plugins' helpers are emitted, so skip it too.
    return
  }

  if (runtimeVersion) {
    loadedOptions.plugins ??= []
    loadedOptions.plugins.push(['@babel/plugin-transform-runtime', { version: runtimeVersion }])
  }

  const result = await babel.transformAsync(code, loadedOptions)
  if (result) {
    return { code: result.code ?? undefined, map: result.map }
  }
}
