import type { UseCase } from "@/modules/shared/application/use-case";

export type AuthReadyAdmin = Readonly<{
  id: string;
  email: string;
}>;

export type AuthReadySession = Readonly<{
  id: string;
  expiresAt: string;
}>;

export type AuthReadyState = Readonly<{
  state: "ready";
  admin: AuthReadyAdmin;
  session: AuthReadySession;
  sessionToken: string;
}>;

export type AuthMfaChallengeSummary = Readonly<{
  id: string;
  expiresAt: string;
  delivery: "email";
  maskedEmail: string;
}>;

export type LoginWithCredentialsInput = Readonly<{
  email: string;
  password: string;
}>;

export type LoginWithCredentialsOutput =
  | Readonly<{
      state: "mfa_required";
      challenge: AuthMfaChallengeSummary;
    }>
  | AuthReadyState;

export interface LoginWithCredentialsPort
  extends UseCase<LoginWithCredentialsInput, LoginWithCredentialsOutput> {}

export type VerifyMfaChallengeInput = Readonly<{
  challengeId: string;
  code: string;
}>;

export type VerifyMfaChallengeOutput = Readonly<{
  state: "ready";
  admin: AuthReadyAdmin;
  session: AuthReadySession;
  sessionToken: string;
}>;

export interface VerifyMfaChallengePort
  extends UseCase<VerifyMfaChallengeInput, VerifyMfaChallengeOutput> {}

export type ResolveAdminSessionInput = Readonly<{
  sessionToken: string;
}>;

export type ResolveAdminSessionOutput = Readonly<{
  admin: AuthReadyAdmin;
  session: AuthReadySession;
}>;

export interface ResolveAdminSessionPort
  extends UseCase<ResolveAdminSessionInput, ResolveAdminSessionOutput> {}

export type RefreshAdminSessionInput = Readonly<{
  sessionToken: string;
}>;

export type RefreshAdminSessionOutput = AuthReadyState;

export interface RefreshAdminSessionPort
  extends UseCase<RefreshAdminSessionInput, RefreshAdminSessionOutput> {}

export type LogoutAdminSessionInput = Readonly<{
  sessionToken: string;
}>;

export type LogoutAdminSessionOutput = Readonly<{
  status: "revoked";
}>;

export interface LogoutAdminSessionPort
  extends UseCase<LogoutAdminSessionInput, LogoutAdminSessionOutput> {}
