import type { PrismaClient } from "../../../../../generated/prisma/client";

export const createPrismaClient = (): PrismaDatabaseClient => ({} as PrismaDatabaseClient);

export type PrismaDatabaseClient = PrismaClient;
