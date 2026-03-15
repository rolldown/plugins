/**
 * Component generator for Relay benchmark.
 * Generates ~100 React components with graphql tagged templates.
 * Uses seeded random (seed=42) for deterministic generation.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import { SeededRandom } from '@rolldown/benchmark-utils/seeded-random'

const rng = new SeededRandom(42)

type ComponentType =
  | 'FragmentComponent'
  | 'QueryComponent'
  | 'MutationComponent'
  | 'SubscriptionComponent'
  | 'MultiOperationComponent'

const COMPONENT_TYPES: ComponentType[] = [
  'FragmentComponent',
  'QueryComponent',
  'MutationComponent',
  'SubscriptionComponent',
  'MultiOperationComponent',
]

const ENTITY_NAMES = [
  'User',
  'Post',
  'Comment',
  'Profile',
  'Settings',
  'Team',
  'Project',
  'Task',
  'Message',
  'Notification',
  'Feed',
  'Album',
  'Photo',
  'Video',
  'Event',
  'Group',
  'Page',
  'Story',
  'Article',
  'Review',
]

const FIELD_NAMES = [
  'id',
  'name',
  'title',
  'body',
  'createdAt',
  'updatedAt',
  'status',
  'email',
  'avatar',
  'description',
]

function randomFields(): string {
  const count = 2 + rng.nextInt(4)
  const fields: string[] = ['id']
  for (let i = 0; i < count; i++) {
    fields.push(rng.pick(FIELD_NAMES))
  }
  return [...new Set(fields)].map((f) => `      ${f}`).join('\n')
}

function generateFragmentComponent(index: number): string {
  const entity = rng.pick(ENTITY_NAMES)
  const fields = randomFields()

  return `import React from 'react'

const fragment = graphql\`
  fragment FragmentComponent${index}_${entity.toLowerCase()} on ${entity} {
${fields}
  }
\`

export function FragmentComponent${index}() {
  return <div data-fragment={fragment}>FragmentComponent${index}</div>
}
`
}

function generateQueryComponent(index: number): string {
  const entity = rng.pick(ENTITY_NAMES)
  const fields = randomFields()

  return `import React from 'react'

const query = graphql\`
  query QueryComponent${index}Query {
    ${entity.toLowerCase()} {
${fields}
    }
  }
\`

export function QueryComponent${index}() {
  return <div data-query={query}>QueryComponent${index}</div>
}
`
}

function generateMutationComponent(index: number): string {
  const entity = rng.pick(ENTITY_NAMES)
  const field = rng.pick(FIELD_NAMES)

  return `import React from 'react'

const mutation = graphql\`
  mutation MutationComponent${index}Mutation($input: Update${entity}Input!) {
    update${entity}(input: $input) {
      id
      ${field}
    }
  }
\`

export function MutationComponent${index}() {
  return <div data-mutation={mutation}>MutationComponent${index}</div>
}
`
}

function generateSubscriptionComponent(index: number): string {
  const entity = rng.pick(ENTITY_NAMES)
  const fields = randomFields()

  return `import React from 'react'

const subscription = graphql\`
  subscription SubscriptionComponent${index}Subscription {
    on${entity}Updated {
${fields}
    }
  }
\`

export function SubscriptionComponent${index}() {
  return <div data-subscription={subscription}>SubscriptionComponent${index}</div>
}
`
}

function generateMultiOperationComponent(index: number): string {
  const entity1 = rng.pick(ENTITY_NAMES)
  const entity2 = rng.pick(ENTITY_NAMES)
  const fields1 = randomFields()
  const fields2 = randomFields()

  return `import React from 'react'

const fragment = graphql\`
  fragment MultiOperationComponent${index}_${entity1.toLowerCase()} on ${entity1} {
${fields1}
  }
\`

const query = graphql\`
  query MultiOperationComponent${index}Query {
    ${entity2.toLowerCase()} {
${fields2}
    }
  }
\`

export function MultiOperationComponent${index}() {
  return (
    <div>
      <div data-fragment={fragment}>fragment</div>
      <div data-query={query}>query</div>
    </div>
  )
}
`
}

const GENERATORS: Record<ComponentType, (index: number) => string> = {
  FragmentComponent: generateFragmentComponent,
  QueryComponent: generateQueryComponent,
  MutationComponent: generateMutationComponent,
  SubscriptionComponent: generateSubscriptionComponent,
  MultiOperationComponent: generateMultiOperationComponent,
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
