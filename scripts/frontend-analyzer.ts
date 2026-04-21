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
  return files.find((file) => path.basename(file) === "package.json") ?? null;
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
    .filter((file) => /(^|\/)(components|ui|layouts)\//.test(file) && /\.(tsx|jsx|ts|js)$/.test(file))
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
  const codeFiles = pickCodeFiles(allFiles);
  const packagePath = findPackage(allFiles);
  const pkg = await loadPackage(packagePath);
  const frontendPresent = hasFrontendSignals(allFiles, pkg);
  const routes = summarizeRoutes(allFiles);
  const componentFiles = summarizeComponents(allFiles);

  const cssFiles = codeFiles.filter((file) => [".css", ".scss"].includes(path.extname(file)));
  const tokenFiles = await collectRegexMatches(cssFiles, /:root|--[a-z0-9-]+/i);
  const apiFiles = await collectRegexMatches(codeFiles, /fetch\s*\(|axios\.|\/api\/|\/api["'`)]/i);
  const authFiles = await collectRegexMatches(codeFiles, /\bauth\b|\blogin\b|\bsession\b|\bpassword\b|\bmfa\b/i);
  const uploadFiles = await collectRegexMatches(codeFiles, /FormData|type=["']file["']|upload|multipart/i);
  const contentFiles = await collectRegexMatches(
    codeFiles,
    /\bthoughts?\b|\bprojects?\b|\bphotos?\b|\bchat\b|\bstatus\b|\badmin\b/i,
  );

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
              klass: "missing-surface",
              notes: "Expected route not detected in current frontend files.",
              specAction: "review frontend-architecture.md and product-scope.md",
            },
      );
    }

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
      allFiles.some((file) => /bunfig\.toml$/.test(file)) ? "bunfig.toml detected" : null,
      allFiles.some((file) => /bun\.lockb$/.test(file)) ? "bun.lockb detected" : null,
    ].filter((value): value is string => Boolean(value)),
  );

  const report = `# Frontend Analyzer Report

## Repo State Summary
- Report status: current
- Generated at: ${new Date().toISOString()}
- Frontend presence: ${frontendPresent ? "detected" : "not detected"}

## Frontend Presence Result
${frontendPresent ? "Frontend-related files were detected and analyzed." : "Initial scan found no frontend implementation. Planned frontend specs remain authoritative until UI files are added."}

## Tooling and Runtime Detection
${toolingBits.length ? toolingBits.map((item) => `- ${item}`).join("\n") : "- No frontend tooling signals detected"}

## Route Inventory
${routes.length ? routes.map((route) => `- \`${route.route}\` -> \`${route.file}\``).join("\n") : "- None detected"}

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
