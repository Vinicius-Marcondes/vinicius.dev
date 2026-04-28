import type {
  AdminDashboardSummaryOutput,
  GetAdminDashboardSummaryPort,
  ListAdminPhotosInput,
  ListAdminPhotosOutput,
  ListAdminPhotosPort,
  ListAdminProjectsInput,
  ListAdminProjectsOutput,
  ListAdminProjectsPort,
  ListAdminStatusStripEntriesOutput,
  ListAdminStatusStripEntriesPort,
  ListAdminThoughtsInput,
  ListAdminThoughtsOutput,
  ListAdminThoughtsPort,
  ReplaceAdminStatusStripEntriesInput,
  ReplaceAdminStatusStripEntriesOutput,
  ReplaceAdminStatusStripEntriesPort,
  UpdateAdminPhotoCurationInput,
  UpdateAdminPhotoCurationOutput,
  UpdateAdminPhotoCurationPort,
  UpdateAdminPhotoMetadataInput,
  UpdateAdminPhotoMetadataOutput,
  UpdateAdminPhotoMetadataPort,
  UpdateAdminProjectCurationInput,
  UpdateAdminProjectCurationOutput,
  UpdateAdminProjectCurationPort,
  UpdateAdminThoughtCurationInput,
  UpdateAdminThoughtCurationOutput,
  UpdateAdminThoughtCurationPort,
} from "@/modules/admin/ports/inbound";
import type {
  AdminPhotoCurationRow,
  AdminProjectCurationRow,
  AdminRepositoryPort,
  AdminStatusStripEntryRepositoryRow,
  AdminThoughtCurationRow,
} from "@/modules/admin/ports/outbound";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const normalizePage = (value?: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_PAGE;
  }

  return Math.max(Math.trunc(value), 1);
};

const normalizePageSize = (value?: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(Math.max(Math.trunc(value), 1), MAX_PAGE_SIZE);
};

const mapQueueActions = (
  kind: "thought" | "project" | "photo",
): readonly string[] => {
  if (kind === "thought") {
    return ["publish", "edit", "unpin"] as const;
  }

  if (kind === "project") {
    return ["feature", "archive", "inspect_links"] as const;
  }

  return ["caption", "tag", "feature"] as const;
};

const mapDashboardOutput = (
  input: Awaited<ReturnType<AdminRepositoryPort["readDashboardSummary"]>>,
): AdminDashboardSummaryOutput => ({
  moderationCommands: ["delete_message", "ban_handle", "rotate_room_password"] as const,
  panels: {
    chatFlags: input.chatFlags,
    draftThoughts: input.draftThoughts,
    featuredSlots: input.featuredSlots,
    photoRecords: input.photoRecords,
    statusStripEntries: input.statusStripEntries,
  },
  queues: {
    content: input.queue.map((item) => ({
      channel: item.channel,
      id: item.id,
      kind: item.kind,
      suggestedActions: mapQueueActions(item.kind),
      title: item.title,
    })),
  },
});

const mapThoughtItem = (item: AdminThoughtCurationRow) => ({
  featured: item.featured,
  id: item.id,
  publishedAt: item.publishedAt ? item.publishedAt.toISOString().slice(0, 10) : null,
  slug: item.slug,
  status: item.status,
  title: item.title,
  type: item.type,
  updatedAt: item.updatedAt.toISOString(),
});

const mapProjectItem = (item: AdminProjectCurationRow) => ({
  channel: item.channel,
  featured: item.featured,
  id: item.id,
  slug: item.slug,
  status: item.status,
  title: item.title,
  updatedAt: item.updatedAt.toISOString(),
  year: item.year,
});

const mapPhotoItem = (item: AdminPhotoCurationRow) => ({
  camera: item.camera,
  caption: item.caption,
  date: item.date.toISOString().slice(0, 10),
  featured: item.featured,
  film: item.film,
  frame: item.frame,
  id: item.id,
  location: item.location,
  status: item.status,
  tags: [...item.tags],
  title: item.title,
  tone: item.tone,
  updatedAt: item.updatedAt.toISOString(),
});

const mapStatusStripItem = (item: AdminStatusStripEntryRepositoryRow) => ({
  ...(item.accent ? { accent: item.accent } : {}),
  displayOrder: item.displayOrder,
  id: item.id,
  label: item.label,
  value: item.value,
});

export class InvalidAdminPhotoMetadataDateError extends Error {
  constructor() {
    super("admin photo metadata date is invalid");
    this.name = "InvalidAdminPhotoMetadataDateError";
  }
}

export type AdminApplicationDependencies = Readonly<{
  repository: AdminRepositoryPort;
}>;

export const createGetAdminDashboardSummaryUseCase = ({
  repository,
}: AdminApplicationDependencies): GetAdminDashboardSummaryPort => ({
  execute: async (): Promise<AdminDashboardSummaryOutput> => {
    const summary = await repository.readDashboardSummary();

    return mapDashboardOutput(summary);
  },
});

export const createListAdminThoughtsUseCase = ({
  repository,
}: AdminApplicationDependencies): ListAdminThoughtsPort => ({
  execute: async (input: ListAdminThoughtsInput): Promise<ListAdminThoughtsOutput> => {
    const page = normalizePage(input.page);
    const pageSize = normalizePageSize(input.pageSize);
    const result = await repository.listThoughtsForCuration({
      featured: input.featured,
      page,
      pageSize,
      search: input.search?.trim() || undefined,
      status: input.status,
      type: input.type,
    });

    return {
      items: result.items.map(mapThoughtItem),
      pageInfo: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      },
    };
  },
});

export const createUpdateAdminThoughtCurationUseCase = ({
  repository,
}: AdminApplicationDependencies): UpdateAdminThoughtCurationPort => ({
  execute: async (
    input: UpdateAdminThoughtCurationInput,
  ): Promise<UpdateAdminThoughtCurationOutput | null> => {
    const updated = await repository.updateThoughtCuration({
      featured: input.featured,
      id: input.id,
      status: input.status,
    });

    if (!updated) {
      return null;
    }

    return {
      item: mapThoughtItem(updated),
    };
  },
});

export const createListAdminProjectsUseCase = ({
  repository,
}: AdminApplicationDependencies): ListAdminProjectsPort => ({
  execute: async (input: ListAdminProjectsInput): Promise<ListAdminProjectsOutput> => {
    const result = await repository.listProjectsForCuration({
      featured: input.featured,
      page: normalizePage(input.page),
      pageSize: normalizePageSize(input.pageSize),
      search: input.search?.trim() || undefined,
      status: input.status,
    });

    return {
      items: result.items.map(mapProjectItem),
      pageInfo: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      },
    };
  },
});

export const createUpdateAdminProjectCurationUseCase = ({
  repository,
}: AdminApplicationDependencies): UpdateAdminProjectCurationPort => ({
  execute: async (
    input: UpdateAdminProjectCurationInput,
  ): Promise<UpdateAdminProjectCurationOutput | null> => {
    const updated = await repository.updateProjectCuration({
      featured: input.featured,
      id: input.id,
      status: input.status,
    });

    if (!updated) {
      return null;
    }

    return {
      item: mapProjectItem(updated),
    };
  },
});

export const createListAdminPhotosUseCase = ({
  repository,
}: AdminApplicationDependencies): ListAdminPhotosPort => ({
  execute: async (input: ListAdminPhotosInput): Promise<ListAdminPhotosOutput> => {
    const result = await repository.listPhotosForCuration({
      featured: input.featured,
      location: input.location?.trim() || undefined,
      page: normalizePage(input.page),
      pageSize: normalizePageSize(input.pageSize),
      search: input.search?.trim() || undefined,
      status: input.status,
      year: input.year,
    });

    return {
      items: result.items.map(mapPhotoItem),
      pageInfo: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      },
    };
  },
});

export const createUpdateAdminPhotoCurationUseCase = ({
  repository,
}: AdminApplicationDependencies): UpdateAdminPhotoCurationPort => ({
  execute: async (
    input: UpdateAdminPhotoCurationInput,
  ): Promise<UpdateAdminPhotoCurationOutput | null> => {
    const updated = await repository.updatePhotoCuration({
      featured: input.featured,
      id: input.id,
      status: input.status,
    });

    if (!updated) {
      return null;
    }

    return {
      item: mapPhotoItem(updated),
    };
  },
});

export const createUpdateAdminPhotoMetadataUseCase = ({
  repository,
}: AdminApplicationDependencies): UpdateAdminPhotoMetadataPort => ({
  execute: async (
    input: UpdateAdminPhotoMetadataInput,
  ): Promise<UpdateAdminPhotoMetadataOutput | null> => {
    const date = input.date ? new Date(input.date) : undefined;

    if (input.date && Number.isNaN(date?.getTime())) {
      throw new InvalidAdminPhotoMetadataDateError();
    }

    const updated = await repository.updatePhotoMetadata({
      camera: input.camera,
      caption: input.caption,
      date,
      film: input.film,
      frame: input.frame,
      id: input.id,
      location: input.location,
      tags: input.tags,
      title: input.title,
      tone: input.tone,
    });

    if (!updated) {
      return null;
    }

    return {
      item: mapPhotoItem(updated),
    };
  },
});

export const createListAdminStatusStripEntriesUseCase = ({
  repository,
}: AdminApplicationDependencies): ListAdminStatusStripEntriesPort => ({
  execute: async (): Promise<ListAdminStatusStripEntriesOutput> => {
    const entries = await repository.listStatusStripEntriesForAdmin();

    return {
      items: entries.map(mapStatusStripItem),
    };
  },
});

export const createReplaceAdminStatusStripEntriesUseCase = ({
  repository,
}: AdminApplicationDependencies): ReplaceAdminStatusStripEntriesPort => ({
  execute: async (
    input: ReplaceAdminStatusStripEntriesInput,
  ): Promise<ReplaceAdminStatusStripEntriesOutput> => {
    const entries = await repository.replaceStatusStripEntries(
      input.items.map((item) => ({
        accent: item.accent,
        displayOrder: item.displayOrder,
        id: item.id,
        label: item.label,
        value: item.value,
      })),
    );

    return {
      items: entries.map(mapStatusStripItem),
    };
  },
});
