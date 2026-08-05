import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { handleMessage } from './events/messageCreate.js';
import { handlePresenceUpdate } from './events/presenceUpdate.js';
import { handleInteraction } from './events/interactionCreate.js';

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
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user?.tag}`);
  console.log(`📡 Serveurs : ${client.guilds.cache.size}`);
});

client.on('messageCreate', handleMessage);
client.on('presenceUpdate', handlePresenceUpdate);
client.on('interactionCreate', handleInteraction);

client.on('error', (err) => {
  console.error('Erreur Discord :', err.message);
});

client.login(process.env.DISCORD_TOKEN);
