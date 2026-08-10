import { Message } from 'discord.js';
import { ch } from '../utils/channel.js';
import {
  claimDaily,
  DAILY_REWARD,
  formatRemaining,
  getBalance,
} from '../utils/economy.js';

export async function balanceCommand(message: Message): Promise<void> {
  await ch(message).send(
    `💰 **${message.author.username}**, tu as **${getBalance(message.guild!.id, message.author.id)}** pièces.`
  );
}

export async function dailyCommand(message: Message): Promise<void> {
  const result = claimDaily(message.guild!.id, message.author.id);
  if (!result.ok) {
    await ch(message).send(`Tu as déjà récupéré ta récompense quotidienne. Reviens dans **${formatRemaining(result.remaining)}**.`);
    return;
  }

  await ch(message).send(
    `🎁 Tu reçois **${DAILY_REWARD}** pièces ! Ton solde est maintenant de **${result.balance}** pièces.`
  );
}