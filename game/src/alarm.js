// The alarm meter: 0 to 100. It rises while the thief is seen — faster in
// a guard's cone than in a camera's — and falls again when the thief breaks
// line of sight. At 100 the heist is blown. Getting spotted is a warning,
// not an instant fail: the meter is the game's fairness.
import { ALARM_CAM_RATE, ALARM_DECAY, ALARM_GUARD_RATE } from './config.js';

export function createAlarm() {
  return { level: 0, peak: 0 };
}

export function updateAlarm(alarm, dt, seenByGuard, seenByCamera) {
  let rate = 0;
  if (seenByGuard) rate += ALARM_GUARD_RATE;
  if (seenByCamera) rate += ALARM_CAM_RATE;
  if (rate > 0) {
    alarm.level += rate * dt;
  } else {
    alarm.level -= ALARM_DECAY * dt;
  }
  alarm.level = Math.max(0, Math.min(100, alarm.level));
  alarm.peak = Math.max(alarm.peak, alarm.level);
  return alarm.level >= 100;
}

export function bumpAlarm(alarm, amount) {
  alarm.level = Math.max(0, Math.min(100, alarm.level + amount));
  alarm.peak = Math.max(alarm.peak, alarm.level);
}
