/**
 * Component generator for Emotion benchmark.
 * Generates ~100 React components with varied Emotion styled patterns.
 * Uses seeded random (seed=42) for deterministic generation.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import { SeededRandom } from '@rolldown/benchmark-utils/seeded-random'

const rng = new SeededRandom(42)

type ComponentType = 'StyledButton' | 'StyledCard' | 'CssComponent' | 'AnimatedBox' | 'ThemedPanel'
const COMPONENT_TYPES: ComponentType[] = [
  'StyledButton',
  'StyledCard',
  'CssComponent',
  'AnimatedBox',
  'ThemedPanel',
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
const SIZES = ['4px', '8px', '12px', '16px', '24px', '32px']
const FONTS = ["'Inter'", "'Roboto'", "'system-ui'", "'monospace'"]

function generateStyledButton(index: number): string {
  const bg = rng.pick(COLORS)
  const radius = rng.pick(SIZES)
  const padding = rng.pick(SIZES)
  const hasHover = rng.next() > 0.3

  return `import React from 'react'
import styled from '@emotion/styled'

const Button = styled.button\`
  background-color: ${bg};
  border: none;
  border-radius: ${radius};
  padding: ${padding} \${parseInt('${padding}') * 2}px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
${
  hasHover
    ? `  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }`
    : ''
}
\`

const Label = styled.span\`
  font-weight: 600;
  margin-right: 8px;
\`

export function StyledButton${index}({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <Button onClick={onClick}>
      <Label>Action:</Label>
      {children}
    </Button>
  )
}
`
}

function generateStyledCard(index: number): string {
  const bg = rng.pick(COLORS)
  const shadow = rng.next() > 0.5
  const border = rng.next() > 0.5

  return `import React from 'react'
import styled from '@emotion/styled'

const Card = styled.div\`
  background: ${bg}20;
  border-radius: 12px;
  padding: 24px;
${shadow ? '  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);' : ''}
${border ? `  border: 1px solid ${bg}40;` : ''}
\`

const Title = styled.h3\`
  margin: 0 0 12px;
  font-size: 18px;
  color: #333;
\`

const Content = styled.p\`
  margin: 0;
  color: #666;
  line-height: 1.6;
\`

const Footer = styled.div\`
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
\`

export function StyledCard${index}({ title, content }: { title: string; content: string }) {
  return (
    <Card>
      <Title>{title}</Title>
      <Content>{content}</Content>
      <Footer>
        <span>Card ${index}</span>
      </Footer>
    </Card>
  )
}
`
}

function generateCssComponent(index: number): string {
  const color = rng.pick(COLORS)
  const font = rng.pick(FONTS)

  return `/** @jsxImportSource @emotion/react */
import React from 'react'
import { css } from '@emotion/react'

const containerStyle = css\`
  padding: 16px;
  font-family: ${font};
  color: ${color};
\`

const headingStyle = css\`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
\`

const textStyle = css\`
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.8;
\`

export function CssComponent${index}({ heading, text }: { heading: string; text: string }) {
  return (
    <div css={containerStyle}>
      <h2 css={headingStyle}>{heading}</h2>
      <p css={textStyle}>{text}</p>
    </div>
  )
}
`
}

function generateAnimatedBox(index: number): string {
  const color = rng.pick(COLORS)
  const size = 40 + rng.nextInt(60)

  return `import React from 'react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

const pulse = keyframes\`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
\`

const rotate = keyframes\`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
\`

const Box = styled.div\`
  width: ${size}px;
  height: ${size}px;
  background: ${color};
  border-radius: 8px;
  animation: \${pulse} 2s ease-in-out infinite;
\`

const Spinner = styled.div\`
  width: 24px;
  height: 24px;
  border: 3px solid ${color}40;
  border-top-color: ${color};
  border-radius: 50%;
  animation: \${rotate} 1s linear infinite;
\`

export function AnimatedBox${index}({ loading }: { loading?: boolean }) {
  return loading ? <Spinner /> : <Box />
}
`
}

function generateThemedPanel(index: number): string {
  const hasBorder = rng.next() > 0.5
  const hasIcon = rng.next() > 0.5

  return `import React from 'react'
import styled from '@emotion/styled'

interface PanelProps {
  variant: 'primary' | 'secondary' | 'danger'
}

const colorMap = {
  primary: '#4ecdc4',
  secondary: '#95a5a6',
  danger: '#e74c3c',
}

const Panel = styled.div<PanelProps>\`
  padding: 20px;
  background: \${(props) => colorMap[props.variant]}15;
  color: \${(props) => colorMap[props.variant]};
${hasBorder ? '  border-left: 4px solid currentColor;' : '  border-radius: 8px;'}
\`

const PanelTitle = styled.h4\`
  margin: 0 0 8px;
  font-size: 16px;
\`

const PanelBody = styled.div\`
  font-size: 14px;
  opacity: 0.9;
\`
${
  hasIcon
    ? `
const Icon = styled.span\`
  margin-right: 8px;
  font-size: 18px;
\``
    : ''
}

export function ThemedPanel${index}({ variant, title, children }: PanelProps & { title: string; children: React.ReactNode }) {
  return (
    <Panel variant={variant}>
      <PanelTitle>${hasIcon ? '<Icon>*</Icon>' : ''}{title}</PanelTitle>
      <PanelBody>{children}</PanelBody>
    </Panel>
  )
}
`
}

const GENERATORS: Record<ComponentType, (index: number) => string> = {
  StyledButton: generateStyledButton,
  StyledCard: generateStyledCard,
  CssComponent: generateCssComponent,
  AnimatedBox: generateAnimatedBox,
  ThemedPanel: generateThemedPanel,
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
