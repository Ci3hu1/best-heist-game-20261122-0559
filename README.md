# best-heist-game-20261122-0559

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Ci3hu1/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Ci3hu1/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**The Velvet Vault** — a top-down stealth heist game that runs in a desktop
browser from static files, no network needed. You are Vesper, a thief crossing
a museum vault room at night: slip past three patrolling guards and two
sweeping security cameras, steal the Star of Meridian diamond from its
pedestal, and escape through the service vent before the alarm meter fills.

## Run it

```sh
node serve.js
# open http://localhost:8080/game/
```

No build step, no dependencies. `game/` is plain static files; open
`game/index.html` from any static server and play.

## Play

- **WASD / arrow keys** — move Vesper.
- **Click** — toss a coin (3 coins). The nearest guard walks over to
  investigate the clink, opening a gap in the patrol.
- **Grab the diamond** — walk onto the pedestal. The pedestal is alarmed:
  taking the Star adds 15 to the alarm, so the way out is the tense part.
- **Reach the vent** — with the diamond, get to the glowing vent in the
  top-right corner for a clean getaway.
- **Stay out of the cones** — a guard's yellow cone or a camera's blue cone
  raises the alarm while you are inside it with a clear line of sight.
  Break line of sight behind a display case or planter and the alarm
  slowly falls again. At 100 the heist is blown.
- **Do not touch a guard** — bumping into one ends the run on the spot.

## Files

- `main.ts` — the entry program (Node 22, stdlib only): copies `game/` and
  `screenshots/` to the output directory and writes `dossier.json`.
- `vendor/makefun-game.ts` — the kit's dossier library, copied unchanged.
- `game/` — the playable game: `index.html` plus one clear job per file
  under `game/src/`.
- `screenshots/` — four real renders of the game's own code in a browser.
- `tests/` — Node tests for the pure game logic and the entry program.
- `STRATEGY.md` — how the game is built to meet the judge's criteria.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cc7tcnw6&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
