// Backend-ready projects data module.
//
// Today: static array + in-memory filter/sort.
// Future: swap `fetchProjects()` to hit /api/projects. The shape below is the
// API contract — keep it stable.
//
// Project shape:
//   id         string, stable slug (also used for URL / anchor)
//   channel    zero-padded string, "01".."99"
//   title      string
//   year       number
//   status     "live" | "archived" | "in-progress"
//   description string, 1-2 sentences
//   tags       string[], tech stack (for filter)
//   links      { site?: string, github?: string }
//   thumbnail  { kind: "noise"|"bars"|"grid"|"sig", hue?: "pink"|"cyan"|"amber" }
//              (for now we draw placeholders client-side; later this becomes a URL)

const PROJECTS = [
  {
    id: "bsky-feed-03",
    channel: "03",
    title: "bsky.feed",
    year: 2026,
    status: "in-progress",
    description: "at-proto feed client with custom handle auth & a readable timeline. late-night weekend build.",
    tags: ["typescript", "at-proto", "react"],
    links: { site: null, github: "#" },
    thumbnail: { kind: "bars", hue: "pink" },
  },
  {
    id: "crt-shader-kit",
    channel: "07",
    title: "crt.shader",
    year: 2025,
    status: "live",
    description: "a tiny webgl shader kit: scanlines, mask, bloom, chromatic aberration. drop-in on any canvas.",
    tags: ["webgl", "glsl", "typescript"],
    links: { site: "#", github: "#" },
    thumbnail: { kind: "grid", hue: "cyan" },
  },
  {
    id: "portra-log",
    channel: "12",
    title: "portra.log",
    year: 2024,
    status: "live",
    description: "a film photo journal — scan, dust, stamp, publish. every entry dated by roll, not by week.",
    tags: ["next.js", "sqlite", "photography"],
    links: { site: "#", github: null },
    thumbnail: { kind: "noise", hue: "amber" },
  },
  {
    id: "tape-deck",
    channel: "15",
    title: "tape.deck",
    year: 2024,
    status: "archived",
    description: "offline-first music library with cassette-style metadata. ran for a year. rotation.",
    tags: ["rust", "tauri", "sqlite"],
    links: { site: null, github: "#" },
    thumbnail: { kind: "sig", hue: "pink" },
  },
  {
    id: "handle-dns",
    channel: "18",
    title: "handle.dns",
    year: 2023,
    status: "live",
    description: "at-proto handle verifier over dns-txt. ~60 lines of go, deploys as one binary. still running.",
    tags: ["go", "dns", "at-proto"],
    links: { site: "#", github: "#" },
    thumbnail: { kind: "grid", hue: "cyan" },
  },
  {
    id: "dithermill",
    channel: "22",
    title: "dithermill",
    year: 2023,
    status: "live",
    description: "browser-side image dithering — bayer, floyd-steinberg, atkinson. exports png with a palette lock.",
    tags: ["typescript", "canvas", "image"],
    links: { site: "#", github: "#" },
    thumbnail: { kind: "noise", hue: "cyan" },
  },
  {
    id: "chyron-sh",
    channel: "26",
    title: "chyron.sh",
    year: 2022,
    status: "archived",
    description: "cli that turns git commit streams into broadcast-chyron gif loops for socials. a joke that shipped.",
    tags: ["bash", "ffmpeg", "cli"],
    links: { site: null, github: "#" },
    thumbnail: { kind: "bars", hue: "amber" },
  },
  {
    id: "sunset-parser",
    channel: "31",
    title: "sunset.parser",
    year: 2022,
    status: "archived",
    description: "pure-js css gradient parser written to learn recursive descent. deprecated; don't use it.",
    tags: ["javascript", "parser"],
    links: { site: null, github: "#" },
    thumbnail: { kind: "sig", hue: "amber" },
  },
  {
    id: "latenite-bot",
    channel: "34",
    title: "latenite.bot",
    year: 2021,
    status: "archived",
    description: "discord bot that ran a community listening-party. retired when the server closed.",
    tags: ["python", "discord"],
    links: { site: null, github: "#" },
    thumbnail: { kind: "noise", hue: "pink" },
  },
  {
    id: "v-dev",
    channel: "99",
    title: "vinicius.dev",
    year: 2026,
    status: "in-progress",
    description: "this site. html/css/js, no tracking. ch.99 is where the pirate broadcasts live.",
    tags: ["html", "css", "vanilla-js"],
    links: { site: "#", github: "#" },
    thumbnail: { kind: "bars", hue: "cyan" },
  },
  {
    id: "pixel-glyph",
    channel: "42",
    title: "pixel.glyph",
    year: 2025,
    status: "live",
    description: "a 5x7 bitmap font packaged as a webfont, with a tiny kerning table. used across this site.",
    tags: ["fonts", "typescript", "type-design"],
    links: { site: "#", github: "#" },
    thumbnail: { kind: "grid", hue: "pink" },
  },
  {
    id: "feed-heartbeat",
    channel: "51",
    title: "feed.heartbeat",
    year: 2024,
    status: "archived",
    description: "uptime monitor that posts a single heartbeat per minute. died when the vps did, fittingly.",
    tags: ["go", "ops"],
    links: { site: null, github: "#" },
    thumbnail: { kind: "sig", hue: "cyan" },
  },
];

// Swap this to fetch() later.
async function fetchProjects() {
  // Simulate async so the consumer doesn't need to change when we flip to API.
  return new Promise(r => setTimeout(() => r(PROJECTS), 0));
}

function filterAndSort(projects, { query, status, tag, sort }) {
  let out = projects.slice();
  if (status && status !== "all") out = out.filter(p => p.status === status);
  if (tag && tag !== "all")       out = out.filter(p => p.tags.includes(tag));
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    out = out.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.channel.includes(q)
    );
  }
  if (sort === "alpha")    out.sort((a,b) => a.title.localeCompare(b.title));
  else if (sort === "channel") out.sort((a,b) => Number(a.channel) - Number(b.channel));
  else /* recent */        out.sort((a,b) => b.year - a.year);
  return out;
}

function allTags(projects) {
  const s = new Set();
  projects.forEach(p => p.tags.forEach(t => s.add(t)));
  return Array.from(s).sort();
}

window.ProjectsData = { PROJECTS, fetchProjects, filterAndSort, allTags };
