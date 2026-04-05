import { describe, it, expect } from 'vitest'
import { rolldown } from 'rolldown'
import styledJsxPlugin from '../src/index.ts'
import type { StyledJsxPluginOptions } from '../src/types.ts'
import { globSync } from 'tinyglobby'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')

const fixturePaths = globSync(['*/input.jsx', '**/*/input.jsx'], {
  cwd: fixturesDir,
})

// No public vitest API to detect --update mode yet.
// Using internal property as workaround: https://github.com/vitest-dev/vitest/issues/6979
function isSnapshotUpdate(): boolean {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const state = expect.getState() as unknown as { snapshotState?: { _updateSnapshot?: string } }
  return state.snapshotState?._updateSnapshot === 'all'
}

describe('fixtures', () => {
  for (const inputPath of fixturePaths) {
    const fixtureName = dirname(inputPath)
    const fullInputPath = join(fixturesDir, inputPath)
    const input = readFileSync(fullInputPath, 'utf-8')
    const outputFile = join(fixturesDir, fixtureName, 'output.jsx')
    const errorFile = join(fixturesDir, fixtureName, 'error.txt')

    const configPath = join(fixturesDir, fixtureName, 'config.json')
    const config: StyledJsxPluginOptions = existsSync(configPath)
      ? JSON.parse(readFileSync(configPath, 'utf-8'))
      : {}

    it(fixtureName, async () => {
      const [result, err] = await transform(input, config)
        .then((v) => [v, null] as const)
        .catch((e: unknown) => [null, e] as const)

      if (err) {
        const message = extractErrorMessage(err)
        await expect(message).toMatchFileSnapshot(errorFile)
        if (isSnapshotUpdate() && existsSync(outputFile)) unlinkSync(outputFile)
        expect(
          existsSync(outputFile),
          `unexpected output.jsx for error fixture "${fixtureName}"`,
        ).toBe(false)
      } else {
        await expect(result).toMatchFileSnapshot(outputFile)
        if (isSnapshotUpdate() && existsSync(errorFile)) unlinkSync(errorFile)
        expect(
          existsSync(errorFile),
          `unexpected error.txt for passing fixture "${fixtureName}"`,
        ).toBe(false)
      }
    })
  }
})

async function transform(code: string, config: StyledJsxPluginOptions = {}): Promise<string> {
  const virtualEntry = 'virtual:entry.jsx'

  const build = await rolldown({
    input: virtualEntry,
    plugins: [
      {
        name: 'virtual',
        resolveId(id) {
          if (id === virtualEntry) return id
          return { id, external: true }
        },
        load(id) {
          if (id === virtualEntry) return code
        },
      },
      styledJsxPlugin(config),
    ],
  })

  const { output } = await build.generate({ format: 'esm' })
  let result = stripRolldownRuntime(output[0].code)
  if (config.sourceMap) {
    result = normalizeSourceMap(result)
  }
  return result
}

function stripRolldownRuntime(code: string): string {
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

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors)) {
    return err.errors.map((e: { message?: string }) => e.message ?? '').join('\n')
  }
  if (err instanceof Error) return err.message
  return String(err)
}
