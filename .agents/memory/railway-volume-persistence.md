---
name: Railway volume persistence
description: Persistent bot data requires a Railway Volume mounted at the runtime data path.
---

The Discord bot stores configuration, economy, marriages, shop entries, panels, Smash or Pass settings, active blackjack games, and active giveaways in its data directory. On Railway, attach a Volume to the bot service and mount it at `/app/data`; the runtime selects the Railway volume mount path automatically.

**Why:** Railway deployments can recreate the container filesystem, so repository files and local JSON writes alone are not sufficient to preserve live data.

**How to apply:** Keep all mutable bot state in the configured data directory and never replace or reset the volume during redeploys. The bot migrates the bundled default config only when the mounted volume has no config yet.