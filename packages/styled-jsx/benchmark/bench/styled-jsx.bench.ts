import { bench, describe } from 'vitest'
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
  bench(
    '@rolldown/plugin-styled-jsx',
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
