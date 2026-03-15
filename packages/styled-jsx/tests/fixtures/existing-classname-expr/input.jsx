export default function ExistingClassNameExpr() {
  const cls = 'dynamic'
  return (
    <div>
      <p className={cls}>Hello</p>
      <style jsx>{`p { color: red }`}</style>
    </div>
  )
}
