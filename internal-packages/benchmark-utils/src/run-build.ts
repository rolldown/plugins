import { execSync } from 'node:child_process'
import { Buffer } from 'node:buffer'
import { delimiter, resolve } from 'node:path'

function asString(value: unknown): string {
  if (typeof value === 'string') return value
  if (Buffer.isBuffer(value)) return value.toString('utf8')
  return ''
}

export function runBuild(configName: string, baseDir: string): void {
  const localBin = resolve(baseDir, 'node_modules/.bin')
  const env = {
    ...process.env,
    PATH: `${localBin}${delimiter}${process.env.PATH ?? ''}`,
  }
  try {
    execSync(`rolldown -c configs/${configName}.ts`, {
      cwd: baseDir,
      stdio: 'pipe',
      env,
    })
  } catch (err) {
    const isObject = typeof err === 'object' && err !== null
    const status = isObject && 'status' in err && typeof err.status === 'number' ? err.status : null
    const stdout = asString(isObject && 'stdout' in err ? err.stdout : undefined)
    const stderr = asString(isObject && 'stderr' in err ? err.stderr : undefined)
    throw new Error(
      `build:${configName} failed (exit ${status ?? 'unknown'}):\n${stdout}${stderr}`,
      { cause: err },
    )
  }
}
