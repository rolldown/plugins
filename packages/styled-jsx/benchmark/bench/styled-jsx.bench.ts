import { bench, describe } from 'vitest'
import { execSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

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

function runBuild(name: string) {
  execSync(`rolldown -c configs/${name}.ts`, {
    cwd: baseDir,
    stdio: 'pipe',
  })
}

describe('Styled JSX Benchmark', () => {
  bench(
    '@rolldown/plugin-styled-jsx',
    () => {
      runBuild('custom')
    },
    { teardown: () => cleanDist('custom') },
  )

  bench(
    '@rolldown/plugin-babel',
    () => {
      runBuild('babel')
    },
    { teardown: () => cleanDist('babel') },
  )

  bench(
    '@rollup/plugin-swc',
    () => {
      runBuild('swc')
    },
    { teardown: () => cleanDist('swc') },
  )
})
