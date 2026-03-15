import { createContext } from 'preact'
import { useContext, useState } from 'preact/hooks'

const ThemeContext = createContext('light')

function ThemeDisplay() {
  const theme = useContext(ThemeContext)
  return <p className="prefresh-theme">Current theme: {theme}</p>
}

export function App() {
  const [theme, setTheme] = useState('dark')
  return (
    <div className="prefresh-app">
      <h1 className="prefresh-title">Prefresh Works!</h1>
      <button
        className="prefresh-toggle"
        onClick={() => setTheme((t) => (t === 'dark' ? 'blue' : 'dark'))}
      >
        Toggle theme
      </button>
      <ThemeContext.Provider value={theme}>
        <ThemeDisplay />
      </ThemeContext.Provider>
    </div>
  )
}
