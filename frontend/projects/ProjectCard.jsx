// Project "cabinet" card — arcade-game-select aesthetic.
function ProjectCard({ p, density = "comfy" }) {
  const [hover, setHover] = React.useState(false);
  const compact = density === "compact";
  const statusMeta = {
    "live":        { label: "LIVE",       color: "var(--neon-lime)" },
    "in-progress": { label: "REC",        color: "var(--neon-pink)" },
    "archived":    { label: "ARCHIVED",   color: "var(--fg-2)" },
  }[p.status];
  const archived = p.status === "archived";

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: "var(--bg-1)",
        border: "1px solid " + (hover ? "var(--neon-pink)" : "var(--line-2)"),
        boxShadow: hover ? "4px 4px 0 0 var(--neon-pink)" : "none",
        transition: "box-shadow 120ms steps(2), border-color 120ms steps(2)",
        padding: compact ? 12 : 14,
        display: "grid",
        gap: compact ? 10 : 12,
        opacity: archived ? 0.78 : 1,
      }}>
      {/* cabinet marquee strip */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "var(--font-mono)", fontSize: 9,
        letterSpacing: "0.24em", textTransform: "uppercase",
        color: "var(--fg-2)",
      }}>
        <span>ch.{p.channel}</span>
        <span style={{ color: statusMeta.color }}>● {statusMeta.label}</span>
      </div>

      <Thumbnail kind={p.thumbnail.kind} hue={p.thumbnail.hue}
                 status={p.status} channel={p.channel} />

      {/* title row */}
      <div style={{ display: "grid", gap: 4 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          gap: 10,
        }}>
          <h3 style={{
            fontFamily: "var(--font-display)",
            fontSize: compact ? 14 : 16,
            color: "var(--fg-0)",
            margin: 0, lineHeight: 1.15,
            textShadow: hover && !archived
              ? "-1px 0 0 rgba(255,46,136,0.7), 1px 0 0 rgba(34,227,255,0.7)"
              : "none",
          }}>{p.title}</h3>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.18em", color: "var(--fg-2)",
          }}>{p.year}</span>
        </div>

        {!compact && (
          <p style={{
            margin: 0,
            fontFamily: "var(--font-mono)", fontSize: 12,
            color: "var(--fg-1)", lineHeight: 1.5,
          }}>{p.description}</p>
        )}
      </div>

      {/* tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {p.tags.map(t => (
          <span key={t} style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: "0.16em", textTransform: "uppercase",
            padding: "2px 6px",
            border: "1px solid var(--line-1)",
            color: "var(--fg-2)",
            background: "rgba(216,198,255,0.04)",
          }}>{t}</span>
        ))}
      </div>

      {/* links */}
      <div style={{
        display: "flex", gap: 6,
        borderTop: "1px dashed var(--line-1)",
        paddingTop: compact ? 8 : 10,
      }}>
        {p.links.site && (
          <a href={p.links.site} className="glitch-hover" style={linkStyle("cyan")}>
            <span>↗</span> visit
          </a>
        )}
        {p.links.github && (
          <a href={p.links.github} className="glitch-hover" style={linkStyle("pink")}>
            <span>{"{ }"}</span> source
          </a>
        )}
        {!p.links.site && !p.links.github && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: "var(--fg-3)", padding: "4px 8px",
          }}>// no signal</span>
        )}
      </div>
    </article>
  );
}

function linkStyle(accent) {
  const color = accent === "cyan" ? "var(--neon-cyan)" : "var(--neon-pink)";
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "4px 8px",
    fontFamily: "var(--font-mono)", fontSize: 10,
    letterSpacing: "0.16em", textTransform: "uppercase",
    color, textDecoration: "none",
    border: "1px solid " + color,
    background: "transparent",
  };
}

window.ProjectCard = ProjectCard;
