// Photos hero banner — safelight palette, photographer-forward copy.
function PhotosBanner({ photoCount, camera }) {
  return (
    <header style={{
      position: "relative",
      borderBottom: "1px solid var(--line-2)",
      padding: "120px 32px 32px",
      overflow: "hidden",
      background: "var(--bg-1)",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, var(--safelight-deep), var(--safelight), var(--warm-amber))",
      }} />
      <div style={{ position: "relative", maxWidth: 1120, margin: "0 auto" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--fg-2)", marginBottom: 18,
          display: "flex", gap: 10, alignItems: "center",
        }}>
          <a href="index.html" className="glitch-hover" style={{
            color: "var(--fg-1)", textDecoration: "none",
            borderBottom: "1px solid var(--line-2)", whiteSpace: "nowrap",
          }}>← vinicius.dev</a>
          <span style={{ color: "var(--fg-3)" }}>/</span>
          <span style={{ color: "var(--safelight-soft)" }}>photos</span>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          gap: 24, flexWrap: "wrap",
        }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 5vw, 56px)",
            color: "var(--fg-0)", margin: 0, lineHeight: 1,
            textShadow: "-2px 0 0 rgba(196,58,58,0.85), 2px 0 0 rgba(217,160,90,0.65)",
          }}>
            photos<span style={{ color: "var(--safelight)" }}>.</span>
            <span style={{ color: "var(--fg-2)", marginLeft: 14 }}>// ch.05</span>
          </h1>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 12,
            color: "var(--fg-1)", maxWidth: 420, lineHeight: 1.55,
          }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--fg-2)", marginBottom: 6,
            }}>// contact sheet · {camera}</div>
            {photoCount} frames, one camera, several cities.
            click any frame to enlarge — ←/→ to navigate.
          </div>
        </div>
      </div>
    </header>
  );
}
window.PhotosBanner = PhotosBanner;
