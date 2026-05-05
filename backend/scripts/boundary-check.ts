#!/usr/bin/env bun

import { promises as fs } from "node:fs";
import path from "node:path";

type BoundaryViolation = {
  file: string;
  importPath: string;
  reason: string;
};

const BACKEND_ROOT = path.resolve(import.meta.dir, "..");
const SOURCE_ROOT = path.join(BACKEND_ROOT, "src");
const MODULES_ROOT = path.join(SOURCE_ROOT, "modules");
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

function toPosix(value: string): string {
  return value.replaceAll("\\", "/");
}

async function exists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function readText(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf8");
}

function extractImportSpecifiers(source: string): string[] {
  const specifiers = new Set<string>();
  const patterns = [
    /(?:^|\n)\s*import(?:\s+type)?(?:[\s\S]*?\sfrom\s*)?["']([^"']+)["']/g,
    /(?:^|\n)\s*export(?:\s+type)?(?:[\s\S]*?\sfrom\s*)?["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      specifiers.add(match[1]);
    }
  }

  return [...specifiers];
}

function classifyImport(importPath: string, filePath: string): string | null {
  const normalized = toPosix(importPath);
  const importerDir = path.dirname(filePath);

  if (
    normalized === "hono" ||
    normalized.startsWith("hono/") ||
    normalized.includes("/hono/")
  ) {
    return "Hono framework";
  }

  if (
    normalized === "@prisma/client" ||
    normalized.startsWith("@prisma/client/") ||
    normalized.includes("/prisma/") ||
    normalized === "prisma"
  ) {
    return "Prisma";
  }

  if (
    normalized === "fs" ||
    normalized === "fs/promises" ||
    normalized === "node:fs" ||
    normalized === "node:fs/promises" ||
    normalized.startsWith("node:fs/") ||
    normalized.startsWith("fs/")
  ) {
    return "filesystem";
  }

  const adapterPatterns = [
    /(^|\/)adapters(\/|$)/,
    /(^|\/)bootstrap(\/|$)/,
  ];

  if (normalized.startsWith("@/")) {
    const mapped = path.resolve(SOURCE_ROOT, normalized.slice(2));
    const mappedRelative = toPosix(path.relative(SOURCE_ROOT, mapped));
    if (adapterPatterns.some((pattern) => pattern.test(mappedRelative))) {
      return "provider adapter";
    }
  }

  if (normalized.startsWith(".")) {
    const resolved = path.resolve(importerDir, normalized);
    const resolvedRelative = toPosix(path.relative(SOURCE_ROOT, resolved));
    if (adapterPatterns.some((pattern) => pattern.test(resolvedRelative))) {
      return "provider adapter";
    }
  }

  if (normalized.includes("/adapters/") || normalized.includes("/bootstrap/")) {
    return "provider adapter";
  }

  return null;
}

export async function checkBoundaryViolations(rootDir = BACKEND_ROOT): Promise<BoundaryViolation[]> {
  const modulesDir = path.join(rootDir, "src", "modules");
  if (!(await exists(modulesDir))) return [];

  const sourceFiles = (await walk(modulesDir)).filter((file) => !/\.(test|spec)\.[tj]sx?$/.test(file));
  const violations: BoundaryViolation[] = [];

  for (const filePath of sourceFiles) {
    const source = await readText(filePath);
    const imports = extractImportSpecifiers(source);

    for (const importPath of imports) {
      const reason = classifyImport(importPath, filePath);
      if (!reason) continue;

      violations.push({
        file: toPosix(path.relative(rootDir, filePath)),
        importPath,
        reason,
      });
    }
  }

  return violations;
}

export async function main(): Promise<number> {
  const violations = await checkBoundaryViolations();

  if (violations.length === 0) {
    console.log("Boundary check passed: no forbidden imports found in backend core modules.");
    return 0;
  }

  console.error("Boundary check failed:");
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.importPath} (${violation.reason})`);
  }

  return 1;
}

if (import.meta.main) {
  const exitCode = await main();
  process.exitCode = exitCode;
}
