import { Message } from 'discord.js';
import { ch } from '../utils/channel.js';

const MESSAGES = [
  "C'est fini. 💔",
  "Retour à la vie de célibataire. 🕊️",
  "Parfois les chemins se séparent. 💔",
  "C'était beau, mais c'est terminé. 🥀",
  "La bague est rendue. 💔",
];

export async function ruptureCommand(message: Message): Promise<void> {
  const target = message.mentions.members?.first();

  if (!target) {
    await ch(message).send('Mentionne la personne avec qui rompre. Exemple : `+rupture @user`');
    return;
  }

  if (target.id === message.author.id) {
    await ch(message).send("Tu ne peux pas rompre avec toi-même.");
    return;
  }

  if (target.user.bot) {
    await ch(message).send("Pas de rupture avec un bot.");
    return;
  }

  const phrase = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  await ch(message).send(
    `💔 **${message.author.username}** rompt avec **${target.user.username}**. ${phrase}`
  );
}
