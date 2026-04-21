#!/usr/bin/env bun

import { spawnSync } from "node:child_process";

type FieldConfig = {
  name: string;
  dataType: "TEXT" | "SINGLE_SELECT";
  options?: string[];
};

const DEFAULT_FIELDS: FieldConfig[] = [
  {
    name: "Status",
    dataType: "SINGLE_SELECT",
    options: ["Spec-ready", "Todo", "In Progress", "In Review", "Done"],
  },
  { name: "Task ID", dataType: "TEXT" },
  { name: "Spec ID", dataType: "TEXT" },
  {
    name: "Layer",
    dataType: "SINGLE_SELECT",
    options: ["spec", "frontend", "backend", "data", "admin", "infra", "qa"],
  },
  { name: "Base Branch", dataType: "TEXT" },
  { name: "Branch Name", dataType: "TEXT" },
  { name: "Merge Target", dataType: "TEXT" },
  { name: "PR", dataType: "TEXT" },
  { name: "Blocked Reason", dataType: "TEXT" },
  { name: "Owner", dataType: "TEXT" },
];

const STATUS_FIELD_OPTIONS = [
  {
    name: "Spec-ready",
    color: "GRAY",
    description: "Task is approved and ready to enter the queue",
  },
  {
    name: "Todo",
    color: "BLUE",
    description: "Task is defined but not started",
  },
  {
    name: "In Progress",
    color: "YELLOW",
    description: "Task is actively being worked",
  },
  {
    name: "In Review",
    color: "PURPLE",
    description: "Task is awaiting review",
  },
  {
    name: "Done",
    color: "GREEN",
    description: "Task is complete",
  },
];

function getArg(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function run(args: string[], allowFailure = false): string {
  const result = spawnSync("gh", args, { encoding: "utf8" });
  if (result.status !== 0 && !allowFailure) {
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

function graphql(args: string[]): string {
  return run(["api", "graphql", ...args]);
}

function normalizeArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
  }
  if (value && typeof value === "object") {
    const entries = Object.values(value as Record<string, unknown>);
    for (const entry of entries) {
      if (Array.isArray(entry)) {
        return entry.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
      }
    }
  }
  return [];
}

function hasProjectScope(owner: string): boolean {
  const result = spawnSync("gh", ["project", "list", "--owner", owner], { encoding: "utf8" });
  return result.status === 0;
}

function main() {
  const owner = getArg("owner", "Vinicius-Marcondes");
  const repo = getArg("repo", "Vinicius-Marcondes/vinicius.dev");
  const title = getArg("title", "vinicius.dev");

  if (!owner || !repo || !title) {
    throw new Error("owner, repo, and title are required");
  }

  if (!hasProjectScope(owner)) {
    throw new Error(
      "GitHub Project access is not available. Run `gh auth refresh -s project` and retry.",
    );
  }

  const projectListRaw = run(["project", "list", "--owner", owner, "--format", "json"]);
  const projects = normalizeArray(parseJson<unknown>(projectListRaw));
  let project = projects.find((item) => item.title === title);

  if (!project) {
    const createdRaw = run(["project", "create", "--owner", owner, "--title", title, "--format", "json"]);
    project = parseJson<Record<string, unknown>>(createdRaw) ?? undefined;
  }

  if (!project) {
    throw new Error("Failed to locate or create the GitHub Project.");
  }

  const projectNumber = String(project.number);
  const projectUrl = String(project.url ?? "");

  run(["project", "link", projectNumber, "--owner", owner, "--repo", repo], true);

  const fieldListRaw = run(["project", "field-list", projectNumber, "--owner", owner, "--format", "json"]);
  const existingFields = normalizeArray(parseJson<unknown>(fieldListRaw));
  const existingNames = new Set(existingFields.map((field) => String(field.name)));

  for (const field of DEFAULT_FIELDS) {
    if (existingNames.has(field.name)) continue;
    const args = [
      "project",
      "field-create",
      projectNumber,
      "--owner",
      owner,
      "--name",
      field.name,
      "--data-type",
      field.dataType,
    ];
    if (field.dataType === "SINGLE_SELECT" && field.options?.length) {
      args.push("--single-select-options", field.options.join(","));
    }
    run(args);
  }

  const statusField = existingFields.find((field) => String(field.name) === "Status");
  if (statusField?.id) {
    const args = [
      "-f",
      "query=mutation($field:ID!, $options:[ProjectV2SingleSelectFieldOptionInput!]) { updateProjectV2Field(input:{fieldId:$field, singleSelectOptions:$options}) { projectV2Field { ... on ProjectV2SingleSelectField { id name options { id name } } } } }",
      "-f",
      `field=${String(statusField.id)}`,
    ];

    for (const option of STATUS_FIELD_OPTIONS) {
      args.push("-F", `options[][name]=${option.name}`);
      args.push("-F", `options[][color]=${option.color}`);
      args.push("-F", `options[][description]=${option.description}`);
    }

    graphql(args);
  }

  console.log(JSON.stringify({ owner, repo, title, projectNumber, projectUrl }, null, 2));
}

main();
