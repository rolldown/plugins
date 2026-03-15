import React from 'react'
import { Provider } from 'jotai'
import * as atoms from './components/index.js'

const atomEntries = Object.entries(atoms).filter(
  ([, value]) =>
    typeof value === 'object' &&
    value !== null &&
    // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
    'read' in (value as unknown as Record<string, unknown>),
)

function AtomDisplay({ name }: { name: string }) {
  return (
    <div className="atom-display">
      <span>{name}</span>
    </div>
  )
}

export function App() {
  return (
    <Provider>
      <div className="app">
        <h1>Jotai Benchmark App</h1>
        <p>This app contains {atomEntries.length} atoms for benchmarking.</p>
        <div className="atoms-grid">
          {atomEntries.map(([name]) => (
            <AtomDisplay key={name} name={name} />
          ))}
        </div>
      </div>
    </Provider>
  )
}
