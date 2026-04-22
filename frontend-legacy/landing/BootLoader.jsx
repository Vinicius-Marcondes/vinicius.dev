// 1s tape-rewind boot sequence. Shows briefly on page load, then unmounts.
// Reduced motion: skip entirely and render page instantly.
function BootLoader({ onDone, duration = 1100 }) {
  const [progress, setProgress] = React.useState(0);
  const [line, setLine] = React.useState(0);

  const lines = [
    "› booting vhs-a · side 01",
    "› warming phosphor · ch.03",
    "› tracking signal ...",
    "› ready.",
  ];

  React.useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { onDone && onDone(); return; }

    const start = performance.now();
    let raf;
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / duration);
      setProgress(t);
      setLine(Math.min(lines.length - 1, Math.floor(t * lines.length)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => onDone && onDone(), 120);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "var(--bg-0)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-mono)", color: "var(--fg-0)",
    }}>
      {/* scanlines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
      }} />
      <div style={{
        width: "min(520px, 84vw)",
        display: "grid", gap: 18,
      }}>
        {/* frame corners */}
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 11,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--fg-2)",
          display: "flex", justifyContent: "space-between",
        }}>
          <span>VHS-A / SIDE 01</span>
          <span style={{ color: "var(--neon-pink)" }}>
            <span style={{
              display: "inline-block", width: 6, height: 6,
              background: "var(--neon-pink)", marginRight: 8,
              boxShadow: "0 0 8px var(--neon-pink)",
              verticalAlign: "middle",
              animation: "boot-pulse 0.6s steps(2) infinite",
            }} />
            REC
          </span>
        </div>

        {/* tape-rewind bar */}
        <div style={{
          height: 10,
          border: "1px solid var(--line-2)",
          position: "relative",
          background: "rgba(7,6,11,0.8)",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            width: `${Math.round(progress * 100)}%`,
            background: "repeating-linear-gradient(90deg, var(--neon-pink) 0 8px, var(--sunset-orange) 8px 16px)",
            transition: "width 60ms linear",
          }} />
          {/* rewind heads — little ticks moving along */}
          <div style={{
            position: "absolute", top: -3, bottom: -3,
            left: `calc(${Math.round(progress * 100)}% - 1px)`,
            width: 2, background: "var(--neon-cyan)",
            boxShadow: "0 0 6px var(--neon-cyan)",
          }} />
        </div>

        <div style={{
          fontSize: 13, color: "var(--fg-1)",
          minHeight: 80,
          display: "grid", gap: 4,
        }}>
          {lines.slice(0, line + 1).map((l, i) => (
            <div key={i} style={{
              color: i === line ? "var(--fg-0)" : "var(--fg-2)",
            }}>
              {l}{i === line && <span className="cursor" />}
            </div>
          ))}
        </div>

        <div style={{
          fontFamily: "var(--font-display)", fontSize: 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--fg-3)",
          display: "flex", justifyContent: "space-between",
        }}>
          <span>track 01</span>
          <span>{String(Math.round(progress * 100)).padStart(3, "0")}%</span>
          <span>sp · ntsc</span>
        </div>
      </div>
      <style>{`@keyframes boot-pulse { 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}
window.BootLoader = BootLoader;
