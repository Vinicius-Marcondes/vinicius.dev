#!/usr/bin/env bun

const seedManifest = {
  entries: 0,
  mode: "baseline-noop",
  note: "DATA-005 provides a deterministic seed entrypoint before product fixtures exist.",
};

if (import.meta.main) {
  console.log("Prisma seed baseline");
  console.log(JSON.stringify(seedManifest, null, 2));
}

export default seedManifest;
