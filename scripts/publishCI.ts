import { publish } from '@vitejs/release-scripts'
import path from 'node:path'
import { getPkgDir } from './releaseUtils.ts'

process.chdir(path.join(import.meta.dirname, '..'))

await publish({
  packageManager: 'pnpm',
  getPkgDir,
})
