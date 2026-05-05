import { describe, expect, it } from "bun:test";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { checkBoundaryViolations } from "./boundary-check";

async function makeTempBackend(files: Record<string, string>): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "vinicius-dev-be-boundary-"));
  await fs.mkdir(path.join(root, "src", "modules"), { recursive: true });

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, "utf8");
  }

  return root;
}

describe("backend boundary check", () => {
  it("passes when no core modules exist yet", async () => {
    const root = await makeTempBackend({
      "src/bootstrap/server.ts": "export {};\n",
    });

    await expect(checkBoundaryViolations(root)).resolves.toEqual([]);
  });

  it("flags forbidden core-module imports", async () => {
    const root = await makeTempBackend({
      "src/modules/content/application/use-case.ts": [
        'import { Hono } from "hono";',
        'import { PrismaClient } from "@prisma/client";',
        'import { readFile } from "node:fs/promises";',
        'import { repo } from "@/adapters/outbound/persistence/prisma";',
        "",
      ].join("\n"),
    });

    await expect(checkBoundaryViolations(root)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ importPath: "hono", reason: "Hono framework" }),
        expect.objectContaining({ importPath: "@prisma/client", reason: "Prisma" }),
        expect.objectContaining({ importPath: "node:fs/promises", reason: "filesystem" }),
        expect.objectContaining({ importPath: "@/adapters/outbound/persistence/prisma", reason: "provider adapter" }),
      ]),
    );
  });
});
