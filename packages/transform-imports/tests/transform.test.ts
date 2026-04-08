import { describe, it, expect } from 'vitest'
import { rolldown } from 'rolldown'
import { transformImportsPlugin, type PluginConfig } from '../src/index.ts'
import { globSync } from 'tinyglobby'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

describe('transform-imports', () => {
  it('throws on namespace import when preventFullImport is true', async () => {
    const input = `import * as Bootstrap from 'react-bootstrap'\nconsole.log(Bootstrap)`
    const config = {
      'react-bootstrap': {
        transform: 'react-bootstrap/lib/{{member}}',
        preventFullImport: true,
      },
    }

    await expect(transform(input, config)).rejects.toThrow('preventFullImport')
  })

  it('throws on side-effect import when preventFullImport is true', async () => {
    const input = `import 'react-bootstrap'`
    const config = {
      'react-bootstrap': {
        transform: 'react-bootstrap/lib/{{member}}',
        preventFullImport: true,
      },
    }

    await expect(transform(input, config)).rejects.toThrow('preventFullImport')
  })
})

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')
const fixturePaths = globSync('*/input.js', { cwd: fixturesDir })

describe('fixtures', () => {
  for (const inputPath of fixturePaths) {
    const fixtureName = dirname(inputPath)
    const input = readFileSync(join(fixturesDir, inputPath), 'utf-8')
    const configPath = join(fixturesDir, fixtureName, 'config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))

    it(fixtureName, async () => {
      const result = await transform(input, config)
      await expect(result).toMatchFileSnapshot(join(fixturesDir, fixtureName, 'output.js'))
    })
  }
})

async function transform(code: string, modules: PluginConfig): Promise<string> {
  const build = await rolldown({
    input: 'virtual:entry.ts',
    plugins: [
      {
        name: 'virtual',
        resolveId(id) {
          if (id === 'virtual:entry.ts') return id
          // Mark transformed imports as external
          return { id, external: true }
        },
        load(id) {
          if (id === 'virtual:entry.ts') return code
        },
      },
      transformImportsPlugin({ modules }),
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
