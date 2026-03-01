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
      const result = await transform(input, config, fullInputPath)
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
      const result = await transform(input, config, fullInputPath)
      await expect(result).toMatchFileSnapshot(join(fixturesLabelsDir, fixtureName, 'output.js'))
    })
  }
})

async function transform(
  code: string,
  options: EmotionPluginOptions,
  filename = 'virtual:entry.tsx',
): Promise<string> {
  // Use extension from original filename for virtual entry to ensure correct parsing
  const ext = filename.match(/\.[jt]sx?$/)?.[0] ?? '.ts'
  const virtualEntry = `virtual:entry${ext}`

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
          if (id === virtualEntry) return code
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
