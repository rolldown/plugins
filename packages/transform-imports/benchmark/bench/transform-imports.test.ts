import { describe, test } from 'vitest'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { runBuild } from '@rolldown/benchmark-utils/run-build'

const baseDir = resolve(import.meta.dirname, '..')
const modulesDir = resolve(baseDir, 'shared-app/src/modules')

if (!existsSync(modulesDir)) {
  execSync('pnpm generate', { cwd: baseDir, stdio: 'inherit' })
}

describe('Transform Imports build', () => {
  test.for(['custom', 'babel', 'swc'] as const)(
    'build:%s exits with code 0',
    (name) => {
      runBuild(name, baseDir)
    },
  )
})
