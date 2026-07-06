import { describe, it, expect } from 'vitest'
import { rolldown } from 'rolldown'
import emotionPlugin from '../src/index.ts'
import { globSync } from 'tinyglobby'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { EmotionPluginOptions } from '../src/types.ts'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')
const fixturesLabelsDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures-labels')

// Get all fixture directories (input.tsx or input.js files)
const fixturePaths = globSync(['*/input.tsx', '*/input.js', '**/*/input.tsx', '**/*/input.js'], {
  cwd: fixturesDir,
})

describe('fixtures', () => {
  for (const inputPath of fixturePaths) {
    const fixtureName = dirname(inputPath)
    const fullInputPath = join(fixturesDir, inputPath)
    const input = readFileSync(fullInputPath, 'utf-8')

    const configPath = join(fixturesDir, fixtureName, 'config.json')
    const config: EmotionPluginOptions = existsSync(configPath)
      ? JSON.parse(readFileSync(configPath, 'utf-8'))
      : {}

    it(fixtureName, async () => {
      const ext = fullInputPath.match(/\.[jt]sx?$/)?.[0] ?? '.ts'
      const result = await transform(input, config, `virtual:entry${ext}`)
      await expect(result).toMatchFileSnapshot(join(fixturesDir, fixtureName, 'output.js'))
    })
  }
})

// Labels tests - test label extraction from various AST contexts
const labelPaths = globSync(['*/input.ts', '*/input.tsx'], {
  cwd: fixturesLabelsDir,
})

describe('fixtures-labels', () => {
  for (const inputPath of labelPaths) {
    const fixtureName = dirname(inputPath)
    const fullInputPath = join(fixturesLabelsDir, inputPath)
    const input = readFileSync(fullInputPath, 'utf-8')

    const configPath = join(fixturesLabelsDir, fixtureName, 'config.json')
    const config: EmotionPluginOptions = existsSync(configPath)
      ? JSON.parse(readFileSync(configPath, 'utf-8'))
      : {}

    it(fixtureName, async () => {
      const ext = fullInputPath.match(/\.[jt]sx?$/)?.[0] ?? '.ts'
      const result = await transform(input, config, `virtual:entry${ext}`)
      await expect(result).toMatchFileSnapshot(join(fixturesLabelsDir, fixtureName, 'output.js'))
    })
  }
})

describe('query-suffixed ids', () => {
  it('compiles templates when the module id carries a query (e.g. Vite `file.tsx?query`)', async () => {
    const code = "import { css } from '@emotion/react'\nexport const c = css`color: red;`\n"
    const result = await transform(code, {}, 'virtual:entry.tsx?some-query=1')
    // The tagged template must have been compiled into a css(...) call.
    expect(result).toContain('css(')
    expect(result).not.toContain('css`')
  })
})

async function transform(
  code: string,
  options: EmotionPluginOptions,
  virtualEntry = 'virtual:entry.tsx',
): Promise<string> {
  // Derive the module type from the entry extension so rolldown can parse it
  // even when the id carries a query (rolldown can't infer through a query).
  const ext = virtualEntry.match(/\.[jt]sx?$/)?.[0] ?? '.ts'

  const build = await rolldown({
    input: virtualEntry,
    plugins: [
      {
        name: 'virtual',
        resolveId(id) {
          if (id === virtualEntry) return id
          // Mark all other imports as external
          return { id, external: true }
        },
        load(id) {
          if (id === virtualEntry) {
            // query-suffixed ids are not inferred by rolldown, so set it explicitly
            return virtualEntry.includes('?') ? { code, moduleType: ext.slice(1) } : code
          }
        },
      },
      emotionPlugin({
        sourceMap: true,
        autoLabel: 'always',
        ...options,
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
