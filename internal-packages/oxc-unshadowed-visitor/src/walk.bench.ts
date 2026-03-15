import { bench, describe } from 'vitest'
import { parseSync } from 'rolldown/utils'
import { walk, ScopeTracker } from 'oxc-walker'
import { ScopedVisitor } from './index.js'

// Generate a realistic fixture with shadowed and unshadowed references
function generateFixture(repetitions: number): string {
  const blocks: string[] = []
  blocks.push(`import something from 'somewhere';`)
  for (let i = 0; i < repetitions; i++) {
    blocks.push(`
      React.createElement('div-${i}');
      function fn${i}(x) {
        const y = x + ${i};
        if (y > 0) {
          let React = 'shadow';
          React.createElement('shadowed-${i}');
        }
        return React.createElement('unshadowed-inner-${i}');
      }
      {
        const a${i} = React.createElement('block-${i}');
      }
    `)
  }
  return blocks.join('\n')
}

const smallProgram = parseSync('test.js', generateFixture(10)).program
const mediumProgram = parseSync('test.js', generateFixture(100)).program
const largeProgram = parseSync('test.js', generateFixture(500)).program

describe('small (10)', () => {
  bench('single-pass (ScopedVisitor)', () => {
    const sv = new ScopedVisitor<string>({
      trackedNames: ['React'],
      visitor: {
        Identifier(node, ctx) {
          if (node.name === 'React') {
            ctx.record({ name: 'React', node, data: 'ref' })
          }
        },
      },
    })
    sv.walk(smallProgram)
  })

  bench('two-pass (oxc-walker)', () => {
    const scopeTracker = new ScopeTracker({ preserveExitedScopes: true })
    walk(smallProgram, { scopeTracker, enter() {} })
    scopeTracker.freeze()
    const results: { name: string; node: any }[] = []
    walk(smallProgram, {
      scopeTracker,
      enter(node) {
        if (node.type === 'Identifier' && 'name' in node && node.name === 'React') {
          const decl = scopeTracker.getDeclaration('React')
          if (!decl) {
            results.push({ name: 'React', node })
          }
        }
      },
    })
  })
})

describe('medium (100)', () => {
  bench('single-pass (ScopedVisitor)', () => {
    const sv = new ScopedVisitor<string>({
      trackedNames: ['React'],
      visitor: {
        Identifier(node, ctx) {
          if (node.name === 'React') {
            ctx.record({ name: 'React', node, data: 'ref' })
          }
        },
      },
    })
    sv.walk(mediumProgram)
  })

  bench('two-pass (oxc-walker)', () => {
    const scopeTracker = new ScopeTracker({ preserveExitedScopes: true })
    walk(mediumProgram, { scopeTracker, enter() {} })
    scopeTracker.freeze()
    const results: { name: string; node: any }[] = []
    walk(mediumProgram, {
      scopeTracker,
      enter(node) {
        if (node.type === 'Identifier' && 'name' in node && node.name === 'React') {
          const decl = scopeTracker.getDeclaration('React')
          if (!decl) {
            results.push({ name: 'React', node })
          }
        }
      },
    })
  })
})

describe('large (500)', () => {
  bench('single-pass (ScopedVisitor)', () => {
    const sv = new ScopedVisitor<string>({
      trackedNames: ['React'],
      visitor: {
        Identifier(node, ctx) {
          if (node.name === 'React') {
            ctx.record({ name: 'React', node, data: 'ref' })
          }
        },
      },
    })
    sv.walk(largeProgram)
  })

  bench('two-pass (oxc-walker)', () => {
    const scopeTracker = new ScopeTracker({ preserveExitedScopes: true })
    walk(largeProgram, { scopeTracker, enter() {} })
    scopeTracker.freeze()
    const results: { name: string; node: any }[] = []
    walk(largeProgram, {
      scopeTracker,
      enter(node) {
        if (node.type === 'Identifier' && 'name' in node && node.name === 'React') {
          const decl = scopeTracker.getDeclaration('React')
          if (!decl) {
            results.push({ name: 'React', node })
          }
        }
      },
    })
  })
})
