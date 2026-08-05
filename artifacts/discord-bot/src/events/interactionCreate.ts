import { Interaction } from 'discord.js';
import { readConfig } from '../utils/config.js';

export async function handleInteraction(interaction: Interaction): Promise<void> {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith('rolepanel_')) return;

  const roleId = interaction.customId.replace('rolepanel_', '');
  const config = readConfig();

  // Vérifier que ce bouton appartient bien à un panel enregistré
  const panel = Object.values(config.rolePanels).find(
    (p) => p.messageId === interaction.message.id && p.roleIds.includes(roleId)
  );

  if (!panel) {
    await interaction.reply({ content: "Ce panel n'est plus valide.", ephemeral: true });
    return;
  }

  const guild = interaction.guild;
  if (!guild) return;

  const role = guild.roles.cache.get(roleId);
  if (!role) {
    await interaction.reply({ content: "Ce rôle n'existe plus.", ephemeral: true });
    return;
  }

  const member = await guild.members.fetch(interaction.user.id).catch(() => null);
  if (!member) return;

  try {
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(role);
      await interaction.reply({ content: `Rôle **${role.name}** retiré.`, ephemeral: true });
    } else {
      await member.roles.add(role);
      await interaction.reply({ content: `Rôle **${role.name}** obtenu.`, ephemeral: true });
    }
  } catch {
    await interaction.reply({
      content: "Impossible de modifier ton rôle. Vérifie que le bot a la permission Gérer les rôles.",
      ephemeral: true,
    });
  }
}
