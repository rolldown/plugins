import css from 'styled-jsx/css'

function App({ color }) {
  const { className, styles } = css.resolve`a { color: ${color} }`
  return (
    <div>
      <a className={className}>Link</a>
      {styles}
    </div>
  )
}

export default App
