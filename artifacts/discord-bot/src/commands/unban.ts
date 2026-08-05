import { Message, PermissionFlagsBits } from 'discord.js';
import { ch } from '../utils/channel.js';

export async function unbanCommand(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
    await ch(message).send("Tu n'as pas la permission de débannir des membres.");
    return;
  }

  const userId = args[0];
  if (!userId) {
    await ch(message).send('Fournis un ID utilisateur. Exemple : `+unban 123456789`');
    return;
  }

  try {
    const bans = await message.guild?.bans.fetch();
    const bannedUser = bans?.get(userId);

    if (!bannedUser) {
      await ch(message).send("Cet utilisateur n'est pas banni.");
      return;
    }

    await message.guild?.members.unban(userId);
    await ch(message).send(`**${bannedUser.user.tag}** a été débanni.`);
  } catch {
    await ch(message).send("Une erreur est survenue lors du débannissement. Vérifie l'ID.");
  }
}
