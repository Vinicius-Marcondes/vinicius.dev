// "NO SIGNAL" thumbnail — a fake CRT screen drawn with CSS/SVG.
// Four variants keep the grid visually rhythmic without real screenshots.
function Thumbnail({ kind = "bars", hue = "pink", status = "live", channel = "01" }) {
  const hueColor = hue === "cyan"  ? "#22e3ff"
                 : hue === "amber" ? "#ffb347"
                 :                   "#ff2e88";
  const dim = status === "archived";

  return (
    <div style={{
      position: "relative",
      width: "100%",
      aspectRatio: "16 / 10",
      background: "#0a0812",
      overflow: "hidden",
      border: "1px solid var(--line-2)",
      filter: dim ? "grayscale(0.8) brightness(0.55)" : "none",
    }}>
      {/* picture content */}
      {kind === "bars"  && <ColorBars accent={hueColor} />}
      {kind === "noise" && <NoiseField accent={hueColor} />}
      {kind === "grid"  && <GridField accent={hueColor} />}
      {kind === "sig"   && <NoSignal accent={hueColor} />}

      {/* scanlines overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0 1px, transparent 1px 2px)",
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }} />
      {/* top-right channel bug */}
      <div style={{
        position: "absolute", top: 6, right: 6,
        padding: "2px 6px",
        fontFamily: "var(--font-mono)", fontSize: 9,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: "var(--fg-0)",
        background: "rgba(7,6,11,0.8)",
        border: "1px solid rgba(216,198,255,0.35)",
      }}>ch.{channel}</div>
      {/* archived stamp */}
      {status === "archived" && (
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-50%) rotate(-8deg)",
          padding: "4px 14px",
          border: "2px solid var(--fg-2)",
          color: "var(--fg-2)",
          fontFamily: "var(--font-display)", fontSize: 12,
          letterSpacing: "0.24em", textTransform: "uppercase",
          background: "rgba(7,6,11,0.6)",
        }}>archived</div>
      )}
      {/* in-progress REC pip */}
      {status === "in-progress" && (
        <div style={{
          position: "absolute", left: 8, top: 8,
          padding: "2px 6px",
          fontFamily: "var(--font-mono)", fontSize: 9,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--neon-pink)",
          background: "rgba(7,6,11,0.8)",
          border: "1px solid var(--neon-pink)",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            width: 5, height: 5, background: "var(--neon-pink)",
            boxShadow: "0 0 6px var(--neon-pink)",
            animation: "thumb-rec 1.4s steps(2) infinite",
          }} />
          rec
        </div>
      )}
      <style>{`@keyframes thumb-rec { 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}

function ColorBars({ accent }) {
  const bars = ["#f5ecff", "#ffe74c", "#22e3ff", "#b6ff3c", "#ff2e88", "#2a0b4a", "#0a0812"];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      {bars.map((c, i) => (
        <div key={i} style={{ flex: 1, background: c, opacity: 0.85 }} />
      ))}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, transparent 62%, rgba(0,0,0,0.85) 62%)`,
      }} />
      <div style={{
        position: "absolute", left: 10, bottom: 10,
        fontFamily: "var(--font-display)", fontSize: 10,
        letterSpacing: "0.24em", color: accent,
      }}>SMPTE // 01</div>
    </div>
  );
}

function NoiseField({ accent }) {
  // Dithered-ish static using layered repeating gradients.
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: `
        repeating-linear-gradient(37deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 4px),
        repeating-linear-gradient(-53deg, rgba(255,255,255,0.04) 0 3px, transparent 3px 6px),
        radial-gradient(ellipse at 30% 30%, ${accent}33 0%, transparent 55%),
        radial-gradient(ellipse at 70% 70%, ${accent}22 0%, transparent 60%),
        #0a0812
      `,
    }} />
  );
}

function GridField({ accent }) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `
          linear-gradient(180deg, transparent 0%, #0a0812 95%),
          repeating-linear-gradient(90deg, ${accent}55 0 1px, transparent 1px 14px),
          repeating-linear-gradient(180deg, ${accent}33 0 1px, transparent 1px 14px),
          radial-gradient(ellipse at 50% 120%, ${accent}66 0%, transparent 60%)
        `,
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, top: "55%", height: 1,
        background: accent, opacity: 0.8, filter: "blur(0.3px)",
      }} />
    </div>
  );
}

function NoSignal({ accent }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      {/* rainbow static bars, washed */}
      <div style={{
        position: "absolute", inset: 0,
        background: `repeating-linear-gradient(90deg,
          rgba(255,46,136,0.18) 0 14%,
          rgba(255,231,76,0.18) 14% 28%,
          rgba(182,255,60,0.18) 28% 42%,
          rgba(34,227,255,0.18) 42% 56%,
          rgba(216,198,255,0.18) 56% 70%,
          rgba(42,11,74,0.3) 70% 84%,
          rgba(10,8,18,0.4) 84% 100%
        )`,
      }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(7,6,11,0.55)" }} />
      <div style={{
        fontFamily: "var(--font-display)", fontSize: 13,
        letterSpacing: "0.3em", color: accent,
        textShadow: "-1px 0 0 rgba(255,46,136,0.7), 1px 0 0 rgba(34,227,255,0.7)",
        textTransform: "uppercase",
        zIndex: 1,
      }}>no signal</div>
    </div>
  );
}

window.Thumbnail = Thumbnail;
