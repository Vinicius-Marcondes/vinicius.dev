#!/usr/bin/env bun

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

type TaskInput = {
  repo: string;
  projectOwner: string;
  projectNumber: string;
  projectTitle?: string;
  taskId: string;
  specId: string;
  layer: string;
  title: string;
  body: string;
  status?: string;
  baseBranch: string;
  branchName: string;
  mergeTarget: string;
};

function sleep(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

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

function loadInput(): TaskInput {
  const inputPath = getArg("input");
  if (!inputPath) {
    throw new Error("Use --input=/path/to/task.json");
  }
  return JSON.parse(readFileSync(inputPath, "utf8")) as TaskInput;
}

function findField(
  fields: Record<string, unknown>[],
  fieldName: string,
): Record<string, unknown> | undefined {
  return fields.find((field) => String(field.name) === fieldName);
}

function main() {
  const input = loadInput();
  const tempDir = mkdtempSync(path.join(tmpdir(), "gh-task-create-"));
  const bodyPath = path.join(tempDir, "issue-body.md");

  writeFileSync(bodyPath, input.body, "utf8");
  const issueUrl = run([
    "issue",
    "create",
    "--repo",
    input.repo,
    "--title",
    input.title,
    "--body-file",
    bodyPath,
  ]);

  run([
    "project",
    "item-add",
    input.projectNumber,
    "--owner",
    input.projectOwner,
    "--url",
    issueUrl,
  ]);

  const projectViewRaw = run([
    "project",
    "view",
    input.projectNumber,
    "--owner",
    input.projectOwner,
    "--format",
    "json",
  ]);
  const projectView = parseJson<Record<string, unknown>>(projectViewRaw) ?? {};
  const projectId = String(projectView.id ?? "");

  const fieldListRaw = run([
    "project",
    "field-list",
    input.projectNumber,
    "--owner",
    input.projectOwner,
    "--format",
    "json",
  ]);
  const fields = normalizeArray(parseJson<unknown>(fieldListRaw));

  let item: Record<string, unknown> | undefined;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const itemListRaw = run([
      "project",
      "item-list",
      input.projectNumber,
      "--owner",
      input.projectOwner,
      "--format",
      "json",
    ]);
    const items = normalizeArray(parseJson<unknown>(itemListRaw));
    item = items.find((entry) => {
      const content = entry.content;
      if (!content || typeof content !== "object") return false;
      return String((content as Record<string, unknown>).url ?? "") === issueUrl;
    });
    if (item?.id) {
      break;
    }
    sleep(1000);
  }

  if (!projectId || !item?.id) {
    throw new Error("Issue was created, but project item metadata could not be resolved.");
  }

  const singleSelectValue = (fieldName: string, optionName: string) => {
    const field = findField(fields, fieldName);
    const options = Array.isArray(field?.options) ? (field?.options as Record<string, unknown>[]) : [];
    const option = options.find((entry) => String(entry.name) === optionName);
    return { fieldId: String(field?.id ?? ""), optionId: String(option?.id ?? "") };
  };

  const textValue = (fieldName: string, text: string) => {
    const field = findField(fields, fieldName);
    if (!field?.id) return;
    run([
      "project",
      "item-edit",
      "--id",
      String(item.id),
      "--project-id",
      projectId,
      "--field-id",
      String(field.id),
      "--text",
      text,
    ]);
  };

  const status = input.status ?? "Spec-ready";
  const statusMeta = singleSelectValue("Status", status);
  if (statusMeta.fieldId && statusMeta.optionId) {
    run([
      "project",
      "item-edit",
      "--id",
      String(item.id),
      "--project-id",
      projectId,
      "--field-id",
      statusMeta.fieldId,
      "--single-select-option-id",
      statusMeta.optionId,
    ]);
  }

  const layerMeta = singleSelectValue("Layer", input.layer);
  if (layerMeta.fieldId && layerMeta.optionId) {
    run([
      "project",
      "item-edit",
      "--id",
      String(item.id),
      "--project-id",
      projectId,
      "--field-id",
      layerMeta.fieldId,
      "--single-select-option-id",
      layerMeta.optionId,
    ]);
  }

  textValue("Task ID", input.taskId);
  textValue("Spec ID", input.specId);
  textValue("Base Branch", input.baseBranch);
  textValue("Branch Name", input.branchName);
  textValue("Merge Target", input.mergeTarget);

  rmSync(tempDir, { recursive: true, force: true });
  console.log(JSON.stringify({ issueUrl, projectNumber: input.projectNumber }, null, 2));
}

main();
