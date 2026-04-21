// Empty state when filters match nothing.
function EmptyState({ onReset }) {
  return (
    <div style={{
      margin: "40px auto", maxWidth: 640,
      padding: "48px 24px",
      border: "1px dashed var(--line-2)",
      textAlign: "center",
      background: "var(--bg-1)",
    }}>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: 28,
        color: "var(--fg-2)", marginBottom: 14,
        textShadow: "-1px 0 0 rgba(255,46,136,0.6), 1px 0 0 rgba(34,227,255,0.6)",
      }}>NO SIGNAL</div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 12,
        color: "var(--fg-1)", marginBottom: 18, lineHeight: 1.55,
      }}>
        nothing's broadcasting on that combination.<br />
        try a wider filter or a different channel.
      </div>
      <button onClick={onReset} style={{
        padding: "8px 14px",
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.2em", textTransform: "uppercase",
        background: "transparent",
        border: "1px solid var(--neon-cyan)",
        color: "var(--neon-cyan)",
        cursor: "pointer",
      }}>[ reset filters ]</button>
    </div>
  );
}
window.ProjectsEmpty = EmptyState;
