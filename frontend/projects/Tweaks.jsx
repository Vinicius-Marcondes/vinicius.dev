// Floating tweaks panel for the projects page.
function ProjectsTweaks({ tweaks, onChange }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") setOpen(true);
      if (d.type === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);
  const set = (patch) => {
    onChange({ ...tweaks, ...patch });
    try { window.parent.postMessage({ type: "__edit_mode_set_keys", edits: patch }, "*"); } catch (_) {}
  };
  if (!open) return null;
  const Row = ({ label, children }) => (
    <div style={{
      display: "grid", gridTemplateColumns: "98px 1fr", gap: 10,
      alignItems: "center", padding: "6px 0",
      borderBottom: "1px dashed rgba(216,198,255,0.12)",
    }}>
      <div style={{
        fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
        color: "var(--fg-2)",
      }}>{label}</div>
      <div>{children}</div>
    </div>
  );
  const seg = (cur, opts, onPick) => (
    <div style={{ display: "flex", gap: 2 }}>
      {opts.map(o => (
        <button key={o}
          onClick={() => onPick(o)}
          style={{
            flex: 1, padding: "5px 6px",
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.12em", textTransform: "uppercase",
            background: cur === o ? "var(--neon-pink)" : "transparent",
            color: cur === o ? "var(--bg-0)" : "var(--fg-1)",
            border: "1px solid " + (cur === o ? "var(--neon-pink)" : "var(--line-2)"),
            cursor: "pointer",
          }}>{o}</button>
      ))}
    </div>
  );
  return (
    <div style={{
      position: "fixed", right: 20, bottom: 20, zIndex: 500,
      width: 280,
      background: "rgba(7,6,11,0.94)",
      border: "1px solid var(--neon-cyan)",
      boxShadow: "0 0 0 1px rgba(34,227,255,0.22), 0 0 24px rgba(34,227,255,0.2)",
      fontFamily: "var(--font-mono)", color: "var(--fg-1)",
    }}>
      <div style={{
        padding: "8px 12px",
        borderBottom: "1px solid rgba(34,227,255,0.4)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
        color: "var(--fg-0)",
        background: "linear-gradient(90deg, rgba(34,227,255,0.14), transparent 60%)",
      }}>
        <span>// tweaks</span><span style={{ color: "var(--fg-2)" }}>projects</span>
      </div>
      <div style={{ padding: "6px 12px 10px" }}>
        <Row label="density">{seg(tweaks.density, ["compact","comfy"], v => set({ density: v }))}</Row>
        <Row label="columns">{seg(String(tweaks.columns), ["2","3","4"], v => set({ columns: Number(v) }))}</Row>
        <Row label="page size">{seg(String(tweaks.pageSize), ["6","9","12","all"], v => set({ pageSize: v === "all" ? 999 : Number(v) }))}</Row>
      </div>
    </div>
  );
}
window.ProjectsTweaks = ProjectsTweaks;
