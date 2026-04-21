// Fullscreen lightbox — keyboard nav, safelight palette.
function Lightbox({ open, photos, index, onClose, onNav }) {
  React.useEffect(() => {
    if (!open) return;
    const key = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNav(+1);
      else if (e.key === "ArrowLeft")  onNav(-1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, onClose, onNav]);
  if (!open) return null;
  const p = photos[index];
  if (!p) return null;

  const fmtDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
    } catch { return iso; }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 800,
      background: "rgba(12,9,8,0.96)",
      display: "grid", gridTemplateRows: "auto 1fr auto",
      fontFamily: "var(--font-mono)",
    }}>
      {/* header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid var(--line-2)",
        fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
      }}>
        <div style={{ color: "var(--fg-2)" }}>
          <span style={{ color: "var(--safelight)" }}>●</span> viewing · frame {index + 1} of {photos.length}
        </div>
        <button onClick={onClose} style={{
          padding: "6px 10px",
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          background: "transparent",
          border: "1px solid var(--line-2)",
          color: "var(--fg-0)", cursor: "pointer",
        }}>[ esc · close ]</button>
      </div>

      {/* frame + navigators */}
      <div style={{
        display: "grid", gridTemplateColumns: "auto 1fr auto",
        gap: 24, alignItems: "center",
        padding: "24px",
      }}>
        <NavBtn dir="left"  onClick={() => onNav(-1)} />
        <div style={{
          position: "relative",
          maxWidth: 1040, maxHeight: "72vh",
          margin: "0 auto", width: "100%",
          aspectRatio: "3 / 2",
          border: "1px solid var(--safelight)",
          boxShadow: "0 0 0 8px var(--bg-2), 0 0 0 9px var(--safelight), 0 0 40px rgba(196,58,58,0.25)",
          overflow: "hidden",
        }}>
          <FilmFrame tone={p.tone} label={p.frame} />
        </div>
        <NavBtn dir="right" onClick={() => onNav(+1)} />
      </div>

      {/* meta footer */}
      <div style={{
        padding: "14px 24px",
        borderTop: "1px solid var(--line-2)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 24, alignItems: "start",
        fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        <div>
          <div style={{ color: "var(--fg-3)", marginBottom: 4, fontSize: 9 }}>// title</div>
          <div style={{ color: "var(--fg-0)" }}>{p.title}</div>
          <div style={{ color: "var(--safelight-soft)", marginTop: 4, fontSize: 10 }}>
            frame {p.frame}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--fg-3)", marginBottom: 4, fontSize: 9 }}>// exposed</div>
          <div style={{ color: "var(--fg-1)" }}>{fmtDate(p.date)}</div>
          <div style={{ color: "var(--fg-2)", fontSize: 10, marginTop: 2 }}>
            {window.PhotosData.CAMERA}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--fg-3)", marginBottom: 4, fontSize: 9 }}>// signal</div>
          <div style={{ color: "var(--fg-1)" }}>{p.location}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            {p.tags.map(t => (
              <span key={t} style={{
                fontSize: 9, letterSpacing: "0.16em",
                padding: "2px 6px",
                border: "1px solid var(--line-2)", color: "var(--fg-2)",
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavBtn({ dir, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 48, height: 48,
      background: "transparent",
      border: "1px solid var(--line-2)",
      color: "var(--fg-0)",
      fontFamily: "var(--font-display)", fontSize: 16,
      cursor: "pointer",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--safelight)"; e.currentTarget.style.color = "var(--safelight-soft)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line-2)"; e.currentTarget.style.color = "var(--fg-0)"; }}
    >{dir === "left" ? "←" : "→"}</button>
  );
}

window.Lightbox = Lightbox;
