// The DOM HUD: the alarm meter, loot and coin counters, timer and objective.
// It overlays the canvas, so it is part of every screenshot — the alarm
// meter must always be visible, and it is.
import { COLORS } from './config.js';

export function updateHUD(game) {
  const alarm = game.alarm.level;
  const fill = document.getElementById('alarm-fill');
  const num = document.getElementById('alarm-num');
  fill.style.width = `${alarm.toFixed(1)}%`;
  fill.style.background =
    alarm < 40 ? COLORS.alarmLow : alarm < 70 ? COLORS.alarmMid : COLORS.alarmHigh;
  num.textContent = `${Math.round(alarm)}%`;

  const loot = document.getElementById('loot');
  loot.textContent = game.thief.hasLoot ? 'LOOT ★ STOLEN' : 'LOOT ◇';
  loot.style.color = game.thief.hasLoot ? COLORS.loot : COLORS.hudText;

  const coins = document.getElementById('coins');
  coins.textContent = `COINS ${'●'.repeat(game.thief.coins)}${'○'.repeat(3 - game.thief.coins)}`;

  const time = document.getElementById('time');
  const m = Math.floor(game.time / 60);
  const s = Math.floor(game.time % 60);
  time.textContent = `${m}:${String(s).padStart(2, '0')}`;

  const objective = document.getElementById('objective');
  objective.textContent = game.thief.hasLoot
    ? 'Loot secured — reach the glowing vent, top right!'
    : 'Steal the Star of Meridian, then reach the vent.';
}
