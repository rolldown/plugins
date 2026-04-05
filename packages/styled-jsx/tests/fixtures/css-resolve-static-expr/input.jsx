import css from 'styled-jsx/css'

const COLOR = 'green'
const { className, styles } = css.resolve`a { color: ${COLOR} }`

export default function App() {
  return (
    <div>
      <a className={className}>Link</a>
      {styles}
    </div>
  )
}
