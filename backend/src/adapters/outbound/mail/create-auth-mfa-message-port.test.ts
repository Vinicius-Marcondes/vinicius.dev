import { describe, expect, it } from "bun:test";

import {
  createDevelopmentAuthMfaMessagePort,
  createResendAuthMfaMessagePort,
} from "./create-auth-mfa-message-port";

describe("resend auth MFA message port", () => {
  it("submits MFA challenge emails to the Resend API", async () => {
    const requests: RequestInit[] = [];
    let capturedUrl = "";

    const port = createResendAuthMfaMessagePort({
      apiKey: "resend-key",
      fetchImpl: async (url, init) => {
        capturedUrl = String(url);
        requests.push(init ?? {});
        return new Response(JSON.stringify({ id: "email_1" }), {
          status: 202,
        });
      },
      fromEmail: "Vinicius Dev <no-reply@example.com>",
    });

    await port.sendMfaChallenge({
      adminEmail: "admin@example.com",
      challengeId: "challenge_1",
      code: "123456",
      expiresAt: new Date("2026-05-04T12:10:00.000Z"),
    });

    expect(capturedUrl).toBe("https://api.resend.com/emails");
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.headers).toEqual({
      Authorization: "Bearer resend-key",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(requests[0]?.body))).toMatchObject({
      from: "Vinicius Dev <no-reply@example.com>",
      subject: "Your admin login verification code",
      text: expect.stringContaining("123456"),
      to: ["admin@example.com"],
    });
  });

  it("throws when the provider rejects the send request", async () => {
    const port = createResendAuthMfaMessagePort({
      apiKey: "resend-key",
      fetchImpl: async () =>
        new Response(JSON.stringify({ error: "denied" }), {
          status: 403,
        }),
      fromEmail: "Vinicius Dev <no-reply@example.com>",
    });

    await expect(
      port.sendMfaChallenge({
        adminEmail: "admin@example.com",
        challengeId: "challenge_1",
        code: "123456",
        expiresAt: new Date("2026-05-04T12:10:00.000Z"),
      }),
    ).rejects.toThrow("Resend MFA delivery failed with status 403");
  });
});

describe("development auth MFA message port", () => {
  it("logs a debug-only challenge record", async () => {
    const logs: string[] = [];
    const port = createDevelopmentAuthMfaMessagePort({
      log: (message) => logs.push(message),
    });

    await port.sendMfaChallenge({
      adminEmail: "admin@example.com",
      challengeId: "challenge_1",
      code: "654321",
      expiresAt: new Date("2026-05-04T12:10:00.000Z"),
    });

    expect(logs).toHaveLength(1);
    expect(logs[0]).toContain("auth:mfa:debug");
    expect(logs[0]).toContain("challenge_1");
    expect(logs[0]).toContain("654321");
  });
});
