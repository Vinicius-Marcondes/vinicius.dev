// Controls bar: search, status filter, tag filter, sort.
function Controls({ state, setState, tags, count, total }) {
  const Seg = ({ value, options, onChange }) => (
    <div style={{ display: "flex", gap: 0, border: "1px solid var(--line-2)" }}>
      {options.map(o => {
        const active = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)}
            style={{
              padding: "6px 10px",
              fontFamily: "var(--font-mono)", fontSize: 10,
              letterSpacing: "0.16em", textTransform: "uppercase",
              background: active ? "var(--neon-pink)" : "transparent",
              color: active ? "var(--bg-0)" : "var(--fg-1)",
              border: "none",
              borderRight: "1px solid var(--line-2)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}>{o.l}</button>
        );
      }).map((btn, i, arr) => i === arr.length - 1
        ? React.cloneElement(btn, { style: { ...btn.props.style, borderRight: "none" } })
        : btn)}
    </div>
  );

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 16,
      alignItems: "center",
      padding: "14px 18px",
      background: "var(--bg-1)",
      border: "1px solid var(--line-2)",
      marginBottom: 20,
    }}>
      {/* search */}
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
          onChange={e => setState(s => ({ ...s, query: e.target.value, page: 1 }))}
          placeholder="title, tag, channel…"
          style={{
            flex: 1,
            background: "var(--bg-0)",
            border: "1px solid var(--line-2)",
            color: "var(--fg-0)",
            fontFamily: "var(--font-mono)", fontSize: 13,
            padding: "8px 10px",
            outline: "none",
          }}
          onFocus={e => e.target.style.borderColor = "var(--neon-cyan)"}
          onBlur={e => e.target.style.borderColor = "var(--line-2)"}
        />
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.16em", color: "var(--fg-2)",
          whiteSpace: "nowrap",
        }}>{count} / {total}</span>
      </label>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <Seg value={state.status} onChange={v => setState(s => ({ ...s, status: v, page: 1 }))}
             options={[
               { v: "all",         l: "all" },
               { v: "live",        l: "live" },
               { v: "in-progress", l: "rec" },
               { v: "archived",    l: "archived" },
             ]} />

        <Seg value={state.sort} onChange={v => setState(s => ({ ...s, sort: v }))}
             options={[
               { v: "recent",  l: "recent" },
               { v: "alpha",   l: "a→z" },
               { v: "channel", l: "ch.##" },
             ]} />

        <select
          value={state.tag}
          onChange={e => setState(s => ({ ...s, tag: e.target.value, page: 1 }))}
          style={{
            background: "var(--bg-0)",
            border: "1px solid var(--line-2)",
            color: "var(--fg-1)",
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.16em", textTransform: "uppercase",
            padding: "6px 10px",
            outline: "none",
          }}>
          <option value="all">// all tags</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  );
}
window.ProjectsControls = Controls;
