import { MessageReaction, User, PartialMessageReaction, PartialUser } from 'discord.js';
import { readConfig } from '../utils/config.js';
import { dmStates } from './dmMessage.js';
import { SMASH_EMOJI } from '../commands/smashpass.js';

export async function handleReactionAdd(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
): Promise<void> {
  if (user.bot) return;

  // Récupérer le message complet si partiel
  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }

  const config = readConfig();

  // Vérifier que c'est bien un message smash or pass enregistré
  if (!config.smashMessages.includes(reaction.message.id)) return;
  if (reaction.emoji.name !== SMASH_EMOJI) return;

  // Ne pas relancer un flux si l'utilisateur est déjà dans un DM
  if (dmStates.has(user.id)) {
    try {
      await user.send("Tu as déjà une participation en cours. Termine-la d'abord.");
    } catch { /* DM bloqués */ }
    return;
  }

  // Récupérer l'utilisateur complet si partiel
  const fullUser = user.partial ? await user.fetch() : user;

  // Initialiser l'état DM
  dmStates.set(fullUser.id, {
    state: 'waiting_choice',
    anonymous: false,
    guildId: reaction.message.guildId ?? '',
  });

  try {
    await fullUser.send(
      "Tu veux participer en mode **anonyme** (ta photo sans ton nom) ou **normal** (avec ta mention) ?\nRéponds avec `anonyme` ou `normal`."
    );
  } catch {
    // L'utilisateur a les DM bloqués
    dmStates.delete(fullUser.id);
    try {
      const msg = await reaction.message.fetch();
      await msg.reply(
        `${fullUser}, active les DM pour pouvoir participer (Paramètres → Confidentialité).`
      );
    } catch { /* ignorer */ }
  }
}
