import { bench, describe } from 'vitest'
import { execSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const baseDir = resolve(import.meta.dirname, '..')
const distBase = resolve(baseDir, 'dist')
const modulesDir = resolve(baseDir, 'shared-app/src/modules')

if (!existsSync(modulesDir)) {
  execSync('pnpm generate', { cwd: baseDir, stdio: 'inherit' })
}

function cleanDist(name: string) {
  const dir = resolve(distBase, name)
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true })
  }
}

function runBuild(name: string) {
  execSync(`rolldown -c configs/${name}.ts`, {
    cwd: baseDir,
    stdio: 'pipe',
  })
}

describe('Transform Imports Benchmark', () => {
  bench(
    '@rolldown/plugin-transform-imports',
    () => {
      runBuild('custom')
    },
    { teardown: () => cleanDist('custom') },
  )

  bench(
    'babel-plugin-transform-imports',
    () => {
      runBuild('babel')
    },
    { teardown: () => cleanDist('babel') },
  )

  bench(
    '@swc/plugin-transform-imports',
    () => {
      runBuild('swc')
    },
    { teardown: () => cleanDist('swc') },
  )
})
