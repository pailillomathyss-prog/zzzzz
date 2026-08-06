import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, '../../data/config.json');

export interface Config {
  rankRoleId: string | null;
  antiLinkEnabled: boolean;
  antiLinkExemptRoles: string[];
  rolePanels: Record<string, { messageId: string; channelId: string; roleIds: string[] }>;
  smashChannelId: string | null;
  smashMessages: string[];
}

export function readConfig(): Config {
  try {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as Partial<Config>;
    return {
      rankRoleId: raw.rankRoleId ?? null,
      antiLinkEnabled: raw.antiLinkEnabled ?? true,
      antiLinkExemptRoles: raw.antiLinkExemptRoles ?? [],
      rolePanels: raw.rolePanels ?? {},
      smashChannelId: raw.smashChannelId ?? null,
      smashMessages: raw.smashMessages ?? [],
    };
  } catch {
    return {
      rankRoleId: null,
      antiLinkEnabled: true,
      antiLinkExemptRoles: [],
      rolePanels: {},
      smashChannelId: null,
      smashMessages: [],
    };
  }
}

export function writeConfig(config: Config): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
