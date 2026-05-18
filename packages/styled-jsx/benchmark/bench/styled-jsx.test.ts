import { describe, test } from 'vitest'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { runBuild } from '@rolldown/benchmark-utils/run-build'

const baseDir = resolve(import.meta.dirname, '..')

execSync('pnpm generate -- --total=10', { cwd: baseDir, stdio: 'inherit' })

describe('Styled JSX build', () => {
  test.for(['custom', 'babel', 'swc'] as const)(
    'build:%s exits with code 0',
    (name) => {
      runBuild(name, baseDir)
    },
  )
})
