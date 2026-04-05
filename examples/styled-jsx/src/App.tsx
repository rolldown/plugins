/// <reference types="styled-jsx" />
import { useState } from 'react'
import { externalStyles } from './styles'

export default function App() {
  return (
    <div>
      <h1 className="app-title">Styled JSX Works!</h1>
      <Scoped />
      <Global />
      <Dynamic />
      <External />
    </div>
  )
}

function Scoped() {
  return (
    <div>
      <p className="scoped-text">This text is red (scoped)</p>
      <style jsx>{`
        p {
          color: red;
        }
      `}</style>
    </div>
  )
}

function Global() {
  return (
    <div>
      <p className="global-text">This text is blue (global)</p>
      <style jsx global>{`
        .global-text {
          color: blue;
        }
      `}</style>
    </div>
  )
}

function Dynamic() {
  const [toggled, setToggled] = useState(false)
  const color = toggled ? 'purple' : 'green'

  return (
    <div>
      <p className="dynamic-text">This text changes color</p>
      <button className="color-toggle" onClick={() => setToggled(!toggled)}>
        Toggle Color
      </button>
      <style jsx>{`
        p {
          color: ${color};
        }
      `}</style>
    </div>
  )
}

function External() {
  return (
    <div>
      <p className="external-text">This text is teal (external)</p>
      <style jsx>{externalStyles}</style>
    </div>
  )
}
