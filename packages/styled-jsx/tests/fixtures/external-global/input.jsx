import { globalStyles } from './styles'

export default function App() {
  return (
    <div>
      <p>Hello</p>
      <style jsx global>{globalStyles}</style>
    </div>
  )
}
