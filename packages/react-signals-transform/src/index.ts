import { transformAsync } from '@babel/core'
import type { BabelFileMetadata } from '@babel/core'
import type { Plugin, SourceMapInput } from 'rolldown'
import reactSignalsTransformBabelPlugin, {
  BABEL_METADATA_KEY,
  type PluginOptions as ReactSignalsTransformPluginOptions,
} from './babel.ts'

const scriptFilter = /\.[cm]?[jt]sx?(?:$|\?)/

function getParserPlugins(id: string): Array<'jsx' | 'typescript'> {
  const cleanId = id.replace(/\?.*$/, '')
  if (cleanId.endsWith('.tsx')) return ['typescript', 'jsx']
  if (cleanId.endsWith('.ts') || cleanId.endsWith('.mts') || cleanId.endsWith('.cts')) {
    return ['typescript']
  }
  return ['jsx']
}

function isTransformMetadata(value: unknown): value is { changed?: unknown } {
  return value != null && typeof value === 'object' && 'changed' in value
}

function didTransform(metadata: BabelFileMetadata | undefined): boolean {
  const transformMetadata =
    metadata && Object.prototype.hasOwnProperty.call(metadata, BABEL_METADATA_KEY)
      ? Reflect.get(metadata, BABEL_METADATA_KEY)
      : undefined
  return isTransformMetadata(transformMetadata) && Boolean(transformMetadata.changed)
}

export default function reactSignalsTransform(
  options: ReactSignalsTransformPluginOptions = {},
): Plugin {
  return {
    name: '@rolldown/plugin-react-signals-transform',
    // @ts-expect-error Vite-specific property
    enforce: 'pre',
    transform: {
      filter: {
        id: scriptFilter,
      },
      async handler(code, id) {
        const result = await transformAsync(code, {
          babelrc: false,
          configFile: false,
          filename: id,
          parserOpts: {
            plugins: getParserPlugins(id),
          },
          plugins: [[reactSignalsTransformBabelPlugin, options]],
          sourceMaps: true,
          sourceType: 'unambiguous',
        })

        if (!result?.code || !didTransform(result.metadata)) {
          return
        }

        const map: SourceMapInput | undefined = result.map ?? undefined

        return {
          code: result.code,
          map,
        }
      },
    },
  }
}

export { reactSignalsTransformBabelPlugin }
export type { ReactSignalsTransformPluginOptions }
