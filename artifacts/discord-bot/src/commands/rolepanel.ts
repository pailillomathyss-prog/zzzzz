import {
  Message,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { ch } from '../utils/channel.js';
import { readConfig, writeConfig } from '../utils/config.js';

export async function rolepanelCommand(message: Message): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await ch(message).send("Tu n'as pas la permission de créer un panel de rôles.");
    return;
  }

  const roles = message.mentions.roles;
  if (roles.size === 0) {
    await ch(message).send(
      'Mentionne les rôles à inclure dans le panel. Exemple : `+rolepanel @Membre @VIP @Staff`\nLes membres pourront cliquer sur les boutons pour obtenir ou retirer ces rôles.'
    );
    return;
  }

  if (roles.size > 25) {
    await ch(message).send('Tu ne peux pas mettre plus de 25 rôles dans un panel.');
    return;
  }

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  let currentRow = new ActionRowBuilder<ButtonBuilder>();
  let buttonsInRow = 0;

  for (const [, role] of roles) {
    if (buttonsInRow === 5) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder<ButtonBuilder>();
      buttonsInRow = 0;
    }
    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`rolepanel_${role.id}`)
        .setLabel(role.name)
        .setStyle(ButtonStyle.Secondary)
    );
    buttonsInRow++;
  }

  if (buttonsInRow > 0) rows.push(currentRow);

  const panelMessage = await ch(message).send({
    content: '**Panel de rôles** — Clique sur un bouton pour obtenir ou retirer le rôle correspondant.',
    components: rows,
  });

  // Sauvegarder dans la config
  const config = readConfig();
  config.rolePanels[panelMessage.id] = {
    messageId: panelMessage.id,
    channelId: message.channelId,
    roleIds: roles.map((r) => r.id),
  };
  writeConfig(config);

  try {
    await message.delete();
  } catch {
    // Ignorer si impossible
  }
}
