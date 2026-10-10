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

describe('Babel Parallel Benchmark', () => {
  // Each build takes seconds, so the default of 64 samples is too slow.
  test('comparison', { timeout: 300_000 }, async ({ bench }) => {
    await bench.compare(
      bench('parallel: false', { afterAll: () => cleanDist('serial') }, () => {
        runBuild('serial', baseDir)
      }),
      bench('parallel: true', { afterAll: () => cleanDist('parallel') }, () => {
        runBuild('parallel', baseDir)
      }),
      { iterations: 10, warmupIterations: 1 },
    )
  })
})
