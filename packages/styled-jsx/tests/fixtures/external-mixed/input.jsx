import { externalStyles } from './styles'

export default function App() {
  return (
    <div>
      <p>Hello</p>
      <style jsx>{`p { color: red }`}</style>
      <style jsx>{externalStyles}</style>
    </div>
  )
}
