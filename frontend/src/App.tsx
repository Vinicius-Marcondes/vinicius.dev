function App() {
  return (
    <main className="app-scaffold">
      <section
        className="app-scaffold__status"
        aria-labelledby="frontend-runtime-title"
      >
        <h1 id="frontend-runtime-title">Frontend runtime ready</h1>
        <p>
          Bun, Vite, React, and TypeScript are configured. This baseline exists
          so the route tree and shells can be added in the next task without
          carrying the stock template forward.
        </p>
      </section>
    </main>
  )
}

export default App
