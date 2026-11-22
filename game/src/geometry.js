// Pure geometry: cones, line of sight and raycasts. No DOM, no game state —
// this is the module the Node tests import.
export function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

// Smallest absolute difference between two angles, in [0, PI].
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return Math.abs(d);
}

// Is (px, py) inside the vision cone from (ox, oy), facing dir, with the
// given half-angle and range?
export function pointInCone(px, py, ox, oy, dir, halfAngle, range) {
  const d = dist(px, py, ox, oy);
  if (d > range) return false;
  if (d < 1) return true;
  return angleDiff(angleTo(ox, oy, px, py), dir) <= halfAngle;
}

// Does the segment (x1,y1)-(x2,y2) touch the axis-aligned rect?
export function segmentIntersectsRect(x1, y1, x2, y2, r) {
  // Either endpoint inside the rect.
  if (x1 >= r.x && x1 <= r.x + r.w && y1 >= r.y && y1 <= r.y + r.h) return true;
  if (x2 >= r.x && x2 <= r.x + r.w && y2 >= r.y && y2 <= r.y + r.h) return true;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Slab test: the segment's parameter interval inside the rect.
  let tmin = 0;
  let tmax = 1;
  for (const [p, q] of [
    [-dx, x1 - r.x],
    [dx, r.x + r.w - x1],
    [-dy, y1 - r.y],
    [dy, r.y + r.h - y1],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) {
        if (t > tmax) return false;
        if (t > tmin) tmin = t;
      } else {
        if (t < tmin) return false;
        if (t < tmax) tmax = t;
      }
    }
  }
  return true;
}

// Does the segment (x1,y1)-(x2,y2) touch the circle (cx, cy, r)?
export function segmentIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = 0;
  if (lenSq > 0) {
    t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
  }
  const nx = x1 + t * dx;
  const ny = y1 + t * dy;
  return dist(nx, ny, cx, cy) <= r;
}

// Clear line of sight from (ax, ay) to (bx, by)? Blockers are
// { rects: [{x,y,w,h}], circles: [{x,y,r}] } — display cases, statues and
// the pedestal block sight; planters are low and do not.
export function lineOfSight(ax, ay, bx, by, blockers) {
  for (const r of blockers.rects) {
    if (segmentIntersectsRect(ax, ay, bx, by, r)) return false;
  }
  for (const c of blockers.circles) {
    if (segmentIntersectsCircle(ax, ay, bx, by, c.x, c.y, c.r)) return false;
  }
  return true;
}

// Distance along a ray from (ox, oy) in direction `angle` to the nearest
// blocker, capped at maxDist. Used to draw vision cones that stop at cover
// instead of shining through it.
export function rayHit(ox, oy, angle, maxDist, blockers, room) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = maxDist;
  // The room's own walls bound the ray.
  const roomHit = rayRectExit(ox, oy, dx, dy, room);
  if (roomHit !== null && roomHit < best) best = roomHit;
  for (const r of blockers.rects) {
    const hit = rayRect(ox, oy, dx, dy, r);
    if (hit !== null && hit < best) best = hit;
  }
  for (const c of blockers.circles) {
    const hit = rayCircle(ox, oy, dx, dy, c);
    if (hit !== null && hit < best) best = hit;
  }
  return best;
}

// Distance to the exit point of the ray from inside the rect (null if the
// ray never leaves, which cannot happen from inside).
function rayRectExit(ox, oy, dx, dy, r) {
  let t = Infinity;
  if (dx > 0) t = Math.min(t, (r.x + r.w - ox) / dx);
  else if (dx < 0) t = Math.min(t, (r.x - ox) / dx);
  if (dy > 0) t = Math.min(t, (r.y + r.h - oy) / dy);
  else if (dy < 0) t = Math.min(t, (r.y - oy) / dy);
  return t === Infinity ? null : t;
}

// Distance to the entry point of the ray into the rect (null if it misses).
function rayRect(ox, oy, dx, dy, r) {
  let tmin = -Infinity;
  let tmax = Infinity;
  for (const [p, q] of [
    [-dx, ox - r.x],
    [dx, r.x + r.w - ox],
    [-dy, oy - r.y],
    [dy, r.y + r.h - oy],
  ]) {
    if (p === 0) {
      if (q < 0) return null;
    } else {
      const t = q / p;
      if (p < 0) {
        if (t > tmax) return null;
        if (t > tmin) tmin = t;
      } else {
        if (t < tmin) return null;
        if (t < tmax) tmax = t;
      }
    }
  }
  if (tmax < 0) return null;
  return tmin >= 0 ? tmin : 0;
}

// Distance to the entry point of the ray into the circle (null if it misses).
function rayCircle(ox, oy, dx, dy, c) {
  const cx = c.x - ox;
  const cy = c.y - oy;
  const b = cx * dx + cy * dy;
  const cc = cx * cx + cy * cy - c.r * c.r;
  const disc = b * b - cc;
  if (disc < 0) return null;
  const t = b - Math.sqrt(disc);
  return t >= 0 ? t : null;
}
