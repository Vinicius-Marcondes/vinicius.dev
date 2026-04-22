// Controls: search + year/location filters. (No roll grouping — one camera.)
function PhotosControls({ state, setState, years, locations, count, total }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 16, alignItems: "center",
      padding: "14px 18px",
      background: "var(--bg-1)",
      border: "1px solid var(--line-2)",
      marginBottom: 20,
    }}>
      <label style={{
        display: "flex", alignItems: "center", gap: 10,
        fontFamily: "var(--font-mono)", fontSize: 13,
      }}>
        <span style={{
          fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--fg-2)",
        }}>&gt; find</span>
        <input
          value={state.query}
          onChange={e => setState(s => ({ ...s, query: e.target.value }))}
          placeholder="title, location, tag…"
          style={{
            flex: 1,
            background: "var(--bg-0)",
            border: "1px solid var(--line-2)",
            color: "var(--fg-0)",
            fontFamily: "var(--font-mono)", fontSize: 13,
            padding: "8px 10px", outline: "none",
          }}
          onFocus={e => e.target.style.borderColor = "var(--safelight)"}
          onBlur={e => e.target.style.borderColor = "var(--line-2)"}
        />
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.16em", color: "var(--fg-2)", whiteSpace: "nowrap",
        }}>{count} / {total}</span>
      </label>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select value={state.location}
          onChange={e => setState(s => ({ ...s, location: e.target.value }))}
          style={selectStyle}>
          <option value="all">// all locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <select value={state.year}
          onChange={e => setState(s => ({ ...s, year: e.target.value }))}
          style={selectStyle}>
          <option value="all">// all years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}

const selectStyle = {
  background: "var(--bg-0)",
  border: "1px solid var(--line-2)",
  color: "var(--fg-1)",
  fontFamily: "var(--font-mono)", fontSize: 10,
  letterSpacing: "0.16em", textTransform: "uppercase",
  padding: "6px 10px", outline: "none",
};

window.PhotosControls = PhotosControls;
