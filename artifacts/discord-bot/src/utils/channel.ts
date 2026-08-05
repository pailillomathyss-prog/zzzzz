import { type GuildTextBasedChannel, type Message } from 'discord.js';

/** Retourne le canal en tant que canal texte de serveur (toujours valide en contexte guild). */
export const ch = (message: Message) => message.channel as GuildTextBasedChannel;
