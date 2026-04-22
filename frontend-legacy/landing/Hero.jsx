// Arcade attract-screen Hero.
// - wordmark lockup (centered, chromatic aberration)
// - tagline
// - "INSERT COIN" cycle prompt that morphs between "press [ any key ]"
//   and "insert coin to continue" like an arcade attract loop
// - corner ticks + sunset backdrop + vignette + scanlines
function Hero({ tweaks, onLogoClick }) {
  const {
    scanlines = "subtle",   // "off" | "subtle" | "loud"
    aberration = true,
    vignette = true,
    flicker = true,
    horizonLine = true,
    attractPrompt = true,
  } = tweaks || {};

  const [attractIdx, setAttractIdx] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setAttractIdx(i => (i + 1) % 3), 2000);
    return () => clearInterval(id);
  }, []);
  const prompts = [
    "press [ any key ] to enter",
    "insert coin to continue",
    "— select a channel above —",
  ];

  const scanOpacity = scanlines === "off" ? 0 : scanlines === "loud" ? 0.075 : 0.035;

  return (
    <section style={{
      position: "relative",
      minHeight: "100vh",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* sunset gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #2a0b4a 0%, #8a1b6b 50%, #ff6a2a 100%)",
      }} />
      {/* vignette */}
      {vignette && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(0,0,0,0.88) 100%)",
        }} />
      )}
      {/* horizon line */}
      {horizonLine && (
        <div style={{
          position: "absolute", left: 0, right: 0, top: "64%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,231,76,0.6), transparent)",
          filter: "blur(0.5px)",
        }} />
      )}
      {/* wire horizon — perspective grid suggesting road into sunset */}
      {horizonLine && <PerspectiveGrid />}

      {/* scanlines */}
      {scanlines !== "off" && (
        <div className={flicker ? "crt-flicker" : ""} style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `repeating-linear-gradient(to bottom, rgba(255,255,255,${scanOpacity}) 0 1px, transparent 1px 3px)`,
        }} />
      )}

      {/* corner ticks */}
      {["tl","tr","bl","br"].map(c => <CornerTick key={c} corner={c} />)}

      <ChannelBug channel={3} onClick={onLogoClick} />
      <Nav />

      {/* centered hero lockup */}
      <div style={{
        position: "relative", zIndex: 5,
        flex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "160px 32px 40px", textAlign: "center",
      }}>
        {/* top caption */}
        <div className="caption" style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--fg-0)", opacity: 0.7, marginBottom: 22,
          display: "inline-flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ color: "var(--neon-cyan)" }}>※</span>
          transmitting from são paulo · ch.03
          <span style={{ color: "var(--neon-cyan)" }}>※</span>
        </div>

        {/* wordmark */}
        <h1
          onClick={onLogoClick}
          className="hero-wordmark"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 9vw, 104px)",
            color: "var(--fg-0)", margin: 0, lineHeight: 1,
            cursor: "pointer", userSelect: "none",
            textShadow: aberration
              ? "-2px 0 0 rgba(255,46,136,0.9), 2px 0 0 rgba(34,227,255,0.9)"
              : "none",
          }}>
          vinicius<span style={{ color: "var(--neon-pink)" }}>.</span><span style={{ color: "var(--neon-cyan)" }}>dev</span>
        </h1>

        {/* tagline */}
        <div style={{
          marginTop: 32,
          fontFamily: "var(--font-mono)",
          fontSize: 15, color: "var(--fg-0)",
          letterSpacing: "0.04em", maxWidth: 620, lineHeight: 1.55,
        }}>
          engineer<span style={{ margin: "0 10px", color: "var(--neon-pink)" }}>·</span>
          photographer<span style={{ margin: "0 10px", color: "var(--neon-cyan)" }}>·</span>
          operator of late-night signals<span className="cursor" />
        </div>

        {/* attract-screen prompt */}
        {attractPrompt && (
          <div style={{
            marginTop: 56,
            fontFamily: "var(--font-display)",
            fontSize: 10,
            letterSpacing: "0.24em",
            color: "var(--fg-0)",
            textTransform: "uppercase",
            opacity: 0.85,
            height: 18,
          }}>
            <span key={attractIdx} style={{
              display: "inline-block",
              animation: "attract-in 320ms steps(4)",
            }}>
              {prompts[attractIdx]}
            </span>
          </div>
        )}
      </div>

      <StatusStrip />

      <style>{`
        @keyframes attract-in {
          0% { opacity: 0; transform: translateY(2px); }
          50% { opacity: 0.5; }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes crt-flicker-kf {
          0%, 97%, 100% { opacity: 1; }
          98% { opacity: 0.7; }
          99% { opacity: 1.1; }
        }
        .crt-flicker { animation: crt-flicker-kf 6s steps(1) infinite; }
        .hero-wordmark:active { transform: translate(1px,1px); }
        @media (prefers-reduced-motion: reduce) {
          .crt-flicker, .cursor::after { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

function CornerTick({ corner }) {
  const s = { position: "absolute", width: 22, height: 22, borderColor: "rgba(245,236,255,0.55)", zIndex: 4 };
  const m = {
    tl: { top: 14, left: 14, borderTop: "1px solid", borderLeft: "1px solid" },
    tr: { top: 14, right: 14, borderTop: "1px solid", borderRight: "1px solid" },
    bl: { bottom: 14, left: 14, borderBottom: "1px solid", borderLeft: "1px solid" },
    br: { bottom: 14, right: 14, borderBottom: "1px solid", borderRight: "1px solid" },
  }[corner];
  return <div style={{ ...s, ...m }} />;
}

// A thin perspective grid stretched to the horizon — outrun road, very subtle.
function PerspectiveGrid() {
  // horizontal lines spaced with accelerating gaps to fake perspective
  const rows = 9;
  const lines = [];
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1); // 0..1
    const y = Math.pow(t, 1.8) * 100; // % from top of grid area
    lines.push(y);
  }
  return (
    <div style={{
      position: "absolute", left: 0, right: 0,
      top: "64%", bottom: 0,
      overflow: "hidden",
      pointerEvents: "none",
      opacity: 0.55,
    }}>
      {/* vertical lines */}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none"
           style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffb347" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ff2e88" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {[...Array(15)].map((_, i) => {
          const x = (i / 14) * 100;
          const vx = 50 + (x - 50) * 4; // fan out from vanishing point
          return (
            <line key={i} x1="50" y1="0" x2={vx} y2="40"
                  stroke="url(#gridFade)" strokeWidth="0.12" />
          );
        })}
        {/* horizontal lines */}
        {lines.map((y, i) => (
          <line key={i} x1="0" y1={y * 0.4} x2="100" y2={y * 0.4}
                stroke="#ffb347" strokeOpacity={0.2 + i * 0.04} strokeWidth="0.12" />
        ))}
      </svg>
    </div>
  );
}

window.Hero = Hero;
