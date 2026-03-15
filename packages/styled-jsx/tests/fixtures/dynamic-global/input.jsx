export default function DynamicGlobal({ bgColor }) {
  return (
    <div>
      <p>Hello</p>
      <style jsx global>{`body { background: ${bgColor} }`}</style>
    </div>
  )
}
