function App() {
  return (
    <main className="bootstrap-screen">
      <section
        className="bootstrap-frame"
        aria-labelledby="frontend-bootstrap-title"
      >
        <p className="bootstrap-kicker">// frontend scaffold</p>
        <h1 id="frontend-bootstrap-title">vinicius.dev signal lock</h1>
        <p className="bootstrap-copy">
          FE-002 establishes the Bun + Vite + React + TypeScript baseline.
          FE-003 will wire the router, shells, page slices, and shared tokens on
          top of this runtime.
        </p>
        <dl className="bootstrap-checklist">
          <div>
            <dt>runtime</dt>
            <dd>bun + vite + react + typescript</dd>
          </div>
          <div>
            <dt>legacy source</dt>
            <dd>preserved under frontend-legacy/</dd>
          </div>
          <div>
            <dt>next task</dt>
            <dd>route tree + public/admin shells</dd>
          </div>
        </dl>
      </section>
    </main>
  )
}

export default App
