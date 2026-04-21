// Page banner: PROJECTS // CH.04, plus breadcrumb.
function PageBanner({ count }) {
  return (
    <header style={{
      position: "relative",
      borderBottom: "1px solid var(--line-2)",
      padding: "120px 32px 32px",
      overflow: "hidden",
    }}>
      {/* faint bg grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.35,
        background: `
          repeating-linear-gradient(90deg, rgba(216,198,255,0.06) 0 1px, transparent 1px 24px),
          repeating-linear-gradient(180deg, rgba(216,198,255,0.04) 0 1px, transparent 1px 24px)
        `,
        maskImage: "radial-gradient(ellipse at 30% 50%, black 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse at 30% 50%, black 30%, transparent 80%)",
      }} />
      {/* sunset accent strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, var(--sunset-violet), var(--sunset-magenta), var(--sunset-orange))",
      }} />

      <div style={{
        position: "relative", maxWidth: 1120, margin: "0 auto",
      }}>
        {/* breadcrumb */}
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--fg-2)", marginBottom: 18,
          display: "flex", gap: 10, alignItems: "center",
        }}>
          <a href="index.html" className="glitch-hover" style={{
            color: "var(--fg-1)", textDecoration: "none",
            borderBottom: "1px solid var(--line-2)",
          }}>← vinicius.dev</a>
          <span style={{ color: "var(--fg-3)" }}>/</span>
          <span style={{ color: "var(--neon-pink)" }}>projects</span>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          gap: 24, flexWrap: "wrap",
        }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 5vw, 56px)",
            color: "var(--fg-0)", margin: 0, lineHeight: 1,
            textShadow: "-2px 0 0 rgba(255,46,136,0.85), 2px 0 0 rgba(34,227,255,0.85)",
          }}>
            projects<span style={{ color: "var(--neon-pink)" }}>.</span>
            <span style={{ color: "var(--fg-2)", marginLeft: 14 }}>// ch.04</span>
          </h1>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 12,
            color: "var(--fg-1)", maxWidth: 420, lineHeight: 1.55,
          }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--fg-2)", marginBottom: 6,
            }}>// bulletin</div>
            {count} entries on the air — live, rec, and archived transmissions.
            browse by channel, filter by signal.
          </div>
        </div>
      </div>
    </header>
  );
}
window.ProjectsBanner = PageBanner;
