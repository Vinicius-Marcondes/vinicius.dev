function PhotosNav() {
  const items = [
    { label: "photos",    href: "photos.html",   active: true  },
    { label: "projects",  href: "projects.html", active: false },
    { label: "chat room", href: "chat.html",     active: false },
  ];
  const [hoverIdx, setHoverIdx] = React.useState(null);
  return (
    <nav style={{
      position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)",
      display: "flex", alignItems: "center", gap: 6,
      padding: "8px 12px",
      background: "rgba(12,9,8,0.78)",
      border: "1px solid rgba(240,228,207,0.22)",
      fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: "0.04em",
      zIndex: 10,
    }}>
      {items.map((it, i) => {
        const hovered = hoverIdx === i;
        const em = it.active || hovered;
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
                 color: em ? "var(--safelight-soft)" : "var(--fg-0)",
                 background: hovered ? "rgba(196,58,58,0.10)" : "transparent",
                 textDecoration: "none",
                 border: "1px solid " + (it.active ? "rgba(196,58,58,0.45)" : "transparent"),
                 whiteSpace: "nowrap",
               }}>
              <span style={{
                color: "var(--safelight)",
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
window.PhotosNav = PhotosNav;
