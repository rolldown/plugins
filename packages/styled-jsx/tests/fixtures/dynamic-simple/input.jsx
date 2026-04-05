export default function DynamicSimple({ color }) {
  return (
    <div>
      <p>Hello</p>
      <style jsx>{`p { color: ${color} }`}</style>
    </div>
  )
}
