// Tuning constants for The Velvet Vault. One place for every number the
// game balances on, so a fix never has to hunt through the code.
export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// The room the thief crosses: x 40..1240, y 90..680. The top strip (y 0..90)
// holds the HUD overlay; the bottom strip (y 680..720) holds the hint bar.
export const ROOM = { x: 40, y: 90, w: 1200, h: 590 };
export const WALL = 14;

export const THIEF_SPEED = 175;
export const THIEF_RADIUS = 14;

export const GUARD_SPEED = 55;
export const GUARD_CHASE_SPEED = 95;
export const GUARD_RADIUS = 16;
export const GUARD_RANGE = 230;
export const GUARD_HALF_ANGLE = (35 * Math.PI) / 180;

export const CAM_RANGE = 210;
export const CAM_HALF_ANGLE = (28 * Math.PI) / 180;

export const ALARM_GUARD_RATE = 55; // alarm points per second in a guard cone
export const ALARM_CAM_RATE = 30; // alarm points per second in a camera cone
export const ALARM_DECAY = 9; // alarm points per second while unseen
export const ALARM_GRAB_BUMP = 15; // the pedestal is alarmed: grabbing adds this
export const ALARM_CHASE_AT = 60; // guards give chase once the alarm passes this

export const COINS_START = 3;
export const COIN_RANGE = 280; // how far a tossed coin can fly
export const COIN_LURE_RADIUS = 340; // a guard this close to the clink investigates
export const COIN_INVESTIGATE_WAIT = 3; // seconds a guard studies the coin

export const LOOT_GRAB_RADIUS = 48;
export const EXIT_RADIUS = 46;

// Original "velvet night" museum palette: dark slate floor, velvet-red
// carpet, gold trim, yellow guard cones, blue camera cones, cyan loot.
export const COLORS = {
  page: '#0b0f18',
  floor: '#1a2233',
  floorTile: 'rgba(255,255,255,0.03)',
  carpet: '#6b1f2a',
  carpetEdge: '#c9a227',
  wall: '#2b3a55',
  wallTrim: '#c9a227',
  caseGlass: 'rgba(150,200,255,0.16)',
  caseFrame: '#8fa8c8',
  planter: '#1e4d2e',
  planterLeaf: '#3a7d4e',
  statue: '#c9a227',
  statueBase: '#5a5346',
  pedestal: '#3a4358',
  pedestalEdge: '#c9a227',
  loot: '#6ff2ff',
  lootCore: '#ffffff',
  vent: '#20242e',
  ventActive: '#4ade80',
  coneGuard: 'rgba(255,200,60,0.26)',
  coneGuardHot: 'rgba(255,60,60,0.38)',
  coneCam: 'rgba(120,200,255,0.20)',
  thief: '#14141c',
  thiefShirt: '#f5f5f5',
  thiefTrim: '#c9a227',
  guard: '#2b4a7a',
  guardCap: '#1c3355',
  camera: '#9fb4d8',
  hudBg: 'rgba(10,14,24,0.92)',
  hudText: '#e8c96a',
  hudDim: '#9aa7bd',
  alarmLow: '#4ade80',
  alarmMid: '#fbbf24',
  alarmHigh: '#ef4444',
  overlay: 'rgba(8,10,16,0.72)',
};
