/**
 * Component generator for Styled JSX benchmark.
 * Generates ~100 React components with varied styled-jsx patterns.
 * Uses seeded random (seed=42) for deterministic generation.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { SeededRandom } from '@rolldown/benchmark-utils/seeded-random'

const rng = new SeededRandom(42)

type ComponentType =
  | 'BasicStyled'
  | 'DynamicStyled'
  | 'MediaQueryStyled'
  | 'NestedStyled'
  | 'GlobalStyled'
const COMPONENT_TYPES: ComponentType[] = [
  'BasicStyled',
  'DynamicStyled',
  'MediaQueryStyled',
  'NestedStyled',
  'GlobalStyled',
]

const COLORS = [
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#96ceb4',
  '#ffeaa7',
  '#dfe6e9',
  '#6c5ce7',
  '#fd79a8',
]
const SIZES = ['4px', '8px', '12px', '16px', '24px']
const FONTS = ['Inter', 'Roboto', 'system-ui', 'monospace']

function generateBasicStyled(index: number): string {
  const bg = rng.pick(COLORS)
  const padding = rng.pick(SIZES)
  const font = rng.pick(FONTS)

  return `import React from 'react'

export function BasicStyled${index}({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <h3 className="title">Section ${index}</h3>
      <p className="content">{children}</p>
      <style jsx>{\`
        .container {
          padding: ${padding};
          background: ${bg}20;
          border-radius: 8px;
          font-family: ${font}, sans-serif;
        }
        .title {
          color: ${bg};
          font-size: 18px;
          margin: 0 0 8px;
        }
        .content {
          color: #666;
          line-height: 1.6;
        }
      \`}</style>
    </div>
  )
}
`
}

function generateDynamicStyled(index: number): string {
  const defaultColor = rng.pick(COLORS)

  return `import React from 'react'

interface DynamicStyled${index}Props {
  color?: string
  size?: number
  active?: boolean
  children: React.ReactNode
}

export function DynamicStyled${index}({ color = '${defaultColor}', size = 16, active = false, children }: DynamicStyled${index}Props) {
  return (
    <div className="wrapper">
      <span className="badge">{active ? 'Active' : 'Inactive'}</span>
      <div className="body">{children}</div>
      <style jsx>{\`
        .wrapper {
          padding: 12px;
          border: 2px solid \${color};
          border-radius: 8px;
          opacity: \${active ? 1 : 0.6};
        }
        .badge {
          font-size: \${size}px;
          color: \${color};
          font-weight: bold;
        }
        .body {
          margin-top: 8px;
          font-size: \${size - 2}px;
        }
      \`}</style>
    </div>
  )
}
`
}

function generateMediaQueryStyled(index: number): string {
  const bg = rng.pick(COLORS)
  const font = rng.pick(FONTS)

  return `import React from 'react'

export function MediaQueryStyled${index}({ title, description }: { title: string; description: string }) {
  return (
    <div className="card">
      <h4 className="card-title">{title}</h4>
      <p className="card-desc">{description}</p>
      <style jsx>{\`
        .card {
          padding: 16px;
          background: ${bg}15;
          border-radius: 12px;
          font-family: ${font}, sans-serif;
        }
        .card-title {
          font-size: 16px;
          color: ${bg};
          margin: 0 0 8px;
        }
        .card-desc {
          font-size: 14px;
          color: #555;
        }
        @media (min-width: 768px) {
          .card {
            padding: 24px;
            display: flex;
            gap: 16px;
            align-items: center;
          }
          .card-title {
            font-size: 20px;
            min-width: 200px;
          }
        }
        @media (min-width: 1024px) {
          .card {
            padding: 32px;
          }
          .card-title {
            font-size: 24px;
          }
        }
      \`}</style>
    </div>
  )
}
`
}

function generateNestedStyled(index: number): string {
  const bg = rng.pick(COLORS)
  const radius = rng.pick(SIZES)

  return `import React from 'react'

export function NestedStyled${index}({ items }: { items: string[] }) {
  return (
    <ul className="list">
      {items.map((item, i) => (
        <li key={i} className="item">
          <span className="label">{item}</span>
          <button className="action">View</button>
        </li>
      ))}
      <style jsx>{\`
        .list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        .item:last-child {
          border-bottom: none;
        }
        .item:hover {
          background: ${bg}10;
        }
        .label {
          font-size: 14px;
          color: #333;
        }
        .action {
          background: ${bg};
          color: white;
          border: none;
          border-radius: ${radius};
          padding: 6px 12px;
          cursor: pointer;
          font-size: 12px;
        }
        .action:hover {
          opacity: 0.8;
        }
      \`}</style>
    </ul>
  )
}
`
}

function generateGlobalStyled(index: number): string {
  const bg = rng.pick(COLORS)
  const font = rng.pick(FONTS)

  return `import React from 'react'

export function GlobalStyled${index}({ children }: { children: React.ReactNode }) {
  return (
    <div className="section">
      <div className="section-content">{children}</div>
      <style jsx>{\`
        .section {
          padding: 20px;
          background: ${bg}10;
          border-left: 4px solid ${bg};
        }
        .section-content {
          font-family: ${font}, sans-serif;
          color: #444;
        }
      \`}</style>
      <style jsx global>{\`
        .section-${index} h1,
        .section-${index} h2,
        .section-${index} h3 {
          color: ${bg};
        }
        .section-${index} a {
          color: ${bg};
          text-decoration: underline;
        }
      \`}</style>
    </div>
  )
}
`
}

const GENERATORS: Record<ComponentType, (index: number) => string> = {
  BasicStyled: generateBasicStyled,
  DynamicStyled: generateDynamicStyled,
  MediaQueryStyled: generateMediaQueryStyled,
  NestedStyled: generateNestedStyled,
  GlobalStyled: generateGlobalStyled,
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
