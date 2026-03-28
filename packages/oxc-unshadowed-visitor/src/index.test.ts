import { describe, test, expect } from 'vitest'
import { parseSync } from 'rolldown/utils'
import { ScopedVisitor } from './index.ts'

function parse(code: string) {
  return parseSync('test.js', code).program
}

function collectRecords(code: string, trackedNames = ['React']) {
  const program = parse(code)
  const sv = new ScopedVisitor<string>({
    trackedNames,
    visitor: {
      Identifier(node, ctx) {
        if (trackedNames.includes(node.name)) {
          ctx.record({ name: node.name, node, data: 'ref' })
        }
      },
    },
  })
  return sv.walk(program)
}

describe('ScopedVisitor', () => {
  test('collects records for unshadowed references', () => {
    const records = collectRecords(`React.createElement('div');`)
    expect(records.length).toBe(1)
    expect(records[0].name).toBe('React')
    expect(records[0].data).toBe('ref')
  })

  test('ignores records for untracked names', () => {
    const code = `foo(); bar();`
    const program = parse(code)
    const sv = new ScopedVisitor<string>({
      trackedNames: ['React'],
      visitor: {
        Identifier(node, ctx) {
          ctx.record({ name: node.name, node, data: 'ref' })
        },
      },
    })
    const records = sv.walk(program)
    expect(records.length).toBe(0)
  })

  test.each([
    {
      name: 'let shadows tracked name in block scope',
      code: `
        React.createElement('a');
        { let React = 'local'; React.createElement('b'); }
        React.createElement('c');
      `,
      expected: 2,
    },
    {
      name: 'const shadows tracked name in block scope',
      code: `
        React.createElement('a');
        { const React = 'local'; React.createElement('b'); }
      `,
      expected: 1,
    },
    {
      name: 'var shadows tracked name in function scope',
      code: `
        React.createElement('a');
        function foo() { var React = 'local'; React.createElement('b'); }
        React.createElement('c');
      `,
      expected: 2,
    },
    {
      name: 'function declaration shadows tracked name at block scope',
      code: `
        React.createElement('x');
        { function React() {} React(); }
        React.createElement('y');
      `,
      expected: 2,
    },
    {
      name: 'class declaration shadows tracked name at block scope',
      code: `
        React.createElement('x');
        { class React {} new React(); }
      `,
      expected: 1,
    },
    {
      name: 'function parameters shadow tracked name',
      code: `
        React.createElement('outer');
        function foo(React) { React; }
      `,
      expected: 1,
    },
    {
      name: 'arrow function parameters shadow tracked name',
      code: `
        React.createElement('outer');
        const fn = (React) => React;
      `,
      expected: 1,
    },
    {
      name: 'catch clause parameter shadows tracked name',
      code: `
        React.createElement('outer');
        try {} catch (React) { React; }
        React.createElement('after');
      `,
      expected: 2,
    },
    {
      name: 'object destructuring shadows tracked name',
      code: `
        React;
        { const { React } = obj; React; }
      `,
      expected: 1,
    },
    {
      name: 'array destructuring shadows tracked name',
      code: `
        React;
        { const [React] = arr; React; }
      `,
      expected: 1,
    },
    {
      name: 'renamed destructuring shadows tracked name',
      code: `
        React;
        { const { other: React } = obj; React; }
      `,
      expected: 1,
    },
    {
      name: 'destructured function params shadow tracked name',
      code: `
        React;
        const fn = ({ React }) => React;
      `,
      expected: 1,
    },
    {
      name: 'rest parameter shadows tracked name',
      code: `
        React;
        function foo(...React) { React; }
      `,
      expected: 1,
    },
    {
      name: 'default parameter value shadows tracked name',
      code: `
        React;
        function foo(React = 'x') { React; }
      `,
      expected: 1,
    },
    {
      name: 'for-of loop variable shadows tracked name',
      code: `
        React;
        for (const React of items) { React; }
        React;
      `,
      expected: 2,
    },
    {
      name: 'for-in loop variable shadows tracked name',
      code: `
        React;
        for (const React in obj) { React; }
        React;
      `,
      expected: 2,
    },
    {
      name: 'for loop variable shadows tracked name',
      code: `
        React;
        for (let React = 0; React < 10; React++) { React; }
        React;
      `,
      expected: 2,
    },
    {
      name: 'var declaration after reference retroactively invalidates records',
      code: `
        function foo() {
          React.createElement('a');
          var React = 'local';
        }
      `,
      expected: 0,
    },
    {
      name: 'var hoisting does not affect outer scope records',
      code: `
        React.createElement('outer-a');
        function foo() {
          React.createElement('inner');
          var React = 'local';
        }
        React.createElement('outer-b');
      `,
      expected: 2,
    },
    {
      name: 'var hoisting across nested blocks within function',
      code: `
        function foo() {
          { React; }
          if (true) { var React = 'local'; }
        }
      `,
      expected: 0,
    },
    {
      name: 'deeply nested shadowing only affects inner scope',
      code: `
        React;
        { React; { let React = 'local'; React; } React; }
      `,
      expected: 3,
    },
    {
      name: 'same name shadowed at multiple nesting levels',
      code: `
        React;
        {
          let React = 'level-1';
          React;
          { let React = 'level-2'; React; }
        }
      `,
      expected: 1,
    },
  ])('$name', ({ code, expected }) => {
    expect(collectRecords(code).length).toBe(expected)
  })

  test('partial shadowing: only some tracked names shadowed', () => {
    const code = `
      React;
      process.env;
      function foo() {
        let React = 'local';
        React;
        process.env;
      }
    `
    expect(collectRecords(code, ['React', 'process']).length).toBe(3)
  })

  test('var does not shadow at module level', () => {
    const program = parseSync('test.js', `{ var React = 'still top-level'; }`, {
      sourceType: 'script',
    }).program
    const sv = new ScopedVisitor<string>({
      trackedNames: ['React'],
      visitor: {
        Identifier(node, ctx) {
          if (node.name === 'React') {
            ctx.record({ name: node.name, node, data: 'ref' })
          }
        },
      },
    })
    const records = sv.walk(program)
    expect(records.length).toBe(1)
  })

  test('user exit callbacks work correctly', () => {
    const program = parse(`function foo() { React; }`)
    const events: string[] = []
    const sv = new ScopedVisitor<string>({
      trackedNames: ['React'],
      visitor: {
        FunctionDeclaration(node, _ctx) {
          events.push('enter:' + node.id!.name)
        },
        'FunctionDeclaration:exit'(node, _ctx) {
          events.push('exit:' + node.id!.name)
        },
        Identifier(node, ctx) {
          if (node.name === 'React') {
            ctx.record({ name: node.name, node, data: 'ref' })
          }
        },
      },
    })
    const records = sv.walk(program)
    expect(events).toEqual(['enter:foo', 'exit:foo'])
    expect(records.length).toBe(1)
  })

  test('user exit callbacks fire after scope is still active', () => {
    const program = parse(`function foo() { let React = 'local'; React; }`)
    const exitShadowState: boolean[] = []
    const sv = new ScopedVisitor<string>({
      trackedNames: ['React'],
      visitor: {
        Identifier(node, ctx) {
          if (node.name === 'React') {
            ctx.record({ name: node.name, node, data: 'ref' })
          }
        },
        'FunctionDeclaration:exit'(_node, _ctx) {
          exitShadowState.push(true)
        },
      },
    })
    const records = sv.walk(program)
    expect(records.length).toBe(0)
    expect(exitShadowState.length).toBe(1)
  })
})
