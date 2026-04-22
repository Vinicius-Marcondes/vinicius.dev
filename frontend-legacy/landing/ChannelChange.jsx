// Easter egg: clicking the wordmark or channel bug triggers a brief TV
// channel-change overlay that cycles through some humorous "broadcasts".
function ChannelChange({ open, onClose }) {
  const channels = [
    { n: "00", label: "static", body: "please stand by." },
    { n: "99", label: "pirate", body: "hi — you found it." },
    { n: "07", label: "archive", body: "photos since '19 · portra fanatic." },
    { n: "13", label: "dev.log", body: "currently: at-proto client · ch.03" },
  ];
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    if (!open) return;
    setIdx(0);
    const id = setInterval(() => setIdx(i => i + 1), 620);
    const close = setTimeout(() => onClose && onClose(), 620 * channels.length + 400);
    return () => { clearInterval(id); clearTimeout(close); };
  }, [open]);
  if (!open) return null;
  const ch = channels[Math.min(idx, channels.length - 1)];
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: "rgba(7,6,11,0.86)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-mono)", color: "var(--fg-0)",
      pointerEvents: "none",
    }}>
      {/* static noise */}
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0 1px, transparent 1px 2px), repeating-linear-gradient(90deg, rgba(255,46,136,0.04) 0 1px, rgba(34,227,255,0.04) 1px 2px)",
      }} />
      <div style={{
        position: "relative",
        padding: "20px 28px",
        border: "1px solid var(--neon-cyan)",
        background: "rgba(7,6,11,0.9)",
        boxShadow: "0 0 24px rgba(34,227,255,0.35)",
        minWidth: 360, textAlign: "center",
        animation: "ch-pop 240ms steps(3)",
      }}>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 36,
          color: "var(--neon-cyan)", marginBottom: 8,
          textShadow: "-2px 0 0 rgba(255,46,136,0.8), 2px 0 0 rgba(34,227,255,0.8)",
        }}>CH.{ch.n}</div>
        <div style={{
          fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase",
          color: "var(--fg-2)", marginBottom: 14,
        }}>// {ch.label}</div>
        <div style={{ color: "var(--fg-0)", fontSize: 14 }}>{ch.body}</div>
      </div>
      <style>{`@keyframes ch-pop { 0% { transform: translate(2px,-1px); opacity: 0.4; } 100% { transform: none; opacity: 1; } }`}</style>
    </div>
  );
}
window.ChannelChange = ChannelChange;
