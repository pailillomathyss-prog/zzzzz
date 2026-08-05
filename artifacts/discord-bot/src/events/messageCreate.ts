import { Message, PermissionFlagsBits } from 'discord.js';
import { containsLink } from '../utils/antilink.js';
import { readConfig } from '../utils/config.js';
import { ch } from '../utils/channel.js';
import { banCommand } from '../commands/ban.js';
import { unbanCommand } from '../commands/unban.js';
import { muteCommand } from '../commands/mute.js';
import { unmuteCommand } from '../commands/unmute.js';
import { lockCommand } from '../commands/lock.js';
import { unlockCommand } from '../commands/unlock.js';
import { rolepanelCommand } from '../commands/rolepanel.js';
import { setrankCommand } from '../commands/setrank.js';
import { giveawayCommand } from '../commands/giveaway.js';

const PREFIX = '+';

export async function handleMessage(message: Message): Promise<void> {
  if (message.author.bot || !message.guild) return;

  // ── Anti-lien ──────────────────────────────────────────────────────────────
  if (!message.content.startsWith(PREFIX)) {
    const config = readConfig();
    if (config.antiLinkEnabled && containsLink(message.content)) {
      const member = message.member;
      const isExempt =
        member?.permissions.has(PermissionFlagsBits.ManageMessages) ||
        member?.roles.cache.some((r) => config.antiLinkExemptRoles.includes(r.id));

      if (!isExempt) {
        try {
          await message.delete();
          const warn = await ch(message).send(
            `${message.author}, les liens ne sont pas autorisés ici.`
          );
          setTimeout(() => warn.delete().catch(() => {}), 5000);
        } catch {
          // Ignorer si la suppression échoue
        }
      }
    }
    return;
  }

  // ── Commandes avec préfixe + ────────────────────────────────────────────────
  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();

  switch (command) {
    case 'ban':
      await banCommand(message, args);
      break;
    case 'unban':
      await unbanCommand(message, args);
      break;
    case 'mute':
      await muteCommand(message, args);
      break;
    case 'unmute':
      await unmuteCommand(message, args);
      break;
    case 'lock':
      await lockCommand(message);
      break;
    case 'unlock':
      await unlockCommand(message);
      break;
    case 'rolepanel':
      await rolepanelCommand(message);
      break;
    case 'setrank':
      await setrankCommand(message);
      break;
    case 'giveaway':
      await giveawayCommand(message, args);
      break;
    case 'help':
      await ch(message).send(
        '**Commandes disponibles :**\n' +
        '`+ban @user [raison]` — Bannir un membre\n' +
        '`+unban <id>` — Débannir un utilisateur\n' +
        '`+mute @user [minutes] [raison]` — Rendre muet (défaut : 10 min)\n' +
        '`+unmute @user` — Retirer le mute\n' +
        '`+lock` — Verrouiller le salon (personne ne peut écrire)\n' +
        '`+unlock` — Déverrouiller le salon\n' +
        '`+rolepanel @role1 @role2 ...` — Créer un panel de rôles avec boutons\n' +
        '`+setrank @role` — Choisir le rôle donné quand `/vivant` est dans le statut\n' +
        '`+giveaway <durée> <lot>` — Lancer un giveaway (ex: `+giveaway 10m Nitro`)'
      );
      break;
    default:
      break;
  }
}
