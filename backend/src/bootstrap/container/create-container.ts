import { loadBootstrapConfig, type BootstrapConfig } from "../config";

export type BootstrapContainer = Readonly<{
  config: BootstrapConfig;
}>;

type BootstrapEnv = Readonly<Record<string, string | undefined>>;

export const createContainer = (
  env: BootstrapEnv = Bun.env,
): BootstrapContainer => ({
  config: loadBootstrapConfig(env),
});
