function Footer() {
  const socials = [
    { label: "instagram", href: "#" },
    { label: "x.com",     href: "#" },
    { label: "github",    href: "#" },
    { label: "linkedin",  href: "#" },
    { label: "reddit",    href: "#" },
  ];
  const nav = [
    { label: "photos",    href: "photos.html" },
    { label: "projects",  href: "projects.html" },
    { label: "chat room", href: "chat.html" },
  ];
  return (
    <footer style={{
      position: "relative",
      padding: "40px 32px 32px",
      borderTop: "1px solid var(--line-1)",
      background: "var(--bg-0)",
      color: "var(--fg-2)",
      fontFamily: "var(--font-mono)", fontSize: 11,
      letterSpacing: "0.16em", textTransform: "uppercase",
    }}>
      <div style={{
        maxWidth: 1120, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 32, alignItems: "start",
      }}>
        <div>
          <div style={{ color: "var(--fg-3)", marginBottom: 12 }}>// menu</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {nav.map(i => (
              <a key={i.label} href={i.href} className="glitch-hover"
                 style={{ color: "var(--fg-1)", textDecoration: "none", width: "fit-content", whiteSpace: "nowrap" }}>
                [ {i.label}{i.sub && <span style={{ color: "var(--fg-3)", marginLeft: 6 }}>// {i.sub}</span>} ]
              </a>
            ))}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--fg-3)", marginBottom: 12 }}>// channels</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {socials.map(s => (
              <a key={s.label} href={s.href} className="glitch-hover"
                 style={{
                   color: "var(--fg-1)", textDecoration: "none",
                   display: "inline-flex", gap: 8, alignItems: "center", width: "fit-content",
                   whiteSpace: "nowrap",
                 }}>
                <span style={{ color: "var(--neon-cyan)" }}>↗</span>{s.label}
              </a>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "var(--fg-3)", marginBottom: 12 }}>// signal</div>
          <div style={{ color: "var(--fg-1)", marginBottom: 8 }}>vinicius.dev</div>
          <div style={{ color: "var(--fg-2)" }}>© 1987—2026</div>
          <div style={{ color: "var(--fg-3)", marginTop: 10, fontSize: 10, letterSpacing: "0.12em" }}>
            no cookies · no tracking · no newsletter · —v
          </div>
        </div>
      </div>
    </footer>
  );
}
window.Footer = Footer;
