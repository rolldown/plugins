import { publish } from '@vitejs/release-scripts'
import path from 'node:path'

process.chdir(path.join(import.meta.dirname, '..'))

await publish({
  packageManager: 'pnpm',
})
