import { describe, it, expect } from 'vitest'
import { rolldown } from 'rolldown'
import prefreshPlugin from '../src/index.ts'
import { globSync } from 'tinyglobby'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PrefreshPluginOptions } from '../src/types.ts'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')

// Get all fixture directories (input.js files)
const fixturePaths = globSync(['*/input.js', '**/*/input.js'], {
  cwd: fixturesDir,
})

describe('fixtures', () => {
  for (const inputPath of fixturePaths) {
    const fixtureName = dirname(inputPath)
    const fullInputPath = join(fixturesDir, inputPath)
    const input = readFileSync(fullInputPath, 'utf-8')

    // Check for config.json
    const configPath = join(fixturesDir, fixtureName, 'config.json')
    const config: PrefreshPluginOptions = existsSync(configPath)
      ? JSON.parse(readFileSync(configPath, 'utf-8'))
      : {}

    it(fixtureName, async () => {
      const result = await transform(input, config, fullInputPath)
      await expect(result).toMatchFileSnapshot(join(fixturesDir, fixtureName, 'output.js'))
    })
  }
})

async function transform(
  code: string,
  options: PrefreshPluginOptions,
  filename = 'virtual:entry.js',
): Promise<string> {
  const ext = filename.match(/\.[jt]sx?$/)?.[0] ?? '.js'
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
      prefreshPlugin({ ...options, enabled: true }),
    ],
  })

  const { output } = await build.generate({ format: 'esm' })
  return stripRolldownRuntime(output[0].code)
}

function stripRolldownRuntime(code: string): string {
  // Replace rolldown runtime regions with a stable comment
  return code.replace(
    /\/\/#region \\0rolldown\/runtime\.js[\s\S]*?\/\/#endregion\n*/g,
    '// [rolldown runtime elided]\n',
  )
}
