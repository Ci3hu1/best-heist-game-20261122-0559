// Tests for The Velvet Vault. Run: node --test tests/
// Pure game logic (geometry, alarm, guards, thief, world) runs in Node with
// no DOM; the entry program (main.ts) is tested end to end.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lineOfSight, pointInCone, rayHit, segmentIntersectsRect } from '../game/src/geometry.js';
import { bumpAlarm, createAlarm, updateAlarm } from '../game/src/alarm.js';
import { createGuards, guardSees, updateGuard } from '../game/src/guards.js';
import { createThief, tossCoin, touchesGuard, tryExit, tryGrabLoot } from '../game/src/thief.js';
import { PEDESTAL, VENT, circleHitsSolid, moveCircle } from '../game/src/world.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('geometry: pointInCone admits ahead, refuses behind and beyond range', () => {
  // Facing east (0) from (0,0): (100,0) is dead ahead, (0,100) is behind.
  assert.equal(pointInCone(100, 0, 0, 0, 0, 0.6, 230), true);
  assert.equal(pointInCone(0, 100, 0, 0, 0, 0.6, 230), false);
  assert.equal(pointInCone(300, 0, 0, 0, 0, 0.6, 230), false);
  // Just inside the cone edge at 30 degrees.
  assert.equal(pointInCone(100, 57, 0, 0, 0, 0.6, 230), true);
  // Just outside the cone edge at 40 degrees.
  assert.equal(pointInCone(100, 84, 0, 0, 0, 0.6, 230), false);
});

test('geometry: segmentIntersectsRect', () => {
  const rect = { x: 100, y: 100, w: 50, h: 50 };
  assert.equal(segmentIntersectsRect(0, 125, 200, 125, rect), true);
  assert.equal(segmentIntersectsRect(0, 0, 50, 50, rect), false);
  assert.equal(segmentIntersectsRect(110, 110, 120, 120, rect), true);
});

test('geometry: lineOfSight is blocked by a case, clear across open floor', () => {
  const blockers = { rects: [{ x: 220, y: 200, w: 150, h: 70 }], circles: [] };
  // A sight line across the west case is blocked.
  assert.equal(lineOfSight(200, 235, 400, 235, blockers), false);
  // A sight line in open floor is clear.
  assert.equal(lineOfSight(100, 500, 500, 500, blockers), true);
});

test('geometry: rayHit stops at a case and at the room wall', () => {
  const blockers = { rects: [{ x: 220, y: 200, w: 150, h: 70 }], circles: [] };
  const room = { x: 40, y: 90, w: 1200, h: 590 };
  // East from (100,235): the case starts at x=220, so the ray stops at 120.
  assert.ok(Math.abs(rayHit(100, 235, 0, 500, blockers, room) - 120) < 1);
  // North from (640,600): no case in the way, the ray stops at the room wall.
  assert.ok(Math.abs(rayHit(640, 600, -Math.PI / 2, 900, blockers, room) - 510) < 1);
});

test('alarm: rises when seen, decays when hidden, caps at 100', () => {
  const alarm = createAlarm();
  updateAlarm(alarm, 1, true, false);
  assert.ok(Math.abs(alarm.level - 55) < 0.01);
  updateAlarm(alarm, 1, false, false);
  assert.ok(Math.abs(alarm.level - 46) < 0.01);
  bumpAlarm(alarm, 200);
  assert.equal(alarm.level, 100);
  assert.equal(alarm.peak, 100);
  const blown = updateAlarm(alarm, 0.1, true, false);
  assert.equal(blown, true);
});

test('guards: patrol walks the loop and sees the thief in its cone', () => {
  const guards = createGuards();
  const mara = guards[0];
  const startX = mara.x;
  const startY = mara.y;
  const thief = { x: 1000, y: 1000 };
  updateGuard(mara, 1, thief, 0);
  // Mara walks from her first waypoint toward her second: y grows.
  assert.ok(mara.y > startY);
  assert.equal(mara.x, startX);
  // Put the thief dead ahead of Mara, in the open, and she sees them.
  const seen = guardSees({ ...mara, angle: 0 }, { x: mara.x + 100, y: mara.y }, {
    rects: [],
    circles: [],
  });
  assert.equal(seen, true);
});

test('thief: coin toss spends a coin and lands in range; grab and exit', () => {
  const thief = createThief();
  assert.equal(thief.coins, 3);
  const coin = tossCoin(thief, thief.x + 500, thief.y);
  assert.ok(coin);
  assert.equal(thief.coins, 2);
  assert.ok(Math.hypot(coin.x - thief.x, coin.y - thief.y) <= 280.5);
  // Too far from the pedestal: no grab, no exit.
  assert.equal(tryGrabLoot(thief), false);
  assert.equal(tryExit(thief), false);
  // On the pedestal: grab works; at the vent with loot: exit works.
  thief.x = PEDESTAL.x;
  thief.y = PEDESTAL.y;
  assert.equal(tryGrabLoot(thief), true);
  assert.equal(tryExit(thief), false);
  thief.x = VENT.x;
  thief.y = VENT.y;
  assert.equal(tryExit(thief), true);
});

test('thief: touching a guard ends the run', () => {
  const thief = createThief();
  const guards = [{ x: thief.x + 10, y: thief.y }];
  assert.equal(touchesGuard(thief, guards), true);
  const far = [{ x: thief.x + 500, y: thief.y }];
  assert.equal(touchesGuard(thief, far), false);
});

test('world: a case is solid, and movement slides along it', () => {
  // Inside the west-north case: solid.
  assert.ok(circleHitsSolid(250, 235, 14));
  // Open floor: not solid.
  assert.equal(circleHitsSolid(400, 560, 14), null);
  // Walking east into the case from its west side stops at its face.
  const moved = moveCircle(200, 235, 14, 100, 0);
  assert.ok(moved.x < 220);
  assert.equal(moved.y, 235);
});

// --- entry program -------------------------------------------------------

function imageSize(buf) {
  // PNG: width/height at bytes 16..24. JPEG: scan for a SOF marker.
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
      }
      const len = buf.readUInt16BE(i + 2);
      i += 2 + len;
    }
  }
  return null;
}

test('main.ts: writes game/, screenshots/ and dossier.json, deterministically', () => {
  const outA = join(ROOT, '.test-out-a');
  const outB = join(ROOT, '.test-out-b');
  for (const out of [outA, outB]) {
    rmSync(out, { recursive: true, force: true });
    const r = spawnSync('node', ['main.ts'], {
      cwd: ROOT,
      env: { ...process.env, MAKEFUN_OUTPUT_DIR: out },
      encoding: 'utf8',
    });
    assert.equal(r.status, 0, `main.ts failed: ${r.stderr}`);
  }
  // Both runs write the same bytes.
  const filesA = readdirSync(join(outA, 'game')).sort();
  const filesB = readdirSync(join(outB, 'game')).sort();
  assert.deepEqual(filesA, filesB);
  assert.equal(
    readFileSync(join(outA, 'dossier.json')).toString(),
    readFileSync(join(outB, 'dossier.json')).toString(),
    'dossier.json differs between runs',
  );
  // The game entrypoint is there.
  assert.ok(existsSync(join(outA, 'game', 'index.html')));
  assert.ok(statSync(join(outA, 'game', 'index.html')).size <= 1024 * 1024);
  // The dossier parses and names the game.
  const dossier = JSON.parse(readFileSync(join(outA, 'dossier.json'), 'utf8'));
  assert.equal(dossier.schema, 'makefun/dossier/v1');
  // Screenshots: 3 or 4, each a real image within the gate limits.
  const shots = readdirSync(join(outA, 'screenshots')).filter((f) => !f.startsWith('.')).sort();
  assert.ok(shots.length >= 3 && shots.length <= 4, `expected 3-4 screenshots, got ${shots.length}`);
  for (const shot of shots) {
    const buf = readFileSync(join(outA, 'screenshots', shot));
    assert.ok(buf.length <= 256 * 1024, `${shot} is ${buf.length} bytes, over the 256 KiB cap`);
    const size = imageSize(buf);
    assert.ok(size, `${shot} is not a readable PNG or JPEG`);
    assert.ok(Math.max(size.w, size.h) <= 1280, `${shot} long side ${Math.max(size.w, size.h)} > 1280`);
    assert.ok(Math.min(size.w, size.h) >= 480, `${shot} short side ${Math.min(size.w, size.h)} < 480`);
  }
  rmSync(outA, { recursive: true, force: true });
  rmSync(outB, { recursive: true, force: true });
});
