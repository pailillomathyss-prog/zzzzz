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
import { smashpassCommand } from '../commands/smashpass.js';
import { setsmashCommand } from '../commands/setsmash.js';
import { marryCommand } from '../commands/marry.js';
import { clearCommand } from '../commands/clear.js';
import { ruptureCommand } from '../commands/rupture.js';
import { balanceCommand, dailyCommand } from '../commands/economy.js';
import { blackjackCommand, hitCommand, standCommand } from '../commands/blackjack.js';
import { buyCommand, shopCommand, shopRoleCommand } from '../commands/shop.js';

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
    case 'smashpass':
      await smashpassCommand(message);
      break;
    case 'setsmash':
      await setsmashCommand(message);
      break;
    case 'marry':
      await marryCommand(message);
      break;
    case 'clear':
      await clearCommand(message, args);
      break;
    case 'rupture':
      await ruptureCommand(message);
      break;
    case 'balance':
    case 'bal':
      await balanceCommand(message);
      break;
    case 'daily':
      await dailyCommand(message);
      break;
    case 'blackjack':
    case 'bj':
      await blackjackCommand(message, args);
      break;
    case 'tirer':
    case 'hit':
      await hitCommand(message);
      break;
    case 'rester':
    case 'stand':
      await standCommand(message);
      break;
    case 'shop':
      await shopCommand(message);
      break;
    case 'shoprole':
      await shopRoleCommand(message, args);
      break;
    case 'buy':
    case 'acheter':
      await buyCommand(message, args);
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
        '`+giveaway <durée> <lot>` — Lancer un giveaway (ex: `+giveaway 10m Nitro`)\n' +
        '`+setsmash #salon` — Configurer le salon de publication smash or pass\n' +
        '`+smashpass` — Lancer un smash or pass (réaction 🔥 → DM → photo)\n' +
        '`+marry @user` — Faire une demande en mariage (avec chance de réussite)\n' +
        '`+rupture @user` — Rompre avec son/sa partenaire\n' +
        '`+balance` — Voir son solde de pièces\n' +
        '`+daily` — Récupérer 500 pièces toutes les 24 heures\n' +
        '`+blackjack <mise>` — Jouer au blackjack avec une mise de 50 à 500\n' +
        '`+tirer` / `+rester` — Jouer son tour de blackjack\n' +
        '`+shop` — Voir les rôles disponibles à l’achat\n' +
        '`+buy <numéro>` — Acheter un rôle du shop\n' +
        '`+shoprole @role <prix>` — Ajouter ou modifier un rôle du shop (staff)'
      );
      break;
    default:
      break;
  }
}
