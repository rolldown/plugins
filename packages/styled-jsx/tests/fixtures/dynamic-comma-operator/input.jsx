export default function CommaOperator({ fallback, color }) {
  return (
    <div>
      <p>Hello</p>
      <style jsx>{`p { color: ${(console.log("debug"), color)} }`}</style>
    </div>
  )
}
