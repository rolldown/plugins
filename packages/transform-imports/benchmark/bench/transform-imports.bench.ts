import { describe, test } from 'vitest'
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { runBuild } from '@rolldown/benchmark-utils/run-build'

const baseDir = resolve(import.meta.dirname, '..')
const distBase = resolve(baseDir, 'dist')
const modulesDir = resolve(baseDir, 'shared-app/src/modules')
const expectedModules = 100

const currentModules = existsSync(modulesDir)
  ? readdirSync(modulesDir).filter((f) => f.endsWith('.js')).length
  : 0
if (currentModules !== expectedModules) {
  execSync('pnpm generate', { cwd: baseDir, stdio: 'inherit' })
}

function cleanDist(name: string) {
  const dir = resolve(distBase, name)
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true })
  }
}

describe('Transform Imports Benchmark', () => {
  test('comparison', async ({ bench }) => {
    await bench.compare(
      bench('@rolldown/plugin-transform-imports', { afterAll: () => cleanDist('custom') }, () => {
        runBuild('custom', baseDir)
      }),
      bench('babel-plugin-transform-imports', { afterAll: () => cleanDist('babel') }, () => {
        runBuild('babel', baseDir)
      }),
      bench('@swc/plugin-transform-imports', { afterAll: () => cleanDist('swc') }, () => {
        runBuild('swc', baseDir)
      }),
    )
  })
})
