import { Client, Message, TextChannel } from 'discord.js';
import { readConfig } from '../utils/config.js';

// Machine d'état en mémoire : userId → état du flux DM
export interface DmState {
  state: 'waiting_choice' | 'waiting_photo';
  anonymous: boolean;
  guildId: string;
}

export const dmStates = new Map<string, DmState>();

export async function handleDmMessage(message: Message, client: Client): Promise<void> {
  if (message.author.bot || message.guild) return;

  const state = dmStates.get(message.author.id);
  if (!state) return; // L'utilisateur n'est pas dans un flux smash or pass

  // ── Étape 1 : choix anonyme ou normal ─────────────────────────────────────
  if (state.state === 'waiting_choice') {
    const response = message.content.trim().toLowerCase();

    if (response === 'anonyme') {
      state.anonymous = true;
      state.state = 'waiting_photo';
      await message.author.send("Mode **anonyme** choisi. Envoie maintenant ta photo.");
    } else if (response === 'normal') {
      state.anonymous = false;
      state.state = 'waiting_photo';
      await message.author.send("Mode **normal** choisi. Envoie maintenant ta photo.");
    } else {
      await message.author.send(
        "Réponds avec `anonyme` ou `normal` pour choisir ton mode de participation."
      );
    }
    return;
  }

  // ── Étape 2 : réception de la photo ───────────────────────────────────────
  if (state.state === 'waiting_photo') {
    const attachment = message.attachments.find(
      (a) => a.contentType?.startsWith('image/') ?? false
    );

    if (!attachment) {
      await message.author.send("Envoie une image (jpg, png, gif…).");
      return;
    }

    // Chercher le salon smash or pass dans la config
    const config = readConfig();
    if (!config.smashChannelId) {
      await message.author.send(
        "Le salon smash or pass n'est pas configuré. Contacte un admin."
      );
      dmStates.delete(message.author.id);
      return;
    }

    // Trouver le salon dans n'importe quel serveur où le bot est présent
    let smashChannel: TextChannel | null = null;
    for (const guild of client.guilds.cache.values()) {
      const chan = guild.channels.cache.get(config.smashChannelId);
      if (chan?.isTextBased()) {
        smashChannel = chan as TextChannel;
        break;
      }
    }

    if (!smashChannel) {
      await message.author.send(
        "Impossible de trouver le salon smash or pass. Contacte un admin."
      );
      dmStates.delete(message.author.id);
      return;
    }

    // Publier la photo
    const identity = state.anonymous
      ? '**Anonyme**'
      : `<@${message.author.id}>`;

    const posted = await smashChannel.send({
      content: `**Smash or Pass ?** — ${identity}`,
      files: [attachment.url],
    });

    await posted.react('😍');
    await posted.react('💀');

    await message.author.send("Ta photo a été publiée ! Bonne chance 🔥");
    dmStates.delete(message.author.id);
  }
}
