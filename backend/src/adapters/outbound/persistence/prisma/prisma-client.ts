import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../../../generated/prisma/client";

const fallbackDatabaseUrl = "postgresql://localhost:5432/postgres";

export const createPrismaClient = (): PrismaDatabaseClient => {
  const adapter = new PrismaPg({
    connectionString: process.env["DATABASE_URL"] ?? fallbackDatabaseUrl,
  });

  return new PrismaClient({ adapter });
};

export type PrismaDatabaseClient = PrismaClient;
