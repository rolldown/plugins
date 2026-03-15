/**
 * Component generator for react-remove-properties benchmark.
 * Generates ~100 React components with varied data-test attributes.
 * Uses seeded random (seed=42) for deterministic generation.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import { SeededRandom } from '@rolldown/benchmark-utils/seeded-random'

const rng = new SeededRandom(42)

type ComponentType =
  | 'FormComponent'
  | 'ListComponent'
  | 'CardComponent'
  | 'NavigationComponent'
  | 'ModalComponent'

const COMPONENT_TYPES: ComponentType[] = [
  'FormComponent',
  'ListComponent',
  'CardComponent',
  'NavigationComponent',
  'ModalComponent',
]

const ELEMENTS = ['div', 'span', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside']
const TEST_ATTRS = ['data-testid', 'data-test-id', 'data-test']
const LABELS = [
  'submit',
  'cancel',
  'title',
  'header',
  'footer',
  'sidebar',
  'content',
  'wrapper',
  'container',
  'item',
  'list',
  'card',
  'button',
  'input',
  'form',
  'modal',
  'nav',
  'link',
  'menu',
  'tab',
]

function randomTestAttr(): string {
  const attr = rng.pick(TEST_ATTRS)
  const label = rng.pick(LABELS)
  const suffix = rng.nextInt(100)
  return `${attr}="${label}-${suffix}"`
}

function randomElement(): string {
  return rng.pick(ELEMENTS)
}

function generateFormComponent(index: number): string {
  const el1 = randomElement()
  const el2 = randomElement()
  const el3 = randomElement()
  return `import React from 'react'

export function FormComponent${index}() {
  return (
    <${el1} ${randomTestAttr()} data-custom="form-${index}">
      <label ${randomTestAttr()}>Name</label>
      <input ${randomTestAttr()} type="text" />
      <${el2} ${randomTestAttr()}>
        <label ${randomTestAttr()}>Email</label>
        <input ${randomTestAttr()} type="email" />
      </${el2}>
      <${el3} ${randomTestAttr()}>
        <button ${randomTestAttr()} type="submit">Submit</button>
        <button ${randomTestAttr()} type="button">Cancel</button>
      </${el3}>
    </${el1}>
  )
}
`
}

function generateListComponent(index: number): string {
  const el = randomElement()
  const items = Array.from({ length: 3 + rng.nextInt(4) }, (_, i) => {
    return `        <li ${randomTestAttr()} key={${i}}>${rng.pick(LABELS)} item</li>`
  }).join('\n')

  return `import React from 'react'

export function ListComponent${index}() {
  return (
    <${el} ${randomTestAttr()} data-custom="list-${index}">
      <h2 ${randomTestAttr()}>List Title</h2>
      <ul ${randomTestAttr()}>
${items}
      </ul>
    </${el}>
  )
}
`
}

function generateCardComponent(index: number): string {
  const el1 = randomElement()
  const el2 = randomElement()
  return `import React from 'react'

export function CardComponent${index}() {
  return (
    <${el1} ${randomTestAttr()} data-custom="card-${index}">
      <${el2} ${randomTestAttr()}>
        <h3 ${randomTestAttr()}>Card Title ${index}</h3>
        <p ${randomTestAttr()}>Card description for component ${index}.</p>
      </${el2}>
      <div ${randomTestAttr()}>
        <button ${randomTestAttr()}>Action</button>
      </div>
    </${el1}>
  )
}
`
}

function generateNavigationComponent(index: number): string {
  const links = Array.from({ length: 3 + rng.nextInt(3) }, () => {
    const label = rng.pick(LABELS)
    return `        <a ${randomTestAttr()} href="#">${label}</a>`
  }).join('\n')

  return `import React from 'react'

export function NavigationComponent${index}() {
  return (
    <nav ${randomTestAttr()} data-custom="nav-${index}">
      <div ${randomTestAttr()}>
${links}
      </div>
    </nav>
  )
}
`
}

function generateModalComponent(index: number): string {
  const el = randomElement()
  return `import React from 'react'

export function ModalComponent${index}() {
  return (
    <div ${randomTestAttr()} data-custom="modal-${index}">
      <${el} ${randomTestAttr()}>
        <h2 ${randomTestAttr()}>Modal Title</h2>
        <p ${randomTestAttr()}>Modal content for component ${index}.</p>
        <div ${randomTestAttr()}>
          <button ${randomTestAttr()}>Confirm</button>
          <button ${randomTestAttr()}>Cancel</button>
        </div>
      </${el}>
    </div>
  )
}
`
}

const GENERATORS: Record<ComponentType, (index: number) => string> = {
  FormComponent: generateFormComponent,
  ListComponent: generateListComponent,
  CardComponent: generateCardComponent,
  NavigationComponent: generateNavigationComponent,
  ModalComponent: generateModalComponent,
}

function main() {
  const componentsDir = join(import.meta.dirname, '../shared-app/src/components')
  if (existsSync(componentsDir)) rmSync(componentsDir, { recursive: true })
  mkdirSync(componentsDir, { recursive: true })

  const components: Array<{ type: ComponentType; index: number }> = []
  const TOTAL = 100
  const perType = Math.floor(TOTAL / COMPONENT_TYPES.length)
  const remainder = TOTAL % COMPONENT_TYPES.length

  for (let i = 0; i < COMPONENT_TYPES.length; i++) {
    const type = COMPONENT_TYPES[i]
    const count = perType + (i < remainder ? 1 : 0)
    for (let j = 0; j < count; j++) {
      const index = components.length + 1
      components.push({ type, index })
      writeFileSync(join(componentsDir, `${type}${index}.tsx`), GENERATORS[type](index))
    }
  }

  const exports = components
    .map(({ type, index }) => `export { ${type}${index} } from './${type}${index}.js'`)
    .join('\n')
  writeFileSync(join(componentsDir, 'index.ts'), exports + '\n')

  console.log(`Generated ${components.length} components in ${componentsDir}`)
  for (const type of COMPONENT_TYPES) {
    console.log(`  ${type}: ${components.filter((c) => c.type === type).length}`)
  }
}

main()
