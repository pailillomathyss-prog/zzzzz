import { Message, PermissionFlagsBits } from 'discord.js';
import { ch } from '../utils/channel.js';
import { addBalance, getBalance, spendBalance } from '../utils/economy.js';
import { readConfig, writeConfig } from '../utils/config.js';

export async function shopCommand(message: Message): Promise<void> {
  const items = readConfig().shopRoles[message.guild!.id] ?? [];
  if (items.length === 0) {
    await ch(message).send('Le shop est vide pour le moment.');
    return;
  }

  const lines = items.map((item, index) => {
    const role = message.guild!.roles.cache.get(item.roleId);
    return role ? `**${index + 1}.** ${role} — **${item.price}** pièces` : null;
  }).filter((line): line is string => line !== null);

  await ch(message).send(
    `🛒 **Shop des rôles**\n${lines.join('\n')}\nAchète avec \`+buy <numéro>\`.`
  );
}

export async function shopRoleCommand(message: Message, args: string[]): Promise<void> {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await ch(message).send("Tu n'as pas la permission de gérer le shop.");
    return;
  }

  const role = message.mentions.roles.first();
  const removing = args[0]?.toLowerCase() === 'remove' || args[0]?.toLowerCase() === 'supprimer';
  if (!role) {
    await ch(message).send('Utilise `+shoprole @role <prix>` ou `+shoprole remove @role`.');
    return;
  }

  const config = readConfig();
  const items = config.shopRoles[message.guild!.id] ?? [];
  const existingIndex = items.findIndex((item) => item.roleId === role.id);

  if (removing) {
    if (existingIndex === -1) {
      await ch(message).send('Ce rôle n’est pas dans le shop.');
      return;
    }
    items.splice(existingIndex, 1);
    config.shopRoles[message.guild!.id] = items;
    writeConfig(config);
    await ch(message).send(`**${role.name}** a été retiré du shop.`);
    return;
  }

  const price = Number(args.find((arg) => /^\d+$/.test(arg)));
  if (!Number.isInteger(price) || price < 1 || price > 1_000_000) {
    await ch(message).send('Indique un prix entier entre 1 et 1 000 000. Exemple : `+shoprole @VIP 1000`');
    return;
  }
  if (!role.editable) {
    await ch(message).send('Je ne peux pas gérer ce rôle : place mon rôle au-dessus dans la hiérarchie Discord.');
    return;
  }

  const item = { roleId: role.id, price };
  if (existingIndex === -1) items.push(item);
  else items[existingIndex] = item;
  config.shopRoles[message.guild!.id] = items;
  writeConfig(config);
  await ch(message).send(`**${role.name}** est disponible dans le shop pour **${price}** pièces.`);
}

export async function buyCommand(message: Message, args: string[]): Promise<void> {
  const number = Number(args[0]);
  const items = readConfig().shopRoles[message.guild!.id] ?? [];
  if (!Number.isInteger(number) || number < 1 || number > items.length) {
    await ch(message).send('Indique le numéro d’un rôle disponible dans `+shop`.');
    return;
  }

  const item = items[number - 1];
  const role = message.guild!.roles.cache.get(item.roleId);
  if (!role) {
    await ch(message).send('Ce rôle n’existe plus sur le serveur.');
    return;
  }
  if (message.member!.roles.cache.has(role.id)) {
    await ch(message).send('Tu possèdes déjà ce rôle.');
    return;
  }
  if (!role.editable) {
    await ch(message).send('Je ne peux pas attribuer ce rôle. Un administrateur doit placer mon rôle plus haut.');
    return;
  }
  if (getBalance(message.guild!.id, message.author.id) < item.price) {
    await ch(message).send(`Solde insuffisant. Prix : **${item.price}** pièces. Solde : **${getBalance(message.guild!.id, message.author.id)}**.`);
    return;
  }

  if (!spendBalance(message.guild!.id, message.author.id, item.price)) return;
  try {
    await message.member!.roles.add(role, 'Achat dans le shop du bot');
  } catch {
    addBalance(message.guild!.id, message.author.id, item.price);
    await ch(message).send('Achat impossible : le rôle n’a pas pu être attribué. Ta mise a été remboursée.');
    return;
  }

  await ch(message).send(`✅ Tu as acheté **${role.name}** pour **${item.price}** pièces. Solde restant : **${getBalance(message.guild!.id, message.author.id)}**.`);
}