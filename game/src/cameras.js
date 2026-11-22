// Security cameras: wall mounts that sweep a cone back and forth on their
// own rhythm. They raise the alarm more slowly than a guard, but they never
// blink and they never leave their post.
import { CAM_HALF_ANGLE, CAM_RANGE } from './config.js';
import { lineOfSight, pointInCone } from './geometry.js';
import { CAM_DEFS, sightBlockers } from './world.js';

export function createCameras() {
  return CAM_DEFS.map((def, i) => ({
    label: def.label,
    x: def.x,
    y: def.y,
    base: def.base,
    sweep: def.sweep,
    period: def.period,
    t: i * 1.7, // staggered so the two cameras are never in phase
    angle: def.base,
    seesThief: false,
    id: i,
  }));
}

export function updateCamera(cam, dt) {
  cam.t += dt;
  cam.angle = cam.base + cam.sweep * Math.sin((2 * Math.PI * cam.t) / cam.period);
}

export function cameraSees(cam, thief) {
  const blockers = sightBlockers();
  return (
    pointInCone(thief.x, thief.y, cam.x, cam.y, cam.angle, CAM_HALF_ANGLE, CAM_RANGE) &&
    lineOfSight(cam.x, cam.y, thief.x, thief.y, blockers)
  );
}
