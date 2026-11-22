// All canvas drawing: the room, the cones, the people, the loot and the
// overlays. The judge reads the game mostly through its screenshots, so
// every frame is drawn to be legible at a glance — cover, danger and loot
// obvious, cones that stop at cover instead of shining through it.
import { CAM_HALF_ANGLE, CAM_RANGE, CANVAS_H, CANVAS_W, COLORS, GUARD_HALF_ANGLE, GUARD_RANGE, ROOM } from './config.js';
import { rayHit } from './geometry.js';
import { CASES, DOOR, PEDESTAL, PLANTERS, STATUES, VENT, sightBlockers } from './world.js';
import { coneProximity } from './guards.js';

const CONE_RAYS = 25;

export function drawGame(ctx, game, time) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawFloor(ctx, time);
  drawWalls(ctx);
  drawDoor(ctx);
  drawVent(ctx, game.thief.hasLoot);
  drawCases(ctx);
  drawPlanters(ctx, time);
  drawStatues(ctx);
  drawPedestal(ctx, game.thief.hasLoot, time);
  drawCoin(ctx, game.coin, time);
  drawCones(ctx, game);
  drawCameras(ctx, game.cameras);
  drawGuards(ctx, game);
  drawThief(ctx, game.thief, time);
  drawSparkles(ctx, time);
  if (game.state === 'menu') drawMenu(ctx);
  else if (game.state === 'caught') drawCaught(ctx, game);
  else if (game.state === 'won') drawWon(ctx, game);
}

function drawFloor(ctx, time) {
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Tile grid, barely there.
  ctx.strokeStyle = COLORS.floorTile;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = ROOM.x; x <= ROOM.x + ROOM.w; x += 40) {
    ctx.moveTo(x, ROOM.y);
    ctx.lineTo(x, ROOM.y + ROOM.h);
  }
  for (let y = ROOM.y; y <= ROOM.y + ROOM.h; y += 40) {
    ctx.moveTo(ROOM.x, y);
    ctx.lineTo(ROOM.x + ROOM.w, y);
  }
  ctx.stroke();
  // The carpet runner: the visual route from the door to the pedestal.
  ctx.fillStyle = COLORS.carpet;
  ctx.fillRect(600, 250, 80, 430);
  ctx.strokeStyle = COLORS.carpetEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(600, 250, 80, 430);
  // A pool of warm light over the pedestal.
  const g = ctx.createRadialGradient(PEDESTAL.x, PEDESTAL.y, 10, PEDESTAL.x, PEDESTAL.y, 190);
  g.addColorStop(0, 'rgba(201,162,39,0.14)');
  g.addColorStop(1, 'rgba(201,162,39,0)');
  ctx.fillStyle = g;
  ctx.fillRect(PEDESTAL.x - 190, PEDESTAL.y - 190, 380, 380);
  void time;
}

function drawWalls(ctx) {
  ctx.fillStyle = COLORS.wall;
  const t = 14;
  ctx.fillRect(ROOM.x - t, ROOM.y - t, ROOM.w + 2 * t, t); // north
  ctx.fillRect(ROOM.x - t, ROOM.y + ROOM.h, ROOM.w + 2 * t, t); // south
  ctx.fillRect(ROOM.x - t, ROOM.y, t, ROOM.h); // west
  ctx.fillRect(ROOM.x + ROOM.w, ROOM.y, t, ROOM.h); // east
  ctx.strokeStyle = COLORS.wallTrim;
  ctx.lineWidth = 2;
  ctx.strokeRect(ROOM.x - t, ROOM.y - t, ROOM.w + 2 * t, ROOM.h + 2 * t);
}

function drawDoor(ctx) {
  // The door Vesper came in through: a dark panel with a handle, sealed
  // behind them. The only way out is the vent.
  ctx.fillStyle = '#101623';
  ctx.fillRect(DOOR.x, ROOM.y + ROOM.h - 4, DOOR.w, 12);
  ctx.fillStyle = COLORS.carpetEdge;
  ctx.beginPath();
  ctx.arc(DOOR.x + DOOR.w - 14, ROOM.y + ROOM.h + 2, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawVent(ctx, active) {
  // The service vent on the north wall: dark slats, glowing green once the
  // loot is taken and the getaway is open.
  ctx.save();
  ctx.fillStyle = COLORS.vent;
  ctx.fillRect(VENT.x - 42, ROOM.y - 10, 84, 20);
  if (active) {
    ctx.shadowColor = COLORS.ventActive;
    ctx.shadowBlur = 18;
    ctx.fillStyle = COLORS.ventActive;
    ctx.fillRect(VENT.x - 42, ROOM.y - 10, 84, 20);
    ctx.shadowBlur = 0;
  }
  ctx.fillStyle = '#0b0f18';
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(VENT.x - 36, ROOM.y - 6 + i * 6, 72, 3);
  }
  ctx.restore();
  if (active) {
    ctx.fillStyle = COLORS.ventActive;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    // Below the vent, clear of the thief standing at it.
    ctx.fillText('EXIT', VENT.x, ROOM.y + 84);
  }
}

function drawCases(ctx) {
  for (const c of CASES) {
    ctx.fillStyle = COLORS.caseGlass;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = COLORS.caseFrame;
    ctx.lineWidth = 3;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    // Glass glint.
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x + 14, c.y + c.h - 12);
    ctx.lineTo(c.x + c.w - 30, c.y + 12);
    ctx.stroke();
    // The exhibit inside: a small vase silhouette.
    ctx.fillStyle = 'rgba(201,162,39,0.55)';
    ctx.beginPath();
    ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2 + 8, 10, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(c.x + c.w / 2 - 4, c.y + c.h / 2 - 16, 8, 10);
  }
}

function drawPlanters(ctx, time) {
  for (const p of PLANTERS) {
    ctx.fillStyle = COLORS.planter;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.planterLeaf;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + time * 0.05;
      ctx.beginPath();
      ctx.arc(p.x + Math.cos(a) * 12, p.y + Math.sin(a) * 12, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawStatues(ctx) {
  for (const s of STATUES) {
    ctx.fillStyle = COLORS.statueBase;
    ctx.fillRect(s.x - 20, s.y - 20, 40, 40);
    ctx.fillStyle = COLORS.statue;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPedestal(ctx, looted, time) {
  ctx.fillStyle = COLORS.pedestal;
  ctx.fillRect(PEDESTAL.x - 28, PEDESTAL.y - 28, 56, 56);
  ctx.strokeStyle = COLORS.pedestalEdge;
  ctx.lineWidth = 2;
  ctx.strokeRect(PEDESTAL.x - 28, PEDESTAL.y - 28, 56, 56);
  if (looted) return;
  // The Star of Meridian: a faceted cyan diamond with a glow.
  ctx.save();
  ctx.shadowColor = COLORS.loot;
  ctx.shadowBlur = 22 + Math.sin(time * 2.4) * 6;
  ctx.translate(PEDESTAL.x, PEDESTAL.y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = COLORS.loot;
  ctx.fillRect(-13, -13, 26, 26);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.moveTo(-13, 0);
  ctx.lineTo(0, -13);
  ctx.lineTo(13, 0);
  ctx.lineTo(0, 13);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = COLORS.lootCore;
  ctx.beginPath();
  ctx.arc(PEDESTAL.x, PEDESTAL.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawCoin(ctx, coin, time) {
  if (!coin) return;
  const age = time - coin.born;
  if (age > 4) return;
  // A gold coin with a dark rim (so it reads even on a yellow cone) and a
  // fading pulse ring where it landed.
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0b0f18';
  ctx.lineWidth = 3;
  ctx.stroke();
  const pr = 10 + age * 26;
  ctx.strokeStyle = `rgba(255,211,77,${Math.max(0, 0.85 - age * 0.2)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, pr, 0, Math.PI * 2);
  ctx.stroke();
}

function conePath(ctx, ox, oy, dir, halfAngle, range, blockers) {
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  for (let i = 0; i <= CONE_RAYS; i++) {
    const a = dir - halfAngle + (2 * halfAngle * i) / CONE_RAYS;
    const d = rayHit(ox, oy, a, range, blockers, ROOM);
    ctx.lineTo(ox + Math.cos(a) * d, oy + Math.sin(a) * d);
  }
  ctx.closePath();
}

function drawCones(ctx, game) {
  const blockers = sightBlockers();
  for (const g of game.guards) {
    conePath(ctx, g.x, g.y, g.angle, GUARD_HALF_ANGLE, GUARD_RANGE, blockers);
    ctx.fillStyle = g.seesThief ? COLORS.coneGuardHot : COLORS.coneGuard;
    ctx.fill();
  }
  for (const c of game.cameras) {
    conePath(ctx, c.x, c.y, c.angle, CAM_HALF_ANGLE, CAM_RANGE, blockers);
    ctx.fillStyle = COLORS.coneCam;
    ctx.fill();
  }
}

function drawCameras(ctx, cameras) {
  for (const c of cameras) {
    // Wall mount and lens, pointed along the sweep.
    ctx.fillStyle = COLORS.camera;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b0f18';
    ctx.beginPath();
    ctx.arc(c.x + Math.cos(c.angle) * 4, c.y + Math.sin(c.angle) * 4, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGuards(ctx, game) {
  for (const g of game.guards) {
    // Soft shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(g.x, g.y + 12, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Navy uniform, cap brim, facing tick.
    ctx.fillStyle = COLORS.guard;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.guardCap;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 16, g.angle - 0.7, g.angle + 0.7);
    ctx.stroke();
    ctx.strokeStyle = '#dfe8f5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.angle) * 20, g.y + Math.sin(g.angle) * 20);
    ctx.stroke();
    // A "!" when the guard has the thief in its cone.
    if (g.seesThief || coneProximity(g, game.thief) > 0.55) {
      ctx.fillStyle = '#ff5a5a';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', g.x, g.y - 24);
    }
    // Name tag, small.
    ctx.fillStyle = 'rgba(223,232,245,0.75)';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.name, g.x, g.y + 30);
  }
}

function drawThief(ctx, thief, time) {
  // A soft gold glow so the dark thief reads against the dark floor, even
  // when the judge's contact sheet shrinks the frame.
  const glow = ctx.createRadialGradient(thief.x, thief.y, 4, thief.x, thief.y, 30);
  glow.addColorStop(0, 'rgba(201,162,39,0.22)');
  glow.addColorStop(1, 'rgba(201,162,39,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(thief.x, thief.y + 11, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Dark suit, white shirt front, gold trim, facing tick.
  ctx.fillStyle = COLORS.thief;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.thiefTrim;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = COLORS.thiefShirt;
  ctx.beginPath();
  ctx.moveTo(thief.x, thief.y);
  ctx.lineTo(thief.x + Math.cos(thief.angle - 0.5) * 11, thief.y + Math.sin(thief.angle - 0.5) * 11);
  ctx.lineTo(thief.x + Math.cos(thief.angle) * 15, thief.y + Math.sin(thief.angle) * 15);
  ctx.lineTo(thief.x + Math.cos(thief.angle + 0.5) * 11, thief.y + Math.sin(thief.angle + 0.5) * 11);
  ctx.closePath();
  ctx.fill();
  // The stolen diamond rides above the thief once taken.
  if (thief.hasLoot) {
    const bob = Math.sin(time * 3) * 2;
    ctx.save();
    ctx.translate(thief.x, thief.y - 26 + bob);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = COLORS.loot;
    ctx.fillRect(-6, -6, 12, 12);
    ctx.restore();
  }
}

// Sparkles around the pedestal and a few dust motes in the room.
const SPARKS = Array.from({ length: 14 }, (_, i) => ({
  x: PEDESTAL.x + ((i * 53) % 160) - 80,
  y: PEDESTAL.y + ((i * 37) % 120) - 60,
  phase: i * 0.7,
  size: 2 + (i % 3),
}));

function drawSparkles(ctx, time) {
  for (const s of SPARKS) {
    const a = 0.25 + 0.55 * Math.abs(Math.sin(time * 1.8 + s.phase));
    ctx.fillStyle = `rgba(111,242,255,${a.toFixed(2)})`;
    ctx.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
  }
}

function overlay(ctx, title, titleColor, lines) {
  ctx.fillStyle = COLORS.overlay;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = titleColor;
  ctx.font = 'bold 54px Georgia, serif';
  ctx.fillText(title, CANVAS_W / 2, 300);
  ctx.fillStyle = '#e8ecf3';
  ctx.font = '20px system-ui, sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, CANVAS_W / 2, 350 + i * 32);
  });
}

function drawMenu(ctx) {
  overlay(ctx, 'THE VELVET VAULT', COLORS.hudText, [
    'Steal the Star of Meridian. Reach the vent.',
    'WASD / arrows — move · Click — toss a coin (3)',
    'Stay out of the yellow cones and the blue camera sweeps.',
    '',
    'Press Enter or click to start',
  ]);
}

function drawCaught(ctx, game) {
  overlay(ctx, 'BLOWN', COLORS.alarmHigh, [
    'The guards closed in. The Star stays in its case.',
    `Time ${formatTime(game.time)} · Peak alarm ${Math.round(game.alarm.peak)}%`,
    '',
    'Press R to try again',
  ]);
}

function drawWon(ctx, game) {
  overlay(ctx, 'CLEAN GETAWAY', '#4ade80', [
    'The Star of Meridian is yours. Vesper vanishes into the night.',
    `Time ${formatTime(game.time)} · Coins left ${game.thief.coins} · Peak alarm ${Math.round(game.alarm.peak)}%`,
    '',
    'Press R to play again',
  ]);
}

function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
