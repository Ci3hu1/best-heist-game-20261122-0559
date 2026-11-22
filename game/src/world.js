// The room: its layout, what blocks movement, and what blocks sight.
// Everything here is data — the layout the guards patrol and the thief
// crosses. Coordinates are canvas pixels (1280x720, room x 40..1240,
// y 90..680).
import { ROOM } from './config.js';

// Display cases: tall glass boxes. They block movement AND sight — the
// cover the whole game is built around.
export const CASES = [
  { x: 220, y: 200, w: 150, h: 70, label: 'porcelain' },
  { x: 220, y: 420, w: 150, h: 70, label: 'jade' },
  { x: 910, y: 200, w: 150, h: 70, label: 'gold' },
  { x: 910, y: 420, w: 150, h: 70, label: 'silver' },
  { x: 560, y: 420, w: 160, h: 70, label: 'masks' },
];

// Planters: low, round cover. They block movement but NOT sight — you can
// see over them, you just cannot walk through them.
export const PLANTERS = [
  { x: 450, y: 330, r: 26 },
  { x: 830, y: 330, r: 26 },
  { x: 640, y: 540, r: 26 },
];

// Statues on plinths: round cover that blocks movement AND sight.
export const STATUES = [
  { x: 450, y: 170, r: 22 },
  { x: 830, y: 170, r: 22 },
];

// The pedestal in the north-center holds the Star of Meridian.
export const PEDESTAL = { x: 640, y: 250, size: 56 };

// The door Vesper came in through (south wall, west). Drawn, but sealed
// behind them: the only way out is the vent.
export const DOOR = { x: 60, y: 680, w: 90 };

// The service vent (north wall, east). Glows green once the loot is taken.
export const VENT = { x: 1160, y: 104, r: 30 };

// The carpet runner: the visual route from the south door to the pedestal.
export const CARPET = { x: 600, y: 250, w: 80, h: 430 };

// Guard patrol loops: west cases, east cases, south corridor.
export const GUARD_DEFS = [
  {
    name: 'Mara',
    waypoints: [
      [180, 150],
      [180, 620],
      [380, 620],
      [380, 150],
    ],
  },
  {
    name: 'Ivo',
    waypoints: [
      [1100, 150],
      [1100, 620],
      [900, 620],
      [900, 150],
    ],
  },
  {
    name: 'Sable',
    waypoints: [
      [300, 600],
      [980, 600],
    ],
  },
];

// Wall cameras: a wall mount, a base facing, a sweep width and a period.
export const CAM_DEFS = [
  { x: 640, y: 96, base: Math.PI / 2, sweep: 0.9, period: 6, label: 'north' },
  { x: 1234, y: 380, base: Math.PI, sweep: 0.8, period: 7, label: 'east' },
];

// What blocks a line of sight: cases, statues and the pedestal.
export function sightBlockers() {
  const rects = CASES.map((c) => ({ x: c.x, y: c.y, w: c.w, h: c.h }));
  rects.push({
    x: PEDESTAL.x - PEDESTAL.size / 2,
    y: PEDESTAL.y - PEDESTAL.size / 2,
    w: PEDESTAL.size,
    h: PEDESTAL.size,
  });
  const circles = STATUES.map((s) => ({ x: s.x, y: s.y, r: s.r }));
  return { rects, circles };
}

// Does the circle at (x, y) with radius r overlap anything solid?
// Returns the first overlap found, or null.
export function circleHitsSolid(x, y, r) {
  const inner = {
    x: ROOM.x + r,
    y: ROOM.y + r,
    w: ROOM.w - 2 * r,
    h: ROOM.h - 2 * r,
  };
  if (x < inner.x || x > inner.x + inner.w || y < inner.y || y > inner.y + inner.h) {
    return { kind: 'wall' };
  }
  for (const c of CASES) {
    if (circleRect(x, y, r, c)) return { kind: 'case', ref: c };
  }
  const ped = {
    x: PEDESTAL.x - PEDESTAL.size / 2,
    y: PEDESTAL.y - PEDESTAL.size / 2,
    w: PEDESTAL.size,
    h: PEDESTAL.size,
  };
  if (circleRect(x, y, r, ped)) return { kind: 'pedestal' };
  for (const p of PLANTERS) {
    if (Math.hypot(x - p.x, y - p.y) < r + p.r) return { kind: 'planter', ref: p };
  }
  for (const s of STATUES) {
    if (Math.hypot(x - s.x, y - s.y) < r + s.r) return { kind: 'statue', ref: s };
  }
  return null;
}

function circleRect(x, y, r, rect) {
  const nx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  return Math.hypot(x - nx, y - ny) < r;
}

// Move a circle by (dx, dy), sliding along solids: try the full step, then
// each axis alone, so the thief slides along a case instead of sticking.
export function moveCircle(x, y, r, dx, dy) {
  if (!circleHitsSolid(x + dx, y + dy, r)) return { x: x + dx, y: y + dy };
  if (!circleHitsSolid(x + dx, y, r)) return { x: x + dx, y };
  if (!circleHitsSolid(x, y + dy, r)) return { x, y: y + dy };
  return { x, y };
}
