export const moduleNames = ["content", "chat", "auth", "admin", "media", "shared"] as const;

export type ModuleName = (typeof moduleNames)[number];
