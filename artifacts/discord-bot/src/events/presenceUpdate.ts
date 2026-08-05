import { Presence } from 'discord.js';
import { readConfig } from '../utils/config.js';

const TRIGGER = '/vivant';

export async function handlePresenceUpdate(
  _oldPresence: Presence | null,
  newPresence: Presence
): Promise<void> {
  const config = readConfig();
  if (!config.rankRoleId) return;

  const member = newPresence.member;
  if (!member || member.user.bot) return;

  const guild = newPresence.guild;
  if (!guild) return;

  const role = guild.roles.cache.get(config.rankRoleId);
  if (!role) return;

  // Chercher le statut personnalisé dans les activités
  const customStatus = newPresence.activities.find((a) => a.type === 4);
  const hasVivant = customStatus?.state?.toLowerCase().includes(TRIGGER) ?? false;

  const hasRole = member.roles.cache.has(role.id);

  try {
    if (hasVivant && !hasRole) {
      await member.roles.add(role, 'Statut /vivant détecté');
    } else if (!hasVivant && hasRole) {
      await member.roles.remove(role, 'Statut /vivant retiré');
    }
  } catch {
    // Ignorer les erreurs de permissions
  }
}
