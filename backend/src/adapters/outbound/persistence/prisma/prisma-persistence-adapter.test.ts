import { describe, expect, it } from "bun:test";

import { createPrismaPersistenceAdapter } from "./create-prisma-persistence-adapter";
import { createPrismaClient } from "./prisma-client";

describe("prisma persistence adapter", () => {
  it("exposes module repository seams without wiring behavior", () => {
    const adapter = createPrismaPersistenceAdapter(createPrismaClient());

    expect(Object.keys(adapter).sort()).toEqual(["admin", "chat", "content", "media"]);
    expect(typeof adapter.content.findPublishedThoughts).toBe("function");
    expect(typeof adapter.chat.listMessages).toBe("function");
    expect(typeof adapter.admin.findAdminUserByEmail).toBe("function");
    expect(typeof adapter.media.findPhotoMediaById).toBe("function");
  });
});
