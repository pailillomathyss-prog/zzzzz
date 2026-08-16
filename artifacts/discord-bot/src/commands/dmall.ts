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

  let members;
  try {
    members = await message.guild!.members.fetch();
  } catch (error) {
    console.error('Erreur récupération membres pour +dmall :', error);
    await ch(message).send(
      "Impossible de récupérer les membres. Vérifie que l'intent privilégié **Server Members Intent** est activé dans le portail Discord."
    );
    return;
  }

  const recipients = [...members.values()].filter(
    (member) => !member.user.bot && !member.user.system
  );

  if (recipients.length === 0) {
    await ch(message).send(
      "Aucun membre n'a été trouvé. Active **Server Members Intent** dans le portail Discord, puis redémarre le bot."
    );
    return;
  }

  await ch(message).send(
    `📨 Envoi de l'annonce à **${recipients.length}** membre(s) du serveur.`
  );

  let sent = 0;
  let failed = 0;
  const failureReasons = new Map<string, number>();

  for (const [index, member] of recipients.entries()) {
    try {
      await member.user.send(`📢 **Annonce de ${message.guild!.name}**\n${text}\n${invite}`);
      sent++;
    } catch (error) {
      const reason = error instanceof Error ? error.message.slice(0, 80) : 'Erreur Discord inconnue';
      failureReasons.set(reason, (failureReasons.get(reason) ?? 0) + 1);
      failed++;
    }

    if (index < recipients.length - 1) {
      await wait(DELAY_BETWEEN_DMS);
    }
  }

  await ch(message).send(
    `✅ Annonce terminée : **${sent}** DM envoyé(s), **${failed}** impossible(s).` +
      (failed > 0
        ? `\nLes DM impossibles sont généralement dus aux paramètres de confidentialité des membres.`
        : '')
  );

  if (failed > 0) {
    console.error(
      '+dmall résultats :',
      Object.fromEntries(failureReasons.entries())
    );
  }
}