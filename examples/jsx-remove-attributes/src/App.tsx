export default function App() {
  return (
    <div className="app" data-testid="app-root">
      <h1 className="title" data-testid="title">
        Jsx Remove Attributes Works!
      </h1>
      <p className="description" data-test-id="desc" data-custom="keep-me">
        Testing attributes are removed in production.
      </p>
      <button data-testid="action-btn" data-custom="also-keep">
        Click me
      </button>
    </div>
  )
}
