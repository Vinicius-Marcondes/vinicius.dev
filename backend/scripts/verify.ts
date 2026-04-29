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

async function runMediaVerification(): Promise<number> {
  return runCommand(
    ["bun", "run", "verify:media"],
    BACKEND_ROOT,
    "Running media verification",
  );
}

async function runPublicSurfaceVerification(): Promise<number> {
  return runCommand(
    [
      "bun",
      "test",
      "src/bootstrap/server.test.ts",
      "src/adapters/inbound/http/hono/thoughts-routes.test.ts",
      "src/adapters/inbound/http/hono/projects-routes.test.ts",
      "src/adapters/inbound/http/hono/photos-routes.test.ts",
      "src/adapters/inbound/http/hono/status-strip-routes.test.ts",
      "src/adapters/inbound/http/hono/rss-routes.test.ts",
      "src/adapters/inbound/http/hono/sitemap-routes.test.ts",
      "src/adapters/inbound/http/hono/photo-media-routes.test.ts",
    ],
    BACKEND_ROOT,
    "Running public routes/content verification",
  );
}

async function runAdminAuthChatMediaVerification(): Promise<number> {
  return runCommand(
    [
      "bun",
      "test",
      "src/adapters/inbound/http/hono/auth-routes.test.ts",
      "src/adapters/inbound/http/hono/admin-routes.test.ts",
      "src/adapters/inbound/http/hono/chat-routes.test.ts",
      "src/adapters/inbound/http/hono/chat-media-routes.test.ts",
      "src/adapters/inbound/http/hono/photo-media-routes.test.ts",
    ],
    BACKEND_ROOT,
    "Running admin/auth/chat/media integration verification",
  );
}

async function runDeployReadinessVerification(): Promise<number> {
  return runCommand(
    [
      "bash",
      "-lc",
      [
        "set -euo pipefail",
        "test -f .github/workflows/production-deploy.yml",
        "test -f .github/workflows/branch-validation.yml",
        "test -f infra/caddy/Caddyfile",
        "test -f docker-compose.yml",
        "grep -F 'tags:' .github/workflows/production-deploy.yml",
        "grep -F 'v*' .github/workflows/production-deploy.yml",
        "grep -F 'branches:' .github/workflows/branch-validation.yml",
        "grep -F 'develop' .github/workflows/branch-validation.yml",
        "grep -F 'main' .github/workflows/branch-validation.yml",
        "grep -F 'handle /api/*' infra/caddy/Caddyfile",
        "grep -F 'handle /media/photos/*/original' infra/caddy/Caddyfile",
      ].join(" && "),
    ],
    REPO_ROOT,
    "Running deploy/readiness verification checks",
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

  const mediaVerificationExitCode = await runMediaVerification();
  if (mediaVerificationExitCode !== 0) return mediaVerificationExitCode;

  const publicSurfaceVerificationExitCode = await runPublicSurfaceVerification();
  if (publicSurfaceVerificationExitCode !== 0) return publicSurfaceVerificationExitCode;

  const adminAuthChatMediaVerificationExitCode = await runAdminAuthChatMediaVerification();
  if (adminAuthChatMediaVerificationExitCode !== 0) return adminAuthChatMediaVerificationExitCode;

  const deployReadinessVerificationExitCode = await runDeployReadinessVerification();
  if (deployReadinessVerificationExitCode !== 0) return deployReadinessVerificationExitCode;

  const analyzerExitCode = await runFrontendAnalyzer();
  if (analyzerExitCode !== 0) return analyzerExitCode;

  console.log("Backend verification passed.");
  return 0;
}

if (import.meta.main) {
  const exitCode = await main();
  process.exitCode = exitCode;
}
