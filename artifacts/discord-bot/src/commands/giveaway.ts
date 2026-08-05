import { Message, PermissionFlagsBits } from 'discord.js';
import { ch } from '../utils/channel.js';

const EMOJI = '🎉';

function parseDuration(raw: string): number | null {
  const match = raw.match(/^(\d+)(s|m|h)?$/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const unit = (match[2] ?? 'm').toLowerCase();
  if (unit === 's') return value * 1000;
  if (unit === 'm') return value * 60 * 1000;
  if (unit === 'h') return value * 3600 * 1000;
  return null;
}

export async function giveawayCommand(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    await ch(message).send("Tu n'as pas la permission de lancer un giveaway.");
    return;
  }

  if (args.length < 2) {
    await ch(message).send(
      'Usage : `+giveaway <durée> <lot>`\nExemple : `+giveaway 10m Nitro`, `+giveaway 1h VIP`, `+giveaway 30s Rôle exclusif`\nUnités : `s` secondes, `m` minutes, `h` heures'
    );
    return;
  }

  const duration = parseDuration(args[0]);
  if (!duration || duration < 5000) {
    await ch(message).send('Durée invalide. Exemples valides : `30s`, `10m`, `2h` (minimum 5 secondes).');
    return;
  }

  const prize = args.slice(1).join(' ');
  const endsAt = Math.floor((Date.now() + duration) / 1000);

  // Message simple, aucun panel
  const giveawayMsg = await ch(message).send(
    `**GIVEAWAY** — ${prize}\nRéagis avec ${EMOJI} pour participer !\nFin <t:${endsAt}:R>`
  );

  await giveawayMsg.react(EMOJI);

  // Supprimer la commande
  try { await message.delete(); } catch { /* ignorer */ }

  setTimeout(async () => {
    try {
      const fetched = await giveawayMsg.fetch();
      const reaction = fetched.reactions.cache.get(EMOJI);

      if (!reaction) {
        await ch(message).send(`Giveaway **${prize}** terminé — aucune participation.`);
        return;
      }

      const users = await reaction.users.fetch();
      const participants = users.filter((u) => !u.bot);

      if (participants.size === 0) {
        await ch(message).send(`Giveaway **${prize}** terminé — aucune participation.`);
        return;
      }

      const winner = participants.random();
      await ch(message).send(
        `Giveaway terminé ! Félicitations ${winner} tu remportes **${prize}** 🎉`
      );
    } catch {
      await ch(message).send(`Impossible de tirer le gagnant du giveaway **${prize}**.`);
    }
  }, duration);
}
