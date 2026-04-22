// Top-right CH.## live bug. Clickable → triggers easter egg callback.
function ChannelBug({ channel = 3, onClick }) {
  const pad = String(channel).padStart(2, "0");
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute", top: 28, right: 28,
        display: "flex", alignItems: "center", gap: 10,
        padding: "6px 10px",
        border: "1px solid rgba(216,198,255,0.4)",
        background: "rgba(7,6,11,0.6)",
        fontFamily: "var(--font-mono)", fontSize: 11,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "var(--fg-0)", zIndex: 10,
        cursor: "pointer",
      }}>
      <span style={{ color: "var(--fg-2)" }}>CH.{pad}</span>
      <span style={{ width: 1, height: 12, background: "rgba(216,198,255,0.28)" }} />
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        color: "var(--neon-pink)",
      }}>
        <span style={{
          width: 6, height: 6, background: "var(--neon-pink)",
          boxShadow: "0 0 8px var(--neon-pink)",
          animation: "bug-pulse 1.6s steps(2) infinite",
        }} />
        live
      </span>
      <style>{`@keyframes bug-pulse { 50% { opacity: 0.35; } }`}</style>
    </button>
  );
}
window.ChannelBug = ChannelBug;
