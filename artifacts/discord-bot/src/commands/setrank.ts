import { Message, PermissionFlagsBits } from 'discord.js';
import { ch } from '../utils/channel.js';
import { readConfig, writeConfig } from '../utils/config.js';

export async function setrankCommand(message: Message): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await ch(message).send("Tu n'as pas la permission de configurer le rang automatique.");
    return;
  }

  const role = message.mentions.roles.first();
  if (!role) {
    await ch(message).send(
      'Mentionne le rôle à donner automatiquement quand `/vivant` est dans le statut. Exemple : `+setrank @Vivant`'
    );
    return;
  }

  const config = readConfig();
  config.rankRoleId = role.id;
  writeConfig(config);

  await ch(message).send(
    `Rôle automatique configuré : **${role.name}**. Il sera donné à tout membre ayant \`/vivant\` dans son statut personnalisé.`
  );
}
