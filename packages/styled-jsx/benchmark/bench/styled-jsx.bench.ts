import { describe, test } from 'vitest'
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { runBuild } from '@rolldown/benchmark-utils/run-build'

const baseDir = resolve(import.meta.dirname, '..')
const distBase = resolve(baseDir, 'dist')
const componentsDir = resolve(baseDir, 'shared-app/src/components')
const expectedComponents = 100

const currentComponents = existsSync(componentsDir)
  ? readdirSync(componentsDir).filter((f) => f.endsWith('.tsx')).length
  : 0
if (currentComponents !== expectedComponents) {
  execSync('pnpm generate', { cwd: baseDir, stdio: 'inherit' })
}

function cleanDist(name: string) {
  const dir = resolve(distBase, name)
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true })
  }
}

describe('Styled JSX Benchmark', () => {
  test('comparison', async ({ bench }) => {
    await bench.compare(
      bench('@rolldown/plugin-styled-jsx', { afterAll: () => cleanDist('custom') }, () => {
        runBuild('custom', baseDir)
      }),
      bench('@rolldown/plugin-babel', { afterAll: () => cleanDist('babel') }, () => {
        runBuild('babel', baseDir)
      }),
      bench('@rollup/plugin-swc', { afterAll: () => cleanDist('swc') }, () => {
        runBuild('swc', baseDir)
      }),
    )
  })
})
