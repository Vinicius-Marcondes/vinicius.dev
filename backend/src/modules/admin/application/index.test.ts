import { describe, expect, it } from "bun:test";

import {
  createGetAdminDashboardSummaryUseCase,
  createListAdminPhotosUseCase,
  createListAdminProjectsUseCase,
  createListAdminStatusStripEntriesUseCase,
  createListAdminThoughtsUseCase,
  createReplaceAdminStatusStripEntriesUseCase,
  createUpdateAdminPhotoCurationUseCase,
  createUpdateAdminPhotoMetadataUseCase,
  createUpdateAdminProjectCurationUseCase,
  createUpdateAdminThoughtCurationUseCase,
  InvalidAdminPhotoMetadataDateError,
} from "./index";
import type { AdminRepositoryPort } from "../ports/outbound";

const now = new Date("2026-04-28T12:00:00.000Z");

const createRepository = (
  overrides: Partial<AdminRepositoryPort> = {},
): AdminRepositoryPort => ({
  createAdminSession: async () => {
    throw new Error("unused");
  },
  createMfaChallenge: async () => {
    throw new Error("unused");
  },
  findAdminSessionByTokenHash: async () => null,
  findAdminUserByEmail: async () => null,
  findMfaChallengeById: async () => null,
  incrementMfaChallengeAttempts: async () => {},
  listPhotosForCuration: async () => ({
    items: [],
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
  }),
  listProjectsForCuration: async () => ({
    items: [
      {
        channel: "07",
        featured: true,
        id: "project_1",
        slug: "crt-shader-kit",
        status: "live",
        title: "crt.shader",
        updatedAt: now,
        year: 2025,
      },
    ],
    page: 1,
    pageSize: 20,
    totalItems: 1,
    totalPages: 1,
  }),
  listStatusStripEntriesForAdmin: async () => [
    {
      accent: "cyan",
      createdAt: now,
      displayOrder: 1,
      id: "entry_1",
      label: "now",
      updatedAt: now,
      value: "building",
    },
  ],
  listThoughtsForCuration: async () => ({
    items: [
      {
        featured: false,
        id: "thought_1",
        publishedAt: null,
        slug: "night-cable-interfaces",
        status: "draft",
        title: "Night Cable Interfaces",
        type: "essay",
        updatedAt: now,
      },
    ],
    page: 1,
    pageSize: 20,
    totalItems: 1,
    totalPages: 1,
  }),
  markMfaChallengeExpired: async () => null,
  markMfaChallengeVerified: async () => null,
  readDashboardSummary: async () => ({
    chatFlags: 2,
    draftThoughts: 3,
    featuredSlots: 5,
    photoRecords: 24,
    queue: [
      {
        channel: "TH-01",
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
  }),
  replaceStatusStripEntries: async () => [
    {
      accent: "cyan",
      createdAt: now,
      displayOrder: 1,
      id: "entry_1",
      label: "now",
      updatedAt: now,
      value: "building",
    },
  ],
  revokeAdminSessionById: async () => null,
  revokeAdminSessionByTokenHash: async () => null,
  touchAdminSessionLastSeen: async () => {},
  updatePhotoCuration: async () => null,
  updatePhotoMetadata: async () => ({
    camera: "Canon",
    caption: "Night street frame.",
    date: new Date("2026-03-22T00:00:00.000Z"),
    featured: false,
    film: "digital",
    frame: "014",
    id: "photo_1",
    location: "Sao Paulo",
    status: "published",
    tags: ["night", "street"],
    title: "paulista at 02:14",
    tone: "sunset",
    updatedAt: now,
  }),
  updateProjectCuration: async () => null,
  updateThoughtCuration: async () => ({
    featured: true,
    id: "thought_1",
    publishedAt: now,
    slug: "night-cable-interfaces",
    status: "published",
    title: "Night Cable Interfaces",
    type: "essay",
    updatedAt: now,
  }),
  ...overrides,
});

describe("admin application", () => {
  it("maps dashboard summary and queue actions", async () => {
    const useCase = createGetAdminDashboardSummaryUseCase({
      repository: createRepository(),
    });

    await expect(useCase.execute()).resolves.toEqual({
      moderationCommands: ["delete_message", "ban_handle", "rotate_room_password"],
      panels: {
        chatFlags: 2,
        draftThoughts: 3,
        featuredSlots: 5,
        photoRecords: 24,
        statusStripEntries: 2,
      },
      queues: {
        content: [
          {
            channel: "TH-01",
            id: "thought_1",
            kind: "thought",
            suggestedActions: ["publish", "edit", "unpin"],
            title: "Night Cable Interfaces",
          },
          {
            channel: "07",
            id: "project_1",
            kind: "project",
            suggestedActions: ["feature", "archive", "inspect_links"],
            title: "crt.shader",
          },
          {
            channel: "014",
            id: "photo_1",
            kind: "photo",
            suggestedActions: ["caption", "tag", "feature"],
            title: "paulista at 02:14",
          },
        ],
      },
    });
  });

  it("maps thought curation list and update responses", async () => {
    const repository = createRepository();
    const listUseCase = createListAdminThoughtsUseCase({ repository });
    const updateUseCase = createUpdateAdminThoughtCurationUseCase({ repository });

    await expect(listUseCase.execute({})).resolves.toEqual({
      items: [
        {
          featured: false,
          id: "thought_1",
          publishedAt: null,
          slug: "night-cable-interfaces",
          status: "draft",
          title: "Night Cable Interfaces",
          type: "essay",
          updatedAt: "2026-04-28T12:00:00.000Z",
        },
      ],
      pageInfo: {
        page: 1,
        pageSize: 20,
        totalItems: 1,
        totalPages: 1,
      },
    });

    await expect(
      updateUseCase.execute({
        featured: true,
        id: "thought_1",
        status: "published",
      }),
    ).resolves.toEqual({
      item: {
        featured: true,
        id: "thought_1",
        publishedAt: "2026-04-28",
        slug: "night-cable-interfaces",
        status: "published",
        title: "Night Cable Interfaces",
        type: "essay",
        updatedAt: "2026-04-28T12:00:00.000Z",
      },
    });
  });

  it("maps projects and status strip responses", async () => {
    const repository = createRepository();
    const listProjects = createListAdminProjectsUseCase({ repository });
    const listStrip = createListAdminStatusStripEntriesUseCase({ repository });
    const replaceStrip = createReplaceAdminStatusStripEntriesUseCase({ repository });

    await expect(listProjects.execute({})).resolves.toEqual({
      items: [
        {
          channel: "07",
          featured: true,
          id: "project_1",
          slug: "crt-shader-kit",
          status: "live",
          title: "crt.shader",
          updatedAt: "2026-04-28T12:00:00.000Z",
          year: 2025,
        },
      ],
      pageInfo: {
        page: 1,
        pageSize: 20,
        totalItems: 1,
        totalPages: 1,
      },
    });

    await expect(listStrip.execute()).resolves.toEqual({
      items: [
        {
          accent: "cyan",
          displayOrder: 1,
          id: "entry_1",
          label: "now",
          value: "building",
        },
      ],
    });

    await expect(
      replaceStrip.execute({
        items: [
          {
            accent: "cyan",
            displayOrder: 1,
            id: "entry_1",
            label: "now",
            value: "building",
          },
        ],
      }),
    ).resolves.toEqual({
      items: [
        {
          accent: "cyan",
          displayOrder: 1,
          id: "entry_1",
          label: "now",
          value: "building",
        },
      ],
    });
  });

  it("rejects invalid photo metadata dates", async () => {
    const useCase = createUpdateAdminPhotoMetadataUseCase({
      repository: createRepository(),
    });

    await expect(
      useCase.execute({
        date: "not-a-date",
        id: "photo_1",
      }),
    ).rejects.toBeInstanceOf(InvalidAdminPhotoMetadataDateError);
  });

  it("normalizes admin list pagination and forwards trimmed filters", async () => {
    const thoughtQueries: unknown[] = [];
    const projectQueries: unknown[] = [];
    const photoQueries: unknown[] = [];
    const repository = createRepository({
      listPhotosForCuration: async (query) => {
        photoQueries.push(query);
        return {
          items: [],
          page: query.page,
          pageSize: query.pageSize,
          totalItems: 0,
          totalPages: 1,
        };
      },
      listProjectsForCuration: async (query) => {
        projectQueries.push(query);
        return {
          items: [],
          page: query.page,
          pageSize: query.pageSize,
          totalItems: 0,
          totalPages: 1,
        };
      },
      listThoughtsForCuration: async (query) => {
        thoughtQueries.push(query);
        return {
          items: [],
          page: query.page,
          pageSize: query.pageSize,
          totalItems: 0,
          totalPages: 1,
        };
      },
    });

    await createListAdminThoughtsUseCase({ repository }).execute({
      featured: true,
      page: -4,
      pageSize: 999,
      search: "  cable ",
      status: "draft",
      type: "essay",
    });
    await createListAdminProjectsUseCase({ repository }).execute({
      featured: false,
      page: Number.NaN,
      pageSize: 0,
      search: "   ",
      status: "in-progress",
    });
    await createListAdminPhotosUseCase({ repository }).execute({
      location: "  Sao Paulo ",
      page: 2.8,
      pageSize: 4.9,
      search: " night ",
      status: "published",
      year: 2026,
    });

    expect(thoughtQueries).toEqual([
      {
        featured: true,
        page: 1,
        pageSize: 100,
        search: "cable",
        status: "draft",
        type: "essay",
      },
    ]);
    expect(projectQueries).toEqual([
      {
        featured: false,
        page: 1,
        pageSize: 1,
        search: undefined,
        status: "in-progress",
      },
    ]);
    expect(photoQueries).toEqual([
      {
        featured: undefined,
        location: "Sao Paulo",
        page: 2,
        pageSize: 4,
        search: "night",
        status: "published",
        year: 2026,
      },
    ]);
  });

  it("maps project and photo curation updates and returns null for missing targets", async () => {
    const repository = createRepository({
      updatePhotoCuration: async (input) =>
        input.id === "missing"
          ? null
          : {
              camera: "Canon",
              caption: "Night street frame.",
              date: new Date("2026-03-22T00:00:00.000Z"),
              featured: input.featured ?? false,
              film: "digital",
              frame: "014",
              id: input.id,
              location: "Sao Paulo",
              status: input.status ?? "draft",
              tags: ["night"],
              title: "paulista at 02:14",
              tone: "sunset",
              updatedAt: now,
            },
      updateProjectCuration: async (input) =>
        input.id === "missing"
          ? null
          : {
              channel: "07",
              featured: input.featured ?? false,
              id: input.id,
              slug: "crt-shader-kit",
              status: input.status ?? "live",
              title: "crt.shader",
              updatedAt: now,
              year: 2025,
            },
      updateThoughtCuration: async () => null,
    });

    await expect(
      createUpdateAdminProjectCurationUseCase({ repository }).execute({
        featured: true,
        id: "project_1",
        status: "in-progress",
      }),
    ).resolves.toEqual({
      item: {
        channel: "07",
        featured: true,
        id: "project_1",
        slug: "crt-shader-kit",
        status: "in-progress",
        title: "crt.shader",
        updatedAt: "2026-04-28T12:00:00.000Z",
        year: 2025,
      },
    });
    await expect(
      createUpdateAdminPhotoCurationUseCase({ repository }).execute({
        featured: true,
        id: "photo_1",
        status: "published",
      }),
    ).resolves.toMatchObject({
      item: {
        date: "2026-03-22",
        featured: true,
        id: "photo_1",
        status: "published",
      },
    });
    await expect(
      createUpdateAdminThoughtCurationUseCase({ repository }).execute({
        id: "thought_missing",
      }),
    ).resolves.toBeNull();
    await expect(
      createUpdateAdminProjectCurationUseCase({ repository }).execute({
        id: "missing",
      }),
    ).resolves.toBeNull();
    await expect(
      createUpdateAdminPhotoCurationUseCase({ repository }).execute({
        id: "missing",
      }),
    ).resolves.toBeNull();
  });

  it("maps valid photo metadata updates and null metadata results", async () => {
    const metadataInputs: unknown[] = [];
    const repository = createRepository({
      updatePhotoMetadata: async (input) => {
        metadataInputs.push(input);
        if (input.id === "missing") {
          return null;
        }

        return {
          camera: input.camera ?? null,
          caption: input.caption ?? null,
          date: input.date ?? new Date("2026-03-22T00:00:00.000Z"),
          featured: false,
          film: input.film ?? null,
          frame: input.frame ?? "014",
          id: input.id,
          location: input.location ?? "Sao Paulo",
          status: "published",
          tags: input.tags ?? [],
          title: input.title ?? "paulista at 02:14",
          tone: input.tone ?? "sunset",
          updatedAt: now,
        };
      },
    });
    const useCase = createUpdateAdminPhotoMetadataUseCase({ repository });

    await expect(
      useCase.execute({
        camera: "Canon",
        caption: null,
        date: "2026-05-01",
        id: "photo_1",
        tags: ["night", "street"],
      }),
    ).resolves.toMatchObject({
      item: {
        camera: "Canon",
        caption: null,
        date: "2026-05-01",
        id: "photo_1",
        tags: ["night", "street"],
      },
    });
    await expect(
      useCase.execute({
        id: "missing",
      }),
    ).resolves.toBeNull();
    expect(metadataInputs).toEqual([
      {
        camera: "Canon",
        caption: null,
        date: new Date("2026-05-01T00:00:00.000Z"),
        film: undefined,
        frame: undefined,
        id: "photo_1",
        location: undefined,
        tags: ["night", "street"],
        title: undefined,
        tone: undefined,
      },
      {
        camera: undefined,
        caption: undefined,
        date: undefined,
        film: undefined,
        frame: undefined,
        id: "missing",
        location: undefined,
        tags: undefined,
        title: undefined,
        tone: undefined,
      },
    ]);
  });
});
