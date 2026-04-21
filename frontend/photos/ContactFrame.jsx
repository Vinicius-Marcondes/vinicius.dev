// Contact-sheet frame — film frame + sprocket holes + frame number.
// Palette: safelight red/amber accents.
function ContactFrame({ photo, onClick, dense = false }) {
  const [hover, setHover] = React.useState(false);
  return (
    <figure
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        margin: 0,
        background: "var(--bg-2)",
        border: "1px solid " + (hover ? "var(--safelight)" : "var(--line-2)"),
        boxShadow: hover ? "4px 4px 0 0 var(--safelight)" : "none",
        transition: "box-shadow 120ms steps(2), border-color 120ms steps(2)",
        cursor: "pointer",
        padding: dense ? "10px 6px" : "14px 8px",
      }}>
      <Sprockets side="top" dense={dense} />
      <div style={{
        position: "relative",
        aspectRatio: "3 / 2",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.5)",
      }}>
        <FilmFrame tone={photo.tone} label={photo.frame} small={dense} />
      </div>
      <Sprockets side="bottom" dense={dense} />

      <figcaption style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        gap: 8,
        marginTop: dense ? 6 : 8,
        padding: "0 4px",
        fontFamily: "var(--font-mono)",
        fontSize: dense ? 9 : 10,
        letterSpacing: "0.16em", textTransform: "uppercase",
      }}>
        <span style={{
          color: hover ? "var(--safelight-soft)" : "var(--fg-1)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{photo.title}</span>
        <span style={{ color: "var(--fg-3)", flexShrink: 0 }}>{photo.frame}</span>
      </figcaption>
    </figure>
  );
}

function Sprockets({ side, dense }) {
  const count = 10;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      padding: dense ? "2px 2px" : "4px 2px",
      [side === "top" ? "marginBottom" : "marginTop"]: dense ? 4 : 6,
    }}>
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{
          width: dense ? 6 : 8, height: dense ? 4 : 6,
          background: "var(--bg-0)",
          border: "1px solid var(--line-1)",
        }} />
      ))}
    </div>
  );
}

window.ContactFrame = ContactFrame;
