// Arcade menu bar. Three items: photos, projects, chat room (auth).
// [ CHAT // AUTH ] carries a small lock glyph.
function Nav() {
  const items = [
    { label: "photos",    href: "photos.html",   sub: null },
    { label: "projects",  href: "projects.html", sub: null },
    { label: "chat room", href: "chat.html",     sub: "auth" },
  ];
  const [hoverIdx, setHoverIdx] = React.useState(null);
  return (
    <nav style={{
      position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)",
      display: "flex", alignItems: "center", gap: 6,
      padding: "8px 12px",
      background: "rgba(7,6,11,0.55)",
      border: "1px solid rgba(216,198,255,0.28)",
      fontFamily: "var(--font-display)",
      fontSize: 11, letterSpacing: "0.04em",
      zIndex: 10,
    }}>
      {items.map((it, i) => {
        const hovered = hoverIdx === i;
        return (
          <React.Fragment key={it.label}>
            {i > 0 && <span style={{ color: "var(--fg-3)", margin: "0 2px" }}>·</span>}
            <a href={it.href}
               onMouseEnter={() => setHoverIdx(i)}
               onMouseLeave={() => setHoverIdx(null)}
               className="glitch-hover"
               style={{
                 display: "inline-flex", alignItems: "center", gap: 8,
                 padding: "6px 10px",
                 color: hovered ? "var(--neon-pink)" : "var(--fg-0)",
                 background: hovered ? "rgba(255,46,136,0.08)" : "transparent",
                 textDecoration: "none",
                 border: "1px solid transparent",
                 whiteSpace: "nowrap",
               }}>
              <span style={{
                color: "var(--neon-pink)",
                visibility: hovered ? "visible" : "hidden",
                animation: "cursor-blink 0.8s steps(1) infinite",
              }}>►</span>
              <span>[ {it.label}{it.sub && <span style={{
                color: hovered ? "var(--neon-pink)" : "var(--fg-2)",
                marginLeft: 6,
              }}>// {it.sub}</span>} ]</span>
            </a>
          </React.Fragment>
        );
      })}
      <style>{`@keyframes cursor-blink { 50% { opacity: 0; } }`}</style>
    </nav>
  );
}
window.Nav = Nav;
