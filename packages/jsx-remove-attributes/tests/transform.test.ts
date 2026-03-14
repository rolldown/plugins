import { describe, it, expect } from 'vitest'
import { rolldown } from 'rolldown'
import jsxRemoveAttributesPlugin from '../src/index.ts'
import { globSync } from 'tinyglobby'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { JsxRemoveAttributesOptions } from '../src/types.ts'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')

const fixturePaths = globSync(['*/input.{jsx,tsx,js}', '**/*/input.{jsx,tsx,js}'], {
  cwd: fixturesDir,
})

describe('fixtures', () => {
  for (const inputPath of fixturePaths) {
    const fixtureName = dirname(inputPath)
    const fullInputPath = join(fixturesDir, inputPath)
    const input = readFileSync(fullInputPath, 'utf-8')

    const configPath = join(fixturesDir, fixtureName, 'config.json')
    const config: JsxRemoveAttributesOptions = existsSync(configPath)
      ? JSON.parse(readFileSync(configPath, 'utf-8'))
      : {}
    config.attributes = config.attributes?.map((pattern) => new RegExp(pattern))

    it(fixtureName, async () => {
      const result = await transform(input, config, fullInputPath)
      await expect(result).toMatchFileSnapshot(join(fixturesDir, fixtureName, 'output.js'))
    })
  }
})

async function transform(
  code: string,
  options: JsxRemoveAttributesOptions,
  filename = 'virtual:entry.jsx',
): Promise<string> {
  const ext = filename.match(/\.[jt]sx?$/)?.[0] ?? '.jsx'
  const virtualEntry = `virtual:entry${ext}`

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
      jsxRemoveAttributesPlugin(options),
    ],
  })

  const { output } = await build.generate({ format: 'esm' })
  return stripRolldownRuntime(output[0].code)
}

function stripRolldownRuntime(code: string): string {
  return code.replace(
    /\/\/#region \\0rolldown\/runtime\.js[\s\S]*?\/\/#endregion\n*/g,
    '// [rolldown runtime elided]\n',
  )
}
