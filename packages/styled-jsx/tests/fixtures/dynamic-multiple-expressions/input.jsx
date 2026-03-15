export default function DynamicMultiple({ color, size }) {
  return (
    <div>
      <p>Hello</p>
      <style jsx>{`p { color: ${color}; font-size: ${size}px }`}</style>
    </div>
  )
}
