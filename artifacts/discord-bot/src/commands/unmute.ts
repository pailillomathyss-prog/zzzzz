import { Message, PermissionFlagsBits } from 'discord.js';
import { ch } from '../utils/channel.js';

export async function unmuteCommand(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    await ch(message).send("Tu n'as pas la permission de retirer le mute des membres.");
    return;
  }

  const target = message.mentions.members?.first();
  if (!target) {
    await ch(message).send('Mentionne un membre à démute. Exemple : `+unmute @user`');
    return;
  }

  if (!target.communicationDisabledUntil) {
    await ch(message).send(`**${target.user.tag}** n'est pas muet.`);
    return;
  }

  try {
    await target.timeout(null);
    await ch(message).send(`**${target.user.tag}** n'est plus muet.`);
  } catch {
    await ch(message).send("Une erreur est survenue lors du unmute.");
  }
}
