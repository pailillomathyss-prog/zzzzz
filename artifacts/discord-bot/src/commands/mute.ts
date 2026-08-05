import { Message, PermissionFlagsBits } from 'discord.js';
import { ch } from '../utils/channel.js';

export async function muteCommand(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    await ch(message).send("Tu n'as pas la permission de rendre muet des membres.");
    return;
  }

  const target = message.mentions.members?.first();
  if (!target) {
    await ch(message).send('Mentionne un membre à rendre muet. Exemple : `+mute @user 10 raison`');
    return;
  }

  if (!target.moderatable) {
    await ch(message).send("Je ne peux pas rendre muet ce membre.");
    return;
  }

  const rawDuration = parseInt(args[1] ?? '10', 10);
  const durationMinutes = isNaN(rawDuration) ? 10 : Math.max(1, Math.min(rawDuration, 40320));
  const reasonStart = isNaN(parseInt(args[1] ?? '', 10)) ? 1 : 2;
  const reason = args.slice(reasonStart).join(' ') || 'Aucune raison fournie';

  try {
    await target.timeout(durationMinutes * 60 * 1000, reason);
    await ch(message).send(`**${target.user.tag}** est rendu muet pour ${durationMinutes} minute(s). Raison : ${reason}`);
  } catch {
    await ch(message).send("Une erreur est survenue lors du mute.");
  }
}
