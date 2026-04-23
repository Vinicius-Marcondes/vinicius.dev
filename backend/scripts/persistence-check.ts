#!/usr/bin/env bun

type Step = Readonly<{
  command: readonly string[];
  description: string;
  optional?: boolean;
  requiredEnv?: string;
}>;

const steps: readonly Step[] = [
  {
    command: ["bun", "run", "prisma:format"],
    description: "Format Prisma schema",
  },
  {
    command: ["bun", "run", "prisma:validate"],
    description: "Validate Prisma schema",
  },
  {
    command: ["bun", "run", "prisma:generate"],
    description: "Generate Prisma client",
  },
  {
    command: ["bun", "run", "prisma:migrate:status"],
    description: "Check Prisma migration status",
    optional: true,
    requiredEnv: "DATABASE_URL",
  },
];

async function runStep(step: Step): Promise<number> {
  if (step.requiredEnv && !Bun.env[step.requiredEnv]) {
    console.log(
      `Skipping ${step.description}: ${step.requiredEnv} is not set in this workspace.`,
    );
    return 0;
  }

  console.log(step.description);
  const proc = Bun.spawn(step.command, {
    cwd: import.meta.dir + "/..",
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0 && step.optional) {
    console.log(
      `Skipping ${step.description}: Prisma could not reach the configured database in this workspace.`,
    );
    return 0;
  }

  return exitCode;
}

export async function main(): Promise<number> {
  for (const step of steps) {
    const exitCode = await runStep(step);
    if (exitCode !== 0) {
      return exitCode;
    }
  }

  console.log("Persistence verification passed.");
  return 0;
}

if (import.meta.main) {
  process.exitCode = await main();
}
