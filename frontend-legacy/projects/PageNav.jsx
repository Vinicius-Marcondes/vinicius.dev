// Sub-nav for the projects page. Reuses the landing Nav vocabulary but
// anchors "projects" as the active item. Also carries the breadcrumb home link
// (the PageBanner handles the primary breadcrumb; this is the top-pinned bar).
function PageNav() {
  const items = [
    { label: "photos",    href: "photos.html",   active: false },
    { label: "projects",  href: "projects.html", active: true  },
    { label: "chat room", href: "chat.html",     active: false },
  ];
  const [hoverIdx, setHoverIdx] = React.useState(null);
  return (
    <nav style={{
      position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)",
      display: "flex", alignItems: "center", gap: 6,
      padding: "8px 12px",
      background: "rgba(7,6,11,0.75)",
      border: "1px solid rgba(216,198,255,0.28)",
      fontFamily: "var(--font-display)",
      fontSize: 11, letterSpacing: "0.04em",
      zIndex: 10,
    }}>
      {items.map((it, i) => {
        const hovered = hoverIdx === i;
        const emphasized = it.active || hovered;
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
                 color: emphasized ? "var(--neon-pink)" : "var(--fg-0)",
                 background: hovered ? "rgba(255,46,136,0.08)" : "transparent",
                 textDecoration: "none",
                 border: "1px solid " + (it.active ? "rgba(255,46,136,0.35)" : "transparent"),
                 whiteSpace: "nowrap",
               }}>
              <span style={{
                color: "var(--neon-pink)",
                visibility: (hovered || it.active) ? "visible" : "hidden",
                animation: "cursor-blink 0.8s steps(1) infinite",
              }}>►</span>
              [ {it.label} ]
            </a>
          </React.Fragment>
        );
      })}
      <style>{`@keyframes cursor-blink { 50% { opacity: 0; } }`}</style>
    </nav>
  );
}
window.ProjectsNav = PageNav;
