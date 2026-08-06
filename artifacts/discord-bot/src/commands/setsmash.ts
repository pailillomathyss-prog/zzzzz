import { Message, PermissionFlagsBits } from 'discord.js';
import { ch } from '../utils/channel.js';
import { readConfig, writeConfig } from '../utils/config.js';

export async function setsmashCommand(message: Message): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await ch(message).send("Tu n'as pas la permission de configurer le smash or pass.");
    return;
  }

  const channel = message.mentions.channels.first();
  if (!channel) {
    await ch(message).send(
      'Mentionne le salon où les photos seront publiées. Exemple : `+setsmash #smash-or-pass`'
    );
    return;
  }

  const config = readConfig();
  config.smashChannelId = channel.id;
  writeConfig(config);

  await ch(message).send(
    `Salon smash or pass configuré : <#${channel.id}>. Les photos y seront publiées automatiquement.`
  );
}
