import type {
  AdminMfaChallengeRepositoryRow,
  AdminRepositoryPort,
  AdminSessionRepositoryRow,
  AdminUserRepositoryRow,
} from "@/modules/admin/ports/outbound";

import type { PrismaDatabaseClient } from "./prisma-client";

const notImplemented = <T>(method: string): Promise<T> => {
  return Promise.reject(new Error(`Prisma admin repository method not implemented: ${method}`));
};

export const createPrismaAdminRepository = (_client: PrismaDatabaseClient): AdminRepositoryPort => ({
  findAdminUserByEmail: (_email: string): Promise<AdminUserRepositoryRow | null> =>
    notImplemented("findAdminUserByEmail"),
  findAdminSessionByTokenHash: (_tokenHash: string): Promise<AdminSessionRepositoryRow | null> =>
    notImplemented("findAdminSessionByTokenHash"),
  findMfaChallengeById: (_challengeId: string): Promise<AdminMfaChallengeRepositoryRow | null> =>
    notImplemented("findMfaChallengeById"),
});
