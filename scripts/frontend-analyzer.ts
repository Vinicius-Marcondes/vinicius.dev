#!/usr/bin/env bun

import { promises as fs } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
const outputPath = outputArg
  ? path.resolve(cwd, outputArg.slice("--output=".length))
  : path.resolve(cwd, "docs/specs/frontend-analyzer-report.md");

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "docs",
  "scripts",
  "dist",
  "build",
  ".next",
  ".turbo",
  "coverage",
]);

const EXPECTED_ROUTES = ["/", "/thoughts", "/projects", "/photos", "/chat", "/admin"];
const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".mdx", ".html"]);
const LEGACY_HTML_ROUTE_MAP: Record<string, string> = {
  "frontend/index.html": "/",
  "frontend/projects.html": "/projects",
  "frontend/photos.html": "/photos",
};
const FSD_PAGE_ROUTE_MAP: Array<[RegExp, string]> = [
  [/^frontend\/src\/pages\/home\//, "/"],
  [/^frontend\/src\/pages\/thoughts\//, "/thoughts"],
  [/^frontend\/src\/pages\/projects\//, "/projects"],
  [/^frontend\/src\/pages\/photos\//, "/photos"],
  [/^frontend\/src\/pages\/chat\//, "/chat"],
  [/^frontend\/src\/pages\/admin\//, "/admin"],
];

type PackageInfo = {
  name?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type RouteMatch = {
  route: string;
  file: string;
};

type SectionFinding = {
  area: string;
  klass: "matches-spec" | "adapt-spec" | "blocks-backend" | "missing-surface";
  notes: string;
  specAction: string;
};

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function safeRead(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

function rel(filePath: string): string {
  return path.relative(cwd, filePath) || ".";
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function findPackage(files: string[]): string | null {
  const packages = files.filter((file) => path.basename(file) === "package.json");
  return packages.find((file) => rel(file) === "frontend/package.json") ?? packages[0] ?? null;
}

async function loadPackage(packagePath: string | null): Promise<PackageInfo | null> {
  if (!packagePath) return null;
  try {
    const raw = await fs.readFile(packagePath, "utf8");
    return JSON.parse(raw) as PackageInfo;
  } catch {
    return null;
  }
}

function hasFrontendSignals(files: string[], pkg: PackageInfo | null): boolean {
  const packageDeps = {
    ...(pkg?.dependencies ?? {}),
    ...(pkg?.devDependencies ?? {}),
  };
  const depNames = Object.keys(packageDeps);

  const packageSignal = depNames.some((dep) =>
    ["react", "vite", "@vitejs/plugin-react", "next", "astro", "solid-js"].includes(dep),
  );

  const fileSignal = files.some((file) => {
    const rp = rel(file);
    return (
      rp === "index.html" ||
      rp.startsWith("frontend/") ||
      rp.startsWith("src/") ||
      rp.startsWith("app/") ||
      rp.startsWith("pages/") ||
      rp.startsWith("components/") ||
      rp.startsWith("routes/")
    );
  });

  return packageSignal || fileSignal;
}

function routeFromFile(relativePath: string): string | null {
  const normalized = relativePath.replace(/\\/g, "/");
  const fsdRoute = FSD_PAGE_ROUTE_MAP.find(([pattern]) => pattern.test(normalized));
  if (fsdRoute) {
    return fsdRoute[1];
  }
  if (LEGACY_HTML_ROUTE_MAP[normalized]) {
    return LEGACY_HTML_ROUTE_MAP[normalized];
  }
  const patterns = [
    /^src\/pages\/(.+)\.(tsx|jsx|ts|js|mdx)$/,
    /^src\/routes\/(.+)\.(tsx|jsx|ts|js|mdx)$/,
    /^pages\/(.+)\.(tsx|jsx|ts|js|mdx)$/,
    /^routes\/(.+)\.(tsx|jsx|ts|js|mdx)$/,
    /^app\/(.+)\.(tsx|jsx|ts|js|mdx)$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match) continue;
    let routePath = match[1];
    routePath = routePath.replace(/\/index$/i, "");
    routePath = routePath.replace(/^index$/i, "");
    routePath = routePath.replace(/\[(.+?)\]/g, ":$1");
    return routePath ? `/${routePath}` : "/";
  }

  return null;
}

function summarizeRoutes(files: string[]): RouteMatch[] {
  const routeMatches = files
    .map((file) => {
      const relativePath = rel(file);
      const route = routeFromFile(relativePath);
      return route ? { route, file: relativePath } : null;
    })
    .filter((value): value is RouteMatch => Boolean(value));

  return routeMatches.sort((a, b) => a.route.localeCompare(b.route));
}

function summarizeComponents(files: string[]): string[] {
  return files
    .map((file) => rel(file))
    .filter(
      (file) =>
        ((/(^|\/)(components|ui|layouts)\//.test(file) ||
          /^frontend\/src\/.+\/ui\//.test(file) ||
          /^frontend\/(landing|projects|photos)\//.test(file)) &&
          /\.(tsx|jsx|ts|js)$/.test(file)),
    )
    .sort();
}

function pickCodeFiles(files: string[]): string[] {
  return files.filter((file) => CODE_EXTENSIONS.has(path.extname(file)));
}

async function collectRegexMatches(files: string[], regex: RegExp, limit = 20): Promise<string[]> {
  const hits: string[] = [];
  for (const file of files) {
    const content = await safeRead(file);
    if (regex.test(content)) {
      hits.push(rel(file));
      if (hits.length >= limit) break;
    }
  }
  return hits;
}

async function main() {
  const allFiles = await walk(cwd);
  const legacySnapshotFiles = allFiles.filter((file) => rel(file).startsWith("frontend-legacy/"));
  const activeFiles = allFiles.filter((file) => !rel(file).startsWith("frontend-legacy/"));
  const codeFiles = pickCodeFiles(activeFiles);
  const packagePath = findPackage(activeFiles);
  const pkg = await loadPackage(packagePath);
  const frontendPresent = hasFrontendSignals(activeFiles, pkg);
  const routes = summarizeRoutes(activeFiles);
  const componentFiles = summarizeComponents(activeFiles);

  const cssFiles = codeFiles.filter((file) => [".css", ".scss"].includes(path.extname(file)));
  const tokenFiles = await collectRegexMatches(cssFiles, /:root|--[a-z0-9-]+/i);
  const apiFiles = await collectRegexMatches(codeFiles, /fetch\s*\(|axios\.|\/api\/|\/api["'`)]/i);
  const authFiles = await collectRegexMatches(codeFiles, /\bauth\b|\blogin\b|\bsession\b|\bpassword\b|\bmfa\b/i);
  const uploadFiles = await collectRegexMatches(codeFiles, /FormData|type=["']file["']|upload|multipart/i);
  const contentFiles = await collectRegexMatches(
    codeFiles,
    /\bthoughts?\b|\bprojects?\b|\bphotos?\b|\bchat\b|\bstatus\b|\badmin\b/i,
  );
  const reactImportFiles = await collectRegexMatches(codeFiles, /from\s+["']react["']|import\s+React/i);
  const reactHookFiles = await collectRegexMatches(codeFiles, /React\.useState|React\.useEffect|useState\(|useEffect\(/i);
  const reactDomFiles = await collectRegexMatches(codeFiles, /ReactDOM\.createRoot|createRoot\(/i);
  const browserBabelFiles = await collectRegexMatches(codeFiles, /@babel\/standalone|type=["']text\/babel["']/i);
  const cdnReactFiles = await collectRegexMatches(codeFiles, /unpkg\.com\/react|unpkg\.com\/react-dom|esm\.sh\/react/i);
  const windowExportFiles = await collectRegexMatches(codeFiles, /window\.[A-Z][A-Za-z0-9_]+\s*=/);
  const typescriptFiles = activeFiles
    .map((file) => rel(file))
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .sort();
  const htmlEntrypoints = activeFiles
    .map((file) => rel(file))
    .filter((file) => /^frontend\/.+\.html$/.test(file) || file === "frontend/index.html")
    .sort();
  const viteConfigFiles = activeFiles.map((file) => rel(file)).filter((file) => /(^|\/)vite\.config\./.test(file));
  const bunSignals = unique(
    activeFiles
      .map((file) => rel(file))
      .filter((file) => /(^|\/)bunfig\.toml$/.test(file) || /(^|\/)bun\.lockb?$/.test(file)),
  );
  const missingRoutes = EXPECTED_ROUTES.filter((expectedRoute) => !routes.some((route) => route.route === expectedRoute));
  const hasLegacyReactArchitecture = browserBabelFiles.length > 0 || cdnReactFiles.length > 0 || windowExportFiles.length > 0;
  const hasTypeScript = typescriptFiles.length > 0;
  const hasVite = viteConfigFiles.length > 0 || Boolean(pkg?.dependencies?.vite || pkg?.devDependencies?.vite);
  const hasBun = bunSignals.length > 0 || Boolean(pkg && /^bun@/.test(String((pkg as Record<string, unknown>).packageManager ?? "")));
  const migrationRecommendation = frontendPresent
    ? hasLegacyReactArchitecture || !hasTypeScript || !hasVite || !hasBun || missingRoutes.length > 0
      ? [
          "Archive current `frontend/` into a tracked legacy snapshot such as `frontend-legacy/`.",
          "Scaffold a clean `Vite + React + TypeScript + Bun` app.",
          "Migrate landing, projects, and photos into typed module-based React screens.",
          "Implement fully designed Thoughts, Chat Room, and Admin screens.",
          "Re-run the analyzer and keep backend tasking blocked until no migration blockers remain.",
        ]
      : ["No migration blockers detected. Current frontend is close to target architecture."]
    : ["No frontend present. Planned frontend specs remain authoritative."];

  const findings: SectionFinding[] = [];

  if (!frontendPresent) {
    findings.push({
      area: "Frontend presence",
      klass: "matches-spec",
      notes: "No frontend implementation detected. Planned frontend specs remain authoritative.",
      specAction: "none",
    });
  } else {
    for (const expectedRoute of EXPECTED_ROUTES) {
      const match = routes.find((route) => route.route === expectedRoute);
      findings.push(
        match
          ? {
              area: `Route ${expectedRoute}`,
              klass: "matches-spec",
              notes: `Detected in ${match.file}.`,
              specAction: "none",
            }
          : {
              area: `Route ${expectedRoute}`,
              klass: "blocks-backend",
              notes: "Expected planned screen is not present in current frontend files.",
              specAction: "create or migrate the missing screen before backend tasking",
            },
      );
    }

    findings.push({
      area: "React presence",
      klass: reactHookFiles.length > 0 || reactDomFiles.length > 0 || cdnReactFiles.length > 0 || reactImportFiles.length > 0
        ? "matches-spec"
        : "blocks-backend",
      notes:
        reactHookFiles.length > 0 || reactDomFiles.length > 0 || cdnReactFiles.length > 0 || reactImportFiles.length > 0
          ? "React usage was detected in the imported frontend."
          : "React usage was not detected clearly in the imported frontend.",
      specAction: reactHookFiles.length > 0 || reactDomFiles.length > 0 || cdnReactFiles.length > 0 || reactImportFiles.length > 0 ? "none" : "verify the frontend runtime before tasking",
    });

    findings.push({
      area: "Vite/Bun runtime",
      klass: hasVite && hasBun ? "matches-spec" : "blocks-backend",
      notes: hasVite && hasBun
        ? "Frontend shows Vite and Bun signals."
        : "Frontend is not yet aligned to the target Vite + Bun runtime.",
      specAction: hasVite && hasBun
        ? "none"
        : "scaffold a clean Vite + Bun frontend before backend tasking",
    });

    findings.push({
      area: "TypeScript readiness",
      klass: hasTypeScript ? "matches-spec" : "blocks-backend",
      notes: hasTypeScript
        ? `TypeScript source files detected in ${typescriptFiles.slice(0, 5).join(", ")}.`
        : "No TypeScript source files detected in the frontend.",
      specAction: hasTypeScript ? "none" : "migrate frontend source to TypeScript before backend tasking",
    });

    findings.push({
      area: "React architecture correctness",
      klass: hasLegacyReactArchitecture ? "blocks-backend" : "matches-spec",
      notes: hasLegacyReactArchitecture
        ? "Frontend uses browser Babel, CDN React, or global `window.*` component exports."
        : "Frontend appears to use module-based React rather than legacy global composition.",
      specAction: hasLegacyReactArchitecture
        ? "archive legacy frontend and migrate to typed module-based React"
        : "none",
    });

    findings.push({
      area: "Static multi-page entrypoints",
      klass: htmlEntrypoints.length > 1 ? "blocks-backend" : "matches-spec",
      notes: htmlEntrypoints.length > 1
        ? `Multiple static HTML entrypoints detected: ${htmlEntrypoints.join(", ")}.`
        : htmlEntrypoints.length === 1
          ? `Single app HTML entrypoint detected: ${htmlEntrypoints[0]}.`
          : "No static HTML entrypoints detected.",
      specAction: htmlEntrypoints.length > 1
        ? "replace static entrypoints with routed Vite React screens"
        : htmlEntrypoints.length === 1
          ? "none"
          : "none",
    });

    if (apiFiles.length > 0) {
      findings.push({
        area: "API assumptions",
        klass: "adapt-spec",
        notes: `Frontend contains API usage in ${apiFiles.slice(0, 5).join(", ")}.`,
        specAction: "reconcile backend-architecture.md and data-model.md",
      });
    }

    if (uploadFiles.length > 0) {
      findings.push({
        area: "Upload assumptions",
        klass: "adapt-spec",
        notes: `Upload-related UI hints found in ${uploadFiles.slice(0, 5).join(", ")}.`,
        specAction: "reconcile media-storage.md, backend-architecture.md, and admin-cms.md",
      });
    }
  }

  const toolingBits = unique(
    [
      packagePath ? `package manifest: ${rel(packagePath)}` : null,
      pkg?.dependencies?.react || pkg?.devDependencies?.react ? "react detected" : null,
      pkg?.dependencies?.vite || pkg?.devDependencies?.vite ? "vite detected" : null,
      reactHookFiles.length > 0 || reactDomFiles.length > 0 || cdnReactFiles.length > 0 ? "react runtime usage detected" : null,
      browserBabelFiles.length > 0 ? "browser Babel detected" : null,
      cdnReactFiles.length > 0 ? "CDN React detected" : null,
      bunSignals.length > 0 ? `bun signal detected: ${bunSignals.join(", ")}` : null,
      pkg && /^bun@/.test(String((pkg as Record<string, unknown>).packageManager ?? "")) ? "packageManager declares Bun" : null,
    ].filter((value): value is string => Boolean(value)),
  );

  const report = `# Frontend Analyzer Report

## Repo State Summary
- Report status: current
- Generated at: ${new Date().toISOString()}
- Frontend presence: ${frontendPresent ? "detected" : "not detected"}

## Frontend Presence Result
${frontendPresent ? "Frontend-related files were detected and analyzed." : "Initial scan found no frontend implementation. Planned frontend specs remain authoritative until UI files are added."}

## Legacy Snapshot
${legacySnapshotFiles.length ? `- Tracked legacy snapshot detected in \`frontend-legacy/\` with ${legacySnapshotFiles.length} files. It is treated as migration reference material, not active runtime code.` : "- No tracked legacy snapshot detected."}

## Tooling and Runtime Detection
${toolingBits.length ? toolingBits.map((item) => `- ${item}`).join("\n") : "- No frontend tooling signals detected"}

## Runtime and Migration Risk
- Target runtime: \`Vite + React + TypeScript + Bun\`
- Vite present: ${hasVite ? "yes" : "no"}
- Bun present: ${hasBun ? "yes" : "no"}
- TypeScript present: ${hasTypeScript ? "yes" : "no"}
- Browser Babel present: ${browserBabelFiles.length > 0 ? "yes" : "no"}
- CDN React present: ${cdnReactFiles.length > 0 ? "yes" : "no"}
- Global \`window.*\` exports present: ${windowExportFiles.length > 0 ? "yes" : "no"}

## React Usage Correctness
${reactImportFiles.length ? reactImportFiles.map((file) => `- module/import-based React signal in \`${file}\``).join("\n") : "- No React module import signals detected"}
${reactHookFiles.length ? reactHookFiles.map((file) => `\n- React hook usage in \`${file}\``).join("") : "\n- No React hook usage detected"}
${reactDomFiles.length ? reactDomFiles.map((file) => `\n- ReactDOM/createRoot usage in \`${file}\``).join("") : "\n- No createRoot usage detected"}
${browserBabelFiles.length ? browserBabelFiles.map((file) => `\n- browser Babel usage in \`${file}\``).join("") : "\n- No browser Babel usage detected"}
${windowExportFiles.length ? windowExportFiles.map((file) => `\n- global component export in \`${file}\``).join("") : "\n- No global component exports detected"}

## TypeScript Readiness
${typescriptFiles.length ? typescriptFiles.map((file) => `- \`${file}\``).join("\n") : "- No TypeScript files detected"}

## Route Inventory
${routes.length ? routes.map((route) => `- \`${route.route}\` -> \`${route.file}\``).join("\n") : "- None detected"}

## Route and Screen Completeness
- Expected planned routes: ${EXPECTED_ROUTES.map((route) => `\`${route}\``).join(", ")}
${missingRoutes.length ? `- Missing planned routes/screens: ${missingRoutes.map((route) => `\`${route}\``).join(", ")}` : "- All planned routes/screens are currently present"}

## Layout and Component Structure
${componentFiles.length ? componentFiles.slice(0, 20).map((file) => `- \`${file}\``).join("\n") : "- No component or layout files detected"}

## Design System Observations
${tokenFiles.length ? tokenFiles.map((file) => `- token or CSS variable signal in \`${file}\``).join("\n") : "- No token or CSS variable files detected"}

## API and Contract Assumptions
${apiFiles.length ? apiFiles.map((file) => `- API usage hint in \`${file}\``).join("\n") : "- No API usage hints detected"}
${authFiles.length ? authFiles.map((file) => `\n- auth/session hint in \`${file}\``).join("") : "\n- No auth/session hints detected"}
${uploadFiles.length ? uploadFiles.map((file) => `\n- upload/media hint in \`${file}\``).join("") : "\n- No upload/media hints detected"}
${contentFiles.length ? contentFiles.map((file) => `\n- content-domain hint in \`${file}\``).join("") : "\n- No content-domain hints detected"}

## Findings
| Area | Class | Notes | Spec Action |
| --- | --- | --- | --- |
${findings.map((finding) => `| ${finding.area} | ${finding.klass} | ${finding.notes} | ${finding.specAction} |`).join("\n")}

## Blocking Items
${findings.some((finding) => finding.klass === "blocks-backend" || finding.klass === "missing-surface")
    ? findings
        .filter((finding) => finding.klass === "blocks-backend" || finding.klass === "missing-surface")
        .map((finding) => `- ${finding.area}: ${finding.notes}`)
        .join("\n")
    : "- None detected in this pass"}

## Migration Recommendation
${migrationRecommendation.map((step) => `- ${step}`).join("\n")}

## Recommended Spec Updates
- Re-run this analyzer after any material frontend change.
- If findings include \`adapt-spec\`, update the cited specs before backend tasking.
- If findings include \`blocks-backend\` or \`missing-surface\`, resolve those gaps before marking backend-facing specs as \`Tasked\`.
`;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, report, "utf8");
  console.log(`Wrote analyzer report to ${rel(outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
