import React from 'react'
import * as Components from './components/index.js'

type AnyComponent = React.ComponentType<Record<string, unknown>>
// oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
const componentEntries = Object.entries(Components) as unknown as [string, AnyComponent][]

export function App() {
  return (
    <div className="app">
      <h1>Emotion Benchmark App</h1>
      <p>This app contains {componentEntries.length} components for benchmarking.</p>
      <div className="components-grid">
        {componentEntries.map(([name, Component]) => (
          <div key={name} className="component-wrapper">
            <Component
              children="Content"
              onClick={() => {}}
              title="Title"
              content="Content text"
              heading="Heading"
              text="Body text"
              loading={false}
              variant="primary"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
