import { rolldown } from 'rolldown'
import swc from '@rollup/plugin-swc'
import type { JscTarget } from '@swc/core'

export interface TransformOptions {
  filename: string
  plugins: Array<[string, Record<string, unknown>]>
  /** Source code - used to detect JSX in .js files */
  code?: string
}

/**
 * Check if code likely contains JSX syntax
 */
function containsJsx(code: string): boolean {
  // Look for JSX patterns like <Component or <div
  return /<[A-Za-z]/.test(code)
}

/**
 * Determine parser syntax based on file extension and code content
 */
function getParserConfig(
  filename: string,
  code?: string,
): { syntax: 'typescript' | 'ecmascript'; tsx?: boolean; jsx?: boolean } {
  if (filename.endsWith('.tsx')) {
    return { syntax: 'typescript', tsx: true }
  }
  if (filename.endsWith('.ts')) {
    // Auto-detect JSX in .ts files (some test files use JSX without .tsx extension)
    if (code && containsJsx(code)) {
      return { syntax: 'typescript', tsx: true }
    }
    return { syntax: 'typescript', tsx: false }
  }
  if (filename.endsWith('.jsx')) {
    return { syntax: 'ecmascript', jsx: true }
  }
  // For .js files, auto-detect JSX
  if (code && containsJsx(code)) {
    return { syntax: 'ecmascript', jsx: true }
  }
  return { syntax: 'ecmascript', jsx: false }
}

/**
 * Transform code using SWC with the specified plugins, bundled through Rolldown
 * to match the unit test output format.
 */
export async function transformWithSwc(code: string, options: TransformOptions): Promise<string> {
  const parserConfig = getParserConfig(options.filename, code)

  // Use extension from original filename for virtual entry to ensure correct parsing
  const ext = options.filename.match(/\.[jt]sx?$/)?.[0] ?? '.ts'
  const virtualEntry = `virtual:entry${ext}`

  const build = await rolldown({
    input: virtualEntry,
    plugins: [
      {
        name: 'virtual',
        resolveId(id) {
          if (id === virtualEntry) return id
          // Mark transformed imports as external
          return { id, external: true }
        },
        load(id) {
          if (id === virtualEntry) return code
        },
      },
      swc({
        swc: {
          jsc: {
            parser: parserConfig,
            target: 'esnext' as JscTarget,
            transform: {
              react: {
                // Preserve JSX - don't transform it
                runtime: 'preserve' as const,
              },
            },
            experimental: {
              plugins: options.plugins,
            },
          },
          // Don't add source maps
          sourceMaps: false,
        },
      }),
    ],
  })

  const { output } = await build.generate({ format: 'esm' })
  return normalizeSourceMap(stripRolldownRuntime(output[0].code))
}

function stripRolldownRuntime(code: string): string {
  // Replace rolldown runtime regions with a stable comment
  return code.replace(
    /\/\/#region \\0rolldown\/runtime\.js[\s\S]*?\/\/#endregion\n*/g,
    '// [rolldown runtime elided]\n',
  )
}

function normalizeSourceMap(code: string): string {
  return code.replace(
    /\/\*# sourceMappingURL=data:application\/json;charset=utf-8;base64,[^*]+ \*\//g,
    '/*# sourceMappingURL=[sourcemap] */',
  )
}
