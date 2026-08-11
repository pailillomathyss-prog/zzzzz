import { Message, PermissionFlagsBits } from 'discord.js';
import { ch } from '../utils/channel.js';
import { addBalance, getBalance } from '../utils/economy.js';

const MAX_GENERATED_AMOUNT = 1_000_000;

export async function moneyCommand(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
    await ch(message).send("Tu n'as pas la permission de générer de l'argent.");
    return;
  }

  const target = message.mentions.members?.first();
  const amount = Number(args.find((arg) => /^\d+$/.test(arg)));

  if (!target || !Number.isSafeInteger(amount) || amount < 1 || amount > MAX_GENERATED_AMOUNT) {
    await ch(message).send(
      'Utilise `+money @user <montant>` avec un montant entre 1 et 1 000 000. Exemple : `+money @Alex 500`'
    );
    return;
  }

  if (target.user.bot) {
    await ch(message).send("Tu ne peux pas donner de l'argent à un bot.");
    return;
  }

  const balance = addBalance(message.guild!.id, target.id, amount);
  await ch(message).send(
    `💰 **${amount}** pièces ont été ajoutées au compte de **${target.user.username}**.\n` +
    `Nouveau solde : **${balance}** pièces.`
  );
}