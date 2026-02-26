import { generateChangelog, release } from '@vitejs/release-scripts'
import colors from 'picocolors'
import { logRecentCommits } from './releaseUtils.ts'
import path from 'node:path'

function getPkgDir(pkgName: string) {
  return `packages/${pkgName.replace('plugin-', '')}`
}

process.chdir(path.join(import.meta.dirname, '..'))

await release({
  repo: 'rolldown/plugins',
  packages: ['plugin-babel'],
  toTag: (pkg, version) => `${pkg}@${version}`,
  logChangelog: (pkg) => logRecentCommits(pkg, getPkgDir(pkg)),
  getPkgDir,
  generateChangelog: async (pkgName) => {
    console.log(colors.cyan('\nGenerating changelog...'))
    await generateChangelog({
      getPkgDir: () => getPkgDir(pkgName),
      tagPrefix: `${pkgName}@`,
    })
  },
})
