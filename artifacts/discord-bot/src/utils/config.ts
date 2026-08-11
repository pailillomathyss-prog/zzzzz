import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bundledConfigPath = resolve(__dirname, '../../data/config.json');
const configuredDataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH ?? process.env.BOT_DATA_DIR;
const dataDir = configuredDataDir ? resolve(configuredDataDir) : dirname(bundledConfigPath);
const CONFIG_PATH = resolve(dataDir, 'config.json');

function prepareDataDirectory(): void {
  if (!configuredDataDir) return;

  mkdirSync(dataDir, { recursive: true });

  // Keep existing settings when a new Railway volume is attached for the first time.
  if (!existsSync(CONFIG_PATH) && existsSync(bundledConfigPath)) {
    copyFileSync(bundledConfigPath, CONFIG_PATH);
  }
}

prepareDataDirectory();

export interface Config {
  rankRoleId: string | null;
  antiLinkEnabled: boolean;
  antiLinkExemptRoles: string[];
  rolePanels: Record<string, { messageId: string; channelId: string; roleIds: string[] }>;
  smashChannelId: string | null;
  smashMessages: string[];
  marriages: Record<string, string>;
  balances: Record<string, number>;
  lastDaily: Record<string, number>;
  shopRoles: Record<string, Array<{ roleId: string; price: number }>>;
  activeBlackjack: Record<string, {
    channelId: string;
    bet: number;
    deck: Array<{ rank: string; suit: string; value: number }>;
    player: Array<{ rank: string; suit: string; value: number }>;
    dealer: Array<{ rank: string; suit: string; value: number }>;
  }>;
  activeGiveaways: Record<string, {
    messageId: string;
    channelId: string;
    prize: string;
    endsAt: number;
  }>;
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
      marriages: raw.marriages ?? {},
      balances: raw.balances ?? {},
      lastDaily: raw.lastDaily ?? {},
      shopRoles: raw.shopRoles ?? {},
      activeBlackjack: raw.activeBlackjack ?? {},
      activeGiveaways: raw.activeGiveaways ?? {},
    };
  } catch {
    return {
      rankRoleId: null,
      antiLinkEnabled: true,
      antiLinkExemptRoles: [],
      rolePanels: {},
      smashChannelId: null,
      smashMessages: [],
      marriages: {},
      balances: {},
      lastDaily: {},
      shopRoles: {},
      activeBlackjack: {},
      activeGiveaways: {},
    };
  }
}

export function writeConfig(config: Config): void {
  mkdirSync(dataDir, { recursive: true });
  const temporaryPath = `${CONFIG_PATH}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
  renameSync(temporaryPath, CONFIG_PATH);
}
