import type {
  AdminDashboardSummaryRepositoryRow,
  AdminMfaChallengeRepositoryRow,
  AdminPhotoCurationListPage,
  AdminPhotoCurationListQuery,
  AdminPhotoCurationRow,
  AdminProjectCurationListPage,
  AdminProjectCurationListQuery,
  AdminProjectCurationRow,
  AdminRepositoryPort,
  AdminSessionRepositoryRow,
  AdminStatusStripEntryRepositoryRow,
  AdminThoughtCurationListPage,
  AdminThoughtCurationListQuery,
  AdminThoughtCurationRow,
  AdminUserRepositoryRow,
  ReplaceAdminStatusStripEntryInput,
  UpdateAdminPhotoCurationCommand,
  UpdateAdminPhotoMetadataCommand,
  UpdateAdminProjectCurationCommand,
  UpdateAdminThoughtCurationCommand,
} from "@/modules/admin/ports/outbound";
import {
  AdminMfaChallengeStatus,
  AdminSessionStatus,
  PhotoStatus,
  ProjectStatus,
  ThoughtStatus,
} from "../../../../../generated/prisma/client";

import type { PrismaDatabaseClient } from "./prisma-client";

const mapProjectStatusFromPrisma = (
  status: ProjectStatus,
): "live" | "archived" | "in-progress" => {
  if (status === ProjectStatus.in_progress) {
    return "in-progress";
  }

  return status;
};

const mapProjectStatusToPrisma = (
  status: "live" | "archived" | "in-progress" | undefined,
): ProjectStatus | undefined => {
  if (!status) {
    return undefined;
  }

  if (status === "in-progress") {
    return ProjectStatus.in_progress;
  }

  return status;
};

const mapAdminUserRow = (row: {
  id: string;
  email: string;
  passwordHash: string;
  passwordHashAlgorithm: string;
  passwordHashParams: unknown | null;
  createdAt: Date;
  updatedAt: Date;
}): AdminUserRepositoryRow => ({
  createdAt: row.createdAt,
  email: row.email,
  id: row.id,
  passwordHash: row.passwordHash,
  passwordHashAlgorithm: row.passwordHashAlgorithm,
  passwordHashParams: row.passwordHashParams,
  updatedAt: row.updatedAt,
});

const mapAdminSessionRow = (row: {
  id: string;
  adminUserId: string;
  tokenHash: string;
  status: AdminSessionStatus;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  adminUser: {
    email: string;
  };
}): AdminSessionRepositoryRow => ({
  adminEmail: row.adminUser.email,
  adminUserId: row.adminUserId,
  createdAt: row.createdAt,
  expiresAt: row.expiresAt,
  id: row.id,
  issuedAt: row.issuedAt,
  lastSeenAt: row.lastSeenAt,
  revokedAt: row.revokedAt,
  status: row.status,
  tokenHash: row.tokenHash,
  updatedAt: row.updatedAt,
});

const mapAdminMfaChallengeRow = (row: {
  id: string;
  adminUserId: string;
  codeHash: string;
  status: AdminMfaChallengeStatus;
  sentAt: Date;
  expiresAt: Date;
  verifiedAt: Date | null;
  canceledAt: Date | null;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  adminUser: {
    email: string;
  };
}): AdminMfaChallengeRepositoryRow => ({
  adminEmail: row.adminUser.email,
  adminUserId: row.adminUserId,
  attempts: row.attempts,
  canceledAt: row.canceledAt,
  codeHash: row.codeHash,
  createdAt: row.createdAt,
  expiresAt: row.expiresAt,
  id: row.id,
  sentAt: row.sentAt,
  status: row.status,
  updatedAt: row.updatedAt,
  verifiedAt: row.verifiedAt,
});

const mapThoughtCurationRow = (row: {
  id: string;
  title: string;
  slug: string;
  type: "essay" | "note";
  status: ThoughtStatus;
  featured: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
}): AdminThoughtCurationRow => ({
  featured: row.featured,
  id: row.id,
  publishedAt: row.publishedAt,
  slug: row.slug,
  status: row.status,
  title: row.title,
  type: row.type,
  updatedAt: row.updatedAt,
});

const mapProjectCurationRow = (row: {
  id: string;
  channel: string;
  title: string;
  slug: string;
  year: number;
  status: ProjectStatus;
  featured: boolean;
  updatedAt: Date;
}): AdminProjectCurationRow => ({
  channel: row.channel,
  featured: row.featured,
  id: row.id,
  slug: row.slug,
  status: mapProjectStatusFromPrisma(row.status),
  title: row.title,
  updatedAt: row.updatedAt,
  year: row.year,
});

const mapPhotoCurationRow = (row: {
  id: string;
  frame: string;
  title: string;
  date: Date;
  location: string;
  status: PhotoStatus;
  featured: boolean;
  tone: "amber" | "cyan" | "mono" | "sunset" | "violet";
  caption: string | null;
  camera: string | null;
  film: string | null;
  tags: string[];
  updatedAt: Date;
}): AdminPhotoCurationRow => ({
  camera: row.camera,
  caption: row.caption,
  date: row.date,
  featured: row.featured,
  film: row.film,
  frame: row.frame,
  id: row.id,
  location: row.location,
  status: row.status,
  tags: [...row.tags],
  title: row.title,
  tone: row.tone,
  updatedAt: row.updatedAt,
});

const mapStatusStripEntryRow = (row: {
  id: string;
  label: string;
  value: string;
  accent: "amber" | "cyan" | "pink" | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): AdminStatusStripEntryRepositoryRow => ({
  accent: row.accent,
  createdAt: row.createdAt,
  displayOrder: row.displayOrder,
  id: row.id,
  label: row.label,
  updatedAt: row.updatedAt,
  value: row.value,
});

const paginate = <TRow>(rows: readonly TRow[], page: number, pageSize: number) => {
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (page - 1) * pageSize;

  return {
    items: rows.slice(startIndex, startIndex + pageSize),
    page,
    pageSize,
    totalItems,
    totalPages,
  };
};

const mapThoughtList = (
  rows: readonly ReturnType<typeof mapThoughtCurationRow>[],
  query: AdminThoughtCurationListQuery,
): AdminThoughtCurationListPage => {
  const search = query.search?.toLowerCase();
  const filtered = rows.filter((row) => {
    if (query.status && row.status !== query.status) {
      return false;
    }

    if (typeof query.featured === "boolean" && row.featured !== query.featured) {
      return false;
    }

    if (query.type && row.type !== query.type) {
      return false;
    }

    if (!search) {
      return true;
    }

    return (
      row.title.toLowerCase().includes(search) ||
      row.slug.toLowerCase().includes(search)
    );
  });

  return paginate(filtered, query.page, query.pageSize);
};

const mapProjectList = (
  rows: readonly ReturnType<typeof mapProjectCurationRow>[],
  query: AdminProjectCurationListQuery,
): AdminProjectCurationListPage => {
  const search = query.search?.toLowerCase();
  const filtered = rows.filter((row) => {
    if (query.status && row.status !== query.status) {
      return false;
    }

    if (typeof query.featured === "boolean" && row.featured !== query.featured) {
      return false;
    }

    if (!search) {
      return true;
    }

    return (
      row.title.toLowerCase().includes(search) ||
      row.slug.toLowerCase().includes(search) ||
      row.channel.toLowerCase().includes(search)
    );
  });

  return paginate(filtered, query.page, query.pageSize);
};

const mapPhotoList = (
  rows: readonly ReturnType<typeof mapPhotoCurationRow>[],
  query: AdminPhotoCurationListQuery,
): AdminPhotoCurationListPage => {
  const search = query.search?.toLowerCase();
  const filtered = rows.filter((row) => {
    if (query.status && row.status !== query.status) {
      return false;
    }

    if (typeof query.featured === "boolean" && row.featured !== query.featured) {
      return false;
    }

    if (query.year && row.date.getUTCFullYear() !== query.year) {
      return false;
    }

    if (query.location && row.location !== query.location) {
      return false;
    }

    if (!search) {
      return true;
    }

    return (
      row.title.toLowerCase().includes(search) ||
      row.location.toLowerCase().includes(search) ||
      row.frame.toLowerCase().includes(search) ||
      row.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  });

  return paginate(filtered, query.page, query.pageSize);
};

const buildThoughtPublishStateUpdate = (
  status: "draft" | "published" | undefined,
  now: Date,
): { status?: ThoughtStatus; publishedAt?: Date | null } => {
  if (!status) {
    return {};
  }

  if (status === "published") {
    return {
      publishedAt: now,
      status: ThoughtStatus.published,
    };
  }

  return {
    publishedAt: null,
    status: ThoughtStatus.draft,
  };
};

const buildPhotoPublishStateUpdate = (
  status: "draft" | "published" | undefined,
): { status?: PhotoStatus } => {
  if (!status) {
    return {};
  }

  return {
    status,
  };
};

export const createPrismaAdminRepository = (client: PrismaDatabaseClient): AdminRepositoryPort => ({
  findAdminUserByEmail: async (email): Promise<AdminUserRepositoryRow | null> => {
    const row = await client.adminUser.findUnique({
      select: {
        createdAt: true,
        email: true,
        id: true,
        passwordHash: true,
        passwordHashAlgorithm: true,
        passwordHashParams: true,
        updatedAt: true,
      },
      where: {
        email,
      },
    });

    return row ? mapAdminUserRow(row) : null;
  },
  createMfaChallenge: async (input): Promise<AdminMfaChallengeRepositoryRow> => {
    const row = await client.adminMfaChallenge.create({
      data: {
        adminUserId: input.adminUserId,
        codeHash: input.codeHash,
        expiresAt: input.expiresAt,
        id: input.id,
        sentAt: input.sentAt,
      },
      include: {
        adminUser: {
          select: {
            email: true,
          },
        },
      },
    });

    return mapAdminMfaChallengeRow(row);
  },
  findMfaChallengeById: async (challengeId): Promise<AdminMfaChallengeRepositoryRow | null> => {
    const row = await client.adminMfaChallenge.findUnique({
      include: {
        adminUser: {
          select: {
            email: true,
          },
        },
      },
      where: {
        id: challengeId,
      },
    });

    return row ? mapAdminMfaChallengeRow(row) : null;
  },
  incrementMfaChallengeAttempts: async (challengeId): Promise<void> => {
    await client.adminMfaChallenge.update({
      data: {
        attempts: {
          increment: 1,
        },
      },
      where: {
        id: challengeId,
      },
    });
  },
  markMfaChallengeVerified: async (input): Promise<AdminMfaChallengeRepositoryRow | null> => {
    const challenge = await client.adminMfaChallenge.findUnique({
      where: {
        id: input.challengeId,
      },
    });

    if (!challenge || challenge.status !== AdminMfaChallengeStatus.pending) {
      return null;
    }

    const row = await client.adminMfaChallenge.update({
      data: {
        status: AdminMfaChallengeStatus.verified,
        verifiedAt: input.verifiedAt,
      },
      include: {
        adminUser: {
          select: {
            email: true,
          },
        },
      },
      where: {
        id: input.challengeId,
      },
    });

    return mapAdminMfaChallengeRow(row);
  },
  markMfaChallengeExpired: async (input): Promise<AdminMfaChallengeRepositoryRow | null> => {
    const challenge = await client.adminMfaChallenge.findUnique({
      where: {
        id: input.challengeId,
      },
    });

    if (!challenge || challenge.status !== AdminMfaChallengeStatus.pending) {
      return null;
    }

    const row = await client.adminMfaChallenge.update({
      data: {
        status: AdminMfaChallengeStatus.expired,
      },
      include: {
        adminUser: {
          select: {
            email: true,
          },
        },
      },
      where: {
        id: input.challengeId,
      },
    });

    return mapAdminMfaChallengeRow(row);
  },
  createAdminSession: async (input): Promise<AdminSessionRepositoryRow> => {
    const row = await client.adminSession.create({
      data: {
        adminUserId: input.adminUserId,
        expiresAt: input.expiresAt,
        issuedAt: input.issuedAt,
        tokenHash: input.tokenHash,
      },
      include: {
        adminUser: {
          select: {
            email: true,
          },
        },
      },
    });

    return mapAdminSessionRow(row);
  },
  findAdminSessionByTokenHash: async (tokenHash): Promise<AdminSessionRepositoryRow | null> => {
    const row = await client.adminSession.findFirst({
      include: {
        adminUser: {
          select: {
            email: true,
          },
        },
      },
      where: {
        tokenHash,
      },
    });

    return row ? mapAdminSessionRow(row) : null;
  },
  revokeAdminSessionByTokenHash: async (input): Promise<AdminSessionRepositoryRow | null> => {
    const row = await client.adminSession.findFirst({
      where: {
        status: AdminSessionStatus.active,
        tokenHash: input.tokenHash,
      },
    });

    if (!row) {
      return null;
    }

    const updated = await client.adminSession.update({
      data: {
        revokedAt: input.revokedAt,
        status: AdminSessionStatus.revoked,
      },
      include: {
        adminUser: {
          select: {
            email: true,
          },
        },
      },
      where: {
        id: row.id,
      },
    });

    return mapAdminSessionRow(updated);
  },
  revokeAdminSessionById: async (input): Promise<AdminSessionRepositoryRow | null> => {
    const row = await client.adminSession.findFirst({
      where: {
        id: input.sessionId,
        status: AdminSessionStatus.active,
      },
    });

    if (!row) {
      return null;
    }

    const updated = await client.adminSession.update({
      data: {
        revokedAt: input.revokedAt,
        status: AdminSessionStatus.revoked,
      },
      include: {
        adminUser: {
          select: {
            email: true,
          },
        },
      },
      where: {
        id: input.sessionId,
      },
    });

    return mapAdminSessionRow(updated);
  },
  touchAdminSessionLastSeen: async (input): Promise<void> => {
    await client.adminSession.update({
      data: {
        lastSeenAt: input.lastSeenAt,
      },
      where: {
        id: input.sessionId,
      },
    });
  },
  readDashboardSummary: async (): Promise<AdminDashboardSummaryRepositoryRow> => {
    const [draftThoughts, featuredThoughts, featuredProjects, featuredPhotos, photoRecords, hiddenMessages, hiddenUploads, statusStripEntries, thoughtQueueRows, projectQueueRows, photoQueueRows] = await Promise.all([
      client.thought.count({
        where: {
          status: ThoughtStatus.draft,
        },
      }),
      client.thought.count({
        where: {
          featured: true,
        },
      }),
      client.project.count({
        where: {
          featured: true,
        },
      }),
      client.photo.count({
        where: {
          featured: true,
        },
      }),
      client.photo.count(),
      client.chatMessage.count({
        where: {
          moderationState: {
            not: "visible",
          },
        },
      }),
      client.chatUpload.count({
        where: {
          moderationState: {
            not: "visible",
          },
        },
      }),
      client.statusStripEntry.count(),
      client.thought.findMany({
        orderBy: [{ updatedAt: "desc" }],
        select: {
          id: true,
          slug: true,
          title: true,
        },
        take: 3,
        where: {
          status: ThoughtStatus.draft,
        },
      }),
      client.project.findMany({
        orderBy: [{ updatedAt: "desc" }],
        select: {
          channel: true,
          id: true,
          title: true,
        },
        take: 3,
      }),
      client.photo.findMany({
        orderBy: [{ updatedAt: "desc" }],
        select: {
          frame: true,
          id: true,
          title: true,
        },
        take: 3,
      }),
    ]);

    return {
      chatFlags: hiddenMessages + hiddenUploads,
      draftThoughts,
      featuredSlots: featuredThoughts + featuredProjects + featuredPhotos,
      photoRecords,
      queue: [
        ...thoughtQueueRows.map((row) => ({
          channel: row.slug,
          id: row.id,
          kind: "thought" as const,
          title: row.title,
        })),
        ...projectQueueRows.map((row) => ({
          channel: row.channel,
          id: row.id,
          kind: "project" as const,
          title: row.title,
        })),
        ...photoQueueRows.map((row) => ({
          channel: row.frame,
          id: row.id,
          kind: "photo" as const,
          title: row.title,
        })),
      ],
      statusStripEntries,
    };
  },
  listThoughtsForCuration: async (query): Promise<AdminThoughtCurationListPage> => {
    const rows = await client.thought.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: {
        featured: true,
        id: true,
        publishedAt: true,
        slug: true,
        status: true,
        title: true,
        type: true,
        updatedAt: true,
      },
    });

    return mapThoughtList(rows.map(mapThoughtCurationRow), query);
  },
  updateThoughtCuration: async (input): Promise<AdminThoughtCurationRow | null> => {
    const exists = await client.thought.findUnique({
      select: {
        id: true,
      },
      where: {
        id: input.id,
      },
    });

    if (!exists) {
      return null;
    }

    const now = new Date();
    const updated = await client.thought.update({
      data: {
        ...(typeof input.featured === "boolean"
          ? {
              featured: input.featured,
            }
          : {}),
        ...buildThoughtPublishStateUpdate(input.status, now),
      },
      select: {
        featured: true,
        id: true,
        publishedAt: true,
        slug: true,
        status: true,
        title: true,
        type: true,
        updatedAt: true,
      },
      where: {
        id: input.id,
      },
    });

    return mapThoughtCurationRow(updated);
  },
  listProjectsForCuration: async (query): Promise<AdminProjectCurationListPage> => {
    const rows = await client.project.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: {
        channel: true,
        featured: true,
        id: true,
        slug: true,
        status: true,
        title: true,
        updatedAt: true,
        year: true,
      },
    });

    return mapProjectList(rows.map(mapProjectCurationRow), query);
  },
  updateProjectCuration: async (input): Promise<AdminProjectCurationRow | null> => {
    const exists = await client.project.findUnique({
      select: {
        id: true,
      },
      where: {
        id: input.id,
      },
    });

    if (!exists) {
      return null;
    }

    const updated = await client.project.update({
      data: {
        ...(typeof input.featured === "boolean"
          ? {
              featured: input.featured,
            }
          : {}),
        ...(input.status
          ? {
              status: mapProjectStatusToPrisma(input.status),
            }
          : {}),
      },
      select: {
        channel: true,
        featured: true,
        id: true,
        slug: true,
        status: true,
        title: true,
        updatedAt: true,
        year: true,
      },
      where: {
        id: input.id,
      },
    });

    return mapProjectCurationRow(updated);
  },
  listPhotosForCuration: async (query): Promise<AdminPhotoCurationListPage> => {
    const rows = await client.photo.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: {
        camera: true,
        caption: true,
        date: true,
        featured: true,
        film: true,
        frame: true,
        id: true,
        location: true,
        status: true,
        tags: true,
        title: true,
        tone: true,
        updatedAt: true,
      },
    });

    return mapPhotoList(rows.map(mapPhotoCurationRow), query);
  },
  updatePhotoCuration: async (input: UpdateAdminPhotoCurationCommand): Promise<AdminPhotoCurationRow | null> => {
    const exists = await client.photo.findUnique({
      select: {
        id: true,
      },
      where: {
        id: input.id,
      },
    });

    if (!exists) {
      return null;
    }

    const updated = await client.photo.update({
      data: {
        ...(typeof input.featured === "boolean"
          ? {
              featured: input.featured,
            }
          : {}),
        ...buildPhotoPublishStateUpdate(input.status),
      },
      select: {
        camera: true,
        caption: true,
        date: true,
        featured: true,
        film: true,
        frame: true,
        id: true,
        location: true,
        status: true,
        tags: true,
        title: true,
        tone: true,
        updatedAt: true,
      },
      where: {
        id: input.id,
      },
    });

    return mapPhotoCurationRow(updated);
  },
  updatePhotoMetadata: async (input: UpdateAdminPhotoMetadataCommand): Promise<AdminPhotoCurationRow | null> => {
    const exists = await client.photo.findUnique({
      select: {
        id: true,
      },
      where: {
        id: input.id,
      },
    });

    if (!exists) {
      return null;
    }

    const updated = await client.photo.update({
      data: {
        ...(typeof input.camera !== "undefined"
          ? {
              camera: input.camera,
            }
          : {}),
        ...(typeof input.caption !== "undefined"
          ? {
              caption: input.caption,
            }
          : {}),
        ...(typeof input.date !== "undefined"
          ? {
              date: input.date,
            }
          : {}),
        ...(typeof input.film !== "undefined"
          ? {
              film: input.film,
            }
          : {}),
        ...(typeof input.frame !== "undefined"
          ? {
              frame: input.frame,
            }
          : {}),
        ...(typeof input.location !== "undefined"
          ? {
              location: input.location,
            }
          : {}),
        ...(typeof input.tags !== "undefined"
          ? {
              tags: [...input.tags],
            }
          : {}),
        ...(typeof input.title !== "undefined"
          ? {
              title: input.title,
            }
          : {}),
        ...(typeof input.tone !== "undefined"
          ? {
              tone: input.tone,
            }
          : {}),
      },
      select: {
        camera: true,
        caption: true,
        date: true,
        featured: true,
        film: true,
        frame: true,
        id: true,
        location: true,
        status: true,
        tags: true,
        title: true,
        tone: true,
        updatedAt: true,
      },
      where: {
        id: input.id,
      },
    });

    return mapPhotoCurationRow(updated);
  },
  listStatusStripEntriesForAdmin: async (): Promise<readonly AdminStatusStripEntryRepositoryRow[]> => {
    const rows = await client.statusStripEntry.findMany({
      orderBy: [{ displayOrder: "asc" }],
      select: {
        accent: true,
        createdAt: true,
        displayOrder: true,
        id: true,
        label: true,
        updatedAt: true,
        value: true,
      },
    });

    return rows.map(mapStatusStripEntryRow);
  },
  replaceStatusStripEntries: async (
    entries: readonly ReplaceAdminStatusStripEntryInput[],
  ): Promise<readonly AdminStatusStripEntryRepositoryRow[]> => {
    const result = await client.$transaction(async (tx) => {
      const incomingIds = entries
        .map((entry) => entry.id)
        .filter((value): value is string => typeof value === "string" && value.length > 0);

      if (incomingIds.length > 0) {
        await tx.statusStripEntry.deleteMany({
          where: {
            id: {
              notIn: incomingIds,
            },
          },
        });
      } else {
        await tx.statusStripEntry.deleteMany();
      }

      for (const entry of entries) {
        if (entry.id) {
          await tx.statusStripEntry.upsert({
            create: {
              accent: entry.accent ?? null,
              displayOrder: entry.displayOrder,
              id: entry.id,
              label: entry.label,
              value: entry.value,
            },
            update: {
              accent: entry.accent ?? null,
              displayOrder: entry.displayOrder,
              label: entry.label,
              value: entry.value,
            },
            where: {
              id: entry.id,
            },
          });

          continue;
        }

        await tx.statusStripEntry.create({
          data: {
            accent: entry.accent ?? null,
            displayOrder: entry.displayOrder,
            label: entry.label,
            value: entry.value,
          },
        });
      }

      return tx.statusStripEntry.findMany({
        orderBy: [{ displayOrder: "asc" }],
        select: {
          accent: true,
          createdAt: true,
          displayOrder: true,
          id: true,
          label: true,
          updatedAt: true,
          value: true,
        },
      });
    });

    return result.map(mapStatusStripEntryRow);
  },
});
