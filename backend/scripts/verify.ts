#!/usr/bin/env bun

import path from "node:path";

import { checkBoundaryViolations } from "./boundary-check";

const REPO_ROOT = path.resolve(import.meta.dir, "../..");
const BACKEND_ROOT = path.resolve(import.meta.dir, "..");
const FRONTEND_ANALYZER = path.join(REPO_ROOT, "scripts", "frontend-analyzer.ts");
const FRONTEND_ANALYZER_OUTPUT = "/tmp/vinicius-dev-frontend-analyzer-be005.md";

async function runCommand(
  command: readonly string[],
  cwd: string,
  description: string,
): Promise<number> {
  console.log(description);
  const proc = Bun.spawn(command, {
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  });

  return await proc.exited;
}

async function runFrontendAnalyzer(): Promise<number> {
  return runCommand(
    ["bun", FRONTEND_ANALYZER, `--output=${FRONTEND_ANALYZER_OUTPUT}`],
    REPO_ROOT,
    `Running frontend analyzer to ${FRONTEND_ANALYZER_OUTPUT}`,
  );
}

export async function main(): Promise<number> {
  const violations = await checkBoundaryViolations();
  if (violations.length > 0) {
    console.error("Backend boundary check failed:");
    for (const violation of violations) {
      console.error(`- ${violation.file}: ${violation.importPath} (${violation.reason})`);
    }
    return 1;
  }

  console.log("Backend boundary check passed.");
  const persistenceExitCode = await runCommand(
    ["bun", "run", "prisma:check"],
    BACKEND_ROOT,
    "Running persistence verification",
  );
  if (persistenceExitCode !== 0) return persistenceExitCode;

  const analyzerExitCode = await runFrontendAnalyzer();
  if (analyzerExitCode !== 0) return analyzerExitCode;

  console.log("Backend verification passed.");
  return 0;
}

if (import.meta.main) {
  const exitCode = await main();
  process.exitCode = exitCode;
}
