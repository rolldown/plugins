import { bench, describe } from 'vitest'
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
  bench(
    '@rolldown/plugin-transform-imports',
    () => {
      runBuild('custom', baseDir)
    },
    { teardown: () => cleanDist('custom') },
  )

  bench(
    'babel-plugin-transform-imports',
    () => {
      runBuild('babel', baseDir)
    },
    { teardown: () => cleanDist('babel') },
  )

  bench(
    '@swc/plugin-transform-imports',
    () => {
      runBuild('swc', baseDir)
    },
    { teardown: () => cleanDist('swc') },
  )
})
