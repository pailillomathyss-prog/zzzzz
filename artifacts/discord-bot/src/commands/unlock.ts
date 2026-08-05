import { Message, PermissionFlagsBits, TextChannel } from 'discord.js';
import { ch } from '../utils/channel.js';

export async function unlockCommand(message: Message): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await ch(message).send("Tu n'as pas la permission de déverrouiller des salons.");
    return;
  }

  const channel = message.channel as TextChannel;
  const everyoneRole = message.guild?.roles.everyone;
  if (!everyoneRole) return;

  try {
    await channel.permissionOverwrites.edit(everyoneRole, {
      SendMessages: null,
      SendMessagesInThreads: null,
      CreatePublicThreads: null,
      CreatePrivateThreads: null,
    });

    await ch(message).send(`Le salon **${channel.name}** est déverrouillé.`);
  } catch {
    await ch(message).send("Une erreur est survenue lors du déverrouillage.");
  }
}
