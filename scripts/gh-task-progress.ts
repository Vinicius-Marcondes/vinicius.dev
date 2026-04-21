#!/usr/bin/env bun

import { spawnSync } from "node:child_process";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

function run(args: string[]): string {
  const result = spawnSync("gh", args, { encoding: "utf8" });
  if (result.status !== 0) {
    const stderr = result.stderr.trim();
    const stdout = result.stdout.trim();
    throw new Error(stderr || stdout || `gh ${args.join(" ")} failed`);
  }
  return result.stdout.trim();
}

function parseJson<T>(raw: string): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
  }
  if (value && typeof value === "object") {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      if (Array.isArray(nested)) {
        return nested.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
      }
    }
  }
  return [];
}

function main() {
  const repo = getArg("repo") ?? "Vinicius-Marcondes/vinicius.dev";
  const issue = getArg("issue");
  const body = getArg("body");
  const projectOwner = getArg("project-owner");
  const projectNumber = getArg("project-number");
  const status = getArg("status");

  if (!issue || !body) {
    throw new Error("Use --issue=<number-or-url> and --body=<comment>");
  }

  run(["issue", "comment", issue, "--repo", repo, "--body", body]);

  if (!projectOwner || !projectNumber || !status) {
    return;
  }

  const projectViewRaw = run([
    "project",
    "view",
    projectNumber,
    "--owner",
    projectOwner,
    "--format",
    "json",
  ]);
  const projectView = parseJson<Record<string, unknown>>(projectViewRaw) ?? {};
  const projectId = String(projectView.id ?? "");

  const fieldListRaw = run([
    "project",
    "field-list",
    projectNumber,
    "--owner",
    projectOwner,
    "--format",
    "json",
  ]);
  const fields = normalizeArray(parseJson<unknown>(fieldListRaw));
  const statusField = fields.find((field) => String(field.name) === "Status");
  const options = Array.isArray(statusField?.options) ? (statusField?.options as Record<string, unknown>[]) : [];
  const selected = options.find((option) => String(option.name) === status);

  const itemListRaw = run([
    "project",
    "item-list",
    projectNumber,
    "--owner",
    projectOwner,
    "--format",
    "json",
  ]);
  const items = normalizeArray(parseJson<unknown>(itemListRaw));
  const issueToken = issue.includes("http") ? issue : `/${repo}/issues/${issue}`;
  const item = items.find((entry) => {
    const content = entry.content;
    if (!content || typeof content !== "object") return false;
    const url = String((content as Record<string, unknown>).url ?? "");
    return url.endsWith(issueToken);
  });

  if (!projectId || !statusField?.id || !selected?.id || !item?.id) {
    throw new Error("Issue comment succeeded, but Project status metadata could not be resolved.");
  }

  run([
    "project",
    "item-edit",
    "--id",
    String(item.id),
    "--project-id",
    projectId,
    "--field-id",
    String(statusField.id),
    "--single-select-option-id",
    String(selected.id),
  ]);
}

main();

