import type { AuthMfaMessagePort } from "@/modules/auth/ports/outbound";

const DEFAULT_RESEND_API_BASE_URL = "https://api.resend.com";

type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type ResendAuthMfaMessagePortDependencies = Readonly<{
  apiKey: string;
  fromEmail: string;
  apiBaseUrl?: string;
  fetchImpl?: FetchLike;
}>;

export const createResendAuthMfaMessagePort = ({
  apiKey,
  fromEmail,
  apiBaseUrl = DEFAULT_RESEND_API_BASE_URL,
  fetchImpl = fetch,
}: ResendAuthMfaMessagePortDependencies): AuthMfaMessagePort => ({
  sendMfaChallenge: async ({ adminEmail, code, expiresAt }) => {
    const response = await fetchImpl(`${apiBaseUrl}/emails`, {
      body: JSON.stringify({
        from: fromEmail,
        subject: "Your admin login verification code",
        text: `Your vinicius.dev MFA code is ${code}. It expires at ${expiresAt.toISOString()}.`,
        to: [adminEmail],
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const responseBody = await response.text();

      throw new Error(
        `Resend MFA delivery failed with status ${response.status}: ${responseBody}`,
      );
    }
  },
});

export type DevelopmentAuthMfaMessagePortDependencies = Readonly<{
  log?: (message: string) => void;
}>;

export const createDevelopmentAuthMfaMessagePort = ({
  log = console.log,
}: DevelopmentAuthMfaMessagePortDependencies = {}): AuthMfaMessagePort => ({
  sendMfaChallenge: async ({ adminEmail, challengeId, code, expiresAt }) => {
    log(
      `[auth:mfa:debug] challengeId=${challengeId} email=${adminEmail} code=${code} expiresAt=${expiresAt.toISOString()}`,
    );
  },
});
