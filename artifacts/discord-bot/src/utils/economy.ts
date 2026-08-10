import { readConfig, writeConfig } from './config.js';

export const DAILY_REWARD = 500;
export const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;

function key(guildId: string, userId: string): string {
  return `${guildId}:${userId}`;
}

export function getBalance(guildId: string, userId: string): number {
  return readConfig().balances[key(guildId, userId)] ?? 0;
}

export function addBalance(guildId: string, userId: string, amount: number): number {
  const config = readConfig();
  const balanceKey = key(guildId, userId);
  config.balances[balanceKey] = Math.max(0, (config.balances[balanceKey] ?? 0) + amount);
  writeConfig(config);
  return config.balances[balanceKey];
}

export function spendBalance(guildId: string, userId: string, amount: number): boolean {
  const config = readConfig();
  const balanceKey = key(guildId, userId);
  const balance = config.balances[balanceKey] ?? 0;
  if (balance < amount) return false;
  config.balances[balanceKey] = balance - amount;
  writeConfig(config);
  return true;
}

export function claimDaily(guildId: string, userId: string): { ok: true; balance: number } | { ok: false; remaining: number } {
  const config = readConfig();
  const dailyKey = key(guildId, userId);
  const now = Date.now();
  const lastClaim = config.lastDaily[dailyKey] ?? 0;
  const elapsed = now - lastClaim;

  if (elapsed < DAILY_COOLDOWN) {
    return { ok: false, remaining: DAILY_COOLDOWN - elapsed };
  }

  config.lastDaily[dailyKey] = now;
  config.balances[dailyKey] = (config.balances[dailyKey] ?? 0) + DAILY_REWARD;
  writeConfig(config);
  return { ok: true, balance: config.balances[dailyKey] };
}

export function formatRemaining(milliseconds: number): string {
  const totalMinutes = Math.ceil(milliseconds / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} h ${minutes} min`;
}