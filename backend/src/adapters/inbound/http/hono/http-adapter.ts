import { Hono } from "hono";

import { InvalidThoughtCursorError } from "@/modules/content/application";
import type { BootstrapContainer } from "@/bootstrap/container";

const serviceName = "vinicius.dev-backend";

type NotImplementedResponse = {
  family: string;
  method: string;
  route: string;
  service: string;
  status: "not_implemented";
};

const createNotImplementedFamily = (family: string) => {
  const familyApp = new Hono();

  familyApp.all("*", (c) =>
    c.json<NotImplementedResponse>(
      {
        family,
        method: c.req.method,
        route: c.req.path,
        service: serviceName,
        status: "not_implemented",
      },
      501,
    ),
  );

  return familyApp;
};

const mountPlaceholderFamily = (app: Hono, path: string, family: string) => {
  app.route(path, createNotImplementedFamily(family));
};

const parsePositiveInteger = (value: string | undefined): number | undefined => {
  if (typeof value === "undefined") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
};

const parseThoughtQuery = (query: Record<string, string | undefined>) => {
  const type = query.type;

  if (type && type !== "essay" && type !== "note") {
    return {
      error: {
        error: "invalid_query",
        field: "type",
      },
    } as const;
  }

  const limit = parsePositiveInteger(query.limit);

  if (typeof query.limit !== "undefined" && typeof limit === "undefined") {
    return {
      error: {
        error: "invalid_query",
        field: "limit",
      },
    } as const;
  }

  const tags = [query.tag, query.tags]
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  const normalizedType: "essay" | "note" | undefined =
    type === "essay" || type === "note" ? type : undefined;

  return {
    value: {
      cursor: query.cursor,
      limit,
      search: query.search,
      tags,
      type: normalizedType,
    },
  } as const;
};

const createThoughtsFamily = (container: BootstrapContainer) => {
  const thoughtsApp = new Hono();

  thoughtsApp.get("/", async (c) => {
    const parsed = parseThoughtQuery(c.req.query());

    if ("error" in parsed) {
      return c.json(parsed.error, 400);
    }

    try {
      const response = await container.content.listPublishedThoughts.execute(parsed.value);

      return c.json(response);
    } catch (error) {
      if (error instanceof InvalidThoughtCursorError) {
        return c.json(
          {
            error: "invalid_query",
            field: "cursor",
          },
          400,
        );
      }

      throw error;
    }
  });

  thoughtsApp.get("/:slug", async (c) => {
    const slug = c.req.param("slug")?.trim();

    if (!slug) {
      return c.json(
        {
          error: "invalid_path",
          field: "slug",
        },
        400,
      );
    }

    const thought = await container.content.getPublishedThoughtBySlug.execute({ slug });

    if (!thought) {
      return c.json(
        {
          error: "not_found",
          resource: "thought",
        },
        404,
      );
    }

    return c.json({ item: thought });
  });

  return thoughtsApp;
};

const parseProjectsQuery = (query: Record<string, string | undefined>) => {
  const status = query.status;

  if (status && status !== "live" && status !== "archived" && status !== "in-progress") {
    return {
      error: {
        error: "invalid_query",
        field: "status",
      },
    } as const;
  }

  const sort = query.sort;

  if (sort && sort !== "recent" && sort !== "alpha" && sort !== "channel") {
    return {
      error: {
        error: "invalid_query",
        field: "sort",
      },
    } as const;
  }

  const page = parsePositiveInteger(query.page);

  if (typeof query.page !== "undefined" && typeof page === "undefined") {
    return {
      error: {
        error: "invalid_query",
        field: "page",
      },
    } as const;
  }

  const pageSize = parsePositiveInteger(query.pageSize);

  if (typeof query.pageSize !== "undefined" && typeof pageSize === "undefined") {
    return {
      error: {
        error: "invalid_query",
        field: "pageSize",
      },
    } as const;
  }

  const tags = [query.tag, query.tags]
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  const normalizedStatus: "live" | "archived" | "in-progress" | undefined =
    status === "live" || status === "archived" || status === "in-progress"
      ? status
      : undefined;
  const normalizedSort: "recent" | "alpha" | "channel" | undefined =
    sort === "recent" || sort === "alpha" || sort === "channel" ? sort : undefined;

  return {
    value: {
      page,
      pageSize,
      search: query.search,
      sort: normalizedSort,
      status: normalizedStatus,
      tags,
    },
  } as const;
};

const createProjectsFamily = (container: BootstrapContainer) => {
  const projectsApp = new Hono();

  projectsApp.get("/", async (c) => {
    const parsed = parseProjectsQuery(c.req.query());

    if ("error" in parsed) {
      return c.json(parsed.error, 400);
    }

    const response = await container.content.listPublishedProjects.execute(parsed.value);

    return c.json(response);
  });

  projectsApp.get("/:slug", async (c) => {
    const slug = c.req.param("slug")?.trim();

    if (!slug) {
      return c.json(
        {
          error: "invalid_path",
          field: "slug",
        },
        400,
      );
    }

    const project = await container.content.getPublishedProjectBySlug.execute({ slug });

    if (!project) {
      return c.json(
        {
          error: "not_found",
          resource: "project",
        },
        404,
      );
    }

    return c.json({ item: project });
  });

  return projectsApp;
};

const parsePhotosQuery = (query: Record<string, string | undefined>) => {
  const page = parsePositiveInteger(query.page);

  if (typeof query.page !== "undefined" && typeof page === "undefined") {
    return {
      error: {
        error: "invalid_query",
        field: "page",
      },
    } as const;
  }

  const pageSize = parsePositiveInteger(query.pageSize);

  if (typeof query.pageSize !== "undefined" && typeof pageSize === "undefined") {
    return {
      error: {
        error: "invalid_query",
        field: "pageSize",
      },
    } as const;
  }

  const year = parsePositiveInteger(query.year);

  if (typeof query.year !== "undefined" && typeof year === "undefined") {
    return {
      error: {
        error: "invalid_query",
        field: "year",
      },
    } as const;
  }

  return {
    value: {
      location: query.location,
      page,
      pageSize,
      search: query.search,
      year,
    },
  } as const;
};

const createPhotosFamily = (container: BootstrapContainer) => {
  const photosApp = new Hono();

  photosApp.get("/", async (c) => {
    const parsed = parsePhotosQuery(c.req.query());

    if ("error" in parsed) {
      return c.json(parsed.error, 400);
    }

    const response = await container.content.listPublishedPhotos.execute(parsed.value);

    return c.json(response);
  });

  photosApp.get("/:id", async (c) => {
    const id = c.req.param("id")?.trim();

    if (!id) {
      return c.json(
        {
          error: "invalid_path",
          field: "id",
        },
        400,
      );
    }

    const photo = await container.content.getPublishedPhotoById.execute({ id });

    if (!photo) {
      return c.json(
        {
          error: "not_found",
          resource: "photo",
        },
        404,
      );
    }

    return c.json({ item: photo });
  });

  return photosApp;
};

export const createHonoHttpAdapter = (container: BootstrapContainer) => {
  const app = new Hono();

  app.get("/api", (c) =>
    c.json({
      route: "/api",
      service: serviceName,
      status: "ok",
      surface: "hono-http-adapter-shell",
    }),
  );

  app.route("/api/thoughts", createThoughtsFamily(container));
  app.route("/api/projects", createProjectsFamily(container));
  app.route("/api/photos", createPhotosFamily(container));
  mountPlaceholderFamily(app, "/api/status-strip", "status strip");
  mountPlaceholderFamily(app, "/api/chat", "chat");
  mountPlaceholderFamily(app, "/api/admin", "admin");
  mountPlaceholderFamily(app, "/api/auth", "auth");
  mountPlaceholderFamily(app, "/api/rss", "rss");
  mountPlaceholderFamily(app, "/api/sitemap", "sitemap");

  app.get("/media/photos/:id/original", (c) =>
    c.json<NotImplementedResponse>(
      {
        family: "photo media",
        method: c.req.method,
        route: c.req.path,
        service: serviceName,
        status: "not_implemented",
      },
      501,
    ),
  );

  return app;
};
