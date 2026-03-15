/**
 * Module generator for Jotai benchmark.
 * Generates ~100 modules with varied atom patterns.
 * Uses seeded random (seed=42) for deterministic generation.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import { SeededRandom } from '@rolldown/benchmark-utils/seeded-random'

const rng = new SeededRandom(42)

type ModuleType = 'primitiveAtoms' | 'derivedAtoms' | 'asyncAtoms' | 'atomFamily' | 'complexState'

const MODULE_TYPES: ModuleType[] = [
  'primitiveAtoms',
  'derivedAtoms',
  'asyncAtoms',
  'atomFamily',
  'complexState',
]

const NAMES = [
  'user',
  'cart',
  'theme',
  'settings',
  'notification',
  'search',
  'filter',
  'sort',
  'page',
  'modal',
  'tab',
  'sidebar',
  'menu',
  'form',
  'auth',
]
const PRIMITIVE_VALUES = ['0', "''", 'false', 'null', '[]', '{}']

function generatePrimitiveAtoms(_index: number): string {
  const name = rng.pick(NAMES)
  const atomCount = 2 + rng.nextInt(3)
  const atoms: string[] = []

  for (let i = 0; i < atomCount; i++) {
    const val = rng.pick(PRIMITIVE_VALUES)
    atoms.push(`export const ${name}${i}Atom = atom(${val})`)
  }

  return `import { atom } from 'jotai'\n\n${atoms.join('\n')}\n`
}

function generateDerivedAtoms(_index: number): string {
  const name = rng.pick(NAMES)
  const hasWrite = rng.next() > 0.5

  return `import { atom } from 'jotai'

export const ${name}BaseAtom = atom(0)
export const ${name}CountAtom = atom(${rng.nextInt(100)})

export const ${name}DerivedAtom = atom(
  (get) => get(${name}BaseAtom) + get(${name}CountAtom)
)

export const ${name}DoubleAtom = atom(
  (get) => get(${name}DerivedAtom) * 2
)
${
  hasWrite
    ? `
export const ${name}WritableAtom = atom(
  (get) => get(${name}BaseAtom),
  (_get, set, value: number) => {
    set(${name}BaseAtom, value)
    set(${name}CountAtom, value + 1)
  }
)`
    : ''
}
`
}

function generateAsyncAtoms(_index: number): string {
  const name = rng.pick(NAMES)

  return `import { atom } from 'jotai'

export const ${name}IdAtom = atom(${rng.nextInt(1000)})

export const ${name}DataAtom = atom(async (get) => {
  const id = get(${name}IdAtom)
  return { id, data: 'loaded' }
})

export const ${name}StatusAtom = atom('idle')

export const ${name}RefreshAtom = atom(
  (get) => get(${name}StatusAtom),
  async (_get, set) => {
    set(${name}StatusAtom, 'loading')
    set(${name}StatusAtom, 'done')
  }
)
`
}

function generateAtomFamily(_index: number): string {
  const name = rng.pick(NAMES)

  return `import { atom } from 'jotai'

const ${name}Cache = new Map<string, ReturnType<typeof atom<string>>>()

export function ${name}AtomFamily(id: string) {
  if (!${name}Cache.has(id)) {
    ${name}Cache.set(id, atom(''))
  }
  return ${name}Cache.get(id)!
}

export const ${name}IdsAtom = atom<string[]>([])

export const ${name}AllAtom = atom((get) => {
  const ids = get(${name}IdsAtom)
  return ids.map((id) => get(${name}AtomFamily(id)))
})

export const ${name}CountAtom = atom((get) => get(${name}IdsAtom).length)
`
}

function generateComplexState(_index: number): string {
  const name = rng.pick(NAMES)
  const fieldCount = 2 + rng.nextInt(3)
  const fields = Array.from(
    { length: fieldCount },
    (_, i) => `field${i}: ${rng.pick(["'value'", '0', 'true', 'null'])}`,
  )

  return `import { atom } from 'jotai'

interface ${name}State {
${fields.map((_, i) => `  field${i}: string | number | boolean | null`).join('\n')}
}

export const ${name}Atom = atom<${name}State>({
${fields.map((f) => `  ${f}`).join(',\n')}
})

${fields
  .map(
    (_, i) => `export const ${name}Field${i}Atom = atom(
  (get) => get(${name}Atom).field${i},
  (get, set, value: string | number | boolean | null) => {
    set(${name}Atom, { ...get(${name}Atom), field${i}: value })
  }
)`,
  )
  .join('\n\n')}
`
}

const GENERATORS: Record<ModuleType, (index: number) => string> = {
  primitiveAtoms: generatePrimitiveAtoms,
  derivedAtoms: generateDerivedAtoms,
  asyncAtoms: generateAsyncAtoms,
  atomFamily: generateAtomFamily,
  complexState: generateComplexState,
}

function main() {
  const componentsDir = join(import.meta.dirname, '../shared-app/src/components')

  if (existsSync(componentsDir)) rmSync(componentsDir, { recursive: true })
  mkdirSync(componentsDir, { recursive: true })

  const modules: Array<{ type: ModuleType; index: number }> = []
  const TOTAL = 100
  const perType = Math.floor(TOTAL / MODULE_TYPES.length)
  const remainder = TOTAL % MODULE_TYPES.length

  for (let i = 0; i < MODULE_TYPES.length; i++) {
    const type = MODULE_TYPES[i]
    const count = perType + (i < remainder ? 1 : 0)
    for (let j = 0; j < count; j++) {
      const index = modules.length + 1
      modules.push({ type, index })
      writeFileSync(join(componentsDir, `${type}${index}.ts`), GENERATORS[type](index))
    }
  }

  const exports = modules
    .map(({ type, index }) => `export * from './${type}${index}.js'`)
    .join('\n')
  writeFileSync(join(componentsDir, 'index.ts'), exports + '\n')

  console.log(`Generated ${modules.length} modules in ${componentsDir}`)
  for (const type of MODULE_TYPES) {
    console.log(`  ${type}: ${modules.filter((m) => m.type === type).length}`)
  }
}

main()
