import { Message, PermissionFlagsBits, GuildTextBasedChannel } from 'discord.js';
import { ch } from '../utils/channel.js';
import { finishGiveaway, GIVEAWAY_EMOJI, saveGiveaway, scheduleGiveaway } from '../utils/giveaways.js';

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

  // Stocker la référence au canal maintenant (avant la suppression éventuelle du message)
  const targetChannel = message.channel as GuildTextBasedChannel;

  const giveawayMsg = await targetChannel.send(
    `**GIVEAWAY** — ${prize}\nRéagis avec ${GIVEAWAY_EMOJI} pour participer !\nFin <t:${endsAt}:R>`
  );

  await giveawayMsg.react(GIVEAWAY_EMOJI);
  saveGiveaway(giveawayMsg.id, targetChannel.id, prize, Date.now() + duration);

  try { await message.delete(); } catch { /* ignorer */ }

  scheduleGiveaway(message.client, {
    messageId: giveawayMsg.id,
    channelId: targetChannel.id,
    prize,
    endsAt: Date.now() + duration,
  });
}
