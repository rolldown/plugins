import { bench, describe } from 'vitest'
import { execSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { runBuild } from '@rolldown/benchmark-utils/run-build'

const baseDir = resolve(import.meta.dirname, '..')
const distBase = resolve(baseDir, 'dist')
const componentsDir = resolve(baseDir, 'shared-app/src/components')

if (!existsSync(componentsDir)) {
  execSync('pnpm generate', { cwd: baseDir, stdio: 'inherit' })
}

function cleanDist(name: string) {
  const dir = resolve(distBase, name)
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true })
  }
}

describe('Emotion Benchmark', () => {
  bench(
    '@rolldown/plugin-emotion',
    () => {
      runBuild('custom', baseDir)
    },
    { teardown: () => cleanDist('custom') },
  )

  bench(
    '@rolldown/plugin-babel',
    () => {
      runBuild('babel', baseDir)
    },
    { teardown: () => cleanDist('babel') },
  )

  bench(
    '@rollup/plugin-swc',
    () => {
      runBuild('swc', baseDir)
    },
    { teardown: () => cleanDist('swc') },
  )
})
