import { readConfig, writeConfig } from './config.js';

export function getMarriagePartner(userId: string): string | null {
  return readConfig().marriages[userId] ?? null;
}

export function saveMarriage(firstUserId: string, secondUserId: string): void {
  const config = readConfig();
  config.marriages[firstUserId] = secondUserId;
  config.marriages[secondUserId] = firstUserId;
  writeConfig(config);
}

export function removeMarriage(firstUserId: string, secondUserId: string): void {
  const config = readConfig();
  delete config.marriages[firstUserId];
  delete config.marriages[secondUserId];
  writeConfig(config);
}