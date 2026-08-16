import { Message, PermissionFlagsBits } from 'discord.js';
import { ch } from '../utils/channel.js';

const DISCORD_INVITE = /^https?:\/\/(?:discord\.gg|discord\.com\/invite)\/[A-Za-z0-9-]+$/i;
const DELAY_BETWEEN_DMS = 1_000;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function dmallCommand(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
    await ch(message).send("Tu n'as pas la permission d'envoyer une annonce générale.");
    return;
  }

  const invite = args[0];
  const text = args.slice(1).join(' ').trim();

  if (!invite || !DISCORD_INVITE.test(invite) || !text) {
    await ch(message).send(
      'Utilise `+dmall <lien-invitation> <message>`.\n' +
      'Exemple : `+dmall https://discord.gg/exemple Rejoins-nous samedi pour notre événement !`'
    );
    return;
  }

  const members = await message.guild!.members.fetch();
  const recipients = [...members.values()].filter(
    (member) => !member.user.bot && !member.user.system
  );

  await ch(message).send(
    `📨 Envoi de l'annonce à **${recipients.length}** membre(s) du serveur.`
  );

  let sent = 0;
  let failed = 0;

  for (const [index, member] of recipients.entries()) {
    try {
      await member.send(`📢 **Annonce de ${message.guild!.name}**\n${text}\n${invite}`);
      sent++;
    } catch {
      // Les DM fermés ou les utilisateurs qui ont bloqué le bot sont ignorés.
      failed++;
    }

    if (index < recipients.length - 1) {
      await wait(DELAY_BETWEEN_DMS);
    }
  }

  await ch(message).send(
    `✅ Annonce terminée : **${sent}** DM envoyé(s), **${failed}** impossible(s).`
  );
}