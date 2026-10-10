/**
 * App generator for the babel `parallel` benchmark.
 * Generates ~100 JS files with classes that use decorators.
 * Uses seeded random (seed=42) for deterministic generation.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { SeededRandom } from '@rolldown/benchmark-utils/seeded-random'

const rng = new SeededRandom(42)

const DECORATORS = `export function logged(value, context) {
  if (context.kind !== 'method') return
  return function (...args) {
    return value.apply(this, args)
  }
}

export function tracked(value, context) {
  if (context.kind !== 'accessor') return
  return {
    get() {
      return value.get.call(this)
    },
    set(next) {
      value.set.call(this, next)
    },
  }
}

export function registered(value, context) {
  context.addInitializer(function () {
    this.registeredName = context.name
  })
  return value
}
`

const FIELD_NAMES = ['count', 'label', 'items', 'status', 'owner', 'total', 'offset', 'limit']
const METHOD_NAMES = ['load', 'save', 'reset', 'render', 'update', 'remove', 'select', 'toggle']

function generateClass(name: string): string {
  const fields = rng.pickN(FIELD_NAMES, rng.nextInt(4) + 3)
  const methods = rng.pickN(METHOD_NAMES, rng.nextInt(4) + 3)

  const lines = [`@registered\nclass ${name} {`]
  for (const field of fields) {
    lines.push(`  @tracked accessor ${field} = ${rng.nextInt(100)}`)
  }
  for (const method of methods) {
    const field = rng.pick(fields)
    lines.push(
      `  @logged\n  ${method}(input) {`,
      `    if (input === undefined) return this.${field}`,
      `    this.${field} = input + ${rng.nextInt(100)}`,
      `    return this.${field}`,
      `  }`,
    )
  }
  lines.push(`}`)
  return lines.join('\n')
}

function generateModule(index: number, classesPerModule: number): string {
  const names: string[] = []
  const classes: string[] = []
  for (let i = 0; i < classesPerModule; i++) {
    const name = `Model${index}_${i}`
    names.push(name)
    classes.push(generateClass(name))
  }
  return [
    `import { logged, tracked, registered } from '../decorators.js'`,
    ...classes,
    `export { ${names.join(', ')} }`,
    '',
  ].join('\n\n')
}

function readNumberArg(name: string, fallback: number): number {
  const prefix = `--${name}=`
  const arg = process.argv.find((a) => a.startsWith(prefix))
  return arg ? Number.parseInt(arg.slice(prefix.length), 10) : fallback
}

function main() {
  const appDir = join(import.meta.dirname, '../shared-app/src')
  if (existsSync(appDir)) rmSync(appDir, { recursive: true })
  mkdirSync(join(appDir, 'modules'), { recursive: true })

  const TOTAL = readNumberArg('total', 100)
  const CLASSES_PER_MODULE = readNumberArg('classes', 10)
  const silent = process.argv.includes('--silent')

  writeFileSync(join(appDir, 'decorators.js'), DECORATORS)

  const imports: string[] = []
  for (let i = 0; i < TOTAL; i++) {
    const filename = `module${i + 1}.js`
    writeFileSync(join(appDir, 'modules', filename), generateModule(i + 1, CLASSES_PER_MODULE))
    imports.push(
      `import * as module${i + 1} from './modules/${filename}'\nconsole.log(module${i + 1})`,
    )
  }
  writeFileSync(join(appDir, 'index.js'), imports.join('\n') + '\n')

  if (!silent) {
    console.log(`Generated ${TOTAL} modules in ${appDir}/modules/`)
    console.log(`  Classes per module: ${CLASSES_PER_MODULE}`)
  }
}

main()
