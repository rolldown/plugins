import colors from 'picocolors'
import type { Options as ExecaOptions, ResultPromise } from 'execa'
import { execa } from 'execa'
import fs from 'node:fs/promises'

function run<EO extends ExecaOptions>(
  bin: string,
  args: string[],
  opts?: EO,
): ResultPromise<EO & (keyof EO extends 'stdio' ? {} : { stdio: 'inherit' })> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return execa(bin, args, { stdio: 'inherit', ...opts }) as any
}

async function getLatestTag(pkgName: string, pkgDir: string): Promise<string> {
  const pkgJson = await fs.readFile(`${pkgDir}/package.json`, 'utf-8')
  const { version } = JSON.parse(pkgJson)
  return `${pkgName}@${version}`
}

export async function logRecentCommits(pkgName: string, pkgDir: string): Promise<void> {
  const tag = await getLatestTag(pkgName, pkgDir)
  if (!tag) return
  const sha = await run('git', ['rev-list', '-n', '1', tag], {
    stdio: 'pipe',
  }).then((res) => res.stdout.trim())
  console.log(
    colors.bold(
      `\n${colors.blue(`i`)} Commits of ${colors.green(
        pkgName,
      )} since ${colors.green(tag)} ${colors.gray(`(${sha.slice(0, 5)})`)}`,
    ),
  )
  await run('git', ['--no-pager', 'log', `${sha}..HEAD`, '--oneline', '--', pkgDir], {
    stdio: 'inherit',
  })
  console.log()
}

export function getPkgDir(pkgName: string) {
  return `packages/${pkgName.replace('plugin-', '')}`
}
