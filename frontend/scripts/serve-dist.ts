import path from "node:path";
import { stat } from "node:fs/promises";

const DIST_ROOT = path.resolve(import.meta.dir, "..", "dist");
const DIST_ROOT_PREFIX = `${DIST_ROOT}${path.sep}`;
const INDEX_FILE = Bun.file(path.join(DIST_ROOT, "index.html"));
const PORT = Number.parseInt(process.env.FRONTEND_PORT ?? "5173", 10);

function resolvePathFromRequest(pathname: string): string | null {
  let decodedPath = pathname;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const normalizedPath = path.normalize(`.${decodedPath}`);
  const resolvedPath = path.resolve(DIST_ROOT, normalizedPath);

  if (resolvedPath !== DIST_ROOT && !resolvedPath.startsWith(DIST_ROOT_PREFIX)) {
    return null;
  }

  return resolvedPath;
}

async function isFile(filePath: string): Promise<boolean> {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

Bun.serve({
  hostname: "0.0.0.0",
  port: Number.isFinite(PORT) ? PORT : 5173,
  async fetch(request) {
    const requestUrl = new URL(request.url);
    const resolvedPath = resolvePathFromRequest(requestUrl.pathname);

    if (resolvedPath) {
      const nestedIndexPath = path.join(resolvedPath, "index.html");
      if (await isFile(nestedIndexPath)) {
        return new Response(Bun.file(nestedIndexPath));
      }

      if (await isFile(resolvedPath)) {
        return new Response(Bun.file(resolvedPath));
      }
    }

    return new Response(INDEX_FILE);
  },
});
