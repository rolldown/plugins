import { atom, useAtom } from 'jotai'

const countAtom = atom(0)
const doubleAtom = atom((get) => get(countAtom) * 2)

export default function App() {
  const [count, setCount] = useAtom(countAtom)
  const [double] = useAtom(doubleAtom)

  return (
    <div className="jotai-app">
      <h1 className="jotai-title">Jotai Works!</h1>
      <p className="jotai-count">Count: {count}</p>
      <p className="jotai-double">Double: {double}</p>
      <button className="jotai-button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </div>
  )
}
