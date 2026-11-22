// Guards: patrol loops, coin investigations, and the chase once the alarm
// climbs. A guard's job is to be readable — where it looks is where the
// danger is.
import {
  ALARM_CHASE_AT,
  COIN_INVESTIGATE_WAIT,
  GUARD_CHASE_SPEED,
  GUARD_HALF_ANGLE,
  GUARD_RANGE,
  GUARD_RADIUS,
  GUARD_SPEED,
} from './config.js';
import { angleDiff, angleTo, dist, lineOfSight, pointInCone } from './geometry.js';
import { GUARD_DEFS, moveCircle, sightBlockers } from './world.js';

export function createGuards() {
  return GUARD_DEFS.map((def, i) => ({
    name: def.name,
    waypoints: def.waypoints,
    x: def.waypoints[0][0],
    y: def.waypoints[0][1],
    angle: Math.PI / 2,
    waypointIndex: 1,
    mode: 'patrol', // patrol | investigate | chase
    target: null,
    waitTimer: 0,
    unseenTimer: 0,
    seesThief: false,
    id: i,
  }));
}

// Does this guard see the thief right now? Inside the cone, with a clear
// line of sight past the cases and statues.
export function guardSees(guard, thief, blockers) {
  return (
    pointInCone(thief.x, thief.y, guard.x, guard.y, guard.angle, GUARD_HALF_ANGLE, GUARD_RANGE) &&
    lineOfSight(guard.x, guard.y, thief.x, thief.y, blockers)
  );
}

function walkToward(guard, tx, ty, dt, speed) {
  const d = dist(guard.x, guard.y, tx, ty);
  if (d < 2) return true;
  const step = Math.min(d, speed * dt);
  const nx = guard.x + ((tx - guard.x) / d) * step;
  const ny = guard.y + ((ty - guard.y) / d) * step;
  const moved = moveCircle(guard.x, guard.y, GUARD_RADIUS, nx - guard.x, ny - guard.y);
  guard.x = moved.x;
  guard.y = moved.y;
  guard.angle = angleTo(guard.x, guard.y, tx, ty);
  return dist(guard.x, guard.y, tx, ty) < 4;
}

export function updateGuard(guard, dt, thief, alarmLevel) {
  const blockers = sightBlockers();
  guard.seesThief = guardSees(guard, thief, blockers);

  if (guard.mode === 'chase') {
    if (guard.seesThief) {
      guard.unseenTimer = 0;
      walkToward(guard, thief.x, thief.y, dt, GUARD_CHASE_SPEED);
    } else {
      guard.unseenTimer += dt;
      if (guard.unseenTimer > 2) {
        guard.mode = 'patrol';
        guard.unseenTimer = 0;
      }
    }
    return;
  }

  if (guard.mode === 'investigate' && guard.target) {
    const arrived = walkToward(guard, guard.target.x, guard.target.y, dt, GUARD_SPEED + 25);
    if (arrived) {
      guard.waitTimer += dt;
      // Look around while studying the coin.
      guard.angle += dt * 1.2;
      if (guard.waitTimer >= COIN_INVESTIGATE_WAIT) {
        guard.mode = 'patrol';
        guard.target = null;
        guard.waitTimer = 0;
        guard.waypointIndex = nearestWaypoint(guard);
      }
    }
    return;
  }

  // Patrol: walk the loop, facing where you walk.
  const wp = guard.waypoints[guard.waypointIndex];
  if (walkToward(guard, wp[0], wp[1], dt, GUARD_SPEED)) {
    guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
  }

  // A guard that spots the thief while the alarm is already high gives chase.
  if (guard.seesThief && alarmLevel >= ALARM_CHASE_AT) {
    guard.mode = 'chase';
    guard.unseenTimer = 0;
  }
}

function nearestWaypoint(guard) {
  let best = 0;
  let bestD = Infinity;
  guard.waypoints.forEach((wp, i) => {
    const d = dist(guard.x, guard.y, wp[0], wp[1]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

// A coin clinked at (x, y): the nearest guard in earshot walks over.
export function lureGuards(guards, x, y, lureRadius) {
  let best = null;
  let bestD = Infinity;
  for (const g of guards) {
    if (g.mode === 'chase') continue;
    const d = dist(g.x, g.y, x, y);
    if (d < lureRadius && d < bestD) {
      best = g;
      bestD = d;
    }
  }
  if (best) {
    best.mode = 'investigate';
    best.target = { x, y };
    best.waitTimer = 0;
  }
  return best;
}

// How close is the thief to this guard, in cone terms? 0 = unseen, 1 = dead
// center of the cone. Used for the "!" warning.
export function coneProximity(guard, thief) {
  const d = dist(guard.x, guard.y, thief.x, thief.y);
  if (d > GUARD_RANGE) return 0;
  const off = angleDiff(angleTo(guard.x, guard.y, thief.x, thief.y), guard.angle);
  if (off > GUARD_HALF_ANGLE) return 0;
  return 1 - off / GUARD_HALF_ANGLE;
}
