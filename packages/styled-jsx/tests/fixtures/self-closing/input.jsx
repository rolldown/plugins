export default function SelfClosing() {
  return (
    <div>
      <br />
      <hr />
      <img src="test.png" />
      <style jsx>{`hr { border: 1px solid red }`}</style>
    </div>
  )
}
