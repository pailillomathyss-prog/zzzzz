import { Message, PermissionFlagsBits, TextChannel } from 'discord.js';
import { ch } from '../utils/channel.js';

export async function lockCommand(message: Message): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await ch(message).send("Tu n'as pas la permission de verrouiller des salons.");
    return;
  }

  const channel = message.channel as TextChannel;
  const everyoneRole = message.guild?.roles.everyone;
  if (!everyoneRole) return;

  try {
    // Bloquer l'envoi de messages pour @everyone
    await channel.permissionOverwrites.edit(everyoneRole, {
      SendMessages: false,
      SendMessagesInThreads: false,
      CreatePublicThreads: false,
      CreatePrivateThreads: false,
    });

    // Bloquer aussi tous les rôles qui auraient une permission explicite d'écriture
    const roles = await message.guild?.roles.fetch();
    if (roles) {
      for (const [, role] of roles) {
        if (role.id === everyoneRole.id) continue;
        const overwrite = channel.permissionOverwrites.cache.get(role.id);
        if (overwrite?.allow.has(PermissionFlagsBits.SendMessages)) {
          await channel.permissionOverwrites.edit(role, { SendMessages: false });
        }
      }
    }

    await ch(message).send(`Le salon **${channel.name}** est verrouillé. Personne ne peut écrire.`);
  } catch {
    await ch(message).send("Une erreur est survenue lors du verrouillage.");
  }
}
