// Vesper, the thief: movement with collision, the coin toss, the grab and
// the getaway. The only instant fail is touching a guard — everything else
// is the alarm meter.
import {
  COINS_START,
  COIN_RANGE,
  EXIT_RADIUS,
  GUARD_RADIUS,
  LOOT_GRAB_RADIUS,
  THIEF_RADIUS,
  THIEF_SPEED,
} from './config.js';
import { angleTo, dist } from './geometry.js';
import { DOOR, PEDESTAL, VENT, moveCircle } from './world.js';

export function createThief() {
  return {
    x: DOOR.x + DOOR.w / 2,
    y: 640,
    angle: -Math.PI / 2, // facing north, up the room
    coins: COINS_START,
    hasLoot: false,
    coinCooldown: 0,
    moving: false,
  };
}

export function updateThief(thief, input, dt) {
  let dx = 0;
  let dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  thief.moving = dx !== 0 || dy !== 0;
  if (!thief.moving) return;
  const len = Math.hypot(dx, dy);
  const step = THIEF_SPEED * dt;
  const moved = moveCircle(thief.x, thief.y, THIEF_RADIUS, (dx / len) * step, (dy / len) * step);
  if (moved.x !== thief.x || moved.y !== thief.y) {
    thief.angle = angleTo(thief.x, thief.y, moved.x, moved.y);
  }
  thief.x = moved.x;
  thief.y = moved.y;
  if (thief.coinCooldown > 0) thief.coinCooldown -= dt;
}

// Toss a coin toward (x, y), at most COIN_RANGE away. Returns the coin's
// landing spot, or null when there is no coin left or the toss is on
// cooldown. A coin costs one of three — the run's only tool, and it is spent.
export function tossCoin(thief, x, y) {
  if (thief.coins <= 0 || thief.coinCooldown > 0) return null;
  const d = dist(thief.x, thief.y, x, y);
  if (d < 10) return null;
  const reach = Math.min(d, COIN_RANGE);
  const lx = thief.x + ((x - thief.x) / d) * reach;
  const ly = thief.y + ((y - thief.y) / d) * reach;
  thief.coins -= 1;
  thief.coinCooldown = 0.5;
  return { x: lx, y: ly, age: 0 };
}

// Walk onto the pedestal: the Star of Meridian is yours.
export function tryGrabLoot(thief) {
  if (thief.hasLoot) return false;
  if (dist(thief.x, thief.y, PEDESTAL.x, PEDESTAL.y) <= LOOT_GRAB_RADIUS) {
    thief.hasLoot = true;
    return true;
  }
  return false;
}

// With the loot, reach the vent: the clean getaway.
export function tryExit(thief) {
  return thief.hasLoot && dist(thief.x, thief.y, VENT.x, VENT.y) <= EXIT_RADIUS;
}

// Bumping into a guard ends the run on the spot.
export function touchesGuard(thief, guards) {
  return guards.some((g) => dist(thief.x, thief.y, g.x, g.y) < THIEF_RADIUS + GUARD_RADIUS - 2);
}
