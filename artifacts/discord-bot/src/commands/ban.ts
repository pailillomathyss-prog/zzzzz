import { Message, PermissionFlagsBits } from 'discord.js';
import { ch } from '../utils/channel.js';

export async function banCommand(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
    await ch(message).send("Tu n'as pas la permission de bannir des membres.");
    return;
  }

  const target = message.mentions.members?.first();
  if (!target) {
    await ch(message).send('Mentionne un membre à bannir. Exemple : `+ban @user raison`');
    return;
  }

  if (!target.bannable) {
    await ch(message).send("Je ne peux pas bannir ce membre.");
    return;
  }

  const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

  try {
    await target.ban({ reason });
    await ch(message).send(`**${target.user.tag}** a été banni. Raison : ${reason}`);
  } catch {
    await ch(message).send("Une erreur est survenue lors du bannissement.");
  }
}
