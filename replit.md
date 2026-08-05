# Bot Discord

Bot Discord avec préfixe `+`, modération, anti-lien, panel de rôles et rang automatique par statut.

## Run & Operate

- `pnpm --filter @workspace/discord-bot run dev` — démarrer le bot (workflow : **Discord Bot**)
- `pnpm --filter @workspace/discord-bot run typecheck` — vérification TypeScript

## Secrets requis

- `DISCORD_TOKEN` — token du bot (Discord Developer Portal → Application → Bot → Token)

## Commandes du bot (préfixe `+`)

| Commande | Description |
|---|---|
| `+ban @user [raison]` | Bannir un membre |
| `+unban <id>` | Débannir par ID |
| `+mute @user [minutes] [raison]` | Rendre muet (timeout, défaut 10 min) |
| `+unmute @user` | Retirer le mute |
| `+lock` | Verrouiller le salon (personne ne peut écrire) |
| `+unlock` | Déverrouiller le salon |
| `+rolepanel @role1 @role2 ...` | Créer un panel de rôles avec boutons |
| `+setrank @role` | Définir le rôle donné quand `/vivant` est dans le statut |
| `+help` | Liste des commandes |

## Fonctionnalités

- **Anti-lien** : supprime automatiquement tous les liens (URLs, invitations Discord, apps...). Les membres avec `Gérer les messages` sont exemptés.
- **Panel de rôles** : boutons cliquables pour obtenir/retirer des rôles. Configurable avec `+rolepanel`.
- **Rang auto** : détecte `/vivant` dans le statut personnalisé Discord. Configurer le rôle avec `+setrank @role`.

## Stack

- Node.js 24, TypeScript 5.9, discord.js v14
- Persistance config : `artifacts/discord-bot/data/config.json`

## Intents Discord requis (Portal)

Activer dans Discord Developer Portal → Application → Bot → Privileged Gateway Intents :
- **Server Members Intent** ✅
- **Message Content Intent** ✅
- **Presence Intent** ✅

## User preferences

_Populate as you build._
