import { describe, expect, it } from "bun:test";

import { createServer } from "./server";

describe("backend server scaffold", () => {
  it("responds to the health route", async () => {
    const app = createServer();
    const response = await app.request("/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      service: "vinicius.dev-backend",
      status: "ok",
    });
  });
});
