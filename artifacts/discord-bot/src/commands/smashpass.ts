import { Message, PermissionFlagsBits } from 'discord.js';
import { ch } from '../utils/channel.js';
import { readConfig, writeConfig } from '../utils/config.js';

export const SMASH_EMOJI = '🔥';

export async function smashpassCommand(message: Message): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    await ch(message).send("Tu n'as pas la permission de lancer un smash or pass.");
    return;
  }

  const config = readConfig();
  if (!config.smashChannelId) {
    await ch(message).send(
      "Configure d'abord le salon de publication avec `+setsmash #salon`."
    );
    return;
  }

  const participationMsg = await ch(message).send(
    `**Smash or Pass** — Tu veux participer ?\nRéagis avec ${SMASH_EMOJI} et le bot te contacte en DM.`
  );

  await participationMsg.react(SMASH_EMOJI);

  // Enregistrer l'ID du message pour écouter les réactions
  config.smashMessages.push(participationMsg.id);
  writeConfig(config);

  try { await message.delete(); } catch { /* ignorer */ }
}
