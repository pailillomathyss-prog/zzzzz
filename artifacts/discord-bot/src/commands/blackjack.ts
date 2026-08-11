import { Message } from 'discord.js';
import { ch } from '../utils/channel.js';
import { addBalance, getBalance, spendBalance } from '../utils/economy.js';
import { readConfig, writeConfig } from '../utils/config.js';

type Card = { rank: string; suit: string; value: number };
type Game = {
  channelId: string;
  bet: number;
  deck: Card[];
  player: Card[];
  dealer: Card[];
};

const games = new Map<string, Game>();
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS: Array<[string, number]> = [
  ['A', 11],
  ['2', 2],
  ['3', 3],
  ['4', 4],
  ['5', 5],
  ['6', 6],
  ['7', 7],
  ['8', 8],
  ['9', 9],
  ['10', 10],
  ['J', 10],
  ['Q', 10],
  ['K', 10],
];

// Recharger une main active si le processus a été redémarré.
for (const [key, savedGame] of Object.entries(readConfig().activeBlackjack)) {
  games.set(key, savedGame);
}

function gameKey(message: Message): string {
  return `${message.guild!.id}:${message.author.id}`;
}

function createDeck(): Card[] {
  return SUITS.flatMap((suit) =>
    RANKS.map(([rank, value]) => ({ rank, suit, value }))
  );
}

function shuffle(deck: Card[]): Card[] {
  for (let index = deck.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
}

function handValue(hand: Card[]): number {
  let total = hand.reduce((sum, card) => sum + card.value, 0);
  let aces = hand.filter((card) => card.rank === 'A').length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function cards(hand: Card[]): string {
  return hand.map((card) => `${card.rank}${card.suit}`).join(' ');
}

function keyLabel(message: Message): string {
  return `${message.guild!.id}:${message.author.id}`;
}

async function finish(
  message: Message,
  game: Game,
  result: 'win' | 'lose' | 'tie',
  details: string
): Promise<void> {
  games.delete(keyLabel(message));
  const config = readConfig();
  delete config.activeBlackjack[keyLabel(message)];
  writeConfig(config);
  const value = result === 'win' ? game.bet * 2 : result === 'tie' ? game.bet : 0;
  if (value > 0) addBalance(message.guild!.id, message.author.id, value);
  const payout = result === 'win' ? `Tu gagnes ${value} pièces.` : result === 'tie' ? `Mise remboursée : ${value} pièces.` : 'Ta mise est perdue.';
  await ch(message).send(
    `${details}\n${result === 'win' ? '🎉 Victoire !' : result === 'tie' ? '🤝 Égalité.' : '💀 Défaite.'} ${payout}\nSolde : **${getBalance(message.guild!.id, message.author.id)}** pièces.`
  );
}

export async function blackjackCommand(message: Message, args: string[]): Promise<void> {
  const key = gameKey(message);
  if (games.has(key)) {
    await ch(message).send('Tu as déjà une partie en cours. Utilise `+tirer` ou `+rester`.');
    return;
  }

  const bet = Number(args[0]);
  if (!Number.isInteger(bet) || bet < 50 || bet > 500) {
    await ch(message).send('La mise doit être un nombre entier entre **50 et 500**. Exemple : `+blackjack 100`');
    return;
  }

  if (!spendBalance(message.guild!.id, message.author.id, bet)) {
    await ch(message).send(`Solde insuffisant. Tu as **${getBalance(message.guild!.id, message.author.id)}** pièces.`);
    return;
  }

  const deck = shuffle(createDeck());
  const game: Game = {
    channelId: message.channelId,
    bet,
    deck,
    player: [deck.shift()!, deck.shift()!],
    dealer: [deck.shift()!, deck.shift()!],
  };
  games.set(key, game);
  const config = readConfig();
  config.activeBlackjack[key] = game;
  writeConfig(config);

  const playerTotal = handValue(game.player);
  if (playerTotal === 21) {
    await finish(
      message,
      game,
      'win',
      `🃏 Blackjack ! Tes cartes : **${cards(game.player)}** (21).\nLe croupier avait **${cards(game.dealer)}**.`
    );
    return;
  }

  await ch(message).send(
    `🎰 **Blackjack — mise : ${bet} pièces**\n` +
    `Tes cartes : **${cards(game.player)}** (${playerTotal})\n` +
    `Croupier : **${cards([game.dealer[0]])} ?**\n` +
    'Utilise `+tirer` pour une carte ou `+rester` pour rester.'
  );
}

export async function hitCommand(message: Message): Promise<void> {
  const game = games.get(gameKey(message));
  if (!game) {
    await ch(message).send('Tu n\'as pas de partie en cours. Lance-en une avec `+blackjack 100`.');
    return;
  }
  if (game.channelId !== message.channelId) {
    await ch(message).send('Continue ta partie dans le salon où tu l’as commencée.');
    return;
  }

  game.player.push(game.deck.shift()!);
  const config = readConfig();
  config.activeBlackjack[gameKey(message)] = game;
  writeConfig(config);
  const total = handValue(game.player);
  if (total > 21) {
    await finish(message, game, 'lose', `🃏 Tes cartes : **${cards(game.player)}** (${total}).`);
    return;
  }
  if (total === 21) {
    await standCommand(message);
    return;
  }
  await ch(message).send(`🃏 Tu tires **${cards(game.player.slice(-1))}**. Main : **${cards(game.player)}** (${total}). Utilise \`+tirer\` ou \`+rester\`.`);
}

export async function standCommand(message: Message): Promise<void> {
  const game = games.get(gameKey(message));
  if (!game) {
    await ch(message).send('Tu n\'as pas de partie en cours. Lance-en une avec `+blackjack 100`.');
    return;
  }
  if (game.channelId !== message.channelId) {
    await ch(message).send('Continue ta partie dans le salon où tu l’as commencée.');
    return;
  }

  while (handValue(game.dealer) < 17) {
    game.dealer.push(game.deck.shift()!);
  }

  const playerTotal = handValue(game.player);
  const dealerTotal = handValue(game.dealer);
  const result = dealerTotal > 21 || playerTotal > dealerTotal ? 'win' : playerTotal === dealerTotal ? 'tie' : 'lose';
  await finish(
    message,
    game,
    result,
    `🃏 Tes cartes : **${cards(game.player)}** (${playerTotal})\nCroupier : **${cards(game.dealer)}** (${dealerTotal}).`
  );
}