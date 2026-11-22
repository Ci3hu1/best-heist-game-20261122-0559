// Staged screenshot moments. Each scene sets the whole game state — thief,
// guards, cameras, alarm, loot, coins, clock — then freezes the simulation,
// so the browser renders exactly that frame. The screenshots are real
// renders of the game's own code, taken at the game's four most legible
// moments. Without ?scene= the game plays normally.
import { angleTo } from './geometry.js';

function face(g, x, y) {
  g.angle = angleTo(g.x, g.y, x, y);
}

export function applyScene(game, n) {
  const { thief, guards, cameras, alarm } = game;
  const [mara, ivo, sable] = guards;
  const [camNorth, camEast] = cameras;
  game.state = 'playing';
  game.frozen = true;
  game.coin = null;

  if (n === 1) {
    // COVER — the tensest honest moment. Vesper crouched behind a display
    // case while Mara's cone sweeps a step past; the diamond glows on its
    // pedestal; the alarm sits at a third.
    thief.x = 520;
    thief.y = 430;
    thief.angle = -0.9;
    thief.coins = 3;
    thief.hasLoot = false;
    mara.x = 380;
    mara.y = 300;
    mara.angle = 0;
    ivo.x = 1000;
    ivo.y = 300;
    ivo.angle = Math.PI;
    sable.x = 700;
    sable.y = 600;
    sable.angle = Math.PI;
    camNorth.angle = 1.9;
    camEast.angle = 3.5;
    alarm.level = 34;
    alarm.peak = 34;
    game.time = 42;
  } else if (n === 2) {
    // APPROACH — Vesper at the pedestal's edge, a coin tossed to pull Ivo
    // off his post, Mara's cone crossing the carpet behind.
    thief.x = 610;
    thief.y = 320;
    thief.angle = -Math.PI / 2;
    thief.coins = 2;
    thief.hasLoot = false;
    game.time = 68;
    // The coin was tossed a moment ago, so its pulse ring is still fresh.
    game.coin = { x: 780, y: 390, born: game.time - 0.6 };
    ivo.x = 900;
    ivo.y = 420;
    face(ivo, 780, 390);
    ivo.mode = 'investigate';
    mara.x = 300;
    mara.y = 170;
    mara.angle = Math.PI / 2;
    sable.x = 500;
    sable.y = 600;
    sable.angle = 0;
    camNorth.angle = 1.2;
    camEast.angle = 3.3;
    alarm.level = 52;
    alarm.peak = 52;
  } else if (n === 3) {
    // LOOT — the grab. The diamond is in Vesper's hands, the alarm spikes,
    // both guards' cones are on the thief.
    thief.x = 640;
    thief.y = 300;
    thief.angle = -Math.PI / 2;
    thief.coins = 2;
    thief.hasLoot = true;
    mara.x = 420;
    mara.y = 320;
    face(mara, thief.x, thief.y);
    mara.seesThief = true;
    ivo.x = 860;
    ivo.y = 310;
    face(ivo, thief.x, thief.y);
    ivo.seesThief = true;
    sable.x = 700;
    sable.y = 550;
    sable.angle = -Math.PI / 2;
    camNorth.angle = Math.PI / 2;
    camEast.angle = 3.6;
    alarm.level = 78;
    alarm.peak = 78;
    game.time = 95;
  } else if (n === 4) {
    // GETAWAY — Vesper at the glowing vent, diamond in hand, alarm high,
    // Sable's cone sweeping away. One step from a clean getaway.
    thief.x = 1150;
    thief.y = 140;
    thief.angle = -0.5;
    thief.coins = 1;
    thief.hasLoot = true;
    mara.x = 500;
    mara.y = 200;
    mara.angle = 0.6;
    ivo.x = 1000;
    ivo.y = 500;
    ivo.angle = Math.PI;
    sable.x = 800;
    sable.y = 620;
    sable.angle = Math.PI / 2;
    camNorth.angle = 0.9;
    camEast.angle = 2.8;
    alarm.level = 86;
    alarm.peak = 86;
    game.time = 118;
  }
}
