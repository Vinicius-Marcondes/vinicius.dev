import { describe, expect, it } from "bun:test";

import {
  createGetAdminDashboardSummaryUseCase,
  createListAdminProjectsUseCase,
  createListAdminStatusStripEntriesUseCase,
  createListAdminThoughtsUseCase,
  createReplaceAdminStatusStripEntriesUseCase,
  createUpdateAdminPhotoMetadataUseCase,
  createUpdateAdminThoughtCurationUseCase,
  InvalidAdminPhotoMetadataDateError,
} from "./index";
import type { AdminRepositoryPort } from "../ports/outbound";

const now = new Date("2026-04-28T12:00:00.000Z");

const createRepository = (): AdminRepositoryPort => ({
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
});
