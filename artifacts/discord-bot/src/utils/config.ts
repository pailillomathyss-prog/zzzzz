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
}

export function readConfig(): Config {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as Config;
  } catch {
    return {
      rankRoleId: null,
      antiLinkEnabled: true,
      antiLinkExemptRoles: [],
      rolePanels: {},
    };
  }
}

export function writeConfig(config: Config): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
