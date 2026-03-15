import React from 'react'
import * as Components from './components/index.js'

// Get all Consumer components for rendering
// oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
const consumerEntries = Object.entries(Components).filter(([name]) =>
  name.endsWith('Consumer'),
) as [string, React.ComponentType][]

export function App() {
  return (
    <div className="app">
      <h1>Prefresh Benchmark App</h1>
      <p>This app contains {consumerEntries.length} context consumers for benchmarking.</p>
      <div className="contexts-grid">
        {consumerEntries.map(([name, Consumer]) => (
          <div key={name}>
            <Consumer />
          </div>
        ))}
      </div>
    </div>
  )
}
