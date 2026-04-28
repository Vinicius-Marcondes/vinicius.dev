import { describe, expect, it } from "bun:test";

import { createPrismaAdminRepository } from "./admin-repository";
import type { PrismaDatabaseClient } from "./prisma-client";

describe("prisma admin repository", () => {
  it("maps admin user rows without leaking Prisma types", async () => {
    const client = {
      adminUser: {
        findUnique: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          email: "admin@example.com",
          id: "admin_1",
          passwordHash: "hash",
          passwordHashAlgorithm: "argon2id",
          passwordHashParams: null,
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
      },
    } as unknown as PrismaDatabaseClient;

    const repository = createPrismaAdminRepository(client);

    await expect(repository.findAdminUserByEmail("admin@example.com")).resolves.toEqual({
      createdAt: new Date("2026-04-28T12:00:00.000Z"),
      email: "admin@example.com",
      id: "admin_1",
      passwordHash: "hash",
      passwordHashAlgorithm: "argon2id",
      passwordHashParams: null,
      updatedAt: new Date("2026-04-28T12:00:00.000Z"),
    });
  });

  it("maps admin session rows with related admin email", async () => {
    const client = {
      adminSession: {
        findFirst: async () => ({
          adminUser: {
            email: "admin@example.com",
          },
          adminUserId: "admin_1",
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          expiresAt: new Date("2026-04-28T13:00:00.000Z"),
          id: "session_1",
          issuedAt: new Date("2026-04-28T12:00:00.000Z"),
          lastSeenAt: null,
          revokedAt: null,
          status: "active",
          tokenHash: "token-hash",
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
      },
    } as unknown as PrismaDatabaseClient;

    const repository = createPrismaAdminRepository(client);

    await expect(repository.findAdminSessionByTokenHash("token-hash")).resolves.toEqual({
      adminEmail: "admin@example.com",
      adminUserId: "admin_1",
      createdAt: new Date("2026-04-28T12:00:00.000Z"),
      expiresAt: new Date("2026-04-28T13:00:00.000Z"),
      id: "session_1",
      issuedAt: new Date("2026-04-28T12:00:00.000Z"),
      lastSeenAt: null,
      revokedAt: null,
      status: "active",
      tokenHash: "token-hash",
      updatedAt: new Date("2026-04-28T12:00:00.000Z"),
    });
  });

  it("builds dashboard summary counts and queue projections", async () => {
    const client = {
      chatMessage: {
        count: async () => 1,
      },
      chatUpload: {
        count: async () => 2,
      },
      photo: {
        count: async (input?: { where?: unknown }) => (input?.where ? 1 : 24),
        findMany: async () => [
          {
            frame: "014",
            id: "photo_1",
            title: "paulista at 02:14",
          },
        ],
      },
      project: {
        count: async () => 2,
        findMany: async () => [
          {
            channel: "07",
            id: "project_1",
            title: "crt.shader",
          },
        ],
      },
      statusStripEntry: {
        count: async () => 2,
      },
      thought: {
        count: async (input?: { where?: unknown }) => {
          const where = input?.where as Record<string, unknown> | undefined;

          if (where?.featured === true) {
            return 2;
          }

          if (where?.status === "draft") {
            return 3;
          }

          return 1;
        },
        findMany: async () => [
          {
            id: "thought_1",
            slug: "night-cable-interfaces",
            title: "Night Cable Interfaces",
          },
        ],
      },
    } as unknown as PrismaDatabaseClient;

    const repository = createPrismaAdminRepository(client);

    await expect(repository.readDashboardSummary()).resolves.toEqual({
      chatFlags: 3,
      draftThoughts: 3,
      featuredSlots: 5,
      photoRecords: 24,
      queue: [
        {
          channel: "night-cable-interfaces",
          id: "thought_1",
          kind: "thought",
          title: "Night Cable Interfaces",
        },
        {
          channel: "07",
          id: "project_1",
          kind: "project",
          title: "crt.shader",
        },
        {
          channel: "014",
          id: "photo_1",
          kind: "photo",
          title: "paulista at 02:14",
        },
      ],
      statusStripEntries: 2,
    });
  });

  it("replaces status strip entries and returns ordered rows", async () => {
    const createCalls: Array<Record<string, unknown>> = [];
    const upsertCalls: Array<Record<string, unknown>> = [];

    const tx = {
      statusStripEntry: {
        create: async (input: Record<string, unknown>) => {
          createCalls.push(input);
        },
        deleteMany: async () => {},
        findMany: async () => [
          {
            accent: "cyan",
            createdAt: new Date("2026-04-28T12:00:00.000Z"),
            displayOrder: 1,
            id: "entry_1",
            label: "now",
            updatedAt: new Date("2026-04-28T12:00:00.000Z"),
            value: "building",
          },
        ],
        upsert: async (input: Record<string, unknown>) => {
          upsertCalls.push(input);
        },
      },
    };

    const client = {
      $transaction: async (fn: (value: typeof tx) => Promise<unknown>) => fn(tx),
    } as unknown as PrismaDatabaseClient;

    const repository = createPrismaAdminRepository(client);

    await expect(
      repository.replaceStatusStripEntries([
        {
          accent: "cyan",
          displayOrder: 1,
          id: "entry_1",
          label: "now",
          value: "building",
        },
        {
          displayOrder: 2,
          label: "where",
          value: "sao paulo",
        },
      ]),
    ).resolves.toEqual([
      {
        accent: "cyan",
        createdAt: new Date("2026-04-28T12:00:00.000Z"),
        displayOrder: 1,
        id: "entry_1",
        label: "now",
        updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        value: "building",
      },
    ]);

    expect(upsertCalls.length).toBe(1);
    expect(createCalls.length).toBe(1);
  });
});
