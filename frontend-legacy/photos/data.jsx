// Backend-ready photos data.
// One photographer, one camera (Canon T7+). Flat feed of frames.
// Shape:
//   { id, frame, title, date, location, tags, tone }
// Swap fetchPhotos() for /api/photos later.

const CAMERA = "Canon T7+";

const PHOTOS = [
  { id: "p-2026-014", frame: "014", date: "2026-03-22", title: "paulista at 02:14",       location: "São Paulo",  tone: "sunset", tags: ["night","street"] },
  { id: "p-2026-013", frame: "013", date: "2026-03-18", title: "arcade exit",             location: "São Paulo",  tone: "cyan",   tags: ["night","arcade"] },
  { id: "p-2026-012", frame: "012", date: "2026-03-11", title: "pool hall, mirror",       location: "São Paulo",  tone: "amber",  tags: ["interior"] },
  { id: "p-2026-011", frame: "011", date: "2026-02-28", title: "empty lot · sodium",      location: "São Paulo",  tone: "amber",  tags: ["night","urban"] },
  { id: "p-2026-010", frame: "010", date: "2026-02-14", title: "green line, last train",  location: "São Paulo",  tone: "violet", tags: ["transit"] },
  { id: "p-2026-009", frame: "009", date: "2026-01-30", title: "orange sky over tietê",   location: "São Paulo",  tone: "sunset", tags: ["sky"] },
  { id: "p-2025-028", frame: "028", date: "2025-11-12", title: "shinjuku · crossing",     location: "Tokyo",       tone: "cyan",   tags: ["night","crowd"] },
  { id: "p-2025-027", frame: "027", date: "2025-11-10", title: "golden gai, side door",   location: "Tokyo",       tone: "amber",  tags: ["night","alley"] },
  { id: "p-2025-026", frame: "026", date: "2025-11-08", title: "pachinko halo",           location: "Tokyo",       tone: "sunset", tags: ["neon"] },
  { id: "p-2025-025", frame: "025", date: "2025-11-07", title: "shibuya rain",            location: "Tokyo",       tone: "cyan",   tags: ["rain","night"] },
  { id: "p-2025-024", frame: "024", date: "2025-11-05", title: "family mart · 03:40",     location: "Tokyo",       tone: "mono",   tags: ["interior"] },
  { id: "p-2025-023", frame: "023", date: "2025-11-04", title: "vending-machine row",     location: "Tokyo",       tone: "amber",  tags: ["color"] },
  { id: "p-2024-018", frame: "018", date: "2024-09-22", title: "chiado slope",            location: "Lisbon",      tone: "mono",   tags: ["bw","street"] },
  { id: "p-2024-017", frame: "017", date: "2024-09-21", title: "graça rooftops",          location: "Lisbon",      tone: "mono",   tags: ["bw","sky"] },
  { id: "p-2024-016", frame: "016", date: "2024-09-20", title: "tram 28 · window seat",   location: "Lisbon",      tone: "mono",   tags: ["bw","transit"] },
  { id: "p-2024-015", frame: "015", date: "2024-09-19", title: "alfama cat",              location: "Lisbon",      tone: "mono",   tags: ["bw","cat"] },
  { id: "p-2024-011", frame: "011", date: "2024-06-14", title: "ferry wake",              location: "Ilha Grande", tone: "cyan",   tags: ["water"] },
  { id: "p-2024-010", frame: "010", date: "2024-06-13", title: "red roof · abraão",       location: "Ilha Grande", tone: "sunset", tags: ["architecture"] },
  { id: "p-2024-009", frame: "009", date: "2024-06-12", title: "green palm · noon",       location: "Ilha Grande", tone: "amber",  tags: ["nature"] },
  { id: "p-2024-008", frame: "008", date: "2024-06-11", title: "storm rolling in",        location: "Ilha Grande", tone: "violet", tags: ["sky","storm"] },
  { id: "p-2026-005", frame: "005", date: "2026-01-08", title: "airport benches",         location: "Roaming",     tone: "mono",   tags: ["transit"] },
  { id: "p-2026-004", frame: "004", date: "2026-01-07", title: "lobby clock · 04:58",     location: "Roaming",     tone: "amber",  tags: ["interior"] },
  { id: "p-2026-003", frame: "003", date: "2026-01-06", title: "cab window, highway",     location: "Roaming",     tone: "violet", tags: ["motion"] },
  { id: "p-2026-002", frame: "002", date: "2026-01-05", title: "hotel sign, burned out",  location: "Roaming",     tone: "sunset", tags: ["neon"] },
];

async function fetchPhotos() {
  return new Promise(r => setTimeout(() => r(PHOTOS), 0));
}

function filterPhotos(photos, { query, year, location }) {
  let out = photos.slice();
  if (year && year !== "all")         out = out.filter(p => p.date.startsWith(year));
  if (location && location !== "all") out = out.filter(p => p.location === location);
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    out = out.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.frame.toLowerCase().includes(q)
    );
  }
  out.sort((a,b) => b.date.localeCompare(a.date));
  return out;
}

function allYears(photos) {
  return Array.from(new Set(photos.map(p => p.date.slice(0,4)))).sort().reverse();
}
function allLocations(photos) {
  return Array.from(new Set(photos.map(p => p.location))).sort();
}

// group by year+month header dividers
function groupByMonth(photos) {
  const map = new Map();
  photos.forEach(p => {
    const k = p.date.slice(0, 7); // YYYY-MM
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(p);
  });
  return Array.from(map.entries()).map(([k, items]) => ({ month: k, items }));
}

window.PhotosData = { PHOTOS, CAMERA, fetchPhotos, filterPhotos, allYears, allLocations, groupByMonth };
