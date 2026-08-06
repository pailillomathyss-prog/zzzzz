import { Message, PermissionFlagsBits, TextChannel } from 'discord.js';
import { ch } from '../utils/channel.js';

export async function clearCommand(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    await ch(message).send("Tu n'as pas la permission de supprimer des messages.");
    return;
  }

  const amount = parseInt(args[0] ?? '', 10);
  if (isNaN(amount) || amount < 1 || amount > 100) {
    await ch(message).send('Indique un nombre entre 1 et 100. Exemple : `+clear 10`');
    return;
  }

  const channel = message.channel as TextChannel;

  try {
    // +1 pour inclure le message de commande lui-même
    const deleted = await channel.bulkDelete(amount + 1, true);
    const count = deleted.size - 1;
    const confirm = await ch(message).send(`${count} message(s) supprimé(s).`);
    setTimeout(() => confirm.delete().catch(() => {}), 4000);
  } catch {
    await ch(message).send('Impossible de supprimer les messages (peut-être trop anciens, +14 jours).');
  }
}
