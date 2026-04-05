import css from 'styled-jsx/css'

const globalStyles = css.global`body { margin: 0; padding: 0 }`

export default function App() {
  return (
    <div>
      <p>Hello</p>
      <style jsx global>{globalStyles}</style>
    </div>
  )
}
