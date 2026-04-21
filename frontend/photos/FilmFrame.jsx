// CSS-only placeholder that mimics a toned photograph.
// Tones are chosen to coexist with real photos in the safelight palette —
// warm, desaturated, plausible color grades rather than neon washes.
function FilmFrame({ tone = "sunset", label = "", small = false }) {
  const gradients = {
    // warm street at night — tungsten + deep shadow
    sunset: "radial-gradient(ellipse at 35% 75%, #e08a48 0%, #a43e22 35%, #3a1410 70%, #120808 100%)",
    // blue hour / steel
    cyan:   "radial-gradient(ellipse at 45% 55%, #7a9aa2 0%, #344653 45%, #12171c 100%)",
    // golden hour interior
    amber:  "radial-gradient(ellipse at 55% 65%, #e9b670 0%, #a3663a 40%, #3a1c10 80%, #120a06 100%)",
    // dusk violet
    violet: "radial-gradient(ellipse at 50% 45%, #7d5a7a 0%, #3f2640 50%, #120810 100%)",
    // black-and-white
    mono:   "radial-gradient(ellipse at 50% 45%, #cfc5b6 0%, #5b5448 45%, #0f0d0a 100%)",
  };
  return (
    <div style={{
      position: "relative",
      width: "100%", height: "100%",
      background: gradients[tone] || gradients.sunset,
      filter: tone === "mono" ? "grayscale(1) contrast(1.05)" : "contrast(1.02) saturate(0.92)",
      overflow: "hidden",
    }}>
      {/* grain */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          repeating-linear-gradient(37deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 4px),
          repeating-linear-gradient(-53deg, rgba(0,0,0,0.14) 0 3px, transparent 3px 6px)
        `,
        mixBlendMode: "overlay",
      }} />
      {/* vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
      }} />
      {/* date stamp in warm cream (not neon amber) */}
      {label && (
        <div style={{
          position: "absolute", right: small ? 6 : 10, bottom: small ? 6 : 8,
          fontFamily: "var(--font-mono)", fontSize: small ? 8 : 10,
          letterSpacing: "0.2em", color: "rgba(240,228,207,0.82)",
          textShadow: "0 0 4px rgba(0,0,0,0.85)",
        }}>{label}</div>
      )}
    </div>
  );
}
window.FilmFrame = FilmFrame;
