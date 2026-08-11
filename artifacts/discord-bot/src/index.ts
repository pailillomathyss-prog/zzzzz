import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { handleMessage } from './events/messageCreate.js';
import { handlePresenceUpdate } from './events/presenceUpdate.js';
import { handleInteraction } from './events/interactionCreate.js';
import { handleReactionAdd } from './events/reactionAdd.js';
import { handleDmMessage } from './events/dmMessage.js';
import { resumeGiveaways } from './utils/giveaways.js';

if (!process.env.DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN manquant. Ajoutez-le dans les secrets Replit.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
});

client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user?.tag}`);
  console.log(`📡 Serveurs : ${client.guilds.cache.size}`);
  resumeGiveaways(client);
});

client.on('messageCreate', (msg) => {
  if (!msg.guild) {
    handleDmMessage(msg, client);
  } else {
    handleMessage(msg);
  }
});

client.on('presenceUpdate', handlePresenceUpdate);
client.on('interactionCreate', handleInteraction);
client.on('messageReactionAdd', handleReactionAdd);

client.on('error', (err) => {
  console.error('Erreur Discord :', err.message);
});

client.login(process.env.DISCORD_TOKEN);
