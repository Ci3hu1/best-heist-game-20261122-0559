// The Velvet Vault — game loop and state machine.
// menu -> playing -> caught | won, with R / Enter / click to restart.
// ?scene=1..4 stages a frozen screenshot moment instead of playing.
import { CANVAS_H, CANVAS_W, COIN_LURE_RADIUS } from './config.js';
import { createAlarm, bumpAlarm, updateAlarm } from './alarm.js';
import { sfx, unlockAudio } from './audio.js';
import { cameraSees, createCameras, updateCamera } from './cameras.js';
import { createGuards, lureGuards, updateGuard } from './guards.js';
import { updateHUD } from './hud.js';
import { createInput } from './input.js';
import { drawGame } from './render.js';
import { mulberry32 } from './rng.js';
import { applyScene } from './scenes.js';
import { createThief, tossCoin, touchesGuard, tryExit, tryGrabLoot, updateThief } from './thief.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function newGame() {
  return {
    state: 'menu',
    time: 0,
    thief: createThief(),
    guards: createGuards(),
    cameras: createCameras(),
    alarm: createAlarm(),
    coin: null,
    frozen: false,
    rng: mulberry32(20261122),
    tickedAt: 0,
  };
}

let game = newGame();
const input = createInput(canvas);

// A staged screenshot moment: ?scene=1..4 renders exactly that frame.
const sceneParam = Number(new URLSearchParams(window.location.search).get('scene') ?? 0);
if (sceneParam >= 1 && sceneParam <= 4) {
  applyScene(game, sceneParam);
}

let last = performance.now();

function step(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (game.state === 'menu') {
    if (input.consumeEnter() || input.consumeClick()) {
      unlockAudio();
      game.state = 'playing';
    }
  } else if (game.state === 'playing' && !game.frozen) {
    game.time += dt;

    updateThief(game.thief, input, dt);

    const click = input.consumeClick();
    if (click) {
      const coin = tossCoin(game.thief, click.x, click.y);
      if (coin) {
        game.coin = { ...coin, born: game.time };
        lureGuards(game.guards, coin.x, coin.y, COIN_LURE_RADIUS);
        sfx.coin();
      }
    }

    for (const g of game.guards) updateGuard(g, dt, game.thief, game.alarm.level);
    for (const c of game.cameras) {
      updateCamera(c, dt);
      c.seesThief = cameraSees(c, game.thief);
    }

    const seenByGuard = game.guards.some((g) => g.seesThief);
    const seenByCamera = game.cameras.some((c) => c.seesThief);
    const blown = updateAlarm(game.alarm, dt, seenByGuard, seenByCamera);

    // A tick as the alarm crosses 50, 75 and 90.
    for (const mark of [50, 75, 90]) {
      if (game.alarm.level >= mark && game.tickedAt < mark) {
        game.tickedAt = mark;
        sfx.tick();
      }
    }
    if (game.alarm.level < 50) game.tickedAt = 0;

    if (tryGrabLoot(game.thief)) {
      bumpAlarm(game.alarm, 15);
      sfx.grab();
    }

    if (game.coin && game.time - game.coin.born > 4) game.coin = null;

    if (blown || touchesGuard(game.thief, game.guards)) {
      game.state = 'caught';
      sfx.lose();
    } else if (tryExit(game.thief)) {
      game.state = 'won';
      sfx.win();
    }
  } else if (game.state === 'caught' || game.state === 'won') {
    if (input.consumeRestart() || input.consumeEnter() || input.consumeClick()) {
      game = newGame();
      game.state = 'playing';
    }
  }

  updateHUD(game);
  drawGame(ctx, game, game.time);
  requestAnimationFrame(step);
}

requestAnimationFrame(step);
void CANVAS_W;
void CANVAS_H;
