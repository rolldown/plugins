import css from 'styled-jsx/css'

const { className, styles } = css.resolve`a { color: green }`

export default function App() {
  return (
    <div>
      <a className={className}>Link</a>
      {styles}
    </div>
  )
}
