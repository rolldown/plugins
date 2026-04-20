/**
 * App generator for transform-imports benchmark.
 * Generates ~100 JS files with varied import patterns.
 * Uses seeded random (seed=42) for deterministic generation.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { SeededRandom } from '@rolldown/benchmark-utils/seeded-random'

const rng = new SeededRandom(42)

// Mock libraries whose imports will be transformed
const LIBRARIES = ['ui-components', 'utils-lib', 'icons-pack', 'data-helpers', 'form-controls']

// Members that can be imported from each library
const MEMBERS: Record<string, string[]> = {
  'ui-components': [
    'Button',
    'Card',
    'Modal',
    'Tooltip',
    'Dropdown',
    'Avatar',
    'Badge',
    'Breadcrumb',
    'Carousel',
    'Collapse',
    'DatePicker',
    'Divider',
    'Drawer',
    'Input',
    'Menu',
    'Pagination',
    'Popover',
    'Progress',
    'Radio',
    'Select',
    'Slider',
    'Switch',
    'Table',
    'Tabs',
    'Tag',
    'TimePicker',
    'Transfer',
    'TreeSelect',
    'Upload',
  ],
  'utils-lib': [
    'debounce',
    'throttle',
    'cloneDeep',
    'isEmpty',
    'isEqual',
    'merge',
    'groupBy',
    'sortBy',
    'uniqBy',
    'flattenDeep',
    'mapValues',
    'pickBy',
    'omitBy',
    'capitalize',
    'camelCase',
    'kebabCase',
  ],
  'icons-pack': [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Check',
    'Close',
    'Edit',
    'Delete',
    'Search',
    'Filter',
    'Settings',
    'Home',
    'User',
    'Bell',
    'Star',
    'Heart',
    'Mail',
    'Lock',
    'Unlock',
    'Calendar',
  ],
  'data-helpers': [
    'fetchData',
    'postData',
    'putData',
    'deleteData',
    'parseResponse',
    'formatError',
    'buildQuery',
    'encodeParams',
    'decodeParams',
    'validateSchema',
    'transformPayload',
    'serializeForm',
  ],
  'form-controls': [
    'TextField',
    'NumberField',
    'CheckboxField',
    'RadioField',
    'SelectField',
    'DateField',
    'FileField',
    'TextAreaField',
    'PasswordField',
    'SearchField',
    'ColorField',
    'RangeField',
  ],
}

type PatternType = 'named' | 'mixed' | 'reexport' | 'dynamic' | 'sideEffect'
const PATTERN_TYPES: PatternType[] = [
  'named',
  'named',
  'named',
  'mixed',
  'reexport',
  'dynamic',
  'sideEffect',
]

function generateNamedImports(lib: string, members: string[]): string {
  const count = rng.nextInt(4) + 1
  const picked = rng.pickN(members, Math.min(count, members.length))
  const usage = picked.map((m) => `console.log(${m})`).join('\n')
  return `import { ${picked.join(', ')} } from '${lib}'\n${usage}\n`
}

function generateMixedImports(lib: string, members: string[]): string {
  const picked = rng.pickN(members, Math.min(2, members.length))
  const usage = picked.map((m) => `console.log(${m})`).join('\n')
  return `import Lib, { ${picked.join(', ')} } from '${lib}'\nconsole.log(Lib)\n${usage}\n`
}

function generateReexport(lib: string, members: string[]): string {
  const picked = rng.pickN(members, Math.min(3, members.length))
  return `export { ${picked.join(', ')} } from '${lib}'\n`
}

function generateDynamicImport(lib: string): string {
  return `const mod = await import('${lib}')\nconsole.log(mod)\n`
}

function generateSideEffectImport(lib: string): string {
  return `import '${lib}'\n`
}

const GENERATORS: Record<PatternType, (lib: string, members: string[]) => string> = {
  named: generateNamedImports,
  mixed: generateMixedImports,
  reexport: generateReexport,
  dynamic: generateDynamicImport,
  sideEffect: generateSideEffectImport,
}

function main() {
  const appDir = join(import.meta.dirname, '../shared-app/src')
  if (existsSync(appDir)) rmSync(appDir, { recursive: true })
  mkdirSync(join(appDir, 'modules'), { recursive: true })

  const TOTAL = 100
  const files: string[] = []

  for (let i = 0; i < TOTAL; i++) {
    const lib = rng.pick(LIBRARIES)
    const members = MEMBERS[lib]
    const patternType = rng.pick(PATTERN_TYPES)
    const content = GENERATORS[patternType](lib, members)
    const filename = `module${i + 1}.js`
    writeFileSync(join(appDir, 'modules', filename), content)
    files.push(filename)
  }

  // Generate entry file that imports all modules
  const entry = files
    .map((f, i) => `import './modules/${f}'\nconsole.log('module ${i + 1}')`)
    .join('\n')
  writeFileSync(join(appDir, 'index.js'), entry + '\n')

  console.log(`Generated ${TOTAL} modules in ${appDir}/modules/`)
  for (const type of PATTERN_TYPES) {
    console.log(`  Pattern distribution includes: ${type}`)
  }
}

main()
