/* oxlint-disable */
// @ts-nocheck
// @vitest-environment jsdom

import * as signalsCore from '@preact/signals-core'
import { batch, signal } from '@preact/signals-core'
import * as signalsRuntime from '@preact/signals-react/runtime'
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import * as jsxDevRuntime from 'react/jsx-dev-runtime'
import { runInNewContext } from 'node:vm'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { rolldown } from 'rolldown'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import reactSignalsTransform, { type ReactSignalsTransformPluginOptions } from '../src/index.ts'

const customSource = 'useSignals-custom-source'
const modules: Record<string, unknown> = {
  '@preact/signals-core': signalsCore,
  '@preact/signals-react/runtime': signalsRuntime,
  react: React,
  'react/jsx-dev-runtime': jsxDevRuntime,
  'react/jsx-runtime': jsxRuntime,
  [customSource]: signalsRuntime,
}

function testRequire(name: string): unknown {
  if (name in modules) {
    return modules[name]
  }
  throw new Error(`Module ${name} not setup in testRequire.`)
}

async function createComponent(
  code: string,
  options: ReactSignalsTransformPluginOptions = {},
  filename = 'virtual:entry.tsx',
): Promise<Record<string, unknown>> {
  const build = await rolldown({
    input: filename,
    plugins: [
      {
        name: 'virtual',
        resolveId(id) {
          if (id === filename) return id
          return { id, external: true }
        },
        load(id) {
          if (id === filename) return code
        },
      },
      reactSignalsTransform(options),
    ],
  })

  const { output } = await build.generate({ format: 'cjs' })
  await build.close()
  const exports: Record<string, unknown> = {}
  const module = { exports }
  runInNewContext(output[0].code, { exports, module, require: testRequire })
  return module.exports
}

describe('react signals transform runtime', () => {
  let scratch: any
  let root: any

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    const document = (globalThis as { document: any }).document
    scratch = document.createElement('div')
    document.body.appendChild(scratch)
    root = createRoot(scratch)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    scratch.remove()
  })

  async function render(element: React.ReactElement) {
    await act(async () => {
      root.render(element)
    })
  }

  it('rerenders components when signals they use change', async () => {
    const { App } = await createComponent(`
      export function App({ name }) {
        return <div>Hello {name.value}</div>;
      }
    `)

    const name = signal('John')
    await render(React.createElement(App as React.ComponentType<any>, { name }))
    expect(scratch.innerHTML).toBe('<div>Hello John</div>')

    await act(async () => {
      name.value = 'Jane'
    })
    expect(scratch.innerHTML).toBe('<div>Hello Jane</div>')
  })

  it('rerenders components with custom hooks that use signals', async () => {
    const { App, name } = await createComponent(`
      import { signal } from '@preact/signals-core';

      export const name = signal('John');
      function useName() {
        return name.value;
      }

      export function App() {
        const currentName = useName();
        return <div>Hello {currentName}</div>;
      }
    `)

    await render(React.createElement(App as React.ComponentType))
    expect(scratch.innerHTML).toBe('<div>Hello John</div>')

    await act(async () => {
      ;(name as any).value = 'Jane'
    })
    expect(scratch.innerHTML).toBe('<div>Hello Jane</div>')
  })

  it('rerenders components wrapped in memo and forwardRef', async () => {
    const { MemoForwardRefApp, name } = await createComponent(`
      import { signal } from '@preact/signals-core';
      import { memo, forwardRef } from 'react';

      export const name = signal('John');

      export const MemoForwardRefApp = memo(forwardRef(({ name }, ref) => {
        return <div ref={ref}>Hello {name.value}</div>;
      }));
    `)

    const ref = React.createRef<any>()
    await render(React.createElement(MemoForwardRefApp as React.ComponentType<any>, { name, ref }))
    expect(scratch.innerHTML).toBe('<div>Hello John</div>')
    expect(ref.current).toBe(scratch.firstChild)

    await act(async () => {
      ;(name as any).value = 'Jane'
    })
    expect(scratch.innerHTML).toBe('<div>Hello Jane</div>')
    expect(ref.current).toBe(scratch.firstChild)
  })

  it('supports multiple hooks and direct signal reads in one component', async () => {
    const { App, greeting, name, punctuation } = await createComponent(`
      import { signal } from '@preact/signals-core';

      export const greeting = signal('Hello');
      function useGreeting() {
        return greeting.value;
      }

      export const name = signal('John');
      function useName() {
        return name.value;
      }

      export const punctuation = signal('!');
      export function App() {
        const currentGreeting = useGreeting();
        const currentName = useName();
        return <div>{currentGreeting} {currentName}{punctuation.value}</div>;
      }
    `)

    await render(React.createElement(App as React.ComponentType))
    expect(scratch.innerHTML).toBe('<div>Hello John!</div>')

    await act(async () => {
      batch(() => {
        ;(greeting as any).value = 'Hi'
        ;(name as any).value = 'Jane'
        ;(punctuation as any).value = '?'
      })
    })
    expect(scratch.innerHTML).toBe('<div>Hi Jane?</div>')
  })

  it('loads useSignals from a custom source', async () => {
    const { App } = await createComponent(
      `
        export function App({ name }) {
          return <div>Hello {name.value}</div>;
        }
      `,
      { importSource: customSource },
    )

    const name = signal('John')
    await render(React.createElement(App as React.ComponentType<any>, { name }))
    expect(scratch.innerHTML).toBe('<div>Hello John</div>')

    await act(async () => {
      name.value = 'Jane'
    })
    expect(scratch.innerHTML).toBe('<div>Hello Jane</div>')
  })

  it('transforms components authored inside another callback body', async () => {
    const { name, App } = await createComponent(`
      import { signal } from '@preact/signals-core';

      export const name = signal('John');
      export let App;

      const it = (name, fn) => fn();

      it('should work', () => {
        App = () => {
          return <div>Hello {name.value}</div>;
        };
      });
    `)

    await render(React.createElement(App as React.ComponentType))
    expect(scratch.innerHTML).toBe('<div>Hello John</div>')

    await act(async () => {
      ;(name as any).value = 'Jane'
    })

    expect(scratch.innerHTML).toBe('<div>Hello Jane</div>')
  })
})
