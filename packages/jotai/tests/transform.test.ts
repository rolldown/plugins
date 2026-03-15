import { describe, it, expect } from 'vitest'
import { rolldown } from 'rolldown'
import { jotaiPlugin } from '../src/index.ts'
import { globSync } from 'tinyglobby'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { JotaiPluginOptions } from '../src/types.ts'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')

const fixturePaths = globSync(['*/input.js', '**/*/input.js'], {
  cwd: fixturesDir,
})

describe('fixtures', () => {
  for (const inputPath of fixturePaths) {
    const fixtureName = dirname(inputPath)
    const fullInputPath = join(fixturesDir, inputPath)
    const input = readFileSync(fullInputPath, 'utf-8')

    const configPath = join(fixturesDir, fixtureName, 'config.json')
    let config: JotaiPluginOptions & { filename?: string } = existsSync(configPath)
      ? JSON.parse(readFileSync(configPath, 'utf-8'))
      : {}

    // Determine which transform(s) to enable based on fixture path
    if (fixtureName.startsWith('debug-label/')) {
      config = { debugLabel: true, reactRefresh: false, ...config }
    } else if (fixtureName.startsWith('react-refresh/')) {
      config = { debugLabel: false, reactRefresh: true, ...config }
    }

    // Support custom filename from config
    const filename = config.filename ?? 'atoms.ts'
    // Remove non-plugin config keys
    const pluginOptions: JotaiPluginOptions = {
      atomNames: config.atomNames,
      debugLabel: config.debugLabel,
      reactRefresh: config.reactRefresh,
    }

    it(fixtureName, async () => {
      const result = await transform(input, pluginOptions, filename)
      await expect(result).toMatchFileSnapshot(join(fixturesDir, fixtureName, 'output.js'))
    })
  }
})

async function transform(
  code: string,
  options: JotaiPluginOptions,
  filename = 'atoms.ts',
): Promise<string> {
  const ext = filename.match(/\.[jt]sx?$/)?.[0] ?? '.js'
  const virtualEntry = `virtual:entry${ext}`

  const build = await rolldown({
    input: virtualEntry,
    plugins: [
      {
        name: 'virtual',
        resolveId(id) {
          if (id === virtualEntry) return filename
          return { id, external: true }
        },
        load(id) {
          if (id === filename) return code
        },
      },
      jotaiPlugin(options),
    ],
  })

  const { output } = await build.generate({ format: 'esm' })
  return stripRolldownRuntime(output[0].code).replaceAll(fixturesDir, '<FIXTURE_DIR>')
}

function stripRolldownRuntime(code: string): string {
  return code.replace(
    /\/\/#region \\0rolldown\/runtime\.js[\s\S]*?\/\/#endregion\n*/g,
    '// [rolldown runtime elided]\n',
  )
}
