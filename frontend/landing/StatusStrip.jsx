// "Now playing" status panel — rotates through a scripted list of entries
// so it reads as a live feed without needing an API. Swap for real APIs later.
function StatusStrip({ dense = false }) {
  const feed = [
    { k: "NOW BUILDING", v: "bsky.feed — ch. 03 // at-proto client",      accent: "pink" },
    { k: "LOCATION",     v: "são paulo · gmt-3 · late shift",               accent: null },
    { k: "LISTENING",    v: "boards of canada — geogaddi · side a",         accent: "cyan" },
    { k: "LAST COMMIT",  v: "2h ago · feat(auth): handle flow v2",           accent: null },
    { k: "NOW READING",  v: "ted chiang — stories of your life",            accent: null },
    { k: "SHOOTING",     v: "portra 400 · nikon fe · roll 07/12",           accent: "cyan" },
    { k: "SIGNAL",       v: "available for interesting work · hi@v.dev",    accent: "pink" },
  ];

  // live uptime counter — gives the "feed is alive" sense without an API
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  // cycling "accent" row — highlights one item at a time to suggest a live cursor
  const [cursor, setCursor] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setCursor(c => (c + 1) % feed.length), 2200);
    return () => clearInterval(id);
  }, [feed.length]);

  const shown = dense ? feed.slice(0, 3) : feed.slice(0, 4);

  return (
    <div style={{
      position: "relative", zIndex: 5,
      margin: "0 auto 60px", width: "min(820px, calc(100% - 64px))",
      background: "rgba(7,6,11,0.78)",
      border: "1px solid var(--neon-pink)",
      boxShadow: "0 0 0 1px rgba(255,46,136,0.22), 0 0 32px rgba(255,46,136,0.22)",
    }}>
      {/* tape label header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px",
        borderBottom: "1px solid rgba(255,46,136,0.45)",
        background: "linear-gradient(90deg, rgba(255,46,136,0.14), transparent 60%)",
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: "var(--fg-0)",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 7, height: 7, background: "var(--neon-pink)",
            boxShadow: "0 0 8px var(--neon-pink)",
            animation: "now-pulse 1.4s steps(2) infinite",
          }} />
          REC · now playing
        </span>
        <span style={{ color: "var(--fg-2)", fontVariantNumeric: "tabular-nums" }}>
          vhs-a · {hh}:{mm}:{ss}
        </span>
      </div>

      <div style={{ padding: "14px 14px 14px", display: "grid", gap: 10 }}>
        {shown.map((r, i) => {
          const active = (cursor % shown.length) === i;
          return (
            <div key={r.k} style={{
              display: "grid",
              gridTemplateColumns: "148px 1fr",
              gap: 16,
              alignItems: "baseline",
              fontFamily: "var(--font-mono)", fontSize: 13,
            }}>
              <div style={{
                color: active ? "var(--fg-0)" : "var(--fg-2)",
                fontSize: 10,
                letterSpacing: "0.18em", textTransform: "uppercase",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                <span style={{
                  width: 5, height: 5,
                  background: active ? "var(--neon-pink)" : "var(--fg-3)",
                  boxShadow: active ? "0 0 6px var(--neon-pink)" : "none",
                  display: "inline-block",
                }} />
                {r.k}
              </div>
              <div style={{
                color: r.accent === "pink" ? "var(--neon-pink)"
                     : r.accent === "cyan" ? "var(--neon-cyan)"
                     : "var(--fg-0)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                <span style={{ color: "var(--fg-3)", marginRight: 8 }}>&gt;</span>{r.v}
              </div>
            </div>
          );
        })}
      </div>

      {/* tape-rewind stripe */}
      <div style={{
        height: 6,
        background: "repeating-linear-gradient(90deg, var(--neon-pink) 0 8px, transparent 8px 16px)",
        opacity: 0.7,
      }} />
      <style>{`
        @keyframes now-pulse { 50% { opacity: 0.35; } }
        @media (prefers-reduced-motion: reduce) {
          @keyframes now-pulse { 0%,100% { opacity: 1; } }
        }
      `}</style>
    </div>
  );
}
window.StatusStrip = StatusStrip;
