import { GuildTextBasedChannel, Message } from 'discord.js';
import { readConfig, writeConfig } from './config.js';

export const GIVEAWAY_EMOJI = '🎉';

export async function finishGiveaway(
  message: Message,
  targetChannel: GuildTextBasedChannel,
  prize: string,
  giveawayId: string
): Promise<void> {
  try {
    const fetched = await message.fetch(true);
    const reaction =
      fetched.reactions.cache.get(GIVEAWAY_EMOJI) ??
      fetched.reactions.cache.find((item) => item.emoji.name === GIVEAWAY_EMOJI);

    const config = readConfig();
    delete config.activeGiveaways[giveawayId];
    writeConfig(config);

    if (!reaction) {
      await targetChannel.send(`Giveaway **${prize}** terminé — aucune participation.`);
      return;
    }

    const users = await reaction.users.fetch();
    const participants = users.filter((user) => !user.bot);
    if (participants.size === 0) {
      await targetChannel.send(`Giveaway **${prize}** terminé — aucune participation.`);
      return;
    }

    const winnerArray = [...participants.values()];
    const winner = winnerArray[Math.floor(Math.random() * winnerArray.length)];
    await targetChannel.send(
      `Giveaway terminé ! Félicitations ${winner} tu remportes **${prize}** 🎉`
    );
  } catch (error) {
    console.error('Erreur tirage giveaway :', error);
    try {
      await targetChannel.send(`Impossible de tirer le gagnant du giveaway **${prize}**.`);
    } catch {
      // Le salon peut avoir été supprimé.
    }
  }
}

export function saveGiveaway(
  messageId: string,
  channelId: string,
  prize: string,
  endsAt: number
): void {
  const config = readConfig();
  config.activeGiveaways[messageId] = { messageId, channelId, prize, endsAt };
  writeConfig(config);
}

export function scheduleGiveaway(
  client: { channels: { fetch: (id: string) => Promise<unknown> } },
  giveaway: { messageId: string; channelId: string; prize: string; endsAt: number }
): void {
  const delay = Math.max(0, giveaway.endsAt - Date.now());
  setTimeout(async () => {
    try {
      const channel = await client.channels.fetch(giveaway.channelId) as GuildTextBasedChannel | null;
      if (!channel?.isTextBased()) return;
      const message = await channel.messages.fetch(giveaway.messageId);
      await finishGiveaway(message, channel, giveaway.prize, giveaway.messageId);
    } catch (error) {
      console.error('Impossible de reprendre le giveaway après redémarrage :', error);
    }
  }, delay);
}

export function resumeGiveaways(
  client: { channels: { fetch: (id: string) => Promise<unknown> } }
): void {
  for (const giveaway of Object.values(readConfig().activeGiveaways)) {
    scheduleGiveaway(client, giveaway);
  }
}
