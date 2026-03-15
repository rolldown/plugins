import css from 'styled-jsx/css'

const buttonStyles = css`button { color: red; padding: 10px }`

export default function App() {
  return (
    <div>
      <button>Click</button>
      <style jsx>{buttonStyles}</style>
    </div>
  )
}
