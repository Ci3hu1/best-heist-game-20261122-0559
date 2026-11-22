# Strategy — The Velvet Vault

## What the judge rewards (in order)

1. **A complete heist game in one frame.** The cover screenshot must show, at
   a glance: the room the thief is crossing, guards with vision cones,
   cameras, the loot target, and the alarm meter. Everything else is
   secondary to this frame.
2. **Fun and depth.** Several routes per room, tools at a cost, patrols and
   cones you have to read before you move.
3. **Feel and polish.** Tension as cones sweep, a caught moment that is fair,
   a getaway that pays off the planning.
4. **Look and originality.** Safe cover, danger and loot obvious at a glance,
   not a generic top-down tile set. Original names, art and sounds.
5. **Structure.** The source split into files with one clear job each, named
   for what they do.

## How this entry answers each one

**1. One readable frame.** The game is a single 1280×720 top-down room.
The HUD sits on top of the canvas: the alarm meter is always visible, the
loot and coin counters beside it. The room is laid out so the pedestal, the
thief, two guards and a camera are all in view at once. The cover
screenshot is staged at the tensest honest moment: Vesper crouched behind a
display case while a guard cone sweeps past a step away, the diamond glowing
on its pedestal, the alarm at a third. High contrast on purpose — dark slate
floor, velvet-red carpet runner to the pedestal, yellow guard cones, blue
camera cones, cyan loot — so the frame still reads when the judge's contact
sheet shrinks it.

**2. Depth.** Three routes to the pedestal (west cases, central carpet,
east corridor), each watched by a different patrol. The coin toss is the one
tool and it costs: 3 coins for the whole run, and the guard it draws away
leaves its post for only a few seconds. Guards patrol fixed loops you must
read; cameras sweep on their own rhythm. The pedestal grab itself adds 15
alarm, so the escape is a second, harder half of the run rather than a
victory lap.

**3. Fairness.** The alarm rises gradually (about 55/s in a guard cone,
30/s in a camera cone) and decays when you break line of sight, so getting
spotted is a warning, not an instant fail. The cone turns red and a "!"
appears over the guard while you are seen, so the danger is always legible.
Touching a guard is the only instant fail — and a guard is a big, slow,
clearly marked obstacle.

**4. Original look.** A night museum, not a tile set: velvet-red carpet,
gold trim, glass display cases, planters, statues, a faceted cyan diamond
on a pedestal. No borrowed names, art or music; every sound is a short
synthesized WebAudio blip (coin clink, grab chime, alarm tick, win/lose
stingers). The thief is "Vesper", the guards Mara, Ivo and Sable, the loot
the "Star of Meridian".

**5. Structure.** One job per file, named for it: `world.js` (room layout
and collision), `geometry.js` (cones and line of sight), `guards.js`
(patrols and vision), `cameras.js` (sweeps), `thief.js` (movement, coins,
loot, win/lose), `alarm.js` (the meter), `render.js` (all canvas drawing),
`hud.js` (the DOM meter and counters), `audio.js` (synthesized sounds),
`input.js` (keyboard and mouse), `scenes.js` (staged screenshot moments),
`config.js` (tuning constants), `rng.js` (seeded randomness), `main.js`
(the loop). Pure logic (geometry, alarm, patrol) has no DOM dependency, so
it is unit-tested in Node.

## What was tried and dropped

- A darkness/fog-of-war overlay: cut. It made the frame moody but hid the
  guards and loot at small size, which is exactly what criterion 1 punishes.
- A second floor / multi-room map: cut. One room, fully readable in a
  single frame, beats a bigger map the judge never sees whole.
- A "smoke bomb" second tool: cut. One tool with a real cost is a clearer
  decision than two tools that overlap.

## Expected outcome

A valid entry (gate: files, references, screenshots, dossier) that reads as
a complete, tense, original heist game in its screenshots. The judge sees
the game mostly through the contact sheet, so the entry is won or lost on
the four screenshots — they are staged at the game's four most legible
moments, all real renders of the game's own code.
