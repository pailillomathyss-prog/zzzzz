import { Message } from 'discord.js';
import { ch } from '../utils/channel.js';
import { getMarriagePartner, saveMarriage } from '../utils/marriages.js';

const ACCEPT_EMOJI = '💍';
const REFUSE_EMOJI = '❌';
const SUCCESS_CHANCE = 65; // % de chance que le mariage réussisse

export async function marryCommand(message: Message): Promise<void> {
  const target = message.mentions.members?.first();

  if (!target) {
    await ch(message).send('Mentionne quelqu\'un à demander en mariage. Exemple : `+marry @user`');
    return;
  }

  if (target.id === message.author.id) {
    await ch(message).send("Tu ne peux pas te marier avec toi-même.");
    return;
  }

  if (target.user.bot) {
    await ch(message).send("Les bots ne se marient pas.");
    return;
  }

  if (getMarriagePartner(message.author.id) || getMarriagePartner(target.id)) {
    await ch(message).send('Impossible : toi ou cette personne êtes déjà marié(e). 💍');
    return;
  }

  // Envoyer la demande
  const proposal = await ch(message).send(
    `💌 ${target}, **${message.author.username}** te demande en mariage !\nRéagis avec ${ACCEPT_EMOJI} pour accepter ou ${REFUSE_EMOJI} pour refuser. (60 secondes)`
  );

  await proposal.react(ACCEPT_EMOJI);
  await proposal.react(REFUSE_EMOJI);

  // Attendre la réaction du membre ciblé uniquement
  let collected;
  try {
    collected = await proposal.awaitReactions({
      filter: (reaction, user) =>
        user.id === target.id &&
        (reaction.emoji.name === ACCEPT_EMOJI || reaction.emoji.name === REFUSE_EMOJI),
      max: 1,
      time: 60_000,
      errors: ['time'],
    });
  } catch {
    // Timeout — pas de réponse
    await proposal.edit(
      `💌 ${target}, **${message.author.username}** t'a demandé en mariage mais tu n'as pas répondu… 💔`
    );
    return;
  }

  const reaction = collected.first();

  // Refus
  if (reaction?.emoji.name === REFUSE_EMOJI) {
    await proposal.edit(
      `💔 **${target.user.username}** a refusé la demande en mariage de **${message.author.username}**. Aïe.`
    );
    return;
  }

  // Acceptation → tirage au sort
  if (getMarriagePartner(message.author.id) || getMarriagePartner(target.id)) {
    await proposal.edit('💔 Cette demande est annulée : toi ou cette personne êtes maintenant déjà marié(e).');
    return;
  }

  const roll = Math.floor(Math.random() * 100) + 1; // 1–100
  const success = roll <= SUCCESS_CHANCE;

  if (success) {
    saveMarriage(message.author.id, target.id);
    await proposal.edit(
      `🎉 **${target.user.username}** a accepté ! (${roll}% ≤ ${SUCCESS_CHANCE}% — succès ✅)\n` +
      `Félicitations à **${message.author.username}** et **${target.user.username}** pour leur mariage ! 💍`
    );
  } else {
    await proposal.edit(
      `😬 **${target.user.username}** a accepté… mais le destin en a décidé autrement. (${roll}% > ${SUCCESS_CHANCE}% — échec ❌)\n` +
      `**${message.author.username}** et **${target.user.username}** devront réessayer une prochaine fois.`
    );
  }
}
